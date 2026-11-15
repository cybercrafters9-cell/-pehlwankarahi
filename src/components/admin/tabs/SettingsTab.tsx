"use client";

import { useState } from "react";
import { RestaurantSettings, api } from "@/services/api";
import { Card } from "../ui/Card";
import { Input } from "../ui/Input";
import { Textarea } from "../ui/Textarea";
import { Button } from "../ui/Button";
import { Badge } from "../ui/Badge";
import { ConfirmDialog } from "../ui/ConfirmDialog";
import {
  Save,
  Plus,
  Trash2,
  Store,
  Phone,
  MapPin,
  Truck,
  ShieldCheck,
  KeyRound,
  Loader2,
  RotateCcw,
  Clock,
  CreditCard,
  Megaphone,
} from "lucide-react";

interface SettingsTabProps {
  settings: RestaurantSettings | null;
  onUpdateSettings: (settings: Partial<RestaurantSettings>) => Promise<void>;
  onResetSettings?: () => Promise<void>;
  isLoading: boolean;
  token?: string;
  onShowToast?: (msg: string, type?: "success" | "error") => void;
}

const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurantName: "Pehalwan Karahi & DeraGhar",
  name: "Pehalwan Karahi & DeraGhar",
  tagline: "Authentic Pakistani Karahi, Charcoal Bar B Q & Desi Handi",
  description: "Authentic Pakistani Karahi, Charcoal Bar B Q & Desi Handi",
  phone: "0300-1234567",
  whatsapp: "0321-9876543",
  landline: "041-8899221",
  email: "info@pehalwankarahi.com",
  address: "Main Boulevard, Kohinoor City / Canal Road Rooftop, Faisalabad, Pakistan",
  branches: [
    "Gulberg / Kohinoor City Branch",
    "Canal Road Rooftop Family Dera",
    "Express Takeaway Kitchen",
  ],
  timings: "12:00 PM – 02:00 AM Daily",
  openingTime: "12:00 PM",
  closingTime: "02:00 AM",
  deliveryFee: 0,
  minOrder: 500,
  deliveryEstimate: "28–35 mins",
  announcement: "🔥 Live Koyla Grill & Freshly slaughtered Halal Meat prepared in pure Desi Ghee!",
  announcementText: "🔥 Live Koyla Grill & Freshly slaughtered Halal Meat prepared in pure Desi Ghee!",
  announcementEnabled: true,
  isLiveWokActive: true,
  isAcceptingOrders: true,
  freeDeliveryThreshold: 3000,
  easypaisaNumber: "",
  jazzcashNumber: "",
  paymentAccountTitle: "Pehalwan Karahi & DeraGhar",
};

function SettingsForm({
  settings,
  onUpdateSettings,
  onResetSettings,
  token,
  onShowToast,
}: Omit<SettingsTabProps, "isLoading">) {
  const [form, setForm] = useState<RestaurantSettings>(() => settings || DEFAULT_SETTINGS);
  const [newBranch, setNewBranch] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

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

  const handleConfirmReset = async () => {
    setIsResetting(true);
    try {
      if (onResetSettings) {
        await onResetSettings();
      } else {
        const reset = await api.resetSettings();
        setForm(reset);
        if (onShowToast) onShowToast("Restaurant settings reset to defaults!", "success");
      }
      setIsResetConfirmOpen(false);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Failed to reset settings";
      if (onShowToast) onShowToast(msg, "error");
    } finally {
      setIsResetting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pwForm.currentPassword) {
      if (onShowToast) onShowToast("Please enter current password to confirm changes.", "error");
      return;
    }
    if (pwForm.newPassword && pwForm.newPassword.length < 8) {
      if (onShowToast) onShowToast("New password must be at least 8 characters.", "error");
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
        {/* Top Header Card with Action Controls */}
        <div className="bg-sand-50 border border-sand-200 rounded-3xl p-5 sm:p-6 shadow-soft flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="font-display font-bold text-xl text-charcoal-900">
                Restaurant Settings &amp; Contact Info
              </h2>
              <Badge variant="terracotta">Live Config</Badge>
            </div>
            <p className="text-xs text-charcoal-700/75 mt-0.5">
              Update branding, customer helplines, branch outlets, operating hours, delivery fees, and online payment accounts.
            </p>
          </div>
          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsResetConfirmOpen(true)}
              icon={<RotateCcw className="w-3.5 h-3.5" />}
              className="border-charcoal-300"
            >
              Reset to Defaults
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="md"
              isLoading={isSaving}
              icon={<Save className="w-4 h-4" />}
              className="shadow-glow"
            >
              Save Changes
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Brand & General Contact */}
          <div className="lg:col-span-6 space-y-6">
            {/* General Brand Identity */}
            <Card
              title="Brand & Identity"
              subtitle="Public restaurant branding on website and receipts"
              badge={<Store className="w-4 h-4 text-terracotta-500" />}
            >
              <div className="space-y-3.5">
                <Input
                  label="Restaurant Name *"
                  required
                  value={form.restaurantName}
                  onChange={(e) =>
                    setForm({ ...form, restaurantName: e.target.value, name: e.target.value })
                  }
                />
                <Input
                  label="Tagline / Motto"
                  value={form.tagline}
                  onChange={(e) =>
                    setForm({ ...form, tagline: e.target.value, description: e.target.value })
                  }
                />
                <Textarea
                  label="Restaurant Description"
                  rows={2}
                  value={form.description || form.tagline}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value, tagline: e.target.value })
                  }
                />
              </div>
            </Card>

            {/* Announcement Banner */}
            <Card
              title="Announcement Banner"
              subtitle="Top promotional notification bar shown across the website"
              badge={<Megaphone className="w-4 h-4 text-saffron-500" />}
            >
              <div className="space-y-3.5">
                <div className="flex items-center justify-between p-3 rounded-2xl bg-sand-100 border border-sand-200">
                  <div>
                    <p className="text-xs font-bold text-charcoal-900">Show Announcement Banner</p>
                    <p className="text-[11px] text-charcoal-600">
                      Display sticky banner with flame icon above the navbar
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={form.announcementEnabled ?? true}
                      onChange={(e) =>
                        setForm({ ...form, announcementEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-sand-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-terracotta-500"></div>
                  </label>
                </div>

                <Textarea
                  label="Announcement Message"
                  rows={2}
                  value={form.announcement}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      announcement: e.target.value,
                      announcementText: e.target.value,
                    })
                  }
                />
              </div>
            </Card>

            {/* Contact Numbers & Desk Card */}
            <Card
              title="Contact Numbers & Helplines"
              subtitle="Numbers displayed for customer orders & table reservations"
              badge={<Phone className="w-4 h-4 text-emerald-600" />}
            >
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Primary Phone (Call / Helpline) *"
                    required
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  />
                  <Input
                    label="WhatsApp Ordering Number *"
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

          {/* Right Column: Operations, Delivery & Payment */}
          <div className="lg:col-span-6 space-y-6">
            {/* Operating Hours & Order Acceptance */}
            <Card
              title="Operations & Timings"
              subtitle="Control online order intake and restaurant opening hours"
              badge={<Clock className="w-4 h-4 text-terracotta-500" />}
            >
              <div className="space-y-3.5">
                {/* Online Order Acceptance Toggle */}
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-sand-100 border border-sand-200">
                  <div>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-bold text-charcoal-900">Online Order Acceptance</p>
                      <Badge variant={form.isAcceptingOrders ?? true ? "success" : "danger"}>
                        {form.isAcceptingOrders ?? true ? "Accepting Orders" : "Orders Paused"}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-charcoal-600 mt-0.5">
                      Toggle off to temporarily pause online cart checkout during peak rush or closing
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer shrink-0 ml-3">
                    <input
                      type="checkbox"
                      checked={form.isAcceptingOrders ?? true}
                      onChange={(e) =>
                        setForm({ ...form, isAcceptingOrders: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-sand-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Opening Time"
                    placeholder="e.g. 12:00 PM"
                    value={form.openingTime || "12:00 PM"}
                    onChange={(e) => setForm({ ...form, openingTime: e.target.value })}
                  />
                  <Input
                    label="Closing Time"
                    placeholder="e.g. 02:00 AM"
                    value={form.closingTime || "02:00 AM"}
                    onChange={(e) => setForm({ ...form, closingTime: e.target.value })}
                  />
                </div>

                <Input
                  label="Display Timings String"
                  placeholder="e.g. 12:00 PM – 02:00 AM Daily"
                  value={form.timings}
                  onChange={(e) => setForm({ ...form, timings: e.target.value })}
                />
              </div>
            </Card>

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
                <div className="space-y-2 pt-1">
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
                          className="text-red-500 hover:text-red-700 p-1 cursor-pointer transition-colors"
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
                      placeholder="Add new branch outlet or location..."
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

            {/* Delivery & Order Rules */}
            <Card
              title="Order Rules & Delivery Rates"
              subtitle="Enforced in server-authoritative checkout"
              badge={<Truck className="w-4 h-4 text-terracotta-500" />}
            >
              <div className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Minimum Order (PKR)"
                    type="number"
                    min="0"
                    value={form.minOrder}
                    onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })}
                  />
                  <Input
                    label="Standard Delivery Fee (PKR)"
                    type="number"
                    min="0"
                    value={form.deliveryFee}
                    onChange={(e) => setForm({ ...form, deliveryFee: Number(e.target.value) })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Free Delivery Above (PKR - 0 to disable)"
                    type="number"
                    min="0"
                    value={form.freeDeliveryThreshold ?? 3000}
                    onChange={(e) =>
                      setForm({ ...form, freeDeliveryThreshold: Number(e.target.value) })
                    }
                  />
                  <Input
                    label="Delivery Estimate String"
                    value={form.deliveryEstimate}
                    onChange={(e) => setForm({ ...form, deliveryEstimate: e.target.value })}
                  />
                </div>
              </div>
            </Card>

            {/* Payment Accounts */}
            <Card
              title="Online Payment Accounts"
              subtitle="Easypaisa and JazzCash mobile transfer accounts shown at checkout"
              badge={<CreditCard className="w-4 h-4 text-saffron-500" />}
            >
              <div className="space-y-3.5">
                <Input
                  label="Official Account Title *"
                  value={form.paymentAccountTitle || "Pehalwan Karahi & DeraGhar"}
                  onChange={(e) => setForm({ ...form, paymentAccountTitle: e.target.value })}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    label="Easypaisa Account Number"
                    value={form.easypaisaNumber || ""}
                    onChange={(e) => setForm({ ...form, easypaisaNumber: e.target.value })}
                  />
                  <Input
                    label="JazzCash Account Number"
                    value={form.jazzcashNumber || ""}
                    onChange={(e) => setForm({ ...form, jazzcashNumber: e.target.value })}
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
              label="New Password (min 8 chars)"
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
            placeholder="Enter current password to authorize changes"
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

      {/* Reset to Factory Defaults Confirm Dialog */}
      <ConfirmDialog
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
        onConfirm={handleConfirmReset}
        title="Reset Restaurant Settings?"
        message="This will reset restaurant text, descriptions, and timings back to factory default values. Your Easypaisa, JazzCash, and payment details will be kept intact. Are you sure you want to proceed?"
        confirmText="Reset to Defaults"
        isLoading={isResetting}
      />
    </div>
  );
}

export function SettingsTab({
  settings,
  onUpdateSettings,
  onResetSettings,
  isLoading,
  token,
  onShowToast,
}: SettingsTabProps) {
  if (isLoading && !settings) {
    return (
      <div className="bg-sand-50 border border-sand-200 rounded-3xl p-12 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-terracotta-500 mx-auto mb-2" />
        <p className="font-display font-bold text-base text-charcoal-900">Loading settings...</p>
      </div>
    );
  }

  return (
    <SettingsForm
      key={settings?.restaurantName || "default-settings"}
      settings={settings}
      onUpdateSettings={onUpdateSettings}
      onResetSettings={onResetSettings}
      token={token}
      onShowToast={onShowToast}
    />
  );
}
