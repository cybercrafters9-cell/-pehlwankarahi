import { Router } from "express";
import {
  uploadSingleFile,
  uploadMedia,
  serveMedia,
  cleanupMedia,
} from "../controllers/media.controller";
import { requireAuth } from "../middleware/requireAuth";
import { mediaUploadLimiter } from "../middleware/rateLimiter";

const router = Router();

// Public media serve route (also mounted directly on app before global rate limiter)
router.get("/:id", serveMedia);

// Authenticated media upload route
router.post(
  "/",
  requireAuth,
  mediaUploadLimiter,
  uploadSingleFile,
  uploadMedia
);

// Authenticated orphan cleanup route
router.post("/cleanup", requireAuth, cleanupMedia);

export default router;
