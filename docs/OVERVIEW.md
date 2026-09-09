# Overview

> Orientation for a new reader — the "what and why" of the project. Stable
> background, not a status doc. Update only on a real change of purpose or
> approach. For current status see `CURRENT_WORK.md`; for the plan see
> `IDEAS.md`.

## What it is

Markup View-Edit (package `markup-view-edit`; the GitHub repo and working
directory are named `easy-markup-editor`) is a small desktop markdown editor
built on Electron. Its distinguishing idea: **the rendered preview is the only
editing surface.** There is no raw-source pane.

## The core interaction

- **Select** a sentence, heading, or list item in the preview. A panel on the
  right loads exactly that span of the underlying markdown source. Edit it,
  submit, and the change is spliced back into the document.
- **Click** without selecting (just place the cursor). The panel switches to
  insert mode — whatever you type is inserted at that point, touching nothing
  else.

The goal is to let someone stay in the rendered reading view while still making
precise, source-level edits, without the context switch of a split-pane editor.

## How it's built

An Electron shell (`main.js`, `preload.js`) wraps a single-file renderer
(`renderer/index.html`) that is the whole editor — no framework, no bundler,
and it also runs standalone in a browser. The document is one string; every
edit re-parses it into offset-tracked "units" so a preview selection maps back
to the exact source span.

See `ARCHITECTURE.md` for the design in depth, `REQUIREMENTS.md` for intended
behavior, and `IDEAS.md` for the roadmap.
