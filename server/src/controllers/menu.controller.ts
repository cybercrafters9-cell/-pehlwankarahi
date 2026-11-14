import { Request, Response } from "express";
import { dishRepository } from "../repositories/dish.repository";
import { ApiResponse, MenuItem } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const getMenu = asyncHandler(async (req: Request, res: Response<ApiResponse<MenuItem[]>>) => {
  const { category, search } = req.query;
  let menu = await dishRepository.getAll();

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
});

export const getDishById = asyncHandler(async (req: Request, res: Response<ApiResponse<MenuItem>>) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid dish ID" });
  }

  const dish = await dishRepository.getById(id);
  if (!dish) {
    return res.status(404).json({ success: false, error: "Dish not found" });
  }

  res.json({ success: true, data: dish });
});

export const createDish = asyncHandler(async (req: Request, res: Response<ApiResponse<MenuItem>>) => {
  const { name, category, tag, price, rating, desc, description, image, imageUrl, imageMediaId, isAvailable } = req.body;

  const newDish = await dishRepository.create({
    name,
    category,
    tag: tag || "Desi Special",
    price,
    rating: rating || "5.0",
    desc: desc || description || "Authentic Pakistani delicacy cooked in pure desi ghee.",
    image: image || imageUrl || "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    imageMediaId,
    isAvailable: isAvailable !== undefined ? isAvailable : true,
  });

  res.status(201).json({
    success: true,
    message: "New dish added to Pehalwan Karahi menu!",
    data: newDish,
  });
});

export const updateDish = asyncHandler(async (req: Request, res: Response<ApiResponse<MenuItem>>) => {
  const id = parseInt(String(req.params.id), 10);
  if (isNaN(id)) {
    return res.status(400).json({ success: false, error: "Invalid dish ID" });
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
});

export const deleteDish = asyncHandler(async (req: Request, res: Response<ApiResponse<{ id: number }>>) => {
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
});
