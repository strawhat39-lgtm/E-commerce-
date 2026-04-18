'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/types';
import { supabase } from '@/utils/supabase';
import { API_URL, fetchFromApi } from '@/utils/api';
import imageCompression from 'browser-image-compression';
import { useCurrency } from '@/context/CurrencyContext';

interface SellModeViewProps {
  user: User;
  onAction?: (points: number) => void;
  mode?: 'sell' | 'rent' | 'swap';
}

export default function SellModeView({ user, onAction, mode = 'sell' }: SellModeViewProps) {
  const { currency } = useCurrency();
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Apparel & Fashion');
  const [conditionDetails, setConditionDetails] = useState('');
  const [price, setPrice] = useState('');
  const [sellerName, setSellerName] = useState(user.name || '');
  const [sellerWhatsapp, setSellerWhatsapp] = useState('');
  const [sellerLocation, setSellerLocation] = useState('');

  const [activeListings, setActiveListings] = useState<any[]>([]);
  const [listingCounts, setListingCounts] = useState({ buy: 0, rent: 0, swap: 0 });
  const [publishStatus, setPublishStatus] = useState<'pending' | 'error' | null>(null);

  const fetchActiveListings = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session || !session.user) return;
    
    const { data, error } = await supabase
      .from('item_listings')
      .select('*')
      .eq('owner_id', session.user.id)
      .order('created_at', { ascending: false });

    if (data && !error) {
      setActiveListings(data);
      setListingCounts({
        buy: data.filter(i => i.listing_type === 'buy').length,
        rent: data.filter(i => i.listing_type === 'rent').length,
        swap: data.filter(i => i.listing_type === 'swap').length,
      });
    }
  };

  useEffect(() => {
    fetchActiveListings();

    const setupListener = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session || !session.user) return;

      const channelId = `dashboard_listings_${Date.now()}_${Math.random()}`;
      const channel = supabase
        .channel(channelId)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: 'item_listings', filter: `owner_id=eq.${session.user.id}` },
          async (payload) => {
            fetchActiveListings();
            
            // Auto payout 250 coins strictly upon approval transition
            if (payload.eventType === 'UPDATE') {
              if (payload.old.status === 'pending' && payload.new.status === 'approved') {
                try {
                  const { data: profile } = await supabase.from('profiles').select('eco_points').eq('id', session.user.id).single();
                  if (profile) {
                     await supabase.from('profiles').update({ eco_points: profile.eco_points + 250 }).eq('id', session.user.id);
                     if (onAction) onAction(250);
                  }
                } catch (e) { console.error(e) }
              }
            }
          }
        )
        .subscribe();
        
      return () => { supabase.removeChannel(channel); };
    };
    setupListener();
  }, []);

  const handleDeleteListing = async (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to permanently delete "${title}"?`)) {
      await supabase.from('item_listings').delete().eq('id', id);
      // Realtime listener triggers local re-fetch automatically!
    }
  };

  const handlePublish = async () => {
    if (!title || isPublishing) return;
    setIsPublishing(true);

    try {
      let imageUrl = null;

      if (mediaFiles.length > 0) {
        let file = mediaFiles[0]; // Take first file as primary

        // 1. Video Protection (Under 5MB Rule)
        if (file.type.startsWith('video/')) {
          if (file.size > 5 * 1024 * 1024) {
            alert('Video exceeds 5MB! Please select a smaller video to ensure high-speed processing.');
            setIsPublishing(false);
            return;
          }
        }

        // 2. Image Compression
        if (file.type.startsWith('image/')) {
          try {
            const options = {
              maxSizeMB: 1,
              maxWidthOrHeight: 1920,
              useWebWorker: true,
            };
            file = await imageCompression(file, options);
          } catch (compressError) {
            console.error('Image compression failed:', compressError);
          }
        }

        const formData = new FormData();
        formData.append('media', file, file.name);

        const uploadRes = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData
        });

        if (uploadRes.ok) {
          const uploadData = await uploadRes.json();
          imageUrl = uploadData.url;
        } else {
          console.error("Storage upload error:", await uploadRes.text());
        }
      }

      const { data: { session } } = await supabase.auth.getSession();
      
      await supabase.from('item_listings').insert({
        owner_id: session?.user?.id,
        title,
        description: `${conditionDetails}\n\n[S_NAME:${sellerName}]\n[S_WA:${sellerWhatsapp}]\n[S_LOC:${sellerLocation}]\n[PRICE:${parseFloat(price) || 0}]`,
        category,
        condition: 'good',
        listing_type: mode === 'sell' ? 'buy' : mode,
        image_url: imageUrl,
        status: 'pending'
      });

      setMediaFiles([]);
      setTitle('');
      setConditionDetails('');
      setPublishStatus('pending');
      setTimeout(() => setPublishStatus(null), 6000);
      // NOTE: We do not call onAction(250) here anymore. It's handled by Realtime Approval.
    } catch (e) {
      console.error("Publishing error:", e);
      setPublishStatus('error');
      setTimeout(() => setPublishStatus(null), 4000);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  
  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setMediaFiles(prev => [...prev, ...Array.from(e.dataTransfer.files as FileList)]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setMediaFiles(prev => [...prev, ...Array.from(e.target.files as FileList)]);
    }
  };

  const removeFile = (index: number) => {
    setMediaFiles(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="space-y-6 pb-10">
      {/* Publish Status Banner */}
      {publishStatus === 'pending' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-2xl bg-[#FFC800]/10 border border-[#FFC800]/30 flex items-center gap-3">
          <span className="text-2xl">⏳</span>
          <div>
            <span className="font-heading font-bold text-sm text-[#FFC800] block">Listing Submitted — Pending Admin Approval</span>
            <span className="text-xs text-muted">Your listing will appear in the marketplace once an admin approves it. You&apos;ll earn 250 eco coins upon approval!</span>
          </div>
        </motion.div>
      )}
      {publishStatus === 'error' && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="p-4 rounded-2xl bg-red-500/10 border border-red-500/30 flex items-center gap-3">
          <span className="text-2xl">❌</span>
          <div>
            <span className="font-heading font-bold text-sm text-red-400 block">Publishing Failed</span>
            <span className="text-xs text-muted">Something went wrong. Please try again.</span>
          </div>
        </motion.div>
      )}

      {/* Seller Stats Row */}
      <motion.div 
        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} 
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Total Earnings', value: `$${user.earnings}`, icon: '💰', color: '#FFC800' },
          { label: 'Eco Impact', value: `${user.wasteDiverted}kg`, icon: '🌍', color: '#39FF14' },
          { label: 'Trust Rating', value: `${user.trustRating}/5.0`, icon: '⭐', color: '#0DFFC6' },
        ].map((stat, i) => (
          <div key={i} className="glass rounded-xl p-4 flex items-center gap-4">
            <span className="text-2xl">{stat.icon}</span>
            <div>
              <span className="text-[10px] font-heading tracking-widest uppercase text-muted-dim block mb-1">{stat.label}</span>
              <span className="font-heading text-xl font-bold" style={{ color: stat.color }}>{stat.value}</span>
            </div>
          </div>
        ))}
      </motion.div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left: Add Product Form */}
        <motion.div initial={{ opacity: 0, x: -15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.1 }} className="lg:col-span-2 glass rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6 border-b border-white/5 pb-4">
            <h3 className="font-heading text-lg font-bold">
              {mode === 'sell' ? 'List a New Item' : mode === 'rent' ? 'Offer for Rent' : 'Propose a Swap'}
            </h3>
            <span className="px-2 py-1 rounded bg-neon-green/10 text-neon-green text-[10px] uppercase font-bold tracking-wider">Fast Listing</span>
          </div>

          <div className="space-y-5">
            {/* Image Upload Area */}
            <div className="space-y-3">
              <label 
                htmlFor="mediaUpload"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`border-2 border-dashed ${isDragging ? 'border-neon-green bg-neon-green/10' : 'border-white/10 bg-surface-high/50'} rounded-xl h-40 flex flex-col items-center justify-center cursor-pointer hover:border-neon-green/50 hover:bg-white/5 transition-all group`}
              >
                <span className="text-3xl mb-2 group-hover:scale-110 transition-transform">📸</span>
                <span className="font-heading text-sm font-semibold">Drag & Drop Photos & Videos</span>
                <span className="text-[10px] text-muted-dim tracking-wider mt-1 uppercase">or click to browse from folder</span>
              </label>
              <input id="mediaUpload" type="file" multiple accept="image/*,video/*" className="hidden" onChange={handleFileChange} />
              
              {mediaFiles.length > 0 && (
                <div className="flex flex-wrap gap-3 mt-2">
                  {mediaFiles.map((file, i) => (
                    <div key={i} className="relative group w-20 h-20 bg-surface rounded-lg border border-white/10 flex items-center justify-center overflow-hidden">
                      {file.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(file)} alt="preview" className="w-full h-full object-cover" />
                      ) : (
                        <div className="flex flex-col items-center">
                          <span className="text-xl">🎥</span>
                          <span className="text-[8px] text-muted-dim max-w-full truncate px-1 mt-1">{file.name}</span>
                        </div>
                      )}
                      
                      <button 
                        type="button"
                        onClick={() => removeFile(i)}
                        className="absolute top-1 right-1 p-1 bg-black/70 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove file"
                      >
                        <span className="text-[10px] leading-none block">❌</span>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">
                  {mode === 'swap' ? 'What are you swapping?' : 'Item Title'}
                </label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder={mode === 'swap' ? 'e.g. Vintage Camera' : "e.g. Vintage Leather Jacket"} className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} title="category" className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors appearance-none">
                  <option>Apparel & Fashion</option>
                  <option>Electronics</option>
                  <option>Furniture</option>
                  <option>Tools & Hardware</option>
                  <option>Rescued Food</option>
                  <option>Raw Materials (Upcycle)</option>
                  <option>Textile Waste</option>
                  <option>Electronic Waste</option>
                </select>
              </div>
            </div>

            {(mode === 'sell' || mode === 'swap') && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">
                  {mode === 'swap' ? `Estimated Value (${currency === 'USD' ? '$' : '₹'})` : `Selling Price (${currency === 'USD' ? '$' : '₹'})`}
                </label>
                <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="500" className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors" />
              </div>
            )}

            {mode === 'swap' && (
              <div className="space-y-1.5">
                <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">What you want in return</label>
                <input 
                  type="text" 
                  placeholder="e.g. Gardening Tools, Books..."
                  className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors"
                />
              </div>
            )}

            {mode === 'rent' && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">Price Per Period ({currency === 'USD' ? '$' : '₹'})</label>
                  <input value={price} onChange={(e) => setPrice(e.target.value)} type="number" placeholder="15" className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">Period</label>
                  <select className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors">
                    <option>per day</option>
                    <option>per week</option>
                    <option>per month</option>
                  </select>
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">Condition & Details</label>
              <textarea value={conditionDetails} onChange={(e) => setConditionDetails(e.target.value)} placeholder="Describe the item's history and condition..." rows={3} className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors resize-none" />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">Public Seller Name</label>
                <input value={sellerName} onChange={(e) => setSellerName(e.target.value)} type="text" placeholder="Your display name for buyers" className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">Contact (WhatsApp for Buyers)</label>
                <input value={sellerWhatsapp} onChange={(e) => setSellerWhatsapp(e.target.value)} type="tel" placeholder="+91 00000 00000" className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors" />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">Pickup Location</label>
              <input value={sellerLocation} onChange={(e) => setSellerLocation(e.target.value)} type="text" placeholder="e.g. Central Park (Meet at West Gate)" className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors" />
            </div>

            <div className="bg-neon-green/10 border border-neon-green/20 rounded-xl p-4 flex gap-3 text-neon-green items-start">
              <span className="text-xl">⚠️</span>
              <div>
                <p className="font-heading font-bold text-[11px] tracking-widest uppercase mb-1">Face to Face Only</p>
                <p className="text-xs opacity-80 leading-relaxed">
                  You must communicate with buyers, renters, and swappers in person to manage interactions and exchanges safely. We currently do not provide logistics or shipping.
                </p>
              </div>
            </div>

            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="w-full py-4 text-sm bg-neon-green text-black font-heading font-bold tracking-wider uppercase rounded-xl hover:shadow-[0_0_30px_rgba(57,255,20,0.4)] transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-70 disabled:hover:scale-100 flex justify-center items-center gap-2"
            >
              {isPublishing ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-black" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Processing & Scoring...
                </>
              ) : (
                <>
                  <span className="block">{mode === 'sell' ? 'Publish Item' : mode === 'rent' ? 'List for Rent' : 'Propose Swap'} 🚀</span>
                  <span className="block text-[10px] text-black/60 tracking-normal capitalize mt-0.5 animate-pulse">Publish & Earn 250 Coins</span>
                </>
              )}
            </button>
          </div>
        </motion.div>

        {/* Right: AI Price & Tools */}
        <div className="flex flex-col gap-6">
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.15 }} className="glass rounded-2xl p-6 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-32 h-32 bg-accent-purple/20 rounded-full blur-3xl group-hover:bg-accent-purple/30 transition-colors pointer-events-none" />
            
            <div className="flex items-center gap-2 mb-4 relative z-10">
              <span className="text-xl">✨</span>
              <h3 className="font-heading text-sm font-semibold tracking-widest uppercase">Auto-Pricing AI</h3>
            </div>
            
            <p className="text-xs text-muted leading-relaxed mb-4 relative z-10">
              Our AI analyzes local secondhand markets to suggest the optimal price and ecological impact for your items.
            </p>

            <div className="bg-surface-high rounded-xl p-4 border border-white/5 relative z-10">
              <div className="flex justify-between items-center mb-2">
                <span className="text-[10px] uppercase font-bold text-muted-dim">Suggested Price</span>
                <span className="text-sm font-heading font-bold text-accent-gold">$45 - $60</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-[10px] uppercase font-bold text-muted-dim">Estimated Carbon Saved</span>
                <span className="text-xs font-heading font-bold text-neon-green">12.5 kg CO₂</span>
              </div>
            </div>
          </motion.div>

          {/* Active Listings Mini-widget */}
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6 flex flex-col flex-1">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
              <h3 className="font-heading text-sm font-semibold tracking-widest uppercase">Active Listings</h3>
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">{activeListings.length}</span>
            </div>
            
            <div className="flex text-[10px] uppercase font-bold tracking-widest text-muted-dim gap-3 mb-4">
              <span>Sell: {listingCounts.buy}</span>
              <span>Rent: {listingCounts.rent}</span>
              <span>Swap: {listingCounts.swap}</span>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
              {activeListings.length === 0 ? (
                <div className="text-sm text-center text-muted-dim py-4">No active listings</div>
              ) : activeListings.map(item => (
                <div key={item.id} className="flex items-center justify-between text-sm group p-2 rounded-lg hover:bg-white/5 transition-colors border border-transparent hover:border-white/10">
                   <div className="flex flex-col min-w-0 flex-1 pr-3">
                     <span className="truncate block font-semibold">{item.title}</span>
                     <span className="text-[10px] text-muted-dim tracking-wider uppercase mt-0.5">{item.listing_type}</span>
                   </div>
                   <div className="flex items-center gap-3">
                     <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider
                        ${item.status === 'pending' ? 'bg-[#FFC800]/10 text-[#FFC800] border border-[#FFC800]/30' : 
                          item.status === 'approved' ? 'bg-[#39FF14]/10 text-[#39FF14] border border-[#39FF14]/30' : 
                          'bg-red-500/10 text-red-500 border border-red-500/30'}
                     `}>
                       {item.status || 'available'}
                     </span>
                     <button
                        onClick={() => handleDeleteListing(item.id, item.title)}
                        className="p-1.5 rounded bg-transparent text-muted-dim hover:text-white hover:bg-red-500 hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all opacity-0 group-hover:opacity-100"
                        title="Delete Listing"
                     >
                       <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2M10 11v6M14 11v6"/></svg>
                     </button>
                   </div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
