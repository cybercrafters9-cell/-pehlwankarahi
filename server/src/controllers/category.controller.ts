import { Request, Response } from "express";
import { categoryRepository, CategoryRecord } from "../repositories/category.repository";
import { ApiResponse } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const getCategories = asyncHandler(
  async (req: Request, res: Response<ApiResponse<CategoryRecord[]>>) => {
    const activeOnly = req.query.activeOnly === "true";
    const categories = await categoryRepository.getAll(activeOnly);
    res.json({
      success: true,
      data: categories,
    });
  }
);

export const getCategoryById = asyncHandler(
  async (req: Request, res: Response<ApiResponse<CategoryRecord>>) => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid category ID" });
    }

    const category = await categoryRepository.getById(id);
    if (!category) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    res.json({ success: true, data: category });
  }
);

export const createCategory = asyncHandler(
  async (req: Request, res: Response<ApiResponse<CategoryRecord>>) => {
    const { name, slug, sortOrder, isActive } = req.body;
    if (!name || typeof name !== "string") {
      return res.status(400).json({ success: false, error: "Category name is required" });
    }

    const generatedSlug = (slug || name)
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");

    const existing = await categoryRepository.getBySlug(generatedSlug);
    if (existing) {
      return res.status(400).json({
        success: false,
        error: `Category with slug "${generatedSlug}" already exists`,
      });
    }

    const created = await categoryRepository.create({
      name: name.trim(),
      slug: generatedSlug,
      sortOrder: typeof sortOrder === "number" ? sortOrder : 0,
      isActive: isActive !== false,
    });

    res.status(201).json({
      success: true,
      message: "Category created successfully",
      data: created,
    });
  }
);

export const updateCategory = asyncHandler(
  async (req: Request, res: Response<ApiResponse<CategoryRecord>>) => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid category ID" });
    }

    if (req.body.slug) {
      const existing = await categoryRepository.getBySlug(req.body.slug);
      if (existing && existing.id !== id) {
        return res.status(409).json({
          success: false,
          error: `Category with slug "${req.body.slug}" already exists`,
        });
      }
    }

    try {
      const updated = await categoryRepository.update(id, req.body);
      if (!updated) {
        return res.status(404).json({ success: false, error: "Category not found" });
      }

      res.json({
        success: true,
        message: `Category #${id} updated successfully`,
        data: updated,
      });
    } catch (err: unknown) {
      const dbErr = err as { code?: string; errno?: number };
      if (dbErr?.code === "ER_DUP_ENTRY" || dbErr?.errno === 1062) {
        return res.status(409).json({
          success: false,
          error: `Category with slug "${req.body.slug}" already exists`,
        });
      }
      throw err;
    }
  }
);

export const deleteCategory = asyncHandler(
  async (req: Request, res: Response<ApiResponse<{ id: number }>>) => {
    const id = parseInt(String(req.params.id), 10);
    if (isNaN(id)) {
      return res.status(400).json({ success: false, error: "Invalid category ID" });
    }

    const dishCount = await categoryRepository.countDishes(id);
    if (dishCount > 0) {
      return res.status(409).json({
        success: false,
        error: `Cannot delete category containing ${dishCount} dish(es). Reassign or delete dishes first.`,
      });
    }

    const deleted = await categoryRepository.delete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: "Category not found" });
    }

    res.json({
      success: true,
      message: `Category #${id} deleted successfully`,
      data: { id },
    });
  }
);

export const reorderCategories = asyncHandler(
  async (req: Request, res: Response<ApiResponse<void>>) => {
    const { ids } = req.body;
    if (!Array.isArray(ids) || ids.some((id) => typeof id !== "number")) {
      return res.status(400).json({
        success: false,
        error: "Array of numeric category IDs is required in 'ids' body field",
      });
    }

    await categoryRepository.reorder(ids);
    res.json({
      success: true,
      message: "Categories reordered successfully",
    });
  }
);
