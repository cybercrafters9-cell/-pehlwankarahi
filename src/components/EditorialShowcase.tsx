"use client";

import Image from "next/image";
import { Flame, ShieldCheck } from "lucide-react";

export default function EditorialShowcase() {
  return (
    <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center mb-12 sm:mb-16 bg-sand-50/70 border border-sand-200 rounded-4xl p-5 sm:p-8 shadow-soft">
      {/* Left Side: Rounded Vertical Karahi Photo + Quality Guarantee Card */}
      <div className="lg:col-span-5 grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
        {/* Rounded Dish Image */}
        <div className="sm:col-span-7 h-[240px] sm:h-[260px] rounded-3xl overflow-hidden shadow-md relative group bg-charcoal-900">
          <Image
            src="/images/editorial-karahi.jpg"
            alt="Sizzling Pehlwan Mutton Karahi in cast-iron wok"
            fill
            loading="lazy"
            quality={80}
            sizes="(max-width: 640px) 100vw, 30vw"
            className="object-cover group-hover:scale-105 transition-transform duration-500"
          />
          <span className="absolute top-3 left-3 bg-charcoal-900/85 backdrop-blur-xs text-saffron-400 text-[10px] font-bold px-2.5 py-1 rounded-full border border-white/10">
            Signature Karahi
          </span>
        </div>

        {/* Sleek Mini Dark Quality Guarantee Card */}
        <div className="sm:col-span-5 flex flex-col justify-between space-y-3">
          <div>
            <span className="text-xs font-extrabold uppercase tracking-wider text-charcoal-900">
              Quality Guarantee<span className="text-terracotta-500">.</span>
            </span>
            <p className="text-[11px] text-charcoal-700/75 mt-0.5">
              100% pure organic desi ghee and fresh meat daily.
            </p>
          </div>

          <div className="bg-charcoal-900 text-white p-4 rounded-2xl shadow-lg border border-white/10 relative overflow-hidden">
            <div className="flex items-center justify-between mb-4">
              <span className="font-serif italic text-saffron-400 text-xs">Fresh to Order</span>
              <ShieldCheck className="w-4 h-4 text-saffron-400" />
            </div>
            <p className="text-[10px] uppercase tracking-widest text-white/60">Live Cast-Iron Wok</p>
            <p className="text-xs font-bold mt-0.5">Cooked Daily</p>
            <div className="mt-3 pt-2 border-t border-white/10 flex items-center justify-between text-[10px] text-saffron-400">
              <span>Pehlwan Karahi</span>
              <span className="font-bold text-white/80">Since 1973</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side: Editorial Heading + Feature Pills */}
      <div className="lg:col-span-7 lg:pl-6 space-y-4">
        <div className="inline-flex items-center gap-2 bg-terracotta-500/10 border border-terracotta-500/20 text-terracotta-600 text-[11px] font-extrabold uppercase tracking-widest px-3 py-1 rounded-full">
          <Flame className="w-3.5 h-3.5 text-terracotta-500" />
          <span>Pehlwan Karahi • Since 1973</span>
        </div>

        <h2 className="font-display font-extrabold text-2xl sm:text-4xl text-charcoal-900 leading-tight">
          Sizzling{" "}
          <span className="bg-gradient-to-r from-terracotta-600 via-terracotta-500 to-saffron-500 bg-clip-text text-transparent">
            Desi Karahis
          </span>{" "}
          <br />
          crafted fresh for every table
        </h2>

        <p className="text-charcoal-700/85 text-xs sm:text-sm leading-relaxed">
          At <span className="font-semibold text-charcoal-900">Pehlwan Karahi</span>, our kitchen is
          dedicated to one craft — authentic karahis. From rich{" "}
          <span className="font-semibold text-terracotta-600">Mutton &amp; Machli Karahi</span> to
          classic{" "}
          <span className="font-semibold text-saffron-500">Chicken &amp; Chops Karahi</span>, every
          wok is cooked live in pure desi ghee with fresh tomatoes, ginger, and hand-ground spices.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
          <div className="bg-terracotta-500/5 p-3 rounded-2xl border border-terracotta-500/20">
            <p className="font-display font-extrabold text-lg sm:text-xl text-terracotta-600">
              100%
            </p>
            <p className="text-[11px] font-semibold text-charcoal-800">Fresh Halal Meat Daily</p>
          </div>
          <div className="bg-sand-100 p-3 rounded-2xl border border-sand-200">
            <p className="font-display font-extrabold text-lg sm:text-xl text-charcoal-900">
              Desi Ghee
            </p>
            <p className="text-[11px] font-semibold text-charcoal-800">Hand-Ground Masala</p>
          </div>
          <div className="bg-saffron-500/10 p-3 rounded-2xl border border-saffron-500/25">
            <p className="font-display font-extrabold text-lg sm:text-xl text-saffron-500">
              Live Wok
            </p>
            <p className="text-[11px] font-semibold text-charcoal-800">Cast-Iron Karahi</p>
          </div>
        </div>
      </div>
    </section>
  );
}
