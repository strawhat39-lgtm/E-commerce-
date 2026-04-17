'use client';

import { motion } from 'framer-motion';
import { ListingItem } from '@/types';
import ListingCard from '../marketplace/ListingCard';

interface BuyModeViewProps {
  items: ListingItem[];
  userTier: string;
  onAction?: (points: number) => void;
}

export default function BuyModeView({ items, userTier, onAction }: BuyModeViewProps) {
  return (
    <div className="space-y-8 pb-10">
      {/* Comparison Widget */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl p-6 relative overflow-hidden group"
      >
        <div className="absolute top-0 right-0 p-4 opacity-10 blur-xl pointer-events-none group-hover:bg-neon-green/30 transition-colors duration-500">
          <div className="w-32 h-32 rounded-full bg-neon-green" />
        </div>
        
        <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
          <span>⚖️</span> Impact Comparison
        </h3>
        <p className="text-sm text-muted mb-6">
          You are currently viewing a standard iPhone 13. By switching to a refurbished eco-certified alternative, you can drastically reduce your e-waste footprint.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-6 p-4 rounded-xl bg-surface-high/30 border border-white/5">
          <div className="flex-1 text-center sm:text-left">
            <span className="text-xs font-heading font-semibold text-muted-dim tracking-widest uppercase">Standard Choice</span>
            <div className="font-heading text-xl font-bold mt-1 text-accent-red">78kg CO₂</div>
            <div className="text-xs text-muted mt-1">$450.00</div>
          </div>
          
          <div className="text-muted-dim text-sm font-heading tracking-widest hidden sm:block">VS</div>
          
          <div className="flex-1 text-center sm:text-right mt-4 sm:mt-0">
            <span className="text-xs font-heading font-semibold text-neon-green tracking-widest uppercase bg-neon-green/10 px-2 py-1 rounded">Eco Alternative</span>
            <div className="font-heading text-xl font-bold mt-1 text-neon-green">12kg CO₂</div>
            <div className="text-xs text-muted mt-1">$380.00 <span className="text-neon-green">(-15%)</span></div>
          </div>
        </div>

        <button 
          onClick={() => onAction && onAction(150)}
          className="w-full mt-6 py-3 font-heading text-sm font-bold tracking-widest uppercase bg-neon-green text-black rounded-xl hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all hover:scale-[1.01] active:scale-[0.98]"
        >
          Switch to Green & Earn 150 Pts
        </button>
      </motion.div>

      {/* Product Grid */}
      <div>
        <h3 className="font-heading text-lg font-bold mb-4 flex items-center gap-2">
          <span>🛍️</span> Recommended for You
        </h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <ListingCard 
              key={item.id} 
              item={item} 
              userTier={userTier}
              onAction={() => onAction && onAction(50)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
