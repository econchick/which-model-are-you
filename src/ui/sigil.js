// The sigil: a constellation drawn from the axis vectors themselves.
//
// Five axes become five points on a pentagon; the value on each axis sets how
// far that point sits from the centre. The filled shape is the model's chart,
// the outlined one is yours, and the gap between them is the part of the reading
// that flatters you.
//
// This is procedural on purpose: a new model gets its own sigil for free, with
// no artwork to commission. That's the whole reason it isn't a set of drawings.

import { AXES } from '../data/axes.js';

const R_BASE = 40;
const R_SPAN = 38;

function points(vector) {
  return AXES.map((axis, i) => {
    const angle = (-90 + i * (360 / AXES.length)) * (Math.PI / 180);
    const value = Math.max(-1, Math.min(1, vector[axis.id] ?? 0));
    const r = R_BASE + value * R_SPAN;
    return [Math.cos(angle) * r, Math.sin(angle) * r];
  });
}

const path = (pts) => pts.map(([x, y]) => `${x.toFixed(1)},${y.toFixed(1)}`).join(' ');

/**
 * @param {object} modelVector  the model's axis values (unscaled, -1..1)
 * @param {object} userVector   the player's normalised axis values
 * @param {[string,string]} accent  gradient pair from the model
 * @param {string} uid  unique suffix so multiple sigils can coexist on a page
 */
export function renderSigil(modelVector, userVector, accent, uid = 's') {
  const modelPts = points(modelVector);
  const userPts = points(userVector);
  const [from, to] = accent;

  const starField = modelPts
    .map(([x, y], i) => {
      const [ux, uy] = userPts[i];
      return `
        <line class="sigil-spoke" x1="0" y1="0" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" />
        <circle class="sigil-star" cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="3.2" />
        <circle class="sigil-star sigil-star--you" cx="${ux.toFixed(1)}" cy="${uy.toFixed(1)}" r="2" />`;
    })
    .join('');

  return `
    <svg class="sigil" viewBox="-100 -100 200 200" role="img"
         aria-label="A constellation chart comparing your traits with this model's">
      <defs>
        <radialGradient id="sigil-fill-${uid}">
          <stop offset="0%" stop-color="${from}" stop-opacity="0.55" />
          <stop offset="100%" stop-color="${to}" stop-opacity="0.15" />
        </radialGradient>
      </defs>
      <circle class="sigil-ring" cx="0" cy="0" r="78" />
      <circle class="sigil-ring sigil-ring--inner" cx="0" cy="0" r="40" />
      <polygon class="sigil-model" points="${path(modelPts)}" fill="url(#sigil-fill-${uid})" />
      <polygon class="sigil-you" points="${path(userPts)}" />
      ${starField}
    </svg>`;
}
