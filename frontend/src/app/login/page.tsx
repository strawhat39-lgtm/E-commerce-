'use client';

import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { supabase } from '@/utils/supabase';

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isLoginState, setIsLoginState] = useState(true);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [authError, setAuthError] = useState('');

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setAuthError('');

    try {
      if (isLoginState) {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        router.push('/dashboard');
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } }
        });
        if (error) throw error;
        alert('Registration successful! If you have email confirmations enabled in Supabase, please check your inbox. Otherwise, you can now log in!');
        setIsLoginState(true);
      }
    } catch (err: any) {
      setAuthError(err.message || 'Authentication error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/dashboard`
        }
      });
      if (error) console.error('Error logging in with Google:', error.message);
    } catch (err) {
      console.error('Unexpected error:', err);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-background">
      {/* Dynamic Background */}
      <div className="absolute inset-0 pointer-events-none">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 200, ease: 'linear' }}
          className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]"
        >
          <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-neon-green/10 rounded-full blur-[150px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[600px] h-[600px] bg-accent-teal/10 rounded-full blur-[150px]" />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        <div className="glass rounded-3xl p-8 sm:p-10 border border-white/10 shadow-[0_0_50px_rgba(57,255,20,0.05)] relative overflow-hidden backdrop-blur-2xl">
          {/* Internal subtle glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-neon-green/5 rounded-full blur-[80px]" />

          <div className="relative z-10">
             {/* Logo / Header */}
            <div className="text-center mb-10">
              <Link href="/" className="inline-block group mb-6">
                <div className="w-16 h-16 rounded-2xl bg-neon-green/10 border border-neon-green/20 flex items-center justify-center mx-auto transition-transform group-hover:scale-110 shadow-[0_0_20px_rgba(57,255,20,0.1)]">
                  <span className="text-3xl">🪩</span>
                </div>
              </Link>
              <h1 className="font-heading text-3xl font-bold text-white mb-2 tracking-tight">
                {isLoginState ? 'Welcome Back' : 'Create Account'}
              </h1>
              <p className="text-muted-dim">Enter your portal to the circular economy.</p>
            </div>            {authError && (
              <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs text-center">
                {authError}
              </div>
            )}

            <form onSubmit={handleAuth} className="space-y-5">
              {!isLoginState && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}>
                  <label className="block text-xs font-heading font-semibold text-muted-dim uppercase tracking-widest mb-2 ml-1">Full Name</label>
                  <input 
                    type="text" 
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required={!isLoginState}
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-medium"
                    placeholder="Jane Doe"
                  />
                </motion.div>
              )}

              <div>
                <label className="block text-xs font-heading font-semibold text-muted-dim uppercase tracking-widest mb-2 ml-1">Email</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-medium"
                />
              </div>
              
              <div>
                <div className="flex justify-between items-center mb-2 ml-1">
                  <label className="block text-xs font-heading font-semibold text-muted-dim uppercase tracking-widest mt-1">Password</label>
                  {isLoginState && <a href="#" className="text-xs text-neon-green hover:underline">Forgot?</a>}
                </div>
                <input 
                  type="password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-white placeholder-white/20 focus:outline-none focus:border-neon-green/50 focus:bg-white/10 transition-all font-medium tracking-[0.2em]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full group relative flex items-center justify-center gap-3 px-8 py-4 font-heading text-sm font-bold tracking-widest uppercase bg-neon-green text-black rounded-xl overflow-hidden hover:shadow-[0_0_30px_rgba(57,255,20,0.3)] transition-all duration-300 disabled:opacity-70 mt-4"
              >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
                <span className="relative z-10 flex items-center gap-2">
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      {isLoginState ? 'Authenticating...' : 'Registering...'}
                    </>
                  ) : (
                    isLoginState ? 'Sign In' : 'Sign Up'
                  )}
                </span>
              </button>
            </form>

            <div className="mt-8 flex items-center gap-4">
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-xs text-muted-dim font-heading tracking-widest uppercase">Or</span>
              <div className="flex-1 h-px bg-white/10" />
            </div>

            <div className="mt-8 flex justify-center w-full">
              <button 
                onClick={handleGoogleLogin} 
                type="button"
                className="w-full flex items-center justify-center gap-2 px-4 py-3 glass border border-white/10 rounded-xl hover:bg-white/5 transition-colors"
                title="Continue with Google"
              >
                <svg className="w-5 h-5 text-white" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
                </svg>
                <span className="text-xs font-heading font-semibold">Google</span>
              </button>
            </div>
            
            <p className="mt-8 text-center text-sm text-muted-dim">
              {isLoginState ? "Don't have an account? " : "Already have an account? "}
              <button 
                onClick={() => {
                  setIsLoginState(!isLoginState);
                  setAuthError('');
                }} 
                className="text-neon-green hover:underline cursor-pointer"
              >
                {isLoginState ? 'Create one' : 'Sign in'}
              </button>
            </p>     

          </div>
        </div>
      </motion.div>
    </div>
  );
}
