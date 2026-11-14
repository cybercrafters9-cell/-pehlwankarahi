"use client";

import { createContext, useContext, useState, useEffect, useRef, ReactNode } from "react";
import { Dish, CartItem, menuDishes as initialMenu } from "@/data/menu";
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
  const [dishes, setDishes] = useState<Dish[]>(initialMenu);
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
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  // 1. SSR-safe cart hydration from localStorage on mount
  useEffect(() => {
    const frame = requestAnimationFrame(() => {
      try {
        const raw = localStorage.getItem("pk_cart");
        if (raw) {
          const parsed = JSON.parse(raw);
          if (Array.isArray(parsed)) {
            setCart(revalidateCartItems(parsed, initialMenu));
          }
        }
      } catch {
        // Ignore invalid stored json
      } finally {
        isHydratedRef.current = true;
      }
    });

    return () => cancelAnimationFrame(frame);
  }, []);

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

  // 3. Fetch dishes and restaurant settings from Express backend on mount
  useEffect(() => {
    let isMounted = true;
    api
      .getMenu()
      .then((data) => {
        if (isMounted && data && data.length > 0) {
          setDishes(data);
          // Revalidate cart against fetched menu to drop unavailable/removed dishes
          setCart((prevCart) => {
            let minimal = prevCart.map((i) => ({ id: i.id, qty: i.qty }));
            if (minimal.length === 0 && typeof window !== "undefined") {
              try {
                const raw = localStorage.getItem("pk_cart");
                if (raw) {
                  const parsed = JSON.parse(raw);
                  if (Array.isArray(parsed) && parsed.length > 0) {
                    minimal = parsed;
                  }
                }
              } catch {
                // Ignore
              }
            }
            return revalidateCartItems(minimal, data);
          });
        }
      })
      .catch(() => {
        // Fallback already defaults to initialMenu
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

  const getCallHint = () => (settings?.phone ? ` Please call us at ${settings.phone}.` : "");

  const showToast = (message: string) => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3200);
  };

  const addToCart = (id: number, name: string, price: number, image: string) => {
    setCart((prev) => {
      const exists = prev.some((item) => item.id === id);
      if (exists) {
        return prev.map((item) =>
          item.id === id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { id, name, price, qty: 1, image }];
    });
    showToast(`🔥 Added "${name}" to your Dastarkhwan!`);
  };

  const updateQty = (id: number, delta: number) => {
    setCart((prev) => {
      const target = prev.find((item) => item.id === id);
      if (!target) return prev;
      const newQty = target.qty + delta;
      if (newQty <= 0) {
        return prev.filter((item) => item.id !== id);
      }
      return prev.map((item) =>
        item.id === id ? { ...item, qty: newQty } : item
      );
    });
  };

  const clearCart = () => {
    setCart([]);
  };

  // Connect to Express backend for order submission
  const placeOrder = async (customerData?: Partial<CreateOrderPayload>): Promise<OrderRecord> => {
    if (cart.length === 0) {
      showToast("Please add items to your Dastarkhwan first!");
      throw new Error("Cart is empty");
    }

    setIsSubmittingOrder(true);
    try {
      const payload: CreateOrderPayload = {
        customerName: customerData?.customerName?.trim() || "",
        customerPhone: customerData?.customerPhone?.trim() || "",
        address: customerData?.address?.trim() || "",
        items: cart.map((item) => ({ id: item.id, qty: item.qty })),
        spiceLevel: customerData?.spiceLevel || spiceLevel,
        paymentMethod: customerData?.paymentMethod || "cod",
        transactionId: customerData?.transactionId,
        notes: customerData?.notes,
        loyaltyPhone: customerData?.loyaltyPhone,
      };

      const result = await api.placeOrder(payload);
      if (!result?.id) {
        throw new Error("Failed to receive order confirmation from kitchen.");
      }

      clearCart();
      showToast(`✅ Order #${result.id} Dispatched to Wok & Tandoor! (ETA: 28 mins)`);
      return result;
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to place order");
      showToast(`❌ ${msg}.${getCallHint()}`);
      throw err;
    } finally {
      setIsSubmittingOrder(false);
    }
  };

  // Connect to Express backend for table reservations
  const reserveTable = async (payload: CreateReservationPayload): Promise<ReservationRecord> => {
    try {
      const result = await api.reserveTable(payload);
      if (!result?.id) {
        throw new Error("Failed to receive booking confirmation from desk.");
      }
      showToast(`🎉 Dawat Booked for ${payload.name} (${result.id})!`);
      return result;
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to reserve table");
      showToast(`❌ ${msg}.${getCallHint()}`);
      throw err;
    }
  };

  // Connect to Express backend for loyalty activation
  const activateLoyalty = async (phone: string, name = "Shahi Mehmaan"): Promise<LoyaltyPassSummary> => {
    try {
      const result = await api.activateLoyaltyPass(phone, name);
      showToast("👑 Shahi Loyalty Pass Activated! (15% Off on Karahi)");
      return result;
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Failed to activate loyalty pass");
      showToast(`❌ ${msg}.${getCallHint()}`);
      throw err;
    }
  };

  return (
    <RestaurantContext.Provider
      value={{
        dishes,
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
