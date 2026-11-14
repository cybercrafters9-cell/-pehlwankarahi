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
import {
  Link2,
  RotateCcw,
  Upload,
  Loader2,
  Check,
} from "lucide-react";

interface SiteImagesTabProps {
  slots: SiteSlot[];
  dishes: Dish[];
  onUpdateSlot: (
    key: string,
    data: {
      mediaId?: number | null;
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
  "bento.sub1": "4:3 Landscape (Min 600×450)",
  "bento.sub4": "4:3 Landscape (Min 600×450)",
  "editorial.main": "3:4 Portrait (Min 600×800)",
  "reservation.main": "16:9 Landscape (Min 900×500)",
  "video.poster": "16:9 Landscape (Min 900×500)",
};

export function SiteImagesTab({
  slots,
  dishes,
  onUpdateSlot,
  isLoading,
}: SiteImagesTabProps) {
  const [editingSlot, setEditingSlot] = useState<SiteSlot | null>(null);
  const [replaceUrl, setReplaceUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [linkingDishSlotKey, setLinkingDishSlotKey] = useState<string | null>(null);

  // Group slots by section
  const sections = Array.from(new Set(slots.map((s) => s.section)));

  const handleOpenReplace = (slot: SiteSlot) => {
    setEditingSlot(slot);
    setReplaceUrl(slot.effectiveUrl);
    setAltText(slot.altText);
  };

  const handleSaveReplace = async () => {
    if (!editingSlot) return;
    setIsSubmitting(true);
    try {
      // Check if replaceUrl is a database media URL e.g. /api/media/123
      const match = replaceUrl.match(/\/api\/media\/(\d+)/);
      const mediaId = match ? parseInt(match[1], 10) : null;

      await onUpdateSlot(editingSlot.key, {
        mediaId: mediaId || null,
        dishId: null, // Custom media overrides dish link
        fallbackUrl: !mediaId && replaceUrl ? replaceUrl : undefined,
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
        mediaId: null, // Clear custom media to inherit dish image
      });
      setLinkingDishSlotKey(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetToDefault = async (slot: SiteSlot) => {
    setIsSubmitting(true);
    try {
      await onUpdateSlot(slot.key, {
        mediaId: null,
        dishId: null,
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

      {isLoading && slots.length === 0 ? (
        <div className="bg-sand-50 border border-sand-200 rounded-3xl p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-terracotta-500 mx-auto mb-2" />
          <p className="font-display font-bold text-base text-charcoal-900">
            Loading homepage image slots...
          </p>
        </div>
      ) : (
        sections.map((sectionKey) => {
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
                  const isMediaCustom = Boolean(slot.mediaId);
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

                          {/* Source Status Tag */}
                          <div className="absolute top-3 left-3">
                            {isMediaCustom ? (
                              <Badge variant="saffron">Custom DB Upload</Badge>
                            ) : isDishLinked ? (
                              <Badge variant="terracotta">
                                Linked: {matchedDish?.name || `Dish #${slot.dishId}`}
                              </Badge>
                            ) : (
                              <Badge variant="charcoal">Hardcoded Fallback</Badge>
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
                      <div className="p-4 pt-3 border-t border-sand-200/80 bg-sand-100/50 space-y-2">
                        {/* Action Buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => handleOpenReplace(slot)}
                            className="flex-1 px-3 py-1.5 rounded-xl bg-charcoal-900 hover:bg-charcoal-800 text-sand-100 text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors shadow-sm"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Replace</span>
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setLinkingDishSlotKey(
                                linkingDishSlotKey === slot.key ? null : slot.key
                              )
                            }
                            className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer transition-colors border ${
                              linkingDishSlotKey === slot.key
                                ? "bg-terracotta-500 text-white border-terracotta-500"
                                : "bg-sand-100 hover:bg-sand-200 text-charcoal-800 border-sand-300"
                            }`}
                          >
                            <Link2 className="w-3.5 h-3.5" />
                            <span>Link Dish</span>
                          </button>

                          {(isMediaCustom || isDishLinked) && (
                            <button
                              type="button"
                              onClick={() => handleResetToDefault(slot)}
                              title="Reset to default fallback"
                              className="w-8 h-8 rounded-xl bg-sand-200 hover:bg-charcoal-900 hover:text-white text-charcoal-700 flex items-center justify-center transition-colors cursor-pointer shrink-0"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        {/* Inline Dish Linker Dropdown */}
                        {linkingDishSlotKey === slot.key && (
                          <div className="p-3 bg-white rounded-xl border border-sand-300 space-y-2 animate-in fade-in duration-150">
                            <label className="block text-[11px] font-bold text-charcoal-700">
                              Link slot to live dish photo &amp; name:
                            </label>
                            <select
                              value={slot.dishId || ""}
                              onChange={(e) => handleLinkDish(slot.key, e.target.value)}
                              className="w-full bg-sand-100 border border-sand-300 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-charcoal-900 focus:outline-none focus:border-terracotta-500 cursor-pointer"
                            >
                              <option value="">-- Choose Menu Dish --</option>
                              {dishes.map((dish) => (
                                <option key={dish.id} value={dish.id}>
                                  #{dish.id} — {dish.name} (Rs. {dish.price.toLocaleString()})
                                </option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })
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
              onChange={(url) => setReplaceUrl(url)}
            />

            <Input
              label="Image Accessibility Alt Text"
              value={altText}
              onChange={(e) => setAltText(e.target.value)}
              placeholder="Descriptive alt text for screen readers & SEO"
            />
          </div>
        </Modal>
      )}
    </div>
  );
}
