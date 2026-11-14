import fs from "fs";
import path from "path";

interface StoreDish {
  id: number;
  name: string;
  category: string;
  tag: string;
  price: number;
  rating: string;
  desc: string;
  image: string;
  isAvailable?: boolean;
}

interface StoreSettings {
  restaurantName: string;
  tagline: string;
  phone: string;
  whatsapp: string;
  landline: string;
  email: string;
  address: string;
  branches: string[];
  timings: string;
  deliveryFee: number;
  minOrder: number;
  deliveryEstimate: string;
  announcement: string;
  isLiveWokActive: boolean;
  easypaisaNumber?: string;
  jazzcashNumber?: string;
  paymentAccountTitle?: string;
}

interface StoreJson {
  menu: StoreDish[];
  settings: StoreSettings;
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

export function exportSeed(): void {
  const storePath = path.resolve(process.cwd(), "server", "data", "store.json");
  if (!fs.existsSync(storePath)) {
    throw new Error(`[ExportSeed] store.json not found at ${storePath}`);
  }

  const storeRaw = fs.readFileSync(storePath, "utf8");
  const store: StoreJson = JSON.parse(storeRaw);

  const outDir = path.resolve(process.cwd(), "database");
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }
  const outFile = path.join(outDir, "seed.sql");

  const lines: string[] = [];
  lines.push("-- ============================================================");
  lines.push("-- PEHALWAN KARAHI & DERAGHAR — HOSTINGER DATABASE SEED DATA");
  lines.push("-- Exported from store.json (Menu and Settings ONLY)");
  lines.push("-- Run this script in phpMyAdmin on Hostinger MySQL");
  lines.push("-- ============================================================\n");
  lines.push("SET FOREIGN_KEY_CHECKS = 0;\n");

  // 1. Categories
  const categoryNames: Record<string, string> = {
    karahi: "Special Karahi & Handi",
    bbq: "Charcoal Bar B Q",
    rice: "Matka Dum Biryani & Pulao",
    tandoor: "Garam Tandoor & Desserts",
  };

  const rawCategories = Array.from(new Set(store.menu.map((d) => d.category)));
  const categoryMap = new Map<string, number>();

  lines.push("-- Categories");
  lines.push("INSERT INTO categories (id, slug, name, sort_order, is_active) VALUES");
  const catInserts: string[] = [];
  rawCategories.forEach((slug, idx) => {
    const id = idx + 1;
    categoryMap.set(slug, id);
    const name = categoryNames[slug] || slug.toUpperCase();
    catInserts.push(`  (${id}, ${escapeSql(slug)}, ${escapeSql(name)}, ${id}, 1)`);
  });
  lines.push(catInserts.join(",\n") + "\nON DUPLICATE KEY UPDATE name=VALUES(name), sort_order=VALUES(sort_order);\n");

  // 2. Dishes
  lines.push("-- Dishes");
  lines.push(
    "INSERT INTO dishes (id, category_id, name, tag, price, rating, description, image_url, is_available, sort_order) VALUES"
  );
  const dishInserts: string[] = [];
  store.menu.forEach((dish, idx) => {
    const catId = categoryMap.get(dish.category) || 1;
    const isAvail = dish.isAvailable !== false ? 1 : 0;
    dishInserts.push(
      `  (${dish.id}, ${catId}, ${escapeSql(dish.name)}, ${escapeSql(dish.tag || "")}, ${Number(dish.price)}, ${escapeSql(dish.rating || "4.9")}, ${escapeSql(dish.desc || "")}, ${escapeSql(dish.image)}, ${isAvail}, ${idx + 1})`
    );
  });
  lines.push(
    dishInserts.join(",\n") +
      "\nON DUPLICATE KEY UPDATE name=VALUES(name), price=VALUES(price), description=VALUES(description), image_url=VALUES(image_url);\n"
  );

  // 3. Settings
  lines.push("-- Settings");
  const s = store.settings;
  const branchesJson = JSON.stringify(s.branches || []);
  lines.push(`INSERT INTO settings (
  id, restaurant_name, tagline, phone, whatsapp, landline, email,
  address, branches, timings, delivery_fee, min_order, delivery_estimate,
  announcement, is_live_wok_active, easypaisa_number, jazzcash_number, payment_account_title
) VALUES (
  1,
  ${escapeSql(s.restaurantName)},
  ${escapeSql(s.tagline)},
  ${escapeSql(s.phone)},
  ${escapeSql(s.whatsapp)},
  ${escapeSql(s.landline)},
  ${escapeSql(s.email)},
  ${escapeSql(s.address)},
  ${escapeSql(branchesJson)},
  ${escapeSql(s.timings)},
  ${Number(s.deliveryFee || 0)},
  ${Number(s.minOrder || 500)},
  ${escapeSql(s.deliveryEstimate || "28–35 mins")},
  ${escapeSql(s.announcement)},
  ${s.isLiveWokActive ? 1 : 0},
  ${escapeSql(s.easypaisaNumber || "03001234567")},
  ${escapeSql(s.jazzcashNumber || "03219876543")},
  ${escapeSql(s.paymentAccountTitle || "Pehalwan Karahi & DeraGhar")}
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
  announcement=VALUES(announcement);\n`);

  lines.push("SET FOREIGN_KEY_CHECKS = 1;\n");

  fs.writeFileSync(outFile, lines.join("\n"), "utf8");
  console.log(`[ExportSeed] Successfully exported seed data to ${outFile}`);
}

if (require.main === module) {
  try {
    exportSeed();
  } catch (err: unknown) {
    console.error("[ExportSeed] Error:", err);
    process.exit(1);
  }
}
