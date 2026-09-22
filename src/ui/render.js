// Screen rendering. Pure-ish: each function returns HTML for one screen, and
// app.js owns the state and the event wiring.

import { AXES } from '../data/axes.js';
import { renderSigil } from './sigil.js';

const escape = (s) =>
  String(s).replace(/[&<>"']/g, (c) => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
  })[c]);

/** Blurbs are authored content, not user input — but keep paragraphs tidy. */
const paragraphs = (text) =>
  escape(text)
    .split(/\n\n+/)
    .map((p) => `<p>${p.replace(/\n/g, '<br>')}</p>`)
    .join('');

export function renderIntro() {
  return `
    <section class="screen screen--intro" aria-labelledby="intro-title">
      <p class="eyebrow">A reading in ten questions</p>
      <h1 id="intro-title" class="display" tabindex="-1">Which model<br>are you?</h1>
      <p class="lede">
        Some of these questions are serious. Some of them are about socks.
        All of them count.
      </p>
      <button class="btn btn--primary" data-action="start">Begin the reading</button>
      <p class="fine">No accounts, no tracking, nothing leaves your browser.</p>
    </section>`;
}

export function renderQuestion({ question, index, total, answered }) {
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

  const isWhimsy = question.section === 'whimsy';

  return `
    <section class="screen screen--quiz" aria-labelledby="q-title">
      <header class="quiz-head">
        ${renderProgress(index, total)}
        <p class="eyebrow">
          Question ${index + 1} of ${total}${isWhimsy ? ' · <em>and yet</em>' : ''}
        </p>
      </header>
      <h2 id="q-title" class="display display--question" tabindex="-1">${escape(question.prompt)}</h2>
      <ul class="options" role="radiogroup" aria-labelledby="q-title">${options}</ul>
      <div class="quiz-foot">
        ${index > 0 ? '<button class="btn btn--ghost" data-action="back">Back</button>' : ''}
      </div>
    </section>`;
}

function renderProgress(index, total) {
  const dots = Array.from({ length: total }, (_, i) => {
    const state = i < index ? ' is-done' : i === index ? ' is-current' : '';
    return `<span class="dot${state}"></span>`;
  }).join('');
  return `<div class="progress" role="progressbar" aria-valuenow="${index + 1}"
            aria-valuemin="1" aria-valuemax="${total}"
            aria-label="Question ${index + 1} of ${total}">${dots}</div>`;
}

export function renderResult({ model, runnerUp, blurb, userVector, shareHref }) {
  const [from, to] = model.accent;
  return `
    <section class="screen screen--result" aria-labelledby="result-title"
             style="--accent-from:${from}; --accent-to:${to}">
      <p class="eyebrow">Your reading</p>
      <div class="result-crown">
        ${renderSigil(model.axes, userVector, model.accent, model.id)}
      </div>
      <h1 id="result-title" class="display display--result" tabindex="-1">
        You are <span class="result-name">${escape(model.name)}</span>
      </h1>
      <p class="result-tagline">${escape(model.tagline)}</p>
      ${model.rare ? '<p class="rare-flag">A rare reading</p>' : ''}
      <div class="blurb">${paragraphs(blurb)}</div>
      ${renderChart(userVector)}
      ${runnerUp ? `<p class="rising">Your rising sign is <strong>${escape(runnerUp.name)}</strong> — ${escape(runnerUp.tagline.toLowerCase())}.</p>` : ''}
      <div class="result-actions">
        <button class="btn btn--primary" data-action="share" data-href="${escape(shareHref)}">
          Copy your link
        </button>
        <button class="btn btn--ghost" data-action="restart">Read me again</button>
      </div>
      <p class="fine">A different ten questions next time.</p>
    </section>`;
}

/** The player's own chart, in words — the "why this model" receipt. */
function renderChart(userVector) {
  const rows = AXES.map((axis) => {
    const v = userVector[axis.id] ?? 0;
    const pct = ((v + 1) / 2) * 100;
    const leaning = v >= 0 ? axis.pos : axis.neg;
    return `
      <li class="chart-row">
        <span class="chart-pole">${escape(axis.neg)}</span>
        <span class="chart-track">
          <span class="chart-needle" style="left:${pct.toFixed(1)}%"></span>
        </span>
        <span class="chart-pole chart-pole--right">${escape(axis.pos)}</span>
        <span class="chart-read">${escape(leaning)}</span>
      </li>`;
  }).join('');

  return `
    <details class="chart">
      <summary>Show your chart</summary>
      <ul class="chart-rows">${rows}</ul>
    </details>`;
}
