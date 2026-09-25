// The flowchart's wiring, as pure geometry: given where the answer cards and
// the next question sit, work out the lines between them. flow.js does the
// measuring and owns the DOM; nothing here touches the page.
//
// Two layouts. When the answers sit in a row, each wire drops straight out of
// the bottom of its card. When they're stacked (narrow screens), each wire
// leaves the card's left edge into its own lane in the gutter — top card
// outermost — so no two wires ever cross.

/** How far an unanswered wire runs before it has faded out completely. */
export const FADE = 84;

/** How far below the answers a taken wire turns toward the next question. */
const TURN = 40;
const RADIUS = 14;

/** Lanes in the gutter, for stacked answers — spaced so outlined wires don't touch. */
const LANE_INSET = 12;
const LANE_GAP = 9;

/** Wires start this far inside their card, so a card lifting on hover never shows a gap. */
const TUCK = 4;

const inRow = (cards) => cards.every((c) => Math.abs(c.top - cards[0].top) < 2);

/**
 * The part of each wire that's the same whether or not it gets taken: from its
 * card out to the point where it heads downward.
 */
function leads(cards) {
  if (inRow(cards)) {
    return cards.map((c) => [{ x: c.left + c.width / 2, y: c.bottom - TUCK }]);
  }
  const n = cards.length;
  return cards.map((c, i) => {
    const y = c.top + c.height / 2;
    const lane = c.left - LANE_INSET - (n - 1 - i) * LANE_GAP;
    return [{ x: c.left + TUCK, y }, { x: lane, y }];
  });
}

/**
 * @param {Array<{left, top, width, height, bottom}>} cards  answer cards, in drawing coordinates
 * @param {number|null} chosen  index of the taken answer
 * @param {{x, y}|null} target  the next question's node, once it exists
 * @returns {{ stubs: string[], route: string, fade: [number, number] }}
 *   `stubs` are the fading wires, one per card; `route` is the taken wire drawn
 *   all the way to `target` (empty until there is one); `fade` is the band over
 *   which the stubs disappear.
 */
export function wiresFor(cards, chosen, target) {
  const bottom = Math.max(...cards.map((c) => c.bottom));
  const all = leads(cards);

  const stubs = all.map((lead) => {
    const { x } = lead[lead.length - 1];
    return roundedPath([...lead, { x, y: bottom + FADE }]);
  });

  let route = '';
  const lead = chosen == null ? null : all[chosen];
  if (lead && target) {
    const { x } = lead[lead.length - 1];
    const turn = bottom + Math.min(TURN, (target.y - bottom) / 2);
    // Snap a near-miss straight rather than drawing a one-pixel kink.
    const tx = Math.abs(target.x - x) < 2 ? x : target.x;
    route = roundedPath([...lead, { x, y: turn }, { x: tx, y: turn }, { x: tx, y: target.y }]);
  }

  return { stubs, route, fade: [bottom, bottom + FADE] };
}

// ── path building ────────────────────────────────────────────────────────────

const same = (a, b) => Math.abs(a - b) < 0.5;
const dist = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
const pt = (p) => `${p.x.toFixed(1)} ${p.y.toFixed(1)}`;

function toward(from, to, d) {
  const k = d / (dist(from, to) || 1);
  return { x: from.x + (to.x - from.x) * k, y: from.y + (to.y - from.y) * k };
}

/** Drop repeated points, and middle points on a straight run. */
function simplify(points) {
  const out = [];
  for (const p of points) {
    const last = out[out.length - 1];
    if (last && same(last.x, p.x) && same(last.y, p.y)) continue;
    const prev = out[out.length - 2];
    if (prev && ((same(prev.x, last.x) && same(last.x, p.x)) || (same(prev.y, last.y) && same(last.y, p.y)))) {
      out.pop();
    }
    out.push(p);
  }
  return out;
}

/** An orthogonal polyline as an SVG path, with its corners rounded off. */
export function roundedPath(points, radius = RADIUS) {
  const pts = simplify(points);
  if (pts.length < 2) return '';
  let d = `M${pt(pts[0])}`;
  for (let i = 1; i < pts.length - 1; i++) {
    const [a, b, c] = [pts[i - 1], pts[i], pts[i + 1]];
    const r = Math.min(radius, dist(a, b) / 2, dist(b, c) / 2);
    d += ` L${pt(toward(b, a, r))} Q${pt(b)} ${pt(toward(b, c, r))}`;
  }
  return `${d} L${pt(pts[pts.length - 1])}`;
}
