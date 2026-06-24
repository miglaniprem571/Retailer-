import React, { useState } from 'react';
import { RefreshCw, AlertTriangle, Package, Search } from 'lucide-react';
import type { InventoryWithProduct } from '../types';

const LOW_STOCK_THRESHOLD = Number(import.meta.env.VITE_LOW_STOCK_THRESHOLD ?? 10);

interface StockViewProps {
  inventory: InventoryWithProduct[];
  loading: boolean;
  onRefresh: () => void;
}

export const StockView: React.FC<StockViewProps> = ({ inventory, loading, onRefresh }) => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'instock' | 'low' | 'zero'>('instock');

  // By default, hide 0-stock items — show only items that have stock
  const inStockItems = inventory.filter((i) => i.quantity > 0);
  const lowStockItems = inventory.filter((i) => i.quantity > 0 && i.quantity <= LOW_STOCK_THRESHOLD);
  const zeroStockItems = inventory.filter((i) => i.quantity === 0);

  const filtered = inventory
    .filter((item) => {
      const matchesSearch = item.product_name.toLowerCase().includes(search.toLowerCase());
      let matchesFilter = false;
      if (filter === 'instock') matchesFilter = item.quantity > 0;
      else if (filter === 'low') matchesFilter = item.quantity > 0 && item.quantity <= LOW_STOCK_THRESHOLD;
      else if (filter === 'zero') matchesFilter = item.quantity === 0;
      return matchesSearch && matchesFilter;
    });

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-brand-text font-bold text-2xl">📦 Stock</h2>
            <p className="text-brand-subtle text-sm">{inStockItems.length} products in stock</p>
          </div>
          <button
            onClick={onRefresh}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-brand-card border border-brand-border flex items-center justify-center active:scale-90 transition-transform"
            id="btn-refresh-stock"
          >
            <RefreshCw size={18} className={`text-brand-muted ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative mb-3">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-subtle" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search products…"
            className="input-field pl-10"
            id="stock-search"
          />
        </div>

        {/* Filter Pills */}
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setFilter('instock')}
            className={`pill transition-colors ${
              filter === 'instock'
                ? 'bg-brand-stock/20 text-brand-stock border border-brand-stock/40'
                : 'bg-brand-card text-brand-muted border border-brand-border'
            }`}
          >
            In Stock ({inStockItems.length})
          </button>
          {lowStockItems.length > 0 && (
            <button
              onClick={() => setFilter('low')}
              className={`pill transition-colors ${
                filter === 'low'
                  ? 'bg-brand-warning/20 text-brand-warning border border-brand-warning/40'
                  : 'bg-brand-card text-brand-muted border border-brand-border'
              }`}
            >
              ⚠ Low ({lowStockItems.length})
            </button>
          )}
          {zeroStockItems.length > 0 && (
            <button
              onClick={() => setFilter('zero')}
              className={`pill transition-colors ${
                filter === 'zero'
                  ? 'bg-brand-sale/20 text-brand-sale border border-brand-sale/40'
                  : 'bg-brand-card text-brand-muted border border-brand-border'
              }`}
            >
              ⛔ Zero ({zeroStockItems.length})
            </button>
          )}
        </div>
      </div>

      {/* Inventory List */}
      <div className="flex-1 overflow-y-auto px-4 space-y-2 pb-4">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="ocr-spinner" />
          </div>
        )}

        {!loading && filtered.length === 0 && (
          <div className="text-center py-16">
            <Package size={48} className="text-brand-subtle mx-auto mb-3" />
            <p className="text-brand-muted text-lg">
              {search ? 'No products found' : filter === 'instock' ? 'No stock available' : filter === 'low' ? 'No low-stock items' : 'No out-of-stock items'}
            </p>
            <p className="text-brand-subtle text-sm mt-1">
              {search ? 'Try a different search term' : 'Scan a purchase slip to add stock'}
            </p>
          </div>
        )}

        {!loading &&
          filtered.map((item) => {
            const isLow = item.quantity <= LOW_STOCK_THRESHOLD;
            const isEmpty = item.quantity === 0;

            return (
              <div
                key={item.id}
                className={`glass-card p-4 flex items-center gap-4 ${
                  isLow ? 'border-brand-warning/30' : ''
                }`}
              >
                {/* Product icon */}
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 ${
                    isEmpty
                      ? 'bg-brand-sale/10'
                      : isLow
                      ? 'bg-brand-warning/10'
                      : 'bg-brand-stock/10'
                  }`}
                >
                  {isEmpty ? '⛔' : isLow ? '⚠️' : '📦'}
                </div>

                {/* Product info */}
                <div className="flex-1 min-w-0">
                  <p className="text-brand-text font-semibold text-base truncate">
                    {item.product_name}
                  </p>
                  {item.sku && (
                    <p className="text-brand-subtle text-xs">SKU: {item.sku}</p>
                  )}
                  {isLow && !isEmpty && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <AlertTriangle size={11} className="text-brand-warning" />
                      <p className="text-brand-warning text-xs font-medium">
                        केवल {item.quantity} बचे / Only {item.quantity} remaining
                      </p>
                    </div>
                  )}
                  {isEmpty && (
                    <p className="text-brand-sale text-xs font-medium mt-0.5">
                      Out of stock
                    </p>
                  )}
                </div>

                {/* Quantity badge */}
                <div
                  className={`qty-badge text-lg font-black px-4 ${
                    isEmpty
                      ? 'bg-brand-sale/10 text-brand-sale'
                      : isLow
                      ? 'bg-brand-warning/10 text-brand-warning'
                      : 'bg-brand-stock/10 text-brand-stock'
                  }`}
                  style={{ minWidth: 52, height: 44 }}
                >
                  {item.quantity}
                </div>
              </div>
            );
          })}
      </div>
    </div>
  );
};
