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

- **mobile/** — [mobile/AGENTS.md](mobile/AGENTS.md) (Bun, lint, sync queue)
- **api/** — Bun/Elysia; run commands from `api/` with `bun`. Use Temporal (`@js-temporal/polyfill`, helpers in `lib/dates.ts`) for date/time logic—not plain `Date`.

