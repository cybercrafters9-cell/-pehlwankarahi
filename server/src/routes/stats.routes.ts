import { Router } from "express";
import { getStats } from "../controllers/stats.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.get("/", requireAuth, getStats);

export default router;
