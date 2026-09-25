// The page as a flowchart. Each question is a step, and each answer trails a
// wire that fades out before it reaches anything — because the next question
// doesn't exist yet. Answer, and your wire draws on through to the question it
// leads to.
//
// app.js decides *what* is on the page, as a list of steps; this makes the page
// match. Steps that are already there stay put, so wires can animate between
// them instead of the whole page being redrawn.

import { wiresFor } from './wires.js';

const SVG = 'http://www.w3.org/2000/svg';

/** How long a new step waits for its wire to reach it before fading in. */
const ARRIVE_MS = 380;

const reducedMotion = () => window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;

/**
 * @param {HTMLElement} root  emptied and taken over
 * @returns {{ sync: Function, bringIntoView: Function }}
 */
export function createFlow(root) {
  root.innerHTML = `
    <div class="flow">
      <svg class="wires" aria-hidden="true"></svg>
      <div class="flow-steps"></div>
    </div>`;
  const flowEl = root.querySelector('.flow');
  const svg = flowEl.querySelector('.wires');
  const stepsEl = flowEl.querySelector('.flow-steps');

  /** step element → its SVG group, fade gradient, stub paths and route path */
  const wires = new Map();
  let gradients = 0;
  let animate = true;

  new ResizeObserver(() => draw()).observe(flowEl);
  document.fonts?.ready.then(() => draw());

  /** An element's layout box relative to the flow — transforms ignored, on purpose. */
  function boxOf(el) {
    let left = 0;
    let top = 0;
    for (let n = el; n && n !== flowEl; n = n.offsetParent) {
      left += n.offsetLeft;
      top += n.offsetTop;
    }
    const width = el.offsetWidth;
    const height = el.offsetHeight;
    return { left, top, width, height, bottom: top + height };
  }

  function wiresOf(step, count) {
    let w = wires.get(step);
    if (w && w.stubs.length === count) return w;
    w?.group.remove();

    const id = `wire-fade-${++gradients}`;
    const group = document.createElementNS(SVG, 'g');
    group.innerHTML = `
      <linearGradient id="${id}" gradientUnits="userSpaceOnUse" x1="0" x2="0">
        <stop class="wire-stop" offset="0" />
        <stop class="wire-stop" offset="1" stop-opacity="0" />
      </linearGradient>
      ${`<path class="wire wire-stub" style="stroke:url(#${id})" />`.repeat(count)}
      <path class="wire wire-route" pathLength="1" />`;
    svg.append(group);

    w = {
      group,
      gradient: group.querySelector('linearGradient'),
      stubs: [...group.querySelectorAll('.wire-stub')],
      route: group.querySelector('.wire-route'),
    };
    wires.set(step, w);
    return w;
  }

  /** Re-measure everything and redraw every wire. Cheap enough to do on any change. */
  function draw() {
    const steps = [...stepsEl.children];
    steps.forEach((step, i) => {
      const cards = [...step.querySelectorAll('[data-wire]')];
      if (cards.length === 0) return;

      const chosen = step.dataset.chosen === '' ? null : Number(step.dataset.chosen);
      const next = steps[i + 1];
      const node = next?.querySelector('.step-node');
      const nodeBox = node && boxOf(node);
      const target = nodeBox && { x: nodeBox.left + nodeBox.width / 2, y: nodeBox.top };

      const { stubs, route, fade } = wiresFor(cards.map(boxOf), chosen, target);
      const w = wiresOf(step, cards.length);
      // A step's own wires wait for it to arrive, like the rest of it.
      w.group.classList.toggle('is-entering', step.classList.contains('is-entering'));

      w.gradient.setAttribute('y1', fade[0]);
      w.gradient.setAttribute('y2', fade[1]);
      w.stubs.forEach((path, j) => {
        path.setAttribute('d', stubs[j]);
        path.classList.toggle('is-taken', chosen === j && Boolean(route));
        path.classList.toggle('is-muted', chosen != null && chosen !== j);
      });

      w.route.setAttribute('d', route);
      // A route is "new" when it joins a different pair of things than before —
      // not when a resize merely moves its ends. Only new routes draw in.
      const key = route ? `${step.dataset.key}:${chosen}>${next.dataset.key}` : '';
      if (w.route.dataset.key !== key) {
        w.route.dataset.key = key;
        w.route.classList.remove('is-drawing');
        if (key && animate && !reducedMotion()) {
          w.route.getBoundingClientRect(); // restart the animation
          w.route.classList.add('is-drawing');
        }
      }
    });

    for (const [step, w] of wires) {
      if (!step.isConnected) {
        w.group.remove();
        wires.delete(step);
      }
    }
  }

  function choose(step, chosen, locked) {
    step.dataset.chosen = chosen ?? '';
    step.classList.toggle('is-answered', chosen != null);
    for (const card of step.querySelectorAll('[data-wire]')) {
      const on = chosen === Number(card.dataset.index ?? 0);
      card.classList.toggle('is-chosen', on);
      if (card.getAttribute('role') === 'radio') card.setAttribute('aria-checked', String(on));
      // The start button is spent once pressed; everything locks once there's a result.
      card.disabled = locked || (card.dataset.action === 'start' && chosen != null);
    }
  }

  /**
   * Make the page show exactly these steps, in this order.
   *
   * @param {Array<{key: string, html: () => string, chosen?: number|null}>} items
   * @param {object} [opts]
   * @param {boolean} [opts.instant]  no entrances, no wire drawing (first paint)
   * @param {boolean} [opts.locked]   answers can no longer be changed
   * @returns {HTMLElement[]} the steps that are new this time
   */
  function sync(items, { instant = false, locked = false } = {}) {
    const existing = new Map([...stepsEl.children].map((el) => [el.dataset.key, el]));
    const entered = [];
    let cursor = null;

    for (const item of items) {
      let step = existing.get(item.key);
      if (step) {
        existing.delete(item.key);
      } else {
        step = document.createElement('div');
        step.className = 'step';
        step.dataset.key = item.key;
        step.innerHTML = item.html();
        if (!instant) step.classList.add('is-entering');
        entered.push(step);
      }
      const slot = cursor ? cursor.nextElementSibling : stepsEl.firstElementChild;
      if (slot !== step) stepsEl.insertBefore(step, slot);
      choose(step, item.chosen ?? null, locked);
      cursor = step;
    }
    for (const step of existing.values()) step.remove();

    flowEl.classList.toggle('is-done', locked);
    animate = !instant;
    draw();
    animate = true;

    const arrivals = entered.filter((el) => el.classList.contains('is-entering'));
    if (arrivals.length) {
      setTimeout(() => {
        for (const el of arrivals) {
          el.classList.remove('is-entering');
          wires.get(el)?.group.classList.remove('is-entering');
        }
      }, reducedMotion() ? 0 : ARRIVE_MS);
    }
    return entered;
  }

  /** Scroll so a step sits near the top, with the tail of its incoming wire in view. */
  function bringIntoView(step, { instant = false } = {}) {
    const anchor = step.querySelector('.step-node') ?? step;
    const offset = Math.min(140, window.innerHeight * 0.18);
    const top = anchor.getBoundingClientRect().top + window.scrollY - offset;
    window.scrollTo({ top: Math.max(0, top), behavior: instant || reducedMotion() ? 'auto' : 'smooth' });
  }

  // Hovering or focusing an answer brightens its wire: a preview of the path.
  function heat(event, on) {
    const card = event.target.closest?.('[data-wire]');
    if (!card || card.contains(event.relatedTarget)) return;
    const w = wires.get(card.closest('.step'));
    w?.stubs[Number(card.dataset.index ?? 0)]?.classList.toggle('is-hot', on);
  }
  stepsEl.addEventListener('pointerover', (e) => heat(e, true));
  stepsEl.addEventListener('pointerout', (e) => heat(e, false));
  stepsEl.addEventListener('focusin', (e) => heat(e, true));
  stepsEl.addEventListener('focusout', (e) => heat(e, false));

  return { sync, bringIntoView };
}
