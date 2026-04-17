'use client';

import { ListingItem } from '@/types';
import { motion } from 'framer-motion';

  // specific types configuration
const typeConfig: Record<string, { color: string; label: string; badge: string }> = {
  swap: { color: '#39FF14', label: '♻️ Swap', badge: 'SWAP' },
  rent: { color: '#0DFFC6', label: '📦 Rent', badge: 'RENT' },
  food: { color: '#FF6B35', label: '🍱 Rescue', badge: 'FOOD' },
  upcycle: { color: '#BF5AF2', label: '🔧 Upcycle', badge: 'UPCYCLE' },
  buy: { color: '#FFC800', label: '🛍️ Buy Mode', badge: 'ECO BUY' },
};

export default function ListingCard({ item, onClick, onAction, userTier, index = 0 }: { item: ListingItem; onClick?: () => void; onAction?: () => void; userTier?: string; index?: number }) {
  const config = typeConfig[item.type];
  const isLocked = item.isEarlyAccess && userTier === 'bronze'; // mock logic

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.4 }}
      onClick={isLocked ? undefined : (onClick || onAction)}
      className={`glass-hover rounded-2xl overflow-hidden group relative ${isLocked ? 'cursor-not-allowed border-white/5 opacity-80' : 'cursor-pointer'}`}
    >
      {/* Locked Overlay for Early Access */}
      {isLocked && (
        <div className="absolute inset-0 z-50 backdrop-blur-[2px] bg-black/40 flex flex-col items-center justify-center p-4">
          <span className="text-3xl mb-2">🔒</span>
          <span className="text-xs font-heading tracking-widest text-accent-gold uppercase font-bold text-center">
            {item.tierRequirement} Tier Exclusive
          </span>
          <span className="text-[10px] text-muted mt-1">Upgrade to unlock early access</span>
        </div>
      )}

      {/* Image */}
      <div className="relative h-48 bg-surface-high overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-surface-mid to-surface-high flex items-center justify-center">
          <span className="text-5xl opacity-30">{typeConfig[item.type]?.label.split(' ')[0]}</span>
        </div>

        {/* Type badge */}
        <span
          className="absolute top-3 left-3 text-[10px] font-heading font-bold tracking-[2px] px-2.5 py-1 rounded-md z-10"
          style={{
            background: `${config.color}15`,
            color: config.color,
            border: `1px solid ${config.color}30`,
          }}
        >
          {config.badge}
        </span>

        {/* Urgency badge for food */}
        {item.type === 'food' && item.urgency && (
          <span className={`absolute top-3 right-3 text-[10px] font-heading font-bold tracking-[2px] px-2.5 py-1 rounded-md urgency-${item.urgency}`}>
            {item.urgency.toUpperCase()}
          </span>
        )}

        {/* Discount badge for buy */}
        {item.type === 'buy' && item.discountApplied && (
          <span className="absolute top-3 right-3 text-[10px] font-heading font-bold tracking-[2px] px-2.5 py-1 rounded-md bg-accent-gold text-black">
            -{item.discountApplied}% OFF
          </span>
        )}

        {/* Trust badge */}
        {item.trustBadge && (
          <span className="absolute bottom-3 right-3 text-[10px] font-heading font-bold tracking-wider px-2 py-0.5 rounded bg-neon-green/15 text-neon-green border border-neon-green/20 z-10">
            ✓ VERIFIED
          </span>
        )}

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          <h3 className="font-heading text-base font-semibold group-hover:text-neon-green transition-colors line-clamp-1">
            {item.title}
          </h3>
          {item.estimatedValue && (
            <span className="font-heading text-sm font-bold text-accent-gold whitespace-nowrap">
              ${item.estimatedValue}
            </span>
          )}
          {item.rentPrice && (
            <span className="font-heading text-sm font-bold text-accent-teal whitespace-nowrap">
              ${item.rentPrice}/{item.rentPeriod?.replace('per ', '')}
            </span>
          )}
        </div>

        <p className="text-xs text-muted line-clamp-2 mb-3 leading-relaxed">{item.description}</p>

        {/* Meta row */}
        <div className="flex items-center gap-3 text-xs text-muted-dim">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: config.color }} />
            {item.category}
          </span>
          {item.distance && (
            <span>📍 {item.distance}</span>
          )}
          {item.condition && (
            <span className="capitalize">{item.condition}</span>
          )}
        </div>

        {/* Food specific */}
        {item.type === 'food' && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between text-xs">
            <span className="text-muted">{item.quantity}</span>
            <span className="text-accent-orange font-heading font-semibold">🕐 {item.pickupWindow}</span>
          </div>
        )}

        {/* Upcycle specific */}
        {item.type === 'upcycle' && item.reusePotential && (
          <div className="mt-3 pt-3 border-t border-white/5">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-muted-dim">Reuse Potential</span>
              <span className="font-heading font-semibold text-accent-purple">{item.reusePotential}%</span>
            </div>
            <div className="w-full h-1.5 bg-surface-high rounded-full overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-accent-purple to-neon-green"
                style={{ width: `${item.reusePotential}%` }}
              />
            </div>
          </div>
        )}

        {/* Buy Mode specific (Eco Score) */}
        {item.type === 'buy' && item.ecoScore && (
          <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
             <div className="flex items-center gap-1.5">
               <span className="text-[10px] text-muted-dim font-heading uppercase tracking-wider">Eco Score</span>
               <div className="px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green text-[10px] font-bold border border-neon-green/20">
                 {item.ecoScore}/100
               </div>
             </div>
             <span className="text-[10px] text-accent-teal uppercase tracking-widest font-heading font-bold">🌿 Eco Alternative</span>
          </div>
        )}

        {/* Footer */}
        <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div
              className="w-6 h-6 rounded-full flex items-center justify-center text-[9px] font-heading font-bold text-black"
              style={{ background: config.color }}
            >
              {item.userAvatar}
            </div>
            <span className="text-xs text-muted">{item.userName}</span>
          </div>
          <span className="text-xs text-muted-dim">{item.location.split(',')[0]}</span>
        </div>
      </div>
    </motion.div>
  );
}
