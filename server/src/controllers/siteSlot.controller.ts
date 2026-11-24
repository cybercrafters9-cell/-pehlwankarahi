import { Request, Response } from "express";
import {
  siteSlotRepository,
  SiteSlotRecord,
} from "../repositories/siteSlot.repository";
import { mediaRepository } from "../repositories/media.repository";
import { dishRepository } from "../repositories/dish.repository";
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

    const existing = await siteSlotRepository.getByKey(key);
    if (!existing) {
      return res.status(404).json({
        success: false,
        error: `Site slot '${key}' not found`,
      });
    }

    const { mediaId, customUrl, dishId, label, altText, fallbackUrl } = req.body;

    if (mediaId !== undefined && mediaId !== null) {
      const media = await mediaRepository.getById(mediaId);
      if (!media) {
        return res.status(400).json({
          success: false,
          error: `Media #${mediaId} does not exist`,
        });
      }
    }

    if (dishId !== undefined && dishId !== null) {
      const dish = await dishRepository.getById(dishId);
      if (!dish) {
        return res.status(400).json({
          success: false,
          error: `Dish #${dishId} does not exist`,
        });
      }
    }

    const updated = await siteSlotRepository.update(key, {
      mediaId: mediaId !== undefined ? mediaId : undefined,
      customUrl: customUrl !== undefined ? customUrl : undefined,
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
