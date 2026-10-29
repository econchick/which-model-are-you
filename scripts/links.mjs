#!/usr/bin/env node
// Check that every link in the site's pages points at a file that exists.
//
//   npm run links
//
// Reads index.html and every r/<model>/index.html, and follows each href, src
// and URL-valued <meta> (og:image, og:url…). Relative links are resolved from
// the page; links to the site's own address (the canonical URL, as the preview
// tags use) are checked against this folder, as if it were deployed. Links to
// anywhere else (Google Fonts, GitHub) aren't fetched — that would make the
// check depend on the network.

import { readFileSync, existsSync, statSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, relative } from 'node:path';

import { PREVIEW_DIR, siteUrl } from './preview-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const SITE = new URL(siteUrl(readFileSync(join(ROOT, 'index.html'), 'utf8')));

const pages = [
  'index.html',
  ...readdirSync(join(ROOT, PREVIEW_DIR), { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => join(PREVIEW_DIR, d.name, 'index.html'))
    .filter((p) => existsSync(join(ROOT, p))),
];

// href="…" and src="…" anywhere, plus <meta content="…"> when it holds a URL.
const ATTRS = /\s(?:href|src)="([^"]*)"/g;
const META = /<meta\s[^>]*content="((?:https?:)?\/\/[^"]*|\.{0,2}\/[^"]*)"/g;

/** The file a site URL is served from, or null if there isn't one. */
function fileFor(url) {
  const path = decodeURIComponent(url.pathname.slice(SITE.pathname.length));
  const file = join(ROOT, path);
  if (!existsSync(file)) return null;
  if (statSync(file).isDirectory()) return existsSync(join(file, 'index.html')) ? join(file, 'index.html') : null;
  return file;
}

const broken = [];
let checked = 0;

for (const page of pages) {
  const html = readFileSync(join(ROOT, page), 'utf8');
  // Where this page sits on the deployed site, so relative links resolve as a browser would.
  const base = new URL(page.replace(/index\.html$/, ''), SITE);
  const links = [...html.matchAll(ATTRS), ...html.matchAll(META)].map((m) => m[1]);

  for (const link of links) {
    if (!link || link.startsWith('#') || /^(mailto|data|javascript):/.test(link)) continue;
    const url = new URL(link, base);
    if (url.origin !== SITE.origin || !url.pathname.startsWith(SITE.pathname)) continue;
    checked++;
    if (!fileFor(url)) broken.push(`${page}: ${link} (no ${relative(ROOT, join(ROOT, url.pathname.slice(SITE.pathname.length))) || '.'})`);
  }
}

console.log(`\n  which-model-are-you · checked ${checked} links in ${pages.length} pages`);

if (broken.length) {
  console.log('\n  FAILED\n');
  for (const b of broken) console.log(`  ✗ ${b}`);
  console.log('');
  process.exit(1);
}

console.log('\n  ✓ every link points at a file\n');
