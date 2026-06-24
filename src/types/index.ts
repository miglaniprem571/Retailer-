// Core application types for Globeam Retail Saathi

export type TransactionType = 'PURCHASE' | 'SALE';

export interface Product {
  id: string;
  product_name: string;
  sku: string | null;
  created_at: string;
}

export interface InventoryItem {
  id: string;
  product_id: string;
  quantity: number;
  updated_at: string;
  products?: Product;
}

export interface InventoryWithProduct {
  id: string;
  product_id: string;
  quantity: number;
  updated_at: string;
  product_name: string;
  sku: string | null;
}

export interface Transaction {
  id: string;
  product_id: string;
  quantity: number;
  transaction_type: TransactionType;
  image_url: string | null;
  created_at: string;
  products?: Product;
}

export interface DetectedItem {
  product_name: string;       // raw OCR name
  matched_product: Product | null;  // fuzzy-matched master
  quantity: number;
  confidence: number;         // 0–1
}

export type AppView = 'dashboard' | 'stock' | 'history';

export interface OCRResult {
  items: DetectedItem[];
  raw_text: string;
}
