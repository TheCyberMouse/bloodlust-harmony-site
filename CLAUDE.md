# Bloodlust & Harmony site — Claude project conventions

Next.js 14 (App Router) on Vercel, data in Supabase, one-way synced from the
game repo (`C:\Unreal\TopDown26`). See `README.md` for the data flow and local
dev setup.

## Faction display order

**Wherever factions are listed, they go in this order. Always.**

1. Exemplaris
2. Arcanists
3. Grovewardens
4. Graveborn
5. Warclans
6. Ironoath
7. Nightspun
8. Voidwrought

This list is the authority — **do not derive the order from anything else**:

- **Not `raceIndex`.** It disagrees: the export has Nightspun at 5 and Ironoath
  at 6, which is the reverse of the order above. Everything else happens to
  line up, which makes `raceIndex` look correct right up until it isn't.
- **Not alphabetical**, and not whatever Supabase returns. `listRaces()`
  (`lib/wiki.ts`) issues no `ORDER BY`, so row order is unspecified and can
  change as rows are updated. Any page that renders races in query order is
  displaying an accident.

For what it's worth, the order currently reads as "the five playable factions,
then the three still in development" — but that is an observation, not the
rule. When a faction ships, it keeps its place in the list above; it does not
get promoted.

**Applying it:** sort presentation-side, by display name against this list. The
entity tables (`races`, `units`, `buildings`, …) are machine-written by the
game's export — never hand-edit or reorder rows there to influence display.

A faction not on the list sorts to the end, ordered by display name, and should
never be silently dropped — a new faction appearing at the bottom is a visible
prompt to add it here.

Places factions are listed today: the landing page (`app/page.tsx`), the wiki
index (`app/wiki/page.tsx`), `app/wiki/factions/`, `app/wiki/researches/`,
`app/wiki/shop/`, the sitemap, and the OG image routes.
