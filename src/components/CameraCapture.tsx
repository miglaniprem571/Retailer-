import React, { useRef, useState, useCallback } from 'react';
import Webcam from 'react-webcam';
import { Camera, Upload, X, ZoomIn } from 'lucide-react';

interface CameraCaptureProps {
  onCapture: (imageDataUrl: string) => void;
  onCancel: () => void;
  type: 'PURCHASE' | 'SALE';
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, onCancel, type }) => {
  const webcamRef = useRef<Webcam>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [cameraError, setCameraError] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);

  const accentColor = type === 'PURCHASE' ? '#22C55E' : '#EF4444';
  const label = type === 'PURCHASE' ? 'खरीद पर्ची / Purchase Slip' : 'बिक्री पर्ची / Sale Slip';

  const capturePhoto = useCallback(() => {
    const imageSrc = webcamRef.current?.getScreenshot();
    if (imageSrc) {
      onCapture(imageSrc);
    }
  }, [onCapture]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (ev) => {
      const result = ev.target?.result as string;
      if (result) onCapture(result);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="fixed inset-0 z-50 bg-brand-bg flex flex-col animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 pt-safe">
        <button
          onClick={onCancel}
          className="w-10 h-10 rounded-full bg-brand-card border border-brand-border flex items-center justify-center active:scale-90 transition-transform"
        >
          <X size={20} className="text-brand-muted" />
        </button>
        <div className="text-center">
          <p className="text-brand-text font-semibold text-base">{label}</p>
          <p className="text-brand-subtle text-xs mt-0.5">पर्ची को फ्रेम में रखें</p>
        </div>
        <div className="w-10" />
      </div>

      {/* Camera View */}
      <div className="flex-1 px-4 flex flex-col items-center justify-center gap-4">
        <div className="camera-container relative w-full max-w-sm mx-auto" style={{ maxHeight: '60vh', aspectRatio: '3/4' }}>
          {!cameraError ? (
            <>
              <Webcam
                ref={webcamRef}
                audio={false}
                screenshotFormat="image/jpeg"
                videoConstraints={{
                  facingMode: { ideal: 'environment' },
                  width: { ideal: 1280 },
                  height: { ideal: 960 },
                }}
                onUserMedia={() => setCameraReady(true)}
                onUserMediaError={() => setCameraError(true)}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              {/* Scan animation overlay */}
              {cameraReady && (
                <>
                  {/* Dark vignette overlay */}
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.5) 100%)',
                    }}
                  />
                  {/* Corners */}
                  <div className="scan-corner scan-corner-tl" style={{ borderColor: accentColor }} />
                  <div className="scan-corner scan-corner-tr" style={{ borderColor: accentColor }} />
                  <div className="scan-corner scan-corner-bl" style={{ borderColor: accentColor }} />
                  <div className="scan-corner scan-corner-br" style={{ borderColor: accentColor }} />
                  {/* Scan line */}
                  <div className="scan-line" style={{
                    background: `linear-gradient(90deg, transparent, ${accentColor}, transparent)`,
                    boxShadow: `0 0 10px ${accentColor}, 0 0 20px ${accentColor}`,
                  }} />
                </>
              )}
            </>
          ) : (
            /* Camera unavailable fallback */
            <div className="w-full h-full flex flex-col items-center justify-center gap-4 bg-brand-card rounded-3xl">
              <Camera size={48} className="text-brand-subtle" />
              <p className="text-brand-muted text-center text-sm px-4">
                Camera not available.<br />Please upload a photo.
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-brand-subtle text-xs">
          <ZoomIn size={14} />
          <span>Make sure the slip is clear and in focus</span>
        </div>
      </div>

      {/* Bottom Controls */}
      <div className="px-4 pb-8 pb-safe flex flex-col gap-3">
        {/* Capture Button */}
        {!cameraError && (
          <button
            onClick={capturePhoto}
            className="relative mx-auto active:scale-90 transition-transform"
            style={{ width: 80, height: 80 }}
            id="btn-capture-photo"
          >
            <div
              className="absolute inset-0 rounded-full border-4"
              style={{ borderColor: accentColor }}
            />
            <div
              className="absolute inset-2 rounded-full"
              style={{ backgroundColor: accentColor }}
            />
          </button>
        )}

        {/* Upload from gallery */}
        <button
          onClick={() => fileInputRef.current?.click()}
          className="w-full py-3 rounded-2xl border border-brand-border bg-brand-card text-brand-text font-semibold flex items-center justify-center gap-2 active:scale-95 transition-transform"
          id="btn-upload-photo"
        >
          <Upload size={18} />
          Gallery से चुनें / Upload Photo
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          onChange={handleFileUpload}
          className="hidden"
        />
      </div>
    </div>
  );
};
