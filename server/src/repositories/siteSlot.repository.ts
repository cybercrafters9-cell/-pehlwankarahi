import { RowDataPacket } from "mysql2/promise";
import { query, queryOne, execute } from "../db/pool";
import { mediaRepository } from "./media.repository";

export interface SiteSlotRecord {
  slotKey: string;
  section: string;
  label: string;
  altText: string;
  fallbackUrl: string;
  mediaId: number | null;
  dishId: number | null;
  sortOrder: number;
  imageUrl: string;
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
}

function mapRow(row: SiteSlotRow): SiteSlotRecord {
  const imageUrl = row.media_id ? `/api/media/${row.media_id}` : row.fallback_url;
  return {
    slotKey: row.slot_key,
    section: row.section,
    label: row.label,
    altText: row.alt_text,
    fallbackUrl: row.fallback_url,
    mediaId: row.media_id,
    dishId: row.dish_id,
    sortOrder: row.sort_order,
    imageUrl,
  };
}

export const siteSlotRepository = {
  async getAll(): Promise<SiteSlotRecord[]> {
    const rows = await query<SiteSlotRow>(
      "SELECT * FROM site_slots ORDER BY sort_order ASC, slot_key ASC"
    );
    return rows.map(mapRow);
  },

  async getByKey(slotKey: string): Promise<SiteSlotRecord | null> {
    const row = await queryOne<SiteSlotRow>(
      "SELECT * FROM site_slots WHERE slot_key = ?",
      [slotKey]
    );
    return row ? mapRow(row) : null;
  },

  async update(
    slotKey: string,
    updates: {
      mediaId?: number | null;
      altText?: string;
      dishId?: number | null;
    }
  ): Promise<SiteSlotRecord> {
    const existing = await this.getByKey(slotKey);
    if (!existing) {
      throw new Error(`Site slot '${slotKey}' not found.`);
    }

    const oldMediaId = existing.mediaId;
    const mediaId =
      updates.mediaId !== undefined ? updates.mediaId : existing.mediaId;
    const altText =
      updates.altText !== undefined ? updates.altText : existing.altText;
    const dishId =
      updates.dishId !== undefined ? updates.dishId : existing.dishId;

    await execute(
      "UPDATE site_slots SET media_id = ?, alt_text = ?, dish_id = ? WHERE slot_key = ?",
      [mediaId, altText, dishId, slotKey]
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
