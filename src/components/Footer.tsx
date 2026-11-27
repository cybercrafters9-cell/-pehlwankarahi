"use client";

import { useRestaurant } from "@/context/RestaurantContext";
import { resolveImageUrl } from "@/lib/media";
import {
  Phone,
  Flame,
  ArrowUp,
  CookingPot,
  CheckCircle2,
} from "lucide-react";

export default function Footer() {
  const { setIsMenuModalOpen, settings, dishes } = useRestaurant();

  const availableDishes = dishes.filter((d) => d.isAvailable !== false).slice(0, 7);
  const hasEasypaisa = Boolean(settings?.easypaisaNumber?.trim());
  const hasJazzCash = Boolean(settings?.jazzcashNumber?.trim());
  const hasBank = Boolean(
    settings?.bankAccountNumber?.trim() ||
      settings?.bankIban?.trim() ||
      settings?.bankName?.trim()
  );

  const cleanPhone = (p: string) => p.replace(/\D/g, "");
  const cleanWa = (p: string) => {
    const digits = p.replace(/\D/g, "");
    return digits.startsWith("0") ? `92${digits.slice(1)}` : digits;
  };

  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="mt-14 sm:mt-20">
      {/* =========================================================
          TOP BANNER: Grand Dawat & Live Kitchen Callout
          ========================================================= */}
      <div className="relative rounded-4xl bg-gradient-to-r from-terracotta-600 via-terracotta-500 to-[#92331f] text-white p-6 sm:p-10 mb-6 shadow-xl overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Subtle decorative background circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-black/15 blur-xl pointer-events-none" />

        <div className="relative z-10 space-y-1.5 text-center md:text-left">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold text-saffron-300">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Live Wok &amp; Charcoal Grill Active Daily</span>
          </div>
          <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-white tracking-tight">
            Craving Authentic Sizzling Karahi?
          </h3>
          <p className="text-white/85 text-xs sm:text-sm max-w-xl">
            Order your favorite Mutton, Chops, or Desi Chicken Karahi before 7:00 PM to get your order confirmed and delivered the next day.
          </p>
        </div>

        <div className="relative z-10 flex flex-wrap items-center gap-3 shrink-0">
          <button
            onClick={() => setIsMenuModalOpen(true)}
            className="bg-charcoal-900 hover:bg-white hover:text-charcoal-900 text-white font-extrabold text-xs sm:text-sm px-6 py-3.5 rounded-full shadow-lg transition-all cursor-pointer"
          >
            View Official Menu
          </button>
          <button
            onClick={() => {
              const el = document.getElementById("interactive-menu");
              if (el) el.scrollIntoView({ behavior: "smooth" });
            }}
            className="bg-white/20 hover:bg-white text-white hover:text-charcoal-900 font-bold text-xs sm:text-sm px-5 py-3.5 rounded-full transition-all cursor-pointer border border-white/30"
          >
            Order Online Now
          </button>
        </div>
      </div>

      {/* =========================================================
          MAIN FOOTER: 4-Column Editorial Brand Layout
          ========================================================= */}
      <div className="rounded-4xl bg-charcoal-900 text-white p-8 sm:p-12 border border-charcoal-800 shadow-2xl relative overflow-hidden">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 left-1/4 w-96 h-32 bg-terracotta-500/10 blur-3xl pointer-events-none" />

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-white/10">
          {/* Column 1: Brand Heritage (Span 5) */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <div className="mb-3 inline-flex items-center bg-sand-100/95 px-4 py-2.5 rounded-2xl shadow-md">
                <img
                  src={settings?.logoUrl ? resolveImageUrl(settings.logoUrl) : "/logo.png"}
                  alt={settings?.restaurantName || "Pehlwan Karahi"}
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = "/logo.png";
                  }}
                  className="h-14 sm:h-16 w-auto max-w-[240px] object-contain"
                />
              </div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-saffron-400 block mt-1">
                From Pack to Plate – Just Heat &amp; Enjoy!
              </span>
            </div>

            <p className="text-xs text-white/70 leading-relaxed max-w-sm">
              Authentic Pakistani live-wok karahi seared over glowing coals with pure organic desi ghee, vine-ripened tomatoes, and hand-pounded spices. Every single order is cooked fresh to order in pure cast-iron karahis.
            </p>

            <div className="space-y-2 pt-1 text-xs">
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>100% Halal Fresh Slaughtered Meat</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Pure Desi Ghee &amp; Butter Tempering</span>
              </div>
              <div className="flex items-center gap-2 text-white/90">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>No Artificial Flavors or Preservatives</span>
              </div>
            </div>
          </div>

          {/* Column 2: Dynamic Menu Created by Admin (Span 4) */}
          <div className="lg:col-span-4 space-y-3.5">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-saffron-400 flex items-center gap-1.5">
              <CookingPot className="w-4 h-4 text-terracotta-500" />
              <span>Our Menu</span>
            </h4>
            {availableDishes.length > 0 ? (
              <ul className="space-y-2 text-xs text-white/75">
                {availableDishes.map((dish) => (
                  <li key={dish.id}>
                    <button
                      onClick={() => setIsMenuModalOpen(true)}
                      className="w-full flex items-center justify-between gap-3 hover:text-terracotta-400 transition-colors text-left cursor-pointer group"
                    >
                      <span className="truncate group-hover:translate-x-0.5 transition-transform">
                        {dish.name}
                      </span>
                      <span className="text-[11px] font-mono text-saffron-400/90 shrink-0">
                        Rs. {dish.price.toLocaleString()}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-white/55">
                Menu items will appear here once added in Admin Panel.
              </p>
            )}
          </div>

          {/* Column 3: Helplines & Dynamic Payment Methods (Span 3) */}
          <div className="lg:col-span-3 space-y-3.5">
            <h4 className="font-display font-bold text-sm uppercase tracking-wider text-saffron-400 flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-terracotta-500" />
              <span>Order Helplines</span>
            </h4>

            <div className="space-y-2 text-xs">
              {settings?.phone && (
                <a
                  href={`tel:${cleanPhone(settings.phone)}`}
                  className="block p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors text-white font-mono font-bold"
                >
                  <span className="text-[10px] text-white/60 block font-sans font-medium">UAN Delivery:</span>
                  {settings.phone}
                </a>
              )}
              {settings?.whatsapp && (
                <a
                  href={`https://wa.me/${cleanWa(settings.whatsapp)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 transition-colors font-mono font-bold border border-emerald-500/20"
                >
                  <span className="text-[10px] text-emerald-400/80 block font-sans font-medium">WhatsApp Orders:</span>
                  {settings.whatsapp}
                </a>
              )}
              {settings?.landline && (
                <div className="p-2 rounded-xl bg-white/5 text-white/80 font-mono text-[11px]">
                  <span className="text-[10px] text-white/60 block font-sans font-medium">Landline Desk:</span>
                  {settings.landline}
                </div>
              )}
              {!settings?.phone && !settings?.whatsapp && !settings?.landline && (
                <p className="text-[11px] text-white/50">Helpline details offline.</p>
              )}
            </div>

            {/* Payment Methods */}
            <div className="pt-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-white/60 block mb-1.5">
                Payment Methods:
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px] font-bold">
                <span className="bg-white/10 px-2.5 py-1 rounded-full text-white/85">
                  💵 Cash on Delivery
                </span>
                {hasEasypaisa && (
                  <span className="bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-full">
                    🟢 Easypaisa
                  </span>
                )}
                {hasJazzCash && (
                  <span className="bg-red-600/30 text-red-300 border border-red-500/30 px-2.5 py-1 rounded-full">
                    🔴 JazzCash
                  </span>
                )}
                {hasBank && (
                  <span className="bg-blue-600/30 text-blue-300 border border-blue-500/30 px-2.5 py-1 rounded-full">
                    🏦 Bank Transfer
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* =========================================================
            BOTTOM SUB-FOOTER: Copyright, Admin Link & Scroll Top
            ========================================================= */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-white/60">
          <div className="flex items-center gap-2">
            <span>© 2026 Pehlwan Karahi. Authentic Pakistani Karahi House.</span>
            <span className="hidden sm:inline">•</span>
            <span className="hidden sm:inline text-white/40">Made with ❤️ for Desi Foodies</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Scroll to Top Button */}
            <button
              onClick={scrollToTop}
              title="Back to Top"
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-terracotta-500 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <ArrowUp className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}
