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
