import React, { useState } from 'react';
import {
  MonitorPlay,
  Volume2,
  Users,
  Clock,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Layers,
  Building,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const QueueBoard: React.FC = () => {
  const {
    queues,
    orgSettings,
    callNextQueue,
    completeQueue,
    speakQueueAnnouncement,
  } = useApp();

  const [counter1Queue, setCounter1Queue] = useState<string>('B-0069');
  const [counter2Queue, setCounter2Queue] = useState<string>('R-0012');

  const waitingQueues = queues.filter((q) => q.status === 'waiting');
  const servingQueues = queues.filter((q) => q.status === 'serving');

  const handleCallCounter1 = (queueNum: string) => {
    setCounter1Queue(queueNum);
    speakQueueAnnouncement(queueNum, 1);
    callNextQueue('B', 1);
  };

  const handleCallCounter2 = (queueNum: string) => {
    setCounter2Queue(queueNum);
    speakQueueAnnouncement(queueNum, 2);
    callNextQueue('R', 2);
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls (Hidden on kiosk fullscreen) */}
      <div className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800 shadow-md flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <MonitorPlay className="w-5 h-5 text-amber-400" />
            <h2 className="text-sm font-bold">จอคิวประชาสัมพันธ์และเรียกเสียง (Live Office Queue TV)</h2>
            <span className="text-[10px] bg-red-600 text-white px-2 py-0.5 rounded-full font-bold animate-pulse">
              LIVE ON AIR
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            หน้าจอสำหรับแสดงผลบน TV หน้าห้องพัสดุ อบต.ฝางคำ พร้อมระบบเสียงเรียกคิวภาษาไทย
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => speakQueueAnnouncement(counter1Queue, 1)}
            className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl flex items-center gap-1.5 transition-colors shadow-xs"
          >
            <Volume2 className="w-4 h-4" />
            <span>กดประกาศเสียงเรียกคิว {counter1Queue}</span>
          </button>
        </div>
      </div>

      {/* Main TV Screen Layout */}
      <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-blue-950 rounded-3xl p-6 md:p-8 text-white shadow-2xl border-4 border-slate-800 space-y-6">
        
        {/* TV Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-400 text-slate-950 font-bold text-lg flex items-center justify-center shadow-lg">
              อบต.
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-black text-amber-400 tracking-wide">
                {orgSettings.orgName}
              </h1>
              <p className="text-xs text-blue-200">
                จุดบริการยืม-คืนพัสดุ ครุภัณฑ์ ทรัพย์สินทางราชการ
              </p>
            </div>
          </div>

          <div className="text-right font-mono">
            <div className="text-2xl md:text-3xl font-black text-white">10:45:20</div>
            <div className="text-xs text-slate-400">วันพุธที่ 19 สิงหาคม 2569</div>
          </div>
        </div>

        {/* Counter Display Cards (Large High Contrast) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Counter 1: ยื่นขอยืมและรับของ */}
          <div className="bg-gradient-to-b from-blue-900/80 to-blue-950 rounded-3xl border-2 border-blue-500/60 p-6 text-center space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-blue-300 uppercase tracking-widest">
                ช่องบริการที่ 1
              </span>
              <span className="text-xs bg-blue-700/80 text-blue-100 px-3 py-0.5 rounded-full font-semibold">
                ยื่นขอยืม & ส่งมอบของ
              </span>
            </div>

            <div className="py-3">
              <p className="text-xs text-blue-200 mb-1">หมายเลขคิวที่เรียก</p>
              <div className="text-6xl md:text-7xl font-black text-amber-400 font-mono tracking-tight drop-shadow-[0_4px_12px_rgba(251,191,36,0.4)]">
                {counter1Queue}
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCallCounter1('B-0070')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" />
                เรียกคิวถัดไป (B-0070)
              </button>
            </div>
          </div>

          {/* Counter 2: รับคืนและตรวจสภาพ */}
          <div className="bg-gradient-to-b from-emerald-900/80 to-teal-950 rounded-3xl border-2 border-emerald-500/60 p-6 text-center space-y-4 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 uppercase tracking-widest">
                ช่องบริการที่ 2
              </span>
              <span className="text-xs bg-emerald-700/80 text-emerald-100 px-3 py-0.5 rounded-full font-semibold">
                ส่งคืนพัสดุ & ตรวจสภาพ
              </span>
            </div>

            <div className="py-3">
              <p className="text-xs text-emerald-200 mb-1">หมายเลขคิวที่เรียก</p>
              <div className="text-6xl md:text-7xl font-black text-emerald-300 font-mono tracking-tight drop-shadow-[0_4px_12px_rgba(110,231,183,0.4)]">
                {counter2Queue}
              </div>
            </div>

            <div className="flex justify-center gap-2 pt-2">
              <button
                type="button"
                onClick={() => handleCallCounter2('R-0013')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition-all shadow-md flex items-center gap-1.5"
              >
                <Volume2 className="w-4 h-4" />
                เรียกคิวถัดไป (R-0013)
              </button>
            </div>
          </div>

        </div>

        {/* Bottom Waiting List on TV */}
        <div className="bg-slate-900/80 rounded-2xl p-5 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs font-bold text-slate-300">
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-amber-400" />
              ลำดับคิวที่รอรับบริการ (Waiting List: {waitingQueues.length} คิว)
            </span>
            <span className="text-slate-400 font-mono">
              โปรดเตรียมบัตรประชาชนหรือใบฉีกนัดคืนให้พร้อม
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {queues.slice(0, 4).map((q) => (
              <div
                key={q.id}
                className="bg-slate-800/80 p-3 rounded-xl border border-slate-700 text-xs flex items-center justify-between"
              >
                <div>
                  <div className="font-mono font-bold text-amber-300 text-sm">{q.queueNumber}</div>
                  <div className="text-[11px] text-slate-300 truncate max-w-[110px]">{q.borrowerName}</div>
                </div>
                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded">
                  {q.type === 'borrow' ? 'ยืม' : 'คืน'}
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};
