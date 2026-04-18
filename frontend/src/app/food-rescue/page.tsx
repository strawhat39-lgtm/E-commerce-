'use client';

import dynamic from 'next/dynamic';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

// Use dynamic import to prevent SSR issues with Leaflet
const RescueMap = dynamic(() => import('@/components/food-rescue/RescueMap'), { 
  ssr: false,
  loading: () => <div className="w-full h-full bg-surface flex items-center justify-center animate-pulse"><span className="text-xl font-heading tracking-widest text-muted">BOOTING SATELLITES...</span></div>
});

const MOCK_RESTAURANTS = [
  { id: 'r1', name: 'Downtown Bakery', quantity: '15 Loaves of Bread', expiry: '2 hours left', lat: 51.505, lng: -0.09, status: 'Available' },
  { id: 'r2', name: 'Green Cafe', quantity: '8 Veggie Wraps', expiry: '45 mins left', lat: 51.51, lng: -0.1, status: 'Available' },
  { id: 'r3', name: 'Pasta House', quantity: '5kg Raw Semolina', expiry: 'Claimed', lat: 51.49, lng: -0.08, status: 'Claimed' }
];

const MOCK_SHELTERS = [
  { id: 's1', name: 'City Hope Center', capacity: 'High Need (50+ ppl)', distance: '1.2 miles', lat: 51.515, lng: -0.09 },
  { id: 's2', name: 'Safe Haven Mission', capacity: 'Moderate Need', distance: '3.4 miles', lat: 51.495, lng: -0.11 }
];

export default function FoodRescuePage() {
  const [activeTab, setActiveTab] = useState<'restaurants' | 'shelters'>('restaurants');

  const mapMarkers = [
    ...MOCK_RESTAURANTS.map(r => ({ id: r.id, lat: r.lat, lng: r.lng, type: 'restaurant' as const, name: r.name, detail: r.quantity })),
    ...MOCK_SHELTERS.map(s => ({ id: s.id, lat: s.lat, lng: s.lng, type: 'shelter' as const, name: s.name, detail: s.capacity }))
  ];

  return (
    <div className="min-h-screen bg-background text-white pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 h-[calc(100vh-8rem)] flex flex-col lg:flex-row gap-6">
        
        {/* Left Side: Listing UI */}
        <div className="w-full lg:w-1/3 flex flex-col h-full gap-4 relative z-20">
          <div>
            <h1 className="font-heading text-4xl font-bold mb-2">Food Rescue Map</h1>
            <p className="text-muted text-sm mb-6">Connect surplus food with those who need it instantly.</p>
            
            <div className="flex bg-surface-high/50 p-1 rounded-xl glass border border-white/5 w-full mb-4">
              <button 
                onClick={() => setActiveTab('restaurants')}
                className={`flex-1 py-2 text-xs font-heading font-bold tracking-widest uppercase rounded-lg transition-colors ${activeTab === 'restaurants' ? 'bg-neon-green text-black' : 'text-muted hover:text-white'}`}
              >
                Restaurants (Food)
              </button>
              <button 
                onClick={() => setActiveTab('shelters')}
                className={`flex-1 py-2 text-xs font-heading font-bold tracking-widest uppercase rounded-lg transition-colors ${activeTab === 'shelters' ? 'bg-[#0DFFC6] text-black' : 'text-muted hover:text-white'}`}
              >
                Shelters (Need)
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
            <AnimatePresence mode="popLayout">
              {activeTab === 'restaurants' && MOCK_RESTAURANTS.map(r => (
                <motion.div key={r.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden group">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="font-bold text-lg">{r.name}</h3>
                    <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded ${r.status === 'Available' ? 'bg-neon-green/20 text-neon-green border border-neon-green/30' : 'bg-white/10 text-muted border border-white/10'}`}>
                      {r.status}
                    </span>
                  </div>
                  <div className="space-y-1 mb-4">
                    <p className="text-sm font-heading tracking-wider"><span className="text-muted-dim">Qty:</span> {r.quantity}</p>
                    <p className="text-sm font-heading tracking-wider"><span className="text-muted-dim">Time Left:</span> <span className={r.status === 'Available' ? "text-accent-orange" : ""}>{r.expiry}</span></p>
                  </div>
                  <button disabled={r.status !== 'Available'} className="w-full py-2.5 bg-surface-high hover:bg-neon-green hover:text-black border border-white/10 hover:border-transparent text-white font-heading font-bold tracking-widest uppercase text-xs rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                     {r.status === 'Available' ? 'Request Pickup' : 'Already Claimed'}
                  </button>
                </motion.div>
              ))}

              {activeTab === 'shelters' && MOCK_SHELTERS.map(s => (
                <motion.div key={s.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="glass rounded-2xl p-5 border border-white/5 relative overflow-hidden">
                  <div className="flex justify-between items-start mb-3">
                     <h3 className="font-bold text-lg">{s.name}</h3>
                     <span className="text-accent-teal text-xl">🏥</span>
                  </div>
                  <div className="space-y-1 mb-4">
                     <p className="text-sm font-heading tracking-wider"><span className="text-muted-dim">Distance:</span> {s.distance}</p>
                     <p className="text-sm font-heading tracking-wider"><span className="text-muted-dim">Status:</span> <span className="text-accent-teal">{s.capacity}</span></p>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right Side: Map */}
        <div className="w-full lg:w-2/3 h-full rounded-2xl overflow-hidden glass p-2">
           <RescueMap markers={mapMarkers} />
        </div>

      </div>
    </div>
  );
}
