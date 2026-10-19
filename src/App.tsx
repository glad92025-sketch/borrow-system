import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { LoginPage } from './components/auth/LoginPage';
import { OrgLogo } from './components/common/OrgLogo';
import { DashboardOverview } from './components/dashboard/DashboardOverview';
import { BorrowList } from './components/borrow/BorrowList';
import { NewBorrowModal } from './components/borrow/NewBorrowModal';
import { BorrowDetailModal } from './components/borrow/BorrowDetailModal';
import { ReturnInspectionCenter } from './components/returns/ReturnInspectionCenter';
import { AssetRegister } from './components/assets/AssetRegister';
import { BorrowerRegister } from './components/borrowers/BorrowerRegister';
import { DamageLostCenter } from './components/damages/DamageLostCenter';
import { QueueBoard } from './components/queue/QueueBoard';
import { PublicPortal } from './components/queue/PublicPortal';
import { OfficialBorrowDocument } from './components/documents/OfficialBorrowDocument';
import { OfficialReturnReceipt } from './components/documents/OfficialReturnReceipt';
import { ReportsCenter } from './components/reports/ReportsCenter';
import { AuditLogCenter } from './components/audit/AuditLogCenter';
import { SettingsCenter } from './components/settings/SettingsCenter';
import { QRScannerModal } from './components/common/QRScannerModal';
import { BorrowRequest } from './types';
import { Lock, LogIn, Search, FileText } from 'lucide-react';

const MainContent: React.FC = () => {
  const {
    isAuthenticated,
    isCitizenGuest,
    setIsCitizenGuest,
    activeTab,
    setActiveTab,
    selectedRequestId,
    setSelectedRequestId,
    borrowRequests,
    currentUserDisplayName,
    currentRole,
    orgSettings,
  } = useApp();

  const [showNewBorrowModal, setShowNewBorrowModal] = useState(false);
  const [selectedAssetForBorrow, setSelectedAssetForBorrow] = useState<string | undefined>();
  const [showScannerModal, setShowScannerModal] = useState(false);
  const [documentViewRequest, setDocumentViewRequest] = useState<BorrowRequest | null>(null);
  const [returnReceiptRequest, setReturnReceiptRequest] = useState<BorrowRequest | null>(null);
  const [selectedRequestForReturn, setSelectedRequestForReturn] = useState<BorrowRequest | null>(null);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Selected request for detail modal
  const activeDetailRequest = borrowRequests.find((r) => r.id === selectedRequestId) || null;

  const handleOpenDocument = (req: BorrowRequest) => {
    setDocumentViewRequest(req);
  };

  const handleOpenReturnReceipt = (req: BorrowRequest) => {
    setReturnReceiptRequest(req);
  };

  const handleOpenReturnFlow = (req: BorrowRequest) => {
    setSelectedRequestForReturn(req);
    setActiveTab('returns');
  };

  const handleOpenNewBorrow = (assetId?: string) => {
    setSelectedAssetForBorrow(assetId);
    setShowNewBorrowModal(true);
  };

  // If user is not authenticated and not in guest mode, show Login Page
  if (!isAuthenticated && !isCitizenGuest) {
    return <LoginPage onEnterAsCitizen={() => setIsCitizenGuest(true)} />;
  }

  // If citizen guest mode (not logged in)
  if (!isAuthenticated && isCitizenGuest) {
    return (
      <div className="min-h-screen bg-slate-100 flex flex-col">
        {/* Guest Citizen Header */}
        <header className="bg-white border-b border-slate-200 px-4 py-3 sm:px-8 flex items-center justify-between sticky top-0 z-20 shadow-xs">
          <div className="flex items-center gap-3">
            <OrgLogo size="sm" showBorder={false} />
            <div>
              <h1 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                {orgSettings.orgName}
              </h1>
              <p className="text-[10px] text-slate-500">
                บริการตรวจสอบคิวและสถานะคำขอยืมพัสดุสำหรับประชาชน
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => handleOpenNewBorrow()}
              className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <span>+ ยื่นขอยืมพัสดุ</span>
            </button>
            <button
              type="button"
              onClick={() => setIsCitizenGuest(false)}
              className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer shadow-xs"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>เข้าสู่ระบบเจ้าหน้าที่ (Admin)</span>
            </button>
          </div>
        </header>

        {/* Citizen Content View */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl mx-auto w-full">
          <PublicPortal
            onOpenDocumentView={handleOpenDocument}
            onOpenNewBorrowModal={() => handleOpenNewBorrow()}
          />
        </main>

        {/* New Borrow Modal in Citizen view */}
        {showNewBorrowModal && (
          <NewBorrowModal
            isOpen={showNewBorrowModal}
            initialAssetId={selectedAssetForBorrow}
            onClose={() => {
              setShowNewBorrowModal(false);
              setSelectedAssetForBorrow(undefined);
            }}
            onSuccessCreated={(newReq) => {
              setShowNewBorrowModal(false);
              setSelectedAssetForBorrow(undefined);
              setDocumentViewRequest(newReq);
            }}
          />
        )}

        {/* Document Modal for Citizen view */}
        {documentViewRequest && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
            <div className="max-w-4xl w-full my-auto">
              <OfficialBorrowDocument
                borrowRequest={documentViewRequest}
                onClose={() => setDocumentViewRequest(null)}
              />
            </div>
          </div>
        )}
      </div>
    );
  }

  // Authenticated Admin Dashboard Layout
  return (
    <div className="flex h-screen w-full bg-[#f8fafc] overflow-hidden font-sans text-slate-900">
      
      {/* Sidebar with mobile backdrop and slide-over support */}
      <Sidebar
        onOpenNewBorrowModal={() => {
          handleOpenNewBorrow();
          setIsMobileSidebarOpen(false);
        }}
        isOpenMobile={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Column */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Header */}
        <Header
          onOpenScanner={() => setShowScannerModal(true)}
          onOpenNewBorrowModal={() => handleOpenNewBorrow()}
          onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
        />

        {/* Scrollable Viewport */}
        <div className="flex-1 p-4 sm:p-6 overflow-y-auto">
          {activeTab === 'dashboard' && (
            <DashboardOverview
              onOpenNewBorrowModal={() => handleOpenNewBorrow()}
              onOpenScanner={() => setShowScannerModal(true)}
              onOpenDocumentView={handleOpenDocument}
            />
          )}

          {activeTab === 'borrows' && (
            <BorrowList
              onOpenNewBorrowModal={() => handleOpenNewBorrow()}
              onOpenDetailModal={(req) => setSelectedRequestId(req.id)}
              onOpenDocumentView={handleOpenDocument}
              onOpenReturnFlow={handleOpenReturnFlow}
            />
          )}

          {activeTab === 'returns' && (
            <ReturnInspectionCenter
              onOpenScanner={() => setShowScannerModal(true)}
              onOpenReturnReceipt={handleOpenReturnReceipt}
              selectedRequestForReturn={selectedRequestForReturn}
              onClearSelectedReturn={() => setSelectedRequestForReturn(null)}
            />
          )}

          {activeTab === 'assets' && (
            <AssetRegister
              onOpenNewBorrowWithAsset={(assetId) => handleOpenNewBorrow(assetId)}
            />
          )}

          {activeTab === 'borrowers' && <BorrowerRegister />}

          {activeTab === 'damages_lost' && <DamageLostCenter />}

          {activeTab === 'queue_board' && <QueueBoard />}

          {activeTab === 'public_portal' && (
            <PublicPortal
              onOpenDocumentView={handleOpenDocument}
              onOpenNewBorrowModal={() => handleOpenNewBorrow()}
            />
          )}

          {activeTab === 'documents' && (
            <div className="space-y-4">
              <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-bold text-slate-800">
                    แบบฟอร์มเอกสารทางราชการและใบฉีกนัดคืน (A4 Printable Forms)
                  </h3>
                  <p className="text-xs text-slate-500 mt-0.5">
                    พิมพ์เอกสารคำขอยืมพร้อมส่วนท้ายฉีกได้ และใบเสร็จรับคืนพัสดุ
                  </p>
                </div>
              </div>

              {/* Default to the first request if none selected */}
              <OfficialBorrowDocument
                borrowRequest={documentViewRequest || borrowRequests[0]}
                onClose={() => setDocumentViewRequest(null)}
              />
            </div>
          )}

          {activeTab === 'reports' && <ReportsCenter />}

          {activeTab === 'audit_log' && <AuditLogCenter />}

          {activeTab === 'settings' && <SettingsCenter />}
        </div>

        {/* Clean Minimalist Status Footer */}
        <footer className="no-print h-8 bg-slate-800 text-white px-4 sm:px-6 flex items-center justify-between text-[10px] font-medium shrink-0">
          <div className="flex gap-4 uppercase tracking-tighter truncate">
            <span className="hidden sm:inline">Server: 192.168.1.45</span>
            <span className="text-slate-400 hidden md:inline">Uptime: 24d 12h</span>
            <span className="text-slate-300 truncate">
              Logged in as {currentUserDisplayName} ({currentRole})
            </span>
          </div>
          <div className="flex gap-2 items-center shrink-0">
            <div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
            <span className="text-slate-200">ระบบทำงานปกติ</span>
          </div>
        </footer>

      </main>

      {/* MODALS */}

      {/* 1. New Borrow Modal */}
      {showNewBorrowModal && (
        <NewBorrowModal
          isOpen={showNewBorrowModal}
          initialAssetId={selectedAssetForBorrow}
          onClose={() => {
            setShowNewBorrowModal(false);
            setSelectedAssetForBorrow(undefined);
          }}
          onSuccessCreated={(newReq) => {
            setShowNewBorrowModal(false);
            setSelectedAssetForBorrow(undefined);
            setDocumentViewRequest(newReq);
          }}
        />
      )}

      {/* 2. Borrow Detail / Approval / Dispatch Modal */}
      {activeDetailRequest && (
        <BorrowDetailModal
          request={activeDetailRequest}
          onClose={() => setSelectedRequestId(null)}
          onOpenDocument={() => handleOpenDocument(activeDetailRequest)}
        />
      )}

      {/* 3. Official Borrow Document View Modal */}
      {documentViewRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="max-w-4xl w-full my-auto">
            <OfficialBorrowDocument
              borrowRequest={documentViewRequest}
              onClose={() => setDocumentViewRequest(null)}
            />
          </div>
        </div>
      )}

      {/* 4. Official Return Receipt View Modal */}
      {returnReceiptRequest && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/70 backdrop-blur-xs overflow-y-auto animate-fadeIn">
          <div className="max-w-4xl w-full my-auto">
            <OfficialReturnReceipt
              borrowRequest={returnReceiptRequest}
              onClose={() => setReturnReceiptRequest(null)}
            />
          </div>
        </div>
      )}

      {/* 5. QR & Barcode Scanner Modal */}
      {showScannerModal && (
        <QRScannerModal
          onClose={() => setShowScannerModal(false)}
          onScanSuccess={(decodedText) => {
            setShowScannerModal(false);
            const foundReq = borrowRequests.find(
              (r) =>
                r?.queueNumber?.toLowerCase() === decodedText.toLowerCase() ||
                r?.requestNumber?.toLowerCase() === decodedText.toLowerCase() ||
                r?.items?.some((i) => i?.assetCode?.toLowerCase() === decodedText.toLowerCase())
            );

            if (foundReq) {
              setSelectedRequestId(foundReq.id);
              setActiveTab('borrows');
            } else {
              setActiveTab('assets');
            }
          }}
        />
      )}

    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
