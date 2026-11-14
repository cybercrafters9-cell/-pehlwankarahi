import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { queryOne, withTransaction } from "../db/pool";
import { LoyaltyPass } from "../types";
import { normalizePhone } from "../validators";

interface LoyaltyPassRow extends RowDataPacket {
  id: number;
  code: string;
  phone: string;
  name: string;
  tier: "Shahi Member" | "Royal Member";
  discount_percent: number;
  activated_at: Date;
}

function mapLoyaltyPass(row: LoyaltyPassRow): LoyaltyPass {
  return {
    id: row.code,
    phone: row.phone,
    name: row.name,
    tier: row.tier,
    bonusPkr: 1000,
    discountPercent: row.discount_percent,
    freeItem: "Free Roghni Naan & Salad",
    activatedAt: row.activated_at.toISOString(),
  };
}

export const loyaltyRepository = {
  async getByPhone(phone: string): Promise<LoyaltyPass | null> {
    const normalized = normalizePhone(phone);
    const row = await queryOne<LoyaltyPassRow>(
      "SELECT * FROM loyalty_passes WHERE phone = ?",
      [normalized]
    );
    return row ? mapLoyaltyPass(row) : null;
  },

  async activate(phone: string, name?: string): Promise<LoyaltyPass> {
    const normalized = normalizePhone(phone);
    const existing = await this.getByPhone(normalized);
    if (existing) {
      return existing;
    }

    const memberName = name?.trim() || "Shahi Guest";

    return withTransaction(async (conn) => {
      const [insertResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO loyalty_passes (code, phone, name, tier, discount_percent)
         VALUES ('', ?, ?, 'Shahi Member', 15)`,
        [normalized, memberName]
      );

      const passId = insertResult.insertId;
      const code = `VIP-${Math.floor(1000 + Math.random() * 9000)}`;

      await conn.execute("UPDATE loyalty_passes SET code = ? WHERE id = ?", [
        code,
        passId,
      ]);

      const [rows] = await conn.query<LoyaltyPassRow[]>(
        "SELECT * FROM loyalty_passes WHERE id = ?",
        [passId]
      );

      return mapLoyaltyPass(rows[0]);
    });
  },
};
