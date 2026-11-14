"use client";

import { createContext, useContext, ReactNode, useState, useMemo } from "react";
import { SiteSlot } from "@/services/api";
import { resolveImageUrl } from "@/lib/media";

interface SiteContentContextType {
  slots: Record<string, SiteSlot>;
  setSlot: (slot: SiteSlot) => void;
}

const SiteContentContext = createContext<SiteContentContextType | undefined>(
  undefined
);

interface SiteContentProviderProps {
  children: ReactNode;
  initialSlots?: Record<string, SiteSlot>;
}

export function SiteContentProvider({
  children,
  initialSlots = {},
}: SiteContentProviderProps) {
  const [slots, setSlots] = useState<Record<string, SiteSlot>>(initialSlots);

  const setSlot = (slot: SiteSlot) => {
    setSlots((prev) => ({
      ...prev,
      [slot.key]: slot,
    }));
  };

  const value = useMemo(() => ({ slots, setSlot }), [slots]);

  return (
    <SiteContentContext.Provider value={value}>
      {children}
    </SiteContentContext.Provider>
  );
}

export interface SlotResult {
  url: string;
  alt: string;
  dishId?: number | null;
  dishName?: string;
  slot?: SiteSlot;
}

export function useSlot(
  key: string,
  fallback?: { url?: string; alt?: string; dishId?: number }
): SlotResult {
  const context = useContext(SiteContentContext);
  const slot = context?.slots[key];

  const rawUrl = slot?.effectiveUrl || fallback?.url || "";
  const effectiveUrl = resolveImageUrl(rawUrl);
  const alt = slot?.altText || fallback?.alt || "Pehalwan Karahi";
  const dishId = slot?.dishId ?? fallback?.dishId ?? null;
  const dishName = slot?.dishName;

  return {
    url: effectiveUrl,
    alt,
    dishId,
    dishName,
    slot,
  };
}
