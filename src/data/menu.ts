export interface Dish {
  id: number;
  name: string;
  category: "mutton" | "chicken" | "karahi" | string;
  tag: string;
  price: number;
  rating: string;
  desc: string;
  image: string;
  isAvailable?: boolean;
}

export interface CartItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  image: string;
}

// Minimal client-side offline fallback list. Full authoritative menu is served dynamically by the Express server.
export const menuDishes: Dish[] = [
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
];
