import React, { useState } from 'react';
import {
  ClipboardList,
  Search,
  Filter,
  Plus,
  Printer,
  ChevronRight,
  Clock,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  RotateCcw,
  Calendar,
  Layers,
  Trash2,
  Pencil,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BorrowRequest, BorrowRequestStatus } from '../../types';
import { formatThaiDate, getStatusBadgeInfo, isBorrowOverdue } from '../../utils/formatters';
import { EditBorrowModal } from './EditBorrowModal';

interface BorrowListProps {
  onOpenNewBorrowModal: () => void;
  onOpenDetailModal: (req: BorrowRequest) => void;
  onOpenDocumentView: (req: BorrowRequest) => void;
  onOpenReturnFlow: (req: BorrowRequest) => void;
}

export const BorrowList: React.FC<BorrowListProps> = ({
  onOpenNewBorrowModal,
  onOpenDetailModal,
  onOpenDocumentView,
  onOpenReturnFlow,
}) => {
  const { borrowRequests, globalSearch, setGlobalSearch, deleteBorrowRequest } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [borrowerTypeFilter, setBorrowerTypeFilter] = useState<string>('all');
  const [requestToDelete, setRequestToDelete] = useState<BorrowRequest | null>(null);
  const [requestToEdit, setRequestToEdit] = useState<BorrowRequest | null>(null);

  const filterTabs = [
    { id: 'all', label: 'ทั้งหมด', count: borrowRequests.length },
    {
      id: 'pending_check',
      label: 'รอตรวจสอบสต็อก',
      count: borrowRequests.filter((r) => r.status === 'pending_check').length,
      color: 'text-amber-700 bg-amber-50',
    },
    {
      id: 'pending_approval',
      label: 'รออนุมัติ',
      count: borrowRequests.filter((r) => r.status === 'pending_approval').length,
      color: 'text-blue-700 bg-blue-50',
    },
    {
      id: 'approved',
      label: 'อนุมัติแล้ว (รอจ่าย)',
      count: borrowRequests.filter((r) => r.status === 'approved').length,
      color: 'text-emerald-700 bg-emerald-50',
    },
    {
      id: 'issued',
      label: 'กำลังยืม (นอกคลัง)',
      count: borrowRequests.filter((r) => r.status === 'issued').length,
      color: 'text-purple-700 bg-purple-50',
    },
    {
      id: 'overdue',
      label: 'เกินกำหนดส่งคืน ⚠️',
      count: borrowRequests.filter((r) => isBorrowOverdue(r.dueDate, r.status)).length,
      color: 'text-red-700 bg-red-50 font-bold',
    },
    {
      id: 'returned',
      label: 'คืนเรียบร้อย',
      count: borrowRequests.filter((r) => r.status === 'returned').length,
    },
  ];

  // Filtering
  const filteredRequests = borrowRequests.filter((req) => {
    // Search query
    const matchSearch =
      !globalSearch ||
      req.requestNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      req.queueNumber?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      req.borrowerName?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      req.borrowerPhone?.includes(globalSearch) ||
      req.purpose?.toLowerCase().includes(globalSearch.toLowerCase()) ||
      req.items?.some((i) => i.assetName?.toLowerCase().includes(globalSearch.toLowerCase()));

    // Status filter
    let matchStatus = true;
    if (statusFilter === 'overdue') {
      matchStatus = isBorrowOverdue(req.dueDate, req.status);
    } else if (statusFilter !== 'all') {
      matchStatus = req.status === statusFilter;
    }

    // Borrower Type filter
    let matchBorrowerType = true;
    if (borrowerTypeFilter !== 'all') {
      matchBorrowerType = req.borrowerType === borrowerTypeFilter;
    }

    return matchSearch && matchStatus && matchBorrowerType;
  });

  return (
    <div className="space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-blue-700" />
            ทะเบียนและคำขอยืมพัสดุ ครุภัณฑ์ อบต.ฝางคำ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ติดตามสถานะ ตรวจสอบสต็อก อนุมัติ จ่ายของ และพิมพ์ใบฉีกนัดคืน (Tear-off Return Slip)
          </p>
        </div>

        <button
          onClick={onOpenNewBorrowModal}
          className="px-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>ยื่นคำขอยืมพัสดุใหม่</span>
        </button>
      </div>

      {/* Filter Tabs Bar */}
      <div className="flex gap-2 overflow-x-auto pb-1 text-xs">
        {filterTabs.map((tab) => {
          const isActive = statusFilter === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setStatusFilter(tab.id)}
              className={`px-3 py-1.5 rounded-xl font-medium whitespace-nowrap transition-all flex items-center gap-1.5 border ${
                isActive
                  ? 'bg-blue-900 text-white border-blue-900 shadow-xs font-semibold'
                  : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-white/20 text-white' : tab.color || 'bg-slate-100 text-slate-700'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search & Secondary Filters */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={globalSearch}
            onChange={(e) => setGlobalSearch(e.target.value)}
            placeholder="ค้นหาเลขที่ใบยืม, ผู้ยืม, เบอร์โทร, รายการพัสดุ..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">ประเภทผู้ยืม:</span>
          <select
            value={borrowerTypeFilter}
            onChange={(e) => setBorrowerTypeFilter(e.target.value)}
            className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="all">ทั้งหมด (ประชาชน & จนท.)</option>
            <option value="citizen">ประชาชนทั่วไป</option>
            <option value="employee">พนักงาน/เจ้าหน้าที่ อบต.</option>
          </select>
        </div>
      </div>

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-16 text-center">คิว</th>
                <th className="p-3 w-36">เลขที่ใบยืม</th>
                <th className="p-3">ผู้ยืม / สังกัด</th>
                <th className="p-3">รายการพัสดุ</th>
                <th className="p-3 w-28">วันที่ยืม</th>
                <th className="p-3 w-32">กำหนดคืน</th>
                <th className="p-3 w-28 text-center">สถานะ</th>
                <th className="p-3 w-36 text-center">การจัดการ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400">
                    ไม่พบรายการขอยืมที่ตรงกับเงื่อนไขการค้นหา
                  </td>
                </tr>
              ) : (
                filteredRequests.map((req) => {
                  const badge = getStatusBadgeInfo(req.status);
                  const isOverdue = isBorrowOverdue(req.dueDate, req.status);

                  return (
                    <tr
                      key={req.id}
                      className="hover:bg-slate-50/80 transition-colors group cursor-pointer"
                      onClick={() => onOpenDetailModal(req)}
                    >
                      {/* Queue */}
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <span className="font-mono font-bold text-slate-900 bg-amber-100 text-amber-950 px-2 py-0.5 rounded shadow-2xs">
                          {req.queueNumber}
                        </span>
                      </td>

                      {/* Request Number */}
                      <td className="p-3 font-mono font-bold text-blue-950">
                        {req.requestNumber}
                        <div className="text-[10px] text-slate-400 font-normal">
                          {req.borrowerType === 'citizen' ? 'ประชาชน' : 'เจ้าหน้าที่'}
                        </div>
                      </td>

                      {/* Borrower */}
                      <td className="p-3">
                        <div className="font-bold text-slate-900">{req.borrowerName}</div>
                        <div className="text-[11px] text-slate-500">
                          {req.borrowerDepartmentOrMoo} | 📞 {req.borrowerPhone}
                        </div>
                      </td>

                      {/* Items summary */}
                      <td className="p-3 max-w-xs">
                        <div className="text-slate-800 font-medium truncate">
                          {req.items.map((i) => `${i.assetName} (${i.requestedQty} ${i.unit})`).join(', ')}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate">
                          วัตถุประสงค์: {req.purpose}
                        </div>
                      </td>

                      {/* Pickup date */}
                      <td className="p-3 text-slate-600">
                        {formatThaiDate(req.pickupDate, 'short')}
                      </td>

                      {/* Due date with Overdue badge */}
                      <td className="p-3">
                        <div className={isOverdue ? 'text-red-600 font-bold' : 'text-slate-800 font-medium'}>
                          {formatThaiDate(req.dueDate, 'short')}
                        </div>
                        <div className="text-[10px] text-slate-500">
                          ก่อน {req.dueTime}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="p-3 text-center">
                        <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-full border ${badge.bg} ${badge.text} ${badge.border}`}>
                          {badge.label}
                        </span>
                        {isOverdue && (
                          <div className="text-[10px] text-red-600 font-bold mt-0.5">
                            เกินกำหนด!
                          </div>
                        )}
                      </td>

                      {/* Action buttons */}
                      <td className="p-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => onOpenDocumentView(req)}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors"
                            title="พิมพ์ใบยืม & ส่วนท้ายฉีกนัดคืน"
                          >
                            <Printer className="w-4 h-4" />
                          </button>

                          {req.status === 'issued' && (
                            <button
                              type="button"
                              onClick={() => onOpenReturnFlow(req)}
                              className="px-2 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-semibold flex items-center gap-1 transition-colors"
                              title="ตรวจรับคืนพัสดุ"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>รับคืน</span>
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => setRequestToEdit(req)}
                            className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 rounded-lg transition-colors cursor-pointer"
                            title="แก้ไขข้อมูลคำขอยืมนี้"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>

                          <button
                            type="button"
                            onClick={() => onOpenDetailModal(req)}
                            className="p-1.5 text-blue-700 hover:bg-blue-50 rounded-lg transition-colors cursor-pointer"
                            title="ดูรายละเอียดและดำเนินการ"
                          >
                            <ChevronRight className="w-4 h-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() => setRequestToDelete(req)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="ลบรายการคำขอยืมนี้"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* DELETE BORROW REQUEST CONFIRMATION MODAL */}
      {requestToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">ยืนยันการลบรายการคำขอยืมพัสดุ</h3>
                <p className="text-xs text-slate-500">การลบคำขอนี้จะไม่สามารถเรียกคืนได้</p>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">เลขที่ใบยืม / คิว:</span>
                  <span className="font-mono font-bold text-blue-900">{requestToDelete.requestNumber} ({requestToDelete.queueNumber})</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ชื่อผู้ยืม:</span>
                  <span className="font-bold text-slate-800">{requestToDelete.borrowerName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">วัตถุประสงค์:</span>
                  <span className="text-slate-700 text-right truncate max-w-[200px]">{requestToDelete.purpose}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">จำนวนรายการพัสดุ:</span>
                  <span className="font-bold text-slate-800">{requestToDelete.items.length} รายการ</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  หากลบรายการนี้ ระบบจะลบประวัติคำขอและบัตรคิวออกจากระบบ กรุณาตรวจสอบให้แน่ใจก่อนดำเนินการ
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setRequestToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteBorrowRequest(requestToDelete.id);
                    setRequestToDelete(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ยืนยันลบคำขอนี้</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BORROW REQUEST MODAL */}
      {requestToEdit && (
        <EditBorrowModal
          request={requestToEdit}
          onClose={() => setRequestToEdit(null)}
        />
      )}

    </div>
  );
};
