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

## Files

- **Open** (`Cmd/Ctrl+O`) — choose a `.md` / `.markdown` / `.txt` file.
- **Save** (`Cmd/Ctrl+S`) — write back to the open file, or prompt for a
  location if none is open.
- **Save As** (`Cmd/Ctrl+Shift+S`) — always prompt for a location.
- The title bar shows the current filename and a dot when there are unsaved
  changes.
- Closing with unsaved changes prompts before discarding.

## Standalone (non-Electron) mode

- Opening `renderer/index.html` directly in a browser must work.
- Open falls back to a file-input picker; Save falls back to a file download.

## Known gaps (see IDEAS.md / CLAUDE.md)

- Sentence splitting is regex-based and mis-splits abbreviations ("e.g.", "Dr.").
- Code fences containing blank lines are not parsed correctly.
- Blockquotes are not split into sentences.
- Inline formatting spanning two sentences can be separated when one is edited.
