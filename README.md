# Bloodlust & Harmony — website + wiki

Landing page and generated game encyclopedia for Bloodlust & Harmony. Next.js
14 (App Router) on Vercel, data in Supabase, architecture per the Cyber Mouse
playbook.

## How data flows

The game repo is the source of truth. One-way sync:

1. In the UE editor console: `stormkeep.Export.Wiki`
2. In the game repo: `node Tools/WikiSync/sync.mjs --deploy`

Entity tables (races/buildings/units/upgrades/researches/shop_items/abilities/
statuses) are machine-written; never hand-edit them. Icons live in the public
`icons` Storage bucket. Wiki pages use ISR (`revalidate = 3600`) with
`dynamicParams = true`, so new entities appear without a deploy; the deploy
hook forces an immediate rebuild after a sync.

## Local dev

```
npm install
npm run dev     # http://localhost:3000
```

Copy `.env.local.example` to `.env.local` and fill in the Supabase values.
All reads are server-side with the service-role key; nothing secret ships to
the browser.

## Deploy (Vercel)

Import the GitHub repo, set env vars (`NEXT_PUBLIC_SUPABASE_URL`,
`SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET`,
`NEXT_PUBLIC_SITE_URL`), create a Deploy Hook and paste its URL into the game
repo's `Tools/WikiSync/.env` as `DEPLOY_HOOK_URL`. Env var changes need a
manual redeploy.

## Still to come

- Search across units/buildings/abilities
- `/admin` prose editor + `wiki_pages` routes (lore, guides, devlog)
- OG image (`public/og.png`, 1200x630) and real key art
- Vercel Cron keepalive route (Supabase free tier pauses after ~7 idle days)
