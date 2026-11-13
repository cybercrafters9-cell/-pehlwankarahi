"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRestaurant } from "@/context/RestaurantContext";
import { Dish } from "@/data/menu";
import { X, Plus, ShoppingBag, Phone, Check } from "lucide-react";

export default function MenuModal() {
  const { isMenuModalOpen, setIsMenuModalOpen, dishes, addToCart, setIsCartOpen, cart } = useRestaurant();
  const [filter, setFilter] = useState<"all" | "mutton" | "chicken">("all");
  const [addedDishId, setAddedDishId] = useState<number | null>(null);

  const totalCartCount = cart.reduce((sum, item) => sum + item.qty, 0);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsMenuModalOpen(false);
      }
    };
    if (isMenuModalOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isMenuModalOpen, setIsMenuModalOpen]);

  if (!isMenuModalOpen) return null;

  const filteredDishes = dishes.filter((dish) => {
    if (filter === "all") return true;
    return dish.category === filter;
  });

  const handleAdd = (dish: Dish) => {
    addToCart(dish.name, dish.price, dish.image);
    setAddedDishId(dish.id);
    setTimeout(() => {
      setAddedDishId(null);
    }, 1200);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 md:p-8 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={() => setIsMenuModalOpen(false)}
    >
      {/* Modal Dialog Window */}
      <div
        className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-[2.2rem] sm:rounded-[3rem] overflow-hidden shadow-2xl border border-sand-300/20 bg-gradient-to-b from-[#441e15] via-[#33150e] to-[#240e09] text-white"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header Bar */}
        <div className="relative pt-6 sm:pt-8 px-5 sm:px-10 pb-4 shrink-0 text-center border-b border-white/10">
          {/* Close Button */}
          <button
            onClick={() => setIsMenuModalOpen(false)}
            aria-label="Close Menu"
            className="absolute top-5 right-5 sm:top-7 sm:right-7 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all cursor-pointer z-30"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Brand Logo in Header Top-Left */}
          <div className="absolute top-5 left-5 sm:top-7 sm:left-8 text-left hidden xs:block">
            <span className="font-serif italic font-bold text-base sm:text-lg tracking-tight text-white block leading-tight">
              Pehalwan
            </span>
            <span className="text-[10px] font-extrabold uppercase tracking-widest text-saffron-300 block">
              Karahi.
            </span>
          </div>

          {/* Subtitle & Giant 'MENU' Title matching reference image */}
          <div className="space-y-0.5">
            <p className="font-serif italic tracking-widest text-saffron-300 text-xs sm:text-sm font-semibold uppercase">
              Authentic Desi Style
            </p>
            <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl tracking-tight text-white uppercase drop-shadow-md">
              MENU
            </h1>
          </div>

          {/* Quick Category Filter Pills */}
          <div className="flex items-center justify-center gap-2 mt-4 pt-1">
            <button
              onClick={() => setFilter("all")}
              className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                filter === "all"
                  ? "bg-white text-charcoal-900 shadow-md font-extrabold"
                  : "bg-white/15 text-white/80 hover:bg-white/25"
              }`}
            >
              All Karahi ({dishes.length})
            </button>
            <button
              onClick={() => setFilter("mutton")}
              className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                filter === "mutton"
                  ? "bg-saffron-400 text-charcoal-900 shadow-md font-extrabold"
                  : "bg-white/15 text-white/80 hover:bg-white/25"
              }`}
            >
              Mutton Karahi
            </button>
            <button
              onClick={() => setFilter("chicken")}
              className={`text-xs font-bold px-4 py-1.5 rounded-full transition-all cursor-pointer ${
                filter === "chicken"
                  ? "bg-saffron-400 text-charcoal-900 shadow-md font-extrabold"
                  : "bg-white/15 text-white/80 hover:bg-white/25"
              }`}
            >
              Chicken Karahi
            </button>
          </div>
        </div>

        {/* Scrollable Dish List with Exact Alternating Design */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-8 md:px-12 py-6 sm:py-8 space-y-6 sm:space-y-8 scrollbar-thin scrollbar-thumb-white/20">
          {filteredDishes.map((dish, index) => {
            const isEven = index % 2 === 0;
            const isJustAdded = addedDishId === dish.id;

            return (
              <div
                key={dish.id}
                className="group flex flex-col sm:flex-row items-center w-full max-w-3xl mx-auto transition-transform hover:-translate-y-0.5"
              >
                {isEven ? (
                  /* =========================================
                     LAYOUT A: Circular Image on Left, White Capsule on Right
                     ========================================= */
                  <>
                    {/* Circular Food Platter Shot */}
                    <div className="relative w-28 h-28 sm:w-36 sm:h-36 md:w-40 md:h-40 rounded-full border-4 sm:border-[5px] border-sand-100 shadow-2xl overflow-hidden shrink-0 z-20 bg-charcoal-900 group-hover:scale-105 transition-transform duration-300">
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        sizes="(max-width: 640px) 120px, 160px"
                        className="object-cover"
                      />
                    </div>

                    {/* White Rounded Capsule Container */}
                    <div className="relative -mt-6 sm:mt-0 -ml-0 sm:-ml-12 md:-ml-14 flex-1 w-full sm:w-auto bg-sand-50/95 hover:bg-sand-50 rounded-3xl sm:rounded-full pt-8 pb-5 px-5 sm:py-5 sm:pl-16 sm:pr-6 md:pl-18 md:pr-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl border border-white/60 z-10 transition-all text-charcoal-900">
                      <div className="space-y-1 pr-0 sm:pr-4">
                        <div className="flex items-center gap-2">
                          <h3 className="font-display font-extrabold text-base sm:text-lg md:text-xl text-[#3d1810] tracking-wide uppercase leading-tight">
                            {dish.name}
                          </h3>
                        </div>
                        <p className="text-xs sm:text-[13px] text-charcoal-700/85 leading-relaxed line-clamp-2 max-w-md">
                          {dish.desc}
                        </p>
                      </div>

                      {/* Golden / Saffron Price Pill Button */}
                      <button
                        onClick={() => handleAdd(dish)}
                        className={`shrink-0 self-end sm:self-center px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer transition-all duration-200 ${
                          isJustAdded
                            ? "bg-emerald-600 text-white scale-105"
                            : "bg-[#cda463] hover:bg-[#dfb572] text-[#2c120a] hover:scale-105 active:scale-95"
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <span>Rs. {dish.price.toLocaleString()}</span>
                            <Plus className="w-3.5 h-3.5" />
                          </>
                        )}
                      </button>
                    </div>
                  </>
                ) : (
                  /* =========================================
                     LAYOUT B: White Capsule on Left, Circular Image on Right
                     ========================================= */
                  <>
                    {/* On Mobile: Image top first for natural visual hierarchy, on tablet/desktop it sits on the right */}
                    <div className="sm:hidden relative w-28 h-28 rounded-full border-4 border-sand-100 shadow-2xl overflow-hidden shrink-0 z-20 bg-charcoal-900 mb-[-1.5rem]">
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </div>

                    {/* White Rounded Capsule Container */}
                    <div className="relative -mr-0 sm:-mr-12 md:-mr-14 flex-1 w-full sm:w-auto bg-sand-50/95 hover:bg-sand-50 rounded-3xl sm:rounded-full pt-8 pb-5 px-5 sm:py-5 sm:pr-16 sm:pl-6 md:pr-18 md:pl-8 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xl border border-white/60 z-10 transition-all text-charcoal-900 order-2 sm:order-1">
                      {/* Golden / Saffron Price Pill Button */}
                      <button
                        onClick={() => handleAdd(dish)}
                        className={`shrink-0 self-start sm:self-center order-2 sm:order-1 px-4 sm:px-5 py-2 sm:py-2.5 rounded-full font-extrabold text-xs sm:text-sm flex items-center gap-1.5 shadow-md cursor-pointer transition-all duration-200 ${
                          isJustAdded
                            ? "bg-emerald-600 text-white scale-105"
                            : "bg-[#cda463] hover:bg-[#dfb572] text-[#2c120a] hover:scale-105 active:scale-95"
                        }`}
                      >
                        {isJustAdded ? (
                          <>
                            <Check className="w-3.5 h-3.5" />
                            <span>Added!</span>
                          </>
                        ) : (
                          <>
                            <Plus className="w-3.5 h-3.5" />
                            <span>Rs. {dish.price.toLocaleString()}</span>
                          </>
                        )}
                      </button>

                      <div className="space-y-1 text-left sm:text-right pl-0 sm:pl-4 order-1 sm:order-2">
                        <h3 className="font-display font-extrabold text-base sm:text-lg md:text-xl text-[#3d1810] tracking-wide uppercase leading-tight">
                          {dish.name}
                        </h3>
                        <p className="text-xs sm:text-[13px] text-charcoal-700/85 leading-relaxed line-clamp-2 max-w-md">
                          {dish.desc}
                        </p>
                      </div>
                    </div>

                    {/* Circular Food Platter Shot (Desktop Right) */}
                    <div className="hidden sm:block relative w-36 h-36 md:w-40 md:h-40 rounded-full border-[5px] border-sand-100 shadow-2xl overflow-hidden shrink-0 z-20 bg-charcoal-900 group-hover:scale-105 transition-transform duration-300 order-2">
                      <Image
                        src={dish.image}
                        alt={dish.name}
                        fill
                        sizes="(max-width: 640px) 120px, 160px"
                        className="object-cover"
                      />
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Modal Bottom Footer */}
        <div className="pt-3 pb-4 px-6 sm:px-10 shrink-0 border-t border-white/10 bg-black/20 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/80">
          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-saffron-400" />
            <span className="font-semibold tracking-wider">Order Helpline: 0300-1234567</span>
          </div>

          <div className="hidden md:block text-[11px] uppercase tracking-widest text-white/60 font-semibold">
            Pehalwan Karahi • Asli Desi Riwayat
          </div>

          {totalCartCount > 0 ? (
            <button
              onClick={() => {
                setIsMenuModalOpen(false);
                setIsCartOpen(true);
              }}
              className="bg-saffron-400 hover:bg-saffron-500 text-charcoal-950 font-bold px-4 py-1.5 rounded-full shadow flex items-center gap-2 cursor-pointer transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Checkout Cart ({totalCartCount})</span>
            </button>
          ) : (
            <span className="text-[11px] text-saffron-300/80">
              Click &quot;+&quot; on any Karahi to add directly to your order
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
