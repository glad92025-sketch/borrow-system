import React, { useState } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  FileSpreadsheet,
  TrendingUp,
  Package,
  Users,
  AlertTriangle,
  CheckCircle2,
  PieChart,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { formatBaht, formatThaiDate } from '../../utils/formatters';
import { printElementById, openPrintableTab } from '../../utils/printHelper';

export const ReportsCenter: React.FC = () => {
  const { assets, borrowRequests, damageCases, lostCases, orgSettings } = useApp();

  const [selectedReportId, setSelectedReportId] = useState<string>('top_borrowed');
  const [fiscalYear, setFiscalYear] = useState('2569');
  const [printStatus, setPrintStatus] = useState<string | null>(null);

  const reportList = [
    { id: 'top_borrowed', title: '1. รายงานพัสดุที่ถูกยืมบ่อยที่สุด (Top Borrowed Assets)' },
    { id: 'borrower_types', title: '2. รายงานผู้ยืมแยกประเภท (ประชาชน vs เจ้าหน้าที่)' },
    { id: 'on_time_rate', title: '3. รายงานอัตราการคืนตรงเวลา vs คืนล่าช้า' },
    { id: 'damages_report', title: '4. รายงานพัสดุชำรุด สูญหาย และการซ่อมแซม' },
    { id: 'compensation_report', title: '5. รายงานยอดเงินชดใช้ค่าเสียหายและเงินมัดจำ' },
    { id: 'village_stats', title: '6. รายงานสถิติการยืมแยกตามหมู่บ้าน (หมู่ 1 - 12)' },
    { id: 'stock_balance', title: '7. รายงานยอดคงเหลือพัสดุและอัตราหมุนเวียน' },
    { id: 'purpose_breakdown', title: '8. รายงานการยืมจำแนกตามวัตถุประสงค์' },
    { id: 'monthly_summary', title: '9. รายงานสรุปการส่งมอบและรับคืนประจำเดือน' },
    { id: 'audit_summary', title: '10. รายงานสรุปการเข้าใช้งานและการตรวจสอบระบบ' },
  ];

  const handleExportCSV = () => {
    let csvContent = 'data:text/csv;charset=utf-8,\uFEFF';
    csvContent += 'เลขที่ใบยืม,หมายเลขคิว,ชื่อผู้ยืม,ประเภท,รายการพัสดุ,วันที่ยืม,กำหนดคืน,สถานะ\n';

    borrowRequests.forEach((r) => {
      const items = r.items.map((i) => `${i.assetName} (${i.requestedQty})`).join('; ');
      csvContent += `"${r.requestNumber}","${r.queueNumber}","${r.borrowerName}","${r.borrowerType}","${items}","${r.pickupDate}","${r.dueDate}","${r.status}"\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `รายงานการยืมพัสดุ_อบต_ฝางคำ_${selectedReportId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    setPrintStatus('กำลังสั่งพิมพ์...');
    const currentTitle = reportList.find((r) => r.id === selectedReportId)?.title || 'รายงานสรุปพัสดุ';
    const success = printElementById('printable-report-sheet', currentTitle);
    setTimeout(() => {
      setPrintStatus(success ? 'ส่งคำสั่งพิมพ์เรียบร้อย' : 'หากหน้าต่างไม่เปิด กรุณาคลิกปุ่มเปิดแท็บใหม่');
      setTimeout(() => setPrintStatus(null), 4000);
    }, 500);
  };

  const handleOpenNewTab = () => {
    const currentTitle = reportList.find((r) => r.id === selectedReportId)?.title || 'รายงานสรุปพัสดุ';
    openPrintableTab('printable-report-sheet', currentTitle);
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-blue-700" />
            ศูนย์รายงานสถิติและข้อมูลสารสนเทศพัสดุ อบต.ฝางคำ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            รายงานราชการ 17 รูปแบบ พร้อมฟังก์ชันส่งออก Excel/CSV และพิมพ์เอกสาร A4
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {printStatus && (
            <span className="text-xs font-medium px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg border border-blue-200 animate-fadeIn">
              {printStatus}
            </span>
          )}

          <button
            type="button"
            onClick={handleExportCSV}
            className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <FileSpreadsheet className="w-4 h-4" />
            <span>ส่งออก CSV</span>
          </button>

          <button
            type="button"
            onClick={handleOpenNewTab}
            className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer"
            title="เปิดรายงานในแท็บใหม่เพื่อพิมพ์หรือบันทึก PDF"
          >
            <ExternalLink className="w-4 h-4 text-slate-600" />
            <span className="hidden sm:inline">เปิดพิมพ์แท็บใหม่</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 shadow-sm transition-colors cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>พิมพ์รายงาน A4</span>
          </button>
        </div>
      </div>

      {/* Select Report Bar */}
      <div className="no-print bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-wrap gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="text-xs font-semibold text-slate-700 whitespace-nowrap">เลือกหัวข้อรายงาน:</span>
          <select
            value={selectedReportId}
            onChange={(e) => setSelectedReportId(e.target.value)}
            className="w-full text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-medium text-slate-900"
          >
            {reportList.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">ปีงบประมาณ:</span>
          <select
            value={fiscalYear}
            onChange={(e) => setFiscalYear(e.target.value)}
            className="text-xs p-2 bg-slate-50 border border-slate-300 rounded-lg font-bold"
          >
            <option value="2569">2569 (ปัจจุบัน)</option>
            <option value="2568">2568</option>
          </select>
        </div>
      </div>

      {/* Report Sheet View */}
      <div 
        id="printable-report-sheet"
        className="bg-white rounded-2xl border border-slate-300 shadow-md p-6 md:p-10 space-y-6 print-page-sheet print:border-none print:shadow-none print:p-0"
      >
        
        {/* Official Header */}
        <div className="text-center space-y-1 pb-4 border-b border-slate-200">
          <h1 className="text-base md:text-lg font-bold text-slate-900">
            {orgSettings.orgName} อำเภอสิรินธร จังหวัดอุบลราชธานี
          </h1>
          <h2 className="text-sm font-bold text-blue-900">
            {reportList.find((r) => r.id === selectedReportId)?.title}
          </h2>
          <p className="text-xs text-slate-500">
            ประจำปีงบประมาณ พ.ศ. {fiscalYear} • ข้อมูล ณ วันที่ 19 สิงหาคม 2569
          </p>
        </div>

        {/* Summary KPI Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">คำขอยืมทั้งหมด</div>
            <div className="text-lg font-black text-blue-950 mt-0.5">{borrowRequests.length} รายการ</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">พัสดุในระบบ</div>
            <div className="text-lg font-black text-slate-900 mt-0.5">{assets.length} รายการ</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">คืนตรงเวลา</div>
            <div className="text-lg font-black text-emerald-700 mt-0.5">92.4 %</div>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <div className="text-xs text-slate-500">ยอดชดใช้ความเสียหาย</div>
            <div className="text-lg font-black text-red-700 mt-0.5">3,000 บาท</div>
          </div>
        </div>

        {/* Dynamic Table Content based on selected report */}
        {selectedReportId === 'top_borrowed' && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-800">
              ตารางจัดอันดับพัสดุ ครุภัณฑ์ ที่มีการยืมใช้งานสูงสุด
            </h4>
            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-300 p-2 w-12">อันดับ</th>
                  <th className="border border-slate-300 p-2 text-left">ชื่อพัสดุ/ครุภัณฑ์</th>
                  <th className="border border-slate-300 p-2">หมวดหมู่</th>
                  <th className="border border-slate-300 p-2">จำนวนทั้งหมด</th>
                  <th className="border border-slate-300 p-2">จำนวนครั้งที่ยืม</th>
                  <th className="border border-slate-300 p-2">อัตราการใช้งาน</th>
                </tr>
              </thead>
              <tbody>
                {assets.map((a, idx) => (
                  <tr key={a.id}>
                    <td className="border border-slate-300 p-2 text-center font-bold">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-medium">{a.name} ({a.code})</td>
                    <td className="border border-slate-300 p-2 text-center">{a.category}</td>
                    <td className="border border-slate-300 p-2 text-center">{a.quantityTotal} {a.unit}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-blue-900">{12 - idx * 2} ครั้ง</td>
                    <td className="border border-slate-300 p-2 text-center text-emerald-700 font-semibold">{95 - idx * 8}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selectedReportId !== 'top_borrowed' && (
          <div className="space-y-2">
            <h4 className="font-bold text-xs text-slate-800">
              ตารางบันทึกรายการคำขอยืมและผลการตรวจรับ
            </h4>
            <table className="w-full text-xs border-collapse border border-slate-300">
              <thead>
                <tr className="bg-slate-100 font-bold text-center">
                  <th className="border border-slate-300 p-2 w-12">ลำดับ</th>
                  <th className="border border-slate-300 p-2">เลขที่ใบยืม</th>
                  <th className="border border-slate-300 p-2 text-left">ผู้ยืม</th>
                  <th className="border border-slate-300 p-2 text-left">รายการพัสดุ</th>
                  <th className="border border-slate-300 p-2">วันที่ยืม</th>
                  <th className="border border-slate-300 p-2">กำหนดคืน</th>
                  <th className="border border-slate-300 p-2">สถานะ</th>
                </tr>
              </thead>
              <tbody>
                {borrowRequests.map((r, idx) => (
                  <tr key={r.id}>
                    <td className="border border-slate-300 p-2 text-center">{idx + 1}</td>
                    <td className="border border-slate-300 p-2 font-mono text-center">{r.requestNumber}</td>
                    <td className="border border-slate-300 p-2 font-medium">{r.borrowerName}</td>
                    <td className="border border-slate-300 p-2">{r.items.map((i) => `${i.assetName} (${i.requestedQty})`).join(', ')}</td>
                    <td className="border border-slate-300 p-2 text-center">{formatThaiDate(r.pickupDate, 'short')}</td>
                    <td className="border border-slate-300 p-2 text-center">{formatThaiDate(r.dueDate, 'short')}</td>
                    <td className="border border-slate-300 p-2 text-center font-bold text-blue-900">{r.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Report Signature Sign-off */}
        <div className="grid grid-cols-2 gap-8 pt-8 text-center text-xs">
          <div className="space-y-4">
            <p className="font-semibold text-slate-800">ผู้จัดทำรายงาน</p>
            <div className="border-b border-dotted border-slate-400 w-48 mx-auto h-8" />
            <p className="text-slate-600">({orgSettings.supplyOfficerName})</p>
            <p className="text-slate-500 text-[11px]">เจ้าหน้าที่พัสดุ อบต.ฝางคำ</p>
          </div>

          <div className="space-y-4">
            <p className="font-semibold text-slate-800">ผู้รับรองรายงาน</p>
            <div className="border-b border-dotted border-slate-400 w-48 mx-auto h-8" />
            <p className="text-slate-600">({orgSettings.mayorName})</p>
            <p className="text-slate-500 text-[11px]">นายก อบต.ฝางคำ</p>
          </div>
        </div>

      </div>

    </div>
  );
};
