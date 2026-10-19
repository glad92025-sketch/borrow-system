import React, { useState } from 'react';
import { 
  Building2, 
  UserCheck, 
  Bell, 
  Search, 
  Shield, 
  QrCode, 
  Layers, 
  ChevronDown, 
  Volume2, 
  Calendar, 
  Clock, 
  Sparkles, 
  Menu, 
  LogOut,
  User,
  ShieldCheck,
  Plus,
  Cloud,
  RefreshCw,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types';
import { OrgLogo } from '../common/OrgLogo';

interface HeaderProps {
  onOpenScanner: () => void;
  onOpenNewBorrowModal?: () => void;
  onToggleMobileSidebar?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenScanner,
  onOpenNewBorrowModal,
  onToggleMobileSidebar,
}) => {
  const { 
    currentRole, 
    setCurrentRole, 
    currentUserDisplayName, 
    orgSettings, 
    globalSearch, 
    setGlobalSearch,
    borrowRequests,
    setActiveTab,
    setSelectedRequestId,
    activeTab,
    logout,
    isCloudConnected,
    isCloudSyncing,
    syncWithCloudNow,
  } = useApp();

  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [showNotificationDrawer, setShowNotificationDrawer] = useState(false);

  // Tab Titles map
  const tabTitles: Record<string, string> = {
    dashboard: 'แดชบอร์ดภาพรวม',
    borrows: 'รายการขอยืม-คืนพัสดุ',
    returns: 'จุดตรวจรับคืนพัสดุ',
    damages_lost: 'พัสดุชำรุดและสูญหาย',
    assets: 'ทะเบียนทรัพย์สิน/ครุภัณฑ์',
    borrowers: 'ทะเบียนผู้ยืม (ประชาชน & จนท.)',
    queue_board: 'จอคิวรับ-คืน หน้าสำนักงาน',
    public_portal: 'ประชาชนตรวจคิว & สถานะ',
    documents: 'เอกสารราชการ & ใบฉีกนัดคืน',
    reports: 'ศูนย์รายงานสถิติ (17 รูปแบบ)',
    audit_log: 'Audit Log ตรวจสอบย้อนกลับ',
    settings: 'ตั้งค่าระบบ & กฎการยืม',
  };

  // Overdue and pending counts for notifications
  const pendingCheckCount = borrowRequests.filter(r => r.status === 'pending_check').length;
  const pendingApprovalCount = borrowRequests.filter(r => r.status === 'pending_approval').length;
  const overdueCount = borrowRequests.filter(r => r.status === 'issued' && new Date(r.dueDate) < new Date('2026-08-18')).length;
  const totalAlerts = pendingCheckCount + pendingApprovalCount + overdueCount;

  const roleOptions: { role: UserRole; title: string; desc: string; badgeColor: string }[] = [
    { role: 'supply_officer', title: 'เจ้าหน้าที่พัสดุ', desc: 'ตรวจของ / จ่าย / รับคืน / ตรวจสภาพ', badgeColor: 'bg-blue-600' },
    { role: 'executive', title: 'ผู้บริหาร / นายก อบต.', desc: 'ดู Dashboard / อนุมัติคำขอ', badgeColor: 'bg-purple-600' },
    { role: 'super_admin', title: 'Super Admin', desc: 'ผู้ดูแลระบบและสิทธิ์ทั้งหมด', badgeColor: 'bg-rose-600' },
    { role: 'admin', title: 'Admin', desc: 'จัดการข้อมูลหลักและทะเบียน', badgeColor: 'bg-indigo-600' },
    { role: 'inspector', title: 'ผู้ตรวจสอบ', desc: 'ตรวจสอบรายการและประวัติ', badgeColor: 'bg-amber-600' },
    { role: 'employee', title: 'พนักงาน อบต.', desc: 'ยื่นขอยืมใช้งานราชการ', badgeColor: 'bg-emerald-600' },
    { role: 'citizen', title: 'ประชาชน', desc: 'ยื่นคำขอยืม / ตรวจสอบสถานะ', badgeColor: 'bg-teal-600' },
  ];

  return (
    <header className="no-print h-16 bg-white border-b border-slate-200 px-4 sm:px-6 flex items-center justify-between sticky top-0 z-40">
      
      {/* Left title & mobile menu toggle */}
      <div className="flex items-center gap-3">
        {onToggleMobileSidebar && (
          <button
            type="button"
            onClick={onToggleMobileSidebar}
            className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
            title="เปิดเมนู"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}

        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-bold text-slate-800">
            {tabTitles[activeTab] || 'ระบบบริหารพัสดุ'}
          </h2>
          <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider hidden sm:inline-block">
            Live System
          </span>
        </div>
      </div>

      {/* Center Search */}
      <div className="hidden md:flex flex-1 max-w-xs mx-4 relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={globalSearch}
          onChange={(e) => setGlobalSearch(e.target.value)}
          placeholder="ค้นหาเลขใบยืม / ชื่อผู้ยืม..."
          className="w-full bg-slate-100 hover:bg-slate-200/60 border-none rounded-full pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
        />
      </div>

      {/* Right Action buttons & Role Switcher */}
      <div className="flex items-center gap-2 sm:gap-3">
        
        {/* Firebase Cloud Sync Status */}
        <button
          type="button"
          onClick={() => syncWithCloudNow()}
          disabled={isCloudSyncing}
          className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
            isCloudConnected
              ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100 shadow-2xs'
              : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100 shadow-2xs'
          }`}
          title="เชื่อมต่อ Firebase Realtime Database (duty-fangkham) - คลิกเพื่อบังคับซิงค์ทันที"
        >
          <Cloud className={`w-3.5 h-3.5 ${isCloudConnected ? 'text-emerald-600' : 'text-amber-500'}`} />
          <span className="hidden md:inline">{isCloudSyncing ? 'กำลังซิงค์...' : isCloudConnected ? 'Firebase ออนไลน์' : 'เชื่อมต่อ Cloud'}</span>
          <RefreshCw className={`w-3 h-3 text-slate-400 ${isCloudSyncing ? 'animate-spin text-emerald-600' : ''}`} />
        </button>

        {/* Quick New Borrow button */}
        {onOpenNewBorrowModal && (
          <button
            type="button"
            onClick={onOpenNewBorrowModal}
            className="px-3 py-1.5 bg-gradient-to-r from-blue-700 to-indigo-800 hover:from-blue-800 hover:to-indigo-900 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer"
            title="ยื่นคำขอยืมพัสดุใหม่"
          >
            <Plus className="w-4 h-4 text-amber-300" />
            <span>ยื่นขอยืมพัสดุ</span>
          </button>
        )}

        {/* Quick QR Scanner button */}
        <button
          type="button"
          onClick={onOpenScanner}
          className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer"
          title="เปิดกล้องสแกน QR Code / บาร์โค้ด"
        >
          <QrCode className="w-4 h-4 text-blue-600" />
          <span className="hidden sm:inline">สแกน QR</span>
        </button>

        {/* Notification Bell */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotificationDrawer(!showNotificationDrawer)}
            className="w-8 h-8 flex items-center justify-center text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-full relative transition-colors"
            title="การแจ้งเตือนงาน"
          >
            <Bell className="w-4 h-4" />
            {totalAlerts > 0 && (
              <span className="absolute top-0.5 right-0.5 w-2 h-2 bg-red-500 rounded-full ring-2 ring-white" />
            )}
          </button>

          {/* Notification Popup */}
          {showNotificationDrawer && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-800 overflow-hidden z-50 animate-fadeIn">
              <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
                <span className="font-bold text-xs text-slate-700 flex items-center gap-1.5">
                  <Bell className="w-3.5 h-3.5 text-blue-600" />
                  การแจ้งเตือน ({totalAlerts})
                </span>
                <button
                  type="button"
                  onClick={() => setShowNotificationDrawer(false)}
                  className="text-slate-400 hover:text-slate-700 text-xs font-medium"
                >
                  ปิด
                </button>
              </div>
              <div className="p-2 divide-y divide-slate-100 max-h-72 overflow-y-auto text-xs">
                {overdueCount > 0 && (
                  <div 
                    onClick={() => {
                      setActiveTab('borrows');
                      setShowNotificationDrawer(false);
                    }}
                    className="p-2.5 hover:bg-red-50 cursor-pointer rounded-lg text-red-800 space-y-0.5"
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-red-500" />
                      มีรายการเกินกำหนดคืน {overdueCount} รายการ!
                    </div>
                    <p className="text-[11px] text-slate-500">กรุณาติดตามผู้ยืมและส่งหนังสือแจ้งเตือน</p>
                  </div>
                )}
                {pendingApprovalCount > 0 && (
                  <div 
                    onClick={() => {
                      setActiveTab('borrows');
                      setShowNotificationDrawer(false);
                    }}
                    className="p-2.5 hover:bg-blue-50 cursor-pointer rounded-lg text-blue-900 space-y-0.5"
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-blue-500" />
                      มีคำขอรอการอนุมัติ {pendingApprovalCount} รายการ
                    </div>
                    <p className="text-[11px] text-slate-500">รอผู้บริหารพิจารณาลงนามอนุมัติ</p>
                  </div>
                )}
                {pendingCheckCount > 0 && (
                  <div 
                    onClick={() => {
                      setActiveTab('borrows');
                      setShowNotificationDrawer(false);
                    }}
                    className="p-2.5 hover:bg-amber-50 cursor-pointer rounded-lg text-amber-900 space-y-0.5"
                  >
                    <div className="font-bold flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-amber-500" />
                      มีคำขอใหม่รอตรวจสอบ {pendingCheckCount} รายการ
                    </div>
                    <p className="text-[11px] text-slate-500">เจ้าหน้าที่พัสดุโปรดตรวจสอบสต็อกและประวัติ</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Admin User Profile & Logout Button */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowUserDropdown(!showUserDropdown)}
            className="flex items-center gap-2 px-2.5 py-1.5 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl text-xs transition-colors cursor-pointer"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-[11px] shadow-xs">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-300" />
            </div>
            <div className="text-left hidden sm:block">
              <div className="font-bold text-[11px] leading-tight text-slate-900 flex items-center gap-1">
                <span>ผู้ดูแลระบบ (Admin)</span>
              </div>
              <div className="text-[10px] text-slate-500 truncate max-w-[110px]">
                {orgSettings.orgName.replace('องค์การบริหารส่วนตำบล', 'อบต.')}
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>

          {/* User Dropdown */}
          {showUserDropdown && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-800 p-3 z-50 animate-fadeIn">
              <div className="flex items-center gap-3 p-2 bg-slate-50 rounded-xl border border-slate-100 mb-2">
                <OrgLogo size="sm" showBorder={false} />
                <div className="min-w-0">
                  <p className="font-bold text-xs text-slate-900 truncate">
                    ผู้ดูแลระบบ (Admin)
                  </p>
                  <p className="text-[10px] text-slate-500 truncate">
                    {orgSettings.orgName}
                  </p>
                </div>
              </div>

              <div className="space-y-1 text-xs">
                <button
                  type="button"
                  onClick={() => {
                    setActiveTab('settings');
                    setShowUserDropdown(false);
                  }}
                  className="w-full text-left p-2 hover:bg-slate-50 rounded-lg flex items-center gap-2 text-slate-700 transition-colors cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-blue-600" />
                  <span>ตั้งค่าระบบและโลโก้ อบต.</span>
                </button>

                <div className="border-t border-slate-100 my-1 pt-1" />

                <button
                  type="button"
                  onClick={() => {
                    setShowUserDropdown(false);
                    logout();
                  }}
                  className="w-full text-left p-2 hover:bg-red-50 text-red-600 rounded-lg flex items-center gap-2 font-bold transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  <span>ออกจากระบบ (Logout)</span>
                </button>
              </div>
            </div>
          )}
        </div>

      </div>

    </header>
  );
};
