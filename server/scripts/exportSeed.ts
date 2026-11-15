import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { RowDataPacket } from "mysql2/promise";
import { query, closePool } from "../src/db/pool";

interface CategoryRow extends RowDataPacket {
  id: number;
  slug: string;
  name: string;
  sort_order: number;
  is_active: number;
}

interface DishRow extends RowDataPacket {
  id: number;
  category_id: number;
  name: string;
  tag: string;
  price: number;
  rating: string;
  description: string;
  image_url: string;
  is_available: number;
  sort_order: number;
}

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
  is_accepting_orders: number;
  announcement_enabled: number;
  opening_time: string;
  closing_time: string;
  free_delivery_threshold: number;
  easypaisa_number: string;
  jazzcash_number: string;
  payment_account_title: string;
}

interface SiteSlotRow extends RowDataPacket {
  slot_key: string;
  section: string;
  label: string;
  alt_text: string;
  fallback_url: string;
  sort_order: number;
}

function escapeSql(value: string | number | boolean | null | undefined): string {
  if (value === null || value === undefined) return "NULL";
  if (typeof value === "number") return String(value);
  if (typeof value === "boolean") return value ? "1" : "0";
  const str = String(value);
  return `'${str.replace(/[\0\x08\x09\x1a\n\r"'\\\%]/g, (char) => {
    switch (char) {
      case "\0":
        return "\\0";
      case "\x08":
        return "\\b";
      case "\x09":
        return "\\t";
      case "\x1a":
        return "\\z";
      case "\n":
        return "\\n";
      case "\r":
        return "\\r";
      case "\"":
      case "'":
      case "\\":
      case "%":
        return "\\" + char;
      default:
        return char;
    }
  })}'`;
}

export async function exportSeed(): Promise<void> {
  const outDir = path.resolve(process.cwd(), "database");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outFile = path.join(outDir, "seed.sql");

  console.log("[ExportSeed] Fetching seed data from MySQL database...");
  const categories = await query<CategoryRow>("SELECT * FROM categories ORDER BY sort_order ASC, id ASC");
  const dishes = await query<DishRow>("SELECT * FROM dishes ORDER BY sort_order ASC, id ASC");
  const settingsRows = await query<SettingsRow>("SELECT * FROM settings WHERE id = 1");
  const siteSlots = await query<SiteSlotRow>("SELECT * FROM site_slots ORDER BY sort_order ASC, id ASC");

  const lines: string[] = [];
  lines.push("-- ============================================================");
  lines.push("-- PEHALWAN KARAHI & DERAGHAR — HOSTINGER DATABASE SEED DATA");
  lines.push("-- Exported from MySQL Database (Categories, Menu, Settings & Slots)");
  lines.push("-- Run this script in phpMyAdmin on Hostinger MySQL");
  lines.push("-- ============================================================\n");
  lines.push("SET FOREIGN_KEY_CHECKS = 0;\n");

  // 1. Categories
  if (categories.length > 0) {
    lines.push("-- Categories");
    lines.push("INSERT INTO categories (id, slug, name, sort_order, is_active) VALUES");
    const catInserts = categories.map(
      (c) => `  (${c.id}, ${escapeSql(c.slug)}, ${escapeSql(c.name)}, ${c.sort_order}, ${c.is_active})`
    );
    lines.push(
      catInserts.join(",\n") +
        "\nON DUPLICATE KEY UPDATE name=VALUES(name), sort_order=VALUES(sort_order), is_active=VALUES(is_active);\n"
    );
  }

  // 2. Dishes
  if (dishes.length > 0) {
    lines.push("-- Dishes");
    lines.push(
      "INSERT INTO dishes (id, category_id, name, tag, price, rating, description, image_url, is_available, sort_order) VALUES"
    );
    const dishInserts = dishes.map(
      (d) =>
        `  (${d.id}, ${d.category_id}, ${escapeSql(d.name)}, ${escapeSql(d.tag)}, ${d.price}, ${escapeSql(
          d.rating
        )}, ${escapeSql(d.description)}, ${escapeSql(d.image_url)}, ${d.is_available}, ${d.sort_order})`
    );
    lines.push(
      dishInserts.join(",\n") +
        "\nON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), description=VALUES(description), image_url=VALUES(image_url), is_available=VALUES(is_available);\n"
    );
  }

  // 3. Settings
  if (settingsRows.length > 0) {
    const s = settingsRows[0];
    lines.push("-- Settings");
    lines.push(`INSERT INTO settings (
  id, restaurant_name, tagline, phone, whatsapp, landline, email,
  address, branches, timings, delivery_fee, min_order, delivery_estimate,
  announcement, is_live_wok_active, is_accepting_orders, announcement_enabled,
  opening_time, closing_time, free_delivery_threshold,
  easypaisa_number, jazzcash_number, payment_account_title
) VALUES (
  1,
  ${escapeSql(s.restaurant_name)},
  ${escapeSql(s.tagline)},
  ${escapeSql(s.phone)},
  ${escapeSql(s.whatsapp)},
  ${escapeSql(s.landline)},
  ${escapeSql(s.email)},
  ${escapeSql(s.address)},
  ${escapeSql(s.branches)},
  ${escapeSql(s.timings)},
  ${Number(s.delivery_fee || 0)},
  ${Number(s.min_order || 500)},
  ${escapeSql(s.delivery_estimate || "28–35 mins")},
  ${escapeSql(s.announcement)},
  ${s.is_live_wok_active ? 1 : 0},
  ${s.is_accepting_orders ? 1 : 0},
  ${s.announcement_enabled ? 1 : 0},
  ${escapeSql(s.opening_time || "12:00 PM")},
  ${escapeSql(s.closing_time || "02:00 AM")},
  ${Number(s.free_delivery_threshold || 3000)},
  ${escapeSql(s.easypaisa_number || "03001234567")},
  ${escapeSql(s.jazzcash_number || "03219876543")},
  ${escapeSql(s.payment_account_title || "Pehalwan Karahi & DeraGhar")}
) ON DUPLICATE KEY UPDATE
  restaurant_name=VALUES(restaurant_name),
  tagline=VALUES(tagline),
  phone=VALUES(phone),
  whatsapp=VALUES(whatsapp),
  address=VALUES(address),
  branches=VALUES(branches),
  timings=VALUES(timings),
  delivery_fee=VALUES(delivery_fee),
  min_order=VALUES(min_order),
  delivery_estimate=VALUES(delivery_estimate),
  announcement=VALUES(announcement),
  is_accepting_orders=VALUES(is_accepting_orders),
  announcement_enabled=VALUES(announcement_enabled),
  opening_time=VALUES(opening_time),
  closing_time=VALUES(closing_time),
  free_delivery_threshold=VALUES(free_delivery_threshold);\n`);
  }

  // 4. Site Slots
  if (siteSlots.length > 0) {
    lines.push("-- Site Slots");
    lines.push(
      "INSERT INTO site_slots (slot_key, section, label, alt_text, fallback_url, sort_order) VALUES"
    );
    const slotInserts = siteSlots.map(
      (sl) =>
        `  (${escapeSql(sl.slot_key)}, ${escapeSql(sl.section)}, ${escapeSql(sl.label)}, ${escapeSql(
          sl.alt_text
        )}, ${escapeSql(sl.fallback_url)}, ${sl.sort_order})`
    );
    lines.push(
      slotInserts.join(",\n") +
        "\nON DUPLICATE KEY UPDATE label=VALUES(label), alt_text=VALUES(alt_text), fallback_url=VALUES(fallback_url);\n"
    );
  }

  lines.push("SET FOREIGN_KEY_CHECKS = 1;\n");

  fs.writeFileSync(outFile, lines.join("\n"), "utf8");
  console.log(`[ExportSeed] Successfully exported seed data to ${outFile}`);
}

if (require.main === module) {
  dotenv.config();
  const serverEnv = path.resolve(process.cwd(), "server", ".env");
  if (fs.existsSync(serverEnv)) {
    dotenv.config({ path: serverEnv });
  }

  exportSeed()
    .then(async () => {
      await closePool();
      process.exit(0);
    })
    .catch((err: unknown) => {
      console.error("[ExportSeed] Error:", err);
      process.exit(1);
    });
}
