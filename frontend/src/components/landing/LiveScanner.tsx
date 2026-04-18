'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Html5Qrcode } from 'html5-qrcode';
import { useLanguage } from '@/context/LanguageContext';

export default function LiveScanner({ onClose }: { onClose: () => void }) {
  const router = useRouter();
  const { t } = useLanguage();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [scannedItem, setScannedItem] = useState<any>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const processDecodedText = async (decodedText: string) => {
    if (!decodedText) return;
    setSuccess(decodedText.startsWith('PRODUCT_ID:') ? t('live_scan_fetching') : decodedText);
    
    if (scannerRef.current && scannerRef.current.isScanning) {
      scannerRef.current.stop().catch(console.error);
    }

    if (decodedText.startsWith('PRODUCT_ID:')) {
      const id = decodedText.split(':')[1];
      try {
        // Fetch specific product to display inline!
        const res = await fetch(`http://localhost:5001/api/listings`);
        const data = await res.json();
        const found = data.data?.find((i:any) => i.id === id);
        if (found) {
           setScannedItem(found);
           setSuccess(null);
           return;
        } else {
           // fallback to router
           router.push(`/marketplace?productId=${id}`);
        }
      } catch (e) {
           router.push(`/marketplace?productId=${id}`);
      }
    } else {
       setTimeout(() => router.push(`/marketplace?q=${encodeURIComponent(decodedText)}`), 500);
    }
  };

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !scannerRef.current) return;
    
    scannerRef.current.scanFile(file, false)
      .then(decodedText => {
        processDecodedText(decodedText);
      })
      .catch(err => {
        setErrorMsg(t('live_scan_fail'));
        setTimeout(() => setErrorMsg(null), 3000);
      });
  };

  useEffect(() => {
    let isMounted = true;
    
    const startScanner = async () => {
      try {
        const html5QrCode = new Html5Qrcode("reader");
        scannerRef.current = html5QrCode;

        await html5QrCode.start(
          { facingMode: "environment" },
          { fps: 15, qrbox: { width: 280, height: 280 }, aspectRatio: 1.0 },
          (decodedText) => {
            if (!isMounted) return;
            processDecodedText(decodedText);
          },
          (errorMessage) => {
            // parse errors are normal (no qr code in view)
          }
        );
      } catch (err) {
        console.error("Camera access failed", err);
        if (isMounted) setErrorMsg(t('live_scan_cam_err'));
      }
    };

    startScanner();

    return () => {
      isMounted = false;
      if (scannerRef.current && scannerRef.current.isScanning) {
        scannerRef.current.stop().catch(console.error);
      }
    };
  }, [router]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/95 backdrop-blur-xl"
    >
      <div className="absolute top-8 right-8 cursor-pointer z-50 p-2" onClick={onClose}>
         <span className="text-white font-bold opacity-50 hover:opacity-100 uppercase tracking-widest text-sm">{t('live_scan_cancel')}</span>
      </div>
      
      <div className="relative w-full max-w-md bg-surface-low border-2 border-neon-green/30 rounded-3xl overflow-hidden glass shadow-[0_0_50px_rgba(57,255,20,0.2)] flex flex-col items-center">
        
        {/* Header */}
        <div className="w-full bg-surface-high/80 p-4 border-b border-white/5 text-center">
            <h3 className="font-heading font-bold text-neon-green tracking-widest uppercase">{t('live_scan_title')}</h3>
        </div>

        {/* Live Camera Feed container */}
        <div className="w-full aspect-[4/5] relative bg-black flex items-center justify-center overflow-hidden">
          
          {scannedItem ? (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-surface-mid z-40 flex flex-col items-center justify-center p-6 text-center shadow-inner overflow-y-auto">
               <div className="w-40 h-40 mb-4 rounded-xl overflow-hidden border-2 border-neon-green shadow-[0_0_15px_#39FF14]">
                 <img src={scannedItem.image_url || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff'} alt="product" className="w-full h-full object-cover" />
               </div>
               <span className="text-neon-green font-bold text-xs uppercase tracking-widest whitespace-nowrap mb-1">
                 {scannedItem.listing_type}
               </span>
               <h2 className="text-white font-heading font-black text-2xl truncate w-full mb-2">{scannedItem.title}</h2>
               <p className="text-white/60 text-sm line-clamp-2 mb-6">{scannedItem.description}</p>
               
               <button 
                  onClick={() => router.push(`/marketplace?productId=${scannedItem.id}`)}
                  className="w-full py-3 bg-neon-green rounded-xl text-black font-heading font-bold uppercase tracking-wider hover:brightness-110 active:scale-95 transition-all shadow-[0_0_15px_rgba(57,255,20,0.4)]"
               >
                 {t('live_scan_btn')}
               </button>
            </motion.div>
          ) : (
            <>
              <div id="reader" className="w-full h-full object-cover"></div>
              
              {/* Laser Line */}
              {!success && !scannedItem && (
                <motion.div
                  animate={{ top: ['0%', '100%', '0%'] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "linear" }}
                  className="absolute left-0 right-0 h-1 bg-neon-green shadow-[0_0_15px_#39FF14] z-20 pointer-events-none"
                />
              )}

              {/* Error Flash */}
              {errorMsg && (
                 <motion.div 
                   initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="absolute inset-0 bg-red-500/20 z-10 pointer-events-none" 
                 />
              )}

              {/* Success Overlay */}
              {success && (
                 <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} className="absolute inset-0 bg-neon-green/90 z-30 flex flex-col items-center justify-center p-6 text-center">
                   <span className="text-6xl mb-4">✅</span>
                   <h2 className="text-black font-heading font-black text-2xl uppercase tracking-widest">{t('live_scan_match')}</h2>
                   <p className="text-black/80 font-bold mt-2">{success}</p>
                 </motion.div>
              )}
            </>
          )}

        </div>

        {/* Footer info */}
        <div className="w-full p-6 text-center space-y-2 h-32 flex flex-col justify-center">
           {errorMsg ? (
              <p className="text-red-400 font-bold uppercase tracking-widest text-sm">⚠️ {errorMsg}</p>
            ) : success ? (
              <p className="text-neon-green font-bold uppercase tracking-widest text-sm">{t('live_scan_validating')}</p>
           ) : (
              <div className="flex flex-col items-center justify-center space-y-4">
                <p className="text-white/70 text-sm">{t('live_scan_prompt')}</p>
                
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  accept="image/*" 
                  hidden 
                  onChange={handleFileUpload} 
                />
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="px-6 py-2 border border-white/20 glass text-white text-xs font-heading tracking-widest uppercase hover:bg-white/10 rounded-lg transition-colors"
                >
                  {t('live_scan_upload')}
                </button>
              </div>
           )}
        </div>

      </div>
    </motion.div>
  );
}
