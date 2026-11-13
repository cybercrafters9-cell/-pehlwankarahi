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
  name: string;
  price: number;
  qty: number;
  image: string;
}

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
