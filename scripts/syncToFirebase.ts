import fs from 'fs';
import path from 'path';

async function syncToFirebase() {
  const jsonPath = path.resolve(process.cwd(), 'src/data/realDbData.json');
  if (!fs.existsSync(jsonPath)) {
    console.error('realDbData.json not found');
    process.exit(1);
  }

  const raw = fs.readFileSync(jsonPath, 'utf-8');
  const payload = JSON.parse(raw);

  const url = 'https://duty-fangkham-default-rtdb.asia-southeast1.firebasedatabase.app/borrow_system.json';

  console.log('Pushing real data to Firebase RTDB:', url);
  const response = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    console.error(`Firebase push failed with status ${response.status}: ${await response.text()}`);
    process.exit(1);
  }

  console.log('Firebase Realtime Database synchronized successfully!');
}

syncToFirebase().catch(err => {
  console.error('Sync error:', err);
  process.exit(1);
});
