import React, { useState } from 'react';
import {
  RotateCcw,
  QrCode,
  Search,
  CheckCircle2,
  AlertTriangle,
  Camera,
  Printer,
  ShieldCheck,
  Package,
  Clock,
  ArrowRight,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BorrowRequest, BorrowRequestedItem } from '../../types';
import { formatThaiDate, isBorrowOverdue } from '../../utils/formatters';
import { DigitalSignaturePad } from '../common/DigitalSignaturePad';

interface ReturnInspectionCenterProps {
  onOpenScanner: () => void;
  onOpenReturnReceipt: (req: BorrowRequest) => void;
  selectedRequestForReturn?: BorrowRequest | null;
  onClearSelectedReturn?: () => void;
}

export const ReturnInspectionCenter: React.FC<ReturnInspectionCenterProps> = ({
  onOpenScanner,
  onOpenReturnReceipt,
  selectedRequestForReturn,
  onClearSelectedReturn,
}) => {
  const {
    borrowRequests,
    processReturn,
    orgSettings,
    currentUserDisplayName,
  } = useApp();

  const [activeReturnReq, setActiveReturnReq] = useState<BorrowRequest | null>(
    selectedRequestForReturn || null
  );

  const [searchQuery, setSearchQuery] = useState('');
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>();
  const [isDone, setIsDone] = useState(false);

  // Return inspection items state
  const [returnItemsState, setReturnItemsState] = useState<
    {
      assetId: string;
      returnedQty: number;
      conditionStatus: 'good' | 'damaged' | 'lost';
      conditionNote: string;
      damageFee: number;
    }[]
  >([]);

  // When an active request is selected, populate returnItemsState
  React.useEffect(() => {
    if (selectedRequestForReturn) {
      setActiveReturnReq(selectedRequestForReturn);
      setReturnItemsState(
        selectedRequestForReturn.items.map((i) => ({
          assetId: i.assetId,
          returnedQty: i.requestedQty,
          conditionStatus: 'good',
          conditionNote: 'ตรวจสภาพสมบูรณ์ พร้อมจัดเก็บเข้าคลัง',
          damageFee: 0,
        }))
      );
    }
  }, [selectedRequestForReturn]);

  const handleSelectRequest = (req: BorrowRequest) => {
    setActiveReturnReq(req);
    setIsDone(false);
    setReturnItemsState(
      req.items.map((i) => ({
        assetId: i.assetId,
        returnedQty: i.requestedQty,
        conditionStatus: 'good',
        conditionNote: 'ตรวจสภาพสมบูรณ์ พร้อมจัดเก็บเข้าคลัง',
        damageFee: 0,
      }))
    );
  };

  const currentlyIssuedList = borrowRequests.filter((r) => r.status === 'issued');

  const filteredIssued = currentlyIssuedList.filter((r) => {
    if (!searchQuery) return true;
    return (
      r.requestNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.queueNumber?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.borrowerName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.borrowerPhone?.includes(searchQuery)
    );
  });

  const handleConfirmReturn = () => {
    if (!activeReturnReq) return;

    const inspectedItems: BorrowRequestedItem[] = activeReturnReq.items.map((item) => {
      const state = returnItemsState.find((s) => s.assetId === item.assetId);
      return {
        ...item,
        returnedQty: state ? state.returnedQty : item.requestedQty,
        conditionAfter: state ? state.conditionNote : 'ปกติ',
      };
    });

    const hasDamaged = returnItemsState.some((s) => s.conditionStatus === 'damaged');
    const hasLost = returnItemsState.some((s) => s.conditionStatus === 'lost');

    const totalDamageFee = returnItemsState.reduce((sum, s) => sum + s.damageFee, 0);

    processReturn(
      activeReturnReq.id,
      inspectedItems,
      hasDamaged || hasLost
        ? `ตรวจพบรายการชำรุด/สูญหาย มีค่าชดใช้รวม ${totalDamageFee} บาท`
        : 'ตรวจรับคืนและเช็คสภาพเรียบร้อยทุกรายการ ส่งคืนสต็อกสมบูรณ์',
      signatureUrl,
      hasDamaged,
      hasLost,
      totalDamageFee
    );

    setIsDone(true);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 rounded-2xl p-5 text-white shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-400/20 text-emerald-300 text-xs font-semibold border border-emerald-400/30">
            <RotateCcw className="w-3.5 h-3.5" />
            จุดบริการตรวจรับคืนพัสดุ อบต.ฝางคำ
          </div>
          <h2 className="text-lg md:text-xl font-bold">
            ระบบสแกนรับคืนพัสดุและตรวจสภาพ (Inspection & Restock)
          </h2>
          <p className="text-xs text-emerald-200/90 max-w-2xl">
            สแกน QR Code จากใบยืมส่วนท้าย (Tear-off Slip) หรือเลือกลำดับคิวเพื่อตรวจนับสภาพอุปกรณ์ บันทึกความเสียหาย และเติมสต็อกอัตโนมัติ
          </p>
        </div>

        <button
          onClick={onOpenScanner}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all self-start sm:self-auto shrink-0"
        >
          <QrCode className="w-4 h-4 text-slate-950" />
          <span>สแกน QR ใบฉีกนัดคืน</span>
        </button>
      </div>

      {/* Main Grid: Selection / Scan on Left, Inspection Form on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: List of items currently out for borrowing */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                รายการพัสดุที่รอนำมาคืน ({currentlyIssuedList.length})
              </h3>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาคิว, เลขที่ใบยืม, ผู้ยืม..."
                className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
              />
            </div>

            {/* List */}
            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {filteredIssued.length === 0 ? (
                <div className="p-6 text-center text-xs text-slate-400">
                  ไม่มีรายการที่กำลังยืม หรือไม่พบข้อมูลตามคำค้นหา
                </div>
              ) : (
                filteredIssued.map((req) => {
                  const isSelected = activeReturnReq?.id === req.id;
                  const isOverdue = isBorrowOverdue(req.dueDate, req.status);

                  return (
                    <div
                      key={req.id}
                      onClick={() => handleSelectRequest(req)}
                      className={`p-3 rounded-xl border transition-all cursor-pointer space-y-1 ${
                        isSelected
                          ? 'bg-emerald-50/80 border-emerald-500 shadow-xs'
                          : 'bg-slate-50/60 border-slate-200 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono font-bold text-xs text-emerald-950 bg-emerald-100 px-2 py-0.5 rounded">
                          {req.queueNumber}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500 font-semibold">
                          {req.requestNumber}
                        </span>
                      </div>

                      <div className="text-xs font-bold text-slate-900">{req.borrowerName}</div>

                      <div className="text-[11px] text-slate-500 truncate">
                        {req.items.map((i) => `${i.assetName} (${i.requestedQty})`).join(', ')}
                      </div>

                      <div className="flex items-center justify-between text-[10px] pt-1">
                        <span className="text-slate-500">
                          กำหนด: {formatThaiDate(req.dueDate, 'short')}
                        </span>
                        {isOverdue && (
                          <span className="text-red-600 font-bold">⚠️ เกินกำหนด!</span>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Active Inspection Sheet */}
        <div className="lg:col-span-2 space-y-4">
          {activeReturnReq ? (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              
              {/* Header */}
              <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-amber-400 text-sm">
                      {activeReturnReq.queueNumber}
                    </span>
                    <h3 className="font-bold text-sm">
                      ตรวจรับคืนใบยืม: {activeReturnReq.requestNumber}
                    </h3>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5">
                    ผู้ยืม: {activeReturnReq.borrowerName} | 📞 {activeReturnReq.borrowerPhone}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-slate-400">จุดรับคืน</span>
                  <div className="text-xs font-semibold text-emerald-400">
                    {orgSettings.returnLocationDefault}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="p-6 space-y-6">
                
                {/* Inspection Checklist table */}
                <div className="space-y-3">
                  <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    ตารางตรวจสอบสภาพรายชิ้น (Condition Inspection)
                  </h4>

                  <div className="border border-slate-200 rounded-xl overflow-hidden">
                    <table className="w-full text-xs">
                      <thead className="bg-slate-100 font-semibold text-slate-700">
                        <tr>
                          <th className="p-2.5 text-left">รายการพัสดุ</th>
                          <th className="p-2.5 text-center w-24">จำนวนที่คืน</th>
                          <th className="p-2.5 text-left w-36">ผลการตรวจสภาพ</th>
                          <th className="p-2.5 text-left">หมายเหตุสภาพ / ค่าชดใช้</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {activeReturnReq.items.map((item, idx) => {
                          const itemState = returnItemsState[idx] || {
                            returnedQty: item.requestedQty,
                            conditionStatus: 'good',
                            conditionNote: '',
                            damageFee: 0,
                          };

                          return (
                            <tr key={idx} className="hover:bg-slate-50">
                              <td className="p-2.5">
                                <div className="font-semibold text-slate-900">{item.assetName}</div>
                                <div className="text-[11px] text-slate-500 font-mono">
                                  {item.assetCode} (ยืมไป {item.requestedQty} {item.unit})
                                </div>
                              </td>

                              <td className="p-2.5 text-center">
                                <input
                                  type="number"
                                  min={0}
                                  max={item.requestedQty}
                                  value={itemState.returnedQty}
                                  onChange={(e) => {
                                    const upd = [...returnItemsState];
                                    upd[idx].returnedQty = parseInt(e.target.value) || 0;
                                    setReturnItemsState(upd);
                                  }}
                                  className="w-16 p-1 text-center font-bold bg-slate-50 border border-slate-300 rounded"
                                />
                              </td>

                              <td className="p-2.5">
                                <select
                                  value={itemState.conditionStatus}
                                  onChange={(e) => {
                                    const val = e.target.value as 'good' | 'damaged' | 'lost';
                                    const upd = [...returnItemsState];
                                    upd[idx].conditionStatus = val;
                                    if (val === 'good') {
                                      upd[idx].conditionNote = 'ตรวจสภาพสมบูรณ์ พร้อมจัดเก็บเข้าคลัง';
                                      upd[idx].damageFee = 0;
                                    } else if (val === 'damaged') {
                                      upd[idx].conditionNote = 'ผ้าใบฉีกขาด / โครงเหล็กคดงอ ต้องซ่อมแซม';
                                      upd[idx].damageFee = 500;
                                    } else if (val === 'lost') {
                                      upd[idx].conditionNote = 'อุปกรณ์สูญหาย ไม่สามารถนำมาส่งมอบคืนได้';
                                      upd[idx].damageFee = 2500;
                                    }
                                    setReturnItemsState(upd);
                                  }}
                                  className={`w-full p-1 rounded font-semibold text-xs border ${
                                    itemState.conditionStatus === 'good'
                                      ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                                      : itemState.conditionStatus === 'damaged'
                                      ? 'bg-amber-50 text-amber-800 border-amber-300'
                                      : 'bg-red-50 text-red-800 border-red-300'
                                  }`}
                                >
                                  <option value="good">✓ สภาพปกติ ครบถ้วน</option>
                                  <option value="damaged">⚠️ ชำรุด/เสียหาย</option>
                                  <option value="lost">❌ สูญหาย ไม่ได้คืน</option>
                                </select>
                              </td>

                              <td className="p-2.5 space-y-1">
                                <input
                                  type="text"
                                  value={itemState.conditionNote}
                                  onChange={(e) => {
                                    const upd = [...returnItemsState];
                                    upd[idx].conditionNote = e.target.value;
                                    setReturnItemsState(upd);
                                  }}
                                  className="w-full text-[11px] p-1 bg-slate-50 border border-slate-200 rounded"
                                  placeholder="ระบุรายละเอียดสภาพอุปกรณ์"
                                />

                                {itemState.conditionStatus !== 'good' && (
                                  <div className="flex items-center gap-2">
                                    <span className="text-[10px] text-red-700 font-medium">ค่าปรับ/ค่าชดใช้:</span>
                                    <input
                                      type="number"
                                      value={itemState.damageFee}
                                      onChange={(e) => {
                                        const upd = [...returnItemsState];
                                        upd[idx].damageFee = parseFloat(e.target.value) || 0;
                                        setReturnItemsState(upd);
                                      }}
                                      className="w-24 text-[11px] p-0.5 bg-red-50 text-red-800 border border-red-300 rounded font-bold"
                                    />
                                    <span className="text-[10px] text-slate-500">บาท</span>
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Digital Signature */}
                <DigitalSignaturePad
                  label="ลายมือชื่อเจ้าหน้าที่ผู้ตรวจรับคืน (Officer Signature)"
                  signerName={currentUserDisplayName}
                  onSave={(url) => setSignatureUrl(url)}
                />

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-200">
                  <div className="text-xs text-slate-500">
                    เมื่อยืนยัน ระบบจะปรับยอดคงเหลือพัสดุในคลังกลับสู่สต็อกอัตโนมัติ
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleConfirmReturn}
                      className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all transform active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 text-emerald-200" />
                      บันทึกตรวจรับคืน & ปรับสต็อก
                    </button>

                    {isDone && (
                      <button
                        type="button"
                        onClick={() => onOpenReturnReceipt(activeReturnReq)}
                        className="px-4 py-2.5 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
                      >
                        <Printer className="w-4 h-4" />
                        พิมพ์ใบรับคืน A4
                      </button>
                    )}
                  </div>
                </div>

                {/* Success Banner */}
                {isDone && (
                  <div className="p-4 bg-emerald-50 border-2 border-emerald-500 rounded-xl text-emerald-950 flex items-center justify-between gap-3 animate-fadeIn">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
                      <div className="text-xs">
                        <strong className="text-sm">บันทึกตรวจรับคืนเสร็จสมบูรณ์!</strong>
                        <p className="text-emerald-800">
                          พัสดุถูกเติมกลับเข้าสต็อกเรียบร้อยแล้ว ท่านสามารถกดพิมพ์ใบรับคืนให้ผู้ยืมได้ทันที
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => onOpenReturnReceipt(activeReturnReq)}
                      className="px-3 py-1.5 bg-emerald-700 text-white rounded-lg text-xs font-bold hover:bg-emerald-800"
                    >
                      พิมพ์ใบรับคืน
                    </button>
                  </div>
                )}

              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border-2 border-dashed border-slate-300 p-12 text-center text-slate-400 space-y-3">
              <RotateCcw className="w-12 h-12 text-slate-300 mx-auto" />
              <h3 className="font-bold text-slate-700 text-sm">ยังไม่ได้เลือกรายการที่จะตรวจรับคืน</h3>
              <p className="text-xs max-w-sm mx-auto text-slate-500">
                กรุณาคลิกเลือกรายการยืมจากแถบซ้ายมือ หรือคลิกปุ่ม <strong>สแกน QR ใบฉีกนัดคืน</strong> ด้านบน
              </p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
};
