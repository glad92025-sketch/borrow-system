import React, { useState } from 'react';
import { Printer, ArrowLeft, CheckCircle2, ShieldCheck, X, ExternalLink, FileDown, Loader2 } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { BorrowRequest, OrgSettings } from '../../types';
import { formatThaiDate } from '../../utils/formatters';
import { useApp } from '../../context/AppContext';
import { printElementById, openPrintableTab } from '../../utils/printHelper';
import { exportElementToPdf } from '../../utils/pdfHelper';

interface OfficialReturnReceiptProps {
  request?: BorrowRequest | null;
  borrowRequest?: BorrowRequest | null;
  orgSettings?: OrgSettings;
  onBack?: () => void;
  onClose?: () => void;
}

export const OfficialReturnReceipt: React.FC<OfficialReturnReceiptProps> = ({
  request: propRequest,
  borrowRequest: propBorrowRequest,
  orgSettings: propOrgSettings,
  onBack,
  onClose,
}) => {
  const context = useApp();
  const orgSettings = propOrgSettings || context.orgSettings;
  const request = propRequest || propBorrowRequest || context.borrowRequests[0];
  const [printStatus, setPrintStatus] = useState<string | null>(null);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleClose = onBack || onClose;

  const handlePrint = () => {
    setPrintStatus('กำลังสั่งพิมพ์...');
    const success = printElementById('printable-return-receipt', `ใบเสร็จรับคืนพัสดุ_${request?.requestNumber || 'receipt'}`);
    setTimeout(() => {
      setPrintStatus(success ? 'ส่งคำสั่งพิมพ์เรียบร้อย' : 'หากหน้าต่างไม่เปิด กรุณาคลิกปุ่มเปิดแท็บใหม่');
      setTimeout(() => setPrintStatus(null), 4000);
    }, 500);
  };

  const handleOpenNewTab = () => {
    openPrintableTab('printable-return-receipt', `ใบเสร็จรับคืนพัสดุ_${request?.requestNumber || 'receipt'}`);
  };

  const handleExportPdf = async () => {
    if (!request) return;
    setIsExportingPdf(true);
    setPrintStatus('กำลังแปลงเอกสารเป็นไฟล์ PDF (A4 พอดีหน้า)...');
    try {
      const success = await exportElementToPdf('printable-return-receipt', {
        filename: `ใบเสร็จรับคืน_${request.requestNumber || 'receipt'}.pdf`,
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
        <p>ไม่พบข้อมูลคำขอยืมสำหรับแสดงใบรับคืน</p>
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

  const cleanName = (name?: string) => {
    if (!name) return '';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

  const supplyOfficerDisplayName = cleanName(orgSettings.supplyOfficerName) || 'นายสุรชัย ธรรมดา';

  return (
    <div className="space-y-4">
      {/* Top Action Bar */}
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
              เอกสารราชการ: ใบรับคืนพัสดุ ครุภัณฑ์ ทรัพย์สิน อบต. (A4 Return Receipt)
            </h2>
            <p className="text-xs text-slate-500">
              เลขที่ {request.requestNumber} | ผู้คืน {request.borrowerName} ({itemsCount} รายการ)
            </p>
          </div>
        </div>

        <div className="flex items-center flex-wrap gap-2">
          {printStatus && (
            <span className="text-xs font-medium px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg border border-emerald-200 animate-fadeIn flex items-center gap-1">
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
            className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 active:bg-emerald-950 text-white text-xs font-semibold rounded-lg shadow-sm flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            พิมพ์ใบรับคืน A4
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

      {/* Printable Sheet (A4 proportions) */}
      <div 
        id="printable-return-receipt"
        className={`bg-white mx-auto w-full max-w-[210mm] border border-slate-300 shadow-lg ${isCompactLayout ? 'p-4 sm:p-6' : 'p-6 sm:p-8 md:p-10'} text-slate-900 print-page-sheet print:border-none print:shadow-none print:p-0 print:m-0 print:max-w-none ${isCompactLayout ? 'space-y-2.5' : 'space-y-3.5'} text-xs leading-normal`}
      >
        
        {/* Header */}
        <div className="text-center space-y-0.5">
          <div className={`${isCompactLayout ? 'w-12 h-12 mb-0.5' : 'w-14 h-14 mb-1'} mx-auto flex items-center justify-center`}>
            {orgSettings.logoUrl ? (
              <img
                src={orgSettings.logoUrl}
                alt="ตรา อบต."
                className={`${isCompactLayout ? 'w-12 h-12' : 'w-14 h-14'} object-contain rounded-full border border-slate-300 p-0.5`}
              />
            ) : (
              <div className={`${isCompactLayout ? 'w-12 h-12 text-lg' : 'w-14 h-14 text-xl'} rounded-full border-2 border-emerald-900 flex items-center justify-center text-emerald-900 font-serif font-black`}>
                อบต.
              </div>
            )}
          </div>
          <h1 className={`${isCompactLayout ? 'text-sm sm:text-base' : 'text-base sm:text-lg'} font-bold text-slate-900 tracking-wide`}>
            {orgSettings.orgName} {orgSettings.amphoe} {orgSettings.province}
          </h1>
          <h2 className={`${isCompactLayout ? 'text-xs sm:text-sm' : 'text-sm sm:text-base'} font-bold text-emerald-900`}>
            ใบเสร็จรับคืนและใบรับรองผลการตรวจสอบสภาพพัสดุ/ครุภัณฑ์
          </h2>
          <p className="text-[11px] text-slate-500">
            กองคลัง งานพัสดุและทรัพย์สิน • เอกสารออกเป็นหลักฐานการส่งคืนสมบูรณ์
          </p>
        </div>

        {/* Reference Box */}
        <div className={`border border-emerald-200 bg-emerald-50/50 rounded-lg ${isCompactLayout ? 'p-2 text-xs' : 'p-2.5 text-xs sm:text-[12.5px]'} flex flex-wrap justify-between items-center gap-2`}>
          <div>
            <span className="text-slate-600">อ้างถึงคำขอยืมเลขที่: </span>
            <strong className="font-mono text-slate-900">{request.requestNumber}</strong>
          </div>
          <div>
            <span className="text-slate-600">หมายเลขคิว: </span>
            <strong className="font-mono text-emerald-900 bg-emerald-100 px-2 py-0.5 rounded">{request.returnQueueNumber || request.queueNumber}</strong>
          </div>
          <div>
            <span className="text-slate-600">วันที่ตรวจรับคืน: </span>
            <strong className="text-slate-900">{formatThaiDate(request.actualReturnDate || new Date().toISOString().split('T')[0])}</strong>
          </div>
        </div>

        {/* Borrower info */}
        <div className={`border border-slate-300 rounded-lg ${isCompactLayout ? 'p-2 space-y-0.5 text-xs' : 'p-2.5 space-y-1 text-xs sm:text-[12.5px]'}`}>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
            <div>
              <span className="font-semibold text-slate-600">ผู้ส่งคืนพัสดุ: </span>
              <span className="font-bold text-slate-900">{request.borrowerName}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-600">โทรศัพท์: </span>
              <span className="font-mono">{request.borrowerPhone}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-600">ประเภท: </span>
              <span>{request.borrowerType === 'citizen' ? 'ประชาชนทั่วไป' : 'พนักงาน อบต.'}</span>
            </div>
            <div>
              <span className="font-semibold text-slate-600">หน่วยงาน/ที่อยู่: </span>
              <span className="truncate">{request.borrowerDepartmentOrMoo}</span>
            </div>
          </div>
        </div>

        {/* Items returned & condition */}
        <div className="space-y-0.5">
          <h3 className="font-bold text-xs sm:text-[12.5px] text-slate-800">
            รายการพัสดุ ครุภัณฑ์ ที่รับคืนและผลการตรวจสภาพ:
          </h3>
          <table className="w-full text-xs sm:text-[12px] border-collapse border border-slate-300">
            <thead>
              <tr className="bg-slate-100 font-semibold text-slate-700 text-center">
                <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} w-12`}>ลำดับ</th>
                <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-left`}>รายการพัสดุ</th>
                <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} w-32`}>รหัสครุภัณฑ์</th>
                <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} w-20`}>จำนวน</th>
                <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} w-32`}>สภาพการส่งคืน</th>
                <th className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'}`}>หมายเหตุ</th>
              </tr>
            </thead>
            <tbody>
              {request.items?.map((item, idx) => (
                <tr key={item.assetId}>
                  <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-center`}>{idx + 1}</td>
                  <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} font-medium`}>{item.assetName}</td>
                  <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-center font-mono text-[11px]`}>{item.assetCode}</td>
                  <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-center font-bold`}>{item.requestedQty} {item.unit}</td>
                  <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-center`}>
                    <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      สมบูรณ์ครบถ้วน
                    </span>
                  </td>
                  <td className={`border border-slate-300 ${isCompactLayout ? 'p-1' : 'p-1.5'} text-slate-500 text-center`}>-</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Certificate text */}
        <div className="bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px] text-slate-700 leading-normal">
          <strong>หนังสือรับรอง:</strong> เจ้าหน้าที่พัสดุได้ทำการตรวจสอบและตรวจรับพัสดุตามรายการข้างต้นครบถ้วนเรียบร้อยแล้ว พัสดุอยู่ในสภาพสมบูรณ์พร้อมจัดเก็บเข้าคลัง หรือมีการดำเนินการกรณีชำรุดตามระเบียบเรียบร้อยแล้ว จึงออกใบรับคืนฉบับนี้ไว้เป็นหลักฐานเพื่อปลดภาระความรับผิดชอบของผู้ยืม
        </div>

        {/* Signatures */}
        <div className="grid grid-cols-2 gap-8 pt-2 text-center text-xs">
          <div className="space-y-1">
            <p className="font-semibold text-slate-800">ลงชื่อผู้ส่งคืนพัสดุ</p>
            {request.returnBorrowerSignature ? (
              <img
                src={request.returnBorrowerSignature}
                alt="Return Borrower Signature"
                className={`${isCompactLayout ? 'h-7' : 'h-8'} mx-auto object-contain`}
              />
            ) : (
              <div className={`border-b border-dotted border-slate-400 w-36 mx-auto ${isCompactLayout ? 'h-7' : 'h-8'}`} />
            )}
            <div>
              <p className="text-slate-800 font-medium">({request.borrowerName})</p>
              <p className="text-[10px] text-slate-500">ผู้ส่งคืน</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="font-semibold text-slate-800">ลงชื่อเจ้าหน้าที่พัสดุผู้ตรวจรับคืน</p>
            {request.returnOfficerSignature ? (
              <img
                src={request.returnOfficerSignature}
                alt="Return Officer Signature"
                className={`${isCompactLayout ? 'h-7' : 'h-8'} mx-auto object-contain`}
              />
            ) : (
              <div className={`border-b border-dotted border-slate-400 w-36 mx-auto ${isCompactLayout ? 'h-7' : 'h-8'}`} />
            )}
            <div>
              <p className="text-slate-800 font-medium">({supplyOfficerDisplayName})</p>
              <p className="text-[10px] text-slate-500">{orgSettings.supplyOfficerPosition || 'เจ้าหน้าที่พัสดุผู้ตรวจรับ'}</p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
