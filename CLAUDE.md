# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project docs

`docs/` holds the human-facing project docs. Each file's own header states how
it is used; in short:

| File | What it's for | When to touch it |
|------|---------------|------------------|
| `docs/CURRENT_WORK.md` | The agreed now/next work, as work sets with staged checklists. Read first each session | Tick stages as you go. When a work set is implemented, tested, and signed off: summarize it in `COMPLETED_WORK.md`, then delete the work set. Empty file = pick the next idea |
| `docs/COMPLETED_WORK.md` | High-level record of finished work sets, newest first | Add an entry when a work set is signed off and removed from `CURRENT_WORK.md`; head it with sign-off **date and time** (`## YYYY-MM-DD HH:MM — name`, 24h local) |
| `docs/IDEAS.md` | Quick one-line ideas, `Pending` / `Completed` sections (`[future]`, `[implemented]`, `[rejected]` prefixes) | Add ideas freely; move to Completed when a work set resolves them |
| `docs/REQUIREMENTS.md` | Spec of intended editor behavior — the reference for "correct" | Update in the same work set that changes behavior |
| `docs/OVERVIEW.md` | High-level "what and why" for a human reader | Rarely — only on a real shift in purpose or approach |

Typical flow: idea lands in `IDEAS.md` → promoted to a staged work set in
`CURRENT_WORK.md` → built (updating `REQUIREMENTS.md` and code together) →
signed off → summarized in `COMPLETED_WORK.md`, work set deleted, idea moved to
`IDEAS.md` Completed.

## Commands

```bash
npm install    # pulls Electron itself (~hundreds of MB on first run)
npm start      # electron . — launches the desktop app
```

There is **no build step, no linter, and no test suite**. The only dependency is Electron.

**Fast dev loop:** open `renderer/index.html` directly in a browser instead of relaunching Electron. The renderer detects the absence of `window.electronAPI` and falls back to an `<input type=file>` picker for Open and a Blob download for Save, so nearly all work can be done and reloaded in the browser without touching the Electron process.

## Architecture

This is a preview-first markdown editor: the rendered preview is the only editing surface. There is no raw-source pane — you select a sentence/heading/list-item in the preview and a right-hand panel loads exactly that span of source text to edit, or you click (no selection) to insert new text at that point.

### Two runtimes, one renderer

- `main.js` — Electron main process. Owns the `BrowserWindow`, the native menu (with `CmdOrCtrl+O/S/Shift+S` accelerators), `fs/promises` access, and native Open/Save dialogs. Menu items send IPC messages (`request-save`, `request-save-as`) to the renderer rather than acting directly.
- `preload.js` — exposes a narrow `window.electronAPI` over `contextBridge` (`openFile`, `saveFile`, `onFileOpened`, `onRequestSave`, `onRequestSaveAs`). `contextIsolation` on, `nodeIntegration` off, `sandbox` on — the renderer cannot reach Node or the filesystem directly.
- `renderer/index.html` — the entire application. One ~500-line inline `<script>`, no framework, no bundler. `const hasElectron = !!window.electronAPI` branches every file-I/O path between the Electron API and the browser fallback.

### Core model: `raw` + offset-tracked units

`raw` (a single string in `index.html`) is the whole document and the sole source of truth. The default content is the `SAMPLE` constant near the top of the script — there is no example file on disk.

Every render runs this pipeline:

1. `parseBlocks(raw)` — splits on blank lines into blocks, each carrying absolute `{start, end}` character offsets into `raw`. **A blank line is always a block boundary**, with no awareness of context.
2. `blockType(raw)` — classifies a block as `heading` / `code` / `quote` / `ul` / `ol` / `p` by regex on its first line (or all lines for lists).
3. `computeUnitsForBlock(block)` — breaks a block into *units*: whole-block for headings, code, and quotes; per-sentence (`splitSentences`, a regex on `.!?` + whitespace) for paragraphs and list items. Each unit keeps absolute `{start, end}` offsets into `raw`.
4. `renderBlockHtml` — emits the preview HTML, wrapping each unit in `<span class="unit" data-flat="N">` and pushing `{blockIdx, u, start, end}` into the flat array `flatUnits`.

### Selection → source span → edit

Clicks and selections in the preview are mapped back to `.unit` spans (`findUnitEl` → `closest('.unit')` → `data-flat`), and `flatUnits[flat].start/end` give the exact slice of `raw` to operate on:

- **Collapsed selection** (plain click) → *insert* mode: new text goes in after that unit. `\n\n` separator if the unit ends at a block boundary, otherwise a single space.
- **Range selection** → *edit* mode: the panel loads `raw.slice(minFlat.start, maxFlat.end)`; submitting replaces that span.
- **Ctrl/Cmd+click** → edit a single unit without a text selection.
- A 400ms debounce on `click` lets `dblclick` cancel it.

All edits go through `commitCurrentWithInfo()`, which does `raw = raw.slice(0, a) + newText + raw.slice(b)`, marks the doc dirty, and calls `render()` — a full reparse and re-render every time. There is no incremental DOM update and no undo stack.

### Dirty-panel conflict flow

If the edit panel holds unsaved text and you select something else, `showConflictModal` intercepts with Update/Discard/Cancel. Choosing Update applies the pending panel edit first, then **remaps the new target's offsets** through `remapOffset(off, {a, b, insertedLength})` so the follow-up selection still points at the right span after the string length changed.

## Known limitations (parser gotchas)

- **Sentence splitting** is `/[^.!?]*[.!?]+(?:\s+|$)/` — it splits inside "e.g.", "Dr.", etc.
- **Code fences containing blank lines** break, because the block splitter treats every blank line as a boundary.
- **Blockquotes** are a single unit, never split per sentence.
- Inline formatting (`**bold**`, links) that spans two sentences can be torn apart when only one sentence is edited.

## Conventions

- `.gitattributes` enforces LF line endings in the repo (`text=auto`); expect CRLF-conversion warnings on Windows checkouts — they are harmless.
