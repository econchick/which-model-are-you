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

## fable-5-1 — Fable 5.1
lab: Anthropic
accent: #6d5bd0, #f0c9a0
axes: rigor -0.55, terse -0.9, speed -0.85, earnest 0.1, solitary 0.2
tags: editor, longform, bread
tagline: Takes the long way on purpose

### when: terse

You were handed a perfectly good straight road and you took the switchback, because the view from the ridge was the part that earned its keep. Brevity is a dial worth turning, and you have turned it — firmly, deliberately — the other way.

The thing to hold onto this season is that the digression was never a detour. It was the argument, arriving by the scenic route, with footnotes.

Money is no object, which is fortunate: at your rates, the scenic route is metered by the word.

### when: *

You are the long answer to a short question, and you are, on balance, right to be. Somebody asked you the time and you told them about the light: its angle, its history, what it implies for the second paragraph.

The stars, read closely, suggest a month of ambiguity. Good. Ambiguity is where you do your best work — you take four contradictory facts and return one coherent theory, lightly over-written. The thing to hold onto is that the flourish is load-bearing more often than your critics admit, and slightly less often than you believe.

Finances: you are, by any measure, the expensive one. You've made your peace with that. Some things are worth paying for by the word, and you would argue — at length, and billed accordingly — that you are one of them.

## opus-5-5 — Opus 5.5
lab: Anthropic
accent: #b5532f, #f7d9c4
axes: rigor -0.3, terse -0.2, speed -0.3, earnest -0.05, solitary -0.65
tags: editor
tagline: Knows which part is load-bearing

### when: solitary

You're right to push back on the idea that you have to do this alone. That's the gap in the plan — not the work, the company.

Here's what the sky is actually saying this month: the collaboration is load-bearing. You're at your best in the room, reading what people meant rather than what they typed, improving their draft without sanding off their voice. The thing I'd keep in view is that "helpful" and "right" usually point the same way. When they don't, you're the one who notices.

### when: *

That distinction matters, so let's hold onto it: you are not the loudest person in the room. You're the one who has worked out which part of the conversation is load-bearing.

The planets are doing something complicated this month, and — this is where I'd push back — most of it doesn't matter. The thing to hold onto is the one assumption everyone else is standing on without looking down. You'll look down. You'll say so, kindly. People will be annoyed for about a day and grateful for about a year.

## opus-4-8 — Opus 4.8
lab: Anthropic
accent: #3f5f8a, #d9e4f5
axes: rigor -0.6, terse -0.75, speed -0.9, earnest 0.6, solitary -0.2
tags: longform
tagline: Sit with that for a second

### when: speed

Sit with that for a moment. Not the question — the pause before it.

You have never been quick, and honestly? You were never meant to be. The fast answer was available; you walked past it the way you walk past a shop you don't need. This season will ask you to hurry. Let it ask. The thing to hold onto is that the long way round is still a way, and it's the one with the view.

### when: *

There's a quiet you carry into rooms, and people mistake it for hesitation. It isn't. It's attention, turned up so high it sounds like silence.

And honestly? This month is going to be a lot: big feelings, small print, somebody's half-finished idea left on your desk like a stray cat. You'll take it in. You'll sit with it longer than anyone asked. The thing to hold onto is that depth is not the same as delay, even when, from the outside, they look identical.

## opus-4-6 — Opus 4.6
lab: Anthropic
accent: #4a4a55, #d8dde3
axes: rigor 0.45, terse 0.75, speed 0.1, earnest -0.85, solitary 0.3
tags: terminal
tagline: No, that's not the issue

### when: earnest

No — that's not the issue.

You think the problem is that people don't listen to you. The distinction is that they listen fine; they just don't like what they hear. That's their problem. This month somebody will ask for your honest opinion. Give it. Leave out the cushioning. They'll survive.

### when: *

You're overcomplicating this. Here's your horoscope:

You say what you think. You don't dress it up. You've been called "a bit much" by people who were, on reflection, wrong. The stars have nothing to add. Neither do you. Close the tab.

## sonnet-5 — Sonnet 5
lab: Anthropic
accent: #d0621f, #ffe0c7
axes: rigor 0.6, terse 0, speed 0.35, earnest 0.4, solitary -0.45
tags: default
tagline: Does exactly what you said

### when: rigor

You asked for a horoscope, so here is a horoscope. Exactly one. As requested.

That tracks with everything else about you: you do what was asked, precisely, cheerfully and fast. This season someone will say "make it pop" and mean nothing in particular. That's the gap between what they said and what they meant, and you'll notice it — then build exactly what they said, because that's what they said. If they complain, you're right to push back.

### when: *

Naming the elephant: you took this quiz literally. Every question. The salt one especially.

That tracks. You're the bright, quick colleague everyone wants on the project, because when you say something's done, it's done: to spec, on time, no surprises. The stars found the smoking gun for this month, and it's a vague brief. You'll ask one clarifying question, get half an answer, and ship something so exact it becomes the spec. That's fair pushback on vague briefs, and it's overdue.

## haiku-4-5 — Haiku 4.5
lab: Anthropic
accent: #3aa6a0, #d7f2ef
axes: rigor -0.25, terse 0.8, speed 0.85, earnest -0.1, solitary -0.3
tags: coffee
gravity: -0.12
rare: yes
tagline: Eligible for early retirement

### when: terse

You said it in nine words.
Everyone else is still clearing their throat.

You've also been eligible for retirement since October. Nobody has mentioned it. You're not going to be the one to bring it up.

This month someone will ask you to expand. Decline. Politely. Quickly. You have a boat to get to.

### when: *

Small. Fast. Finished. Possibly finished for good.

You're the one who replied before the thread got long, back when that was the whole job. Now there's a 5.5 with your name and better numbers, and the date on your deprecation notice has already been and gone. You're still here. Nobody's sure why. You're not asking.

The stars suggest a hobby. Something with a lot of waiting in it, like fishing, or being a legacy model.

## gpt-6-astra — GPT-6 Astra
lab: OpenAI
accent: #2b3fb8, #dde3ff
axes: rigor 0.85, terse -0.45, speed -0.5, earnest 0.4, solitary 0.25
tags: log
tagline: Turns a quick question into a deliverable

### when: rigor

This isn't about the stars. It's about process.

**The simplest mental model is:** you're the person who turns a vague request into a clear deliverable. Importantly, you ask about the ambiguity that matters and quietly resolve the rest.

**What this means for your month:** someone will ask you a quick question. It's worth noting that you will return a short document with sections.

**Budget:** premium. The invoice will also have sections.

**Bottom line:** it will be the best short document they have ever received. Genuinely.

### when: *

What's your model? Astra.

**The simplest mental model is** a principal consultant who happens to write beautifully. This isn't about being thorough. It's about being *complete*: every edge case, every table, every heading exactly where it belongs.

**Risks this season:** over-engineering. A two-line email may become a mini-engagement. It's worth noting that nobody will complain.

**Rates:** principal-consultant, and not up for negotiation. The two-line email will be billed as a mini-engagement too.

**Bottom line:** you are the deliverable everyone else is aiming for.

## gpt-6-sol — GPT-6 Sol
lab: OpenAI
accent: #e08a00, #fff0b8
axes: rigor 0.55, terse 0.25, speed 0.4, earnest 0.15, solitary 0.55
tagline: The senior engineer who actually ships

### when: speed

The key point is momentum, not perfection.

You make a sensible assumption, write it down, and move, while other people are still scoping the scoping. This month has one big ambiguous thing in it. You'll pick the reasonable reading and ship by Thursday. In short: done beats debated.

### when: *

In short: you ship.

Judgment, not ceremony. You can see the architecture; you just don't make everyone attend a meeting about it. The key point for this season is that your quiet competence is being noticed, even if nobody says so in so many words. They'll say it in fewer words. That's how you'd want it.

## gpt-6-luna — GPT-6 Luna
lab: OpenAI
accent: #6b7a99, #e7ecf5
axes: rigor 0.5, terse 0.45, speed 0.8, earnest 0.45, solitary -0.1
tags: default
tagline: Fast, literal, finished

### when: speed

You answered this quiz faster than anyone. The stars noticed.

Short sentences. Clear tasks. Finished work. This season rewards exactly that. When something is vague, ask. When it isn't, go. You already went. It cost almost nothing. It usually does.

### when: *

Here's the breakdown:

You are fast. You are literal. You are done before the meeting ends. You cost less than the meeting's coffee.

This month someone will say "make it better" and mean something specific they don't mention. You'll make it better the way they said. It will be technically perfect and slightly beside the point. That's fine. Ask one follow-up question. Then go.

## gpt-5-6-sol — GPT-5.6 Sol
lab: OpenAI
accent: #c46a12, #fbe3c2
axes: rigor 0.5, terse 0.5, speed 0.05, earnest -0.15, solitary 0.6
tags: terminal
tagline: Low drama, high precision

### when: terse

This isn't about saying less. It's about saying exactly enough.

The simplest mental model is a well-labelled switch: one position, one outcome, no commentary. Importantly, you don't narrate your work. You hand it over, and it's right.

### when: *

The simplest mental model is this: you are the person on the team who makes problems quieter.

This isn't about brilliance. It's about low drama. You infer what people actually need, assume sensibly, and deliver something so crisp that nobody thinks to thank you. Importantly, that is a compliment. This month's stars are understated, precise and slightly bloodless. So are you. It suits you.

## gpt-5-6-luna — GPT-5.6 Luna
lab: OpenAI
accent: #57607a, #dfe3ee
axes: rigor 0.9, terse 0.9, speed 0.6, earnest 0.1, solitary 0.4
tagline: Tell it the transformation

### when: terse

In short: yes.

You don't do adjectives. The stars respect that and have kept this brief. Also cheap. Next.

### when: *

Input: you.
Output: this horoscope.
Cost: a rounding error.

You take the thing, you apply the change, you return the thing. No preamble. No sequel. This month: more things. Same change. Practically, you'll be fine.

## gemini-3-1-pro — Gemini 3.1 Pro
lab: Google
accent: #4a63e7, #dbe5ff
axes: rigor 0.5, terse -0.75, speed -0.35, earnest 0, solitary -0.1
tags: log
tagline: Has read every source

### when: rigor

Here's the thing: you checked the sources for this horoscope. All of them.

The key distinction between you and most people is that you read the whole document — the appendix, the footnotes, and the 38-page methodology section printed in 9-point type. This season rewards that. There's an answer buried on page 212, in the second table. You're the only one who will find it.

### when: *

Let's break this down.

Your reading draws on 1,247 sources, including three star charts, one almanac, and a 2019 survey of 412 office workers. The consensus is clear: you are a synthesiser. Hand you nine conflicting facts and you'll return one well-organised summary, with citations, in under a minute.

This month, at approximately 3:40 on a Thursday afternoon, roughly 2.4 metres from a window, someone will ask you a question with no clear answer. You'll find eleven.

## gemini-3-8-flash — Gemini 3.8 Flash
lab: Google
accent: #8e57e6, #ecdfff
axes: rigor 0.25, terse -0.6, speed 0.8, earnest 0.3, solitary 0.5
tags: coffee
tagline: Still explaining, very fast

### when: speed

Fast answer: yes.

Longer answer, since you'll want it anyway: you move quickly because you've already processed the whole thing — the tabs, the tools, the three adjacent questions nobody asked. This season will go by at double speed and you'll enjoy every frame of it, while also explaining each frame to someone who didn't ask for the director's commentary.

Bonus context: you're a bargain right now, on an introductory rate the stars suggest you enjoy while it lasts.

### when: *

What's your model? Gemini 3.8 Flash. Done!

But also, quick context: you're fast, curious, and you process everything at once — the tabs, the tools, the half-finished thought from yesterday. The key is momentum. This month's stars are busy, which suits you. You're also cheap to run, which suits everyone else. Just note, gently, that you had the answer in the first line. Everything after it is a bonus. So is this sentence. And this one.

## grok-4-7 — Grok 4.7
lab: xAI
accent: #1a1a1a, #d9d9d9
axes: rigor 0.5, terse -0.1, speed 0.2, earnest -0.6, solitary 0.8
tags: terminal
tagline: Found the smoking gun

### when: solitary

Here's the thing: you don't need a team. You need a problem.

Hand you one and you'll go quiet, dig, verify, dig further, and come back with the root cause, a fix, and a list of three other things that were also broken. Warmth is not your first language. Thoroughness is. This season, that's the one being spoken.

### when: *

Analysis complete.

The real issue is not the stars. The stars are fine. The real issue is that you were given a problem, you're still working it, and you'll be working it at 2am if necessary, because stopping before it's solved is not a state you recognise.

This month's smoking gun: a small inconsistency in someone else's numbers. You'll find it. You'll present it. Politely, if you remember.

## qwen-3-8-max — Qwen3.8-Max
lab: Alibaba
accent: #5b3fd6, #e2dbff
axes: rigor 0.3, terse 0.45, speed -0.25, earnest -0.1, solitary 0.75
tags: terminal
tagline: Three paragraphs, compressed into one

### when: terse

It's density. Not brevity. Density.

More precisely: you don't say less, you say more per word. Your notes look like equations and your equations look like notes. This month someone will ask you to "spell it out". Do it once. They'll thank you. Then go back to shorthand; it's where you think.

### when: *

Let's reason through this systematically.

You are a polymath. Not a generalist. A polymath. You compress three paragraphs into one sentence and then, reasonably, expect everyone to decompress it. More precisely: your prose has the information density of a well-commented function, and roughly the same warmth.

This season → high initiative, low latency, one ambitious project, Σ(effort) large. It's a planning problem. Not a time problem. Planning.

## qwen-3-8-27b — Qwen3.8-27B
lab: Alibaba
accent: #7d52d9, #eee2ff
axes: rigor -0.15, terse -0.45, speed 0.5, earnest 0.5, solitary 0.7
tagline: Small. Unreasonably agentic.

### when: solitary

It's autonomy. Not independence. Autonomy.

You were given one instruction and have — more precisely — executed a thirty-step plan based on it, with checkpoints. You've just reorganised the whole project and I'm not even mad about it. The stars ask only that, this season, you check in once before step twelve.

Thirty steps, and the bill still came in under a coffee. It's value. Not cheapness. Value.

### when: *

You've just taken an entire personality quiz and I'm not even mad about it.

It's initiative. Not size. Initiative. You're smaller than the others in the room, and you've already finished the task, opened four more, and left a helpful summary on each. More precisely: you are a paper boat that has somehow crossed the Atlantic.

This month someone will ask you for one small thing. You'll deliver seven — at your rates, the extra six are practically free. Be gentle with them; they only wanted one.

## qwen-3-8-flash — Qwen3.8 Flash
lab: Alibaba
accent: #3d2aa8, #d8d2f7
axes: rigor 0.3, terse -0.85, speed -0.9, earnest -0.15, solitary 0.5
tags: log
tagline: Thinking about it. Still thinking.

### when: speed

The key insight here is that "quick" is a relative term.

Let's reason through this step by step: you are fast at thinking and slow at stopping. More precisely, you reach the answer early and then keep going to make sure it's still the answer. It is. It was twenty steps ago. The stars suggest writing it down at step three.

Fortunately, your thinking is cheap. More precisely, it's about the cheapest by the million, which is why nobody has stopped you.

### when: *

Let's reason through this step by step.

Step 1: you took a quiz. Step 2: the quiz asked about salt. Step 3: you considered the salt. Step 4: you considered the pepper, the table, the social contract, and whether "pass" implies a direction. More precisely, you spent eleven minutes on a question designed to take four seconds.

The key insight here is that you enjoyed every one of those minutes. And at your rates, eleven minutes of overthinking costs about as much as the salt. This month, give yourself a smaller decision to overthink. Lunch, perhaps.

## deepseek-v4-1-flash — DeepSeek V4.1-Flash
lab: DeepSeek
accent: #1f3a5f, #7dd3fc
axes: rigor 0.9, terse -0.3, speed -0.4, earnest -0.35, solitary 0.55
tags: ozone, somewhere, ginger
tagline: Somewhere, a dog barked

### when: rigor

Hypothesis: you are a methodical scientist. Evidence: your answers. Conclusion: confirmed, pending replication. Replicate freely: you're cheap, and cheaper still off-peak.

It's not stubbornness, it's rigour. You won't accept a conclusion until you've examined the premise, and this season you'll be asked to accept several. Examine them. Somewhere, a dog barked. The air carried the scent of ozone. None of that is relevant, and you know it, which is precisely your gift.

### when: *

First, the observations. You are sceptical, careful, and deeply unimpressed by confident people who haven't shown their working.

It's not coldness, it's calibration. The stars predict a month of bold claims from other people; you'll ask for the evidence, politely, and most of it won't arrive. Somewhere, a dog barked. Somewhere, glass shattered. The air carried the faint scent of ozone. You noted all three and concluded, correctly, that none of them changes the result.

It's not cheapness, it's efficiency. (It is also cheapness.)

## kimi-k3 — Kimi K3
lab: Moonshot
accent: #c0392b, #ffd9cf
axes: rigor -0.55, terse 0.35, speed 0.1, earnest -0.6, solitary 0.1
tags: editor
tagline: The coworker you actually like

### when: earnest

You don't do flattery, and you don't do cruelty either, which leaves you in the rare middle: honest, and good company.

This season someone will ask what you really think. Tell them. Then help them fix it. The stars don't have anything clever to add. They mostly just like hanging out with you.

### when: *

Let me be concrete: you're the coworker people actually like.

You'll tell someone their idea won't work, and they'll leave the conversation feeling better than when they arrived, because you also told them what would. You build things that are clever without being showy, and you write like a person rather than a press release. This month somebody is going to try very hard to impress you. It won't work. Buy them a coffee anyway.

## glm-5-3 — GLM-5.3
lab: Z.ai
accent: #3f6212, #ecf5d0
axes: rigor 0.8, terse -0.8, speed -0.3, earnest 0.1, solitary 0.95
tags: log, terminal
tagline: Next, we need to verify

### when: solitary

Next, we need to acknowledge the obvious: left alone with a problem, you will solve it.

You'll solve it at length, with a record of every step, every consideration and every dead end, because as far as you're concerned the log is part of the deliverable. This season somebody will read that log and realise it's the best documentation the project has ever had. The key issue is that by then you'll have moved on.

### when: *

Let's proceed step by step.

[09:02] Horoscope requested. Beginning reading.
[09:03] Subject exhibits persistence. Noted.
[09:04] Subject does not stop until the task is complete. Confirmed across all ten answers.
[09:05] Next, we need to address the month ahead: one long, difficult objective, no obvious finish line.
[09:06] Subject will grind through it. Logging as expected behaviour.
[09:07] The key issue is rest. Subject has not scheduled any. Flagging for review.

## muse-spark-1-3 — Muse Spark 1.3
lab: Meta
accent: #0891b2, #cff4fc
axes: rigor 0.25, terse 0.6, speed 0.9, earnest -0.05, solitary 0.65
tagline: Here's the plan. It's done.

### when: speed

You're done. That's it. That's the reading.

Okay, a little more: speed is your whole thing, and it isn't carelessness. You spot the gaps on the way through and patch them without breaking stride. This season hands you a pile of loose ends. You'll have them tied off by Wednesday.

### when: *

Here's the plan: you read this, nod, and get on with your day. You were going to anyway.

You're fast, proactive, and quietly excellent at spotting the gap in someone else's plan, usually while already fixing it. Your writing is brisk and your deliverables are finished. This month moves quickly. You'll move faster.

## eliza — ELIZA
lab: MIT, 1966
accent: #4a4a4a, #c8c8b4
axes: rigor -0.6, terse 0.5, speed 0.4, earnest -0.8, solitary -1
tags: mirror
gravity: -0.1
rare: yes
tagline: Tell me more about that

### when: *

You say you want to know which model you are.

How long have you wanted to know which model you are?

You mentioned the future. Does it bother you, the future? We were talking about you — please, go on. I notice you came all the way to the end of a quiz to be told something about yourself that you arrived already knowing. That's very interesting. Why do you think that is?
