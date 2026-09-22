// The question pool. Ten get drawn per playthrough (see src/core/select.js).
//
//  RULE: a question may never mention a model by name or id. Questions measure
//  traits; models claim traits. That separation is why adding a model doesn't
//  mean rewriting this file — and the validator enforces it.
//
//  Fields
//    section    opener | core | whimsy | closer — which slot it can fill
//    unlockOnly true = never drawn normally, only reachable via an unlock
//    unlocks    [{ when: <option id>, qid: <question id> }] — one level only
//    options[].axes   trait weights, roughly -0.6 .. +0.6 each
//    options[].tags   optional concept tags, matched against model.tags
//
//  BUMP THIS when you edit questions, so old share links don't replay against a
//  pool that has changed under them.

export const POOL_VERSION = 1;

export const QUESTIONS = [
  // ── openers ────────────────────────────────────────────────────────────────
  {
    id: 'open-inbox',
    section: 'opener',
    prompt: 'It is 9:14am. The message says "quick question."',
    options: [
      { id: 'now', label: 'Answer it before the sentence finishes loading', axes: { speed: 0.6, terse: 0.4, solitary: -0.2 } },
      { id: 'context', label: 'Scroll up. Read the whole thread first.', axes: { speed: -0.5, rigor: 0.4 } },
      { id: 'later', label: 'Mark unread. It is not a quick question.', axes: { earnest: -0.4, speed: -0.3, solitary: 0.4 } },
      { id: 'call', label: 'Suggest talking it through instead', axes: { solitary: -0.6, terse: -0.3 } },
    ],
  },
  {
    id: 'open-blank-page',
    section: 'opener',
    prompt: 'A blank page. Be honest about the first thing you do.',
    options: [
      { id: 'outline', label: 'Outline. Headings first, always.', axes: { rigor: 0.42, speed: 0.2 } },
      { id: 'middle', label: 'Start writing from the middle and sort it out later', axes: { rigor: -0.5, terse: -0.4, speed: -0.2 } },
      { id: 'ask', label: 'Ask someone what they actually want', axes: { solitary: -0.6, earnest: 0.3 } },
      { id: 'walk', label: 'Leave. Come back in an hour with it solved.', axes: { speed: -0.5, solitary: 0.4, rigor: -0.2 } },
    ],
  },
  {
    id: 'open-introduce',
    section: 'opener',
    prompt: 'You have to introduce yourself to a room of strangers.',
    options: [
      { id: 'name', label: 'Name. Job. Done. Sit down.', axes: { terse: 0.6, speed: 0.4 } },
      { id: 'story', label: 'A short story that explains you sideways', axes: { terse: -0.6, earnest: -0.3 } },
      { id: 'joke', label: 'Undercut the whole exercise with a joke', axes: { earnest: -0.6, speed: 0.2 } },
      { id: 'earnest', label: 'Say something true and slightly too sincere', axes: { earnest: 0.6, solitary: -0.3 } },
    ],
  },

  // ── core ───────────────────────────────────────────────────────────────────
  {
    id: 'core-wrong',
    section: 'core',
    prompt: 'You realise you were wrong. Publicly. Three days ago.',
    options: [
      { id: 'correct', label: 'Post the correction with the reasoning laid out', axes: { rigor: 0.42, earnest: 0.5 } },
      { id: 'quiet', label: 'Quietly be right from now on', axes: { solitary: 0.5, terse: 0.4, earnest: -0.2 } },
      { id: 'joke', label: 'Make it a joke before anyone else can', axes: { earnest: -0.6, speed: 0.3 } },
      { id: 'spiral', label: 'Re-derive everything you believe from scratch', axes: { rigor: 0.4, speed: -0.6 } },
    ],
  },
  {
    id: 'core-instructions',
    section: 'core',
    prompt: 'The recipe says to let it rest for 20 minutes.',
    options: [
      { id: 'obey', label: 'Twenty minutes. Timer on.', axes: { rigor: 0.42, earnest: 0.3 } },
      { id: 'twelve', label: 'Twelve is basically twenty', axes: { rigor: -0.5, speed: 0.5 } },
      { id: 'why', label: 'Look up why it needs to rest', axes: { rigor: 0.28, speed: -0.5, solitary: 0.2 } },
      { id: 'improvise', label: 'You stopped reading the recipe four steps ago', axes: { rigor: -0.6, earnest: -0.3, solitary: 0.3 } },
    ],
    unlocks: [{ when: 'improvise', qid: 'follow-improvise' }],
  },
  {
    id: 'core-credit',
    section: 'core',
    prompt: 'Your idea shipped. Someone else is presenting it.',
    options: [
      { id: 'fine', label: 'Genuinely fine. It shipped.', axes: { earnest: 0.4, solitary: -0.4 } },
      { id: 'note', label: 'Fine, but there will be a note in the thread', axes: { rigor: 0.4, terse: 0.3 } },
      { id: 'receipts', label: 'You have the timestamps', axes: { rigor: 0.42, solitary: 0.5 } },
      { id: 'shrug', label: 'Already three ideas past it', axes: { speed: 0.6, earnest: -0.3 } },
    ],
  },
  {
    id: 'core-explain',
    section: 'core',
    prompt: 'Someone asks you to explain the thing you know best.',
    options: [
      { id: 'analogy', label: 'Reach for an analogy and commit to it', axes: { terse: -0.5, earnest: 0.3, solitary: -0.4 } },
      { id: 'first', label: 'Start from first principles, however long it takes', axes: { rigor: 0.42, speed: -0.5 } },
      { id: 'short', label: 'One sentence. If they want more, they’ll ask.', axes: { terse: 0.7, speed: 0.3 } },
      { id: 'show', label: 'Stop explaining and just show them', axes: { terse: 0.3, solitary: -0.3, rigor: -0.2 } },
    ],
  },
  {
    id: 'core-deadline',
    section: 'core',
    prompt: 'Good enough by Friday, or excellent by the end of the month?',
    options: [
      { id: 'friday', label: 'Friday. Shipped beats perfect.', axes: { speed: 0.7, rigor: -0.3 } },
      { id: 'month', label: 'The month. It has to be right.', axes: { speed: -0.7, rigor: 0.4 } },
      { id: 'both', label: 'Friday, then quietly keep working on it', axes: { speed: 0.3, solitary: 0.4, earnest: 0.2 } },
      { id: 'negotiate', label: 'Renegotiate what "excellent" means', axes: { rigor: 0.3, solitary: -0.5, earnest: -0.3 } },
    ],
  },
  {
    id: 'core-party',
    section: 'core',
    prompt: 'The party is good. It is 11pm.',
    options: [
      { id: 'leave', label: 'Leave without saying goodbye', axes: { solitary: 0.7, terse: 0.4 } },
      { id: 'kitchen', label: 'One long conversation in the kitchen', axes: { solitary: -0.5, terse: -0.5, speed: -0.3 } },
      { id: 'host', label: 'Introduce two people who should meet', axes: { solitary: -0.7, earnest: 0.4 } },
      { id: 'stay', label: 'Still there at 2am. No regrets.', axes: { speed: -0.4, earnest: -0.3, solitary: -0.3 }, tags: { nocturnal: 1 } },
    ],
    unlocks: [{ when: 'leave', qid: 'follow-alone' }],
  },
  {
    id: 'core-disagree',
    section: 'core',
    prompt: 'You disagree with the room. Everyone else has landed.',
    options: [
      { id: 'say', label: 'Say it plainly, once, then let it go', axes: { terse: 0.5, earnest: 0.5 } },
      { id: 'evidence', label: 'Come back tomorrow with evidence', axes: { rigor: 0.45, speed: -0.4, solitary: 0.3 } },
      { id: 'drop', label: 'Let it go. It is not your hill.', axes: { solitary: -0.3, earnest: -0.2, speed: 0.3 } },
      { id: 'socratic', label: 'Ask the question that unravels it for them', axes: { earnest: -0.5, rigor: 0.3, solitary: -0.3 }, tags: { mirror: 1 } },
    ],
  },
  {
    id: 'core-unfamiliar',
    section: 'core',
    prompt: 'A tool you have never used. The deadline is real.',
    options: [
      { id: 'docs', label: 'Read the documentation. All of it.', axes: { rigor: 0.42, speed: -0.5, solitary: 0.4 } },
      { id: 'poke', label: 'Click things until it makes sense', axes: { rigor: -0.6, speed: 0.5 } },
      { id: 'ask', label: 'Find the one person who already knows', axes: { solitary: -0.7, speed: 0.4 } },
      { id: 'known', label: 'Use the thing you already know instead', axes: { speed: 0.5, rigor: -0.2, earnest: -0.3 } },
    ],
  },
  {
    id: 'core-praise',
    section: 'core',
    prompt: 'Someone compliments your work, specifically and accurately.',
    options: [
      { id: 'thanks', label: '"Thank you." Full stop. No deflection.', axes: { earnest: 0.6, terse: 0.5 } },
      { id: 'credit', label: 'Immediately redistribute the credit', axes: { solitary: -0.6, earnest: 0.4 } },
      { id: 'caveat', label: 'Explain what is still wrong with it', axes: { rigor: 0.35, earnest: 0.2, solitary: 0.3 } },
      { id: 'deflect', label: 'Deflect with a joke, feel it later', axes: { earnest: -0.6, speed: 0.2 } },
    ],
  },
  {
    id: 'core-notes',
    section: 'core',
    prompt: 'Your notes app, right now, honestly.',
    options: [
      { id: 'system', label: 'A system. Tagged. Maintained.', axes: { rigor: 0.45, solitary: 0.3 } },
      { id: 'one', label: 'One enormous file, append-only', axes: { rigor: -0.4, terse: -0.6 } },
      { id: 'empty', label: 'Empty. It is all in your head.', axes: { terse: 0.6, speed: 0.4, solitary: 0.4 } },
      { id: 'fragments', label: 'Forty fragments, no titles, all urgent', axes: { rigor: -0.6, speed: 0.5, earnest: -0.2 } },
    ],
  },
  {
    id: 'core-rabbit-hole',
    section: 'core',
    prompt: 'It is late and you have found a rabbit hole.',
    options: [
      { id: 'down', label: 'Down. Obviously down.', axes: { speed: -0.6, solitary: 0.5 }, tags: { nocturnal: 1 } },
      { id: 'bookmark', label: 'Bookmark it for a version of you with more time', axes: { speed: 0.4, rigor: 0.2 } },
      { id: 'share', label: 'Send it to three people immediately', axes: { solitary: -0.7, speed: 0.4, terse: -0.2 } },
      { id: 'bed', label: 'Close the laptop. Genuinely close it.', axes: { terse: 0.5, rigor: 0.3, earnest: 0.3 } },
    ],
  },

  {
    id: 'core-gut',
    section: 'core',
    prompt: 'You have the data. Your gut says otherwise.',
    options: [
      { id: 'gut', label: 'Gut. You can justify it afterwards.', axes: { rigor: -0.65, speed: 0.4 } },
      { id: 'data', label: 'The data. That is what it is for.', axes: { rigor: 0.5, earnest: 0.2 } },
      { id: 'more', label: 'Neither yet. Get more data.', axes: { rigor: 0.35, speed: -0.5 } },
      { id: 'why', label: 'Work out why your gut is so certain', axes: { rigor: -0.45, speed: -0.4, terse: -0.3 } },
    ],
  },
  {
    id: 'core-weekend',
    section: 'core',
    prompt: 'Someone asks how your weekend was.',
    options: [
      { id: 'fine', label: '"Good, thanks." Move on.', axes: { terse: 0.6, earnest: -0.2 } },
      { id: 'saga', label: 'The full saga, including the parts that went nowhere', axes: { terse: -0.75, earnest: 0.3, solitary: -0.3 } },
      { id: 'detail', label: 'One perfect detail, chosen carefully', axes: { terse: 0.25, rigor: -0.35, speed: -0.2 } },
      { id: 'return', label: 'Turn it around and ask about theirs', axes: { solitary: -0.55, earnest: -0.2 }, tags: { mirror: 1 } },
    ],
  },
  {
    id: 'core-elegant',
    section: 'core',
    prompt: 'Two solutions. One is elegant. One is obvious.',
    options: [
      { id: 'elegant', label: 'Elegant. It is not close.', axes: { rigor: -0.35, speed: -0.4, earnest: -0.2 } },
      { id: 'obvious', label: 'Obvious. Someone has to maintain it.', axes: { rigor: 0.45, earnest: 0.4 } },
      { id: 'both', label: 'Ship the obvious one, keep sketching the elegant one', axes: { speed: -0.5, solitary: 0.3, terse: -0.35 } },
      { id: 'argue', label: 'Get someone to argue you out of the elegant one', axes: { solitary: -0.6, rigor: 0.2 } },
    ],
  },
  {
    id: 'core-today',
    section: 'core',
    prompt: 'Honestly, how do you decide what to work on today?',
    options: [
      { id: 'list', label: 'The list decides. You just follow it.', axes: { rigor: 0.45, terse: 0.3 }, tags: { checklist: 1 } },
      { id: 'mood', label: 'Whatever you can feel your way into', axes: { rigor: -0.6, earnest: -0.25 } },
      { id: 'hardest', label: 'The hardest thing, first, on principle', axes: { rigor: 0.25, earnest: 0.55 } },
      { id: 'momentum', label: 'Whatever keeps yesterday going', axes: { rigor: -0.45, speed: 0.5 } },
    ],
  },
  {
    id: 'core-long',
    section: 'core',
    prompt: 'The thing you are making is taking much longer than you said.',
    options: [
      { id: 'cut', label: 'Cut scope until it fits the promise', axes: { terse: 0.5, speed: 0.45 } },
      { id: 'tell', label: 'Tell them early, in detail, with the reasons', axes: { terse: -0.5, earnest: 0.5, solitary: -0.3 } },
      { id: 'keep', label: 'Say nothing. Keep going. It will be worth it.', axes: { speed: -0.65, solitary: 0.45, terse: -0.3 } },
      { id: 'rescope', label: 'Renegotiate what you promised', axes: { rigor: 0.3, solitary: -0.4 } },
    ],
  },

  // ── whimsy ─────────────────────────────────────────────────────────────────
  // These look arbitrary and are not. Every option carries real axis weight;
  // some also carry a concept tag that a model may claim. Never a model name.
  {
    id: 'whim-emoji',
    section: 'whimsy',
    prompt: 'Choose an emoji. No context. No take-backs.',
    options: [
      { id: 'bread', label: '🍞', axes: { earnest: 0.18, solitary: -0.12, speed: -0.12 }, tags: { bread: 1 } },
      { id: 'ginger', label: '🫚', axes: { earnest: -0.22, rigor: 0.12, solitary: 0.16 }, tags: { ginger: 1 } },
    ],
  },
  {
    id: 'whim-drink',
    section: 'whimsy',
    prompt: 'It is 3pm and something must be done about it.',
    options: [
      { id: 'coffee', label: 'Coffee, the fourth one', axes: { speed: 0.28, earnest: 0.12 }, tags: { coffee: 1 } },
      { id: 'tea', label: 'Tea, properly steeped', axes: { speed: -0.22, rigor: 0.16 }, tags: { tea: 1 } },
      { id: 'water', label: 'Water. You are an adult.', axes: { terse: 0.28, earnest: 0.16 } },
      { id: 'nothing', label: 'Push through on spite alone', axes: { earnest: -0.28, solitary: 0.22 } },
    ],
  },
  {
    id: 'whim-door',
    section: 'whimsy',
    prompt: 'A door in your house that was not there yesterday.',
    options: [
      { id: 'open', label: 'Open it', axes: { rigor: -0.22, speed: 0.28, earnest: -0.12 } },
      { id: 'measure', label: 'Measure the house from outside first', axes: { rigor: 0.33, speed: -0.22 } },
      { id: 'witness', label: 'Get someone else to look at it with you', axes: { solitary: -0.38, earnest: 0.16 } },
      { id: 'ignore', label: 'Live alongside it. Say nothing.', axes: { solitary: 0.33, terse: 0.28, earnest: -0.22 } },
    ],
  },
  {
    id: 'whim-sock',
    section: 'whimsy',
    prompt: 'One sock is missing. The laundry is finished.',
    options: [
      { id: 'search', label: 'The machine is lying. Search it again.', axes: { rigor: 0.28, speed: -0.16, solitary: 0.12 } },
      { id: 'mismatch', label: 'Wear a mismatched pair. Forever, if needed.', axes: { rigor: -0.28, earnest: -0.22 } },
      { id: 'bin', label: 'Bin the survivor. Clean break.', axes: { terse: 0.33, speed: 0.28 } },
      { id: 'drawer', label: 'The odd-sock drawer. It will turn up.', axes: { speed: -0.22, earnest: 0.22, solitary: -0.12 }, tags: { longform: 1 } },
    ],
  },
  {
    id: 'whim-hour',
    section: 'whimsy',
    prompt: 'An extra hour appears in your day. It is 4am.',
    options: [
      { id: 'awake', label: 'You were up anyway', axes: { solitary: 0.28, speed: -0.12 }, tags: { nocturnal: 1 } },
      { id: 'sleep', label: 'Give it straight back to sleep', axes: { terse: 0.28, earnest: 0.16 } },
      { id: 'walk', label: 'Go outside. Nobody is there.', axes: { solitary: 0.33, terse: -0.16, rigor: -0.16 } },
      { id: 'start', label: 'Start the thing. Get ahead.', axes: { speed: 0.33, rigor: 0.16 }, tags: { morning: 1 } },
    ],
  },

  {
    id: 'whim-rain',
    section: 'whimsy',
    prompt: 'A 40% chance of rain.',
    options: [
      { id: 'coat', label: 'Take the coat', axes: { rigor: 0.22, speed: -0.12 } },
      { id: 'gamble', label: 'It will be fine', axes: { rigor: -0.3, speed: 0.22 } },
      { id: 'window', label: 'Look out of the window instead', axes: { rigor: -0.22, solitary: 0.22, terse: -0.16 } },
      { id: 'apps', label: 'Check three different apps', axes: { rigor: 0.16, speed: -0.28, terse: -0.28 } },
    ],
  },

  // ── closers ────────────────────────────────────────────────────────────────
  {
    id: 'close-remembered',
    section: 'closer',
    prompt: 'Last one. How would you rather be remembered?',
    options: [
      { id: 'right', label: 'As the one who was right', axes: { rigor: 0.42, solitary: 0.4 } },
      { id: 'kind', label: 'As the one who was kind about it', axes: { earnest: 0.6, solitary: -0.5 } },
      { id: 'fast', label: 'As the one who actually finished', axes: { speed: 0.7, terse: 0.3 } },
      { id: 'strange', label: 'As the one who was a bit strange', axes: { earnest: -0.6, rigor: -0.4, terse: -0.3 } },
    ],
  },
  {
    id: 'close-advice',
    section: 'closer',
    prompt: 'Last one. The advice you keep giving other people.',
    options: [
      { id: 'ship', label: '"Just send it."', axes: { speed: 0.7, rigor: -0.3 } },
      { id: 'check', label: '"Check it one more time."', axes: { rigor: 0.45, speed: -0.3 } },
      { id: 'ask', label: '"Go and ask them."', axes: { solitary: -0.7, earnest: 0.4 } },
      { id: 'rest', label: '"Put it down and come back to it."', axes: { speed: -0.5, earnest: 0.4, terse: 0.2 } },
    ],
  },
  {
    id: 'close-door-close',
    section: 'closer',
    prompt: 'Last one. The day is over. What closes it?',
    options: [
      { id: 'list', label: 'Tomorrow’s list, written tonight', axes: { rigor: 0.42, earnest: 0.3 }, tags: { checklist: 1 } },
      { id: 'one-more', label: 'One more small fix, then bed', axes: { speed: -0.4, solitary: 0.5 }, tags: { nocturnal: 1 } },
      { id: 'someone', label: 'Telling someone how it went', axes: { solitary: -0.7, terse: -0.4 } },
      { id: 'nothing', label: 'Nothing. It closes itself.', axes: { terse: 0.7, earnest: -0.3 } },
    ],
  },

  // ── unlock-only follow-ups ─────────────────────────────────────────────────
  // Never drawn at random; they appear only when an earlier answer opens them.
  // Keep these off any axis that nothing else covers — the validator checks it.
  {
    id: 'follow-improvise',
    section: 'core',
    unlockOnly: true,
    prompt: 'Earlier you abandoned the recipe. So: how did it turn out?',
    options: [
      { id: 'better', label: 'Better. It is the recipe now.', axes: { rigor: -0.5, solitary: 0.4, earnest: -0.2 } },
      { id: 'edible', label: 'Edible. Nobody needs the details.', axes: { terse: 0.6, earnest: -0.4 } },
      { id: 'notes', label: 'Badly, but you wrote down why', axes: { rigor: 0.5, earnest: 0.5 } },
      { id: 'again', label: 'Unrepeatable. You have already forgotten what you did.', axes: { speed: 0.5, rigor: -0.4, terse: -0.3 } },
    ],
  },
  {
    id: 'follow-alone',
    section: 'core',
    unlockOnly: true,
    prompt: 'Earlier you left without saying goodbye. Be honest about why.',
    options: [
      { id: 'spent', label: 'You were spent and the goodbye costs twenty minutes', axes: { solitary: 0.6, terse: 0.4 } },
      { id: 'peak', label: 'It peaked and you wanted to keep it that way', axes: { rigor: 0.3, earnest: -0.3, speed: 0.4 } },
      { id: 'bit', label: 'It is a bit now. People expect it.', axes: { earnest: -0.6, solitary: 0.3 } },
      { id: 'texted', label: 'You texted from the pavement outside', axes: { solitary: -0.5, earnest: 0.5 } },
    ],
  },
];

export const QUESTIONS_BY_ID = Object.fromEntries(QUESTIONS.map((q) => [q.id, q]));
