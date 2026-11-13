import { Router } from "express";
import {
  getMenu,
  getDishById,
  createDish,
  updateDish,
  deleteDish,
} from "../controllers/menu.controller";

const router = Router();

router.get("/", getMenu);
router.get("/:id", getDishById);
router.post("/", createDish);
router.put("/:id", updateDish);
router.delete("/:id", deleteDish);

export default router;
