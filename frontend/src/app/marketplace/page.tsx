'use client';

import { useState, useMemo, useEffect } from 'react';
import { listings as mockListings } from '@/data/mock-data';
import { fetchFromApi } from '@/utils/api';
import { ListingType, ListingItem } from '@/types';
import FilterChips from '@/components/marketplace/FilterChips';
import ListingCard from '@/components/marketplace/ListingCard';
import DetailModal from '@/components/marketplace/DetailModal';
import { motion } from 'framer-motion';

export default function MarketplacePage() {
  const [filter, setFilter] = useState<ListingType | 'all'>('all');
  const [search, setSearch] = useState('');
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      const items = await fetchFromApi('/listings');
      const food = await fetchFromApi('/food-rescue');
      const upcycle = await fetchFromApi('/upcycle');

      if (items && items.length > 0) {
        const formattedItems = (items || []).map((i: any) => ({
          id: i.id, type: i.listing_type, title: i.title, description: i.description || '', image: i.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff', category: i.category, condition: i.condition, location: 'Local', available: i.status === 'available', userId: i.owner_id, userName: i.profiles?.full_name || 'User', userAvatar: i.profiles?.avatar_url || '👤', trustBadge: true, createdAt: i.created_at
        }));
        const formattedFood = (food || []).map((f: any) => ({
          id: f.id, type: 'food', title: f.title, description: f.description || '', image: f.image_url || 'https://images.unsplash.com/photo-1582283546949-a2e666bc0b64', category: 'Food', location: f.location, available: f.status === 'available', userId: f.donor_id, userName: f.profiles?.full_name || 'Cafe', userAvatar: f.profiles?.avatar_url || '🥪', trustBadge: true, createdAt: f.created_at, quantity: f.quantity
        }));
        const formattedUpcycle = (upcycle || []).map((u: any) => ({
          id: u.id, type: 'upcycle', title: u.material_type, description: u.description || '', image: u.image_url || 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158', category: 'Materials', location: 'Local', available: u.status === 'available', userId: u.provider_id, userName: u.profiles?.full_name || 'Provider', userAvatar: u.profiles?.avatar_url || '🔨', trustBadge: false, createdAt: u.created_at, weight: `${u.weight_kg}kg`
        }));
        setListings([...formattedItems, ...formattedFood, ...formattedUpcycle]);
      } else {
        setListings(mockListings);
      }
      setLoading(false);
    };
    loadData();
  }, []);

  const filtered = useMemo(() => {
    let items = listings;
    if (filter !== 'all') {
      if (filter === 'swap') {
        items = items.filter((i) => i.type === 'swap' || i.type === 'rent');
      } else {
        items = items.filter((i) => i.type === filter);
      }
    }
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }
    return items;
  }, [filter, search]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-container">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="font-heading text-4xl font-bold mb-2">
            Marketplace
          </h1>
          <p className="text-muted">
            Browse {listings.length} listings across swap, rent, food rescue, and upcycling.
          </p>
        </motion.div>

        {/* Search + Filters */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-col sm:flex-row gap-4 mb-8"
        >
          <div className="relative flex-1 max-w-md">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              type="text"
              placeholder="Search items..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-mid border border-white/5 rounded-xl text-sm text-white placeholder:text-muted-dim focus:outline-none focus:border-neon-green/30 transition-colors"
            />
          </div>
          <FilterChips active={filter} onChange={setFilter} />
        </motion.div>

        {/* Grid */}
        {filtered.length > 0 ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filtered.map((item, i) => (
              <ListingCard
                key={item.id}
                item={item}
                index={i}
                onClick={() => setSelectedItem(item)}
              />
            ))}
          </div>
        ) : (
          /* Empty state */
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <span className="text-5xl mb-4 opacity-30">🔍</span>
            <h3 className="font-heading text-lg font-semibold mb-2">No listings found</h3>
            <p className="text-sm text-muted mb-6">Try adjusting your search or filters.</p>
            <button
              onClick={() => { setFilter('all'); setSearch(''); }}
              className="px-4 py-2 text-sm font-heading font-semibold tracking-wider text-neon-green border border-neon-green/30 rounded-xl hover:bg-neon-green/5 transition-colors"
            >
              Clear Filters
            </button>
          </motion.div>
        )}

        {/* Listing count */}
        {filtered.length > 0 && (
          <div className="mt-8 text-center text-xs text-muted-dim font-heading tracking-wider">
            Showing {filtered.length} of {listings.length} listings
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
