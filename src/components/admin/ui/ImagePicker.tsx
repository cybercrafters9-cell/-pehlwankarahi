"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Input } from "./Input";
import { Sparkles, Check } from "lucide-react";

export interface ImagePickerProps {
  label?: string;
  value: string;
  onChange: (url: string) => void;
  error?: string;
}

const foodPresets = [
  {
    name: "Chicken Karahi",
    url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Mutton Karahi",
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Chicken Mince Karahi",
    url: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Mutton Mince Karahi",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Boneless Chicken Karahi",
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Mutton Chops Karahi",
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",
  },
  {
    name: "Mutton Chops with Mince",
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Desi Murgh Karahi",
    url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
  },
  {
    name: "Mutton Muscles (Machli)",
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
  },
];

export function ImagePicker({ label = "Dish Image URL", value, onChange, error }: ImagePickerProps) {
  const [showPresets, setShowPresets] = useState(false);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setShowPresets(!showPresets)}
          className="text-[11px] font-bold text-terracotta-500 hover:text-terracotta-600 flex items-center gap-1 cursor-pointer"
        >
          <Sparkles className="w-3 h-3" />
          <span>{showPresets ? "Hide Preset Photos" : "Choose from Desi Presets"}</span>
        </button>
      </div>

      <div className="flex gap-3 items-center">
        {/* Thumbnail Preview */}
        <div className="relative w-16 h-16 rounded-2xl overflow-hidden bg-sand-200 border-2 border-sand-300 shrink-0 shadow-sm flex items-center justify-center">
          {value ? (
            <Image
              src={value}
              alt="Preview"
              fill
              sizes="64px"
              className="object-cover"
              onError={(e) => {
                // fallback
                (e.currentTarget as HTMLElement).style.display = "none";
              }}
            />
          ) : (
            <span className="text-[10px] font-bold text-charcoal-700/60">No Img</span>
          )}
        </div>

        {/* Input */}
        <div className="flex-1">
          <Input
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="https://images.unsplash.com/... or paste image URL"
            error={error}
          />
        </div>
      </div>

      {/* Preset Gallery */}
      {showPresets && (
        <div className="p-3 bg-sand-100 border border-sand-300 rounded-2xl space-y-2 animate-in fade-in duration-150">
          <p className="text-[11px] font-bold uppercase tracking-wider text-charcoal-700/80">
            Quick Select Desi HD Dish Photos:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {foodPresets.map((preset) => {
              const isSelected = value === preset.url;
              return (
                <button
                  type="button"
                  key={preset.name}
                  onClick={() => {
                    onChange(preset.url);
                    setShowPresets(false);
                  }}
                  className={`group relative h-16 rounded-xl overflow-hidden border-2 text-left transition-all cursor-pointer ${
                    isSelected ? "border-terracotta-500 shadow-md ring-2 ring-terracotta-500/30" : "border-sand-300 hover:border-charcoal-900"
                  }`}
                >
                  <Image src={preset.url} alt={preset.name} fill sizes="100px" className="object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-transparent to-transparent flex items-end p-1">
                    <span className="text-[9px] font-bold text-white truncate">{preset.name}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute top-1 right-1 w-4 h-4 rounded-full bg-terracotta-500 text-white flex items-center justify-center shadow">
                      <Check className="w-2.5 h-2.5" />
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
