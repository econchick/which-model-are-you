// The easter egg. Type "make no mistakes" anywhere on the page — the line people
// tack onto the end of a prompt, as if the model had been planning to make some.
//
// The quiz takes it literally. The only mistakes it can find are the stickers
// it put on crooked on purpose, so it straightens every one of them and reports
// how many it "fixed". Type it again to put them back.

import { fill } from '../data/content.js';

const PHRASE = 'make no mistakes';

/** How long "Understood" stays up before the fixing starts. */
const THINK_MS = 900;
const TOAST_MS = 3200;

// The phrase-so-far just before each of its spaces ("make ", "make no "). A
// space typed there is part of the phrase, not a press of the focused button.
const SPACED_PREFIXES = [...PHRASE].flatMap((c, i) => (c === ' ' ? [PHRASE.slice(0, i + 1)] : []));

let toast = null;
let hideTimer = 0;

function say(text) {
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'egg-toast';
    toast.setAttribute('role', 'status');
    document.body.append(toast);
  }
  toast.textContent = text;
  // Restart the entrance even if it's already showing.
  toast.classList.remove('is-shown');
  void toast.offsetWidth;
  toast.classList.add('is-shown');
  clearTimeout(hideTimer);
  hideTimer = setTimeout(() => toast.classList.remove('is-shown'), TOAST_MS);
}

/** Everything on the page that's currently tilted: the "mistakes". */
function countCrooked() {
  let crooked = 0;
  for (const el of document.body.querySelectorAll('*')) {
    if (el === toast) continue;
    const transform = getComputedStyle(el).transform;
    if (transform === 'none') continue;
    const m = new DOMMatrixReadOnly(transform);
    if (Math.abs(Math.atan2(m.b, m.a)) > 0.005) crooked++;
  }
  return crooked;
}

function toggle(copy) {
  const root = document.documentElement;
  if (root.classList.contains('no-mistakes')) {
    say(copy['egg.undo']);
    root.classList.remove('no-mistakes');
    return;
  }
  say(copy['egg.ack']);
  setTimeout(() => {
    const fixed = countCrooked();
    root.classList.add('no-mistakes');
    say(fill(copy['egg.fixed'], { n: fixed }));
  }, THINK_MS);
}

/** Listen for the phrase, typed anywhere, in any case. */
export function listenForNoMistakes(copy) {
  let typed = '';
  document.addEventListener('keydown', (event) => {
    if (event.metaKey || event.ctrlKey || event.altKey || event.key.length !== 1) return;
    typed = (typed + event.key.toLowerCase()).slice(-PHRASE.length);
    if (event.key === ' ' && SPACED_PREFIXES.some((p) => typed.endsWith(p))) event.preventDefault();
    if (typed === PHRASE) {
      typed = '';
      toggle(copy);
    }
  });
}
