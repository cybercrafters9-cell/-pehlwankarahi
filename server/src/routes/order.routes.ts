import { Router } from "express";
import {
  createOrder,
  getOrders,
  getOrderById,
  updateOrderStatus,
} from "../controllers/order.controller";
import { requireAuth } from "../middleware/requireAuth";
import { validate } from "../middleware/validate";
import { submissionLimiter } from "../middleware/rateLimiter";
import { createOrderSchema, updateOrderStatusSchema } from "../validators";

const router = Router();

router.post("/", submissionLimiter, validate(createOrderSchema), createOrder);
router.get("/", requireAuth, getOrders);
router.get("/:id", requireAuth, getOrderById);
router.patch("/:id/status", requireAuth, validate(updateOrderStatusSchema), updateOrderStatus);

export default router;
