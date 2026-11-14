"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  api,
  DashboardStats,
  OrderRecord,
  ReservationRecord,
  RestaurantSettings,
  isAuthExpiredError,
  getErrorMessage,
} from "@/services/api";
import { Dish, menuDishes as fallbackMenu } from "@/data/menu";
import { AdminLogin } from "@/components/admin/AdminLogin";
import { OverviewTab } from "@/components/admin/tabs/OverviewTab";
import { MenuTab } from "@/components/admin/tabs/MenuTab";
import { OrdersTab } from "@/components/admin/tabs/OrdersTab";
import { ReservationsTab } from "@/components/admin/tabs/ReservationsTab";
import { SettingsTab } from "@/components/admin/tabs/SettingsTab";
import {
  LayoutDashboard,
  UtensilsCrossed,
  ShoppingBag,
  Calendar,
  Settings,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
  LogOut,
  User,
  Loader2,
} from "lucide-react";

type TabType = "overview" | "menu" | "orders" | "reservations" | "settings";

interface SessionUser {
  id: string;
  username: string;
  email: string;
  name: string;
  role: string;
}

const emptySubscribe = () => () => {};

export default function AdminPage() {
  const isMounted = React.useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false
  );
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [isLoading, setIsLoading] = useState(true);
  const [apiConnected, setApiConnected] = useState(true);

  // Authentication State
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [sessionUser, setSessionUser] = useState<SessionUser | null>(null);

  // Data States
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [dishes, setDishes] = useState<Dish[]>(fallbackMenu);
  const [orders, setOrders] = useState<OrderRecord[]>([]);
  const [reservations, setReservations] = useState<ReservationRecord[]>([]);
  const [settings, setSettings] = useState<RestaurantSettings | null>(null);

  // Toast Notification State
  const [toasts, setToasts] = useState<{ id: number; message: string; type: "success" | "error" }[]>([]);

  const showToast = (message: string, type: "success" | "error" = "success") => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3500);
  };

  // Logout Handler
  const handleLogout = useCallback((isExpired: boolean | unknown = false) => {
    setIsAuthenticated(false);
    setSessionUser(null);
    localStorage.removeItem("pehalwan_admin_session");
    if (isExpired === true) {
      showToast("Session expired", "error");
    } else {
      showToast("You have been signed out successfully.");
    }
  }, []);

  const checkAuthExpired = useCallback(
    (err: unknown): boolean => {
      if (isAuthExpiredError(err)) {
        handleLogout(true);
        return true;
      }
      return false;
    },
    [handleLogout]
  );

  // Mount & Check Session
  useEffect(() => {
    const timer = setTimeout(() => {
      const stored = localStorage.getItem("pehalwan_admin_session");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.token && parsed.user) {
            setIsAuthenticated(true);
            setSessionUser(parsed.user);
          }
        } catch {
          localStorage.removeItem("pehalwan_admin_session");
        }
      }
    }, 0);
    return () => clearTimeout(timer);
  }, []);

  // Fetch all data
  const fetchData = useCallback(() => {
    setIsLoading(true);
    return Promise.allSettled([
      api.getMenu(),
      api.getOrders(),
      api.getReservations(),
      api.getSettings(),
      api.getStats(),
    ])
      .then(([menuData, ordersData, resData, settingsData, statsData]) => {
        const authResults = [ordersData, resData, statsData];
        const expired = authResults.some(
          (r) => r.status === "rejected" && isAuthExpiredError(r.reason)
        );
        if (expired) {
          handleLogout(true);
          return;
        }

        if (menuData.status === "fulfilled" && menuData.value.length > 0) {
          setDishes(menuData.value);
        }
        if (ordersData.status === "fulfilled") {
          setOrders(ordersData.value);
        }
        if (resData.status === "fulfilled") {
          setReservations(resData.value);
        }
        if (settingsData.status === "fulfilled") {
          setSettings(settingsData.value);
        }
        if (statsData.status === "fulfilled") {
          setStats(statsData.value);
        }
        setApiConnected(true);
      })
      .catch((err) => {
        if (checkAuthExpired(err)) return;
        console.warn("[Admin Console] Backend error, relying on local state:", err);
        setApiConnected(false);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [handleLogout, checkAuthExpired]);

  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => {
        fetchData();
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, fetchData]);

  // Login Handler
  const handleLogin = async (username: string, pass: string) => {
    try {
      const data = await api.login(username, pass);
      setIsAuthenticated(true);
      setSessionUser(data.user);
      localStorage.setItem("pehalwan_admin_session", JSON.stringify(data));
      showToast(`Welcome back, ${data.user.name || "Master Pehalwan"}!`);
      return { success: true };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : "Invalid Username or Password.";
      return { success: false, error: errorMsg };
    }
  };

  // --- Handlers for Menu Tab ---
  const handleCreateDish = async (dishData: Omit<Dish, "id">) => {
    try {
      const newDish = await api.createDish(dishData);
      setDishes((prev) => [newDish, ...prev]);
      showToast(`🔥 Added "${newDish.name}" to menu!`);
    } catch (err: unknown) {
      if (checkAuthExpired(err)) return;
      showToast(getErrorMessage(err, "Failed to create dish"), "error");
    }
  };

  const handleUpdateDish = async (id: number, updates: Partial<Dish>) => {
    try {
      const updated = await api.updateDish(id, updates);
      setDishes((prev) => prev.map((d) => (d.id === id ? updated : d)));
      showToast(`✅ Dish #${id} updated successfully!`);
    } catch (err: unknown) {
      if (checkAuthExpired(err)) return;
      showToast(getErrorMessage(err, `Failed to update dish #${id}`), "error");
    }
  };

  const handleDeleteDish = async (id: number) => {
    try {
      await api.deleteDish(id);
      setDishes((prev) => prev.filter((d) => d.id !== id));
      showToast(`🗑️ Dish #${id} deleted from menu.`);
    } catch (err: unknown) {
      if (checkAuthExpired(err)) return;
      showToast(getErrorMessage(err, `Failed to delete dish #${id}`), "error");
    }
  };

  // --- Handlers for Orders Tab ---
  const handleUpdateOrderStatus = async (id: string, status: OrderRecord["status"]) => {
    try {
      const updated = await api.updateOrderStatus(id, status);
      setOrders((prev) => prev.map((o) => (o.id === id ? updated : o)));
      showToast(`📦 Order #${id} status changed to ${status.replace(/_/g, " ")}`);
    } catch (err: unknown) {
      if (checkAuthExpired(err)) return;
      showToast(getErrorMessage(err, `Failed to update order #${id}`), "error");
    }
  };

  // --- Handlers for Reservations Tab ---
  const handleUpdateReservationStatus = async (
    id: string,
    status: ReservationRecord["status"]
  ) => {
    try {
      const updated = await api.updateReservationStatus(id, status);
      setReservations((prev) => prev.map((r) => (r.id === id ? updated : r)));
      showToast(`📅 Reservation #${id} marked as ${status}!`);
    } catch (err: unknown) {
      if (checkAuthExpired(err)) return;
      showToast(getErrorMessage(err, `Failed to update reservation #${id}`), "error");
    }
  };

  // --- Handlers for Settings Tab ---
  const handleUpdateSettings = async (newSettings: Partial<RestaurantSettings>) => {
    try {
      const updated = await api.updateSettings(newSettings);
      setSettings(updated);
      showToast("💾 Restaurant info & settings saved successfully!");
    } catch (err: unknown) {
      if (checkAuthExpired(err)) return;
      showToast(getErrorMessage(err, "Failed to update settings"), "error");
    }
  };

  // Hydration safety loader
  if (!isMounted) {
    return (
      <div className="min-h-screen bg-sand-100 flex items-center justify-center">
        <div className="text-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-terracotta-500 mx-auto" />
          <p className="font-display font-bold text-sm text-charcoal-900">
            Loading Pehalwan Karahi Console...
          </p>
        </div>
      </div>
    );
  }

  // Authentication Gatekeeper
  if (!isAuthenticated) {
    return <AdminLogin onLogin={handleLogin} />;
  }

  const pendingOrdersCount = orders.filter((o) => o.status === "preparing").length;

  return (
    <div className="min-h-screen bg-sand-100 text-charcoal-900 pb-16">
      {/* Top Admin Bar */}
      <header className="sticky top-0 z-40 bg-charcoal-900 text-white border-b border-charcoal-800 shadow-md">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-terracotta-500 text-white flex items-center justify-center transition-colors cursor-pointer"
              title="Return to customer site"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif italic font-bold text-lg sm:text-xl text-white">
                  Pehalwan <span className="text-terracotta-500">Admin.</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest bg-terracotta-500 text-white px-2 py-0.5 rounded-full font-bold">
                  Management Console
                </span>
              </div>
              <p className="text-[11px] text-white/60 hidden sm:block">
                Manage Dishes, Live Prices, Restaurant Address, Support Phones &amp; Orders
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            {/* Connection Status */}
            <div className="hidden sm:flex items-center gap-1.5 bg-white/10 px-3 py-1.5 rounded-full text-xs">
              <span className={`w-2 h-2 rounded-full ${apiConnected ? "bg-emerald-400" : "bg-amber-400 animate-pulse"}`} />
              <span className="text-white/80 font-bold">{apiConnected ? "API Online" : "Offline Cache"}</span>
            </div>

            {/* Authenticated User Badge */}
            <div className="hidden md:flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full text-xs">
              <User className="w-3.5 h-3.5 text-saffron-400" />
              <span className="font-bold text-white truncate max-w-[120px]">
                {sessionUser?.username || "Admin"}
              </span>
            </div>

            {/* Logout Button */}
            <button
              onClick={() => handleLogout()}
              className="bg-red-500/20 hover:bg-red-600 text-red-200 hover:text-white border border-red-500/40 text-xs font-bold px-3 py-1.5 rounded-full transition-all flex items-center gap-1.5 cursor-pointer"
              title="Sign out of Admin Console"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <Link
              href="/"
              className="bg-sand-100 hover:bg-white text-charcoal-900 text-xs font-bold px-3.5 py-1.5 rounded-full transition-colors flex items-center gap-1.5"
            >
              <span>Live Website</span>
            </Link>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="max-w-[1280px] mx-auto px-4 sm:px-8 flex items-center gap-1 overflow-x-auto scrollbar-none pt-2">
          {[
            { id: "overview", label: "Overview", icon: <LayoutDashboard className="w-4 h-4" /> },
            { id: "menu", label: "Menu & Prices", icon: <UtensilsCrossed className="w-4 h-4" />, count: dishes.length },
            { id: "orders", label: "Live Orders", icon: <ShoppingBag className="w-4 h-4" />, count: pendingOrdersCount, badgeColor: "bg-terracotta-500 text-white" },
            { id: "reservations", label: "Dawat Bookings", icon: <Calendar className="w-4 h-4" />, count: reservations.length },
            { id: "settings", label: "Address & Settings", icon: <Settings className="w-4 h-4" /> },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabType)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 text-xs sm:text-sm font-bold transition-all whitespace-nowrap cursor-pointer ${
                  isActive
                    ? "border-terracotta-500 text-white bg-white/5"
                    : "border-transparent text-white/70 hover:text-white hover:bg-white/5"
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                      tab.badgeColor || "bg-white/15 text-white"
                    }`}
                  >
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Admin Content Container */}
      <main className="max-w-[1280px] mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {activeTab === "overview" && (
          <OverviewTab
            stats={stats}
            orders={orders}
            reservations={reservations}
            settings={settings}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onRefresh={fetchData}
            isLoading={isLoading}
          />
        )}

        {activeTab === "menu" && (
          <MenuTab
            dishes={dishes}
            onCreateDish={handleCreateDish}
            onUpdateDish={handleUpdateDish}
            onDeleteDish={handleDeleteDish}
            isLoading={isLoading}
          />
        )}

        {activeTab === "orders" && (
          <OrdersTab
            orders={orders}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            isLoading={isLoading}
          />
        )}

        {activeTab === "reservations" && (
          <ReservationsTab
            reservations={reservations}
            onUpdateStatus={handleUpdateReservationStatus}
            isLoading={isLoading}
          />
        )}

        {activeTab === "settings" && (
          <SettingsTab
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            isLoading={isLoading}
            onShowToast={showToast}
          />
        )}
      </main>

      {/* Toast Notification Container */}
      <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-2 max-w-sm w-full px-4">
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className="bg-charcoal-900 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-full shadow-2xl border border-saffron-400/40 flex items-center gap-2.5 transition-all animate-bounce"
          >
            {toast.type === "success" ? (
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            )}
            <span className="truncate">{toast.message}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
