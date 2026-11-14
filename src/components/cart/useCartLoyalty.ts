"use client";

import { useState } from "react";
import { api, getErrorMessage, LoyaltyPassSummary } from "@/services/api";

export function useCartLoyalty() {
  const [loyaltyPhone, setLoyaltyPhone] = useState("");
  const [loyaltyPass, setLoyaltyPass] = useState<LoyaltyPassSummary | null>(null);
  const [isCheckingLoyalty, setIsCheckingLoyalty] = useState(false);
  const [loyaltyMessage, setLoyaltyMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleCheckLoyalty = async (phoneToCheck?: string) => {
    const target = (phoneToCheck ?? loyaltyPhone).trim();
    if (!target) {
      setLoyaltyMessage({ type: "error", text: "Please enter a phone number" });
      return;
    }
    setIsCheckingLoyalty(true);
    setLoyaltyMessage(null);

    try {
      const pass = await api.getLoyaltyPass(target);
      if (pass && typeof pass.discountPercent === "number") {
        setLoyaltyPass(pass);
        setLoyaltyPhone(target);
        setLoyaltyMessage({
          type: "success",
          text: `👑 ${pass.tier || "Shahi VIP"} verified! ${pass.discountPercent}% Karahi discount applied.`,
        });
      } else {
        setLoyaltyPass(null);
        setLoyaltyMessage({ type: "error", text: "No active VIP loyalty pass found for this phone number." });
      }
    } catch (err: unknown) {
      setLoyaltyPass(null);
      setLoyaltyMessage({
        type: "error",
        text: getErrorMessage(err, "No active VIP loyalty pass found for this phone number."),
      });
    } finally {
      setIsCheckingLoyalty(false);
    }
  };

  const handleRemoveLoyalty = () => {
    setLoyaltyPass(null);
    setLoyaltyPhone("");
    setLoyaltyMessage(null);
  };

  const resetLoyalty = () => {
    setLoyaltyPass(null);
    setLoyaltyPhone("");
    setLoyaltyMessage(null);
  };

  return {
    loyaltyPhone,
    setLoyaltyPhone,
    loyaltyPass,
    isCheckingLoyalty,
    loyaltyMessage,
    handleCheckLoyalty,
    handleRemoveLoyalty,
    resetLoyalty,
  };
}
