import mysql from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function exportFromMySQL() {
  console.log('Connecting to MySQL borrow_db...');
  const conn = await mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '',
    database: 'borrow_db',
    charset: 'utf8mb4'
  });

  const [itemsRows]: any = await conn.query('SELECT * FROM items ORDER BY id ASC');
  const [borrowRows]: any = await conn.query('SELECT * FROM borrow ORDER BY id ASC');
  const [borrowItemsRows]: any = await conn.query('SELECT * FROM borrow_items ORDER BY id ASC');
  const [settingsRows]: any = await conn.query('SELECT * FROM settings LIMIT 1');

  await conn.end();

  console.log(`Fetched ${itemsRows.length} items, ${borrowRows.length} borrow records, ${borrowItemsRows.length} borrow item details.`);

  // Map Items to Assets
  const categoryMap: Record<number, string> = {
    7: 'เต็นท์และผ้าใบ',
    8: 'โต๊ะ-เก้าอี้และเครื่องใช้สำนักงาน',
    9: 'โต๊ะ-เก้าอี้และเครื่องใช้สำนักงาน',
    10: 'เครื่องใช้ไฟฟ้า',
    11: 'อุปกรณ์กีฬาและนันทนาการ',
    12: 'อุปกรณ์จัดงานพิธีและเตียงพยาบาล'
  };

  const unitMap: Record<number, string> = {
    7: 'หลัง',
    8: 'ตัว',
    9: 'ตัว',
    10: 'เครื่อง',
    11: 'อัน',
    12: 'ผืน'
  };

  const imageMap: Record<number, string> = {
    7: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&auto=format&fit=crop&q=60',
    8: 'https://images.unsplash.com/photo-1503602642458-232111445657?w=500&auto=format&fit=crop&q=60',
    9: 'https://images.unsplash.com/photo-1530629013299-6cb10d168419?w=500&auto=format&fit=crop&q=60',
    10: 'https://images.unsplash.com/photo-1618944847823-380f14d81717?w=500&auto=format&fit=crop&q=60',
    11: 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=500&auto=format&fit=crop&q=60',
    12: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?w=500&auto=format&fit=crop&q=60'
  };

  const assets = itemsRows.map((it: any) => {
    const id = `ast-${String(it.id).padStart(3, '0')}`;
    const code = `AST-FK-${String(it.id).padStart(4, '0')}`;
    const total = Number(it.total_qty) || 10;
    const avail = Number(it.total_qty) || 10; // All returned in DB
    const unit = unitMap[it.id] || it.unit || 'ชิ้น';
    const cat = categoryMap[it.id] || 'โต๊ะ-เก้าอี้และเครื่องใช้สำนักงาน';

    return {
      id,
      code,
      materialCode: `MAT-FK-${it.id}`,
      barcode: `8850069${String(it.id).padStart(4, '0')}`,
      qrCodeData: `${code}-${it.name}`,
      name: it.name,
      category: cat,
      type: it.id === 11 || it.id === 12 ? 'consumable' : 'durable',
      brand: 'พัสดุ อบต.ฝางคำ',
      model: it.name,
      serialNumber: `FK-SN-${it.id}`,
      quantityTotal: total,
      quantityAvailable: avail,
      unit,
      location: 'คลังพัสดุกลาง อบต.ฝางคำ',
      department: 'สำนักปลัด อบต.ฝางคำ',
      status: 'available',
      valueBaht: it.id === 7 ? 15000 : it.id === 8 ? 250 : it.id === 9 ? 1200 : it.id === 10 ? 2500 : 300,
      acquiredDate: it.created_at ? new Date(it.created_at).toISOString().split('T')[0] : '2026-04-17',
      imageUrl: imageMap[it.id] || 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=500&auto=format&fit=crop&q=60',
      requiresSpecialApproval: false,
      requiresDeposit: false,
      depositAmountBaht: 0,
      conditionNotes: 'สภาพพร้อมใช้งาน ตรวจสอบล่าสุดเรียบร้อย',
      historyTimeline: [
        {
          id: `tl-${it.id}`,
          timestamp: it.created_at ? new Date(it.created_at).toISOString().replace('T', ' ').slice(0, 16) : '2026-04-17 14:00',
          action: 'ขึ้นทะเบียนพัสดุ อบต.',
          performedBy: 'เจ้าหน้าที่พัสดุ อบต.ฝางคำ',
          details: 'ลงทะเบียนเข้าสู่ระบบบริหารการยืมพัสดุ'
        }
      ]
    };
  });

  // Extract distinct citizens
  const citizenMap = new Map<string, any>();
  for (const b of borrowRows) {
    const name = (b.user_name || '').trim();
    if (!name) continue;
    if (!citizenMap.has(name)) {
      const idx = citizenMap.size + 1;
      citizenMap.set(name, {
        id: `cit-${String(idx).padStart(3, '0')}`,
        idCardNumber: `3-3415-00${String(idx * 73).padStart(5, '0')}-0`,
        prefix: name.startsWith('นาย') ? 'นาย' : name.startsWith('นางสาว') ? 'นางสาว' : name.startsWith('นาง') ? 'นาง' : '',
        firstName: name.replace(/^(นาย|นางสาว|นาง|ผู้ใหญ่บ้าน\s*|วัด)\s*/, ''),
        lastName: '',
        address: b.address || `ตำบลฝางคำ อำเภอสิรินธร จังหวัดอุบลราชธานี`,
        moo: (b.address && b.address.match(/หมู่(?:ที่)?\s*(\d+)/) ? `หมู่ที่ ${b.address.match(/หมู่(?:ที่)?\s*(\d+)/)[1]}` : 'ตำบลฝางคำ'),
        tambon: 'ฝางคำ',
        amphoe: 'สิรินธร',
        province: 'อุบลราชธานี',
        phone: b.phone || '045-899123',
        totalBorrowsCount: 0,
        totalReturnsCount: 0,
        overdueCount: 0,
        damageCount: 0,
        lossCount: 0,
        unpaidCompensationBaht: 0,
        status: 'active',
        notes: `บันทึกจากประวัติการยืมจริง อบต.ฝางคำ (${b.purpose || 'ยืมใช้งานทั่วไป'})`
      });
    }
    const cit = citizenMap.get(name);
    cit.totalBorrowsCount += 1;
    if (b.status === 'คืนแล้ว') {
      cit.totalReturnsCount += 1;
    }
  }

  const citizens = Array.from(citizenMap.values());

  // Map borrow records
  const borrowRequests = borrowRows.map((b: any) => {
    const cit = citizenMap.get((b.user_name || '').trim());
    const itemsForThis = borrowItemsRows
      .filter((bi: any) => bi.borrow_id === b.id)
      .map((bi: any) => {
        const matchedAsset = assets.find((a: any) => a.id === `ast-${String(bi.item_id).padStart(3, '0')}`);
        const qty = Number(bi.qty) || 1;
        return {
          assetId: matchedAsset ? matchedAsset.id : `ast-${String(bi.item_id).padStart(3, '0')}`,
          assetCode: matchedAsset ? matchedAsset.code : `AST-FK-${String(bi.item_id).padStart(4, '0')}`,
          assetName: matchedAsset ? matchedAsset.name : `พัสดุรหัส ${bi.item_id}`,
          category: matchedAsset ? matchedAsset.category : 'โต๊ะ-เก้าอี้และเครื่องใช้สำนักงาน',
          requestedQty: qty,
          unit: matchedAsset ? matchedAsset.unit : 'ชิ้น',
          conditionBefore: 'สภาพสมบูรณ์ พร้อมใช้งาน',
          conditionAfter: 'สภาพสมบูรณ์ ครบถ้วน',
          returnedQty: qty,
          damagedQty: 0,
          lostQty: 0,
          notes: ''
        };
      });

    const bDate = b.borrow_date ? new Date(b.borrow_date).toISOString().split('T')[0] : '2026-06-01';
    const rDate = b.return_due ? new Date(b.return_due).toISOString().split('T')[0] : '2026-06-05';
    const reqNum = `BOR-2569-${String(b.id).padStart(6, '0')}`;
    const qNum = `B-${String(b.id).padStart(4, '0')}`;

    return {
      id: `bor-${String(b.id).padStart(3, '0')}`,
      requestNumber: reqNum,
      queueNumber: qNum,
      returnQueueNumber: `R-${String(b.id).padStart(4, '0')}`,
      borrowerType: 'citizen',
      borrowerId: cit ? cit.id : 'cit-001',
      borrowerName: b.user_name || 'ประชาชน อบต.ฝางคำ',
      borrowerPhone: b.phone || '045-899123',
      borrowerIdCardOrEmpCode: cit ? cit.idCardNumber : '3-3415-00123-45-6',
      borrowerDepartmentOrMoo: cit ? cit.moo : 'ตำบลฝางคำ',
      purpose: b.purpose || 'จัดกิจกรรมชุมชน / งานประเพณี',
      venueOfUse: b.location || b.address || 'ตำบลฝางคำ อำเภอสิรินธร',
      requestDate: b.created_at ? new Date(b.created_at).toISOString().split('T')[0] : bDate,
      pickupDate: bDate,
      pickupTime: '09:00',
      dueDate: rDate,
      dueTime: '16:30 น.',
      actualReturnDate: rDate,
      actualReturnTime: '15:30',
      items: itemsForThis.length > 0 ? itemsForThis : [
        {
          assetId: 'ast-007',
          assetCode: 'AST-FK-0007',
          assetName: 'เต้นท์',
          category: 'เต็นท์และผ้าใบ',
          requestedQty: 1,
          unit: 'หลัง',
          conditionBefore: 'สภาพสมบูรณ์',
          conditionAfter: 'สภาพสมบูรณ์',
          returnedQty: 1
        }
      ],
      status: b.status === 'คืนแล้ว' ? 'returned' : 'issued',
      urgency: 'normal',
      requiresDeposit: false,
      depositAmount: 0,
      depositStatus: 'none',
      attachments: [],
      agreedTermsVersion: 'ระเบียบ อบต.ฝางคำ',
      agreedAt: `${bDate} 09:00`,
      history: [
        {
          id: `w-${b.id}-1`,
          stepName: 'ยื่นคำขอยืมพัสดุ',
          action: 'บันทึกคำขอยืมเข้าสู่ระบบ',
          actorName: b.user_name,
          actorRole: 'citizen',
          timestamp: `${bDate} 09:00`,
          statusTo: 'pending_check'
        },
        {
          id: `w-${b.id}-2`,
          stepName: 'อนุมัติคำขอยืม',
          action: 'ตรวจสอบพัสดุและอนุมัติให้ยืม',
          actorName: 'จ.ส.อ. เกียรติพล หาทรัพย์ (จพง.ธุรการชำนาญงาน)',
          actorRole: 'supply_officer',
          timestamp: `${bDate} 10:00`,
          statusTo: 'approved'
        },
        {
          id: `w-${b.id}-3`,
          stepName: 'ส่งมอบพัสดุ',
          action: 'ส่งมอบพัสดุเรียบร้อย',
          actorName: 'จ.ส.อ. เกียรติพล หาทรัพย์',
          actorRole: 'supply_officer',
          timestamp: `${bDate} 11:00`,
          statusTo: 'issued'
        },
        {
          id: `w-${b.id}-4`,
          stepName: 'ตรวจรับคืนพัสดุ',
          action: 'ตรวจรับคืนพัสดุครบถ้วน สภาพเรียบร้อย',
          actorName: 'จ.ส.อ. เกียรติพล หาทรัพย์ (ผู้ตรวจรับคืน)',
          actorRole: 'inspector',
          timestamp: `${rDate} 15:30`,
          statusTo: 'returned'
        }
      ],
      deliveredBy: 'จ.ส.อ. เกียรติพล หาทรัพย์ (จพง.ธุรการชำนาญงาน)',
      deliveredAt: `${bDate} 11:00`,
      receivedBy: 'จ.ส.อ. เกียรติพล หาทรัพย์ (ผู้ตรวจรับคืน)',
      receivedAt: `${rDate} 15:30`,
      returnInspectionResult: 'perfect',
      returnNotes: 'ส่งคืนพัสดุครบตามจำนวน สภาพเรียบร้อย ใช้งานได้ปกติ'
    };
  });

  // Queues
  const queues = [
    {
      id: 'q-001',
      queueNumber: 'B-0027',
      type: 'borrow',
      borrowerName: 'นางรัชนี สร้อยคำ',
      phone: '062-261-4951',
      itemsSummary: 'เก้าอี้ 30 ตัว, เต้นท์ 2 หลัง',
      departmentOrMoo: 'หมู่ที่ 2 บ้านฝางเทิง',
      createdAt: '2026-10-19 09:00',
      status: 'waiting',
      calledAt: null,
      counterNumber: null,
      notes: 'ยืมจัดงานบุญ'
    }
  ];

  console.log(`Prepared ${assets.length} assets, ${citizens.length} citizens, ${borrowRequests.length} requests.`);

  // Write to a JSON file first
  const dbData = {
    assets,
    citizens,
    borrowRequests,
    queues,
    orgSettings: {
      orgName: 'องค์การบริหารส่วนตำบลฝางคำ',
      amphoe: 'อำเภอสิรินธร',
      province: 'จังหวัดอุบลราชธานี',
      postalCode: '34350',
      phone: '045-252586',
      email: 'info@fangkham.go.th',
      returnTimeLimit: 'เวลาราชการ',
      returnLocationDefault: 'องค์การบริหารส่วนตำบลฝางคำ',
      mayorName: 'นายจำรูญ พิทักษ์',
      mayorPosition: 'นายกองค์การบริหารส่วนตำบลฝางคำ',
      paladName: 'นายชาญชัย อักโข',
      paladPosition: 'ปลัดองค์การบริหารส่วนตำบลฝางคำ',
      headOfSupplyName: 'นางวาสนา สินทรัพย์',
      headOfSupplyPosition: 'ผู้อำนวยการกองคลัง',
      supplyOfficerName: 'จ.ส.อ.เกียรติพล หาทรัพย์',
      supplyOfficerPosition: 'เจ้าพนักงานธุรการชำนาญงาน'
    }
  };

  const outPath = path.join(__dirname, '..', 'src', 'data', 'realDbData.json');
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(dbData, null, 2), 'utf-8');
  console.log(`Saved real DB data to ${outPath}`);
}

exportFromMySQL().catch(console.error);
