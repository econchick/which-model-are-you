// Result sharing. A whole playthrough fits in a URL hash of about 20 characters:
//
//   #v=1&s=<seed base36>&a=<one base36 digit per answer>&r=<model id>
//
// `v` is the pool version. Bump POOL_VERSION in src/data/questions.js whenever
// you edit questions, so old links don't replay against a changed pool and
// silently produce a different result. When `v` doesn't match we skip the replay
// and just render `r` — the result someone was actually shown.

export const PARAM_VERSION = 'v';
export const PARAM_SEED = 's';
export const PARAM_ANSWERS = 'a';
export const PARAM_RESULT = 'r';

export function encodeRun({ version, seed, answers, resultId }) {
  const params = new URLSearchParams();
  params.set(PARAM_VERSION, String(version));
  params.set(PARAM_SEED, seed.toString(36));
  params.set(PARAM_ANSWERS, answers.map((i) => i.toString(36)).join(''));
  params.set(PARAM_RESULT, resultId);
  return `#${params.toString()}`;
}

export function decodeRun(hash = window.location.hash) {
  const raw = hash.replace(/^#/, '');
  if (!raw) return null;

  const params = new URLSearchParams(raw);
  const resultId = params.get(PARAM_RESULT);
  if (!resultId) return null;

  const seedRaw = params.get(PARAM_SEED);
  const seed = seedRaw ? parseInt(seedRaw, 36) : NaN;
  const answers = (params.get(PARAM_ANSWERS) ?? '')
    .split('')
    .map((c) => parseInt(c, 36))
    .filter((n) => Number.isInteger(n));

  return {
    version: Number(params.get(PARAM_VERSION)),
    seed: Number.isFinite(seed) ? seed : null,
    answers,
    resultId,
  };
}

/** Can we re-run the quiz from this link, or only show the stored result? */
export function isReplayable(run, currentVersion) {
  return Boolean(
    run && run.version === currentVersion && run.seed != null && run.answers.length > 0,
  );
}

export function shareUrl(hash) {
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${hash}`;
}
