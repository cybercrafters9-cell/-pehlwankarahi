import { RowDataPacket } from "mysql2/promise";
import { queryOne, execute } from "../db/pool";

export interface MediaRecord {
  id: number;
  filename: string;
  mime: string;
  size: number;
  hash: string | null;
  data: Buffer;
  createdAt: string;
}

interface MediaRow extends RowDataPacket {
  id: number;
  filename: string;
  mime: string;
  size: number;
  hash_sha256: string | null;
  data: Buffer;
  created_at: Date;
}

interface CountRow extends RowDataPacket {
  count: number;
}

function mapMediaRow(row: MediaRow): MediaRecord {
  return {
    id: row.id,
    filename: row.filename || "image",
    mime: row.mime,
    size: row.size,
    hash: row.hash_sha256,
    data: row.data,
    createdAt: row.created_at.toISOString(),
  };
}

export const mediaRepository = {
  async findByHash(hash: string): Promise<MediaRecord | null> {
    const row = await queryOne<MediaRow>(
      "SELECT id, filename, mime, size, hash_sha256, data, created_at FROM media WHERE hash_sha256 = ?",
      [hash]
    );
    return row ? mapMediaRow(row) : null;
  },

  async create(
    filename: string,
    mime: string,
    size: number,
    data: Buffer,
    hash: string
  ): Promise<MediaRecord> {
    const existing = await this.findByHash(hash);
    if (existing) {
      return existing;
    }

    const safeFilename =
      filename && filename.length > 255 ? filename.slice(0, 255) : filename || "image";

    const res = await execute(
      "INSERT INTO media (filename, mime, size, hash_sha256, data) VALUES (?, ?, ?, ?, ?)",
      [safeFilename, mime, size, hash, data]
    );

    const created = await this.getById(res.insertId);
    if (!created) {
      throw new Error(`Failed to retrieve newly created media #${res.insertId}`);
    }
    return created;
  },

  async getById(id: number): Promise<MediaRecord | null> {
    const row = await queryOne<MediaRow>(
      "SELECT id, filename, mime, size, hash_sha256, data, created_at FROM media WHERE id = ?",
      [id]
    );
    return row ? mapMediaRow(row) : null;
  },

  async isReferenced(mediaId: number): Promise<boolean> {
    const mediaUrl = `/api/media/${mediaId}`;
    const dishRef = await queryOne<CountRow>(
      "SELECT COUNT(*) AS count FROM dishes WHERE image_media_id = ? OR image_url = ?",
      [mediaId, mediaUrl]
    );
    if (dishRef && Number(dishRef.count) > 0) return true;

    const slotRef = await queryOne<CountRow>(
      "SELECT COUNT(*) AS count FROM site_slots WHERE media_id = ? OR fallback_url = ?",
      [mediaId, mediaUrl]
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
        AND CONCAT('/api/media/', id) NOT IN (SELECT image_url FROM dishes WHERE image_url IS NOT NULL)
        AND CONCAT('/api/media/', id) NOT IN (SELECT fallback_url FROM site_slots WHERE fallback_url IS NOT NULL)
    `);
    return res.affectedRows;
  },
};
