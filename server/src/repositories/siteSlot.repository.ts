import { RowDataPacket } from "mysql2/promise";
import { query, queryOne, execute } from "../db/pool";
import { mediaRepository } from "./media.repository";

export interface SiteSlotRecord {
  key: string;
  section: string;
  label: string;
  altText: string;
  effectiveUrl: string;
  mediaId: number | null;
  dishId: number | null;
  dishName?: string;
  fallbackUrl: string;
  sortOrder: number;
}

interface SiteSlotRow extends RowDataPacket {
  slot_key: string;
  section: string;
  label: string;
  alt_text: string;
  fallback_url: string;
  media_id: number | null;
  dish_id: number | null;
  sort_order: number;
  dish_name?: string;
  dish_image_media_id?: number | null;
  dish_image_url?: string | null;
}

function mapRow(row: SiteSlotRow): SiteSlotRecord {
  let effectiveUrl = row.fallback_url;
  let effectiveAlt = row.alt_text;

  if (row.media_id) {
    effectiveUrl = `/api/media/${row.media_id}`;
  } else if (row.dish_id) {
    if (row.dish_image_media_id) {
      effectiveUrl = `/api/media/${row.dish_image_media_id}`;
    } else if (row.dish_image_url) {
      effectiveUrl = row.dish_image_url;
    }
    if (row.dish_name) {
      effectiveAlt = row.dish_name;
    }
  }

  return {
    key: row.slot_key,
    section: row.section,
    label: row.label,
    altText: effectiveAlt,
    effectiveUrl,
    mediaId: row.media_id,
    dishId: row.dish_id,
    dishName: row.dish_name,
    fallbackUrl: row.fallback_url,
    sortOrder: row.sort_order,
  };
}

export const siteSlotRepository = {
  async getAll(): Promise<SiteSlotRecord[]> {
    const rows = await query<SiteSlotRow>(`
      SELECT 
        s.*,
        d.name AS dish_name,
        d.image_media_id AS dish_image_media_id,
        d.image_url AS dish_image_url
      FROM site_slots s
      LEFT JOIN dishes d ON d.id = s.dish_id
      ORDER BY s.sort_order ASC, s.slot_key ASC
    `);
    return rows.map(mapRow);
  },

  async getByKey(slotKey: string): Promise<SiteSlotRecord | null> {
    const row = await queryOne<SiteSlotRow>(
      `
      SELECT 
        s.*,
        d.name AS dish_name,
        d.image_media_id AS dish_image_media_id,
        d.image_url AS dish_image_url
      FROM site_slots s
      LEFT JOIN dishes d ON d.id = s.dish_id
      WHERE s.slot_key = ?
    `,
      [slotKey]
    );
    return row ? mapRow(row) : null;
  },

  async update(
    slotKey: string,
    updates: {
      mediaId?: number | null;
      dishId?: number | null;
      label?: string;
      altText?: string;
      fallbackUrl?: string;
    }
  ): Promise<SiteSlotRecord> {
    const existing = await this.getByKey(slotKey);
    if (!existing) {
      throw new Error(`Site slot '${slotKey}' not found.`);
    }

    const oldMediaId = existing.mediaId;
    const mediaId =
      updates.mediaId !== undefined ? updates.mediaId : existing.mediaId;
    const dishId =
      updates.dishId !== undefined ? updates.dishId : existing.dishId;
    const label =
      updates.label !== undefined ? updates.label : existing.label;
    const altText =
      updates.altText !== undefined ? updates.altText : existing.altText;
    const fallbackUrl =
      updates.fallbackUrl !== undefined ? updates.fallbackUrl : existing.fallbackUrl;

    await execute(
      `UPDATE site_slots 
       SET media_id = ?, dish_id = ?, label = ?, alt_text = ?, fallback_url = ? 
       WHERE slot_key = ?`,
      [mediaId, dishId, label, altText, fallbackUrl, slotKey]
    );

    if (oldMediaId && oldMediaId !== mediaId) {
      await mediaRepository.deleteIfUnreferenced(oldMediaId);
    }

    const updated = await this.getByKey(slotKey);
    if (!updated) {
      throw new Error("Failed to retrieve updated site slot");
    }
    return updated;
  },
};
