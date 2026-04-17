import { ListingItem } from '@/types';

const CART_KEY = 'reuse_mart_cart';

export function getCartItems(): ListingItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(CART_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addToCart(item: ListingItem) {
  const current = getCartItems();
  // Avoid duplicates
  if (!current.some((c) => c.id === item.id)) {
    const updated = [...current, item];
    localStorage.setItem(CART_KEY, JSON.stringify(updated));
  }
}

export function removeFromCart(id: string) {
  const current = getCartItems();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(CART_KEY, JSON.stringify(updated));
}

export function clearCart() {
  localStorage.removeItem(CART_KEY);
}
