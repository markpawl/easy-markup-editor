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

## Work set: File ▸ Open Recent (last 5 markdown files)

From `IDEAS.md`. First of an agreed sequence: #3 Open Recent → #2 session
restore → #1 tabs. Each is its own work set; this one runs to sign-off before
#2 starts.

Scope: a native **File ▸ Open Recent** submenu listing up to 5 recently opened
files, persisted across launches. No tabs yet — selecting a recent file
replaces the current document, exactly like today's Open.

Design notes:
- Persistence lives in the main process: a `recent.json` under
  `app.getPath('userData')`. Deliberately minimal; work set #2 will generalize
  it into a shared store.
- No `preload.js` change — a recent-file open is entirely main-side (menu click
  → main reads the path → sends the existing `file-opened` IPC message).
- Entries whose file no longer exists are filtered out when the menu is built.

Stages:

1. [x] `main.js` — recent-files store: `loadRecent()` / `saveRecent()` over
       `userData/recent.json`; `addRecent(path)` (resolve, dedupe via
       `sameFile` — case-insensitive on win32 — hoist, cap 5); `pruneRecent()`;
       `clearRecent()`; `existingRecent()` filters to paths still on disk.
2. [x] `main.js` — `openFile()` split into `openPath(filePath)` (read → send
       `file-opened` → `addRecent`; on read failure show an error box and
       `pruneRecent`) with `openFile()` as the dialog wrapper. `addRecent`
       also runs after a Save As (dialog path only), not plain Save.
3. [x] `main.js` — `buildMenu()` has a `File ▸ Open Recent` submenu from
       `existingRecent()` (disabled "(No recent files)" when empty; separator +
       "Clear Recent Files" otherwise). `addRecent` / `pruneRecent` /
       `clearRecent` each call `buildMenu()` so the submenu updates live.
4. [x] Tested: seeded store with 2 real + 1 missing path → missing one pruned
       from the menu, reals kept in order. Reducer unit-checked (order, dedupe
       + hoist, cap-at-5, win32 case-insensitive). Integration: opening a file
       prepends it to `recent.json` and rebuilds the submenu. Fresh launch with
       no store file → no error, "(No recent files)". Menu clicks (reopen,
       Clear) not automatable — logic paths share verified primitives.
5. [x] Docs: `REQUIREMENTS.md` Files section gained an Open Recent entry;
       `ARCHITECTURE.md` gained a "Main-process state" section (recent-files
       store, live `buildMenu()` rebuilds, main-side open) and a note that dead
       entries linger in `recent.json` until the cap evicts them.
6. [ ] Sign off → `COMPLETED_WORK.md` entry (date + time), delete this work
       set, move idea to `IDEAS.md` Completed as `[implemented]`.
