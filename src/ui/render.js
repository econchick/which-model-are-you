// Rendering. Pure: each function returns the HTML for one step of the chart,
// flow.js puts the steps on the page, and app.js owns the state.
//
// Every visible word comes in through `copy` (content/interface.md) — there are
// no hardcoded strings below, so changing wording never means editing render
// code.

import { AXES } from '../data/axes.js';
import { fill } from '../data/content.js';
import { renderSigil } from './sigil.js';

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);

/**
 * Authored prose → HTML. Escapes first, then allows the small bit of Markdown
 * worth having in a blurb: blank lines separate paragraphs, single newlines are
 * line breaks, and **bold** / *italic* work.
 */
const prose = (text) =>
  escape(text)
    .split(/\n\n+/)
    .map(
      (p) =>
        `<p>${p
          .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
          .replace(/(^|\W)\*(\S(?:.*?\S)?)\*(?!\*)/g, '$1<em>$2</em>')
          .replace(/\n/g, '<br>')}</p>`,
    )
    .join('');

/** A label that's nothing but emoji, like 🍞: it's the whole answer, so it's shown big. */
const EMOJI_ONLY = /^(?:\p{Extended_Pictographic}|\p{Emoji_Modifier}|\u200d|\ufe0f|\s)+$/u;

/** Copy that is a single line of text, with line breaks honoured. */
const line = (text) => escape(text).replace(/\n/g, '<br>');

/**
 * Fill placeholders with values that are already HTML.
 *
 * The template is escaped first — `{name}` survives that, since braces aren't
 * escaped — so authored copy can never inject markup, while the values we
 * substitute are free to carry their own tags.
 */
const fillHtml = (template, values) =>
  escape(String(template ?? '')).replace(/\{(\w+)\}/g, (whole, key) =>
    key in values ? values[key] : whole,
  );

/** The top of the chart: the title, and the starburst every wire starts from. */
export function renderStart(copy) {
  // One span per line, so each can take its own colour. The spaces between
  // them keep the title reading as a sentence to a screen reader.
  const title = String(copy['intro.title'] ?? '')
    .split('\n')
    .map((l) => `<span class="title-line">${escape(l)}</span>`)
    .join(' ');

  return `
    <section class="screen start" aria-labelledby="intro-title">
      <div class="masthead">
        <p class="quiz-badge">${line(copy['intro.badge'])}</p>
        <h1 id="intro-title" class="title" tabindex="-1">${title}</h1>
      </div>
      <button class="burst" data-action="start" data-wire data-lane="start">
        ${renderBurst()}
        <span class="burst-label">${line(copy['intro.button'])}</span>
      </button>
    </section>`;
}

/** A starburst with one point aimed straight down, where the first wire leaves it. */
function renderBurst(points = 16) {
  const corners = Array.from({ length: points * 2 }, (_, i) => {
    const r = i % 2 === 0 ? 48 : 39;
    const a = Math.PI / 2 + (i * Math.PI) / points;
    return `${(Math.cos(a) * r).toFixed(1)},${(Math.sin(a) * r).toFixed(1)}`;
  });
  return `<svg class="burst-shape" viewBox="-52 -52 104 104" aria-hidden="true">
          <polygon points="${corners.join(' ')}" />
        </svg>`;
}

/**
 * One question in the chart. `data-wire` marks what a wire leaves from, and
 * `.step-node` is where the wire from the previous answer arrives. `data-lane`
 * is the answer's position, which sets its colour and its wire's colour.
 */
export function renderStep({ question, index, total, copy }) {
  const id = `q-${index}`;
  const options = question.options
    .map(
      (opt, i) => `
      <li>
        <button class="answer${EMOJI_ONLY.test(opt.label) ? ' answer--emoji' : ''}"
                data-action="answer" data-step="${index}" data-index="${i}"
                data-wire data-lane="${i}" role="radio" aria-checked="false">
          <span class="answer-key" aria-hidden="true">${i + 1}</span>
          <span class="answer-label">${escape(opt.label)}</span>
        </button>
      </li>`,
    )
    .join('');

  const counter = fill(copy['quiz.progress'], { n: index + 1, total });
  const whimsy = question.section === 'whimsy'
    ? `<span class="q-note">${line(copy['quiz.whimsy'])}</span>`
    : '';

  return `
    <section class="question" aria-labelledby="${id}">
      <span class="step-node" aria-hidden="true"></span>
      <div class="bubble">
        <span class="q-badge" data-lane="${index % 4}" aria-hidden="true"><b>${index + 1}</b><small>/${total}</small></span>
        ${whimsy}
        <p class="sr-only">${escape(counter)}</p>
        <h2 id="${id}" class="question-text" tabindex="-1">${escape(question.prompt)}</h2>
      </div>
      <ul class="answers" role="radiogroup" aria-labelledby="${id}"
          style="--count:${question.options.length}">${options}</ul>
    </section>`;
}

/**
 * The end of the chart. `standalone` is a result opened from a shared link,
 * with no chart above it for a wire to arrive from.
 */
export function renderResult({ model, runnerUp, blurb, userVector, shareHref, standalone, copy }) {
  const [from, to] = model.accent;
  const rising = runnerUp
    ? fillHtml(copy['result.rising'], {
        name: `<strong>${escape(runnerUp.name)}</strong>`,
        // It lands mid-sentence after a dash, and the copy brings its own full
        // stop: "Already done. Already gone." → "already done. Already gone".
        tagline: escape(
          runnerUp.tagline.charAt(0).toLowerCase() + runnerUp.tagline.slice(1).replace(/[.!?]+$/, ''),
        ),
      })
    : '';

  return `
    <section class="result${standalone ? ' screen' : ''}" aria-labelledby="result-title"
             style="--accent-from:${escape(from)}; --accent-to:${escape(to)}">
      ${standalone ? '' : '<span class="step-node" aria-hidden="true"></span>'}
      <div class="result-card">
        <p class="tape">${line(copy['result.eyebrow'])}</p>
        <div class="result-crown">
          ${renderSigil(model.axes, userVector, model.accent, model.id)}
        </div>
        <h1 id="result-title" class="result-title" tabindex="-1">
          <span class="result-you">${line(copy['result.youAre'])}</span>
          <span class="result-name" style="--fit:${longestWord(model.name)}">${nameHtml(model.name)}</span>
        </h1>
        <p class="result-tagline">${escape(model.tagline)}</p>
        ${model.rare ? `<p class="rare-flag">${line(copy['result.rare'])}</p>` : ''}
        <div class="blurb">${prose(blurb)}</div>
        ${rising ? `<p class="rising">${rising}</p>` : ''}
        ${renderChart(userVector, copy)}
      </div>
      <div class="result-actions">
        <button class="btn btn--primary" data-action="share" data-href="${escape(shareHref)}">
          ${line(copy['result.share'])}
        </button>
        <button class="btn btn--ghost" data-action="restart">${line(copy['result.restart'])}</button>
      </div>
    </section>`;
}

/**
 * Model names are set huge, so they may only break between words: never at the
 * hyphen in "Qwen3.8-Max". The stylesheet sizes the lettering so the longest
 * word still fits the card.
 */
const nameHtml = (name) =>
  name.split(' ').map((word) => `<span class="result-word">${escape(word)}</span>`).join(' ');

const longestWord = (name) => Math.max(...name.split(' ').map((word) => word.length));

/** The player's own chart, in words — the "why this model" receipt. */
function renderChart(userVector, copy) {
  const rows = AXES.map((axis) => {
    const v = userVector[axis.id] ?? 0;
    const pct = ((v + 1) / 2) * 100;
    return `
      <li class="chart-row">
        <span class="chart-pole">${escape(axis.neg)}</span>
        <span class="chart-track">
          <span class="chart-needle" style="left:${pct.toFixed(1)}%"></span>
        </span>
        <span class="chart-pole chart-pole--right">${escape(axis.pos)}</span>
      </li>`;
  }).join('');

  return `
    <details class="chart">
      <summary>${line(copy['result.chart'])}</summary>
      <ul class="chart-rows">${rows}</ul>
    </details>`;
}

export function renderError(copy) {
  return `
    <section class="screen">
      <h1 class="display" tabindex="-1">${line(copy?.['error.title'] ?? 'The reading is unavailable')}</h1>
      <p class="lede">${line(copy?.['error.body'] ?? 'The content files could not be loaded.')}</p>
    </section>`;
}
