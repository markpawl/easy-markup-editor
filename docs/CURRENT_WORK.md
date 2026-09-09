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

1. [x] Renderer — `tabs` (`{ filePath, fileName, content, dirty }`) +
       `activeIndex`, seeded from the single doc; `activeTab()` /
       `touchActiveTab()` indirection wired into `setDirty` / `setFileName`;
       `.tab-strip` DOM + CSS; `renderTabs()` draws the tabs + a (still inert)
       `+` / `×`. Verified: one tab, strip shows it, a simulated edit mirrors
       into `tabs[activeIndex].content` / `.dirty` and the strip's dirty dot;
       no page errors. `loadActiveIntoGlobals()` deferred to stage 2 (needed
       only when switching).
2. [x] Renderer — `loadActiveIntoGlobals()`, `newTab()` (blank doc,
       `nextUntitledName()`), `switchTab(i)`, `closeTab(i)` with a dedicated
       `#closeOverlay` Save / Don't save / Cancel modal (`confirmClose()`);
       `removeTabAt()` keeps ≥1 tab (last close → fresh `Untitled`). One
       delegated click listener on the strip handles tab / `×` / `+`. `render()`
       inside `loadActiveIntoGlobals` resets the panel to idle. `doSave` now
       returns saved/canceled; `beforeunload` guards if **any** tab is dirty.
       Driven test: new → 2 tabs; per-tab content/dirty preserved across
       switches; clean close; dirty close raises the modal; Don't-save on the
       last tab leaves a fresh `Untitled`.
3. [x] Renderer — `openIntoTab({filePath,fileName,content})`: focus an open tab
       with the same path (`sameFilePath`, case-insensitive on win32), else
       reuse a pristine tab (no path, clean, content `''` or `SAMPLE`), else add
       a tab. Both `onFileOpened` and the browser file input route through it.
       Driven test: sample tab reused on first open; second file → new tab;
       reopening (lowercased path) focuses the existing tab; opening while the
       active tab is dirty → new tab; a fresh `newTab()` is reused.
4. [x] `save-file` IPC takes `{ content, filePath, saveAs }`, returns
       `{ filePath }`. `currentFilePath` removed from `main.js` entirely —
       `session-state` now reads `s.filePath` from the renderer, `pushSession`
       sends `tabs[activeIndex].filePath`, `onSessionRestore` stores
       `data.filePath` back onto the tab, `doSave` passes/records the active
       tab's path. Save As still `addRecent`s. Driven test: Save with a path
       writes to disk with no dialog, clears dirty, keeps the path;
       `state.json` session gets the path from the renderer. Dialog paths (Save
       with no path, Save As) not headless-testable — same write + addRecent
       code as before.
5. [x] File menu: **New** (`CmdOrCtrl+N`) and **Close Tab** (`CmdOrCtrl+W`)
       send `request-new-tab` / `request-close-tab`; `preload.js` exposes
       `onRequestNewTab` / `onRequestCloseTab`; renderer wires them to
       `newTab()` / `closeTab()`. Menu reordered (New, Open, Recent, ─, Save,
       Save As, ─, Close Tab, Quit); on macOS `role:'close'` moved to
       `Cmd+Shift+W` to free `Cmd+W` for Close Tab. Driven test: two
       `request-new-tab` → 3 tabs; `request-close-tab` → 2.
6. [x] Session for the set — `store.session` is `{ tabs: [{ filePath, fileName,
       content, dirty }], activeIndex }`. New `sanitizeSession()` normalizes it
       and wraps the legacy single-doc shape as one tab. `session-state` runs
       the renderer payload through it; `sendSessionRestore` applies the
       dirty-vs-disk rule per tab and sends `{ tabs, activeIndex }`; `pushSession`
       sends the whole tab array; `onSessionRestore` rebuilds `tabs` +
       `activeIndex` and `loadActiveIntoGlobals()`. Driven test: 3-tab set
       persists to `state.json`; relaunch rebuilds it (clean file tab re-read
       from disk, dirty scratch tab keeps its buffer, active index preserved);
       a legacy single-doc `session` restores as one tab.
7. [x] Docs — `ARCHITECTURE.md`: "Two runtimes" (IPC list, renderer owns
       tabs), "Main-process state" (`store.session` shape), "Session"
       (`sanitizeSession`, per-tab rule), new "Tabs and the active-document
       mirror" section, "Core model" reworded (`raw` = active tab's copy), two
       new limitation notes. `REQUIREMENTS.md`: new "Tabs" section; "Files" and
       "Session restore" amended for tabs; window-close prompt now "any tab".
       Full driven test pass: build 3 tabs → real `app.quit()` → relaunch
       restores all 3 with correct active/dirty (clean file tab re-read from
       disk, dirty buffer kept); close clean tab (index clamps); close dirty
       tab → confirm modal → Don't save removes it; close last tab → fresh
       `Untitled`. Earlier stages covered open-focus / pristine reuse / per-tab
       save. Browser (non-Electron) mode verified live in Chrome: `hasElectron`
       false, strip renders, `newTab` / `switchTab` / edit + dirty dot work, no
       console errors.
8. [ ] Sign off → `COMPLETED_WORK.md` entry (date + time), delete this work
       set, move idea to `IDEAS.md` Completed as `[implemented]`.
