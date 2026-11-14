import { Dish, CartItem } from "@/data/menu";

// Cleanly resolve API base URL, ensuring /api path and no trailing slashes
const getApiBaseUrl = (): string => {
  let url = process.env.NEXT_PUBLIC_API_URL?.trim();
  if (url) {
    url = url.replace(/\/+$/, "");
    if (!url.endsWith("/api")) {
      url = `${url}/api`;
    }
    return url;
  }
  // Client-side fallback: if visited on a custom domain without explicit NEXT_PUBLIC_API_URL
  if (
    typeof window !== "undefined" &&
    window.location.hostname !== "localhost" &&
    window.location.hostname !== "127.0.0.1"
  ) {
    return `${window.location.origin}/api`;
  }
  return "http://localhost:5050/api";
};

const API_BASE = getApiBaseUrl();

export interface CreateOrderItemPayload {
  id: number;
  qty: number;
}

export interface CreateOrderPayload {
  customerName?: string;
  customerPhone?: string;
  address?: string;
  items: CreateOrderItemPayload[];
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
  data?: OrderRecord;
}

export interface ReservationRecord {
  id: string;
  name: string;
  phone: string;
  guests: string;
  timeSlot: string;
  status: "confirmed" | "completed" | "cancelled";
  createdAt: string;
  data?: ReservationRecord;
}

export interface LoyaltyPassSummary {
  tier: string;
  discountPercent: number;
}

const SESSION_KEY = "pehalwan_admin_session";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed?.token === "string" ? parsed.token : null;
  } catch {
    return null;
  }
}

function clearSession(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(SESSION_KEY);
  } catch {
    // ignore
  }
}

export class ApiError extends Error {
  status: number;
  code: string;
  isAuthExpired: boolean;

  constructor(message: string, status: number, isAuthExpired = false) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.isAuthExpired = isAuthExpired;
    this.code = isAuthExpired ? "AUTH_EXPIRED" : `HTTP_${status}`;
  }
}

export const isAuthExpiredError = (err: unknown): boolean => {
  if (!err || typeof err !== "object") return false;
  return (
    ("isAuthExpired" in err && Boolean((err as { isAuthExpired: unknown }).isAuthExpired)) ||
    ("code" in err && (err as { code: unknown }).code === "AUTH_EXPIRED") ||
    ("status" in err && (err as { status: unknown }).status === 401)
  );
};

export function getErrorMessage(err: unknown, fallback = "Something went wrong"): string {
  if (err instanceof Error && err.message) return err.message;
  if (typeof err === "string" && err.trim()) return err;
  return fallback;
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth, token } = options;
  const headers: Record<string, string> = {};

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  if (auth) {
    const activeToken = token || getToken();
    if (activeToken) {
      headers["Authorization"] = `Bearer ${activeToken}`;
    }
  }

  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
    cache: "no-store",
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    if (res.status === 401 && auth) {
      clearSession();
      throw new ApiError(json.error || "Session expired", 401, true);
    }
    throw new ApiError(json.error || `Request failed with status ${res.status}`, res.status);
  }

  const data = json.data !== undefined ? json.data : json;
  if (data && typeof data === "object" && !Array.isArray(data) && !("data" in data)) {
    Object.defineProperty(data, "data", {
      value: data,
      writable: true,
      configurable: true,
      enumerable: false,
    });
  }

  return data as T;
}

export const api = {
  // --- Menu ---
  getMenu: (category?: string, search?: string) =>
    request<Dish[]>(
      `/menu${
        category || search
          ? `?${new URLSearchParams({
              ...(category && category !== "all" ? { category } : {}),
              ...(search?.trim() ? { search: search.trim() } : {}),
            })}`
          : ""
      }`
    ),

  createDish: (dish: Omit<Dish, "id">) =>
    request<Dish>("/menu", { method: "POST", body: dish, auth: true }),

  updateDish: (id: number, updates: Partial<Dish>) =>
    request<Dish>(`/menu/${id}`, { method: "PUT", body: updates, auth: true }),

  deleteDish: (id: number) =>
    request<unknown>(`/menu/${id}`, { method: "DELETE", auth: true }).then(() => true),

  // --- Orders ---
  placeOrder: (payload: CreateOrderPayload) =>
    request<OrderRecord>("/orders", { method: "POST", body: payload }),

  getOrders: () =>
    request<OrderRecord[]>("/orders", { auth: true }),

  updateOrderStatus: (id: string, status: OrderRecord["status"]) =>
    request<OrderRecord>(`/orders/${id}/status`, { method: "PATCH", body: { status }, auth: true }),

  // --- Reservations ---
  reserveTable: (payload: CreateReservationPayload) =>
    request<ReservationRecord>("/reservations", { method: "POST", body: payload }),

  getReservations: () =>
    request<ReservationRecord[]>("/reservations", { auth: true }),

  updateReservationStatus: (id: string, status: ReservationRecord["status"]) =>
    request<ReservationRecord>(`/reservations/${id}/status`, { method: "PATCH", body: { status }, auth: true }),

  // --- Settings ---
  getSettings: () =>
    request<RestaurantSettings>("/settings"),

  updateSettings: (settings: Partial<RestaurantSettings>) =>
    request<RestaurantSettings>("/settings", { method: "PUT", body: settings, auth: true }),

  // --- Stats ---
  getStats: () =>
    request<DashboardStats>("/stats", { auth: true }),

  // --- Loyalty ---
  activateLoyaltyPass: (phone: string, name?: string) =>
    request<LoyaltyPassSummary>("/loyalty/activate", { method: "POST", body: { phone, name } }),

  getLoyaltyPass: (phone: string) =>
    request<LoyaltyPassSummary>(`/loyalty/${encodeURIComponent(phone)}`),

  // --- Authentication ---
  login: (username: string, password: string) =>
    request<{ token: string; user: { id: string; username: string; email: string; name: string; role: string } }>(
      "/auth/login",
      { method: "POST", body: { username, password } }
    ),

  verifyAuth: (token?: string) =>
    request<{ user: { id: string; username: string; email: string; name: string; role: string } }>(
      "/auth/verify",
      { auth: true, token }
    ),

  updateAdminCredentials: (
    data: { currentPassword?: string; newPassword?: string; newUsername?: string; newEmail?: string; newName?: string },
    token?: string
  ) =>
    request<{ user: { id: string; username: string; email: string; name: string; role: string } }>(
      "/auth/credentials",
      { method: "PUT", body: data, auth: true, token }
    ),
};

export { clearSession, getToken };
