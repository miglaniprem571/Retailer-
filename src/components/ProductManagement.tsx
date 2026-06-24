import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Check, X, Package } from 'lucide-react';
import { useProducts } from '../hooks/useProducts';
import { addProduct, updateProduct, deleteProduct } from '../lib/inventory';

export const ProductManagement: React.FC = () => {
  const { products, loading, refresh } = useProducts();
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState('');
  const [newSku, setNewSku] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editSku, setEditSku] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleAdd = async () => {
    if (!newName.trim()) return;
    setSaving(true);
    setError('');
    try {
      await addProduct(newName.trim(), newSku.trim() || undefined);
      setNewName('');
      setNewSku('');
      setShowAddForm(false);
      await refresh();
    } catch (e: any) {
      setError(e.message ?? 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const startEdit = (id: string, name: string, sku: string | null) => {
    setEditingId(id);
    setEditName(name);
    setEditSku(sku ?? '');
  };

  const handleUpdate = async (id: string) => {
    setSaving(true);
    setError('');
    try {
      await updateProduct(id, { product_name: editName.trim(), sku: editSku.trim() || undefined });
      setEditingId(null);
      await refresh();
    } catch (e: any) {
      setError(e.message ?? 'Failed to update');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Delete "${name}"? This will also remove its inventory.`)) return;
    setSaving(true);
    try {
      await deleteProduct(id);
      await refresh();
    } catch (e: any) {
      setError(e.message ?? 'Failed to delete');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center justify-between mb-2">
          <div>
            <h2 className="text-brand-text font-bold text-2xl">🗂 Products</h2>
            <p className="text-brand-subtle text-sm">Product master list</p>
          </div>
          <button
            onClick={() => { setShowAddForm(true); setError(''); }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-brand-stock/20 border border-brand-stock/40 text-brand-stock font-semibold text-sm active:scale-95 transition-transform"
            id="btn-add-product"
          >
            <Plus size={16} />
            Add
          </button>
        </div>

        {error && (
          <div className="mt-2 p-3 rounded-xl bg-brand-sale/10 border border-brand-sale/30">
            <p className="text-brand-sale text-sm">{error}</p>
          </div>
        )}

        {/* Add Product Form */}
        {showAddForm && (
          <div className="mt-3 glass-card p-4 space-y-3 animate-scale-in">
            <p className="text-brand-text font-semibold text-sm">New Product</p>
            <input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Product name (e.g. Mini GL-006)"
              className="input-field"
              autoFocus
              id="input-new-product-name"
            />
            <input
              value={newSku}
              onChange={(e) => setNewSku(e.target.value)}
              placeholder="SKU (optional)"
              className="input-field"
              id="input-new-product-sku"
            />
            <div className="flex gap-2">
              <button
                onClick={() => { setShowAddForm(false); setNewName(''); setNewSku(''); }}
                className="flex-1 py-3 rounded-xl border border-brand-border bg-brand-card text-brand-muted font-semibold active:scale-95 transition-transform flex items-center justify-center gap-1"
              >
                <X size={16} /> Cancel
              </button>
              <button
                onClick={handleAdd}
                disabled={!newName.trim() || saving}
                className="flex-[2] py-3 rounded-xl bg-brand-purchase text-white font-bold active:scale-95 transition-transform flex items-center justify-center gap-1 disabled:opacity-50"
                id="btn-save-product"
              >
                <Check size={16} /> {saving ? 'Saving…' : 'Save Product'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Product List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {loading && (
          <div className="flex justify-center py-12">
            <div className="ocr-spinner" />
          </div>
        )}

        {!loading && products.length === 0 && (
          <div className="text-center py-16">
            <Package size={48} className="text-brand-subtle mx-auto mb-3" />
            <p className="text-brand-muted text-lg">No products yet</p>
            <p className="text-brand-subtle text-sm mt-1">Add your first product above</p>
          </div>
        )}

        {products.map((product) => (
          <div key={product.id} className="glass-card p-4">
            {editingId === product.id ? (
              /* Edit mode */
              <div className="space-y-2">
                <input
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="input-field text-sm py-2"
                  id={`edit-name-${product.id}`}
                />
                <input
                  value={editSku}
                  onChange={(e) => setEditSku(e.target.value)}
                  placeholder="SKU (optional)"
                  className="input-field text-sm py-2"
                  id={`edit-sku-${product.id}`}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditingId(null)}
                    className="flex-1 py-2 rounded-xl border border-brand-border text-brand-muted text-sm font-semibold active:scale-95 flex items-center justify-center gap-1"
                  >
                    <X size={14} /> Cancel
                  </button>
                  <button
                    onClick={() => handleUpdate(product.id)}
                    disabled={saving}
                    className="flex-[2] py-2 rounded-xl bg-brand-purchase text-white text-sm font-bold active:scale-95 flex items-center justify-center gap-1 disabled:opacity-50"
                  >
                    <Check size={14} /> Save
                  </button>
                </div>
              </div>
            ) : (
              /* View mode */
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center text-lg shrink-0">
                  📦
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-brand-text font-semibold text-base truncate">{product.product_name}</p>
                  {product.sku && (
                    <p className="text-brand-subtle text-xs">SKU: {product.sku}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button
                    onClick={() => startEdit(product.id, product.product_name, product.sku)}
                    className="w-9 h-9 rounded-xl bg-brand-card border border-brand-border flex items-center justify-center active:scale-90 transition-transform"
                    id={`btn-edit-${product.id}`}
                  >
                    <Edit3 size={15} className="text-brand-muted" />
                  </button>
                  <button
                    onClick={() => handleDelete(product.id, product.product_name)}
                    className="w-9 h-9 rounded-xl bg-brand-sale/10 border border-brand-sale/30 flex items-center justify-center active:scale-90 transition-transform"
                    id={`btn-delete-${product.id}`}
                  >
                    <Trash2 size={15} className="text-brand-sale" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
