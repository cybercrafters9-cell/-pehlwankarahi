import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, MenuItem } from "../types";
import { getErrorMessage } from "../middleware/errorHandler";

export const getMenu = (req: Request, res: Response<ApiResponse<MenuItem[]>>) => {
  try {
    const { category, search } = req.query;
    let menu = db.getMenu();

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
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to fetch menu items"),
    });
  }
};

export const getDishById = (req: Request, res: Response<ApiResponse<MenuItem>>) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid dish ID" });
    }

    const dish = db.getDishById(id);
    if (!dish) {
      return res.status(404).json({ success: false, error: "Dish not found" });
    }

    res.json({ success: true, data: dish });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Error fetching dish"),
    });
  }
};

export const createDish = (req: Request, res: Response<ApiResponse<MenuItem>>) => {
  try {
    const { name, category, tag, price, rating, desc, image, isAvailable } = req.body;

    if (!name || !category || !price) {
      return res.status(400).json({
        success: false,
        error: "Name, category, and price are required",
      });
    }

    const newDish = db.addDish({
      name,
      category,
      tag: tag || "Desi Special",
      price: Number(price),
      rating: rating || "5.0",
      desc: desc || "Authentic Pakistani delicacy cooked in pure desi ghee.",
      image: image || "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
      isAvailable: isAvailable !== undefined ? Boolean(isAvailable) : true,
    });

    res.status(201).json({
      success: true,
      message: "New dish added to Pehalwan Karahi menu!",
      data: newDish,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to create dish"),
    });
  }
};

export const updateDish = (req: Request, res: Response<ApiResponse<MenuItem>>) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid dish ID" });
    }

    const updates = req.body;
    if (updates.price) updates.price = Number(updates.price);

    const updated = db.updateDish(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: "Dish not found" });
    }

    res.json({
      success: true,
      message: `Updated dish #${id} (${updated.name})`,
      data: updated,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to update dish"),
    });
  }
};

export const deleteDish = (req: Request, res: Response<ApiResponse<{ id: number }>>) => {
  try {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid dish ID" });
    }

    const deleted = db.deleteDish(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Dish not found" });
    }

    res.json({
      success: true,
      message: `Dish #${id} deleted successfully from menu`,
      data: { id },
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to delete dish"),
    });
  }
};
