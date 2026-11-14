import { Router } from "express";
import { getSettings, updateSettings } from "../controllers/settings.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { updateSettingsSchema } from "../validators";

const router = Router();

router.get("/", getSettings);
router.put("/", requireAuth, validate(updateSettingsSchema), updateSettings);

export default router;
