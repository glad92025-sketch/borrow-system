import React from 'react';
import {
  LayoutDashboard,
  ClipboardList,
  Package,
  Users,
  RotateCcw,
  AlertTriangle,
  MonitorPlay,
  Search,
  FileText,
  BarChart3,
  ShieldAlert,
  Settings,
  PlusCircle,
  X,
  LogOut,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrgLogo } from '../common/OrgLogo';

interface SidebarProps {
  onOpenNewBorrowModal: () => void;
  isOpenMobile?: boolean;
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenNewBorrowModal,
  isOpenMobile = false,
  onCloseMobile,
}) => {
  const {
    activeTab,
    setActiveTab,
    borrowRequests,
    damageCases,
    lostCases,
    currentUserDisplayName,
    currentRole,
    orgSettings,
    logout,
  } = useApp();

  // Pending counts
  const pendingCheckCount = borrowRequests.filter((r) => r.status === 'pending_check').length;
  const pendingApprovalCount = borrowRequests.filter((r) => r.status === 'pending_approval').length;
  const issuedCount = borrowRequests.filter((r) => r.status === 'issued').length;
  const totalCasesCount =
    damageCases.filter((d) => d.compensationStatus !== 'paid').length +
    lostCases.filter((l) => l.compensationStatus !== 'closed').length;

  const roleTitleMap: Record<string, string> = {
    supply_officer: 'เจ้าหน้าที่พัสดุ',
    executive: 'นายก อบต. / ผู้บริหาร',
    super_admin: 'Super Admin',
    admin: 'ผู้ดูแลระบบ',
    inspector: 'ผู้ตรวจสอบ',
    employee: 'พนักงาน อบต.',
    citizen: 'ประชาชน',
  };

  const menuSections = [
    {
      title: 'Main Menu',
      items: [
        { id: 'dashboard', label: 'แผงควบคุม (Dashboard)', icon: LayoutDashboard, badge: null },
        {
          id: 'borrows',
          label: 'รายการยืม-คืน',
          icon: ClipboardList,
          badge: pendingCheckCount + pendingApprovalCount > 0 ? `${pendingCheckCount + pendingApprovalCount}` : null,
          badgeColor: 'bg-amber-100 text-amber-800',
        },
        {
          id: 'returns',
          label: 'จุดตรวจรับคืนพัสดุ',
          icon: RotateCcw,
          badge: issuedCount > 0 ? `${issuedCount}` : null,
          badgeColor: 'bg-blue-100 text-blue-700',
        },
        { id: 'assets', label: 'ทะเบียนพัสดุ', icon: Package, badge: null },
      ],
    },
    {
      title: 'Management',
      items: [
        { id: 'borrowers', label: 'ทะเบียนสมาชิก (ผู้ยืม)', icon: Users, badge: null },
        {
          id: 'damages_lost',
          label: 'ของชำรุด / สูญหาย',
          icon: AlertTriangle,
          badge: totalCasesCount > 0 ? `${totalCasesCount}` : null,
          badgeColor: 'bg-red-100 text-red-700 font-bold',
        },
        { id: 'queue_board', label: 'จอคิวรับ-คืน Live', icon: MonitorPlay, badge: 'LIVE', badgeColor: 'bg-emerald-100 text-emerald-700' },
        { id: 'public_portal', label: 'บริการประชาชนตรวจคิว', icon: Search, badge: null },
      ],
    },
    {
      title: 'System & Reports',
      items: [
        { id: 'documents', label: 'เอกสารราชการ & ใบฉีก', icon: FileText, badge: null },
        { id: 'reports', label: 'รายงานสรุป (17 รูปแบบ)', icon: BarChart3, badge: null },
        { id: 'audit_log', label: 'Audit Log ตรวจสอบ', icon: ShieldAlert, badge: null },
        { id: 'settings', label: 'ตั้งค่าระบบ & กฎการยืม', icon: Settings, badge: null },
      ],
    },
  ];

  const handleTabClick = (tabId: string) => {
    setActiveTab(tabId);
    if (onCloseMobile) {
      onCloseMobile();
    }
  };

  const sidebarContent = (
    <div className="w-64 bg-white border-r border-slate-200 flex flex-col shrink-0 h-full">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <OrgLogo size="sm" showBorder={false} />
          <div className="overflow-hidden">
            <h1 className="text-xs font-bold text-slate-900 leading-tight truncate">
              {orgSettings.orgName.replace('องค์การบริหารส่วนตำบล', 'อบต.')}
            </h1>
            <p className="text-[10px] text-slate-500 tracking-tight truncate">
              {orgSettings.amphoe} {orgSettings.province}
            </p>
          </div>
        </div>

        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="md:hidden text-slate-400 hover:text-slate-700 p-1 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Quick Action Button */}
      <div className="p-3 border-b border-slate-100">
        <button
          type="button"
          onClick={onOpenNewBorrowModal}
          className="w-full py-2 px-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer"
        >
          <PlusCircle className="w-4 h-4 text-white" />
          <span>ยื่นคำขอยืมพัสดุใหม่</span>
        </button>
      </div>

      {/* Navigation List */}
      <nav className="flex-1 p-3 flex flex-col gap-4 overflow-y-auto">
        {menuSections.map((sec, secIdx) => (
          <div key={secIdx} className="space-y-0.5">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider px-3 py-1">
              {sec.title}
            </div>
            {sec.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleTabClick(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-blue-600' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                        item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User Profile Footer */}
      <div className="p-3 border-t border-slate-100">
        <div className="bg-slate-50 p-2.5 rounded-xl flex items-center justify-between gap-2 border border-slate-200/70">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-lg bg-blue-700 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-xs">
              <ShieldCheck className="w-4 h-4 text-amber-300" />
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-bold text-slate-800 truncate">
                Admin
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                ผู้ดูแลระบบพัสดุ
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            title="ออกจากระบบ (Logout)"
            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Static Sidebar */}
      <aside className="no-print hidden md:flex md:w-64 h-full shrink-0">
        {sidebarContent}
      </aside>

      {/* Mobile Backdrop & Drawer */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={onCloseMobile}
          />
          <div className="relative z-10 h-full animate-fadeIn">
            {sidebarContent}
          </div>
        </div>
      )}
    </>
  );
};
