import bcrypt from "bcryptjs";
import { RowDataPacket } from "mysql2/promise";
import { queryOne, execute } from "../db/pool";
import { AdminUser } from "../types";

export interface AdminUserRecord extends AdminUser {
  id: string;
  tokenVersion: number;
}

interface AdminRow extends RowDataPacket {
  id: number;
  username: string;
  email: string;
  password_hash: string;
  name: string;
  role: "superadmin" | "manager";
  last_login: Date | null;
  token_version: number;
}

function mapAdmin(row: AdminRow): AdminUserRecord {
  return {
    id: String(row.id),
    username: row.username,
    email: row.email,
    passwordHash: row.password_hash,
    name: row.name,
    role: row.role,
    lastLogin: row.last_login ? row.last_login.toISOString() : undefined,
    tokenVersion: row.token_version,
  };
}

export const adminRepository = {
  async get(): Promise<AdminUserRecord | null> {
    const row = await queryOne<AdminRow>(
      "SELECT * FROM admin_users ORDER BY id ASC LIMIT 1"
    );
    return row ? mapAdmin(row) : null;
  },

  async getById(id: number | string): Promise<AdminUserRecord | null> {
    const numId = Number(id);
    if (isNaN(numId)) return null;
    const row = await queryOne<AdminRow>(
      "SELECT * FROM admin_users WHERE id = ?",
      [numId]
    );
    return row ? mapAdmin(row) : null;
  },

  async getByUsernameOrEmail(identifier: string): Promise<AdminUserRecord | null> {
    const clean = identifier.trim().toLowerCase();
    const row = await queryOne<AdminRow>(
      "SELECT * FROM admin_users WHERE LOWER(username) = ? OR LOWER(email) = ?",
      [clean, clean]
    );
    return row ? mapAdmin(row) : null;
  },

  async verifyCredentials(
    identifier: string,
    passwordPlain: string
  ): Promise<AdminUserRecord | null> {
    const admin = await this.getByUsernameOrEmail(identifier);
    if (!admin || !admin.passwordHash) {
      return null;
    }

    const valid = await bcrypt.compare(passwordPlain, admin.passwordHash);
    if (!valid) {
      return null;
    }

    // Update last_login timestamp
    await execute("UPDATE admin_users SET last_login = NOW() WHERE id = ?", [
      Number(admin.id),
    ]);

    return admin;
  },

  async updateCredentials(
    adminId: number | string,
    currentPasswordPlain: string,
    updates: {
      newPassword?: string;
      newUsername?: string;
      newEmail?: string;
    }
  ): Promise<AdminUserRecord> {
    const admin = await this.getById(adminId);
    if (!admin || !admin.passwordHash) {
      throw new Error("Admin user not found");
    }

    const matches = await bcrypt.compare(
      currentPasswordPlain,
      admin.passwordHash
    );
    if (!matches) {
      throw new Error("Current password is incorrect. Please check and try again.");
    }

    let passwordHash = admin.passwordHash;
    if (updates.newPassword && updates.newPassword.trim() !== "") {
      const cleanNew = updates.newPassword.trim();
      if (cleanNew.length < 8) {
        throw new Error("New password must be at least 8 characters long.");
      }
      passwordHash = await bcrypt.hash(cleanNew, 10);
    }

    const username = updates.newUsername?.trim() || admin.username;
    const email = updates.newEmail?.trim().toLowerCase() || admin.email;
    const nextTokenVersion = admin.tokenVersion + 1;

    await execute(
      `UPDATE admin_users SET
        username = ?,
        email = ?,
        password_hash = ?,
        token_version = ?
       WHERE id = ?`,
      [username, email, passwordHash, nextTokenVersion, Number(admin.id)]
    );

    const updated = await this.getById(admin.id);
    if (!updated) {
      throw new Error("Failed to retrieve updated admin user");
    }
    return updated;
  },

  async getTokenVersion(adminId: number | string): Promise<number | null> {
    const row = await queryOne<{ token_version: number } & RowDataPacket>(
      "SELECT token_version FROM admin_users WHERE id = ?",
      [Number(adminId)]
    );
    return row !== null ? row.token_version : null;
  },
};
