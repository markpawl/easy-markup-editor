# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Session start

1. **Always read** `docs/CURRENT_WORK.md` and `docs/IDEAS.md` first — both are
   short. They tell you what work is in flight (with its staged checklist) and
   what is queued.
2. **Before touching code or app behavior**, also read `docs/ARCHITECTURE.md`,
   `docs/OVERVIEW.md`, and `docs/REQUIREMENTS.md`.
3. Follow the workflow in **Project docs** below: an idea becomes a staged work
   set in `CURRENT_WORK.md`, gets built together with its docs, is signed off,
   and is recorded in `COMPLETED_WORK.md`.

## Project docs

`docs/` is the source of truth. `CLAUDE.md` only points at it and gives a
quick orientation. Each doc's own header restates its usage.

| File | What it's for | When to touch it |
|------|---------------|------------------|
| `docs/CURRENT_WORK.md` | The agreed now/next work, as work sets with staged checklists | Tick stages as you go. When a work set is implemented, tested, and signed off: summarize it in `COMPLETED_WORK.md`, then delete the work set. Empty file = pick the next idea |
| `docs/COMPLETED_WORK.md` | High-level record of finished work sets, newest first | Add an entry when a work set is signed off and removed from `CURRENT_WORK.md`; head it with sign-off **date and time** (`## YYYY-MM-DD HH:MM — name`, 24h local) |
| `docs/IDEAS.md` | Quick one-line ideas, `Pending` / `Completed` sections (`[future]`, `[implemented]`, `[rejected]` prefixes) | Add ideas freely; move to Completed when a work set resolves them |
| `docs/OVERVIEW.md` | High-level "what and why" for a human reader | Rarely — only on a real shift in purpose or approach |
| `docs/ARCHITECTURE.md` | How the code is built and why it behaves as it does — the reference before changing `main.js` / `preload.js` / `renderer/index.html` | Update in the same work set that changes the design |
| `docs/REQUIREMENTS.md` | Spec of intended editor behavior — the reference for "correct" | Update in the same work set that changes behavior |

Typical flow: idea lands in `IDEAS.md` → promoted to a staged work set in
`CURRENT_WORK.md` → built (updating `ARCHITECTURE.md` / `REQUIREMENTS.md` and
code together) → signed off → summarized in `COMPLETED_WORK.md`, work set
deleted, idea moved to `IDEAS.md` Completed.

## Keeping docs current

Maintaining these docs is part of the work, not an afterthought:

- Any change to code or behavior includes the matching `ARCHITECTURE.md` /
  `REQUIREMENTS.md` edit **in the same work set**.
- Surface every doc change for review alongside the code — never commit a
  silent doc rewrite.

## Commands

```bash
npm install    # pulls Electron itself (~hundreds of MB on first run)
npm start      # electron . — launches the desktop app
```

There is **no build step, no linter, and no test suite**. The only dependency is Electron.

**Fast dev loop:** open `renderer/index.html` directly in a browser instead of relaunching Electron. The renderer has a no-Electron fallback for Open/Save (see `docs/ARCHITECTURE.md`), so nearly all work can be done and reloaded in the browser without touching the Electron process.

## Architecture in brief

Electron app: `main.js` (main process — window, menu, file I/O) and `preload.js`
(a narrow `contextBridge` API) wrap `renderer/index.html`, which is the whole
editor in one inline script and also runs standalone in a browser. The document
is a single string (`raw`); every edit splices `raw` and re-renders it through a
block → sentence-unit parser that tracks each unit's character offsets, so
preview selections map back to exact source spans.

Full detail — the render pipeline, selection-to-source mapping, the dirty-panel
conflict flow, and parser gotchas — is in **`docs/ARCHITECTURE.md`**.

## Conventions

- `.gitattributes` enforces LF line endings in the repo (`text=auto`); expect CRLF-conversion warnings on Windows checkouts — they are harmless.
