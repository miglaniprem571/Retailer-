import React, { useEffect } from 'react';
import { RefreshCw, ShoppingCart, TrendingDown, Clock } from 'lucide-react';
import { useTransactions } from '../hooks/useTransactions';

interface TransactionLogProps {
  userId: string;
}

export const TransactionLog: React.FC<TransactionLogProps> = ({ userId }) => {
  const { transactions, loading, error, load } = useTransactions(userId, 100);

  useEffect(() => {
    load();
  }, [load]);

  const formatDate = (iso: string) => {
    const d = new Date(iso);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMin = Math.floor(diffMs / 60000);
    const diffHr = Math.floor(diffMin / 60);
    const diffDay = Math.floor(diffHr / 24);

    if (diffMin < 1) return 'Just now';
    if (diffMin < 60) return `${diffMin}m ago`;
    if (diffHr < 24) return `${diffHr}h ago`;
    if (diffDay === 1) return 'Yesterday';
    return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
  };

  // Group transactions by date
  const grouped = transactions.reduce<Record<string, typeof transactions>>((acc, tx) => {
    const dateKey = new Date(tx.created_at).toLocaleDateString('en-IN', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    if (!acc[dateKey]) acc[dateKey] = [];
    acc[dateKey].push(tx);
    return acc;
  }, {});

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-brand-text font-bold text-2xl">📋 History</h2>
            <p className="text-brand-subtle text-sm">Transaction log</p>
          </div>
          <button
            onClick={load}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-brand-card border border-brand-border flex items-center justify-center active:scale-90 transition-transform"
            id="btn-refresh-history"
          >
            <RefreshCw size={18} className={`text-brand-muted ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-1">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="ocr-spinner" />
          </div>
        )}

        {error && (
          <div className="glass-card p-4 border-brand-sale/30 text-center">
            <p className="text-brand-sale text-sm">{error}</p>
          </div>
        )}

        {!loading && transactions.length === 0 && (
          <div className="text-center py-16">
            <Clock size={48} className="text-brand-subtle mx-auto mb-3" />
            <p className="text-brand-muted text-lg">No transactions yet</p>
            <p className="text-brand-subtle text-sm mt-1">
              Scan a purchase or sale slip to get started
            </p>
          </div>
        )}

        {Object.entries(grouped).map(([dateLabel, txs]) => (
          <div key={dateLabel} className="mb-4">
            <p className="section-heading mt-2">{dateLabel}</p>
            <div className="space-y-2">
              {txs.map((tx) => {
                const isPurchase = tx.transaction_type === 'PURCHASE';
                const productName = (tx as any).products?.product_name ?? 'Unknown Product';

                return (
                  <div key={tx.id} className="glass-card p-4 flex items-center gap-3">
                    {/* Icon */}
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isPurchase ? 'bg-brand-purchase/15' : 'bg-brand-sale/15'
                      }`}
                    >
                      {isPurchase ? (
                        <ShoppingCart size={18} className="text-brand-purchase" />
                      ) : (
                        <TrendingDown size={18} className="text-brand-sale" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="text-brand-text font-semibold text-base truncate">{productName}</p>
                      <p className="text-brand-subtle text-xs">{formatDate(tx.created_at)}</p>
                    </div>

                    {/* Quantity */}
                    <div className="text-right shrink-0">
                      <p
                        className={`font-bold text-lg ${
                          isPurchase ? 'text-brand-purchase' : 'text-brand-sale'
                        }`}
                      >
                        {isPurchase ? '+' : '-'}{tx.quantity}
                      </p>
                      <p className="text-brand-subtle text-xs">
                        {isPurchase ? 'Purchase' : 'Sale'}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
