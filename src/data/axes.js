// The five trait axes. Everything in the quiz is measured on these.
//
// Answers add weights here; models declare a target vector here. Nothing else
// in the app knows about models by name, which is what makes adding a new model
// a one-file edit (see content/models.md).
//
// Values run -1 .. +1. `pos` is the +1 pole, `neg` is the -1 pole.
//
// Adding an axis is a bigger deal than adding a model: every model needs a value
// for it, and scripts/validate.mjs will tell you which ones are missing. Five is
// deliberate — more axes divide the same ten questions into thinner signal.

export const AXES = [
  { id: 'rigor', pos: 'rigor', neg: 'vibes', blurb: 'proof vs. instinct' },
  { id: 'terse', pos: 'terse', neg: 'verbose', blurb: 'economy vs. abundance' },
  { id: 'speed', pos: 'speed', neg: 'depth', blurb: 'now vs. thoroughly' },
  { id: 'earnest', pos: 'earnest', neg: 'irreverent', blurb: 'sincere vs. sideways' },
  { id: 'solitary', pos: 'solitary', neg: 'collaborative', blurb: 'alone vs. together' },
];

export const AXIS_IDS = AXES.map((a) => a.id);

/** A zeroed vector, e.g. { rigor: 0, terse: 0, ... }. */
export function zeroVector() {
  return Object.fromEntries(AXIS_IDS.map((id) => [id, 0]));
}
