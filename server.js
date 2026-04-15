const express = require('express');
const compression = require('compression');
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

// Compress all responses (gzip; skips already-cached immutable assets on repeat visits)
app.use(compression());

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

// Serve static assets
app.use(express.static(DIST));

// SPA fallback — all routes return index.html
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
