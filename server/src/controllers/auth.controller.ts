import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { adminRepository } from "../repositories/admin.repository";
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

export const login = asyncHandler(async (req: Request, res: Response<ApiResponse<AuthSession>>) => {
  const { username, password } = req.body;

  const admin = await adminRepository.verifyCredentials(username, password);

  if (!admin) {
    return res.status(401).json({
      success: false,
      error: "Invalid Username or Password. Please check your credentials.",
    });
  }

  const token = jwt.sign(
    { id: admin.id, role: admin.role, tokenVersion: admin.tokenVersion },
    getJwtSecret(),
    { expiresIn: "8h", algorithm: "HS256" }
  );
  const sanitizedUser = sanitizeAdmin(admin);

  res.json({
    success: true,
    message: "Authentication successful! Welcome to Pehlwan Console.",
    data: {
      token,
      user: sanitizedUser,
    },
  });
});

export const verifySession = asyncHandler(async (
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
      const decoded = jwt.verify(token, getJwtSecret(), { algorithms: ["HS256"] }) as {
        id: string;
        role: string;
        tokenVersion: number;
      };
      adminId = decoded.id;
    } catch {
      return res.status(401).json({
        success: false,
        error: "Invalid or expired session token",
      });
    }
  }

  const admin = await adminRepository.getById(adminId);
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

export const updateCredentials = asyncHandler(async (
  req: Request,
  res: Response<ApiResponse<{ user: Omit<AdminUser, "password" | "passwordHash"> }>>
) => {
  const { currentPassword, newPassword, newUsername, newEmail } = req.body;
  const adminId = req.admin?.id || (await adminRepository.get())?.id;

  if (!adminId) {
    return res.status(401).json({
      success: false,
      error: "Admin account not found.",
    });
  }

  try {
    const updated = await adminRepository.updateCredentials(
      adminId,
      currentPassword,
      {
        newPassword,
        newUsername,
        newEmail,
      }
    );

    const sanitizedUser = sanitizeAdmin(updated);

    res.json({
      success: true,
      message: "Admin credentials updated successfully!",
      data: { user: sanitizedUser },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Failed to update credentials";
    return res.status(400).json({
      success: false,
      error: message,
    });
  }
});
