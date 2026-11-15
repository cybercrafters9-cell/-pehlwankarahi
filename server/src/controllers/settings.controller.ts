import { Request, Response } from "express";
import { settingsRepository } from "../repositories/settings.repository";
import { ApiResponse, RestaurantSettings } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const getSettings = asyncHandler(
  async (_req: Request, res: Response<ApiResponse<RestaurantSettings>>) => {
    const settings = await settingsRepository.get();
    res.json({
      success: true,
      data: settings,
    });
  }
);

export const updateSettings = asyncHandler(
  async (req: Request, res: Response<ApiResponse<RestaurantSettings>>) => {
    const updated = await settingsRepository.update(req.body);
    res.json({
      success: true,
      message: "Restaurant details and contact info updated successfully!",
      data: updated,
    });
  }
);

export const resetSettings = asyncHandler(
  async (_req: Request, res: Response<ApiResponse<RestaurantSettings>>) => {
    const reset = await settingsRepository.reset();
    res.json({
      success: true,
      message: "Restaurant settings reset to defaults successfully!",
      data: reset,
    });
  }
);
