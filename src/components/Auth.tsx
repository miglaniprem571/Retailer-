import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { Eye, EyeOff, LogIn, UserPlus } from 'lucide-react';

interface AuthProps {
  onAuth: () => void;
}

export const Auth: React.FC<AuthProps> = ({ onAuth }) => {
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        onAuth();
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        setSuccess('Account created! Please check your email to confirm, then log in.');
        setMode('login');
      }
    } catch (e: any) {
      setError(e.message ?? 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-dvh bg-brand-bg flex flex-col">
      {/* Background gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 80% 50% at 50% -20%, rgba(34,197,94,0.08) 0%, transparent 60%)',
        }}
      />

      <div className="flex-1 flex flex-col items-center justify-center px-6 relative z-10">
        {/* Logo */}
        <div className="text-center mb-10">
          <div
            className="w-20 h-20 rounded-3xl mx-auto flex items-center justify-center mb-4 p-2 bg-white shadow-lg shadow-white/5"
            style={{
              border: '1.5px solid rgba(255,255,255,0.1)',
            }}
          >
            <img src="/globeam-logo.png" alt="Globeam Logo" className="w-full h-full object-contain" />
          </div>
          <h1 className="text-brand-text font-black text-3xl">Retail Saathi</h1>
          <p className="text-brand-muted text-sm mt-1">Globeam Radiant Pvt Ltd</p>
        </div>

        {/* Card */}
        <div className="w-full max-w-sm glass-card p-6">
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => { setMode('login'); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                mode === 'login'
                  ? 'bg-brand-purchase/20 border border-brand-purchase/40 text-brand-purchase'
                  : 'bg-transparent border border-brand-border text-brand-muted'
              }`}
              id="tab-login"
            >
              Login
            </button>
            <button
              onClick={() => { setMode('signup'); setError(''); }}
              className={`flex-1 py-3 rounded-xl font-semibold text-sm transition-all ${
                mode === 'signup'
                  ? 'bg-brand-stock/20 border border-brand-stock/40 text-brand-stock'
                  : 'bg-transparent border border-brand-border text-brand-muted'
              }`}
              id="tab-signup"
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-brand-muted text-xs font-medium block mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                className="input-field"
                required
                id="input-email"
              />
            </div>
            <div>
              <label className="text-brand-muted text-xs font-medium block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="input-field pr-12"
                  required
                  minLength={6}
                  id="input-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-subtle"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-brand-sale/10 border border-brand-sale/30">
                <p className="text-brand-sale text-sm">{error}</p>
              </div>
            )}
            {success && (
              <div className="p-3 rounded-xl bg-brand-purchase/10 border border-brand-purchase/30">
                <p className="text-brand-purchase text-sm">{success}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={loading || !email || !password}
              className={`btn-primary text-white font-bold mt-2 disabled:opacity-50 transition-all ${
                mode === 'login' ? 'bg-brand-purchase' : 'bg-brand-stock'
              }`}
              id="btn-auth-submit"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Please wait…
                </span>
              ) : mode === 'login' ? (
                <span className="flex items-center gap-2">
                  <LogIn size={18} /> Login / लॉग इन करें
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <UserPlus size={18} /> Create Account
                </span>
              )}
            </button>
          </form>
        </div>

        <p className="text-brand-subtle text-xs mt-6 text-center">
          Powered by Supabase · Gemini AI
        </p>
      </div>
    </div>
  );
};
