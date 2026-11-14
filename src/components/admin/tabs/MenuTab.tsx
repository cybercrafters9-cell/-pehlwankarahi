"use client";

import { useState } from "react";
import Image from "next/image";
import { resolveImageUrl } from "@/lib/media";
import { Dish, CategoryItem } from "@/data/menu";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { Select } from "../ui/Select";
import { Textarea } from "../ui/Textarea";
import { Modal } from "../ui/Modal";
import { Badge } from "../ui/Badge";
import { ImagePicker } from "../ui/ImagePicker";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  Star,
  Flame,
  Loader2,
  Layers,
  ArrowUp,
  ArrowDown,
  Eye,
  EyeOff,
} from "lucide-react";

interface MenuTabProps {
  dishes: Dish[];
  categories: CategoryItem[];
  onCreateDish: (dish: Omit<Dish, "id">) => Promise<void>;
  onUpdateDish: (id: number, updates: Partial<Dish>) => Promise<void>;
  onToggleDishAvailability: (id: number) => Promise<void>;
  onReorderDishes: (ids: number[]) => Promise<void>;
  onDeleteDish: (id: number) => Promise<void>;
  onCreateCategory: (data: { name: string; slug?: string }) => Promise<void>;
  onUpdateCategory: (id: number, data: Partial<CategoryItem>) => Promise<void>;
  onDeleteCategory: (id: number) => Promise<void>;
  onReorderCategories: (ids: number[]) => Promise<void>;
  isLoading: boolean;
}

export function MenuTab({
  dishes,
  categories,
  onCreateDish,
  onUpdateDish,
  onToggleDishAvailability,
  onReorderDishes,
  onDeleteDish,
  onCreateCategory,
  onUpdateCategory,
  onDeleteCategory,
  onReorderCategories,
  isLoading,
}: MenuTabProps) {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [deleteDishTargetId, setDeleteDishTargetId] = useState<number | null>(null);
  const [deleteCategoryTargetId, setDeleteCategoryTargetId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingDishId, setTogglingDishId] = useState<number | null>(null);

  // New Category State
  const [newCatName, setNewCatName] = useState("");
  const [newCatSlug, setNewCatSlug] = useState("");
  const [editingCatId, setEditingCatId] = useState<number | null>(null);
  const [editingCatName, setEditingCatName] = useState("");

  // Dish Form State
  const [form, setForm] = useState({
    name: "",
    category: categories[0]?.slug || "karahi",
    tag: "Bestseller",
    price: 1500,
    rating: "4.9",
    desc: "",
    image:
      "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
  });

  const handleOpenAdd = () => {
    setEditingDish(null);
    setForm({
      name: "",
      category: categories[0]?.slug || "karahi",
      tag: "Chef's Special",
      price: 1850,
      rating: "4.9",
      desc: "Cooked in traditional iron wok with vine-ripened tomatoes and desi ghee.",
      image:
        "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
      isAvailable: true,
    });
    setIsDishModalOpen(true);
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
      isAvailable: dish.isAvailable !== false,
    });
    setIsDishModalOpen(true);
  };

  const handleSubmitDish = async (e: React.FormEvent) => {
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
        });
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
      setIsDishModalOpen(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDeleteDish = async () => {
    if (deleteDishTargetId === null) return;
    setIsSubmitting(true);
    try {
      await onDeleteDish(deleteDishTargetId);
      setDeleteDishTargetId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleAvailability = async (id: number) => {
    setTogglingDishId(id);
    try {
      await onToggleDishAvailability(id);
    } finally {
      setTogglingDishId(null);
    }
  };

  const handleMoveDish = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= dishes.length) return;

    const newOrder = [...dishes];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    await onReorderDishes(newOrder.map((d) => d.id));
  };

  const handleCreateCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    setIsSubmitting(true);
    try {
      await onCreateCategory({
        name: newCatName.trim(),
        slug: newCatSlug.trim() || undefined,
      });
      setNewCatName("");
      setNewCatSlug("");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveCategoryName = async (id: number) => {
    if (!editingCatName.trim()) return;
    setIsSubmitting(true);
    try {
      await onUpdateCategory(id, { name: editingCatName.trim() });
      setEditingCatId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleMoveCategory = async (index: number, direction: "up" | "down") => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= categories.length) return;

    const newOrder = [...categories];
    const [moved] = newOrder.splice(index, 1);
    newOrder.splice(targetIndex, 0, moved);

    await onReorderCategories(newOrder.map((c) => c.id));
  };

  const handleConfirmDeleteCategory = async () => {
    if (deleteCategoryTargetId === null) return;
    setIsSubmitting(true);
    try {
      await onDeleteCategory(deleteCategoryTargetId);
      setDeleteCategoryTargetId(null);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredDishes = dishes.filter((dish) => {
    const matchesCategory =
      selectedCategory === "all" || dish.category === selectedCategory;
    const q = searchQuery.trim().toLowerCase();
    const matchesSearch =
      !q ||
      dish.name.toLowerCase().includes(q) ||
      dish.desc.toLowerCase().includes(q) ||
      dish.tag.toLowerCase().includes(q);

    return matchesCategory && matchesSearch;
  });

  const categorySelectOptions = categories.map((c) => ({
    value: c.slug,
    label: c.name,
  }));

  return (
    <div className="space-y-6">
      {/* Top Header Card */}
      <div className="bg-sand-50 border border-sand-200 rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h2 className="font-display font-bold text-xl text-charcoal-900">
              Desi Menu &amp; Categories CMS
            </h2>
            <Badge variant="terracotta">{dishes.length} Dishes</Badge>
            <Badge variant="charcoal">{categories.length} Categories</Badge>
          </div>
          <p className="text-xs text-charcoal-700/75 mt-0.5">
            Full CMS control: categories, pricing, dishes, availability, and image assets stored directly in MySQL.
          </p>
        </div>
        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <Button
            variant="outline"
            onClick={() => setIsCategoryModalOpen(true)}
            icon={<Layers className="w-4 h-4" />}
          >
            Manage Categories
          </Button>
          <Button
            variant="primary"
            onClick={handleOpenAdd}
            icon={<Plus className="w-4 h-4" />}
            className="shadow-glow"
          >
            Add New Dish
          </Button>
        </div>
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
          {categories.map((cat) => {
            const count = dishes.filter((d) => d.category === cat.slug).length;
            const isActive = selectedCategory === cat.slug;
            return (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.slug)}
                className={`text-xs font-bold px-4 py-2 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  isActive
                    ? "bg-charcoal-900 text-white shadow"
                    : "bg-sand-200/80 hover:bg-sand-300 text-charcoal-900"
                }`}
              >
                {cat.name} ({count})
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
      {isLoading && dishes.length === 0 ? (
        <div className="bg-sand-50 border border-sand-200 rounded-3xl p-12 text-center">
          <Loader2 className="w-10 h-10 animate-spin text-terracotta-500 mx-auto mb-2" />
          <p className="font-display font-bold text-base text-charcoal-900">Loading dishes from database...</p>
        </div>
      ) : filteredDishes.length === 0 ? (
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
          {filteredDishes.map((dish, idx) => {
            const isAvailable = dish.isAvailable !== false;
            const isToggling = togglingDishId === dish.id;

            return (
              <div
                key={dish.id}
                className={`bg-sand-50 border border-sand-200 rounded-3xl overflow-hidden shadow-soft flex flex-col justify-between group hover:shadow-card transition-all ${
                  !isAvailable ? "opacity-75 bg-sand-100/60" : ""
                }`}
              >
                <div>
                  {/* Image Container */}
                  <div className="relative h-44 overflow-hidden bg-charcoal-900">
                    <Image
                      src={resolveImageUrl(dish.image)}
                      alt={dish.name}
                      fill
                      unoptimized={dish.image.includes("/api/media/")}
                      sizes="(max-width: 640px) 100vw, 25vw"
                      className={`object-cover transition-transform duration-500 ${
                        !isAvailable ? "grayscale-30" : "group-hover:scale-105"
                      }`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-charcoal-900/80 via-transparent to-transparent" />
                    <span className="absolute top-3 left-3 bg-charcoal-900/85 backdrop-blur-md text-saffron-400 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      {dish.tag}
                    </span>
                    <span className="absolute bottom-3 right-3 bg-sand-50 text-charcoal-900 text-[11px] font-extrabold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow">
                      <Star className="w-3 h-3 fill-saffron-500 text-saffron-500" />
                      {dish.rating}
                    </span>

                    {/* Instant Availability Toggle Switch */}
                    <button
                      type="button"
                      disabled={isToggling}
                      onClick={() => handleToggleAvailability(dish.id)}
                      title={isAvailable ? "Click to mark as Sold Out" : "Click to mark as Available"}
                      className={`absolute top-3 right-3 text-[10px] font-extrabold px-2.5 py-1 rounded-full shadow flex items-center gap-1.5 cursor-pointer transition-all ${
                        isAvailable
                          ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                          : "bg-charcoal-900/90 hover:bg-charcoal-900 text-red-400 border border-red-500/50"
                      }`}
                    >
                      {isToggling ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : isAvailable ? (
                        <Eye className="w-3 h-3" />
                      ) : (
                        <EyeOff className="w-3 h-3" />
                      )}
                      <span>{isAvailable ? "Available" : "Sold Out"}</span>
                    </button>
                  </div>

                  {/* Body Content */}
                  <div className="p-4 space-y-1.5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] uppercase font-bold text-terracotta-500">
                        {dish.categoryName || dish.category}
                      </span>
                      <span className="text-[10px] font-bold text-charcoal-700/60">
                        ID #{dish.id}
                      </span>
                    </div>
                    <h3 className="font-display font-bold text-sm sm:text-base text-charcoal-900 line-clamp-1">
                      {dish.name}
                    </h3>
                    <p className="text-xs text-charcoal-700/75 line-clamp-2 leading-relaxed">
                      {dish.desc}
                    </p>
                  </div>
                </div>

                {/* Footer Controls & Ordering */}
                <div className="p-4 pt-3 border-t border-sand-200/80 bg-sand-100/40 flex items-center justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-bold text-charcoal-700/60 uppercase block">
                      Price
                    </span>
                    <span className="font-display font-extrabold text-base text-charcoal-900">
                      Rs. {dish.price.toLocaleString()}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveDish(idx, "up")}
                      title="Move up"
                      className="w-7 h-7 rounded-full bg-sand-200 hover:bg-charcoal-900 hover:text-white text-charcoal-700 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === filteredDishes.length - 1}
                      onClick={() => handleMoveDish(idx, "down")}
                      title="Move down"
                      className="w-7 h-7 rounded-full bg-sand-200 hover:bg-charcoal-900 hover:text-white text-charcoal-700 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>

                    {/* Edit Button */}
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(dish)}
                      title="Edit dish"
                      className="w-7 h-7 rounded-full bg-sand-200 hover:bg-charcoal-900 hover:text-white text-charcoal-800 flex items-center justify-center transition-colors cursor-pointer ml-1"
                    >
                      <Edit2 className="w-3 h-3" />
                    </button>

                    {/* Delete Button */}
                    <button
                      type="button"
                      onClick={() => setDeleteDishTargetId(dish.id)}
                      title="Delete dish"
                      className="w-7 h-7 rounded-full bg-red-100 hover:bg-red-600 hover:text-white text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
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
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
        title={editingDish ? `Edit Dish #${editingDish.id}` : "Add New Desi Dish"}
        subtitle={
          editingDish
            ? `Updating ${editingDish.name}`
            : "Create a new Karahi, BBQ or Rice specialty"
        }
        footer={
          <>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDishModalOpen(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleSubmitDish}
              isLoading={isSubmitting}
            >
              {editingDish ? "Save Changes" : "Create Dish"}
            </Button>
          </>
        }
      >
        <form onSubmit={handleSubmitDish} className="space-y-4">
          <Input
            label="Dish Name *"
            required
            placeholder="e.g. Peshawari Namkeen Dumba Karahi"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Category *"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              options={
                categorySelectOptions.length > 0
                  ? categorySelectOptions
                  : [{ value: "karahi", label: "Karahi" }]
              }
            />

            <Input
              label="Tag / Specialty Banner"
              placeholder="e.g. Shinwari Style • 1 Kg"
              value={form.tag}
              onChange={(e) => setForm({ ...form, tag: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Price (PKR) *"
              type="number"
              required
              min="1"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
            />

            <Input
              label="Rating Score"
              placeholder="e.g. 4.9"
              value={form.rating}
              onChange={(e) => setForm({ ...form, rating: e.target.value })}
            />
          </div>

          <Textarea
            label="Description & Recipe Details"
            rows={3}
            placeholder="Describe the cuts, desi ghee aroma, fresh tomatoes and spices..."
            value={form.desc}
            onChange={(e) => setForm({ ...form, desc: e.target.value })}
          />

          <ImagePicker
            label="Dish Photo"
            value={form.image}
            onChange={(url) => setForm({ ...form, image: url })}
          />

          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isAvailable}
                onChange={(e) =>
                  setForm({ ...form, isAvailable: e.target.checked })
                }
                className="w-4 h-4 rounded text-terracotta-500 focus:ring-terracotta-500/20"
              />
              <span className="text-xs font-bold text-charcoal-900">
                Dish is in stock &amp; available for immediate ordering
              </span>
            </label>
          </div>
        </form>
      </Modal>

      {/* Category Management Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Manage Categories"
        subtitle="Add, rename, reorder, or delete dynamic menu categories"
        footer={
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCategoryModalOpen(false)}
          >
            Close
          </Button>
        }
      >
        <div className="space-y-6">
          {/* Add Category Form */}
          <form
            onSubmit={handleCreateCategorySubmit}
            className="p-4 bg-sand-100 rounded-2xl border border-sand-200 space-y-3"
          >
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
              Create New Category
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                placeholder="Category Name (e.g. Handi & Rice)"
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
              />
              <Input
                placeholder="Slug (optional, e.g. handi-rice)"
                value={newCatSlug}
                onChange={(e) => setNewCatSlug(e.target.value)}
              />
            </div>
            <div className="flex justify-end">
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={isSubmitting}
                disabled={!newCatName.trim()}
              >
                Add Category
              </Button>
            </div>
          </form>

          {/* Existing Categories List */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-charcoal-700">
              Categories ({categories.length})
            </h4>

            {categories.map((cat, idx) => {
              const dishCount = dishes.filter((d) => d.category === cat.slug).length;
              const isEditing = editingCatId === cat.id;

              return (
                <div
                  key={cat.id}
                  className="p-3 bg-white rounded-xl border border-sand-200 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex-1 min-w-0">
                    {isEditing ? (
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          value={editingCatName}
                          onChange={(e) => setEditingCatName(e.target.value)}
                          className="px-2.5 py-1 text-xs font-bold border border-sand-300 rounded-lg focus:outline-none focus:border-terracotta-500 flex-1"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveCategoryName(cat.id)}
                          className="px-2.5 py-1 text-[11px] font-bold bg-charcoal-900 text-white rounded-lg cursor-pointer"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={() => setEditingCatId(null)}
                          className="px-2 py-1 text-[11px] font-bold text-charcoal-600 hover:text-charcoal-900 cursor-pointer"
                        >
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-xs text-charcoal-900 truncate">
                          {cat.name}
                        </span>
                        <span className="text-[10px] text-charcoal-500 font-mono">
                          ({cat.slug})
                        </span>
                        <Badge variant="charcoal">{dishCount} dishes</Badge>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {/* Reorder Buttons */}
                    <button
                      type="button"
                      disabled={idx === 0}
                      onClick={() => handleMoveCategory(idx, "up")}
                      title="Move Up"
                      className="w-7 h-7 rounded-lg bg-sand-100 hover:bg-charcoal-900 hover:text-white text-charcoal-700 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      disabled={idx === categories.length - 1}
                      onClick={() => handleMoveCategory(idx, "down")}
                      title="Move Down"
                      className="w-7 h-7 rounded-lg bg-sand-100 hover:bg-charcoal-900 hover:text-white text-charcoal-700 flex items-center justify-center transition-colors cursor-pointer disabled:opacity-30 disabled:pointer-events-none"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>

                    {/* Edit Name */}
                    {!isEditing && (
                      <button
                        type="button"
                        onClick={() => {
                          setEditingCatId(cat.id);
                          setEditingCatName(cat.name);
                        }}
                        title="Edit name"
                        className="w-7 h-7 rounded-lg bg-sand-100 hover:bg-charcoal-900 hover:text-white text-charcoal-700 flex items-center justify-center transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3 h-3" />
                      </button>
                    )}

                    {/* Delete Category */}
                    <button
                      type="button"
                      onClick={() => setDeleteCategoryTargetId(cat.id)}
                      title={dishCount > 0 ? "Cannot delete category containing dishes" : "Delete category"}
                      className="w-7 h-7 rounded-lg bg-red-50 hover:bg-red-600 hover:text-white text-red-600 flex items-center justify-center transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </Modal>

      {/* Delete Dish Dialog */}
      <ConfirmDialog
        isOpen={deleteDishTargetId !== null}
        onClose={() => setDeleteDishTargetId(null)}
        onConfirm={handleConfirmDeleteDish}
        title="Delete Menu Dish?"
        message="Are you sure you want to permanently delete this dish from the menu? If referenced by existing orders, the item details are preserved."
        confirmText="Yes, Delete Dish"
        isLoading={isSubmitting}
      />

      {/* Delete Category Dialog */}
      <ConfirmDialog
        isOpen={deleteCategoryTargetId !== null}
        onClose={() => setDeleteCategoryTargetId(null)}
        onConfirm={handleConfirmDeleteCategory}
        title="Delete Category?"
        message="Are you sure you want to delete this category? A category can only be deleted if it contains 0 dishes."
        confirmText="Yes, Delete Category"
        isLoading={isSubmitting}
      />
    </div>
  );
}
