import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { db } from "../data/db";
import { ApiResponse, AuthSession, AdminUser } from "../types";
import { getJwtSecret } from "../middleware/requireAuth";
import { asyncHandler } from "../middleware/asyncHandler";

// Helper to strip password and passwordHash from admin user
const sanitizeAdmin = (admin: AdminUser): Omit<AdminUser, "password" | "passwordHash"> => {
  const { password: _password, passwordHash: _passwordHash, ...sanitized } = admin;
  void _password;
  void _passwordHash;
  return sanitized;
};

export const login = asyncHandler((req: Request, res: Response<ApiResponse<AuthSession>>) => {
  const { username, password } = req.body;

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
});

export const verifySession = asyncHandler((
  req: Request,
  res: Response<ApiResponse<{ user: Omit<AdminUser, "password" | "passwordHash"> }>>
) => {
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

    try {
      const decoded = jwt.verify(token, getJwtSecret()) as { id: string; role: string };
      adminId = decoded.id;
    } catch {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired session token",
      });
    }
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
});

export const updateCredentials = asyncHandler((
  req: Request,
  res: Response<ApiResponse<{ user: Omit<AdminUser, "password" | "passwordHash"> }>>
) => {
  const { currentPassword, newPassword, newUsername, newEmail, newName } = req.body;
  const admin = db.getAdmin();

  const isCurrentValid =
    Boolean(admin.passwordHash && bcrypt.compareSync(currentPassword, admin.passwordHash));

  if (!isCurrentValid) {
    return res.status(400).json({
      success: false,
      error: "Current password is incorrect.",
    });
  }

  const updates: Partial<AdminUser> = {};
  if (newPassword) updates.passwordHash = bcrypt.hashSync(newPassword, 10);
  if (newUsername) updates.username = newUsername;
  if (newEmail) updates.email = newEmail;
  if (newName) updates.name = newName;

  const updated = db.updateAdmin(updates);
  const sanitizedUser = sanitizeAdmin(updated);

  res.json({
    success: true,
    message: "Admin credentials updated successfully!",
    data: { user: sanitizedUser },
  });
});
