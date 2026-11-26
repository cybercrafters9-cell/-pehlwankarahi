"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { Dish, SiteSlot } from "@/services/api";
import { resolveImageUrl } from "@/lib/media";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Input } from "../ui/Input";
import { Check, Flame, RotateCcw, Upload } from "lucide-react";

interface FeaturedStripEditorProps {
  slots: SiteSlot[];
  dishes: Dish[];
  onUpdateSlot: (
    key: string,
    data: {
      mediaId?: number | null;
      customUrl?: string | null;
      dishId?: number | null;
      label?: string;
      altText?: string;
      fallbackUrl?: string;
    }
  ) => Promise<void>;
  onOpenImageModal: (slot: SiteSlot) => void;
}

interface DraftCard {
  dishId: number | null;
  label: string;
  altText: string;
}

const STRIP_KEYS = ["strip.1", "strip.2", "strip.3", "strip.4"];

export function FeaturedStripEditor({
  slots,
  dishes,
  onUpdateSlot,
  onOpenImageModal,
}: FeaturedStripEditorProps) {
  const stripSlots = STRIP_KEYS.map((key) => slots.find((s) => s.key === key)).filter(
    (s): s is SiteSlot => Boolean(s)
  );

  const [drafts, setDrafts] = useState<Record<string, DraftCard>>({});
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    const next: Record<string, DraftCard> = {};
    for (const slot of stripSlots) {
      next[slot.key] = {
        dishId: slot.dishId ?? null,
        label: slot.label || "",
        altText: slot.altText || "",
      };
    }
    setDrafts(next);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slots]);

  if (stripSlots.length === 0) return null;

  const handleDishChange = (slot: SiteSlot, dishIdStr: string) => {
    const newDishId = dishIdStr ? parseInt(dishIdStr, 10) : null;
    const selectedDish = newDishId ? dishes.find((d) => d.id === newDishId) : null;

    setDrafts((prev) => {
      const curr = prev[slot.key] || {
        dishId: slot.dishId ?? null,
        label: slot.label || "",
        altText: slot.altText || "",
      };
      return {
        ...prev,
        [slot.key]: {
          dishId: newDishId,
          label: selectedDish ? selectedDish.category : curr.label,
          altText: selectedDish ? selectedDish.name : curr.altText,
        },
      };
    });
  };

  const handleFieldChange = (
    key: string,
    field: "label" | "altText",
    value: string
  ) => {
    setDrafts((prev) => ({
      ...prev,
      [key]: {
        ...(prev[key] || { dishId: null, label: "", altText: "" }),
        [field]: value,
      },
    }));
  };

  const handleSaveCard = async (slot: SiteSlot) => {
    const draft = drafts[slot.key];
    if (!draft) return;
    setSavingKey(slot.key);
    try {
      await onUpdateSlot(slot.key, {
        dishId: draft.dishId,
        label: draft.label.trim() || slot.label,
        altText: draft.altText.trim() || slot.altText,
      });
      setSavedKey(slot.key);
      setTimeout(() => setSavedKey((curr) => (curr === slot.key ? null : curr)), 2000);
    } finally {
      setSavingKey(null);
    }
  };

  const handleResetImage = async (slot: SiteSlot) => {
    setSavingKey(slot.key);
    try {
      await onUpdateSlot(slot.key, {
        mediaId: null,
        customUrl: null,
      });
    } finally {
      setSavingKey(null);
    }
  };

  return (
    <div className="bg-sand-50 border border-sand-200 rounded-3xl p-5 sm:p-6 shadow-soft space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-sand-200 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-terracotta-500" />
            <h3 className="font-display font-bold text-lg text-charcoal-900">
              Featured Menu Bar (4-Card Strip)
            </h3>
            <Badge variant="terracotta">Fully Editable</Badge>
          </div>
          <p className="text-xs text-charcoal-700/75 mt-0.5">
            Choose which menu items appear in the homepage gradient bar, customize their tag/title, or change their photos.
          </p>
        </div>
      </div>

      {/* Live Mini Preview */}
      <div className="reference-pill-gradient rounded-3xl sm:rounded-full p-3.5 sm:px-5 sm:py-3 text-white shadow-card">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-center">
          {stripSlots.map((slot, idx) => {
            const draft = drafts[slot.key] || {
              dishId: slot.dishId ?? null,
              label: slot.label,
              altText: slot.altText,
            };
            const dish = draft.dishId ? dishes.find((d) => d.id === draft.dishId) : null;
            const hasCustomMedia = Boolean(
              slot.mediaId || (slot.customUrl && slot.customUrl.trim())
            );
            const imgUrl = hasCustomMedia
              ? slot.effectiveUrl
              : dish?.image || slot.effectiveUrl;
            const isFourth = idx === 3;

            return (
              <div
                key={slot.key}
                className={`flex items-center gap-3 p-2 rounded-full ${
                  isFourth ? "bg-charcoal-900/20" : "bg-white/10"
                }`}
              >
                <div className="relative w-10 h-10 rounded-full overflow-hidden border border-white/40 shrink-0">
                  <Image
                    src={resolveImageUrl(imgUrl)}
                    alt={draft.altText || slot.altText}
                    fill
                    unoptimized={imgUrl.includes("/api/media/")}
                    sizes="40px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[9px] uppercase tracking-wider font-bold truncate ${
                      isFourth ? "text-charcoal-900" : "text-saffron-300"
                    }`}
                  >
                    {draft.label || dish?.category || "Featured"}
                  </p>
                  <p
                    className={`text-xs font-bold truncate ${
                      isFourth ? "text-charcoal-900" : "text-white"
                    }`}
                  >
                    {draft.altText || dish?.name || slot.altText}
                  </p>
                  {dish && (
                    <span
                      className={`text-[10px] font-bold ${
                        isFourth ? "text-charcoal-900" : "text-white/85"
                      }`}
                    >
                      Rs. {dish.price.toLocaleString()} • + Add
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4 Card Editors */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {stripSlots.map((slot, idx) => {
          const draft = drafts[slot.key] || {
            dishId: slot.dishId ?? null,
            label: slot.label,
            altText: slot.altText,
          };
          const dish = draft.dishId ? dishes.find((d) => d.id === draft.dishId) : null;
          const hasCustomMedia = Boolean(
            slot.mediaId || (slot.customUrl && slot.customUrl.trim())
          );
          const imgUrl = hasCustomMedia
            ? slot.effectiveUrl
            : dish?.image || slot.effectiveUrl;
          const isSaving = savingKey === slot.key;
          const isSaved = savedKey === slot.key;

          return (
            <div
              key={slot.key}
              className="bg-white border border-sand-200 rounded-2xl p-4 space-y-3 shadow-xs"
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <div className="relative w-11 h-11 rounded-full overflow-hidden border border-sand-300 shrink-0 bg-charcoal-900">
                    <Image
                      src={resolveImageUrl(imgUrl)}
                      alt={draft.altText || slot.altText}
                      fill
                      unoptimized={imgUrl.includes("/api/media/")}
                      sizes="44px"
                      className="object-cover"
                    />
                  </div>
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-charcoal-500">
                      Card #{idx + 1} ({slot.key})
                    </span>
                    <p className="text-xs font-bold text-charcoal-900">
                      {dish ? `Rs. ${dish.price.toLocaleString()} • + Add enabled` : "Custom / Info Card"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => onOpenImageModal(slot)}
                    className="px-2.5 py-1.5 rounded-xl bg-sand-100 hover:bg-charcoal-900 hover:text-white text-charcoal-800 text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    <Upload className="w-3 h-3" />
                    <span>Photo</span>
                  </button>
                  {hasCustomMedia && (
                    <button
                      type="button"
                      onClick={() => handleResetImage(slot)}
                      disabled={isSaving}
                      title="Use linked dish photo / default"
                      className="px-2 py-1.5 rounded-xl bg-sand-100 hover:bg-red-600 hover:text-white text-charcoal-700 text-[11px] font-bold transition-colors cursor-pointer"
                    >
                      <RotateCcw className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Menu Item Picker */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-charcoal-700 block">
                  Menu Item (Shows Price &amp; + Add Button)
                </label>
                <select
                  value={draft.dishId ?? ""}
                  onChange={(e) => handleDishChange(slot, e.target.value)}
                  className="w-full bg-sand-50 border border-sand-300 rounded-xl px-3 py-2 text-xs font-semibold text-charcoal-900 focus:outline-none focus:border-terracotta-500 cursor-pointer"
                >
                  <option value="">-- Custom Card (No Dish Linked) --</option>
                  {dishes.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name} — Rs. {d.price.toLocaleString()} ({d.category})
                    </option>
                  ))}
                </select>
              </div>

              {/* Editable Tag & Title */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <Input
                  label="Top Tag / Category"
                  value={draft.label}
                  onChange={(e) => handleFieldChange(slot.key, "label", e.target.value)}
                  placeholder="e.g. KARAHI, BEST SELLER"
                />
                <Input
                  label="Display Title"
                  value={draft.altText}
                  onChange={(e) => handleFieldChange(slot.key, "altText", e.target.value)}
                  placeholder="e.g. Chicken Karahi"
                />
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="button"
                  size="sm"
                  variant={isSaved ? "secondary" : "primary"}
                  isLoading={isSaving}
                  onClick={() => handleSaveCard(slot)}
                  icon={<Check className="w-3.5 h-3.5" />}
                >
                  {isSaved ? "Saved!" : "Save Card"}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
