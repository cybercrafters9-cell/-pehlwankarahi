"use client";

import Image from "next/image";
import { resolveImageUrl } from "@/lib/media";
import { useRestaurant } from "@/context/RestaurantContext";
import { useSlot } from "@/context/SiteContentContext";

const STRIP_CONFIG = [
  {
    key: "strip.1",
    fallbackUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80",
    fallbackAlt: "Mutton Karahi",
    defaultCategory: "Shinwari 1 Kg",
    borderColor: "border-terracotta-400",
    tagColor: "text-saffron-400",
    btnColor: "group-hover:bg-terracotta-500",
    textColor: "text-white/90",
    isDarkCard: false,
  },
  {
    key: "strip.2",
    fallbackUrl:
      "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=300&q=80",
    fallbackAlt: "Chicken Karahi",
    defaultCategory: "Desi Ghee Classic",
    borderColor: "border-saffron-400",
    tagColor: "text-saffron-400",
    btnColor: "group-hover:bg-terracotta-500",
    textColor: "text-white/90",
    isDarkCard: false,
  },
  {
    key: "strip.3",
    fallbackUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80",
    fallbackAlt: "Mutton Chops Karahi",
    defaultCategory: "Royal Chaamp",
    borderColor: "border-white/60",
    tagColor: "text-amber-200",
    btnColor: "group-hover:bg-charcoal-900",
    textColor: "text-white/90",
    isDarkCard: false,
  },
  {
    key: "strip.4",
    fallbackUrl:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80",
    fallbackAlt: "Mutton Muscles (Machli) Karahi",
    defaultCategory: "Special Shank",
    borderColor: "border-charcoal-900",
    tagColor: "text-charcoal-900",
    btnColor: "bg-charcoal-900 text-white",
    textColor: "text-charcoal-900",
    isDarkCard: true,
  },
];

export default function FeaturedStrip() {
  const { addToCart, dishes } = useRestaurant();

  const slot1 = useSlot("strip.1", {
    url: STRIP_CONFIG[0].fallbackUrl,
    alt: STRIP_CONFIG[0].fallbackAlt,
  });
  const slot2 = useSlot("strip.2", {
    url: STRIP_CONFIG[1].fallbackUrl,
    alt: STRIP_CONFIG[1].fallbackAlt,
  });
  const slot3 = useSlot("strip.3", {
    url: STRIP_CONFIG[2].fallbackUrl,
    alt: STRIP_CONFIG[2].fallbackAlt,
  });
  const slot4 = useSlot("strip.4", {
    url: STRIP_CONFIG[3].fallbackUrl,
    alt: STRIP_CONFIG[3].fallbackAlt,
  });
  const slots = [slot1, slot2, slot3, slot4];

  return (
    <section className="mb-8 sm:mb-10">
      <div className="reference-pill-gradient rounded-4xl sm:rounded-full p-4 sm:px-7 sm:py-4 shadow-card text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center">
          {STRIP_CONFIG.map((cfg, idx) => {
            const currentSlot = slots[idx];
            const slotRecord = currentSlot?.slot;
            const dish = currentSlot?.dishId
              ? dishes.find((d) => d.id === currentSlot.dishId)
              : null;
            const hasCustomMedia = Boolean(
              slotRecord?.mediaId || (slotRecord?.customUrl && slotRecord.customUrl.trim())
            );
            const effectiveImage = hasCustomMedia
              ? currentSlot.url
              : dish?.image || currentSlot?.url || cfg.fallbackUrl;

            const customTitle = slotRecord?.altText?.trim();
            const isGenericAlt =
              !customTitle ||
              customTitle === "Pehlwan Karahi" ||
              /^strip\s*\d+$/i.test(customTitle);
            const effectiveName = !isGenericAlt
              ? customTitle
              : dish?.name || currentSlot?.dishName || cfg.fallbackAlt;

            const customLabel = slotRecord?.label?.trim();
            const isGenericLabel =
              !customLabel || /^(featured\s*)?strip\s*\d+$/i.test(customLabel);
            const category = !isGenericLabel
              ? customLabel
              : dish?.category || cfg.defaultCategory;

            const handleCardClick = () => {
              if (dish) {
                addToCart(dish.id, effectiveName, dish.price, effectiveImage);
              } else {
                const el = document.getElementById("interactive-menu");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }
            };

            return (
              <div
                key={cfg.key}
                onClick={handleCardClick}
                className={`flex items-center gap-3.5 p-2 rounded-full transition-all cursor-pointer group ${
                  cfg.isDarkCard
                    ? "bg-charcoal-900/20 hover:bg-charcoal-900/35"
                    : "bg-white/5 hover:bg-white/15"
                }`}
              >
                <div
                  className={`relative w-14 h-14 rounded-full overflow-hidden border-2 ${
                    cfg.borderColor
                  } shrink-0 ${dish ? "group-hover:scale-105" : ""} transition-transform`}
                >
                  <Image
                    src={resolveImageUrl(effectiveImage)}
                    alt={effectiveName}
                    fill
                    unoptimized={effectiveImage.includes("/api/media/")}
                    sizes="56px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-[10px] uppercase tracking-wider font-bold ${cfg.tagColor}`}
                  >
                    {category}
                  </p>
                  <h3
                    className={`text-xs sm:text-sm font-bold truncate ${
                      cfg.isDarkCard
                        ? "text-charcoal-900 font-extrabold"
                        : "text-white"
                    }`}
                  >
                    {effectiveName}
                  </h3>
                  {dish ? (
                    <div className="flex items-center justify-between mt-0.5 pr-2">
                      <span className={`text-xs font-extrabold ${cfg.textColor}`}>
                        Rs. {dish.price.toLocaleString()}
                      </span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                          cfg.isDarkCard
                            ? "bg-charcoal-900 text-white"
                            : `bg-white/20 ${cfg.btnColor}`
                        }`}
                      >
                        + Add
                      </span>
                    </div>
                  ) : (
                    <div className="h-4" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
