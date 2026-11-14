"use client";

import Image from "next/image";
import { CookingPot, Plus, Minus, ArrowRight } from "lucide-react";
import { CartItem } from "@/data/menu";
import { LoyaltyPassSummary } from "@/services/api";
import LoyaltyPassInput from "./LoyaltyPassInput";

interface CartStepProps {
  cart: CartItem[];
  updateQty: (id: number, delta: number) => void;
  isSubmittingOrder: boolean;
  subtotal: number;
  discount: number;
  totalAmount: number;
  loyaltyPhone: string;
  setLoyaltyPhone: (val: string) => void;
  loyaltyPass: LoyaltyPassSummary | null;
  loyaltyMessage: { type: "success" | "error"; text: string } | null;
  isCheckingLoyalty: boolean;
  onCheckLoyalty: () => void;
  onRemoveLoyalty: () => void;
  onProceed: () => void;
}

export default function CartStep({
  cart,
  updateQty,
  isSubmittingOrder,
  subtotal,
  discount,
  totalAmount,
  loyaltyPhone,
  setLoyaltyPhone,
  loyaltyPass,
  loyaltyMessage,
  isCheckingLoyalty,
  onCheckLoyalty,
  onRemoveLoyalty,
  onProceed,
}: CartStepProps) {
  return (
    <>
      <div className="p-5 flex-1 overflow-y-auto space-y-3">
        {cart.length === 0 ? (
          <div className="text-center py-16 text-charcoal-700/70">
            <CookingPot className="w-14 h-14 mx-auto text-terracotta-500 mb-2" />
            <p className="font-bold text-sm text-charcoal-900">Your Dastarkhwan is empty</p>
            <p className="text-xs mt-1">Add some sizzling Mutton or Chicken Karahi to get started!</p>
          </div>
        ) : (
          cart.map((item) => (
            <div
              key={item.id}
              className="bg-sand-50 border border-sand-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:border-sand-300 transition-all"
            >
              <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-charcoal-900">
                <Image src={item.image} alt={item.name} fill sizes="56px" className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-xs sm:text-sm text-charcoal-900 truncate">{item.name}</h4>
                <p className="text-xs font-extrabold text-terracotta-500 mt-0.5">
                  Rs. {(item.price * item.qty).toLocaleString()}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-sand-200/80 rounded-full px-2 py-1">
                <button
                  onClick={() => updateQty(item.id, -1)}
                  disabled={isSubmittingOrder}
                  className="w-5 h-5 rounded-full bg-white text-charcoal-900 flex items-center justify-center text-xs font-bold hover:bg-terracotta-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Minus className="w-3 h-3" />
                </button>
                <span className="text-xs font-extrabold w-4 text-center">{item.qty}</span>
                <button
                  onClick={() => updateQty(item.id, 1)}
                  disabled={isSubmittingOrder}
                  className="w-5 h-5 rounded-full bg-charcoal-900 text-white flex items-center justify-center text-xs font-bold hover:bg-terracotta-500 transition-colors cursor-pointer disabled:opacity-50"
                >
                  <Plus className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-5 py-2.5 bg-saffron-400/25 border-y border-saffron-400/40 flex items-center justify-between text-xs">
        <span className="font-bold text-charcoal-900">🌿 Free Fresh Podina Raita &amp; Salad with every order!</span>
        <span className="text-[10px] font-extrabold uppercase bg-charcoal-900 text-white px-2 py-0.5 rounded-full">
          Free
        </span>
      </div>

      <LoyaltyPassInput
        title="Shahi VIP Loyalty Pass"
        loyaltyPhone={loyaltyPhone}
        setLoyaltyPhone={setLoyaltyPhone}
        loyaltyPass={loyaltyPass}
        loyaltyMessage={loyaltyMessage}
        isCheckingLoyalty={isCheckingLoyalty}
        onCheckLoyalty={onCheckLoyalty}
        onRemoveLoyalty={onRemoveLoyalty}
      />

      <div className="p-5 sm:p-6 bg-sand-50 border-t border-sand-200 space-y-4">
        <div className="space-y-1.5 text-xs">
          <div className="flex justify-between text-charcoal-700">
            <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} Items)</span>
            <span className="font-bold">Rs. {subtotal.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-charcoal-700">
            <span>Hot Wok Delivery</span>
            <span className="font-bold text-emerald-700">FREE</span>
          </div>
          {discount > 0 && loyaltyPass && (
            <div className="flex justify-between text-emerald-700 font-bold">
              <span>👑 Shahi VIP Discount ({loyaltyPass.discountPercent}%)</span>
              <span>- Rs. {discount.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between text-base font-extrabold text-charcoal-900 pt-2 border-t border-sand-200">
            <span>Total Payable</span>
            <span className="text-terracotta-500">Rs. {totalAmount.toLocaleString()}</span>
          </div>
        </div>

        <button
          onClick={onProceed}
          disabled={cart.length === 0}
          className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-extrabold text-sm py-3.5 sm:py-4 rounded-full shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <span>Proceed to Checkout</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </>
  );
}
