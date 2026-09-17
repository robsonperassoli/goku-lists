#!/usr/bin/env bash
set -euo pipefail

pnpm run db:migrate
exec ./node_modules/.bin/tsx src/index.ts
