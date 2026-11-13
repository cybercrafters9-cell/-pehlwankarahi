import { Router } from "express";
import { login, verifySession, updateCredentials } from "../controllers/auth.controller";

const router = Router();

router.post("/login", login);
router.get("/verify", verifySession);
router.put("/credentials", updateCredentials);

export default router;
