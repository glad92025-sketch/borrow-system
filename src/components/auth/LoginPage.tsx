import React, { useState } from 'react';
import {
  Lock,
  User,
  ShieldCheck,
  Building2,
  ArrowRight,
  Eye,
  EyeOff,
  Search,
  KeyRound,
  FileCheck,
  Sparkles,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OrgLogo } from '../common/OrgLogo';

interface LoginPageProps {
  onEnterAsCitizen?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onEnterAsCitizen }) => {
  const { login, orgSettings, setIsCitizenGuest, setActiveTab } = useApp();

  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = login(username, password);
      setIsLoading(false);
      if (!result.success) {
        setErrorMessage(result.error || 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง');
      }
    }, 300);
  };

  const handleDemoFill = () => {
    setUsername('admin');
    setPassword('admin');
    setErrorMessage(null);
  };

  const handleCitizenAccess = () => {
    setIsCitizenGuest(true);
    setActiveTab('public_portal');
    if (onEnterAsCitizen) {
      onEnterAsCitizen();
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      
      {/* Top Simple Bar */}
      <header className="bg-white border-b border-slate-200 px-4 py-3 sm:px-8 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <OrgLogo size="sm" showBorder={false} />
          <div>
            <h1 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
              {orgSettings.orgName}
            </h1>
            <p className="text-[10px] text-slate-500">
              {orgSettings.amphoe} {orgSettings.province}
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleCitizenAccess}
          className="text-xs text-blue-700 hover:text-blue-800 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-blue-50 border border-blue-200 transition-colors cursor-pointer"
        >
          <Search className="w-3.5 h-3.5" />
          <span>ประชาชนตรวจคิว/ใบนัดคืน</span>
        </button>
      </header>

      {/* Main Login Card Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 my-4">
        <div className="w-full max-w-md bg-white rounded-3xl border border-slate-200 shadow-xl overflow-hidden animate-fadeIn">
          
          {/* Card Header with SAO Logo */}
          <div className="bg-gradient-to-b from-blue-900 via-blue-950 to-slate-900 p-8 text-white text-center relative overflow-hidden">
            {/* Subtle background glow */}
            <div className="absolute -top-12 -right-12 w-40 h-40 bg-blue-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-40 h-40 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col items-center space-y-3">
              <div className="p-1 bg-white/10 rounded-full backdrop-blur-xs border border-white/20 shadow-lg">
                <OrgLogo size="lg" className="w-16 h-16" />
              </div>
              
              <div className="space-y-1">
                <h2 className="text-lg sm:text-xl font-bold tracking-tight text-white">
                  ระบบบริหารการยืม-คืนพัสดุ
                </h2>
                <p className="text-xs text-blue-200 font-medium">
                  {orgSettings.orgName}
                </p>
              </div>

              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-800/80 border border-blue-600/60 text-[11px] text-amber-300 font-medium">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
                <span>สำหรับผู้ดูแลระบบ (Admin Only)</span>
              </div>
            </div>
          </div>

          {/* Form Body */}
          <div className="p-6 sm:p-8 space-y-6">
            
            {errorMessage && (
              <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-start gap-2.5 animate-fadeIn">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">เข้าสู่ระบบไม่สำเร็จ: </span>
                  <span>{errorMessage}</span>
                </div>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Username field */}
              <div className="space-y-1.5">
                <label className="block text-xs font-bold text-slate-700">
                  ชื่อผู้ใช้งาน (Username)
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="admin"
                    autoCapitalize="none"
                    autoCorrect="off"
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                </div>
              </div>

              {/* Password field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-bold text-slate-700">
                    รหัสผ่าน (Password)
                  </label>
                  <span className="text-[11px] text-slate-500">
                    (รหัสเริ่มต้น: admin)
                  </span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <KeyRound className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 bg-blue-700 hover:bg-blue-800 active:bg-blue-900 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all transform active:scale-98 cursor-pointer disabled:opacity-70"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>เข้าสู่ระบบผู้ดูแล (Sign In as Admin)</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            {/* Quick Demo Fill & Info Box */}
            <div className="pt-2 space-y-3">
              <div className="flex items-center justify-between text-xs pt-3 border-t border-slate-100">
                <span className="text-slate-500">บัญชีสำหรับเข้าใช้งาน:</span>
                <button
                  type="button"
                  onClick={handleDemoFill}
                  className="font-bold text-blue-700 hover:text-blue-900 hover:underline cursor-pointer flex items-center gap-1"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  <span>กรอกข้อมูล Admin อัตโนมัติ</span>
                </button>
              </div>

              <div className="bg-slate-50 p-3 rounded-xl border border-slate-200/80 text-[11px] text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  <span>สิทธิ์การใช้งานระบบ (System Role)</span>
                </div>
                <p>
                  ระบบนี้กำหนดให้มี <strong>User Admin</strong> เพียงผู้เดียวสำหรับบริหารจัดการข้อมูล อนุมัติ จ่ายพัสดุ รับคืน ออกรายงาน และตั้งค่าระบบ
                </p>
              </div>

              {/* Citizen Gateway */}
              <div className="text-center pt-2">
                <p className="text-[11px] text-slate-500 mb-2">
                  หากคุณเป็นประชาชนที่ต้องการตรวจสอบคิวหรือสถานะคำขอ
                </p>
                <button
                  type="button"
                  onClick={handleCitizenAccess}
                  className="w-full py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Search className="w-3.5 h-3.5 text-blue-700" />
                  <span>เข้าสู่หน้าบริการประชาชน (Public Portal)</span>
                </button>
              </div>

            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-3 px-4 text-center text-xs text-slate-500">
        <p>
          {orgSettings.orgName} • โทรศัพท์: {orgSettings.phone} • อีเมล: {orgSettings.email}
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">
          ระบบสารสนเทศบริหารการยืม-คืนพัสดุ ครุภัณฑ์ และทรัพย์สิน ท้องถิ่นดิจิทัล พ.ศ. 2569
        </p>
      </footer>

    </div>
  );
};
