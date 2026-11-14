import { Request, Response } from "express";
import { statsRepository } from "../repositories/stats.repository";
import { ApiResponse, DashboardStats } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const getStats = asyncHandler(
  async (_req: Request, res: Response<ApiResponse<DashboardStats>>) => {
    const stats = await statsRepository.getStats();
    res.json({
      success: true,
      data: stats,
    });
  }
);
