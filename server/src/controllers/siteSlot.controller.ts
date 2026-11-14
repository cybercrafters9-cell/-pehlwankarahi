import { Request, Response } from "express";
import {
  siteSlotRepository,
  SiteSlotRecord,
} from "../repositories/siteSlot.repository";
import { ApiResponse } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export interface SiteContentResponse {
  slots: Record<string, SiteSlotRecord>;
}

export const getSiteContent = asyncHandler(
  async (_req: Request, res: Response<ApiResponse<SiteContentResponse>>) => {
    const list = await siteSlotRepository.getAll();
    const slots: Record<string, SiteSlotRecord> = {};
    for (const slot of list) {
      slots[slot.key] = slot;
    }

    res.json({
      success: true,
      data: { slots },
    });
  }
);

export const updateSiteSlot = asyncHandler(
  async (req: Request, res: Response<ApiResponse<SiteSlotRecord>>) => {
    const key = String(req.params.key);
    const { mediaId, dishId, label, altText, fallbackUrl } = req.body;

    const updated = await siteSlotRepository.update(key, {
      mediaId: mediaId !== undefined ? mediaId : undefined,
      dishId: dishId !== undefined ? dishId : undefined,
      label,
      altText,
      fallbackUrl,
    });

    res.json({
      success: true,
      message: `Site slot '${key}' updated successfully`,
      data: updated,
    });
  }
);
