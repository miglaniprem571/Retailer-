import { supabase } from './supabase';
import type { Product, InventoryWithProduct, Transaction, TransactionType, DetectedItem } from '../types';

// ─────────────────────────────────────────────
// Products (SHARED across all users)
// ─────────────────────────────────────────────

export async function fetchProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('product_name');

  if (error) throw error;
  return data ?? [];
}

export async function addProduct(product_name: string, sku?: string): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .insert({ product_name: product_name.trim(), sku: sku?.trim() || null })
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function updateProduct(id: string, updates: Partial<Pick<Product, 'product_name' | 'sku'>>): Promise<void> {
  const { error } = await supabase.from('products').update(updates).eq('id', id);
  if (error) throw error;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) throw error;
}

// ─────────────────────────────────────────────
// Inventory (PER-USER — each user has own stock)
// ─────────────────────────────────────────────

/**
 * Ensure this user has inventory rows for all products.
 * Called on login/app load. Creates rows with qty=0 for any missing products.
 */
export async function ensureUserInventory(userId: string): Promise<void> {
  // Get all products
  const { data: allProducts, error: pErr } = await supabase
    .from('products')
    .select('id');
  if (pErr) throw pErr;

  // Get this user's existing inventory rows
  const { data: existingInv, error: iErr } = await supabase
    .from('inventory')
    .select('product_id')
    .eq('user_id', userId);
  if (iErr) throw iErr;

  const existingSet = new Set((existingInv ?? []).map((r: any) => r.product_id));
  const missing = (allProducts ?? []).filter(p => !existingSet.has(p.id));

  if (missing.length > 0) {
    const rows = missing.map(p => ({
      product_id: p.id,
      user_id: userId,
      quantity: 0,
    }));
    const { error: insertErr } = await supabase.from('inventory').insert(rows);
    if (insertErr) {
      console.error('ensureUserInventory insert error:', insertErr.message);
    }
  }
}

export async function fetchInventory(userId: string): Promise<InventoryWithProduct[]> {
  const { data, error } = await supabase
    .from('inventory')
    .select(`
      id,
      product_id,
      quantity,
      updated_at,
      products ( product_name, sku )
    `)
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });

  if (error) throw error;

  return (data ?? []).map((row: any) => ({
    id: row.id,
    product_id: row.product_id,
    quantity: row.quantity,
    updated_at: row.updated_at,
    product_name: row.products?.product_name ?? 'Unknown',
    sku: row.products?.sku ?? null,
  }));
}

export async function getInventoryByProductId(product_id: string, userId: string): Promise<number> {
  const { data, error } = await supabase
    .from('inventory')
    .select('quantity')
    .eq('product_id', product_id)
    .eq('user_id', userId)
    .single();

  if (error) return 0;
  return data?.quantity ?? 0;
}

// ─────────────────────────────────────────────
// Transactions (PER-USER)
// ─────────────────────────────────────────────

export async function recordTransaction(
  items: DetectedItem[],
  type: TransactionType,
  userId: string,
  imageUrl?: string
): Promise<void> {
  for (const item of items) {
    if (!item.matched_product) continue;

    const productId = item.matched_product.id;
    const qty = item.quantity;
    const delta = type === 'PURCHASE' ? qty : -qty;

    // 1. Upsert inventory for THIS user
    const { data: existing } = await supabase
      .from('inventory')
      .select('id, quantity')
      .eq('product_id', productId)
      .eq('user_id', userId)
      .single();

    if (existing) {
      const newQty = Math.max(0, existing.quantity + delta);
      await supabase
        .from('inventory')
        .update({ quantity: newQty, updated_at: new Date().toISOString() })
        .eq('id', existing.id);
    } else {
      const newQty = Math.max(0, delta);
      await supabase
        .from('inventory')
        .insert({ product_id: productId, user_id: userId, quantity: newQty });
    }

    // 2. Insert transaction log for THIS user
    await supabase.from('transactions').insert({
      product_id: productId,
      user_id: userId,
      quantity: qty,
      transaction_type: type,
      image_url: imageUrl ?? null,
    });
  }
}

// ─────────────────────────────────────────────
// Transaction History (PER-USER)
// ─────────────────────────────────────────────

export async function fetchTransactions(userId: string, limit = 50): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select(`
      id,
      product_id,
      quantity,
      transaction_type,
      image_url,
      created_at,
      products ( product_name, sku )
    `)
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return (data ?? []) as unknown as Transaction[];
}

// ─────────────────────────────────────────────
// Upload scanned image to Supabase Storage
// ─────────────────────────────────────────────

export async function uploadSlipImage(dataUrl: string, type: TransactionType): Promise<string | undefined> {
  try {
    // Convert base64 to blob
    const base64 = dataUrl.split(',')[1];
    const mime = dataUrl.split(';')[0].split(':')[1];
    const byteChars = atob(base64);
    const byteNums = new Array(byteChars.length);
    for (let i = 0; i < byteChars.length; i++) {
      byteNums[i] = byteChars.charCodeAt(i);
    }
    const blob = new Blob([new Uint8Array(byteNums)], { type: mime });

    const fileName = `${type.toLowerCase()}_${Date.now()}.jpg`;
    const { error } = await supabase.storage
      .from('slip-images')
      .upload(fileName, blob, { contentType: mime });

    if (error) return undefined;

    const { data } = supabase.storage.from('slip-images').getPublicUrl(fileName);
    return data?.publicUrl;
  } catch {
    return undefined;
  }
}
