// App state and wiring. Everything else is pure functions; this is the part
// that owns the current playthrough and decides what the chart shows.

import { AXIS_IDS } from '../data/axes.js';
import { loadContent, blurbFor } from '../data/content.js';
import { pathFor, QUIZ_LENGTH } from '../core/select.js';
import { rankModels, normalizeUserVector, sumAnswers, dominantAxis } from '../core/score.js';
import { mulberry32, newSeed } from '../core/rng.js';
import { encodeRun, decodeRun, isReplayable, shareUrl } from '../core/url.js';
import { renderStart, renderStep, renderResult, renderError } from './render.js';
import { createFlow } from './flow.js';

const root = document.getElementById('app');

/** A new question ignores answers this soon after appearing — no answering it unseen. */
const SETTLE_MS = 450;

/** Everything authored in content/ — questions, models and every visible word. */
let content = null;
let flow = null;

/**
 * `run` is the playthrough, null until Begin. `result` appears once all ten are
 * answered, and from then on the chart is locked. `alone` is a result opened
 * from a shared link, shown without a chart.
 */
let state = { run: null, result: null, alone: false };
let settleUntil = 0;

function begin() {
  const seed = newSeed();
  const run = { seed, picked: pathFor(content.questions, seed, []), answers: [] };
  state = { run, result: null, alone: false };
  advance();
}

/**
 * Answer any question already on the page. Every answer leads to a different
 * next question, so changing an earlier one takes a different branch: the
 * path below it is replaced, starting from where the new answer leads.
 */
function answer(step, choice) {
  const { run } = state;
  if (!run || state.result) return;
  const newest = run.answers.length;
  if (step > newest || run.answers[step] === choice) return;
  if (step === newest && performance.now() < settleUntil) return;

  const answers = [...run.answers.slice(0, step), choice];
  const picked = pathFor(content.questions, run.seed, answers);
  state = { ...state, run: { ...run, picked, answers } };
  if (answers.length === QUIZ_LENGTH) state.result = finish(state.run);
  advance();
}

function finish({ seed, picked, answers }) {
  const questions = picked.map((p) => p.question);
  const rng = mulberry32(seed ^ 0x9e3779b9);
  const { userVector, results } = rankModels({
    models: content.models,
    questions,
    choiceIndexes: answers,
    rng,
  });

  const model = results[0].model;
  const hash = encodeRun({ version: content.poolVersion, seed, answers, resultId: model.id });

  // Some embeddings (sandboxed frames) refuse history writes. The result is
  // rendered either way; only the address bar misses out.
  try {
    history.replaceState(null, '', hash);
  } catch {
    /* no-op */
  }

  return {
    model,
    runnerUp: results[1]?.model ?? null,
    blurb: blurbFor(model, dominantAxis(userVector), rng),
    userVector,
    hash,
  };
}

/** A result from a shared link we can't fully replay (the pool has changed). */
function storedResult(model) {
  return {
    model,
    runnerUp: null,
    blurb: blurbFor(model, '*', mulberry32(1)),
    userVector: model.axes, // no answers to show, so chart the model itself
    hash: window.location.hash,
  };
}

function restart() {
  try {
    history.replaceState(null, '', window.location.pathname);
  } catch {
    /* no-op */
  }
  state = { run: null, result: null, alone: false };
  show({ instant: true });
  window.scrollTo({ top: 0, behavior: 'auto' });
  requestAnimationFrame(begin);
}

/** Put the chart on the page, as the state says it should be. */
function show({ instant = false } = {}) {
  const { copy } = content;
  const { run, result, alone } = state;
  const items = [];

  if (!alone) {
    items.push({ key: 'start', html: () => renderStart(copy), chosen: run ? 0 : null });
  }
  if (run) {
    // Every answered question, plus the one waiting for an answer.
    const shown = Math.min(run.answers.length + 1, QUIZ_LENGTH);
    for (let i = 0; i < shown; i++) {
      const { question } = run.picked[i];
      items.push({
        key: `${run.seed}:${i}:${question.id}`,
        html: () => renderStep({ question, index: i, total: QUIZ_LENGTH, copy }),
        chosen: run.answers[i] ?? null,
      });
    }
  }
  if (result) {
    items.push({
      key: `result:${result.hash}`,
      html: () => renderResult({ ...result, shareHref: shareUrl(result.hash), standalone: alone, copy }),
    });
  }

  tint();
  return flow.sync(items, { instant, locked: Boolean(result) });
}

/** Show the chart with whatever just got added, and move the reader down to it. */
function advance() {
  const entered = show();
  const newest = entered[entered.length - 1];
  if (!newest) return;
  flow.bringIntoView(newest);
  newest.querySelector('h1, h2')?.focus({ preventScroll: true });
  settleUntil = performance.now() + SETTLE_MS;
}

/**
 * Drift the background as the run takes shape, and settle on the result's own
 * colours at the end. Purely atmospheric — it makes the page feel like it's
 * listening.
 */
function tint() {
  const style = document.documentElement.style;
  if (state.result) {
    style.setProperty('--tint-from', state.result.model.accent[0]);
    style.setProperty('--tint-to', state.result.model.accent[1]);
    return;
  }
  const { run } = state;
  const n = run?.answers.length ?? 0;
  if (n === 0) return;
  const answered = run.picked.slice(0, n).map((p) => p.question);
  const v = normalizeUserVector(sumAnswers(answered, run.answers), answered);
  const lean = AXIS_IDS.reduce((s, id, i) => s + v[id] * (i + 1), 0);
  const hue = (250 + lean * 40 + 360) % 360;
  style.setProperty('--tint-from', `hsl(${hue.toFixed(0)} 70% 72%)`);
  style.setProperty('--tint-to', `hsl(${((hue + 48) % 360).toFixed(0)} 80% 82%)`);
}

async function copyShare(href) {
  try {
    await navigator.clipboard.writeText(href);
    return true;
  } catch {
    return false;
  }
}

root.addEventListener('click', async (event) => {
  const el = event.target.closest('[data-action]');
  if (!el || !content) return;
  const { action } = el.dataset;

  if (action === 'start') {
    if (!state.run) begin();
  } else if (action === 'answer') {
    answer(Number(el.dataset.step), Number(el.dataset.index));
  } else if (action === 'restart') {
    restart();
  } else if (action === 'share') {
    const ok = await copyShare(el.dataset.href);
    el.textContent = content.copy[ok ? 'result.shareDone' : 'result.shareFailed'];
    setTimeout(() => {
      el.textContent = content.copy['result.share'];
    }, 2000);
  }
});

// 1–4 answer the newest question; that's the whole keyboard story beyond
// native tabbing.
document.addEventListener('keydown', (event) => {
  const { run } = state;
  if (!run || state.result || event.metaKey || event.ctrlKey || event.altKey) return;
  const n = Number(event.key);
  if (!Number.isInteger(n) || n < 1) return;
  const step = run.answers.length;
  if (n <= run.picked[step].question.options.length) answer(step, n - 1);
});

async function boot() {
  try {
    content = await loadContent();
  } catch (error) {
    console.error(error);
    root.innerHTML = renderError(null);
    return;
  }
  flow = createFlow(root);

  // A shared link shows its result on its own. Replay it when the pool still
  // matches; otherwise show the result it recorded.
  const link = decodeRun();
  const replay = isReplayable(link, content.poolVersion) && link.answers.length === QUIZ_LENGTH
    ? pathFor(content.questions, link.seed, link.answers)
    : [];
  if (replay.length === QUIZ_LENGTH) {
    state = { run: null, result: finish({ seed: link.seed, picked: replay, answers: link.answers }), alone: true };
  } else if (link?.resultId && content.modelsById[link.resultId]) {
    state = { run: null, result: storedResult(content.modelsById[link.resultId]), alone: true };
  }

  show({ instant: true });
  root.querySelector('h1')?.focus({ preventScroll: true });
}

boot();
