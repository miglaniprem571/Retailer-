import Fuse from 'fuse.js';
import type { Product } from '../types';

export interface MatchResult {
  product: Product;
  score: number; // 0 = perfect, 1 = worst
}

/**
 * Normalize product name for matching:
 * - Remove spaces/hyphens/underscores
 * - Lowercase
 * - Normalize common abbreviations
 */
function normalize(name: string): string {
  return name
    .toLowerCase()
    .replace(/[-_\s]/g, '')  // remove separators
    .replace(/gl0+/g, 'gl0') // normalize GL-006 vs GL06
    .trim();
}

let fuseInstance: Fuse<Product> | null = null;
let cachedProducts: Product[] = [];

function getFuse(products: Product[]): Fuse<Product> {
  // Re-initialize only when products change
  if (fuseInstance && cachedProducts === products) return fuseInstance;

  cachedProducts = products;
  fuseInstance = new Fuse(products, {
    keys: ['product_name', 'sku'],
    threshold: 0.45,      // 0 = exact, 1 = match anything
    includeScore: true,
    useExtendedSearch: false,
    ignoreLocation: true,
    minMatchCharLength: 2,
    getFn: (obj, path) => {
      // Custom getter that normalizes the field value before matching
      const val = Fuse.config.getFn(obj, path);
      if (typeof val === 'string') return normalize(val);
      if (Array.isArray(val)) return val.map((v) => (typeof v === 'string' ? normalize(v) : v));
      return val;
    },
  });

  return fuseInstance;
}

/**
 * Find the best matching product for a given OCR-detected product name.
 * Returns null if no suitable match found.
 */
export function matchProducts(
  rawName: string,
  products: Product[]
): MatchResult | null {
  if (!products.length || !rawName?.trim()) return null;

  const fuse = getFuse(products);
  const normalizedQuery = normalize(rawName);
  const results = fuse.search(normalizedQuery);

  if (!results.length) return null;

  const best = results[0];
  const score = best.score ?? 1;

  // Return null if match is too weak
  if (score > 0.5) return null;

  return {
    product: best.item,
    score: 1 - score, // convert to confidence (1 = best)
  };
}

/**
 * Match multiple raw names against product master
 */
export function matchAllProducts(
  rawNames: string[],
  products: Product[]
): Map<string, MatchResult | null> {
  const map = new Map<string, MatchResult | null>();
  for (const name of rawNames) {
    map.set(name, matchProducts(name, products));
  }
  return map;
}
