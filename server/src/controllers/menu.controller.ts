import { Request, Response } from "express";
import { dishRepository } from "../repositories/dish.repository";
import { mediaRepository } from "../repositories/media.repository";
import { ApiResponse, MenuItem } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const getMenu = asyncHandler(
  async (req: Request, res: Response<ApiResponse<MenuItem[]>>) => {
    const { category, search, all } = req.query;
    const includeAll = all === "true";
    let menu = await dishRepository.getAll(includeAll);

    if (category && category !== "all") {
      menu = menu.filter((item) => item.category === category);
    }

    if (search && typeof search === "string" && search.trim() !== "") {
      const q = search.trim().toLowerCase();
      menu = menu.filter(
        (item) =>
          item.name.toLowerCase().includes(q) ||
          item.desc.toLowerCase().includes(q) ||
          item.tag.toLowerCase().includes(q)
      );
    }

    res.json({
      success: true,
      message: `Retrieved ${menu.length} menu items`,
      data: menu,
    });
  }
);

export const getDishById = asyncHandler(
  async (req: Request, res: Response<ApiResponse<MenuItem>>) => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid dish ID" });
    }

    const dish = await dishRepository.getById(id);
    if (!dish) {
      return res.status(404).json({ success: false, error: "Dish not found" });
    }

    res.json({ success: true, data: dish });
  }
);

export const createDish = asyncHandler(
  async (req: Request, res: Response<ApiResponse<MenuItem>>) => {
    const {
      name,
      category,
      tag,
      price,
      rating,
      desc,
      description,
      image,
      imageUrl,
      imageMediaId,
      isAvailable,
      sortOrder,
    } = req.body;

    if (imageMediaId !== undefined && imageMediaId !== null) {
      const media = await mediaRepository.getById(imageMediaId);
      if (!media) {
        return res.status(400).json({
          success: false,
          error: `Media #${imageMediaId} does not exist`,
        });
      }
    }

    const newDish = await dishRepository.create({
      name,
      category: category || "karahi",
      tag: tag || "Desi Special",
      price,
      rating: rating || "5.0",
      desc:
        desc ||
        description ||
        "Authentic Pakistani delicacy cooked in pure desi ghee.",
      image:
        image ||
        imageUrl ||
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
      imageMediaId,
      isAvailable: isAvailable !== undefined ? isAvailable : true,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
    });

    res.status(201).json({
      success: true,
      message: "New dish added to Pehlwan Karahi menu!",
      data: newDish,
    });
  }
);

export const updateDish = asyncHandler(
  async (req: Request, res: Response<ApiResponse<MenuItem>>) => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid dish ID" });
    }

    const { imageMediaId } = req.body;
    if (imageMediaId !== undefined && imageMediaId !== null) {
      const media = await mediaRepository.getById(imageMediaId);
      if (!media) {
        return res.status(400).json({
          success: false,
          error: `Media #${imageMediaId} does not exist`,
        });
      }
    }

    const updated = await dishRepository.update(id, req.body);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Dish not found" });
    }

    res.json({
      success: true,
      message: `Updated dish #${id} (${updated.name})`,
      data: updated,
    });
  }
);

export const toggleAvailability = asyncHandler(
  async (req: Request, res: Response<ApiResponse<MenuItem>>) => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid dish ID" });
    }

    const updated = await dishRepository.toggleAvailability(id);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Dish not found" });
    }

    res.json({
      success: true,
      message: `Dish #${id} availability updated to ${updated.isAvailable ? "available" : "unavailable"}`,
      data: updated,
    });
  }
);

export const reorderDishes = asyncHandler(
  async (req: Request, res: Response<ApiResponse<void>>) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "number")) {
      return res.status(400).json({
        success: false,
        error: "Array of numeric dish IDs is required in 'ids' body field",
      });
    }

    await dishRepository.reorder(ids);
    res.json({
      success: true,
      message: "Menu dishes reordered successfully",
    });
  }
);

export const deleteDish = asyncHandler(
  async (req: Request, res: Response<ApiResponse<{ id: number }>>) => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid dish ID" });
    }

    const deleted = await dishRepository.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Dish not found" });
    }

    res.json({
      success: true,
      message: `Dish #${id} deleted successfully from menu`,
      data: { id },
    });
  }
);
