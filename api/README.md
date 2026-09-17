# Goku Lists API

Elysia server on Node. See the [repo README](../README.md) for setup, environment variables, and commands.

Copy [`.env.example`](./.env.example) to `.env.local` and fill in secrets. Mise loads `.env.local` when you work in this directory.

```bash
pnpm install
pnpm dev
```

Open http://localhost:3000/ to confirm the server is running.

Tunnel with ngrok (port must match `PORT`, default 3000):

```bash
pnpm ngrok
```
