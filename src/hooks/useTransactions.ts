import { useState, useCallback } from 'react';
import { fetchTransactions } from '../lib/inventory';
import type { Transaction } from '../types';

export function useTransactions(userId: string | undefined, limit = 50) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      const data = await fetchTransactions(userId, limit);
      setTransactions(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  }, [userId, limit]);

  return { transactions, loading, error, load };
}
