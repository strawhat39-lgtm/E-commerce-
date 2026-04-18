'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { getCartItems, removeFromCart, clearCart } from '@/utils/cart';
import { ListingItem } from '@/types';
import { fetchFromApi } from '@/utils/api';
import { supabase } from '@/utils/supabase';
import { useCurrency } from '@/context/CurrencyContext';

export default function CartPage() {
  const { formatPrice } = useCurrency();
  const router = useRouter();
  const [items, setItems] = useState<ListingItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'success'>('details');
  const [address, setAddress] = useState('');
  const [mobile, setMobile] = useState('');
  const [bio, setBio] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'upi' | 'cod'>('upi');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [userTier, setUserTier] = useState<string>('bronze');

  useEffect(() => {
    setItems(getCartItems());
    setIsMounted(true);
    // Fetch tier
    const getTier = async () => {
      const { data } = await supabase.auth.getSession();
      if (!data.session) return;
      const meRes = await fetchFromApi('/me');
      if (meRes?.profile?.membership_tier) {
         setUserTier(meRes.profile.membership_tier);
      }
    };
    getTier();
  }, []);

  const subtotal = items.reduce((sum, item) => sum + (item.price || item.rentPrice || item.estimatedValue || 150), 0);
  const platformFeePercent = userTier === 'gold' ? 1.5 : userTier === 'silver' ? 3 : 5;
  const platformFee = Math.round(subtotal * (platformFeePercent / 100));
  const totalAmount = subtotal + platformFee;
  const totalCarbon = (items.length * 2.3).toFixed(1);
  const impactLevel = items.length > 5 ? 'High' : items.length > 2 ? 'Medium' : 'Low';
  const impactColor = impactLevel === 'High' ? 'text-accent-orange' : impactLevel === 'Medium' ? 'text-accent-gold' : 'text-neon-green';

  const handleRemove = (id: string) => {
    removeFromCart(id);
    setItems(getCartItems());
  };

  const handleContinueCheckout = async () => {
    if (!address || !mobile || !bio) {
      alert("Please enter all details: Address, Mobile Number, and Bio data");
      return;
    }
    
    if (paymentMethod === 'cod') {
      // Skip payment step, go straight to success processing
      finalizePayment();
      return;
    }

    setCheckoutStep('payment');
    setIsProcessing(true);
    
    try {
      const response = await fetchFromApi('/checkout/intent', {
        method: 'POST',
        body: JSON.stringify({ amount: totalAmount, note: 'Reuse_mart Cart' })
      });
      if (response && response.qrDataUrl) {
        setQrCode(response.qrDataUrl);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  const finalizePayment = async () => {
    setIsProcessing(true);
    try {
      const response = await fetchFromApi('/checkout/confirm', {
        method: 'POST',
        body: JSON.stringify({ 
          details: {
            address,
            mobile,
            bio
          }
        })
      });
      if (response && response.receiptUrl) {
        setQrCode(response.receiptUrl);
        setCheckoutStep('success');
        
        // --- PURCHASE PERSISTENCE INJECTION ---
        const { data: { session } } = await supabase.auth.getSession();
        const userId = session?.user?.id || 'guest';
        const purchasesKey = `reuse_mart_purchases_${userId}`;
        const existing = JSON.parse(localStorage.getItem(purchasesKey) || '[]');
        
        // Fetch full listing data from Supabase for each item to get seller metadata
        const enrichedItems = await Promise.all(items.map(async (item) => {
          let desc = item.description || '';
          let ownerId = (item as any).owner_id || item.userId || 'system';

          // Fetch the actual listing from DB to get the real description with seller tags
          try {
            const { data: dbListing } = await supabase
              .from('item_listings')
              .select('description, owner_id')
              .eq('id', item.id)
              .single();
            if (dbListing) {
              desc = dbListing.description || desc;
              ownerId = dbListing.owner_id || ownerId;
            }
          } catch (e) {
            console.warn('Could not fetch listing details for:', item.id);
          }

          const sName = desc.match(/\[S_NAME:(.*?)\]/i)?.[1]?.trim() || 'Verified Eco-Seller';
          const sWa = desc.match(/\[S_WA:(.*?)\]/i)?.[1]?.trim() || '';
          const sLoc = desc.match(/\[S_LOC:(.*?)\]/i)?.[1]?.trim() || 'Local';
          const priceMatch = desc.match(/\[PRICE:(.*?)\]/i)?.[1]?.trim();
          const finalPrice = priceMatch ? parseFloat(priceMatch) : ((item as any).price || (item as any).rentPrice || (item as any).estimatedValue || 0);

          return {
            ...item,
            sellerName: sName,
            sellerWhatsapp: sWa,
            sellerLocation: sLoc,
            ownerId: ownerId,
            purchasedAt: new Date().toISOString(),
            pricePaid: finalPrice,
          };
        }));
        
        localStorage.setItem(purchasesKey, JSON.stringify([...existing, ...enrichedItems]));

        // --- SAVE TRANSACTIONS TO SUPABASE ---
        const transactionRecords = enrichedItems.map(item => ({
          buyer_id: userId,
          seller_id: item.ownerId !== 'system' ? item.ownerId : null,
          listing_id: item.id,
          item_title: item.title,
          amount: item.pricePaid || 0,
          payment_method: paymentMethod,
          buyer_address: address,
          buyer_mobile: mobile,
          buyer_bio: bio,
          status: 'completed',
        }));

        await supabase.from('transactions').insert(transactionRecords).then(({ error }) => {
          if (error) console.warn('Transaction log insert warning:', error.message);
        });

        // --- DISPATCH BREVO BACKEND TRANSACTION SIGNAL ---
        if (session?.user?.email) {
           fetchFromApi('/notifications/send-order-message', {
             method: 'POST',
             body: JSON.stringify({
               userEmail: session.user.email,
               orderItems: enrichedItems,
               paymentMethod: paymentMethod,
               buyerDetails: {
                 mobile,
                 address,
                 bio
               }
             })
           }).catch(err => console.error("Brevo dispatch block failed silently:", err));
        }
        // --------------------------------------

        clearCart();
        setItems([]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isMounted) return null;

  return (
    <div className="min-h-screen bg-background text-white pb-24">
      {/* Dynamic Background */}
      <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon-green/5 rounded-full blur-[150px]" />
      </div>

      {/* Header */}
      <header className="fixed top-0 inset-x-0 z-50 glass border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <Link href="/dashboard" className="flex items-center gap-2 text-neon-green hover:opacity-80 transition-opacity">
            <span className="text-xl">🪩</span>
            <span className="font-heading font-bold tracking-widest uppercase">Reuse_mart</span>
          </Link>
          <Link href="/marketplace" className="text-sm font-heading tracking-widest text-muted hover:text-white transition-colors uppercase">
            Continue Shopping
          </Link>
        </div>
      </header>

      <main className="relative z-10 max-w-5xl mx-auto px-4 pt-28">
        <h1 className="font-heading text-4xl font-bold mb-8">Your Cart</h1>
        
        {items.length === 0 ? (
          <div className="glass rounded-3xl p-12 text-center">
            <span className="text-6xl mb-4 block">🛒</span>
            <h2 className="text-2xl font-bold mb-2">Your cart is empty</h2>
            <p className="text-muted mb-8">Looks like you haven't added anything to your cart yet.</p>
            <Link href="/marketplace" className="inline-block px-8 py-3 bg-neon-green text-black font-bold uppercase tracking-widest rounded-xl hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all">
              Discover Items
            </Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-4">
              <AnimatePresence>
                {items.map((item) => (
                  <motion.div
                    key={item.id}
                    layout
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="glass rounded-2xl p-4 flex gap-4 items-center"
                  >
                    <div className="w-24 h-24 rounded-xl overflow-hidden bg-surface-high flex-shrink-0">
                      {item.image ? (
                        /* eslint-disable-next-line @next/next/no-img-element */
                        <img src={item.image} alt={item.title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-3xl opacity-20">📦</div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h3 className="font-bold text-lg">{item.title}</h3>
                      <p className="text-sm text-neon-green uppercase tracking-widest font-heading mt-1">{formatPrice(item.price || item.rentPrice || item.estimatedValue || 150)}</p>
                      <p className="text-xs text-muted mt-2">{item.category} • {item.condition}</p>
                    </div>
                    <button 
                      onClick={() => handleRemove(item.id)}
                      className="text-red-400 hover:text-red-300 p-2 text-sm uppercase tracking-widest font-heading transition-colors"
                    >
                      Remove
                    </button>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            <div className="glass rounded-3xl p-6 h-fit sticky top-24">
              <h3 className="font-heading font-bold text-xl mb-6">Order Summary</h3>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between text-muted">
                   <span>Subtotal ({items.length} items)</span>
                   <span>{formatPrice(subtotal)}</span>
                </div>
                <div className="flex justify-between text-muted text-sm">
                   <span>Platform Fee ({platformFeePercent}%)</span>
                   <span>+ {formatPrice(platformFee)}</span>
                </div>
                <div className="flex justify-between text-neon-green text-sm">
                   <span>Eco Discount</span>
                   <span>- {formatPrice(0)}</span>
                </div>
                <div className="flex justify-between text-muted">
                   <span>Shipping</span>
                   <span>Free</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between font-bold text-xl mb-4">
                   <span>Final Price</span>
                   <span>{formatPrice(totalAmount)}</span>
                </div>
                <div className="text-center text-xs text-muted-dim italic mt-2">
                   Platform fee supports our sustainable ecosystem 🌱
                </div>
                {userTier !== 'gold' && (
                  <div className="text-center text-[10px] text-accent-gold mt-1">
                    <Link href="/dashboard?view=membership" className="hover:underline">Upgrade plan to reduce platform fees and save money.</Link>
                  </div>
                )}
              </div>

              {/* Carbon Footprint Panel */}
              <div className="mt-6 mb-6 p-4 rounded-2xl bg-white/5 border border-white/10 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-neon-green/10 rounded-full blur-2xl -mr-10 -mt-10 pointer-events-none" />
                <h4 className="font-heading tracking-widest uppercase text-xs text-muted-dim mb-3 flex items-center gap-2">
                  <span>🌍</span> Carbon Footprint
                </h4>
                <div className="flex items-center justify-between mb-4">
                  <span className="font-bold text-lg">{totalCarbon} kg CO₂</span>
                  <span className={`text-[10px] uppercase tracking-widest font-bold px-2 py-1 rounded bg-black/40 border border-white/5 ${impactColor}`}>
                    {impactLevel} Impact 
                  </span>
                </div>
                
                {/* Better Alternative Box */}
                {impactLevel !== 'Low' && (
                  <div className="mb-4 text-xs bg-accent-gold/10 border border-accent-gold/30 rounded-lg p-3 text-accent-gold leading-relaxed">
                    <strong>Tip:</strong> You have {items.length} items. Exploring local rentals instead of purchases could reduce this footprint by ~35%.
                  </div>
                )}
                
                <label className="flex items-start gap-3 p-3 rounded-xl border border-white/5 hover:border-white/10 transition-colors cursor-pointer group">
                  <input type="checkbox" className="mt-1 flex-shrink-0 w-4 h-4 rounded border-white/20 bg-transparent text-neon-green focus:ring-neon-green focus:ring-offset-0 transition-all checked:bg-neon-green" />
                  <div className="flex-1">
                    <span className="block text-sm font-semibold group-hover:text-neon-green transition-colors">Offset Carbon ({formatPrice(15)})</span>
                    <span className="block text-[10px] text-muted-dim mt-0.5">Plant a tree & neutralize delivery emissions</span>
                  </div>
                </label>
              </div>

              <button
                onClick={() => setIsCheckoutOpen(true)}
                className="w-full py-4 bg-neon-green text-black rounded-xl font-heading font-bold tracking-widest uppercase hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] transition-all"
              >
                Proceed to Checkout
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Checkout Overlay */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md"
          >
            <motion.div
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="glass max-w-md w-full rounded-3xl p-8 relative"
            >
              <button 
                onClick={() => setIsCheckoutOpen(false)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-muted hover:text-white transition-colors"
              >
                ✕
              </button>

              {checkoutStep === 'details' && (
                <>
                  <h2 className="font-heading text-2xl font-bold mb-6">Order Details</h2>
                  <div className="space-y-4 max-h-[60vh] overflow-y-auto px-1 custom-scrollbar">
                    <div>
                      <label className="block text-[10px] font-heading tracking-widest uppercase text-muted-dim mb-2">Mobile Number</label>
                      <input
                        type="tel"
                        value={mobile}
                        onChange={(e) => setMobile(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/20 focus:outline-none focus:border-neon-green/50"
                        placeholder="+91 00000 00000"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-heading tracking-widest uppercase text-muted-dim mb-2">Delivery Location</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-green/50 min-h-[80px]"
                        placeholder="123 Eco Street House No..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-heading tracking-widest uppercase text-muted-dim mb-2">Bio / Order Notes</label>
                      <textarea
                        value={bio}
                        onChange={(e) => setBio(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-green/50 min-h-[100px]"
                        placeholder="Tell us about your recycling journey or add delivery notes..."
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-heading tracking-widest uppercase text-muted-dim mb-3">Payment Method</label>
                      <div className="grid grid-cols-2 gap-3">
                        <button
                          onClick={() => setPaymentMethod('upi')}
                          className={`py-3 rounded-xl border font-heading text-[10px] tracking-widest uppercase transition-all ${
                            paymentMethod === 'upi' 
                              ? 'bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_10px_rgba(57,255,20,0.2)]' 
                              : 'bg-white/5 border-white/10 text-muted hover:border-white/20'
                          }`}
                        >
                          Credit / UPI
                        </button>
                        <button
                          onClick={() => setPaymentMethod('cod')}
                          className={`py-3 rounded-xl border font-heading text-[10px] tracking-widest uppercase transition-all ${
                            paymentMethod === 'cod' 
                              ? 'bg-neon-green/20 border-neon-green text-neon-green shadow-[0_0_10px_rgba(57,255,20,0.2)]' 
                              : 'bg-white/5 border-white/10 text-muted hover:border-white/20'
                          }`}
                        >
                          Cash on Delivery
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleContinueCheckout}
                      className="w-full py-4 bg-neon-green text-black rounded-xl font-heading font-bold tracking-widest uppercase hover:shadow-[0_0_20px_rgba(57,255,20,0.3)] transition-all mt-4"
                    >
                      Continue to Payment
                    </button>
                  </div>
                </>
              )}

              {checkoutStep === 'payment' && (
                <div className="text-center">
                  <h2 className="font-heading text-2xl font-bold mb-2">Scan & Pay</h2>
                  <p className="text-muted text-sm mb-8">Use any UPI app to safely secure your items securely.</p>
                  
                  <div className="bg-white rounded-2xl p-4 w-56 h-56 mx-auto mb-6 flex items-center justify-center overflow-hidden">
                    {isProcessing && !qrCode ? (
                      <div className="animate-spin w-8 h-8 border-4 border-neon-green border-t-transparent rounded-full" />
                    ) : qrCode ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={qrCode} alt="UPI Payment" className="w-full h-full object-contain mix-blend-multiply" />
                    ) : (
                      <p className="text-black font-bold">Error loading QR</p>
                    )}
                  </div>
                  
                  <button
                    onClick={finalizePayment}
                    disabled={isProcessing || !qrCode}
                    className="w-full py-4 bg-neon-green text-black rounded-xl font-heading font-bold tracking-widest uppercase hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    {isProcessing ? 'Verifying...' : 'Simulate Payment Success'}
                  </button>
                </div>
              )}

              {checkoutStep === 'success' && (
                <div className="text-center py-6">
                  <div className="w-20 h-20 bg-neon-green/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-neon-green/50">
                    <span className="text-4xl">🎉</span>
                  </div>
                  <h2 className="font-heading text-3xl font-bold mb-4 text-neon-green">Order Secured!</h2>
                  <p className="text-muted leading-relaxed mb-8">
                    Your shipment is being prepared. Thank you for participating in the circular economy!
                  </p>
                  <Link
                    href="/dashboard"
                    className="inline-block w-full py-4 glass text-white rounded-xl font-heading font-bold tracking-widest uppercase hover:bg-white/10 transition-colors"
                  >
                    Return to Dashboard
                  </Link>
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
