"use client";

import { User, Phone } from "lucide-react";

interface CustomerSectionProps {
  customerName: string;
  customerPhone: string;
  onUpdate: (field: "customerName" | "customerPhone", val: string) => void;
  nameError?: string;
  phoneError?: string;
}

export default function CustomerSection({
  customerName,
  customerPhone,
  onUpdate,
  nameError,
  phoneError,
}: CustomerSectionProps) {
  return (
    <div className="space-y-3">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
        <User className="w-3.5 h-3.5 text-terracotta-500" />
        <span>1. Your Information</span>
      </h4>

      <div>
        <label className="block text-[11px] font-bold text-charcoal-800 mb-1">
          Full Name <span className="text-terracotta-500">*</span>
        </label>
        <input
          type="text"
          required
          placeholder="e.g. Tariq Mehmood"
          value={customerName}
          onChange={(e) => onUpdate("customerName", e.target.value)}
          className={`w-full bg-white border ${
            nameError ? "border-red-500 ring-1 ring-red-500" : "border-sand-300"
          } rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500`}
        />
        {nameError && <p className="text-[10px] text-red-600 mt-0.5">{nameError}</p>}
      </div>

      <div>
        <label className="block text-[11px] font-bold text-charcoal-800 mb-1">
          Mobile / WhatsApp Number (Strictly 11 Digits) <span className="text-terracotta-500">*</span>
        </label>
        <div className="relative">
          <input
            type="tel"
            required
            maxLength={11}
            placeholder="03001234567"
            value={customerPhone}
            onChange={(e) => {
              const digitsOnly = e.target.value.replace(/\D/g, "").slice(0, 11);
              onUpdate("customerPhone", digitsOnly);
            }}
            className={`w-full bg-white border ${
              phoneError ? "border-red-500 ring-1 ring-red-500" : "border-sand-300"
            } rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500 font-medium tracking-wide`}
          />
          <Phone className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-3" />
        </div>
        {phoneError ? (
          <p className="text-[10px] text-red-600 mt-0.5">{phoneError}</p>
        ) : (
          <p className="text-[10px] text-charcoal-500 mt-0.5">
            Format: 11 digits starting with 03 (e.g. 03001234567)
          </p>
        )}
      </div>
    </div>
  );
}
