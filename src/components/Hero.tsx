"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRestaurant } from "@/context/RestaurantContext";
import { Flame, Play, Star, Bike, Plus, Search, ChevronRight } from "lucide-react";

export default function Hero() {
  const { addToCart, setIsVideoOpen, setSearchQuery, setIsMenuModalOpen } = useRestaurant();
  const [localSearch, setLocalSearch] = useState("");

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const handleHeroSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setSearchQuery(localSearch);
    scrollTo("interactive-menu");
  };

  return (
    <section id="hero" className="grid grid-cols-1 lg:grid-cols-12 gap-5 lg:gap-8 items-center mb-6 sm:mb-8">
      {/* Left Column: Compact, Elegantly Aligned Editorial Typography */}
      <div className="lg:col-span-6 flex flex-col justify-center space-y-3.5 sm:space-y-4 pr-0 lg:pr-2">
        {/* Live Status Pill */}
        <div className="inline-flex items-center gap-2 bg-sand-200/80 border border-sand-300 w-fit px-3 py-1 rounded-full">
          <span className="w-2 h-2 rounded-full bg-terracotta-500 animate-ping" />
          <span className="text-[10px] sm:text-[11px] font-extrabold uppercase tracking-wider text-charcoal-800">
            Live Wok &amp; Garma Garam Karahi
          </span>
        </div>

        {/* Clean, Scaled Heading (Fits perfectly in 3 lines without giant vertical stretching) */}
        <h1 className="font-display font-extrabold text-2xl sm:text-3xl md:text-4xl lg:text-[2.35rem] xl:text-[2.75rem] leading-[1.08] tracking-tight text-charcoal-900 uppercase">
          Fresh &amp; Garma Garam <br />
          <span className="text-terracotta-500">Desi Karahi</span> For <br />
          Every Taste
        </h1>

        {/* Concise Description */}
        <p className="text-charcoal-700/85 text-xs sm:text-sm leading-relaxed max-w-lg">
          Asli Peshawari Mutton Karahi, Royal Chaamp, Machli Shank, and fresh Desi Murgh cooked live in pure desi ghee with vine tomatoes, ginger juliennes, and freshly cracked black pepper.
        </p>

        {/* Actions Button Row */}
        <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 pt-0.5">
          <button
            onClick={() => scrollTo("interactive-menu")}
            className="bg-charcoal-900 hover:bg-terracotta-500 text-white font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all shadow-md flex items-center gap-2 cursor-pointer"
          >
            <span>Order Now</span>
            <Flame className="w-4 h-4 text-saffron-400" />
          </button>

          <button
            onClick={() => setIsMenuModalOpen(true)}
            className="bg-sand-200/80 hover:bg-sand-300 text-charcoal-900 border border-charcoal-900/15 font-bold text-xs sm:text-sm px-5 sm:px-6 py-2.5 sm:py-3 rounded-full transition-all cursor-pointer"
          >
            View Menu
          </button>

          <button
            onClick={() => setIsVideoOpen(true)}
            title="Watch Live Karahi Tarka"
            className="w-10 h-10 rounded-full border border-charcoal-900/20 hover:border-terracotta-500 hover:bg-terracotta-500 hover:text-white flex items-center justify-center text-charcoal-900 transition-all cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 fill-current ml-0.5" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="pt-2 flex items-center gap-5 border-t border-sand-200/80 text-[11px] sm:text-xs text-charcoal-700/80">
          <div className="flex items-center gap-1.5">
            <Star className="w-3.5 h-3.5 fill-saffron-500 text-saffron-500" />
            <span>
              <strong className="text-charcoal-900">4.9/5</strong> (4.2k+ Desi Foodies)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Bike className="w-3.5 h-3.5 text-terracotta-500" />
            <span>
              <strong className="text-charcoal-900">30 Min</strong> Garam Delivery
            </span>
          </div>
        </div>
      </div>

      {/* Right Column: Balanced Terracotta Flat-Lay Card (Only Karahi Dishes) */}
      <div className="lg:col-span-6">
        <div className="relative h-[320px] sm:h-[370px] lg:h-[390px] w-full rounded-4xl hero-terracotta-surface p-4 sm:p-6 overflow-hidden shadow-card flex items-center justify-center">
          {/* Subtle Mandala Accent Ring */}
          <div
            className="absolute inset-0 opacity-15 pointer-events-none"
            style={{
              backgroundImage: "radial-gradient(circle at center, transparent 35%, rgba(255,255,255,0.2) 36%, transparent 37%)",
            }}
          />

          {/* Overhead Live Karahi Flat-Lay Composition */}
          <div className="relative w-full h-full">
            {/* Plate 1: Top-Left — Mutton Karahi */}
            <div
              onClick={() =>
                addToCart(
                  2,
                  "Mutton Karahi",
                  2850,
                  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80"
                )
              }
              className="cursor-pointer group absolute -top-1 left-2 sm:left-4 w-36 h-36 sm:w-44 sm:h-44 rounded-full bg-sand-50 p-2 shadow-2xl animate-float transition-transform"
            >
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80"
                  alt="Mutton Karahi"
                  fill
                  sizes="(max-width: 640px) 144px, 176px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="absolute bottom-1 right-1 bg-charcoal-900 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <span>Mutton Karahi</span>
                <Plus className="w-3 h-3 text-saffron-400" />
              </span>
            </div>

            {/* Plate 2: Top-Right — Chicken Karahi */}
            <div
              onClick={() =>
                addToCart(
                  1,
                  "Chicken Karahi",
                  1550,
                  "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80"
                )
              }
              className="cursor-pointer group absolute top-2 right-2 sm:right-4 w-32 h-32 sm:w-40 sm:h-40 rounded-full bg-sand-50 p-2 shadow-2xl animate-float-delayed transition-transform"
            >
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80"
                  alt="Chicken Karahi"
                  fill
                  sizes="(max-width: 640px) 128px, 160px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="absolute -bottom-1 left-2 bg-terracotta-500 text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <span>Chicken Karahi</span>
                <Plus className="w-3 h-3" />
              </span>
            </div>

            {/* Plate 3: Bottom-Center — Mutton Chops Karahi */}
            <div
              onClick={() =>
                addToCart(
                  6,
                  "Mutton Chops Karahi",
                  3200,
                  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85"
                )
              }
              className="cursor-pointer group absolute -bottom-3 left-10 sm:left-20 w-38 h-38 sm:w-48 sm:h-48 rounded-full bg-sand-50 p-2 shadow-2xl animate-float transition-transform"
            >
              <div className="relative w-full h-full rounded-full overflow-hidden">
                <Image
                  src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85"
                  alt="Mutton Chops Karahi"
                  fill
                  sizes="(max-width: 640px) 152px, 192px"
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <span className="absolute top-2 -right-1 bg-saffron-400 text-charcoal-900 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full shadow flex items-center gap-1">
                <span>Chops Karahi</span>
                <Plus className="w-3 h-3" />
              </span>
            </div>

            {/* Condiments */}
            <div
              className="hidden sm:flex absolute bottom-4 left-1 w-10 h-10 rounded-full bg-amber-900/90 border border-amber-300/60 items-center justify-center shadow-lg"
              title="Fresh Ginger & Lemon"
            >
              <span className="text-xs">🍋</span>
            </div>
            <div
              className="hidden sm:flex absolute top-1 left-[46%] w-9 h-9 rounded-full bg-emerald-900/80 border border-emerald-200/60 items-center justify-center shadow-lg"
              title="Fresh Coriander & Chilies"
            >
              <span className="text-xs">🌿</span>
            </div>

            {/* Floating Search Bar */}
            <form
              onSubmit={handleHeroSearchSubmit}
              className="absolute bottom-2 right-1 sm:bottom-3 sm:right-3 bg-sand-50/95 backdrop-blur-md rounded-full px-3.5 py-1.5 sm:py-2 shadow-xl flex items-center gap-2 sm:gap-3 border border-white/60 max-w-[240px] sm:max-w-[270px] w-full"
            >
              <Search className="w-3.5 h-3.5 text-charcoal-700 shrink-0" />
              <input
                type="text"
                placeholder="Search Karahi dishes..."
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                className="bg-transparent text-xs font-semibold text-charcoal-900 placeholder:text-charcoal-700/60 focus:outline-none w-full"
              />
              <button
                type="submit"
                aria-label="Search"
                className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-charcoal-900 text-white flex items-center justify-center shrink-0 hover:bg-terracotta-500 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
