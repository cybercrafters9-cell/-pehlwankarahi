"use client";

import { Crown, Loader2 } from "lucide-react";
import { LoyaltyPassSummary } from "@/services/api";

interface LoyaltyPassInputProps {
  loyaltyPhone: string;
  setLoyaltyPhone: (v: string) => void;
  loyaltyPass: LoyaltyPassSummary | null;
  loyaltyMessage: { type: "success" | "error"; text: string } | null;
  isCheckingLoyalty: boolean;
  onCheckLoyalty: (phone?: string) => void;
  onRemoveLoyalty: () => void;
  title?: string;
  autofillPhone?: string;
  containerClassName?: string;
}

export default function LoyaltyPassInput({
  loyaltyPhone,
  setLoyaltyPhone,
  loyaltyPass,
  loyaltyMessage,
  isCheckingLoyalty,
  onCheckLoyalty,
  onRemoveLoyalty,
  title = "Shahi VIP Loyalty Pass",
  autofillPhone,
  containerClassName = "bg-sand-100 border-b border-sand-200 px-5 py-3",
}: LoyaltyPassInputProps) {
  return (
    <div className={containerClassName}>
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-extrabold text-charcoal-900 flex items-center gap-1">
          <Crown className="w-3.5 h-3.5 text-amber-600" />
          <span>{title}</span>
        </span>
        {loyaltyPass && (
          <button
            type="button"
            onClick={onRemoveLoyalty}
            className="text-[10px] text-red-600 hover:underline font-bold cursor-pointer"
          >
            Remove
          </button>
        )}
      </div>
      <div className="flex gap-2">
        <input
          type="tel"
          placeholder="Enter phone (e.g. 0300-1234567)"
          value={loyaltyPhone}
          onChange={(e) => setLoyaltyPhone(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), onCheckLoyalty())}
          className="flex-1 bg-white border border-sand-300 rounded-xl px-3 py-1.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
        />
        <button
          type="button"
          onClick={() => onCheckLoyalty()}
          disabled={!loyaltyPhone.trim() || isCheckingLoyalty}
          className="bg-charcoal-900 hover:bg-terracotta-500 text-white text-xs font-bold px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1"
        >
          {isCheckingLoyalty ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "Apply"}
        </button>
      </div>
      {autofillPhone && autofillPhone !== loyaltyPhone && !loyaltyPass && (
        <button
          type="button"
          onClick={() => {
            setLoyaltyPhone(autofillPhone);
            onCheckLoyalty(autofillPhone);
          }}
          className="text-[10px] text-terracotta-600 hover:underline font-semibold block cursor-pointer text-left mt-1"
        >
          Use contact phone ({autofillPhone})
        </button>
      )}
      {loyaltyMessage && (
        <p
          className={`text-[10px] mt-1 font-semibold ${
            loyaltyMessage.type === "success" ? "text-emerald-700" : "text-red-600"
          }`}
        >
          {loyaltyMessage.text}
        </p>
      )}
    </div>
  );
}
