import { Router } from "express";
import {
  createReservation,
  getReservations,
  getReservationById,
  updateReservationStatus,
} from "../controllers/reservation.controller";

const router = Router();

router.post("/", createReservation);
router.get("/", getReservations);
router.get("/:id", getReservationById);
router.patch("/:id/status", updateReservationStatus);

export default router;
