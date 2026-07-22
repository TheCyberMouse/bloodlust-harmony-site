# Cyber Mouse MCP

The custom Model Context Protocol (MCP) connector that lets Claude (via Cowork) edit the Cyber Mouse website's content through conversation. Companion to the Next.js site one directory up.

## How it works

- Single Next.js 14 App Router project, one route: `POST /api/mcp`.
- Speaks JSON-RPC 2.0 — the wire format MCP uses.
- Stateless: every request is independent. Plays well with Vercel serverless.
- Bearer-token auth: requires `Authorization: Bearer $MCP_SHARED_SECRET` on every call.
- Tools wrap Supabase reads/writes and a few external APIs (Vercel deploy hook, Replicate for image gen).

## Tool surface

Grouped by domain — full list with descriptions is in `lib/tools/`.

- **Pages:** `list_pages`, `get_page_content`, `update_page_content`, `delete_page_content`
- **Blog:** `list_blog_posts`, `get_blog_post`, `add_blog_post`, `update_blog_post`
- **Voice:** `list_voice_rules`, `add_voice_rule`, `list_voice_phrases`, `add_voice_phrase`
- **Images:** `generate_images`, `edit_image`, `upload_image`, `select_image` *(stubbed until `REPLICATE_API_TOKEN` is set)*
- **CRM-lite:** `list_prospects`, `add_prospect`, `update_prospect`, `log_outreach`, `list_outreach`, `update_outreach`
- **Deploy:** `trigger_deploy`

## Local dev

```bash
cd mcp
npm install
cp .env.local.example .env.local
# fill in SUPABASE_SERVICE_ROLE_KEY, MCP_SHARED_SECRET, VERCEL_DEPLOY_HOOK
npm run dev   # serves on http://localhost:3001
```

Quick smoke test:

```bash
curl -X POST http://localhost:3001/api/mcp \
  -H "Authorization: Bearer $MCP_SHARED_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'
```

## Deploy to Vercel

This subdirectory deploys as its OWN Vercel project (separate from the website).

1. https://vercel.com/new → import the same `Cyber-Mouse-Website` GitHub repo.
2. **Root Directory**: set to `mcp` (this is the critical step).
3. **Framework Preset**: Next.js (auto-detected).
4. Env vars: copy all five from `.env.local` (Supabase URL, service role, bucket name, shared secret, deploy hook). Leave `REPLICATE_API_TOKEN` blank for now.
5. Deploy. You'll get a URL like `cybermouse-mcp.vercel.app`.

## Register with Cowork

In Cowork → Settings → Connectors → Add custom MCP:

- **URL:** `https://<your-mcp-url>/api/mcp`
- **Headers:** `Authorization: Bearer <your MCP_SHARED_SECRET>`

After connection, the tools above show up in Claude's tool palette prefixed by the connector ID.
