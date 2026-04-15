// Post-build: pre-compress all static assets with gzip (level 9) and brotli (level 11).
// express-static-gzip will serve *.br / *.gz with correct Content-Encoding headers.
const zlib = require('zlib');
const fs = require('fs');
const path = require('path');

const DIST = path.join(__dirname, '../dist/jvm-solutions/browser');
const COMPRESSIBLE = new Set(['.js', '.css', '.html', '.json', '.svg', '.xml', '.txt']);

function* walkDir(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkDir(full);
    else yield full;
  }
}

async function compressFile(file) {
  const content = fs.readFileSync(file);
  const [gz, br] = await Promise.all([
    new Promise((res, rej) =>
      zlib.gzip(content, { level: 9 }, (err, d) => (err ? rej(err) : res(d)))),
    new Promise((res, rej) =>
      zlib.brotliCompress(content, {
        params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 11 },
      }, (err, d) => (err ? rej(err) : res(d)))),
  ]);
  fs.writeFileSync(file + '.gz', gz);
  fs.writeFileSync(file + '.br', br);
}

async function run() {
  if (!fs.existsSync(DIST)) {
    console.error('dist not found — run ng build first');
    process.exit(1);
  }
  const files = [...walkDir(DIST)].filter(f =>
    COMPRESSIBLE.has(path.extname(f)) && !f.endsWith('.gz') && !f.endsWith('.br'));

  await Promise.all(files.map(compressFile));
  console.log(`Compressed ${files.length} files (gzip + brotli)`);
}

run().catch(err => { console.error(err); process.exit(1); });
