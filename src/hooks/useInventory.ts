import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabase';
import { fetchInventory, ensureUserInventory } from '../lib/inventory';
import type { InventoryWithProduct } from '../types';

export function useInventory(userId: string | undefined) {
  const [inventory, setInventory] = useState<InventoryWithProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!userId) return;
    try {
      setLoading(true);
      setError(null);
      // Ensure this user has inventory rows for all products
      await ensureUserInventory(userId);
      const data = await fetchInventory(userId);
      // Sort by product_name alphabetically
      data.sort((a, b) => a.product_name.localeCompare(b.product_name));
      setInventory(data);
    } catch (err: any) {
      setError(err.message ?? 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    load();

    // Real-time subscription to inventory changes
    const channel = supabase
      .channel('inventory_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'inventory' }, () => {
        load();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, load]);

  return { inventory, loading, error, refresh: load };
}
