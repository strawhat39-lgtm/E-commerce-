'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

import { getWishlistItems, removeFromWishlist } from '@/utils/wishlist';
import { ListingItem } from '@/types';
import { useCurrency } from '@/context/CurrencyContext';

export default function WishlistPage() {
  const { formatPrice } = useCurrency();
  const [items, setItems] = useState<ListingItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Client-side hydration from localstorage
    setItems(getWishlistItems());
    setIsMounted(true);
  }, []);

  const handleRemove = (id: string | number) => {
    removeFromWishlist(id);
    setItems(getWishlistItems());
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background text-white pt-24 pb-20 custom-scrollbar">
      <div className="section-container max-w-5xl">
        <h1 className="font-heading text-4xl md:text-5xl font-bold mb-4 tracking-tight">Your Wishlist</h1>
        <p className="text-muted text-lg mb-10">Items you've favorited to review later.</p>

        {items.length === 0 ? (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass rounded-3xl p-12 text-center border border-white/5"
          >
            <div className="w-24 h-24 bg-surface-high rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-4xl">❤️</span>
            </div>
            <h2 className="font-heading text-2xl font-bold mb-4 text-neon-green">Your Wishlist is Empty</h2>
            <p className="text-muted max-w-sm mx-auto mb-8">Save items you love and keep track of your favorite sustainable finds from our marketplace.</p>
            <Link 
              href="/marketplace" 
              className="inline-flex items-center justify-center gap-2 px-8 py-4 font-heading text-sm font-bold tracking-widest uppercase bg-neon-green text-black rounded-xl hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] transition-all"
            >
              Explore Marketplace
            </Link>
          </motion.div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-3 space-y-4">
              <AnimatePresence>
                {items.map(item => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-6 border border-white/5 group transition-colors hover:bg-white/5"
                  >
                    <div className="w-full sm:w-40 h-32 rounded-xl overflow-hidden bg-surface-high flex-shrink-0 relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={item.image || item.image_url || item.imageUrl || `https://placehold.co/400x300/1a1a1a/39ff14?text=${encodeURIComponent(item.title)}`} alt={item.title} className="w-full h-full object-cover" />
                      <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm px-2 py-1 rounded text-[10px] font-heading font-bold uppercase tracking-widest text-[#FF69B4]">Wishlisted</div>
                    </div>
                    
                    <div className="flex-1 w-full sm:w-auto">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="text-xs text-neon-green font-bold px-2 py-0.5 rounded bg-neon-green/10 border border-neon-green/20 uppercase tracking-wider">{item.type}</span>
                        <span className="text-xs text-muted-dim font-bold tracking-wider uppercase">{item.category}</span>
                      </div>
                      <h3 className="font-heading text-xl font-bold mb-2">{item.title}</h3>
                      <div className="flex items-center gap-4 text-sm font-bold">
                        {item.price && <span>{formatPrice(item.price)}</span>}
                        {item.rentPrice && <span>{formatPrice(item.rentPrice)}{item.rentPeriod}</span>}
                        <span className="text-[#0DFFC6] flex items-center gap-1">★ {item.matchRating}% Match</span>
                      </div>
                    </div>

                    <div className="flex sm:flex-col gap-2 w-full sm:w-auto mt-4 sm:mt-0">
                        <button 
                          onClick={() => {
                             // Assuming adding to cart logic...
                             alert('Item moved to Cart!');
                          }}
                          className="flex-1 sm:flex-none uppercase font-heading text-[10px] tracking-widest font-bold bg-[#FFD700] text-black px-6 py-3 rounded-xl hover:bg-[#FFEAA7] hover:shadow-[0_0_15px_rgba(255,215,0,0.5)] transition-all"
                        >
                          Add to Cart
                        </button>
                        <button 
                          onClick={() => handleRemove(item.id)}
                          className="flex-1 sm:flex-none uppercase font-heading text-[10px] tracking-widest font-bold bg-surface-mid text-muted px-6 py-3 rounded-xl hover:bg-red-500/20 hover:text-red-400 border border-white/5 transition-all text-center"
                        >
                          Remove
                        </button>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
