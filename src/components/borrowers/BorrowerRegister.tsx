import React, { useState } from 'react';
import {
  Users,
  Search,
  UserCheck,
  UserX,
  ShieldCheck,
  AlertTriangle,
  RotateCcw,
  CheckCircle2,
  DollarSign,
  Plus,
  X,
  Phone,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { CitizenBorrower, EmployeeBorrower } from '../../types';
import { formatBaht } from '../../utils/formatters';

export const BorrowerRegister: React.FC = () => {
  const { citizens, employees, settleBorrowerBlacklist, borrowRequests } = useApp();

  const [activeSubTab, setActiveSubTab] = useState<'citizens' | 'employees'>('citizens');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCitizenToSettle, setSelectedCitizenToSettle] = useState<CitizenBorrower | null>(null);
  const [settlementReceiptNo, setSettlementReceiptNo] = useState('REC-2569-0012');

  const filteredCitizens = citizens.filter((c) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      c.firstName.toLowerCase().includes(q) ||
      c.lastName.toLowerCase().includes(q) ||
      c.idCardNumber.includes(q) ||
      c.phone.includes(q) ||
      c.moo.toLowerCase().includes(q)
    );
  });

  const filteredEmployees = employees.filter((e) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      e.firstName.toLowerCase().includes(q) ||
      e.lastName.toLowerCase().includes(q) ||
      e.employeeCode.toLowerCase().includes(q) ||
      e.department.toLowerCase().includes(q) ||
      e.position.toLowerCase().includes(q)
    );
  });

  const handleConfirmSettlement = () => {
    if (!selectedCitizenToSettle) return;
    settleBorrowerBlacklist(
      selectedCitizenToSettle.id,
      selectedCitizenToSettle.unpaidCompensationBaht,
      `ชำระค่าเสียหายตามใบเสร็จรับเงิน ${settlementReceiptNo} ปลดล็อคสถานะแบล็คลิสต์เรียบร้อย`
    );
    setSelectedCitizenToSettle(null);
  };

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            ทะเบียนประวัติผู้ยืมพัสดุ อบต.ฝางคำ
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            รวบรวมประวัติประชาชนและเจ้าหน้าที่ อบต. ตรวจสอบสถิติการยืม ประวัติความเสียหาย และจัดการสถานะ Blacklist
          </p>
        </div>
      </div>

      {/* Tabs Bar & Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex flex-col sm:flex-row gap-3 items-center justify-between">
        
        {/* Switch Subtab */}
        <div className="flex bg-slate-100 p-0.5 rounded-xl border border-slate-200 text-xs w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setActiveSubTab('citizens')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'citizens' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            ประชาชนทั่วไป ({citizens.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('employees')}
            className={`flex-1 sm:flex-initial px-4 py-1.5 rounded-lg font-bold transition-all ${
              activeSubTab === 'employees' ? 'bg-blue-900 text-white shadow-xs' : 'text-slate-600'
            }`}
          >
            พนักงาน/เจ้าหน้าที่ อบต. ({employees.length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาชื่อ, เลขบัตร, เบอร์โทร, สำนัก/กอง..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
      </div>

      {/* Table: Citizens */}
      {activeSubTab === 'citizens' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3">ชื่อ-สกุล ผู้ยืม</th>
                  <th className="p-3 w-36">เลขประจำตัวประชาชน</th>
                  <th className="p-3 w-40">หมู่ที่ / ตำบล</th>
                  <th className="p-3 w-28">เบอร์โทรศัพท์</th>
                  <th className="p-3 w-24 text-center">ยืมทั้งหมด</th>
                  <th className="p-3 w-32 text-center">สถานะผู้ยืม</th>
                  <th className="p-3 w-32 text-center">การจัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredCitizens.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                    
                    {/* Name */}
                    <td className="p-3">
                      <div className="font-bold text-slate-900">
                        {c.prefix}{c.firstName} {c.lastName}
                      </div>
                      <div className="text-[11px] text-slate-500">
                        ยืมสำเร็จ {c.completedReturnsCount} ครั้ง | ชำรุด/สูญหาย {c.damageCasesCount} ครั้ง
                      </div>
                    </td>

                    {/* ID */}
                    <td className="p-3 font-mono text-slate-600">
                      {c.idCardNumber}
                    </td>

                    {/* Moo */}
                    <td className="p-3 text-slate-700">
                      {c.moo}
                    </td>

                    {/* Phone */}
                    <td className="p-3 font-mono text-slate-700">
                      {c.phone}
                    </td>

                    {/* Count */}
                    <td className="p-3 text-center font-bold text-blue-900">
                      {c.totalBorrowsCount} ครั้ง
                    </td>

                    {/* Status */}
                    <td className="p-3 text-center">
                      {c.status === 'active' ? (
                        <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full font-semibold text-[11px] inline-flex items-center gap-1">
                          <UserCheck className="w-3 h-3" />
                          ปกติ
                        </span>
                      ) : (
                        <span className="bg-red-50 text-red-700 border border-red-200 px-2.5 py-0.5 rounded-full font-bold text-[11px] inline-flex items-center gap-1">
                          <UserX className="w-3 h-3" />
                          ระงับสิทธิ์ (Blacklist)
                        </span>
                      )}
                    </td>

                    {/* Actions */}
                    <td className="p-3 text-center">
                      {c.status === 'blacklisted' ? (
                        <button
                          type="button"
                          onClick={() => setSelectedCitizenToSettle(c)}
                          className="px-2.5 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold rounded-lg text-[11px] flex items-center justify-center gap-1 transition-colors shadow-2xs mx-auto"
                        >
                          <DollarSign className="w-3 h-3" />
                          <span>ปลดล็อค/ชำระ</span>
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">ประวัติดี</span>
                      )}
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Table: Employees */}
      {activeSubTab === 'employees' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-3 w-28">รหัสพนักงาน</th>
                  <th className="p-3">ชื่อ-สกุล เจ้าหน้าที่</th>
                  <th className="p-3 w-48">สำนัก / กอง</th>
                  <th className="p-3 w-40">ตำแหน่ง</th>
                  <th className="p-3 w-32">เบอร์โทรศัพท์</th>
                  <th className="p-3 w-28 text-center">ยืมทั้งหมด</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredEmployees.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-50 transition-colors">
                    
                    <td className="p-3 font-mono font-bold text-blue-900">
                      {e.employeeCode}
                    </td>

                    <td className="p-3 font-bold text-slate-900">
                      {e.prefix}{e.firstName} {e.lastName}
                    </td>

                    <td className="p-3 text-slate-700 font-medium">
                      {e.department}
                    </td>

                    <td className="p-3 text-slate-600">
                      {e.position}
                    </td>

                    <td className="p-3 font-mono text-slate-600">
                      {e.phone}
                    </td>

                    <td className="p-3 text-center font-bold text-blue-950">
                      {e.totalBorrowsCount} ครั้ง
                    </td>

                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SETTLEMENT MODAL FOR BLACKLISTED CITIZEN */}
      {selectedCitizenToSettle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <h3 className="font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-600" />
                บันทึกการชดใช้ค่าเสียหาย & ปลดล็อคผู้ยืม
              </h3>
              <button
                onClick={() => setSelectedCitizenToSettle(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-red-50 border border-red-200 rounded-xl p-3.5 text-xs text-red-950 space-y-1">
              <div className="font-bold">
                ผู้ยืม: {selectedCitizenToSettle.prefix}{selectedCitizenToSettle.firstName} {selectedCitizenToSettle.lastName}
              </div>
              <div>หมู่ที่: {selectedCitizenToSettle.moo} | 📞 {selectedCitizenToSettle.phone}</div>
              <div className="font-bold text-sm text-red-700 pt-1">
                ยอดค้างชำระค่าเสียหาย: {formatBaht(selectedCitizenToSettle.unpaidCompensationBaht)} บาท
              </div>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  เลขที่ใบเสร็จรับเงิน อบต.ฝางคำ
                </label>
                <input
                  type="text"
                  value={settlementReceiptNo}
                  onChange={(e) => setSettlementReceiptNo(e.target.value)}
                  className="w-full p-2 bg-slate-50 border border-slate-300 rounded-lg font-mono font-bold"
                />
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-950 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>เมื่อบันทึกรับชำระแล้ว สถานะของผู้ยืมจะถูกปลดล็อคกลับมาเป็นปกติและสามารถยื่นขอยืมพัสดุได้ตามเดิม</span>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedCitizenToSettle(null)}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-semibold text-xs"
              >
                ยกเลิก
              </button>
              <button
                type="button"
                onClick={handleConfirmSettlement}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                ยืนยันการรับชำระและปลดล็อค
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
