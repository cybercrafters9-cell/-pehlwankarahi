"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode, useCallback } from "react";
import { Dish, CartItem, CategoryItem } from "@/data/menu";
import {
  api,
  CreateOrderPayload,
  CreateReservationPayload,
  OrderRecord,
  ReservationRecord,
  LoyaltyPassSummary,
  RestaurantSettings,
  getErrorMessage,
} from "@/services/api";

interface ToastMessage {
  id: number;
  message: string;
}

interface RestaurantContextType {
  dishes: Dish[];
  categories: CategoryItem[];
  settings: RestaurantSettings | null;
  refreshMenu: () => Promise<void>;
  refreshCategories: () => Promise<void>;
  cart: CartItem[];
  addToCart: (id: number, name: string, price: number, image: string) => void;
  updateQty: (id: number, delta: number) => void;
  clearCart: () => void;
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
  isVideoOpen: boolean;
  setIsVideoOpen: (open: boolean) => void;
  isMenuModalOpen: boolean;
  setIsMenuModalOpen: (open: boolean) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  spiceLevel: string;
  setSpiceLevel: (level: string) => void;
  toasts: ToastMessage[];
  showToast: (message: string) => void;
  placeOrder: (customerData?: Partial<CreateOrderPayload>) => Promise<OrderRecord>;
  reserveTable: (payload: CreateReservationPayload) => Promise<ReservationRecord>;
  activateLoyalty: (phone: string, name?: string) => Promise<LoyaltyPassSummary>;
  isSubmittingOrder: boolean;
}

const RestaurantContext = createContext<RestaurantContextType | undefined>(undefined);

function revalidateCartItems(
  stored: Array<{ id: number; qty: number }>,
  menuList: Dish[]
): CartItem[] {
  if (!Array.isArray(stored) || !Array.isArray(menuList)) return [];
  const valid: CartItem[] = [];
  for (const item of stored) {
    if (!item || typeof item.id !== "number" || typeof item.qty !== "number" || item.qty <= 0) {
      continue;
    }
    const dish = menuList.find((d) => d.id === item.id);
    if (dish && dish.isAvailable !== false) {
      valid.push({
        id: dish.id,
        name: dish.name,
        price: dish.price,
        qty: item.qty,
        image: dish.image,
      });
    }
  }
  return valid;
}

export function RestaurantProvider({ children }: { children: ReactNode }) {
  const [dishes, setDishes] = useState<Dish[]>([]);
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);
  const [cart, setCart] = useState<CartItem[]>([]);
  const isHydratedRef = useRef(false);

  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isVideoOpen, setIsVideoOpen] = useState(false);
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [spiceLevel, setSpiceLevel] = useState("Chatpata Desi");
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  const refreshMenu = useCallback(async () => {
    try {
      const data = await api.getMenu();
      if (Array.isArray(data)) {
        setDishes(data);
        setCart((prev) => {
          const minimal = prev.map((i) => ({ id: i.id, qty: i.qty }));
          return revalidateCartItems(minimal, data);
        });
      }
    } catch {
      // ignore
    }
  }, []);

  const refreshCategories = useCallback(async () => {
    try {
      const data = await api.getCategories(true);
      if (Array.isArray(data)) {
        setCategories(data);
      }
    } catch {
      // ignore
    }
  }, []);

  // 1. SSR-safe cart hydration from localStorage on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem("pk_cart");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setCart(revalidateCartItems(parsed, dishes));
          }
        }
      } catch {
        // Ignore invalid stored json
      } finally {
        isHydratedRef.current = true;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // 2. Persist cart to localStorage on cart change
  useEffect(() => {
    if (!isHydratedRef.current) return;
    try {
      const minimal = cart.map((item) => ({ id: item.id, qty: item.qty }));
      localStorage.setItem("pk_cart", JSON.stringify(minimal));
    } catch {
      // Storage quota or localStorage disabled
    }
  }, [cart]);

  // 3. Fetch dishes, categories, and settings from Express backend on mount
  useEffect(() => {
    let isMounted = true;

    api
      .getMenu()
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setDishes(data);
          setCart((prev) => {
            const minimal = prev.map((i) => ({ id: i.id, qty: i.qty }));
            return revalidateCartItems(minimal, data);
          });
        }
      })
      .catch(() => {
        // Silently keep empty list
      });

    api
      .getCategories(true)
      .then((data) => {
        if (isMounted && Array.isArray(data)) {
          setCategories(data);
        }
      })
      .catch(() => {
        // Silently keep empty list
      });

    api
      .getSettings()
      .then((data) => {
        if (isMounted && data) {
          setSettings(data);
        }
      })
      .catch(() => {
        // Silently keep null
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const showToast = useCallback((message: string) => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const addToCart = useCallback(
    (id: number, name: string, price: number, image: string) => {
      setCart((prev) => {
        const existing = prev.find((item) => item.id === id);
        if (existing) {
          return prev.map((item) =>
            item.id === id ? { ...item, qty: item.qty + 1 } : item
          );
        }
        return [...prev, { id, name, price, qty: 1, image }];
      });
      showToast(`Added ${name} to Dera Dastarkhwan!`);
    },
    [showToast]
  );

  const updateQty = useCallback((id: number, delta: number) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
    try {
      localStorage.removeItem("pk_cart");
    } catch {
      // ignore
    }
  }, []);

  const placeOrder = useCallback(
    async (customerData?: Partial<CreateOrderPayload>): Promise<OrderRecord> => {
      if (cart.length === 0) {
        throw new Error("Cannot place an order with an empty cart");
      }

      setIsSubmittingOrder(true);
      try {
        const items = cart.map((item) => ({
          id: item.id,
          qty: item.qty,
        }));

        const payload: CreateOrderPayload = {
          items,
          spiceLevel,
          customerName: customerData?.customerName,
          customerPhone: customerData?.customerPhone,
          address: customerData?.address,
          paymentMethod: customerData?.paymentMethod || "cod",
          paymentStatus: customerData?.paymentStatus || "pending",
          transactionId: customerData?.transactionId,
          notes: customerData?.notes,
          loyaltyPhone: customerData?.loyaltyPhone,
        };

        const order = await api.placeOrder(payload);
        clearCart();
        setIsCartOpen(false);
        showToast(`Shahi Order #${order.id} sent straight to live wok & tandoor!`);
        return order;
      } catch (err: unknown) {
        const msg = getErrorMessage(err, "Failed to submit order. Please check connection.");
        showToast(msg);
        throw err;
      } finally {
        setIsSubmittingOrder(false);
      }
    },
    [cart, spiceLevel, clearCart, showToast]
  );

  const reserveTable = useCallback(
    async (payload: CreateReservationPayload): Promise<ReservationRecord> => {
      try {
        const res = await api.reserveTable(payload);
        showToast(`Table booked successfully! Reference: ${res.id}`);
        return res;
      } catch (err: unknown) {
        const msg = getErrorMessage(err, "Failed to book table. Please try again.");
        showToast(msg);
        throw err;
      }
    },
    [showToast]
  );

  const activateLoyalty = useCallback(
    async (phone: string, name?: string): Promise<LoyaltyPassSummary> => {
      try {
        const pass = await api.activateLoyaltyPass(phone, name);
        showToast("👑 Shahi Loyalty Pass Activated! 15% VIP discount enabled.");
        return pass;
      } catch (err: unknown) {
        const msg = getErrorMessage(err, "Failed to activate pass. Please try again.");
        showToast(msg);
        throw err;
      }
    },
    [showToast]
  );

  return (
    <RestaurantContext.Provider
      value={{
        dishes,
        categories,
        settings,
        refreshMenu,
        refreshCategories,
        cart,
        addToCart,
        updateQty,
        clearCart,
        isCartOpen,
        setIsCartOpen,
        isVideoOpen,
        setIsVideoOpen,
        isMenuModalOpen,
        setIsMenuModalOpen,
        selectedCategory,
        setSelectedCategory,
        searchQuery,
        setSearchQuery,
        spiceLevel,
        setSpiceLevel,
        toasts,
        showToast,
        placeOrder,
        reserveTable,
        activateLoyalty,
        isSubmittingOrder,
      }}
    >
      {children}
    </RestaurantContext.Provider>
  );
}

export function useRestaurant() {
  const context = useContext(RestaurantContext);
  if (!context) {
    throw new Error("useRestaurant must be used within a RestaurantProvider");
  }
  return context;
}
