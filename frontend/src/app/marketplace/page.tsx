'use client';

import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { fetchFromApi } from '@/utils/api';
import { ListingType, ListingItem } from '@/types';
import FilterSidebar, { FilterState } from '@/components/marketplace/FilterSidebar';
import ListingCard from '@/components/marketplace/ListingCard';
import DetailModal from '@/components/marketplace/DetailModal';
import Testimonials from '@/components/marketplace/Testimonials';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '@/context/LanguageContext';

import { Suspense } from 'react';

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get('q') || '';
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'buy' | 'rent' | 'swap'>('buy');
  const [search, setSearch] = useState(initialQuery);
  const [selectedItem, setSelectedItem] = useState<ListingItem | null>(null);
  const [listings, setListings] = useState<ListingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [filters, setFilters] = useState<FilterState>({
    category: 'all',
    distance: 25,
    priceRange: [0, 500],
    rating: 0,
    availability: false,
    sortBy: 'newest'
  });

  const productId = searchParams.get('productId');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Generate deterministic mock data based on item ID
  const generateMockItemData = (item: any) => {
    const idNum = parseInt(item.id.replace(/\D/g, '').substring(0, 5)) || Math.floor(Math.random() * 10000);
    const mockRating = [4, 5, 4.5, 3.5, 5][idNum % 5];
    const mockDistance = (idNum % 15) + 1;
    const mockEcoNotes = [
      "Saved waste by renting",
      "Better than buying new",
      "Carbon neutral choice",
      "Saved ~12kg of CO2",
      "Circular economy win"
    ];
    // Decrypt injected description metadata
    let sellerMatch = item.description?.match(/\[S_NAME:(.*?)\]/);
    let priceMatch = item.description?.match(/\[PRICE:(.*?)\]/);
    let overrideName = sellerMatch ? sellerMatch[1] : null;
    let overridePrice = priceMatch ? parseFloat(priceMatch[1]) : item.price;

    return {
      ...item,
      userName: overrideName && overrideName.trim() !== '' ? overrideName : item.userName,
      distance: `${mockDistance} miles`,
      trustRating: mockRating,
      ecoNote: mockEcoNotes[idNum % 5],
      rentPrice: item.type === 'rent' ? (overridePrice || ((idNum % 15) + 5)) : undefined,
      estimatedValue: item.type === 'swap' ? (overridePrice || ((idNum % 150) + 20)) : undefined,
      price: item.type === 'buy' ? (overridePrice || ((idNum % 100) + 10)) : overridePrice,
      rentPeriod: 'day',
      swapFor: item.type === 'swap' || item.type === 'upcycle' ? ['Tools', 'Plants', 'Coffee Beans', 'Books', 'Any'][idNum % 5] : undefined
    };
  };

  useEffect(() => {
    const loadData = async () => {
      const items = await fetchFromApi('/listings');
      const food = await fetchFromApi('/food-rescue');
      const upcycle = await fetchFromApi('/upcycle');

      const formattedItems = (items || []).filter((i: any) => i.status === 'approved').map((i: any) => generateMockItemData({
        id: i.id, type: i.listing_type === 'swap' ? 'swap' : (i.listing_type === 'rent' ? 'rent' : 'buy'), title: i.title, description: i.description || '', image: i.image_url, category: i.category, condition: i.condition, location: 'Local', available: true, userId: i.owner_id, userName: i.profiles?.full_name || 'User', userAvatar: i.profiles?.avatar_url || '👤', trustBadge: true, createdAt: i.created_at, price: i.price
      }));
      const formattedFood = (food || []).map((f: any) => generateMockItemData({
        id: f.id, type: 'buy', title: f.title, description: f.description || '', image: f.image_url, category: 'food', location: f.location, available: f.status === 'available', userId: f.donor_id, userName: f.profiles?.full_name || 'Cafe', userAvatar: f.profiles?.avatar_url || '🥪', trustBadge: true, createdAt: f.created_at, quantity: f.quantity, price: f.price
      }));
      const formattedUpcycle = (upcycle || []).map((u: any) => generateMockItemData({
        id: u.id, type: 'swap', title: u.material_type, description: u.description || '', image: u.image_url, category: 'materials', location: 'Local', available: u.status === 'available', userId: u.provider_id, userName: u.profiles?.full_name || 'Provider', userAvatar: u.profiles?.avatar_url || '🔨', trustBadge: false, createdAt: u.created_at, weight: `${u.weight_kg}kg`, price: u.price
      }));

      const allListings = [...formattedItems, ...formattedFood, ...formattedUpcycle];
      setListings(allListings);
      setLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    if (productId && listings.length > 0) {
      const found = listings.find(l => l.id === productId);
      if (found) {
        setSelectedItem(found);
      } else {
        setErrorMsg("The scanned QR code is invalid or the product no longer exists.");
        setTimeout(() => setErrorMsg(null), 5000);
        // Clean the URL safely without full refresh
        if (typeof window !== 'undefined') {
          window.history.replaceState(null, '', '/marketplace');
        }
      }
    }
  }, [productId, listings]);

  const filtered = useMemo(() => {
    // 1. Tab Filter
    let items = listings.filter((i) => i.type === activeTab);

    // 2. Sidebar Filters
    if (filters.category !== 'all') {
      items = items.filter(i => i.category.toLowerCase() === filters.category);
    }

    if (filters.rating > 0) {
      items = items.filter(i => (i.trustRating || 0) >= filters.rating);
    }

    if (filters.availability) {
      items = items.filter(i => i.available);
    }

    // Parse numeric distance string if available
    items = items.filter(i => {
      const dist = parseInt((i.distance || '0').replace(/\D/g, '')) || 0;
      return dist <= filters.distance;
    });

    // 3. Search text
    if (search) {
      const q = search.toLowerCase();
      items = items.filter(
        (i) => i.title.toLowerCase().includes(q) || i.category.toLowerCase().includes(q) || i.description.toLowerCase().includes(q)
      );
    }

    // Sort
    return items.sort((a, b) => {
      if (filters.sortBy === 'newest') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (filters.sortBy === 'highest-rated') return (b.trustRating || 0) - (a.trustRating || 0);
      if (filters.sortBy === 'nearest') {
        const dA = parseInt((a.distance || '0').replace(/\D/g, '')) || 0;
        const dB = parseInt((b.distance || '0').replace(/\D/g, '')) || 0;
        return dA - dB;
      }
      return 0; // Default
    });

  }, [activeTab, search, filters, listings]);

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-container">

        {errorMsg && (
          <div className="mb-8 bg-red-500/20 border border-red-500/50 text-red-200 px-4 py-3 rounded-xl flex items-center justify-between">
            <span className="font-heading font-semibold tracing-widest uppercase text-sm">⚠️ {errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-200 hover:text-white">✕</button>
          </div>
        )}

        {/* Mobile Filter Toggle & Search Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="font-heading text-4xl font-bold mb-2">
              {t('mkt_title')}
            </h1>
            <p className="text-muted">
              {t('mkt_desc').replace('{count}', listings.length.toString())}
            </p>
          </motion.div>

          <div className="flex gap-4">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden glass px-4 py-2 rounded-xl flex items-center gap-2 text-sm font-heading font-semibold tracking-wider hover:bg-white/5 border border-white/5"
            >
              <span>⚙️</span> Filters
            </button>

            <div className="relative flex-1 md:w-64">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-dim" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
              </svg>
              <input
                type="text"
                placeholder={t('mkt_search')}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-surface-mid border border-white/5 rounded-xl text-sm text-white placeholder:text-muted-dim focus:outline-none focus:border-neon-green/30 transition-colors"
              />
            </div>
          </div>
        </div>

        <div className="flex gap-8">
          <FilterSidebar filters={filters} setFilters={setFilters} isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          <div className="flex-1 w-full min-w-0">
            {/* Context Tabs Header */}
            <div className="flex gap-2 mb-8 bg-surface-mid/50 p-1 w-fit border border-white/5 rounded-2xl relative overflow-hidden pointer-events-auto">
              {(['buy', 'rent', 'swap', 'upcycle'] as const).map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`relative z-10 px-8 py-3 rounded-xl font-heading font-bold text-sm tracking-widest uppercase transition-colors duration-300 ${activeTab === tab ? 'text-black' : 'text-muted hover:text-white'}`}
                >
                  {activeTab === tab && (
                    <motion.div layoutId="mkt-tab-pill" className="absolute inset-0 bg-neon-green -z-10 rounded-xl max-w-full shadow-[0_0_15px_rgba(57,255,20,0.3)]" />
                  )}
                  {tab}
                </button>
              ))}
            </div>

            {/* Grid */}
            {filtered.length > 0 ? (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-5">
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
                <h3 className="font-heading text-lg font-semibold mb-2">{t('mkt_empty')}</h3>
                <p className="text-sm text-muted mb-6">{t('mkt_empty_desc')}</p>
                <button
                  onClick={() => { setFilters({ category: 'all', distance: 25, priceRange: [0, 500], rating: 0, availability: false, sortBy: 'newest' }); setSearch(''); }}
                  className="px-4 py-2 text-sm font-heading font-semibold tracking-wider text-neon-green border border-neon-green/30 rounded-xl hover:bg-neon-green/5 transition-colors"
                >
                  {t('mkt_clear')}
                </button>
              </motion.div>
            )}

            {/* Listing count */}
            {filtered.length > 0 && (
              <div className="mt-8 text-center text-xs text-muted-dim font-heading tracking-wider">
                {t('mkt_showing').replace('{filtered}', filtered.length.toString()).replace('{total}', listings.length.toString())}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Detail Modal */}
      <DetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />

      <Testimonials />
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<div className="min-h-screen pt-32 pb-20 flex justify-center items-center"><div className="w-8 h-8 rounded-full border-4 border-neon-green/30 border-t-neon-green animate-spin" /></div>}>
      <MarketplaceContent />
    </Suspense>
  );
}
