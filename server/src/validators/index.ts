import { z } from "zod";
import { OrderStatus, PaymentMethod, ReservationStatus } from "../types";

// --- Common Validators ---
export const pakistaniPhoneRegex = /^03\d{2}-?\d{7}$/;

export const pakistaniMobilePhoneSchema = z
  .string()
  .trim()
  .regex(
    pakistaniPhoneRegex,
    "Invalid Pakistani mobile number. Format must be 03XX-XXXXXXX or 03XXXXXXXXX"
  );

export const normalizePhone = (phone?: string | null): string => {
  if (!phone) return "";
  return phone.replace(/[-\s]/g, "").trim();
};

export const priceSchema = z
  .union([
    z.number(),
    z
      .string()
      .trim()
      .regex(/^\d+(\.\d+)?$/, "Price must be a valid number")
      .transform(Number),
  ])
  .pipe(
    z
      .number()
      .positive("Price must be greater than 0")
      .max(500000, "Price exceeds maximum allowed limit (500,000)")
  );

export const imageUrlSchema = z
  .string()
  .trim()
  .max(1000, "Image URL must not exceed 1000 characters");

export const categoryFieldSchema = z.union([
  z.string().trim().min(1, "Category cannot be empty"),
  z.number().positive(),
]);

export const createCategorySchema = z
  .object({
    name: z.string().trim().min(1, "Name is required").max(100),
    slug: z.string().trim().max(100).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  })
  .strip();

export const updateCategorySchema = z
  .object({
    name: z.string().trim().min(1).max(100).optional(),
    slug: z.string().trim().max(100).optional(),
    sortOrder: z.number().int().optional(),
    isActive: z.boolean().optional(),
  })
  .strip();

export const reorderSchema = z
  .object({
    ids: z.array(z.number().int()),
  })
  .strip();

// --- Dish Schemas ---
export const createDishSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must not exceed 100 characters"),
    category: categoryFieldSchema,
    tag: z
      .string()
      .trim()
      .min(1, "Tag cannot be empty")
      .max(60, "Tag must not exceed 60 characters")
      .optional(),
    price: priceSchema,
    rating: z
      .string()
      .trim()
      .min(1, "Rating cannot be empty")
      .max(10, "Rating must not exceed 10 characters")
      .optional(),
    desc: z
      .string()
      .trim()
      .min(1, "Description cannot be empty")
      .max(500, "Description must not exceed 500 characters")
      .optional(),
    image: imageUrlSchema.optional(),
    imageUrl: imageUrlSchema.optional(),
    imageMediaId: z.number().int().positive().nullable().optional(),
    isAvailable: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
  .strip();

export const updateDishSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name cannot be empty")
      .max(100, "Name must not exceed 100 characters")
      .optional(),
    category: categoryFieldSchema.optional(),
    tag: z
      .string()
      .trim()
      .min(1, "Tag cannot be empty")
      .max(60, "Tag must not exceed 60 characters")
      .optional(),
    price: priceSchema.optional(),
    rating: z
      .string()
      .trim()
      .min(1, "Rating cannot be empty")
      .max(10, "Rating must not exceed 10 characters")
      .optional(),
    desc: z
      .string()
      .trim()
      .min(1, "Description cannot be empty")
      .max(500, "Description must not exceed 500 characters")
      .optional(),
    image: imageUrlSchema.optional(),
    imageUrl: imageUrlSchema.optional(),
    imageMediaId: z.number().int().positive().nullable().optional(),
    isAvailable: z.boolean().optional(),
    sortOrder: z.number().int().optional(),
  })
  .strip();

// --- Auth Schemas ---
export const loginSchema = z
  .object({
    username: z
      .string()
      .trim()
      .min(1, "Username or Email is required")
      .max(100, "Username must not exceed 100 characters"),
    password: z
      .string()
      .min(1, "Password is required")
      .max(100, "Password must not exceed 100 characters"),
  })
  .strip();

export const updateCredentialsSchema = z
  .object({
    currentPassword: z.string().min(1, "Current password is required"),
    newPassword: z
      .string()
      .trim()
      .min(8, "New password must be at least 8 characters long")
      .max(100, "New password must not exceed 100 characters")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    newUsername: z
      .string()
      .trim()
      .min(1, "Username cannot be empty")
      .max(50, "Username must not exceed 50 characters")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    newEmail: z
      .string()
      .trim()
      .email("Invalid email address format")
      .max(100, "Email must not exceed 100 characters")
      .optional()
      .or(z.literal("").transform(() => undefined)),
    newName: z
      .string()
      .trim()
      .min(1, "Name cannot be empty")
      .max(100, "Name must not exceed 100 characters")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .strip();

// --- Reservation Schemas ---
export const reservationStatusEnum = z.enum([
  "confirmed",
  "completed",
  "cancelled",
] as const satisfies readonly [ReservationStatus, ...ReservationStatus[]]);

export const createReservationSchema = z
  .object({
    name: z
      .string()
      .trim()
      .min(1, "Name is required")
      .max(100, "Name must not exceed 100 characters"),
    phone: pakistaniMobilePhoneSchema,
    guests: z
      .string()
      .trim()
      .min(1, "Guests cannot be empty")
      .max(100, "Guests must not exceed 100 characters")
      .optional(),
    timeSlot: z
      .string()
      .trim()
      .min(1, "Time slot cannot be empty")
      .max(100, "Time slot must not exceed 100 characters")
      .optional(),
  })
  .strip();

export const updateReservationStatusSchema = z
  .object({
    status: reservationStatusEnum,
  })
  .strip();

// --- Order Schemas ---
export const orderStatusEnum = z.enum([
  "preparing",
  "cooking_in_wok",
  "out_for_delivery",
  "delivered",
  "cancelled",
] as const satisfies readonly [OrderStatus, ...OrderStatus[]]);

export const updateOrderStatusSchema = z
  .object({
    status: orderStatusEnum,
  })
  .strip();

export const paymentMethodEnum = z.enum([
  "cod",
  "easypaisa",
  "jazzcash",
] as const satisfies readonly [PaymentMethod, ...PaymentMethod[]]);

export const createOrderItemInputSchema = z
  .object({
    id: z.number().int("Dish ID must be an integer").positive("Dish ID must be positive"),
    qty: z
      .number()
      .int("Quantity must be an integer")
      .min(1, "Quantity must be at least 1")
      .max(20, "Quantity must not exceed 20"),
  })
  .strip();

export const orderItemSchema = createOrderItemInputSchema;

export const orderItemsInputSchema = z
  .array(createOrderItemInputSchema)
  .min(1, "Cart cannot be empty. Please add items to your Dastarkhwan.")
  .max(30, "Cannot order more than 30 item lines.")
  .transform((items) => {
    const merged = new Map<number, number>();
    for (const item of items) {
      const current = merged.get(item.id) ?? 0;
      merged.set(item.id, Math.min(20, current + item.qty));
    }
    return Array.from(merged.entries()).map(([id, qty]) => ({ id, qty }));
  });

export const createOrderSchema = z
  .object({
    customerName: z
      .string()
      .trim()
      .max(100, "Customer name must not exceed 100 characters")
      .optional(),
    customerPhone: z
      .string()
      .trim()
      .regex(
        pakistaniPhoneRegex,
        "Invalid Pakistani mobile number. Format must be 03XX-XXXXXXX or 03XXXXXXXXX"
      )
      .optional(),
    address: z
      .string()
      .trim()
      .max(300, "Address must not exceed 300 characters")
      .optional(),
    items: orderItemsInputSchema,
    spiceLevel: z
      .string()
      .trim()
      .max(50, "Spice level must not exceed 50 characters")
      .optional(),
    notes: z
      .string()
      .trim()
      .max(300, "Notes must not exceed 300 characters")
      .optional(),
    loyaltyPhone: pakistaniMobilePhoneSchema
      .transform(normalizePhone)
      .optional()
      .or(z.literal("").transform(() => undefined)),
    paymentMethod: paymentMethodEnum.optional().default("cod"),
    transactionId: z
      .string()
      .trim()
      .max(100, "Transaction ID must not exceed 100 characters")
      .optional(),
  })
  .strip();

// --- Settings Schemas ---
export const updateSettingsSchema = z
  .object({
    restaurantName: z
      .string()
      .trim()
      .min(1, "Restaurant name cannot be empty")
      .max(100, "Restaurant name must not exceed 100 characters")
      .optional(),
    name: z
      .string()
      .trim()
      .min(1, "Restaurant name cannot be empty")
      .max(100, "Restaurant name must not exceed 100 characters")
      .optional(),
    tagline: z
      .string()
      .trim()
      .max(200, "Tagline must not exceed 200 characters")
      .optional(),
    description: z
      .string()
      .trim()
      .max(500, "Description must not exceed 500 characters")
      .optional(),
    phone: z
      .string()
      .trim()
      .max(50, "Phone must not exceed 50 characters")
      .optional(),
    whatsapp: z
      .string()
      .trim()
      .max(50, "WhatsApp must not exceed 50 characters")
      .optional(),
    landline: z
      .string()
      .trim()
      .max(50, "Landline must not exceed 50 characters")
      .optional(),
    email: z
      .string()
      .trim()
      .email("Invalid email format")
      .max(100, "Email must not exceed 100 characters")
      .optional(),
    address: z
      .string()
      .trim()
      .max(300, "Address must not exceed 300 characters")
      .optional(),
    branches: z
      .array(
        z
          .string()
          .trim()
          .min(1, "Branch name cannot be empty")
          .max(150, "Branch name must not exceed 150 characters")
      )
      .max(20, "Cannot have more than 20 branches")
      .optional(),
    timings: z
      .string()
      .trim()
      .max(100, "Timings must not exceed 100 characters")
      .optional(),
    openingTime: z
      .string()
      .trim()
      .max(50, "Opening time must not exceed 50 characters")
      .optional(),
    closingTime: z
      .string()
      .trim()
      .max(50, "Closing time must not exceed 50 characters")
      .optional(),
    deliveryFee: z
      .union([
        z.number(),
        z
          .string()
          .trim()
          .regex(/^\d+$/, "Delivery fee must be a valid number")
          .transform(Number),
      ])
      .pipe(
        z
          .number()
          .min(0, "Delivery fee cannot be negative")
          .max(10000, "Delivery fee must not exceed 10,000")
      )
      .optional(),
    minOrder: z
      .union([
        z.number(),
        z
          .string()
          .trim()
          .regex(/^\d+$/, "Minimum order must be a valid number")
          .transform(Number),
      ])
      .pipe(
        z
          .number()
          .min(0, "Minimum order cannot be negative")
          .max(100000, "Minimum order must not exceed 100,000")
      )
      .optional(),
    deliveryEstimate: z
      .string()
      .trim()
      .max(50, "Delivery estimate must not exceed 50 characters")
      .optional(),
    freeDeliveryThreshold: z
      .union([
        z.number(),
        z
          .string()
          .trim()
          .regex(/^\d+$/, "Free delivery threshold must be a valid number")
          .transform(Number),
      ])
      .pipe(
        z
          .number()
          .min(0, "Free delivery threshold cannot be negative")
          .max(100000, "Free delivery threshold must not exceed 100,000")
      )
      .optional(),
    announcement: z
      .string()
      .trim()
      .max(300, "Announcement must not exceed 300 characters")
      .optional(),
    announcementText: z
      .string()
      .trim()
      .max(300, "Announcement must not exceed 300 characters")
      .optional(),
    announcementEnabled: z.boolean().optional(),
    isLiveWokActive: z.boolean().optional(),
    isAcceptingOrders: z.boolean().optional(),
    easypaisaNumber: z
      .string()
      .trim()
      .max(50, "Easypaisa number must not exceed 50 characters")
      .optional(),
    jazzcashNumber: z
      .string()
      .trim()
      .max(50, "JazzCash number must not exceed 50 characters")
      .optional(),
    paymentAccountTitle: z
      .string()
      .trim()
      .max(255, "Payment account title must not exceed 255 characters")
      .optional(),
  })
  .strip();

// --- Loyalty Schemas ---
export const activateLoyaltySchema = z
  .object({
    phone: pakistaniMobilePhoneSchema.transform(normalizePhone),
    name: z
      .string()
      .trim()
      .max(100, "Name must not exceed 100 characters")
      .optional()
      .or(z.literal("").transform(() => undefined)),
  })
  .strip();
