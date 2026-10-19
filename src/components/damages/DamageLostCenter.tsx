import React, { useState } from 'react';
import {
  AlertTriangle,
  FileQuestion,
  Search,
  CheckCircle2,
  DollarSign,
  FileText,
  ShieldAlert,
  Wrench,
  X,
  ExternalLink,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { DamageCase, LostCase } from '../../types';
import { formatBaht, formatThaiDate } from '../../utils/formatters';

export const DamageLostCenter: React.FC = () => {
  const { damageCases, lostCases, settleDamageCase, settleLostCase } = useApp();

  const [activeTab, setActiveTab] = useState<'damages' | 'losts'>('damages');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDamageToSettle, setSelectedDamageToSettle] = useState<DamageCase | null>(null);
  const [receiptNumber, setReceiptNumber] = useState('REC-2569-0015');

  const filteredDamages = damageCases.filter((d) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      d.caseNumber.toLowerCase().includes(q) ||
      d.assetName.toLowerCase().includes(q) ||
      d.borrowerName.toLowerCase().includes(q) ||
      d.damageDescription.toLowerCase().includes(q)
    );
  });

  const filteredLosts = lostCases.filter((l) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      l.caseNumber.toLowerCase().includes(q) ||
      l.assetName.toLowerCase().includes(q) ||
      l.borrowerName.toLowerCase().includes(q) ||
      l.policeReportNumber?.toLowerCase().includes(q)
    );
  });

  const handleSettleDamage = () => {
    if (!selectedDamageToSettle) return;
    settleDamageCase(
      selectedDamageToSettle.id,
      selectedDamageToSettle.estimatedRepairCostBaht,
      `ชำระค่าซ่อมแซมครบถ้วนตามใบเสร็จ ${receiptNumber}`
    );
    setSelectedDamageToSettle(null);
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            การจัดการกรณีพัสดุชำรุดและสูญหาย (Damage & Lost Cases)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            ติดตามประเมินค่าซ่อมแซม หนังสือแจ้งความ สภ. การชดใช้ค่าสินไหมทดแทน และการส่งซ่อมบำรุง
          </p>
        </div>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveTab('damages')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'damages' ? 'bg-red-700 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            <Wrench className="w-3.5 h-3.5" />
            <span>กรณีชำรุด / ส่งซ่อม ({damageCases.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('losts')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-bold transition-all flex items-center gap-1.5 ${
              activeTab === 'losts' ? 'bg-red-700 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            <FileQuestion className="w-3.5 h-3.5" />
            <span>กรณีสูญหาย / แจ้งความ ({lostCases.length})</span>
          </button>
        </div>

        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาเลขที่เคส, ชื่อพัสดุ, ผู้ยืม, สภ..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg"
          />
        </div>
      </div>

      {/* Damage Cases Table */}
      {activeTab === 'damages' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-32">เลขที่เคสชำรุด</th>
                  <th className="p-3">พัสดุ / ครุภัณฑ์</th>
                  <th className="p-3">ผู้ยืมผู้รับผิดชอบ</th>
                  <th className="p-3">ลักษณะความเสียหาย</th>
                  <th className="p-3 w-28 text-right">ค่าประเมิน (บาท)</th>
                  <th className="p-3 w-32 text-center">สถานะชดใช้</th>
                  <th className="p-3 w-28 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredDamages.map((d) => (
                  <tr key={d.id} className="hover:bg-slate-50 transition-colors">
                    
                    <td className="p-3 font-mono font-bold text-red-950">
                      {d.caseNumber}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {formatThaiDate(d.reportedDate, 'short')}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-900">{d.assetName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{d.assetCode}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{d.borrowerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{d.borrowRequestNumber}</div>
                    </td>

                    <td className="p-3 text-slate-700 max-w-xs">
                      {d.damageDescription}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-slate-900">
                      {formatBaht(d.estimatedRepairCostBaht)}
                    </td>

                    <td className="p-3 text-center">
                      {d.compensationStatus === 'paid' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold text-[11px]">
                          ชำระครบแล้ว
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                          รอชำระ {formatBaht(d.estimatedRepairCostBaht)} บ.
                        </span>
                      )}
                    </td>

                    <td className="p-3 text-center">
                      {d.compensationStatus !== 'paid' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedDamageToSettle(d)}
                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[11px] font-bold transition-colors mx-auto"
                        >
                          บันทึกรับเงิน
                        </button>
                      ) : (
                        <span className="text-slate-400 text-[11px]">ปิดเรื่องแล้ว</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lost Cases Table */}
      {activeTab === 'losts' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-32">เลขที่เคสสูญหาย</th>
                  <th className="p-3">พัสดุที่สูญหาย</th>
                  <th className="p-3">ผู้ยืมผู้รับผิดชอบ</th>
                  <th className="p-3 w-40">เลขบันทึกแจ้งความ สภ.</th>
                  <th className="p-3 w-28 text-right">มูลค่าชดใช้ (บาท)</th>
                  <th className="p-3 w-32 text-center">สถานะชดใช้</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLosts.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50 transition-colors">
                    
                    <td className="p-3 font-mono font-bold text-red-950">
                      {l.caseNumber}
                      <div className="text-[10px] text-slate-400 font-normal">
                        {formatThaiDate(l.reportedDate, 'short')}
                      </div>
                    </td>

                    <td className="p-3">
                      <div className="font-bold text-slate-900">{l.assetName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{l.assetCode}</div>
                    </td>

                    <td className="p-3">
                      <div className="font-semibold text-slate-800">{l.borrowerName}</div>
                      <div className="text-[10px] text-slate-500 font-mono">{l.borrowRequestNumber}</div>
                    </td>

                    <td className="p-3 text-slate-700 font-mono text-[11px]">
                      {l.policeReportNumber || 'อยู่ระหว่างดำเนินคดี'}
                    </td>

                    <td className="p-3 text-right font-mono font-bold text-red-700">
                      {formatBaht(l.compensationDueBaht)}
                    </td>

                    <td className="p-3 text-center">
                      <span className="bg-red-50 text-red-700 border border-red-200 px-2 py-0.5 rounded-full font-bold text-[11px]">
                        {l.compensationStatus === 'closed' ? 'ชดใช้ครบถ้วน' : 'อยู่ระหว่างชดใช้'}
                      </span>
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Settle Damage Modal */}
      {selectedDamageToSettle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                บันทึกการชดใช้ค่าเสียหายพัสดุ
              </h3>
              <button
                onClick={() => setSelectedDamageToSettle(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-xs text-amber-950 space-y-1">
              <div>เคส: <strong>{selectedDamageToSettle.caseNumber}</strong></div>
              <div>พัสดุ: <strong>{selectedDamageToSettle.assetName}</strong></div>
              <div>ผู้ยืม: <strong>{selectedDamageToSettle.borrowerName}</strong></div>
              <div className="font-bold text-sm text-red-700 pt-1">
                ยอดเงินที่ต้องชำระ: {formatBaht(selectedDamageToSettle.estimatedRepairCostBaht)} บาท
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขที่ใบเสร็จรับเงิน อบต.ฝางคำ
                </label>
                <input
                  type="text"
                  value={receiptNumber}
                  onChange={(e) => setReceiptNumber(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedDamageToSettle(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleSettleDamage}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                ยืนยันการรับชำระเงิน
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
