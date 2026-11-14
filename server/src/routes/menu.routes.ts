import { Router } from "express";
import {
  getMenu,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
  toggleAvailability,
  reorderDishes,
} from "../controllers/menu.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import {
  createDishSchema,
  updateDishSchema,
  reorderSchema,
} from "../validators";

const router = Router();

router.get("/", getMenu);
router.put("/reorder", requireAuth, validate(reorderSchema), reorderDishes);
router.patch("/:id/toggle-availability", requireAuth, toggleAvailability);
router.get("/:id", getDishById);
router.post("/", requireAuth, validate(createDishSchema), createDish);
router.put("/:id", requireAuth, validate(updateDishSchema), updateDish);
router.delete("/:id", requireAuth, deleteDish);

export default router;
