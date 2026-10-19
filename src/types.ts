export type UserRole = 
  | 'super_admin' 
  | 'admin' 
  | 'supply_officer' 
  | 'inspector' 
  | 'executive' 
  | 'employee' 
  | 'citizen';

export type BorrowerType = 'citizen' | 'employee';

export type AssetCategory = 
  | 'เต็นท์และผ้าใบ'
  | 'โต๊ะ-เก้าอี้และเครื่องใช้สำนักงาน'
  | 'เครื่องเสียงและระบบกระจายเสียง'
  | 'คอมพิวเตอร์และโสตทัศนูปกรณ์'
  | 'เครื่องมือช่างและงานป้องกัน'
  | 'เครื่องจักรกลและยานพาหนะ'
  | 'อุปกรณ์กีฬาและนันทนาการ'
  | 'อุปกรณ์จัดงานพิธีและเตียงพยาบาล';

export type AssetStatus = 
  | 'available'       // พร้อมให้ยืม
  | 'borrowed'        // ถูกยืม
  | 'reserved'        // จอง
  | 'inspecting'      // รอตรวจสอบ
  | 'damaged'         // ชำรุด
  | 'repairing'       // ส่งซ่อม
  | 'lost'            // สูญหาย
  | 'disposed'        // จำหน่าย
  | 'not_borrowable'; // ไม่อนุญาตให้ยืม

export interface Asset {
  id: string;
  code: string;              // รหัสครุภัณฑ์/วัสดุ เช่น AST-69-001
  materialCode?: string;     // รหัสพัสดุ
  barcode: string;
  qrCodeData: string;
  name: string;
  category: AssetCategory;
  type: 'durable' | 'consumable'; // ครุภัณฑ์ | วัสดุ
  brand: string;
  model: string;
  serialNumber?: string;
  quantityTotal: number;
  quantityAvailable: number;
  unit: string;              // หลัง, ตัว, ชุด, เครื่อง, ตัว
  location: string;          // สถานที่เก็บ
  department: string;        // สำนัก/กอง
  status: AssetStatus;
  valueBaht: number;         // มูลค่า (บาท)
  acquiredDate: string;
  imageUrl?: string;
  requiresSpecialApproval: boolean;
  requiresDeposit: boolean;
  depositAmountBaht: number;
  conditionNotes?: string;
  condition?: string;
  storageLocation?: string;
  procurementYear?: number;
  purchasePriceBaht?: number;
  historyTimeline: AssetTimelineEvent[];
}

export interface AssetTimelineEvent {
  id: string;
  timestamp: string;
  action: string;
  performedBy: string;
  details: string;
  relatedRequestId?: string;
}

export interface CitizenBorrower {
  id: string;
  idCardNumber: string;      // 13 หลัก
  prefix: string;
  firstName: string;
  lastName: string;
  address: string;
  moo: string;
  tambon: string;
  amphoe: string;
  province: string;
  phone: string;
  lineId?: string;
  email?: string;
  idCardPhotoUrl?: string;
  borrowerPhotoUrl?: string;
  totalBorrowsCount: number;
  totalReturnsCount: number;
  overdueCount: number;
  damageCount: number;
  lossCount: number;
  unpaidCompensationBaht: number;
  status: 'active' | 'blacklisted' | 'pending_verification';
  notes?: string;
}

export interface EmployeeBorrower {
  id: string;
  employeeCode: string;      // รหัสพนักงาน
  prefix: string;
  firstName: string;
  lastName: string;
  position: string;          // ตำแหน่ง
  department: string;        // สำนัก/กอง
  phone: string;
  employeeType: 'ข้าราชการ' | 'พนักงานเทศบาล/อบต.' | 'พนักงานจ้างตามภารกิจ' | 'พนักงานจ้างทั่วไป';
  supervisorName: string;
  status: 'active' | 'inactive';
  totalBorrowsCount: number;
  overdueCount: number;
}

export type BorrowRequestStatus = 
  | 'pending_check'     // 🟡 รอตรวจสอบ
  | 'pending_approval'  // 🔵 รออนุมัติ
  | 'approved'          // 🟢 อนุมัติแล้ว (รอจ่ายของ)
  | 'rejected'          // 🔴 ไม่อนุมัติ
  | 'issued'            // 🟣 กำลังยืม (ส่งมอบแล้ว)
  | 'pending_return'    // 🟤 รอตรวจรับคืน
  | 'returned'          // ✅ คืนเรียบร้อย
  | 'damaged'           // ⚠️ คืนแล้วพบชำรุด
  | 'lost';             // 🚨 สูญหาย

export interface BorrowRequestedItem {
  assetId: string;
  assetCode: string;
  assetName: string;
  category: AssetCategory;
  requestedQty: number;
  unit: string;
  serialNumber?: string;
  conditionBefore: string;     // สภาพก่อนยืม
  photosBefore?: string[];     // รูปถ่ายก่อนส่งมอบ
  conditionAfter?: string;      // สภาพหลังคืน
  photosAfter?: string[];      // รูปถ่ายหลังคืน
  returnedQty?: number;
  damagedQty?: number;
  lostQty?: number;
  notes?: string;
}

export interface BorrowRequest {
  id: string;
  requestNumber: string;       // เช่น BOR-2569-000069
  queueNumber: string;         // เช่น B-0069
  returnQueueNumber?: string;  // เช่น R-0069
  borrowerType: BorrowerType;
  borrowerId: string;
  borrowerName: string;
  borrowerPhone: string;
  borrowerIdCardOrEmpCode: string;
  borrowerDepartmentOrMoo: string;
  purpose: string;             // วัตถุประสงค์ เช่น จัดงานบุญประเพณีประจำปี, โครงการ อบต.
  venueOfUse: string;          // สถานที่นำไปใช้
  requestDate: string;         // วันที่ยื่นคำขอ
  pickupDate: string;          // วันที่ต้องการรับของ
  pickupTime?: string;
  dueDate: string;             // วันที่กำหนดคืน
  dueTime: string;             // เช่น 16:30 น.
  actualReturnDate?: string;
  actualReturnTime?: string;
  items: BorrowRequestedItem[];
  status: BorrowRequestStatus;
  urgency: 'normal' | 'urgent';
  requiresDeposit: boolean;
  depositAmount: number;
  depositStatus?: 'none' | 'held' | 'refunded' | 'confiscated';
  depositReceiptNo?: string;
  
  // Attachments
  attachments: {
    name: string;
    type: string;
    url?: string;
    uploadedAt: string;
  }[];

  // Agreement Confirmation
  agreedTermsVersion: string;
  agreedAt: string;

  // Workflow Signatures and steps
  history: BorrowWorkflowStep[];

  // Delivery details
  deliveredBy?: string;
  deliveredAt?: string;
  deliverySignatureUrl?: string;
  recipientSignatureUrl?: string;
  deliveryNotes?: string;

  // Return details
  receivedBy?: string;
  receivedAt?: string;
  returnInspectorSignatureUrl?: string;
  returnBorrowerSignatureUrl?: string;
  returnInspectionResult?: 'perfect' | 'minor_scratches' | 'damaged' | 'lost';
  returnNotes?: string;
}

export interface BorrowWorkflowStep {
  id: string;
  stepName: string;
  action: string;
  actorName: string;
  actorRole: string;
  timestamp: string;
  statusTo: BorrowRequestStatus;
  comment?: string;
  signatureUrl?: string;
  ipAddress: string;
}

export interface DamageCase {
  id: string;
  caseNumber: string;          // เช่น DMG-2569-001
  requestId: string;
  requestNumber: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  borrowerName: string;
  borrowerPhone: string;
  damageDate: string;
  damageDescription: string;
  photoBeforeUrl?: string;
  photoAfterUrl?: string;
  inspectorName: string;
  estimatedCostBaht: number;
  actualRepairCostBaht: number;
  responsiblePerson: string;
  compensationStatus: 'pending_assessment' | 'in_investigation' | 'awaiting_payment' | 'paid' | 'waived' | 'closed';
  compensationReceiptNo?: string;
  resolvedDate?: string;
  notes?: string;
}

export interface LostCase {
  id: string;
  caseNumber: string;          // เช่น LST-2569-001
  requestId: string;
  requestNumber: string;
  assetId: string;
  assetCode: string;
  assetName: string;
  assetValueBaht: number;
  borrowerName: string;
  borrowerPhone: string;
  lostDate: string;
  incidentDetails: string;
  photoUrl?: string;
  responsiblePerson: string;
  investigationOutcome?: string;
  assessedCompensationBaht: number;
  compensationStatus: 'investigating' | 'awaiting_compensation' | 'compensated' | 'legal_action' | 'closed';
  compensationReceiptNo?: string;
  certifiedByMayorName?: string;
  closedDate?: string;
}

export interface QueueItem {
  id: string;
  queueNumber: string;         // B-0069 or R-0069
  type: 'borrow' | 'return';
  requestId: string;
  requestNumber: string;
  borrowerName: string;
  itemSummary: string;
  servicePoint: string;        // เช่น จุดรับ-จ่ายพัสดุ 1
  status: 'waiting' | 'calling' | 'in_progress' | 'completed' | 'skipped';
  createdAt: string;
  calledAt?: string;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userName: string;
  userRole: string;
  action: string;
  targetType: 'borrow_request' | 'asset' | 'borrower' | 'damage_case' | 'lost_case' | 'setting';
  targetId: string;
  targetName: string;
  beforeData?: string;
  afterData?: string;
  ipAddress: string;
  userAgent: string;
}

export interface SystemRule {
  id: number;
  title: string;
  description: string;
  isRequired: boolean;
}

export interface SystemRuleConfig {
  version: string;
  updatedAt: string;
  updatedBy: string;
  effectiveDate: string;
  rules: SystemRule[];
}

export interface AuthUser {
  username: string;
  name: string;
  role: 'admin';
  avatarUrl?: string;
  lastLogin?: string;
}

export interface OrgSettings {
  orgName: string;             // องค์การบริหารส่วนตำบลฝางคำ
  logoUrl?: string;            // รูปภาพตราสัญลักษณ์/โลโก้ อบต.
  amphoe: string;              // อำเภอสิรินธร
  province: string;            // จังหวัดอุบลราชธานี
  postalCode: string;          // 34350
  phone: string;               // 045-XXXXXX
  email: string;               // fangkam2021@gmail.com
  returnTimeLimit: string;     // 16:30 น.
  returnLocationDefault: string; // อาคารงานพัสดุและยานพาหนะ อบต.ฝางคำ
  mayorName: string;           // นายก/ผู้อนุมัติ ชื่อ-สกุล
  mayorPosition?: string;      // ตำแหน่งผู้อนุมัติ (กำหนดเองได้อิสระ)
  paladName: string;           // ปลัด อบต.
  paladPosition?: string;      // ตำแหน่งปลัด/ผู้กำกับดูแล (กำหนดเองได้อิสระ)
  headOfSupplyName: string;    // หัวหน้างานพัสดุ
  headOfSupplyPosition?: string; // ตำแหน่งหัวหน้าฝ่าย/งานพัสดุ (กำหนดเองได้อิสระ)
  supplyOfficerName: string;   // เจ้าหน้าที่พัสดุ
  supplyOfficerPosition?: string; // ตำแหน่งเจ้าหน้าที่พัสดุ (กำหนดเองได้อิสระ)
}
