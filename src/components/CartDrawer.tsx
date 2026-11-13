"use client";

import React, { useState } from "react";
import Image from "next/image";
import { useRestaurant } from "@/context/RestaurantContext";
import {
  CookingPot,
  X,
  Plus,
  Minus,
  ArrowRight,
  ArrowLeft,
  Loader2,
  CheckCircle2,
  MapPin,
  Phone,
  User,
  Flame,
  Copy,
  Check,
  Banknote,
  Send,
} from "lucide-react";

type DrawerStep = "cart" | "checkout" | "success";
type PaymentType = "cod" | "easypaisa" | "jazzcash";

interface CompletedOrderSummary {
  id: string;
  customerName: string;
  customerPhone: string;
  address: string;
  totalAmount: number;
  paymentMethod: PaymentType;
  transactionId?: string;
}

const createFallbackOrderId = (): string => {
  return `PK-${Date.now().toString().slice(-4)}`;
};

const QUICK_AREAS = [
  "Kohinoor City",
  "Canal Road",
  "Gulberg / D-Ground",
  "Madina Town",
  "Civil Lines",
  "Dine-in / Pickup",
];

export default function CartDrawer() {
  const {
    cart,
    updateQty,
    isCartOpen,
    setIsCartOpen,
    placeOrder,
    isSubmittingOrder,
    spiceLevel,
    setSpiceLevel,
  } = useRestaurant();

  const [step, setStep] = useState<DrawerStep>("cart");

  // Checkout Form State
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [address, setAddress] = useState("");
  const [notes, setNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<PaymentType>("cod");
  const [transactionId, setTransactionId] = useState("");
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  // Completed Order State for Success Screen
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderSummary | null>(null);

  // Form errors
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  const handleClose = () => {
    setIsCartOpen(false);
    if (step === "success") {
      setStep("cart");
      setCompletedOrder(null);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 1500);
  };

  const validateForm = () => {
    const errs: typeof errors = {};
    if (!customerName.trim()) {
      errs.name = "Please enter your name";
    }
    if (!customerPhone.trim() || customerPhone.trim().length < 10) {
      errs.phone = "Enter a valid 11-digit phone number (e.g. 0300-1234567)";
    }
    if (!address.trim()) {
      errs.address = "Please enter your delivery address / location";
    }
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const result = (await placeOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim(),
      address: address.trim(),
      spiceLevel,
      paymentMethod,
      transactionId: transactionId.trim() || undefined,
      notes: notes.trim() || undefined,
    })) as { id?: string } | undefined;

    if (result) {
      setCompletedOrder({
        id: result.id || createFallbackOrderId(),
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        address: address.trim(),
        totalAmount,
        paymentMethod,
        transactionId: transactionId.trim(),
      });
      setStep("success");
    }
  };

  const whatsappMessage = completedOrder
    ? encodeURIComponent(
        `Assalam o Alaikum Pehalwan Karahi,\nI just placed Order *#${completedOrder.id}* for *Rs. ${completedOrder.totalAmount.toLocaleString()}*.\nName: ${completedOrder.customerName}\nPhone: ${completedOrder.customerPhone}\nPayment: ${completedOrder.paymentMethod.toUpperCase()}${completedOrder.transactionId ? ` (TID: ${completedOrder.transactionId})` : ""}\nPlease confirm my order!`
      )
    : "";

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      {/* Drawer Container */}
      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-sand-100 z-50 shadow-2xl transition-transform duration-300 flex flex-col justify-between border-l border-sand-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* =========================================================
            HEADER (Dynamic based on current step)
            ========================================================= */}
        <div className="p-5 sm:p-6 bg-charcoal-900 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {step === "checkout" ? (
              <button
                onClick={() => setStep("cart")}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors cursor-pointer"
                title="Back to Cart"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            ) : (
              <CookingPot className="w-7 h-7 text-saffron-400" />
            )}

            <div>
              <h3 className="font-display font-bold text-base sm:text-lg">
                {step === "cart" && "Your Desi Dastarkhwan"}
                {step === "checkout" && "Customer Details & Payment"}
                {step === "success" && "Order Confirmed!"}
              </h3>
              <p className="text-[11px] text-white/70">
                {step === "cart" && "Review your sizzling Karahi selections"}
                {step === "checkout" && "Enter delivery address & select payment method"}
                {step === "success" && "Dispatched to live wok & tandoor"}
              </p>
            </div>
          </div>

          <button
            onClick={handleClose}
            aria-label="Close Cart"
            className="w-9 h-9 rounded-full bg-white/10 hover:bg-terracotta-500 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================
            STEP 1: CART ITEMS VIEW
            ========================================================= */}
        {step === "cart" && (
          <>
            {/* Cart Items List */}
            <div className="p-5 flex-1 overflow-y-auto space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-16 text-charcoal-700/70">
                  <CookingPot className="w-14 h-14 mx-auto text-terracotta-500 mb-2" />
                  <p className="font-bold text-sm text-charcoal-900">Your Dastarkhwan is empty</p>
                  <p className="text-xs mt-1">Add some sizzling Mutton or Chicken Karahi to get started!</p>
                </div>
              ) : (
                cart.map((item, idx) => {
                  const itemTotal = item.price * item.qty;
                  return (
                    <div
                      key={idx}
                      className="bg-sand-50 border border-sand-200 rounded-2xl p-3 flex items-center gap-3 shadow-sm hover:border-sand-300 transition-all"
                    >
                      <div className="relative w-14 h-14 rounded-xl overflow-hidden shrink-0 bg-charcoal-900">
                        <Image
                          src={item.image}
                          alt={item.name}
                          fill
                          sizes="56px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-xs sm:text-sm text-charcoal-900 truncate">
                          {item.name}
                        </h4>
                        <p className="text-xs font-extrabold text-terracotta-500 mt-0.5">
                          Rs. {itemTotal.toLocaleString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 bg-sand-200/80 rounded-full px-2 py-1">
                        <button
                          onClick={() => updateQty(idx, -1)}
                          disabled={isSubmittingOrder}
                          className="w-5 h-5 rounded-full bg-white text-charcoal-900 flex items-center justify-center text-xs font-bold hover:bg-terracotta-500 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-extrabold w-4 text-center">
                          {item.qty}
                        </span>
                        <button
                          onClick={() => updateQty(idx, 1)}
                          disabled={isSubmittingOrder}
                          className="w-5 h-5 rounded-full bg-charcoal-900 text-white flex items-center justify-center text-xs font-bold hover:bg-terracotta-500 transition-colors cursor-pointer disabled:opacity-50"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Free Add-on Announcement */}
            <div className="px-5 py-2.5 bg-saffron-400/25 border-y border-saffron-400/40 flex items-center justify-between text-xs">
              <span className="font-bold text-charcoal-900">
                🌿 Free Fresh Podina Raita &amp; Salad with every order!
              </span>
              <span className="text-[10px] font-extrabold uppercase bg-charcoal-900 text-white px-2 py-0.5 rounded-full">
                Free
              </span>
            </div>

            {/* Bill Summary & Proceed Button */}
            <div className="p-5 sm:p-6 bg-sand-50 border-t border-sand-200 space-y-4">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-charcoal-700">
                  <span>Subtotal ({cart.reduce((s, i) => s + i.qty, 0)} Items)</span>
                  <span className="font-bold">Rs. {totalAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-charcoal-700">
                  <span>Hot Wok Delivery</span>
                  <span className="font-bold text-emerald-700">FREE</span>
                </div>
                <div className="flex justify-between text-base font-extrabold text-charcoal-900 pt-2 border-t border-sand-200">
                  <span>Total Payable</span>
                  <span className="text-terracotta-500">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => setStep("checkout")}
                disabled={cart.length === 0}
                className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-extrabold text-sm py-3.5 sm:py-4 rounded-full shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </>
        )}

        {/* =========================================================
            STEP 2: CHECKOUT FORM & PAYMENT SELECTION
            ========================================================= */}
        {step === "checkout" && (
          <form
            onSubmit={handleSubmitOrder}
            className="flex-1 flex flex-col justify-between overflow-hidden"
          >
            {/* Scrollable Input Section */}
            <div className="p-5 overflow-y-auto space-y-5 flex-1 scrollbar-thin">
              {/* Order Quick Summary Header Pill */}
              <div className="bg-sand-200/70 border border-sand-300 rounded-2xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-charcoal-700/80 font-medium block">Total Payable</span>
                  <span className="font-display font-extrabold text-base text-terracotta-500">
                    Rs. {totalAmount.toLocaleString()}
                  </span>
                </div>
                <span className="bg-charcoal-900 text-white text-[10px] font-bold px-2.5 py-1 rounded-full">
                  {cart.reduce((s, i) => s + i.qty, 0)} Karahi Items
                </span>
              </div>

              {/* Customer Details Group */}
              <div className="space-y-3">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-terracotta-500" />
                  <span>1. Your Information</span>
                </h4>

                {/* Name Input */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-800 mb-1">
                    Full Name <span className="text-terracotta-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Tariq Mehmood"
                    value={customerName}
                    onChange={(e) => {
                      setCustomerName(e.target.value);
                      if (errors.name) setErrors({ ...errors, name: undefined });
                    }}
                    className={`w-full bg-white border ${
                      errors.name ? "border-red-500 ring-1 ring-red-500" : "border-sand-300"
                    } rounded-xl px-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500`}
                  />
                  {errors.name && <p className="text-[10px] text-red-600 mt-0.5">{errors.name}</p>}
                </div>

                {/* Phone Input */}
                <div>
                  <label className="block text-[11px] font-bold text-charcoal-800 mb-1">
                    Phone / WhatsApp Number <span className="text-terracotta-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="tel"
                      required
                      placeholder="0300-1234567"
                      value={customerPhone}
                      onChange={(e) => {
                        setCustomerPhone(e.target.value);
                        if (errors.phone) setErrors({ ...errors, phone: undefined });
                      }}
                      className={`w-full bg-white border ${
                        errors.phone ? "border-red-500 ring-1 ring-red-500" : "border-sand-300"
                      } rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500`}
                    />
                    <Phone className="w-3.5 h-3.5 text-charcoal-400 absolute left-3 top-3" />
                  </div>
                  {errors.phone && <p className="text-[10px] text-red-600 mt-0.5">{errors.phone}</p>}
                </div>
              </div>

              {/* Delivery Address Group */}
              <div className="space-y-3 pt-1">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-terracotta-500" />
                  <span>2. Delivery Address</span>
                </h4>

                <div>
                  <label className="block text-[11px] font-bold text-charcoal-800 mb-1">
                    Complete Street Address &amp; Sector <span className="text-terracotta-500">*</span>
                  </label>
                  <textarea
                    rows={2}
                    required
                    placeholder="House / Flat #, Street #, Sector / Area name"
                    value={address}
                    onChange={(e) => {
                      setAddress(e.target.value);
                      if (errors.address) setErrors({ ...errors, address: undefined });
                    }}
                    className={`w-full bg-white border ${
                      errors.address ? "border-red-500 ring-1 ring-red-500" : "border-sand-300"
                    } rounded-xl px-3.5 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500 resize-none`}
                  />
                  {errors.address && (
                    <p className="text-[10px] text-red-600 mt-0.5">{errors.address}</p>
                  )}
                </div>

                {/* Quick Area Preset Buttons */}
                <div>
                  <span className="text-[10px] text-charcoal-700/80 font-bold block mb-1.5">
                    Quick Area Selector:
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_AREAS.map((area) => (
                      <button
                        type="button"
                        key={area}
                        onClick={() => {
                          setAddress((prev) => (prev ? `${prev}, ${area}` : area));
                          if (errors.address) setErrors({ ...errors, address: undefined });
                        }}
                        className="text-[10px] font-semibold bg-sand-200/90 hover:bg-sand-300 text-charcoal-900 px-2.5 py-1 rounded-full transition-colors cursor-pointer"
                      >
                        + {area}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Spice Level & Cooking Instructions */}
              <div className="space-y-2.5 pt-1">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-charcoal-800 flex items-center gap-1">
                    <Flame className="w-3.5 h-3.5 text-terracotta-500" />
                    <span>Spice Level:</span>
                  </label>
                  <span className="text-xs font-extrabold text-terracotta-600">{spiceLevel}</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {["Namkeen Mild", "Chatpata Desi", "Full Angara"].map((lvl) => (
                    <button
                      type="button"
                      key={lvl}
                      onClick={() => setSpiceLevel(lvl)}
                      className={`text-[11px] font-bold py-2 px-1 rounded-xl transition-all border cursor-pointer ${
                        spiceLevel === lvl
                          ? "bg-charcoal-900 text-white border-charcoal-900 shadow-sm"
                          : "bg-white text-charcoal-800 border-sand-300 hover:bg-sand-200"
                      }`}
                    >
                      {lvl}
                    </button>
                  ))}
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-charcoal-800 mb-1 mt-2">
                    Cooking / Delivery Instructions (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Extra ginger juliennes, less oil, call before arrival"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full bg-white border border-sand-300 rounded-xl px-3.5 py-2 text-xs text-charcoal-900 focus:outline-none focus:border-terracotta-500"
                  />
                </div>
              </div>

              {/* =========================================================
                  PAYMENT METHOD SELECTION (COD, Easypaisa, JazzCash)
                  ========================================================= */}
              <div className="space-y-3 pt-2 border-t border-sand-200">
                <h4 className="text-xs font-extrabold uppercase tracking-wider text-charcoal-900 flex items-center gap-1.5">
                  <Banknote className="w-3.5 h-3.5 text-emerald-600" />
                  <span>3. Payment Method</span>
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {/* Option 1: Cash on Delivery */}
                  <label
                    onClick={() => setPaymentMethod("cod")}
                    className={`relative p-3 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                      paymentMethod === "cod"
                        ? "border-charcoal-900 bg-sand-50 shadow-sm"
                        : "border-sand-300 bg-white hover:bg-sand-50"
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

                  {/* Option 2: Easypaisa */}
                  <label
                    onClick={() => setPaymentMethod("easypaisa")}
                    className={`relative p-3 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                      paymentMethod === "easypaisa"
                        ? "border-emerald-600 bg-emerald-50/50 shadow-sm"
                        : "border-sand-300 bg-white hover:bg-emerald-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white bg-emerald-600 px-2 py-0.5 rounded-full">
                        easypaisa
                      </span>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "easypaisa"}
                        onChange={() => setPaymentMethod("easypaisa")}
                        className="accent-emerald-600"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="font-extrabold text-xs text-charcoal-900">Easypaisa</p>
                      <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">Mobile Transfer</p>
                    </div>
                  </label>

                  {/* Option 3: JazzCash */}
                  <label
                    onClick={() => setPaymentMethod("jazzcash")}
                    className={`relative p-3 rounded-2xl border-2 flex flex-col justify-between cursor-pointer transition-all ${
                      paymentMethod === "jazzcash"
                        ? "border-red-600 bg-red-50/50 shadow-sm"
                        : "border-sand-300 bg-white hover:bg-red-50/20"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-extrabold text-white bg-red-600 px-2 py-0.5 rounded-full">
                        JazzCash
                      </span>
                      <input
                        type="radio"
                        name="payment"
                        checked={paymentMethod === "jazzcash"}
                        onChange={() => setPaymentMethod("jazzcash")}
                        className="accent-red-600"
                      />
                    </div>
                    <div className="mt-2">
                      <p className="font-extrabold text-xs text-charcoal-900">JazzCash</p>
                      <p className="text-[10px] text-red-800 font-semibold mt-0.5">Mobile Transfer</p>
                    </div>
                  </label>
                </div>

                {/* Sub-Panel for Easypaisa Instructions */}
                {paymentMethod === "easypaisa" && (
                  <div className="bg-emerald-50 border border-emerald-300 rounded-2xl p-3.5 space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-emerald-950 font-bold">
                      <span>Official Easypaisa Account:</span>
                      <span className="text-[10px] bg-emerald-600 text-white px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-2.5 border border-emerald-200 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-charcoal-600 font-semibold">Account Title</p>
                        <p className="font-bold text-xs text-charcoal-900">Pehalwan Karahi Official</p>
                        <p className="font-mono font-extrabold text-sm text-emerald-800 mt-0.5">
                          0300-1234567
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("03001234567", "easypaisa")}
                        className="bg-emerald-100 hover:bg-emerald-200 text-emerald-900 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedAccount === "easypaisa" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-700" />
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
                      <label className="block text-[11px] font-bold text-emerald-950 mb-1">
                        Transaction ID (TID) / Sender Number (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TID 84920491 or Sender Mobile #"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full bg-white border border-emerald-300 rounded-xl px-3 py-1.5 text-xs text-charcoal-900 focus:outline-none"
                      />
                    </div>
                  </div>
                )}

                {/* Sub-Panel for JazzCash Instructions */}
                {paymentMethod === "jazzcash" && (
                  <div className="bg-red-50 border border-red-300 rounded-2xl p-3.5 space-y-2 text-xs animate-in fade-in duration-200">
                    <div className="flex items-center justify-between text-red-950 font-bold">
                      <span>Official JazzCash Account:</span>
                      <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full">
                        Verified
                      </span>
                    </div>
                    <div className="bg-white rounded-xl p-2.5 border border-red-200 flex items-center justify-between">
                      <div>
                        <p className="text-[10px] text-charcoal-600 font-semibold">Account Title</p>
                        <p className="font-bold text-xs text-charcoal-900">Pehalwan Karahi Official</p>
                        <p className="font-mono font-extrabold text-sm text-red-800 mt-0.5">
                          0321-9876543
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy("03219876543", "jazzcash")}
                        className="bg-red-100 hover:bg-red-200 text-red-900 font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 text-[11px] cursor-pointer"
                      >
                        {copiedAccount === "jazzcash" ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-red-700" />
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
                      <label className="block text-[11px] font-bold text-red-950 mb-1">
                        Transaction ID (TID) / Sender Number (Optional):
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. TID 62840182 or Sender Mobile #"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        className="w-full bg-white border border-red-300 rounded-xl px-3 py-1.5 text-xs text-charcoal-900 focus:outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom Submit Action Bar */}
            <div className="p-4 sm:p-5 bg-sand-50 border-t border-sand-200 shrink-0 space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-charcoal-900">
                <span>Total Amount:</span>
                <span className="font-extrabold text-base text-terracotta-500">
                  Rs. {totalAmount.toLocaleString()}
                </span>
              </div>

              <button
                type="submit"
                disabled={isSubmittingOrder}
                className="w-full bg-terracotta-500 hover:bg-terracotta-600 text-white font-extrabold text-sm py-3.5 rounded-full shadow-glow transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isSubmittingOrder ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Dispatching to Live Wok...</span>
                  </>
                ) : (
                  <>
                    <span>Confirm &amp; Place Order</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}

        {/* =========================================================
            STEP 3: ORDER SUCCESS RECEIPT & CONFIRMATION
            ========================================================= */}
        {step === "success" && completedOrder && (
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

              {/* Easypaisa / JazzCash Reminder */}
              {(completedOrder.paymentMethod === "easypaisa" ||
                completedOrder.paymentMethod === "jazzcash") && (
                <div className="bg-amber-50 border border-amber-300 rounded-xl p-3 text-left text-xs text-amber-900">
                  <p className="font-bold">⚠️ Payment Reminder:</p>
                  <p className="text-[11px] mt-0.5">
                    Please transfer <strong>Rs. {completedOrder.totalAmount.toLocaleString()}</strong> to{" "}
                    <strong>
                      {completedOrder.paymentMethod === "easypaisa"
                        ? "0300-1234567 (Easypaisa)"
                        : "0321-9876543 (JazzCash)"}
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
                onClick={handleClose}
                className="w-full bg-sand-200 hover:bg-sand-300 text-charcoal-900 font-bold text-xs py-3 rounded-full transition-all cursor-pointer"
              >
                Close &amp; Back to Restaurant
              </button>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
