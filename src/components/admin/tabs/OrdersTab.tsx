"use client";

import { useState } from "react";
import Image from "next/image";
import { OrderRecord } from "@/services/api";
import { Badge } from "../ui/Badge";
import { Search, Phone, Bike, Clock, Loader2 } from "lucide-react";
import { ClientDate } from "../ui/ClientDate";

interface OrdersTabProps {
  orders: OrderRecord[];
  onUpdateOrderStatus: (id: string, status: OrderRecord["status"]) => Promise<void>;
  isLoading: boolean;
}

const statusOptions = [
  { value: "preparing", label: "🍳 Preparing Order" },
  { value: "cooking_in_wok", label: "🔥 Cooking in Live Wok" },
  { value: "out_for_delivery", label: "🛵 Out for Delivery" },
  { value: "delivered", label: "✅ Delivered" },
  { value: "cancelled", label: "❌ Cancelled" },
];

export function OrdersTab({ orders, onUpdateOrderStatus, isLoading }: OrdersTabProps) {
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [search, setSearch] = useState("");
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const handleStatusChange = async (id: string, status: OrderRecord["status"]) => {
    setUpdatingId(id);
    try {
      await onUpdateOrderStatus(id, status);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredOrders = orders.filter((order) => {
    const matchesStatus = filterStatus === "all" || order.status === filterStatus;
    const q = search.trim().toLowerCase();
    const matchesSearch =
      !q ||
      order.id.toLowerCase().includes(q) ||
      (order.customerName && order.customerName.toLowerCase().includes(q)) ||
      (order.customerPhone && order.customerPhone.includes(q));

    return matchesStatus && matchesSearch;
  });

  const getStatusBadge = (status: OrderRecord["status"]) => {
    switch (status) {
      case "preparing":
        return <Badge variant="warning" dot>Preparing</Badge>;
      case "cooking_in_wok":
        return <Badge variant="terracotta" dot>In Live Wok</Badge>;
      case "out_for_delivery":
        return <Badge variant="info" dot>On The Way</Badge>;
      case "delivered":
        return <Badge variant="success" dot>Delivered</Badge>;
      case "cancelled":
        return <Badge variant="danger" dot>Cancelled</Badge>;
      default:
        return <Badge variant="charcoal">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-sand-50 border border-sand-200 rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display font-bold text-xl text-charcoal-900">Live Kitchen Orders</h2>
            <Badge variant="terracotta">{orders.length} Total</Badge>
          </div>
          <p className="text-xs text-charcoal-700/75 mt-0.5">
            Monitor hot wok cooking, tandoor bread preparation and fast delivery dispatches.
          </p>
        </div>
      </div>

      {/* Filter Tabs & Search */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Status Filters */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {["all", "preparing", "cooking_in_wok", "out_for_delivery", "delivered", "cancelled"].map((st) => {
            const count = st === "all" ? orders.length : orders.filter((o) => o.status === st).length;
            const label = st === "all" ? "All Orders" : st.replace(/_/g, " ");
            const isActive = filterStatus === st;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`text-xs font-bold px-3.5 py-2 rounded-full whitespace-nowrap capitalize transition-all cursor-pointer ${
                  isActive
                    ? "bg-charcoal-900 text-white shadow"
                    : "bg-sand-200/80 hover:bg-sand-300 text-charcoal-900"
                }`}
              >
                {label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-700/60" />
          <input
            type="text"
            placeholder="Search Order #PK or phone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-sand-100 border border-sand-300 rounded-full pl-10 pr-4 py-2 text-xs font-semibold text-charcoal-900 placeholder:text-charcoal-700/50 focus:outline-none focus:border-terracotta-500"
          />
        </div>
      </div>

      {/* Orders List */}
      {isLoading && orders.length === 0 ? (
        <div className="bg-sand-50 border border-sand-200 rounded-3xl p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-terracotta-500 mx-auto mb-2" />
          <p className="font-display font-bold text-base text-charcoal-900">Loading live orders...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-sand-50 border border-sand-200 rounded-3xl p-12 text-center">
          <Bike className="w-12 h-12 mx-auto text-charcoal-700/40 mb-2" />
          <p className="font-display font-bold text-base text-charcoal-900">No orders match this status.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredOrders.map((order) => (
            <div
              key={order.id}
              className="bg-sand-50 border border-sand-200 rounded-3xl p-5 sm:p-6 shadow-soft hover:shadow-card transition-all"
            >
              {/* Top Row: Order ID, Timestamp, Status, Dropdown */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-4 border-b border-sand-200">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-display font-extrabold text-lg text-charcoal-900">{order.id}</span>
                  {getStatusBadge(order.status)}
                  <span className="text-xs text-charcoal-700/60 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <ClientDate date={order.createdAt} />
                  </span>
                  {order.spiceLevel && (
                    <span className="text-[10px] bg-terracotta-500/10 text-terracotta-600 border border-terracotta-500/30 px-2 py-0.5 rounded-full font-bold">
                      🌶️ {order.spiceLevel}
                    </span>
                  )}
                  {order.paymentMethod && (
                    <span
                      className={`text-[10px] px-2.5 py-0.5 rounded-full font-extrabold uppercase tracking-wider flex items-center gap-1 ${
                        order.paymentMethod === "easypaisa"
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : order.paymentMethod === "jazzcash"
                          ? "bg-red-100 text-red-800 border border-red-300"
                          : "bg-amber-100 text-amber-900 border border-amber-300"
                      }`}
                    >
                      {order.paymentMethod === "easypaisa"
                        ? "🟢 Easypaisa"
                        : order.paymentMethod === "jazzcash"
                        ? "🔴 JazzCash"
                        : "💵 Cash on Delivery"}
                    </span>
                  )}
                  {order.transactionId && (
                    <span className="text-[10px] bg-sand-200 text-charcoal-800 px-2 py-0.5 rounded-full font-mono font-bold">
                      TID: {order.transactionId}
                    </span>
                  )}
                </div>

                {/* Status Selector */}
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs font-bold text-charcoal-700/70 whitespace-nowrap">Status:</span>
                  <select
                    value={order.status}
                    disabled={updatingId === order.id}
                    onChange={(e) => handleStatusChange(order.id, e.target.value as OrderRecord["status"])}
                    className="bg-sand-100 border border-sand-300 rounded-xl px-3 py-1.5 text-xs font-bold text-charcoal-900 focus:outline-none focus:border-terracotta-500 cursor-pointer"
                  >
                    {statusOptions.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Middle Row: Customer Info & Items List */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5 py-4 items-start">
                {/* Customer Details */}
                <div className="md:col-span-4 space-y-1">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700/60">Customer</p>
                  <p className="font-display font-bold text-sm text-charcoal-900">{order.customerName}</p>
                  <div className="flex items-center gap-2 pt-1">
                    <a
                      href={`tel:${order.customerPhone}`}
                      className="inline-flex items-center gap-1 text-xs text-terracotta-500 hover:underline font-bold"
                    >
                      <Phone className="w-3 h-3" />
                      {order.customerPhone}
                    </a>
                  </div>
                  <p className="text-xs text-charcoal-700/75 mt-1">{order.address}</p>
                  {order.notes && (
                    <p className="text-[11px] bg-sand-100 p-2 rounded-xl text-charcoal-800 italic mt-2">
                      &quot;{order.notes}&quot;
                    </p>
                  )}
                </div>

                {/* Order Items */}
                <div className="md:col-span-8">
                  <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700/60 mb-2">
                    Items ({order.items.reduce((s, i) => s + i.qty, 0)})
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {order.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-2 bg-sand-100 rounded-xl border border-sand-200 flex items-center gap-2.5"
                      >
                        {item.image && (
                          <div className="relative w-10 h-10 rounded-lg overflow-hidden shrink-0">
                            <Image src={item.image} alt={item.name} fill sizes="40px" className="object-cover" />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <p className="text-xs font-bold text-charcoal-900 truncate">{item.name}</p>
                          <p className="text-[11px] text-charcoal-700/75">
                            Rs. {item.price.toLocaleString()} × {item.qty}
                          </p>
                        </div>
                        <span className="text-xs font-extrabold text-charcoal-900">
                          Rs. {(item.price * item.qty).toLocaleString()}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Bottom Row: Bill Summary & Quick Stepper */}
              <div className="pt-3 border-t border-sand-200 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-4 text-charcoal-700 font-semibold">
                  <span>Subtotal: Rs. {order.subtotal.toLocaleString()}</span>
                  {order.discount > 0 && <span className="text-emerald-700 font-bold">VIP Discount: -Rs. {order.discount.toLocaleString()}</span>}
                  <span>Delivery: {order.deliveryFee === 0 ? "FREE" : `Rs. ${order.deliveryFee}`}</span>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <span className="text-[10px] text-charcoal-700/60 uppercase font-bold block">Total Amount</span>
                    <span className="font-display font-extrabold text-base text-terracotta-500">
                      Rs. {order.total.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
