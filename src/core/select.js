// Question selection. The quiz is a flowchart: every answer leads to a
// different next question, so which ten you're asked depends on how you answer.
//
// The chart has a fixed *shape* rather than a shuffle. That's what keeps a
// playthrough feeling composed — you open somewhere easy, build, get a silly one
// as a palate cleanser, and land on a closer. Whichever answer you give, the
// next step is the same kind of question; only which one changes.
//
// No chart is stored anywhere. Each fork is drawn when it's reached, from the
// seed and the answers that led there, so the same seed and answers always walk
// the same path — which is what lets a result URL replay a run.

import { AXIS_IDS, zeroVector } from '../data/axes.js';
import { mulberry32, hashSeed, pickByWeight } from './rng.js';

export const SHAPE = [
  'opener',
  'core',
  'core',
  'core',
  'whimsy',
  'core',
  'core',
  'core',
  'whimsy',
  'closer',
];

export const QUIZ_LENGTH = SHAPE.length;

/** Every axis must accumulate at least this much possible signal across a run. */
export const MIN_COVERAGE = 1.2;

/**
 * How hard the draw leans toward the most useful question. Squaring the value
 * makes a question twice as useful four times as likely — a real preference,
 * but every question in the pool still gets asked. (Picking only from the top
 * few, which this replaced, meant half the pool was never asked at all.)
 */
const PREFERENCE = 2;

/** The most a question could move each axis, whichever option you pick. */
function questionReach(q) {
  let reach = reaches.get(q);
  if (!reach) {
    reach = zeroVector();
    for (const id of AXIS_IDS) {
      reach[id] = Math.max(0, ...q.options.map((o) => Math.abs(o.axes?.[id] ?? 0)));
    }
    reaches.set(q, reach);
  }
  return reach;
}

/** Every fork weighs its candidates, so a question's reach is worked out once. */
const reaches = new WeakMap();

/**
 * How much a question is worth *right now*: weight on axes the path has barely
 * measured counts for more than weight on axes it has already covered. This is
 * what pulls each path toward balanced coverage without scripting it by hand.
 */
function marginalValue(q, coverage) {
  const reach = questionReach(q);
  let total = 0;
  for (const id of AXIS_IDS) total += reach[id] / (1 + coverage[id]);
  return total;
}

/** Coverage totals for the questions on a path. */
export function coverageOf(picked) {
  const coverage = zeroVector();
  for (const p of picked) {
    const reach = questionReach(p.question);
    for (const id of AXIS_IDS) coverage[id] += reach[id];
  }
  return coverage;
}

/** Fisher–Yates, so no answer position always gets first pick of the pool. */
function shuffledIndexes(rng, n) {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
}

function opening(pool, seed) {
  const openers = pool.filter((q) => !q.unlockOnly && q.section === SHAPE[0]);
  const chosen = pickByWeight(mulberry32(seed), openers, (q) => marginalValue(q, zeroVector()) ** PREFERENCE);
  if (!chosen) throw new Error(`no "${SHAPE[0]}" questions to open with`);
  return chosen;
}

/**
 * Where each answer to the last question on a path leads: one next question per
 * option, all different.
 *
 * An answer with an `unlocks:` rule leads straight to its follow-up, when the
 * next step is the follow-up's kind of question. Every other answer draws from
 * the next step's section, weighted toward whatever measures the axes this path
 * has measured least.
 *
 * One level only: a follow-up cannot itself unlock another. Deeper trees make
 * coverage impossible to reason about for very little payoff.
 *
 * @param {Array<{question}>} picked  the path so far
 * @param {number[]} answers  the answers that led down it
 * @returns {object[]} the next question for each option, by option index
 */
export function branchesFrom(pool, seed, picked, answers) {
  const k = picked.length - 1;
  const section = SHAPE[k + 1];
  if (!section) return [];
  const { question } = picked[k];

  // Seeded by the path, so each fork is fixed however many times it's reached.
  const rng = mulberry32(hashSeed(`${seed}/${answers.slice(0, k).join('')}`));
  const coverage = coverageOf(picked);
  const asked = new Set(picked.map((p) => p.question.id));
  const claimed = new Set();

  const branches = question.options.map((option) => {
    const rule = (question.unlocks ?? []).find((u) => u.when === option.id);
    const followUp = rule && pool.find((q) => q.id === rule.qid);
    if (!followUp || followUp.section !== section || asked.has(followUp.id)) return null;
    claimed.add(followUp.id);
    return followUp;
  });

  const fresh = pool.filter((q) => !q.unlockOnly && q.section === section && !asked.has(q.id));
  for (const i of shuffledIndexes(rng, branches.length)) {
    if (branches[i]) continue;
    // Different for every answer when the pool allows. scripts/validate.mjs
    // fails when it doesn't, but the quiz still works if two have to share.
    const unclaimed = fresh.filter((q) => !claimed.has(q.id));
    const chosen = pickByWeight(rng, unclaimed.length ? unclaimed : fresh, (q) => marginalValue(q, coverage) ** PREFERENCE);
    if (!chosen) throw new Error(`question pool exhausted for section "${section}"`);
    claimed.add(chosen.id);
    branches[i] = chosen;
  }
  return branches;
}

/**
 * Walk the chart: the questions asked along the path these answers take, up to
 * and including the one waiting for an answer — or all ten, once answered.
 */
export function pathFor(pool, seed, answers) {
  const picked = [{ question: opening(pool, seed), slot: SHAPE[0] }];
  while (picked.length < QUIZ_LENGTH && picked.length <= answers.length) {
    const i = picked.length - 1;
    const next = branchesFrom(pool, seed, picked, answers)[answers[i]];
    if (!next) break; // an answer the question doesn't have, e.g. a mangled link
    picked.push({ question: next, slot: SHAPE[i + 1] });
  }
  return picked;
}
