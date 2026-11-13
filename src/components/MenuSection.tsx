"use client";

import React from "react";
import Image from "next/image";
import { useRestaurant } from "@/context/RestaurantContext";
import { Star, Plus, X } from "lucide-react";

const categories = [
  { id: "all", label: "🔥 All Karahi (9)" },
  { id: "mutton", label: "🐑 Mutton Karahi (5)" },
  { id: "chicken", label: "🍗 Chicken Karahi (4)" },
];

export default function MenuSection() {
  const {
    dishes,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    addToCart,
  } = useRestaurant();

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      selectedCategory === "all" ||
      selectedCategory === "karahi" ||
      dish.category === selectedCategory;

    const query = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !query ||
      dish.name.toLowerCase().includes(query) ||
      dish.desc.toLowerCase().includes(query) ||
      dish.tag.toLowerCase().includes(query);

    return matchesCategory && matchesSearch;
  });

  return (
    <section id="interactive-menu" className="mb-12 sm:mb-16">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-7">
        <div>
          <span className="text-terracotta-500 text-xs font-extrabold uppercase tracking-widest">
            Pehalwan Signature Karahi
          </span>
          <h2 className="font-display font-extrabold text-3xl sm:text-4xl text-charcoal-900 mt-1">
            Authentic Live Wok Karahi Menu
          </h2>
          {searchQuery && (
            <div className="mt-2 flex items-center gap-2">
              <span className="text-xs bg-sand-200 text-charcoal-800 px-3 py-1 rounded-full font-semibold flex items-center gap-1.5">
                Showing results for &quot;{searchQuery}&quot;
                <button
                  onClick={() => setSearchQuery("")}
                  className="hover:text-terracotta-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            </div>
          )}
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`text-xs font-bold px-4 py-2.5 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-charcoal-900 text-white shadow"
                    : "bg-sand-200/80 hover:bg-sand-300 text-charcoal-900"
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Dynamic Dish Grid */}
      {filteredDishes.length === 0 ? (
        <div className="bg-sand-50 border border-sand-200 rounded-3xl p-10 text-center">
          <p className="font-display font-bold text-lg text-charcoal-900">
            No Desi dish matched your search.
          </p>
          <button
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="mt-3 bg-terracotta-500 hover:bg-terracotta-600 text-white text-xs font-bold px-5 py-2.5 rounded-full transition-colors cursor-pointer"
          >
            Show All Karahi
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {filteredDishes.map((dish) => (
            <div
              key={dish.id}
              className="bento-card bg-sand-50 border border-sand-200/90 rounded-3xl overflow-hidden shadow-soft flex flex-col justify-between group"
            >
              <div>
                <div className="relative h-48 overflow-hidden bg-charcoal-900">
                  <Image
                    src={dish.image}
                    alt={dish.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    className="zoom-img object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/70 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 bg-charcoal-900/85 backdrop-blur-md text-saffron-400 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                    {dish.tag}
                  </span>
                  <span className="absolute bottom-3 right-3 bg-sand-50 text-charcoal-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                    <Star className="w-3 h-3 fill-saffron-500 text-saffron-500" />
                    {dish.rating}
                  </span>
                </div>
                <div className="p-4">
                  <h3 className="font-display font-bold text-base text-charcoal-900 group-hover:text-terracotta-500 transition-colors line-clamp-1">
                    {dish.name}
                  </h3>
                  <p className="text-xs text-charcoal-700/75 mt-1 line-clamp-2 leading-relaxed">
                    {dish.desc}
                  </p>
                </div>
              </div>
              <div className="px-4 pb-4 pt-2 flex items-center justify-between border-t border-sand-200/70">
                <div>
                  <span className="text-[10px] uppercase font-bold text-charcoal-700/60 block">
                    Price
                  </span>
                  <span className="font-display font-extrabold text-base text-charcoal-900">
                    Rs. {dish.price.toLocaleString()}
                  </span>
                </div>
                <button
                  onClick={() => addToCart(dish.name, dish.price, dish.image)}
                  className="bg-charcoal-900 hover:bg-terracotta-500 text-white text-xs font-bold px-4 py-2.5 rounded-full transition-colors flex items-center gap-1.5 shadow cursor-pointer"
                >
                  <span>Add</span>
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
