"use client";

import React from "react";
import Image from "next/image";
import { useRestaurant } from "@/context/RestaurantContext";
import { Plus, ArrowRight, ArrowUpRight, Flame } from "lucide-react";

export default function BentoGrid() {
  const { addToCart, setSelectedCategory } = useRestaurant();

  const scrollToMenu = (cat?: string) => {
    if (cat) setSelectedCategory(cat);
    const el = document.getElementById("interactive-menu");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section id="bento-specials" className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-10 sm:mb-14">
      {/* LEFT COLUMN OF BENTO (Span 6): Large Overhead Dish Card + Bottom Gradient Promo Banner */}
      <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
        {/* Top-Left Card: Large Dark Plate Overhead Shot */}
        <div className="bento-card relative h-[340px] sm:h-[390px] rounded-4xl overflow-hidden bg-charcoal-900 shadow-card group">
          <Image
            src="https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85"
            alt="Royal Pakistani BBQ & Karahi Feast"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="zoom-img object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/20 to-transparent" />

          {/* Top Floating Tag */}
          <div className="absolute top-5 left-5 flex items-center gap-2 bg-charcoal-900/80 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/15">
            <span className="w-2 h-2 rounded-full bg-saffron-400" />
            <span>Chef&apos;s Signature Koyla Platter</span>
          </div>

          {/* Price Pill Top Right */}
          <div className="absolute top-5 right-5 bg-terracotta-500 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg">
            Rs. 3,200
          </div>

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
            <div>
              <span className="text-saffron-400 text-xs font-bold uppercase tracking-widest">
                Special Royal Chaamp
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-0.5">
                Pehalwan Mutton Chops Karahi
              </h2>
              <p className="text-white/75 text-xs sm:text-sm mt-1 line-clamp-1">
                Succulent mutton rib chops braised &amp; wok-fried in rich desi ghee with black pepper.
              </p>
            </div>
            <button
              onClick={() =>
                addToCart(
                  "Mutton Chops Karahi",
                  3200,
                  "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80"
                )
              }
              className="shrink-0 bg-white hover:bg-saffron-400 text-charcoal-900 font-extrabold text-xs px-4 py-3 rounded-full shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Order Chops Karahi</span>
              <Plus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Bottom-Left Card: Wide Dark-to-Terracotta Gradient Promo Card */}
        <div className="bento-card reference-promo-gradient rounded-4xl p-6 sm:p-7 text-white shadow-card relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 min-h-[175px]">
          {/* Left Side */}
          <div className="space-y-2 max-w-[230px]">
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-full text-saffron-400">
              Weekend Dawat Deal
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl leading-tight">
              Desi Shinwari <br /> Mutton Karahi
            </h3>
            <p className="text-white/75 text-xs">
              Fresh 1 Kg dumba meat cooked live in pure animal fat and ripe tomatoes.
            </p>
            <button
              onClick={() =>
                addToCart(
                  "Mutton Karahi",
                  2850,
                  "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80"
                )
              }
              className="mt-2 bg-terracotta-500 hover:bg-white hover:text-charcoal-900 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors inline-flex items-center gap-1.5 shadow cursor-pointer"
            >
              <span>Order Mutton Karahi</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Right Side */}
          <div className="sm:border-l sm:border-white/20 sm:pl-6 max-w-[240px]">
            <p className="font-serif italic text-saffron-400 text-sm">Garma Garam Tandoor</p>
            <h4 className="font-display font-bold text-lg sm:text-xl leading-snug mt-0.5">
              100% Pure Chakki &amp; Desi Ghee Tarka
            </h4>
            <p className="text-white/80 text-xs mt-1.5 leading-relaxed">
              Freshly slaughtered halal meat cooked to order in traditional iron woks over roaring wood fire.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN OF BENTO (Span 6): 2x2 Sub-Grid */}
      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {/* Sub-Card 1 (Top-Left): Clay Handi & Desi Chai */}
        <div className="bento-card relative h-[265px] rounded-4xl overflow-hidden bg-charcoal-800 shadow-card group">
          <Image
            src="https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80"
            alt="Matka Handi & Garlic Naan"
            fill
            sizes="(max-width: 640px) 100vw, 25vw"
            className="zoom-img object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/85 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-saffron-400 font-bold">
                Organic Desi Ghee
              </span>
              <h4 className="font-bold text-sm sm:text-base">Desi Murgh Karahi</h4>
            </div>
            <button
              onClick={() =>
                addToCart(
                  "Desi Murgh Karahi",
                  2400,
                  "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80"
                )
              }
              className="w-9 h-9 rounded-full bg-terracotta-500 text-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sub-Card 2 (Top-Right): Warm Saffron Gold Card */}
        <div className="bento-card h-[265px] rounded-4xl bg-saffron-400 p-6 flex flex-col justify-between text-charcoal-900 shadow-card">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-charcoal-900/10 px-2.5 py-1 rounded-full">
              Peshawari Riwayat
            </span>
            <h3 className="font-display font-extrabold text-xl sm:text-2xl leading-tight mt-3">
              Asli Koyla &amp; <br /> Desi Ghee Zaiqa
            </h3>
            <p className="text-charcoal-900/80 text-xs mt-2 leading-relaxed">
              No artificial colors or packet masalas — just black pepper, vine-ripened tomatoes, green chilies, and organic desi ghee.
            </p>
          </div>
          <button
            onClick={() => scrollToMenu("karahi")}
            className="w-full bg-charcoal-900 hover:bg-terracotta-500 text-white font-bold text-xs py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Karahi Menu</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Card 3 (Bottom-Left): Deep Charcoal Card */}
        <div className="bento-card h-[265px] rounded-4xl bg-charcoal-900 p-6 flex flex-col justify-between text-white shadow-card">
          <div>
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/10 text-saffron-400 px-2.5 py-1 rounded-full">
              Mutton Shank Special
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl leading-tight mt-3">
              Mutton Muscles <br /> (Machli) Karahi
            </h3>
            <p className="text-white/70 text-xs mt-2 leading-relaxed">
              Tender bone-in shank muscle meat infused with rich bone marrow juices and mild roasted tarka.
            </p>
          </div>
          <button
            onClick={() =>
              addToCart(
                "Mutton Muscles (Machli) Karahi",
                3100,
                "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80"
              )
            }
            className="w-full bg-terracotta-500 hover:bg-saffron-400 hover:text-charcoal-900 text-white font-bold text-xs py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Order Machli Karahi</span>
            <Flame className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Card 4 (Bottom-Right): Overhead Dark Bowls Shot */}
        <div className="bento-card relative h-[265px] rounded-4xl overflow-hidden bg-charcoal-800 shadow-card group">
          <Image
            src="https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80"
            alt="Boneless Chicken Karahi"
            fill
            sizes="(max-width: 640px) 100vw, 25vw"
            className="zoom-img object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/85 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-saffron-400 font-bold">
                Tender &amp; Juicy
              </span>
              <h4 className="font-bold text-sm sm:text-base">Boneless Chicken Karahi</h4>
            </div>
            <button
              onClick={() =>
                addToCart(
                  "Boneless Chicken Karahi",
                  1750,
                  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80"
                )
              }
              className="w-9 h-9 rounded-full bg-saffron-400 text-charcoal-900 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
