import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, Order, OrderItem } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const createOrder = asyncHandler((req: Request, res: Response<ApiResponse<Order>>) => {
  const {
    customerName,
    customerPhone,
    address,
    items,
    spiceLevel,
    notes,
    loyaltyPhone,
    paymentMethod,
    transactionId,
  } = req.body;

  const resolvedItems: OrderItem[] = [];
  let subtotal = 0;

  for (const item of items as { id: number; qty: number }[]) {
    const dish = db.getDishById(item.id);
    if (!dish) {
      return res.status(400).json({
        success: false,
        error: `Dish #${item.id} not found in menu`,
      });
    }
    if (dish.isAvailable === false) {
      return res.status(400).json({
        success: false,
        error: `Dish "${dish.name}" is currently unavailable`,
      });
    }

    resolvedItems.push({
      id: dish.id,
      name: dish.name,
      price: dish.price,
      qty: item.qty,
      image: dish.image,
    });

    subtotal += dish.price * item.qty;
  }

  const settings = db.getSettings();
  if (typeof settings.minOrder === "number" && subtotal < settings.minOrder) {
    return res.status(400).json({
      success: false,
      error: `Order minimum is Rs. ${settings.minOrder}. Current subtotal is Rs. ${subtotal}.`,
    });
  }

  const deliveryFee = typeof settings.deliveryFee === "number" ? settings.deliveryFee : 0;

  // Check if customer has active VIP Loyalty pass (15% discount)
  let discount = 0;
  if (loyaltyPhone) {
    const pass = db.getLoyalty(loyaltyPhone);
    if (pass) {
      discount = Math.round(subtotal * (pass.discountPercent / 100));
    }
  }

  const total = Math.max(0, subtotal + deliveryFee - discount);

  const paymentStatus = paymentMethod === "cod" || !transactionId ? "pending" : "paid";

  const newOrder = db.createOrder({
    customerName: customerName || "Guest Foodie",
    customerPhone: customerPhone || "0300-0000000",
    address: address || "Dine-in / Takeaway / Fast Delivery",
    items: resolvedItems,
    subtotal,
    deliveryFee,
    discount,
    total,
    spiceLevel: spiceLevel || "Chatpata Desi",
    status: "preparing",
    paymentMethod: paymentMethod || "cod",
    paymentStatus,
    transactionId: transactionId || undefined,
    estimatedDeliveryMins: 28,
    notes,
  });

  res.status(201).json({
    success: true,
    message: `Order #${newOrder.id} dispatched to live wok & tandoor!`,
    data: newOrder,
  });
});

export const getOrders = asyncHandler((req: Request, res: Response<ApiResponse<Order[]>>) => {
  const orders = db.getOrders();
  res.json({
    success: true,
    message: `Retrieved ${orders.length} orders`,
    data: orders,
  });
});

export const getOrderById = asyncHandler((req: Request, res: Response<ApiResponse<Order>>) => {
  const id = String(req.params.id);
  const order = db.getOrderById(id);

  if (!order) {
    return res.status(404).json({
      success: false,
      error: `Order #${id} not found`,
    });
  }

  res.json({
    success: true,
    data: order,
  });
});

export const updateOrderStatus = asyncHandler((req: Request, res: Response<ApiResponse<Order>>) => {
  const id = String(req.params.id);
  const { status } = req.body;

  const updated = db.updateOrderStatus(id, status);
  if (!updated) {
    return res.status(404).json({
      success: false,
      error: `Order #${id} not found`,
    });
  }

  res.json({
    success: true,
    message: `Order #${id} status updated to ${status}`,
    data: updated,
  });
});
