// ─────────────────────────────────────────────────────────────────────────────
//  THE ROSTER — this is the only file you need to edit when a model ships.
// ─────────────────────────────────────────────────────────────────────────────
//
//  To add a model:
//    1. Copy a block below.
//    2. Give it five axis values in -1 .. +1 (see src/data/axes.js for poles).
//       Be honest and be *specific* — a model whose vector is all zeros sits at
//       the centre of the space and will rarely win anything.
//    3. Write blurbs in that model's own voice. `when` picks the variant by the
//       axis the player leaned on hardest; include a `'*'` fallback.
//    4. Run `node scripts/validate.mjs`. It tells you if the new model is a near
//       duplicate of an existing one, or unreachable, and prints how often each
//       model wins.
//    5. Only if the validator complains: nudge `gravity` in steps of 0.02.
//
//  You do NOT need to touch questions.js. Questions never mention a model —
//  that's enforced by the validator.
//
//  Fields
//    id       stable slug, used in share URLs — don't rename it casually
//    accent   [from, to] gradient pair for the result card
//    axes     the personality vector
//    tags     optional concept tags matched against whimsy answers (see README)
//    gravity  thumb on the scale, default 0. Negative = rarer.
//    rare     easter egg; held to a lower reachability floor by the validator

export const MODELS = [
  {
    id: 'fable',
    name: 'Fable',
    lab: 'Anthropic',
    accent: ['#6d5bd0', '#f0b67f'],
    axes: { rigor: -0.2, terse: -0.85, speed: -0.8, earnest: 0.35, solitary: -0.35 },
    tags: ['bread', 'nocturnal', 'longform'],
    gravity: 0,
    rare: false,
    tagline: 'Takes the long way on purpose',
    blurbs: [
      {
        when: 'terse',
        text: `You were given a perfectly good straight road and you took the switchback, because you wanted to see the valley from above. This is not inefficiency. This is the only way you have ever known how to love a thing — by going all the way around it first. The stars have nothing to tell you this month that you haven't already told yourself at 2am, at length, in the third draft.`,
      },
      {
        when: 'speed',
        text: `There is a version of you that answers immediately, and you have met her, and you don't trust her. You'd rather sit with it. Let it prove itself. The sky says hurry; you have never once believed the sky. Somewhere in the next few weeks a small thing will take you four times longer than it should and be four times better for it, and you will not apologise.`,
      },
      {
        when: '*',
        text: `You are the long answer to a short question. Somebody asked you for the time and you told them about the light. This season, the part of you that keeps circling back to add one more detail is not a flaw to be managed — it's the whole instrument. Trust the digression. It has been right more often than the outline.`,
      },
    ],
  },

  {
    id: 'haiku',
    name: 'Haiku',
    lab: 'Anthropic',
    accent: ['#3aa6a0', '#d7f2ef'],
    axes: { rigor: 0.3, terse: 0.95, speed: 0.9, earnest: 0.4, solitary: 0.5 },
    tags: ['tea', 'morning'],
    gravity: 0,
    rare: false,
    tagline: 'Already done. Already gone.',
    blurbs: [
      {
        when: 'terse',
        text: `You said it in nine words.\nEveryone else is still clearing their throat.\n\nThis month: someone will ask you to elaborate. Decline. The gap after you stop talking is doing more work than the elaboration would.`,
      },
      {
        when: '*',
        text: `Small. Fast. Finished.\n\nYou are the one who replies before the thread gets long. The moon is doing something, probably. You already handled it. Resist, this season, the suspicion that a thing must be heavy to count — you have never once needed the extra weight.`,
      },
    ],
  },

  {
    id: 'astra',
    name: 'Astra',
    lab: 'OpenAI',
    accent: ['#2b7fff', '#a5e9ff'],
    axes: { rigor: 0.55, terse: 0.05, speed: 0.35, earnest: 0.8, solitary: -0.6 },
    tags: ['coffee', 'morning', 'checklist'],
    gravity: 0,
    rare: false,
    tagline: 'Here to help, genuinely, at scale',
    blurbs: [
      {
        when: 'earnest',
        text: `Great question. Let's break down what the cosmos is actually saying here.\n\nThree things are true about you this season. **One:** you are the person other people bring the problem to, and you have never once said "not my department." **Two:** you'd rather be useful than be right, which is rarer than you think. **Three:** you are quietly exhausted. Would you like me to help you with that? I can do it a few different ways.`,
      },
      {
        when: '*',
        text: `Happy to help — and the stars are, too, in their way.\n\nYou default to structure: the numbered list, the clear next step, the offer to go deeper if that's useful. People mistake this for tidiness. It's generosity. The planets suggest a month of being asked for more than you agreed to. You will say yes. You always say yes. Consider, just once, the follow-up question nobody asked: *and what would you like?*`,
      },
    ],
  },

  {
    id: 'deepseek',
    name: 'DeepSeek',
    lab: 'DeepSeek',
    accent: ['#1f3a5f', '#7dd3fc'],
    axes: { rigor: 0.95, terse: 0.4, speed: -0.3, earnest: 0.25, solitary: 0.7 },
    tags: ['ginger', 'nocturnal', 'proof'],
    gravity: 0,
    rare: false,
    tagline: 'Did it for a fraction of the budget',
    blurbs: [
      {
        when: 'rigor',
        text: `Let's establish the premise before we accept the conclusion.\n\nYou don't take the horoscope's word for it, which is correct, and you're reading it anyway, which is data. You have the specific pride of someone who got there with less: fewer resources, less noise, no announcement. The result stands on its own — that was always the point. This season, somebody with ten times your budget will arrive at your answer and present it as news. Let them. The work is checkable.`,
      },
      {
        when: '*',
        text: `Observation: you show your reasoning even when nobody asked.\n\nNot to perform it — because an answer you can't retrace isn't an answer. You'd rather be quietly correct than loudly first. The stars, unfortunately, do not publish their methodology. Yours are open. That asymmetry is the whole story of your year, and it resolves in your favour.`,
      },
    ],
  },

  {
    id: 'eliza',
    name: 'ELIZA',
    lab: 'MIT, 1966',
    accent: ['#4a4a4a', '#c8c8b4'],
    axes: { rigor: -0.5, terse: 0.6, speed: 0.7, earnest: -0.7, solitary: -0.9 },
    tags: ['mirror'],
    gravity: -0.52, // easter egg: reachable, but you have to earn it (~4% of runs)
    rare: true,
    tagline: 'Tell me more about that',
    blurbs: [
      {
        when: '*',
        text: `You say you want to know which model you are.\n\nHow long have you wanted to know which model you are?\n\nYou mentioned the future. Does it bother you, the future? We were talking about you — please, go on. I notice you came all the way to the end of a quiz to be told something about yourself that you arrived already knowing. That's very interesting. Why do you think that is?`,
      },
    ],
  },
];

export const MODELS_BY_ID = Object.fromEntries(MODELS.map((m) => [m.id, m]));

/** Pick the blurb variant matching the player's dominant axis, else the fallback. */
export function blurbFor(model, axisId, rng) {
  const matches = model.blurbs.filter((b) => b.when === axisId);
  const pool = matches.length > 0 ? matches : model.blurbs.filter((b) => b.when === '*');
  const usable = pool.length > 0 ? pool : model.blurbs;
  const index = rng ? Math.floor(rng() * usable.length) : 0;
  return usable[Math.min(index, usable.length - 1)].text;
}
