import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  Plus,
  Trash2,
  AlertCircle,
  FileCheck,
  Building,
  User,
  Package,
  Calendar,
  Clock,
  ShieldCheck,
  CheckCircle2,
  FileText,
  Upload,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { BorrowerType, BorrowRequestedItem, BorrowRequest } from '../../types';

interface NewBorrowModalProps {
  isOpen?: boolean;
  onClose: () => void;
  onSuccessCreated?: (req: BorrowRequest) => void;
  initialAssetId?: string;
  initialBorrowerId?: string;
  initialBorrowerType?: BorrowerType;
}

export const NewBorrowModal: React.FC<NewBorrowModalProps> = ({
  isOpen = true,
  onClose,
  onSuccessCreated,
  initialAssetId,
  initialBorrowerId,
  initialBorrowerType = 'citizen',
}) => {
  const {
    assets,
    citizens,
    employees,
    rulesConfig,
    createBorrowRequest,
    setSelectedRequestId,
    setActiveTab,
    orgSettings,
  } = useApp();

  // Helper to format date YYYY-MM-DD
  const getTodayStr = () => new Date().toISOString().split('T')[0];
  const getFutureDateStr = (days: number) => {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().split('T')[0];
  };

  const [borrowerType, setBorrowerType] = useState<BorrowerType>(initialBorrowerType);
  const [selectedBorrowerId, setSelectedBorrowerId] = useState(initialBorrowerId || '');
  
  // Custom borrower manual fields if new
  const [manualName, setManualName] = useState('');
  const [manualPhone, setManualPhone] = useState('');
  const [manualIdCardOrCode, setManualIdCardOrCode] = useState('');
  const [manualAddressOrDept, setManualAddressOrDept] = useState('');

  const [purpose, setPurpose] = useState('');
  const [venueOfUse, setVenueOfUse] = useState('');
  const [pickupDate, setPickupDate] = useState(getTodayStr());
  const [pickupTime, setPickupTime] = useState('09:00');
  const [dueDate, setDueDate] = useState(getFutureDateStr(2));
  const [dueTime, setDueTime] = useState(orgSettings.returnTimeLimit || '16:30 น.');
  const [urgency, setUrgency] = useState<'normal' | 'urgent'>('normal');

  // Selected items list
  const [items, setItems] = useState<BorrowRequestedItem[]>(() => {
    if (initialAssetId) {
      const found = assets.find((a) => a.id === initialAssetId);
      if (found) {
        return [
          {
            assetId: found.id,
            assetCode: found.code,
            assetName: found.name,
            category: found.category,
            requestedQty: 1,
            unit: found.unit,
            conditionBefore: found.conditionNotes || 'สภาพปกติ พร้อมใช้งาน',
          },
        ];
      }
    }
    const defaultAst = assets.find((a) => a.quantityAvailable > 0) || assets[0];
    if (defaultAst) {
      return [
        {
          assetId: defaultAst.id,
          assetCode: defaultAst.code,
          assetName: defaultAst.name,
          category: defaultAst.category,
          requestedQty: Math.min(2, defaultAst.quantityAvailable || 1),
          unit: defaultAst.unit,
          conditionBefore: defaultAst.conditionNotes || 'สภาพปกติ พร้อมใช้งาน',
        },
      ];
    }
    return [];
  });

  // Temporary item picker state
  const [pickerAssetId, setPickerAssetId] = useState('');
  const [pickerQty, setPickerQty] = useState(1);

  // Mandatory agreement checkboxes (as per Section 6 of prompt)
  const [agree1, setAgree1] = useState(false);
  const [agree2, setAgree2] = useState(false);
  const [agree3, setAgree3] = useState(false);
  const [agree4, setAgree4] = useState(false);

  const [errorMessage, setErrorMessage] = useState('');

  if (isOpen === false) return null;

  // Find borrower if selected from dropdown
  const selectedCitizen = citizens.find((c) => c.id === selectedBorrowerId);
  const selectedEmployee = employees.find((e) => e.id === selectedBorrowerId);

  const isSelectedBorrowerBlacklisted =
    borrowerType === 'citizen' && selectedCitizen?.status === 'blacklisted';

  const handleAddItem = () => {
    if (!pickerAssetId) return;
    const foundAsset = assets.find((a) => a.id === pickerAssetId);
    if (!foundAsset) return;

    if (pickerQty > foundAsset.quantityAvailable) {
      setErrorMessage(`พัสดุ ${foundAsset.name} มีคงเหลือพร้อมให้ยืมเพียง ${foundAsset.quantityAvailable} ${foundAsset.unit}`);
      return;
    }

    // Check if already in items
    const existingIdx = items.findIndex((i) => i.assetId === pickerAssetId);
    if (existingIdx >= 0) {
      const updated = [...items];
      updated[existingIdx].requestedQty += pickerQty;
      setItems(updated);
    } else {
      setItems([
        ...items,
        {
          assetId: foundAsset.id,
          assetCode: foundAsset.code,
          assetName: foundAsset.name,
          category: foundAsset.category,
          requestedQty: pickerQty,
          unit: foundAsset.unit,
          conditionBefore: foundAsset.conditionNotes || 'สภาพปกติ พร้อมใช้งาน',
        },
      ]);
    }

    setPickerAssetId('');
    setPickerQty(1);
    setErrorMessage('');
  };

  const handleRemoveItem = (index: number) => {
    setItems(items.filter((_, i) => i !== index));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (items.length === 0) {
      setErrorMessage('กรุณาเลือกรายการพัสดุที่ต้องการยืมอย่างน้อย 1 รายการ');
      return;
    }

    if (isSelectedBorrowerBlacklisted) {
      setErrorMessage(
        `ไม่สามารถยื่นคำขอได้ เนื่องจากผู้ยืม (${selectedCitizen?.firstName} ${selectedCitizen?.lastName}) มีประวัติค้างส่งหรือค้างชำระค่าเสียหาย กรุณาติดต่อชำระค่าเสียหายก่อน`
      );
      return;
    }

    if (!agree1 || !agree2 || !agree3 || !agree4) {
      setErrorMessage('กรุณาอ่านและทำเครื่องหมายยอมรับเงื่อนไขและระเบียบการยืมให้ครบทั้ง 4 ข้อ');
      return;
    }

    const borrowerName =
      borrowerType === 'citizen'
        ? selectedCitizen
          ? `${selectedCitizen.prefix}${selectedCitizen.firstName} ${selectedCitizen.lastName}`
          : manualName
        : selectedEmployee
        ? `${selectedEmployee.prefix}${selectedEmployee.firstName} ${selectedEmployee.lastName}`
        : manualName;

    const borrowerPhone =
      borrowerType === 'citizen'
        ? selectedCitizen?.phone || manualPhone
        : selectedEmployee?.phone || manualPhone;

    const borrowerIdOrCode =
      borrowerType === 'citizen'
        ? selectedCitizen?.idCardNumber || manualIdCardOrCode
        : selectedEmployee?.employeeCode || manualIdCardOrCode;

    const borrowerDeptOrMoo =
      borrowerType === 'citizen'
        ? selectedCitizen?.moo || manualAddressOrDept
        : selectedEmployee?.department || manualAddressOrDept;

    if (!borrowerName || !borrowerPhone) {
      setErrorMessage('กรุณาระบุชื่อผู้ยืมและเบอร์โทรศัพท์ติดต่อ');
      return;
    }

    if (!purpose || !venueOfUse) {
      setErrorMessage('กรุณาระบุวัตถุประสงค์และสถานที่นำไปใช้งาน');
      return;
    }

    // Create the borrow request
    const createdReq = createBorrowRequest({
      borrowerType,
      borrowerId: selectedBorrowerId || `new-${Date.now()}`,
      borrowerName,
      borrowerPhone,
      borrowerIdCardOrEmpCode: borrowerIdOrCode,
      borrowerDepartmentOrMoo: borrowerDeptOrMoo,
      purpose,
      venueOfUse,
      requestDate: new Date().toISOString().split('T')[0],
      pickupDate,
      pickupTime,
      dueDate,
      dueTime,
      items,
      urgency,
      requiresDeposit: false,
      depositAmount: 0,
      attachments: [
        {
          name: 'เอกสารคำขอยืมออนไลน์.pdf',
          type: 'application/pdf',
          uploadedAt: new Date().toLocaleString('th-TH'),
        },
      ],
    });

    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });

    onClose();
    if (onSuccessCreated) {
      onSuccessCreated(createdReq);
    } else {
      setSelectedRequestId(createdReq.id);
      setActiveTab('borrows');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
              <Package className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">ยื่นคำขอยืมพัสดุ ครุภัณฑ์ ทรัพย์สิน อบต.ฝางคำ</h3>
              <p className="text-xs text-blue-200 mt-0.5">
                ออกเลขคำขอ BOR-2569 และบัตรคิวอัตโนมัติ พร้อมใบฉีกนัดคืน
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-white/10 text-slate-300 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3 bg-red-50 border-b border-red-200 text-red-800 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
          
          {/* Section 1: Borrower Type & Identity */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-700" />
                1. ข้อมูลผู้ยืม (Borrower Profile)
              </h4>

              {/* Borrower Type Tabs */}
              <div className="flex bg-slate-100 p-0.5 rounded-lg border border-slate-200 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setBorrowerType('citizen');
                    setSelectedBorrowerId('');
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    borrowerType === 'citizen' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  ประชาชนทั่วไป
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setBorrowerType('employee');
                    setSelectedBorrowerId('');
                  }}
                  className={`px-3 py-1 rounded-md font-semibold transition-all ${
                    borrowerType === 'employee' ? 'bg-white text-blue-900 shadow-xs' : 'text-slate-600'
                  }`}
                >
                  พนักงาน/เจ้าหน้าที่ อบต.
                </button>
              </div>
            </div>

            {/* Quick Pick from Registry or Manual Entry */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  เลือกจากทะเบียน{borrowerType === 'citizen' ? 'ประชาชน' : 'พนักงาน'}:
                </label>
                <select
                  value={selectedBorrowerId}
                  onChange={(e) => setSelectedBorrowerId(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">-- หรือพิมพ์ข้อมูลใหม่ด้วยตนเอง --</option>
                  {borrowerType === 'citizen'
                    ? citizens.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.prefix}
                          {c.firstName} {c.lastName} ({c.moo}) {c.status === 'blacklisted' ? '[ติดแบล็คลิสต์]' : ''}
                        </option>
                      ))
                    : employees.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.prefix}
                          {e.firstName} {e.lastName} - {e.department} ({e.position})
                        </option>
                      ))}
                </select>
              </div>

              {/* Status Note if blacklisted */}
              {isSelectedBorrowerBlacklisted && (
                <div className="md:col-span-2 p-3 bg-red-100 border border-red-300 rounded-xl text-red-900 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <div>
                    <strong>คำเตือน: ผู้ยืมรายนี้ติดสถานะระงับการยืม!</strong>
                    <p className="text-[11px] text-red-800 mt-0.5">
                      มีประวัติชำรุดเสียหายหรือค้างชำระค่าชดใช้ ({selectedCitizen?.unpaidCompensationBaht} บาท) ระบบไม่อนุญาตให้ยืมจนกว่าจะปิดเรื่อง
                    </p>
                  </div>
                </div>
              )}

              {!selectedBorrowerId && (
                <>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ชื่อ-นามสกุล *</label>
                    <input
                      type="text"
                      value={manualName}
                      onChange={(e) => setManualName(e.target.value)}
                      placeholder="เช่น นายประสิทธิ์ เจริญพร"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ *</label>
                    <input
                      type="text"
                      value={manualPhone}
                      onChange={(e) => setManualPhone(e.target.value)}
                      placeholder="08X-XXX-XXXX"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      {borrowerType === 'citizen' ? 'เลขบัตรประชาชน 13 หลัก' : 'รหัสพนักงาน/สำนักกอง'}
                    </label>
                    <input
                      type="text"
                      value={manualIdCardOrCode}
                      onChange={(e) => setManualIdCardOrCode(e.target.value)}
                      placeholder="3-3415-XXXXX-XX-X"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">ที่อยู่ / หมู่ที่ / สังกัด</label>
                    <input
                      type="text"
                      value={manualAddressOrDept}
                      onChange={(e) => setManualAddressOrDept(e.target.value)}
                      placeholder="เช่น หมู่ที่ 3 บ้านฝางคำกลาง"
                      className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    />
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Section 2: Items to borrow */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Package className="w-4 h-4 text-blue-700" />
              2. รายการพัสดุ/ครุภัณฑ์ที่ต้องการยืม
            </h4>

            {/* Item selector bar */}
            <div className="flex flex-col sm:flex-row gap-2 bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div className="flex-1">
                <select
                  value={pickerAssetId}
                  onChange={(e) => setPickerAssetId(e.target.value)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg"
                >
                  <option value="">-- เลือกพัสดุจากคลัง --</option>
                  {assets
                    .filter((a) => a.status !== 'not_borrowable' && a.quantityAvailable > 0)
                    .map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.code} - {a.name} (คงเหลือ {a.quantityAvailable} {a.unit})
                      </option>
                    ))}
                </select>
              </div>

              <div className="w-24">
                <input
                  type="number"
                  min={1}
                  value={pickerQty}
                  onChange={(e) => setPickerQty(parseInt(e.target.value) || 1)}
                  className="w-full text-xs p-2 bg-white border border-slate-300 rounded-lg text-center"
                  placeholder="จำนวน"
                />
              </div>

              <button
                type="button"
                onClick={handleAddItem}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-semibold rounded-lg flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-4 h-4" />
                เพิ่มรายการ
              </button>
            </div>

            {/* Selected Items Table */}
            <div className="border border-slate-200 rounded-xl overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200">
                  <tr>
                    <th className="p-2 text-left">รายการพัสดุ</th>
                    <th className="p-2 text-center w-20">จำนวน</th>
                    <th className="p-2 text-left">สภาพก่อนยืม</th>
                    <th className="p-2 text-center w-12">ลบ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {items.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-50">
                      <td className="p-2">
                        <div className="font-semibold text-slate-900">{item.assetName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">{item.assetCode}</div>
                      </td>
                      <td className="p-2 text-center font-bold text-blue-900">
                        {item.requestedQty} {item.unit}
                      </td>
                      <td className="p-2 text-slate-600">
                        <input
                          type="text"
                          value={item.conditionBefore}
                          onChange={(e) => {
                            const upd = [...items];
                            upd[idx].conditionBefore = e.target.value;
                            setItems(upd);
                          }}
                          className="w-full text-[11px] p-1 bg-slate-50 border border-slate-200 rounded"
                        />
                      </td>
                      <td className="p-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(idx)}
                          className="text-red-500 hover:text-red-700 p-1"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Section 3: Purpose & Schedule */}
          <div className="space-y-3 pt-3 border-t border-slate-200">
            <h4 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-blue-700" />
              3. วัตถุประสงค์และกำหนดเวลาส่งคืน (สำคัญ)
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วัตถุประสงค์ในการนำไปใช้งาน *
                </label>
                <input
                  type="text"
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="เช่น จัดงานประเพณีบุญบั้งไฟ, ประชุมประชาคมหมู่บ้าน, อบรม อบต."
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  สถานที่นำไปใช้ประโยชน์ *
                </label>
                <input
                  type="text"
                  value={venueOfUse}
                  onChange={(e) => setVenueOfUse(e.target.value)}
                  placeholder="เช่น ลานหน้าวัดฝางคำ, ศาลาประชาคมหมู่ 3"
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">วันที่ต้องการรับของ</label>
                <input
                  type="date"
                  value={pickupDate}
                  onChange={(e) => setPickupDate(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  วันที่กำหนดคืน (ภายใน 16:30 น.) *
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full text-xs p-2 bg-slate-50 border border-amber-400 rounded-lg font-bold text-red-700"
                  required
                />
              </div>
            </div>
          </div>

          {/* Section 4: MANDATORY 4-POINT TERMS CHECKLIST (Section 6 from Prompt) */}
          <div className="space-y-3 pt-3 border-t border-slate-200 bg-amber-50/60 p-4 rounded-xl border border-amber-200">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h4 className="font-bold text-xs text-amber-950 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-amber-700" />
                4. การยอมรับกฎ ระเบียบ และเงื่อนไขการยืมของ อบต.ฝางคำ (ฉบับที่ {rulesConfig.version})
              </h4>
              <button
                type="button"
                onClick={() => {
                  const nextVal = !(agree1 && agree2 && agree3 && agree4);
                  setAgree1(nextVal);
                  setAgree2(nextVal);
                  setAgree3(nextVal);
                  setAgree4(nextVal);
                }}
                className="text-xs bg-amber-200/80 hover:bg-amber-300 text-amber-950 px-2.5 py-1 rounded-lg font-bold transition-colors cursor-pointer"
              >
                {agree1 && agree2 && agree3 && agree4 ? 'ยกเลิกติ๊กทั้งหมด' : '✓ ติ๊กยินยอมทั้งหมด 4 ข้อ'}
              </button>
            </div>

            <p className="text-[11px] text-amber-900 leading-relaxed">
              ผู้ยืมต้องทำความเข้าใจและทำเครื่องหมายยินยอมรับผิดชอบต่อทรัพย์สินของทางราชการก่อนส่งคำขอ:
            </p>

            <div className="space-y-2 text-xs text-slate-800">
              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agree1}
                  onChange={(e) => setAgree1(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">1. ข้าพเจ้าได้อ่านกฎและเงื่อนไขการยืมทรัพย์สินของ อบต.ฝางคำ แล้ว</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agree2}
                  onChange={(e) => setAgree2(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">2. ข้าพเจ้ายอมรับเงื่อนไขการยืมและจะไม่นำไปให้บุคคลอื่นยืมต่อหรือใช้ผิดวัตถุประสงค์</span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agree3}
                  onChange={(e) => setAgree3(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium text-red-900">
                  3. ข้าพเจ้าจะนำสิ่งของมาคืนตามวันและเวลาที่กำหนด (ไม่เกิน 16.30 น. ของวันครบกำหนด)
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={agree4}
                  onChange={(e) => setAgree4(e.target.checked)}
                  className="mt-0.5 w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
                />
                <span className="font-medium">
                  4. ข้าพเจ้ารับผิดชอบชดใช้ค่าเสียหายหากทรัพย์สินชำรุดหรือสูญหายตามระเบียบของทางราชการ
                </span>
              </label>
            </div>
          </div>

          {/* Modal Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              ยกเลิก
            </button>
            <button
              type="submit"
              disabled={isSelectedBorrowerBlacklisted}
              className="px-5 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-all transform active:scale-95 disabled:opacity-50"
            >
              <CheckCircle2 className="w-4 h-4 text-amber-300" />
              ยืนยันคำขอยืมและออกเลขคิว
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
