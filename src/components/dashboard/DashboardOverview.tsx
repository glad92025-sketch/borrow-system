import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Package,
  CheckCircle2,
  Clock,
  AlertCircle,
  AlertTriangle,
  RotateCcw,
  TrendingUp,
  FileText,
  Calendar,
  Users,
  ShieldCheck,
  ArrowUpRight,
  ArrowRight,
  Printer,
  Scissors,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatThaiDate, formatBaht, getStatusBadgeInfo, isBorrowOverdue } from '../../utils/formatters';

interface DashboardOverviewProps {
  onOpenNewBorrowModal: () => void;
  onOpenScanner: () => void;
  onOpenDocumentView: (req: any) => void;
}

export const DashboardOverview: React.FC<DashboardOverviewProps> = ({
  onOpenNewBorrowModal,
  onOpenScanner,
  onOpenDocumentView,
}) => {
  const {
    assets,
    borrowRequests,
    damageCases,
    lostCases,
    citizens,
    employees,
    setActiveTab,
    setSelectedRequestId,
    orgSettings,
  } = useApp();

  // Metrics calculations
  const totalAssetsCount = assets.reduce((sum, a) => sum + a.quantityTotal, 0);
  const availableAssetsCount = assets.reduce((sum, a) => sum + a.quantityAvailable, 0);
  const borrowedAssetsCount = totalAssetsCount - availableAssetsCount;

  const pendingCheckRequests = borrowRequests.filter((r) => r.status === 'pending_check');
  const pendingApprovalRequests = borrowRequests.filter((r) => r.status === 'pending_approval');
  const approvedRequests = borrowRequests.filter((r) => r.status === 'approved');
  const currentlyIssuedRequests = borrowRequests.filter((r) => r.status === 'issued');
  
  // Overdue calculation
  const overdueRequests = currentlyIssuedRequests.filter(
    (r) => isBorrowOverdue(r.dueDate, r.status)
  );

  // Focus request for tear-off preview (e.g. latest issued or first active)
  const previewRequest =
    borrowRequests.find((r) => r.status === 'issued') || borrowRequests[0];

  return (
    <div className="space-y-6">
      
      {/* 4 Clean Minimalist Top KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Total Assets */}
        <div 
          onClick={() => setActiveTab('assets')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors cursor-pointer"
        >
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">
            พัสดุในระบบทั้งหมด
          </p>
          <p className="text-2xl font-bold text-slate-800">
            {totalAssetsCount.toLocaleString()}
          </p>
          <p className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="text-emerald-600 font-bold">+{availableAssetsCount}</span> พร้อมให้ยืมใช้งาน
          </p>
        </div>

        {/* Card 2: Currently Borrowed */}
        <div 
          onClick={() => setActiveTab('borrows')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-blue-200 transition-colors cursor-pointer"
        >
          <p className="text-[10px] font-bold text-blue-500 uppercase tracking-wider mb-1">
            กำลังยืม
          </p>
          <p className="text-2xl font-bold text-slate-800">
            {currentlyIssuedRequests.length}
          </p>
          <p className="text-[10px] text-blue-500 mt-1">
            พัสดุนอกคลัง {borrowedAssetsCount} รายการ
          </p>
        </div>

        {/* Card 3: Pending Approval */}
        <div 
          onClick={() => setActiveTab('borrows')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-orange-200 transition-colors cursor-pointer"
        >
          <p className="text-[10px] font-bold text-orange-500 uppercase tracking-wider mb-1">
            รออนุมัติ / ตรวจสอบ
          </p>
          <p className="text-2xl font-bold text-slate-800">
            {pendingCheckRequests.length + pendingApprovalRequests.length}
          </p>
          <p className="text-[10px] text-orange-500 mt-1">
            รออนุมัติ {pendingApprovalRequests.length} รายการ
          </p>
        </div>

        {/* Card 4: Overdue */}
        <div 
          onClick={() => setActiveTab('borrows')}
          className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs hover:border-red-200 transition-colors cursor-pointer"
        >
          <p className="text-[10px] font-bold text-red-500 uppercase tracking-wider mb-1">
            เกินกำหนดส่งคืน
          </p>
          <p className="text-2xl font-bold text-slate-800">
            {overdueRequests.length < 10 ? `0${overdueRequests.length}` : overdueRequests.length}
          </p>
          <p className="text-[10px] text-red-500 mt-1 font-semibold">
            {overdueRequests.length > 0 ? `แจ้งเตือนติดตาม ${overdueRequests.length} รายการ` : 'ไม่มีค้างคืนเกินกำหนด'}
          </p>
        </div>

      </div>

      {/* Main 12-Column Grid: 8 Cols Table + 4 Cols Tear-off Slip Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Left 8 Columns: Recent Borrow Requests Table */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs flex flex-col overflow-hidden">
            
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-800">รายการคำขอยืมล่าสุด</h3>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  ติดตามสถานะคำขอ ตรวจสภาพ และใบนัดคืน
                </p>
              </div>
              <button 
                onClick={() => setActiveTab('borrows')}
                className="text-xs text-blue-600 font-medium hover:underline flex items-center gap-1"
              >
                ดูทั้งหมด ({borrowRequests.length})
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-white sticky top-0 border-b border-slate-100 text-[11px] text-slate-400 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-4 py-3">เลขที่ใบยืม / คิว</th>
                    <th className="px-4 py-3">ผู้ยืม</th>
                    <th className="px-4 py-3">รายการพัสดุ</th>
                    <th className="px-4 py-3 text-center">กำหนดคืน</th>
                    <th className="px-4 py-3 text-right">สถานะ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-xs">
                  {borrowRequests.slice(0, 6).map((req) => {
                    const isOverdue = isBorrowOverdue(req.dueDate, req.status);
                    
                    return (
                      <tr 
                        key={req.id} 
                        onClick={() => {
                          setSelectedRequestId(req.id);
                          setActiveTab('borrows');
                        }}
                        className="hover:bg-slate-50 transition-colors cursor-pointer"
                      >
                        {/* Request No & Queue */}
                        <td className="px-4 py-3.5">
                          <div className="font-bold text-slate-800 font-mono text-xs">{req.requestNumber}</div>
                          <div className="text-[10px] text-blue-600 font-bold font-mono">คิว {req.queueNumber}</div>
                        </td>

                        {/* Borrower */}
                        <td className="px-4 py-3.5">
                          <div className="font-medium text-slate-900">{req.borrowerName}</div>
                          <div className="text-[10px] text-slate-400">
                            {req.borrowerType === 'citizen' ? `ประชาชน (${req.borrowerDepartmentOrMoo})` : req.borrowerDepartmentOrMoo}
                          </div>
                        </td>

                        {/* Items */}
                        <td className="px-4 py-3.5 max-w-[200px]">
                          <div className="text-slate-800 truncate font-medium">
                            {req.items?.map((i) => `${i.assetName} (${i.requestedQty} ${i.unit})`).join(', ')}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {req.purpose}
                          </div>
                        </td>

                        {/* Due date */}
                        <td className="px-4 py-3.5 text-center">
                          <div className={`font-bold ${isOverdue ? 'text-red-500' : 'text-slate-800'}`}>
                            {formatThaiDate(req.dueDate, 'short')}
                          </div>
                          <div className={`text-[10px] ${isOverdue ? 'text-red-400 font-bold' : 'text-slate-400'}`}>
                            {isOverdue ? 'เกินกำหนด' : req.dueTime}
                          </div>
                        </td>

                        {/* Status badge */}
                        <td className="px-4 py-3.5 text-right">
                          {req.status === 'issued' && !isOverdue && (
                            <span className="px-2.5 py-1 bg-purple-100 text-purple-700 text-[10px] font-bold rounded-full">
                              กำลังยืม
                            </span>
                          )}
                          {req.status === 'approved' && (
                            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 text-[10px] font-bold rounded-full">
                              อนุมัติแล้ว
                            </span>
                          )}
                          {req.status === 'pending_approval' && (
                            <span className="px-2.5 py-1 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                              รออนุมัติ
                            </span>
                          )}
                          {req.status === 'pending_check' && (
                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] font-bold rounded-full">
                              รอตรวจสต็อก
                            </span>
                          )}
                          {req.status === 'returned' && (
                            <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                              คืนเรียบร้อย
                            </span>
                          )}
                          {isOverdue && (
                            <span className="px-2.5 py-1 bg-red-100 text-red-700 text-[10px] font-bold rounded-full">
                              ค้างคืน
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right 4 Columns: Tear-off Slip Preview Card (Clean Minimalism Aesthetic) */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="bg-white rounded-xl border-2 border-dashed border-slate-300 p-6 shadow-lg relative flex flex-col">
            
            {/* Pill Badge on Top Edge */}
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-3.5 py-1 rounded-full uppercase tracking-widest shadow-xs">
              Tear-off Slip Preview
            </div>

            {/* Inner Ticket Container */}
            <div className="border border-slate-200 p-4 rounded-lg bg-[#fffdfa] flex flex-col space-y-3">
              
              {/* Slip Header */}
              <div className="text-center">
                <p className="text-xs font-bold text-slate-900">{orgSettings.orgName}</p>
                <p className="text-[10px] text-slate-500">ใบรับหลักฐานการยืม / ใบนัดคืนทรัพย์สิน</p>
              </div>

              {/* Queue & Request No */}
              <div className="flex justify-between items-start">
                <div className="bg-slate-900 text-white p-2 rounded-lg text-center min-w-[75px]">
                  <p className="text-[8px] uppercase opacity-70 font-semibold">เลขคิว</p>
                  <p className="text-base font-black font-mono">{previewRequest?.queueNumber || 'A-0069'}</p>
                </div>
                <div className="text-right">
                  <p className="text-[8px] uppercase text-slate-400 font-semibold">เลขที่ใบยืม</p>
                  <p className="text-xs font-bold font-mono text-slate-800">{previewRequest?.requestNumber || 'BOR-2569-000069'}</p>
                </div>
              </div>

              {/* Borrower & Item fields */}
              <div className="space-y-2 text-xs">
                <div className="border-b border-slate-100 pb-1">
                  <p className="text-[8px] uppercase text-slate-400 font-semibold">ผู้ยืม</p>
                  <p className="text-xs font-medium text-slate-900">{previewRequest?.borrowerName || 'นางสมศรี สุขเกษม'}</p>
                </div>
                <div className="border-b border-slate-100 pb-1">
                  <p className="text-[8px] uppercase text-slate-400 font-semibold">รายการ</p>
                  <p className="text-xs font-medium text-slate-900 truncate">
                    {previewRequest?.items?.map((i) => `${i.assetName} (${i.requestedQty} ${i.unit})`).join(', ') || 'เต็นท์ขาว 4x8 เมตร (2 หลัง)'}
                  </p>
                </div>
              </div>

              {/* Highlight Return Due Date Box */}
              <div className="bg-red-50 border border-red-100 rounded-lg p-3 text-center">
                <p className="text-[9px] uppercase font-bold text-red-500 tracking-wider">กำหนดคืน (เด่นชัด)</p>
                <p className="text-xl font-black text-red-700 leading-none my-1">
                  {previewRequest ? formatThaiDate(previewRequest.dueDate) : '20 ส.ค. 2569'}
                </p>
                <p className="text-[10px] font-bold text-red-600">
                  ภายในเวลา {previewRequest?.dueTime || '16.30 น.'}
                </p>
              </div>

              {/* QR Code section */}
              <div className="flex flex-col items-center justify-center pt-1">
                <div className="w-24 h-24 bg-white border border-slate-200 p-2 rounded-lg shadow-xs mb-1.5 flex items-center justify-center">
                  <QRCodeSVG
                    value={JSON.stringify({
                      queue: previewRequest?.queueNumber,
                      doc: previewRequest?.requestNumber,
                      due: previewRequest?.dueDate,
                    })}
                    size={80}
                  />
                </div>
                <p className="text-[9px] text-slate-400 text-center px-2">
                  สแกน QR Code เพื่อตรวจสอบสถานะคิวและความเสียหาย
                </p>
              </div>

              {/* Perforated tear line marker */}
              <div className="pt-2 border-t border-dashed border-slate-300 flex items-center justify-center text-slate-400 text-[9px] uppercase tracking-widest font-bold gap-2">
                <Scissors className="w-3.5 h-3.5 transform -rotate-90" />
                <span>Tear along this line</span>
                <Scissors className="w-3.5 h-3.5 transform rotate-90" />
              </div>
            </div>

            {/* Print Button */}
            {previewRequest && (
              <button
                type="button"
                onClick={() => onOpenDocumentView(previewRequest)}
                className="mt-4 w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold py-2.5 rounded-lg shadow-sm flex items-center justify-center gap-2 transition-all transform active:scale-98"
              >
                <Printer className="w-4 h-4" />
                <span>พิมพ์ใบยืมและส่วนฉีก</span>
              </button>
            )}

          </div>
        </div>

      </div>

    </div>
  );
};
