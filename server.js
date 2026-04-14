const express = require('express');
const path = require('path');

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

// Serve static assets
app.use(express.static(DIST));

// SPA fallback — all routes return index.html
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
