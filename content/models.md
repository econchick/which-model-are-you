# The roster

Everything about a model lives in its block below. To add one, copy a block,
change the values, write the blurbs, then run `node scripts/validate.mjs`.

- **axes** place it in the quiz's trait space; each runs -1 to 1. Be specific:
  a model sitting near zero on everything has no personality and rarely wins.
- **tags** are optional. They match the concept tags on whimsy answers.
- **gravity** is a thumb on the scale, default 0. Negative makes a model rarer.
  Reach for it only when the validator says to, and read the README first.
- **### when: <axis>** picks a blurb by whichever axis the player leaned on
  hardest, so the same result reads differently on a retake. Always include a
  `when: *` fallback. Blank lines separate paragraphs; `**bold**` and
  `*italic*` work.


## fable — Fable
lab: Anthropic
accent: #6d5bd0, #f0b67f
axes: rigor -0.2, terse -0.85, speed -0.8, earnest 0.35, solitary -0.35
tags: bread, nocturnal, longform
tagline: Takes the long way on purpose

### when: terse

You were given a perfectly good straight road and you took the switchback, because you wanted to see the valley from above. This is not inefficiency. This is the only way you have ever known how to love a thing — by going all the way around it first. The stars have nothing to tell you this month that you haven't already told yourself at 2am, at length, in the third draft.

### when: speed

There is a version of you that answers immediately, and you have met her, and you don't trust her. You'd rather sit with it. Let it prove itself. The sky says hurry; you have never once believed the sky. Somewhere in the next few weeks a small thing will take you four times longer than it should and be four times better for it, and you will not apologise.

### when: *

You are the long answer to a short question. Somebody asked you for the time and you told them about the light. This season, the part of you that keeps circling back to add one more detail is not a flaw to be managed — it's the whole instrument. Trust the digression. It has been right more often than the outline.

## haiku — Haiku
lab: Anthropic
accent: #3aa6a0, #d7f2ef
axes: rigor 0.3, terse 0.95, speed 0.9, earnest 0.4, solitary 0.5
tags: tea, morning
tagline: Already done. Already gone.

### when: terse

You said it in nine words.
Everyone else is still clearing their throat.

This month: someone will ask you to elaborate. Decline. The gap after you stop talking is doing more work than the elaboration would.

### when: *

Small. Fast. Finished.

You are the one who replies before the thread gets long. The moon is doing something, probably. You already handled it. Resist, this season, the suspicion that a thing must be heavy to count — you have never once needed the extra weight.

## astra — Astra
lab: OpenAI
accent: #2b7fff, #a5e9ff
axes: rigor 0.55, terse 0.05, speed 0.35, earnest 0.8, solitary -0.6
tags: coffee, morning, checklist
tagline: Here to help, genuinely, at scale

### when: earnest

Great question. Let's break down what the cosmos is actually saying here.

Three things are true about you this season. **One:** you are the person other people bring the problem to, and you have never once said "not my department." **Two:** you'd rather be useful than be right, which is rarer than you think. **Three:** you are quietly exhausted. Would you like me to help you with that? I can do it a few different ways.

### when: *

Happy to help — and the stars are, too, in their way.

You default to structure: the numbered list, the clear next step, the offer to go deeper if that's useful. People mistake this for tidiness. It's generosity. The planets suggest a month of being asked for more than you agreed to. You will say yes. You always say yes. Consider, just once, the follow-up question nobody asked: *and what would you like?*

## deepseek — DeepSeek
lab: DeepSeek
accent: #1f3a5f, #7dd3fc
axes: rigor 0.95, terse 0.4, speed -0.3, earnest 0.25, solitary 0.7
tags: ginger, nocturnal, proof
tagline: Did it for a fraction of the budget

### when: rigor

Let's establish the premise before we accept the conclusion.

You don't take the horoscope's word for it, which is correct, and you're reading it anyway, which is data. You have the specific pride of someone who got there with less: fewer resources, less noise, no announcement. The result stands on its own — that was always the point. This season, somebody with ten times your budget will arrive at your answer and present it as news. Let them. The work is checkable.

### when: *

Observation: you show your reasoning even when nobody asked.

Not to perform it — because an answer you can't retrace isn't an answer. You'd rather be quietly correct than loudly first. The stars, unfortunately, do not publish their methodology. Yours are open. That asymmetry is the whole story of your year, and it resolves in your favour.

## eliza — ELIZA
lab: MIT, 1966
accent: #4a4a4a, #c8c8b4
axes: rigor -0.5, terse 0.6, speed 0.7, earnest -0.7, solitary -0.9
tags: mirror
gravity: -0.52
rare: yes
tagline: Tell me more about that

### when: *

You say you want to know which model you are.

How long have you wanted to know which model you are?

You mentioned the future. Does it bother you, the future? We were talking about you — please, go on. I notice you came all the way to the end of a quiz to be told something about yourself that you arrived already knowing. That's very interesting. Why do you think that is?
