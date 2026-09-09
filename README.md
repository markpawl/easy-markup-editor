# Markup View-Edit

A markdown editor where the preview is the primary surface. 
Inserts and Updates are added through a right-panel edit box.
It lets you read rendered markdown while not losing the ability to edit.

How It Works:

- **Select a sentence, list item, or heading** in the preview and a scoped panel on
  the right loads just that text. Edit it and hit Submit to write it back into the
  file.
- **Click to place your cursor** (no selection) and the panel switches to insert
  mode — whatever you type gets inserted at that point without touching anything
  else.

## Running it

You'll need [Node.js](https://nodejs.org) installed (18+ is fine).

```bash
cd easy-markup-editor
npm install
npm start
```

`npm install` pulls down Electron itself (a few hundred MB the first time —
that's normal). After that, `npm start` launches the app.

## File menu

- **Open…** (`Cmd/Ctrl+O`) — pick a `.md` file from disk.
- **Save** (`Cmd/Ctrl+S`) — writes back to the currently open file, or prompts
  for a location if none is open yet.
- **Save As…** (`Cmd/Ctrl+Shift+S`) — always prompts for a new location.

The title bar shows the current filename and a small dot when there are
unsaved changes.

## How it works

`main.js` is Electron's main process — it owns the native window, menu, and
file-system access (`fs/promises`), and shows native Open/Save dialogs.
`preload.js` exposes a narrow, safe API (`window.electronAPI`) to the page
via `contextBridge`, with `nodeIntegration` off and `contextIsolation` on, so
the renderer can't reach Node or the filesystem directly. `renderer/index.html`
is the actual editor: it parses the markdown into blocks (headings, paragraphs,
lists, quotes, code fences) and then into sentence-level units within each
block, tracking the exact character offsets of each unit in the source text.
Selecting text in the rendered preview maps back to those offsets so edits and
inserts touch only the span you meant.

## Known limitations

- Sentence splitting is a simple regex (splits on `.`/`!`/`?` followed by
  whitespace) — it doesn't know about abbreviations like "e.g." or "Dr.", so
  those will occasionally split where they shouldn't.
- Inline formatting (`**bold**`, links, etc.) that spans more than one
  sentence can get separated if you edit just one of those sentences.
- Code fences containing blank lines aren't parsed correctly yet — the block
  splitter treats a blank line as a block boundary regardless of context.
- Blockquotes are still treated as a single unit rather than split into
  sentences.

## Also included

The app runs fine outside Electron too — open `renderer/index.html` directly
in a browser. Open falls back to a file picker and Save falls back to a
regular download, so you can keep testing changes without relaunching
Electron each time.

mpawlowski 20260908
