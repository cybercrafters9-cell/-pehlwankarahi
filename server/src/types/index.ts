export type CategoryType = string;

export interface MenuItem {
  id: number;
  name: string;
  category: string;
  categoryName?: string;
  tag: string;
  price: number;
  rating: string;
  desc: string;
  image: string;
  imageUrl?: string | null;
  imageMediaId?: number | null;
  isAvailable?: boolean;
}

export interface OrderItem {
  id?: number;
  name: string;
  price: number;
  qty: number;
  image: string;
}

export type OrderStatus =
  | "pending_verification"
  | "preparing"
  | "cooking_in_wok"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentMethod = "cod" | "easypaisa" | "jazzcash" | "bank";

export interface Order {
  id: string; // e.g. "PK-5821"
  customerName?: string;
  customerPhone?: string;
  address?: string;
  items: OrderItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  spiceLevel?: string;
  status: OrderStatus;
  paymentMethod?: PaymentMethod | string;
  paymentStatus?: "pending" | "paid";
  transactionId?: string;
  estimatedDeliveryMins: number;
  notes?: string;
  createdAt: string;
}

export type SeatingType =
  | "2-4 Guests (Indoor Family Hall)"
  | "5-8 Guests (Rooftop Koyla Lawn)"
  | "10+ Guests (Shahi Dera Takht)";

export type ReservationStatus = "confirmed" | "completed" | "cancelled";

export interface Reservation {
  id: string; // e.g. "DAWAT-4091"
  name: string;
  phone: string;
  guests: SeatingType | string;
  timeSlot: string;
  status: ReservationStatus;
  createdAt: string;
}

export interface LoyaltyPass {
  id: string;
  phone: string;
  name?: string;
  tier: "Shahi Member" | "Royal Member";
  bonusPkr: number;
  discountPercent: number;
  freeItem: string;
  activatedAt: string;
}

export interface LoyaltyPassSummary {
  tier: string;
  discountPercent: number;
}

export interface RestaurantSettings {
  restaurantName: string;
  name?: string;
  tagline: string;
  description?: string;
  phone: string;
  whatsapp: string;
  landline: string;
  email: string;
  address: string;
  branches: string[];
  timings: string;
  openingTime?: string;
  closingTime?: string;
  deliveryFee: number;
  minOrder: number;
  deliveryEstimate: string;
  announcement: string;
  announcementText?: string;
  announcementEnabled?: boolean;
  isLiveWokActive: boolean;
  isAcceptingOrders?: boolean;
  freeDeliveryThreshold?: number;
  easypaisaNumber?: string;
  jazzcashNumber?: string;
  paymentAccountTitle?: string;
  bankName?: string;
  bankBranch?: string;
  bankAccountTitle?: string;
  bankAccountNumber?: string;
  bankIban?: string;
  logoUrl?: string;
  faviconUrl?: string;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalReservations: number;
  activeDishesCount: number;
  popularDishes: { name: string; count: number; revenue: number }[];
}

export interface AdminUser {
  id: string;
  username: string;
  email: string;
  password?: string;
  passwordHash?: string;
  name: string;
  role: "superadmin" | "manager";
  lastLogin?: string;
}

export interface AuthSession {
  token: string;
  user: Omit<AdminUser, "password" | "passwordHash">;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  error?: string;
}
