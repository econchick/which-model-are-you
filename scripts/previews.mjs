// Build the link previews. For every model: r/<id>/index.html, the page a share
// link points at, with the tags Slack, iMessage and friends read; and
// r/<id>/card.png, the image they show. Plus r/card.png, the preview for links
// to the quiz itself. See scripts/preview-data.mjs for why it works this way.
//
//   npm install          # once: this is the only part of the project that
//   npm run previews     # needs anything installed (a headless browser)
//
// Run it after editing content/, and commit what it writes. The validator
// fails if a model has no page — its share links would 404 — and warns when a
// card is out of date.
//
// Cards are drawn by headless Chromium using the site's own stylesheet and
// fonts, so they look like the site. CHROMIUM_PATH picks a specific browser.

import { readFileSync, writeFileSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname } from 'node:path';
import { chromium } from 'playwright';

import { parseModels, parseInterface } from '../src/core/parse.js';
import { renderBurst } from '../src/ui/render.js';
import { PREVIEW_DIR, CARD_FILE, CARD_SIZE, siteUrl, previewFor, pageHtml } from './preview-data.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const read = (path) => readFileSync(join(ROOT, path), 'utf8');

const FONTS =
  'https://fonts.googleapis.com/css2?family=Bagel+Fat+One&family=Caveat+Brush&family=Gabarito:wght@400..900&display=swap';
const NEEDED_FONTS = ['Bagel Fat One', 'Gabarito', 'Caveat Brush'];

const esc = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);

// Layout for a 1200×630 card: the result on the left as a sticker slapped on
// the page, and the invitation on the right. Everything else — colours, fonts,
// the tape, the tab, the starburst — comes from styles/app.css.
const CARD_CSS = `
  html, body { width: ${CARD_SIZE.width}px; height: ${CARD_SIZE.height}px; overflow: hidden; }
  body { display: block; min-height: 0; }
  .pv {
    position: relative;
    display: grid;
    grid-template-columns: 680px 1fr;
    gap: 48px;
    height: 100%;
    padding: 62px 58px 66px 62px;
  }
  .pv-card {
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    min-width: 0;
    padding: 44px 48px 40px;
    background: var(--accent-to);
    border: 4px solid var(--ink);
    border-radius: 36px;
    box-shadow: 12px 12px 0 var(--ink);
    transform: rotate(-1.5deg);
  }
  .pv-card .tape { top: -22px; left: 44px; padding: 9px 20px; font-size: 21px; }
  .pv-name {
    margin: 0;
    font-family: var(--display);
    font-weight: 400;
    font-size: 124px;
    line-height: 0.98;
    color: var(--paper);
    -webkit-text-stroke: 13px var(--ink);
    paint-order: stroke fill;
    text-shadow: 8px 9px 0 var(--accent-from);
  }
  .pv-word { white-space: nowrap; }
  .pv-tagline {
    margin: 16px 0 18px;
    font-family: var(--hand);
    font-size: 44px;
    line-height: 1.1;
    transform: rotate(-2deg);
    transform-origin: left center;
  }
  .pv-reading {
    margin: 0;
    font-weight: 600;
    font-size: 28px;
    line-height: 1.38;
    display: -webkit-box;
    -webkit-line-clamp: 4;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  .pv-side {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    gap: 20px;
    min-width: 0;
  }
  .pv-side .quiz-badge { margin: 0 0 4px; font-size: 32px; padding: 8px 18px 11px; }
  .pv-side .title { font-size: 74px; -webkit-text-stroke: 9px var(--ink); text-shadow: 7px 8px 0 var(--ink); }
  .pv-side .burst { width: 184px; height: 184px; align-self: flex-end; cursor: default; }
  .pv-side .burst-label { max-width: 62%; font-size: 30px; line-height: 0.95; text-align: center; }
`;

/** Shrink an element's font until it fits its box in at most `lines` lines. */
function fitScript() {
  return `
    for (const [selector, lines] of [['.pv-name', 2], ['.pv-side .title', 2]]) {
      const el = document.querySelector(selector);
      let size = parseFloat(getComputedStyle(el).fontSize);
      const tooBig = () =>
        el.scrollWidth > el.clientWidth + 1 ||
        el.getBoundingClientRect().height > parseFloat(getComputedStyle(el).lineHeight) * lines + 4;
      while (size > 36 && tooBig()) {
        size -= 2;
        el.style.fontSize = size + 'px';
      }
    }`;
}

function cardHtml(preview, copy, appCss) {
  const [from, to] = preview.accent;
  const name = preview.name.split(' ').map((w) => `<span class="pv-word">${esc(w)}</span>`).join(' ');
  const title = copy['intro.title'].split('\n').map((l) => `<span class="title-line">${esc(l)}</span>`).join(' ');
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <link rel="stylesheet" href="${FONTS}" />
    <style>${appCss}</style>
    <style>${CARD_CSS}</style>
  </head>
  <body style="--accent-from:${esc(from)}; --accent-to:${esc(to)}">
    <div class="halftone"></div>
    <div class="pv">
      <article class="pv-card">
        <p class="tape">${esc(preview.got)}</p>
        <h1 class="pv-name">${name}</h1>
        <p class="pv-tagline">${esc(preview.tagline)}</p>
        <p class="pv-reading">${esc(preview.excerpt)}</p>
      </article>
      <aside class="pv-side">
        <p class="quiz-badge">${esc(copy['intro.badge'])}</p>
        <p class="title">${title}</p>
        <div class="burst">${renderBurst()}<span class="burst-label">${esc(preview.cta)}</span></div>
      </aside>
    </div>
  </body>
</html>`;
}

/** Load the web fonts, and refuse to draw a card with fallbacks in it. */
async function fontsReady(page) {
  return page.evaluate(async (families) => {
    const load = Promise.all(families.map((f) => document.fonts.load(`32px "${f}"`)));
    await Promise.race([load, new Promise((r) => setTimeout(r, 15000))]).catch(() => {});
    return families.every((f) => document.fonts.check(`32px "${f}"`));
  }, NEEDED_FONTS);
}

async function withFonts(page, load, what) {
  for (let attempt = 1; attempt <= 3; attempt++) {
    await load();
    if (await fontsReady(page)) return;
    console.warn(`  fonts didn't load for ${what} (attempt ${attempt}), retrying`);
  }
  throw new Error(`couldn't load the web fonts for ${what}; not writing a card with fallback fonts`);
}

const TYPES = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.md': 'text/markdown', '.svg': 'image/svg+xml' };

async function main() {
  const site = siteUrl(read('index.html'));
  const models = parseModels(read('content/models.md'));
  const copy = parseInterface(read('content/interface.md'));
  const appCss = read('styles/app.css');

  const out = join(ROOT, PREVIEW_DIR);
  rmSync(out, { recursive: true, force: true });
  mkdirSync(out, { recursive: true });

  const browser = await chromium.launch({
    executablePath: process.env.CHROMIUM_PATH || undefined,
    proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined,
  });
  const page = await browser.newPage({ viewport: CARD_SIZE, ignoreHTTPSErrors: Boolean(process.env.HTTPS_PROXY) });

  // The quiz itself, served from this checkout, for the generic card.
  await page.route('http://site.local/**', async (route) => {
    let path = new URL(route.request().url()).pathname;
    if (path.endsWith('/')) path += 'index.html';
    try {
      await route.fulfill({ body: readFileSync(join(ROOT, path)), contentType: TYPES[extname(path)] ?? 'application/octet-stream' });
    } catch {
      await route.fulfill({ status: 404 });
    }
  });

  console.log(`\n  link previews for ${site}`);
  for (const model of models) {
    const preview = previewFor(model, copy, site);
    await withFonts(page, () => page.setContent(cardHtml(preview, copy, appCss), { waitUntil: 'load' }), model.id);
    await page.evaluate(fitScript());
    mkdirSync(join(out, model.id), { recursive: true });
    await page.screenshot({ path: join(out, model.id, CARD_FILE) });
    writeFileSync(join(out, model.id, 'index.html'), pageHtml(preview));
    console.log(`  ✓ ${model.id}`);
  }

  // Links to the quiz itself get its opening screen. The crab stays hidden.
  await withFonts(page, async () => {
    await page.goto('http://site.local/', { waitUntil: 'load' });
    await page.addStyleTag({ content: '.crab { display: none; } .screen { animation: none; }' });
  }, 'the quiz');
  await page.screenshot({ path: join(out, CARD_FILE) });
  console.log(`  ✓ ${PREVIEW_DIR}/${CARD_FILE}\n`);

  await browser.close();
}

main().catch((error) => {
  console.error(`\n  ✗ ${error.message}\n`);
  process.exit(1);
});
