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
  paymentMethod: "cod",
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
  const totalAmount = Math.max(0, subtotal - discount);

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
    if (!formData.customerName.trim()) errs.name = "Please enter your name";
    if (!formData.customerPhone.trim() || formData.customerPhone.trim().length < 10) {
      errs.phone = "Enter a valid 11-digit phone number (e.g. 0300-1234567)";
    }
    if (!formData.address.trim()) errs.address = "Please enter your delivery address / location";
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
        spiceLevel,
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
          discount: result.discount ?? discount,
          totalAmount: result.total,
          paymentMethod: formData.paymentMethod,
          transactionId: formData.transactionId.trim(),
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
          />
        )}

        {step === "checkout" && (
          <CheckoutForm
            formData={formData}
            updateField={updateField}
            setAddress={setAddress}
            totalAmount={totalAmount}
            discount={discount}
            cartItemsCount={cart.reduce((s, i) => s + i.qty, 0)}
            spiceLevel={spiceLevel}
            setSpiceLevel={setSpiceLevel}
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
          />
        )}

        {step === "success" && completedOrder && (
          <SuccessView completedOrder={completedOrder} onClose={handleClose} />
        )}
      </aside>
    </>
  );
}
