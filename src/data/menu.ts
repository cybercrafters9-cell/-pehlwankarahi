export interface CategoryItem {
  id: number;
  slug: string;
  name: string;
  sortOrder: number;
  isActive: boolean;
}

export interface Dish {
  id: number;
  name: string;
  category: string;
  categoryName?: string;
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
