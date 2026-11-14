import { RowDataPacket } from "mysql2/promise";
import { queryOne, execute } from "../db/pool";

export interface MediaRecord {
  id: number;
  mime: string;
  size: number;
  data: Buffer;
  createdAt: string;
}

interface MediaRow extends RowDataPacket {
  id: number;
  mime: string;
  size: number;
  data: Buffer;
  created_at: Date;
}

interface CountRow extends RowDataPacket {
  count: number;
}

export const mediaRepository = {
  async create(mime: string, size: number, data: Buffer): Promise<number> {
    const res = await execute(
      "INSERT INTO media (mime, size, data) VALUES (?, ?, ?)",
      [mime, size, data]
    );
    return res.insertId;
  },

  async getById(id: number): Promise<MediaRecord | null> {
    const row = await queryOne<MediaRow>(
      "SELECT id, mime, size, data, created_at FROM media WHERE id = ?",
      [id]
    );
    if (!row) return null;
    return {
      id: row.id,
      mime: row.mime,
      size: row.size,
      data: row.data,
      createdAt: row.created_at.toISOString(),
    };
  },

  async isReferenced(mediaId: number): Promise<boolean> {
    const dishRef = await queryOne<CountRow>(
      "SELECT COUNT(*) AS count FROM dishes WHERE image_media_id = ?",
      [mediaId]
    );
    if (dishRef && Number(dishRef.count) > 0) return true;

    const slotRef = await queryOne<CountRow>(
      "SELECT COUNT(*) AS count FROM site_slots WHERE media_id = ?",
      [mediaId]
    );
    if (slotRef && Number(slotRef.count) > 0) return true;

    return false;
  },

  async deleteIfUnreferenced(mediaId: number): Promise<boolean> {
    const referenced = await this.isReferenced(mediaId);
    if (referenced) {
      return false;
    }
    const res = await execute("DELETE FROM media WHERE id = ?", [mediaId]);
    return res.affectedRows > 0;
  },

  async cleanupOrphans(): Promise<number> {
    // Delete media older than 24h that are not referenced in dishes or site_slots
    const res = await execute(`
      DELETE FROM media 
      WHERE created_at < DATE_SUB(NOW(), INTERVAL 24 HOUR)
        AND id NOT IN (SELECT image_media_id FROM dishes WHERE image_media_id IS NOT NULL)
        AND id NOT IN (SELECT media_id FROM site_slots WHERE media_id IS NOT NULL)
    `);
    return res.affectedRows;
  },
};
