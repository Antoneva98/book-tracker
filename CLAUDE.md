# CLAUDE.md — Book Tracker («Світло» theme)

This file orients an AI coding agent (Claude Code) building the **Трекер читання** reading-habit
app from the design references in this handoff. Read `README.md` first — it is the full spec. This
file is the working brief.

## What you're building
A minimalist, calm, **mobile** reading-habit tracker (iOS-style), Ukrainian UI, in the **«Світло»**
theme (light royal-blue + a dark variant). Six screens: Home, Library, Book Detail, Analytics,
Notes, Insights, joined by a floating bottom tab bar.

Design pillars — honour them in every decision:
- **Minimal, no visual noise.** Content (book covers) is central.
- **Fast interactions** — log reading / update progress in seconds.
- **Soft motivation** — no badges, no streak-shaming, no aggressive gamification.
- **Calm, focused** aesthetic.

Explicitly **out of scope** (do NOT add): social features, achievements/badges, complex goal
systems, timers, genre/category clutter, chart overload.

## The reference files are designs, not the codebase
`reference/*` is an HTML/React **prototype** of the intended look and behavior. Do **not** ship it.
Recreate it in the project's real stack:
- If a stack already exists, follow its conventions and component library.
- If none exists, prefer **React Native (Expo)** or **SwiftUI** for a native iOS feel. Confirm with
  the user before scaffolding.

## Start here
1. Port the tokens from `reference/svitlo-tokens.css` into the project's token system first
   (theme object / Tailwind config / asset catalog). Wire **light + dark** from day one.
2. Build the **shell**: status area + scrollable content + floating tab bar (5 tabs).
3. Build screens in this order: **Home → Library → Book Detail → Analytics → Notes → Insights.**
   Each maps 1:1 to a section in `README.md` with exact layout, components, colors, and copy.
4. Match `reference/screenshots/*` visually.

## Data & state
Model lives in `reference/data.js` (Book, Note, daily Activity map, Monthly aggregates, Insights).
Key rule: **persist daily reading activity (date → pages)**, per-book `read` + start/finish dates,
page-progress history, and notes — even data not shown on screen. Streak, analytics, and insights
are all derived from the activity log, so it must be the source of truth.

Core interactions to implement (details in README → Interactions):
- "Я читав сьогодні" → page logger (stepper, step 5) → increments current book, bumps streak, toast.
- Update progress → reaching total pages flips book to `completed` + finish date.
- Add note (Ідея / Цитата / Застосування) → attaches to current book + page.
- (Spec'd, build when ready) Add book: title/author/pages, auto-fetch cover by ISBN with manual
  override. The prototype's generative typographic covers are the fallback when no image exists.

## Visual must-haves
- Streak ring uses **`--c-warn` (#f0992b)**; goal ring uses **`--c-accent` (#2f5bff)**.
- Numbers, page counts, %, dates → **mono, tabular** (`JetBrains Mono` or your mono).
- Body sans → `Manrope` (or a geometric-humanist equivalent). Book-cover lettering → `Spectral` serif.
- Radii: cards 22 / rows 14 / tab bar 30 / pills 999.
- Respect `prefers-reduced-motion`. Press targets ≥ 44px.

## Localisation
All UI copy is **Ukrainian** and given verbatim in the README (use it exactly). Keep strings in a
localisation layer so other languages can be added later; don't hardcode in components.

## Definition of done (per screen)
- Matches the screenshot in light **and** dark.
- Uses ported tokens (no stray hex literals in components).
- Interactions work against the persisted data layer.
- No added features from the "out of scope" list.

## Don't
- Don't copy the HTML/CSS verbatim into a webview — rebuild natively.
- Don't introduce new accent colors, gradients, or decorative noise.
- Don't add motivational pressure (countdowns, "you broke your streak!", leaderboards).
