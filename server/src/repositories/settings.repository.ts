import { RowDataPacket } from "mysql2/promise";
import { queryOne, execute } from "../db/pool";
import { RestaurantSettings } from "../types";

interface SettingsRow extends RowDataPacket {
  id: number;
  restaurant_name: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  landline: string;
  email: string;
  address: string;
  branches: string;
  timings: string;
  delivery_fee: number;
  min_order: number;
  delivery_estimate: string;
  announcement: string;
  is_live_wok_active: number;
  is_accepting_orders?: number;
  announcement_enabled?: number;
  opening_time?: string;
  closing_time?: string;
  free_delivery_threshold?: number;
  easypaisa_number: string;
  jazzcash_number: string;
  payment_account_title: string;
}

export const DEFAULT_SETTINGS: RestaurantSettings = {
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
    "Express Takeaway & Cloud Kitchen",
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
  easypaisaNumber: "03001234567",
  jazzcashNumber: "03219876543",
  paymentAccountTitle: "Pehalwan Karahi & DeraGhar",
};

function parseBranches(raw: string): string[] {
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed.map(String);
  } catch {
    // fallback
  }
  return DEFAULT_SETTINGS.branches;
}

function mapSettings(row: SettingsRow): RestaurantSettings {
  const isAcceptingOrders =
    row.is_accepting_orders !== undefined ? Boolean(row.is_accepting_orders) : true;
  const announcementEnabled =
    row.announcement_enabled !== undefined ? Boolean(row.announcement_enabled) : true;
  const openingTime = row.opening_time || "12:00 PM";
  const closingTime = row.closing_time || "02:00 AM";
  const freeDeliveryThreshold =
    row.free_delivery_threshold !== undefined
      ? Number(row.free_delivery_threshold)
      : 3000;

  return {
    restaurantName: row.restaurant_name,
    name: row.restaurant_name,
    tagline: row.tagline,
    description: row.tagline,
    phone: row.phone,
    whatsapp: row.whatsapp,
    landline: row.landline,
    email: row.email,
    address: row.address,
    branches: parseBranches(row.branches),
    timings: row.timings || `${openingTime} – ${closingTime} Daily`,
    openingTime,
    closingTime,
    deliveryFee: row.delivery_fee,
    minOrder: row.min_order,
    deliveryEstimate: row.delivery_estimate,
    announcement: row.announcement,
    announcementText: row.announcement,
    announcementEnabled,
    isLiveWokActive: Boolean(row.is_live_wok_active),
    isAcceptingOrders,
    freeDeliveryThreshold,
    easypaisaNumber: row.easypaisa_number,
    jazzcashNumber: row.jazzcash_number,
    paymentAccountTitle: row.payment_account_title,
  };
}

export const settingsRepository = {
  async get(): Promise<RestaurantSettings> {
    const row = await queryOne<SettingsRow>("SELECT * FROM settings WHERE id = 1");
    if (!row) {
      return DEFAULT_SETTINGS;
    }
    return mapSettings(row);
  },

  async update(updates: Partial<RestaurantSettings>): Promise<RestaurantSettings> {
    const current = await this.get();

    const restaurantName = updates.restaurantName ?? updates.name ?? current.restaurantName;
    const tagline = updates.tagline ?? updates.description ?? current.tagline;
    const phone = updates.phone ?? current.phone;
    const whatsapp = updates.whatsapp ?? current.whatsapp;
    const landline = updates.landline ?? current.landline;
    const email = updates.email ?? current.email;
    const address = updates.address ?? current.address;
    const branchesJson = JSON.stringify(updates.branches ?? current.branches);
    const openingTime = updates.openingTime ?? current.openingTime ?? "12:00 PM";
    const closingTime = updates.closingTime ?? current.closingTime ?? "02:00 AM";
    const timings = updates.timings ?? current.timings ?? `${openingTime} – ${closingTime} Daily`;
    const deliveryFee = updates.deliveryFee !== undefined ? updates.deliveryFee : current.deliveryFee;
    const minOrder = updates.minOrder !== undefined ? updates.minOrder : current.minOrder;
    const deliveryEstimate = updates.deliveryEstimate ?? current.deliveryEstimate;
    const announcement = updates.announcement ?? updates.announcementText ?? current.announcement;
    const isLiveWokActive =
      updates.isLiveWokActive !== undefined
        ? updates.isLiveWokActive
          ? 1
          : 0
        : current.isLiveWokActive
        ? 1
        : 0;
    const isAcceptingOrders =
      updates.isAcceptingOrders !== undefined
        ? updates.isAcceptingOrders
          ? 1
          : 0
        : current.isAcceptingOrders
        ? 1
        : 0;
    const announcementEnabled =
      updates.announcementEnabled !== undefined
        ? updates.announcementEnabled
          ? 1
          : 0
        : current.announcementEnabled
        ? 1
        : 0;
    const freeDeliveryThreshold =
      updates.freeDeliveryThreshold !== undefined
        ? updates.freeDeliveryThreshold
        : (current.freeDeliveryThreshold ?? 3000);
    const easypaisaNumber = updates.easypaisaNumber ?? current.easypaisaNumber ?? "03001234567";
    const jazzcashNumber = updates.jazzcashNumber ?? current.jazzcashNumber ?? "03219876543";
    const paymentAccountTitle =
      updates.paymentAccountTitle ?? current.paymentAccountTitle ?? "Pehalwan Karahi & DeraGhar";

    await execute(
      `INSERT INTO settings (
        id, restaurant_name, tagline, phone, whatsapp, landline, email,
        address, branches, timings, delivery_fee, min_order, delivery_estimate,
        announcement, is_live_wok_active, is_accepting_orders, announcement_enabled,
        opening_time, closing_time, free_delivery_threshold,
        easypaisa_number, jazzcash_number, payment_account_title
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
      ) ON DUPLICATE KEY UPDATE
        restaurant_name = VALUES(restaurant_name),
        tagline = VALUES(tagline),
        phone = VALUES(phone),
        whatsapp = VALUES(whatsapp),
        landline = VALUES(landline),
        email = VALUES(email),
        address = VALUES(address),
        branches = VALUES(branches),
        timings = VALUES(timings),
        delivery_fee = VALUES(delivery_fee),
        min_order = VALUES(min_order),
        delivery_estimate = VALUES(delivery_estimate),
        announcement = VALUES(announcement),
        is_live_wok_active = VALUES(is_live_wok_active),
        is_accepting_orders = VALUES(is_accepting_orders),
        announcement_enabled = VALUES(announcement_enabled),
        opening_time = VALUES(opening_time),
        closing_time = VALUES(closing_time),
        free_delivery_threshold = VALUES(free_delivery_threshold),
        easypaisa_number = VALUES(easypaisa_number),
        jazzcash_number = VALUES(jazzcash_number),
        payment_account_title = VALUES(payment_account_title)`,
      [
        restaurantName,
        tagline,
        phone,
        whatsapp,
        landline,
        email,
        address,
        branchesJson,
        timings,
        deliveryFee,
        minOrder,
        deliveryEstimate,
        announcement,
        isLiveWokActive,
        isAcceptingOrders,
        announcementEnabled,
        openingTime,
        closingTime,
        freeDeliveryThreshold,
        easypaisaNumber,
        jazzcashNumber,
        paymentAccountTitle,
      ]
    );

    return this.get();
  },

  async reset(): Promise<RestaurantSettings> {
    return this.update(DEFAULT_SETTINGS);
  },
};
