const express = require('express');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 8080;
const DIST = path.join(__dirname, 'dist/jvm-solutions/browser');

// Serve static assets
app.use(express.static(DIST));

// SPA fallback — all routes return index.html
app.get('/{*path}', (req, res) => {
  res.sendFile(path.join(DIST, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
