// Screen rendering. Pure: each function returns HTML for one screen, and
// app.js owns the state and the event wiring.
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

export function renderIntro(copy) {
  return `
    <section class="screen screen--intro" aria-labelledby="intro-title">
      <p class="eyebrow">${line(copy['intro.eyebrow'])}</p>
      <h1 id="intro-title" class="display" tabindex="-1">${line(copy['intro.title'])}</h1>
      <p class="lede">${line(copy['intro.lede'])}</p>
      <button class="btn btn--primary" data-action="start">${line(copy['intro.button'])}</button>
      <p class="fine">${line(copy['intro.fine'])}</p>
    </section>`;
}

export function renderQuestion({ question, index, total, answered, copy }) {
  const options = question.options
    .map(
      (opt, i) => `
      <li>
        <button class="option${answered === i ? ' is-chosen' : ''}"
                data-action="answer" data-index="${i}"
                role="radio" aria-checked="${answered === i}">
          <span class="option-key" aria-hidden="true">${i + 1}</span>
          <span class="option-label">${escape(opt.label)}</span>
        </button>
      </li>`,
    )
    .join('');

  const counter = fill(copy['quiz.progress'], { n: index + 1, total });
  const whimsy = question.section === 'whimsy'
    ? ` · <em>${line(copy['quiz.whimsy'])}</em>`
    : '';

  return `
    <section class="screen screen--quiz" aria-labelledby="q-title">
      <header class="quiz-head">
        ${renderProgress(index, total, counter)}
        <p class="eyebrow">${escape(counter)}${whimsy}</p>
      </header>
      <h2 id="q-title" class="display display--question" tabindex="-1">${escape(question.prompt)}</h2>
      <ul class="options" role="radiogroup" aria-labelledby="q-title">${options}</ul>
      <div class="quiz-foot">
        ${index > 0 ? `<button class="btn btn--ghost" data-action="back">${line(copy['quiz.back'])}</button>` : ''}
      </div>
    </section>`;
}

function renderProgress(index, total, label) {
  const dots = Array.from({ length: total }, (_, i) => {
    const state = i < index ? ' is-done' : i === index ? ' is-current' : '';
    return `<span class="dot${state}"></span>`;
  }).join('');
  return `<div class="progress" role="progressbar" aria-valuenow="${index + 1}"
            aria-valuemin="1" aria-valuemax="${total}"
            aria-label="${escape(label)}">${dots}</div>`;
}

export function renderResult({ model, runnerUp, blurb, userVector, shareHref, copy }) {
  const [from, to] = model.accent;
  const rising = runnerUp
    ? fillHtml(copy['result.rising'], {
        name: `<strong>${escape(runnerUp.name)}</strong>`,
        tagline: escape(runnerUp.tagline.toLowerCase()),
      })
    : '';

  return `
    <section class="screen screen--result" aria-labelledby="result-title"
             style="--accent-from:${escape(from)}; --accent-to:${escape(to)}">
      <p class="eyebrow">${line(copy['result.eyebrow'])}</p>
      <div class="result-crown">
        ${renderSigil(model.axes, userVector, model.accent, model.id)}
      </div>
      <h1 id="result-title" class="display display--result" tabindex="-1">
        ${line(copy['result.youAre'])} <span class="result-name">${escape(model.name)}</span>
      </h1>
      <p class="result-tagline">${escape(model.tagline)}</p>
      ${model.rare ? `<p class="rare-flag">${line(copy['result.rare'])}</p>` : ''}
      <div class="blurb">${prose(blurb)}</div>
      ${renderChart(userVector, copy)}
      ${rising ? `<p class="rising">${rising}</p>` : ''}
      <div class="result-actions">
        <button class="btn btn--primary" data-action="share" data-href="${escape(shareHref)}">
          ${line(copy['result.share'])}
        </button>
        <button class="btn btn--ghost" data-action="restart">${line(copy['result.restart'])}</button>
      </div>
      <p class="fine">${line(copy['result.fine'])}</p>
    </section>`;
}

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
