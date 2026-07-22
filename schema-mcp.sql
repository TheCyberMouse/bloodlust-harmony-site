-- Voice tables for the Bloodlust & Harmony MCP (game voice rules + phrases).
-- Run in the Supabase SQL Editor (read/write mode) after schema.sql.
-- Seeded fresh for the game - the consultancy's voice does not carry over.

create table if not exists voice_rules (
  id bigint generated always as identity primary key,
  rule_type text not null check (rule_type in ('always','prefer','avoid','never')),
  description text not null,
  created_at timestamptz not null default now()
);

create table if not exists voice_phrases (
  id bigint generated always as identity primary key,
  phrase text not null,
  usage_note text not null default '',
  created_at timestamptz not null default now()
);

alter table voice_rules enable row level security;
alter table voice_phrases enable row level security;

drop policy if exists "anon read" on voice_rules;
create policy "anon read" on voice_rules for select using (true);
drop policy if exists "anon read" on voice_phrases;
create policy "anon read" on voice_phrases for select using (true);

-- Seed the game's starting voice rules (edit freely via the MCP later).
insert into voice_rules (rule_type, description) values
  ('never',  'Use em dashes in site copy.'),
  ('never',  'Use AI-tell vocabulary: leverage, seamless, ecosystem, harness, unparalleled, exponentiate.'),
  ('avoid',  'Walls of text. Short paragraphs, concrete claims.'),
  ('always', 'Say what the game is early: a Castle Fight-style auto-battler RTS.'),
  ('always', 'Write mechanics-first, flavor second. Numbers come from the game data, not memory.'),
  ('prefer', 'Dark-fantasy editorial tone: confident, a little wry, never grimdark parody.');
