"use client";

import { Send, Clock, AlertTriangle } from "lucide-react";
import { CompletedOrderSummary, PAYMENT_ACCOUNTS, DigitalPaymentMethod, getDeliverySchedule } from "./types";
import { RestaurantSettings } from "@/services/api";

interface SuccessViewProps {
  completedOrder: CompletedOrderSummary;
  onClose: () => void;
  settings?: RestaurantSettings | null;
}

export default function SuccessView({ completedOrder, onClose, settings }: SuccessViewProps) {
  const isDigitalPayment =
    completedOrder.paymentMethod === "easypaisa" ||
    completedOrder.paymentMethod === "jazzcash" ||
    completedOrder.paymentMethod === "bank";
  const digitalKey: DigitalPaymentMethod =
    completedOrder.paymentMethod === "bank"
      ? "bank"
      : completedOrder.paymentMethod === "jazzcash"
      ? "jazzcash"
      : "easypaisa";
  const digitalCfg = isDigitalPayment
    ? PAYMENT_ACCOUNTS[digitalKey]
    : PAYMENT_ACCOUNTS.easypaisa;

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
      : settings?.paymentAccountTitle?.trim() || "Pehlwan Karahi";

  const rawWa = settings?.whatsapp?.trim() || settings?.phone?.trim() || "03001234567";
  const waTarget = rawWa.replace(/\D/g, "");
  const waNumber = waTarget ? (waTarget.startsWith("0") ? `92${waTarget.slice(1)}` : waTarget) : "923001234567";

  const deliverySchedule = getDeliverySchedule();

  const itemsListText = completedOrder.items && completedOrder.items.length > 0
    ? completedOrder.items
        .map((item) => `• ${item.name} x ${item.qty} (Rs. ${(item.price * item.qty).toLocaleString()})`)
        .join("\n")
    : "Items listed in kitchen docket";

  const paymentDetailsText =
    digitalKey === "bank"
      ? `• Bank: ${bankName} (${bankBranch})\n• Beneficiary / Title: ${accountTitle}\n• Account Number: ${bankAccountNumber}\n• IBAN: ${bankIban}`
      : `• Transferred to: ${digitalCfg.name} (${rawNumber})\n• Account Title: ${accountTitle}`;

  const whatsappMessage = encodeURIComponent(
    `Hello Pehlwan Karahi,\n\n⚠️ *PAYMENT RECEIPT SUBMISSION (ORDER CONFIRMATION)*\n\nI have placed an order and am sending my payment receipt screenshot to confirm it.\n\n*ORDER DETAILS:*\n• Order ID: #${completedOrder.id}\n• Customer Name: ${completedOrder.customerName}\n• Contact Phone: ${completedOrder.customerPhone}\n• Delivery Address: ${completedOrder.address}\n\n*ITEMS ORDERED:*\n${itemsListText}\n\n*BILL SUMMARY:*\n• Subtotal: Rs. ${(completedOrder.subtotal ?? completedOrder.totalAmount).toLocaleString()}\n• Delivery Fee: ${completedOrder.deliveryFee === 0 ? "FREE" : `Rs. ${completedOrder.deliveryFee ?? 0}`}\n• *Total Payable: Rs. ${completedOrder.totalAmount.toLocaleString()}*\n\n*PAYMENT METHOD:*\n${paymentDetailsText}\n${completedOrder.transactionId ? `• Transaction Reference / TID: ${completedOrder.transactionId}\n` : ""}\n*DELIVERY SCHEDULE:*\n• ${deliverySchedule.etaText} (${deliverySchedule.policyNote})\n\n📎 *I have attached my payment receipt screenshot below. Please verify and confirm my order!*`
  );

  return (
    <div className="p-5 sm:p-6 flex-1 flex flex-col justify-between overflow-y-auto text-center space-y-5">
      <div className="my-auto space-y-4">
        {/* Compulsory WhatsApp Receipt Notice Banner at Top */}
        <div className="bg-amber-500/15 border-2 border-amber-500/60 rounded-2xl p-4 text-left space-y-1.5 animate-pulse">
          <div className="flex items-center gap-2 text-amber-900 font-extrabold text-xs uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>Action Required: Send Receipt on WhatsApp to Confirm Order</span>
          </div>
          <p className="text-xs text-amber-950 font-semibold leading-relaxed">
            Your Order <strong>#{completedOrder.id}</strong> has been submitted. Sending your payment receipt screenshot on WhatsApp is <strong>strictly compulsory</strong> to verify your order and start kitchen preparation.
          </p>
        </div>

        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-800 bg-amber-100 px-3 py-1 rounded-full">
            Status: Pending WhatsApp Receipt
          </span>
          <h3 className="font-display font-extrabold text-2xl text-charcoal-900 mt-2">
            Order #{completedOrder.id}
          </h3>
        </div>

        {/* Delivery Schedule Notification */}
        <div className="bg-sand-100 border border-sand-300 rounded-2xl p-3 text-left text-xs text-charcoal-900 flex items-start gap-2.5">
          <Clock className="w-4 h-4 text-terracotta-500 shrink-0 mt-0.5" />
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="font-bold text-charcoal-900">{deliverySchedule.badgeText}:</span>
              <span className="font-extrabold text-terracotta-600 bg-sand-200 px-2 py-0.5 rounded-full text-[10px]">
                {deliverySchedule.etaText}
              </span>
            </div>
            <p className="text-[11px] text-charcoal-700/80 mt-1">
              {deliverySchedule.policyNote}
            </p>
          </div>
        </div>

        {/* Order Details Card */}
        <div className="bg-sand-50 border border-sand-200 rounded-2xl p-4 text-left text-xs space-y-2">
          <div className="flex justify-between border-b border-sand-200 pb-2">
            <span className="text-charcoal-600">Customer Name:</span>
            <span className="font-bold text-charcoal-900">{completedOrder.customerName}</span>
          </div>
          <div className="flex justify-between border-b border-sand-200 pb-2">
            <span className="text-charcoal-600">Contact Number:</span>
            <span className="font-bold text-charcoal-900">{completedOrder.customerPhone}</span>
          </div>
          <div className="flex justify-between border-b border-sand-200 pb-2">
            <span className="text-charcoal-600">Delivery Address:</span>
            <span className="font-bold text-charcoal-900 text-right max-w-[200px] truncate">
              {completedOrder.address}
            </span>
          </div>
          {typeof completedOrder.subtotal === "number" && (
            <div className="flex justify-between border-b border-sand-200 pb-2">
              <span className="text-charcoal-600">Subtotal:</span>
              <span className="font-bold text-charcoal-900">
                Rs. {completedOrder.subtotal.toLocaleString()}
              </span>
            </div>
          )}
          <div className="flex justify-between border-b border-sand-200 pb-2">
            <span className="text-charcoal-600">Payment Method:</span>
            <span className="font-extrabold uppercase text-terracotta-600">
              {completedOrder.paymentMethod === "easypaisa" && "🟢 Easypaisa"}
              {completedOrder.paymentMethod === "jazzcash" && "🔴 JazzCash"}
              {completedOrder.paymentMethod === "bank" && "🏦 Bank Transfer"}
            </span>
          </div>
          {completedOrder.transactionId && (
            <div className="flex justify-between border-b border-sand-200 pb-2">
              <span className="text-charcoal-600">Transaction ID / Ref:</span>
              <span className="font-mono font-bold text-charcoal-900">{completedOrder.transactionId}</span>
            </div>
          )}
          <div className="flex justify-between pt-1 text-sm font-extrabold">
            <span className="text-charcoal-900">Total Payable:</span>
            <span className="text-terracotta-500">
              Rs. {completedOrder.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Transfer Instructions Box */}
        <div className="bg-sand-100 border border-sand-300 rounded-2xl p-4 text-left text-xs text-charcoal-900 space-y-1">
          <p className="font-bold text-charcoal-900">
            Payment Transfer Instructions:
          </p>
          {digitalKey === "bank" ? (
            <div className="text-[11px] text-charcoal-700 leading-relaxed space-y-1">
              <p>
                Please transfer <strong>Rs. {completedOrder.totalAmount.toLocaleString()}</strong> to our official bank account:
              </p>
              <div className="bg-white/80 border border-sand-200 rounded-lg p-2 font-mono text-[11px] text-charcoal-900 space-y-0.5">
                <p><strong>Bank:</strong> {bankName} ({bankBranch})</p>
                <p><strong>Title:</strong> {accountTitle}</p>
                <p><strong>Account#:</strong> {bankAccountNumber}</p>
                <p><strong>IBAN:</strong> {bankIban}</p>
              </div>
              <p>Then click the button below to send your payment screenshot on WhatsApp.</p>
            </div>
          ) : (
            <p className="text-[11px] text-charcoal-700 leading-relaxed">
              Please transfer <strong>Rs. {completedOrder.totalAmount.toLocaleString()}</strong> to{" "}
              <strong>{rawNumber} ({digitalCfg.name})</strong>, then click the button below to send your payment screenshot on WhatsApp.
            </p>
          )}
        </div>
      </div>

      {/* Compulsory WhatsApp Action Button */}
      <div className="space-y-2.5 pt-2">
        <a
          href={`https://wa.me/${waNumber}?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm py-4 rounded-full shadow-xl flex items-center justify-center gap-2 transition-all cursor-pointer ring-4 ring-emerald-500/30 transform hover:scale-[1.01]"
        >
          <Send className="w-5 h-5" />
          <span>Send Payment Receipt on WhatsApp (Compulsory)</span>
        </a>

        <button
          type="button"
          onClick={onClose}
          className="w-full bg-sand-200 hover:bg-sand-300 text-charcoal-900 font-bold text-xs py-3 rounded-full transition-all cursor-pointer"
        >
          Close &amp; Back to Restaurant
        </button>
      </div>
    </div>
  );
}
