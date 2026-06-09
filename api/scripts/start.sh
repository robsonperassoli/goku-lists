#!/usr/bin/env bash
set -euo pipefail

bun run db:migrate
exec bun src/index.ts
