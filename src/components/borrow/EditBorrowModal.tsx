import React, { useState } from 'react';
import {
  X,
  Save,
  Pencil,
  Plus,
  Trash2,
  Calendar,
  Clock,
  MapPin,
  FileText,
  User,
  Phone,
  CreditCard,
  Building,
  Package,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BorrowRequest, BorrowRequestStatus, BorrowRequestedItem } from '../../types';

interface EditBorrowModalProps {
  request: BorrowRequest;
  onClose: () => void;
  onSuccess?: () => void;
}

export const EditBorrowModal: React.FC<EditBorrowModalProps> = ({
  request,
  onClose,
  onSuccess,
}) => {
  const { assets, updateBorrowRequest } = useApp();

  // Basic Information
  const [borrowerName, setBorrowerName] = useState(request.borrowerName);
  const [borrowerType, setBorrowerType] = useState(request.borrowerType);
  const [borrowerPhone, setBorrowerPhone] = useState(request.borrowerPhone);
  const [borrowerIdCardOrEmpCode, setBorrowerIdCardOrEmpCode] = useState(request.borrowerIdCardOrEmpCode);
  const [borrowerDepartmentOrMoo, setBorrowerDepartmentOrMoo] = useState(request.borrowerDepartmentOrMoo);

  // Purpose & Logistics
  const [purpose, setPurpose] = useState(request.purpose);
  const [venueOfUse, setVenueOfUse] = useState(request.venueOfUse || '');
  const [urgency, setUrgency] = useState(request.urgency || 'normal');
  const [pickupDate, setPickupDate] = useState(request.pickupDate);
  const [pickupTime, setPickupTime] = useState(request.pickupTime || '09:00');
  const [dueDate, setDueDate] = useState(request.dueDate);
  const [dueTime, setDueTime] = useState(request.dueTime || '16:30');

  // Status & Deposit
  const [status, setStatus] = useState<BorrowRequestStatus>(request.status);
  const [depositAmount, setDepositAmount] = useState(request.depositAmount || 0);
  const [depositStatus, setDepositStatus] = useState(request.depositStatus || 'none');

  // Borrowed Items
  const [items, setItems] = useState<BorrowRequestedItem[]>(request.items || []);
  const [selectedAssetIdToAdd, setSelectedAssetIdToAdd] = useState('');
  const [addQty, setAddQty] = useState(1);

  const handleUpdateItemQty = (assetId: string, delta: number) => {
    setItems((prev) =>
      prev
        .map((item) => {
          if (item.assetId === assetId) {
            const assetInfo = assets.find((a) => a.id === assetId);
            const max = assetInfo ? assetInfo.quantityTotal : 999;
            const newQty = Math.max(1, Math.min(item.requestedQty + delta, max));
            return { ...item, requestedQty: newQty };
          }
          return item;
        })
    );
  };

  const handleRemoveItem = (assetId: string) => {
    setItems((prev) => prev.filter((item) => item.assetId !== assetId));
  };

  const handleAddItem = () => {
    if (!selectedAssetIdToAdd) return;
    const targetAsset = assets.find((a) => a.id === selectedAssetIdToAdd);
    if (!targetAsset) return;

    // Check if already in list
    const existingIndex = items.findIndex((i) => i.assetId === targetAsset.id);
    if (existingIndex >= 0) {
      setItems((prev) =>
        prev.map((i, idx) =>
          idx === existingIndex
            ? { ...i, requestedQty: i.requestedQty + addQty }
            : i
        )
      );
    } else {
      const newItem: BorrowRequestedItem = {
        assetId: targetAsset.id,
        assetCode: targetAsset.code,
        assetName: targetAsset.name,
        category: targetAsset.category,
        requestedQty: addQty,
        unit: targetAsset.unit,
        conditionBefore: targetAsset.condition || 'สมบูรณ์พร้อมใช้',
      };
      setItems((prev) => [...prev, newItem]);
    }

    setSelectedAssetIdToAdd('');
    setAddQty(1);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!borrowerName.trim()) {
      alert('กรุณาระบุชื่อผู้ยืม');
      return;
    }

    if (items.length === 0) {
      alert('ต้องมีรายการพัสดุที่ยืมอย่างน้อย 1 รายการ');
      return;
    }

    updateBorrowRequest(request.id, {
      borrowerName: borrowerName.trim(),
      borrowerType,
      borrowerPhone: borrowerPhone.trim(),
      borrowerIdCardOrEmpCode: borrowerIdCardOrEmpCode.trim(),
      borrowerDepartmentOrMoo: borrowerDepartmentOrMoo.trim(),
      purpose: purpose.trim(),
      venueOfUse: venueOfUse.trim(),
      urgency,
      pickupDate,
      pickupTime,
      dueDate,
      dueTime,
      status,
      depositAmount: Number(depositAmount),
      depositStatus: depositAmount > 0 ? depositStatus : 'none',
      requiresDeposit: Number(depositAmount) > 0,
      items,
    });

    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white max-w-3xl w-full rounded-3xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold shadow-md">
              <Pencil className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <h2 className="text-base font-bold">แก้ไขข้อมูลคำขอยืมพัสดุ ครุภัณฑ์</h2>
              <p className="text-xs text-blue-200 font-mono">
                เลขที่: {request.requestNumber} | คิว: {request.queueNumber}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 text-xs max-h-[80vh] overflow-y-auto">
          
          {/* SECTION 1: ข้อมูลผู้ยืม */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-blue-900 font-bold">
              <User className="w-4 h-4" />
              <span>ข้อมูลผู้ขอยืมพัสดุ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อ-สกุล ผู้ยืม <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={borrowerName}
                  onChange={(e) => setBorrowerName(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ประเภทผู้ยืม</label>
                <select
                  value={borrowerType}
                  onChange={(e) => setBorrowerType(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white"
                >
                  <option value="citizen">ประชาชนทั่วไปในตำบล</option>
                  <option value="employee">เจ้าหน้าที่ / กองงาน อบต.</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เบอร์โทรศัพท์ติดต่อ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={borrowerPhone}
                    onChange={(e) => setBorrowerPhone(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขบัตร ปชช. / รหัสพนักงาน
                </label>
                <div className="relative">
                  <CreditCard className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={borrowerIdCardOrEmpCode}
                    onChange={(e) => setBorrowerIdCardOrEmpCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  หมู่บ้าน / สังกัด / กอง
                </label>
                <div className="relative">
                  <Building className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={borrowerDepartmentOrMoo}
                    onChange={(e) => setBorrowerDepartmentOrMoo(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* SECTION 2: วัตถุประสงค์และกำหนดเวลา */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-blue-900 font-bold">
              <Calendar className="w-4 h-4" />
              <span>วัตถุประสงค์ วันที่ยืม และกำหนดคืน</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  วัตถุประสงค์การยืม <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="เช่น จัดงานบุญประเพณีสงกรานต์"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  สถานที่นำไปใช้งาน
                </label>
                <div className="relative">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={venueOfUse}
                    onChange={(e) => setVenueOfUse(e.target.value)}
                    placeholder="เช่น ศาลาประชาคมหมู่ที่ 4"
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-900 focus:bg-white"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">วันที่รับของ</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เวลารับของ</label>
                <input
                  type="time"
                  value={pickupTime}
                  onChange={(e) => setPickupTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  วันที่กำหนดคืน <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เวลากำหนดคืน</label>
                <input
                  type="time"
                  value={dueTime}
                  onChange={(e) => setDueTime(e.target.value)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono text-slate-900 focus:bg-white"
                />
              </div>
            </div>
          </div>

          {/* SECTION 3: สถานะและเงินมัดจำ */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center gap-2 pb-1 border-b border-slate-200 text-blue-900 font-bold">
              <CheckCircle2 className="w-4 h-4" />
              <span>สถานะคำขอ และเงินประกัน/มัดจำ</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">สถานะคำขอยืม</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value as BorrowRequestStatus)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-bold text-slate-800 focus:bg-white"
                >
                  <option value="pending_check">🟡 รอตรวจสอบ (Pending Check)</option>
                  <option value="pending_approval">🔵 รออนุมัติ (Pending Approval)</option>
                  <option value="approved">🟢 อนุมัติแล้ว รอส่งมอบ (Approved)</option>
                  <option value="issued">🟣 กำลังยืม / จ่ายของแล้ว (Issued)</option>
                  <option value="pending_return">🟤 รอตรวจรับคืน (Pending Return)</option>
                  <option value="returned">✅ คืนเรียบร้อยแล้ว (Returned)</option>
                  <option value="damaged">⚠️ คืนแล้วพบชำรุด (Damaged)</option>
                  <option value="lost">🚨 คืนแล้วสูญหาย (Lost)</option>
                  <option value="rejected">🔴 ไม่อนุมัติ / ยกเลิก (Rejected)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เงินมัดจำ (บาท)</label>
                <input
                  type="number"
                  min="0"
                  value={depositAmount}
                  onChange={(e) => setDepositAmount(parseFloat(e.target.value) || 0)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold text-slate-900 focus:bg-white"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สถานะเงินมัดจำ</label>
                <select
                  value={depositStatus}
                  onChange={(e) => setDepositStatus(e.target.value as any)}
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-xl text-slate-800 focus:bg-white"
                >
                  <option value="none">ไม่มีเงินมัดจำ</option>
                  <option value="held">ถือเงินมัดจำไว้</option>
                  <option value="refunded">คืนเงินมัดจำแล้ว</option>
                  <option value="confiscated">ยึดเงินมัดจำชดใช้</option>
                </select>
              </div>
            </div>
          </div>

          {/* SECTION 4: รายการพัสดุที่ยืม */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between pb-1 border-b border-slate-200">
              <div className="flex items-center gap-2 text-blue-900 font-bold">
                <Package className="w-4 h-4" />
                <span>รายการพัสดุและครุภัณฑ์ที่ยืม ({items.length} รายการ)</span>
              </div>
            </div>

            {/* Existing Items Table */}
            <div className="bg-slate-50 rounded-2xl border border-slate-200 overflow-hidden">
              <table className="w-full text-left">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2.5">รหัส / ชื่อพัสดุ</th>
                    <th className="p-2.5 text-center">หมวดหมู่</th>
                    <th className="p-2.5 text-center w-36">จำนวนที่ยืม</th>
                    <th className="p-2.5 text-center w-12">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-4 text-center text-slate-400">
                        ยังไม่มีรายการพัสดุในคำขอนี้
                      </td>
                    </tr>
                  ) : (
                    items.map((item) => (
                      <tr key={item.assetId} className="hover:bg-white transition-colors">
                        <td className="p-2.5">
                          <div className="font-bold text-slate-900">{item.assetName}</div>
                          <div className="font-mono text-[10px] text-blue-700">{item.assetCode}</div>
                        </td>
                        <td className="p-2.5 text-center text-slate-600">
                          {item.category}
                        </td>
                        <td className="p-2.5 text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.assetId, -1)}
                              className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center justify-center cursor-pointer"
                            >
                              -
                            </button>
                            <span className="w-12 font-mono font-bold text-center text-blue-950">
                              {item.requestedQty} {item.unit}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleUpdateItemQty(item.assetId, 1)}
                              className="w-6 h-6 rounded-lg bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold flex items-center justify-center cursor-pointer"
                            >
                              +
                            </button>
                          </div>
                        </td>
                        <td className="p-2.5 text-center">
                          <button
                            type="button"
                            onClick={() => handleRemoveItem(item.assetId)}
                            className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="ลบรายการนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Add Asset to Request Form */}
            <div className="p-3 bg-blue-50/70 rounded-2xl border border-blue-100 flex flex-wrap items-center gap-2">
              <div className="flex-1 min-w-[200px]">
                <select
                  value={selectedAssetIdToAdd}
                  onChange={(e) => setSelectedAssetIdToAdd(e.target.value)}
                  className="w-full p-2 bg-white border border-blue-200 rounded-xl text-slate-800 text-xs focus:outline-hidden"
                >
                  <option value="">-- เลือกพัสดุเพื่อเพิ่มในคำขอยืมนี้ --</option>
                  {assets.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.code} - {a.name} (คงเหลือ: {a.quantityAvailable} {a.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-1.5">
                <span className="text-slate-600 font-medium">จำนวน:</span>
                <input
                  type="number"
                  min="1"
                  value={addQty}
                  onChange={(e) => setAddQty(Math.max(1, parseInt(e.target.value) || 1))}
                  className="w-16 p-2 bg-white border border-blue-200 rounded-xl font-mono text-center text-slate-900 font-bold text-xs"
                />
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                disabled={!selectedAssetIdToAdd}
                className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-slate-300 text-white font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer shadow-xs"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>เพิ่มพัสดุ</span>
              </button>
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-xl font-bold transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              <Save className="w-4 h-4 text-amber-300" />
              <span>บันทึกการแก้ไขคำขอยืม</span>
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};
