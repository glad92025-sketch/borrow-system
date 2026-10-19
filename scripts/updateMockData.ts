import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const jsonPath = path.join(__dirname, '..', 'src', 'data', 'realDbData.json');
const raw = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));

const employees = [
  {
    id: 'emp-001',
    employeeCode: 'EMP-FK-001',
    prefix: 'จ.ส.อ.',
    firstName: 'เกียรติพล',
    lastName: 'หาทรัพย์',
    position: 'เจ้าพนักงานธุรการชำนาญงาน',
    department: 'สำนักปลัด / งานพัสดุ',
    phone: '064-352-2769',
    employeeType: 'ข้าราชการ',
    supervisorName: 'นายชาญชัย อักโข',
    status: 'active',
    totalBorrowsCount: 0,
    overdueCount: 0
  },
  {
    id: 'emp-002',
    employeeCode: 'EMP-FK-002',
    prefix: 'นาย',
    firstName: 'ชาญชัย',
    lastName: 'อักโข',
    position: 'ปลัดองค์การบริหารส่วนตำบลฝางคำ',
    department: 'สำนักปลัด',
    phone: '087-456-7858',
    employeeType: 'ข้าราชการ',
    supervisorName: 'นายจำรูญ พิทักษ์',
    status: 'active',
    totalBorrowsCount: 0,
    overdueCount: 0
  },
  {
    id: 'emp-003',
    employeeCode: 'EMP-FK-003',
    prefix: 'นาง',
    firstName: 'วาสนา',
    lastName: 'สินทรัพย์',
    position: 'ผู้อำนวยการกองคลัง',
    department: 'กองคลัง',
    phone: '061-923-6333',
    employeeType: 'ข้าราชการ',
    supervisorName: 'นายชาญชัย อักโข',
    status: 'active',
    totalBorrowsCount: 0,
    overdueCount: 0
  },
  {
    id: 'emp-004',
    employeeCode: 'EMP-FK-004',
    prefix: 'จ่าเอก',
    firstName: 'เกียรติศักดิ์',
    lastName: 'เพ็ญเนตร',
    position: 'เจ้าพนักงานพัสดุ',
    department: 'กองคลัง',
    phone: '045-252586',
    employeeType: 'ข้าราชการ',
    supervisorName: 'นางวาสนา สินทรัพย์',
    status: 'active',
    totalBorrowsCount: 0,
    overdueCount: 0
  }
];

const tsContent = `import { 
  Asset, 
  CitizenBorrower, 
  EmployeeBorrower, 
  BorrowRequest, 
  DamageCase, 
  LostCase, 
  QueueItem, 
  AuditLog, 
  SystemRuleConfig, 
  OrgSettings 
} from './types';

// ==========================================
// องค์การบริหารส่วนตำบลฝางคำ - ข้อมูลจริงจากฐานข้อมูล borrow_db
// ==========================================

export const INITIAL_ORG_SETTINGS: OrgSettings = ${JSON.stringify(raw.orgSettings, null, 2)};

export const INITIAL_RULES_CONFIG: SystemRuleConfig = {
  version: 'ระเบียบ อบต.ฝางคำ',
  updatedAt: '2026-04-17 09:00',
  updatedBy: 'องค์การบริหารส่วนตำบลฝางคำ',
  effectiveDate: 'ระเบียบการยืม-คืนพัสดุ',
  rules: [
    {
      id: 1,
      title: 'ผู้ยืมต้องให้ข้อมูลที่ถูกต้องและครบถ้วน',
      description: 'ผู้ยืมต้องกรอกข้อมูลตามความเป็นจริงและรับผิดชอบต่อเอกสารหลักฐานที่ยื่นต่อ อบต.ฝางคำ',
      isRequired: true,
    },
    {
      id: 2,
      title: 'ใช้ทรัพย์สินตามวัตถุประสงค์ที่แจ้งเท่านั้น',
      description: 'สิ่งของที่ยืมต้องนำไปใช้ในกิจกรรม งานสาธารณประโยชน์ หรือประเพณีตามที่ระบุในคำขอ',
      isRequired: true,
    },
    {
      id: 3,
      title: 'ห้ามนำไปให้บุคคลอื่นยืมต่อหรือนำไปแสวงหาผลประโยชน์ส่วนตน',
      description: 'ผู้ยืมไม่มีสิทธินำสิ่งของของ อบต. ไปให้บุคคลอื่นยืมต่อหรือให้เช่าเพื่อการค้าโดยเด็ดขาด',
      isRequired: true,
    },
    {
      id: 4,
      title: 'ต้องดูแลรักษาทรัพย์สินเสมือนทรัพย์สินของตนเอง',
      description: 'ผู้ยืมต้องป้องกันมิให้เกิดความเสียหาย สูญหาย หรือถูกนำไปใช้ผิดวิธี',
      isRequired: true,
    },
    {
      id: 5,
      title: 'ต้องคืนตามกำหนดเวลาที่ระบุในใบยืม',
      description: 'ต้องนำสิ่งของมาคืนภายในวันที่กำหนด ภายในวันและเวลาราชการของ อบต.ฝางคำ',
      isRequired: true,
    },
    {
      id: 6,
      title: 'ต้องคืนของให้ครบถ้วนพร้อมอุปกรณ์เสริมทั้งหมด',
      description: 'ส่งคืนสิ่งของพร้อมผ้าใบ เชือก ขาตั้ง สายไฟ อุปกรณ์เสริม และชิ้นส่วนประกอบครบถ้วน',
      isRequired: true,
    },
    {
      id: 7,
      title: 'กรณีเกิดความชำรุดเสียหาย',
      description: 'หากเกิดความเสียหายจากการใช้งานผิดประเภทหรือประมาทเลินเล่อ ผู้ยืมต้องชดใช้ค่าซ่อมแซมตามระเบียบราชการ',
      isRequired: true,
    },
    {
      id: 8,
      title: 'กรณีทรัพย์สินสูญหาย',
      description: 'ผู้ยืมต้องแจ้งเจ้าหน้าที่ทันที และยินยอมชดใช้มูลค่าทรัพย์สินตามราคาประเมินของคณะกรรมการตรวจสอบ',
      isRequired: true,
    },
    {
      id: 9,
      title: 'ยินยอมให้เจ้าหน้าที่ตรวจสภาพและบันทึกภาพ',
      description: 'เจ้าหน้าที่มีสิทธิตรวจสอบสภาพ ถ่ายรูป และบันทึกข้อมูลก่อนจ่ายของและหลังรับคืน',
      isRequired: true,
    },
    {
      id: 10,
      title: 'ประวัติการคืนล่าช้าจะถูกบันทึกในระบบ',
      description: 'การคืนเกินกำหนดจะถูกบันทึกประวัติ และอาจส่งผลต่อการพิจารณาอนุมัติการยืมในครั้งถัดไป',
      isRequired: true,
    }
  ]
};

// ข้อมูลพัสดุและครุภัณฑ์จริงจากตาราง items (borrow_db)
export const INITIAL_ASSETS: Asset[] = ${JSON.stringify(raw.assets, null, 2)};

// ทะเบียนผู้ยืมประชาชนจริงจากตาราง borrow (borrow_db)
export const INITIAL_CITIZENS: CitizenBorrower[] = ${JSON.stringify(raw.citizens, null, 2)};

// ข้อมูลเจ้าหน้าที่ อบต.ฝางคำ
export const INITIAL_EMPLOYEES: EmployeeBorrower[] = ${JSON.stringify(employees, null, 2)};

// ข้อมูลประวัติการยืม-คืนจริง 16 รายการ จากตาราง borrow และ borrow_items (borrow_db)
export const INITIAL_BORROW_REQUESTS: BorrowRequest[] = ${JSON.stringify(raw.borrowRequests, null, 2)};

export const INITIAL_QUEUES: QueueItem[] = ${JSON.stringify(raw.queues, null, 2)};

export const INITIAL_DAMAGE_CASES: DamageCase[] = [];

export const INITIAL_LOST_CASES: LostCase[] = [];

export const INITIAL_AUDIT_LOGS: AuditLog[] = [
  {
    id: 'aud-001',
    timestamp: '2026-10-19 09:30:00',
    actorName: 'ระบบอัตโนมัติ (DB Sync)',
    actorRole: 'admin',
    action: 'ซิงค์ข้อมูลจริงจากฐานข้อมูล MySQL (borrow_db)',
    module: 'system',
    details: 'ดึงข้อมูลพัสดุ 6 รายการ, ประวัติการยืม-คืน 16 รายการ, ทะเบียนผู้ยืม 15 ราย สำเร็จ',
    ipAddress: '127.0.0.1'
  }
];
`;

const mockDataPath = path.join(__dirname, '..', 'src', 'mockData.ts');
fs.writeFileSync(mockDataPath, tsContent, 'utf-8');
console.log(`Updated ${mockDataPath} with real database data.`);
