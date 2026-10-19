import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Download, ArrowLeft, Scissors, ShieldCheck, CheckCircle2, X, ExternalLink, Check, FileDown, Loader2 } from 'lucide-react';
import { BorrowRequest, OrgSettings, SystemRuleConfig } from '../../types';
import { formatThaiDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { printElementById, openPrintableTab } from '../../utils/printHelper';
import { exportElementToPdf } from '../../utils/pdfHelper';

interface OfficialBorrowDocumentProps {
  request?: BorrowRequest | null;
  borrowRequest?: BorrowRequest | null;
  orgSettings?: OrgSettings;
  rulesConfig?: SystemRuleConfig;
  onBack?: () => void;
  onClose?: () => void;
}

export const OfficialBorrowDocument: React.FC<OfficialBorrowDocumentProps> = ({
  request: propRequest,
  borrowRequest: propBorrowRequest,
  orgSettings: propOrgSettings,
  rulesConfig: propRulesConfig,
  onBack,
  onClose,
}) => {
  const context = useApp();
  const orgSettings = propOrgSettings || context.orgSettings;
  const rulesConfig = propRulesConfig || context.rulesConfig;
  const request = propRequest || propBorrowRequest || context.borrowRequests[0];
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleClose = onBack || onClose;

  const handlePrint = () => {
    setPrintStatus('กำลังสั่งพิมพ์...');
    const success = printElementById('printable-borrow-doc', `ใบยืมพัสดุ_${request?.requestNumber || 'doc'}`);
    setTimeout(() => {
      setPrintStatus(success ? 'ส่งคำสั่งพิมพ์เรียบร้อย' : 'หากหน้าต่างไม่เปิด กรุณาคลิกปุ่มเปิดแท็บใหม่');
      setTimeout(() => setPrintStatus(null), 4000);
    }, 500);
  };

  const handleOpenNewTab = () => {
    openPrintableTab('printable-borrow-doc', `ใบยืมพัสดุ_${request?.requestNumber || 'doc'}`);
  };

  const handleExportPdf = async () => {
    if (!request) return;
    setIsExportingPdf(true);
    setPrintStatus('กำลังแปลงเอกสารเป็นไฟล์ PDF (A4 พอดีหน้า)...');
    try {
      const success = await exportElementToPdf('printable-borrow-doc', {
        filename: `ใบยืมพัสดุ_${request.requestNumber || 'doc'}.pdf`,
        quality: 2,
      });
      setPrintStatus(success ? 'ดาวน์โหลด PDF สำเร็จ' : 'กรุณาใช้ปุ่มพิมพ์เพื่อบันทึกเป็น PDF');
    } catch (err) {
      console.error(err);
      setPrintStatus('เกิดข้อผิดพลาดในการดาวน์โหลด PDF');
    } finally {
      setIsExportingPdf(false);
      setTimeout(() => setPrintStatus(null), 4000);
    }
  };

  if (!request) {
    return (
      <div className="bg-white p-8 rounded-2xl border border-slate-200 text-center text-slate-500">
        <p>ไม่พบข้อมูลคำขอยืมสำหรับแสดงผลเอกสาร</p>
        {handleClose && (
          <button
            onClick={handleClose}
            className="mt-4 px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg"
          >
            ปิด
          </button>
        )}
      </div>
    );
  }

  const itemsCount = request.items?.length || 0;
  const isCompactLayout = itemsCount >= 4;

  // Helper to remove any duplicated parentheses in name strings
  const cleanName = (name?: string) => {
    if (!name) return '';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  const supplyOfficerDisplayName = cleanName(orgSettings.supplyOfficerName) || 'จ.ส.อ. เกียรติพล หาทรัพย์';
  const mayorDisplayName = cleanName(orgSettings.mayorName) || 'นายจำรูญ พิทักษ์';

  // QR code payload for citizen status verification
  const qrVerificationData = JSON.stringify({
    queue: request.queueNumber || 'N/A',
    docNo: request.requestNumber || 'N/A',
    borrower: request.borrowerName || 'N/A',
    dueDate: request.dueDate || '',
    dueTime: request.dueTime || '',
    itemsCount: request.items?.length || 0,
    status: request.status || '',
  });

  return (
    <div className="space-y-4">
      {/* Top Action Bar (hidden on print) */}
      <div className="no-print bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          {handleClose && (
            <button
              onClick={handleClose}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              ย้อนกลับ
            </button>
          )}
          <div>
            <h2 className="font-bold text-slate-900 text-sm">
              เอกสารราชการ: ใบยืมพัสดุและใบรับหลักฐานฉีกส่วนท้าย (A4 Form & Tear-off Slip)
            </h2>
            <p className="text-xs text-slate-500">
              เลขที่ {request.requestNumber} | คิวที่ {request.queueNumber} ({itemsCount} รายการ)
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {printStatus && (
            <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 animate-fadeIn flex items-center gap-1">
              {isExportingPdf && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {printStatus}
            </span>
          )}

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExportingPdf}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 active:bg-emerald-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
            title="ดาวน์โหลดไฟล์ PDF ขนาด A4 พอดีหน้าทันที"
          >
            {isExportingPdf ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <FileDown className="w-4 h-4" />
            )}
            <span>Export เป็น PDF (A4 พอดีหน้า)</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            title="เปิดในแท็บใหม่เพื่อพิมพ์แบบเต็มจอหรือบันทึก PDF"
          >
            <ExternalLink className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">เปิดพิมพ์แท็บใหม่</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            พิมพ์เอกสาร A4
          </button>

          {handleClose && (
            <button
              onClick={handleClose}
              className="p-2 text-slate-400 hover:text-slate-700 rounded-lg hover:bg-slate-100"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* Printable Sheet Wrapper (A4 proportions) */}
      <div 
        id="printable-borrow-doc"
        className={`bg-white mx-auto w-full max-w-[210mm] border border-slate-300 shadow-lg ${isCompactLayout ? 'p-4 sm:p-6' : 'p-6 sm:p-8'} text-slate-900 print-page-sheet print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none text-xs leading-normal`}
      >
        
        {/* SECTION 1: MAIN OFFICIAL BORROW FORM */}
        <div className={isCompactLayout ? 'space-y-2' : 'space-y-2.5'}>
          {/* Official Emblem / Header */}
          <div className="text-center space-y-0.5 relative pb-0.5">
            <div className={`${isCompactLayout ? 'w-12 h-12 mb-0.5' : 'w-14 h-14 mb-1'} mx-auto flex items-center justify-center`}>
              {orgSettings.logoUrl ? (
                <img
                  src={orgSettings.logoUrl}
                  alt="ตรา อบต."
                  className={`${isCompactLayout ? 'w-12 h-12' : 'w-14 h-14'} object-contain rounded-full border border-slate-300 p-0.5`}
                />
              ) : (
                <div className={`${isCompactLayout ? 'w-12 h-12 text-lg' : 'w-14 h-14 text-xl'} rounded-full border-2 border-blue-900 flex items-center justify-center text-blue-900 font-serif font-black tracking-tighter shadow-xs`}>
                  อบต.
                </div>
              )}
            </div>
            <h1 className={`${isCompactLayout ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-bold text-slate-900 tracking-wide`}>
              {orgSettings.orgName} {orgSettings.amphoe} {orgSettings.province}
            </h1>
            <h2 className={`${isCompactLayout ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-bold text-slate-800`}>
              แบบคำขอยืมวัสดุ ครุภัณฑ์ และทรัพย์สินของทางราชการ
            </h2>
            <p className="text-[11px] text-slate-500">
              (ตามระเบียบกระทรวงมหาดไทยว่าด้วยการบริหารจัดการทรัพย์สินขององค์กรปกครองส่วนท้องถิ่น)
            </p>

            <div className="absolute right-0 top-0 text-right text-xs space-y-0.5">
              <div>เลขที่เอกสาร: <strong className="font-mono text-slate-900">{request.requestNumber}</strong></div>
              <div>คิวรับของ: <strong className="text-amber-900 bg-amber-100 px-2 py-0.5 rounded font-mono font-bold">{request.queueNumber}</strong></div>
              <div className="text-slate-500 text-[11px]">วันที่: {formatThaiDate(request.requestDate)}</div>
            </div>
          </div>

          {/* Borrower Information */}
          <div className={`border border-slate-300 rounded-lg ${isCompactLayout ? 'p-2 space-y-1 text-xs' : 'p-2.5 space-y-1.5 text-xs sm:text-[12.5px]'} bg-slate-50/50`}>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              <div>
                <span className="font-semibold text-slate-600">ข้าพเจ้า (ผู้ยืม): </span>
                <span className="font-bold text-slate-900">{request.borrowerName}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">ประเภทผู้ยืม: </span>
                <span className="text-slate-900">
                  {request.borrowerType === 'citizen' ? 'ประชาชนทั่วไป' : 'พนักงาน / เจ้าหน้าที่ อบต.'}
                </span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">
                  {request.borrowerType === 'citizen' ? 'เลขบัตรประชาชน:' : 'รหัสพนักงาน:'}
                </span>{' '}
                <span className="font-mono text-slate-900">{request.borrowerIdCardOrEmpCode}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">
                  {request.borrowerType === 'citizen' ? 'ที่อยู่ / หมู่บ้าน:' : 'สังกัด / กอง:'}
                </span>{' '}
                <span className="text-slate-900">{request.borrowerDepartmentOrMoo}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">หมายเลขโทรศัพท์: </span>
                <span className="font-mono text-slate-900">{request.borrowerPhone}</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">สถานที่นำไปใช้งาน: </span>
                <span className="text-slate-900">{request.venueOfUse}</span>
              </div>
            </div>
            <div className="pt-0.5 border-t border-slate-200">
              <span className="font-semibold text-slate-600">วัตถุประสงค์การใช้งาน: </span>
              <span className="text-slate-900">{request.purpose}</span>
            </div>
          </div>

          {/* Borrow Schedule */}
          <div className={`border border-blue-200 bg-blue-50/50 rounded-lg ${isCompactLayout ? 'p-1.5 text-xs' : 'p-2 text-xs sm:text-[12.5px]'} grid grid-cols-3 gap-2`}>
            <div>
              <span className="font-semibold text-blue-900">กำหนดรับของ: </span>
              <span className="font-bold text-slate-900">{formatThaiDate(request.pickupDate)}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-900">กำหนดส่งคืน: </span>
              <span className="font-bold text-red-600">{formatThaiDate(request.dueDate)}</span>
            </div>
            <div>
              <span className="font-semibold text-blue-900">ส่งคืนก่อนเวลา: </span>
              <span className="font-bold text-red-600">{request.dueTime} น.</span>
            </div>
          </div>

          {/* Requested Items Table (Scaled dynamically for multiple items) */}
          <div className="space-y-0.5">
            <h3 className="font-bold text-xs sm:text-[12.5px] text-slate-800">รายการวัสดุ/ครุภัณฑ์ที่ขอยืม:</h3>
            <table className="w-full text-xs sm:text-[12px] border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-semibold text-slate-700 text-center">
                  <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} w-12`}>ลำดับ</th>
                  <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-left`}>รายการพัสดุ / ครุภัณฑ์</th>
                  <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} w-32`}>รหัสทะเบียนทรัพย์สิน</th>
                  <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} w-16`}>จำนวน</th>
                  <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} w-16`}>หน่วยนับ</th>
                  <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} w-24`}>สภาพก่อนยืม</th>
                </tr>
              </thead>
              <tbody>
                {request.items?.map((item, idx) => (
                  <tr key={item.assetId} className="text-slate-800">
                    <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-center`}>{idx + 1}</td>
                    <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} font-medium`}>{item.assetName}</td>
                    <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-center font-mono text-[11px]`}>{item.assetCode}</td>
                    <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-center font-bold`}>{item.requestedQty}</td>
                    <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-center`}>{item.unit}</td>
                    <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-center text-emerald-700 font-medium`}>ปกติ / สมบูรณ์</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Terms & Signatures */}
          <div className="space-y-1.5 pt-0.5">
            <div className="text-[11px] text-slate-600 bg-slate-50 p-1.5 rounded border border-slate-200 leading-normal">
              <strong className="text-slate-800">คำรับรองของผู้ยืม:</strong> ข้าพเจ้าขอรับรองว่าจะนำพัสดุตามรายการข้างต้นไปใช้ตามวัตถุประสงค์ที่ระบุไว้ และจะส่งคืนตามกำหนดเวลาในสภาพเรียบร้อย หากเกิดการชำรุด เสียหาย หรือสูญหาย ข้าพเจ้ายินยอมชดใช้ค่าเสียหายหรือซ่อมแซมให้อยู่ในสภาพเดิมทุกประการ
            </div>

            {/* 3 Signatures Columns */}
            <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
              <div className="space-y-1">
                <p className="font-semibold text-slate-800">ลงชื่อผู้ขอยืม</p>
                {request.borrowerSignature ? (
                  <img
                    src={request.borrowerSignature}
                    alt="Borrower Signature"
                    className={`${isCompactLayout ? 'h-6' : 'h-7'} mx-auto object-contain`}
                  />
                ) : (
                  <div className={`border-b border-dotted border-slate-400 w-28 mx-auto ${isCompactLayout ? 'h-6' : 'h-7'}`} />
                )}
                <div>
                  <p className="text-slate-800 font-medium">({request.borrowerName})</p>
                  <p className="text-[10px] text-slate-500">ผู้ยื่นคำขอยืม</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-800">ลงชื่อเจ้าหน้าที่พัสดุ</p>
                {request.officerSignature ? (
                  <img
                    src={request.officerSignature}
                    alt="Officer Signature"
                    className={`${isCompactLayout ? 'h-6' : 'h-7'} mx-auto object-contain`}
                  />
                ) : (
                  <div className={`border-b border-dotted border-slate-400 w-28 mx-auto ${isCompactLayout ? 'h-6' : 'h-7'}`} />
                )}
                <div>
                  <p className="text-slate-800 font-medium">({supplyOfficerDisplayName})</p>
                  <p className="text-[10px] text-slate-500">{orgSettings.supplyOfficerPosition || 'เจ้าหน้าที่พัสดุผู้ตรวจสอบ'}</p>
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-semibold text-slate-800">ลงชื่อผู้อนุมัติ</p>
                {request.approverSignature ? (
                  <img
                    src={request.approverSignature}
                    alt="Approver Signature"
                    className={`${isCompactLayout ? 'h-6' : 'h-7'} mx-auto object-contain`}
                  />
                ) : (
                  <div className={`border-b border-dotted border-slate-400 w-28 mx-auto ${isCompactLayout ? 'h-6' : 'h-7'}`} />
                )}
                <div>
                  <p className="text-slate-800 font-medium">({mayorDisplayName})</p>
                  <p className="text-[10px] text-slate-500">{orgSettings.mayorPosition || `นายก ${orgSettings.orgName}`}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* SECTION 2: PERFORATED CUTTING LINE (ใบฉีกส่วนท้าย) */}
        <div className={`relative ${isCompactLayout ? 'my-2' : 'my-2.5'} text-center select-none`}>
          <div className="border-t-2 border-dashed border-amber-600/70 w-full absolute top-1/2" />
          <span className="relative bg-white px-3 text-[11px] font-bold text-amber-950 inline-flex items-center gap-1.5 border border-amber-300 rounded-full py-0.5 shadow-2xs">
            <Scissors className="w-3.5 h-3.5 transform -rotate-90 text-amber-700" />
            <span>ส่วนฉีก: ใบนัดส่งคืนและหลักฐานรับคืนทรัพย์สิน (สำหรับผู้ยืมถือไว้เพื่อนำมาส่งคืน)</span>
            <Scissors className="w-3.5 h-3.5 transform rotate-90 text-amber-700" />
          </span>
        </div>

        {/* SECTION 3: TEAR-OFF SLIP (FOR CITIZEN TO KEEP AND PRESENT ON RETURN) */}
        <div className={`border-2 border-amber-500 bg-amber-50/50 rounded-xl ${isCompactLayout ? 'p-2.5 space-y-1.5' : 'p-3 space-y-2'} shadow-xs`}>
          
          {/* Header Bar */}
          <div className="flex flex-wrap sm:flex-nowrap justify-between items-center gap-2 border-b border-amber-200/80 pb-1.5">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-amber-600 text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                ฉีก
              </div>
              <h3 className="font-bold text-xs sm:text-[13px] text-amber-950 whitespace-nowrap">
                {orgSettings.orgName} — ใบนัดส่งคืน & หลักฐานตรวจรับคืน
              </h3>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="bg-amber-200/90 text-amber-950 text-xs px-2.5 py-0.5 rounded-md font-mono font-bold whitespace-nowrap border border-amber-300">
                คิว: {request.queueNumber}
              </span>
              <span className="text-xs text-slate-700 whitespace-nowrap">
                เลขที่: <strong className="font-mono font-bold text-slate-950">{request.requestNumber}</strong>
              </span>
            </div>
          </div>

          {/* Details & Info Block */}
          <div className="space-y-1.5 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 bg-white/70 p-2 rounded-lg border border-amber-200/60">
              <div>
                <span className="font-semibold text-slate-600">ผู้ยืม: </span>
                <span className="font-bold text-slate-900">{request.borrowerName}</span>
                <span className="text-slate-500 text-[11px]"> (โทร: {request.borrowerPhone})</span>
              </div>
              <div>
                <span className="font-semibold text-slate-600">สถานที่ส่งคืน: </span>
                <span className="font-bold text-slate-900">{orgSettings.returnLocationDefault}</span>
              </div>
              <div className="sm:col-span-2 pt-0.5 border-t border-amber-100/80">
                <span className="font-semibold text-slate-700">รายการที่ยืมทั้งหมด ({itemsCount} รายการ): </span>
                <span className="text-slate-900 font-medium leading-relaxed">
                  {request.items?.map((i, idx) => (
                    <span key={i.assetId || idx} className="inline-block mr-2">
                      <span className="text-amber-800 font-semibold">{idx + 1}.</span> {i.assetName} <strong className="text-blue-900">({i.requestedQty} {i.unit})</strong>
                      {idx < (request.items?.length || 0) - 1 ? ' • ' : ''}
                    </span>
                  ))}
                </span>
              </div>
            </div>

            {/* High-Contrast Due Date Callout Banner */}
            <div className="bg-gradient-to-r from-red-700 via-red-600 to-red-700 text-white rounded-lg px-3 py-1.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <span className="text-[11px] uppercase font-bold tracking-wider text-red-200">
                  กำหนดส่งคืน:
                </span>
                <span className="text-xs sm:text-sm font-black text-white">
                  วันที่ {formatThaiDate(request.dueDate)}
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] text-red-200">เวลาส่งคืน:</span>
                <span className="text-xs sm:text-sm font-bold text-amber-300 font-mono">{request.dueTime} น.</span>
              </div>
            </div>

            {/* QR Code & Authorized Return Receiver Single Signatory Card */}
            <div className="grid grid-cols-12 gap-3 items-center bg-white p-2.5 rounded-xl border border-amber-300 shadow-2xs">
              
              {/* QR Code (Left) */}
              <div className="col-span-4 sm:col-span-3 flex flex-col items-center justify-center p-1.5 bg-amber-50/50 border border-amber-200 rounded-lg text-center">
                <QRCodeSVG value={qrVerificationData} size={isCompactLayout ? 56 : 64} level="M" />
                <p className="text-[9px] font-bold text-slate-800 font-mono mt-1">
                  สแกนตรวจ/รับคืน
                </p>
                <p className="text-[8px] text-slate-500 font-mono">
                  {request.queueNumber}
                </p>
              </div>

              {/* Single Authorized Return Officer Signatory (Right) */}
              <div className="col-span-8 sm:col-span-9 text-center space-y-1 pl-2 border-l border-amber-200">
                <p className="font-bold text-slate-900 text-xs sm:text-[13px]">
                  เจ้าหน้าที่ผู้ตรวจรับคืน / ผู้มีอำนาจอนุมัติรับคืน
                </p>
                
                {request.returnOfficerSignature ? (
                  <img
                    src={request.returnOfficerSignature}
                    alt="Return Officer Signature"
                    className="h-7 mx-auto object-contain my-0.5"
                  />
                ) : (
                  <div className="border-b border-dotted border-slate-400 w-48 sm:w-56 mx-auto h-5 my-0.5" />
                )}

                <div className="space-y-0.5 leading-tight">
                  <p className="text-slate-900 font-bold text-xs">
                    ( {supplyOfficerDisplayName} )
                  </p>
                  <p className="text-[10.5px] text-slate-600 font-medium">
                    {orgSettings.supplyOfficerPosition || 'เจ้าหน้าที่พัสดุผู้ตรวจรับคืน'}
                  </p>
                  <p className="text-[10px] text-slate-500 pt-0.5">
                    วันที่ตรวจรับคืน: {request.actualReturnDate ? formatThaiDate(request.actualReturnDate) : 'วันที่ ........./........./.........'}
                  </p>
                </div>
              </div>

            </div>
          </div>

          {/* Footer Notice */}
          <div className="text-[10px] text-amber-950/80 pt-1 border-t border-amber-200/80 flex items-center justify-between">
            <span>* กรุณานำใบฉีกนี้พร้อมพัสดุมาส่งคืน ณ อาคารพัสดุตามวันเวลาที่กำหนด</span>
            <span className="font-mono text-[9px] text-slate-500">ระบบบริการยืมพัสดุ {orgSettings.orgName}</span>
          </div>

        </div>

      </div>
    </div>
  );
};
