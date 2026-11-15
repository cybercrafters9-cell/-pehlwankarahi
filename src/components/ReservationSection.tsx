"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRestaurant } from "@/context/RestaurantContext";
import { useSlot } from "@/context/SiteContentContext";
import { PhoneCall, CheckCircle } from "lucide-react";

export default function ReservationSection() {
  const { showToast, addToCart, reserveTable, settings, dishes } = useRestaurant();
  const resSlot = useSlot("reservation.main", {
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=900&q=85",
    alt: "Sizzling Charcoal Sajji & Lemon Chops",
  });
  const dishRes = resSlot.dishId ? dishes.find((d) => d.id === resSlot.dishId) : null;
  const imgRes = resSlot.slot?.mediaId ? resSlot.url : (dishRes?.image || resSlot.url);
  const nameRes = dishRes ? dishRes.name : (resSlot.dishName || "Smoky Lamb Chops & Whole Sajji");
  const catRes = dishRes?.category || "Balochi & Peshawari Fusion";
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [form, setForm] = useState({
    name: "",
    phone: "",
    guests: "5-8 Guests (Rooftop Koyla Lawn)",
    time: "Tonight — 9:30 PM (Peak BBQ)",
  });

  const handleReservationSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.phone) return;
    setIsSubmitting(true);
    try {
      await reserveTable({
        name: form.name,
        phone: form.phone,
        guests: form.guests,
        timeSlot: form.time,
      });
      setForm({
        name: "",
        phone: "",
        guests: "5-8 Guests (Rooftop Koyla Lawn)",
        time: "Tonight — 9:30 PM (Peak BBQ)",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section id="reservation-section" className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-10">
      {/* Bottom-Left Card: Soft Cream Dawat / Table Booking Card */}
      <div className="lg:col-span-6 bg-sand-50 border border-sand-200 rounded-4xl p-6 sm:p-8 shadow-card flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-charcoal-700/70">
                Family Hall &amp; Rooftop Dera
              </span>
              <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-terracotta-500 mt-0.5">
                Reserve Your Dawat
              </h3>
            </div>
            <span className="bg-terracotta-500 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow">
              Instant Confirm
            </span>
          </div>

          <p className="text-xs sm:text-sm text-charcoal-700/80 mt-2">
            Book a private Charpai Takht or air-conditioned family cabin for birthdays, corporate dinners, or weekend Karahi nights.
          </p>

          {/* Interactive Booking Form Fields */}
          <form onSubmit={handleReservationSubmit} className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 mt-5">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                Your Name
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Hamza Tariq"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                className="w-full bg-sand-100 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-terracotta-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                Phone (WhatsApp)
              </label>
              <input
                type="tel"
                required
                maxLength={11}
                placeholder="03001234567"
                value={form.phone}
                onChange={(e) =>
                  setForm({
                    ...form,
                    phone: e.target.value.replace(/\D/g, "").slice(0, 11),
                  })
                }
                className="w-full bg-sand-100 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-terracotta-500"
              />
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                Guests &amp; Seating
              </label>
              <select
                value={form.guests}
                onChange={(e) => setForm({ ...form, guests: e.target.value })}
                className="w-full bg-sand-100 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-terracotta-500"
              >
                <option value="2-4 Guests (Indoor Family Hall)">2–4 Guests (Family Hall)</option>
                <option value="5-8 Guests (Rooftop Koyla Lawn)">5–8 Guests (Rooftop Koyla Lawn)</option>
                <option value="10+ Guests (Shahi Dera Takht)">10+ Guests (Shahi Dera Takht)</option>
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-charcoal-700 mb-1">
                Time Slot
              </label>
              <select
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full bg-sand-100 border border-sand-300 rounded-xl px-3.5 py-2.5 text-xs font-semibold focus:outline-none focus:border-terracotta-500"
              >
                <option value="Tonight — 8:00 PM">Tonight — 8:00 PM</option>
                <option value="Tonight — 9:30 PM (Peak BBQ)">Tonight — 9:30 PM (Peak BBQ)</option>
                <option value="Tomorrow — 2:00 PM Lunch">Tomorrow — 2:00 PM Lunch</option>
              </select>
            </div>

            {/* Bottom Dual Pill Buttons */}
            <div className="sm:col-span-2 flex flex-col sm:flex-row items-center gap-3 pt-3">
              {settings?.phone ? (
                <a
                  href={`tel:${settings.phone.replace(/\D/g, "")}`}
                  className="w-full sm:w-1/2 border border-charcoal-900/30 hover:bg-sand-200 text-charcoal-900 font-bold text-xs py-3.5 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer text-center"
                >
                  <PhoneCall className="w-4 h-4 text-terracotta-500" />
                  <span className="truncate">Call Helpline: {settings.phone}</span>
                </a>
              ) : null}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`${
                  settings?.phone ? "w-full sm:w-1/2" : "w-full"
                } bg-charcoal-900 hover:bg-terracotta-500 text-white font-bold text-xs py-3.5 rounded-full transition-colors shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70`}
              >
                <span>{isSubmitting ? "Confirming..." : "Confirm Table"}</span>
                <CheckCircle className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Bottom-Right Card: Dramatic Black Plate Showcase with Citrus & Herbs */}
      <div className="lg:col-span-6 bento-card relative min-h-[340px] rounded-4xl overflow-hidden bg-charcoal-900 shadow-card flex items-end p-6 sm:p-8 group">
        <Image
          src={imgRes}
          alt={nameRes}
          fill
          unoptimized={imgRes.includes("/api/media/")}
          sizes="(max-width: 1024px) 100vw, 50vw"
          className="zoom-img object-cover opacity-85"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900 via-charcoal-900/30 to-transparent" />

        {/* Signature Badge Top-Left */}
        <div className="absolute top-5 left-5 bg-charcoal-900/85 backdrop-blur-md border border-white/15 rounded-full px-3 py-1 flex items-center gap-1.5 text-xs text-white z-10">
          <span className="w-2 h-2 rounded-full bg-saffron-400 animate-pulse" />
          <span className="font-semibold text-white/90">Chef&apos;s Signature</span>
        </div>

        {/* Dish Details Overlay */}
        <div className="relative z-10 w-full flex flex-col sm:flex-row sm:items-end justify-between gap-4 text-white">
          <div>
            <span className="text-saffron-400 text-xs font-extrabold uppercase tracking-widest">
              {catRes}
            </span>
            <h3 className="font-display font-bold text-2xl sm:text-3xl mt-1">
              {nameRes}
            </h3>
            <p className="text-white/75 text-xs sm:text-sm mt-1 max-w-md">
              Marinated for 12 hours in roasted cumin, green papaya, and fresh lemon slices, slow-charred over fruitwood coals.
            </p>
          </div>
          {dishRes && (
            <button
              onClick={() =>
                addToCart(dishRes.id, dishRes.name, dishRes.price, imgRes)
              }
              className="shrink-0 bg-saffron-400 hover:bg-terracotta-500 hover:text-white text-charcoal-900 font-extrabold text-xs px-5 py-3.5 rounded-full shadow-lg transition-all cursor-pointer"
            >
              Add — Rs. {dishRes.price.toLocaleString()}
            </button>
          )}
        </div>
      </div>
    </section>
  );
}
