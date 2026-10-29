// Play the quiz in a real browser, the way a visitor would.
//
//   npm install          # once, like the previews
//   npm run smoke
//
// The validator checks the content; this checks the page. It serves the site
// from this folder, plays a few full runs in headless Chromium, and opens each
// result's share link. It fails on a script error, a missing file, a run that
// never reaches a result, or a share link that shows a different result.
//
// Google Fonts is stubbed out so a run doesn't depend on the network.
// CHROMIUM_PATH picks a specific browser.

import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { dirname, join, extname, normalize } from 'node:path';
import { chromium } from 'playwright';

import { QUIZ_LENGTH } from '../src/core/select.js';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Long enough for a new question to stop ignoring clicks (SETTLE_MS in app.js).
const SETTLE_MS = 500;

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.md': 'text/markdown; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
};

/** A static server for the repo, close enough to GitHub Pages for this. */
function serve() {
  const server = createServer(async (req, res) => {
    let path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname));
    if (path.endsWith('/')) path += 'index.html';
    try {
      const body = await readFile(join(ROOT, path));
      res.writeHead(200, { 'content-type': TYPES[extname(path)] ?? 'application/octet-stream' });
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });
  return new Promise((resolve) => server.listen(0, '127.0.0.1', () => resolve(server)));
}

// Which answer to give at each step: always the first, always the last, and a mix.
const STRATEGIES = {
  first: () => 0,
  last: (_, count) => count - 1,
  mixed: (step, count) => (step * 7 + 3) % count,
};

const problems = [];

async function play(page, home, name, choose) {
  await page.goto(home);
  await page.click('[data-action="start"]');

  for (let step = 0; step < QUIZ_LENGTH; step++) {
    const options = page.locator(`[data-action="answer"][data-step="${step}"]`);
    await options.first().waitFor();
    await page.waitForTimeout(SETTLE_MS);
    await options.nth(choose(step, await options.count())).click();
  }

  const title = page.locator('#result-title .result-name');
  await title.waitFor({ timeout: 5000 });
  const result = (await title.innerText()).replace(/\s+/g, ' ').trim();
  const shareUrl = page.url();
  if (!/\/r\/[a-z0-9-]+\/#/.test(shareUrl)) problems.push(`${name}: address bar isn't a share link: ${shareUrl}`);

  // A share link goes through r/<id>/ and back to the quiz, which replays the run.
  // Leave first, or the browser treats it as a jump within the same page.
  await page.goto('about:blank');
  await page.goto(shareUrl);
  await page.waitForURL((url) => !url.pathname.includes('/r/'));
  await title.waitFor({ timeout: 5000 });
  const shared = (await title.innerText()).replace(/\s+/g, ' ').trim();
  if (shared !== result) problems.push(`${name}: share link showed "${shared}", the run showed "${result}"`);

  console.log(`  ✓ ${name.padEnd(6)} ${result}`);
}

const server = await serve();
const home = `http://127.0.0.1:${server.address().port}/`;
const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });

try {
  const context = await browser.newContext({ reducedMotion: 'reduce' });
  await context.route(/fonts\.(googleapis|gstatic)\.com/, (route) =>
    route.fulfill({ status: 200, contentType: 'text/css', body: '' }),
  );
  const page = await context.newPage();
  page.on('pageerror', (error) => problems.push(`script error: ${error.message}`));
  page.on('console', (msg) => {
    if (msg.type() === 'error') problems.push(`console error: ${msg.text()}`);
  });
  page.on('response', (res) => {
    if (res.url().startsWith(home) && res.status() >= 400) problems.push(`${res.status()} for ${res.url()}`);
  });

  console.log('\n  which-model-are-you · playing the quiz in Chromium\n');
  for (const [name, choose] of Object.entries(STRATEGIES)) {
    try {
      await play(page, home, name, choose);
    } catch (error) {
      problems.push(`${name}: ${error.message.split('\n')[0]}`);
    }
  }
} finally {
  await browser.close();
  server.close();
}

if (problems.length) {
  console.log('\n  FAILED\n');
  for (const p of new Set(problems)) console.log(`  ✗ ${p}`);
  console.log('');
  process.exit(1);
}

console.log('\n  ✓ all runs reached a result, and their share links replay it\n');
