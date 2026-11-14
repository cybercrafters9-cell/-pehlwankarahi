import { Router } from "express";
import {
  getCategories,
  getCategoryById,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from "../controllers/category.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import {
  createCategorySchema,
  updateCategorySchema,
  reorderSchema,
} from "../validators";

const router = Router();

router.get("/", getCategories);
router.put("/reorder", requireAuth, validate(reorderSchema), reorderCategories);
router.get("/:id", getCategoryById);
router.post("/", requireAuth, validate(createCategorySchema), createCategory);
router.put("/:id", requireAuth, validate(updateCategorySchema), updateCategory);
router.delete("/:id", requireAuth, deleteCategory);

export default router;
