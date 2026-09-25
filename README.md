# Which model are you?

A ten-question personality quiz in the spirit of the ones in the back of teen
magazines, except the answer is a language model and the blurb is written in
that model's own voice. Some of the questions are about socks. They still count.

It plays like those magazines' flowcharts, except the page only draws the next
question once you've answered — each answer's line fades out until it's taken.

Plain HTML, CSS and ES modules. No build step, no dependencies, no backend.

```sh
python3 -m http.server 8000     # then open http://localhost:8000
node scripts/validate.mjs       # after editing anything in content/
```

## Status: early, and meant to be rewritten

The machinery is built and tested; the writing is a first pass. Expect to change
most of it.

- **5 models, roughly a third of the intended roster.** Fable, Haiku, Astra,
  DeepSeek and ELIZA are seeds — enough to exercise the scoring and set a tone,
  not the final cast.
- **The blurb voices are unreviewed.** They're the whole payoff, and they haven't
  had a pass from anyone but their author. Astra in particular is written from an
  archetype rather than first-hand knowledge.
- **30 questions.** Enough for real variety, short of the pool this wants.
- **Win rates are lumpy** — Astra takes ~33% of runs. With only five models that's
  expected, and it should flatten as the roster fills out. Watch the histogram
  from the validator as you add models rather than tuning around it now.

None of that blocks playing it. Keep the validator green and iterate on the
content.

A server is required — the app fetches its content files, and ES modules don't
load over `file://`.

## Everything you'd want to edit is in `content/`

| File | What's in it |
| --- | --- |
| `content/models.md` | The roster: one block per model, with its blurbs |
| `content/questions.md` | The question pool |
| `content/interface.md` | Every other word the app shows |

They're Markdown, so prose is just prose — no quotes to balance, no escaping,
apostrophes and quotation marks safe. The mechanics (axis weights, tags) sit on
one compact line per item, out of the way of the writing.

Nothing else contains user-facing text: `render.js` looks up every string by
name from `interface.md`, and the validator fails if one it needs is missing.

---

## Adding a model

This is the thing the whole design is bent around. It's one edit to one file.

1. Open `content/models.md` and copy an existing block.
2. Give it five axis values between -1 and +1. Be specific: a model whose vector
   hovers near zero has no personality and will rarely win anything. The
   validator warns you if you've done this.
3. Write its blurbs in its own voice.
4. Run `node scripts/validate.mjs`.

You do **not** touch `questions.md`. Questions measure traits; models claim
traits. Nothing in the question pool knows a model exists — the validator fails
if a question so much as mentions one by name.

```md
## fable — Fable
lab: Anthropic
accent: #6d5bd0, #f0b67f
axes: rigor -0.2, terse -0.85, speed -0.8, earnest 0.35, solitary -0.35
tags: bread, nocturnal, longform
tagline: Takes the long way on purpose

### when: terse
You were given a perfectly good straight road and you took the switchback,
because you wanted to see the valley from above.

### when: *
You are the long answer to a short question.
```

`### when:` selects a variant by the axis the player leaned on hardest, so the
same result reads differently on a retake. Always include a `when: *` fallback.
Blank lines separate paragraphs; `**bold**` and `*italic*` work.

Writing a question looks like this — the last two fields are optional:

```md
## whim-emoji [whimsy]
Choose an emoji. No context. No take-backs.

- bread | 🍞 | earnest 0.18, solitary -0.12, speed -0.12 | tags: bread
- ginger | 🫚 | earnest -0.22, rigor 0.12, solitary 0.16 | tags: ginger
```

## The five axes

`rigor↔vibes` · `terse↔verbose` · `speed↔depth` · `earnest↔irreverent` ·
`solitary↔collaborative`

Five is deliberate. Adding a sixth means giving every existing model a value for
it and splitting the same ten questions into thinner signal.

## How scoring works

```
score(model) = cosine(yourVector, zScored(model.axes))
             + 0.15 * tagAffinity(model)
             + model.gravity
```

Three parts of that are load-bearing:

**Why cosine, not distance.** Summed answers regress toward the middle. Under
Euclidean distance the blandest, most central model would win nearly every run.
Cosine only cares about *direction*, so even an indecisive player gets a result
with an opinion in it.

**Why z-score the models.** An axis where the whole roster agrees carries no
information and shrinks to nothing automatically; an axis with one outlier
amplifies. The useful consequence is that the space recalibrates itself when you
add a model, with nothing to hand-tune.

**What `gravity` is for.** A thumb on the scale, default 0, for when two models
crowd the same region or an easter egg needs to stay rare. Reach for it *after*
the validator tells you something is wrong, and in small steps — and read the
next section first, because it's usually not the right fix.

## Why the silly questions matter

Picking 🍞 over 🫚 carries real (small) axis weight, so whimsy genuinely moves
the result — just less than a core question does. There's a second, optional
channel: an answer can carry a concept tag (`bread`), and a model can claim it.
Matched tags are damped by how many the model claims, so a tag-hoarder can't
sweep the board, and the 0.15 coefficient keeps ten questions of real signal
always outranking one emoji.

A new model that claims no tags scores zero affinity and competes on axes alone.
Nothing breaks; nothing is required.

## Question selection

The pool is ~30; each run draws 10 into a fixed *shape*:

```
opener → core → core → core → whimsy → core → core → conditional → whimsy → closer
```

The shape is why a run feels composed rather than shuffled. Within each slot the
draw is greedy on whichever axis has been measured least so far, with seeded
randomness over the top few candidates — so runs differ without ever leaving a
trait unmeasured. One level of branching: an answer can unlock a follow-up that
fills the conditional slot.

## The validator is the point

`node scripts/validate.mjs` is what keeps "adding a model is easy" true a year
from now. It checks the schema and the no-model-names rule, then simulates
20,000 playthroughs and asserts:

- every model is **reachable** (wins often enough) and none **dominates**
- no two models are near-duplicates that would shadow each other
- every axis gets enough coverage in every possible draw
- flipping a whimsy answer changes the result *sometimes*, and flipping a core
  answer changes it *more often* — the invariant that says the quiz is playful
  but not arbitrary
- a seed replays to an identical run, so share links are honest
- every string the interface looks up exists, and uses only placeholders that
  actually get filled in

It prints a win-rate histogram, which is the tuning dashboard.

### Pool balance — read this before touching `gravity`

The validator also checks that each axis has roughly as much option weight on
one pole as the other. This catches the sneakiest content bug there is, and it
caught a real one during the first build: the pool had 26 options rewarding
rigour against 15 rewarding instinct, so only 1.5% of players ever landed on the
"vibes" side of that axis. Fable — which needs vibes *and* verbose *and* depth —
won 1.4% of runs and looked broken.

It wasn't. Fable won 84% of runs when played deliberately, so its vector was
fine; the pool simply never sent anyone to that corner of the space. Balancing
the options took it to ~10% with `gravity` untouched at 0.

The lesson, encoded in the check: **when a model is unreachable, suspect the
question pool before you suspect the model.** Gravity is a last resort, and if
you find yourself cranking it, the answer is usually a few more questions
weighted toward a neglected pole.

## Sharing

A whole run fits in a ~20-character hash: `#v=2&s=<seed>&a=<answers>&r=<model>`.
The seed replays the exact question draw. Bump the `version:` line near the top
of `content/questions.md` whenever you edit questions — old links then fall back
to showing the stored result rather than silently replaying against a changed
pool.

## Layout

```
index.html
styles/app.css
content/      models.md · questions.md · interface.md   ← everything you edit
src/data/     axes.js · content.js
src/core/     parse.js · rng.js · select.js · score.js · url.js
src/ui/       app.js · flow.js · render.js · sigil.js · wires.js
scripts/      validate.mjs
```

The browser fetches the content files; the validator reads the same ones off
disk and runs them through the same parsers in `src/core/parse.js`, so the two
can't drift. A malformed file fails with the filename, the line number, and what
was expected.

The result sigil is drawn procedurally from the axis vectors, so a new model
gets its own constellation without anyone drawing one.
