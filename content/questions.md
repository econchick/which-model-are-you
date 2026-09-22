# The question pool

Ten questions are drawn per playthrough. Format:

```
## question-id [section]
The prompt, as prose.

- option-id | What the player reads | rigor 0.4, speed -0.2 | tags: bread
```

Sections are `opener`, `core`, `whimsy` and `closer`. Add `, unlock-only` to a
section to keep a question out of the normal draw so it only appears as a
follow-up. Weights and tags are optional; use `-` for no weights.

A question may open a follow-up with `unlocks: option-id -> question-id`.

**Never mention a model by name in this file.** Questions measure traits and
models claim them; the validator fails if that slips.

Bump `version` whenever you edit questions, so old share links don't replay
against a pool that changed under them.

version: 2

<!-- Openers — question 1. Easy to answer, sets the tone. -->

## open-inbox [opener]
It is 9:14am. The message says "quick question."

- now | Answer it before the sentence finishes loading | terse 0.4, speed 0.6, solitary -0.2
- context | Scroll up. Read the whole thread first. | rigor 0.4, speed -0.5
- later | Mark unread. It is not a quick question. | speed -0.3, earnest -0.4, solitary 0.4
- call | Suggest talking it through instead | terse -0.3, solitary -0.6

## open-blank-page [opener]
A blank page. Be honest about the first thing you do.

- outline | Outline. Headings first, always. | rigor 0.42, speed 0.2
- middle | Start writing from the middle and sort it out later | rigor -0.5, terse -0.4, speed -0.2
- ask | Ask someone what they actually want | earnest 0.3, solitary -0.6
- walk | Leave. Come back in an hour with it solved. | rigor -0.2, speed -0.5, solitary 0.4

## open-introduce [opener]
You have to introduce yourself to a room of strangers.

- name | Name. Job. Done. Sit down. | terse 0.6, speed 0.4
- story | A short story that explains you sideways | terse -0.6, earnest -0.3
- joke | Undercut the whole exercise with a joke | speed 0.2, earnest -0.6
- earnest | Say something true and slightly too sincere | earnest 0.6, solitary -0.3

<!-- Core — the bulk of the run. These carry the most weight. -->

## core-wrong [core]
You realise you were wrong. Publicly. Three days ago.

- correct | Post the correction with the reasoning laid out | rigor 0.42, earnest 0.5
- quiet | Quietly be right from now on | terse 0.4, earnest -0.2, solitary 0.5
- joke | Make it a joke before anyone else can | speed 0.3, earnest -0.6
- spiral | Re-derive everything you believe from scratch | rigor 0.4, speed -0.6

## core-instructions [core]
The recipe says to let it rest for 20 minutes.

- obey | Twenty minutes. Timer on. | rigor 0.42, earnest 0.3
- twelve | Twelve is basically twenty | rigor -0.5, speed 0.5
- why | Look up why it needs to rest | rigor 0.28, speed -0.5, solitary 0.2
- improvise | You stopped reading the recipe four steps ago | rigor -0.6, earnest -0.3, solitary 0.3
unlocks: improvise -> follow-improvise

## core-credit [core]
Your idea shipped. Someone else is presenting it.

- fine | Genuinely fine. It shipped. | earnest 0.4, solitary -0.4
- note | Fine, but there will be a note in the thread | rigor 0.4, terse 0.3
- receipts | You have the timestamps | rigor 0.42, solitary 0.5
- shrug | Already three ideas past it | speed 0.6, earnest -0.3

## core-explain [core]
Someone asks you to explain the thing you know best.

- analogy | Reach for an analogy and commit to it | terse -0.5, earnest 0.3, solitary -0.4
- first | Start from first principles, however long it takes | rigor 0.42, speed -0.5
- short | One sentence. If they want more, they’ll ask. | terse 0.7, speed 0.3
- show | Stop explaining and just show them | rigor -0.2, terse 0.3, solitary -0.3

## core-deadline [core]
Good enough by Friday, or excellent by the end of the month?

- friday | Friday. Shipped beats perfect. | rigor -0.3, speed 0.7
- month | The month. It has to be right. | rigor 0.4, speed -0.7
- both | Friday, then quietly keep working on it | speed 0.3, earnest 0.2, solitary 0.4
- negotiate | Renegotiate what "excellent" means | rigor 0.3, earnest -0.3, solitary -0.5

## core-party [core]
The party is good. It is 11pm.

- leave | Leave without saying goodbye | terse 0.4, solitary 0.7
- kitchen | One long conversation in the kitchen | terse -0.5, speed -0.3, solitary -0.5
- host | Introduce two people who should meet | earnest 0.4, solitary -0.7
- stay | Still there at 2am. No regrets. | speed -0.4, earnest -0.3, solitary -0.3 | tags: nocturnal
unlocks: leave -> follow-alone

## core-disagree [core]
You disagree with the room. Everyone else has landed.

- say | Say it plainly, once, then let it go | terse 0.5, earnest 0.5
- evidence | Come back tomorrow with evidence | rigor 0.45, speed -0.4, solitary 0.3
- drop | Let it go. It is not your hill. | speed 0.3, earnest -0.2, solitary -0.3
- socratic | Ask the question that unravels it for them | rigor 0.3, earnest -0.5, solitary -0.3 | tags: mirror

## core-unfamiliar [core]
A tool you have never used. The deadline is real.

- docs | Read the documentation. All of it. | rigor 0.42, speed -0.5, solitary 0.4
- poke | Click things until it makes sense | rigor -0.6, speed 0.5
- ask | Find the one person who already knows | speed 0.4, solitary -0.7
- known | Use the thing you already know instead | rigor -0.2, speed 0.5, earnest -0.3

## core-praise [core]
Someone compliments your work, specifically and accurately.

- thanks | "Thank you." Full stop. No deflection. | terse 0.5, earnest 0.6
- credit | Immediately redistribute the credit | earnest 0.4, solitary -0.6
- caveat | Explain what is still wrong with it | rigor 0.35, earnest 0.2, solitary 0.3
- deflect | Deflect with a joke, feel it later | speed 0.2, earnest -0.6

## core-notes [core]
Your notes app, right now, honestly.

- system | A system. Tagged. Maintained. | rigor 0.45, solitary 0.3
- one | One enormous file, append-only | rigor -0.4, terse -0.6
- empty | Empty. It is all in your head. | terse 0.6, speed 0.4, solitary 0.4
- fragments | Forty fragments, no titles, all urgent | rigor -0.6, speed 0.5, earnest -0.2

## core-rabbit-hole [core]
It is late and you have found a rabbit hole.

- down | Down. Obviously down. | speed -0.6, solitary 0.5 | tags: nocturnal
- bookmark | Bookmark it for a version of you with more time | rigor 0.2, speed 0.4
- share | Send it to three people immediately | terse -0.2, speed 0.4, solitary -0.7
- bed | Close the laptop. Genuinely close it. | rigor 0.3, terse 0.5, earnest 0.3

## core-gut [core]
You have the data. Your gut says otherwise.

- gut | Gut. You can justify it afterwards. | rigor -0.65, speed 0.4
- data | The data. That is what it is for. | rigor 0.5, earnest 0.2
- more | Neither yet. Get more data. | rigor 0.35, speed -0.5
- why | Work out why your gut is so certain | rigor -0.45, terse -0.3, speed -0.4

## core-weekend [core]
Someone asks how your weekend was.

- fine | "Good, thanks." Move on. | terse 0.6, earnest -0.2
- saga | The full saga, including the parts that went nowhere | terse -0.75, earnest 0.3, solitary -0.3
- detail | One perfect detail, chosen carefully | rigor -0.35, terse 0.25, speed -0.2
- return | Turn it around and ask about theirs | earnest -0.2, solitary -0.55 | tags: mirror

## core-elegant [core]
Two solutions. One is elegant. One is obvious.

- elegant | Elegant. It is not close. | rigor -0.35, speed -0.4, earnest -0.2
- obvious | Obvious. Someone has to maintain it. | rigor 0.45, earnest 0.4
- both | Ship the obvious one, keep sketching the elegant one | terse -0.35, speed -0.5, solitary 0.3
- argue | Get someone to argue you out of the elegant one | rigor 0.2, solitary -0.6

## core-today [core]
Honestly, how do you decide what to work on today?

- list | The list decides. You just follow it. | rigor 0.45, terse 0.3 | tags: checklist
- mood | Whatever you can feel your way into | rigor -0.6, earnest -0.25
- hardest | The hardest thing, first, on principle | rigor 0.25, earnest 0.55
- momentum | Whatever keeps yesterday going | rigor -0.45, speed 0.5

## core-long [core]
The thing you are making is taking much longer than you said.

- cut | Cut scope until it fits the promise | terse 0.5, speed 0.45
- tell | Tell them early, in detail, with the reasons | terse -0.5, earnest 0.5, solitary -0.3
- keep | Say nothing. Keep going. It will be worth it. | terse -0.3, speed -0.65, solitary 0.45
- rescope | Renegotiate what you promised | rigor 0.3, solitary -0.4

<!-- Whimsy — questions 5 and 9. They look arbitrary and are not: each
option carries real (smaller) axis weight, and may carry a concept tag that a
model can claim. Never name a model here. -->

## whim-emoji [whimsy]
Choose an emoji. No context. No take-backs.

- bread | 🍞 | speed -0.12, earnest 0.18, solitary -0.12 | tags: bread
- ginger | 🫚 | rigor 0.12, earnest -0.22, solitary 0.16 | tags: ginger

## whim-drink [whimsy]
It is 3pm and something must be done about it.

- coffee | Coffee, the fourth one | speed 0.28, earnest 0.12 | tags: coffee
- tea | Tea, properly steeped | rigor 0.16, speed -0.22 | tags: tea
- water | Water. You are an adult. | terse 0.28, earnest 0.16
- nothing | Push through on spite alone | earnest -0.28, solitary 0.22

## whim-door [whimsy]
A door in your house that was not there yesterday.

- open | Open it | rigor -0.22, speed 0.28, earnest -0.12
- measure | Measure the house from outside first | rigor 0.33, speed -0.22
- witness | Get someone else to look at it with you | earnest 0.16, solitary -0.38
- ignore | Live alongside it. Say nothing. | terse 0.28, earnest -0.22, solitary 0.33

## whim-sock [whimsy]
One sock is missing. The laundry is finished.

- search | The machine is lying. Search it again. | rigor 0.28, speed -0.16, solitary 0.12
- mismatch | Wear a mismatched pair. Forever, if needed. | rigor -0.28, earnest -0.22
- bin | Bin the survivor. Clean break. | terse 0.33, speed 0.28
- drawer | The odd-sock drawer. It will turn up. | speed -0.22, earnest 0.22, solitary -0.12 | tags: longform

## whim-hour [whimsy]
An extra hour appears in your day. It is 4am.

- awake | You were up anyway | speed -0.12, solitary 0.28 | tags: nocturnal
- sleep | Give it straight back to sleep | terse 0.28, earnest 0.16
- walk | Go outside. Nobody is there. | rigor -0.16, terse -0.16, solitary 0.33
- start | Start the thing. Get ahead. | rigor 0.16, speed 0.33 | tags: morning

## whim-rain [whimsy]
A 40% chance of rain.

- coat | Take the coat | rigor 0.22, speed -0.12
- gamble | It will be fine | rigor -0.3, speed 0.22
- window | Look out of the window instead | rigor -0.22, terse -0.16, solitary 0.22
- apps | Check three different apps | rigor 0.16, terse -0.28, speed -0.28

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

<!-- Follow-ups. Never drawn at random; only unlocked by an earlier answer.
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
