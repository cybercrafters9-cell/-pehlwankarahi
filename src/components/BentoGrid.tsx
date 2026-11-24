"use client";

import Image from "next/image";
import { useRestaurant } from "@/context/RestaurantContext";
import { useSlot } from "@/context/SiteContentContext";
import { Plus, ArrowRight, ArrowUpRight, Flame } from "lucide-react";

export default function BentoGrid() {
  const { addToCart, setSelectedCategory, dishes } = useRestaurant();

  const bentoMain = useSlot("bento.main", {
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1000&q=85",
    alt: "Royal Pakistani BBQ & Karahi Feast",
  });

  const bentoDeal = useSlot("bento.deal", {
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    alt: "Desi Shinwari Mutton Karahi",
  });

  const bentoSub1 = useSlot("bento.sub1", {
    url: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    alt: "Matka Handi & Garlic Naan",
  });

  const bentoSub2 = useSlot("bento.sub2", {
    url: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    alt: "Peshawari Tradition & Desi Ghee",
  });

  const bentoSub3 = useSlot("bento.sub3", {
    url: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    alt: "Mutton Muscles (Machli) Karahi",
  });

  const bentoSub4 = useSlot("bento.sub4", {
    url: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    alt: "Boneless Chicken Karahi",
  });

  const dishMain = bentoMain.dishId
    ? dishes.find((d) => d.id === bentoMain.dishId)
    : null;
  const imgMain = bentoMain.url;
  const nameMain = dishMain ? dishMain.name : (bentoMain.dishName || bentoMain.alt);
  const catMain = dishMain?.category || "Special Royal Chaamp";

  const dishDeal = bentoDeal.dishId
    ? dishes.find((d) => d.id === bentoDeal.dishId)
    : null;
  const imgDeal = bentoDeal.url;
  const nameDeal = dishDeal ? dishDeal.name : (bentoDeal.dishName || bentoDeal.alt);

  const dishSub1 = bentoSub1.dishId
    ? dishes.find((d) => d.id === bentoSub1.dishId)
    : null;
  const imgSub1 = bentoSub1.url;
  const nameSub1 = dishSub1 ? dishSub1.name : (bentoSub1.dishName || bentoSub1.alt);
  const tagSub1 = dishSub1?.category || "Organic Desi Ghee";

  const imgSub2 = bentoSub2.url;

  const dishSub3 = bentoSub3.dishId
    ? dishes.find((d) => d.id === bentoSub3.dishId)
    : null;
  const imgSub3 = bentoSub3.url;
  const nameSub3 = dishSub3 ? dishSub3.name : (bentoSub3.dishName || bentoSub3.alt);
  const tagSub3 = dishSub3?.category || "Mutton Shank Special";

  const dishSub4 = bentoSub4.dishId
    ? dishes.find((d) => d.id === bentoSub4.dishId)
    : null;
  const imgSub4 = bentoSub4.url;
  const nameSub4 = dishSub4 ? dishSub4.name : (bentoSub4.dishName || bentoSub4.alt);
  const tagSub4 = dishSub4?.category || "Tender & Juicy";

  const scrollToMenu = (cat?: string) => {
    if (cat) setSelectedCategory(cat);
    const el = document.getElementById("interactive-menu");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <section
      id="bento-specials"
      className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 mb-10 sm:mb-14"
    >
      {/* LEFT COLUMN OF BENTO (Span 6): Large Overhead Dish Card + Bottom Gradient Promo Banner */}
      <div className="lg:col-span-6 flex flex-col gap-5 sm:gap-6">
        {/* Top-Left Card: Large Dark Plate Overhead Shot */}
        <div className="bento-card relative h-[340px] sm:h-[390px] rounded-4xl overflow-hidden bg-charcoal-900 shadow-card group">
          <Image
            src={imgMain}
            alt={nameMain}
            fill
            unoptimized={imgMain.includes("/api/media/")}
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="zoom-img object-cover opacity-90"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/90 via-charcoal-900/20 to-transparent" />

          {/* Top Floating Tag */}
          <div className="absolute top-5 left-5 flex items-center gap-2 bg-charcoal-900/80 backdrop-blur-md text-white text-xs font-bold px-3.5 py-1.5 rounded-full border border-white/15">
            <span className="w-2 h-2 rounded-full bg-saffron-400" />
            <span>Chef&apos;s Signature Koyla Platter</span>
          </div>

          {/* Price Pill Top Right */}
          {dishMain && (
            <div className="absolute top-5 right-5 bg-terracotta-500 text-white text-xs font-extrabold px-3.5 py-1.5 rounded-full shadow-lg">
              Rs. {dishMain.price.toLocaleString()}
            </div>
          )}

          {/* Bottom Overlay Info */}
          <div className="absolute bottom-5 left-5 right-5 flex items-end justify-between gap-4">
            <div>
              <span className="text-saffron-400 text-xs font-bold uppercase tracking-widest">
                {catMain}
              </span>
              <h2 className="font-display font-bold text-2xl sm:text-3xl text-white mt-0.5">
                {nameMain}
              </h2>
              <p className="text-white/75 text-xs sm:text-sm mt-1 line-clamp-1">
                Succulent meat braised &amp; wok-fried in rich desi ghee with freshly cracked spices.
              </p>
            </div>
            {dishMain && (
              <button
                onClick={() =>
                  addToCart(dishMain.id, dishMain.name, dishMain.price, imgMain)
                }
                className="shrink-0 bg-white hover:bg-saffron-400 text-charcoal-900 font-extrabold text-xs px-4 py-3 rounded-full shadow-lg transition-colors flex items-center gap-1.5 cursor-pointer"
              >
                <span>Order {dishMain.name}</span>
                <Plus className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Bottom-Left Card: Wide Dark-to-Terracotta Gradient Promo Card */}
        <div className="bento-card reference-promo-gradient rounded-4xl p-6 sm:p-7 text-white shadow-card relative overflow-hidden flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 min-h-[175px]">
          {imgDeal && (
            <Image
              src={imgDeal}
              alt={nameDeal}
              fill
              unoptimized={imgDeal.includes("/api/media/")}
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="zoom-img object-cover opacity-25 pointer-events-none"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-charcoal-950 via-charcoal-900/85 to-terracotta-900/75 pointer-events-none" />

          {/* Left Side */}
          <div className="relative z-10 space-y-2 max-w-[230px]">
            <span className="inline-block text-[10px] font-extrabold uppercase tracking-widest bg-white/15 px-2.5 py-1 rounded-full text-saffron-400">
              Weekend Dawat Deal
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl leading-tight">
              {nameDeal}
            </h3>
            <p className="text-white/75 text-xs">
              Fresh 1 Kg dumba meat cooked live in pure animal fat and ripe tomatoes.
            </p>
            {dishDeal && (
              <button
                onClick={() =>
                  addToCart(dishDeal.id, dishDeal.name, dishDeal.price, imgDeal)
                }
                className="mt-2 bg-terracotta-500 hover:bg-white hover:text-charcoal-900 text-white font-bold text-xs px-4 py-2 rounded-full transition-colors inline-flex items-center gap-1.5 shadow cursor-pointer"
              >
                <span>
                  Order {dishDeal.name} (Rs. {dishDeal.price.toLocaleString()})
                </span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Right Side */}
          <div className="relative z-10 sm:border-l sm:border-white/20 sm:pl-6 max-w-[240px]">
            <p className="font-serif italic text-saffron-400 text-sm">Fresh Clay Tandoor</p>
            <h4 className="font-display font-bold text-lg sm:text-xl leading-snug mt-0.5">
              100% Pure Chakki &amp; Desi Ghee Tarka
            </h4>
            <p className="text-white/80 text-xs mt-1.5 leading-relaxed">
              Freshly slaughtered halal meat cooked to order in traditional iron woks over roaring wood fire.
            </p>
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN OF BENTO (Span 6): 2x2 Sub-Grid */}
      <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-5 sm:gap-6">
        {/* Sub-Card 1 (Top-Left): Clay Handi & Desi Chai */}
        <div className="bento-card relative h-[265px] rounded-4xl overflow-hidden bg-charcoal-800 shadow-card group">
          <Image
            src={imgSub1}
            alt={nameSub1}
            fill
            unoptimized={imgSub1.includes("/api/media/")}
            sizes="(max-width: 640px) 100vw, 25vw"
            className="zoom-img object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/85 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-saffron-400 font-bold">
                {tagSub1}
              </span>
              <h4 className="font-bold text-sm sm:text-base">{nameSub1}</h4>
              {dishSub1 && (
                <p className="text-xs text-sand-200 font-semibold mt-0.5">
                  Rs. {dishSub1.price.toLocaleString()}
                </p>
              )}
            </div>
            {dishSub1 && (
              <button
                onClick={() =>
                  addToCart(dishSub1.id, dishSub1.name, dishSub1.price, imgSub1)
                }
                title={`Order ${dishSub1.name}`}
                className="w-9 h-9 rounded-full bg-terracotta-500 text-white flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-Card 2 (Top-Right): Warm Saffron Gold Card (Informational Menu Link) */}
        <div className="bento-card relative h-[265px] rounded-4xl bg-saffron-400 p-6 flex flex-col justify-between text-charcoal-900 shadow-card overflow-hidden group">
          {imgSub2 && (
            <Image
              src={imgSub2}
              alt="Peshawari Tradition"
              fill
              unoptimized={imgSub2.includes("/api/media/")}
              sizes="(max-width: 640px) 100vw, 25vw"
              className="zoom-img object-cover opacity-20 pointer-events-none group-hover:scale-105 transition-transform duration-500"
            />
          )}
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-charcoal-900/10 px-2.5 py-1 rounded-full">
              Peshawari Tradition
            </span>
            <h3 className="font-display font-extrabold text-xl sm:text-2xl leading-tight mt-3">
              Charcoal Ember &amp; <br /> Desi Ghee Flavor
            </h3>
            <p className="text-charcoal-900/80 text-xs mt-2 leading-relaxed">
              No artificial colors or packet masalas — just black pepper, vine-ripened tomatoes, green chilies, and organic desi ghee.
            </p>
          </div>
          <button
            onClick={() => scrollToMenu("karahi")}
            className="relative z-10 w-full bg-charcoal-900 hover:bg-terracotta-500 text-white font-bold text-xs py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>Explore Karahi Menu</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>

        {/* Sub-Card 3 (Bottom-Left): Deep Charcoal Card */}
        <div className="bento-card relative h-[265px] rounded-4xl bg-charcoal-900 p-6 flex flex-col justify-between text-white shadow-card overflow-hidden group">
          {imgSub3 && (
            <Image
              src={imgSub3}
              alt={nameSub3}
              fill
              unoptimized={imgSub3.includes("/api/media/")}
              sizes="(max-width: 640px) 100vw, 25vw"
              className="zoom-img object-cover opacity-35 group-hover:opacity-55 group-hover:scale-105 transition-all duration-500 pointer-events-none"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-950 via-charcoal-900/80 to-charcoal-900/50 pointer-events-none" />
          <div className="relative z-10">
            <span className="text-[10px] font-extrabold uppercase tracking-widest bg-white/10 text-saffron-400 px-2.5 py-1 rounded-full">
              {tagSub3}
            </span>
            <h3 className="font-display font-bold text-xl sm:text-2xl leading-tight mt-3">
              {nameSub3}
            </h3>
            <p className="text-white/70 text-xs mt-2 leading-relaxed">
              Tender bone-in shank muscle meat infused with rich bone marrow juices and mild roasted tarka.
            </p>
          </div>
          {dishSub3 && (
            <button
              onClick={() =>
                addToCart(dishSub3.id, dishSub3.name, dishSub3.price, imgSub3)
              }
              className="relative z-10 w-full bg-terracotta-500 hover:bg-saffron-400 hover:text-charcoal-900 text-white font-bold text-xs py-3 px-4 rounded-full transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>
                Order {dishSub3.name} (Rs. {dishSub3.price.toLocaleString()})
              </span>
              <Flame className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Sub-Card 4 (Bottom-Right): Overhead Dark Bowls Shot */}
        <div className="bento-card relative h-[265px] rounded-4xl overflow-hidden bg-charcoal-800 shadow-card group">
          <Image
            src={imgSub4}
            alt={nameSub4}
            fill
            unoptimized={imgSub4.includes("/api/media/")}
            sizes="(max-width: 640px) 100vw, 25vw"
            className="zoom-img object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/85 via-transparent to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-white">
            <div>
              <span className="text-[10px] uppercase tracking-wider text-saffron-400 font-bold">
                {tagSub4}
              </span>
              <h4 className="font-bold text-sm sm:text-base">{nameSub4}</h4>
              {dishSub4 && (
                <p className="text-xs text-sand-200 font-semibold mt-0.5">
                  Rs. {dishSub4.price.toLocaleString()}
                </p>
              )}
            </div>
            {dishSub4 && (
              <button
                onClick={() =>
                  addToCart(dishSub4.id, dishSub4.name, dishSub4.price, imgSub4)
                }
                title={`Order ${dishSub4.name}`}
                className="w-9 h-9 rounded-full bg-saffron-400 text-charcoal-900 flex items-center justify-center hover:scale-110 transition-transform cursor-pointer shrink-0"
              >
                <Plus className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
