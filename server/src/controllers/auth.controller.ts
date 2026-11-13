import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, AuthSession, AdminUser } from "../types";
import { getErrorMessage } from "../middleware/errorHandler";

// Helper to strip password from admin user
const sanitizeAdmin = (admin: AdminUser): Omit<AdminUser, "password"> => {
  const { password: _password, ...sanitized } = admin;
  void _password;
  return sanitized;
};

// Simple token generator for session auth
const createToken = (admin: AdminUser) => {
  const payload = Buffer.from(`${admin.id}:${admin.username}:${Date.now()}`).toString("base64");
  return `pk_sec_${payload}`;
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

    const token = createToken(admin);
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

export const verifySession = (req: Request, res: Response<ApiResponse<{ user: Omit<AdminUser, "password"> }>>) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        error: "No active authentication session found",
      });
    }

    const token = authHeader.split(" ")[1];
    if (!token || !token.startsWith("pk_sec_")) {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired session token",
      });
    }

    const admin = db.getAdmin();
    const sanitizedUser = sanitizeAdmin(admin);

    res.json({
      success: true,
      data: { user: sanitizedUser },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to verify session"),
    });
  }
};

export const updateCredentials = (req: Request, res: Response<ApiResponse<{ user: Omit<AdminUser, "password"> }>>) => {
  try {
    const { currentPassword, newPassword, newUsername, newEmail, newName } = req.body;
    const admin = db.getAdmin();

    if (admin.password && admin.password !== currentPassword) {
      return res.status(400).json({
        success: false,
        error: "Current password is incorrect.",
      });
    }

    const updates: Partial<AdminUser> = {};
    if (newPassword && newPassword.trim().length >= 6) updates.password = newPassword.trim();
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
