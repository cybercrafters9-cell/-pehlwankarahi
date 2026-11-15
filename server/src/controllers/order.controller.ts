import { Request, Response } from "express";
import { dishRepository } from "../repositories/dish.repository";
import { orderRepository } from "../repositories/order.repository";
import { loyaltyRepository } from "../repositories/loyalty.repository";
import { settingsRepository } from "../repositories/settings.repository";
import { ApiResponse, Order, OrderItem } from "../types";
import { asyncHandler } from "../middleware/asyncHandler";

export const createOrder = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Order>>) => {
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

    for (const item of items as { id: number; qty: number; portion?: "1kg" | "half" }[]) {
      const dish = await dishRepository.getById(item.id);
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

      const isHalf = item.portion === "half";
      const unitPrice = isHalf ? Math.round(dish.price / 2) : dish.price;
      const itemName = isHalf ? `${dish.name} (Half KG)` : `${dish.name} (1 KG)`;

      resolvedItems.push({
        id: dish.id,
        name: itemName,
        price: unitPrice,
        qty: item.qty,
        image: dish.image,
      });

      subtotal += unitPrice * item.qty;
    }

    const settings = await settingsRepository.get();
    if (settings.isAcceptingOrders === false) {
      return res.status(400).json({
        success: false,
        error: `We are currently closed for online orders. Please call ${settings.phone} to place an advance order.`,
      });
    }

    if (typeof settings.minOrder === "number" && subtotal < settings.minOrder) {
      return res.status(400).json({
        success: false,
        error: `Order minimum is Rs. ${settings.minOrder}. Current subtotal is Rs. ${subtotal}.`,
      });
    }

    const freeThreshold = settings.freeDeliveryThreshold ?? 0;
    const baseDeliveryFee = typeof settings.deliveryFee === "number" ? settings.deliveryFee : 0;
    const deliveryFee = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : baseDeliveryFee;

    // Check if customer has active VIP Loyalty pass (15% discount)
    let discount = 0;
    if (loyaltyPhone) {
      const pass = await loyaltyRepository.getByPhone(loyaltyPhone);
      if (pass) {
        discount = Math.round(subtotal * (pass.discountPercent / 100));
      }
    }

    const total = Math.max(0, subtotal + deliveryFee - discount);
    const paymentStatus = paymentMethod === "cod" || !transactionId ? "pending" : "paid";

    const newOrder = await orderRepository.create({
      customerName: customerName || "Guest Foodie",
      customerPhone: customerPhone || "0300-0000000",
      address: address || "Dine-in / Takeaway / Fast Delivery",
      items: resolvedItems,
      subtotal,
      deliveryFee,
      discount,
      total,
      spiceLevel: spiceLevel || "Chatpata Desi",
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
  }
);

export const getOrders = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Order[]>>) => {
    const orders = await orderRepository.getAll();
    res.json({
      success: true,
      message: `Retrieved ${orders.length} orders`,
      data: orders,
    });
  }
);

export const getOrderById = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Order>>) => {
    const id = String(req.params.id);
    const order = await orderRepository.getById(id);

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
  }
);

export const updateOrderStatus = asyncHandler(
  async (req: Request, res: Response<ApiResponse<Order>>) => {
    const id = String(req.params.id);
    const { status } = req.body;

    const updated = await orderRepository.updateStatus(id, status);
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
  }
);
