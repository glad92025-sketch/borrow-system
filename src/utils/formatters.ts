export const THAI_MONTHS_FULL = [
  'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
  'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
];

export const THAI_MONTHS_SHORT = [
  'ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.',
  'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'
];

export function formatThaiDate(dateStr?: string, format: 'full' | 'short' | 'relative' = 'full'): string {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;

    const day = d.getDate();
    const month = d.getMonth();
    const year = d.getFullYear() + 543; // Convert AD to BE

    if (format === 'short') {
      return `${day} ${THAI_MONTHS_SHORT[month]} ${year}`;
    }
    return `${day} ${THAI_MONTHS_FULL[month]} พ.ศ. ${year}`;
  } catch {
    return dateStr;
  }
}

export function formatBaht(amount: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount).replace('THB', '฿');
}

export function getStatusBadgeInfo(status: string): { label: string; bg: string; text: string; border: string; iconBg: string } {
  switch (status) {
    case 'pending_check':
      return {
        label: 'รอตรวจสอบ',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        iconBg: 'bg-amber-500',
      };
    case 'pending_approval':
      return {
        label: 'รออนุมัติ',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-500',
      };
    case 'approved':
      return {
        label: 'อนุมัติแล้ว (รอจ่ายของ)',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-500',
      };
    case 'rejected':
      return {
        label: 'ไม่อนุมัติ',
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        iconBg: 'bg-red-500',
      };
    case 'issued':
      return {
        label: 'กำลังยืม',
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        iconBg: 'bg-purple-500',
      };
    case 'pending_return':
      return {
        label: 'รอตรวจรับคืน',
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-300',
        iconBg: 'bg-amber-600',
      };
    case 'returned':
      return {
        label: 'คืนเรียบร้อย',
        bg: 'bg-green-50',
        text: 'text-green-700',
        border: 'border-green-200',
        iconBg: 'bg-green-600',
      };
    case 'damaged':
      return {
        label: 'มีทรัพย์สินชำรุด',
        bg: 'bg-orange-50',
        text: 'text-orange-700',
        border: 'border-orange-200',
        iconBg: 'bg-orange-500',
      };
    case 'lost':
      return {
        label: 'ทรัพย์สินสูญหาย',
        bg: 'bg-rose-50',
        text: 'text-rose-800',
        border: 'border-rose-300',
        iconBg: 'bg-rose-600',
      };
    case 'available':
      return {
        label: 'พร้อมให้ยืม',
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        iconBg: 'bg-emerald-500',
      };
    case 'borrowed':
      return {
        label: 'ถูกยืมทั้งหมด',
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        iconBg: 'bg-blue-500',
      };
    case 'repairing':
      return {
        label: 'ส่งซ่อมบำรุง',
        bg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200',
        iconBg: 'bg-amber-500',
      };
    case 'not_borrowable':
      return {
        label: 'ไม่อนุญาตให้ยืม',
        bg: 'bg-gray-100',
        text: 'text-gray-700',
        border: 'border-gray-300',
        iconBg: 'bg-gray-500',
      };
    default:
      return {
        label: status,
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        iconBg: 'bg-slate-400',
      };
  }
}

export function isBorrowOverdue(dueDateStr: string, status: string): boolean {
  if (status !== 'issued') return false;
  try {
    const due = new Date(dueDateStr);
    const today = new Date('2026-08-18'); // Reference date
    return today > due;
  } catch {
    return false;
  }
}

export function daysRemaining(dueDateStr: string): number {
  try {
    const due = new Date(dueDateStr);
    const today = new Date('2026-08-18');
    const diffTime = due.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  } catch {
    return 0;
  }
}


