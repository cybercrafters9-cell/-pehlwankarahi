import { Router } from "express";
import { activatePass, getPass } from "../controllers/loyalty.controller";
import { validate } from "../middleware/validate";
import { submissionLimiter } from "../middleware/rateLimiter";
import { activateLoyaltySchema } from "../validators";

const router = Router();

router.post("/activate", submissionLimiter, validate(activateLoyaltySchema), activatePass);
router.get("/:phone", getPass);

export default router;
