import { GoogleGenerativeAI } from '@google/generative-ai';
import type { DetectedItem, OCRResult } from '../types';
import type { Product } from '../types';
import { matchProducts } from './productMatcher';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY as string;
const genAI = new GoogleGenerativeAI(apiKey);

const OCR_PROMPT = `You are an expert at reading Indian retail invoices, challans, and purchase/sale slips (parchas).

Analyze this image carefully and extract ALL product names and their quantities.

Return ONLY a valid JSON array in this exact format, nothing else:
[
  {"product_name": "product name here", "quantity": 10},
  {"product_name": "another product", "quantity": 5}
]

Important rules:
- Extract every product you can find.
- Quantities should be positive integers.
- **Hindi-to-English Transliteration Rule**: If a product name is written in Hindi (Devanagari script, e.g. जोश, नूरी, बादल, सैनिक, जुगनू, साथी, कोयल, मिली), you MUST transliterate/translate it to English (e.g. "Josh", "Noorie", "Badal", "Sainik", "Jugnu", "Saathi", "Koyal", "Mili") so it matches the English catalog. Strictly do NOT use Devanagari/Hindi characters in the "product_name" output.
- Common Indian product slip abbreviations: Qty, Pcs, Nos, Nag, Pkt.
- If you see "pcs", "nos", "units" next to a number, that is the quantity.
- **Product Name Cleanup Rule**: Retailers often add the generic word "torch" or "torches" after product names on their slips (e.g. "Josh Torch", "9900 Torch", "Sainik Torches"). You MUST strip the trailing word "torch" or "torches" from the product name UNLESS the full product name is literally "Magic Torch". For example, write "Josh" not "Josh Torch", "9900" not "9900 Torch", but keep "Magic Torch" as-is.
- Return [] if no products found.
- Do NOT include any explanation, only the JSON array.`;

/**
 * Convert a base64 image string to a Gemini-compatible part
 */
function imageToGenerativePart(base64Data: string, mimeType: string) {
  return {
    inlineData: {
      data: base64Data,
      mimeType,
    },
  };
}

/**
 * Strip base64 prefix (data:image/jpeg;base64,...)
 */
function extractBase64(dataUrl: string): { data: string; mimeType: string } {
  const match = dataUrl.match(/^data:(.+);base64,(.+)$/);
  if (match) {
    return { mimeType: match[1], data: match[2] };
  }
  return { mimeType: 'image/jpeg', data: dataUrl };
}

export interface RawOCRItem {
  product_name: string;
  quantity: number;
}

/**
 * Send image to Gemini Vision and get structured product/quantity list
 */
export async function performOCR(
  imageDataUrl: string,
  productMaster: Product[]
): Promise<OCRResult> {
  const { data, mimeType } = extractBase64(imageDataUrl);

  // Models list in preference order. If one fails (503 / 429), it falls back to the next one.
  const modelsToTry = ['gemini-flash-latest', 'gemini-3.1-flash-lite'];
  let lastError: any = null;

  for (const modelName of modelsToTry) {
    try {
      console.log(`Running OCR with model: ${modelName}`);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent([
        OCR_PROMPT,
        imageToGenerativePart(data, mimeType),
      ]);

      const responseText = result.response.text().trim();

      // Parse the JSON array from Gemini response
      let rawItems: RawOCRItem[] = [];
      try {
        const jsonMatch = responseText.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          rawItems = JSON.parse(jsonMatch[0]);
        }
      } catch (err) {
        console.error(`Failed to parse Gemini OCR response from ${modelName}:`, responseText, err);
        rawItems = [];
      }

      // Run fuzzy matching against product master
      const detectedItems: DetectedItem[] = rawItems.map((item) => {
        const match = matchProducts(item.product_name, productMaster);
        return {
          product_name: item.product_name,
          matched_product: match?.product ?? null,
          quantity: Math.max(1, Math.round(item.quantity)),
          confidence: match?.score ?? 0,
        };
      });

      console.log(`Successfully completed OCR with model: ${modelName}`);
      return {
        items: detectedItems,
        raw_text: responseText,
      };
    } catch (err: any) {
      console.warn(`Model ${modelName} failed during OCR:`, err.message || err);
      lastError = err;
    }
  }

  throw lastError || new Error('All configured Gemini OCR models failed');
}
