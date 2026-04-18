import { ListingItem } from '@/types';

const CART_KEY = 'reuse_mart_cart';

function getUserId(): string {
  if (typeof window === 'undefined') return 'guest';
  return localStorage.getItem('reuse_mart_current_user') || 'guest';
}

function getCartKey(): string {
  return `${CART_KEY}_${getUserId()}`;
}

export function getCartItems(): ListingItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getCartKey());
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
    localStorage.setItem(getCartKey(), JSON.stringify(updated));
  }
}

export function removeFromCart(id: string) {
  const current = getCartItems();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(getCartKey(), JSON.stringify(updated));
}

export function clearCart() {
  localStorage.removeItem(getCartKey());
}
