import express from 'express';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// CORS
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// Health check endpoint for Render / monitoring
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Borrow System Fangkham SAO',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Endpoint to sync or fetch the latest MySQL borrow_db records
app.get('/api/mysql/sync', async (req, res) => {
  try {
    const mysql = await import('mysql2/promise');
    const conn = await mysql.createConnection({
      host: 'localhost',
      port: 3306,
      user: 'root',
      password: '',
      database: 'borrow_db',
      charset: 'utf8mb4'
    });

    const [items]: any = await conn.query('SELECT * FROM items ORDER BY id ASC');
    const [borrow]: any = await conn.query('SELECT * FROM borrow ORDER BY id ASC');
    const [borrowItems]: any = await conn.query('SELECT * FROM borrow_items ORDER BY id ASC');
    await conn.end();

    res.json({
      success: true,
      source: 'MySQL localhost:3306/borrow_db',
      timestamp: new Date().toISOString(),
      counts: {
        items: items.length,
        borrow: borrow.length,
        borrowItems: borrowItems.length,
      },
      items,
      borrow,
      borrowItems
    });
  } catch (err: any) {
    // Fallback if MySQL is offline or running on cloud (Render)
    const jsonPath = path.join(__dirname, 'src', 'data', 'realDbData.json');
    if (fs.existsSync(jsonPath)) {
      const data = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
      res.json({
        success: true,
        source: 'realDbData.json (snapshot fallback)',
        timestamp: new Date().toISOString(),
        counts: {
          assets: data.assets?.length || 0,
          borrowRequests: data.borrowRequests?.length || 0,
        },
        data
      });
    } else {
      res.status(500).json({ success: false, message: err.message });
    }
  }
});

// Serve static assets from 'dist' directory
const distDir = path.join(__dirname, 'dist');
if (fs.existsSync(distDir)) {
  app.use(express.static(distDir));

  // SPA fallback: send index.html for all non-API routes
  app.get('*', (req, res) => {
    res.sendFile(path.join(distDir, 'index.html'));
  });
} else {
  app.get('*', (req, res) => {
    res.status(503).send('Application build in progress. Please run "npm run build" first.');
  });
}

app.listen(PORT, () => {
  console.log(`[Borrow System] Server running on http://localhost:${PORT}`);
  console.log(`[Borrow System] Mode: ${process.env.NODE_ENV || 'production'}`);
});
