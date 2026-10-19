import React, { useState } from 'react';
import { X, QrCode, Camera, Search, Sparkles, CheckCircle2 } from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanResult: (code: string) => void;
  title?: string;
  subtitle?: string;
}

export const QRScannerModal: React.FC<QRScannerModalProps> = ({
  isOpen,
  onClose,
  onScanResult,
  title = 'สแกน QR Code / Barcode',
  subtitle = 'นำกล้องส่องที่ QR Code ประจำทรัพย์สิน หรือใบนัดคืน',
}) => {
  const { assets, borrowRequests } = useApp();
  const [manualCode, setManualCode] = useState('');
  const [isSimulatingScan, setIsSimulatingScan] = useState(false);

  if (!isOpen) return null;

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScanResult(manualCode.trim());
      onClose();
    }
  };

  const handleQuickPick = (code: string) => {
    setIsSimulatingScan(true);
    setTimeout(() => {
      setIsSimulatingScan(false);
      onScanResult(code);
      onClose();
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 to-indigo-900 p-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-lg bg-white/10 flex items-center justify-center">
              <QrCode className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <h3 className="font-semibold text-sm leading-tight">{title}</h3>
              <p className="text-xs text-blue-200 mt-0.5">{subtitle}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Viewfinder simulation */}
        <div className="p-6 space-y-4">
          <div className="relative aspect-square max-w-[260px] mx-auto bg-slate-900 rounded-2xl overflow-hidden flex flex-col items-center justify-center border-4 border-slate-800 shadow-inner">
            {/* Animated Laser line */}
            <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-transparent via-red-500 to-transparent shadow-[0_0_8px_#ef4444] animate-pulse" />
            
            {/* Viewfinder corners */}
            <div className="absolute top-4 left-4 w-7 h-7 border-t-2 border-l-2 border-amber-400 rounded-tl-md" />
            <div className="absolute top-4 right-4 w-7 h-7 border-t-2 border-r-2 border-amber-400 rounded-tr-md" />
            <div className="absolute bottom-4 left-4 w-7 h-7 border-b-2 border-l-2 border-amber-400 rounded-bl-md" />
            <div className="absolute bottom-4 right-4 w-7 h-7 border-b-2 border-r-2 border-amber-400 rounded-br-md" />

            <Camera className="w-12 h-12 text-slate-600 mb-2" />
            <p className="text-xs text-slate-400 text-center px-4">
              {isSimulatingScan ? 'กำลังอ่านโค้ด...' : 'จัดวาง QR Code / บาร์โค้ด ให้อยู่ในกรอบ'}
            </p>
          </div>

          {/* Quick Click Samples for easy testing */}
          <div className="space-y-2">
            <div className="flex items-center gap-1 text-xs font-semibold text-slate-700">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>คลิกเพื่อทดสอบสแกนตัวอย่าง (Quick Test QR):</span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickPick('B-0011')}
                className="p-2 text-left bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg text-blue-900 transition-colors"
              >
                <strong className="block font-semibold">คิว B-0011</strong>
                <span className="text-[11px] text-blue-700 truncate block">นายรักกี้ (เต็นท์ 2 หลัง)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPick('AST-FK-0007')}
                className="p-2 text-left bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg text-amber-900 transition-colors"
              >
                <strong className="block font-semibold">AST-FK-0007</strong>
                <span className="text-[11px] text-amber-700 truncate block">เต้นท์ (อบต.ฝางคำ)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPick('B-0026')}
                className="p-2 text-left bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-emerald-900 transition-colors"
              >
                <strong className="block font-semibold">คิว B-0026</strong>
                <span className="text-[11px] text-emerald-700 truncate block">นายวรวุฒิ ดวงแก้ว (เก้าอี้)</span>
              </button>

              <button
                type="button"
                onClick={() => handleQuickPick('AST-FK-0008')}
                className="p-2 text-left bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded-lg text-purple-900 transition-colors"
              >
                <strong className="block font-semibold">AST-FK-0008</strong>
                <span className="text-[11px] text-purple-700 truncate block">เก้าอี้ (อบต.ฝางคำ)</span>
              </button>
            </div>
          </div>

          {/* Manual input */}
          <form onSubmit={handleManualSubmit} className="pt-2 border-t border-slate-100">
            <label className="block text-xs font-medium text-slate-600 mb-1">
              หรือระบุรหัสทรัพย์สิน / เลขที่ใบยืม ด้วยตนเอง
            </label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={manualCode}
                  onChange={(e) => setManualCode(e.target.value)}
                  placeholder="เช่น B-0069 หรือ AST-69-0001"
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
                />
              </div>
              <button
                type="submit"
                className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-medium rounded-lg transition-colors flex items-center gap-1"
              >
                <CheckCircle2 className="w-3.5 h-3.5" />
                ตกลง
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
