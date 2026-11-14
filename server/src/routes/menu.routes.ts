import { Router } from "express";
import {
  getMenu,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
} from "../controllers/menu.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { createDishSchema, updateDishSchema } from "../validators";

const router = Router();

router.get("/", getMenu);
router.get("/:id", getDishById);
router.post("/", requireAuth, validate(createDishSchema), createDish);
router.put("/:id", requireAuth, validate(updateDishSchema), updateDish);
router.delete("/:id", requireAuth, deleteDish);

export default router;
