"use client";

import Image from "next/image";
import { useRestaurant } from "@/context/RestaurantContext";

const featuredItems = [
  {
    id: 2,
    name: "Mutton Karahi",
    category: "Shinwari 1 Kg",
    price: 2850,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80",
    borderColor: "border-terracotta-400",
    tagColor: "text-saffron-400",
    btnColor: "group-hover:bg-terracotta-500",
    textColor: "text-white/90",
    isDarkCard: false,
  },
  {
    id: 1,
    name: "Chicken Karahi",
    category: "Desi Ghee Classic",
    price: 1550,
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=300&q=80",
    borderColor: "border-saffron-400",
    tagColor: "text-saffron-400",
    btnColor: "group-hover:bg-terracotta-500",
    textColor: "text-white/90",
    isDarkCard: false,
  },
  {
    id: 6,
    name: "Mutton Chops Karahi",
    category: "Royal Chaamp",
    price: 3200,
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80",
    borderColor: "border-white/60",
    tagColor: "text-amber-200",
    btnColor: "group-hover:bg-charcoal-900",
    textColor: "text-white/90",
    isDarkCard: false,
  },
  {
    id: 9,
    name: "Mutton Muscles (Machli) Karahi",
    category: "Special Shank",
    price: 3100,
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80",
    borderColor: "border-charcoal-900",
    tagColor: "text-charcoal-900",
    btnColor: "bg-charcoal-900 text-white",
    textColor: "text-charcoal-900",
    isDarkCard: true,
  },
];

export default function FeaturedStrip() {
  const { addToCart } = useRestaurant();

  return (
    <section className="mb-8 sm:mb-10">
      <div className="reference-pill-gradient rounded-4xl sm:rounded-full p-4 sm:px-7 sm:py-4 shadow-card text-white">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 items-center">
          {featuredItems.map((item, idx) => (
            <div
              key={idx}
              onClick={() => addToCart(item.id, item.name, item.price, item.image)}
              className={`flex items-center gap-3.5 group cursor-pointer p-2 rounded-full transition-all ${
                item.isDarkCard
                  ? "bg-charcoal-900/20 hover:bg-charcoal-900/35"
                  : "bg-white/5 hover:bg-white/15"
              }`}
            >
              <div className={`relative w-14 h-14 rounded-full overflow-hidden border-2 ${item.borderColor} shrink-0 group-hover:scale-105 transition-transform`}>
                <Image
                  src={item.image}
                  alt={item.name}
                  fill
                  sizes="56px"
                  className="object-cover"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className={`text-[10px] uppercase tracking-wider font-bold ${item.tagColor}`}>
                  {item.category}
                </p>
                <h3
                  className={`text-xs sm:text-sm font-bold truncate ${
                    item.isDarkCard ? "text-charcoal-900 font-extrabold" : "text-white"
                  }`}
                >
                  {item.name}
                </h3>
                <div className="flex items-center justify-between mt-0.5 pr-2">
                  <span className={`text-xs font-extrabold ${item.textColor}`}>
                    Rs. {item.price.toLocaleString()}
                  </span>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-colors ${
                      item.isDarkCard
                        ? "bg-charcoal-900 text-white"
                        : `bg-white/20 ${item.btnColor}`
                    }`}
                  >
                    + Add
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
