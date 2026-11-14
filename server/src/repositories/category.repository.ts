import { RowDataPacket } from "mysql2/promise";
import { query, queryOne, execute, withTransaction } from "../db/pool";

export interface CategoryRecord {
  id: number;
  slug: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

interface CategoryRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
  sort_order: number;
  is_active: number;
}

interface CountRow extends RowDataPacket {
  count: number;
}

function mapRow(row: CategoryRow): CategoryRecord {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    sortOrder: row.sort_order,
    isActive: Boolean(row.is_active),
  };
}

export const categoryRepository = {
  async getAll(activeOnly = false): Promise<CategoryRecord[]> {
    const sql = activeOnly
      ? "SELECT * FROM categories WHERE is_active = 1 ORDER BY sort_order ASC, id ASC"
      : "SELECT * FROM categories ORDER BY sort_order ASC, id ASC";
    const rows = await query<CategoryRow>(sql);
    return rows.map(mapRow);
  },

  async getById(id: number): Promise<CategoryRecord | null> {
    const row = await queryOne<CategoryRow>(
      "SELECT * FROM categories WHERE id = ?",
      [id]
    );
    return row ? mapRow(row) : null;
  },

  async getBySlug(slug: string): Promise<CategoryRecord | null> {
    const row = await queryOne<CategoryRow>(
      "SELECT * FROM categories WHERE slug = ?",
      [slug]
    );
    return row ? mapRow(row) : null;
  },

  async countDishes(categoryId: number): Promise<number> {
    const row = await queryOne<CountRow>(
      "SELECT COUNT(*) AS count FROM dishes WHERE category_id = ?",
      [categoryId]
    );
    return row ? Number(row.count) : 0;
  },

  async create(data: {
    slug: string;
    name: string;
    sortOrder?: number;
    isActive?: boolean;
  }): Promise<CategoryRecord> {
    const sortOrder = data.sortOrder ?? 0;
    const isActive = data.isActive !== false ? 1 : 0;

    const res = await execute(
      "INSERT INTO categories (slug, name, sort_order, is_active) VALUES (?, ?, ?, ?)",
      [data.slug, data.name, sortOrder, isActive]
    );

    return {
      id: res.insertId,
      slug: data.slug,
      name: data.name,
      sortOrder,
      isActive: Boolean(isActive),
    };
  },

  async update(
    id: number,
    updates: Partial<{
      slug: string;
      name: string;
      sortOrder: number;
      isActive: boolean;
    }>
  ): Promise<CategoryRecord | null> {
    const existing = await this.getById(id);
    if (!existing) return null;

    const slug = updates.slug ?? existing.slug;
    const name = updates.name ?? existing.name;
    const sortOrder = updates.sortOrder ?? existing.sortOrder;
    const isActive =
      updates.isActive !== undefined ? (updates.isActive ? 1 : 0) : existing.isActive ? 1 : 0;

    await execute(
      "UPDATE categories SET slug = ?, name = ?, sort_order = ?, is_active = ? WHERE id = ?",
      [slug, name, sortOrder, isActive, id]
    );

    return {
      id,
      slug,
      name,
      sortOrder,
      isActive: Boolean(isActive),
    };
  },

  async delete(id: number): Promise<boolean> {
    const dishCount = await this.countDishes(id);
    if (dishCount > 0) {
      throw new Error(
        `Cannot delete category #${id}: It has ${dishCount} associated dish(es). Move or delete the dishes first.`
      );
    }
    const res = await execute("DELETE FROM categories WHERE id = ?", [id]);
    return res.affectedRows > 0;
  },

  async reorder(orderedIds: number[]): Promise<void> {
    await withTransaction(async (conn) => {
      for (let i = 0; i < orderedIds.length; i++) {
        await conn.query("UPDATE categories SET sort_order = ? WHERE id = ?", [
          i + 1,
          orderedIds[i],
        ]);
      }
    });
  },
};
