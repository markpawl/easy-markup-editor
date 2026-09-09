# Completed Work

> High-level record of finished work sets, newest first. When a work set in
> `CURRENT_WORK.md` is signed off, add an entry here — a few bullets on what
> changed, not a full changelog. Commit history has the detail.
>
> Head each entry with **date and time** of sign-off, 24-hour local time:
> `## YYYY-MM-DD HH:MM — <work set name>`.

---

## 2026-09-09 10:13 — Session restore

- On quit the working state (file path, editor buffer, unsaved flag) is
  persisted; on next launch it replaces the default sample document.
- Restore rule: dirty → the buffer as-is; clean → re-read the file from disk
  (falls back to the buffer, marked unsaved, if the file is gone); no file →
  the buffer. Missing/unreadable session falls back to the sample silently.
- `recent.json` replaced by a single `state.json` (`{ recentFiles, session }`)
  under userData, with a one-time import of the legacy file. Session writes are
  debounced (~400 ms renderer + 600 ms main) plus a synchronous flush on
  `before-quit`.
- New IPC: renderer → `session-state`, main → `session-restore`; `preload.js`
  gained `reportState` / `onSessionRestore`.
- The unsaved-changes quit prompt still applies; window bounds and unsubmitted
  edit-panel text are not persisted.
- Second of the #3 → #2 → #1 sequence. Next: tabs (#1).

## 2026-09-09 09:49 — File ▸ Open Recent (last 5 markdown files)

- `main.js` gained a recent-files store: `recent.json` under
  `app.getPath('userData')`, newest-first, capped at 5, win32
  case-insensitive dedupe.
- `openFile()` split into `openPath(filePath)` + a dialog wrapper; opening a
  file (dialog, recent entry, or Save As to a new path) records it.
- New `File ▸ Open Recent` submenu, rebuilt live on every store change;
  missing files are filtered out; "Clear Recent Files" empties it.
- No `preload.js` change — recent-open is entirely main-side over the existing
  `file-opened` IPC.
- First of the #3 → #2 → #1 sequence. Next: session restore (#2), which will
  generalize this store.

## 2026-09-09 09:34 — Restructure CLAUDE.md ↔ docs relationship

- Detailed architecture (render pipeline, selection-to-source mapping,
  dirty-panel conflict flow, parser gotchas) moved out of `CLAUDE.md` into a
  new `docs/ARCHITECTURE.md`. One home per fact.
- `CLAUDE.md` is now a session-start guide: a `Session start` protocol with
  tiered doc reading (always `CURRENT_WORK.md` + `IDEAS.md`; the rest before
  code/behavior work), a `Keeping docs current` rule (doc edits ride in the
  same work set, surfaced for review), a condensed `Architecture in brief`
  blurb, and the docs table (now with an `ARCHITECTURE.md` row).
- `docs/OVERVIEW.md` "how it's built" condensed; cross-references across
  `docs/*` repointed to `ARCHITECTURE.md`.

## 2026-09-09 09:11 — Rename to "Markup View-Edit"

- Display name **Markup View-Edit**; `package.json` `name` `markup-view-edit`
  with standard `productName`; `package-lock.json` in sync. Repo and working
  directory stay `easy-markup-editor`.
- Updated `README.md` title, `renderer/index.html` `<title>`, and
  `docs/OVERVIEW.md`. Removed "patch" wording from the package description.
- Cleaned a stale `example.md` placeholder in the title bar markup
  (`renderer/index.html`).

## 2026-09-09 08:16 — Project setup

- Initialized local git repo (branch `main`); added `.gitignore` and
  `.gitattributes` (LF normalization).
- Published to GitHub: https://github.com/markpawl/easy-markup-editor (public).
- Removed the redundant `example.md`; the default document is the `SAMPLE`
  constant in `renderer/index.html`.
- Added `CLAUDE.md` (commands + architecture).
- Created `docs/`: `OVERVIEW.md`, `REQUIREMENTS.md`, `IDEAS.md`,
  `CURRENT_WORK.md`, `COMPLETED_WORK.md`.
