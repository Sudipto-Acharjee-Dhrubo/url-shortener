# Snip - URL Shortener

Next.js app: shorten links (base62 codes or custom alias), optional expiry, click analytics, QR codes, Redis-cached redirects.

## Run locally
1. `npm install`
2. Copy `.env.example` to `.env.local` and fill in `DATABASE_URL` (Neon). Redis keys are optional.
3. Run `schema.sql` once in the Neon SQL Editor.
4. `npm run dev` and open http://localhost:3000

## Deploy
Push to GitHub, import the repo in Vercel, add the same env vars, deploy.
