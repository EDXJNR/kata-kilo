# Kata Kilo

**Healthier you. Lighter you.** — A fitness and health PWA with a tactical HUD-style UI (emerald accent, mobile-first).

Monorepo layout:

- **`/`** — Vite + React + TypeScript frontend (Cloudflare Pages)
- **`worker/`** — Cloudflare Worker API (Supabase backend)
- **`supabase/migrations/`** — SQL migrations for the database

## Stack

- Vite, React 19, TypeScript, React Router
- Tailwind CSS, Recharts, Leaflet
- Supabase (auth + Postgres)
- Cloudflare Workers & Pages

## Getting started

```bash
cp .env.example .env
# Set VITE_API_URL to your Worker URL (local or deployed)

npm install
npm run dev
```

For frontend + API together:

```bash
cp worker/.dev.vars.example worker/.dev.vars
# Fill Supabase keys; set ALLOWED_ORIGIN=http://localhost:5173

npm run dev:all
```

- App: http://localhost:5173  
- API: http://localhost:8787  

## Environment

| Variable | Required | Description |
|----------|----------|-------------|
| `VITE_API_URL` | Yes | Worker URL (e.g. `https://katakilo.example.workers.dev`) |

Worker secrets (Cloudflare dashboard or `wrangler secret put`):

- `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
- `ALLOWED_ORIGIN` — your Pages URL for CORS

See [`docs/API.md`](docs/API.md) for the HTTP contract.

## Deploy

**Worker**

```bash
cd worker && npm run deploy
```

**Pages**

```bash
npm run deploy:pages
```

After Pages deploy, set Worker `ALLOWED_ORIGIN` to your site origin (e.g. `https://kata-kilo.pages.dev`).

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Frontend only |
| `npm run dev:all` | Frontend + Worker |
| `npm run build` | Production build |
| `npm run deploy:pages` | Build + deploy to Cloudflare Pages |
| `npm run worker:deploy` | Deploy Worker |

## License

Private — all rights reserved unless otherwise noted by the repository owner.
