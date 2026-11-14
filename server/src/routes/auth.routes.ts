import { Router } from "express";
import { login, verifySession, updateCredentials } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { authLimiter } from "../middleware/rateLimiter";
import { loginSchema, updateCredentialsSchema } from "../validators";

const router = Router();

router.post("/login", authLimiter, validate(loginSchema), login);
router.get("/verify", requireAuth, verifySession);
router.put("/credentials", requireAuth, validate(updateCredentialsSchema), updateCredentials);

export default router;
