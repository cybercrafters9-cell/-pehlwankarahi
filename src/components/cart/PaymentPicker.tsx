"use client";

import { Banknote, Check, Copy } from "lucide-react";
import { PaymentType, PAYMENT_ACCOUNTS, DigitalPaymentMethod } from "./types";

interface PaymentPickerProps {
  paymentMethod: PaymentType;
  setPaymentMethod: (method: PaymentType) => void;
  transactionId: string;
  setTransactionId: (val: string) => void;
  copiedAccount: string | null;
  onCopy: (text: string, label: string) => void;
}

export default function PaymentPicker({
  paymentMethod,
  setPaymentMethod,
  transactionId,
  setTransactionId,
  copiedAccount,
  onCopy,
}: PaymentPickerProps) {
  const activeDigital = paymentMethod !== "cod" ? PAYMENT_ACCOUNTS[paymentMethod as DigitalPaymentMethod] : null;

  return (
    <div className="space-y-3 pt-2 border-t border-sand-200">
      <h4 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
        <Banknote className="w-3.5 h-3.5 text-emerald-600" />
        <span>3. Payment Method</span>
      </h4>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {/* Cash on Delivery */}
        <label
          onClick={() => setPaymentMethod("cod")}
          className={`relative p-3 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
            paymentMethod === "cod" ? "border-charcoal-900 bg-sand-50 shadow-sm" : "border-sand-300 bg-white hover:bg-sand-50"
          }`}
        >
          <div className="flex items-center justify-between">
            <Banknote className="w-5 h-5 text-emerald-700" />
            <input
              type="radio"
              name="payment"
              checked={paymentMethod === "cod"}
              onChange={() => setPaymentMethod("cod")}
              className="accent-charcoal-900"
            />
          </div>
          <div className="mt-2">
            <p className="font-extrabold text-xs text-charcoal-900">Cash on Delivery</p>
            <p className="text-[10px] text-charcoal-600 mt-0.5">Pay upon arrival</p>
          </div>
        </label>

        {/* Digital Methods (Easypaisa & JazzCash) from config */}
        {(["easypaisa", "jazzcash"] as const).map((key) => {
          const cfg = PAYMENT_ACCOUNTS[key];
          const isSelected = paymentMethod === key;
          return (
            <label
              key={cfg.id}
              onClick={() => setPaymentMethod(cfg.id)}
              className={`relative p-3 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                isSelected ? `${cfg.theme.cardActiveBorder} ${cfg.theme.cardActiveBg} shadow-sm` : `border-sand-300 bg-white ${cfg.theme.cardHoverBg}`
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-xs font-extrabold text-white ${cfg.badgeBg} px-2 py-0.5 rounded-full`}>
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
              <div className="mt-2">
                <p className="font-extrabold text-xs text-charcoal-900">{cfg.name}</p>
                <p className={`text-[10px] ${cfg.theme.subtitleColor} font-semibold mt-0.5`}>Mobile Transfer</p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Data-Driven Digital Account Instructions Sub-Panel */}
      {activeDigital && (
        <div className={`${activeDigital.theme.panelBg} border ${activeDigital.theme.panelBorder} rounded-2xl p-3.5 space-y-2 text-xs animate-in fade-in duration-200`}>
          <div className={`flex items-center justify-between ${activeDigital.theme.headerText} font-bold`}>
            <span>Official {activeDigital.name} Account:</span>
            <span className={`text-[10px] ${activeDigital.theme.badgeBg} text-white px-2 py-0.5 rounded-full`}>Verified</span>
          </div>
          <div className={`bg-white rounded-xl p-2.5 border ${activeDigital.theme.cardBorder} flex items-center justify-between`}>
            <div>
              <p className="text-[10px] text-charcoal-600 font-semibold">Account Title</p>
              <p className="font-bold text-xs text-charcoal-900">{activeDigital.accountTitle}</p>
              <p className={`font-mono font-extrabold text-sm ${activeDigital.theme.numberColor} mt-0.5`}>
                {activeDigital.displayNumber}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onCopy(activeDigital.rawNumber, activeDigital.id)}
              className={`${activeDigital.theme.copyBtn} font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-[11px] cursor-pointer`}
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
              placeholder="e.g. TID 84920491 or Sender Mobile #"
              value={transactionId}
              onChange={(e) => setTransactionId(e.target.value)}
              className={`w-full bg-white border ${activeDigital.theme.inputBorder} rounded-xl px-3 py-1.5 text-xs text-charcoal-900 focus:outline-none`}
            />
          </div>
        </div>
      )}
    </div>
  );
}
