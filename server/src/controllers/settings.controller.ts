import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, RestaurantSettings } from "../types";
import { getErrorMessage } from "../middleware/errorHandler";

export const getSettings = (_req: Request, res: Response<ApiResponse<RestaurantSettings>>) => {
  try {
    const settings = db.getSettings();
    res.json({
      success: true,
      data: settings,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to fetch restaurant settings"),
    });
  }
};

export const updateSettings = (req: Request, res: Response<ApiResponse<RestaurantSettings>>) => {
  try {
    const updates = req.body;
    if (updates.deliveryFee !== undefined) updates.deliveryFee = Number(updates.deliveryFee);
    if (updates.minOrder !== undefined) updates.minOrder = Number(updates.minOrder);

    const updated = db.updateSettings(updates);
    res.json({
      success: true,
      message: "Restaurant details and contact info updated successfully!",
      data: updated,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to update restaurant settings"),
    });
  }
};
