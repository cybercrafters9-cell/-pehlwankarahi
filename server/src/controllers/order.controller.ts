import { Request, Response } from "express";
import { db } from "../data/db";
import { ApiResponse, Order, OrderItem } from "../types";
import { getErrorMessage } from "../middleware/errorHandler";

export const createOrder = (req: Request, res: Response<ApiResponse<Order>>) => {
  try {
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

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: "Cart is empty. Please add items to your Dastarkhwan.",
      });
    }

    const subtotal = items.reduce(
      (sum: number, item: OrderItem) => sum + (item.price || 0) * (item.qty || 1),
      0
    );

    // Free delivery promotion
    const deliveryFee = 0;

    // Check if customer has active VIP Loyalty pass (15% discount)
    let discount = 0;
    if (loyaltyPhone) {
      const pass = db.getLoyalty(loyaltyPhone);
      if (pass) {
        discount = Math.round(subtotal * (pass.discountPercent / 100));
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);

    const newOrder = db.createOrder({
      customerName: customerName || "Guest Foodie",
      customerPhone: customerPhone || "0300-0000000",
      address: address || "Dine-in / Takeaway / Fast Delivery",
      items,
      subtotal,
      deliveryFee,
      discount,
      total,
      spiceLevel: spiceLevel || "Chatpata Desi",
      status: "preparing",
      paymentMethod: paymentMethod || "cod",
      paymentStatus: paymentMethod === "cod" ? "pending" : "pending",
      transactionId: transactionId || undefined,
      estimatedDeliveryMins: 28,
      notes,
    });

    res.status(201).json({
      success: true,
      message: `Order #${newOrder.id} dispatched to live wok & tandoor!`,
      data: newOrder,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to process order"),
    });
  }
};

export const getOrders = (req: Request, res: Response<ApiResponse<Order[]>>) => {
  try {
    const orders = db.getOrders();
    res.json({
      success: true,
      message: `Retrieved ${orders.length} orders`,
      data: orders,
    });
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to fetch orders"),
    });
  }
};

export const getOrderById = (req: Request, res: Response<ApiResponse<Order>>) => {
  try {
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
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Error retrieving order"),
    });
  }
};

export const updateOrderStatus = (req: Request, res: Response<ApiResponse<Order>>) => {
  try {
    const id = String(req.params.id);
    const { status } = req.body;

    const validStatuses = [
      "preparing",
      "cooking_in_wok",
      "out_for_delivery",
      "delivered",
      "cancelled",
    ];

    if (!validStatuses.includes(status)) {
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
      });
    }

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
  } catch (error: unknown) {
    res.status(500).json({
      success: false,
      error: getErrorMessage(error, "Failed to update order status"),
    });
  }
};
