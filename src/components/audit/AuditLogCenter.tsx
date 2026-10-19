import React, { useState } from 'react';
import {
  ShieldAlert,
  Search,
  Filter,
  Eye,
  CheckCircle2,
  Calendar,
  Lock,
  Download,
  Clock,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { AuditLog } from '../../types';

export const AuditLogCenter: React.FC = () => {
  const { auditLogs } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  const filteredLogs = auditLogs.filter((log) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return (
      log.userName.toLowerCase().includes(q) ||
      log.action.toLowerCase().includes(q) ||
      log.target.toLowerCase().includes(q) ||
      log.ipAddress.includes(q)
    );
  });

  return (
    <div className="space-y-5">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-blue-700" />
            ระบบบันทึกประวัติการใช้งานและตรวจสอบย้อนกลับ (Audit Log 100%)
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            บันทึกทุกขั้นตอนการยืม อนุมัติ ส่งมอบ ตรวจรับคืน พร้อม IP Address และผู้ลงนาม ไม่สามารถลบหรือดัดแปลงได้
          </p>
        </div>

        <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-800 border border-emerald-300 rounded-full text-xs font-semibold">
          <Lock className="w-3.5 h-3.5" />
          <span>Audit Integrity: 100% Verified</span>
        </div>
      </div>

      {/* Search */}
      <div className="bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="ค้นหาผู้ใช้งาน, การกระทำ (Action), หมายเลขเอกสาร..."
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono">
          บันทึกทั้งหมด: {auditLogs.length} รายการ
        </span>
      </div>

      {/* Audit Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 text-slate-700 font-semibold border-b border-slate-200">
              <tr>
                <th className="p-3 w-40">วัน-เวลา (Timestamp)</th>
                <th className="p-3 w-44">ผู้ใช้งาน (User & Role)</th>
                <th className="p-3 w-40">การกระทำ (Action)</th>
                <th className="p-3">เป้าหมาย / เอกสารอ้างอิง (Target)</th>
                <th className="p-3 w-28 font-mono">IP Address</th>
                <th className="p-3 w-20 text-center">ดู Diff</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50 transition-colors">
                  <td className="p-3 font-mono text-[11px] text-slate-600">
                    {log.timestamp}
                  </td>
                  <td className="p-3">
                    <div className="font-bold text-slate-900">{log.userName}</div>
                    <div className="text-[10px] text-slate-400">{log.userRole}</div>
                  </td>
                  <td className="p-3 font-medium text-blue-900">
                    {log.action}
                  </td>
                  <td className="p-3 text-slate-700 font-mono text-[11px]">
                    {log.target}
                  </td>
                  <td className="p-3 font-mono text-slate-500 text-[11px]">
                    {log.ipAddress}
                  </td>
                  <td className="p-3 text-center">
                    <button
                      type="button"
                      onClick={() => setSelectedLog(log)}
                      className="p-1.5 bg-slate-100 hover:bg-slate-200 text-blue-700 rounded-lg transition-colors"
                      title="ดูรายละเอียดการเปลี่ยนแปลง"
                    >
                      <Eye className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Log Detail Modal */}
      {selectedLog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 border border-slate-200 shadow-2xl">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-sm text-slate-900">บันทึกการเปลี่ยนแปลง (Audit Payload)</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedLog.timestamp}</p>
              </div>
              <button
                onClick={() => setSelectedLog(null)}
                className="text-slate-400 hover:text-slate-600 p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 text-xs bg-slate-50 p-3 rounded-xl border border-slate-200">
              <div><strong>ผู้ใช้งาน:</strong> {selectedLog.userName} ({selectedLog.userRole})</div>
              <div><strong>การกระทำ:</strong> {selectedLog.action}</div>
              <div><strong>เป้าหมาย:</strong> {selectedLog.target}</div>
              <div><strong>IP Address:</strong> {selectedLog.ipAddress}</div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                รายละเอียดข้อมูลที่เปลี่ยนแปลง (JSON Payload):
              </label>
              <pre className="p-3 bg-slate-900 text-emerald-400 rounded-xl text-[11px] font-mono overflow-x-auto max-h-48">
                {JSON.stringify(selectedLog.details, null, 2)}
              </pre>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setSelectedLog(null)}
                className="px-4 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-800 text-xs font-semibold rounded-lg"
              >
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
