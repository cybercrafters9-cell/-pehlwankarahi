import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, LoyaltyPassSummary } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const activatePass = asyncHandler((
  req: Request,
  res: Response<ApiResponse<LoyaltyPassSummary>>
) => {
  const { phone, name } = req.body;
  if (!phone || typeof phone !== "string") {
    return res.status(400).json({
      success: false,
      error: "Valid mobile phone number is required to activate loyalty pass.",
    });
  }

  const pass = db.activateLoyalty(phone, name);

  res.status(200).json({
    success: true,
    message: "👑 Shahi Loyalty Pass Activated! Enjoy 15% VIP discount.",
    data: {
      tier: pass.tier,
      discountPercent: pass.discountPercent,
    },
  });
});

export const getPass = asyncHandler((
  req: Request,
  res: Response<ApiResponse<LoyaltyPassSummary>>
) => {
  const phone = String(req.params.phone || "");
  const pass = db.getLoyalty(phone);

  if (!pass) {
    return res.status(404).json({
      success: false,
      error: "No active VIP loyalty pass found for this phone number.",
    });
  }

  res.json({
    success: true,
    data: {
      tier: pass.tier,
      discountPercent: pass.discountPercent,
    },
  });
});
