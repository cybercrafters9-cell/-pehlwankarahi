"use client";

import { useState } from "react";
import { DashboardStats, OrderRecord, ReservationRecord, RestaurantSettings } from "@/services/api";
import { StatCard } from "../ui/StatCard";
import { Card } from "../ui/Card";
import { Badge, BadgeProps } from "../ui/Badge";
import { Button } from "../ui/Button";
import { Flame, DollarSign, ShoppingBag, Calendar, CheckCircle2, RefreshCw } from "lucide-react";

interface OverviewTabProps {
  stats: DashboardStats | null;
  orders: OrderRecord[];
  reservations: ReservationRecord[];
  settings: RestaurantSettings | null;
  onUpdateOrderStatus: (id: string, status: OrderRecord["status"]) => Promise<void>;
  onRefresh: () => void;
  isLoading: boolean;
}

export function OverviewTab({
  stats,
  orders,
  reservations,
  onUpdateOrderStatus,
  onRefresh,
  isLoading,
}: OverviewTabProps) {
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleQuickStatus = async (id: string, nextStatus: OrderRecord["status"]) => {
    setUpdatingId(id);
    try {
      await onUpdateOrderStatus(id, nextStatus);
    } finally {
      setUpdatingId(null);
    }
  };

  const recentOrders = orders.slice(0, 5);
  const recentReservations = reservations.slice(0, 5);

  const statusVariant = (status: string): BadgeProps["variant"] => {
    switch (status) {
      case "preparing":
        return "warning";
      case "cooking_in_wok":
        return "terracotta";
      case "out_for_delivery":
        return "info";
      case "delivered":
        return "success";
      case "cancelled":
        return "danger";
      default:
        return "sand";
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Refresh */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-sand-50 border border-sand-200 p-5 rounded-3xl shadow-soft">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-terracotta-500/10 text-terracotta-500 flex items-center justify-center shrink-0">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <h2 className="font-display font-bold text-lg text-charcoal-900">
              Kitchen &amp; Restaurant Live Hub
            </h2>
            <p className="text-xs text-charcoal-700/75 mt-0.5">
              Live Koyla Grill &amp; Garma Garam Karahi Status:{" "}
              <strong className="text-emerald-700">Online &amp; Active</strong>
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={onRefresh}
          isLoading={isLoading}
          icon={<RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />}
        >
          Refresh Data
        </Button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Revenue"
          value={`Rs. ${(stats?.totalRevenue || 0).toLocaleString()}`}
          icon={<DollarSign className="w-6 h-6" />}
          trend="+18%"
          subtext="from orders"
          colorScheme="emerald"
        />
        <StatCard
          label="Active Orders"
          value={stats?.pendingOrders || orders.filter((o) => o.status === "preparing").length}
          icon={<ShoppingBag className="w-6 h-6" />}
          subtext="In live wok/tandoor"
          colorScheme="terracotta"
        />
        <StatCard
          label="Dawat Bookings"
          value={stats?.totalReservations || reservations.length}
          icon={<Calendar className="w-6 h-6" />}
          subtext="Rooftop & Hall"
          colorScheme="saffron"
        />
        <StatCard
          label="Menu Dishes"
          value={stats?.activeDishesCount || 10}
          icon={<Flame className="w-6 h-6" />}
          subtext="Available today"
          colorScheme="charcoal"
        />
      </div>

      {/* 2-Column Split: Recent Orders & Recent Reservations */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Recent Orders */}
        <div className="lg:col-span-7">
          <Card
            title="Recent Live Orders"
            subtitle="Orders dispatched from website checkout"
            badge={
              <Badge variant="terracotta" dot>
                Live Kitchen
              </Badge>
            }
          >
            {recentOrders.length === 0 ? (
              <p className="text-xs text-charcoal-700/70 py-6 text-center">No orders recorded yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-sand-200 text-charcoal-700/70 uppercase tracking-wider text-[10px]">
                      <th className="pb-3 font-extrabold">Order ID</th>
                      <th className="pb-3 font-extrabold">Customer</th>
                      <th className="pb-3 font-extrabold">Items</th>
                      <th className="pb-3 font-extrabold">Total</th>
                      <th className="pb-3 font-extrabold">Status</th>
                      <th className="pb-3 font-extrabold text-right">Quick Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-sand-200/60 font-semibold">
                    {recentOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-sand-100/50 transition-colors">
                        <td className="py-3 font-extrabold text-charcoal-900">{order.id}</td>
                        <td className="py-3">
                          <p className="font-bold text-charcoal-900">{order.customerName}</p>
                          <p className="text-[10px] text-charcoal-700/60">{order.customerPhone}</p>
                        </td>
                        <td className="py-3 max-w-[140px] truncate text-charcoal-800">
                          {order.items.map((i) => `${i.name} (x${i.qty})`).join(", ")}
                        </td>
                        <td className="py-3 font-extrabold text-terracotta-500">
                          Rs. {order.total.toLocaleString()}
                        </td>
                        <td className="py-3">
                          <Badge variant={statusVariant(order.status)}>
                            {order.status.replace(/_/g, " ")}
                          </Badge>
                        </td>
                        <td className="py-3 text-right">
                          {order.status === "preparing" ? (
                            <Button
                              size="sm"
                              variant="primary"
                              isLoading={updatingId === order.id}
                              onClick={() => handleQuickStatus(order.id, "cooking_in_wok")}
                              className="text-[10px] py-1 px-2.5"
                            >
                              To Wok
                            </Button>
                          ) : order.status === "cooking_in_wok" ? (
                            <Button
                              size="sm"
                              variant="secondary"
                              isLoading={updatingId === order.id}
                              onClick={() => handleQuickStatus(order.id, "out_for_delivery")}
                              className="text-[10px] py-1 px-2.5"
                            >
                              Dispatch
                            </Button>
                          ) : order.status === "out_for_delivery" ? (
                            <Button
                              size="sm"
                              variant="saffron"
                              isLoading={updatingId === order.id}
                              onClick={() => handleQuickStatus(order.id, "delivered")}
                              className="text-[10px] py-1 px-2.5"
                            >
                              <CheckCircle2 className="w-3 h-3" />
                              Delivered
                            </Button>
                          ) : (
                            <span className="text-[10px] text-charcoal-700/60">Done</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Recent Table Reservations */}
        <div className="lg:col-span-5">
          <Card
            title="Dawat Reservations"
            subtitle="Today's table and rooftop bookings"
            badge={<Badge variant="saffron">{recentReservations.length} Booked</Badge>}
          >
            {recentReservations.length === 0 ? (
              <p className="text-xs text-charcoal-700/70 py-6 text-center">No reservations found.</p>
            ) : (
              <div className="space-y-3">
                {recentReservations.map((res) => (
                  <div
                    key={res.id}
                    className="p-3 bg-sand-100 rounded-2xl border border-sand-200 flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-extrabold text-xs text-charcoal-900">{res.name}</span>
                        <span className="text-[10px] bg-sand-200 px-2 py-0.5 rounded-full font-bold text-charcoal-700">
                          {res.id}
                        </span>
                      </div>
                      <p className="text-[11px] text-charcoal-700/80 mt-0.5">
                        {res.guests} • {res.timeSlot}
                      </p>
                      <p className="text-[10px] text-terracotta-500 font-bold mt-0.5">{res.phone}</p>
                    </div>
                    <Badge variant={res.status === "confirmed" ? "success" : "sand"}>
                      {res.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}
