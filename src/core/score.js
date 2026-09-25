// Scoring: turn a set of answers into a ranked list of models.
//
//   score(model) = cosine(userVector, zScored(model.axes))
//                + TAG_WEIGHT * affinity(model)
//                + model.gravity
//
// Three details here are load-bearing; see README.md ("Why cosine?") before
// changing any of them.

import { AXIS_IDS, zeroVector } from '../data/axes.js';

/** How much the whimsy tag side-channel can move a result. Deliberately small:
 *  ten questions of axis signal should always outrank one emoji. */
export const TAG_WEIGHT = 0.15;

/**
 * Z-score the model vectors per axis across the whole roster.
 *
 * An axis where every model agrees carries no information, so it shrinks toward
 * zero automatically. An axis with one outlier amplifies. The nice property: this
 * recalibrates itself when you add a model, with no hand-tuning.
 */
export function zScoreModels(models) {
  const stats = {};
  for (const id of AXIS_IDS) {
    const values = models.map((m) => m.axes[id] ?? 0);
    const mean = values.reduce((s, v) => s + v, 0) / values.length;
    const variance = values.reduce((s, v) => s + (v - mean) ** 2, 0) / values.length;
    const sd = Math.sqrt(variance);
    stats[id] = { mean, sd };
  }
  return models.map((m) => {
    const z = {};
    for (const id of AXIS_IDS) {
      const { mean, sd } = stats[id];
      // sd ~ 0 means the roster is unanimous on this axis: it discriminates
      // nothing, so contribute nothing rather than dividing by ~zero.
      z[id] = sd < 1e-6 ? 0 : ((m.axes[id] ?? 0) - mean) / sd;
    }
    return { ...m, z };
  });
}

/** Sum the axis weights of the chosen answers into one raw vector. */
export function sumAnswers(questions, choiceIndexes) {
  const v = zeroVector();
  questions.forEach((q, i) => {
    const option = q.options[choiceIndexes[i]];
    if (!option) return;
    for (const [axis, w] of Object.entries(option.axes ?? {})) {
      if (axis in v) v[axis] += w;
    }
  });
  return v;
}

/**
 * Scale each axis by the most it could possibly have moved given the questions
 * actually asked, so a run that happened to ask three rigor questions and one
 * speed question doesn't overweight rigor purely by draw.
 */
export function normalizeUserVector(raw, questions) {
  const maxAbs = zeroVector();
  for (const q of questions) {
    for (const id of AXIS_IDS) {
      const biggest = Math.max(0, ...q.options.map((o) => Math.abs(o.axes?.[id] ?? 0)));
      maxAbs[id] += biggest;
    }
  }
  const out = zeroVector();
  for (const id of AXIS_IDS) {
    out[id] = maxAbs[id] < 1e-6 ? 0 : Math.max(-1, Math.min(1, raw[id] / maxAbs[id]));
  }
  return out;
}

/** Collect the concept tags the chosen answers carry, e.g. { bread: 1 }. */
export function sumTags(questions, choiceIndexes) {
  const tags = {};
  questions.forEach((q, i) => {
    const option = q.options[choiceIndexes[i]];
    if (!option) return;
    for (const [tag, w] of Object.entries(option.tags ?? {})) {
      tags[tag] = (tags[tag] ?? 0) + w;
    }
  });
  return tags;
}

/** Matched tags, damped so a model that hoards tags can't sweep the board. */
export function affinity(model, tagTotals) {
  const claimed = model.tags ?? [];
  if (claimed.length === 0) return 0;
  let matched = 0;
  for (const tag of claimed) matched += tagTotals[tag] ?? 0;
  return matched / (claimed.length + 2);
}

export function cosine(a, b) {
  let dot = 0;
  let na = 0;
  let nb = 0;
  for (const id of AXIS_IDS) {
    const x = a[id] ?? 0;
    const y = b[id] ?? 0;
    dot += x * y;
    na += x * x;
    nb += y * y;
  }
  if (na < 1e-12 || nb < 1e-12) return 0;
  return dot / (Math.sqrt(na) * Math.sqrt(nb));
}

/**
 * Rank the whole roster for one playthrough.
 * Returns [{ model, score, cos, aff }, ...] best first.
 *
 * `rng` only breaks exact ties, so results stay deterministic and earned.
 */
export function rankModels({ models, questions, choiceIndexes, rng }) {
  const scored = zScoreModels(models);
  const userVector = normalizeUserVector(sumAnswers(questions, choiceIndexes), questions);
  const tagTotals = sumTags(questions, choiceIndexes);

  const results = scored.map((m) => {
    const cos = cosine(userVector, m.z);
    const aff = affinity(m, tagTotals);
    return {
      model: m,
      cos,
      aff,
      score: cos + TAG_WEIGHT * aff + (m.gravity ?? 0),
      jitter: rng ? rng() : 0,
    };
  });

  results.sort((a, b) => b.score - a.score || a.jitter - b.jitter);
  return { userVector, tagTotals, results };
}

/**
 * The rising sign: the best-placed model from a different lab than the winner.
 * Another member of the same family (Qwen3.8 Flash rising under Qwen3.8-Max)
 * reads as a rerun of the result, not a second opinion.
 */
export function risingSign(results) {
  const lab = results[0]?.model.lab;
  return results.find((r) => r.model.lab !== lab)?.model ?? null;
}

/** The axis the user leaned hardest on — used to choose a blurb variant. */
export function dominantAxis(userVector) {
  let best = AXIS_IDS[0];
  for (const id of AXIS_IDS) {
    if (Math.abs(userVector[id]) > Math.abs(userVector[best])) best = id;
  }
  return best;
}
