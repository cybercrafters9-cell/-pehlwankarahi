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
  bank_name?: string;
  bank_branch?: string;
  bank_account_title?: string;
  bank_account_number?: string;
  bank_iban?: string;
  logo_url?: string;
  favicon_url?: string;
}

export const DEFAULT_SETTINGS: RestaurantSettings = {
  restaurantName: "Pehlwan Karahi",
  name: "Pehlwan Karahi",
  tagline: "Authentic Pakistani Karahi, Charcoal Bar B Q & Desi Handi",
  description: "Authentic Pakistani Karahi, Charcoal Bar B Q & Desi Handi",
  phone: "0300-1234567",
  whatsapp: "0321-9876543",
  landline: "041-8899221",
  email: "info@pehlwankarahi.com",
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
  deliveryEstimate: "Order before 7 PM • Next-Day Delivery",
  announcement: "🔥 Live Koyla Grill & Freshly slaughtered Halal Meat prepared in pure Desi Ghee!",
  announcementText: "🔥 Live Koyla Grill & Freshly slaughtered Halal Meat prepared in pure Desi Ghee!",
  announcementEnabled: true,
  isLiveWokActive: true,
  isAcceptingOrders: true,
  freeDeliveryThreshold: 3000,
  easypaisaNumber: "",
  jazzcashNumber: "",
  paymentAccountTitle: "Pehlwan Karahi",
  bankName: "Dubai Islamic Bank",
  bankBranch: "Riphah Branch, Faisalabad",
  bankAccountTitle: "Muhammad Zuber",
  bankAccountNumber: "0792749002",
  bankIban: "PK90DUIB0000000792749002",
  logoUrl: "",
  faviconUrl: "",
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
    bankName: row.bank_name || DEFAULT_SETTINGS.bankName,
    bankBranch: row.bank_branch || DEFAULT_SETTINGS.bankBranch,
    bankAccountTitle: row.bank_account_title || DEFAULT_SETTINGS.bankAccountTitle,
    bankAccountNumber: row.bank_account_number || DEFAULT_SETTINGS.bankAccountNumber,
    bankIban: row.bank_iban || DEFAULT_SETTINGS.bankIban,
    logoUrl: row.logo_url || "",
    faviconUrl: row.favicon_url || "",
  };
}

let logoColumnsEnsured = false;
async function ensureLogoAndFaviconColumns(): Promise<void> {
  if (logoColumnsEnsured) return;
  try {
    await execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS logo_url VARCHAR(1000) NULL AFTER payment_account_title");
    await execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS favicon_url VARCHAR(1000) NULL AFTER logo_url");
    await execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_name VARCHAR(255) NULL AFTER payment_account_title");
    await execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_branch VARCHAR(255) NULL AFTER bank_name");
    await execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_account_title VARCHAR(255) NULL AFTER bank_branch");
    await execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_account_number VARCHAR(100) NULL AFTER bank_account_title");
    await execute("ALTER TABLE settings ADD COLUMN IF NOT EXISTS bank_iban VARCHAR(100) NULL AFTER bank_account_number");
    logoColumnsEnsured = true;
  } catch {
    try {
      const existing = await queryOne<RowDataPacket>(
        "SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'logo_url'"
      );
      if (existing && Number(existing.cnt) === 0) {
        await execute("ALTER TABLE settings ADD COLUMN logo_url VARCHAR(1000) NULL AFTER payment_account_title");
      }
      const existingFav = await queryOne<RowDataPacket>(
        "SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'favicon_url'"
      );
      if (existingFav && Number(existingFav.cnt) === 0) {
        await execute("ALTER TABLE settings ADD COLUMN favicon_url VARCHAR(1000) NULL AFTER logo_url");
      }
      const existingBank = await queryOne<RowDataPacket>(
        "SELECT COUNT(*) as cnt FROM information_schema.columns WHERE table_name = 'settings' AND column_name = 'bank_name'"
      );
      if (existingBank && Number(existingBank.cnt) === 0) {
        await execute("ALTER TABLE settings ADD COLUMN bank_name VARCHAR(255) NULL AFTER payment_account_title");
        await execute("ALTER TABLE settings ADD COLUMN bank_branch VARCHAR(255) NULL AFTER bank_name");
        await execute("ALTER TABLE settings ADD COLUMN bank_account_title VARCHAR(255) NULL AFTER bank_branch");
        await execute("ALTER TABLE settings ADD COLUMN bank_account_number VARCHAR(100) NULL AFTER bank_account_title");
        await execute("ALTER TABLE settings ADD COLUMN bank_iban VARCHAR(100) NULL AFTER bank_account_number");
      }
      logoColumnsEnsured = true;
    } catch {
      // Continue even if database is offline or constrained
    }
  }
}

export const settingsRepository = {
  async get(): Promise<RestaurantSettings> {
    await ensureLogoAndFaviconColumns();
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
    const easypaisaNumber = updates.easypaisaNumber ?? current.easypaisaNumber ?? "";
    const jazzcashNumber = updates.jazzcashNumber ?? current.jazzcashNumber ?? "";
    const paymentAccountTitle =
      updates.paymentAccountTitle ?? current.paymentAccountTitle ?? "Pehlwan Karahi";
    const bankName = updates.bankName !== undefined ? updates.bankName : (current.bankName ?? DEFAULT_SETTINGS.bankName);
    const bankBranch = updates.bankBranch !== undefined ? updates.bankBranch : (current.bankBranch ?? DEFAULT_SETTINGS.bankBranch);
    const bankAccountTitle = updates.bankAccountTitle !== undefined ? updates.bankAccountTitle : (current.bankAccountTitle ?? DEFAULT_SETTINGS.bankAccountTitle);
    const bankAccountNumber = updates.bankAccountNumber !== undefined ? updates.bankAccountNumber : (current.bankAccountNumber ?? DEFAULT_SETTINGS.bankAccountNumber);
    const bankIban = updates.bankIban !== undefined ? updates.bankIban : (current.bankIban ?? DEFAULT_SETTINGS.bankIban);
    const logoUrl = updates.logoUrl !== undefined ? updates.logoUrl : (current.logoUrl ?? "");
    const faviconUrl = updates.faviconUrl !== undefined ? updates.faviconUrl : (current.faviconUrl ?? "");

    await ensureLogoAndFaviconColumns();

    await execute(
      `INSERT INTO settings (
        id, restaurant_name, tagline, phone, whatsapp, landline, email,
        address, branches, timings, delivery_fee, min_order, delivery_estimate,
        announcement, is_live_wok_active, is_accepting_orders, announcement_enabled,
        opening_time, closing_time, free_delivery_threshold,
        easypaisa_number, jazzcash_number, payment_account_title,
        bank_name, bank_branch, bank_account_title, bank_account_number, bank_iban,
        logo_url, favicon_url
      ) VALUES (
        1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?
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
        payment_account_title = VALUES(payment_account_title),
        bank_name = VALUES(bank_name),
        bank_branch = VALUES(bank_branch),
        bank_account_title = VALUES(bank_account_title),
        bank_account_number = VALUES(bank_account_number),
        bank_iban = VALUES(bank_iban),
        logo_url = VALUES(logo_url),
        favicon_url = VALUES(favicon_url)`,
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
        bankName,
        bankBranch,
        bankAccountTitle,
        bankAccountNumber,
        bankIban,
        logoUrl,
        faviconUrl,
      ]
    );

    return this.get();
  },

  async reset(): Promise<RestaurantSettings> {
    const current = await this.get();
    return this.update({
      ...DEFAULT_SETTINGS,
      easypaisaNumber: current.easypaisaNumber,
      jazzcashNumber: current.jazzcashNumber,
      paymentAccountTitle: current.paymentAccountTitle,
      bankName: current.bankName,
      bankBranch: current.bankBranch,
      bankAccountTitle: current.bankAccountTitle,
      bankAccountNumber: current.bankAccountNumber,
      bankIban: current.bankIban,
      logoUrl: current.logoUrl,
      faviconUrl: current.faviconUrl,
    });
  },
};
