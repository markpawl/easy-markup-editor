# Requirements

> The reference for what "correct" behavior is. Keep it in sync with the app:
> update the relevant section in the same work set that changes behavior. New
> features add sections here as they land; the "Known gaps" list shrinks as
> they're fixed.

## Editing surface

- The rendered markdown preview is the primary and only editing surface. There
  is no raw-source pane.
- The document is parsed into blocks (split on blank lines), classified as
  heading / code / quote / unordered list / ordered list / paragraph.
- Prose blocks (paragraphs, list items) are further split into sentence-level
  units. Headings, code fences, and blockquotes are treated as a single unit.
- Each unit tracks the exact character offsets of its text in the source.

## Selection → edit

- Selecting a range of text in the preview loads the corresponding source span
  (from the start of the first selected unit to the end of the last) into the
  right-hand panel.
- Submitting the panel replaces that exact span in the source and re-renders.
- Ctrl/Cmd+click on a unit edits that single unit without needing a text
  selection.

## Click → insert

- Placing the cursor without selecting (collapsed selection) enters insert mode
  anchored after that unit.
- Submitted text is inserted at the end of the anchor unit. If the unit ends at
  a block boundary the insertion is preceded by a blank line (`\n\n`);
  otherwise by a single space.

## Unsaved-panel protection

- If the panel holds unsaved text (edited but not submitted, or typed insert
  text) and the user selects elsewhere, a modal offers Update / Discard /
  Cancel.
- Choosing Update applies the pending panel change first, then relocates the
  new selection to the correct span after the document length has shifted.

## Tabs

- Multiple documents are open at once, shown in a tab strip. Each tab is an
  independent document with its own file, content, and unsaved state.
- **New** (`Cmd/Ctrl+N`, or the `+` on the strip) opens an empty `Untitled`
  tab and makes it active.
- Clicking a tab makes it active; its content fills the editor and the panel
  returns to idle.
- **Close Tab** (`Cmd/Ctrl+W`, or the `×` on a tab) closes it. Closing a tab
  with unsaved changes prompts Save / Don't save / Cancel (Save that is
  cancelled leaves the tab open).
- There is always at least one tab; closing the last one leaves a fresh
  `Untitled`.
- A tab shows its filename and a dot when it has unsaved changes.

## Files

- **Open** (`Cmd/Ctrl+O`) — choose a `.md` / `.markdown` / `.txt` file. It
  opens in a tab: an already-open tab for that file is focused; otherwise a
  pristine `Untitled` tab is reused, else a new tab is added.
- **Open Recent** — submenu of up to 5 most-recently opened files, newest
  first, persisted across launches. Selecting one opens it (same tab-targeting
  as Open). A file that no longer exists is not listed. An empty list shows a
  disabled "(No recent files)". "Clear Recent Files" empties it. Opening a
  file, and Save As to a new location, add to the list.
- **Save** (`Cmd/Ctrl+S`) — write the active tab back to its file, or prompt
  for a location if it has none.
- **Save As** (`Cmd/Ctrl+Shift+S`) — always prompt for a location (active tab).
- The title bar shows the active tab's filename and a dot when it has unsaved
  changes.
- Closing the window while **any** tab has unsaved changes prompts before
  discarding.

## Session restore

- On quit, the whole set of open tabs is saved — each tab's file path (if any),
  buffer, and unsaved flag — plus which tab was active.
- On the next launch the tab set is restored in place of the default sample
  document. Per tab:
  - Unsaved at quit → the buffer is restored exactly, still marked unsaved.
  - Saved (clean) with a file → the file is re-read from disk (its on-disk
    content wins); if it can no longer be read, the saved buffer is restored
    and marked unsaved.
  - No file (untouched sample or unsaved scratch) → the buffer is restored.
- A missing or unreadable session falls back to the sample document silently.
- This is a safety net, not a replacement for saving — the unsaved-changes
  prompt on quit still applies. Text typed into the edit panel but not yet
  submitted is not part of the saved state. Window size and position are not
  restored.

## Standalone (non-Electron) mode

- Opening `renderer/index.html` directly in a browser must work.
- Open falls back to a file-input picker; Save falls back to a file download.

## Known gaps (see IDEAS.md / ARCHITECTURE.md)

- Sentence splitting is regex-based and mis-splits abbreviations ("e.g.", "Dr.").
- Code fences containing blank lines are not parsed correctly.
- Blockquotes are not split into sentences.
- Inline formatting spanning two sentences can be separated when one is edited.
