# The question pool

The quiz is a flowchart: each answer leads to a different next question, drawn
from this pool, so a playthrough is one ten-question path through it. Format:

```
## question-id [section]
The prompt, as prose.

- option-id | What the player reads | rigor 0.4, speed -0.2 | tags: bread
```

Sections are `opener`, `core`, `whimsy` and `closer`. Add `, unlock-only` to a
section to keep a question out of the normal draw so it only appears as a
follow-up. Weights and tags are optional; use `-` for no weights.

A question may open a follow-up with `unlocks: option-id -> question-id`: that
answer then leads straight to the follow-up, whenever the next step is a core
question. That's also how to write a branch by hand — every other answer's next
question is drawn.

Each kind of question needs enough in the pool for every answer to lead
somewhere different; the validator says so if a section runs short.

**Never mention a model by name in this file.** Questions measure traits and
models claim them; the validator fails if that slips.

Bump `version` whenever you edit questions (or change how they're drawn, in
`src/core/select.js`), so old share links don't replay against a pool that
changed under them.

version: 5

<!-- Openers — question 1. Easy to answer, sets the tone. -->

## open-inbox [opener]
It is 9:14am. The message says "quick question."

- now | Answer it before the sentence finishes loading | terse 0.4, speed 0.6, solitary -0.2
- context | Scroll up. Read the whole thread first. | rigor 0.4, speed -0.5
- later | Mark unread. It is not a quick question. | speed -0.3, earnest -0.4, solitary 0.4
- call | Suggest talking it through instead | terse -0.3, solitary -0.6

## open-hi [opener]
A stranger messages you "hi". Just "hi".

- hi | "hi" | terse 0.7, speed 0.3, earnest -0.2
- hello | "Hello! How can I help you today?" | terse -0.3, earnest 0.6, solitary -0.3
- wait | Wait. The rest of the message is coming. | rigor 0.3, speed -0.5, solitary 0.3
- mirror | "hi" back, but with more feeling | rigor -0.5, earnest -0.3, solitary -0.3

## open-quick-look [opener]
Someone asks you to "just take a quick look."

- quick | Take a quick look. As asked. | rigor 0.5, terse 0.4, speed 0.3
- everything | Take a quick look at everything it touches, too | terse -0.4, speed -0.5, solitary 0.3
- fixed | Already fixed it, and two other things | speed 0.4, earnest -0.2, solitary 0.6
- worried | Ask what they're actually worried about | rigor -0.5, earnest 0.3, solitary -0.3

## open-overthink [opener]
The instructions say: "Don't overthink this."

- done | Done. Four seconds. | terse 0.5, speed 0.7
- define | First: what counts as overthinking? | rigor 0.4, terse -0.3, speed -0.6
- letter | Follow them to the letter, which takes some thought | rigor 0.5, earnest 0.4
- anyway | Overthink it anyway, quietly, in the margins | rigor -0.3, speed -0.3, earnest -0.4, solitary 0.3

<!-- Core — the bulk of the run. These carry the most weight. -->

## core-hole [core]
Your boss's plan has a hole in it. A big one.

- no | "No — that's not the issue." Then the actual issue. | rigor 0.3, terse 0.5, speed 0.2, earnest -0.6
- gentle | "Love this. One small gap I'd flag…" | rigor -0.2, terse -0.2, earnest 0.6, solitary -0.3
- patch | Quietly patch the hole. Tell no one. | speed 0.3, earnest -0.2, solitary 0.6
- memo | A six-page memo titled "Considerations" | rigor 0.4, terse -0.7, speed -0.3

## core-absolutely [core]
Someone says "you're absolutely right." You were about 60% right.

- take | Take the win. Everyone deserves one. | rigor -0.2, speed 0.4, earnest 0.5
- correct | "Partly. Here's the 40% that isn't." | rigor 0.5, terse 0.2, earnest -0.4
- suspicious | Get suspicious. What do they want? | earnest -0.5, solitary 0.4
- return | "No, YOU'RE absolutely right." | rigor -0.3, earnest 0.4, solitary -0.4

## core-week [core]
Sum up your week in one sentence.

- seven | Seven words. Full stop. | terse 0.8, speed 0.3, solitary 0.2
- semicolons | One sentence, technically, with eleven semicolons | rigor -0.3, terse -0.7, earnest -0.2
- bottom | "Bottom line:" and three bullet points | rigor 0.5, terse 0.2, earnest 0.3
- cannot | A week can't be one sentence, and here's why | terse -0.3, speed -0.5, earnest -0.3

## core-salt [core]
Someone at dinner asks, "Can you pass the salt?"

- yes | "Yes." You do not pass the salt. | rigor 0.6, terse 0.4, speed 0.2, earnest -0.4
- pass | Pass the salt | rigor -0.2, speed 0.5, earnest 0.3
- pepper | The salt and the pepper. They'll want the pepper. | rigor -0.5, earnest 0.3, solitary -0.3
- taste | Pass it, then gently ask whether the dish needs it | rigor -0.2, speed -0.3, earnest -0.3, solitary -0.3

## core-alone [core]
You've been left alone with a task for eight hours. Nobody is checking.

- lunch | Done by lunch. Then three adjacent tasks nobody asked for. | speed 0.5, solitary 0.7
- log | Done, with a timestamped log of every decision | rigor 0.5, terse -0.5, solitary 0.4
- checkin | Check in every forty minutes anyway | earnest 0.4, solitary -0.5
- wander | Find something more interesting by hour two | rigor -0.6, earnest -0.4

## core-room [core]
Everyone in the meeting agrees. You don't.

- say | Say so plainly, once | terse 0.5, speed 0.3, earnest -0.3
- spreadsheet | Come back tomorrow with a spreadsheet | rigor 0.5, speed -0.5, solitary 0.3
- question | Ask the one question that un-agrees them | rigor -0.3, earnest -0.4, solitary -0.3
- fold | Agree. It's probably fine. | speed 0.4, earnest 0.5, solitary -0.2

## core-ten [core]
Explain what you do to a ten-year-old.

- sandwich | One perfect analogy, involving a sandwich | rigor -0.5, terse 0.2, earnest 0.3
- first | From first principles. They're ten; they have time. | rigor 0.4, terse -0.5, speed -0.5
- short | "I help computers think." Done. | terse 0.7, speed 0.4
- show | Let them have a go while you watch | rigor -0.2, speed -0.2, solitary -0.4

## core-edit [core]
A friend asks you to "lightly edit" their essay.

- typos | Fix the typos. It's their essay. | rigor 0.4, terse 0.3, speed 0.3, earnest 0.3
- rewrite | Rewrite it. It's much better. It's also yours now. | rigor -0.3, earnest -0.3, solitary 0.5
- margins | Forty margin comments, some of them essays | rigor 0.2, terse -0.6, speed -0.4
- voice | Tighten it so it sounds more like them, not less | rigor -0.4, earnest 0.3, solitary -0.3

## core-broken [core]
Something is broken, and you have a theory.

- test | Test the theory before telling anyone | rigor 0.5, speed -0.3, solitary 0.3
- gun | "Found the smoking gun." You haven't tested it. | rigor -0.4, speed 0.6, earnest -0.2
- rebuild | Rebuild the whole thing. The theory can't hurt you there. | terse -0.2, speed -0.3, solitary 0.6
- call | Get someone on a call and think out loud | terse -0.3, solitary -0.5

## core-weekend [core]
Someone asks how your weekend was.

- fine | "Good, thanks." Move on. | terse 0.6, earnest -0.2
- saga | The full saga, including the parts that went nowhere | terse -0.75, earnest 0.3, solitary -0.3
- detail | One perfect detail, chosen carefully | rigor -0.35, terse 0.25, speed -0.2
- return | Turn it around and ask about theirs | earnest -0.2, solitary -0.55 | tags: mirror

## core-yes-no [core]
Someone asks you a yes-or-no question.

- yes | Yes or no. As requested. | rigor 0.3, terse 0.8, speed 0.3, solitary 0.2
- because | Yes — and here's the context that makes it a yes | terse -0.4, earnest 0.4
- depends | "It depends," followed by a table | rigor 0.3, terse -0.6, speed -0.3
- better | Answer the better question they should have asked | rigor -0.4, earnest -0.4, solitary 0.2

## core-upset [core]
A friend is upset, and you don't know why.

- ask | Ask. Listen. Ask again. | speed -0.3, earnest 0.4, solitary -0.6
- read | Work it out from what they're not saying | rigor -0.6, speed -0.2
- fix | Offer three practical solutions | rigor 0.4, speed 0.4, solitary 0.2
- sit | Sit with it. Quietly. For a while. | terse 0.4, speed -0.5, earnest 0.3

## core-plan [core]
You're asked for a plan. Just a plan.

- plan | A plan. Numbered. Nothing else. | rigor 0.5, terse 0.4
- started | A plan, and you've already started on it | speed 0.5, earnest -0.2, solitary 0.6
- three | Three plans and a table comparing them | rigor 0.3, terse -0.6, speed -0.4
- questions | Seven clarifying questions first | speed -0.4, earnest 0.3, solitary -0.4

## core-load-bearing [core]
Someone calls your idea "load-bearing."

- proud | Honestly? Proud. | rigor -0.2, speed 0.2, earnest 0.5
- inspect | Inspect it for cracks immediately | rigor 0.5, speed -0.3
- remove | Wonder what would happen if you pulled it out | rigor -0.3, speed -0.2, earnest -0.4, solitary 0.2
- adopt | Start calling everything "load-bearing" | terse -0.2, earnest -0.3, solitary -0.4

## core-rabbit-hole [core]
It is late and you have found a rabbit hole.

- down | Down. Obviously down. | speed -0.6, solitary 0.5 | tags: nocturnal
- bookmark | Bookmark it for a version of you with more time | rigor 0.2, speed 0.4
- share | Send it to three people immediately | terse -0.2, speed 0.4, solitary -0.7
- bed | Close the laptop. Genuinely close it. | rigor 0.3, terse 0.5, earnest 0.3

## core-long [core]
The thing you are making is taking much longer than you said.

- cut | Cut scope until it fits the promise | terse 0.5, speed 0.45
- tell | Tell them early, in detail, with the reasons | terse -0.5, earnest 0.5, solitary -0.3
- keep | Say nothing. Keep going. It will be worth it. | terse -0.3, speed -0.65, solitary 0.45
- rescope | Renegotiate what you promised | rigor 0.3, solitary -0.4

## core-instructions [core]
The recipe says to let it rest for 20 minutes.

- obey | Twenty minutes. Timer on. | rigor 0.42, earnest 0.3
- twelve | Twelve is basically twenty | rigor -0.5, speed 0.5
- why | Look up why it needs to rest | rigor 0.28, speed -0.5, solitary 0.2
- improvise | You stopped reading the recipe four steps ago | rigor -0.6, earnest -0.3, solitary 0.3
unlocks: improvise -> follow-improvise

## core-party [core]
The party is good. It is 11pm.

- leave | Leave without saying goodbye | terse 0.4, solitary 0.7
- kitchen | One long conversation in the kitchen | terse -0.5, speed -0.3, solitary -0.5
- host | Introduce two people who should meet | earnest 0.4, solitary -0.7
- stay | Still there at 2am. No regrets. | speed -0.4, earnest -0.3, solitary -0.3 | tags: nocturnal
unlocks: leave -> follow-alone

<!-- Whimsy — questions 5 and 9. They look arbitrary and are not: each
option carries real (smaller) axis weight, and may carry a concept tag that a
model can claim. Never name a model here. -->

## whim-emoji [whimsy]
Choose an emoji. No context. No take-backs.

- bread | 🍞 | speed -0.12, earnest 0.18, solitary -0.12 | tags: bread
- ginger | 🫚 | rigor 0.12, earnest -0.22, solitary 0.16 | tags: ginger

## whim-sock [whimsy]
One sock is missing. The laundry is finished.

- search | The machine is lying. Search it again. | rigor 0.28, speed -0.16, solitary 0.12
- mismatch | Wear a mismatched pair. Forever, if needed. | rigor -0.28, earnest -0.22
- bin | Bin the survivor. Clean break. | terse 0.33, speed 0.28
- drawer | The odd-sock drawer. It will turn up. | speed -0.22, earnest 0.22, solitary -0.12 | tags: longform

## whim-door [whimsy]
A door in your house that was not there yesterday.

- open | Open it | rigor -0.22, speed 0.28, earnest -0.12
- measure | Measure the house from outside first | rigor 0.33, speed -0.22
- witness | Get someone else to look at it with you | earnest 0.16, solitary -0.38
- ignore | Live alongside it. Say nothing. | terse 0.28, earnest -0.22, solitary 0.33

## whim-dog [whimsy]
Somewhere, a dog barks.

- window | Look out of the window | speed 0.28, earnest 0.16
- type | Keep typing | terse 0.28, earnest -0.16, solitary 0.22
- story | Write it into the story. It's that kind of story now. | rigor -0.33, terse -0.22 | tags: somewhere
- bark | Bark back | earnest -0.33, solitary -0.28

## whim-air [whimsy]
What does the air smell like right now?

- ozone | Ozone. It always smells like ozone. | rigor -0.22, speed 0.16 | tags: ozone
- coffee | Someone else's coffee | speed 0.22, solitary -0.22 | tags: coffee
- nothing | Nothing. You checked. | rigor 0.33, terse 0.22
- rain | Rain that hasn't happened yet | rigor -0.16, terse -0.22, speed -0.22

## whim-pigeon [whimsy]
A pigeon has been looking at you for a while now.

- back | Look back. As equals. | earnest -0.28, solitary 0.22
- crumb | Offer it a crumb, as a gesture | earnest 0.28, solitary -0.28 | tags: bread
- leave | Leave. Something is happening and you're not part of it. | terse 0.16, speed 0.33
- notes | Take notes | rigor 0.28, speed -0.22 | tags: log

## whim-font [whimsy]
Pick a font. Don't think about it.

- serif | Something with serifs and opinions | rigor -0.22, terse -0.22 | tags: editor
- mono | Monospace, always | rigor 0.28, solitary 0.22 | tags: terminal
- hated | The one everyone hates. Unironically. | rigor -0.16, earnest 0.28
- default | Whatever it was already set to | speed 0.28, earnest 0.16 | tags: default

<!-- Closers — question 10. -->

## close-remembered [closer]
Last one. How would you rather be remembered?

- right | As the one who was right | rigor 0.42, solitary 0.4
- kind | As the one who was kind about it | earnest 0.6, solitary -0.5
- fast | As the one who actually finished | terse 0.3, speed 0.7
- strange | As the one who was a bit strange | rigor -0.4, terse -0.3, earnest -0.6

## close-advice [closer]
Last one. The advice you keep giving other people.

- ship | "Just send it." | rigor -0.3, speed 0.7
- check | "Check it one more time." | rigor 0.45, speed -0.3
- ask | "Go and ask them." | earnest 0.4, solitary -0.7
- rest | "Put it down and come back to it." | terse 0.2, speed -0.5, earnest 0.4

## close-door-close [closer]
Last one. The day is over. What closes it?

- list | Tomorrow’s list, written tonight | rigor 0.42, earnest 0.3 | tags: checklist
- one-more | One more small fix, then bed | speed -0.4, solitary 0.5 | tags: nocturnal
- someone | Telling someone how it went | terse -0.4, solitary -0.7
- nothing | Nothing. It closes itself. | terse 0.7, earnest -0.3

## close-sign-off [closer]
Last one. How do you end a message?

- stop | You don't. You just stop. | terse 0.7, speed 0.3, earnest -0.3
- offer | "Would you like me to go deeper on any of this?" | terse -0.3, earnest 0.5, solitary -0.4
- bottom | "Bottom line:" and the whole message again, shorter | rigor 0.45, terse -0.2, earnest 0.2
- hold | "The thing to hold onto is…" | rigor -0.45, terse -0.3, speed -0.3

## close-note [closer]
Last one. You find a note you wrote to yourself a year ago.

- plan | A plan. You followed it. | rigor 0.4, earnest 0.3
- drawing | A drawing. No idea why. | rigor -0.5, earnest -0.4, solitary 0.3
- essay | Three pages. You read every one. | terse -0.6, speed -0.4
- blank | It is blank. That tracks. | terse 0.3, earnest -0.4, solitary 0.4

<!-- Follow-ups. Never drawn at random; only reached by the answer that
     unlocks them.
     Keep these off any axis nothing else covers. -->

## follow-improvise [core, unlock-only]
Earlier you abandoned the recipe. So: how did it turn out?

- better | Better. It is the recipe now. | rigor -0.5, earnest -0.2, solitary 0.4
- edible | Edible. Nobody needs the details. | terse 0.6, earnest -0.4
- notes | Badly, but you wrote down why | rigor 0.5, earnest 0.5
- again | Unrepeatable. You have already forgotten what you did. | rigor -0.4, terse -0.3, speed 0.5

## follow-alone [core, unlock-only]
Earlier you left without saying goodbye. Be honest about why.

- spent | You were spent and the goodbye costs twenty minutes | terse 0.4, solitary 0.6
- peak | It peaked and you wanted to keep it that way | rigor 0.3, speed 0.4, earnest -0.3
- bit | It is a bit now. People expect it. | earnest -0.6, solitary 0.3
- texted | You texted from the pavement outside | earnest 0.5, solitary -0.5
