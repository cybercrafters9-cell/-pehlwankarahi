"use client";

import React from "react";
import { useRestaurant } from "@/context/RestaurantContext";

export default function ToastContainer() {
  const { toasts } = useRestaurant();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-50 pointer-events-none flex flex-col items-center gap-2 max-w-sm w-full px-4">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="bg-charcoal-900 text-white text-xs sm:text-sm font-bold px-5 py-3 rounded-full shadow-2xl border border-saffron-400/40 flex items-center gap-2.5 transition-all animate-bounce"
        >
          <span className="w-2 h-2 rounded-full bg-terracotta-500 shrink-0" />
          <span className="truncate">{toast.message}</span>
        </div>
      ))}
    </div>
  );
}
