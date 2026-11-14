import { Router } from "express";
import {
  createReservation,
  getReservations,
  getReservationById,
  updateReservationStatus,
} from "../controllers/reservation.controller";
import { requireAuth } from "../middleware/requireAuth";

const router = Router();

router.post("/", createReservation);
router.get("/", requireAuth, getReservations);
router.get("/:id", requireAuth, getReservationById);
router.patch("/:id/status", requireAuth, updateReservationStatus);

export default router;
