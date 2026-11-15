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
import { getSiteContent, updateSiteSlot } from "../controllers/siteSlot.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { updateSiteSlotSchema } from "../validators";

const router = Router();

router.get("/site-content", getSiteContent);
router.get("/admin/site-slots", requireAuth, getSiteContent);
router.put(
  "/admin/site-slots/:key",
  requireAuth,
  validate(updateSiteSlotSchema),
  updateSiteSlot
);

router.use("/auth", authRoutes);
router.use("/categories", categoryRoutes);
router.use("/admin/categories", categoryRoutes);
router.use("/menu", menuRoutes);
router.use("/admin/menu", menuRoutes);
router.use("/orders", orderRoutes);
router.use("/reservations", reservationRoutes);
router.use("/loyalty", loyaltyRoutes);
router.use("/settings", settingsRoutes);
router.use("/admin/settings", settingsRoutes);
router.use("/stats", statsRoutes);
router.use("/media", mediaRoutes);
router.use("/admin/media", mediaRoutes);

export default router;
