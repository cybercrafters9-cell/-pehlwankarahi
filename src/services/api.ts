import { Dish, CartItem } from "@/data/menu";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5050/api";

export interface CreateOrderPayload {
  customerName?: string;
  customerPhone?: string;
  address?: string;
  items: CartItem[];
  spiceLevel?: string;
  paymentMethod?: "cod" | "easypaisa" | "jazzcash" | string;
  paymentStatus?: "pending" | "paid" | string;
  transactionId?: string;
  notes?: string;
  loyaltyPhone?: string;
}

export interface CreateReservationPayload {
  name: string;
  phone: string;
  guests: string;
  timeSlot: string;
}

export interface RestaurantSettings {
  restaurantName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  landline: string;
  email: string;
  address: string;
  branches: string[];
  timings: string;
  deliveryFee: number;
  minOrder: number;
  deliveryEstimate: string;
  announcement: string;
  isLiveWokActive: boolean;
}

export interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  pendingOrders: number;
  totalReservations: number;
  activeDishesCount: number;
  popularDishes: { name: string; count: number; revenue: number }[];
}

export interface OrderRecord {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  items: CartItem[];
  subtotal: number;
  deliveryFee: number;
  discount: number;
  total: number;
  spiceLevel: string;
  status: "preparing" | "cooking_in_wok" | "out_for_delivery" | "delivered" | "cancelled";
  paymentMethod?: "cod" | "easypaisa" | "jazzcash" | string;
  paymentStatus?: "pending" | "paid" | string;
  transactionId?: string;
  estimatedDeliveryMins: number;
  notes?: string;
  createdAt: string;
}

export interface ReservationRecord {
  id: string;
  name: string;
  phone: string;
  guests: string;
  timeSlot: string;
  status: "confirmed" | "completed" | "cancelled";
  createdAt: string;
}

export const api = {
  // --- Menu ---
  async getMenu(category?: string, search?: string): Promise<Dish[]> {
    try {
      const params = new URLSearchParams();
      if (category && category !== "all") params.append("category", category);
      if (search && search.trim() !== "") params.append("search", search.trim());

      const url = `${API_BASE}/menu${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url, { cache: "no-store" });
      if (!res.ok) throw new Error("Failed to fetch menu");
      const json = await res.json();
      return json.data || [];
    } catch (err) {
      console.warn("[API Service] Could not connect to Express backend for menu:", err);
      throw err;
    }
  },

  async createDish(dish: Omit<Dish, "id">): Promise<Dish> {
    const res = await fetch(`${API_BASE}/menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dish),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to create dish");
    return json.data;
  },

  async updateDish(id: number, updates: Partial<Dish>): Promise<Dish> {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update dish");
    return json.data;
  },

  async deleteDish(id: number): Promise<boolean> {
    const res = await fetch(`${API_BASE}/menu/${id}`, {
      method: "DELETE",
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to delete dish");
    return true;
  },

  // --- Orders ---
  async placeOrder(payload: CreateOrderPayload) {
    const res = await fetch(`${API_BASE}/orders`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Order placement failed");
    return data;
  },

  async getOrders(): Promise<OrderRecord[]> {
    const res = await fetch(`${API_BASE}/orders`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch orders");
    return json.data || [];
  },

  async updateOrderStatus(id: string, status: OrderRecord["status"]): Promise<OrderRecord> {
    const res = await fetch(`${API_BASE}/orders/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update order status");
    return json.data;
  },

  // --- Reservations ---
  async reserveTable(payload: CreateReservationPayload) {
    const res = await fetch(`${API_BASE}/reservations`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Reservation failed");
    return data;
  },

  async getReservations(): Promise<ReservationRecord[]> {
    const res = await fetch(`${API_BASE}/reservations`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch reservations");
    return json.data || [];
  },

  async updateReservationStatus(id: string, status: ReservationRecord["status"]): Promise<ReservationRecord> {
    const res = await fetch(`${API_BASE}/reservations/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update reservation status");
    return json.data;
  },

  // --- Settings ---
  async getSettings(): Promise<RestaurantSettings> {
    const res = await fetch(`${API_BASE}/settings`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch settings");
    return json.data;
  },

  async updateSettings(settings: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    const res = await fetch(`${API_BASE}/settings`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(settings),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update settings");
    return json.data;
  },

  // --- Stats ---
  async getStats(): Promise<DashboardStats> {
    const res = await fetch(`${API_BASE}/stats`, { cache: "no-store" });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to fetch dashboard stats");
    return json.data;
  },

  // --- Loyalty ---
  async activateLoyaltyPass(phone?: string, name?: string) {
    const res = await fetch(`${API_BASE}/loyalty/activate`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone, name }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Failed to activate pass");
    return data;
  },

  // --- Authentication ---
  async login(username: string, password: string) {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Login failed");
    return json.data;
  },

  async verifyAuth(token: string) {
    const res = await fetch(`${API_BASE}/auth/verify`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Session invalid");
    return json.data;
  },

  async updateAdminCredentials(
    data: { currentPassword?: string; newPassword?: string; newUsername?: string; newEmail?: string; newName?: string },
    token?: string
  ) {
    const res = await fetch(`${API_BASE}/auth/credentials`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || "Failed to update credentials");
    return json.data;
  },
};
