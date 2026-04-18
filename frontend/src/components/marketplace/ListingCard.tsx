'use client';

import { ListingItem } from '@/types';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';
import { addToWishlist, removeFromWishlist, isInWishlist } from '@/utils/wishlist';
import { useCurrency } from '@/context/CurrencyContext';

  // specific types configuration
const typeConfig: Record<string, { color: string; label: string; badge: string }> = {
  swap: { color: '#39FF14', label: '♻️ Swap', badge: 'SWAP' },
  rent: { color: '#0DFFC6', label: '📦 Rent', badge: 'RENT' },
  food: { color: '#FF6B35', label: '🍱 Rescue', badge: 'FOOD' },
  upcycle: { color: '#BF5AF2', label: '🔧 Upcycle', badge: 'UPCYCLE' },
  buy: { color: '#FFC800', label: '🛍️ Buy Mode', badge: 'BUY' },
};

import { API_URL } from '@/utils/api';

export default function ListingCard({ item, onClick, onAction, userTier, index = 0 }: { item: ListingItem & { distance?: string, trustRating?: number, ecoNote?: string, swapFor?: string }, onClick?: () => void; onAction?: () => void; userTier?: string; index?: number }) {
  const { formatPrice } = useCurrency();
  const config = typeConfig[item.type] || typeConfig['buy'];
  const isLocked = item.isEarlyAccess && userTier === 'bronze'; // mock logic

  const [wishlisted, setWishlisted] = useState(false);

  useEffect(() => {
    setWishlisted(isInWishlist(item.id));
  }, [item.id]);

  const toggleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!localStorage.getItem('reuse_mart_current_user')) {
      alert('Please log in first to use the wishlist!');
      window.location.href = '/login';
      return;
    }
    
    if (wishlisted) {
      removeFromWishlist(item.id);
      setWishlisted(false);
    } else {
      addToWishlist(item);
      setWishlisted(true);
    }
  };

  let imgSrc = item.image || item.image_url || item.imageUrl || '';
  if (imgSrc && imgSrc.startsWith('/')) {
    imgSrc = `${API_URL.replace('/api', '')}${imgSrc}`;
  }

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
      <div className="relative h-48 bg-surface-high flex items-center justify-center overflow-hidden">
        {imgSrc ? (
          <img 
            src={imgSrc} 
            alt={item.title}
            className="absolute inset-0 w-full h-full object-cover bg-black/40 backdrop-blur-sm"
            onError={(e) => {
              // fallback if external fails
              if(!e.currentTarget.src.includes('placehold.co')) {
                e.currentTarget.src = `https://placehold.co/400x300/1a1a1a/39ff14?text=${encodeURIComponent(item.title)}`;
              }
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-surface-mid to-surface-high flex items-center justify-center">
            <span className="text-5xl opacity-30">{typeConfig[item.type]?.label.split(' ')[0]}</span>
          </div>
        )}

        <div 
          className="absolute top-3 right-3 p-2 z-30"
          onClick={toggleWishlist}
        >
          <div className={`w-8 h-8 rounded-full flex items-center justify-center backdrop-blur-md transition-all ${wishlisted ? 'bg-[#FF69B4]/20 border border-[#FF69B4]/50' : 'bg-black/30 border border-white/10 hover:bg-white/10'}`}>
             <svg width="16" height="16" viewBox="0 0 24 24" fill={wishlisted ? '#FF69B4' : 'none'} stroke={wishlisted ? '#FF69B4' : 'white'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
             </svg>
          </div>
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
          <div className="flex flex-col items-end">
            {item.price && !item.rentPrice && !item.estimatedValue && (
              <span className="font-heading text-sm font-bold text-neon-green whitespace-nowrap">
                {formatPrice(item.price)}
              </span>
            )}
            {item.estimatedValue && (
              <span className="font-heading text-sm font-bold text-accent-gold whitespace-nowrap">
                {formatPrice(item.estimatedValue)}
              </span>
            )}
            {item.rentPrice && (
              <span className="font-heading text-sm font-bold text-accent-teal whitespace-nowrap">
                {formatPrice(item.rentPrice)}/{item.rentPeriod?.replace('per ', '')}
              </span>
            )}
            {(item.estimatedValue || item.rentPrice || item.price) ? (
              <span className="text-[8px] text-muted-dim italic mt-0.5 whitespace-nowrap">Includes platform fee</span>
            ) : null}
          </div>
        </div>

        <p className="text-xs text-muted line-clamp-2 mb-3 leading-relaxed">
          {item.description?.replace(/\[S_NAME:.*?\]|\[S_WA:.*?\]|\[S_LOC:.*?\]/g, '')}
        </p>

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
        {item.type === 'upcycle' && (
          <div className="mt-3 pt-3 border-t border-white/5 pb-2">
            <div className="flex flex-col gap-2">
              <span className="text-[10px] font-heading font-semibold uppercase tracking-widest text-[#BF5AF2]">
                Can be reused into: Bags / Art / Parts
              </span>
              <span className="text-[10px] bg-[#BF5AF2]/10 border border-[#BF5AF2]/20 text-[#BF5AF2] px-2 py-1 rounded inline-block w-fit">
                ♻️ Prevented landfill waste
              </span>
            </div>
            {item.reusePotential && (
              <div className="mt-3">
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
          </div>
        )}

        {/* Shared Context Info */}
        {(item.ecoNote || item.trustRating) && (
          <div className="mt-3 pt-3 border-t border-white/5 flex flex-col gap-1.5">
            {item.ecoNote && (
              <div className="flex items-center gap-1.5 text-neon-green">
                <span className="text-xs">🌱</span>
                <span className="text-[10px] font-heading font-semibold tracking-wider">{item.ecoNote}</span>
              </div>
            )}
            
            {/* Swap & Rent Custom Injection */}
            {item.type === 'swap' && item.swapFor && (
               <div className="flex items-center gap-1.5 text-accent-teal mt-1">
                 <span className="text-xs">🔄</span>
                 <span className="text-[10px] font-heading tracking-widest uppercase font-bold">Wants: {item.swapFor}</span>
               </div>
            )}

            <div className="flex items-center justify-between mt-2">
              {item.type === 'rent' ? (
                <span className="flex text-accent-gold text-xs">
                  {Array.from({ length: 5 }).map((_, r) => (
                    <span key={r} className={r < (item.trustRating || 0) ? 'opacity-100' : 'opacity-30'}>★</span>
                  ))}
                  <span className="text-muted ml-1 font-sans">{item.trustRating?.toFixed(1)}</span>
                </span>
              ) : <div />}
              
              {/* Call to Actions logic */}
              {item.type === 'rent' && (
                <button className="px-3 py-1.5 bg-accent-teal/10 text-accent-teal border border-accent-teal/30 hover:bg-accent-teal/20 text-[10px] font-heading font-bold tracking-widest rounded transition-colors">
                  RENT OUT
                </button>
              )}
              {item.type === 'swap' && (
                <button className="px-3 py-1.5 bg-neon-green/10 text-neon-green border border-neon-green/30 hover:bg-neon-green/20 text-[10px] font-heading font-bold tracking-widest rounded transition-colors">
                  PROPOSE SWAP
                </button>
              )}
              {item.type === 'buy' && (
                <button className="px-3 py-1.5 bg-white/5 text-white border border-white/10 hover:bg-white/10 text-[10px] font-heading font-bold tracking-widest rounded transition-colors">
                  PURCHASE
                </button>
              )}
              {item.type === 'upcycle' && (
                <button className="px-3 py-1.5 bg-[#BF5AF2]/10 text-[#BF5AF2] border border-[#BF5AF2]/30 hover:bg-[#BF5AF2]/20 text-[10px] font-heading font-bold tracking-widest rounded transition-colors">
                  CONNECT WITH CREATOR
                </button>
              )}
            </div>
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
