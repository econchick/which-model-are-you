// App state and wiring. Everything else is pure functions; this is the part
// that owns the current playthrough and talks to the DOM.

import { AXIS_IDS } from '../data/axes.js';
import { loadContent, blurbFor } from '../data/content.js';
import { selectQuestions, applyUnlocks, QUIZ_LENGTH } from '../core/select.js';
import { rankModels, normalizeUserVector, sumAnswers, dominantAxis } from '../core/score.js';
import { mulberry32, newSeed } from '../core/rng.js';
import { encodeRun, decodeRun, isReplayable, shareUrl } from '../core/url.js';
import { renderIntro, renderQuestion, renderResult, renderError } from './render.js';

const root = document.getElementById('app');

/** Everything authored in content/ — questions, models and every visible word. */
let content = null;
let state = { phase: 'intro' };

function startRun(seed = newSeed(), answers = []) {
  const picked = applyUnlocks(
    selectQuestions(content.questions, seed),
    content.questions,
    answers,
  );
  state = { phase: 'quiz', seed, picked, answers, index: answers.length };
  if (state.index >= QUIZ_LENGTH) finish();
  else draw();
}

function answer(choice) {
  const answers = state.answers.slice();
  answers[state.index] = choice;

  // An earlier answer can open a follow-up, so re-resolve the conditional slot
  // every time rather than only once.
  const picked = applyUnlocks(state.picked, content.questions, answers);
  const index = state.index + 1;
  state = { ...state, answers, picked, index };

  if (index >= QUIZ_LENGTH) finish();
  else draw();
}

function back() {
  if (state.index === 0) return;
  state = { ...state, index: state.index - 1 };
  draw();
}

function finish() {
  const questions = state.picked.map((p) => p.question);
  const rng = mulberry32(state.seed ^ 0x9e3779b9);
  const { userVector, results } = rankModels({
    models: content.models,
    questions,
    choiceIndexes: state.answers,
    rng,
  });

  const winner = results[0].model;
  const hash = encodeRun({
    version: content.poolVersion,
    seed: state.seed,
    answers: state.answers,
    resultId: winner.id,
  });

  state = {
    phase: 'result',
    seed: state.seed,
    model: winner,
    runnerUp: results[1]?.model ?? null,
    blurb: blurbFor(winner, dominantAxis(userVector), rng),
    userVector,
    hash,
  };

  // Some embeddings (sandboxed frames) refuse history writes. The result is
  // already rendered either way; only the address bar misses out.
  try {
    history.replaceState(null, '', hash);
  } catch {
    /* no-op */
  }
  draw();
}

/** Show a result from a shared link we can't fully replay (pool has changed). */
function showStoredResult(modelId) {
  const model = content.modelsById[modelId];
  if (!model) return false;
  state = {
    phase: 'result',
    model,
    runnerUp: null,
    blurb: blurbFor(model, '*', mulberry32(1)),
    userVector: model.axes, // no answers to show, so chart the model itself
    hash: window.location.hash,
    stale: true,
  };
  draw();
  return true;
}

function draw() {
  const { copy } = content;

  if (state.phase === 'intro') {
    root.innerHTML = renderIntro(copy);
  } else if (state.phase === 'quiz') {
    root.innerHTML = renderQuestion({
      question: state.picked[state.index].question,
      index: state.index,
      total: QUIZ_LENGTH,
      answered: state.answers[state.index],
      copy,
    });
    tintFromAnswers();
  } else {
    root.innerHTML = renderResult({
      model: state.model,
      runnerUp: state.runnerUp,
      blurb: state.blurb,
      userVector: state.userVector,
      shareHref: shareUrl(state.hash),
      copy,
    });
    document.documentElement.style.setProperty('--tint-from', state.model.accent[0]);
    document.documentElement.style.setProperty('--tint-to', state.model.accent[1]);
  }
  root.querySelector('h1, h2')?.focus?.();
}

/**
 * Drift the background as the run takes shape. Purely atmospheric — it just
 * makes the page feel like it's listening.
 */
function tintFromAnswers() {
  const answered = state.picked.slice(0, state.index).map((p) => p.question);
  if (answered.length === 0) return;
  const v = normalizeUserVector(
    sumAnswers(answered, state.answers.slice(0, state.index)),
    answered,
  );
  const lean = AXIS_IDS.reduce((s, id, i) => s + v[id] * (i + 1), 0);
  const hue = (250 + lean * 40 + 360) % 360;
  document.documentElement.style.setProperty('--tint-from', `hsl(${hue.toFixed(0)} 70% 72%)`);
  document.documentElement.style.setProperty('--tint-to', `hsl(${((hue + 48) % 360).toFixed(0)} 80% 82%)`);
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

  if (action === 'start') startRun();
  else if (action === 'answer') answer(Number(el.dataset.index));
  else if (action === 'back') back();
  else if (action === 'restart') {
    try {
      history.replaceState(null, '', window.location.pathname);
    } catch {
      /* no-op */
    }
    startRun();
  } else if (action === 'share') {
    const ok = await copyShare(el.dataset.href);
    el.textContent = content.copy[ok ? 'result.shareDone' : 'result.shareFailed'];
    setTimeout(() => {
      el.textContent = content.copy['result.share'];
    }, 2000);
  }
});

// 1–4 pick an answer; that's the whole keyboard story beyond native tabbing.
document.addEventListener('keydown', (event) => {
  if (state.phase !== 'quiz') return;
  const n = Number(event.key);
  if (!Number.isInteger(n) || n < 1) return;
  const count = state.picked[state.index].question.options.length;
  if (n <= count) answer(n - 1);
});

async function boot() {
  try {
    content = await loadContent();
  } catch (error) {
    console.error(error);
    root.innerHTML = renderError(null);
    return;
  }

  const run = decodeRun();
  if (isReplayable(run, content.poolVersion)) {
    startRun(run.seed, run.answers);
  } else if (run?.resultId && showStoredResult(run.resultId)) {
    // rendered a stored result
  } else {
    draw();
  }
}

boot();
