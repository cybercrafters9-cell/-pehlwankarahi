"use client";

import { MapPin } from "lucide-react";
import { QUICK_AREAS } from "./types";

interface AddressSectionProps {
  address: string;
  onAddressChange: (val: string) => void;
  onQuickAreaSelect: (area: string) => void;
  error?: string;
}

export default function AddressSection({
  address,
  onAddressChange,
  onQuickAreaSelect,
  error,
}: AddressSectionProps) {
  return (
    <div className="space-y-3 pt-1">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
        <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
        <span>2. Delivery Address</span>
      </h4>

      <div>
        <label className="block text-[11px] font-bold text-charcoal-800 mb-1">
          Complete Street Address &amp; Sector <span className="text-terracotta-500">*</span>
        </label>
        <textarea
          rows={2}
          required
          placeholder="House / Flat #, Street #, Sector / Area name"
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          className={`w-full bg-white border ${
            error ? "border-red-500 ring-1 ring-red-500" : "border-sand-300"
          } rounded-xl px-3.5 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500 resize-none`}
        />
        {error && <p className="text-[10px] text-red-600 mt-0.5">{error}</p>}
      </div>

      <div>
        <span className="text-[10px] text-charcoal-700/80 font-bold block mb-1.5">
          Quick Area Selector:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {QUICK_AREAS.map((area) => (
            <button
              type="button"
              key={area}
              onClick={() => onQuickAreaSelect(area)}
              className="text-[10px] font-semibold bg-sand-200/90 hover:bg-sand-300 text-charcoal-900 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
            >
              + {area}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
