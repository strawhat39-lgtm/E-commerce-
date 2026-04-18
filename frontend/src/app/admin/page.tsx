'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { supabase } from '@/utils/supabase';
import { fetchFromApi } from '@/utils/api';
import { useCurrency } from '@/context/CurrencyContext';

// ─── Types ───────────────────────────────────────────────────────────
interface Profile {
  id: string;
  email: string;
  full_name: string;
  avatar_url: string | null;
  eco_points: number;
  role: string;
  membership_tier: string;
  created_at: string;
}

interface Listing {
  id: string;
  owner_id: string;
  title: string;
  description: string | null;
  category: string;
  condition: string;
  status: string;
  listing_type: string;
  image_url: string | null;
  created_at: string;
}

interface ActivityLog {
  id: string;
  user_id: string;
  action_type: string;
  description: string | null;
  created_at: string;
}

interface Transaction {
  id: string;
  buyer_id: string;
  seller_id: string | null;
  listing_id: string | null;
  item_title: string;
  amount: number;
  payment_method: string;
  buyer_address: string | null;
  buyer_mobile: string | null;
  buyer_bio: string | null;
  status: string;
  created_at: string;
  buyer?: { full_name: string; email: string } | null;
  seller?: { full_name: string; email: string } | null;
}

interface Metrics {
  totalUsers: number;
  activeListings: number;
  pendingListings: number;
  totalFoodListings: number;
  totalUpcycle: number;
  totalTransactions: number;
}

// ─── Main Component ──────────────────────────────────────────────────
export default function AdminPage() {
  const router = useRouter();
  const { formatPrice } = useCurrency();

  // Auth state
  const [authState, setAuthState] = useState<'loading' | 'unauthorized' | 'authorized'>('unauthorized');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [authError, setAuthError] = useState('');

  // Data state
  const [users, setUsers] = useState<Profile[]>([]);
  const [selectedUser, setSelectedUser] = useState<Profile | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [userActivity, setUserActivity] = useState<ActivityLog[]>([]);
  const [allListings, setAllListings] = useState<Listing[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [metrics, setMetrics] = useState<Metrics>({ totalUsers: 0, activeListings: 0, pendingListings: 0, totalFoodListings: 0, totalUpcycle: 0, totalTransactions: 0 });

  // UI state
  const [activeTab, setActiveTab] = useState<'overview' | 'users' | 'listings' | 'transactions'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [listingFilter, setListingFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // ─── Auth: Handle Admin Login ────────────────────────────────────────
  const handleAdminAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      adminEmail === process.env.NEXT_PUBLIC_ADMIN_EMAIL &&
      adminPassword === process.env.NEXT_PUBLIC_ADMIN_PASSWORD
    ) {
      setAuthState('authorized');
      setAuthError('');
    } else {
       setAuthError('Invalid Admin Credentials');
    }
  };

  // ─── Data Loading ────────────────────────────────────────────────
  const loadAllData = useCallback(async () => {
    setIsLoading(true);
    try {
      // Fetch all users
      const { data: usersData } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (usersData) setUsers(usersData);

      // Fetch all listings
      const { data: listingsData } = await supabase
        .from('item_listings')
        .select('*')
        .order('created_at', { ascending: false });

      if (listingsData) setAllListings(listingsData);

      // Fetch all transactions
      const { data: txData } = await supabase
        .from('transactions')
        .select('*, buyer:profiles!transactions_buyer_id_fkey(full_name, email), seller:profiles!transactions_seller_id_fkey(full_name, email)')
        .order('created_at', { ascending: false });

      if (txData) setAllTransactions(txData);

      // Compute metrics
      const [usersCount, listingsCount, pendingCount, foodCount, upcycleCount] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('item_listings').select('*', { count: 'exact', head: true }),
        supabase.from('item_listings').select('*', { count: 'exact', head: true }).eq('status', 'pending'),
        supabase.from('food_listings').select('*', { count: 'exact', head: true }),
        supabase.from('upcycle_materials').select('*', { count: 'exact', head: true }),
        supabase.from('transactions').select('*', { count: 'exact', head: true }),
      ]);

      const txCount = await supabase.from('transactions').select('*', { count: 'exact', head: true });

      setMetrics({
        totalUsers: usersCount.count || 0,
        activeListings: listingsCount.count || 0,
        pendingListings: pendingCount.count || 0,
        totalFoodListings: foodCount.count || 0,
        totalUpcycle: upcycleCount.count || 0,
        totalTransactions: txCount.count || 0,
      });
    } catch (e) {
      console.error('Admin data load error:', e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authState === 'authorized') {
      loadAllData();
    }
  }, [authState, loadAllData]);

  // ─── Supabase Realtime ───────────────────────────────────────────
  useEffect(() => {
    if (authState !== 'authorized') return;

    const listingsChannel = supabase
      .channel('admin-listings-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'item_listings' }, () => {
        loadAllData();
        if (selectedUser) loadUserDetails(selectedUser.id);
      })
      .subscribe();

    const profilesChannel = supabase
      .channel('admin-profiles-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'profiles' }, () => {
        loadAllData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(listingsChannel);
      supabase.removeChannel(profilesChannel);
    };
  }, [authState, selectedUser, loadAllData]);

  // ─── Load User Details ───────────────────────────────────────────
  const loadUserDetails = async (userId: string) => {
    const [listingsRes, activityRes] = await Promise.all([
      supabase.from('item_listings').select('*').eq('owner_id', userId).order('created_at', { ascending: false }),
      supabase.from('activity_logs').select('*').eq('user_id', userId).order('created_at', { ascending: false }).limit(20),
    ]);

    if (listingsRes.data) setUserListings(listingsRes.data);
    if (activityRes.data) setUserActivity(activityRes.data);
  };

  const handleSelectUser = (user: Profile) => {
    setSelectedUser(user);
    loadUserDetails(user.id);
  };

  // ─── Listing Actions ────────────────────────────────────────────
  const updateListingStatus = async (listingId: string, newStatus: string) => {
    setActionLoading(listingId);
    try {
      await fetchFromApi(`/listings/${listingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      // Realtime will trigger refresh, but also refresh immediately
      if (selectedUser) await loadUserDetails(selectedUser.id);
      await loadAllData();
    } catch (e) {
      console.error('Status update failed:', e);
    } finally {
      setActionLoading(null);
    }
  };

  const deleteListing = async (listingId: string) => {
    if (!confirm('Permanently delete this listing? This cannot be undone.')) return;
    setActionLoading(listingId);
    try {
      await fetchFromApi(`/listings/${listingId}`, { method: 'DELETE' });
      if (selectedUser) await loadUserDetails(selectedUser.id);
      await loadAllData();
    } catch (e) {
      console.error('Delete failed:', e);
    } finally {
      setActionLoading(null);
    }
  };

  // ─── Helpers ─────────────────────────────────────────────────────
  const getTierColor = (tier: string) => {
    switch (tier?.toLowerCase()) {
      case 'gold': return '#FFD700';
      case 'silver': return '#C0C0C0';
      case 'platinum': return '#E5E4E2';
      default: return '#CD7F32';
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30';
      case 'pending': return 'bg-[#FFC800]/10 text-[#FFC800] border-[#FFC800]/30';
      case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/30';
      default: return 'bg-white/10 text-white border-white/20';
    }
  };

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const filteredUsers = users.filter(u =>
    !searchQuery || u.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) || u.email?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredListings = allListings.filter(l =>
    listingFilter === 'all' || l.status === listingFilter
  );

  // ─── Loading Screen ─────────────────────────────────────────────
  if (authState === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mx-auto mb-4" />
          <p className="font-heading text-sm tracking-widest uppercase text-muted-dim">Verifying Clearance...</p>
        </div>
      </div>
    );
  }

  // ─── Unauthorized Screen (Login Form) ─────────────────────────────
  if (authState === 'unauthorized') {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <div className="glass p-8 rounded-3xl max-w-md w-full relative overflow-hidden border border-[#FFD700]/30 shadow-[0_0_50px_rgba(255,215,0,0.1)]">
           <div className="absolute top-0 right-0 w-32 h-32 bg-[#FFD700]/10 rounded-full blur-[80px]" />
           <h1 className="font-heading text-3xl font-bold mb-2 text-[#FFD700] flex items-center justify-center gap-2">
              <span>👑</span> Admin Console
           </h1>
           <p className="text-center text-muted mb-8">Strictly monitored environment.</p>

           {authError && <div className="p-3 mb-6 bg-red-500/10 border border-red-500/20 text-red-400 text-xs rounded-xl text-center font-bold tracking-widest">{authError}</div>}

           <form onSubmit={handleAdminAuth} className="space-y-4 relative z-10">
              <input 
                 type="email" 
                 value={adminEmail} 
                 onChange={e => setAdminEmail(e.target.value)} 
                 placeholder="Admin Email" 
                 required
                 className="w-full px-4 py-3 bg-surface border border-white/5 rounded-xl outline-none focus:border-[#FFD700]/50" 
              />
              <input 
                 type="password" 
                 value={adminPassword} 
                 onChange={e => setAdminPassword(e.target.value)} 
                 placeholder="Admin Password" 
                 required
                 className="w-full px-4 py-3 bg-surface border border-white/5 rounded-xl outline-none focus:border-[#FFD700]/50 tracking-[0.2em]" 
              />
              <button className="w-full mt-4 py-3 font-heading font-bold uppercase tracking-widest text-black bg-[#FFD700] hover:bg-[#FFEAA7] transition-all rounded-xl">
                 Access Portal
              </button>
           </form>
           
           <button onClick={() => router.push('/login')} className="block w-full text-center text-[10px] text-muted hover:text-white uppercase font-heading tracking-widest mt-6">
              Return to standard login
           </button>
        </div>
      </div>
    );
  }

  // ─── Main Admin Dashboard ───────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-white flex pt-16">
      {/* ─── Left Sidebar ─────────────────────────────────────────── */}
      <aside className="w-72 glass border-r border-[#FFD700]/10 flex-shrink-0 flex flex-col h-[calc(100vh-4rem)] sticky top-16 hidden lg:flex">
        {/* Admin Header */}
        <div className="p-5 border-b border-white/5">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-xl bg-[#FFD700]/10 border border-[#FFD700]/30 flex items-center justify-center text-lg">👑</div>
            <div>
              <h2 className="font-heading font-bold text-sm text-[#FFD700]">System Admin</h2>
              <span className="text-[10px] text-muted-dim font-mono">{adminEmail}</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#39FF14] shadow-[0_0_6px_#39FF14]" />
            <span className="text-[10px] font-heading tracking-widest uppercase text-neon-green">Live Console</span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-3 space-y-1">
          {([
            { key: 'overview', icon: '📊', label: 'Overview' },
            { key: 'users', icon: '👥', label: 'Users' },
            { key: 'listings', icon: '📦', label: 'Listings' },
            { key: 'transactions', icon: '💰', label: 'Transactions' },
          ] as const).map(tab => (
            <button
              key={tab.key}
              onClick={() => { setActiveTab(tab.key); setSelectedUser(null); }}
              className={`w-full text-left px-4 py-3 rounded-xl font-heading font-bold tracking-wider text-sm transition-all flex items-center gap-3 ${
                activeTab === tab.key
                  ? 'bg-[#FFD700]/10 text-[#FFD700] border border-[#FFD700]/20'
                  : 'text-muted hover:bg-white/5 hover:text-white border border-transparent'
              }`}
            >
              <span>{tab.icon}</span>
              <span className="uppercase">{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Realtime indicator */}
        <div className="p-4 border-t border-white/5">
          <div className="flex items-center justify-between text-[10px] text-muted-dim font-heading tracking-wider uppercase mb-3">
            <span>Supabase Realtime</span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#39FF14] animate-pulse" />
              Active
            </span>
          </div>
          <button
            onClick={() => {
              setAuthState('unauthorized');
              setAdminPassword('');
            }}
            className="w-full text-center px-4 py-2.5 bg-red-500/10 text-red-400 rounded-xl font-heading font-bold text-[10px] tracking-widest hover:bg-red-500/20 transition-colors uppercase"
          >
            Lock Terminal
          </button>
        </div>
      </aside>

      {/* ─── Main Content ─────────────────────────────────────────── */}
      <main className="flex-1 flex flex-col min-w-0">
        {isLoading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 border-2 border-[#FFD700]/30 border-t-[#FFD700] rounded-full animate-spin mx-auto mb-4" />
              <p className="font-heading text-xs tracking-widest uppercase text-muted-dim">Syncing Live Data...</p>
            </div>
          </div>
        ) : (
          <>
            {/* ─── OVERVIEW TAB ───────────────────────────────────── */}
            {activeTab === 'overview' && (
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <h1 className="font-heading text-2xl font-bold flex items-center gap-3">
                  <span>📊</span> Dashboard Overview
                  <span className="text-[10px] ml-auto font-heading tracking-widest uppercase text-muted-dim">All data from Supabase</span>
                </h1>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                  {[
                    { label: 'Total Users', value: metrics.totalUsers, icon: '👥', color: '#FFD700' },
                    { label: 'All Listings', value: metrics.activeListings, icon: '📦', color: '#0DFFC6' },
                    { label: 'Pending Review', value: metrics.pendingListings, icon: '⏳', color: '#FFC800' },
                    { label: 'Food Rescues', value: metrics.totalFoodListings, icon: '🍱', color: '#FF6B35' },
                    { label: 'Upcycle Items', value: metrics.totalUpcycle, icon: '♻️', color: '#BF5AF2' },
                  ].map((m, i) => (
                    <motion.div
                      key={i}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className="glass p-5 rounded-2xl border border-white/5 relative overflow-hidden group hover:border-white/10 transition-colors"
                    >
                      <div className="absolute top-0 right-0 w-16 h-16 rounded-full blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" style={{ background: m.color }} />
                      <span className="text-2xl block mb-2">{m.icon}</span>
                      <span className="font-heading text-3xl font-bold block" style={{ color: m.color }}>{m.value}</span>
                      <span className="text-[10px] text-muted-dim font-heading tracking-widest uppercase mt-1 block">{m.label}</span>
                    </motion.div>
                  ))}
                </div>

                {/* Recent Activity from DB */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Pending Listings Preview */}
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <h3 className="font-heading font-bold tracking-widest uppercase text-sm text-[#FFC800] mb-5 flex items-center gap-2">
                      <span>⏳</span> Pending Listings
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {allListings.filter(l => l.status === 'pending').slice(0, 8).map(listing => (
                        <div key={listing.id} className="flex items-center gap-3 p-3 rounded-xl bg-surface-high/30 border border-white/5 hover:border-[#FFC800]/20 transition-colors">
                          <div className="w-10 h-10 rounded-lg bg-surface flex-shrink-0 overflow-hidden">
                            {listing.image_url ? (
                              /* eslint-disable-next-line @next/next/no-img-element */
                              <img src={listing.image_url} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-lg opacity-30">📦</div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold block truncate">{listing.title}</span>
                            <span className="text-[10px] text-muted-dim">{listing.listing_type} · {listing.category}</span>
                          </div>
                          <div className="flex gap-1.5 flex-shrink-0">
                            <button
                              onClick={() => updateListingStatus(listing.id, 'approved')}
                              disabled={actionLoading === listing.id}
                              className="px-2.5 py-1.5 bg-[#39FF14]/10 text-[#39FF14] text-[10px] font-bold tracking-wider uppercase rounded-lg hover:bg-[#39FF14]/20 transition-colors border border-[#39FF14]/20 disabled:opacity-50"
                            >
                              ✓
                            </button>
                            <button
                              onClick={() => updateListingStatus(listing.id, 'rejected')}
                              disabled={actionLoading === listing.id}
                              className="px-2.5 py-1.5 bg-red-500/10 text-red-400 text-[10px] font-bold tracking-wider uppercase rounded-lg hover:bg-red-500/20 transition-colors border border-red-500/20 disabled:opacity-50"
                            >
                              ✕
                            </button>
                          </div>
                        </div>
                      ))}
                      {allListings.filter(l => l.status === 'pending').length === 0 && (
                        <div className="text-center py-8 text-muted-dim text-sm">No pending listings 🎉</div>
                      )}
                    </div>
                  </div>

                  {/* Recent Users */}
                  <div className="glass rounded-2xl p-6 border border-white/5">
                    <h3 className="font-heading font-bold tracking-widest uppercase text-sm text-[#FFD700] mb-5 flex items-center gap-2">
                      <span>👥</span> Recent Users
                    </h3>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                      {users.slice(0, 8).map(user => (
                        <button
                          key={user.id}
                          onClick={() => { setActiveTab('users'); handleSelectUser(user); }}
                          className="w-full flex items-center gap-3 p-3 rounded-xl bg-surface-high/30 border border-white/5 hover:border-[#FFD700]/20 transition-colors text-left"
                        >
                          <div className="w-9 h-9 rounded-lg flex items-center justify-center font-heading font-bold text-sm flex-shrink-0" style={{ background: `${getTierColor(user.membership_tier)}15`, color: getTierColor(user.membership_tier), border: `1px solid ${getTierColor(user.membership_tier)}30` }}>
                            {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div className="flex-1 min-w-0">
                            <span className="text-sm font-semibold block truncate">{user.full_name || 'Anonymous'}</span>
                            <span className="text-[10px] text-muted-dim font-mono truncate block">{user.email}</span>
                          </div>
                          <div className="flex flex-col items-end flex-shrink-0">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: `${getTierColor(user.membership_tier)}15`, color: getTierColor(user.membership_tier) }}>
                              {user.membership_tier?.toUpperCase() || 'BRONZE'}
                            </span>
                            <span className="text-[9px] text-muted-dim mt-1">{timeAgo(user.created_at)}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── USERS TAB ──────────────────────────────────────── */}
            {activeTab === 'users' && (
              <div className="flex flex-1 min-h-0">
                {/* User List Sidebar */}
                <div className="w-80 border-r border-white/5 flex flex-col flex-shrink-0">
                  <div className="p-4 border-b border-white/5">
                    <h2 className="font-heading font-bold text-sm tracking-widest uppercase mb-3 flex items-center gap-2">
                      <span>👥</span> Users ({users.length})
                    </h2>
                    <input
                      type="text"
                      placeholder="Search by name or email..."
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      className="w-full bg-surface-high border border-white/10 rounded-xl px-3 py-2 text-sm focus:border-[#FFD700]/50 outline-none transition-colors"
                    />
                  </div>
                  <div className="flex-1 overflow-y-auto custom-scrollbar">
                    {filteredUsers.map(user => (
                      <button
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className={`w-full text-left p-4 border-b border-white/5 hover:bg-white/5 transition-colors flex items-center gap-3 ${
                          selectedUser?.id === user.id ? 'bg-[#FFD700]/5 border-l-2 border-l-[#FFD700]' : ''
                        }`}
                      >
                        <div className="w-9 h-9 rounded-lg flex items-center justify-center font-heading font-bold text-sm flex-shrink-0" style={{ background: `${getTierColor(user.membership_tier)}15`, color: getTierColor(user.membership_tier), border: `1px solid ${getTierColor(user.membership_tier)}30` }}>
                          {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1 min-w-0">
                          <span className="text-sm font-semibold block truncate">{user.full_name || 'Anonymous'}</span>
                          <span className="text-[10px] text-muted-dim font-mono truncate block">{user.email}</span>
                        </div>
                        <div className="flex flex-col items-end flex-shrink-0 gap-1">
                          <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ background: `${getTierColor(user.membership_tier)}15`, color: getTierColor(user.membership_tier) }}>
                            {user.membership_tier?.toUpperCase()}
                          </span>
                          <span className="text-[9px] text-muted-dim">{user.eco_points} pts</span>
                        </div>
                      </button>
                    ))}
                    {filteredUsers.length === 0 && (
                      <div className="text-center py-12 text-muted-dim text-sm">No users found</div>
                    )}
                  </div>
                </div>

                {/* User Detail Panel */}
                <div className="flex-1 overflow-y-auto custom-scrollbar">
                  <AnimatePresence mode="wait">
                    {selectedUser ? (
                      <motion.div
                        key={selectedUser.id}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        className="p-6 space-y-6"
                      >
                        {/* Profile Header */}
                        <div className="glass rounded-2xl p-6 border border-white/5">
                          <div className="flex items-start gap-4">
                            <div className="w-16 h-16 rounded-2xl flex items-center justify-center font-heading font-bold text-2xl" style={{ background: `${getTierColor(selectedUser.membership_tier)}15`, color: getTierColor(selectedUser.membership_tier), border: `2px solid ${getTierColor(selectedUser.membership_tier)}40` }}>
                              {selectedUser.full_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <div className="flex-1">
                              <h2 className="font-heading text-xl font-bold">{selectedUser.full_name || 'Anonymous'}</h2>
                              <p className="text-sm text-muted font-mono">{selectedUser.email}</p>
                              <div className="flex items-center gap-3 mt-2 flex-wrap">
                                <span className="text-[10px] font-bold px-2 py-1 rounded" style={{ background: `${getTierColor(selectedUser.membership_tier)}15`, color: getTierColor(selectedUser.membership_tier), border: `1px solid ${getTierColor(selectedUser.membership_tier)}30` }}>
                                  {selectedUser.membership_tier?.toUpperCase()} MEMBER
                                </span>
                                <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/20">
                                  {selectedUser.role?.toUpperCase()}
                                </span>
                                <span className="text-[10px] text-muted-dim">Joined {new Date(selectedUser.created_at).toLocaleDateString()}</span>
                              </div>
                            </div>
                            <div className="text-right flex-shrink-0">
                              <span className="font-heading text-3xl font-bold text-[#FFD700]">{selectedUser.eco_points}</span>
                              <span className="block text-[10px] text-muted-dim font-heading tracking-widest uppercase">Eco Coins</span>
                            </div>
                          </div>
                        </div>

                        {/* User's Listings */}
                        <div className="glass rounded-2xl p-6 border border-white/5">
                          <h3 className="font-heading font-bold tracking-widest uppercase text-sm mb-5 flex items-center gap-2">
                            <span>📦</span> Listings ({userListings.length})
                          </h3>
                          {userListings.length === 0 ? (
                            <div className="text-center py-8 text-muted-dim text-sm">No listings from this user</div>
                          ) : (
                            <div className="space-y-3">
                              {userListings.map(listing => (
                                <div key={listing.id} className="flex items-center gap-4 p-4 rounded-xl bg-surface-high/30 border border-white/5 hover:border-white/10 transition-colors">
                                  <div className="w-14 h-14 rounded-xl bg-surface flex-shrink-0 overflow-hidden">
                                    {listing.image_url ? (
                                      /* eslint-disable-next-line @next/next/no-img-element */
                                      <img src={listing.image_url} alt="" className="w-full h-full object-cover" />
                                    ) : (
                                      <div className="w-full h-full flex items-center justify-center text-xl opacity-30">📦</div>
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <span className="text-sm font-semibold block truncate">{listing.title}</span>
                                    <div className="flex items-center gap-2 mt-1">
                                      <span className="text-[10px] text-muted-dim uppercase tracking-wider">{listing.listing_type}</span>
                                      <span className="text-[10px] text-muted-dim">·</span>
                                      <span className="text-[10px] text-muted-dim">{listing.category}</span>
                                      <span className="text-[10px] text-muted-dim">·</span>
                                      <span className="text-[10px] text-muted-dim">{timeAgo(listing.created_at)}</span>
                                    </div>
                                  </div>
                                  {/* Status Badge */}
                                  <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded border flex-shrink-0 ${getStatusStyle(listing.status)}`}>
                                    {listing.status}
                                  </span>
                                  {/* Action Buttons */}
                                  <div className="flex gap-1.5 flex-shrink-0">
                                    {listing.status !== 'approved' && (
                                      <button
                                        onClick={() => updateListingStatus(listing.id, 'approved')}
                                        disabled={actionLoading === listing.id}
                                        className="px-2.5 py-1.5 bg-[#39FF14]/10 text-[#39FF14] text-[10px] font-bold tracking-wider rounded-lg hover:bg-[#39FF14]/20 transition-colors disabled:opacity-50"
                                        title="Approve"
                                      >
                                        ✓
                                      </button>
                                    )}
                                    {listing.status !== 'rejected' && (
                                      <button
                                        onClick={() => updateListingStatus(listing.id, 'rejected')}
                                        disabled={actionLoading === listing.id}
                                        className="px-2.5 py-1.5 bg-[#FFC800]/10 text-[#FFC800] text-[10px] font-bold tracking-wider rounded-lg hover:bg-[#FFC800]/20 transition-colors disabled:opacity-50"
                                        title="Reject"
                                      >
                                        ✕
                                      </button>
                                    )}
                                    <button
                                      onClick={() => deleteListing(listing.id)}
                                      disabled={actionLoading === listing.id}
                                      className="px-2.5 py-1.5 bg-red-500/10 text-red-400 text-[10px] font-bold tracking-wider rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                      title="Delete permanently"
                                    >
                                      🗑
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* User's Activity History */}
                        <div className="glass rounded-2xl p-6 border border-white/5">
                          <h3 className="font-heading font-bold tracking-widest uppercase text-sm mb-5 flex items-center gap-2">
                            <span>📋</span> Activity Log
                          </h3>
                          {userActivity.length === 0 ? (
                            <div className="text-center py-8 text-muted-dim text-sm">No activity logged for this user</div>
                          ) : (
                            <div className="space-y-3 max-h-[300px] overflow-y-auto custom-scrollbar pr-2">
                              {userActivity.map(act => (
                                <div key={act.id} className="relative pl-5 pb-3 border-b border-white/5 last:border-0">
                                  <span className="absolute left-0 top-1.5 w-2 h-2 bg-[#FFD700] rounded-full shadow-[0_0_5px_#FFD700]" />
                                  <span className="text-sm block font-semibold">{act.action_type}</span>
                                  {act.description && <span className="text-xs text-muted block mt-0.5">{act.description}</span>}
                                  <span className="text-[10px] text-muted-dim">{timeAgo(act.created_at)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </motion.div>
                    ) : (
                      <motion.div
                        key="empty"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="flex-1 flex items-center justify-center h-full min-h-[60vh]"
                      >
                        <div className="text-center">
                          <span className="text-5xl block mb-4 opacity-30">👈</span>
                          <p className="text-muted-dim font-heading text-sm tracking-wider">Select a user from the left panel</p>
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            )}

            {/* ─── LISTINGS TAB ────────────────────────────────────── */}
            {activeTab === 'listings' && (
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <h1 className="font-heading text-2xl font-bold flex items-center gap-3">
                    <span>📦</span> All Listings ({allListings.length})
                  </h1>
                  <div className="flex gap-2">
                    {(['all', 'pending', 'approved', 'rejected'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setListingFilter(f)}
                        className={`px-3 py-1.5 text-[10px] font-heading font-bold tracking-widest uppercase rounded-lg transition-colors border ${
                          listingFilter === f
                            ? 'bg-[#FFD700]/10 text-[#FFD700] border-[#FFD700]/30'
                            : 'bg-white/5 text-muted border-white/10 hover:bg-white/10'
                        }`}
                      >
                        {f} {f === 'pending' ? `(${metrics.pendingListings})` : ''}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Listings Table */}
                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-mid/50">
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Item</th>
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Type</th>
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Category</th>
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Status</th>
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Created</th>
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredListings.map(listing => (
                          <tr key={listing.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-lg bg-surface flex-shrink-0 overflow-hidden">
                                  {listing.image_url ? (
                                    /* eslint-disable-next-line @next/next/no-img-element */
                                    <img src={listing.image_url} alt="" className="w-full h-full object-cover" />
                                  ) : (
                                    <div className="w-full h-full flex items-center justify-center text-lg opacity-20">📦</div>
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <span className="text-sm font-semibold block truncate max-w-[200px]">{listing.title}</span>
                                  <span className="text-[10px] text-muted-dim font-mono truncate block">{listing.id.slice(0, 8)}...</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-xs uppercase tracking-wider text-muted font-heading">{listing.listing_type}</td>
                            <td className="p-4 text-xs text-muted">{listing.category}</td>
                            <td className="p-4">
                              <span className={`text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded border ${getStatusStyle(listing.status)}`}>
                                {listing.status}
                              </span>
                            </td>
                            <td className="p-4 text-xs text-muted-dim">{timeAgo(listing.created_at)}</td>
                            <td className="p-4">
                              <div className="flex gap-1.5 justify-end">
                                {listing.status !== 'approved' && (
                                  <button
                                    onClick={() => updateListingStatus(listing.id, 'approved')}
                                    disabled={actionLoading === listing.id}
                                    className="px-3 py-1.5 bg-[#39FF14]/10 text-[#39FF14] text-[10px] font-bold tracking-wider uppercase rounded-lg hover:bg-[#39FF14]/20 transition-colors disabled:opacity-50"
                                  >
                                    Approve
                                  </button>
                                )}
                                {listing.status !== 'rejected' && (
                                  <button
                                    onClick={() => updateListingStatus(listing.id, 'rejected')}
                                    disabled={actionLoading === listing.id}
                                    className="px-3 py-1.5 bg-[#FFC800]/10 text-[#FFC800] text-[10px] font-bold tracking-wider uppercase rounded-lg hover:bg-[#FFC800]/20 transition-colors disabled:opacity-50"
                                  >
                                    Reject
                                  </button>
                                )}
                                <button
                                  onClick={() => deleteListing(listing.id)}
                                  disabled={actionLoading === listing.id}
                                  className="px-3 py-1.5 bg-red-500/10 text-red-400 text-[10px] font-bold tracking-wider uppercase rounded-lg hover:bg-red-500/20 transition-colors disabled:opacity-50"
                                >
                                  Delete
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                        {filteredListings.length === 0 && (
                          <tr>
                            <td colSpan={6} className="text-center py-12 text-muted-dim text-sm">No listings match the current filter</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {/* ─── TRANSACTIONS TAB ─────────────────────────────── */}
            {activeTab === 'transactions' && (
              <div className="p-6 space-y-6 overflow-y-auto custom-scrollbar">
                <h1 className="font-heading text-2xl font-bold flex items-center gap-3">
                  <span>💰</span> All Transactions ({allTransactions.length})
                  <span className="text-[10px] ml-auto font-heading tracking-widest uppercase text-muted-dim">Live from Supabase</span>
                </h1>

                <div className="glass rounded-2xl border border-white/5 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="bg-surface-mid/50">
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Item</th>
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Buyer</th>
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Seller</th>
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Amount</th>
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Payment</th>
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Buyer Contact</th>
                          <th className="p-4 text-[10px] font-heading font-bold tracking-widest uppercase text-muted-dim">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTransactions.map(tx => (
                          <tr key={tx.id} className="border-t border-white/5 hover:bg-white/[0.02] transition-colors">
                            <td className="p-4">
                              <span className="text-sm font-semibold">{tx.item_title}</span>
                              <span className="text-[10px] text-muted-dim font-mono block">{tx.listing_id?.slice(0, 8)}...</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm font-semibold block">{tx.buyer?.full_name || '—'}</span>
                              <span className="text-[10px] text-muted-dim font-mono">{tx.buyer?.email || '—'}</span>
                            </td>
                            <td className="p-4">
                              <span className="text-sm font-semibold block">{tx.seller?.full_name || '—'}</span>
                              <span className="text-[10px] text-muted-dim font-mono">{tx.seller?.email || '—'}</span>
                            </td>
                            <td className="p-4 text-sm font-mono font-bold text-neon-green">{formatPrice(tx.amount)}</td>
                            <td className="p-4">
                              <span className={`text-[10px] font-bold tracking-wider uppercase px-2 py-1 rounded border ${
                                tx.payment_method === 'cod' ? 'bg-[#FFC800]/10 text-[#FFC800] border-[#FFC800]/30' : 'bg-[#39FF14]/10 text-[#39FF14] border-[#39FF14]/30'
                              }`}>
                                {tx.payment_method?.toUpperCase()}
                              </span>
                            </td>
                            <td className="p-4">
                              <div className="text-xs">
                                {tx.buyer_mobile && <span className="block text-muted">📱 {tx.buyer_mobile}</span>}
                                {tx.buyer_address && <span className="block text-muted-dim text-[10px] truncate max-w-[150px]">📍 {tx.buyer_address}</span>}
                              </div>
                            </td>
                            <td className="p-4 text-xs text-muted-dim">{timeAgo(tx.created_at)}</td>
                          </tr>
                        ))}
                        {allTransactions.length === 0 && (
                          <tr>
                            <td colSpan={7} className="text-center py-12 text-muted-dim text-sm">No transactions recorded yet</td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
