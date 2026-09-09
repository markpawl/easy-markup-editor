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

## Work set: Tab interface (multiple files open at once)

From `IDEAS.md`. Last of the #3 → #2 → #1 sequence. The largest change so far:
the single global document becomes a set of tabs.

Scope: a tab strip; each tab is an independently open document
(`{ filePath, fileName, content, dirty }`). New / switch / close; Open targets
a tab; Save acts on the active tab; the session persists and restores the whole
set.

Decisions:
- **Renderer owns tab state**, including each tab's file path. `main.js` drops
  its single `currentFilePath`; the `save-file` IPC carries the path both ways.
  Main stays dialogs + disk I/O only.
- The existing globals (`raw`, `currentFileName`, `dirty`) stay as a working
  mirror of the active tab — `loadActiveIntoGlobals()` on switch,
  `touchActiveTab()` on change — so the edit/render/panel code is largely
  untouched.
- **Open** (dialog or recent) opens a **new** tab; if a tab already has that
  path, focus it instead. If the active tab is a pristine `Untitled` (clean, no
  path), reuse it rather than adding a second.
- Always **at least one tab**; closing the last one replaces it with a fresh
  `Untitled`.
- Closing a **dirty** tab shows an in-app confirm (reusing the modal pattern).
- The panel resets to idle on tab switch — no per-tab panel/selection/scroll
  state (future idea).
- Out of scope (note as ideas): drag-to-reorder, per-tab undo, MRU
  (Ctrl+Tab) cycling, window bounds.

Stages:

1. [ ] Renderer — introduce `tabs` + `activeIndex`, seeded from the current
       single doc; `loadActiveIntoGlobals()` / `touchActiveTab()` indirection;
       tab-strip DOM + CSS rendering one tab. No new/switch/close yet — prove
       editing, Save, and session still work through the indirection.
2. [ ] Renderer — `newTab()`, `switchTab(i)` (click), `closeTab(i)` with the
       dirty-close confirm; never fewer than one tab; panel resets to idle on
       switch. A `+` button drives `newTab` for now.
3. [ ] Renderer — Open (the `file-opened` handler and the browser file input)
       targets a tab: focus an existing tab with the same path, else reuse a
       pristine `Untitled`, else new tab.
4. [ ] `main.js` + `preload.js` + renderer — `save-file` IPC takes
       `{ content, filePath, saveAs }`, returns `{ filePath }`; remove
       `currentFilePath` from main; the active tab stores the returned path.
       Save As still adds to recent.
5. [ ] `main.js` — File menu gains **New** (`CmdOrCtrl+N`) and **Close Tab**
       (`CmdOrCtrl+W`), sent to the renderer as `request-new-tab` /
       `request-close-tab` (mirrors `request-save`).
6. [ ] Session for the set — `store.session` becomes `{ tabs, activeIndex }`
       (back-compat: an old single-doc `session` loads as one tab). Renderer
       `reportState` sends the tab array + `activeIndex`; `sendSessionRestore`
       maps the dirty-vs-disk rule per tab; renderer rebuilds the strip from
       the restored set.
7. [ ] Docs — `ARCHITECTURE.md` (tab model, per-tab state, `save-file` /
       session IPC changes, close-confirm); `REQUIREMENTS.md` (new "Tabs"
       section; amend Files and Session restore). Full test pass: new / switch /
       close, dirty-close confirm, open-existing-focuses, pristine-Untitled
       reuse, save + Save As per tab, quit → relaunch restores the set and
       active tab, last-tab-close, browser mode.
8. [ ] Sign off → `COMPLETED_WORK.md` entry (date + time), delete this work
       set, move idea to `IDEAS.md` Completed as `[implemented]`.
