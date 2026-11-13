"use client";

import React, { useState } from "react";
import Image from "next/image";
import { Dish } from "@/data/menu";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { ImagePicker } from "../ui/ImagePicker";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import { Plus, Edit2, Trash2, Search, CheckCircle2, XCircle, Star, Flame } from "lucide-react";

interface MenuTabProps {
  dishes: Dish[];
  onCreateDish: (dish: Omit<Dish, "id">) => Promise<void>;
  onUpdateDish: (id: number, updates: Partial<Dish>) => Promise<void>;
  onDeleteDish: (id: number) => Promise<void>;
  isLoading: boolean;
}

const categoryOptions = [
  { value: "mutton", label: "🐑 Mutton Karahi" },
  { value: "chicken", label: "🍗 Chicken Karahi" },
  { value: "karahi", label: "🔥 All / Specialty Karahi" },
];

export function MenuTab({
  dishes,
  onCreateDish,
  onUpdateDish,
  onDeleteDish,
  isLoading,
}: MenuTabProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [form, setForm] = useState({
    name: "",
    category: "karahi" as Dish["category"],
    tag: "Bestseller",
    price: 1500,
    rating: "4.9",
    desc: "",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
  });

  const handleOpenAdd = () => {
    setEditingDish(null);
    setForm({
      name: "",
      category: "karahi",
      tag: "Chef's Special",
      price: 1850,
      rating: "4.9",
      desc: "Cooked in traditional iron wok with vine-ripened tomatoes and desi ghee.",
      image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (dish: Dish) => {
    setEditingDish(dish);
    setForm({
      name: dish.name,
      category: dish.category,
      tag: dish.tag,
      price: dish.price,
      rating: dish.rating,
      desc: dish.desc,
      image: dish.image,
      isAvailable: (dish as any).isAvailable !== false,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.price) return;

    setIsSubmitting(true);
    try {
      if (editingDish) {
        await onUpdateDish(editingDish.id, {
          name: form.name,
          category: form.category,
          tag: form.tag,
          price: Number(form.price),
          rating: form.rating,
          desc: form.desc,
          image: form.image,
          isAvailable: form.isAvailable,
        } as any);
      } else {
        await onCreateDish({
          name: form.name,
          category: form.category,
          tag: form.tag,
          price: Number(form.price),
          rating: form.rating,
          desc: form.desc,
          image: form.image,
        });
      }
      setIsModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (deleteTargetId === null) return;
    setIsSubmitting(true);
    try {
      await onDeleteDish(deleteTargetId);
      setDeleteTargetId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory = selectedCategory === "all" || dish.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      dish.name.toLowerCase().includes(q) ||
      dish.desc.toLowerCase().includes(q) ||
      dish.tag.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-sand-50 border border-sand-200 rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display font-bold text-xl text-charcoal-900">Desi Menu &amp; Pricing Catalog</h2>
            <Badge variant="terracotta">{dishes.length} Items</Badge>
          </div>
          <p className="text-xs text-charcoal-700/75 mt-0.5">
            Manage live Karahi menu, Mutton Chaamp, Machli Shank, Chicken Karahi prices, descriptions and photos.
          </p>
        </div>
        <Button
          variant="primary"
          onClick={handleOpenAdd}
          icon={<Plus className="w-4 h-4" />}
          className="shadow-glow"
        >
          Add New Dish
        </Button>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          <button
            onClick={() => setSelectedCategory("all")}
            className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
              selectedCategory === "all"
                ? "bg-charcoal-900 text-white shadow"
                : "bg-sand-200/80 hover:bg-sand-300 text-charcoal-900"
            }`}
          >
            All Dishes ({dishes.length})
          </button>
          {categoryOptions.map((cat) => {
            const count = dishes.filter((d) => d.category === cat.value).length;
            const isActive = selectedCategory === cat.value;
            return (
              <button
                key={cat.value}
                onClick={() => setSelectedCategory(cat.value)}
                className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-charcoal-900 text-white shadow"
                    : "bg-sand-200/80 hover:bg-sand-300 text-charcoal-900"
                }`}
              >
                {cat.label} ({count})
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-charcoal-700/60" />
          <input
            type="text"
            placeholder="Search dish or price..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-sand-100 border border-sand-300 rounded-full pl-10 pr-4 py-2 text-xs font-semibold text-charcoal-900 placeholder:text-charcoal-700/50 focus:outline-none focus:border-terracotta-500"
          />
        </div>
      </div>

      {/* Dish Cards Grid */}
      {filteredDishes.length === 0 ? (
        <div className="bg-sand-50 border border-sand-200 rounded-3xl p-12 text-center">
          <Flame className="w-12 h-12 mx-auto text-terracotta-500 mb-2 opacity-60" />
          <p className="font-display font-bold text-base text-charcoal-900">No dishes matched your filter.</p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setSelectedCategory("all");
              setSearchQuery("");
            }}
            className="mt-3"
          >
            Reset Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDishes.map((dish) => {
            const isAvailable = (dish as any).isAvailable !== false;
            return (
              <div
                key={dish.id}
                className="bg-sand-50 border border-sand-200 rounded-3xl overflow-hidden shadow-soft flex flex-col justify-between group hover:shadow-card transition-all"
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-44 overflow-hidden bg-charcoal-900">
                    <Image
                      src={dish.image}
                      alt={dish.name}
                      fill
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className="object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-charcoal-900/85 backdrop-blur-md text-saffron-400 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {dish.tag}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-sand-50 text-charcoal-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 fill-saffron-500 text-saffron-500" />
                      {dish.rating}
                    </span>
                    {/* Availability Tag */}
                    <span
                      className={`absolute top-3 right-3 text-[10px] font-extrabold px-2 py-0.5 rounded-full shadow ${
                        isAvailable
                          ? "bg-emerald-600 text-white"
                          : "bg-charcoal-900/90 text-red-400 border border-red-500/50"
                      }`}
                    >
                      {isAvailable ? "Available" : "Sold Out"}
                    </span>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-terracotta-500">
                        {dish.category}
                      </span>
                      <span className="text-[10px] font-bold text-charcoal-700/60">ID #{dish.id}</span>
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-charcoal-900 line-clamp-1">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-charcoal-700/75 line-clamp-2 leading-relaxed">
                      {dish.desc}
                    </p>
                  </div>
                </div>

                {/* Footer Controls */}
                <div className="p-4 pt-3 border-t border-sand-200/80 bg-sand-100/40 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-charcoal-700/60 uppercase block">Price</span>
                    <span className="font-display font-extrabold text-base text-charcoal-900">
                      Rs. {dish.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Edit Button */}
                    <button
                      onClick={() => handleOpenEdit(dish)}
                      title="Edit dish"
                      className="w-8 h-8 rounded-full bg-sand-200 hover:bg-charcoal-900 hover:text-white text-charcoal-800 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    {/* Delete Button */}
                    <button
                      onClick={() => setDeleteTargetId(dish.id)}
                      title="Delete dish"
                      className="w-8 h-8 rounded-full bg-red-100 hover:bg-red-600 hover:text-white text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add / Edit Dish Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingDish ? `Edit Dish #${editingDish.id}` : "Add New Desi Dish"}
        subtitle={editingDish ? `Updating ${editingDish.name}` : "Create a new Karahi, BBQ or Rice specialty"}
        footer={
          <>
            <Button variant="outline" size="sm" onClick={() => setIsModalOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} isLoading={isSubmitting}>
              {editingDish ? "Save Changes" : "Create Dish"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Dish Name *"
            required
            placeholder="e.g. Peshawari Namkeen Dumba Karahi"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Menu Category *"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value as Dish["category"] })}
              options={categoryOptions}
            />
            <Input
              label="Price (PKR) *"
              type="number"
              required
              min="0"
              step="10"
              placeholder="e.g. 2850"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Tag / Specialty Badge"
              placeholder="e.g. Bestseller • Desi Ghee Tarka"
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
            />
            <Input
              label="Star Rating"
              placeholder="e.g. 4.9"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
          </div>

          <Textarea
            label="Description & Recipe Notes"
            rows={2}
            placeholder="Describe the mouthwatering spices, cooking technique, and serving size..."
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
          />

          {/* Reusable Image Picker with Live HD Desi Presets */}
          <ImagePicker
            label="Dish Photo URL (HD)"
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
          />

          {/* Availability Toggle */}
          <div className="flex items-center gap-2 pt-1">
            <input
              type="checkbox"
              id="dish-available"
              checked={form.isAvailable}
              onChange={(e) => setForm({ ...form, isAvailable: e.target.checked })}
              className="w-4 h-4 rounded text-terracotta-500 focus:ring-terracotta-500 cursor-pointer"
            />
            <label htmlFor="dish-available" className="text-xs font-bold text-charcoal-800 cursor-pointer select-none">
              Mark Dish Available for Ordering (uncheck if sold out)
            </label>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetId !== null}
        onClose={() => setDeleteTargetId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Dish"
        message="Are you sure you want to remove this dish from the menu? It will no longer be visible on the customer menu."
        confirmText="Yes, Delete Dish"
        isLoading={isSubmitting}
      />
    </div>
  );
}
