import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, DashboardStats } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const getStats = asyncHandler((_req: Request, res: Response<ApiResponse<DashboardStats>>) => {
  const stats = db.getStats();
  res.json({
    success: true,
    data: stats,
  });
});
