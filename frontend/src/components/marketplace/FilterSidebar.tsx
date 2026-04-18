import { motion, AnimatePresence } from 'framer-motion';

export interface FilterState {
  category: string;
  distance: number;
  priceRange: [number, number];
  rating: number;
  availability: boolean;
  sortBy: string;
}

interface FilterSidebarProps {
  filters: FilterState;
  setFilters: (val: FilterState | ((prev: FilterState) => FilterState)) => void;
  isOpen: boolean;
  onClose: () => void;
}

export default function FilterSidebar({ filters, setFilters, isOpen, onClose }: FilterSidebarProps) {

  const updateFilter = (key: keyof FilterState, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const SidebarContent = () => (
    <div className="flex flex-col space-y-6 w-full p-5 sm:p-0">

      {/* Category */}
      <div>
        <h4 className="font-heading font-semibold text-sm tracking-widest uppercase mb-4 text-neon-green">Category</h4>
        <select
          value={filters.category}
          onChange={(e) => updateFilter('category', e.target.value)}
          className="w-full bg-surface-mid border border-white/10 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-neon-green/50 text-white"
        >
          <option value="all">All Categories</option>
          <option value="apparel">Apparel & Fashion</option>
          <option value="electronics">Electronics</option>
          <option value="furniture">Furniture</option>
          <option value="tools">Tools & Hardware</option>
          <option value="food">Rescued Food</option>
          <option value="materials">Raw Materials (Upcycle)</option>
          <option value="textile waste">Textile Waste</option>
          <option value="electronic waste">Electronic Waste</option>
        </select>
      </div>

      {/* Distance */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h4 className="font-heading font-semibold text-sm tracking-widest uppercase text-neon-green">Distance</h4>
          <span className="text-xs text-muted font-bold">{filters.distance} miles</span>
        </div>
        <input
          type="range"
          min="1" max="50"
          value={filters.distance}
          onChange={(e) => updateFilter('distance', parseInt(e.target.value))}
          className="w-full accent-neon-green"
        />
      </div>

      {/* Price Range */}
      <div>
        <h4 className="font-heading font-semibold text-sm tracking-widest uppercase mb-4 text-neon-green">Max Price</h4>
        <input
          type="range"
          min="0" max="500" step="10"
          value={filters.priceRange[1]}
          onChange={(e) => updateFilter('priceRange', [0, parseInt(e.target.value)])}
          className="w-full accent-neon-green"
        />
        <div className="flex justify-between text-xs text-muted mt-2 font-bold">
          <span>Free</span>
          <span>${filters.priceRange[1]}</span>
        </div>
      </div>



      {/* Availability */}
      <label className="flex items-center gap-3 cursor-pointer group">
        <div className={`w-10 h-5 rounded-full relative transition-colors duration-300 ${filters.availability ? 'bg-neon-green' : 'bg-surface-high'}`}>
          <div className={`w-4 h-4 bg-black rounded-full absolute top-0.5 transition-all duration-300 ${filters.availability ? 'left-5.5' : 'left-0.5'}`} style={{ transform: filters.availability ? 'translateX(20px)' : 'translateX(0)' }} />
        </div>
        <span className="font-heading font-semibold text-sm text-white group-hover:text-neon-green transition-colors">Show Available Only</span>
      </label>

      {/* Sort By */}
      <div>
        <h4 className="font-heading font-semibold text-sm tracking-widest uppercase mb-4 text-neon-green">Sort By</h4>
        <div className="flex flex-col gap-2">
          {[
            { id: 'nearest', label: '📍 Nearest' },
            { id: 'cheapest', label: '💰 Cheapest' },
            { id: 'highest-rated', label: '⭐ Highest Rated' },
            { id: 'newest', label: '✨ Newest' },
          ].map(opt => (
            <button
              key={opt.id}
              onClick={() => updateFilter('sortBy', opt.id)}
              className={`text-left px-4 py-2.5 rounded-lg text-sm font-semibold transition-all ${filters.sortBy === opt.id ? 'bg-neon-green/10 text-neon-green border border-neon-green/30' : 'text-muted hover:bg-white/5 border border-transparent'}`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop View */}
      <div className="hidden lg:block w-64 sticky top-28 h-max glass border border-white/5 rounded-2xl overflow-hidden self-start">
        <div className="p-5 border-b border-white/5">
          <h3 className="font-heading text-lg font-bold">Filters</h3>
        </div>
        <SidebarContent />
      </div>

      {/* Mobile Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={onClose}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 lg:hidden"
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed top-0 left-0 bottom-0 w-[85vw] max-w-sm bg-surface-low border-r border-white/10 z-[60] lg:hidden overflow-y-auto shadow-2xl"
            >
              <div className="sticky top-0 bg-surface-low/95 backdrop-blur-md p-6 border-b border-white/5 flex items-center justify-between z-10">
                <h3 className="font-heading text-xl font-bold">Filters</h3>
                <button onClick={onClose} className="p-2 text-muted hover:text-white bg-white/5 rounded-full">
                  ✕
                </button>
              </div>
              <SidebarContent />
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
