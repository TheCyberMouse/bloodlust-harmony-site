-- Bloodlust & Harmony wiki - Supabase schema.
-- Run in the Supabase SQL Editor (toggle the editor to read/write mode first,
-- or you get "cannot execute CREATE TABLE in a read-only transaction").
-- Safe to re-run: everything is IF NOT EXISTS / OR REPLACE.
--
-- Design (per the Cyber Mouse playbook):
--   * Entity tables are MACHINE-WRITTEN ONLY by Tools/WikiSync in the game
--     repo (one-way sync: game -> wiki). Never hand-edit them.
--   * wiki_pages holds hand-written prose (lore, guides, devlog) edited via
--     /admin or a future MCP server.
--   * RLS on everything: anon may SELECT (published-only for wiki_pages);
--     all writes require the service-role key.

-- ---------------------------------------------------------------------------
-- Entity tables (identical shape; jsonb payload = zero-migration growth)
-- ---------------------------------------------------------------------------
create table if not exists races (
  id text primary key,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  updated_by text not null default 'sync-script'
);
create table if not exists buildings (like races including all);
create table if not exists units (like races including all);
create table if not exists upgrades (like races including all);
create table if not exists researches (like races including all);
create table if not exists shop_items (like races including all);
create table if not exists abilities (like races including all);
create table if not exists statuses (like races including all);

-- One row per sync run: powers the "Data from game version X" footer and
-- gives an audit trail of pushes.
create table if not exists wiki_builds (
  id bigint generated always as identity primary key,
  game_version text not null default '',
  exported_at timestamptz,
  pushed_at timestamptz not null default now(),
  counts jsonb not null default '{}'::jsonb
);

-- Hand-written prose pages (lore / guides / devlog). status: draft|published.
create table if not exists wiki_pages (
  slug text primary key,
  title text not null,
  category text not null default 'guide',
  body text not null default '',
  status text not null default 'draft',
  updated_at timestamptz not null default now(),
  updated_by text not null default 'manual'
);

-- ---------------------------------------------------------------------------
-- Row Level Security: anon read, service-role write
-- ---------------------------------------------------------------------------
alter table races      enable row level security;
alter table buildings  enable row level security;
alter table units      enable row level security;
alter table upgrades   enable row level security;
alter table researches enable row level security;
alter table shop_items enable row level security;
alter table abilities  enable row level security;
alter table statuses   enable row level security;
alter table wiki_builds enable row level security;
alter table wiki_pages  enable row level security;

do $$
declare t text;
begin
  foreach t in array array['races','buildings','units','upgrades','researches',
                           'shop_items','abilities','statuses','wiki_builds']
  loop
    execute format('drop policy if exists "anon read" on %I', t);
    execute format('create policy "anon read" on %I for select using (true)', t);
  end loop;
end $$;

drop policy if exists "anon read published" on wiki_pages;
create policy "anon read published" on wiki_pages
  for select using (status = 'published');

-- No insert/update/delete policies: only the service-role key (which bypasses
-- RLS) can write. The sync script, /admin routes, and any MCP server all use
-- the service-role key server-side.
