import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../data/db";
import { ApiResponse, AuthSession, AdminUser } from "../types";
import { getErrorMessage } from "../middleware/errorHandler";
import { getJwtSecret } from "../middleware/requireAuth";

// Helper to strip password and passwordHash from admin user
const sanitizeAdmin = (admin: AdminUser): Omit<AdminUser, "password" | "passwordHash"> => {
  const { password: _password, passwordHash: _passwordHash, ...sanitized } = admin;
  void _password;
  void _passwordHash;
  return sanitized;
};

export const login = (req: Request, res: Response<ApiResponse<AuthSession>>) => {
  try {
    const { username, password } = req.body;

    if (!username || !password) {
      return res.status(400).json({
        success: false,
        error: "Username / Email and Password are required",
      });
    }

    const admin = db.verifyAdmin(username, password);

    if (!admin) {
      return res.status(401).json({
        success: false,
        error: "Ghalat Username ya Password. Please check your credentials.",
      });
    }

    const token = jwt.sign(
      { id: admin.id, role: admin.role },
      getJwtSecret(),
      { expiresIn: "8h" }
    );
    const sanitizedUser = sanitizeAdmin(admin);

    res.json({
      success: true,
      message: "Authentication successful! Welcome to Pehalwan Console.",
      data: {
        token,
        user: sanitizedUser,
      },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Login failed due to server error"),
    });
  }
};

export const verifySession = (
  req: Request,
  res: Response<ApiResponse<{ user: Omit<AdminUser, "password" | "passwordHash"> }>>
) => {
  try {
    let adminId = req.admin?.id;

    if (!adminId) {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          error: "No active authentication session found",
        });
      }

      const token = authHeader.slice(7).trim();
      if (!token) {
        return res.status(401).json({
          success: false,
          error: "Invalid or expired session token",
        });
      }

      const decoded = jwt.verify(token, getJwtSecret()) as { id: string; role: string };
      adminId = decoded.id;
    }

    const admin = db.getAdmin();
    if (!admin || admin.id !== adminId) {
      return res.status(401).json({
        success: false,
        error: "User not found or unauthorized",
      });
    }

    const sanitizedUser = sanitizeAdmin(admin);

    res.json({
      success: true,
      data: { user: sanitizedUser },
    });
  } catch {
    res.status(401).json({
      success: false,
      error: "Invalid or expired session token",
    });
  }
};

export const updateCredentials = (
  req: Request,
  res: Response<ApiResponse<{ user: Omit<AdminUser, "password" | "passwordHash"> }>>
) => {
  try {
    const { currentPassword, newPassword, newUsername, newEmail, newName } = req.body;
    const admin = db.getAdmin();

    if (!currentPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password is required to authorize changes.",
      });
    }

    const isCurrentValid =
      Boolean(admin.passwordHash) && bcrypt.compareSync(currentPassword, admin.passwordHash);

    if (!isCurrentValid) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect.",
      });
    }

    const updates: Partial<AdminUser> = {};
    if (newPassword !== undefined && newPassword !== "") {
      const trimmed = newPassword.trim();
      if (trimmed.length < 8) {
        return res.status(400).json({
          success: false,
          error: "New password must be at least 8 characters long.",
        });
      }
      updates.passwordHash = bcrypt.hashSync(trimmed, 10);
    }
    if (newUsername && newUsername.trim()) updates.username = newUsername.trim();
    if (newEmail && newEmail.trim()) updates.email = newEmail.trim();
    if (newName && newName.trim()) updates.name = newName.trim();

    const updated = db.updateAdmin(updates);
    const sanitizedUser = sanitizeAdmin(updated);

    res.json({
      success: true,
      message: "Admin credentials updated successfully!",
      data: { user: sanitizedUser },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to update admin credentials"),
    });
  }
};
