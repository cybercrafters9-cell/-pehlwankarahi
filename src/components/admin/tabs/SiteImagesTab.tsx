"use client";

import { useState } from "react";
import Image from "next/image";
import { SiteSlot, Dish } from "@/services/api";
import { resolveImageUrl } from "@/lib/media";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Modal } from "../ui/Modal";
import { ImagePicker } from "../ui/ImagePicker";
import { Input } from "../ui/Input";
import { FeaturedStripEditor } from "./FeaturedStripEditor";
import {
  RotateCcw,
  Upload,
  Loader2,
  Check,
  Sparkles,
} from "lucide-react";

interface SiteImagesTabProps {
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
  isLoading: boolean;
}

const SECTION_DESCRIPTIONS: Record<string, string> = {
  hero: "Hero Section — Overhead rotating flat-lay plates (1:1 circular aspect)",
  strip: "Featured Strip — Golden gradient marquee pill cards (1:1 circular)",
  bento: "Bento Grid — High-impact visual cards and promo banners",
  editorial: "Editorial Showcase — VIP card side platter photo (3:4 portrait)",
  reservation: "Reservation Section — Live sajji & koyla grill backdrop (16:9 widescreen)",
  video: "Video Modal — Kitchen teaser poster image (16:9 landscape)",
};

const ASPECT_RATIO_HINTS: Record<string, string> = {
  "hero.plate1": "1:1 Square / Circle (Min 600×600)",
  "hero.plate2": "1:1 Square / Circle (Min 600×600)",
  "hero.plate3": "1:1 Square / Circle (Min 600×600)",
  "strip.1": "1:1 Square / Circle (Min 300×300)",
  "strip.2": "1:1 Square / Circle (Min 300×300)",
  "strip.3": "1:1 Square / Circle (Min 300×300)",
  "strip.4": "1:1 Square / Circle (Min 300×300)",
  "bento.main": "4:3 Landscape (Min 1000×750)",
  "bento.deal": "16:9 Landscape (Min 600×350)",
  "bento.sub1": "4:3 Landscape (Min 600×450)",
  "bento.sub2": "4:3 Landscape (Min 600×450)",
  "bento.sub3": "4:3 Landscape (Min 600×450)",
  "bento.sub4": "4:3 Landscape (Min 600×450)",
  "editorial.main": "3:4 Portrait (Min 600×800)",
  "reservation.main": "16:9 Landscape (Min 900×500)",
  "video.poster": "16:9 Landscape (Min 900×500)",
};

const DISH_SLOT_KEYS = new Set([
  "hero.plate1",
  "hero.plate2",
  "hero.plate3",
  "strip.1",
  "strip.2",
  "strip.3",
  "strip.4",
  "bento.main",
  "bento.deal",
  "bento.sub1",
  "bento.sub2",
  "bento.sub3",
  "bento.sub4",
  "reservation.main",
]);

export function SiteImagesTab({
  slots,
  dishes,
  onUpdateSlot,
  isLoading,
}: SiteImagesTabProps) {
  const [editingSlot, setEditingSlot] = useState<SiteSlot | null>(null);
  const [replaceUrl, setReplaceUrl] = useState("");
  const [replaceMediaId, setReplaceMediaId] = useState<number | null>(null);
  const [slotLabel, setSlotLabel] = useState("");
  const [altText, setAltText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Group slots by section
  const sections = Array.from(new Set(slots.map((s) => s.section)));

  const handleOpenReplace = (slot: SiteSlot) => {
    setEditingSlot(slot);
    setReplaceUrl(slot.effectiveUrl);
    setReplaceMediaId(slot.mediaId);
    setSlotLabel(slot.label);
    setAltText(slot.altText);
  };

  const handleSaveReplace = async () => {
    if (!editingSlot) return;
    setIsSubmitting(true);
    try {
      // Check if replaceUrl is a database media URL e.g. /api/media/123
      let mediaId = replaceMediaId;
      if (mediaId === null && replaceUrl) {
        const match = replaceUrl.match(/\/api\/media\/(\d+)/);
        if (match) {
          mediaId = parseInt(match[1], 10);
        }
      }

      await onUpdateSlot(editingSlot.key, {
        mediaId: mediaId || null,
        customUrl: !mediaId && replaceUrl ? replaceUrl.trim() : null,
        fallbackUrl: !mediaId && replaceUrl ? replaceUrl.trim() : undefined,
        label: slotLabel.trim() || editingSlot.label,
        altText: altText.trim() || editingSlot.altText,
      });
      setEditingSlot(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLinkDish = async (slotKey: string, dishIdStr: string) => {
    const dishId = dishIdStr ? parseInt(dishIdStr, 10) : null;
    setIsSubmitting(true);
    try {
      await onUpdateSlot(slotKey, {
        dishId,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUnlinkDish = async (slotKey: string) => {
    setIsSubmitting(true);
    try {
      await onUpdateSlot(slotKey, {
        dishId: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToDefault = async (slot: SiteSlot) => {
    setIsSubmitting(true);
    try {
      await onUpdateSlot(slot.key, {
        mediaId: null,
        customUrl: null,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header Banner */}
      <div className="bg-sand-50 border border-sand-200 rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display font-bold text-xl text-charcoal-900">
              Homepage Imagery CMS Slots
            </h2>
            <Badge variant="terracotta">{slots.length} Fixed Slots</Badge>
          </div>
          <p className="text-xs text-charcoal-700/75 mt-0.5 max-w-2xl">
            Control every prominent image on the homepage. Link a slot directly to a menu dish (so it stays in sync with live dish photos) or upload custom imagery stored in MySQL.
          </p>
        </div>
      </div>

      {/* Quick notice for Logo & Favicon */}
      <div className="bg-sand-100 border border-sand-200 rounded-2xl p-4 flex items-center gap-3 text-xs">
        <Sparkles className="w-4 h-4 text-terracotta-500 shrink-0" />
        <p className="text-charcoal-700">
          <strong>Tip:</strong> Looking to change the <strong>Website Brand Logo</strong> or <strong>Browser Tab Favicon</strong>? You can upload and configure them under the <strong>Settings (⚙️)</strong> tab with live previews!
        </p>
      </div>

      {isLoading && slots.length === 0 ? (
        <div className="bg-sand-50 border border-sand-200 rounded-3xl p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-terracotta-500 mx-auto mb-2" />
          <p className="font-display font-bold text-base text-charcoal-900">
            Loading homepage image slots...
          </p>
        </div>
      ) : (
        <>
          <FeaturedStripEditor
            slots={slots}
            dishes={dishes}
            onUpdateSlot={onUpdateSlot}
            onOpenImageModal={handleOpenReplace}
          />
          {sections.map((sectionKey) => {
          const sectionSlots = slots.filter((s) => s.section === sectionKey);

          return (
            <div key={sectionKey} className="space-y-4">
              <div className="border-b border-sand-300 pb-2">
                <h3 className="font-display font-bold text-base sm:text-lg text-charcoal-900 capitalize flex items-center gap-2">
                  <span>{sectionKey} Section</span>
                  <Badge variant="charcoal">{sectionSlots.length} Slots</Badge>
                </h3>
                <p className="text-xs text-charcoal-600 mt-0.5">
                  {SECTION_DESCRIPTIONS[sectionKey] || "Homepage showcase slot"}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {sectionSlots.map((slot) => {
                  const resolvedUrl = resolveImageUrl(slot.effectiveUrl);
                  const isMediaCustom = Boolean(slot.mediaId || (slot.customUrl && slot.customUrl.trim()));
                  const isDishSlot = DISH_SLOT_KEYS.has(slot.key);
                  const isDishLinked = Boolean(slot.dishId);
                  const matchedDish = dishes.find((d) => d.id === slot.dishId);
                  const hint = ASPECT_RATIO_HINTS[slot.key] || "Recommended aspect ratio";

                  return (
                    <div
                      key={slot.key}
                      className="bg-sand-50 border border-sand-200 rounded-3xl overflow-hidden shadow-soft flex flex-col justify-between group hover:shadow-card transition-all"
                    >
                      <div>
                        {/* Image Preview Container */}
                        <div className="relative h-44 overflow-hidden bg-charcoal-900">
                          <Image
                            src={resolvedUrl}
                            alt={slot.altText || slot.label}
                            fill
                            unoptimized={resolvedUrl.includes("/api/media/")}
                            sizes="(max-width: 640px) 100vw, 33vw"
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent" />

                          {/* Source Status Tags */}
                          <div className="absolute top-3 left-3 flex flex-wrap gap-1 max-w-[85%]">
                            {isMediaCustom && (
                              <Badge variant="saffron">
                                {slot.mediaId ? "Uploaded Media" : "Custom URL"}
                              </Badge>
                            )}
                            {isDishSlot ? (
                              isDishLinked ? (
                                <Badge variant="terracotta">
                                  Linked: {matchedDish?.name || `Dish #${slot.dishId}`}
                                </Badge>
                              ) : (
                                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-red-600 text-white shadow-sm">
                                  Unlinked - add to cart hidden
                                </span>
                              )
                            ) : (
                              !isMediaCustom && (
                                <Badge variant="charcoal">Default Fallback</Badge>
                              )
                            )}
                          </div>

                          {/* Sizing Hint Tag */}
                          <span className="absolute bottom-3 left-3 bg-charcoal-900/80 backdrop-blur-sm text-sand-200 text-[10px] font-mono px-2 py-0.5 rounded-full border border-white/10">
                            {hint}
                          </span>
                        </div>

                        {/* Slot Information */}
                        <div className="p-4 space-y-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="text-[10px] font-mono text-charcoal-500 font-bold uppercase tracking-wider">
                              {slot.key}
                            </span>
                            {slot.dishName && (
                              <span className="text-[10px] text-terracotta-600 font-semibold truncate max-w-[140px]">
                                {slot.dishName}
                              </span>
                            )}
                          </div>
                          <h4 className="font-display font-bold text-sm sm:text-base text-charcoal-900">
                            {slot.label}
                          </h4>
                          <p className="text-xs text-charcoal-700/75 line-clamp-1">
                            Alt: {slot.altText}
                          </p>
                        </div>
                      </div>

                      {/* Controls Footer */}
                      <div className="p-4 pt-3 border-t border-sand-200/80 bg-sand-100/50 space-y-3">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenReplace(slot)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-sand-100 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Replace Image</span>
                          </button>

                          {isMediaCustom && (
                            <button
                              type="button"
                              onClick={() => handleResetToDefault(slot)}
                              title="Reset image to dish/fallback default"
                              className="px-2.5 py-1.5 rounded-xl bg-sand-200 hover:bg-charcoal-900 hover:text-white text-charcoal-700 text-xs font-bold flex items-center gap-1 transition-colors cursor-pointer shrink-0"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                              <span>Reset Image</span>
                            </button>
                          )}
                        </div>

                        {/* Dish Dropdown for EVERY Dish-Linked Slot */}
                        {isDishSlot && (
                          <div className="space-y-1 pt-1 border-t border-sand-200/60">
                            <div className="flex items-center justify-between">
                              <label className="text-[11px] font-bold text-charcoal-700">
                                Linked Menu Dish:
                              </label>
                              {!isDishLinked && (
                                <span className="text-[10px] text-red-600 font-bold">
                                  Hidden from cart
                                </span>
                              )}
                            </div>
                            <div className="flex items-center gap-1.5">
                              <select
                                value={slot.dishId || ""}
                                onChange={(e) => handleLinkDish(slot.key, e.target.value)}
                                disabled={isSubmitting}
                                className="flex-1 bg-white border border-sand-300 rounded-xl px-2.5 py-1.5 text-xs font-semibold text-charcoal-900 focus:outline-none focus:border-terracotta-500 cursor-pointer"
                              >
                                <option value="">-- Choose Menu Dish (or leave unlinked) --</option>
                                {dishes.map((dish) => (
                                  <option key={dish.id} value={dish.id}>
                                    #{dish.id} — {dish.name} (Rs. {dish.price.toLocaleString()})
                                  </option>
                                ))}
                              </select>
                              {isDishLinked && (
                                <button
                                  type="button"
                                  onClick={() => handleUnlinkDish(slot.key)}
                                  disabled={isSubmitting}
                                  title="Unlink dish"
                                  className="px-2.5 py-1.5 rounded-xl bg-sand-200 hover:bg-red-600 hover:text-white text-charcoal-700 text-xs font-bold transition-colors cursor-pointer shrink-0"
                                >
                                  Unlink
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
        </>
      )}

      {/* Replace Image Modal */}
      {editingSlot && (
        <Modal
          isOpen={true}
          onClose={() => setEditingSlot(null)}
          title={`Replace Image: ${editingSlot.label}`}
          subtitle={`Slot Key: ${editingSlot.key} (${ASPECT_RATIO_HINTS[editingSlot.key] || "Custom aspect ratio"})`}
          footer={
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setEditingSlot(null)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={handleSaveReplace}
                isLoading={isSubmitting}
                icon={<Check className="w-4 h-4" />}
              >
                Save Slot Image
              </Button>
            </>
          }
        >
          <div className="space-y-4">
            <ImagePicker
              label="Upload Image (Compresses & Stores in DB)"
              value={replaceUrl}
              onChange={({ mediaId, url }) => {
                setReplaceUrl(url);
                setReplaceMediaId(mediaId);
              }}
            />

            <Input
              label="Slot Tag / Label"
              value={slotLabel}
              onChange={(e) => setSlotLabel(e.target.value)}
              placeholder="e.g. KARAHI, ROYAL CHAAMP, SPECIAL SHANK"
            />

            <Input
              label="Display Title / Alt Text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive title & alt text"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
