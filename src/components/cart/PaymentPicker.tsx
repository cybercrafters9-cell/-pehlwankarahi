"use client";

import { useEffect } from "react";
import { Banknote, Check, Copy, ShieldCheck } from "lucide-react";
import { PaymentType, PAYMENT_ACCOUNTS, DigitalPaymentMethod } from "./types";
import { RestaurantSettings } from "@/services/api";

interface PaymentPickerProps {
  paymentMethod: PaymentType;
  setPaymentMethod: (method: PaymentType) => void;
  transactionId: string;
  setTransactionId: (val: string) => void;
  copiedAccount: string | null;
  onCopy: (text: string, label: string) => void;
  settings?: RestaurantSettings | null;
}

export default function PaymentPicker({
  paymentMethod,
  setPaymentMethod,
  transactionId,
  setTransactionId,
  copiedAccount,
  onCopy,
  settings,
}: PaymentPickerProps) {
  const easypaisaNumber = settings?.easypaisaNumber?.trim() || "03001234567";
  const jazzcashNumber = settings?.jazzcashNumber?.trim() || "03219876543";

  // Ensure selected method is always valid (easypaisa or jazzcash)
  useEffect(() => {
    if (paymentMethod !== "easypaisa" && paymentMethod !== "jazzcash") {
      setPaymentMethod("easypaisa");
    }
  }, [paymentMethod, setPaymentMethod]);

  const activeDigital = PAYMENT_ACCOUNTS[paymentMethod as DigitalPaymentMethod] || PAYMENT_ACCOUNTS.easypaisa;

  const rawNumber =
    activeDigital.id === "easypaisa"
      ? easypaisaNumber
      : jazzcashNumber;

  const accountTitle =
    settings?.paymentAccountTitle?.trim() || "Pehalwan Karahi & DeraGhar";

  return (
    <div className="space-y-3 pt-2 border-t border-sand-200">
      <div className="flex items-center justify-between">
        <h4 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
          <Banknote className="w-3.5 h-3.5 text-emerald-600" />
          <span>3. Digital Payment Method</span>
        </h4>
        <span className="text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-amber-700" />
          Advance Transfer
        </span>
      </div>

      <p className="text-[11px] text-charcoal-600 leading-relaxed">
        Select your preferred digital transfer method. Transfer the exact bill amount and send the payment screenshot via WhatsApp on the next screen to confirm your order.
      </p>

      {/* 2 Payment Methods: Easypaisa & JazzCash */}
      <div className="grid grid-cols-2 gap-2.5">
        {(["easypaisa", "jazzcash"] as const).map((key) => {
          const cfg = PAYMENT_ACCOUNTS[key];
          const isSelected = paymentMethod === key;

          return (
            <label
              key={cfg.id}
              onClick={() => setPaymentMethod(cfg.id)}
              className={`relative p-3 rounded-2xl border-2 flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? `${cfg.theme.cardActiveBorder} ${cfg.theme.cardActiveBg} shadow-sm`
                  : `border-sand-300 bg-white ${cfg.theme.cardHoverBg}`
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-extrabold text-white ${cfg.badgeBg} px-2.5 py-0.5 rounded-full`}>
                  {cfg.badgeLabel}
                </span>
                <input
                  type="radio"
                  name="payment"
                  checked={isSelected}
                  onChange={() => setPaymentMethod(cfg.id)}
                  className={cfg.theme.radioAccent}
                />
              </div>
              <div className="mt-2.5">
                <p className="font-extrabold text-xs text-charcoal-900">
                  {cfg.name}
                </p>
                <p className={`text-[10px] ${cfg.theme.subtitleColor} font-semibold mt-0.5`}>
                  Mobile Transfer
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Digital Account Transfer Details Sub-Panel */}
      <div className={`${activeDigital.theme.panelBg} border ${activeDigital.theme.panelBorder} rounded-2xl p-3.5 space-y-2.5 text-xs animate-in fade-in duration-200`}>
        <div className={`flex items-center justify-between ${activeDigital.theme.headerText} font-bold`}>
          <span>Official {activeDigital.name} Account:</span>
          <span className={`text-[10px] ${activeDigital.theme.badgeBg} text-white px-2 py-0.5 rounded-full`}>
            Verified Merchant
          </span>
        </div>

        <div className={`bg-white rounded-xl p-3 border ${activeDigital.theme.cardBorder} flex items-center justify-between`}>
          <div>
            <p className="text-[10px] text-charcoal-600 font-semibold">Account Title</p>
            <p className="font-bold text-xs text-charcoal-900">{accountTitle}</p>
            <p className={`font-mono font-extrabold text-sm ${activeDigital.theme.numberColor} mt-0.5`}>
              {rawNumber}
            </p>
          </div>
          <button
            type="button"
            onClick={() => onCopy(rawNumber, activeDigital.id)}
            className={`${activeDigital.theme.copyBtn} font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-[11px] cursor-pointer transition-colors`}
          >
            {copiedAccount === activeDigital.id ? (
              <>
                <Check className={`w-3.5 h-3.5 ${activeDigital.theme.checkIcon}`} />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy</span>
              </>
            )}
          </button>
        </div>

        <div>
          <label className={`block text-[11px] font-bold ${activeDigital.theme.headerText} mb-1`}>
            Transaction ID (TID) / Sender Number (Optional):
          </label>
          <input
            type="text"
            placeholder="e.g. TID 84920491 or Sender Mobile Number"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className={`w-full bg-white border ${activeDigital.theme.inputBorder} rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none`}
          />
          <p className="text-[10px] text-charcoal-500 mt-1">
            Note: You can also attach the payment receipt directly on WhatsApp after placing this order.
          </p>
        </div>
      </div>
    </div>
  );
}
