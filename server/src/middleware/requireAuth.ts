import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { adminRepository } from "../repositories/admin.repository";

export interface JwtAdminPayload {
  id: string;
  role: "superadmin" | "manager";
  tokenVersion?: number;
}

declare module "express" {
  interface Request {
    admin?: JwtAdminPayload;
  }
}

export const getJwtSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error(
      "FATAL: JWT_SECRET environment variable is missing. You must define a secure JWT_SECRET in your environment or .env file."
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
    const decoded = jwt.verify(token, getJwtSecret()) as JwtAdminPayload;
    if (!decoded || !decoded.id) {
      res.status(401).json({
        success: false,
        error: "Access denied. Invalid authentication token.",
      });
      return;
    }

    // Verify token version against database
    if (decoded.tokenVersion !== undefined) {
      const currentVersion = await adminRepository.getTokenVersion(decoded.id);
      if (currentVersion === null || currentVersion !== decoded.tokenVersion) {
        res.status(401).json({
          success: false,
          error: "Access denied. Token has been invalidated. Please log in again.",
        });
        return;
      }
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
