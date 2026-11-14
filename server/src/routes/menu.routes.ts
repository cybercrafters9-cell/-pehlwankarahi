import { Router } from "express";
import {
  getMenu,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
} from "../controllers/menu.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", getMenu);
router.get("/:id", getDishById);
router.post("/", requireAuth, createDish);
router.put("/:id", requireAuth, updateDish);
router.delete("/:id", requireAuth, deleteDish);

export default router;
