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

// Parse JSON bodies for API routes (limit to prevent abuse). 32kb fits the longest enquiry the
// form allows (CONTACT_LIMITS in src/app/services/contact.service.ts) at up to 3 bytes a
// character, plus a full-length (2,048-character) Turnstile token.
app.use('/api', express.json({ limit: '32kb' }));

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

// ── Retired pages ───────────────────────────────────────────────────────────
// Prices are agreed per scope now, so the pricing page is gone: old links and search results
// get a permanent redirect to the home page instead of the SPA fallback's 200.
app.get('/pricing', (req, res) => res.redirect(301, '/'));

// Serve pre-compressed static assets (*.br preferred, *.gz fallback, raw otherwise)
app.use(expressStaticGzip(DIST, {
  enableBrotli: true,
  orderPreference: ['br', 'gz'],
  serveStatic: {
    maxAge: '1y',
    immutable: true,
    setHeaders(res, filePath) {
      if (/\.html(\.br|\.gz)?$/.test(filePath)) {
        res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
      } else if (/[\\/]fonts\.css(\.br|\.gz)?$/.test(filePath)) {
        // index.html loads fonts.css by name, so it has no content hash but points at hashed
        // font files — revalidate every time so a deploy never leaves it pointing at deleted files
        res.setHeader('Cache-Control', 'no-cache');
      } else if (filePath.includes(`${path.sep}i18n${path.sep}`)) {
        // The app loads the locale files by name (subfolders too: i18n/legal/), while its own code is
        // hashed — revalidate every time so a deploy never pairs new code with old copy (an unchanged
        // file comes back as a 304)
        res.setHeader('Cache-Control', 'no-cache');
      } else if (/\.(txt|xml)(\.br|\.gz)?$/.test(filePath)) {
        // robots.txt, sitemap.xml and llms.txt have no content hash —
        // use short cache so deploys take effect
        res.setHeader('Cache-Control', 'public, max-age=3600');
      }
    },
  },
}));

// Every page has its own HTML: the same app with that page's title, description and canonical URL
// in the head (scripts/page-heads.js writes them at build time), so search engines index /about or
// /contact as pages of their own. Read once; a request can only pick a name from this list.
const PAGES_DIR = path.join(DIST, 'pages');
const PAGE_FILES = new Set(
  fs.existsSync(PAGES_DIR)
    ? fs.readdirSync(PAGES_DIR).filter((file) => file.endsWith('.html')).map((file) => file.slice(0, -'.html'.length))
    : [],
);

// SPA fallback — serve the route's pre-compressed HTML (index.html for a route without its own).
// Routes never contain a file extension, so a missing file (e.g. a stale chunk or
// /.well-known/ai-catalog.json probed by crawlers) gets a real 404, not HTML with 200.
app.get('/{*path}', (req, res) => {
  if (path.extname(req.path)) {
    return res.sendStatus(404);
  }

  const route = req.path.replace(/^\/+|\/+$/g, '');
  const html = path.join(DIST, PAGE_FILES.has(route) ? path.join('pages', `${route}.html`) : 'index.html');

  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
  res.setHeader('Vary', 'Accept-Encoding');
  const ae = req.headers['accept-encoding'] || '';
  if (ae.includes('br') && fs.existsSync(`${html}.br`)) {
    res.setHeader('Content-Encoding', 'br');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.sendFile(`${html}.br`);
  }
  if (ae.includes('gzip') && fs.existsSync(`${html}.gz`)) {
    res.setHeader('Content-Encoding', 'gzip');
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.sendFile(`${html}.gz`);
  }
  res.sendFile(html);
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
