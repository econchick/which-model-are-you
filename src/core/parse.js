// Parsers for the Markdown content files in content/.
//
// Pure functions: text in, data out, no file access. The browser fetches the
// files (src/data/content.js) and the validator reads them off disk, but both
// end up here, so there is exactly one definition of the format.
//
// Errors carry a line number and say what was expected. Content bugs should be
// obvious to whoever is writing the content, not mysterious.

import { AXIS_IDS } from '../data/axes.js';

class ContentError extends Error {
  constructor(file, line, message) {
    super(`${file}:${line} — ${message}`);
    this.name = 'ContentError';
  }
}

/**
 * Split into `## ` blocks, keeping track of line numbers for error messages.
 *
 * Everything before the first `## ` is for the human writing the file: prose is
 * ignored, and a bare `key: value` line there is read as a setting. Fenced code
 * blocks are skipped entirely, so the format documentation at the top of each
 * file can show `## example` without it being parsed as a real entry.
 */
function blocks(text, file) {
  const lines = text.split('\n');
  const found = [];
  let current = null;
  let inFence = false;

  lines.forEach((raw, i) => {
    const lineNo = i + 1;

    if (/^\s*```/.test(raw)) {
      inFence = !inFence;
      return;
    }
    if (inFence) return;

    if (raw.startsWith('## ')) {
      current = { heading: raw.slice(3).trim(), headingLine: lineNo, lines: [] };
      found.push(current);
    } else if (current) {
      current.lines.push({ text: raw, lineNo });
    } else {
      const match = raw.match(/^(\w+)\s*:\s*(\S.*)$/);
      if (match) {
        found.preamble ??= {};
        found.preamble[match[1]] = match[2].trim();
      }
    }
  });

  return found;
}

/** `rigor 0.42, earnest -0.3` → { rigor: 0.42, earnest: -0.3 } */
function parseWeights(spec, file, lineNo) {
  const out = {};
  const body = spec.trim();
  if (!body || body === '-') return out;

  for (const part of body.split(',')) {
    const match = part.trim().match(/^([a-z]+)\s+(-?\d*\.?\d+)$/i);
    if (!match) {
      throw new ContentError(file, lineNo, `cannot read weight "${part.trim()}" — expected e.g. "rigor 0.4"`);
    }
    const [, axis, value] = match;
    if (!AXIS_IDS.includes(axis)) {
      throw new ContentError(file, lineNo, `unknown axis "${axis}" — expected one of ${AXIS_IDS.join(', ')}`);
    }
    out[axis] = Number(value);
  }
  return out;
}

/** `bread, nocturnal` → ['bread', 'nocturnal'] */
const parseList = (spec) =>
  spec
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);

/** Collect `key: value` lines until the first blank line or `###`. */
function parseFields(lines, file, stopAt = /^###\s/) {
  const fields = {};
  let index = 0;
  for (; index < lines.length; index++) {
    const { text, lineNo } = lines[index];
    if (stopAt.test(text)) break;
    if (!text.trim()) continue;
    const match = text.match(/^([a-z]+)\s*:\s*(.*)$/i);
    if (!match) break;
    fields[match[1].toLowerCase()] = { value: match[2].trim(), lineNo };
  }
  return { fields, index };
}

/** Join body lines into paragraphs, preserving deliberate single line breaks. */
function bodyText(lines) {
  return lines
    .map((l) => l.text)
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
}

// ── models ───────────────────────────────────────────────────────────────────

/**
 * content/models.md → the roster.
 *
 * One `## id — Name` block per model, a few `key: value` lines of mechanics,
 * then one `### when: <axis>` section per blurb variant.
 */
export function parseModels(text, file = 'content/models.md') {
  const found = blocks(text, file);
  const models = [];

  for (const block of found) {
    const match = block.heading.match(/^([a-z0-9-]+)\s*[—–-]\s*(.+)$/i);
    if (!match) {
      throw new ContentError(file, block.headingLine, `expected "## model-id — Display Name", got "${block.heading}"`);
    }
    const [, id, name] = match;

    const { fields } = parseFields(block.lines, file);
    const required = (key) => {
      if (!fields[key]) throw new ContentError(file, block.headingLine, `model "${id}" is missing "${key}:"`);
      return fields[key];
    };

    const accent = parseList(required('accent').value);
    if (accent.length !== 2) {
      throw new ContentError(file, fields.accent.lineNo, `"accent:" needs two colours, e.g. "#6d5bd0, #f0b67f"`);
    }

    // Blurb variants: ### when: <axis>
    const blurbs = [];
    let current = null;
    for (const line of block.lines) {
      const heading = line.text.match(/^###\s+when:\s*(\S+)\s*$/);
      if (heading) {
        current = { when: heading[1], lines: [], lineNo: line.lineNo };
        blurbs.push(current);
      } else if (current) {
        current.lines.push(line);
      }
    }

    if (blurbs.length === 0) {
      throw new ContentError(file, block.headingLine, `model "${id}" has no blurbs — add at least "### when: *"`);
    }

    models.push({
      id,
      name: name.trim(),
      lab: fields.lab?.value ?? '',
      accent,
      axes: parseWeights(required('axes').value, file, fields.axes.lineNo),
      tags: fields.tags ? parseList(fields.tags.value) : [],
      gravity: fields.gravity ? Number(fields.gravity.value) : 0,
      rare: /^(yes|true)$/i.test(fields.rare?.value ?? ''),
      tagline: required('tagline').value,
      blurbs: blurbs.map((b) => {
        const body = bodyText(b.lines);
        if (!body) throw new ContentError(file, b.lineNo, `blurb "when: ${b.when}" for "${id}" is empty`);
        return { when: b.when, text: body };
      }),
    });
  }

  return models;
}

// ── questions ────────────────────────────────────────────────────────────────

/**
 * content/questions.md → the pool.
 *
 * `## id [section]` (add `, unlock-only` for a follow-up), the prompt as prose,
 * then one `- id | label | weights` line per option.
 */
export function parseQuestions(text, file = 'content/questions.md') {
  const found = blocks(text, file);
  const version = Number(found.preamble?.version ?? 1);
  const questions = [];

  for (const block of found) {
    const match = block.heading.match(/^([a-z0-9-]+)\s*\[([^\]]+)\]\s*$/i);
    if (!match) {
      throw new ContentError(file, block.headingLine, `expected "## question-id [section]", got "${block.heading}"`);
    }
    const [, id, flagSpec] = match;
    const flags = parseList(flagSpec);
    const section = flags[0];
    const unlockOnly = flags.includes('unlock-only');

    const promptLines = [];
    const options = [];
    const unlocks = [];

    for (const line of block.lines) {
      const text_ = line.text;

      if (text_.startsWith('- ')) {
        const parts = text_
          .slice(2)
          .split('|')
          .map((s) => s.trim());
        if (parts.length < 3) {
          throw new ContentError(file, line.lineNo, `option needs "- id | label | weights", got "${text_.trim()}"`);
        }
        const [optId, label, weightSpec, extra] = parts;
        const option = { id: optId, label, axes: parseWeights(weightSpec, file, line.lineNo) };
        if (extra) {
          const tagMatch = extra.match(/^tags:\s*(.+)$/i);
          if (!tagMatch) {
            throw new ContentError(file, line.lineNo, `expected "tags: a, b" in the last field, got "${extra}"`);
          }
          option.tags = Object.fromEntries(parseList(tagMatch[1]).map((t) => [t, 1]));
        }
        options.push(option);
        continue;
      }

      const unlockMatch = text_.match(/^unlocks:\s*(\S+)\s*->\s*(\S+)\s*$/);
      if (unlockMatch) {
        unlocks.push({ when: unlockMatch[1], qid: unlockMatch[2] });
        continue;
      }

      if (text_.trim() && options.length === 0) promptLines.push(line);
    }

    const prompt = bodyText(promptLines);
    if (!prompt) throw new ContentError(file, block.headingLine, `question "${id}" has no prompt`);
    if (options.length === 0) throw new ContentError(file, block.headingLine, `question "${id}" has no options`);

    const question = { id, section, prompt, options };
    if (unlockOnly) question.unlockOnly = true;
    if (unlocks.length) question.unlocks = unlocks;
    questions.push(question);
  }

  return { version, questions };
}

// ── interface copy ───────────────────────────────────────────────────────────

/** content/interface.md → { 'intro.title': 'Which model\nare you?', ... } */
export function parseInterface(text, file = 'content/interface.md') {
  const found = blocks(text, file);
  const copy = {};
  for (const block of found) {
    const body = bodyText(block.lines);
    if (!body) throw new ContentError(file, block.headingLine, `"${block.heading}" has no text under it`);
    copy[block.heading] = body;
  }
  return copy;
}
