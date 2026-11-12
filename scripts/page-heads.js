// Post-build: one HTML file per page, so every URL answers with its own <title>, description,
// canonical URL and breadcrumb. The app is a single-page app, and without this every URL would
// send the home page's head: search engines then read /about or /contact as copies of the home
// page and have no pages to list under the site's result. The copies differ from index.html in
// the head only; server.js sends pages/<route>.html for /<route>. The list is src/app/seo/pages.json,
// the one the app's routes and PageMetaService use.
const fs = require('fs');
const path = require('path');

const ORIGIN = 'https://jvm-yore.com';
const PAGES = require('../src/app/seo/pages.json');

const escapeHtml = (text) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** Replaces the one match of `pattern`; a head that no longer has the tag fails the build. */
function swap(html, pattern, replacement) {
  if (!pattern.test(html)) throw new Error(`page-heads: index.html has no match for ${pattern}`);
  return html.replace(pattern, () => replacement);
}

const content = (attribute, name, value) =>
  [new RegExp(`<meta ${attribute}="${name}" content="[^"]*">`), `<meta ${attribute}="${name}" content="${value}">`];

function headFor(html, route, { name, title, description }) {
  const url = `${ORIGIN}/${route}`;
  const safeTitle = escapeHtml(title);
  const safeDescription = escapeHtml(description);
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: PAGES[''].name, item: `${ORIGIN}/` },
      { '@type': 'ListItem', position: 2, name, item: url },
    ],
  };
  // "<" can't end the script element early when it is written as an escape
  const breadcrumbJson = JSON.stringify(breadcrumb).replace(/</g, '\\u003c');

  const swaps = [
    [/<title>[^<]*<\/title>/, `<title>${safeTitle}</title>`],
    content('name', 'description', safeDescription),
    content('property', 'og:title', safeTitle),
    content('property', 'og:description', safeDescription),
    content('property', 'og:url', url),
    content('name', 'twitter:title', safeTitle),
    content('name', 'twitter:description', safeDescription),
    [/<link rel="canonical" href="[^"]*">/,
      `<link rel="canonical" href="${url}">\n  <script type="application/ld+json">${breadcrumbJson}</script>`],
  ];
  return swaps.reduce((out, [pattern, replacement]) => swap(out, pattern, replacement), html);
}

/** Writes dist/…/browser/pages/<route>.html for every page but the home page (index.html is its file). */
function writePageHeads(dist) {
  const index = fs.readFileSync(path.join(dist, 'index.html'), 'utf8');
  const out = path.join(dist, 'pages');
  fs.rmSync(out, { recursive: true, force: true });
  fs.mkdirSync(out);

  const routes = Object.keys(PAGES).filter(Boolean);
  for (const route of routes) {
    fs.writeFileSync(path.join(out, `${route}.html`), headFor(index, route, PAGES[route]));
  }
  return routes.length;
}

module.exports = { writePageHeads };
