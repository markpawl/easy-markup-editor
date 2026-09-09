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

1. [ ] `main.js` — recent-files store: load/save `userData/recent.json`;
       `addRecent(path)` (unshift, dedupe, cap 5); `getRecent()` returns only
       paths that still exist on disk.
2. [ ] `main.js` — refactor `openFile()` into `openPath(filePath)` (read +
       send `file-opened` + `addRecent`) with `openFile()` as the dialog
       wrapper. Also `addRecent` after a successful Save As.
3. [ ] `main.js` — `buildMenu()` gains a `File ▸ Open Recent` submenu from
       `getRecent()` (disabled "(No recent files)" when empty), a separator,
       and "Clear Recent Files". Rebuild the menu after every store change so
       the submenu updates live.
4. [ ] Test with `npm start`: open files via dialog → appear under Open Recent;
       relaunch → list persists; click an entry → reopens; delete a listed file
       on disk → pruned from the menu; Clear Recent Files → empties it.
5. [ ] Docs: `REQUIREMENTS.md` File-menu section (add Open Recent behavior);
       `ARCHITECTURE.md` (new main-process persistence: `userData/recent.json`,
       menu rebuild on change).
6. [ ] Sign off → `COMPLETED_WORK.md` entry (date + time), delete this work
       set, move idea to `IDEAS.md` Completed as `[implemented]`.
