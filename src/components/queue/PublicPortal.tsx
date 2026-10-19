import React, { useState } from 'react';
import {
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  Scissors,
  Printer,
  Calendar,
  Building,
  Phone,
  QrCode,
  ShieldCheck,
  Package,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BorrowRequest } from '../../types';
import { formatThaiDate, getStatusBadgeInfo } from '../../utils/formatters';

interface PublicPortalProps {
  onOpenDocumentView: (req: BorrowRequest) => void;
  onOpenNewBorrowModal?: () => void;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  onOpenDocumentView,
  onOpenNewBorrowModal,
}) => {
  const { borrowRequests, orgSettings } = useApp();

  const [searchKey, setSearchKey] = useState('B-0069');
  const [searchedResult, setSearchedResult] = useState<BorrowRequest | null>(
    borrowRequests.find((r) => r.queueNumber === 'B-0069') || null
  );
  const [notFound, setNotFound] = useState(false);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchKey.trim()) return;

    const query = searchKey.trim().toLowerCase();
    const found = borrowRequests.find(
      (r) =>
        r.queueNumber?.toLowerCase() === query ||
        r.requestNumber?.toLowerCase() === query ||
        r.borrowerPhone?.includes(query) ||
        r.borrowerIdCardOrEmpCode?.toLowerCase().includes(query)
    );

    if (found) {
      setSearchedResult(found);
      setNotFound(false);
    } else {
      setSearchedResult(null);
      setNotFound(true);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      
      {/* Citizen Welcome Card */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 md:p-8 text-white text-center space-y-3 shadow-xl">
        <div className="w-14 h-14 bg-amber-400 text-slate-950 font-bold text-lg rounded-2xl mx-auto flex items-center justify-center shadow-lg">
          อบต.
        </div>
        <h1 className="text-xl md:text-2xl font-black text-amber-400">
          ศูนย์บริการประชาชน: ตรวจสอบสถานะการยืมพัสดุและคิว
        </h1>
        <p className="text-xs text-blue-200 max-w-lg mx-auto">
          {orgSettings.orgName} • กรอกหมายเลขคิว (เช่น B-0069) หรือเลขที่คำขอ BOR-2569 เพื่อติดตามสถานะได้ทันที
        </p>

        {/* Search input form */}
        <form onSubmit={handleSearch} className="pt-3 max-w-md mx-auto">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchKey}
                onChange={(e) => setSearchKey(e.target.value)}
                placeholder="ระบุหมายเลขคิว หรือเลขที่ใบยืม..."
                className="w-full pl-10 pr-3 py-2.5 text-xs text-slate-900 bg-white rounded-xl shadow-inner focus:outline-hidden focus:ring-2 focus:ring-amber-400 font-medium"
              />
            </div>
            <button
              type="submit"
              className="px-5 py-2.5 bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-bold rounded-xl shadow-md transition-all shrink-0 cursor-pointer"
            >
              ค้นหาสถานะ
            </button>
          </div>
        </form>

        {/* Quick Online Request button for citizens */}
        {onOpenNewBorrowModal && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onOpenNewBorrowModal}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-xl shadow-lg transition-all transform active:scale-95 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-slate-950 stroke-[3]" />
              <span>📝 ยื่นคำขอยืมพัสดุออนไลน์ใหม่ (สำหรับประชาชน & เจ้าหน้าที่)</span>
            </button>
          </div>
        )}
      </div>

      {/* Not Found state */}
      {notFound && (
        <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500 space-y-2 shadow-xs">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="font-bold text-slate-800 text-sm">ไม่พบข้อมูลคำขอยืมตามรหัสที่ระบุ</h3>
          <p className="text-xs text-slate-500">
            โปรดตรวจสอบหมายเลขคิว หรือเลขที่ใบยืมอีกครั้ง หรือติดต่อห้องพัสดุ อบต. โทร {orgSettings.phone}
          </p>
        </div>
      )}

      {/* Searched Result Card */}
      {searchedResult && (
        <div className="bg-white rounded-3xl border border-slate-200 shadow-lg overflow-hidden space-y-6 animate-fadeIn">
          
          {/* Header */}
          <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="font-mono font-black text-amber-400 text-base">
                  {searchedResult.queueNumber}
                </span>
                <span className="font-mono text-xs text-slate-300">
                  {searchedResult.requestNumber}
                </span>
              </div>
              <p className="text-xs text-slate-300">
                ผู้ยืม: {searchedResult.borrowerName} ({searchedResult.borrowerDepartmentOrMoo})
              </p>
            </div>

            <button
              type="button"
              onClick={() => onOpenDocumentView(searchedResult)}
              className="px-3.5 py-1.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 shadow-xs transition-colors"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>ดูใบฉีกนัดคืน (Print)</span>
            </button>
          </div>

          {/* Workflow Timeline */}
          <div className="px-6 space-y-3">
            <h4 className="font-bold text-xs text-slate-700 uppercase tracking-wider">
              ลำดับขั้นตอนการดำเนินการ (Status Tracker)
            </h4>

            <div className="grid grid-cols-4 gap-2 text-center text-xs">
              <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl space-y-1">
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white mx-auto flex items-center justify-center font-bold text-[11px]">
                  1
                </div>
                <div className="font-bold text-blue-950 text-[11px]">ยื่นคำขอ</div>
                <div className="text-[10px] text-slate-500">สำเร็จ</div>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${
                searchedResult.status !== 'pending_check'
                  ? 'bg-blue-50 border-blue-200 text-blue-950'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="w-6 h-6 rounded-full bg-blue-600 text-white mx-auto flex items-center justify-center font-bold text-[11px]">
                  2
                </div>
                <div className="font-bold text-[11px]">ตรวจสต็อก</div>
                <div className="text-[10px] text-slate-500">
                  {searchedResult.status === 'pending_check' ? 'กำลังตรวจ' : 'ผ่านแล้ว'}
                </div>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${
                searchedResult.status === 'approved' || searchedResult.status === 'issued' || searchedResult.status === 'returned'
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white mx-auto flex items-center justify-center font-bold text-[11px]">
                  3
                </div>
                <div className="font-bold text-[11px]">อนุมัติแล้ว</div>
                <div className="text-[10px] text-slate-500">นายก อบต.</div>
              </div>

              <div className={`p-3 rounded-xl border space-y-1 ${
                searchedResult.status === 'issued' || searchedResult.status === 'returned'
                  ? 'bg-purple-50 border-purple-200 text-purple-950'
                  : 'bg-slate-50 border-slate-200 text-slate-400'
              }`}>
                <div className="w-6 h-6 rounded-full bg-purple-600 text-white mx-auto flex items-center justify-center font-bold text-[11px]">
                  4
                </div>
                <div className="font-bold text-[11px]">ส่งมอบของ</div>
                <div className="text-[10px] text-slate-500">
                  {searchedResult.status === 'returned' ? 'คืนแล้ว' : searchedResult.status === 'issued' ? 'รับของแล้ว' : 'รอส่งมอบ'}
                </div>
              </div>
            </div>
          </div>

          {/* TEAR-OFF SLIP HIGHLIGHT */}
          <div className="px-6 pb-6 space-y-3">
            <div className="border-2 border-dashed border-amber-400 bg-amber-50/60 rounded-2xl p-5 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-amber-950 flex items-center gap-1.5">
                  <Scissors className="w-4 h-4 text-amber-700" />
                  ใบนัดคืนทรัพย์สินสำหรับผู้ยืม (Tear-off Slip)
                </span>
                <span className="font-mono font-bold text-amber-900 bg-amber-200 px-2 py-0.5 rounded">
                  {searchedResult.queueNumber}
                </span>
              </div>

              <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs space-y-1">
                <div>
                  <span className="text-slate-500">รายการพัสดุ: </span>
                  <strong className="text-slate-900">
                    {searchedResult.items.map((i) => `${i.assetName} (${i.requestedQty} ${i.unit})`).join(', ')}
                  </strong>
                </div>
                <div>
                  <span className="text-slate-500">สถานที่นำไปใช้งาน: </span>
                  <span>{searchedResult.venueOfUse}</span>
                </div>
              </div>

              {/* Bold due date notice */}
              <div className="bg-red-600 text-white rounded-xl p-3 text-center space-y-0.5 shadow-xs">
                <p className="text-[11px] uppercase tracking-wider text-red-100">
                  🔔 กำหนดส่งคืน ณ {orgSettings.returnLocationDefault}
                </p>
                <div className="text-xl md:text-2xl font-black">
                  วันที่ {formatThaiDate(searchedResult.dueDate)}
                </div>
                <div className="text-xs font-bold text-amber-300">
                  เวลาไม่เกิน {searchedResult.dueTime}
                </div>
              </div>

              {/* Print Document action */}
              <div className="pt-1 flex justify-end">
                <button
                  type="button"
                  onClick={() => onOpenDocumentView(searchedResult)}
                  className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>พิมพ์เอกสารใบยืมและใบนัดคืนฉีกส่วนท้าย (Print Official Slip)</span>
                </button>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
