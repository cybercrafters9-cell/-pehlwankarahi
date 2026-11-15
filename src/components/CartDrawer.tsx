"use client";

import React, { useState } from "react";
import { useRestaurant } from "@/context/RestaurantContext";
import { DrawerStep, CompletedOrderSummary, CheckoutFormData } from "./cart/types";
import { useCartLoyalty } from "./cart/useCartLoyalty";
import CartHeader from "./cart/CartHeader";
import CartStep from "./cart/CartStep";
import CheckoutForm from "./cart/CheckoutForm";
import SuccessView from "./cart/SuccessView";

const INITIAL_FORM: CheckoutFormData = {
  customerName: "",
  customerPhone: "",
  address: "",
  notes: "",
  paymentMethod: "easypaisa",
  transactionId: "",
};

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
    settings,
  } = useRestaurant();

  const [step, setStep] = useState<DrawerStep>("cart");
  const [formData, setFormData] = useState<CheckoutFormData>(INITIAL_FORM);
  const [copiedAccount, setCopiedAccount] = useState<string | null>(null);

  const {
    loyaltyPhone,
    setLoyaltyPhone,
    loyaltyPass,
    isCheckingLoyalty,
    loyaltyMessage,
    handleCheckLoyalty,
    handleRemoveLoyalty,
    resetLoyalty,
  } = useCartLoyalty();

  // Completed Order State for Success Screen (strictly typed, no any)
  const [completedOrder, setCompletedOrder] = useState<CompletedOrderSummary | null>(null);
  const [errors, setErrors] = useState<{ name?: string; phone?: string; address?: string }>({});

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const discount = loyaltyPass ? Math.round(subtotal * (loyaltyPass.discountPercent / 100)) : 0;
  const freeThreshold = settings?.freeDeliveryThreshold ?? 0;
  const baseDeliveryFee = typeof settings?.deliveryFee === "number" ? settings.deliveryFee : 0;
  const deliveryFee = freeThreshold > 0 && subtotal >= freeThreshold ? 0 : baseDeliveryFee;
  const totalAmount = Math.max(0, subtotal + deliveryFee - discount);

  const updateField = <K extends keyof CheckoutFormData>(field: K, val: CheckoutFormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const setAddress: React.Dispatch<React.SetStateAction<string>> = (action) => {
    setFormData((prev) => ({
      ...prev,
      address: typeof action === "function" ? action(prev.address) : action,
    }));
  };

  const handleClose = () => {
    setIsCartOpen(false);
    if (step === "success") {
      setStep("cart");
      setCompletedOrder(null);
      resetLoyalty();
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedAccount(label);
    setTimeout(() => setCopiedAccount(null), 1500);
  };

  const validateForm = () => {
    const errs: typeof errors = {};
    if (!formData.customerName.trim()) {
      errs.name = "Please enter your full name";
    }

    const cleanPhone = formData.customerPhone.replace(/\D/g, "");
    if (!formData.customerPhone.trim()) {
      errs.phone = "Phone number is compulsory";
    } else if (cleanPhone.length !== 11) {
      errs.phone = "Phone number must be exactly 11 digits (e.g. 03001234567)";
    }

    if (!formData.address.trim()) {
      errs.address = "Delivery address is compulsory";
    } else if (formData.address.trim().length < 5) {
      errs.address = "Please enter a complete delivery address";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmitOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const result = await placeOrder({
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        address: formData.address.trim(),
        spiceLevel: "Standard",
        paymentMethod: formData.paymentMethod,
        transactionId: formData.transactionId.trim() || undefined,
        notes: formData.notes.trim() || undefined,
        loyaltyPhone: loyaltyPass ? loyaltyPhone.trim() : undefined,
      });

      if (result) {
        setCompletedOrder({
          id: result.id,
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim(),
          address: formData.address.trim(),
          subtotal: result.subtotal ?? subtotal,
          deliveryFee: result.deliveryFee ?? deliveryFee,
          discount: result.discount ?? discount,
          totalAmount: result.total,
          paymentMethod: formData.paymentMethod,
          transactionId: formData.transactionId.trim(),
          items: cart.map((i) => ({ id: i.id, name: i.name, price: i.price, qty: i.qty })),
        });
        setStep("success");
      }
    } catch {
      // Stay on checkout step; toast displayed by placeOrder
    }
  };

  return (
    <>
      <div
        onClick={handleClose}
        className={`fixed inset-0 bg-charcoal-900/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isCartOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
      />

      <aside
        className={`fixed top-0 right-0 h-full w-full max-w-lg bg-sand-100 z-50 shadow-2xl transition-transform duration-300 flex flex-col justify-between border-l border-sand-300 ${
          isCartOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <CartHeader step={step} onBack={() => setStep("cart")} onClose={handleClose} />

        {step === "cart" && (
          <CartStep
            cart={cart}
            updateQty={updateQty}
            isSubmittingOrder={isSubmittingOrder}
            subtotal={subtotal}
            deliveryFee={deliveryFee}
            discount={discount}
            totalAmount={totalAmount}
            loyaltyPhone={loyaltyPhone}
            setLoyaltyPhone={setLoyaltyPhone}
            loyaltyPass={loyaltyPass}
            loyaltyMessage={loyaltyMessage}
            isCheckingLoyalty={isCheckingLoyalty}
            onCheckLoyalty={() => handleCheckLoyalty()}
            onRemoveLoyalty={handleRemoveLoyalty}
            onProceed={() => setStep("checkout")}
            settings={settings}
          />
        )}

        {step === "checkout" && (
          <CheckoutForm
            formData={formData}
            updateField={updateField}
            setAddress={setAddress}
            subtotal={subtotal}
            totalAmount={totalAmount}
            discount={discount}
            cartItemsCount={cart.reduce((s, i) => s + i.qty, 0)}
            copiedAccount={copiedAccount}
            onCopy={handleCopy}
            loyaltyPhone={loyaltyPhone}
            setLoyaltyPhone={setLoyaltyPhone}
            loyaltyPass={loyaltyPass}
            loyaltyMessage={loyaltyMessage}
            isCheckingLoyalty={isCheckingLoyalty}
            onCheckLoyalty={handleCheckLoyalty}
            onRemoveLoyalty={handleRemoveLoyalty}
            errors={errors}
            setErrors={setErrors}
            onSubmit={handleSubmitOrder}
            isSubmittingOrder={isSubmittingOrder}
            settings={settings}
          />
        )}

        {step === "success" && completedOrder && (
          <SuccessView completedOrder={completedOrder} onClose={handleClose} settings={settings} />
        )}
      </aside>
    </>
  );
}
