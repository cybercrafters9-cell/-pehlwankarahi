import { Router } from "express";
import menuRoutes from "./menu.routes";
import orderRoutes from "./order.routes";
import reservationRoutes from "./reservation.routes";
import loyaltyRoutes from "./loyalty.routes";
import settingsRoutes from "./settings.routes";
import statsRoutes from "./stats.routes";
import authRoutes from "./auth.routes";
import mediaRoutes from "./media.routes";
import categoryRoutes from "./category.routes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/admin/categories", categoryRoutes);
router.use("/menu", menuRoutes);
router.use("/admin/menu", menuRoutes);
router.use("/orders", orderRoutes);
router.use("/reservations", reservationRoutes);
router.use("/loyalty", loyaltyRoutes);
router.use("/settings", settingsRoutes);
router.use("/stats", statsRoutes);
router.use("/media", mediaRoutes);
router.use("/admin/media", mediaRoutes);

export default router;
