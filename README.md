# ระบบบริหารการยืมวัสดุ ครุภัณฑ์ และทรัพย์สิน อบต.ฝางคำ (Borrow System Fangkham SAO)

ระบบเว็บแอปพลิเคชันบริหารจัดการคำขอยืม คลังพัสดุครุภัณฑ์ อนุมัติ ส่งมอบ ตรวจสภาพ แจ้งเตือน คืนของ จัดการคิว และพิมพ์เอกสารราชการพร้อมใบส่วนท้ายฉีกได้ (Tear-off Slip) สำหรับองค์การบริหารส่วนตำบลฝางคำ

---

## 🌟 ฟังก์ชันหลัก
- 📦 **ทะเบียนครุภัณฑ์ & พัสดุ**: ค้นหา, กรองหมวดหมู่, สแกน QR Code/Barcode, ตรวจสอบสถานะความพร้อม
- 📝 **ยื่นคำขอยืมพัสดุออนไลน์**: รองรับทั้งประชาชนทั่วไปและเจ้าหน้าที่ อบต.
- 🚦 **ระบบคิวบริการอัตโนมัติ (Queue Center)**: เรียกคิว, พิมพ์บัตรคิว, เสียงประกาศภาษาไทย
- 🔍 **จุดตรวจรับคืนพัสดุ (Inspection Center)**: บันทึกสภาพ, ถ่ายภาพหลักฐาน, คำนวณค่าปรับ/ค่าเสียหาย
- 📄 **พิมพ์เอกสารราชการ & สลิปฉีกได้**: แบบฟอร์มขออนุมัติยืม, ใบเสร็จรับคืนพัสดุ
- ☁️ **เชื่อมต่อ Firebase Cloud Real-time**: ซิงค์ข้อมูลข้ามเครื่องแบบสดๆ พร้อมระบบสำรองในตัว (LocalStorage Fallback)
- 🚀 **รองรับ Deploy บน Render & Firebase Hosting**: พร้อมใช้งานทันที

---

## 🚀 การติดตั้งและรันในเครื่อง (Local Development)

### 1. ติดตั้ง Dependencies
```bash
npm install
```

### 2. รันโหมด Development
```bash
npm run dev
```
เปิดบราวเซอร์ที่: `http://localhost:3000`

### 3. รันโหมด Production Server (Express)
```bash
npm run build
npm start
```
เปิดบราวเซอร์ที่: `http://localhost:3000`

---

## 🌐 การนำขึ้น Render (render.com)

โปรเจกต์นี้มีไฟล์ `render.yaml` เตรียมไว้เรียบร้อยแล้ว รองรับการ Deploy 2 รูปแบบ:

### วิธีที่ 1: Deploy แบบ Static Site (ฟรี 100%, เร็วที่สุด)
1. เข้าไปที่ [Render Dashboard](https://dashboard.render.com/)
2. คลิก **New +** > **Static Site**
3. เลือก Repository: `glad92025-sketch/borrow-system`
4. ตั้งค่า:
   - **Build Command:** `npm run build`
   - **Publish Directory:** `dist`
5. คลิก **Create Static Site**

### วิธีที่ 2: Deploy แบบ Web Service (Node.js + Express)
1. เข้าไปที่ [Render Dashboard](https://dashboard.render.com/)
2. คลิก **New +** > **Web Service**
3. เลือก Repository: `glad92025-sketch/borrow-system`
4. ตั้งค่า:
   - **Environment:** `Node`
   - **Build Command:** `npm install && npm run build`
   - **Start Command:** `npm start`
5. คลิก **Create Web Service**

---

## 🔥 การนำขึ้น Firebase Hosting & Database

โปรเจกต์นี้เชื่อมต่อกับ Firebase โปรเจกต์ `duty-fangkham` เรียบร้อยแล้ว:
- **Realtime Database**: ซิงค์ข้อมูลสถานะการยืม ทะเบียนทรัพย์สิน และคิวแบบสดๆ
- **Firestore**: บันทึกการตั้งค่าองค์กรและสถิติ
- **Hosting**: มีไฟล์ `firebase.json` และ `.firebaserc` พร้อม Deploy

### คำสั่ง Deploy ขึ้น Firebase Hosting:
```bash
# 1. ติดตั้ง Firebase CLI (หากยังไม่มี)
npm install -g firebase-tools

# 2. ล็อกอิน Firebase
firebase login

# 3. Build โปรเจกต์
npm run build

# 4. Deploy ขึ้น Firebase Hosting
firebase deploy --only hosting
```
ลิงก์แอปจะอยู่ที่: `https://duty-fangkham.web.app` หรือ `https://duty-fangkham.firebaseapp.com`
