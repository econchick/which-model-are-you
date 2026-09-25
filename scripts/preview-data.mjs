// Link previews: what a shared result looks like in Slack, iMessage and the like.
//
// A link preview comes from the <meta> tags of the page a link points to, read by
// a crawler that never runs JavaScript and never sees the #hash. So every model
// gets a small static page of its own, r/<model>/index.html, carrying that
// model's tags and card image, and a share link points there with the run in its
// hash. The page sends people straight on to the quiz, hash and all.
//
// This file is the pure part — what each page and card says — shared by
// scripts/previews.mjs, which builds them, and scripts/validate.mjs, which checks
// they exist and are current.

import { createHash } from 'node:crypto';
import { fill } from '../src/data/content.js';

export const PREVIEW_DIR = 'r';
export const CARD_FILE = 'card.png';
export const CARD_SIZE = { width: 1200, height: 630 };

/** The site's public address, from the canonical link in index.html. */
export function siteUrl(indexHtml) {
  const match = indexHtml.match(/<link\s+rel="canonical"\s+href="([^"]+)"/);
  if (!match) {
    throw new Error('index.html needs <link rel="canonical" href="https://…/"> — link previews need absolute URLs');
  }
  return match[1].endsWith('/') ? match[1] : `${match[1]}/`;
}

/** The reading a model shows when there's no answer-specific variant. */
const defaultBlurb = (model) => (model.blurbs.find((b) => b.when === '*') ?? model.blurbs[0]).text;

/** The first sentence or two of a reading, as plain text: enough to tempt. */
export function excerpt(text, limit = 140) {
  const plain = text
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/\s*\n+\s*/g, ' ')
    .trim();
  const sentences = plain.match(/[^.!?]+[.!?]+["”’']?(\s+|$)/g) ?? [plain];
  let out = '';
  for (const sentence of sentences) {
    if (out && (out + sentence).length > limit) break;
    out += sentence;
  }
  out = out.trim();
  return out.length > limit + 20 ? `${out.slice(0, limit).replace(/\s+\S*$/, '')}…` : out;
}

/** Everything one model's preview page and card say. */
export function previewFor(model, copy, site) {
  return {
    id: model.id,
    name: model.name,
    tagline: model.tagline,
    accent: model.accent,
    excerpt: excerpt(defaultBlurb(model)),
    title: fill(copy['preview.title'], { name: model.name }),
    got: copy['preview.got'],
    cta: copy['preview.cta'],
    link: copy['preview.link'],
    siteName: copy['intro.title'].replace(/\s*\n\s*/g, ' '),
    url: `${site}${PREVIEW_DIR}/${model.id}/`,
    image: `${site}${PREVIEW_DIR}/${model.id}/${CARD_FILE}`,
  };
}

/** A short hash of everything a preview shows, so stale ones can be spotted. */
export function fingerprint(preview) {
  return createHash('sha256').update(JSON.stringify(preview)).digest('hex').slice(0, 12);
}

/** Read the fingerprint back out of a built page. */
export const fingerprintOf = (html) => html.match(/<meta name="preview-fingerprint" content="([^"]+)"/)?.[1] ?? null;

const attr = (s) =>
  String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);

/** The model's page: tags for the crawler, a redirect for everyone else. */
export function pageHtml(preview) {
  const p = Object.fromEntries(Object.entries(preview).map(([k, v]) => [k, attr(v)]));
  return `<!doctype html>
<!-- Built by scripts/previews.mjs from content/. Edit those and run it again. -->
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>${p.title}</title>
    <meta name="description" content="${p.excerpt}" />
    <meta name="preview-fingerprint" content="${fingerprint(preview)}" />
    <meta name="robots" content="noindex" />
    <link rel="canonical" href="${p.url}" />
    <meta property="og:type" content="website" />
    <meta property="og:site_name" content="${p.siteName}" />
    <meta property="og:title" content="${p.title}" />
    <meta property="og:description" content="${p.excerpt}" />
    <meta property="og:url" content="${p.url}" />
    <meta property="og:image" content="${p.image}" />
    <meta property="og:image:width" content="${CARD_SIZE.width}" />
    <meta property="og:image:height" content="${CARD_SIZE.height}" />
    <meta property="og:image:alt" content="${p.name}: ${p.tagline}" />
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="theme-color" content="${attr(preview.accent[0])}" />
    <link rel="icon" href="../../favicon.svg" type="image/svg+xml" />
    <script>location.replace('../../' + location.hash);</script>
  </head>
  <body>
    <a href="../../">${p.link}</a>
  </body>
</html>
`;
}
