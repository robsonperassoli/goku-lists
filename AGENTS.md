# Goku Lists — agent notes

## Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/) with a **short subject** and an optional **longer body**.

### Subject (first line)

- One line, ~72 characters or fewer.
- Format: `<type>(<scope>): <summary>`
- **Types:** `feat`, `fix`, `perf`, `refactor`, `chore`, `docs`, `test`, `build`, `ci`
- **Scope:** optional but helpful — e.g. `mobile`, `api`, `sync`
- Imperative mood: “add list filter”, not “added list filter”.
- No period at the end of the subject.

### Body (optional)

- Blank line after the subject, then paragraphs with context, rationale, or breaking changes.
- Wrap at ~72 characters when it helps readability.

### Examples

```
feat(mobile): wire empty state to create list sheet
```

```
fix(api): reject sync payloads with unknown list ids

The server now returns 400 instead of inserting orphan tasks.
```

```
chore(mobile): remove Expo starter template

Drop explore tab, unused starter components and assets, and simplify splash branding.
```

### Do not

- Write long subjects; put detail in the body.
- Add `Co-authored-by: Cursor`, `Made-with: Cursor`, or other Cursor attribution trailers.

## Subprojects

Package-specific rules live in each subfolder when needed:

- **mobile/** — [mobile/AGENTS.md](mobile/AGENTS.md) (pnpm, lint, sync queue)
- **api/** — Node/Hono; run commands from `api/` with `pnpm`. Use Temporal (`@js-temporal/polyfill`, helpers in `lib/dates.ts`) for date/time logic—not plain `Date`. File-level lint is `pnpm check` (oxfmt + oxlint). Graph-level analysis is `pnpm analyze` (Fallow: unused files/exports/deps, duplication, complexity). Do not treat Fallow as a replacement for oxlint.

Tool versions (Node, pnpm) are pinned in [mise.toml](mise.toml). Run `mise install` from the repo root. API env vars are loaded from `api/.env.local` via [api/mise.toml](api/mise.toml) (see `api/.env.example`).

