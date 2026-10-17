# Kaya Kurrent — how to use the templates

Everything (templates, fonts, logos, your reference images, rules) is saved in the project. You never need to
send the templates again. The full technical notes for Claude are in `AGENTS.md` (section "Project: Kaya Kurrent").

## Starting a new session

Until this work is merged into the main branch, start every new session with this message:

> Switch to the branch `claude/upbeat-curie-rh7hgl` (git fetch origin claude/upbeat-curie-rh7hgl, then check it out)
> and keep working on it. Read the "Project: Kaya Kurrent" section of AGENTS.md before doing anything.

Then ask for what you need (examples below).

## The templates

Every template makes two images: a **square** (feed post) and a **vertical** (story/status).

| Template | Use it for | What to send |
|---|---|---|
| **News** | Full stories: headline, byline, bold first paragraph, body | The story text or .docx. Long stories get trimmed to ~210 words (quotes kept word for word). Headlines are kept to 8 words or fewer, in capitals. |
| **News Cover** | The photo + headline slide posted *before* a News story | Nothing extra: it uses the story's headline. Send a photo if you have one; otherwise Claude finds one on Pexels. |
| **Breaking News** | A photo with a short, urgent headline (and optional line under it) | Headline (+ optional subline) and a photo. |
| **Celebration** | Holidays and occasions on the calendar card | The message, the sticky-note text, the date(s), and optionally a photo for the polaroid. |
| **Public Notice** | Official notices (e.g. fuel prices) | Title, the lines or paragraph, and the source. |
| **Opportunities** | Opportunities Desk posts (yellow card over a photo) | The opportunity (or the crawl report). Each post shows: who it's for, what you get, deadline. Captions and links go in a separate captions file, not on the image. |

### Example requests

- "Here's today's story [paste]. Make the News post and its cover."
- "Breaking: [headline]. Photo attached."
- "Make a Celebration for Mother's Day, 14 October." (any occasion)
- "Make Opportunities posts for the top 5 in this report [paste]."
- "The headline on the Bullets cover breaks badly on the vertical — fix it."

### Your design rules (Claude follows these automatically)

- Headlines always in capitals; News headlines 8 words or fewer.
- Text fills the frame (short stories get bigger text), with comfortable side margins.
- Headlines and titles break at natural phrases (never split a name or "Set Up").
- Photos are sharp, not blurred.
- Only your own logo files are used; nothing is redrawn.
- Links "for the post" go in the caption, never on the image.

## Posting to your pages (being set up)

| Platform | Status |
|---|---|
| Facebook (Page "KayaKurrent") | Connected |
| Instagram (@kayakurrent) | Connected |
| Threads (@kayakurrent) | Connected |
| X (@KayaKurrent) | Connected, but posting needs paid X credits (the account has none), so X is posted by hand for now |

In a new session, say "test all four connections" (nothing is posted).

How checking works: Facebook posts can be **scheduled**, so they wait in Meta Business Suite (Planner) where you can
edit or delete them before they go out. Instagram, Threads and X can't be scheduled or drafted from outside their
apps; anything sent goes live at once. So Claude shows you those captions in the chat first and only posts after
you say they're approved.
Remember: the Threads token expires about every 60 days and must be regenerated.
