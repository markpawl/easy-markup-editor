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

## Work set: Session restore

From `IDEAS.md`. Second of the #3 → #2 → #1 sequence. Runs to sign-off before
#1 (tabs) starts. No tabs yet, so "the set of open files" is a single document
for now; #1 will extend the restored session to a set.

Scope: on quit, persist the working state; on next launch, restore it instead
of the `SAMPLE` scratch document.

Decisions:
- Persist **`filePath` + buffer content + `dirty`**, not just the path — so
  unsaved edits (named doc or scratch buffer) survive a quit/crash.
- Restore rule: `dirty` → restore the persisted buffer; clean → re-read
  `filePath` from disk (fallback to the buffer if the read fails); no
  `filePath` → restore the buffer as an unsaved scratch doc.
- Missing/failed restore falls back to `SAMPLE`, no error dialog.
- The existing dirty-quit `beforeunload` prompt stays — persistence is a safety
  net, not a replacement.
- Window size/position: out of scope (separate idea).

Design notes:
- Generalize `main.js` persistence into a single `state.json` under
  `app.getPath('userData')` holding `{ recentFiles, session }`; migrate the
  existing `recent.json` into it once if present.
- Renderer pushes `{ content, fileName, dirty }` to main (debounced) over a new
  `session-state` channel; main merges its own `currentFilePath`, keeps it in
  memory, and writes on debounce + `before-quit`.
- Main sends `session-restore` on `did-finish-load`. `preload.js` gains
  `reportState` and `onSessionRestore`.

Stages:

1. [x] `main.js` — `state.json` shared store: `store = { recentFiles, session }`
       in memory, `loadStore` / `writeStore` / `sanitizeStore`; recent-files
       functions now mutate `store.recentFiles`; `loadStore` does a one-time
       import of legacy `recent.json` when `state.json` is absent. Verified:
       legacy import populates `state.json` on first launch; second launch
       loads from `state.json` without re-importing; `session` round-trips;
       fresh userData launches clean.
2. [ ] `main.js` — session state in memory; `ipcMain.on('session-state')`
       merges renderer payload with `currentFilePath`; persist on a short
       debounce and on `before-quit`.
3. [ ] `main.js` + `preload.js` — build the restore payload on
       `did-finish-load` per the restore rule; send `session-restore`.
       `preload.js` exposes `reportState` + `onSessionRestore`.
4. [ ] `renderer/index.html` — debounced `reportState` wired to edit / save /
       filename / dirty changes; `onSessionRestore` applies restored state in
       place of `SAMPLE`.
5. [ ] Test with `npm start`: scratch edit → quit → relaunch restores buffer +
       dirty dot; file + edits → quit → relaunch restores edits; clean file,
       changed on disk externally → relaunch shows fresh disk content; restored
       file deleted → falls back to `SAMPLE`, no error; recent-files still
       works and legacy `recent.json` is imported.
6. [ ] Docs: `REQUIREMENTS.md` new "Session" section; `ARCHITECTURE.md`
       Main-process state (`state.json` shape, `session-state` /
       `session-restore` IPC, debounced + `before-quit` writes).
7. [ ] Sign off → `COMPLETED_WORK.md` entry (date + time), delete this work
       set, move idea to `IDEAS.md` Completed as `[implemented]`.
