import { ListingItem } from '@/types';

const WISHLIST_KEY = 'reuse_mart_wishlist';

function getUserId(): string {
  if (typeof window === 'undefined') return 'guest';
  return localStorage.getItem('reuse_mart_current_user') || 'guest';
}

function getWishlistKey(): string {
  return `${WISHLIST_KEY}_${getUserId()}`;
}

export function getWishlistItems(): ListingItem[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(getWishlistKey());
    return raw ? JSON.parse(raw) : [];
  } catch (e) {
    return [];
  }
}

export function addToWishlist(item: ListingItem) {
  const current = getWishlistItems();
  if (!current.some((c) => c.id === item.id)) {
    const updated = [...current, item];
    localStorage.setItem(getWishlistKey(), JSON.stringify(updated));
  }
}

export function removeFromWishlist(id: string | number) {
  const current = getWishlistItems();
  const updated = current.filter(item => item.id !== id);
  localStorage.setItem(getWishlistKey(), JSON.stringify(updated));
}

export function isInWishlist(id: string | number): boolean {
  const current = getWishlistItems();
  return current.some((c) => c.id === id);
}
