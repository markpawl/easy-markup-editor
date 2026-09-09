# Current Work

> Work that has been agreed for now or next, broken into stages.
>
> Each **work set** is a heading with an ordered stage checklist. A work set
> stays here only while active: once every stage is implemented, tested, and
> signed off, write a high-level summary in `COMPLETED_WORK.md` and delete the
> work set from this file. This file is empty when nothing is agreed yet —
> that's the cue to pick the next idea from `IDEAS.md`.

_Last updated: 2026-09-09_

---

## Work set: Restructure CLAUDE.md ↔ docs relationship

Goal: one home per fact. `CLAUDE.md` becomes a lean session-start guide
(pointer + short orientation + commands); `docs/` holds the detail and is the
source of truth; keeping the docs current is an explicit, reviewed part of every
change.

Decisions (from discussion):
- **A** — detailed architecture goes to a new `docs/ARCHITECTURE.md`, not into
  `OVERVIEW.md`. `OVERVIEW.md` stays "what and why" for a human.
- **B** — tiered session-start reading, not blanket: always read
  `CURRENT_WORK.md` + `IDEAS.md`; read `OVERVIEW.md` / `ARCHITECTURE.md` /
  `REQUIREMENTS.md` before touching code or behavior.
- **C** — `CLAUDE.md` keeps a 3–4 line architecture orientation blurb, not a
  pure pointer.
- **D** — after any code/behavior change, the matching doc update is part of the
  same work and shown for review, never committed silently.

Stages:

1. [ ] Create `docs/ARCHITECTURE.md` with a usage header; move into it the
       "Architecture" and "Known limitations (parser gotchas)" sections
       currently in `CLAUDE.md`.
2. [ ] Trim `CLAUDE.md` to: docs table (add `ARCHITECTURE.md` row, tiered read
       guidance), a session-start protocol section, `Commands`, a condensed
       3–4 line architecture blurb, `Conventions`, and the doc-maintenance rule
       (decision D).
3. [ ] Reconcile `docs/OVERVIEW.md` — keep a short "how it's built" paragraph,
       point to `ARCHITECTURE.md` for depth, remove anything now duplicated.
4. [ ] Fix cross-references across `docs/*` (and check `README.md` "How it
       works" still reads fine standalone — likely leave as is).
5. [ ] Verify: read `CLAUDE.md` top-to-bottom as a fresh session would —
       protocol coherent, every doc referenced, no dead links, no fact living
       in two places.
6. [ ] Sign off → `COMPLETED_WORK.md` entry (date + time), delete this work
       set, mark idea `[implemented]` in `IDEAS.md`.
