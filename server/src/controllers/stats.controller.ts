import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, DashboardStats } from "../types";
import { getErrorMessage } from "../middleware/errorHandler";

export const getStats = (_req: Request, res: Response<ApiResponse<DashboardStats>>) => {
  try {
    const stats = db.getStats();
    res.json({
      success: true,
      data: stats,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to retrieve dashboard analytics"),
    });
  }
};
