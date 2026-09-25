// Question selection: draw 10 from the pool so that every run differs, but no
// run leaves a trait unmeasured.
//
// The run has a fixed *shape* rather than a shuffle. That's what keeps a
// playthrough feeling composed — you open somewhere easy, build, get a silly one
// as a palate cleanser, and land on a closer.

import { AXIS_IDS, zeroVector } from '../data/axes.js';
import { mulberry32, pickByWeight } from './rng.js';

export const SHAPE = [
  'opener',
  'core',
  'core',
  'core',
  'whimsy',
  'core',
  'core',
  'conditional', // filled by a follow-up if one unlocked, else another core
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
  const reach = zeroVector();
  for (const id of AXIS_IDS) {
    reach[id] = Math.max(0, ...q.options.map((o) => Math.abs(o.axes?.[id] ?? 0)));
  }
  return reach;
}

/**
 * How much a question is worth *right now*: weight on axes we've barely measured
 * counts for more than weight on axes we've already covered. This is what pulls
 * each run toward balanced coverage without scripting it by hand.
 */
function marginalValue(q, coverage) {
  const reach = questionReach(q);
  let total = 0;
  for (const id of AXIS_IDS) total += reach[id] / (1 + coverage[id]);
  return total;
}

function addReach(coverage, q) {
  const reach = questionReach(q);
  for (const id of AXIS_IDS) coverage[id] += reach[id];
}

/**
 * Build the question list for one playthrough.
 *
 * Deterministic in `seed`: the same seed always yields the same ten questions,
 * which is what lets a result URL replay a run.
 */
export function selectQuestions(pool, seed) {
  const rng = mulberry32(seed);
  const coverage = zeroVector();
  const used = new Set();
  const picked = [];

  // Follow-ups are reachable only by unlocking them, never by ordinary draw.
  const drawable = pool.filter((q) => !q.unlockOnly);

  for (const slot of SHAPE) {
    const section = slot === 'conditional' ? 'core' : slot;
    const eligible = drawable.filter((q) => q.section === section && !used.has(q.id));

    // Any eligible question can come up, the useful ones more often. That's
    // what makes runs differ; repairCoverage below makes sure none of them
    // leaves an axis unmeasured.
    const chosen = pickByWeight(rng, eligible, (q) => marginalValue(q, coverage) ** PREFERENCE);
    if (!chosen) {
      throw new Error(`question pool exhausted for section "${section}"`);
    }
    used.add(chosen.id);
    addReach(coverage, chosen);
    picked.push({ question: chosen, slot });
  }

  repairCoverage(picked, drawable, used, coverage);
  return picked;
}

/**
 * If the draw left an axis under-measured, swap the least useful core question
 * for the best one that covers the gap. Two attempts, then give up — a pool that
 * can't cover its own axes is a content bug, and scripts/validate.mjs is where
 * that should surface, not the browser.
 */
function repairCoverage(picked, drawable, used, coverage) {
  for (let attempt = 0; attempt < 2; attempt++) {
    const deficient = AXIS_IDS.filter((id) => coverage[id] < MIN_COVERAGE);
    if (deficient.length === 0) return;

    const gain = (q) => deficient.reduce((s, id) => s + questionReach(q)[id], 0);
    const candidate = drawable
      .filter((q) => q.section === 'core' && !used.has(q.id))
      .sort((a, b) => gain(b) - gain(a))[0];
    if (!candidate || gain(candidate) <= 0) return;

    // Drop whichever core slot contributes least to the axes we're short on.
    const coreSlots = picked
      .map((p, index) => ({ ...p, index }))
      .filter((p) => p.slot === 'core');
    if (coreSlots.length === 0) return;
    const victim = coreSlots.sort((a, b) => gain(a.question) - gain(b.question))[0];

    const victimReach = questionReach(victim.question);
    const candidateReach = questionReach(candidate);
    for (const id of AXIS_IDS) coverage[id] += candidateReach[id] - victimReach[id];

    used.delete(victim.question.id);
    used.add(candidate.id);
    picked[victim.index] = { question: candidate, slot: 'core' };
  }
}

/**
 * Check answers so far for an unlocked follow-up and slot it in.
 *
 * One level only: an unlocked question cannot itself unlock another. Deeper
 * trees make coverage impossible to reason about for very little payoff.
 */
export function applyUnlocks(picked, pool, answers) {
  const slotIndex = picked.findIndex((p) => p.slot === 'conditional');
  if (slotIndex === -1) return picked;

  for (let i = 0; i < slotIndex; i++) {
    const { question } = picked[i];
    const choice = answers[i];
    if (choice == null) continue;
    const optionId = question.options[choice]?.id;
    const rule = (question.unlocks ?? []).find((u) => u.when === optionId);
    if (!rule) continue;

    const followUp = pool.find((q) => q.id === rule.qid);
    const alreadyAsked = picked.some((p) => p.question.id === rule.qid);
    if (!followUp || alreadyAsked) continue;

    const next = picked.slice();
    next[slotIndex] = { question: followUp, slot: 'conditional', unlockedBy: question.id };
    return next;
  }
  return picked;
}

/** Coverage totals for a selected run — used by the validator. */
export function coverageOf(picked) {
  const coverage = zeroVector();
  for (const p of picked) addReach(coverage, p.question);
  return coverage;
}
