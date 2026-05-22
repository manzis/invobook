# Vercel Inspired Design System

[DESIGN.md](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/vercel/DESIGN.md) extracted from the public [vercel](https://vercel.com/) website. This is not the official design system. Colors, fonts, and spacing may not be 100% accurate. But it's a good starting point for building something similar.

## Files

| File | Description |
|------|-------------|
| `DESIGN.md` | Complete design system documentation (9 sections) |
| `preview.html` | Interactive design token catalog (light) |
| `preview-dark.html` | Interactive design token catalog (dark) |


Use [DESIGN.md](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/vercel/DESIGN.md) to use as a reference for AI agents (Claude, Cursor, Stitch) to generate UI that looks like the Vercel design language.

## Cursor / Invobook integration

| Asset | Role |
|-------|------|
| `DESIGN.md` | Design rationale and token documentation |
| `preview.html` | **Light mode — canonical UI reference** (open in browser) |
| `preview-dark.html` | Dark mode reference |
| `tokens.css` | `--ds-*` CSS variables (imported by `src/styles/globals.css`) |
| `COMPONENT-MAP.md` | Maps preview HTML classes → `ds-*` React utilities |

**Cursor rule:** `.cursor/rules/vercel-design.mdc` (applies when editing `src/**` UI files)

**Cursor skill:** `.cursor/skills/invobook-vercel-ui/SKILL.md` — invoke with *"use invobook-vercel-ui to restyle dashboard"*

**App classes:** `ds-btn-dark`, `ds-card`, `ds-input`, etc. in `src/styles/globals.css`

## Preview

A sample landing page built with DESIGN.md. It shows the actual colors, typography, buttons, cards, spacing, and elevation, all in one page.

### Dark Mode
![Vercel Design System — Dark Mode](https://pub-2e4ecbcbc9b24e7b93f1a6ab5b2bc71f.r2.dev/designs/vercel/preview-dark-screenshot.png)

### Light Mode
![Vercel Design System — Light Mode](https://pub-2e4ecbcbc9b24e7b93f1a6ab5b2bc71f.r2.dev/designs/vercel/preview-screenshot.png)
