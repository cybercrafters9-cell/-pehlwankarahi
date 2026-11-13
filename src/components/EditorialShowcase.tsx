"use client";

import React from "react";
import Image from "next/image";
import { useRestaurant } from "@/context/RestaurantContext";
import { Sparkles, Crown } from "lucide-react";

export default function EditorialShowcase() {
  const { activateLoyalty } = useRestaurant();

  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-12 sm:mb-16 bg-sand-50/70 border border-sand-200 rounded-4xl p-5 sm:p-8 shadow-soft">
      {/* Left Side: Rounded Vertical Platter Photo + Dark VIP Loyalty Card */}
      <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Rounded Dish Image */}
        <div className="sm:col-span-7 h-[240px] sm:h-[260px] rounded-3xl overflow-hidden shadow-md relative group">
          <Image
            src="https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?auto=format&fit=crop&w=600&q=80"
            alt="Shami & Seekh Kabab Platter"
            fill
            sizes="(max-width: 640px) 100vw, 30vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 bg-charcoal-900/80 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            Desi Tawa Fry
          </span>
        </div>

        {/* Sleek Mini Dark VIP Membership / Gift Card */}
        <div className="sm:col-span-5 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-charcoal-900">
              PehalwanPass<span className="text-terracotta-500">.</span>
            </span>
            <p className="text-[11px] text-charcoal-700/75 mt-0.5">
              Earn 15% Desi Cashback on every Family Karahi order.
            </p>
          </div>

          <div className="bg-charcoal-900 text-white p-4 rounded-2xl shadow-lg border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif italic text-saffron-400 text-xs">Shahi Member</span>
              <Crown className="w-4 h-4 text-saffron-400" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-white/60">Free Roghni Naan</p>
            <p className="text-xs font-bold mt-0.5">VIP Dawat Card</p>
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-saffron-400">
              <span>PKR 1,000 Bonus</span>
              <button
                onClick={() => activateLoyalty()}
                className="underline font-bold hover:text-white transition-colors cursor-pointer"
              >
                Activate
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Editorial Heading + Feature Pills */}
      <div className="lg:col-span-7 lg:pl-6 space-y-4">
        <div className="inline-flex items-center gap-2 text-terracotta-500 text-xs font-extrabold uppercase tracking-widest">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Khaas Pakistani Mehmaan Nawazi</span>
        </div>
        <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-charcoal-900 leading-tight">
          Fresh delicious desi food <br /> for every taste &amp; dawat
        </h2>
        <p className="text-charcoal-700/80 text-xs sm:text-sm leading-relaxed">
          Whether you crave the fiery kick of a Lahore Gawalmandi Tawa Chicken, the melt-in-your-mouth richness of Peshawari Namkeen Dumba Karahi, or smoky Bihari Kebabs wrapped in crisp Puri Paratha — every dish is cooked live in front of you.
        </p>

        <div className="grid grid-cols-3 gap-3 pt-2">
          <div className="bg-sand-100 p-3 rounded-2xl border border-sand-200">
            <p className="font-display font-extrabold text-lg sm:text-xl text-terracotta-500">100%</p>
            <p className="text-[11px] font-semibold text-charcoal-800">Fresh Halal Meat Daily</p>
          </div>
          <div className="bg-sand-100 p-3 rounded-2xl border border-sand-200">
            <p className="font-display font-extrabold text-lg sm:text-xl text-charcoal-900">25+ Spices</p>
            <p className="text-[11px] font-semibold text-charcoal-800">Hand-Ground Masala</p>
          </div>
          <div className="bg-sand-100 p-3 rounded-2xl border border-sand-200">
            <p className="font-display font-extrabold text-lg sm:text-xl text-saffron-500">Live Wok</p>
            <p className="text-[11px] font-semibold text-charcoal-800">Iron Karahi &amp; Koyla</p>
          </div>
        </div>
      </div>
    </section>
  );
}
