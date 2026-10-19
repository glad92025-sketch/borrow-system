import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  Package,
  Plus,
  Search,
  Filter,
  QrCode,
  Printer,
  History,
  AlertTriangle,
  CheckCircle2,
  Tag,
  Boxes,
  Eye,
  X,
  ExternalLink,
  Trash2,
  AlertCircle,
  Pencil,
  Save,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { Asset, AssetStatus } from '../../types';
import { formatBaht, formatThaiDate } from '../../utils/formatters';
import { printElementById, openPrintableTab } from '../../utils/printHelper';

interface AssetRegisterProps {
  onOpenNewBorrowWithAsset?: (assetId: string) => void;
}

export const AssetRegister: React.FC<AssetRegisterProps> = ({ onOpenNewBorrowWithAsset }) => {
  const { assets, addAsset, updateAsset, deleteAsset, borrowRequests } = useApp();

  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Asset Details / QR modal
  const [selectedAssetForQR, setSelectedAssetForQR] = useState<Asset | null>(null);
  const [selectedAssetHistory, setSelectedAssetHistory] = useState<Asset | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [assetToDelete, setAssetToDelete] = useState<Asset | null>(null);
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null);

  // Edit Asset Form state
  const [editCode, setEditCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editCategory, setEditCategory] = useState('');
  const [editQtyTotal, setEditQtyTotal] = useState(1);
  const [editQtyAvailable, setEditQtyAvailable] = useState(1);
  const [editUnit, setEditUnit] = useState('ชุด');
  const [editCondition, setEditCondition] = useState('สมบูรณ์พร้อมใช้');
  const [editStatus, setEditStatus] = useState<AssetStatus>('available');
  const [editStorage, setEditStorage] = useState('');
  const [editProcurementYear, setEditProcurementYear] = useState(2569);
  const [editPrice, setEditPrice] = useState(0);
  const [editRequiresDeposit, setEditRequiresDeposit] = useState(false);
  const [editDepositAmount, setEditDepositAmount] = useState(0);
  const [editSerialNumber, setEditSerialNumber] = useState('');

  const handleStartEdit = (asset: Asset) => {
    setEditingAsset(asset);
    setEditCode(asset.code);
    setEditName(asset.name);
    setEditCategory(asset.category);
    setEditQtyTotal(asset.quantityTotal);
    setEditQtyAvailable(asset.quantityAvailable);
    setEditUnit(asset.unit);
    setEditCondition(asset.condition || asset.conditionNotes || 'สมบูรณ์พร้อมใช้');
    setEditStatus(asset.status);
    setEditStorage(asset.storageLocation || asset.location || '');
    setEditProcurementYear(asset.procurementYear || parseInt(asset.acquiredDate) || 2569);
    setEditPrice(asset.purchasePriceBaht || asset.valueBaht || 0);
    setEditRequiresDeposit(asset.requiresDeposit || false);
    setEditDepositAmount(asset.depositAmountBaht || 0);
    setEditSerialNumber(asset.serialNumber || '');
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingAsset || !editName.trim()) return;

    updateAsset(editingAsset.id, {
      code: editCode.trim(),
      name: editName.trim(),
      category: editCategory as any,
      quantityTotal: Number(editQtyTotal),
      quantityAvailable: Math.min(Number(editQtyAvailable), Number(editQtyTotal)),
      unit: editUnit.trim(),
      condition: editCondition,
      conditionNotes: editCondition,
      status: editStatus,
      location: editStorage.trim(),
      storageLocation: editStorage.trim(),
      acquiredDate: String(editProcurementYear),
      procurementYear: Number(editProcurementYear),
      valueBaht: Number(editPrice),
      purchasePriceBaht: Number(editPrice),
      requiresDeposit: editRequiresDeposit,
      depositAmountBaht: editRequiresDeposit ? Number(editDepositAmount) : 0,
      serialNumber: editSerialNumber.trim() || undefined,
    });

    setEditingAsset(null);
  };

  // New Asset Form state
  const [newCode, setNewCode] = useState(`AST-69-${String(assets.length + 1).padStart(4, '0')}`);
  const [newName, setNewName] = useState('');
  const [newCategory, setNewCategory] = useState('เต็นท์และผ้าใบ');
  const [newQty, setNewQty] = useState(1);
  const [newUnit, setNewUnit] = useState('ชุด');
  const [newStorage, setNewStorage] = useState('อาคารคลังพัสดุ 1 อบต.ฝางคำ');
  const [newProcurementYear, setNewProcurementYear] = useState(2569);
  const [newPrice, setNewPrice] = useState(10000);
  const [newRequiresDeposit, setNewRequiresDeposit] = useState(false);
  const [newDepositAmount, setNewDepositAmount] = useState(0);

  const categories = Array.from(new Set(assets.map((a) => a.category)));

  const filteredAssets = assets.filter((asset) => {
    const matchSearch =
      !searchQuery ||
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.storageLocation.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (asset.serialNumber && asset.serialNumber.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchCat = categoryFilter === 'all' || asset.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || asset.status === statusFilter;

    return matchSearch && matchCat && matchStatus;
  });

  const handleCreateAsset = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName) return;

    addAsset({
      code: newCode,
      name: newName,
      category: newCategory,
      quantityTotal: newQty,
      quantityAvailable: newQty,
      unit: newUnit,
      storageLocation: newStorage,
      status: 'available',
      procurementYear: newProcurementYear,
      purchasePriceBaht: newPrice,
      isHighValue: newPrice >= 20000,
      requiresDeposit: newRequiresDeposit,
      depositAmount: newDepositAmount,
      imageUrl: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=400&q=80',
    });

    setShowAddModal(false);
    setNewName('');
  };

  return (
    <div className="space-y-5">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Boxes className="w-5 h-5 text-blue-700" />
            ทะเบียนพัสดุ ครุภัณฑ์ และทรัพย์สิน อบต.ฝางคำ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            จัดการทะเบียน รหัสบาร์โค้ด QR Code คุมสต็อก และตรวจประวัติการยืมย้อนหลัง
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs rounded-xl shadow-sm flex items-center justify-center gap-1.5 transition-all self-start sm:self-auto transform active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>เพิ่มพัสดุ/ครุภัณฑ์ใหม่</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-wrap gap-3 items-center justify-between">
        <div className="relative flex-1 min-w-[240px]">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อทรัพย์สิน, รหัส AST-69-XXXX, สถานที่เก็บ..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">หมวดหมู่:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="all">ทุกหมวดหมู่ ({categories.length})</option>
            {categories.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500 font-medium">สถานะ:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="text-xs p-1.5 bg-slate-50 border border-slate-200 rounded-lg"
          >
            <option value="all">ทุกสถานะ</option>
            <option value="available">พร้อมให้ยืม</option>
            <option value="partially_borrowed">กำลังถูกยืมบางส่วน</option>
            <option value="maintenance">อยู่ระหว่างซ่อมแซม</option>
            <option value="damaged">ชำรุด</option>
          </select>
        </div>
      </div>

      {/* Asset Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-32">รหัสทรัพย์สิน</th>
                <th className="p-3">รายการพัสดุ / ครุภัณฑ์</th>
                <th className="p-3 w-32">หมวดหมู่</th>
                <th className="p-3 w-28 text-center">คงเหลือ / ทั้งหมด</th>
                <th className="p-3 w-40">สถานที่จัดเก็บ</th>
                <th className="p-3 w-24 text-right">มูลค่า (บาท)</th>
                <th className="p-3 w-28 text-center">สถานะ</th>
                <th className="p-3 w-28 text-center">QR & ประวัติ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredAssets.map((asset) => {
                const percentAvailable = Math.round((asset.quantityAvailable / asset.quantityTotal) * 100);

                return (
                  <tr key={asset.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Code */}
                    <td className="p-3 font-mono font-bold text-blue-950">
                      {asset.code}
                      {asset.serialNumber && (
                        <div className="text-[10px] text-slate-400 font-normal">
                          SN: {asset.serialNumber}
                        </div>
                      )}
                    </td>

                    {/* Name */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900">{asset.name}</div>
                      <div className="text-[11px] text-slate-500">
                        ปีงบประมาณ {asset.procurementYear} {asset.isHighValue && '• ครุภัณฑ์มูลค่าสูง'}
                      </div>
                    </td>

                    {/* Category */}
                    <td className="p-3 text-slate-600">
                      <span className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-[11px]">
                        {asset.category}
                      </span>
                    </td>

                    {/* Stock */}
                    <td className="p-3 text-center">
                      <div className="font-bold text-slate-900">
                        <span className={asset.quantityAvailable === 0 ? 'text-red-600' : 'text-emerald-700'}>
                          {asset.quantityAvailable}
                        </span>
                        <span className="text-slate-400 font-normal"> / {asset.quantityTotal} {asset.unit}</span>
                      </div>
                      <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1 overflow-hidden">
                        <div
                          className={`h-full ${
                            percentAvailable === 0 ? 'bg-red-500' : percentAvailable < 30 ? 'bg-amber-500' : 'bg-emerald-500'
                          }`}
                          style={{ width: `${percentAvailable}%` }}
                        />
                      </div>
                    </td>

                    {/* Storage */}
                    <td className="p-3 text-slate-600 text-[11px]">
                      {asset.storageLocation}
                    </td>

                    {/* Price */}
                    <td className="p-3 text-right font-mono text-slate-700">
                      {formatBaht(asset.purchasePriceBaht)}
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center">
                      {asset.quantityAvailable > 0 ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium text-[11px]">
                          พร้อมให้ยืม
                        </span>
                      ) : (
                        <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full font-medium text-[11px]">
                          ถูกยืมหมด
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      <div className="flex items-center justify-center gap-1.5">
                        {onOpenNewBorrowWithAsset && asset.quantityAvailable > 0 && (
                          <button
                            type="button"
                            onClick={() => onOpenNewBorrowWithAsset(asset.id)}
                            className="px-2 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 font-semibold text-[11px] rounded-lg transition-colors flex items-center gap-1"
                            title="ยื่นขอยืมพัสดุนี้ทันที"
                          >
                            <Plus className="w-3 h-3" />
                            <span>ยืม</span>
                          </button>
                        )}

                        <button
                          type="button"
                          onClick={() => setSelectedAssetForQR(asset)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="ดู QR Code ประจำทรัพย์สิน"
                        >
                          <QrCode className="w-3.5 h-3.5 text-blue-700" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedAssetHistory(asset)}
                          className="p-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition-colors cursor-pointer"
                          title="ดูประวัติการยืม-คืนย้อนหลัง"
                        >
                          <History className="w-3.5 h-3.5 text-indigo-700" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleStartEdit(asset)}
                          className="p-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 hover:text-amber-800 rounded-lg transition-colors cursor-pointer"
                          title="แก้ไขข้อมูลพัสดุ/ครุภัณฑ์นี้"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setAssetToDelete(asset)}
                          className="p-1.5 bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-700 rounded-lg transition-colors cursor-pointer"
                          title="ลบพัสดุ/ครุภัณฑ์นี้ออกจากระบบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL 1: QR CODE MODAL FOR ASSET STICKER PRINTING */}
      {selectedAssetForQR && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 space-y-4 border border-slate-200 shadow-2xl text-center">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">QR Code ประจำทรัพย์สิน</h3>
              <button
                onClick={() => setSelectedAssetForQR(null)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Sticker preview */}
            <div 
              id="printable-asset-qr-label"
              className="p-4 bg-white border-2 border-slate-800 rounded-xl shadow-inner space-y-2 print:border-none print:shadow-none"
            >
              <div className="text-[11px] font-bold text-blue-900 uppercase">
                อบต.ฝางคำ • FANG KHAM SAO
              </div>

              <div className="flex justify-center p-2 bg-white rounded-lg">
                <QRCodeSVG
                  value={JSON.stringify({
                    assetCode: selectedAssetForQR.code,
                    name: selectedAssetForQR.name,
                    category: selectedAssetForQR.category,
                    storage: selectedAssetForQR.storageLocation,
                  })}
                  size={140}
                  level="H"
                />
              </div>

              <div className="font-mono font-bold text-sm text-slate-900">
                {selectedAssetForQR.code}
              </div>
              <div className="text-xs font-semibold text-slate-800 truncate">
                {selectedAssetForQR.name}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => openPrintableTab('printable-asset-qr-label', `ป้ายQR_${selectedAssetForQR.code}`)}
                className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center justify-center gap-1 shadow-xs cursor-pointer"
                title="เปิดแท็บใหม่"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">แท็บใหม่</span>
              </button>
              <button
                type="button"
                onClick={() => printElementById('printable-asset-qr-label', `ป้ายQR_${selectedAssetForQR.code}`)}
                className="flex-1 py-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm cursor-pointer"
              >
                <Printer className="w-4 h-4" />
                พิมพ์สติ๊กเกอร์ A4
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: ASSET BORROW HISTORY */}
      {selectedAssetHistory && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">
                  ประวัติการถูกยืมย้อนหลัง (Asset Borrowing Log)
                </h3>
                <p className="text-xs text-slate-500">
                  {selectedAssetHistory.code} - {selectedAssetHistory.name}
                </p>
              </div>
              <button
                onClick={() => setSelectedAssetHistory(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto">
              {borrowRequests
                .filter((r) => r.items.some((i) => i.assetId === selectedAssetHistory.id))
                .map((req) => (
                  <div key={req.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-blue-900">{req.requestNumber}</span>
                      <span className="text-[11px] text-slate-500">{formatThaiDate(req.requestDate)}</span>
                    </div>
                    <div className="text-slate-800">
                      ผู้ยืม: <strong>{req.borrowerName}</strong> ({req.borrowerDepartmentOrMoo})
                    </div>
                    <div className="text-[11px] text-slate-500">
                      วัตถุประสงค์: {req.purpose} | สถานที่: {req.venueOfUse}
                    </div>
                    <div className="text-[11px] font-semibold text-emerald-700">
                      สถานะ: {req.status === 'returned' ? 'คืนเรียบร้อยแล้ว' : 'กำลังถูกยืม'}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: ADD NEW ASSET FORM */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900">เพิ่มรายการพัสดุ / ครุภัณฑ์ใหม่</h3>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateAsset} className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">รหัสพัสดุ (AST-69-XXXX)</label>
                  <input
                    type="text"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หมวดหมู่</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                    <option value="อื่นๆ">อื่นๆ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อพัสดุ / รายการครุภัณฑ์ *</label>
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="เช่น พัดลมไอเย็นขนาด 50 ลิตร"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">จำนวนทั้งหมด</label>
                  <input
                    type="number"
                    min={1}
                    value={newQty}
                    onChange={(e) => setNewQty(parseInt(e.target.value) || 1)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หน่วยนับ</label>
                  <input
                    type="text"
                    value={newUnit}
                    onChange={(e) => setNewUnit(e.target.value)}
                    placeholder="เช่น ตัว, หลัง, ชุด"
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สถานที่จัดเก็บ</label>
                <input
                  type="text"
                  value={newStorage}
                  onChange={(e) => setNewStorage(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ปีงบประมาณจัดซื้อ</label>
                  <input
                    type="number"
                    value={newProcurementYear}
                    onChange={(e) => setNewProcurementYear(parseInt(e.target.value) || 2569)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">มูลค่าจัดซื้อ (บาท)</label>
                  <input
                    type="number"
                    value={newPrice}
                    onChange={(e) => setNewPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-bold"
                >
                  บันทึกข้อมูลพัสดุ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: DELETE ASSET CONFIRMATION MODAL */}
      {assetToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="bg-red-50 p-4 border-b border-red-100 flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-slate-900 text-sm">ยืนยันการลบข้อมูลพัสดุ/ครุภัณฑ์</h3>
                <p className="text-xs text-slate-500">การลบข้อมูลจะไม่สามารถกู้คืนได้</p>
              </div>
            </div>

            <div className="p-5 space-y-4 text-xs">
              <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">รหัสครุภัณฑ์:</span>
                  <span className="font-mono font-bold text-blue-900">{assetToDelete.code}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">ชื่อพัสดุ:</span>
                  <span className="font-bold text-slate-800 text-right">{assetToDelete.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">หมวดหมู่:</span>
                  <span className="text-slate-700">{assetToDelete.category}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-slate-500">จำนวนทั้งหมด:</span>
                  <span className="font-bold text-slate-800">{assetToDelete.quantityTotal} {assetToDelete.unit}</span>
                </div>
              </div>

              <div className="flex items-start gap-2 p-3 bg-amber-50 text-amber-900 rounded-xl border border-amber-200">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] leading-relaxed">
                  กรุณาตรวจสอบให้แน่ใจว่าไม่มีคำขอยืมที่กำลังใช้งานพัสดุนี้อยู่ หากยืนยัน ข้อมูลพัสดุจะถูกลบออกจากทะเบียน อบต.ฝางคำ ทันที
                </p>
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAssetToDelete(null)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="button"
                  onClick={() => {
                    deleteAsset(assetToDelete.id);
                    setAssetToDelete(null);
                  }}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Trash2 className="w-4 h-4" />
                  <span>ยืนยันลบพัสดุนี้</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 5: EDIT ASSET MODAL */}
      {editingAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="bg-white max-w-xl w-full rounded-2xl shadow-2xl overflow-hidden border border-slate-200 my-8">
            <div className="bg-amber-500 text-slate-950 p-4 border-b border-amber-600 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-400 text-slate-950 flex items-center justify-center font-bold">
                  <Pencil className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm leading-tight">แก้ไขข้อมูลพัสดุ / ครุภัณฑ์</h3>
                  <p className="text-[11px] text-amber-950 font-medium">
                    รหัสเดิม: {editingAsset.code} • {editingAsset.name}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingAsset(null)}
                className="p-1 hover:bg-amber-400 rounded-lg text-slate-950 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="p-5 space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    รหัสพัสดุ / ครุภัณฑ์ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editCode}
                    onChange={(e) => setEditCode(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-blue-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    หมวดหมู่พัสดุ <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  >
                    {categories.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                    <option value="เต็นท์และผ้าใบ">เต็นท์และผ้าใบ</option>
                    <option value="โต๊ะและเก้าอี้">โต๊ะและเก้าอี้</option>
                    <option value="เครื่องเสียงและไฟฟ้า">เครื่องเสียงและไฟฟ้า</option>
                    <option value="อุปกรณ์งานพิธีและเวที">อุปกรณ์งานพิธีและเวที</option>
                    <option value="เครื่องมืองานช่างและเกษตร">เครื่องมืองานช่างและเกษตร</option>
                    <option value="อุปกรณ์คอมพิวเตอร์และสำนักงาน">อุปกรณ์คอมพิวเตอร์และสำนักงาน</option>
                    <option value="อุปกรณ์กีฬาและสันทนาการ">อุปกรณ์กีฬาและสันทนาการ</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  ชื่อพัสดุ / ครุภัณฑ์ <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="เช่น เต็นท์โค้งผ้าใบขาว 4x8 ม."
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-semibold text-slate-900 focus:bg-white focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
                  required
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    จำนวนทั้งหมดในคลัง <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={editQtyTotal}
                    onChange={(e) => {
                      const val = parseInt(e.target.value) || 1;
                      setEditQtyTotal(val);
                      if (editQtyAvailable > val) {
                        setEditQtyAvailable(val);
                      }
                    }}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-center text-slate-900"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    จำนวนพร้อมให้ยืม <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    max={editQtyTotal}
                    value={editQtyAvailable}
                    onChange={(e) => setEditQtyAvailable(Math.min(parseInt(e.target.value) || 0, editQtyTotal))}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold text-center text-emerald-700"
                    required
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    หน่วยนับ <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={editUnit}
                    onChange={(e) => setEditUnit(e.target.value)}
                    placeholder="เช่น ตัว, หลัง, ชุด"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-center"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สภาพพัสดุ</label>
                  <select
                    value={editCondition}
                    onChange={(e) => setEditCondition(e.target.value)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="สมบูรณ์พร้อมใช้">สมบูรณ์พร้อมใช้ (100%)</option>
                    <option value="ชำรุดเล็กน้อย">ชำรุดเล็กน้อย (พอใช้งานได้)</option>
                    <option value="ชำรุดรอซ่อม">ชำรุดรอซ่อม (งดยืม)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 mb-1">สถานะครุภัณฑ์</label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as AssetStatus)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg text-slate-800"
                  >
                    <option value="available">พร้อมให้ยืม (Available)</option>
                    <option value="borrowed">อยู่ระหว่างการยืม (Borrowed)</option>
                    <option value="maintenance">อยู่ระหว่างซ่อมบำรุง (Maintenance)</option>
                    <option value="damaged">ชำรุดเสียหาย (Damaged)</option>
                    <option value="lost">สูญหาย (Lost)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สถานที่จัดเก็บ / อาคารคลัง</label>
                <input
                  type="text"
                  value={editStorage}
                  onChange={(e) => setEditStorage(e.target.value)}
                  placeholder="เช่น อาคารคลังพัสดุ 1 อบต.ฝางคำ"
                  className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">ปีงบประมาณ</label>
                  <input
                    type="number"
                    value={editProcurementYear}
                    onChange={(e) => setEditProcurementYear(parseInt(e.target.value) || 2569)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">มูลค่าจัดซื้อ (บาท)</label>
                  <input
                    type="number"
                    value={editPrice}
                    onChange={(e) => setEditPrice(parseFloat(e.target.value) || 0)}
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">หมายเลขเครื่อง/Serial</label>
                  <input
                    type="text"
                    value={editSerialNumber}
                    onChange={(e) => setEditSerialNumber(e.target.value)}
                    placeholder="ถ้ามี"
                    className="w-full p-2.5 bg-slate-50 border border-slate-300 rounded-lg font-mono"
                  />
                </div>
              </div>

              {/* Deposit section */}
              <div className="p-3 bg-amber-50/70 rounded-xl border border-amber-200 space-y-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editRequiresDeposit}
                    onChange={(e) => setEditRequiresDeposit(e.target.checked)}
                    className="w-4 h-4 text-amber-600 rounded"
                  />
                  <span className="font-bold text-slate-800">กำหนดให้มีเงินประกัน/ค่ามัดจำพัสดุ</span>
                </label>

                {editRequiresDeposit && (
                  <div className="flex items-center gap-2 pt-1">
                    <span className="text-slate-600 font-medium">จำนวนเงินมัดจำ:</span>
                    <input
                      type="number"
                      value={editDepositAmount}
                      onChange={(e) => setEditDepositAmount(parseFloat(e.target.value) || 0)}
                      className="w-32 p-1.5 bg-white border border-amber-300 rounded-lg font-mono font-bold text-slate-900"
                    />
                    <span className="text-slate-600">บาท / ครั้ง</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingAsset(null)}
                  className="px-4 py-2.5 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold transition-colors cursor-pointer"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-600 active:bg-amber-700 text-slate-950 rounded-xl font-bold transition-colors flex items-center gap-1.5 shadow-sm cursor-pointer"
                >
                  <Save className="w-4 h-4" />
                  <span>บันทึกการแก้ไขพัสดุ</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
