// The crab. It lives in the bottom-right corner with only its eyes and claws
// over the edge; hover (or focus) and it climbs out, click and it says
// something, keep clicking and it keeps going. After its last line it waves
// and goes back into hiding, and the next click starts again from the top.
// Click anywhere else mid-way and it hides, but picks up where it left off.
// Everything it says is in content/interface.md.

/** How long the wave lasts before it ducks back down. Matches the CSS. */
const WAVE_MS = 750;

/** Long enough to read the last line before the crab says goodbye. */
const readTime = (line) => Math.max(1500, line.length * 38);

const ART = `
  <svg class="crab-art" viewBox="0 0 120 100" aria-hidden="true">
    <g class="crab-legs">
      <path d="M33 72 Q22 74 17 83" /><path d="M37 78 Q28 83 26 92" /><path d="M44 82 Q39 88 38 96" />
      <path d="M87 72 Q98 74 103 83" /><path d="M83 78 Q92 83 94 92" /><path d="M76 82 Q81 88 82 96" />
    </g>
    <g class="crab-arm crab-arm--left">
      <path class="crab-arm-line" d="M34 62 Q22 60 19 47" />
      <path class="crab-shell" d="M20 48 C8 48 4 36 8 26 C10 21 15 19 18 22 L16 31 L25 24 C29 30 29 42 20 48 Z" />
    </g>
    <g class="crab-arm crab-arm--right">
      <path class="crab-arm-line" d="M86 62 Q98 60 101 47" />
      <path class="crab-shell" d="M100 48 C112 48 116 36 112 26 C110 21 105 19 102 22 L104 31 L95 24 C91 30 91 42 100 48 Z" />
    </g>
    <path class="crab-stalk" d="M51 50 L47 33" />
    <path class="crab-stalk" d="M69 50 L73 33" />
    <ellipse class="crab-shell" cx="60" cy="66" rx="34" ry="20" />
    <path class="crab-mouth" d="M54 70 Q60 75 66 70" />
    <g class="crab-eye"><circle cx="47" cy="27" r="8" /><circle class="crab-pupil" cx="45" cy="26" r="3.2" /></g>
    <g class="crab-eye"><circle cx="73" cy="27" r="8" /><circle class="crab-pupil" cx="71" cy="26" r="3.2" /></g>
  </svg>`;

/** Restart a one-shot CSS animation by toggling its class. */
function replay(el, className) {
  el.classList.remove(className);
  void el.offsetWidth;
  el.classList.add(className);
}

export function mountCrab(copy) {
  const lines = String(copy['crab.lines'] ?? '')
    .split('\n')
    .map((line) => line.trim())
    .filter(Boolean);
  if (lines.length === 0) return;

  const crab = document.createElement('div');
  crab.className = 'crab';
  crab.innerHTML = `
    <p class="crab-bubble" aria-live="polite"></p>
    <button class="crab-button" type="button" aria-expanded="false">${ART}</button>`;
  const bubble = crab.querySelector('.crab-bubble');
  const button = crab.querySelector('.crab-button');
  button.setAttribute('aria-label', copy['crab.label'] ?? '');
  document.body.append(crab);

  // Carries on where it left off, so coming back gets you something new.
  let next = 0;
  let goodbye = 0; // set while the last line is up and the wave is coming
  let waving = false;

  function speak() {
    if (waving) return;
    // The last line is up: a click just brings the goodbye forward.
    if (goodbye) return farewell();
    crab.classList.remove('is-resting');

    const line = lines[next];
    bubble.textContent = line;
    crab.classList.add('is-talking');
    button.setAttribute('aria-expanded', 'true');
    replay(bubble, 'is-new');
    replay(crab, 'is-snipping');

    if (next === lines.length - 1) {
      next = 0;
      goodbye = setTimeout(farewell, readTime(line));
    } else {
      next += 1;
    }
  }

  function farewell() {
    clearTimeout(goodbye);
    goodbye = 0;
    waving = true;
    crab.classList.remove('is-talking');
    crab.classList.add('is-waving');
    button.setAttribute('aria-expanded', 'false');
    setTimeout(() => {
      // Back down, even with the pointer still on it, until the pointer
      // leaves or it's clicked again.
      crab.classList.replace('is-waving', 'is-resting');
      waving = false;
    }, WAVE_MS);
  }

  function hide() {
    clearTimeout(goodbye);
    goodbye = 0;
    crab.classList.remove('is-talking');
    button.setAttribute('aria-expanded', 'false');
  }

  button.addEventListener('click', speak);
  bubble.addEventListener('click', speak);
  button.addEventListener('pointerleave', () => crab.classList.remove('is-resting'));
  // Keep focus on the crab when the bubble is clicked, so it doesn't count as leaving.
  bubble.addEventListener('mousedown', (event) => event.preventDefault());

  document.addEventListener('pointerdown', (event) => {
    if (!crab.contains(event.target)) hide();
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') hide();
  });
  crab.addEventListener('focusout', (event) => {
    if (!crab.contains(event.relatedTarget)) hide();
  });
}
