"use client";

import React from "react";
import { Loader2, AlertCircle, Clock, Send, AlertTriangle } from "lucide-react";
import { RestaurantSettings } from "@/services/api";
import { CheckoutFormData, getDeliverySchedule } from "./types";
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
  cartItemsCount: number;
  copiedAccount: string | null;
  onCopy: (text: string, label: string) => void;
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
  cartItemsCount,
  copiedAccount,
  onCopy,
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

  const deliverySchedule = getDeliverySchedule();

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
          </div>
          <span className="bg-charcoal-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
            {cartItemsCount} Karahi Items
          </span>
        </div>

        {/* Next Day Delivery Schedule Banner */}
        <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-3 flex items-start gap-2.5 text-xs">
          <Clock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-extrabold text-amber-950">Delivery Schedule:</span>
              <span className="font-bold text-amber-800 bg-amber-200/80 px-2 py-0.5 rounded-full text-[10px]">
                {deliverySchedule.etaText}
              </span>
            </div>
            <p className="text-[11px] text-amber-900/80 leading-relaxed">
              {deliverySchedule.policyNote}
            </p>
          </div>
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

        {/* Cooking & Delivery Notes */}
        <SpiceAndNotesSection
          notes={notes}
          onNotesChange={(val) => updateField("notes", val)}
        />

        {/* 3. Payment Method (Digital Only) */}
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
      <div className="p-4 sm:p-5 bg-sand-50 border-t border-sand-200 shrink-0 space-y-2.5">
        {isClosed && (
          <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <span>
              We are currently closed for online orders.
              {settings?.phone ? ` Call ${settings.phone} to place an advance order.` : ""}
            </span>
          </div>
        )}

        {!isClosed && isBelowMin && (
          <div className="p-2.5 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Minimum order is PKR {minOrder}. Add PKR {diffMin} more to checkout.</span>
          </div>
        )}

        {/* Compulsory WhatsApp Receipt Notice Box */}
        <div className="p-3 bg-amber-500/15 border-2 border-amber-500/50 rounded-2xl text-left space-y-1">
          <div className="flex items-center gap-1.5 text-amber-900 font-extrabold text-xs">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 animate-bounce" />
            <span>WhatsApp Payment Receipt Compulsory</span>
          </div>
          <p className="text-[11px] text-amber-950 font-medium leading-relaxed">
            Sending your payment screenshot on WhatsApp is <strong>strictly compulsory</strong> to confirm this order. Kitchen cooking will only start after receipt verification.
          </p>
        </div>

        <div className="flex items-center justify-between text-xs font-bold text-charcoal-900">
          <span>Total Payable:</span>
          <span className="font-extrabold text-base text-terracotta-500">
            Rs. {totalAmount.toLocaleString()}
          </span>
        </div>

        <button
          type="submit"
          disabled={isSubmittingOrder || isClosed || isBelowMin}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-4 rounded-full shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmittingOrder ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Placing Order...</span>
            </>
          ) : isClosed ? (
            <span>Online Orders Closed</span>
          ) : isBelowMin ? (
            <span>Minimum Order Rs. {minOrder}</span>
          ) : (
            <>
              <Send className="w-4 h-4" />
              <span>Place Order &amp; Confirm on WhatsApp</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}
