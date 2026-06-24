import React, { useState } from 'react';
import { Check, Edit3, X, AlertTriangle, Minus, Plus } from 'lucide-react';
import type { DetectedItem, TransactionType } from '../types';

interface DetectedItemsProps {
  items: DetectedItem[];
  type: TransactionType;
  capturedImage: string;
  onConfirm: (items: DetectedItem[]) => void;
  onCancel: () => void;
}

export const DetectedItems: React.FC<DetectedItemsProps> = ({
  items,
  type,
  capturedImage,
  onConfirm,
  onCancel,
}) => {
  const [editableItems, setEditableItems] = useState<DetectedItem[]>(items);
  const [isEditing, setIsEditing] = useState(false);
  const [showImage, setShowImage] = useState(false);

  const isPurchase = type === 'PURCHASE';
  const accentColor = isPurchase ? 'text-brand-purchase' : 'text-brand-sale';
  const bgAccent = isPurchase ? 'bg-brand-purchase/10' : 'bg-brand-sale/10';
  const borderAccent = isPurchase ? 'border-brand-purchase/30' : 'border-brand-sale/30';
  const sign = isPurchase ? '+' : '-';

  const updateQuantity = (index: number, delta: number) => {
    setEditableItems((prev) =>
      prev.map((item, i) =>
        i === index
          ? { ...item, quantity: Math.max(1, item.quantity + delta) }
          : item
      )
    );
  };

  const updateProductName = (index: number, name: string) => {
    setEditableItems((prev) =>
      prev.map((item, i) =>
        i === index ? { ...item, product_name: name } : item
      )
    );
  };

  const removeItem = (index: number) => {
    setEditableItems((prev) => prev.filter((_, i) => i !== index));
  };

  const validItems = editableItems.filter((i) => i.matched_product !== null);
  const unmatchedItems = editableItems.filter((i) => i.matched_product === null);

  return (
    <div className="fixed inset-0 z-50 bg-brand-bg flex flex-col animate-fade-in">
      {/* Header */}
      <div className="px-4 pt-safe pt-4 pb-3 border-b border-brand-border">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-brand-text font-bold text-xl">
            {isPurchase ? '📦 खरीद पर्ची' : '🛒 बिक्री पर्ची'}
          </h2>
          <button
            onClick={onCancel}
            className="w-9 h-9 rounded-full bg-brand-card border border-brand-border flex items-center justify-center active:scale-90 transition-transform"
          >
            <X size={18} className="text-brand-muted" />
          </button>
        </div>
        <p className="text-brand-subtle text-sm">
          {isPurchase ? 'Detected Items — नीचे दी गई चीजें मिली हैं' : 'Detected Items — बिकने वाली चीजें'}
        </p>
      </div>

      {/* Scanned image thumbnail */}
      <div className="px-4 pt-3 pb-2">
        <button
          onClick={() => setShowImage(!showImage)}
          className="text-xs text-brand-muted underline underline-offset-2"
        >
          {showImage ? 'Hide' : 'Show'} scanned image
        </button>
        {showImage && (
          <img
            src={capturedImage}
            alt="Scanned slip"
            className="mt-2 w-full max-h-40 object-contain rounded-xl border border-brand-border"
          />
        )}
      </div>

      {/* Items List */}
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-3">
        {/* Matched items */}
        {editableItems.map((item, index) => (
          <div
            key={index}
            className={`glass-card p-4 flex items-center gap-3 ${
              item.matched_product ? '' : 'opacity-60 border-dashed border-yellow-500/40'
            }`}
          >
            {/* Product info */}
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <input
                  value={item.product_name}
                  onChange={(e) => updateProductName(index, e.target.value)}
                  className="input-field text-sm py-2"
                />
              ) : (
                <>
                  <p className="text-brand-text font-semibold text-base truncate">
                    {item.matched_product?.product_name ?? item.product_name}
                  </p>
                  {item.matched_product && item.product_name !== item.matched_product.product_name && (
                    <p className="text-brand-subtle text-xs">
                      OCR: {item.product_name}
                    </p>
                  )}
                  {!item.matched_product && (
                    <div className="flex items-center gap-1 mt-0.5">
                      <AlertTriangle size={12} className="text-yellow-400" />
                      <p className="text-yellow-400 text-xs">Product not found in master</p>
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Quantity controls */}
            <div className="flex items-center gap-2 shrink-0">
              {isEditing && (
                <button
                  onClick={() => updateQuantity(index, -1)}
                  className="w-8 h-8 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center active:scale-90"
                >
                  <Minus size={14} className="text-brand-muted" />
                </button>
              )}
              <div className={`qty-badge ${bgAccent} ${accentColor} border ${borderAccent} text-base px-3`}>
                {sign}{item.quantity}
              </div>
              {isEditing && (
                <button
                  onClick={() => updateQuantity(index, 1)}
                  className="w-8 h-8 rounded-lg bg-brand-bg border border-brand-border flex items-center justify-center active:scale-90"
                >
                  <Plus size={14} className="text-brand-muted" />
                </button>
              )}
              {isEditing && (
                <button
                  onClick={() => removeItem(index)}
                  className="w-8 h-8 rounded-lg bg-brand-sale/10 border border-brand-sale/30 flex items-center justify-center active:scale-90"
                >
                  <X size={14} className="text-brand-sale" />
                </button>
              )}
            </div>
          </div>
        ))}

        {editableItems.length === 0 && (
          <div className="text-center py-12">
            <p className="text-brand-muted text-lg">No items detected</p>
            <p className="text-brand-subtle text-sm mt-1">Try scanning again with better lighting</p>
          </div>
        )}

        {/* Summary */}
        {validItems.length > 0 && (
          <div className={`rounded-2xl p-4 ${bgAccent} border ${borderAccent}`}>
            <p className="text-brand-muted text-sm font-medium">
              {validItems.length} product{validItems.length !== 1 ? 's' : ''} will be updated
              {unmatchedItems.length > 0 && (
                <span className="text-yellow-400"> · {unmatchedItems.length} unmatched (skipped)</span>
              )}
            </p>
          </div>
        )}
      </div>

      {/* Action Buttons */}
      <div className="px-4 pb-safe pb-6 pt-3 border-t border-brand-border space-y-3">
        <div className="flex gap-3">
          <button
            onClick={() => setIsEditing(!isEditing)}
            className="flex-1 py-4 rounded-2xl border border-brand-border bg-brand-card text-brand-text font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
            id="btn-edit-items"
          >
            <Edit3 size={18} />
            {isEditing ? 'Done' : 'Edit'}
          </button>
          <button
            onClick={() => onConfirm(editableItems.filter((i) => i.matched_product !== null))}
            disabled={validItems.length === 0}
            className={`flex-[2] py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 active:scale-95 transition-all ${
              validItems.length > 0
                ? isPurchase
                  ? 'bg-brand-purchase text-white shadow-lg'
                  : 'bg-brand-sale text-white shadow-lg'
                : 'bg-brand-card text-brand-subtle cursor-not-allowed'
            }`}
            id="btn-confirm-items"
          >
            <Check size={22} />
            Confirm / पक्का करें
          </button>
        </div>
      </div>
    </div>
  );
};
