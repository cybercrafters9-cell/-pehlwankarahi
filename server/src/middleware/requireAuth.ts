import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { adminRepository } from "../repositories/admin.repository";

export interface JwtAdminPayload {
  id: string;
  role: "superadmin" | "manager";
  tokenVersion: number;
}

declare module "express" {
  interface Request {
    admin?: JwtAdminPayload;
  }
}

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim().length < 32) {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is missing or shorter than 32 characters. You must define a secure JWT_SECRET in your environment or .env file."
    );
  }
  return secret.trim();
};

export const requireAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      success: false,
      error: "Access denied. Authentication token is missing.",
    });
    return;
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    res.status(401).json({
      success: false,
      error: "Access denied. Authentication token is missing.",
    });
    return;
  }

  try {
    const decoded = jwt.verify(token, getJwtSecret(), {
      algorithms: ["HS256"],
    }) as unknown as JwtAdminPayload;

    if (!decoded || !decoded.id || typeof decoded.tokenVersion !== "number") {
      res.status(401).json({
        success: false,
        error: "Access denied. Invalid authentication token.",
      });
      return;
    }

    // Verify admin exists in DB and token_version matches
    const currentVersion = await adminRepository.getTokenVersion(decoded.id);
    if (currentVersion === null || currentVersion !== decoded.tokenVersion) {
      res.status(401).json({
        success: false,
        error: "Access denied. Token has been invalidated or admin does not exist.",
      });
      return;
    }

    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({
      success: false,
      error: "Access denied. Invalid or expired authentication token.",
    });
    return;
  }
};
