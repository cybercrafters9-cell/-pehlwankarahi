import fs from "fs";
import path from "path";
import { MenuItem, Order, Reservation, LoyaltyPass, RestaurantSettings, DashboardStats, AdminUser } from "../types";

const DATA_DIR = path.join(process.cwd(), "server", "data");
const STORE_FILE = path.join(DATA_DIR, "store.json");

interface DatabaseSchema {
  menu: MenuItem[];
  orders: Order[];
  reservations: Reservation[];
  loyaltyPasses: LoyaltyPass[];
  settings: RestaurantSettings;
  adminUser: AdminUser;
}

const defaultAdmin: AdminUser = {
  id: "ADMIN-01",
  username: "admin",
  email: "admin@pehalwankarahi.com",
  password: "pehalwan@123",
  name: "Master Pehalwan",
  role: "superadmin",
};

const defaultSettings: RestaurantSettings = {
  restaurantName: "Pehalwan Karahi & DeraGhar",
  tagline: "Authentic Pakistani Karahi, Charcoal Bar B Q & Desi Handi",
  phone: "0300-1234567",
  whatsapp: "0321-9876543",
  landline: "041-8899221",
  email: "info@pehalwankarahi.com",
  address: "Main Boulevard, Kohinoor City / Canal Road Rooftop, Faisalabad, Pakistan",
  branches: ["Gulberg / Kohinoor City Branch", "Canal Road Rooftop Family Dera", "Express Takeaway & Cloud Kitchen"],
  timings: "12:00 PM – 02:00 AM Daily",
  deliveryFee: 0,
  minOrder: 500,
  deliveryEstimate: "28–35 mins",
  announcement: "🔥 Live Koyla Grill & Freshly slaughtered Halal Meat prepared in pure Desi Ghee!",
  isLiveWokActive: true,
};

const initialMenu: MenuItem[] = [
  {
    id: 1,
    name: "Chicken Karahi",
    category: "chicken",
    tag: "Desi Ghee Classic • Full",
    price: 1550,
    rating: "4.9",
    desc: "Fresh organic chicken wok-seared in desi ghee with juicy vine tomatoes, ginger juliennes, green chilies, and cracked black pepper.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
  },
  {
    id: 2,
    name: "Mutton Karahi",
    category: "mutton",
    tag: "Bestseller • Shinwari Style",
    price: 2850,
    rating: "5.0",
    desc: "Tender prime dumba mutton cuts cooked in traditional iron wok with fresh tomatoes, garlic water, green chilies, and pure desi ghee.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
  },
  {
    id: 3,
    name: "Chicken Mince Karahi",
    category: "chicken",
    tag: "Garma Garam Keema Wok",
    price: 1650,
    rating: "4.8",
    desc: "Fresh coarsely minced chicken keema tossed on high flame with brown onion gravy, roasted cumin, and whole crushed spices.",
    image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
  },
  {
    id: 4,
    name: "Mutton Mince Karahi",
    category: "mutton",
    tag: "Desi Makhan Tarka",
    price: 2600,
    rating: "4.9",
    desc: "Hand-crafted coarse mutton keema cooked with ginger, coriander seeds, and tomatoes in a sizzling cast-iron karahi.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
  },
  {
    id: 5,
    name: "Boneless Chicken Karahi",
    category: "chicken",
    tag: "Makhni Boneless Bites",
    price: 1750,
    rating: "4.9",
    desc: "100% boneless succulent chicken breast cubes simmered in a velvety spiced tomato butter gravy topped with fresh cream and coriander.",
    image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
  },
  {
    id: 6,
    name: "Mutton Chops Karahi",
    category: "mutton",
    tag: "Royal Chaamp Karahi",
    price: 3200,
    rating: "5.0",
    desc: "Succulent, tender mutton rib chops braised and fried in fragrant animal fat/desi ghee with black pepper and green chilies.",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=85",
    isAvailable: true,
  },
  {
    id: 7,
    name: "Mutton Chops with Mince Karahi",
    category: "mutton",
    tag: "Signature Double Feast",
    price: 3500,
    rating: "5.0",
    desc: "The ultimate gourmet combination: prime tender mutton rib chops slow-roasted over a bed of rich, juicy mutton mince keema.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
  },
  {
    id: 8,
    name: "Desi Murgh Karahi",
    category: "chicken",
    tag: "Asli Desi Kukkad",
    price: 2400,
    rating: "4.9",
    desc: "Pure organic free-range desi chicken slow-cooked with patience in an authentic iron karahi with ginger, black pepper, and garlic.",
    image: "https://images.unsplash.com/photo-1603894584373-5ac82b2ae398?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
  },
  {
    id: 9,
    name: "Mutton Muscles (Machli) Karahi",
    category: "mutton",
    tag: "Shank Meat / Machli Special",
    price: 3100,
    rating: "5.0",
    desc: "Special bone-in mutton muscle (machli) shank meat, ultra-tender and infused with rich bone marrow essence and mild roasted tarka.",
    image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=600&q=80",
    isAvailable: true,
  },
];

class Database {
  private data: DatabaseSchema;

  constructor() {
    this.ensureDirectory();
    this.data = this.loadData();
  }

  private ensureDirectory() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  private loadData(): DatabaseSchema {
    try {
      if (fs.existsSync(STORE_FILE)) {
        const fileContent = fs.readFileSync(STORE_FILE, "utf-8");
        const parsed = JSON.parse(fileContent);
        if (!parsed.settings) parsed.settings = defaultSettings;
        if (!parsed.adminUser) parsed.adminUser = defaultAdmin;
        return parsed;
      }
    } catch (err) {
      console.error("[Database] Error reading store.json, re-initializing:", err);
    }

    const defaultData: DatabaseSchema = {
      menu: initialMenu,
      orders: [
        {
          id: "PK-1001",
          customerName: "Ali Khan",
          customerPhone: "0300-1234567",
          items: [
            {
              name: "Peshawari Charsi Mutton Karahi",
              price: 2850,
              qty: 1,
              image: "https://images.unsplash.com/photo-1585937421612-70a008356fbe?auto=format&fit=crop&w=300&q=80",
            },
            {
              name: "Tandoori Garlic & Kalonji Roghni Naan",
              price: 180,
              qty: 3,
              image: "https://images.unsplash.com/photo-1626074353765-517a681e40be?auto=format&fit=crop&w=600&q=80",
            },
          ],
          subtotal: 3390,
          deliveryFee: 0,
          discount: 0,
          total: 3390,
          spiceLevel: "Chatpata Desi",
          status: "delivered",
          estimatedDeliveryMins: 28,
          createdAt: new Date(Date.now() - 3600000).toISOString(),
        },
      ],
      reservations: [
        {
          id: "DAWAT-201",
          name: "Usman Ghani",
          phone: "0321-9876543",
          guests: "5-8 Guests (Rooftop Koyla Lawn)",
          timeSlot: "Tonight — 9:30 PM (Peak BBQ)",
          status: "confirmed",
          createdAt: new Date().toISOString(),
        },
      ],
      loyaltyPasses: [],
      settings: defaultSettings,
      adminUser: defaultAdmin,
    };

    this.saveData(defaultData);
    return defaultData;
  }

  private saveData(data: DatabaseSchema) {
    try {
      fs.writeFileSync(STORE_FILE, JSON.stringify(data, null, 2), "utf-8");
    } catch (err) {
      console.error("[Database] Error saving to store.json:", err);
    }
  }

  // --- Menu Operations ---
  public getMenu(): MenuItem[] {
    return this.data.menu;
  }

  public getDishById(id: number): MenuItem | undefined {
    return this.data.menu.find((dish) => dish.id === id);
  }

  public addDish(dish: Omit<MenuItem, "id">): MenuItem {
    const nextId = this.data.menu.reduce((max, d) => Math.max(max, d.id), 0) + 1;
    const newDish: MenuItem = { id: nextId, isAvailable: true, ...dish };
    this.data.menu.push(newDish);
    this.saveData(this.data);
    return newDish;
  }

  public updateDish(id: number, updates: Partial<MenuItem>): MenuItem | null {
    const idx = this.data.menu.findIndex((d) => d.id === id);
    if (idx === -1) return null;
    this.data.menu[idx] = { ...this.data.menu[idx], ...updates };
    this.saveData(this.data);
    return this.data.menu[idx];
  }

  public deleteDish(id: number): boolean {
    const initialLen = this.data.menu.length;
    this.data.menu = this.data.menu.filter((d) => d.id !== id);
    const deleted = this.data.menu.length < initialLen;
    if (deleted) this.saveData(this.data);
    return deleted;
  }

  // --- Order Operations ---
  public getOrders(): Order[] {
    return this.data.orders.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getOrderById(id: string): Order | undefined {
    return this.data.orders.find((o) => o.id.toLowerCase() === id.toLowerCase());
  }

  public createOrder(order: Omit<Order, "id" | "createdAt">): Order {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `PK-${randomSuffix}`,
      createdAt: new Date().toISOString(),
      ...order,
    };
    this.data.orders.unshift(newOrder);
    this.saveData(this.data);
    return newOrder;
  }

  public updateOrderStatus(id: string, status: Order["status"]): Order | null {
    const order = this.getOrderById(id);
    if (!order) return null;
    order.status = status;
    this.saveData(this.data);
    return order;
  }

  // --- Reservation Operations ---
  public getReservations(): Reservation[] {
    return this.data.reservations.sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  public getReservationById(id: string): Reservation | undefined {
    return this.data.reservations.find((r) => r.id.toLowerCase() === id.toLowerCase());
  }

  public createReservation(res: Omit<Reservation, "id" | "createdAt" | "status">): Reservation {
    const randomCode = Math.floor(1000 + Math.random() * 9000);
    const newReservation: Reservation = {
      id: `DAWAT-${randomCode}`,
      status: "confirmed",
      createdAt: new Date().toISOString(),
      ...res,
    };
    this.data.reservations.unshift(newReservation);
    this.saveData(this.data);
    return newReservation;
  }

  public updateReservationStatus(id: string, status: Reservation["status"]): Reservation | null {
    const reservation = this.getReservationById(id);
    if (!reservation) return null;
    reservation.status = status;
    this.saveData(this.data);
    return reservation;
  }

  // --- Loyalty Operations ---
  public activateLoyalty(phone: string, name?: string): LoyaltyPass {
    const existing = this.data.loyaltyPasses.find((p) => p.phone === phone);
    if (existing) {
      return existing;
    }
    const pass: LoyaltyPass = {
      id: `SHAHI-${Math.floor(1000 + Math.random() * 9000)}`,
      phone,
      name: name || "Shahi Mehmaan",
      tier: "Shahi Member",
      bonusPkr: 1000,
      discountPercent: 15,
      freeItem: "Free Roghni Naan",
      activatedAt: new Date().toISOString(),
    };
    this.data.loyaltyPasses.push(pass);
    this.saveData(this.data);
    return pass;
  }

  public getLoyalty(phone: string): LoyaltyPass | undefined {
    return this.data.loyaltyPasses.find((p) => p.phone === phone);
  }

  // --- Restaurant Settings Operations ---
  public getSettings(): RestaurantSettings {
    if (!this.data.settings) {
      this.data.settings = defaultSettings;
      this.saveData(this.data);
    }
    return this.data.settings;
  }

  public updateSettings(updates: Partial<RestaurantSettings>): RestaurantSettings {
    this.data.settings = { ...this.getSettings(), ...updates };
    this.saveData(this.data);
    return this.data.settings;
  }

  // --- Dashboard Analytics ---
  public getStats(): DashboardStats {
    const orders = this.data.orders;
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => (o.status !== "cancelled" ? sum + o.total : sum), 0);
    const pendingOrders = orders.filter((o) => o.status === "preparing" || o.status === "cooking_in_wok").length;
    const totalReservations = this.data.reservations.length;
    const activeDishesCount = this.data.menu.filter((d) => d.isAvailable !== false).length;

    // Calculate top dishes
    const dishCounts: Record<string, { count: number; revenue: number }> = {};
    orders.forEach((o) => {
      o.items.forEach((item) => {
        if (!dishCounts[item.name]) {
          dishCounts[item.name] = { count: 0, revenue: 0 };
        }
        dishCounts[item.name].count += item.qty;
        dishCounts[item.name].revenue += item.price * item.qty;
      });
    });

    const popularDishes = Object.entries(dishCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalRevenue,
      totalOrders,
      pendingOrders,
      totalReservations,
      activeDishesCount,
      popularDishes,
    };
  }

  // --- Admin Authentication Operations ---
  public getAdmin(): AdminUser {
    if (!this.data.adminUser) {
      this.data.adminUser = defaultAdmin;
      this.saveData(this.data);
    }
    return this.data.adminUser;
  }

  public verifyAdmin(identifier: string, password: string): AdminUser | null {
    const admin = this.getAdmin();
    const idLower = identifier.trim().toLowerCase();
    const matchesId =
      admin.username.toLowerCase() === idLower || admin.email.toLowerCase() === idLower;
    const matchesPassword = admin.password === password;

    if (matchesId && matchesPassword) {
      admin.lastLogin = new Date().toISOString();
      this.saveData(this.data);
      return admin;
    }
    return null;
  }

  public updateAdmin(updates: Partial<AdminUser>): AdminUser {
    this.data.adminUser = { ...this.getAdmin(), ...updates };
    this.saveData(this.data);
    return this.data.adminUser;
  }
}

export const db = new Database();
