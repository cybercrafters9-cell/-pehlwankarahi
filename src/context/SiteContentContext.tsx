"use client";

import {
  createContext,
  useContext,
  ReactNode,
  useState,
  useMemo,
  useEffect,
  useCallback,
} from "react";
import { SiteSlot, api } from "@/services/api";
import { resolveImageUrl } from "@/lib/media";

interface SiteContentContextType {
  slots: Record<string, SiteSlot>;
  setSlot: (slot: SiteSlot) => void;
  refreshSlots: () => Promise<void>;
  isLoading: boolean;
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
  const [isLoading, setIsLoading] = useState(false);

  const setSlot = useCallback((slot: SiteSlot) => {
    setSlots((prev) => ({
      ...prev,
      [slot.key]: slot,
    }));
  }, []);

  const refreshSlots = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await api.getSiteContent();
      if (res && res.slots) {
        setSlots(res.slots);
      }
    } catch {
      // Keep existing slots on transient network fail
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Sync slots on mount and revalidate on tab focus or cross-tab updates
  useEffect(() => {
    // If initialSlots was empty or for initial freshness, fetch in background
    refreshSlots();

    const handleFocus = () => {
      refreshSlots();
    };

    const handleCustomUpdate = () => {
      refreshSlots();
    };

    const handleStorage = (e: StorageEvent) => {
      if (e.key === "pehalwan_slots_version") {
        refreshSlots();
      }
    };

    window.addEventListener("focus", handleFocus);
    window.addEventListener("pehalwan_slots_updated", handleCustomUpdate);
    window.addEventListener("storage", handleStorage);

    return () => {
      window.removeEventListener("focus", handleFocus);
      window.removeEventListener("pehalwan_slots_updated", handleCustomUpdate);
      window.removeEventListener("storage", handleStorage);
    };
  }, [refreshSlots]);

  const value = useMemo(
    () => ({ slots, setSlot, refreshSlots, isLoading }),
    [slots, setSlot, refreshSlots, isLoading]
  );

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
