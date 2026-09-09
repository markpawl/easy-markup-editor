# Completed Work

> High-level record of finished work sets, newest first. When a work set in
> `CURRENT_WORK.md` is signed off, add an entry here — a few bullets on what
> changed, not a full changelog. Commit history has the detail.
>
> Head each entry with **date and time** of sign-off, 24-hour local time:
> `## YYYY-MM-DD HH:MM — <work set name>`.

---

## 2026-09-09 09:11 — Rename to "Markup View-Edit"

- Display name **Markup View-Edit**; `package.json` `name` `markup-view-edit`
  with standard `productName`; `package-lock.json` in sync. Repo and working
  directory stay `easy-markup-editor`.
- Updated `README.md` title, `renderer/index.html` `<title>`, and
  `docs/OVERVIEW.md`. Removed "patch" wording from the package description.
- Cleaned a stale `example.md` placeholder in the title bar markup
  (`renderer/index.html`).

## 2026-09-09 08:16 — Project setup

- Initialized local git repo (branch `main`); added `.gitignore` and
  `.gitattributes` (LF normalization).
- Published to GitHub: https://github.com/markpawl/easy-markup-editor (public).
- Removed the redundant `example.md`; the default document is the `SAMPLE`
  constant in `renderer/index.html`.
- Added `CLAUDE.md` (commands + architecture).
- Created `docs/`: `OVERVIEW.md`, `REQUIREMENTS.md`, `IDEAS.md`,
  `CURRENT_WORK.md`, `COMPLETED_WORK.md`.
