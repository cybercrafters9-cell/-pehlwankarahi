"use client";

import React, { useState } from "react";
import { RestaurantSettings, api } from "@/services/api";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { Save, Plus, Trash2, Store, Phone, MapPin, Truck, ShieldCheck, KeyRound } from "lucide-react";

interface SettingsTabProps {
  settings: RestaurantSettings | null;
  onUpdateSettings: (settings: Partial<RestaurantSettings>) => Promise<void>;
  isLoading: boolean;
  token?: string;
  onShowToast?: (msg: string, type?: "success" | "error") => void;
}

export function SettingsTab({
  settings,
  onUpdateSettings,
  isLoading: _isLoading,
  token,
  onShowToast,
}: SettingsTabProps) {
  const [prevSettings, setPrevSettings] = useState(settings);
  const [form, setForm] = useState<RestaurantSettings>(() => settings || {
    restaurantName: "Pehalwan Karahi & DeraGhar",
    tagline: "Authentic Pakistani Karahi, Charcoal Bar B Q & Desi Handi",
    phone: "0300-1234567",
    whatsapp: "0321-9876543",
    landline: "041-8899221",
    email: "info@pehalwankarahi.com",
    address: "Main Boulevard, Kohinoor City / Canal Road Rooftop, Faisalabad, Pakistan",
    branches: ["Gulberg / Kohinoor City Branch", "Canal Road Rooftop Family Dera", "Express Takeaway Kitchen"],
    timings: "12:00 PM – 02:00 AM Daily",
    deliveryFee: 0,
    minOrder: 500,
    deliveryEstimate: "28–35 mins",
    announcement: "🔥 Live Koyla Grill & Freshly slaughtered Halal Meat prepared in pure Desi Ghee!",
    isLiveWokActive: true,
  });

  if (settings && settings !== prevSettings) {
    setPrevSettings(settings);
    setForm(settings);
  }

  const [newBranch, setNewBranch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Password Change State
  const [pwForm, setPwForm] = useState({
    currentPassword: "",
    newPassword: "",
    newUsername: "",
  });
  const [isUpdatingPw, setIsUpdatingPw] = useState(false);

  const handleAddBranch = () => {
    if (!newBranch.trim()) return;
    setForm({
      ...form,
      branches: [...form.branches, newBranch.trim()],
    });
    setNewBranch("");
  };

  const handleRemoveBranch = (index: number) => {
    setForm({
      ...form,
      branches: form.branches.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdateSettings(form);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.currentPassword) {
      if (onShowToast) onShowToast("Please enter current password to confirm changes.", "error");
      return;
    }
    if (pwForm.newPassword && pwForm.newPassword.length < 6) {
      if (onShowToast) onShowToast("New password must be at least 6 characters.", "error");
      return;
    }

    setIsUpdatingPw(true);
    try {
      await api.updateAdminCredentials(
        {
          currentPassword: pwForm.currentPassword,
          newPassword: pwForm.newPassword || undefined,
          newUsername: pwForm.newUsername || undefined,
        },
        token
      );
      if (onShowToast) onShowToast("🔐 Admin credentials updated successfully!", "success");
      setPwForm({ currentPassword: "", newPassword: "", newUsername: "" });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to update credentials";
      if (onShowToast) onShowToast(msg, "error");
    } finally {
      setIsUpdatingPw(false);
    }
  };

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Top Header Card */}
        <div className="bg-sand-50 border border-sand-200 rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display font-bold text-xl text-charcoal-900">Restaurant Settings &amp; Contact Info</h2>
              <Badge variant="terracotta">Live Config</Badge>
            </div>
            <p className="text-xs text-charcoal-700/75 mt-0.5">
              Update address, customer support numbers, branch locations, operating hours and delivery rates.
            </p>
          </div>
          <Button
            type="submit"
            variant="primary"
            isLoading={isSaving}
            icon={<Save className="w-4 h-4" />}
            className="shadow-glow"
          >
            Save Restaurant Details
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Brand & Contact Info */}
          <div className="lg:col-span-6 space-y-6">
            {/* General Information Card */}
            <Card
              title="Brand & Identity"
              subtitle="Public restaurant branding on website"
              badge={<Store className="w-4 h-4 text-terracotta-500" />}
            >
              <div className="space-y-3.5">
                <Input
                  label="Restaurant Name *"
                  required
                  value={form.restaurantName}
                  onChange={(e) => setForm({ ...form, restaurantName: e.target.value })}
                />
                <Input
                  label="Tagline / Motto"
                  value={form.tagline}
                  onChange={(e) => setForm({ ...form, tagline: e.target.value })}
                />
                <Textarea
                  label="Announcement Bar Message"
                  rows={2}
                  value={form.announcement}
                  onChange={(e) => setForm({ ...form, announcement: e.target.value })}
                />
              </div>
            </Card>

            {/* Contact Numbers & Desk Card */}
            <Card
              title="Contact Numbers & WhatsApp"
              subtitle="Numbers displayed for table booking & support"
              badge={<Phone className="w-4 h-4 text-saffron-500" />}
            >
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Primary Phone (Call)"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <Input
                    label="WhatsApp Number"
                    required
                    value={form.whatsapp}
                    onChange={(e) => setForm({ ...form, whatsapp: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Landline Desk"
                    value={form.landline}
                    onChange={(e) => setForm({ ...form, landline: e.target.value })}
                  />
                  <Input
                    label="Support Email"
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>
            </Card>
          </div>

          {/* Right Column: Address, Branches & Delivery */}
          <div className="lg:col-span-6 space-y-6">
            {/* Physical Address & Branches */}
            <Card
              title="Location & Branch Outlets"
              subtitle="Customer dining locations & takeaway points"
              badge={<MapPin className="w-4 h-4 text-emerald-600" />}
            >
              <div className="space-y-3.5">
                <Textarea
                  label="Main Physical Address *"
                  required
                  rows={2}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />

                {/* Branch List */}
                <div className="space-y-2 pt-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-charcoal-700">
                    Active Branches ({form.branches.length})
                  </label>
                  <div className="space-y-2">
                    {form.branches.map((branch, idx) => (
                      <div
                        key={idx}
                        className="p-2.5 bg-sand-100 border border-sand-200 rounded-xl flex items-center justify-between gap-2 text-xs font-bold text-charcoal-900"
                      >
                        <span className="truncate">{branch}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveBranch(idx)}
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer"
                          title="Remove branch"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Add Branch Field */}
                  <div className="flex gap-2 pt-1">
                    <Input
                      placeholder="Add new branch name or location..."
                      value={newBranch}
                      onChange={(e) => setNewBranch(e.target.value)}
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddBranch}
                      icon={<Plus className="w-3.5 h-3.5" />}
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </Card>

            {/* Delivery & Operating Hours */}
            <Card
              title="Timings & Delivery Settings"
              subtitle="Delivery fee, minimum order & open hours"
              badge={<Truck className="w-4 h-4 text-terracotta-500" />}
            >
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Daily Timings"
                    value={form.timings}
                    onChange={(e) => setForm({ ...form, timings: e.target.value })}
                  />
                  <Input
                    label="Delivery Estimate"
                    value={form.deliveryEstimate}
                    onChange={(e) => setForm({ ...form, deliveryEstimate: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Delivery Fee (PKR - 0 for Free)"
                    type="number"
                    min="0"
                    value={form.deliveryFee}
                    onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
                  />
                  <Input
                    label="Minimum Order Amount (PKR)"
                    type="number"
                    min="0"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
                  />
                </div>
              </div>
            </Card>
          </div>
        </div>
      </form>

      {/* Admin Security & Password Change Section */}
      <Card
        title="Admin Portal Security & Password"
        subtitle="Manage master credentials required to access the admin console"
        badge={<ShieldCheck className="w-4 h-4 text-terracotta-500" />}
      >
        <form onSubmit={handlePasswordSubmit} className="space-y-4 max-w-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="New Admin Username (optional)"
              placeholder="e.g. master_pehalwan"
              value={pwForm.newUsername}
              onChange={(e) => setPwForm({ ...pwForm, newUsername: e.target.value })}
            />
            <Input
              label="New Password (min 6 chars)"
              type="password"
              placeholder="••••••••••••"
              value={pwForm.newPassword}
              onChange={(e) => setPwForm({ ...pwForm, newPassword: e.target.value })}
            />
          </div>

          <Input
            label="Current Password (required to save changes) *"
            type="password"
            required
            placeholder="Enter current password (default: pehalwan@123)"
            value={pwForm.currentPassword}
            onChange={(e) => setPwForm({ ...pwForm, currentPassword: e.target.value })}
          />

          <Button
            type="submit"
            variant="secondary"
            isLoading={isUpdatingPw}
            icon={<KeyRound className="w-4 h-4 text-saffron-400" />}
          >
            Update Admin Password
          </Button>
        </form>
      </Card>
    </div>
  );
}
