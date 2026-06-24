import React, { useState } from 'react';
import { CameraCapture } from './CameraCapture';
import { DetectedItems } from './DetectedItems';
import { performOCR } from '../lib/geminiOcr';
import { recordTransaction, uploadSlipImage } from '../lib/inventory';
import type { DetectedItem } from '../types';
import type { Product } from '../types';
import { CheckCircle, AlertCircle } from 'lucide-react';

type FlowStep = 'camera' | 'processing' | 'review' | 'done' | 'error';

interface ScanFlowProps {
  type: 'PURCHASE' | 'SALE';
  products: Product[];
  userId: string;
  onClose: () => void;
  onSuccess: () => void;
}

export const ScanFlow: React.FC<ScanFlowProps> = ({ type, products, userId, onClose, onSuccess }) => {
  const [step, setStep] = useState<FlowStep>('camera');
  const [capturedImage, setCapturedImage] = useState<string>('');
  const [detectedItems, setDetectedItems] = useState<DetectedItem[]>([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [processingMsg, setProcessingMsg] = useState('');
  const [confirmedCount, setConfirmedCount] = useState(0);

  const isPurchase = type === 'PURCHASE';

  const handleCapture = async (imageDataUrl: string) => {
    setCapturedImage(imageDataUrl);
    setStep('processing');
    setProcessingMsg('पर्ची पढ़ी जा रही है… / Reading slip…');

    try {
      const result = await performOCR(imageDataUrl, products);
      setDetectedItems(result.items);
      setStep('review');
    } catch (err: any) {
      console.error('OCR error:', err);
      setErrorMsg('पर्ची पढ़ने में दिक्कत हुई। / Could not read slip. Please try again.');
      setStep('error');
    }
  };

  const handleConfirm = async (items: DetectedItem[]) => {
    setStep('processing');
    setProcessingMsg('Stock update हो रहा है… / Updating stock…');

    try {
      // Upload image in background (optional, non-blocking)
      const imageUrl = await uploadSlipImage(capturedImage, type).catch(() => undefined);

      // Record all transactions
      await recordTransaction(items, type, userId, imageUrl);

      setConfirmedCount(items.length);
      setStep('done');

      // Auto-close after success
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 2000);
    } catch (err: any) {
      console.error('Transaction error:', err);
      setErrorMsg('Stock update नहीं हो पाया। / Failed to update stock. ' + (err.message ?? ''));
      setStep('error');
    }
  };

  if (step === 'camera') {
    return (
      <CameraCapture
        onCapture={handleCapture}
        onCancel={onClose}
        type={type}
      />
    );
  }

  if (step === 'processing') {
    return (
      <div className="fixed inset-0 z-50 bg-brand-bg flex flex-col items-center justify-center gap-8 animate-fade-in">
        <div className="ocr-spinner" style={{ borderTopColor: isPurchase ? '#22C55E' : '#EF4444' }} />
        <div className="text-center px-8">
          <p className="text-brand-text font-semibold text-xl">{processingMsg}</p>
          <p className="text-brand-subtle text-sm mt-2">
            {isPurchase ? 'Gemini AI' : 'Gemini AI'} is analyzing your slip…
          </p>
        </div>
        {capturedImage && (
          <img
            src={capturedImage}
            alt="Captured slip"
            className="w-36 h-48 object-cover rounded-2xl border border-brand-border opacity-60"
          />
        )}
      </div>
    );
  }

  if (step === 'review') {
    return (
      <DetectedItems
        items={detectedItems}
        type={type}
        capturedImage={capturedImage}
        onConfirm={handleConfirm}
        onCancel={onClose}
      />
    );
  }

  if (step === 'done') {
    return (
      <div className="fixed inset-0 z-50 bg-brand-bg flex flex-col items-center justify-center gap-6 animate-scale-in">
        <div
          className="w-24 h-24 rounded-full flex items-center justify-center"
          style={{ background: isPurchase ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)' }}
        >
          <CheckCircle
            size={52}
            style={{ color: isPurchase ? '#22C55E' : '#EF4444' }}
          />
        </div>
        <div className="text-center px-8">
          <p className="text-brand-text font-bold text-2xl mb-2">
            {isPurchase ? 'खरीद दर्ज हुई!' : 'बिक्री दर्ज हुई!'}
          </p>
          <p className="text-brand-muted text-lg">
            {isPurchase ? 'Purchase recorded!' : 'Sale recorded!'}
          </p>
          <p className="text-brand-subtle text-sm mt-2">
            {confirmedCount} product{confirmedCount !== 1 ? 's' : ''} updated
          </p>
        </div>
        <div className="flex gap-1 mt-2">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="w-2 h-2 rounded-full"
              style={{
                background: isPurchase ? '#22C55E' : '#EF4444',
                animation: `pulse 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
      </div>
    );
  }

  if (step === 'error') {
    return (
      <div className="fixed inset-0 z-50 bg-brand-bg flex flex-col items-center justify-center gap-6 px-8 animate-scale-in">
        <div className="w-24 h-24 rounded-full bg-red-500/15 flex items-center justify-center">
          <AlertCircle size={52} className="text-red-400" />
        </div>
        <div className="text-center">
          <p className="text-brand-text font-bold text-xl mb-2">कुछ गड़बड़ हुई</p>
          <p className="text-brand-muted text-base">{errorMsg}</p>
        </div>
        <div className="w-full space-y-3">
          <button
            onClick={() => setStep('camera')}
            className="btn-primary bg-brand-purchase text-white"
            id="btn-retry-scan"
          >
            दोबारा स्कैन करें / Try Again
          </button>
          <button
            onClick={onClose}
            className="btn-primary bg-brand-card border border-brand-border text-brand-text"
          >
            रद्द करें / Cancel
          </button>
        </div>
      </div>
    );
  }

  return null;
};
