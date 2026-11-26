"use client";

import { useEffect, useMemo } from "react";
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
  error?: string;
}

export default function PaymentPicker({
  paymentMethod,
  setPaymentMethod,
  transactionId,
  setTransactionId,
  copiedAccount,
  onCopy,
  settings,
  error,
}: PaymentPickerProps) {
  const easypaisaNumber = settings?.easypaisaNumber?.trim() || "";
  const jazzcashNumber = settings?.jazzcashNumber?.trim() || "";
  const bankAccountNumber = settings?.bankAccountNumber?.trim() || "";
  const bankIban = settings?.bankIban?.trim() || "";
  const bankName = settings?.bankName?.trim() || "Dubai Islamic Bank";
  const bankBranch = settings?.bankBranch?.trim() || "Riphah Branch, Faisalabad";
  const bankAccountTitle =
    settings?.bankAccountTitle?.trim() ||
    settings?.paymentAccountTitle?.trim() ||
    "Muhammad Zuber";

  // Available methods strictly based on whether the admin has configured the number
  const displayMethods = useMemo((): DigitalPaymentMethod[] => {
    const available: DigitalPaymentMethod[] = [];
    if (jazzcashNumber) available.push("jazzcash");
    if (easypaisaNumber) available.push("easypaisa");
    if (bankAccountNumber || bankIban || bankName) available.push("bank");

    // Fallback only if absolutely no payment method has been set yet by admin
    return available.length > 0 ? available : ["jazzcash", "easypaisa", "bank"];
  }, [jazzcashNumber, easypaisaNumber, bankAccountNumber, bankIban, bankName]);

  // Ensure selected method is always one of the currently available methods
  useEffect(() => {
    if (!displayMethods.includes(paymentMethod as DigitalPaymentMethod)) {
      setPaymentMethod(displayMethods[0]);
    }
  }, [displayMethods, paymentMethod, setPaymentMethod]);

  const activeDigital =
    PAYMENT_ACCOUNTS[paymentMethod as DigitalPaymentMethod] ||
    PAYMENT_ACCOUNTS[displayMethods[0]] ||
    PAYMENT_ACCOUNTS.jazzcash;

  const rawNumber =
    activeDigital.id === "easypaisa"
      ? easypaisaNumber || "Not configured"
      : activeDigital.id === "jazzcash"
      ? jazzcashNumber || "Not configured"
      : bankAccountNumber || bankIban || "Not configured";

  const accountTitle =
    activeDigital.id === "bank"
      ? bankAccountTitle
      : settings?.paymentAccountTitle?.trim() || "Pehlwan Karahi & DeraGhar";

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
        Select your payment method below. Transfer the exact bill amount and send the payment screenshot via WhatsApp to confirm your order.
      </p>

      {/* Available Payment Methods (Only shows configured accounts) */}
      <div className={`grid ${displayMethods.length === 1 ? "grid-cols-1" : displayMethods.length === 2 ? "grid-cols-2" : "grid-cols-3"} gap-2`}>
        {displayMethods.map((key) => {
          const cfg = PAYMENT_ACCOUNTS[key];
          const isSelected = paymentMethod === key;

          return (
            <label
              key={cfg.id}
              onClick={() => setPaymentMethod(cfg.id)}
              className={`relative p-2.5 sm:p-3 rounded-2xl border-2 flex flex-col justify-between transition-all cursor-pointer ${
                isSelected
                  ? `${cfg.theme.cardActiveBorder} ${cfg.theme.cardActiveBg} shadow-sm`
                  : `border-sand-300 bg-white ${cfg.theme.cardHoverBg}`
              }`}
            >
              <div className="flex items-center justify-between">
                <span className={`text-[11px] sm:text-xs font-extrabold text-white ${cfg.badgeBg} px-2 py-0.5 rounded-full`}>
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
                <p className="font-extrabold text-xs text-charcoal-900 truncate">
                  {cfg.name}
                </p>
                <p className={`text-[10px] ${cfg.theme.subtitleColor} font-semibold mt-0.5 truncate`}>
                  {cfg.id === "bank" ? "Direct / IBAN" : "Mobile Transfer"}
                </p>
              </div>
            </label>
          );
        })}
      </div>

      {/* Digital Account Transfer Details Sub-Panel */}
      <div className={`${activeDigital.theme.panelBg} border ${activeDigital.theme.panelBorder} rounded-2xl p-3.5 space-y-2.5 text-xs animate-in fade-in duration-200`}>
        <div className={`flex items-center justify-between ${activeDigital.theme.headerText} font-bold`}>
          <span>Official {activeDigital.name} Details:</span>
          <span className={`text-[10px] ${activeDigital.theme.badgeBg} text-white px-2 py-0.5 rounded-full`}>
            Verified Merchant
          </span>
        </div>

        {activeDigital.id === "bank" ? (
          <div className="space-y-2">
            <div className={`bg-white rounded-xl p-3 border ${activeDigital.theme.cardBorder} space-y-2`}>
              <div className="flex items-start justify-between border-b border-sand-100 pb-2">
                <div>
                  <p className="text-[10px] text-charcoal-500 font-semibold uppercase tracking-wider">Bank & Branch</p>
                  <p className="font-extrabold text-xs text-charcoal-900">{bankName}</p>
                  {bankBranch && (
                    <p className="text-[10px] text-charcoal-600 font-medium">{bankBranch}</p>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-[10px] text-charcoal-500 font-semibold uppercase tracking-wider">Account Title</p>
                  <p className="font-bold text-xs text-charcoal-900">{accountTitle}</p>
                </div>
              </div>

              {/* Account Number Row */}
              {bankAccountNumber && (
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <p className="text-[10px] text-charcoal-500 font-semibold uppercase tracking-wider">Account Number</p>
                    <p className={`font-mono font-extrabold text-sm ${activeDigital.theme.numberColor}`}>
                      {bankAccountNumber}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopy(bankAccountNumber, "bank_acc")}
                    className={`${activeDigital.theme.copyBtn} font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] cursor-pointer transition-colors`}
                  >
                    {copiedAccount === "bank_acc" ? (
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
              )}

              {/* IBAN Row */}
              {bankIban && (
                <div className="flex items-center justify-between pt-1 border-t border-sand-100">
                  <div className="min-w-0 pr-2">
                    <p className="text-[10px] text-charcoal-500 font-semibold uppercase tracking-wider">IBAN</p>
                    <p className={`font-mono font-extrabold text-xs sm:text-sm ${activeDigital.theme.numberColor} break-all`}>
                      {bankIban}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => onCopy(bankIban, "bank_iban")}
                    className={`${activeDigital.theme.copyBtn} font-bold px-2.5 py-1 rounded-lg flex items-center gap-1 text-[11px] cursor-pointer transition-colors shrink-0`}
                  >
                    {copiedAccount === "bank_iban" ? (
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
              )}
            </div>
          </div>
        ) : (
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
        )}

        <div>
          <label className={`block text-[11px] font-bold ${activeDigital.theme.headerText} mb-1 flex items-center justify-between`}>
            <span>
              Transaction ID (TID) / Sender Number <span className="text-red-500">* (Compulsory)</span>
            </span>
          </label>
          <input
            type="text"
            required
            placeholder="e.g. TID 84920491 or Sender Mobile (03XXXXXXXXX)"
            value={transactionId}
            onChange={(e) => setTransactionId(e.target.value)}
            className={`w-full bg-white border ${
              error ? "border-red-500 ring-1 ring-red-400" : activeDigital.theme.inputBorder
            } rounded-xl px-3 py-2 text-xs text-charcoal-900 focus:outline-none`}
          />
          {error ? (
            <p className="text-[11px] text-red-600 font-bold mt-1">
              ⚠️ {error}
            </p>
          ) : (
            <p className="text-[10px] text-charcoal-600 mt-1">
              ⚠️ <strong>Compulsory:</strong> Payment verify karwane ke liye apna Transaction ID (TID) ya bhejne wale ka mobile number lazmi likhein.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
