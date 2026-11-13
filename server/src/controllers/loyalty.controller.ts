import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, LoyaltyPass } from "../types";
import { getErrorMessage } from "../middleware/errorHandler";

export const activatePass = (
  req: Request,
  res: Response<ApiResponse<LoyaltyPass>>
) => {
  try {
    const { phone, name } = req.body;
    const customerPhone = phone || "0300-8888888";
    const pass = db.activateLoyalty(customerPhone, name);

    res.status(200).json({
      success: true,
      message: "👑 Shahi Loyalty Pass Activated! Enjoy PKR 1,000 bonus & 15% discount.",
      data: pass,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to activate loyalty pass"),
    });
  }
};

export const getPass = (
  req: Request,
  res: Response<ApiResponse<LoyaltyPass>>
) => {
  try {
    const phone = String(req.params.phone);
    const pass = db.getLoyalty(phone);

    if (!pass) {
      return res.status(404).json({
        success: false,
        error: "No active VIP loyalty pass found for this phone number.",
      });
    }

    res.json({
      success: true,
      data: pass,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to retrieve loyalty pass"),
    });
  }
};
