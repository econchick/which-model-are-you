// Loads the Markdown content files in the browser.
//
// The validator reads the same files off disk with node's fs and runs them
// through the same parsers, so there's one definition of the format and no way
// for the two to drift.

import { parseModels, parseQuestions, parseInterface } from '../core/parse.js';

async function read(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`could not load ${url} (${response.status})`);
  return response.text();
}

/** @returns {Promise<{models, modelsById, questions, poolVersion, copy}>} */
export async function loadContent(base = 'content/') {
  const [modelsText, questionsText, interfaceText] = await Promise.all([
    read(`${base}models.md`),
    read(`${base}questions.md`),
    read(`${base}interface.md`),
  ]);

  const models = parseModels(modelsText);
  const { version, questions } = parseQuestions(questionsText);

  return {
    models,
    modelsById: Object.fromEntries(models.map((m) => [m.id, m])),
    questions,
    poolVersion: version,
    copy: parseInterface(interfaceText),
  };
}

/** Substitute {name}-style placeholders in a copy string. */
export function fill(template, values = {}) {
  return String(template ?? '').replace(/\{(\w+)\}/g, (whole, key) =>
    key in values ? String(values[key]) : whole,
  );
}

/** Pick the blurb variant matching the player's dominant axis, else the fallback. */
export function blurbFor(model, axisId, rng) {
  const matches = model.blurbs.filter((b) => b.when === axisId);
  const pool = matches.length > 0 ? matches : model.blurbs.filter((b) => b.when === '*');
  const usable = pool.length > 0 ? pool : model.blurbs;
  const index = rng ? Math.floor(rng() * usable.length) : 0;
  return usable[Math.min(index, usable.length - 1)].text;
}
