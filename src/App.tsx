import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import { Auth } from './components/Auth';
import { Dashboard } from './components/Dashboard';
import { StockView } from './components/StockView';
import { TransactionLog } from './components/TransactionLog';
import { ScanFlow } from './components/ScanFlow';
import { useInventory } from './hooks/useInventory';
import { useProducts } from './hooks/useProducts';
import type { Session } from '@supabase/supabase-js';
import type { AppView } from './types';
import {
  LayoutDashboard,
  Package,
  ClipboardList,
  LogOut,
} from 'lucide-react';

const LOW_STOCK_THRESHOLD = Number(import.meta.env.VITE_LOW_STOCK_THRESHOLD ?? 10);

type ScanType = 'PURCHASE' | 'SALE' | null;

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeView, setActiveView] = useState<AppView>('dashboard');
  const [activeScan, setActiveScan] = useState<ScanType>(null);

  const userId = session?.user?.id;
  const { inventory, loading: invLoading, refresh: refreshInventory } = useInventory(userId);
  const { products } = useProducts();

  const lowStockCount = inventory.filter((i) => i.quantity <= LOW_STOCK_THRESHOLD).length;

  // Auth listener
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setAuthLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  if (authLoading) {
    return (
      <div className="min-h-dvh bg-brand-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl mb-4">🌐</div>
          <div className="ocr-spinner mx-auto" />
          <p className="text-brand-muted text-sm mt-4">Loading Retail Saathi…</p>
        </div>
      </div>
    );
  }

  if (!session) {
    return <Auth onAuth={() => {}} />;
  }

  const navItems: { view: AppView; icon: React.ReactNode; label: string; badge?: number }[] = [
    { view: 'dashboard', icon: <LayoutDashboard size={22} />, label: 'Home' },
    { view: 'stock', icon: <Package size={22} />, label: 'Stock', badge: lowStockCount > 0 ? lowStockCount : undefined },
    { view: 'history', icon: <ClipboardList size={22} />, label: 'History' },
  ];

  const accentColors: Record<AppView, string> = {
    dashboard: '#22C55E',
    stock: '#3B82F6',
    history: '#A78BFA',
  };

  return (
    <div className="min-h-dvh bg-brand-bg flex flex-col max-w-lg mx-auto relative">
      {/* Subtle background gradient */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: `radial-gradient(ellipse 100% 40% at 50% -10%, ${accentColors[activeView]}10 0%, transparent 60%)`,
          transition: 'background 0.5s ease',
        }}
      />

      {/* Scan Flow Overlay */}
      {activeScan && (
        <ScanFlow
          type={activeScan}
          products={products}
          userId={userId!}
          onClose={() => setActiveScan(null)}
          onSuccess={() => {
            refreshInventory();
            setActiveView('stock');
          }}
        />
      )}

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto no-scrollbar relative z-10" style={{ paddingBottom: '80px' }}>
        {activeView === 'dashboard' && (
          <Dashboard
            onPurchase={() => setActiveScan('PURCHASE')}
            onSale={() => setActiveScan('SALE')}
            onStock={() => setActiveView('stock')}
            lowStockCount={lowStockCount}
            totalProducts={products.length}
          />
        )}
        {activeView === 'stock' && (
          <StockView
            inventory={inventory}
            loading={invLoading}
            onRefresh={refreshInventory}
          />
        )}
        {activeView === 'history' && <TransactionLog userId={userId!} />}
      </main>

      {/* Bottom Navigation */}
      <nav
        className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto z-40"
        style={{
          background: 'rgba(13,13,20,0.95)',
          backdropFilter: 'blur(20px)',
          borderTop: '1px solid rgba(42,42,61,0.8)',
          paddingBottom: 'env(safe-area-inset-bottom, 0px)',
        }}
      >
        <div className="flex items-center justify-around px-2 pt-2 pb-3">
          {navItems.map(({ view, icon, label, badge }) => {
            const isActive = activeView === view;
            const accent = accentColors[view];
            return (
              <button
                key={view}
                onClick={() => setActiveView(view)}
                id={`nav-${view}`}
                className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all active:scale-90 relative"
                style={{
                  background: isActive ? `${accent}18` : 'transparent',
                }}
              >
                <div
                  style={{
                    color: isActive ? accent : '#475569',
                    transition: 'color 0.2s',
                  }}
                >
                  {icon}
                </div>
                <span
                  className="text-xs font-semibold"
                  style={{
                    color: isActive ? accent : '#475569',
                    transition: 'color 0.2s',
                  }}
                >
                  {label}
                </span>
                {badge !== undefined && (
                  <div
                    className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full text-white flex items-center justify-center"
                    style={{ background: '#F59E0B', fontSize: 9, fontWeight: 700 }}
                  >
                    {badge > 9 ? '9+' : badge}
                  </div>
                )}
              </button>
            );
          })}

          {/* Logout */}
          <button
            onClick={handleLogout}
            id="btn-logout"
            className="flex flex-col items-center gap-1 px-4 py-1.5 rounded-2xl transition-all active:scale-90"
          >
            <LogOut size={22} style={{ color: '#475569' }} />
            <span className="text-xs font-semibold" style={{ color: '#475569' }}>
              Logout
            </span>
          </button>
        </div>
      </nav>
    </div>
  );
}

export default App;
