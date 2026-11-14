"use client";

import { CheckCircle2, Send } from "lucide-react";
import { CompletedOrderSummary, PAYMENT_ACCOUNTS, DigitalPaymentMethod } from "./types";

interface SuccessViewProps {
  completedOrder: CompletedOrderSummary;
  onClose: () => void;
}

export default function SuccessView({ completedOrder, onClose }: SuccessViewProps) {
  const isDigitalPayment =
    completedOrder.paymentMethod === "easypaisa" ||
    completedOrder.paymentMethod === "jazzcash";
  const digitalCfg = isDigitalPayment
    ? PAYMENT_ACCOUNTS[completedOrder.paymentMethod as DigitalPaymentMethod]
    : null;

  const whatsappMessage = encodeURIComponent(
    `Assalam o Alaikum Pehalwan Karahi,\nI just placed Order *#${completedOrder.id}* for *Rs. ${completedOrder.totalAmount.toLocaleString()}*.\nName: ${completedOrder.customerName}\nPhone: ${completedOrder.customerPhone}\nPayment: ${completedOrder.paymentMethod.toUpperCase()}${completedOrder.transactionId ? ` (TID: ${completedOrder.transactionId})` : ""}\nPlease confirm my order!`
  );

  return (
    <div className="p-6 flex-1 flex flex-col justify-between overflow-y-auto text-center space-y-6">
      <div className="my-auto space-y-4">
        {/* Success Badge */}
        <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-lg animate-bounce">
          <CheckCircle2 className="w-9 h-9" />
        </div>

        <div>
          <span className="text-[11px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-3 py-1 rounded-full">
            Order Successfully Placed!
          </span>
          <h3 className="font-display font-extrabold text-2xl text-charcoal-900 mt-2">
            Order #{completedOrder.id}
          </h3>
          <p className="text-xs text-charcoal-700/80 mt-1 max-w-xs mx-auto">
            Your karahi has been queued in our live wok &amp; tandoor kitchen. ETA: 28–35 mins.
          </p>
        </div>

        {/* Order Receipt Card */}
        <div className="bg-sand-50 border border-sand-200 rounded-2xl p-4 text-left text-xs space-y-2">
          <div className="flex justify-between border-b border-sand-200 pb-2">
            <span className="text-charcoal-600">Customer Name:</span>
            <span className="font-bold text-charcoal-900">{completedOrder.customerName}</span>
          </div>
          <div className="flex justify-between border-b border-sand-200 pb-2">
            <span className="text-charcoal-600">Contact:</span>
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
          {Boolean(completedOrder.discount && completedOrder.discount > 0) && (
            <div className="flex justify-between border-b border-sand-200 pb-2 text-emerald-700 font-bold">
              <span>👑 VIP Loyalty Discount:</span>
              <span>- Rs. {completedOrder.discount!.toLocaleString()}</span>
            </div>
          )}
          <div className="flex justify-between border-b border-sand-200 pb-2">
            <span className="text-charcoal-600">Payment Method:</span>
            <span className="font-extrabold uppercase text-terracotta-600">
              {completedOrder.paymentMethod === "easypaisa" && "🟢 Easypaisa"}
              {completedOrder.paymentMethod === "jazzcash" && "🔴 JazzCash"}
              {completedOrder.paymentMethod === "cod" && "💵 Cash on Delivery"}
            </span>
          </div>
          <div className="flex justify-between pt-1 text-sm font-extrabold">
            <span className="text-charcoal-900">Total Bill:</span>
            <span className="text-terracotta-500">
              Rs. {completedOrder.totalAmount.toLocaleString()}
            </span>
          </div>
        </div>

        {/* Easypaisa / JazzCash Reminder using Config */}
        {digitalCfg && (
          <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-left text-xs text-amber-900">
            <p className="font-bold">⚠️ Payment Reminder:</p>
            <p className="text-[11px] mt-0.5">
              Please transfer <strong>Rs. {completedOrder.totalAmount.toLocaleString()}</strong> to{" "}
              <strong>
                {digitalCfg.displayNumber} ({digitalCfg.name})
              </strong>{" "}
              and send a screenshot via WhatsApp for instant priority cooking!
            </p>
          </div>
        )}
      </div>

      {/* Bottom Actions */}
      <div className="space-y-2.5 pt-4">
        <a
          href={`https://wa.me/923001234567?text=${whatsappMessage}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-3.5 rounded-full shadow flex items-center justify-center gap-2 transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Confirm on WhatsApp</span>
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
