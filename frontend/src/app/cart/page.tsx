'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { getCartItems, removeFromCart, clearCart } from '@/utils/cart';
import { ListingItem } from '@/types';
import { fetchFromApi } from '@/utils/api';

export default function CartPage() {
  const [items, setItems] = useState<ListingItem[]>([]);
  const [isMounted, setIsMounted] = useState(false);
  
  // Checkout States
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'details' | 'payment' | 'success'>('details');
  const [address, setAddress] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);

  useEffect(() => {
    setItems(getCartItems());
    setIsMounted(true);
  }, []);

  const totalAmount = items.reduce((sum, item) => sum + (item.rentPrice || item.estimatedValue || 150), 0);

  const handleRemove = (id: string) => {
    removeFromCart(id);
    setItems(getCartItems());
  };

  const handleContinueCheckout = async () => {
    if (!address) return alert("Please enter your address");
    
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
        body: JSON.stringify({ details: address })
      });
      if (response && response.receiptUrl) {
        setQrCode(response.receiptUrl);
        setCheckoutStep('success');
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
                      <p className="text-sm text-neon-green uppercase tracking-widest font-heading mt-1">₹{item.rentPrice || item.estimatedValue || 150}</p>
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
                  <span>₹{totalAmount}</span>
                </div>
                <div className="flex justify-between text-neon-green text-sm">
                  <span>Eco Discount</span>
                  <span>- ₹0</span>
                </div>
                <div className="flex justify-between text-muted">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="h-px bg-white/10 my-4" />
                <div className="flex justify-between font-bold text-xl">
                  <span>Total</span>
                  <span>₹{totalAmount}</span>
                </div>
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
                  <h2 className="font-heading text-2xl font-bold mb-6">Shipping Details</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-heading tracking-widest uppercase text-muted-dim mb-2">Delivery Address</label>
                      <textarea
                        value={address}
                        onChange={(e) => setAddress(e.target.value)}
                        className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white placeholder-white/20 focus:outline-none focus:border-neon-green/50 min-h-[100px]"
                        placeholder="123 Eco Street..."
                      />
                    </div>
                    <button
                      onClick={handleContinueCheckout}
                      className="w-full py-4 bg-neon-green text-black rounded-xl font-heading font-bold tracking-widest uppercase hover:opacity-90 transition-opacity mt-4"
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
