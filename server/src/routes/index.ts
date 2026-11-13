import { Router } from "express";
import menuRoutes from "./menu.routes";
import orderRoutes from "./order.routes";
import reservationRoutes from "./reservation.routes";
import loyaltyRoutes from "./loyalty.routes";
import settingsRoutes from "./settings.routes";
import statsRoutes from "./stats.routes";
import authRoutes from "./auth.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/menu", menuRoutes);
router.use("/orders", orderRoutes);
router.use("/reservations", reservationRoutes);
router.use("/loyalty", loyaltyRoutes);
router.use("/settings", settingsRoutes);
router.use("/stats", statsRoutes);

export default router;
