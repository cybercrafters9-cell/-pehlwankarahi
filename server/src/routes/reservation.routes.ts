import { Router } from "express";
import {
  createReservation,
  getReservations,
  getReservationById,
  updateReservationStatus,
} from "../controllers/reservation.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { submissionLimiter } from "../middleware/rateLimiter";
import {
  createReservationSchema,
  updateReservationStatusSchema,
} from "../validators";

const router = Router();

router.post("/", submissionLimiter, validate(createReservationSchema), createReservation);
router.get("/", requireAuth, getReservations);
router.get("/:id", requireAuth, getReservationById);
router.patch("/:id/status", requireAuth, validate(updateReservationStatusSchema), updateReservationStatus);

export default router;
