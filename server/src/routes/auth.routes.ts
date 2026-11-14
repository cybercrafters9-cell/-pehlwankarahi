import { Router } from "express";
import { login, verifySession, updateCredentials } from "../controllers/auth.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/login", login);
router.get("/verify", requireAuth, verifySession);
router.put("/credentials", requireAuth, updateCredentials);

export default router;
