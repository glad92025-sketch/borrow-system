import React, { useState, useRef } from 'react';
import {
  Settings,
  ShieldCheck,
  Save,
  CheckCircle2,
  Building,
  Clock,
  RotateCcw,
  Sliders,
  DollarSign,
  AlertCircle,
  FileCheck,
  Image,
  Upload,
  Trash2,
  Sparkles,
  Eye,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrgLogo } from '../common/OrgLogo';

export const SettingsCenter: React.FC = () => {
  const { orgSettings, setOrgSettings, rulesConfig, updateRules, updateOrgSettings } = useApp();

  // Local state for org settings
  const [orgName, setOrgName] = useState(orgSettings.orgName);
  const [logoUrl, setLogoUrl] = useState(orgSettings.logoUrl || '');
  const [amphoe, setAmphoe] = useState(orgSettings.amphoe || 'อำเภอสิรินธร');
  const [province, setProvince] = useState(orgSettings.province || 'จังหวัดอุบลราชธานี');
  const [postalCode, setPostalCode] = useState(orgSettings.postalCode || '34350');
  const [phone, setPhone] = useState(orgSettings.phone || '045-252586');
  const [email, setEmail] = useState(orgSettings.email || 'info@fangkham.go.th');
  const [mayorName, setMayorName] = useState(orgSettings.mayorName || 'นายจำรูญ พิทักษ์');
  const [mayorPosition, setMayorPosition] = useState(orgSettings.mayorPosition || 'นายกองค์การบริหารส่วนตำบลฝางคำ');
  const [paladName, setPaladName] = useState(orgSettings.paladName || 'นายชาญชัย อักโข');
  const [paladPosition, setPaladPosition] = useState(orgSettings.paladPosition || 'ปลัดองค์การบริหารส่วนตำบลฝางคำ');
  const [headOfSupplyName, setHeadOfSupplyName] = useState(orgSettings.headOfSupplyName || 'นางวาสนา สินทรัพย์');
  const [headOfSupplyPosition, setHeadOfSupplyPosition] = useState(orgSettings.headOfSupplyPosition || 'ผู้อำนวยการกองคลัง');
  const [supplyOfficerName, setSupplyOfficerName] = useState(orgSettings.supplyOfficerName || 'จ.ส.อ.เกียรติพล หาทรัพย์');
  const [supplyOfficerPosition, setSupplyOfficerPosition] = useState(orgSettings.supplyOfficerPosition || 'เจ้าพนักงานธุรการชำนาญงาน');
  const [returnLocation, setReturnLocation] = useState(orgSettings.returnLocationDefault || 'องค์การบริหารส่วนตำบลฝางคำ');
  const [returnTimeLimit, setReturnTimeLimit] = useState(orgSettings.returnTimeLimit || 'เวลาราชการ');

  // Local state for rules
  const [rulesList, setRulesList] = useState(rulesConfig.rules || []);

  const [savedSuccess, setSavedSuccess] = useState(false);
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Preset Logos
  const presetLogos = [
    {
      name: 'ตรา อบต. ท้องถิ่นไทย (สีทอง-น้ำเงิน)',
      url: 'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'ตราครุฑราชการทอง',
      url: 'https://images.unsplash.com/photo-1569982175971-d92b01cf8694?w=200&auto=format&fit=crop&q=80',
    },
    {
      name: 'ตราดอกบัวสวรรค์ / เมืองอุบล',
      url: 'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=200&auto=format&fit=crop&q=80',
    },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setLogoUploadError('กรุณาเลือกไฟล์รูปภาพ (PNG, JPG, SVG, WebP)');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setLogoUploadError('ขนาดไฟล์รูปภาพต้องไม่เกิน 5 MB');
      return;
    }

    setLogoUploadError(null);
    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setLogoUrl(dataUrl);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveAll = (e: React.FormEvent) => {
    e.preventDefault();

    const updated = {
      ...orgSettings,
      orgName,
      logoUrl: logoUrl.trim() || undefined,
      amphoe,
      province,
      postalCode,
      phone,
      email,
      mayorName,
      mayorPosition,
      paladName,
      paladPosition,
      headOfSupplyName,
      headOfSupplyPosition,
      supplyOfficerName,
      supplyOfficerPosition,
      returnLocationDefault: returnLocation,
      returnTimeLimit,
    };

    updateOrgSettings(updated);
    updateRules(rulesList);

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Settings className="w-5 h-5 text-blue-700" />
            ตั้งค่าระบบ ข้อมูลองค์กร และโลโก้ อบต.
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            กำหนดตราสัญลักษณ์ อบต., ข้อมูลหน่วยงาน, เจ้าหน้าที่ผู้ลงนาม และระเบียบการยืม
          </p>
        </div>

        {savedSuccess && (
          <div className="px-3 py-1.5 bg-emerald-50 border border-emerald-300 text-emerald-800 rounded-xl text-xs font-bold flex items-center gap-1.5 animate-fadeIn">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>บันทึกการตั้งค่าเรียบร้อยแล้ว</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSaveAll} className="space-y-6">

        {/* SECTION 0: SAO LOGO / EMBLEM MANAGEMENT */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 sm:p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Image className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wider">
                  1. ตราสัญลักษณ์ / โลโก้ อบต. (SAO Emblem & Logo)
                </h3>
                <p className="text-[11px] text-slate-500">
                  โลโก้นี้จะแสดงบนแถบเมนู (Sidebar/Header), แบบฟอร์มใบยืม-ใบรับคืน A4, ใบนัดคืนฉีกส่วนท้าย และรายงาน
                </p>
              </div>
            </div>
            {logoUrl && (
              <button
                type="button"
                onClick={handleRemoveLogo}
                className="px-2.5 py-1 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 border border-red-200 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>ลบโลโก้</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            
            {/* Left: Upload & URL Form (7 cols) */}
            <div className="lg:col-span-7 space-y-4">
              
              {/* File upload drag-and-drop zone */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  อัปโหลดไฟล์รูปภาพโลโก้ (Upload Image File)
                </label>
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-blue-300 hover:border-blue-500 bg-blue-50/50 hover:bg-blue-50 rounded-2xl p-4 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="w-10 h-10 rounded-full bg-blue-100 group-hover:bg-blue-200 text-blue-700 flex items-center justify-center transition-colors">
                    <Upload className="w-5 h-5" />
                  </div>
                  <div className="space-y-0.5">
                    <p className="text-xs font-bold text-blue-900">
                      คลิกเพื่อเลือกไฟล์ หรือ ลากไฟล์รูปภาพมาวางที่นี่
                    </p>
                    <p className="text-[11px] text-slate-500">
                      รองรับไฟล์ PNG, JPG, SVG, WebP (แนะนำไฟล์พื้นหลังโปร่งใส Transparent PNG)
                    </p>
                  </div>
                </div>
                {logoUploadError && (
                  <p className="text-xs text-red-600 font-semibold">{logoUploadError}</p>
                )}
              </div>

              {/* Direct URL input */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  หรือ ระบุ URL ของรูปภาพโลโก้ (Image URL)
                </label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={logoUrl}
                    onChange={(e) => setLogoUrl(e.target.value)}
                    placeholder="https://example.com/logo-อบต.png"
                    className="flex-1 p-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  {logoUrl && (
                    <button
                      type="button"
                      onClick={() => setLogoUrl('')}
                      className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-medium"
                    >
                      ล้างค่า
                    </button>
                  )}
                </div>
              </div>

              {/* Preset Quick Selectors */}
              <div className="space-y-1.5 pt-1">
                <label className="block text-xs font-bold text-slate-700 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>หรือ เลือกตราตัวอย่างมาตรฐานราชการ:</span>
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {presetLogos.map((preset, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setLogoUrl(preset.url)}
                      className={`p-2 rounded-xl border text-left flex items-center gap-2 transition-all cursor-pointer ${
                        logoUrl === preset.url
                          ? 'border-blue-600 bg-blue-50/80 ring-2 ring-blue-500/20'
                          : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                      }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-7 h-7 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <span className="text-[11px] font-medium text-slate-800 leading-tight">
                        {preset.name}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

            </div>

            {/* Right: Live Preview Box (5 cols) */}
            <div className="lg:col-span-5 bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-700" />
                  ตัวอย่างการแสดงผลโลโก้จริง (Live Preview)
                </span>
                <span className="text-[10px] text-slate-500">
                  {logoUrl ? 'ใช้งานโลโก้กำหนดเอง' : 'ใช้งานตรามาตรฐานระบบ'}
                </span>
              </div>

              {/* Big Logo Display Box */}
              <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-col items-center justify-center gap-2 text-center">
                <div className="w-20 h-20 rounded-full border-2 border-slate-200 p-1 flex items-center justify-center overflow-hidden bg-slate-50/50 shadow-inner">
                  {logoUrl ? (
                    <img
                      src={logoUrl}
                      alt="ตัวอย่างโลโก้"
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        const target = e.target as HTMLElement;
                        target.style.display = 'none';
                      }}
                    />
                  ) : (
                    <div className="w-full h-full bg-blue-600 rounded-full text-white font-black text-xl flex items-center justify-center">
                      อบต.
                    </div>
                  )}
                </div>
                <div>
                  <h4 className="font-bold text-xs text-slate-900">{orgName}</h4>
                  <p className="text-[10px] text-slate-500">{amphoe} {province}</p>
                </div>
              </div>

              {/* Comparison in App Components */}
              <div className="space-y-1.5 text-xs">
                <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                  การแสดงผลในส่วนต่างๆ ของระบบ:
                </p>
                
                {/* Header preview row */}
                <div className="bg-white p-2 rounded-lg border border-slate-200 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center overflow-hidden shrink-0 border border-slate-200">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                    ) : (
                      <span className="text-[9px] font-bold text-blue-700">อบต.</span>
                    )}
                  </div>
                  <div className="text-[11px] truncate">
                    <span className="font-bold text-slate-800">หัวกระดาษแบบฟอร์ม A4 </span>
                    <span className="text-slate-500">(ใบยืม/ใบรับคืน)</span>
                  </div>
                </div>

                {/* Sidebar preview row */}
                <div className="bg-slate-900 text-white p-2 rounded-lg flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600 flex items-center justify-center overflow-hidden shrink-0">
                    {logoUrl ? (
                      <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-0.5" />
                    ) : (
                      <span className="text-[9px] font-bold text-white">อบต.</span>
                    )}
                  </div>
                  <div className="text-[11px] truncate text-slate-200">
                    แถบเมนูหลัก (Sidebar Brand)
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
        
        {/* Section 2: Org Information & Signatory Positions */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center">
                <Building className="w-4 h-4" />
              </div>
              <div>
                <h3 className="font-bold text-xs sm:text-sm text-slate-800 uppercase tracking-wider">
                  2. ข้อมูลหน่วยงานและผู้มีอำนาจลงนาม (พร้อมกำหนดตำแหน่งได้เองทุกจุด)
                </h3>
                <p className="text-[11px] text-slate-500">
                  สามารถพิมพ์แก้ไขชื่อ-สกุล และระบุตำแหน่งของผู้อนุมัติ/เจ้าหน้าที่แต่ละจุดได้ตามโครงสร้างจริงของ อบต.
                </p>
              </div>
            </div>
          </div>

          {/* Sub-section 2.1: General Org Info */}
          <div className="space-y-3">
            <h4 className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
              <span>ข้อมูลพื้นฐานของหน่วยงาน (Organization Profile)</span>
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">ชื่อองค์กรปกครองส่วนท้องถิ่น</label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  placeholder="เช่น องค์การบริหารส่วนตำบลฝางคำ"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-semibold focus:bg-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">เบอร์โทรศัพท์ติดต่อ อบต.</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="เช่น 045-899123, 081-9988776"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">อีเมลทางการ (Official Email)</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="fangkam2021@gmail.com"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">อำเภอ และ จังหวัด</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={amphoe}
                    onChange={(e) => setAmphoe(e.target.value)}
                    placeholder="อำเภอสิรินธร"
                    className="w-1/2 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                  <input
                    type="text"
                    value={province}
                    onChange={(e) => setProvince(e.target.value)}
                    placeholder="จังหวัดอุบลราชธานี"
                    className="w-1/2 p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">รหัสไปรษณีย์</label>
                <input
                  type="text"
                  value={postalCode}
                  onChange={(e) => setPostalCode(e.target.value)}
                  placeholder="34350"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-mono focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">สถานที่ส่งคืนพัสดุเริ่มต้น</label>
                <input
                  type="text"
                  value={returnLocation}
                  onChange={(e) => setReturnLocation(e.target.value)}
                  placeholder="เช่น อาคารงานพัสดุและคลังกลาง อบต.ฝางคำ"
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Sub-section 2.2: Signatories & Editable Positions (Every Signatory point) */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-bold text-xs text-blue-950 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>ผู้มีอำนาจลงนามและตำแหน่งในเอกสารราชการ (Signatories & Positions)</span>
                </h4>
                <p className="text-[11px] text-slate-500">
                  พิมพ์ระบุตำแหน่งที่ต้องการให้ปรากฏใต้ชื่อผู้ลงนามในแบบฟอร์มใบยืม, ส่วนท้ายฉีก, และใบรับคืน
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              
              {/* 1. ผู้อนุมัติ (Approver / Mayor / Acting) */}
              <div className="p-4 rounded-xl border-2 border-blue-200 bg-blue-50/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-blue-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center text-[10px]">1</span>
                    ผู้อนุมัติคำขอยืม (Approver)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-blue-200 text-blue-800 rounded font-semibold">
                    ปรากฏในใบยืม & ระบบอนุมัติ
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">
                      ชื่อ-สกุล (ผู้อนุมัติ):
                    </label>
                    <input
                      type="text"
                      value={mayorName}
                      onChange={(e) => setMayorName(e.target.value)}
                      placeholder="เช่น นายจำรูญ พิทักษ์"
                      className="w-full p-2 bg-white border border-blue-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">
                      ตำแหน่ง (พิมพ์กำหนดเองได้อิสระ):
                    </label>
                    <input
                      type="text"
                      value={mayorPosition}
                      onChange={(e) => setMayorPosition(e.target.value)}
                      placeholder="เช่น นายกองค์การบริหารส่วนตำบลฝางคำ หรือ ปฏิบัติหน้าที่นายก อบต."
                      className="w-full p-2 bg-white border border-blue-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  </div>

                  {/* Position quick chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-500">เลือกตำแหน่งด่วน:</span>
                    <button
                      type="button"
                      onClick={() => setMayorPosition(`นายก${orgName}`)}
                      className="px-2 py-0.5 bg-white hover:bg-blue-100 border border-slate-200 rounded text-[10px] text-slate-700 transition-colors"
                    >
                      นายก {orgName}
                    </button>
                    <button
                      type="button"
                      onClick={() => setMayorPosition(`ปฏิบัติหน้าที่นายก ${orgName}`)}
                      className="px-2 py-0.5 bg-white hover:bg-blue-100 border border-slate-200 rounded text-[10px] text-slate-700 transition-colors"
                    >
                      ปฏิบัติหน้าที่นายก อบต.
                    </button>
                    <button
                      type="button"
                      onClick={() => setMayorPosition(`รองนายก ${orgName} ปฏิบัติราชการแทน`)}
                      className="px-2 py-0.5 bg-white hover:bg-blue-100 border border-slate-200 rounded text-[10px] text-slate-700 transition-colors"
                    >
                      รองนายก อบต. ปฏิบัติราชการแทน
                    </button>
                  </div>
                </div>
              </div>

              {/* 2. เจ้าหน้าที่พัสดุผู้ตรวจสอบ & ตรวจรับ (Supply Officer) */}
              <div className="p-4 rounded-xl border-2 border-emerald-200 bg-emerald-50/40 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-700 text-white flex items-center justify-center text-[10px]">2</span>
                    เจ้าหน้าที่พัสดุ (ผู้ตรวจสอบ/ส่งมอบ/ตรวจรับ)
                  </span>
                  <span className="text-[10px] px-2 py-0.5 bg-emerald-200 text-emerald-800 rounded font-semibold">
                    ปรากฏในใบยืม & ใบรับคืน
                  </span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">
                      ชื่อ-สกุล เจ้าหน้าที่พัสดุ:
                    </label>
                    <input
                      type="text"
                      value={supplyOfficerName}
                      onChange={(e) => setSupplyOfficerName(e.target.value)}
                      placeholder="เช่น จ.ส.อ. เกียรติพล หาทรัพย์"
                      className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">
                      ตำแหน่ง (พิมพ์กำหนดเองได้อิสระ):
                    </label>
                    <input
                      type="text"
                      value={supplyOfficerPosition}
                      onChange={(e) => setSupplyOfficerPosition(e.target.value)}
                      placeholder="เช่น เจ้าพนักงานธุรการชำนาญงาน หรือ เจ้าพนักงานพัสดุ"
                      className="w-full p-2 bg-white border border-emerald-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                      required
                    />
                  </div>

                  {/* Quick chips */}
                  <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
                    <span className="text-[10px] text-slate-500">เลือกตำแหน่งด่วน:</span>
                    <button
                      type="button"
                      onClick={() => setSupplyOfficerPosition('เจ้าพนักงานธุรการชำนาญงาน')}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-100 border border-slate-200 rounded text-[10px] text-slate-700 transition-colors"
                    >
                      เจ้าพนักงานธุรการชำนาญงาน
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupplyOfficerPosition('เจ้าพนักงานพัสดุ')}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-100 border border-slate-200 rounded text-[10px] text-slate-700 transition-colors"
                    >
                      เจ้าพนักงานพัสดุ
                    </button>
                    <button
                      type="button"
                      onClick={() => setSupplyOfficerPosition('เจ้าหน้าที่พัสดุ')}
                      className="px-2 py-0.5 bg-white hover:bg-emerald-100 border border-slate-200 rounded text-[10px] text-slate-700 transition-colors"
                    >
                      เจ้าหน้าที่พัสดุ
                    </button>
                  </div>
                </div>
              </div>

              {/* 3. ปลัด อบต. / ผู้กำกับดูแล (Palad) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">3</span>
                    ปลัด อบต. / ผู้กำกับดูแลสายงาน
                  </span>
                  <span className="text-[10px] text-slate-500">ผู้กลั่นกรอง/กำกับงาน</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">
                      ชื่อ-สกุล ปลัด อบต.:
                    </label>
                    <input
                      type="text"
                      value={paladName}
                      onChange={(e) => setPaladName(e.target.value)}
                      placeholder="เช่น นายชาญชัย อักโข"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">
                      ตำแหน่ง (พิมพ์กำหนดเองได้อิสระ):
                    </label>
                    <input
                      type="text"
                      value={paladPosition}
                      onChange={(e) => setPaladPosition(e.target.value)}
                      placeholder="เช่น ปลัดองค์การบริหารส่วนตำบลฝางคำ"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* 4. หัวหน้าฝ่ายบริหารงานทั่วไป / หัวหน้างานพัสดุ / ผอ.กองคลัง (Head of Supply) */}
              <div className="p-4 rounded-xl border border-slate-200 bg-slate-50 space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-slate-700 text-white flex items-center justify-center text-[10px]">4</span>
                    ผู้อำนวยการกองคลัง / หัวหน้างานพัสดุ
                  </span>
                  <span className="text-[10px] text-slate-500">สายงานพัสดุ</span>
                </div>

                <div className="space-y-2">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">
                      ชื่อ-สกุล ผอ.กองคลัง / หัวหน้างานพัสดุ:
                    </label>
                    <input
                      type="text"
                      value={headOfSupplyName}
                      onChange={(e) => setHeadOfSupplyName(e.target.value)}
                      placeholder="เช่น นางวาสนา สินทรัพย์"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-semibold text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 mb-0.5">
                      ตำแหน่ง (พิมพ์กำหนดเองได้อิสระ):
                    </label>
                    <input
                      type="text"
                      value={headOfSupplyPosition}
                      onChange={(e) => setHeadOfSupplyPosition(e.target.value)}
                      placeholder="เช่น ผู้อำนวยการกองคลัง"
                      className="w-full p-2 bg-white border border-slate-300 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
        </div>

        {/* Section 3: Rule Parameters & Deadlines */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <h3 className="font-bold text-xs text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-blue-700" />
            3. กำหนดเวลาและระเบียบการยืมพัสดุ
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                กำหนดส่งคืนภายในเวลา
              </label>
              <input
                type="text"
                value={returnTimeLimit}
                onChange={(e) => setReturnTimeLimit(e.target.value)}
                placeholder="เช่น เวลาราชการ หรือ 16:30 น."
                className="w-full p-2 bg-slate-50 border border-slate-300 rounded-xl font-medium text-slate-900 focus:bg-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                ระเบียบการยืม (Rules Version)
              </label>
              <input
                type="text"
                value={rulesConfig.version || 'ระเบียบ อบต.ฝางคำ'}
                disabled
                className="w-full p-2 bg-slate-50 text-slate-700 border border-slate-200 rounded-xl font-medium"
              />
            </div>
          </div>
        </div>

        {/* Save Button */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            className="px-6 py-2.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white font-bold text-xs rounded-xl shadow-md flex items-center gap-2 transition-all transform active:scale-95 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>บันทึกการตั้งค่าทั้งหมด</span>
          </button>
        </div>

      </form>
    </div>
  );
};

