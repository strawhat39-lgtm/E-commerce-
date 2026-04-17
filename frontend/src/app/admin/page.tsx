'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { listings as mockListings, impactStats as mockStats } from '@/data/mock-data';
import { fetchFromApi } from '@/utils/api';

const defaultRecentClaims = [
  { user: 'Harlem Community Shelter', item: 'Mixed Salad Bowls (x8)', type: 'food', time: '2h ago', status: 'completed' },
  { user: 'Sarah K.', item: 'Vintage Desk Lamp', type: 'swap', time: '4h ago', status: 'completed' },
  { user: 'Urban Craft Studio', item: 'Denim Fabric Scraps', type: 'upcycle', time: '6h ago', status: 'pending' },
  { user: 'Brooklyn Food Bank', item: '12 Fresh Bagels', type: 'food', time: '8h ago', status: 'completed' },
  { user: 'Mike T.', item: 'Power Drill Set', type: 'rent', time: '1d ago', status: 'active' },
];

const statusColors: Record<string, string> = {
  completed: 'text-neon-green bg-neon-green/10',
  pending: 'text-accent-gold bg-accent-gold/10',
  active: 'text-accent-teal bg-accent-teal/10',
};

export default function AdminPage() {
  const [impactStats, setImpactStats] = useState(mockStats);
  const [recentClaims, setRecentClaims] = useState(defaultRecentClaims);
  const [typeCount, setTypeCount] = useState({
    swap: mockListings.filter((l) => l.type === 'swap' || l.type === 'rent').length,
    food: mockListings.filter((l) => l.type === 'food').length,
    upcycle: mockListings.filter((l) => l.type === 'upcycle').length,
    total: mockListings.length
  });

  useEffect(() => {
    async function load() {
      const summary = await fetchFromApi('/admin/summary');
      if (summary) {
        setTypeCount({
          swap: summary.totalMarketplaceItems || 0,
          food: summary.totalFoodListings || 0,
          upcycle: summary.totalUpcycleMaterials || 0,
          total: (summary.totalMarketplaceItems || 0) + (summary.totalFoodListings || 0) + (summary.totalUpcycleMaterials || 0) || 1
        });
        
        const impact = await fetchFromApi('/admin/impact');
        const count = await fetchFromApi('/admin/claims/count');

        setImpactStats({
          totalListings: (summary.totalMarketplaceItems || 0) + (summary.totalFoodListings || 0) + (summary.totalUpcycleMaterials || 0),
          totalUsers: summary.totalUsers || 1,
          totalTransactions: count?.count || impactStats.totalTransactions,
          totalCO2Saved: impact?.totalCarbonSavedKg || impactStats.totalCO2Saved,
          offsetEquivalent: impact?.totalCarbonSavedKg ? `${Math.floor(impact.totalCarbonSavedKg / 20)} Trees` : impactStats.offsetEquivalent,
          totalFoodRescued: summary.totalFoodListings * 3 || impactStats.totalFoodRescued, 
          totalWasteDiverted: impact?.totalWaterSavedLiters || impactStats.totalWasteDiverted,
          totalItemsReused: (summary.totalMarketplaceItems || 0) + (summary.totalUpcycleMaterials || 0)
        });
      }
    }
    load();
  }, []);

  const adminMetrics = [
    { label: 'Total Listings', value: impactStats.totalListings, change: 12.5, icon: '📦', color: '#39FF14' },
    { label: 'Active Users', value: impactStats.totalUsers, change: 8.3, icon: '👥', color: '#0DFFC6' },
    { label: 'Transactions', value: impactStats.totalTransactions, change: 15.2, icon: '🔄', color: '#BF5AF2' },
    { label: 'CO₂ Saved (kg)', value: impactStats.totalCO2Saved, change: 22.1, icon: '🌱', color: '#FFD700' },
  ];

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-container">
        {/* Header */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-10 h-10 rounded-xl bg-accent-purple/20 border border-accent-purple/30 flex items-center justify-center">
              <span className="text-lg">⚡</span>
            </div>
            <div>
              <h1 className="font-heading text-3xl font-bold">Coordinator Panel</h1>
              <p className="text-sm text-muted">Platform overview and management</p>
            </div>
          </div>
        </motion.div>

        {/* Metrics */}
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {adminMetrics.map((m, i) => (
            <div key={i} className="glass rounded-2xl p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{m.icon}</span>
                <span className="text-[10px] font-heading font-bold tracking-wider px-2 py-0.5 rounded" style={{ color: m.color, background: `${m.color}15` }}>
                  +{m.change}%
                </span>
              </div>
              <span className="font-heading text-2xl font-bold block" style={{ color: m.color }}>
                {typeof m.value === 'number' && m.value > 999 ? m.value.toLocaleString() : m.value}
              </span>
              <span className="text-[10px] font-heading tracking-widest uppercase text-muted-dim mt-1 block">{m.label}</span>
            </div>
          ))}
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Listings breakdown */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6">
            <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-dim mb-5">Listings by Type</h3>
            <div className="space-y-4">
              {[
                { label: 'Swap & Rent', count: typeCount.swap, total: typeCount.total, color: '#39FF14' },
                { label: 'Food Rescue', count: typeCount.food, total: typeCount.total, color: '#FF6B35' },
                { label: 'Upcycling', count: typeCount.upcycle, total: typeCount.total, color: '#BF5AF2' },
              ].map((type, i) => (
                <div key={i}>
                  <div className="flex justify-between mb-1.5">
                    <span className="text-sm font-medium">{type.label}</span>
                    <span className="text-sm font-heading font-bold" style={{ color: type.color }}>{type.count}</span>
                  </div>
                  <div className="w-full h-2 bg-surface-high rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{
                        width: `${(type.count / type.total) * 100}%`,
                        background: type.color,
                        boxShadow: `0 0 10px ${type.color}30`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick stats */}
            <div className="mt-6 pt-4 border-t border-white/5 grid grid-cols-2 gap-4">
              <div className="bg-surface-high rounded-xl p-3">
                <span className="text-[10px] font-heading tracking-widest uppercase text-muted-dim block">Claim Rate</span>
                <span className="font-heading text-xl font-bold text-neon-green mt-1 block">78%</span>
              </div>
              <div className="bg-surface-high rounded-xl p-3">
                <span className="text-[10px] font-heading tracking-widest uppercase text-muted-dim block">Avg Response</span>
                <span className="font-heading text-xl font-bold text-accent-teal mt-1 block">2.4h</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Claims */}
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 glass rounded-2xl p-6">
            <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-dim mb-5">Recent Claims & Activity</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[10px] font-heading tracking-widest uppercase text-muted-dim border-b border-white/5">
                    <th className="pb-3 pr-3">User / Org</th>
                    <th className="pb-3 pr-3">Item</th>
                    <th className="pb-3 pr-3">Type</th>
                    <th className="pb-3 pr-3">Time</th>
                    <th className="pb-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {recentClaims.map((claim, i) => (
                    <tr key={i} className="hover:bg-surface-high/50 transition-colors">
                      <td className="py-3 pr-3 font-medium">{claim.user}</td>
                      <td className="py-3 pr-3 text-muted">{claim.item}</td>
                      <td className="py-3 pr-3">
                        <span className="text-[10px] font-heading font-bold tracking-wider uppercase px-2 py-0.5 rounded bg-surface-high">
                          {claim.type}
                        </span>
                      </td>
                      <td className="py-3 pr-3 text-muted-dim">{claim.time}</td>
                      <td className="py-3">
                        <span className={`text-[10px] font-heading font-bold tracking-wider uppercase px-2 py-0.5 rounded ${statusColors[claim.status]}`}>
                          {claim.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>

        {/* Impact summary bar */}
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.25 }} className="mt-6 glass rounded-2xl p-6">
          <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-dim mb-5">Platform Impact Summary</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'CO₂ Offset Equivalent', value: impactStats.offsetEquivalent, icon: '🌳' },
              { label: 'Food Rescued', value: `${impactStats.totalFoodRescued} meals`, icon: '🍱' },
              { label: 'Waste Diverted', value: `${impactStats.totalWasteDiverted}kg`, icon: '🔧' },
              { label: 'Items Circulated', value: impactStats.totalItemsReused.toString(), icon: '♻️' },
            ].map((s, i) => (
              <div key={i} className="bg-surface-high rounded-xl p-4 text-center">
                <span className="text-2xl block mb-2">{s.icon}</span>
                <span className="font-heading text-lg font-bold block">{s.value}</span>
                <span className="text-[10px] font-heading tracking-widest uppercase text-muted-dim mt-1 block">{s.label}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
