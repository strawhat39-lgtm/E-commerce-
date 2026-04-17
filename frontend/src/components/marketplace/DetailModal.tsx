'use client';

import { ListingItem } from '@/types';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { addToCart } from '@/utils/cart';

const typeConfig: Record<string, { color: string; actionLabel: string }> = {
  swap: { color: '#39FF14', actionLabel: 'Request Swap' },
  rent: { color: '#0DFFC6', actionLabel: 'Rent Now' },
  food: { color: '#FF6B35', actionLabel: 'Claim Pickup' },
  upcycle: { color: '#BF5AF2', actionLabel: 'Claim Material' },
  buy: { color: '#FFE033', actionLabel: 'Purchase' },
};

export default function DetailModal({
  item,
  onClose,
}: {
  item: ListingItem | null;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!item) return null;
  const config = typeConfig[item.type];

  // Specific buy handlers
  const handleAddToCart = () => {
    addToCart(item);
    alert('Added to cart!');
  };

  const handleBuyNow = () => {
    addToCart(item);
    router.push('/cart');
  };

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          onClick={onClose}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg glass rounded-2xl overflow-hidden z-10"
          >
            {/* Top accent */}
            <div className="h-1" style={{ background: `linear-gradient(90deg, ${config.color}, transparent)` }} />

            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 w-8 h-8 rounded-lg bg-surface-high flex items-center justify-center text-muted hover:text-white transition-colors z-10"
            >
              ✕
            </button>

            {/* Image */}
            <div className="relative h-56 bg-surface-high flex items-center justify-center overflow-hidden">
              {item.image ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
              ) : (
                <span className="text-6xl opacity-20">
                  {item.type === 'swap' ? '🔄' : item.type === 'rent' ? '📦' : item.type === 'food' ? '🍱' : '🔧'}
                </span>
              )}
            </div>

            {/* Content */}
            <div className="p-6">
              {/* Type + Category */}
              <div className="flex items-center gap-2 mb-3">
                <span
                  className="text-[10px] font-heading font-bold tracking-[2px] px-2.5 py-1 rounded"
                  style={{
                    background: `${config.color}15`,
                    color: config.color,
                    border: `1px solid ${config.color}30`,
                  }}
                >
                  {item.type.toUpperCase()}
                </span>
                <span className="text-xs text-muted">{item.category}</span>
                {item.trustBadge && (
                  <span className="ml-auto text-[10px] font-heading font-bold text-neon-green">✓ VERIFIED</span>
                )}
              </div>

              <h2 className="font-heading text-xl font-bold mb-2">{item.title}</h2>
              <p className="text-sm text-muted leading-relaxed mb-5">{item.description}</p>

              {/* Details grid */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                {item.location && (
                  <DetailRow label="Location" value={item.location} />
                )}
                {item.condition && (
                  <DetailRow label="Condition" value={item.condition} />
                )}
                {item.distance && (
                  <DetailRow label="Distance" value={item.distance} />
                )}
                {item.swapFor && (
                  <DetailRow label="Looking For" value={item.swapFor} />
                )}
                {item.rentPrice && (
                  <DetailRow label="Rent Rate" value={`$${item.rentPrice} ${item.rentPeriod}`} />
                )}
                {item.quantity && (
                  <DetailRow label="Quantity" value={item.quantity} />
                )}
                {item.pickupWindow && (
                  <DetailRow label="Pickup" value={item.pickupWindow} />
                )}
                {item.materialType && (
                  <DetailRow label="Material" value={item.materialType} />
                )}
                {item.weight && (
                  <DetailRow label="Weight" value={item.weight} />
                )}
                {item.reusePotential && (
                  <DetailRow label="Reuse Potential" value={`${item.reusePotential}%`} />
                )}
              </div>

              {/* Impact estimate */}
              <div className="glass rounded-xl p-4 mb-5">
                <span className="text-xs font-heading tracking-widest uppercase text-muted-dim">Estimated Impact</span>
                <div className="flex items-center gap-4 mt-2">
                  <span className="text-sm">🌱 Saves ~{(Math.random() * 5 + 1).toFixed(1)}kg CO₂</span>
                  <span className="text-sm">♻️ Diverts ~{(Math.random() * 3 + 0.5).toFixed(1)}kg waste</span>
                </div>
              </div>

              {/* User */}
              <div className="flex items-center gap-3 mb-5 pb-5 border-b border-white/5">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-xs font-heading font-bold text-black"
                  style={{ background: config.color }}
                >
                  {item.userAvatar}
                </div>
                <div>
                  <span className="text-sm font-semibold">{item.userName}</span>
                  <span className="block text-xs text-muted-dim">Listed {item.createdAt}</span>
                </div>
              </div>

              {/* Action */}
              {item.type === 'buy' ? (
                <div className="flex gap-4">
                  <button
                    onClick={handleAddToCart}
                    className="flex-1 py-3.5 rounded-xl font-heading text-sm font-bold tracking-wider uppercase text-white glass border border-white/20 transition-all duration-300 hover:bg-white/10"
                  >
                    Add to Cart
                  </button>
                  <button
                    onClick={handleBuyNow}
                    className="flex-1 py-3.5 rounded-xl font-heading text-sm font-bold tracking-wider uppercase text-black transition-all duration-300 hover:-translate-y-0.5 shadow-[0_0_20px_rgba(255,224,51,0.3)]"
                    style={{ background: config.color }}
                  >
                    Buy Now
                  </button>
                </div>
              ) : (
                <button
                  className="w-full py-3.5 rounded-xl font-heading text-sm font-bold tracking-wider uppercase text-black transition-all duration-300 hover:-translate-y-0.5"
                  style={{
                    background: config.color,
                    boxShadow: `0 0 20px ${config.color}30`,
                  }}
                >
                  {config.actionLabel}
                </button>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-surface-high rounded-lg p-3">
      <span className="text-[10px] font-heading tracking-widest uppercase text-muted-dim block">{label}</span>
      <span className="text-sm font-medium mt-0.5 block capitalize">{value}</span>
    </div>
  );
}
