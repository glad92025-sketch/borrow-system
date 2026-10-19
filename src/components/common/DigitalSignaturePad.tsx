import React, { useRef, useState, useEffect } from 'react';
import { RotateCcw, Check, PenTool } from 'lucide-react';

interface DigitalSignaturePadProps {
  label: string;
  signerName: string;
  onSave: (dataUrl: string) => void;
  onClear?: () => void;
  existingSignatureUrl?: string;
  required?: boolean;
}

export const DigitalSignaturePad: React.FC<DigitalSignaturePadProps> = ({
  label,
  signerName,
  onSave,
  onClear,
  existingSignatureUrl,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawn, setHasDrawn] = useState(false);
  const [savedUrl, setSavedUrl] = useState<string | null>(existingSignatureUrl || null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.strokeStyle = '#1e3a8a'; // Deep blue ink
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';

    if (existingSignatureUrl) {
      const img = new Image();
      img.src = existingSignatureUrl;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        setHasDrawn(true);
      };
    }
  }, [existingSignatureUrl]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
    setHasDrawn(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    if (isDrawing && canvasRef.current) {
      setIsDrawing(false);
      const url = canvasRef.current.toDataURL('image/png');
      setSavedUrl(url);
      onSave(url);
    }
  };

  const handleClear = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawn(false);
    setSavedUrl(null);
    if (onClear) onClear();
  };

  return (
    <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-xs font-semibold text-slate-700 flex items-center gap-1.5">
          <PenTool className="w-3.5 h-3.5 text-blue-600" />
          {label}
        </label>
        <span className="text-[11px] text-slate-500 font-medium">
          ผู้ลงนาม: <strong className="text-slate-800">{signerName}</strong>
        </span>
      </div>

      <div className="relative border border-slate-300 rounded-lg bg-white overflow-hidden shadow-inner">
        <canvas
          ref={canvasRef}
          width={360}
          height={120}
          className="w-full h-[120px] touch-none cursor-crosshair"
          onMouseDown={startDrawing}
          onMouseMove={draw}
          onMouseUp={stopDrawing}
          onMouseLeave={stopDrawing}
          onTouchStart={startDrawing}
          onTouchMove={draw}
          onTouchEnd={stopDrawing}
        />
        {!hasDrawn && !savedUrl && (
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs font-light">
            เซ็นลายมือชื่อดิจิทัลที่นี่
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-1">
        <button
          type="button"
          onClick={handleClear}
          className="px-2.5 py-1 text-xs text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded flex items-center gap-1 transition-colors"
        >
          <RotateCcw className="w-3 h-3" />
          ล้างลายเซ็น
        </button>

        {hasDrawn && (
          <div className="flex items-center gap-1 text-emerald-600 text-xs font-medium">
            <Check className="w-3.5 h-3.5" />
            บันทึกลายเซ็นแล้ว
          </div>
        )}
      </div>
    </div>
  );
};
