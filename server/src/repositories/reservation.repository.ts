import { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { query, queryOne, execute, withTransaction } from "../db/pool";
import { Reservation, ReservationStatus } from "../types";

interface ReservationRow extends RowDataPacket {
  id: number;
  code: string;
  name: string;
  phone: string;
  guests: number;
  time_slot: string;
  status: ReservationStatus;
  created_at: Date;
}

function parseGuests(guests: string | number): number {
  if (typeof guests === "number") return guests;
  const match = String(guests).match(/\d+/);
  return match ? parseInt(match[0], 10) : 4;
}

function formatGuests(guestsNum: number): string {
  if (guestsNum <= 4) return "2-4 Guests (Indoor Family Hall)";
  if (guestsNum <= 8) return "5-8 Guests (Rooftop Koyla Lawn)";
  return "10+ Guests (Shahi Dera Takht)";
}

function mapReservation(row: ReservationRow): Reservation {
  return {
    id: row.code,
    name: row.name,
    phone: row.phone,
    guests: formatGuests(row.guests),
    timeSlot: row.time_slot,
    status: row.status,
    createdAt: row.created_at.toISOString(),
  };
}

export interface CreateReservationInput {
  name: string;
  phone: string;
  guests: string | number;
  timeSlot: string;
}

export const reservationRepository = {
  async getAll(): Promise<Reservation[]> {
    const rows = await query<ReservationRow>(
      "SELECT * FROM reservations ORDER BY created_at DESC"
    );
    return rows.map(mapReservation);
  },

  async getById(idOrCode: string): Promise<Reservation | null> {
    const isCode = idOrCode.toUpperCase().startsWith("DAWAT-");
    const sql = isCode
      ? "SELECT * FROM reservations WHERE code = ?"
      : "SELECT * FROM reservations WHERE code = ? OR id = ?";
    const params = isCode ? [idOrCode] : [idOrCode, idOrCode];

    const row = await queryOne<ReservationRow>(sql, params);
    return row ? mapReservation(row) : null;
  },

  async create(data: CreateReservationInput): Promise<Reservation> {
    const guestsNum = parseGuests(data.guests);

    return withTransaction(async (conn) => {
      const [insertResult] = await conn.execute<ResultSetHeader>(
        `INSERT INTO reservations (code, name, phone, guests, time_slot, status)
         VALUES ('', ?, ?, ?, ?, 'confirmed')`,
        [data.name, data.phone, guestsNum, data.timeSlot]
      );

      const resId = insertResult.insertId;
      const code = `DAWAT-${200 + resId}`;

      await conn.execute("UPDATE reservations SET code = ? WHERE id = ?", [
        code,
        resId,
      ]);

      const [rows] = await conn.query<ReservationRow[]>(
        "SELECT * FROM reservations WHERE id = ?",
        [resId]
      );

      return mapReservation(rows[0]);
    });
  },

  async updateStatus(
    idOrCode: string,
    status: ReservationStatus
  ): Promise<Reservation | null> {
    const existing = await this.getById(idOrCode);
    if (!existing) return null;

    await execute("UPDATE reservations SET status = ? WHERE code = ?", [
      status,
      existing.id,
    ]);

    return this.getById(existing.id);
  },
};
