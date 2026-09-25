#!/usr/bin/env node
// Content validator and tuning dashboard.
//
//   node scripts/validate.mjs            run every check
//   node scripts/validate.mjs --runs 5e4 more Monte Carlo samples
//
// Run this after editing anything in content/. It is the thing that keeps
// "adding a model is a one-file edit" true six months from now: it catches a new
// model that is unreachable, one that eats every result, and one that is a near
// duplicate of a model you already had.

import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

import { AXES, AXIS_IDS } from '../src/data/axes.js';
import { parseModels, parseQuestions, parseInterface } from '../src/core/parse.js';

import { pathFor, branchesFrom, coverageOf, QUIZ_LENGTH, MIN_COVERAGE, SHAPE } from '../src/core/select.js';
import { rankModels, zScoreModels, cosine, risingSign } from '../src/core/score.js';
import { mulberry32 } from '../src/core/rng.js';
import { encodeRun, decodeRun } from '../src/core/url.js';
import { PREVIEW_DIR, CARD_FILE, siteUrl, previewFor, fingerprint, fingerprintOf } from './preview-data.mjs';

// Read the same Markdown the browser fetches, through the same parsers, so the
// two can never drift. A parse error here names the file and line.
const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = join(ROOT, 'content');
const readContent = (name) => readFileSync(join(CONTENT, name), 'utf8');

let MODELS;
let QUESTIONS;
let POOL_VERSION;
let COPY;
try {
  MODELS = parseModels(readContent('models.md'));
  const pool = parseQuestions(readContent('questions.md'));
  QUESTIONS = pool.questions;
  POOL_VERSION = pool.version;
  COPY = parseInterface(readContent('interface.md'));
} catch (error) {
  console.error(`\n  content error\n  \u2717 ${error.message}\n`);
  process.exit(1);
}

const args = process.argv.slice(2);
const argValue = (flag, fallback) => {
  const i = args.indexOf(flag);
  return i === -1 ? fallback : Number(args[i + 1]);
};
const RUNS = argValue('--runs', 20000);
const COVERAGE_RUNS = argValue('--coverage-runs', 2000);
const DRAW_RUNS = argValue('--draw-runs', 10000);

const failures = [];
const warnings = [];
const fail = (msg) => failures.push(msg);
const warn = (msg) => warnings.push(msg);

// ── 1. schema ────────────────────────────────────────────────────────────────

function checkSchema() {
  const ids = new Set();
  for (const m of MODELS) {
    if (ids.has(m.id)) fail(`duplicate model id "${m.id}"`);
    ids.add(m.id);
    if (!/^[a-z0-9-]+$/.test(m.id)) fail(`model id "${m.id}" must be a lowercase slug (it appears in share URLs)`);
    for (const axis of AXIS_IDS) {
      const v = m.axes?.[axis];
      if (typeof v !== 'number') fail(`model "${m.id}" is missing axis "${axis}"`);
      else if (v < -1 || v > 1) fail(`model "${m.id}" axis "${axis}" = ${v}, must be -1..1`);
    }
    for (const key of Object.keys(m.axes ?? {})) {
      if (!AXIS_IDS.includes(key)) fail(`model "${m.id}" has unknown axis "${key}"`);
    }
    if (!m.blurbs?.length) fail(`model "${m.id}" has no blurbs`);
    if (!m.blurbs?.some((b) => b.when === '*')) {
      fail(`model "${m.id}" needs a '*' fallback blurb (every other variant is conditional)`);
    }
    if (!Array.isArray(m.accent) || m.accent.length !== 2) fail(`model "${m.id}" needs two accent colours`);
    if (!m.tagline) fail(`model "${m.id}" has no tagline`);
    if (!m.lab) fail(`model "${m.id}" has no lab — the rising sign is picked from a different lab, so every model needs one`);
    const magnitude = Math.hypot(...AXIS_IDS.map((a) => m.axes?.[a] ?? 0));
    if (magnitude < 0.45) {
      warn(`model "${m.id}" sits near the centre of the space (magnitude ${magnitude.toFixed(2)}) — it will rarely win anything. Give it stronger opinions.`);
    }
  }

  const qids = new Set();
  for (const q of QUESTIONS) {
    if (qids.has(q.id)) fail(`duplicate question id "${q.id}"`);
    qids.add(q.id);
    if (!['opener', 'core', 'whimsy', 'closer'].includes(q.section)) {
      fail(`question "${q.id}" has invalid section "${q.section}"`);
    }
    if (!q.options?.length || q.options.length > 4) fail(`question "${q.id}" needs 1-4 options`);
    const optIds = new Set();
    for (const o of q.options ?? []) {
      if (!o.id) fail(`question "${q.id}" has an option with no id`);
      if (optIds.has(o.id)) fail(`question "${q.id}" has duplicate option id "${o.id}"`);
      optIds.add(o.id);
      for (const key of Object.keys(o.axes ?? {})) {
        if (!AXIS_IDS.includes(key)) fail(`question "${q.id}" option "${o.id}" has unknown axis "${key}"`);
      }
      const weight = Object.values(o.axes ?? {}).reduce((s, w) => s + Math.abs(w), 0);
      if (weight === 0) warn(`question "${q.id}" option "${o.id}" carries no axis weight — picking it says nothing`);
    }
    for (const rule of q.unlocks ?? []) {
      if (!optIds.has(rule.when)) fail(`question "${q.id}" unlocks on unknown option "${rule.when}"`);
      const target = QUESTIONS.find((t) => t.id === rule.qid);
      if (!target) fail(`question "${q.id}" unlocks missing question "${rule.qid}"`);
      else if (!target.unlockOnly) warn(`question "${q.id}" unlocks "${rule.qid}", which is also in the normal draw`);
      else if ((target.unlocks ?? []).length > 0) fail(`"${rule.qid}" is a follow-up and cannot itself unlock another question (one level only)`);
    }
  }

  // Every answer leads to a different next question, so each step needs as
  // many unasked questions of its kind as the step before it has answers.
  const widest = Math.max(...QUESTIONS.map((q) => q.options.length));
  const required = {};
  SHAPE.forEach((section, i) => {
    const askedBefore = SHAPE.slice(0, i).filter((s) => s === section).length;
    required[section] = Math.max(required[section] ?? 0, askedBefore + (i === 0 ? 1 : widest));
  });
  for (const [section, need] of Object.entries(required)) {
    const have = QUESTIONS.filter((q) => !q.unlockOnly && q.section === section).length;
    if (have < need) {
      fail(`only ${have} "${section}" questions; need at least ${need} so every answer to the question before one can lead somewhere different. Add ${need - have} more.`);
    }
  }
}

// ── 1b. interface copy ───────────────────────────────────────────────────────

/** Every string render.js looks up must exist, with only placeholders we fill. */
const REQUIRED_COPY = {
  'intro.badge': [], 'intro.title': [], 'intro.subtitle': [], 'intro.button': [],
  'quiz.progress': ['n', 'total'],
  'result.eyebrow': [], 'result.youAre': [], 'result.rare': [], 'result.chart': [],
  'result.rising': ['name', 'tagline'], 'result.share': [], 'result.shareDone': [],
  'result.shareFailed': [], 'result.restart': [],
  'site.footer': [], 'site.source': [], 'error.title': [], 'error.body': [],
  'crab.label': [], 'crab.lines': [],
  'preview.title': ['name'], 'preview.got': [], 'preview.cta': [], 'preview.link': [],
};

function checkInterfaceCopy() {
  for (const [key, allowed] of Object.entries(REQUIRED_COPY)) {
    const text = COPY[key];
    if (!text) {
      fail(`content/interface.md is missing "## ${key}" — the app looks that string up by name`);
      continue;
    }
    for (const [, placeholder] of text.matchAll(/\{(\w+)\}/g)) {
      if (!allowed.includes(placeholder)) {
        fail(`"${key}" uses {${placeholder}}, which is never filled in. Allowed here: ${allowed.length ? allowed.map((a) => `{${a}}`).join(', ') : 'none'}.`);
      }
    }
  }
  for (const key of Object.keys(COPY)) {
    if (!(key in REQUIRED_COPY)) warn(`content/interface.md has "## ${key}", which nothing displays`);
  }
}

// ── 2. questions must never name a model ─────────────────────────────────────

function checkNoModelNames() {
  const source = JSON.stringify(QUESTIONS).toLowerCase();
  for (const m of MODELS) {
    const needle = new RegExp(`\\b${m.id.replace(/[-]/g, '[- ]?')}\\b`);
    if (needle.test(source)) {
      fail(`content/questions.md mentions "${m.id}" — questions measure traits, models claim them. Remove it, or adding models stops being a one-file edit.`);
    }
    const nameNeedle = new RegExp(`\\b${m.name.toLowerCase()}\\b`);
    if (m.name.length > 3 && nameNeedle.test(source)) {
      fail(`content/questions.md mentions the model name "${m.name}"`);
    }
  }
}

// ── 3. the pool must not lean ────────────────────────────────────────────────

/**
 * Every axis needs roughly as much weight pulling one way as the other.
 *
 * This is the check that catches the sneakiest content bug: if you write 26
 * options that reward rigour and only 15 that reward instinct, then nobody ever
 * lands on the "vibes" side of the axis, and every model living over there
 * becomes unreachable — through no fault of its own vector. The symptom shows up
 * as a mystifying win rate; the cause is here.
 */
function checkPoolBalance() {
  console.log('\n  pool balance (weight available on each pole)');
  for (const axis of AXES) {
    let pos = 0;
    let neg = 0;
    for (const q of QUESTIONS.filter((x) => !x.unlockOnly)) {
      for (const o of q.options) {
        const w = o.axes?.[axis.id] ?? 0;
        if (w > 0) pos += w;
        else neg -= w;
      }
    }
    const ratio = Math.max(pos, neg) / Math.max(1e-6, Math.min(pos, neg));
    const heavier = pos > neg ? axis.pos : axis.neg;
    console.log(
      `  ${axis.id.padEnd(12)} ${axis.neg.padStart(14)} ${neg.toFixed(1).padStart(5)}  |  ${pos.toFixed(1).padEnd(5)} ${axis.pos.padEnd(14)} ${ratio > 1.4 ? `← leans ${heavier}` : ''}`,
    );
    if (ratio > 1.7) {
      fail(`axis "${axis.id}" leans hard toward ${heavier} (${neg.toFixed(1)} vs ${pos.toFixed(1)}). Players will rarely reach the other pole, stranding any model that lives there. Add options weighted toward ${pos > neg ? axis.neg : axis.pos}.`);
    } else if (ratio > 1.4) {
      warn(`axis "${axis.id}" leans toward ${heavier} (${neg.toFixed(1)} vs ${pos.toFixed(1)})`);
    }
  }
}

// ── 4. models must be distinguishable ────────────────────────────────────────

function checkDistinct() {
  const scored = zScoreModels(MODELS);
  for (let i = 0; i < scored.length; i++) {
    for (let j = i + 1; j < scored.length; j++) {
      const sim = cosine(scored[i].z, scored[j].z);
      if (sim > 0.97) {
        fail(`"${scored[i].id}" and "${scored[j].id}" are near-identical (cosine ${sim.toFixed(3)}) — one will always shadow the other. Differentiate them or merge them.`);
      } else if (sim > 0.9) {
        warn(`"${scored[i].id}" and "${scored[j].id}" are close (cosine ${sim.toFixed(3)}); watch their win rates below`);
      }
    }
  }
}

// ── simulation helper ────────────────────────────────────────────────────────

/**
 * Walk one path through the chart, answering with `choose(question, index)`.
 * `onFork` sees every fork along the way: the next question for each answer.
 */
function drawRun(seed, choose, onFork) {
  const picked = pathFor(QUESTIONS, seed, []);
  const answers = [];
  for (let i = 0; i < QUIZ_LENGTH; i++) {
    answers.push(choose(picked[i].question, i));
    if (i === QUIZ_LENGTH - 1) break;
    const branches = branchesFrom(QUESTIONS, seed, picked, answers);
    onFork?.(picked[i].question, branches);
    picked.push({ question: branches[answers[i]], slot: SHAPE[i + 1] });
  }
  return { picked, answers };
}

/** Play one full run, answering with `choose(question, index)`, and score it. */
function playRun(seed, choose) {
  const { picked, answers } = drawRun(seed, choose);
  const questions = picked.map((p) => p.question);
  const { results, userVector } = rankModels({
    models: MODELS,
    questions,
    choiceIndexes: answers,
    rng: mulberry32(seed ^ 0x9e3779b9),
  });
  return { picked, answers, questions, winner: results[0].model.id, results, userVector };
}

const uniformChooser = (rng) => (q) => Math.floor(rng() * q.options.length);

/** Real people aren't uniform — they have a favourite kind of answer. */
const skewedChooser = (rng) => {
  const bias = rng();
  return (q) => {
    const n = q.options.length;
    const weights = Array.from({ length: n }, (_, i) => Math.exp(-Math.abs(i / n - bias) * 3));
    const total = weights.reduce((s, w) => s + w, 0);
    let r = rng() * total;
    for (let i = 0; i < n; i++) {
      r -= weights[i];
      if (r <= 0) return i;
    }
    return n - 1;
  };
};

// ── 4. reachability ──────────────────────────────────────────────────────────

function checkReachability() {
  const tally = Object.fromEntries(MODELS.map((m) => [m.id, 0]));
  const rng = mulberry32(12345);
  let sameLab = 0;

  for (let i = 0; i < RUNS; i++) {
    const seed = (rng() * 4294967296) >>> 0;
    const chooser = i % 2 === 0 ? uniformChooser(rng) : skewedChooser(rng);
    const run = playRun(seed, chooser);
    tally[run.winner]++;
    const rising = risingSign(run.results);
    if (!rising || rising.lab === run.results[0].model.lab) sameLab++;
  }

  if (sameLab > 0) {
    fail(`${sameLab} runs gave a rising sign from the winner's own lab — it should always come from a different one`);
  }

  // Bands are relative to an even split, so they stay meaningful as the roster
  // grows. At 5 models an even split is 20%; at 16 it's 6.25%.
  const uniform = 100 / MODELS.length;
  const bands = {
    normal: { floor: uniform * 0.25, ceiling: uniform * 2.2 },
    rare: { floor: uniform * 0.02, ceiling: uniform * 0.6 },
  };

  console.log('\n  win rate over %s runs (even split would be %s%)', RUNS.toLocaleString(), uniform.toFixed(1));
  console.log('  ' + '─'.repeat(58));

  const rows = MODELS.map((m) => ({ m, pct: (tally[m.id] / RUNS) * 100 })).sort((a, b) => b.pct - a.pct);
  for (const { m, pct } of rows) {
    const band = m.rare ? bands.rare : bands.normal;
    const bar = '█'.repeat(Math.max(0, Math.round(pct / 1.2)));
    const flag = pct < band.floor ? ' ← too rare' : pct > band.ceiling ? ' ← dominating' : '';
    console.log(
      `  ${m.id.padEnd(12)} ${pct.toFixed(2).padStart(6)}%  ${bar}${flag}${m.rare ? '  (rare)' : ''}`,
    );
    if (pct < band.floor) {
      fail(`"${m.id}" wins only ${pct.toFixed(2)}% of runs (floor ${band.floor.toFixed(2)}%). Raise its gravity or sharpen its axes.`);
    }
    if (pct > band.ceiling) {
      fail(`"${m.id}" wins ${pct.toFixed(2)}% of runs (ceiling ${band.ceiling.toFixed(2)}%). Lower its gravity.`);
    }
  }
  console.log('  ' + '─'.repeat(58));
}

// ── 5. coverage and length ───────────────────────────────────────────────────

function checkCoverage() {
  const rng = mulberry32(999);
  const worst = Object.fromEntries(AXIS_IDS.map((a) => [a, Infinity]));
  const shared = new Set();

  for (let i = 0; i < COVERAGE_RUNS; i++) {
    const seed = (rng() * 4294967296) >>> 0;
    const { picked } = drawRun(seed, uniformChooser(rng), (question, branches) => {
      if (new Set(branches.map((q) => q.id)).size < branches.length) shared.add(question.id);
    });
    if (picked.length !== QUIZ_LENGTH) fail(`seed ${seed} produced ${picked.length} questions, expected ${QUIZ_LENGTH}`);
    const ids = new Set(picked.map((p) => p.question.id));
    if (ids.size !== picked.length) fail(`seed ${seed} repeated a question`);
    const coverage = coverageOf(picked);
    for (const a of AXIS_IDS) worst[a] = Math.min(worst[a], coverage[a]);
  }

  for (const id of shared) {
    fail(`two answers to "${id}" can lead to the same next question — every answer should lead somewhere different`);
  }

  console.log('\n  worst-case axis coverage over %s paths (minimum %s)', COVERAGE_RUNS.toLocaleString(), MIN_COVERAGE);
  for (const axis of AXES) {
    const v = worst[axis.id];
    console.log(`  ${axis.id.padEnd(12)} ${v.toFixed(2)}${v < MIN_COVERAGE ? '  ← under-measured' : ''}`);
    if (v < MIN_COVERAGE) {
      fail(`axis "${axis.id}" can fall to ${v.toFixed(2)} coverage (minimum ${MIN_COVERAGE}). Add pool questions weighting ${axis.neg}/${axis.pos}.`);
    }
  }
}

// ── 5b. every question gets asked ────────────────────────────────────────────

/**
 * A question the draw never picks is dead weight, and a follow-up nobody can
 * unlock is worse, because it looks like content. For a while half the pool was
 * in that state and nothing noticed — the draw only ever chose from the top few
 * candidates, and the same heavy-weighted questions were always on top.
 */
function checkDrawRates() {
  const rng = mulberry32(4242);
  const asked = Object.fromEntries(QUESTIONS.map((q) => [q.id, 0]));
  for (let i = 0; i < DRAW_RUNS; i++) {
    const seed = (rng() * 4294967296) >>> 0;
    for (const p of drawRun(seed, uniformChooser(rng)).picked) asked[p.question.id]++;
  }
  const pct = (q) => (asked[q.id] / DRAW_RUNS) * 100;

  console.log('\n  how often each question is asked, over %s runs', DRAW_RUNS.toLocaleString());
  for (const section of ['opener', 'core', 'whimsy', 'closer']) {
    const pool = QUESTIONS.filter((q) => !q.unlockOnly && q.section === section);
    const slots = SHAPE.filter((s) => s === section).length;
    // Relative to an even share, like the win-rate bands, so it holds as the pool grows.
    const floor = ((slots / pool.length) * 100) * 0.2;
    const rows = pool.map((q) => ({ q, pct: pct(q) })).sort((a, b) => a.pct - b.pct);
    const least = rows[0];
    const most = rows[rows.length - 1];
    console.log(`  ${section.padEnd(12)} ${least.pct.toFixed(1).padStart(5)}–${most.pct.toFixed(1)}%   least: ${least.q.id}`);
    for (const { q, pct: p } of rows.filter((r) => r.pct < floor)) {
      fail(`"${q.id}" is asked in only ${p.toFixed(1)}% of runs (floor ${floor.toFixed(1)}%). Its options carry so little weight that the draw almost never picks it.`);
    }
  }

  const followUps = QUESTIONS.filter((q) => q.unlockOnly);
  if (followUps.length) {
    console.log(`  follow-ups   ${followUps.map((q) => `${q.id} ${pct(q).toFixed(1)}%`).join(' · ')}`);
  }
  for (const q of followUps) {
    if (pct(q) < FOLLOW_UP_FLOOR) {
      fail(`follow-up "${q.id}" is unlocked in only ${pct(q).toFixed(2)}% of runs (floor ${FOLLOW_UP_FLOOR}%). The question that opens it is rarely asked, or the answer that opens it is rarely picked.`);
    }
  }
}

/** A follow-up is one answer to one question, so it's always rare; this is the "rare, not never" line. */
const FOLLOW_UP_FLOOR = 1;

// ── 6. the silly questions matter, but not too much ──────────────────────────

function checkSensitivity() {
  const rng = mulberry32(4242);
  const trials = 1500;
  let whimsyFlips = 0;
  let whimsyTried = 0;
  let coreFlips = 0;
  let coreTried = 0;

  // Rescored on the same questions, so this measures an answer's own weight,
  // not the different path it would also have led down.
  for (let i = 0; i < trials; i++) {
    const seed = (rng() * 4294967296) >>> 0;
    const base = playRun(seed, uniformChooser(rng));

    for (const section of ['whimsy', 'core']) {
      const slot = base.picked.findIndex((p) => p.question.section === section);
      if (slot === -1) continue;
      const options = base.picked[slot].question.options.length;
      const flipped = base.answers.slice();
      flipped[slot] = (flipped[slot] + 1) % options;

      const { results } = rankModels({
        models: MODELS,
        questions: base.questions,
        choiceIndexes: flipped,
        rng: mulberry32(seed ^ 0x9e3779b9),
      });
      const changed = results[0].model.id !== base.winner;
      if (section === 'whimsy') {
        whimsyTried++;
        if (changed) whimsyFlips++;
      } else {
        coreTried++;
        if (changed) coreFlips++;
      }
    }
  }

  const whimsyRate = (whimsyFlips / whimsyTried) * 100;
  const coreRate = (coreFlips / coreTried) * 100;
  console.log('\n  changing one answer changes the result:');
  console.log(`  whimsy question  ${whimsyRate.toFixed(1)}%`);
  console.log(`  core question    ${coreRate.toFixed(1)}%`);

  if (whimsyRate < 8) {
    fail(`flipping a whimsy answer only changes the result ${whimsyRate.toFixed(1)}% of the time — the silly questions are decorative. Give their options more axis weight.`);
  }
  if (coreRate <= whimsyRate) {
    fail(`whimsy answers move the result as much as core ones (${whimsyRate.toFixed(1)}% vs ${coreRate.toFixed(1)}%) — the quiz will feel arbitrary.`);
  }
}

// ── 7. determinism and share links ───────────────────────────────────────────

function checkDeterminism() {
  const rng = mulberry32(7);
  for (let i = 0; i < 500; i++) {
    const seed = (rng() * 4294967296) >>> 0;
    const chooser = uniformChooser(mulberry32(seed));
    const a = playRun(seed, chooser);
    const b = playRun(seed, uniformChooser(mulberry32(seed)));
    if (a.winner !== b.winner) fail(`seed ${seed} is not deterministic: ${a.winner} vs ${b.winner}`);
    if (a.questions.map((q) => q.id).join() !== b.questions.map((q) => q.id).join()) {
      fail(`seed ${seed} selected different questions on replay`);
    }
    // What a share link does: rebuild the whole path from the seed and answers.
    const replayed = pathFor(QUESTIONS, seed, a.answers).map((p) => p.question.id).join();
    if (replayed !== a.questions.map((q) => q.id).join()) {
      fail(`seed ${seed} walks a different path when replayed from its answers`);
    }

    const hash = encodeRun({ version: POOL_VERSION, seed, answers: a.answers, resultId: a.winner });
    const decoded = decodeRun(hash);
    if (decoded.seed !== seed) fail(`share link lost the seed: ${seed} -> ${decoded.seed}`);
    if (decoded.answers.join() !== a.answers.join()) fail(`share link lost the answers for seed ${seed}`);
    if (decoded.resultId !== a.winner) fail(`share link lost the result for seed ${seed}`);
  }
}

// ── 8. link previews ─────────────────────────────────────────────────────────

/**
 * Every share link points at r/<model>/, so a model without a page there has
 * share links that 404. Those fail. A page that no longer matches its model's
 * name, tagline or opening lines only shows an old preview, so that warns.
 */
function checkPreviews() {
  const site = siteUrl(readFileSync(join(ROOT, 'index.html'), 'utf8'));
  const stale = [];
  for (const m of MODELS) {
    const page = join(ROOT, PREVIEW_DIR, m.id, 'index.html');
    if (!existsSync(page)) {
      fail(`"${m.id}" has no link preview page (${PREVIEW_DIR}/${m.id}/index.html), so its share links would 404. Run \`npm run previews\`.`);
      continue;
    }
    if (!existsSync(join(ROOT, PREVIEW_DIR, m.id, CARD_FILE))) {
      fail(`"${m.id}" has no preview image (${PREVIEW_DIR}/${m.id}/${CARD_FILE}). Run \`npm run previews\`.`);
    }
    if (fingerprintOf(readFileSync(page, 'utf8')) !== fingerprint(previewFor(m, COPY, site))) stale.push(m.id);
  }
  if (!existsSync(join(ROOT, PREVIEW_DIR, CARD_FILE))) {
    fail(`there's no preview image for the quiz itself (${PREVIEW_DIR}/${CARD_FILE}). Run \`npm run previews\`.`);
  }
  if (stale.length) {
    warn(`link previews are out of date for ${stale.join(', ')} — run \`npm run previews\` and commit what it writes`);
  }
  const ids = new Set(MODELS.map((m) => m.id));
  const leftover = existsSync(join(ROOT, PREVIEW_DIR))
    ? readdirSync(join(ROOT, PREVIEW_DIR), { withFileTypes: true }).filter((d) => d.isDirectory() && !ids.has(d.name))
    : [];
  if (leftover.length) {
    warn(`${PREVIEW_DIR}/ has previews for models that no longer exist (${leftover.map((d) => d.name).join(', ')}) — \`npm run previews\` clears them out`);
  }
}

// ── run ──────────────────────────────────────────────────────────────────────

console.log('\n  which-model-are-you · validating %d models, %d questions, %d copy strings', MODELS.length, QUESTIONS.length, Object.keys(COPY).length);

checkSchema();
checkInterfaceCopy();
checkNoModelNames();
checkPoolBalance();
checkDistinct();
if (failures.length === 0) {
  checkCoverage();
  checkDrawRates();
  checkReachability();
  checkSensitivity();
  checkDeterminism();
} else {
  console.log('\n  (skipping simulations — fix the schema errors first)');
}
checkPreviews();

if (warnings.length) {
  console.log('\n  warnings');
  for (const w of warnings) console.log(`  ~ ${w}`);
}

if (failures.length) {
  console.log('\n  FAILED\n');
  for (const f of failures) console.log(`  ✗ ${f}`);
  console.log('');
  process.exit(1);
}

console.log('\n  ✓ all checks passed\n');
