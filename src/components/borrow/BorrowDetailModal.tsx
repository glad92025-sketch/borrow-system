import React, { useState } from 'react';
import {
  X,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  UserCheck,
  ShieldCheck,
  Send,
  Camera,
  RotateCcw,
  FileText,
  Scissors,
  Check,
  AlertTriangle,
  History,
  QrCode,
  PenTool,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BorrowRequest, BorrowRequestStatus } from '../../types';
import { formatThaiDate, getStatusBadgeInfo, isBorrowOverdue } from '../../utils/formatters';
import { DigitalSignaturePad } from '../common/DigitalSignaturePad';
import { EditBorrowModal } from './EditBorrowModal';

interface BorrowDetailModalProps {
  request: BorrowRequest;
  onClose: () => void;
  onOpenDocumentView: (req: BorrowRequest) => void;
  onOpenReturnFlow: (req: BorrowRequest) => void;
}

export const BorrowDetailModal: React.FC<BorrowDetailModalProps> = ({
  request,
  onClose,
  onOpenDocumentView,
  onOpenReturnFlow,
}) => {
  const {
    currentRole,
    currentUserDisplayName,
    updateRequestStatus,
    deleteBorrowRequest,
    orgSettings,
    rulesConfig,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'info' | 'workflow' | 'history'>('info');
  const [comment, setComment] = useState('');
  const [signatureUrl, setSignatureUrl] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  const statusBadge = getStatusBadgeInfo(request.status);
  const isOverdue = isBorrowOverdue(request.dueDate, request.status);

  // Workflow action handlers
  const handlePassInspection = () => {
    setIsProcessing(true);
    updateRequestStatus(
      request.id,
      'pending_approval',
      comment || 'เจ้าหน้าที่พัสดุตรวจสอบประวัติผู้ยืมและสภาพพัสดุในคลัง - ผ่านการตรวจสอบ เสนอผู้บริหารอนุมัติ'
    );
    setIsProcessing(false);
    onClose();
  };

  const handleApprove = () => {
    setIsProcessing(true);
    updateRequestStatus(
      request.id,
      'approved',
      comment || 'อนุมัติคำขอยืมตามระเบียบพัสดุ อบต.ฝางคำ',
      signatureUrl
    );
    setIsProcessing(false);
    onClose();
  };

  const handleReject = () => {
    if (!comment) {
      alert('กรุณาระบุเหตุผลการไม่อนุมัติคำขอ');
      return;
    }
    setIsProcessing(true);
    updateRequestStatus(request.id, 'rejected', comment);
    setIsProcessing(false);
    onClose();
  };

  const handleIssueAndDeliver = () => {
    setIsProcessing(true);
    updateRequestStatus(
      request.id,
      'issued',
      comment || 'ตรวจสภาพก่อนส่งมอบครบถ้วน ผู้ยืมเซ็นรับพัสดุและรับใบฉีกส่วนท้ายเรียบร้อย',
      signatureUrl,
      {
        deliveredBy: currentUserDisplayName,
        deliveredAt: new Date().toLocaleString('th-TH'),
      }
    );
    setIsProcessing(false);
    // Directly open document print view
    onOpenDocumentView(request);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-6">
        
        {/* Modal Top Bar */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold text-sm font-mono">
              {request.queueNumber}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base">{request.requestNumber}</h3>
                <span className={`text-xs px-2.5 py-0.5 rounded-full font-semibold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                  {statusBadge.label}
                </span>
                {isOverdue && (
                  <span className="text-[10px] bg-red-600 text-white font-bold px-2 py-0.5 rounded">
                    เกินกำหนดส่งคืน!
                  </span>
                )}
              </div>
              <p className="text-xs text-blue-200 mt-0.5">
                ผู้ยืม: {request.borrowerName} | กำหนดคืน: {formatThaiDate(request.dueDate)} ({request.dueTime})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors shadow-xs cursor-pointer"
              title="แก้ไขข้อมูลคำขอยืมนี้"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>แก้ไขคำขอ</span>
            </button>
            <button
              onClick={() => onOpenDocumentView(request)}
              className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-amber-300 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors border border-blue-600/70"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>พิมพ์ใบยืม & ส่วนท้ายฉีก</span>
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-slate-100 border-b border-slate-200 px-6 pt-2 flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('info')}
            className={`pb-2.5 border-b-2 transition-all ${
              activeTab === 'info'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            ข้อมูลคำขอ & รายการสิ่งของ
          </button>
          <button
            onClick={() => setActiveTab('workflow')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1 ${
              activeTab === 'workflow'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-amber-500" />
            ดำเนินการตามขั้นตอนราชการ (Actions)
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`pb-2.5 border-b-2 transition-all flex items-center gap-1 ${
              activeTab === 'history'
                ? 'border-blue-700 text-blue-900 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            ประวัติการปฏิบัติงาน (Audit Trail)
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 max-h-[72vh] overflow-y-auto space-y-6">
          
          {/* TAB 1: INFO & ITEMS */}
          {activeTab === 'info' && (
            <div className="space-y-5">
              
              {/* Highlight Tear-off Reminder Box */}
              <div className="p-4 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-xl flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900">
                    <Scissors className="w-4 h-4 text-amber-700" />
                    <span>ใบนัดคืนและบัตรคิวผู้ยืม (Tear-off Return Slip)</span>
                  </div>
                  <p className="text-xs text-amber-800">
                    ผู้ยืมได้รับมอบหมายคิว <strong>{request.queueNumber}</strong> กำหนดส่งคืน ณ <strong>{orgSettings.returnLocationDefault}</strong> ภายใน <strong>วันที่ {formatThaiDate(request.dueDate)} เวลา {request.dueTime}</strong>
                  </p>
                </div>
                <button
                  onClick={() => onOpenDocumentView(request)}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-lg shrink-0 shadow-xs transition-colors"
                >
                  เปิดดูใบยืมฉบับเต็ม
                </button>
              </div>

              {/* Borrower & Venue Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs bg-slate-50 p-4 rounded-xl border border-slate-200">
                <div>
                  <span className="text-slate-500">ชื่อผู้ยืม: </span>
                  <strong className="text-slate-900 text-sm">{request.borrowerName}</strong> ({request.borrowerType === 'citizen' ? 'ประชาชน' : 'เจ้าหน้าที่'})
                </div>
                <div>
                  <span className="text-slate-500">เบอร์โทรศัพท์: </span>
                  <span className="font-mono font-bold text-slate-900">{request.borrowerPhone}</span>
                </div>
                <div>
                  <span className="text-slate-500">สังกัด / ที่อยู่: </span>
                  <span>{request.borrowerDepartmentOrMoo}</span>
                </div>
                <div>
                  <span className="text-slate-500">รหัสประจำตัว: </span>
                  <span className="font-mono">{request.borrowerIdCardOrEmpCode}</span>
                </div>
                <div className="md:col-span-2 pt-2 border-t border-slate-200">
                  <span className="text-slate-500">วัตถุประสงค์: </span>
                  <span className="font-semibold text-slate-800">{request.purpose}</span>
                </div>
                <div className="md:col-span-2">
                  <span className="text-slate-500">สถานที่นำไปใช้งาน: </span>
                  <span>{request.venueOfUse}</span>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                  รายการพัสดุ/ครุภัณฑ์ในใบยืม ({request.items.length} รายการ)
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden">
                  <table className="w-full text-xs">
                    <thead className="bg-slate-100 font-semibold text-slate-700">
                      <tr>
                        <th className="p-2.5 text-center w-10">ลำดับ</th>
                        <th className="p-2.5 text-center w-28">รหัสทรัพย์สิน</th>
                        <th className="p-2.5 text-left">รายการ</th>
                        <th className="p-2.5 text-center w-20">จำนวน</th>
                        <th className="p-2.5 text-left">สภาพก่อนยืม</th>
                        <th className="p-2.5 text-left">สภาพหลังคืน</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {request.items.map((item, idx) => (
                        <tr key={idx} className="hover:bg-slate-50">
                          <td className="p-2.5 text-center">{idx + 1}</td>
                          <td className="p-2.5 text-center font-mono font-medium">{item.assetCode}</td>
                          <td className="p-2.5 font-medium">{item.assetName}</td>
                          <td className="p-2.5 text-center font-bold text-blue-900">
                            {item.requestedQty} {item.unit}
                          </td>
                          <td className="p-2.5 text-slate-600">{item.conditionBefore || 'สมบูรณ์'}</td>
                          <td className="p-2.5 text-slate-600">{item.conditionAfter || '-'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Terms Agreed Notice */}
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-[11px] text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>ผู้ยืมได้ลงนามยอมรับกฎระเบียบการยืม อบต.ฝางคำ ฉบับที่ {request.agreedTermsVersion} เรียบร้อยแล้ว</span>
                </div>
                <span className="text-slate-400 font-mono">{request.agreedAt}</span>
              </div>

            </div>
          )}

          {/* TAB 2: WORKFLOW ACTIONS */}
          {activeTab === 'workflow' && (
            <div className="space-y-6">
              
              {/* Current Stage Indicator */}
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
                <span className="text-xs font-semibold text-slate-500 uppercase">สถานะปัจจุบัน</span>
                <div className="flex items-center gap-3">
                  <span className={`text-sm px-3 py-1 rounded-full font-bold border ${statusBadge.bg} ${statusBadge.text} ${statusBadge.border}`}>
                    {statusBadge.label}
                  </span>
                  <span className="text-xs text-slate-600">
                    เข้าสู่ขั้นตอนโดย: {currentUserDisplayName} ({currentRole})
                  </span>
                </div>
              </div>

              {/* STAGE 1: PENDING CHECK (Supply Officer Action) */}
              {request.status === 'pending_check' && (
                <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                    <UserCheck className="w-5 h-5 text-amber-700" />
                    <span>ขั้นตอนที่ 1: การตรวจสอบพัสดุและประวัติผู้ยืม (เจ้าหน้าที่พัสดุ)</span>
                  </div>

                  <p className="text-xs text-amber-900 leading-relaxed">
                    เจ้าหน้าที่พัสดุต้องตรวจสอบว่าพัสดุมีเพียงพอในคลัง และผู้ยืมไม่มีประวัติค้างส่งหรือค้างชำระค่าเสียหาย จากนั้นจึงเสนอผู้อนุมัติ
                  </p>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ความเห็นผลการตรวจสอบ:
                    </label>
                    <textarea
                      rows={2}
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="เช่น ตรวจสอบแล้ว พัสดุมีพร้อมให้บริการ และผู้ยืมมีประวัติดี เสนอเพื่อโปรดพิจารณาอนุมัติ"
                      className="w-full text-xs p-2.5 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handlePassInspection}
                      className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <Check className="w-4 h-4" />
                      ตรวจสอบผ่าน & เสนอผู้อนุมัติ
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 2: PENDING APPROVAL (Executive Action) */}
              {request.status === 'pending_approval' && (
                <div className="bg-blue-50/70 border border-blue-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-blue-950 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-blue-700" />
                    <span>ขั้นตอนที่ 2: การพิจารณาอนุมัติ (ผู้บริหาร / นายก อบต. / ปลัด)</span>
                  </div>

                  <p className="text-xs text-blue-900 leading-relaxed">
                    ผู้มีอำนาจตรวจสอบวัตถุประสงค์และลงนามอนุมัติคำขอยืมในระบบ
                  </p>

                  <DigitalSignaturePad
                    label="ลงนามอนุมัติคำขอยืม (Digital Signature)"
                    signerName={currentUserDisplayName}
                    onSave={(url) => setSignatureUrl(url)}
                  />

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      ข้อสั่งการ / ความเห็นการอนุมัติ:
                    </label>
                    <input
                      type="text"
                      value={comment}
                      onChange={(e) => setComment(e.target.value)}
                      placeholder="เช่น อนุมัติให้ยืมเพื่อประโยชน์สาธารณะตามระเบียบ"
                      className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                    />
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleApprove}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      อนุมัติคำขอยืม (Approve)
                    </button>

                    <button
                      type="button"
                      onClick={handleReject}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      ไม่อนุมัติ (Reject)
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 3: APPROVED -> READY FOR DELIVERY (Issue Assets) */}
              {request.status === 'approved' && (
                <div className="bg-purple-50/70 border border-purple-200 rounded-xl p-5 space-y-4">
                  <div className="flex items-center gap-2 text-purple-950 font-bold text-sm">
                    <Scissors className="w-5 h-5 text-purple-700" />
                    <span>ขั้นตอนที่ 3: ตรวจสภาพก่อนจ่ายและส่งมอบ (เจ้าหน้าที่พัสดุ)</span>
                  </div>

                  <p className="text-xs text-purple-900 leading-relaxed">
                    เจ้าหน้าที่ตรวจนับจำนวน ตรวจสภาพโครงสร้าง ให้ผู้ยืมลงชื่อรับของ และมอบ <strong>ใบยืมพร้อมส่วนท้ายฉีกได้ (Tear-off Slip)</strong>
                  </p>

                  <DigitalSignaturePad
                    label="ลายมือชื่อผู้รับมอบสิ่งของ (ผู้ยืม)"
                    signerName={request.borrowerName}
                    onSave={(url) => setSignatureUrl(url)}
                  />

                  <div className="flex items-center gap-3 pt-2">
                    <button
                      type="button"
                      onClick={handleIssueAndDeliver}
                      className="px-5 py-2.5 bg-gradient-to-r from-purple-700 to-indigo-800 hover:from-purple-800 hover:to-indigo-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2 transition-all transform active:scale-95"
                    >
                      <CheckCircle2 className="w-4 h-4 text-amber-300" />
                      จ่ายของ ส่งมอบ และพิมพ์ใบฉีกส่วนท้าย
                    </button>
                  </div>
                </div>
              )}

              {/* STAGE 4: CURRENTLY ISSUED -> CAN RETURN */}
              {request.status === 'issued' && (
                <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-950 font-bold text-sm">
                      <Clock className="w-5 h-5 text-emerald-700" />
                      <span>สถานะ: กำลังยืม (พัสดุอยู่นอกคลัง)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenReturnFlow(request);
                      }}
                      className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
                    >
                      <RotateCcw className="w-4 h-4" />
                      เปิดหน้าจอตรวจรับคืนพัสดุ (Scan & Return)
                    </button>
                  </div>

                  <p className="text-xs text-emerald-900">
                    ส่งมอบแล้วเมื่อ: <strong>{request.deliveredAt || formatThaiDate(request.pickupDate)}</strong> โดย {request.deliveredBy || orgSettings.supplyOfficerName}
                  </p>
                </div>
              )}

            </div>
          )}

          {/* TAB 3: AUDIT TRAIL / WORKFLOW HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider">
                ประวัติขั้นตอนการอนุมัติและปฏิบัติงาน (100% Traceable)
              </h4>

              <div className="border-l-2 border-blue-200 ml-3 space-y-6 pl-4">
                {request.history.map((h, idx) => (
                  <div key={idx} className="relative space-y-1 text-xs">
                    {/* Dot */}
                    <div className="absolute -left-[23px] top-0.5 w-3.5 h-3.5 rounded-full bg-blue-600 border-2 border-white shadow-xs" />
                    
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{h.stepName}</span>
                      <span className="text-[11px] text-slate-400 font-mono">{h.timestamp}</span>
                    </div>

                    <p className="text-slate-700 font-medium">{h.action}</p>

                    <div className="text-[11px] text-slate-500 flex items-center gap-3">
                      <span>ผู้ดำเนินการ: <strong>{h.actorName}</strong> ({h.actorRole})</span>
                      <span>IP: {h.ipAddress}</span>
                    </div>

                    {h.comment && (
                      <div className="bg-slate-50 p-2 rounded-lg text-[11px] text-slate-700 border border-slate-200 mt-1 italic">
                        "{h.comment}"
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="bg-slate-100 p-4 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <span className="text-[11px] text-slate-500 font-mono">
              ID: {request.id} | สร้างเมื่อ {request.requestDate}
            </span>
            
            {!showConfirmDelete ? (
              <button
                type="button"
                onClick={() => setShowConfirmDelete(true)}
                className="px-2.5 py-1 text-red-600 hover:text-red-700 hover:bg-red-50 text-[11px] font-semibold rounded-lg transition-colors flex items-center gap-1 border border-red-200 cursor-pointer"
                title="ลบคำขอนี้ออกจากระบบ"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบคำขอนี้</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-red-50 p-1 rounded-lg border border-red-200">
                <span className="text-[11px] font-bold text-red-800 pl-1">ยืนยันลบ?</span>
                <button
                  type="button"
                  onClick={() => {
                    deleteBorrowRequest(request.id);
                    onClose();
                  }}
                  className="px-2 py-0.5 bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold rounded cursor-pointer"
                >
                  ลบทันที
                </button>
                <button
                  type="button"
                  onClick={() => setShowConfirmDelete(false)}
                  className="px-1.5 py-0.5 text-slate-600 hover:text-slate-800 text-[10px] font-semibold cursor-pointer"
                >
                  ยกเลิก
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="px-3.5 py-1.5 bg-amber-50 hover:bg-amber-100 border border-amber-300 text-amber-900 text-xs font-bold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
              <span>แก้ไขคำขอ</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer"
            >
              ปิดหน้าต่าง
            </button>
          </div>
        </div>

      </div>

      {/* EDIT BORROW REQUEST MODAL */}
      {showEditModal && (
        <EditBorrowModal
          request={request}
          onClose={() => setShowEditModal(false)}
        />
      )}

    </div>
  );
};
