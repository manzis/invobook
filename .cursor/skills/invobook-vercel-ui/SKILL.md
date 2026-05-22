---
name: invobook-vercel-ui
description: Builds and converts Invobook frontend using the Vercel design system in Design/vercel — DESIGN.md, preview.html, preview-dark.html, tokens.css, and ds-* component classes. Use when creating new pages, restyling dashboard/invoices/settings/login, converting legacy blue Tailwind UI, or when the user mentions Vercel design, design tokens, or Design folder.
---

# Invobook Vercel UI

## Source files (always in this order)

| Priority | File | Purpose |
|----------|------|---------|
| 1 | `Design/vercel/preview.html` | Exact light-mode CSS (canonical) |
| 2 | `Design/vercel/preview-dark.html` | Exact dark-mode CSS |
| 3 | `Design/vercel/tokens.css` | `--ds-*` variables used in app |
| 4 | `Design/vercel/DESIGN.md` | Principles, scale, do/don't |
| 5 | `Design/vercel/COMPONENT-MAP.md` | HTML class → `ds-*` mapping |
| 6 | `src/styles/globals.css` | Implemented `ds-*` utilities |

## Workflow: new page

1. **Read** `preview.html` sections that match the page (nav, hero, cards, forms, tables).
2. **Read** `COMPONENT-MAP.md` for class names.
3. **Scaffold** under `src/pages/` or `src/components/` using:
   - `ds-section` + `ds-section-title` for page header
   - `ds-card` for panels/stat blocks
   - `ds-btn-dark` / `ds-btn-ghost` for actions
   - `ds-input` + `ds-form-label` for forms
4. **Wire** existing APIs and state — design only unless user asks for logic changes.
5. **Skip** `bg-blue-600`, `rounded-xl border shadow-sm` legacy patterns.

## Workflow: convert existing page

1. Open the target file (e.g. `src/pages/dashboard.jsx`, `src/components/Sidebar/sidebar.jsx`).
2. List UI regions: header, sidebar, cards, table, buttons, badges.
3. Map each region using `COMPONENT-MAP.md` + matching `preview.html` block.
4. Replace classNames and wrapper markup; **keep** `fetch`, `useState`, `useRouter`, props.
5. Run a quick pass: all interactive elements have focus ring (`ds-input:focus` or `focus-visible:outline`).

## Typography quick reference (from preview)

| Role | Classes |
|------|---------|
| Page hero | `ds-display-hero` |
| Section title | `ds-section-title` |
| Card title | `ds-card-title` |
| Body | `text-base font-normal text-[var(--ds-gray-600)]` or `ds-body-large` |
| Mono label | `ds-mono-label` |
| Nav link | `ds-nav-link` / `ds-nav-link-active` |

## Shadows (copy exactly)

```css
/* Ring only */
box-shadow: var(--ds-shadow-ring);
/* Card default */
box-shadow: var(--ds-shadow-card);
/* Card hover / featured */
box-shadow: var(--ds-shadow-card-full);
```

Use `ds-card`, not Tailwind `border` + `shadow-sm`.

## Preview-driven verification

Before finishing, confirm:

- [ ] Colors match swatches in `preview.html` #colors
- [ ] Buttons match #buttons (dark + ghost + pill)
- [ ] Cards match #cards (shadow stack, 8px radius)
- [ ] Forms match #forms (shadow-border inputs, blue focus)
- [ ] Spacing uses 8px scale (8, 12, 16, 32, 64 — avoid 20/24 unless necessary)

## App layout notes

- **Auth pages** (`login.jsx`): no sidebar; hero + `ds-btn-dark` pattern from preview `.hero`.
- **App shell** (`layout.js`, `sidebar.jsx`): white sidebar, `ds-shadow-ring` separator, not gray-50 + blue-600.
- **PDF templates** (`src/components/pdf/`): out of scope unless user asks — different output medium.

## Do not use

- `ui-ux-pro-max` for Invobook restyles (conflicts with Vercel tokens) unless user explicitly wants a new palette.
- Arbitrary Tailwind colors (`bg-[#...]`) not in `tokens.css`.
- Traditional card borders instead of shadow-as-border.

## Example prompt to user

"Restyle dashboard using invobook-vercel-ui" → follow convert workflow on `dashboard.jsx` + `Sidebar/sidebar.jsx` + shared stat/table components.
