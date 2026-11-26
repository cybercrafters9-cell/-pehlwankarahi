"use client";

import React, { useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import {
  AlertTriangle,
  CheckCircle,
  Copy,
  Check,
  Clock,
  Send,
  X,
  Phone,
  MapPin,
  Receipt,
  ArrowRight,
  ExternalLink,
} from "lucide-react";
import { PAYMENT_ACCOUNTS, DigitalPaymentMethod, getDeliverySchedule } from "./cart/types";

export default function OrderVerificationModal() {
  const { pendingVerificationOrder, setPendingVerificationOrder, settings } = useRestaurant();
  const [stage, setStage] = useState<"request_screenshot" | "screenshot_sent">("request_screenshot");
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  if (!pendingVerificationOrder) return null;

  const isDigital =
    pendingVerificationOrder.paymentMethod === "easypaisa" ||
    pendingVerificationOrder.paymentMethod === "jazzcash" ||
    pendingVerificationOrder.paymentMethod === "bank";

  const digitalKey: DigitalPaymentMethod =
    pendingVerificationOrder.paymentMethod === "bank"
      ? "bank"
      : pendingVerificationOrder.paymentMethod === "jazzcash"
      ? "jazzcash"
      : "easypaisa";

  const digitalCfg = PAYMENT_ACCOUNTS[digitalKey] || PAYMENT_ACCOUNTS.jazzcash;

  const bankName = settings?.bankName?.trim() || "Dubai Islamic Bank";
  const bankBranch = settings?.bankBranch?.trim() || "Riphah Branch, Faisalabad";
  const bankAccountNumber = settings?.bankAccountNumber?.trim() || "0792749002";
  const bankIban = settings?.bankIban?.trim() || "PK90DUIB0000000792749002";
  const bankAccountTitle =
    settings?.bankAccountTitle?.trim() ||
    settings?.paymentAccountTitle?.trim() ||
    "Muhammad Zuber";

  const rawNumber =
    digitalKey === "easypaisa"
      ? settings?.easypaisaNumber?.trim() || "03001234567"
      : digitalKey === "jazzcash"
      ? settings?.jazzcashNumber?.trim() || "03219876543"
      : bankAccountNumber;

  const accountTitle =
    digitalKey === "bank"
      ? bankAccountTitle
      : settings?.paymentAccountTitle?.trim() || "Pehlwan Karahi & DeraGhar";

  const rawWa = settings?.whatsapp?.trim() || settings?.phone?.trim() || "03001234567";
  const waTarget = rawWa.replace(/\D/g, "");
  const waNumber = waTarget
    ? waTarget.startsWith("0")
      ? `92${waTarget.slice(1)}`
      : waTarget
    : "923001234567";

  const deliverySchedule = getDeliverySchedule();

  const itemsListText =
    pendingVerificationOrder.items && pendingVerificationOrder.items.length > 0
      ? pendingVerificationOrder.items
          .map((i) => `• ${i.qty}x ${i.name} — Rs. ${(i.price * i.qty).toLocaleString()}`)
          .join("\n")
      : "• Fresh Karahi & Bar B Q items";

  const paymentDetailsText =
    digitalKey === "bank"
      ? `• Bank: ${bankName} (${bankBranch})\n• Beneficiary / Title: ${accountTitle}\n• Account Number: ${bankAccountNumber}\n• IBAN: ${bankIban}`
      : `• Transferred to: ${digitalCfg.name} (${rawNumber})\n• Account Title: ${accountTitle}`;

  const whatsappMessage = encodeURIComponent(
    `Hello Pehlwan Karahi & DeraGhar,\n\n⚠️ *PAYMENT RECEIPT SUBMISSION (ORDER CONFIRMATION)*\n\nI have placed an order on your website and am sending my payment receipt screenshot to verify and confirm it.\n\n*ORDER DETAILS:*\n• Order ID: #${pendingVerificationOrder.id}\n• Customer Name: ${pendingVerificationOrder.customerName}\n• Contact Phone: ${pendingVerificationOrder.customerPhone}\n• Delivery Address: ${pendingVerificationOrder.address}\n\n*ITEMS ORDERED:*\n${itemsListText}\n\n*BILL SUMMARY:*\n• Subtotal: Rs. ${(pendingVerificationOrder.subtotal ?? pendingVerificationOrder.totalAmount).toLocaleString()}\n• Delivery Fee: ${pendingVerificationOrder.deliveryFee === 0 ? "FREE" : `Rs. ${pendingVerificationOrder.deliveryFee ?? 0}`}\n• *Total Payable: Rs. ${pendingVerificationOrder.totalAmount.toLocaleString()}*\n\n*PAYMENT METHOD:*\n${paymentDetailsText}\n• Transaction Reference / TID: ${pendingVerificationOrder.transactionId || "Attached in screenshot"}\n\n*DELIVERY SCHEDULE:*\n• ${deliverySchedule.etaText} (${deliverySchedule.policyNote})\n\n📎 *I have attached my payment receipt screenshot below. Please verify and confirm my order!*`
  );

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 1500);
  };

  const handleClose = () => {
    setPendingVerificationOrder(null);
    setStage("request_screenshot");
  };

  return (
    <div className="fixed inset-0 bg-charcoal-900/85 backdrop-blur-md z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="relative w-full max-w-lg bg-sand-50 border-2 border-amber-500/60 rounded-3xl sm:rounded-4xl shadow-2xl p-5 sm:p-7 space-y-5 my-auto animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Dismiss Button */}
        <button
          onClick={handleClose}
          type="button"
          className="absolute top-4 right-4 p-2 rounded-full text-charcoal-600 hover:text-charcoal-900 hover:bg-sand-200/80 transition-colors cursor-pointer"
          aria-label="Close confirmation"
        >
          <X className="w-5 h-5" />
        </button>

        {stage === "request_screenshot" ? (
          <>
            {/* Stage 1: Compulsory Action Required */}
            <div className="space-y-3 text-center pt-1">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 border border-amber-500/40 text-amber-900 text-[11px] font-extrabold uppercase tracking-wider animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                <span>Action Required to Confirm Order</span>
              </div>

              <h2 className="font-display font-extrabold text-xl sm:text-2xl text-charcoal-900 leading-tight">
                WhatsApp Payment Screenshot Compulsory
              </h2>
              <p className="text-xs text-charcoal-700/85 leading-relaxed max-w-md mx-auto">
                Aapka order <strong className="font-bold text-charcoal-950 font-mono">#{pendingVerificationOrder.id}</strong> submit ho chuka hai. Kitchen cooking shuru karne ke liye apni payment ka screenshot WhatsApp par lazmi send karein.
              </p>
            </div>

            {/* Bill & Transfer Details Card */}
            <div className="bg-sand-100/90 border border-sand-300 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-sand-200">
                <span className="font-bold text-charcoal-700">Order Reference:</span>
                <span className="font-mono font-extrabold text-terracotta-600 text-sm">
                  #{pendingVerificationOrder.id}
                </span>
              </div>

              <div className="flex items-center justify-between pb-2 border-b border-sand-200">
                <span className="font-bold text-charcoal-700">Total Payable Amount:</span>
                <span className="font-display font-extrabold text-base text-charcoal-900">
                  Rs. {pendingVerificationOrder.totalAmount.toLocaleString()}
                </span>
              </div>

              <div className="flex items-start justify-between pb-2 border-b border-sand-200">
                <span className="font-bold text-charcoal-700 mt-0.5">Payment Transferred To:</span>
                <div className="text-right max-w-[240px]">
                  <span className={`text-[10px] font-extrabold text-white ${digitalCfg.badgeBg} px-2 py-0.5 rounded-full`}>
                    {digitalCfg.name}
                  </span>
                  {digitalKey === "bank" ? (
                    <div className="mt-1 space-y-1">
                      <p className="font-bold text-charcoal-900 text-xs">{bankName}</p>
                      <p className="text-[10px] text-charcoal-600">{bankBranch}</p>
                      <p className="text-[11px] text-charcoal-800 font-semibold">Title: {accountTitle}</p>
                      <div className="flex items-center gap-1.5 justify-end pt-0.5">
                        <span className="font-mono font-extrabold text-xs text-charcoal-900">A/C: {bankAccountNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankAccountNumber, "bank_acc")}
                          className="text-[10px] text-terracotta-600 hover:text-terracotta-700 font-bold cursor-pointer"
                        >
                          {copiedAccount === "bank_acc" ? "Copied" : "Copy"}
                        </button>
                      </div>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="font-mono font-bold text-[10px] text-charcoal-700 break-all">IBAN: {bankIban}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(bankIban, "bank_iban")}
                          className="text-[10px] text-terracotta-600 hover:text-terracotta-700 font-bold cursor-pointer shrink-0"
                        >
                          {copiedAccount === "bank_iban" ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="font-bold text-charcoal-900 text-xs mt-0.5">{accountTitle}</p>
                      <div className="flex items-center gap-1.5 justify-end">
                        <span className="font-mono font-extrabold text-xs text-charcoal-800">{rawNumber}</span>
                        <button
                          type="button"
                          onClick={() => handleCopy(rawNumber, digitalCfg.id)}
                          className="text-[10px] text-terracotta-600 hover:text-terracotta-700 font-bold cursor-pointer"
                        >
                          {copiedAccount === digitalCfg.id ? "Copied" : "Copy"}
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {pendingVerificationOrder.transactionId && (
                <div className="flex items-center justify-between pb-2 border-b border-sand-200">
                  <span className="font-bold text-charcoal-700">Your Transaction ID (TID):</span>
                  <span className="font-mono font-extrabold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                    {pendingVerificationOrder.transactionId}
                  </span>
                </div>
              )}

              <div className="pt-1 text-[11px] text-charcoal-600 leading-normal flex items-start gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0 text-terracotta-500 mt-0.5" />
                <span>
                  <strong>Deliver to:</strong> {pendingVerificationOrder.customerName} ({pendingVerificationOrder.customerPhone}) — {pendingVerificationOrder.address}
                </span>
              </div>
            </div>

            {/* Instruction Notice */}
            <div className="p-3 bg-amber-500/15 border border-amber-500/40 rounded-2xl text-[11px] text-amber-950 font-medium leading-relaxed">
              👉 Neeche diye gaye button par click karein. Aapka WhatsApp automatically open ho jayega jisme order details pehle se likhi hongi. Sirf apna <strong>payment screenshot attach kar ke send karein</strong>.
            </div>

            {/* Primary Action Button (WhatsApp) */}
            <div className="space-y-2 pt-1">
              <a
                href={`https://wa.me/${waNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setStage("screenshot_sent")}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-4 rounded-full shadow-lg shadow-emerald-600/30 transition-all flex items-center justify-center gap-2 cursor-pointer ring-4 ring-emerald-500/20"
              >
                <Send className="w-4 h-4" />
                <span>Send Screenshot on WhatsApp (Click Here)</span>
              </a>

              <button
                type="button"
                onClick={() => setStage("screenshot_sent")}
                className="w-full py-2.5 text-xs text-charcoal-700 font-bold hover:text-charcoal-900 transition-colors flex items-center justify-center gap-1 cursor-pointer"
              >
                <span>Maine Screenshot Send Kar Diya Hai (Verify Status)</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </>
        ) : (
          <>
            {/* Stage 2: Screenshot Sent, Verification In Progress */}
            <div className="text-center space-y-3 pt-2">
              <div className="w-16 h-16 mx-auto rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center shadow-inner border border-emerald-300">
                <CheckCircle className="w-9 h-9" />
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 border border-emerald-300 text-emerald-900 text-[11px] font-extrabold uppercase tracking-wider">
                <Clock className="w-3.5 h-3.5 text-emerald-700 animate-spin" />
                <span>Status: Verification in Progress</span>
              </div>

              <h2 className="font-display font-extrabold text-2xl text-charcoal-900">
                Order Submitted for Verification!
              </h2>

              <p className="text-xs text-charcoal-700/80 leading-relaxed max-w-sm mx-auto">
                Shukriya! Aapka Order <strong className="font-mono text-charcoal-900 font-bold">#{pendingVerificationOrder.id}</strong> receive ho gaya hai. Restaurant staff aapka payment screenshot check kar ke order verify karega aur Live Wok me cooking shuru hogi.
              </p>
            </div>

            {/* Stepper Progress Visual */}
            <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4 space-y-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-charcoal-900">Order Placed</p>
                  <p className="text-[11px] text-charcoal-600">Total: Rs. {pendingVerificationOrder.totalAmount.toLocaleString()}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-[10px]">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-charcoal-900">Screenshot Sent via WhatsApp</p>
                  <p className="text-[11px] text-charcoal-600">TID: {pendingVerificationOrder.transactionId || "Submitted"}</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center font-bold text-[10px] animate-pulse">
                  3
                </div>
                <div>
                  <p className="font-bold text-amber-900">Admin Payment Verification</p>
                  <p className="text-[11px] text-charcoal-600">Verification ke baad khana cook hoga</p>
                </div>
              </div>

              <div className="flex items-center gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-sand-300 text-charcoal-700 flex items-center justify-center font-bold text-[10px]">
                  4
                </div>
                <div>
                  <p className="font-bold text-charcoal-900">Live Koyla Cooking &amp; Dispatch</p>
                  <p className="text-[11px] text-charcoal-600">{deliverySchedule.etaText}</p>
                </div>
              </div>
            </div>

            {/* Re-send WhatsApp Link if needed */}
            <div className="text-center">
              <a
                href={`https://wa.me/${waNumber}?text=${whatsappMessage}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-emerald-700 hover:text-emerald-800 font-bold inline-flex items-center gap-1 hover:underline"
              >
                <span>WhatsApp chat dobara open karein</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            {/* Final Done Button */}
            <button
              type="button"
              onClick={handleClose}
              className="w-full bg-charcoal-900 hover:bg-charcoal-800 text-white font-extrabold text-sm py-3.5 rounded-full shadow-md transition-colors cursor-pointer"
            >
              Theek Hai / Back to Home
            </button>
          </>
        )}
      </div>
    </div>
  );
}
