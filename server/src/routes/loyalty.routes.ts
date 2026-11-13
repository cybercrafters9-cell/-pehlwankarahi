import { Router } from "express";
import { activatePass, getPass } from "../controllers/loyalty.controller";

const router = Router();

router.post("/activate", activatePass);
router.get("/:phone", getPass);

export default router;
