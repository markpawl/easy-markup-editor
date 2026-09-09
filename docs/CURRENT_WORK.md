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
2. [x] `main.js` — `ipcMain.on('session-state')` merges the renderer's
       `{ content, fileName, dirty }` with main-owned `currentFilePath` into
       `store.session`; `scheduleStoreWrite()` (600 ms debounce) for the
       frequent pushes; `writeStoreSync()` on `before-quit` flushes it.
       Verified both paths write the session to `state.json` (quit after the
       debounce fires; quit inside the debounce window → sync flush).
3. [x] `main.js` + `preload.js` — `sendSessionRestore(win)` runs on
       `webContents.once('did-finish-load')`, applies the dirty-vs-disk rule,
       and sends `session-restore` (payload, or `null` when there's nothing to
       restore so the renderer always gets one signal). `preload.js` exposes
       `reportState` + `onSessionRestore`.
4. [x] `renderer/index.html` — `pushSession()` (400 ms debounce, gated on
       `sessionReady`) wired into `setDirty` / `setFileName`; `onSessionRestore`
       applies restored state over `SAMPLE`, then flips `sessionReady` so the
       initial SAMPLE can't overwrite a stored session.
5. [x] Driven tests (`executeJavaScript` + self-quit hook): fresh launch → no
       restore, SAMPLE; dirty scratch buffer → restored verbatim with the
       dirty dot; clean session + file present → re-read from disk (stale
       buffer ignored); clean session + file missing → buffer restored, marked
       dirty; debounced write and `before-quit` sync flush both persist;
       recent-files load from `state.json` and legacy `recent.json` imports
       once. Not driven (rely on shared primitives + standard Electron): a real
       menu "Open Recent" click and a real window-close `before-quit`.
6. [x] Docs: `REQUIREMENTS.md` gained a "Session restore" section (what
       persists, the dirty-vs-disk rule, the caveats); `ARCHITECTURE.md`
       Main-process state rewritten around `state.json` / `store` (shape,
       `loadStore`/`writeStore`/`scheduleStoreWrite`/`writeStoreSync`, the
       `session-state` / `session-restore` IPC and `sessionReady` gate), plus
       two "Other" limitation notes.
7. [ ] Sign off → `COMPLETED_WORK.md` entry (date + time), delete this work
       set, move idea to `IDEAS.md` Completed as `[implemented]`.
