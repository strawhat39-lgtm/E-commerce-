'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { currentUser as mockUser, badges as mockBadges, recentActivity as mockActivity, weeklyData as mockWeekly, cartItems as mockCart, listings as mockListings } from '@/data/mock-data';
import { fetchFromApi } from '@/utils/api';
import { supabase } from '@/utils/supabase';
import BuyModeView from '@/components/dashboard/BuyModeView';
import SellModeView from '@/components/dashboard/SellModeView';
import MembershipView from '@/components/dashboard/MembershipView';

export default function DashboardPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'overview' | 'buy' | 'sell' | 'membership'>('overview');
  const [currentUser, setCurrentUser] = useState(mockUser);
  const [badges, setBadges] = useState(mockBadges);
  const [recentActivity, setRecentActivity] = useState(mockActivity);
  const [weeklyData, setWeeklyData] = useState(mockWeekly);
  const [cartItems, setCartItems] = useState(mockCart);
  const [listings, setListings] = useState(mockListings);
  
  const [activityScore, setActivityScore] = useState(currentUser.score);

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.push('/login');
        return;
      }

      // Ping /me to sync profile
      const meRes = await fetchFromApi('/me');
      if (!meRes || !meRes.profile) {
        router.push('/login');
        return;
      }

      const userId = meRes.profile.id; 
      
      // We don't fetch from /users/ anymore since /me provides what we need, 
      // but let's just use what we have in meRes.
      let score = meRes.profile.eco_points || mockUser.score;
      setActivityScore(score);
      
      const metrics = await fetchFromApi(`/impact/user/${userId}/metrics`);
        setCurrentUser(prev => ({
            ...prev,
            name: meRes.profile.full_name || prev.name,
            score: score,
            co2Saved: metrics?.total_carbon_saved_kg || prev.co2Saved,
            itemsReused: metrics?.items_reused || prev.itemsReused,
            wasteDiverted: metrics?.water_saved_liters || prev.wasteDiverted,
        }));

        const bdg = await fetchFromApi(`/impact/user/${userId}/badges`);
        if (bdg && bdg.length > 0) {
          const formattedBadges = bdg.map((b: any) => ({
            id: b.id, name: b.reward_badges?.badge_name || 'Badge', description: b.reward_badges?.description || '', icon: b.reward_badges?.icon_url || '🎖️', tier: 'silver', earned: true
          }));
          setBadges([...formattedBadges]); // Removed mock data slice
        } else {
          setBadges([]); // Start empty if no badges
        }

        const cart = await fetchFromApi(`/cart/user/${userId}`);
        if (cart && cart.length > 0) {
          const formattedCart = cart.map((c: any) => ({
             id: c.id, name: c.product_name, price: 0, image: '', quantity: c.quantity, carbonKg: parseInt(c.estimated_carbon_kg) || 0,
             greenAlt: 'Eco Alternative', greenAltCarbonKg: Math.max(0, parseInt(c.estimated_carbon_kg || 0) - 2)
          }));
          setCartItems(formattedCart);
        }
        
        const lst = await fetchFromApi(`/listings`);
        if (lst && lst.length > 0) {
          const fListings = lst.map((i: any) => ({
            ...mockListings[0], id: i.id, title: i.title, type: i.listing_type || 'buy', category: i.category, createdAt: i.created_at
          }));
          setListings(fListings);
        } else {
          setListings([]);
        }
    }
    load();
  }, []);

  const totalCarbon = cartItems.reduce((s, i) => s + i.carbonKg * i.quantity, 0);
  const altCarbon = cartItems.reduce((s, i) => s + (i.greenAltCarbonKg || i.carbonKg) * i.quantity, 0);
  const savings = totalCarbon - altCarbon;
  const maxWeekly = Math.max(...weeklyData.map((d) => d.co2));

  // Determine tier dynamically from the global activityScore
  const derivedTier = activityScore >= 2000 ? 'gold' : activityScore >= 500 ? 'silver' : 'bronze';

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'gold': return '#FFC800'; // accent-gold but brighter
      case 'silver': return '#0DFFC6'; // accent-teal
      case 'bronze': return '#FF6B35'; // accent-orange
      default: return '#39FF14';
    }
  };
  const tierColor = getTierColor(derivedTier);

  const handleAction = (points: number) => {
    setActivityScore(prev => prev + points);
  };

  return (
    <div className="min-h-screen pt-24 pb-16">
      <div className="section-container">
        {/* Header & Mode Toggles */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-20">
          <div className="flex items-center gap-4">
            <div className="relative">
               {/* Animated Circular Progress Badge around avatar */}
               <svg className="absolute -inset-2 w-[calc(100%+16px)] h-[calc(100%+16px)] rotate-[-90deg]">
                 <circle cx="50%" cy="50%" r="48%" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="2" />
                 <circle 
                   cx="50%" cy="50%" r="48%" fill="none" 
                   stroke={tierColor} strokeWidth="2" strokeLinecap="round" 
                   strokeDasharray={`${(activityScore / 5000) * 150} 150`} 
                 />
               </svg>
               <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-surface-high to-surface-mid flex items-center justify-center font-heading font-bold text-lg relative z-10 shadow-[0_0_15px_rgba(0,0,0,0.5)]" style={{ color: tierColor, border: `1px solid ${tierColor}40` }}>
                 {currentUser.avatar}
               </div>
            </div>
            
            <div>
              <div className="flex items-center gap-3">
                <h1 className="font-heading text-3xl font-bold">Welcome, {currentUser.name.split(' ')[0]}</h1>
                <span className="px-2 py-0.5 text-[10px] font-heading font-bold tracking-widest uppercase rounded bg-surface-high" style={{ color: tierColor, border: `1px solid ${tierColor}40` }}>
                  {derivedTier} Member
                </span>
              </div>
              <p className="text-sm text-muted mt-1">🔥 {currentUser.streak}-day streak · Level {Math.floor(activityScore / 500) + 1}</p>
            </div>
          </div>
          
          {/* Header Controls */}
          <div className="flex flex-col md:flex-row items-end gap-4 relative z-20">
            {/* Mode Toggles */}
            <div className="flex bg-surface-high/50 p-1 rounded-xl glass border border-white/5 relative z-20">
            {(['overview', 'buy', 'sell', 'membership'] as const).map((mode) => (
              <button
                key={mode}
                onClick={() => setViewMode(mode)}
                className={`relative px-4 py-2 text-xs font-heading tracking-widest uppercase font-bold rounded-lg transition-colors ${
                  viewMode === mode ? 'text-black' : 'text-muted-dim hover:text-white'
                }`}
              >
                {viewMode === mode && (
                  <motion.div
                    layoutId="activeMode"
                    className="absolute inset-0 bg-neon-green rounded-lg shadow-[0_0_15px_rgba(57,255,20,0.3)]"
                    transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                  />
                )}
                <span className="relative z-10">{mode}</span>
              </button>
            ))}
            </div>

            <button
              onClick={async () => {
                await supabase.auth.signOut();
                router.push('/login');
              }}
              className="px-4 py-3 h-full glass text-xs font-heading tracking-widest uppercase font-bold rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 hover:border-red-500/50 transition-all"
            >
              Sign Out
            </button>
          </div>
        </motion.div>

        {/* Content Area */}
        <AnimatePresence mode="wait">
          {viewMode === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.3 }}
            >
              {/* Impact row */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: 'CO₂ Saved', value: `${currentUser.co2Saved}kg`, icon: '🌱', color: '#39FF14' },
                  { label: 'Items Reused', value: currentUser.itemsReused, icon: '♻️', color: '#0DFFC6' },
                  { label: 'Food Rescued', value: currentUser.foodRescued, icon: '🍱', color: '#FF6B35' },
                  { label: 'Waste Diverted', value: `${currentUser.wasteDiverted}kg`, icon: '🔧', color: '#BF5AF2' },
                ].map((stat, i) => (
                  <div key={i} className="glass rounded-2xl p-5 group hover:border-white/10 transition-all">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-2xl">{stat.icon}</span>
                      <span className="text-[10px] font-heading tracking-widest uppercase text-muted-dim">{stat.label}</span>
                    </div>
                    <span className="font-heading text-2xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
                  </div>
                ))}
              </div>

              <div className="grid lg:grid-cols-3 gap-6">
                {/* Left: Score + Carbon + Weekly */}
                <div className="lg:col-span-2 flex flex-col gap-6">
                  {/* Sustainability Score */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-dim mb-5">Sustainability Score</h3>
                    <div className="flex items-center gap-8">
                      {/* Ring */}
                      <div className="relative w-32 h-32 flex-shrink-0">
                        <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
                          <circle cx="60" cy="60" r="50" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="8" />
                          <circle
                            cx="60" cy="60" r="50" fill="none" stroke="url(#score-grad)" strokeWidth="8"
                            strokeLinecap="round" strokeDasharray={`${(currentUser.score / 5000) * 314} 314`}
                          />
                          <defs>
                            <linearGradient id="score-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                              <stop offset="0%" stopColor="#39FF14" />
                              <stop offset="100%" stopColor="#0DFFC6" />
                            </linearGradient>
                          </defs>
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="font-heading text-2xl font-bold text-white transition-all duration-300">{activityScore}</span>
                          <span className="text-[9px] font-heading tracking-widest text-muted-dim">/ 5,000</span>
                        </div>
                      </div>

                      <div className="flex-1">
                        <p className="text-sm text-muted mb-3">You&apos;re in the top <span className="text-neon-green font-semibold">12%</span> of eco-warriors in your area.</p>
                        <div className="w-full bg-surface-high rounded-full h-2 mb-2">
                          <motion.div 
                            className="h-full rounded-full bg-gradient-to-r from-neon-green to-accent-teal" 
                            initial={false}
                            animate={{ width: `${(activityScore / 5000) * 100}%` }}
                            transition={{ type: 'spring', bounce: 0.1 }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-muted-dim font-heading tracking-wider">
                          <span>BEGINNER</span>
                          <span>ECO HERO</span>
                          <span>LEGEND</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Carbon Cart Tracker */}
                  <div className="glass rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-5">
                      <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-dim">Cart Carbon Footprint</h3>
                      <span className="text-xs font-heading font-semibold text-accent-gold">
                        💡 Save {savings.toFixed(1)}kg by switching
                      </span>
                    </div>

                    <div className="space-y-3 mb-5">
                      {cartItems.map((item) => (
                        <div key={item.id} className="flex items-center gap-4 bg-surface-high rounded-xl p-3">
                          <div className="w-10 h-10 rounded-lg bg-surface-mid flex items-center justify-center text-lg">🛍️</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between">
                              <span className="text-sm font-semibold truncate">{item.name}</span>
                              <span className="text-sm font-heading text-accent-red font-bold">{item.carbonKg}kg</span>
                            </div>
                            {item.greenAlt && (
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] text-neon-green font-heading">🌿 {item.greenAlt}: {item.greenAltCarbonKg}kg</span>
                                <span className="text-[10px] px-1.5 py-0.5 rounded bg-neon-green/10 text-neon-green font-heading font-bold">
                                  -{((1 - (item.greenAltCarbonKg || 0) / item.carbonKg) * 100).toFixed(0)}%
                                </span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl neon-border">
                      <div>
                        <span className="text-xs font-heading tracking-widest uppercase text-muted-dim block">Total Cart Impact</span>
                        <span className="font-heading text-xl font-bold text-accent-red">{totalCarbon.toFixed(1)}kg CO₂</span>
                      </div>
                      <button className="px-4 py-2 text-xs font-heading font-bold tracking-wider uppercase bg-neon-green text-black rounded-lg hover:shadow-[0_0_15px_rgba(57,255,20,0.3)] transition-all">
                        Switch to Green ✓
                      </button>
                    </div>
                  </div>

                  {/* Weekly Trend */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-dim mb-5">Weekly Impact</h3>
                    <div className="flex items-end gap-3 h-40">
                      {weeklyData.map((d, i) => (
                        <div key={i} className="flex-1 flex flex-col items-center gap-2">
                          <span className="text-[10px] font-heading text-muted-dim">{d.co2.toFixed(1)}</span>
                          <div className="w-full bg-surface-high rounded-t-md overflow-hidden relative" style={{ height: `${(d.co2 / maxWeekly) * 100}%` }}>
                            <div
                              className="absolute inset-0 rounded-t-md"
                              style={{
                                background: `linear-gradient(180deg, #39FF14, #0DFFC6)`,
                                opacity: 0.7 + (d.co2 / maxWeekly) * 0.3,
                              }}
                            />
                          </div>
                          <span className="text-[10px] font-heading text-muted-dim">{d.day}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Activity + Badges + Rewards */}
                <div className="flex flex-col gap-6">
                  {/* Recent Activity */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-dim mb-5">Recent Activity</h3>
                    <div className="space-y-4">
                      {recentActivity.map((act) => (
                        <div key={act.id} className="flex gap-3">
                          <span className="text-xl flex-shrink-0 mt-0.5">{act.icon}</span>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold block">{act.title}</span>
                            <span className="text-xs text-muted block mt-0.5">{act.description}</span>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span className="text-[10px] font-heading font-semibold text-neon-green">{act.impact}</span>
                              <span className="text-[10px] text-muted-dim">· {act.timestamp}</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Badges */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-dim mb-5">
                      Badges <span className="text-neon-green ml-1">{badges.filter(b => b.earned).length}/{badges.length}</span>
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {badges.map((badge) => (
                        <div
                          key={badge.id}
                          className={`rounded-xl p-3 text-center transition-all ${
                            badge.earned ? `badge-${badge.tier}` : 'bg-surface-high border border-white/5 opacity-50'
                          }`}
                        >
                          <span className="text-2xl block mb-1">{badge.icon}</span>
                          <span className="text-[10px] font-heading font-semibold tracking-wider block">{badge.name}</span>
                          {!badge.earned && badge.progress !== undefined && (
                            <div className="w-full h-1 bg-surface-mid rounded-full mt-2 overflow-hidden">
                              <div className="h-full bg-accent-teal rounded-full" style={{ width: `${badge.progress}%` }} />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Rewards */}
                  <div className="glass rounded-2xl p-6">
                    <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-dim mb-4">Local Rewards</h3>
                    <div className="space-y-3">
                      {[
                        { name: '10% Off at GreenMart', points: 500, icon: '🛒' },
                        { name: 'Free Coffee at EcoBrew', points: 250, icon: '☕' },
                        { name: '$5 Farmer\'s Market Credit', points: 750, icon: '🥕' },
                      ].map((reward, i) => (
                        <div key={i} className="flex items-center gap-3 bg-surface-high rounded-xl p-3">
                          <span className="text-xl">{reward.icon}</span>
                          <div className="flex-1">
                            <span className="text-sm font-semibold block">{reward.name}</span>
                            <span className="text-[10px] font-heading text-accent-gold">{reward.points} pts</span>
                          </div>
                          <button className={`px-3 py-1.5 text-[10px] font-heading font-bold tracking-wider rounded-lg ${
                            activityScore >= reward.points
                              ? 'bg-neon-green text-black'
                              : 'bg-surface-mid text-muted-dim cursor-not-allowed'
                          }`}>
                            REDEEM
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {viewMode === 'buy' && (
            <motion.div key="buy" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <BuyModeView items={listings.filter(l => l.type === 'buy')} userTier={derivedTier} onAction={handleAction} />
            </motion.div>
          )}

          {viewMode === 'sell' && (
            <motion.div key="sell" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SellModeView user={{...currentUser, score: activityScore}} onAction={handleAction} />
            </motion.div>
          )}

          {viewMode === 'membership' && (
            <motion.div key="membership" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <MembershipView user={currentUser} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
