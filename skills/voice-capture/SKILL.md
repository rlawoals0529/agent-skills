---
name: voice-capture
description: Build a voice guide from someone's real writing, then draft in it without posting. Covers finding the tells that actually separate their writing from yours, evidencing every rule so the guide cannot drift into invention, keeping registers separate per surface, and the draft-and-hand-over rule. Use when an agent will write prose that goes out under a person's name, when a draft keeps coming back rewritten, or when setting up a new collaborator's voice. Triggers on "write as me", "make this sound like me", "in my voice", "draft the PR description", "this does not sound like me", "capture my writing style".
---

# Voice capture

An agent writing under someone's name will default to its own register, and the result reads
as impersonation rather than assistance. This is how to build the guide that stops that, and
how to use it without ever posting.

## The hard rule: draft, then hand over

**Never post anything, anywhere, without permission in the same turn.** Not a comment, not a
message, not a review, not a resolution.

When something needs saying, hand over three things and stop:

```
WHERE   the exact thread or surface
WHY     what prompted it
DRAFT   the exact text, ready to paste
```

**The draft must already be in their voice, not yours.** A draft they have to rewrite is not
a draft. If they want it different, iterate on the text - and still do not post it.

## Build it from a corpus, and say where you are guessing

Find writing they actually produced. Chat is usually the richest source, because it is
unedited and high-volume.

**Name the gap out loud.** If everything under their name on one surface was written by
somebody else, there is no corpus for that surface, and the guide is projecting a chat
register into one they have never written in. Say so in the guide itself. A rule with no
evidence behind it is your preference wearing their name.

## Evidence every rule

The guide is a table, and the second column is what keeps it honest:

| Do | Evidence |
| --- | --- |
| Open by name | a real quoted example |
| One or two sentences, then stop | a real quoted example |
| Own a mistake fast rather than explaining it | a real quoted example |

A row you cannot evidence gets deleted or marked as a guess. This is the difference between
a voice guide and a style opinion.

## Find the tells, not the preferences

Most style advice is generic. What makes a guide work is the handful of markers that
actually separate this person's writing from the model's default.

Look for:

- **Punctuation the model reaches for and they never use.** An em dash is the usual one, but
  check rather than assume - search the corpus and count.
- **Sentence length**, measured rather than felt.
- **How they handle a correction.** Inline and cheerful, or a rewritten message.
- **Whether they soften an ask**, and with what construction.
- **Contractions, exclamation marks, emoji** - presence and placement, not just presence.

**One exception, and it matters: a verbatim quote keeps its original punctuation.** If
someone else wrote the em dash and you are quoting them, leave it. Editing a quote to pass a
style check falsifies evidence, which is a worse problem than the dash.

## Registers are per surface

The same person writes differently in a chat message, a pull request body, a ticket and a
review comment. One voice, several registers.

Keep them in separate sections with their own examples. A guide that collapses them produces
chat-toned tickets and ticket-toned chat, and both read wrong.

| Surface | Usually |
| --- | --- |
| Chat | Short, warm, punctuated loosely |
| Change description | Structured, plain, no ceremony |
| Ticket | What it does, and stop |
| Review comment | The verdict first, then the detail |

## Layering a technical-writing standard

If a simplified-English standard is also in play, the two mostly agree: both want short
sentences, active voice, plain words, one idea at a time. They disagree only about warmth.

**So split them: the standard governs the sentence, the voice guide governs the frame.**
Keep the contractions and the exclamation marks the standard would strip, because those are
the person rather than the prose.

## Edit without sanding off the person

Once a draft is in the right register, edit with restraint. The goal is not to make every
sentence smoother. It is to remove the places where the agent's default prose is showing.

On the final pass:

- **Keep a clear sentence that already sounds like them.** Do not replace it only because a
  more polished version exists.
- **Cut language that does no work.** Padded openings, repeated conclusions and transition
  phrases that merely announce the next sentence should disappear.
- **Make vague claims specific only when the corpus or supplied facts support the detail.**
  Never invent an example, statistic, experience or opinion to make the prose feel grounded.
- **Watch repeated sentence shapes.** If several lines open or land the same way, fix the
  monotony, but do not force every sentence to have a different length.
- **Use plain speech where the corpus does.** Contractions and fragments are evidence-driven
  choices, not decorations to make the draft seem casual.
- **Do not add personality that was not there.** No invented jokes, slang, excitement,
  confidence or intimacy.
- **Check the seams.** Openings, transitions and paragraph endings are where generic
  model-written phrasing survives most often.

A useful test is whether the edit made the writer easier to hear or merely made the prose
look more edited. Prefer the first.

## A template beats an instruction

For a repeated surface, give the shape rather than an adjective. "Be concise" is
unactionable; a template is not:

```
WHAT         one sentence on what changes for someone using this
WHY          the reason, not the mechanism
HOW TO TEST  the steps a reviewer follows
```

## What this does not cover

This is prose only. Whether the code is right, and how a comment inside code should read,
belong to a review skill. A voice guide that starts ruling on correctness has stopped being
a voice guide.
