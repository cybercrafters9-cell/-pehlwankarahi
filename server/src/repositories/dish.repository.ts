import { RowDataPacket } from "mysql2/promise";
import { query, queryOne, execute, withTransaction } from "../db/pool";
import { MenuItem } from "../types";
import { mediaRepository } from "./media.repository";

interface DishRow extends RowDataPacket {
  id: number;
  category_id: number;
  category_slug: string;
  category_name?: string;
  name: string;
  tag: string;
  price: number;
  rating: string;
  description: string;
  image_media_id: number | null;
  image_url: string | null;
  is_available: number;
  sort_order: number;
}

export interface CreateDishInput {
  name: string;
  category: string; // slug or ID string/number
  tag?: string;
  price: number;
  rating?: string;
  desc?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  imageMediaId?: number | null;
  isAvailable?: boolean;
  sortOrder?: number;
}

export interface UpdateDishInput {
  name?: string;
  category?: string;
  tag?: string;
  price?: number;
  rating?: string;
  desc?: string;
  description?: string;
  image?: string;
  imageUrl?: string;
  imageMediaId?: number | null;
  isAvailable?: boolean;
  sortOrder?: number;
}

function resolveImageUrl(imageMediaId: number | null, imageUrl: string | null): string {
  if (imageMediaId) {
    return `/api/media/${imageMediaId}`;
  }
  return imageUrl || "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80";
}

function mapRow(row: DishRow): MenuItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category_slug,
    categoryName: row.category_name,
    tag: row.tag,
    price: row.price,
    rating: row.rating,
    desc: row.description,
    image: resolveImageUrl(row.image_media_id, row.image_url),
    imageUrl: row.image_url,
    imageMediaId: row.image_media_id,
    isAvailable: Boolean(row.is_available),
  };
}

export const dishRepository = {
  async getAll(includeUnavailable = false): Promise<MenuItem[]> {
    const whereClause = includeUnavailable ? "" : "WHERE d.is_available = 1";
    const rows = await query<DishRow>(`
      SELECT d.*, c.slug AS category_slug, c.name AS category_name
      FROM dishes d
      JOIN categories c ON c.id = d.category_id
      ${whereClause}
      ORDER BY d.sort_order ASC, d.id ASC
    `);
    return rows.map(mapRow);
  },

  async getById(id: number): Promise<MenuItem | null> {
    const row = await queryOne<DishRow>(
      `
      SELECT d.*, c.slug AS category_slug, c.name AS category_name
      FROM dishes d
      JOIN categories c ON c.id = d.category_id
      WHERE d.id = ?
    `,
      [id]
    );
    return row ? mapRow(row) : null;
  },

  async getRawById(id: number): Promise<DishRow | null> {
    return queryOne<DishRow>(
      `
      SELECT d.*, c.slug AS category_slug
      FROM dishes d
      JOIN categories c ON c.id = d.category_id
      WHERE d.id = ?
    `,
      [id]
    );
  },

  async resolveCategoryId(categoryInput: string | number): Promise<number> {
    if (typeof categoryInput === "number" || /^\d+$/.test(String(categoryInput))) {
      const id = Number(categoryInput);
      const row = await queryOne<RowDataPacket>(
        "SELECT id FROM categories WHERE id = ?",
        [id]
      );
      if (row) return row.id as number;
    }

    const slug = String(categoryInput).toLowerCase().trim();
    const row = await queryOne<RowDataPacket>(
      "SELECT id FROM categories WHERE slug = ?",
      [slug]
    );
    if (row) return row.id as number;

    const error = new Error(`Category "${categoryInput}" does not exist`);
    (error as unknown as { statusCode: number; status: number }).statusCode = 400;
    (error as unknown as { statusCode: number; status: number }).status = 400;
    throw error;
  },

  async create(data: CreateDishInput): Promise<MenuItem> {
    const categoryId = await this.resolveCategoryId(data.category);
    const tag = data.tag ?? "";
    const rating = data.rating ?? "4.9";
    const description = data.description ?? data.desc ?? "";
    const isAvailable = data.isAvailable !== false ? 1 : 0;
    const sortOrder = data.sortOrder ?? 0;
    const imageMediaId = data.imageMediaId ?? null;
    if (imageMediaId !== null) {
      const media = await mediaRepository.getById(imageMediaId);
      if (!media) {
        const error = new Error(`Media #${imageMediaId} does not exist`);
        (error as unknown as { statusCode: number; status: number }).statusCode = 400;
        (error as unknown as { statusCode: number; status: number }).status = 400;
        throw error;
      }
    }
    const imageUrl = data.imageUrl ?? data.image ?? null;

    const res = await execute(
      `INSERT INTO dishes 
       (category_id, name, tag, price, rating, description, image_media_id, image_url, is_available, sort_order)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        categoryId,
        data.name,
        tag,
        data.price,
        rating,
        description,
        imageMediaId,
        imageUrl,
        isAvailable,
        sortOrder,
      ]
    );

    const created = await this.getById(res.insertId);
    if (!created) {
      throw new Error("Failed to retrieve created dish");
    }
    return created;
  },

  async update(id: number, updates: UpdateDishInput): Promise<MenuItem | null> {
    const existing = await this.getRawById(id);
    if (!existing) return null;

    let categoryId = existing.category_id;
    if (updates.category !== undefined) {
      categoryId = await this.resolveCategoryId(updates.category);
    }

    const name = updates.name ?? existing.name;
    const tag = updates.tag ?? existing.tag;
    const price = updates.price !== undefined ? updates.price : existing.price;
    const rating = updates.rating ?? existing.rating;
    const description =
      updates.description ?? updates.desc ?? existing.description;
    const isAvailable =
      updates.isAvailable !== undefined
        ? updates.isAvailable
          ? 1
          : 0
        : existing.is_available;
    const sortOrder =
      updates.sortOrder !== undefined ? updates.sortOrder : existing.sort_order;

    let imageMediaId = existing.image_media_id;
    let imageUrl = existing.image_url;

    if (updates.imageMediaId !== undefined) {
      imageMediaId = updates.imageMediaId;
      if (imageMediaId !== null) {
        const media = await mediaRepository.getById(imageMediaId);
        if (!media) {
          const error = new Error(`Media #${imageMediaId} does not exist`);
          (error as unknown as { statusCode: number; status: number }).statusCode = 400;
          (error as unknown as { statusCode: number; status: number }).status = 400;
          throw error;
        }
      }
    }
    if (updates.imageUrl !== undefined || updates.image !== undefined) {
      imageUrl = updates.imageUrl ?? updates.image ?? null;
    }

    // Check if old media should be cleaned up
    const oldMediaId = existing.image_media_id;

    await execute(
      `UPDATE dishes SET
        category_id = ?,
        name = ?,
        tag = ?,
        price = ?,
        rating = ?,
        description = ?,
        image_media_id = ?,
        image_url = ?,
        is_available = ?,
        sort_order = ?
       WHERE id = ?`,
      [
        categoryId,
        name,
        tag,
        price,
        rating,
        description,
        imageMediaId,
        imageUrl,
        isAvailable,
        sortOrder,
        id,
      ]
    );

    if (oldMediaId && oldMediaId !== imageMediaId) {
      await mediaRepository.deleteIfUnreferenced(oldMediaId);
    }

    return this.getById(id);
  },

  async toggleAvailability(id: number): Promise<MenuItem | null> {
    const existing = await this.getRawById(id);
    if (!existing) return null;

    const newAvail = existing.is_available ? 0 : 1;
    await execute("UPDATE dishes SET is_available = ? WHERE id = ?", [
      newAvail,
      id,
    ]);
    return this.getById(id);
  },

  async delete(id: number): Promise<boolean> {
    const existing = await this.getRawById(id);
    if (!existing) return false;

    const oldMediaId = existing.image_media_id;

    const res = await execute("DELETE FROM dishes WHERE id = ?", [id]);
    const deleted = res.affectedRows > 0;

    if (deleted && oldMediaId) {
      await mediaRepository.deleteIfUnreferenced(oldMediaId);
    }

    return deleted;
  },

  async reorder(orderedIds: number[]): Promise<void> {
    await withTransaction(async (conn) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await conn.query("UPDATE dishes SET sort_order = ? WHERE id = ?", [
          i + 1,
          orderedIds[i],
        ]);
      }
    });
  },
};
