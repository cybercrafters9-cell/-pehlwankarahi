"use client";

import { CookingPot, X, ArrowLeft } from "lucide-react";
import { DrawerStep } from "./types";

interface CartHeaderProps {
  step: DrawerStep;
  onBack: () => void;
  onClose: () => void;
}

const STEP_TITLES: Record<DrawerStep, { title: string; subtitle: string }> = {
  cart: {
    title: "Your Desi Dastarkhwan",
    subtitle: "Review your sizzling Karahi selections",
  },
  checkout: {
    title: "Customer Details & Payment",
    subtitle: "Enter delivery address & select payment method",
  },
  success: {
    title: "Order Confirmed!",
    subtitle: "Dispatched to live wok & tandoor",
  },
};

export default function CartHeader({ step, onBack, onClose }: CartHeaderProps) {
  const { title, subtitle } = STEP_TITLES[step];

  return (
    <div className="p-5 sm:p-6 bg-charcoal-900 text-white flex items-center justify-between shrink-0">
      <div className="flex items-center gap-3">
        {step === "checkout" ? (
          <button
            onClick={onBack}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
            title="Back to Cart"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        ) : (
          <CookingPot className="w-7 h-7 text-saffron-400" />
        )}

        <div>
          <h3 className="font-display font-bold text-base sm:text-lg">{title}</h3>
          <p className="text-[11px] text-white/70">{subtitle}</p>
        </div>
      </div>

      <button
        onClick={onClose}
        aria-label="Close Cart"
        className="w-9 h-9 rounded-full bg-white/10 hover:bg-terracotta-500 flex items-center justify-center transition-colors cursor-pointer"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
