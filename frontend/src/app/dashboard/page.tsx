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
import DashboardAIInsights from '@/components/dashboard/DashboardAIInsights';

export default function DashboardPage() {
  const router = useRouter();
  const [viewMode, setViewMode] = useState<'overview' | 'buy' | 'sell' | 'rent' | 'swap' | 'membership'>('overview');
  const [initialLaunchTier, setInitialLaunchTier] = useState<string | null>(null);
  const [currentUser, setCurrentUser] = useState(mockUser);
  const [badges, setBadges] = useState(mockBadges);
  const [recentActivity, setRecentActivity] = useState(mockActivity);
  const [weeklyData, setWeeklyData] = useState(mockWeekly);
  const [cartItems, setCartItems] = useState(mockCart);
  const [listings, setListings] = useState(mockListings);
  const [procuredItems, setProcuredItems] = useState<any[]>([]);
  
  const [activityScore, setActivityScore] = useState(currentUser.score);

  useEffect(() => {
    async function load() {
      // Read initial UI states from URL (bypass Next Router to avoid suspense boundary requirement)
      if (typeof window !== 'undefined') {
        const search = new URLSearchParams(window.location.search);
        const urlView = search.get('view') as any;
        const urlTier = search.get('tier');
        if (urlView) setViewMode(urlView);
        if (urlTier) setInitialLaunchTier(urlTier);
      }

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
      
      const pKey = `reuse_mart_purchases_${userId}`;
      setProcuredItems(window.localStorage ? JSON.parse(window.localStorage.getItem(pKey) || '[]') : []);

      // Seed dashboard mock data variations deterministically without touching backend
      const hash = userId.split('').reduce((acc: number, char: string) => acc + char.charCodeAt(0), 0);
      setRecentActivity(mockActivity.filter((_, i) => (i + hash) % 2 === 0));
      setWeeklyData(mockWeekly.map(w => ({ day: w.day, co2: Math.max(0, w.co2 + (hash % 150) - 75) })));
      
      // Pull Live Supabase Telemetry natively
      const [{ data: userMetrics }, { count: rentSwapCount }, { count: foodRescued }, { count: sellSwapCount }] = await Promise.all([
        supabase.from('sustainability_metrics').select('*').eq('user_id', userId).single(),
        supabase.from('item_listings').select('*', { count: 'exact', head: true }).eq('owner_id', userId).in('listing_type', ['rent', 'swap']),
        supabase.from('food_listings').select('*', { count: 'exact', head: true }).eq('donor_id', userId),
        supabase.from('item_listings').select('*', { count: 'exact', head: true }).eq('owner_id', userId).in('listing_type', ['sell', 'swap'])
      ]);

      const realScore = meRes.profile.eco_points || 0;
      setActivityScore(realScore);
      
      setCurrentUser(prev => ({
          ...prev,
          name: meRes.profile.full_name || prev.name,
          score: realScore,
          membershipTier: meRes.profile.membership_tier || 'bronze',
          co2Saved: userMetrics?.total_carbon_saved_kg || 0,
          itemsReused: rentSwapCount || 0,
          foodRescued: foodRescued || 0,
          wasteDiverted: (sellSwapCount || 0) * 5.2, // Rough kg estimate per item diverted 
      }));

      // Setup Realtime Listener for seamless UI refresh
      const channel = supabase.channel(`dashboard_metrics_${Date.now()}_${Math.random()}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'item_listings' }, () => load())
        .on('postgres_changes', { event: '*', schema: 'public', table: 'food_listings' }, () => load())
        .subscribe();

        const bdg = await fetchFromApi(`/impact/user/${userId}/badges`);
        if (bdg && bdg.length > 0) {
          const formattedBadges = bdg.map((b: any) => ({
            id: b.id, name: b.reward_badges?.badge_name || 'Eco Beginner', description: b.reward_badges?.description || '', icon: b.reward_badges?.icon_url || '🌱', tier: 'silver', earned: true
          }));
          setBadges([{ id: 'mock2', name: 'Waste Warrior', icon: '♻️', description: 'Saved 10 items from landfill', tier: 'gold', progress: 80, earned: false }, ...formattedBadges]);
        } else {
          setBadges([
            { id: 'b1', name: 'Eco Beginner', icon: '🌱', description: 'Joined the platform', tier: 'bronze', earned: true },
            { id: 'b2', name: 'Waste Warrior', icon: '♻️', description: 'Saved 10 items from landfill', tier: 'gold', progress: 80, earned: false }
          ]); 
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
          const fListings = lst.map((i: any) => {
            let priceMatch = i.description?.match(/\[PRICE:(.*?)\]/);
            let overridePrice = priceMatch ? parseFloat(priceMatch[1]) : i.price;
            let sellerMatch = i.description?.match(/\[S_NAME:(.*?)\]/);
            let overrideName = sellerMatch ? sellerMatch[1] : null;

            return {
              ...mockListings[0], 
              id: i.id, 
              title: i.title, 
              type: i.listing_type || 'buy', 
              category: i.category, 
              createdAt: i.created_at,
              userName: overrideName && overrideName.trim() !== '' ? overrideName : (i.profiles?.full_name || 'User'),
              price: i.listing_type === 'buy' || !i.listing_type ? (overridePrice || mockListings[0].price) : mockListings[0].price,
              rentPrice: i.listing_type === 'rent' ? (overridePrice || mockListings[0].rentPrice) : mockListings[0].rentPrice,
              estimatedValue: i.listing_type === 'swap' ? (overridePrice || mockListings[0].estimatedValue) : mockListings[0].estimatedValue,
              description: i.description || ''
            };
          }).filter((_: any, i: number) => (i + hash) % 3 !== 0); // Scramble data
          setListings(fListings);
        } else {
          setListings(mockListings.filter((_: any, i: number) => (i + hash) % 2 === 0));
        }
    }
    load();
  }, []);

  const totalCarbon = cartItems.reduce((s, i) => s + i.carbonKg * i.quantity, 0);
  const altCarbon = cartItems.reduce((s, i) => s + (i.greenAltCarbonKg || i.carbonKg) * i.quantity, 0);
  const savings = totalCarbon - altCarbon;
  const maxWeekly = Math.max(...weeklyData.map((d) => d.co2));

  // Determine tier dynamically from the global activityScore OR explicit user override
  const derivedTier = currentUser.membershipTier || (activityScore >= 2000 ? 'gold' : activityScore >= 500 ? 'silver' : 'bronze');

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
        <AnimatePresence mode="wait">
          {viewMode !== 'overview' && viewMode !== 'membership' && procuredItems.filter(i => i.type === viewMode || (viewMode === 'buy' && !['rent', 'swap'].includes(i.type))).length > 0 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8 relative z-20">
              <h3 className="font-heading text-xl font-bold mb-4 flex items-center gap-2 text-neon-green">
                <span>📦</span> Your Procured {viewMode.charAt(0).toUpperCase() + viewMode.slice(1)}s
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {procuredItems.filter(i => i.type === viewMode || (viewMode === 'buy' && !['rent', 'swap'].includes(i.type))).map((item, idx) => (
                  <div key={idx} className="glass rounded-2xl p-4 flex gap-4 border border-neon-green/20 relative items-center shadow-[0_0_20px_rgba(57,255,20,0.05)]">
                    <img src={item.image} alt={item.title} className="w-20 h-20 rounded-xl object-cover bg-white/5" />
                    <div className="flex-1 pr-12">
                      <h4 className="font-heading font-bold text-lg">{item.title}</h4>
                      <div className="text-xs text-muted-dim font-mono mb-1">📍 {item.sellerLocation}</div>
                      <div className="text-[10px] text-muted-dim font-mono mb-2">🕒 Acquired {new Date(item.purchasedAt).toLocaleDateString()}</div>
                      
                      {/* Self-Listing Indicator */}
                      {(item.ownerId === currentUser.id) && (
                        <div className="inline-flex items-center gap-1.5 px-2 py-1 rounded bg-neon-green/10 border border-neon-green/20 text-[9px] font-heading font-bold uppercase text-neon-green tracking-wider">
                           <span>👤</span> Your Own Listing
                        </div>
                      )}
                    </div>
                    
                    {item.ownerId !== currentUser.id ? (
                      item.sellerWhatsapp ? (
                        <a href={`https://wa.me/${item.sellerWhatsapp}?text=Hi! I procured your ${item.title} on Reuse_mart!`} target="_blank" rel="noopener noreferrer" className="absolute top-1/2 -translate-y-1/2 right-4 bg-[#25D366] text-white p-2.5 rounded-full hover:scale-110 transition-transform shadow-[0_0_15px_rgba(37,211,102,0.3)]" title={`Contact ${item.sellerName || 'Seller'} on WhatsApp`}>
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z"/>
                          </svg>
                        </a>
                      ) : (
                        <div className="absolute top-1/2 -translate-y-1/2 right-4 bg-white/5 text-muted-dim p-2 rounded-full text-[10px] font-heading tracking-wider" title="Seller contact not available">
                          📞 N/A
                        </div>
                      )
                    ) : (
                      <div className="absolute top-1/2 -translate-y-1/2 right-4 bg-white/5 text-muted p-2.5 rounded-full" title="You are the seller of this item">
                         👤
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6 relative z-10">
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
            <div className="flex bg-surface-high/50 p-1 rounded-xl glass border border-white/5 relative z-20 flex-wrap">
            {(['overview', 'buy', 'sell', 'rent', 'swap', 'membership'] as const).map((mode) => (
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

              {/* Next Generation Semantic AI Injection */}
              <DashboardAIInsights metrics={{
                  co2Saved: currentUser.co2Saved,
                  itemsReused: currentUser.itemsReused,
                  foodRescued: currentUser.foodRescued,
                  wasteDiverted: currentUser.wasteDiverted
              }} />

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
                    <h3 className="font-heading text-sm font-semibold tracking-widest uppercase text-muted-dim mb-5">Your Impact This Week</h3>
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
              <SellModeView mode="sell" user={{...currentUser, score: activityScore}} onAction={handleAction} />
            </motion.div>
          )}

          {viewMode === 'rent' && (
            <motion.div key="rent" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SellModeView mode="rent" user={{...currentUser, score: activityScore}} onAction={handleAction} />
            </motion.div>
          )}

          {viewMode === 'swap' && (
            <motion.div key="swap" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <SellModeView mode="swap" user={{...currentUser, score: activityScore}} onAction={handleAction} />
            </motion.div>
          )}

          {viewMode === 'membership' && (
            <motion.div key="membership" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <MembershipView user={currentUser} initialLaunchTier={initialLaunchTier} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
