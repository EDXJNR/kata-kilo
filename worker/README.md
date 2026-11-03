# KATA KILO Worker (Wrangler)

Cloudflare Worker API backed by Supabase. Deploy with Wrangler, manage secrets in Cloudflare.

## 1. Install & log in

```bash
cd worker
npm install
npx wrangler login
```

## 2. Local secrets

```bash
cp .dev.vars.example .dev.vars
# Fill in your Supabase URL + keys
```

## 3. Run locally

```bash
npm run dev
# → http://127.0.0.1:8787/health
```

## 4. Production secrets (Cloudflare vault)

Run once per secret (Wrangler stores them encrypted in Cloudflare):

```bash
npx wrangler secret put SUPABASE_URL
npx wrangler secret put SUPABASE_ANON_KEY
npx wrangler secret put SUPABASE_SERVICE_ROLE_KEY
npx wrangler secret put ALLOWED_ORIGIN
```

For `ALLOWED_ORIGIN`, use comma-separated origins, e.g.:
`http://localhost:5173,https://your-app.pages.dev`

## 5. Deploy

```bash
npm run deploy
```

After deploy, verify in browser:

```
https://katakilo.<your-subdomain>.workers.dev/health
```

Or open **Cloudflare Dashboard → Workers & Pages → katakilo** to see deployments, logs, and secrets.

## 6. Supabase schema

Run `../supabase/schema.sql` in Supabase SQL Editor before testing auth/data routes.

## Root shortcuts

From project root:

```bash
npm run worker:dev
npm run worker:deploy
```

## Troubleshooting IDE errors

If you see hundreds of TypeScript errors in a file called `index.js` with **20,000+ lines** (mentions `PostgrestTransformBuilder`, `window`, `document`, etc.), that is **not your source code** — it is the bundled output after Cloudflare inlined `@supabase/supabase-js`.

**Do not edit that file.** Your real source is:

```
worker/src/index.js   (~470 lines)
```

Deploy with Wrangler — it bundles Supabase for you automatically:

```bash
cd worker
npm install
npm run deploy
```

Never paste the bundled megabyte file into the Cloudflare dashboard editor. Only edit `worker/src/index.js` locally, then deploy.
