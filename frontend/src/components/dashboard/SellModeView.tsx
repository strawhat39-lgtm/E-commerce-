'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { User } from '@/types';
import { supabase } from '@/utils/supabase';
import { fetchFromApi } from '@/utils/api';
import imageCompression from 'browser-image-compression';

interface SellModeViewProps {
  user: User;
  onAction?: (points: number) => void;
}

export default function SellModeView({ user, onAction }: SellModeViewProps) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);

  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('Apparel');
  const [conditionDetails, setConditionDetails] = useState('');

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

        const fileName = `${Date.now()}_${file.name.replace(/\s+/g, '-')}`;
        
        const { data, error } = await supabase.storage.from('listings').upload(fileName, file);

        if (!error && data) {
          const { data: { publicUrl } } = supabase.storage.from('listings').getPublicUrl(data.path);
          imageUrl = publicUrl;
        } else {
          console.error("Storage upload error:", error);
        }
      }

      await fetchFromApi('/listings', {
        method: 'POST',
        body: JSON.stringify({
          title,
          description: conditionDetails,
          category,
          condition: 'good',
          listing_type: 'buy',
          image_url: imageUrl,
          price: 0
        })
      });

      setMediaFiles([]);
      setTitle('');
      setConditionDetails('');
      if (onAction) onAction(250);
    } catch (e) {
      console.error("Publishing error:", e);
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
            <h3 className="font-heading text-lg font-bold">List a New Item</h3>
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

            {/* Inputs */}
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">Item Title</label>
                <input value={title} onChange={(e) => setTitle(e.target.value)} type="text" placeholder="e.g. Vintage Leather Jacket" className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors" />
              </div>
              <div className="space-y-1.5">
                <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">Category</label>
                <select value={category} onChange={(e) => setCategory(e.target.value)} title="category" className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors appearance-none">
                  <option>Apparel</option>
                  <option>Electronics</option>
                  <option>Furniture</option>
                </select>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-heading uppercase tracking-widest text-muted-dim">Condition & Details</label>
              <textarea value={conditionDetails} onChange={(e) => setConditionDetails(e.target.value)} placeholder="Describe the item's history and condition..." rows={3} className="w-full bg-surface-high border border-white/10 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:border-neon-green/50 transition-colors resize-none" />
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
                  Publishing & Scoring...
                </>
              ) : (
                'Publish & Earn 250 Pts 🚀'
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
          <motion.div initial={{ opacity: 0, x: 15 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }} className="glass rounded-2xl p-6">
            <div className="flex justify-between items-center mb-4 border-b border-white/5 pb-3">
              <h3 className="font-heading text-sm font-semibold tracking-widest uppercase">Active Listings</h3>
              <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px] font-bold">2</span>
            </div>
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                 <span className="truncate max-w-[150px]">Vintage Denim</span>
                 <span className="text-neon-green font-bold">3 bids</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                 <span className="truncate max-w-[150px]">Toaster Oven</span>
                 <span className="text-muted-dim text-xs">Waiting</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
