"use client";

import React from "react";
import { Loader2, ArrowRight, AlertCircle } from "lucide-react";
import { LoyaltyPassSummary, RestaurantSettings } from "@/services/api";
import { CheckoutFormData } from "./types";
import CustomerSection from "./CustomerSection";
import AddressSection from "./AddressSection";
import SpiceAndNotesSection from "./SpiceAndNotesSection";
import PaymentPicker from "./PaymentPicker";

interface CheckoutFormProps {
  formData: CheckoutFormData;
  updateField: <K extends keyof CheckoutFormData>(field: K, val: CheckoutFormData[K]) => void;
  setAddress: React.Dispatch<React.SetStateAction<string>>;
  subtotal: number;
  totalAmount: number;
  discount: number;
  cartItemsCount: number;
  spiceLevel: string;
  setSpiceLevel: (lvl: string) => void;
  copiedAccount: string | null;
  onCopy: (text: string, label: string) => void;
  loyaltyPhone: string;
  setLoyaltyPhone: (v: string) => void;
  loyaltyPass: LoyaltyPassSummary | null;
  loyaltyMessage: { type: "success" | "error"; text: string } | null;
  isCheckingLoyalty: boolean;
  onCheckLoyalty: (phone?: string) => void;
  onRemoveLoyalty: () => void;
  errors: { name?: string; phone?: string; address?: string };
  setErrors: React.Dispatch<React.SetStateAction<{ name?: string; phone?: string; address?: string }>>;
  onSubmit: (e: React.FormEvent) => void;
  isSubmittingOrder: boolean;
  settings?: RestaurantSettings | null;
}

export default function CheckoutForm({
  formData,
  updateField,
  setAddress,
  subtotal,
  totalAmount,
  discount,
  cartItemsCount,
  spiceLevel,
  setSpiceLevel,
  copiedAccount,
  onCopy,
  loyaltyPhone,
  setLoyaltyPhone,
  loyaltyPass,
  loyaltyMessage,
  isCheckingLoyalty,
  onCheckLoyalty,
  onRemoveLoyalty,
  errors,
  setErrors,
  onSubmit,
  isSubmittingOrder,
  settings,
}: CheckoutFormProps) {
  const { customerName, customerPhone, address, notes, paymentMethod, transactionId } = formData;

  const minOrder = settings?.minOrder ?? 0;
  const isBelowMin = minOrder > 0 && subtotal < minOrder;
  const diffMin = minOrder - subtotal;
  const isClosed = settings?.isAcceptingOrders === false;

  return (
    <form onSubmit={onSubmit} className="flex-1 flex flex-col justify-between overflow-hidden">
      <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
        {/* Quick Summary Pill */}
        <div className="bg-sand-200/70 border border-sand-300 rounded-2xl p-3 flex items-center justify-between text-xs">
          <div>
            <span className="text-charcoal-700/80 font-medium block">Total Payable</span>
            <span className="font-display font-extrabold text-base text-terracotta-500">
              Rs. {totalAmount.toLocaleString()}
            </span>
            {discount > 0 && loyaltyPass && (
              <span className="text-[10px] text-emerald-700 font-bold block">
                Includes {loyaltyPass.discountPercent}% VIP Discount (-Rs. {discount.toLocaleString()})
              </span>
            )}
          </div>
          <span className="bg-charcoal-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            {cartItemsCount} Karahi Items
          </span>
        </div>

        {/* 1. Customer Information */}
        <CustomerSection
          customerName={customerName}
          customerPhone={customerPhone}
          onUpdate={(field, val) => {
            updateField(field, val);
            if (field === "customerName" && errors.name) setErrors((p) => ({ ...p, name: undefined }));
            if (field === "customerPhone" && errors.phone) setErrors((p) => ({ ...p, phone: undefined }));
          }}
          nameError={errors.name}
          phoneError={errors.phone}
          loyaltyPhone={loyaltyPhone}
          setLoyaltyPhone={setLoyaltyPhone}
          loyaltyPass={loyaltyPass}
          loyaltyMessage={loyaltyMessage}
          isCheckingLoyalty={isCheckingLoyalty}
          onCheckLoyalty={onCheckLoyalty}
          onRemoveLoyalty={onRemoveLoyalty}
        />

        {/* 2. Delivery Address */}
        <AddressSection
          address={address}
          onAddressChange={(val) => {
            updateField("address", val);
            if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
          }}
          onQuickAreaSelect={(area) => {
            setAddress((prev) => (prev ? `${prev}, ${area}` : area));
            if (errors.address) setErrors((p) => ({ ...p, address: undefined }));
          }}
          error={errors.address}
        />

        {/* Spice Level & Cooking Instructions */}
        <SpiceAndNotesSection
          spiceLevel={spiceLevel}
          setSpiceLevel={setSpiceLevel}
          notes={notes}
          onNotesChange={(val) => updateField("notes", val)}
        />

        {/* 3. Payment Method */}
        <PaymentPicker
          paymentMethod={paymentMethod}
          setPaymentMethod={(method) => updateField("paymentMethod", method)}
          transactionId={transactionId}
          setTransactionId={(id) => updateField("transactionId", id)}
          copiedAccount={copiedAccount}
          onCopy={onCopy}
          settings={settings}
        />
      </div>

      {/* Bottom Submit Action Bar */}
      <div className="p-4 sm:p-5 bg-sand-50 border-t border-sand-200 shrink-0 space-y-2">
        {isClosed && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>We are currently closed for online orders. Call {settings?.phone || "0300-1234567"} to place an advance order.</span>
          </div>
        )}

        {!isClosed && isBelowMin && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Minimum order is PKR {minOrder}. Add PKR {diffMin} more to checkout.</span>
          </div>
        )}

        <div className="flex items-center justify-between text-xs font-bold text-charcoal-900">
          <div>
            <span>Total Amount:</span>
            {discount > 0 && loyaltyPass && (
              <span className="text-[10px] text-emerald-700 block font-normal">
                (Includes {loyaltyPass.discountPercent}% VIP discount)
              </span>
            )}
          </div>
          <span className="font-extrabold text-base text-terracotta-500">
            Rs. {totalAmount.toLocaleString()}
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmittingOrder || isClosed || isBelowMin}
          className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-extrabold text-sm py-3.5 rounded-full shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmittingOrder ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Dispatching to Live Wok...</span>
            </>
          ) : isClosed ? (
            <span>Online Orders Closed</span>
          ) : isBelowMin ? (
            <span>Minimum Order Rs. {minOrder}</span>
          ) : (
            <>
              <span>Confirm &amp; Place Order</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>
    </form>
  );
}
