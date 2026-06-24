import React from 'react';
import { ShoppingCart, TrendingDown, Package } from 'lucide-react';

interface DashboardProps {
  onPurchase: () => void;
  onSale: () => void;
  onStock: () => void;
  lowStockCount: number;
  totalProducts: number;
}

export const Dashboard: React.FC<DashboardProps> = ({
  onPurchase,
  onSale,
  onStock,
  lowStockCount,
  totalProducts,
}) => {
  return (
    <div className="flex flex-col min-h-full">
      {/* Hero Header */}
      <div className="px-4 pt-6 pb-8">
        <div className="flex items-center gap-3 mb-1">
          <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center p-1 shrink-0">
            <img src="/globeam-logo.png" alt="Globeam Logo" className="w-full h-full object-contain" />
          </div>
          <div>
            <h1 className="text-brand-text font-extrabold text-xl leading-tight">
              Globeam Retail Saathi
            </h1>
            <p className="text-brand-subtle text-xs">Globeam Radiant Pvt Ltd</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-5 flex gap-3">
          <div className="flex-1 glass-card p-3 text-center">
            <p className="text-brand-text font-bold text-2xl">{totalProducts}</p>
            <p className="text-brand-subtle text-xs mt-0.5">Products</p>
          </div>
          <div
            className={`flex-1 glass-card p-3 text-center ${lowStockCount > 0 ? 'border-brand-warning/40' : ''}`}
          >
            <p
              className={`font-bold text-2xl ${lowStockCount > 0 ? 'text-brand-warning' : 'text-brand-text'}`}
            >
              {lowStockCount}
            </p>
            <p className="text-brand-subtle text-xs mt-0.5">
              {lowStockCount > 0 ? '⚠ Low Stock' : 'Low Stock'}
            </p>
          </div>
          <div className="flex-1 glass-card p-3 text-center">
            <p className="text-brand-purchase font-bold text-2xl">✓</p>
            <p className="text-brand-subtle text-xs mt-0.5">Synced</p>
          </div>
        </div>
      </div>

      {/* Main Action Cards */}
      <div className="flex-1 px-4 pb-6 space-y-4">
        <p className="section-heading">क्या करना है? / What would you like to do?</p>

        {/* Purchase Card */}
        <button
          onClick={onPurchase}
          id="btn-purchase"
          className="action-btn border-brand-purchase/30 text-white relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, rgba(34,197,94,0.12) 0%, rgba(34,197,94,0.05) 100%)',
            minHeight: 170,
          }}
        >
          {/* Glow blob */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 group-active:opacity-40 transition-opacity"
            style={{ background: 'radial-gradient(circle, #22C55E, transparent)' }}
          />

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1 transition-transform group-active:scale-90"
            style={{ background: 'rgba(34,197,94,0.2)', border: '1.5px solid rgba(34,197,94,0.4)' }}
          >
            <ShoppingCart size={32} style={{ color: '#22C55E' }} />
          </div>

          <div className="text-center">
            <p className="text-2xl font-black" style={{ color: '#22C55E' }}>
              ➕ खरीद / Purchase
            </p>
            <p className="text-brand-muted text-sm font-normal mt-1">
              Scan karo purchase parchi
            </p>
          </div>
        </button>

        {/* Sale Card */}
        <button
          onClick={onSale}
          id="btn-sale"
          className="action-btn border-brand-sale/30 text-white relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.12) 0%, rgba(239,68,68,0.05) 100%)',
            minHeight: 170,
          }}
        >
          {/* Glow blob */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 group-active:opacity-40 transition-opacity"
            style={{ background: 'radial-gradient(circle, #EF4444, transparent)' }}
          />

          <div
            className="w-16 h-16 rounded-2xl flex items-center justify-center mb-1 transition-transform group-active:scale-90"
            style={{ background: 'rgba(239,68,68,0.2)', border: '1.5px solid rgba(239,68,68,0.4)' }}
          >
            <TrendingDown size={32} style={{ color: '#EF4444' }} />
          </div>

          <div className="text-center">
            <p className="text-2xl font-black" style={{ color: '#EF4444' }}>
              ➖ बिक्री / Sale
            </p>
            <p className="text-brand-muted text-sm font-normal mt-1">
              Scan karo sale parchi
            </p>
          </div>
        </button>

        {/* Stock Card */}
        <button
          onClick={onStock}
          id="btn-stock"
          className="action-btn border-brand-stock/30 text-white relative overflow-hidden group"
          style={{
            background: 'linear-gradient(135deg, rgba(59,130,246,0.12) 0%, rgba(59,130,246,0.05) 100%)',
            minHeight: 140,
          }}
        >
          {/* Glow blob */}
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full opacity-20 group-active:opacity-40 transition-opacity"
            style={{ background: 'radial-gradient(circle, #3B82F6, transparent)' }}
          />

          <div className="flex items-center gap-4">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center transition-transform group-active:scale-90"
              style={{ background: 'rgba(59,130,246,0.2)', border: '1.5px solid rgba(59,130,246,0.4)' }}
            >
              <Package size={28} style={{ color: '#3B82F6' }} />
            </div>
            <div className="text-left">
              <p className="text-2xl font-black" style={{ color: '#3B82F6' }}>
                📦 Stock देखें
              </p>
              <p className="text-brand-muted text-sm font-normal mt-0.5">
                View current inventory
              </p>
            </div>
          </div>

          {lowStockCount > 0 && (
            <div
              className="absolute top-3 right-3 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold"
              style={{ background: 'rgba(245,158,11,0.2)', border: '1px solid rgba(245,158,11,0.4)', color: '#F59E0B' }}
            >
              ⚠ {lowStockCount} low
            </div>
          )}
        </button>
      </div>
    </div>
  );
};
