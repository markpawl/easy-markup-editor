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

1. [x] Create `docs/ARCHITECTURE.md` with a usage header; move into it the
       "Architecture" and "Known limitations (parser gotchas)" sections
       currently in `CLAUDE.md`. (Content now duplicated with `CLAUDE.md` until
       stage 2 trims it.)
2. [x] Trimmed `CLAUDE.md` to: `Session start` protocol, `Project docs` table
       (added `ARCHITECTURE.md` row), `Keeping docs current` (decision D),
       `Commands`, `Architecture in brief` (condensed, points to
       `ARCHITECTURE.md`), `Conventions`.
3. [x] Reconciled `docs/OVERVIEW.md` — "how it's built" cut to one paragraph;
       closing cross-reference repointed from `../CLAUDE.md` to
       `ARCHITECTURE.md`.
4. [x] Fixed the one stale cross-reference: `REQUIREMENTS.md` "Known gaps"
       pointed at `CLAUDE.md`, now points at `ARCHITECTURE.md`. `README.md`
       "How it works" left as is — standalone prose for the public repo page,
       no internal cross-refs.
5. [x] Read `CLAUDE.md` top-to-bottom: protocol coherent; all six docs
       referenced; no dead links. Trimmed the "Fast dev loop" paragraph so the
       no-Electron-fallback mechanism is described only in `ARCHITECTURE.md`.
6. [ ] Sign off → `COMPLETED_WORK.md` entry (date + time), delete this work
       set, mark idea `[implemented]` in `IDEAS.md`.
