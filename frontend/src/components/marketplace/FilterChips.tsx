'use client';

import { ListingType } from '@/types';

const filters: { value: ListingType | 'all'; label: string; icon: string }[] = [
  { value: 'all', label: 'All', icon: '🌍' },
  { value: 'swap', label: 'Swap & Rent', icon: '🔄' },
  { value: 'food', label: 'Food Rescue', icon: '🍱' },
  { value: 'upcycle', label: 'Upcycling', icon: '🔧' },
];

export default function FilterChips({
  active,
  onChange,
}: {
  active: ListingType | 'all';
  onChange: (type: ListingType | 'all') => void;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {filters.map((f) => (
        <button
          key={f.value}
          onClick={() => onChange(f.value)}
          className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-heading font-medium tracking-wide transition-all duration-200 ${
            active === f.value
              ? 'bg-neon-green text-black shadow-[0_0_15px_rgba(57,255,20,0.2)]'
              : 'glass text-muted hover:text-white hover:border-white/15'
          }`}
        >
          <span className="text-base">{f.icon}</span>
          {f.label}
        </button>
      ))}
    </div>
  );
}
