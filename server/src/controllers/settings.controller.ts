import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, RestaurantSettings } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const getSettings = asyncHandler((_req: Request, res: Response<ApiResponse<RestaurantSettings>>) => {
  const settings = db.getSettings();
  res.json({
    success: true,
    data: settings,
  });
});

export const updateSettings = asyncHandler((req: Request, res: Response<ApiResponse<RestaurantSettings>>) => {
  const updated = db.updateSettings(req.body);
  res.json({
    success: true,
    message: "Restaurant details and contact info updated successfully!",
    data: updated,
  });
});
