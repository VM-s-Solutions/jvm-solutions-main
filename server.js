const express = require('express');
const expressStaticGzip = require('express-static-gzip');
const path = require('path');
const fs = require('fs');

// In dev, load api/local.settings.json as environment variables so the
// contact handler has RESEND_API_KEY, TURNSTILE_SECRET_KEY, etc.
if (process.env.NODE_ENV !== 'production') {
  const settingsPath = path.join(__dirname, 'api', 'local.settings.json');
  if (fs.existsSync(settingsPath)) {
    const settings = JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    const values = settings.Values || {};
    for (const [key, value] of Object.entries(values)) {
      if (!(key in process.env)) {
        process.env[key] = String(value);
      }
    }
  }
}

const app = express();
const PORT = process.env.PORT || 8080;
const DIST = path.join(__dirname, 'dist/jvm-solutions/browser');

// Parse JSON bodies for API routes (limit to prevent abuse)
app.use('/api', express.json({ limit: '10kb' }));

// ── Contact form API ────────────────────────────────────────────────────────
app.post('/api/contact', async (req, res) => {
  try {
    const { processContactRequest } = require('./api/dist/src/contact-core');
    const result = await processContactRequest(req.body);
    res.status(result.status).json(result.body);
  } catch (err) {
    console.error('Contact API error', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve pre-compressed static assets (*.br preferred, *.gz fallback, raw otherwise)
app.use(expressStaticGzip(DIST, {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  serveStatic: {
    maxAge: '1y',
    immutable: true,
    setHeaders(res, filePath) {
      if (filePath.includes('index.html')) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      }
    },
  },
}));

// SPA fallback — serve pre-compressed index.html for client-side routes
app.get('/{*path}', (req, res) => {
  const ae = req.headers['accept-encoding'] || '';
  if (ae.includes('br') && fs.existsSync(path.join(DIST, 'index.html.br'))) {
    res.setHeader('Content-Encoding', 'br');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(path.join(DIST, 'index.html.br'));
  }
  if (ae.includes('gzip') && fs.existsSync(path.join(DIST, 'index.html.gz'))) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    return res.sendFile(path.join(DIST, 'index.html.gz'));
  }
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
