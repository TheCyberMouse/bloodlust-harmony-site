// =============================================================================
// Wiki data access. Entity tables are machine-written by the game repo's
// Tools/WikiSync (one-way: game -> wiki); each row is { id, data jsonb }.
// All reads are server-side (ISR). Slugs derive from the DA asset name:
// "DA_Footman_Spawner" -> "footman_spawner".
// =============================================================================

import { supabaseServer } from "@/lib/supabase";

// Loose typing on purpose: the jsonb payload grows with the game's DataAssets
// and the site should not need a migration to show a new field.
export type WikiRecord = {
  id: string;
  key: string;
  displayName?: string;
  description?: string;
  icon?: string;
  tooltip?: {
    title?: string;
    subtitle?: string;
    statsLine?: string;
    body?: string;
    flavor?: string;
    gold?: number;
    lumber?: number;
    stardust?: number;
    food?: number;
    icon?: string;
  };
  [k: string]: unknown;
};

export type WikiMeta = {
  gameName?: string;
  gameVersion?: string;
  exportedAt?: string;
  attackTypeIcons?: Record<string, string>;
  armorTypeIcons?: Record<string, string>;
  damageElementIcons?: Record<string, string>;
  immunityIcons?: Record<string, string>;
  playerColors?: string[];
  richTextTags?: string[];
};

export function slugOf(key: string): string {
  return key.replace(/^DA_/i, "").toLowerCase();
}

/** Faction URLs use the faction's public name ("grovewardens"), not the DA
 *  key ("race_woodelf"). */
export function raceSlug(race: WikiRecord): string {
  return (race.displayName || race.key)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/** Race lookup accepting the display-name slug, with the legacy DA-key slug
 *  as a fallback so old links keep resolving. */
export async function findRaceBySlug(slug: string): Promise<WikiRecord | null> {
  const races = await listRaces();
  return (
    races.find(
      (r) => raceSlug(r) === slug || (r.key && slugOf(r.key) === slug),
    ) ?? null
  );
}

async function listTable(table: string): Promise<WikiRecord[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase.from(table).select("data").range(0, 9999);
  if (error) {
    console.error(`[wiki] list ${table} failed:`, error.message);
    return [];
  }
  return (data ?? []).map((r: { data: WikiRecord }) => r.data);
}

export const listRaces = () => listTable("races");
export const listUnits = () => listTable("units");
export const listBuildings = () => listTable("buildings");
export const listUpgrades = () => listTable("upgrades");
export const listResearches = () => listTable("researches");
export const listShopItems = () => listTable("shop_items");
export const listAbilities = () => listTable("abilities");
export const listStatuses = () => listTable("statuses");

export async function findBySlug(
  table: string,
  slug: string,
): Promise<WikiRecord | null> {
  const all = await listTable(table);
  return all.find((r) => r.key && slugOf(r.key) === slug) ?? null;
}

/** Latest sync stamp: game version + export date for the footer. */
export async function getBuildStamp(): Promise<{
  version: string;
  exportedAt: string | null;
}> {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("wiki_builds")
    .select("game_version, exported_at")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  return {
    version: data?.game_version || "",
    exportedAt: data?.exported_at || null,
  };
}

export type DamageMatrix = {
  attackTypes: string[];
  armorTypes: string[];
  rows: Record<string, Record<string, number>>;
};

/** The export's meta.json rides inside the latest wiki_builds row
 *  (counts.meta, pushed by Tools/WikiSync): tag icon maps, palette, and the
 *  attack-vs-armor damage matrix. Null until a sync with meta has run. */
export async function getWikiMeta(): Promise<WikiMeta & {
  damageMatrix?: DamageMatrix;
}> {
  const supabase = supabaseServer();
  const { data } = await supabase
    .from("wiki_builds")
    .select("counts")
    .order("id", { ascending: false })
    .limit(1)
    .maybeSingle();
  const counts = (data?.counts ?? {}) as { meta?: WikiMeta };
  return (counts.meta ?? {}) as WikiMeta & { damageMatrix?: DamageMatrix };
}

/** Summoned units per faction. These are created by abilities in battle
 *  (raised skeletons, totems, animal companions...), so the race -> building
 *  -> unit walk can't reach them; the game data doesn't record which faction
 *  a summon belongs to. Curated by hand (2026-07-22) from each faction's
 *  unit content folder. */
const FACTION_SUMMONS: Record<string, string[]> = {
  DA_Race_Human: ["DA_Purity_Flowers"],
  DA_Race_WoodElf: [
    "DA_Crow",
    "DA_Fox",
    "DA_FrostBear",
    "DA_WarBear",
    "DA_Wolf",
  ],
  DA_Race_Undead: [
    "DA_Skeleton_Basic",
    "DA_UndeadMage_Raised",
    "DA_Vampire_Lesser",
  ],
  DA_Race_Orc: [
    "DA_Totem_Cleansing",
    "DA_Totem_Earth",
    "DA_Totem_Flame",
    "DA_Totem_Healing",
    "DA_Totem_Ice",
    "DA_Totem_Storm",
  ],
};

/** Units that exist in the game data but are still in development. Shown in
 *  their own "In Works" subsection; kept out of the home page strip. */
const FACTION_IN_WORKS: Record<string, string[]> = {
  DA_Race_Orc: ["DA_OrcWarlock"],
};

/** Units grouped per faction, derived the same way the game reaches them:
 *  race -> buildings (+ upgrade targets, transitively) -> spawned units,
 *  plus the curated summons list. */
export async function unitsByFaction(): Promise<
  Array<{
    race: WikiRecord;
    units: WikiRecord[];
    unitTrees: WikiRecord[][];
    summons: WikiRecord[];
    inWorks: WikiRecord[];
  }>
> {
  const [races, buildings, upgrades, units] = await Promise.all([
    listRaces(),
    listBuildings(),
    listUpgrades(),
    listUnits(),
  ]);
  const buildingMap = new Map(buildings.map((b) => [b.id, b]));
  const upgradeMap = new Map(upgrades.map((u) => [u.id, u]));
  const unitMap = new Map(units.map((u) => [u.id, u]));
  const unitByKey = new Map(units.map((u) => [u.key, u]));

  return races.map((race) => {
    const { mainTrees, specialTrees, castleTree } = raceBuildingTrees(
      race,
      buildingMap,
      upgradeMap,
    );

    // One unit tree per building tree: the units its buildings train, in
    // upgrade order. A unit trained by two trees lands in the first.
    const seenUnits = new Set<string>();
    const unitTrees = [...mainTrees, ...specialTrees, castleTree]
      .map((tree) => {
        const treeUnits: WikiRecord[] = [];
        for (const b of tree) {
          const id = b.spawnedUnit as string | undefined;
          if (!id || seenUnits.has(id)) continue;
          seenUnits.add(id);
          const u = unitMap.get(id);
          if (u) treeUnits.push(u);
        }
        return treeUnits;
      })
      .filter((t) => t.length > 0);

    return {
      race,
      units: unitTrees.flat(),
      unitTrees,
      summons: (FACTION_SUMMONS[race.key] || [])
        .map((key) => unitByKey.get(key))
        .filter((u): u is WikiRecord => Boolean(u)),
      inWorks: (FACTION_IN_WORKS[race.key] || [])
        .map((key) => unitByKey.get(key))
        .filter((u): u is WikiRecord => Boolean(u)),
    };
  });
}

/** Builds this race's building trees: one array per root building holding
 *  the root plus its transitive upgrade targets, in upgrade order. `seen` is
 *  shared across roots so a building reachable from two roots lands in the
 *  first tree only. */
function raceBuildingTrees(
  race: WikiRecord,
  buildingMap: Map<string, WikiRecord>,
  upgradeMap: Map<string, WikiRecord>,
): {
  mainTrees: WikiRecord[][];
  specialTrees: WikiRecord[][];
  castleTree: WikiRecord[];
} {
  const seen = new Set<string>();

  const treeOf = (rootId: string | undefined): WikiRecord[] => {
    const out: WikiRecord[] = [];
    const visit = (buildingId: string | undefined) => {
      if (!buildingId || seen.has(buildingId)) return;
      seen.add(buildingId);
      const b = buildingMap.get(buildingId);
      if (!b) return;
      out.push(b);
      for (const upgId of (b.upgrades as string[]) || []) {
        const upg = upgradeMap.get(upgId);
        if (upg) visit(upg.targetBuilding as string | undefined);
      }
    };
    visit(rootId);
    return out;
  };

  const mainTrees = ((race.buildings as string[]) || [])
    .map((id) => treeOf(id))
    .filter((t) => t.length > 0);
  const specialTrees = ((race.specialBuildings as string[]) || [])
    .map((id) => treeOf(id))
    .filter((t) => t.length > 0);
  const castleTree = treeOf(race.castle as string | undefined);
  return { mainTrees, specialTrees, castleTree };
}

/** Buildings grouped per faction as upgrade trees, split the same way the
 *  faction pages split them: buildable roster, special buildings, castle. */
export async function buildingsByFaction(): Promise<
  Array<{
    race: WikiRecord;
    mainTrees: WikiRecord[][];
    specialTrees: WikiRecord[][];
    castleTree: WikiRecord[];
  }>
> {
  const [races, buildings, upgrades] = await Promise.all([
    listRaces(),
    listBuildings(),
    listUpgrades(),
  ]);
  const buildingMap = new Map(buildings.map((b) => [b.id, b]));
  const upgradeMap = new Map(upgrades.map((u) => [u.id, u]));

  return races.map((race) => ({
    race,
    ...raceBuildingTrees(race, buildingMap, upgradeMap),
  }));
}

// ---------------------------------------------------------------------------
// Prose pages (wiki_pages): hand-written lore / guides / devlog, edited via
// the MCP or /admin. Published rows only — drafts never render.
// ---------------------------------------------------------------------------

export type ProsePage = {
  slug: string;
  title: string;
  category: string;
  body: string;
  updated_at: string;
};

export async function listProsePages(category: string): Promise<ProsePage[]> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("wiki_pages")
    .select("slug, title, category, body, updated_at")
    .eq("category", category)
    .eq("status", "published")
    .order("updated_at", { ascending: false });
  if (error) {
    console.error(`[wiki] listProsePages(${category}) failed:`, error.message);
    return [];
  }
  return (data ?? []) as ProsePage[];
}

export async function getProsePage(slug: string): Promise<ProsePage | null> {
  const supabase = supabaseServer();
  const { data, error } = await supabase
    .from("wiki_pages")
    .select("slug, title, category, body, updated_at")
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();
  if (error) {
    console.error(`[wiki] getProsePage(${slug}) failed:`, error.message);
    return null;
  }
  return (data as ProsePage | null) ?? null;
}

export function tagLeaf(tag: string | undefined): string {
  if (!tag) return "";
  const parts = tag.split(".");
  return parts[parts.length - 1] || tag;
}

/** Attack speed shown to 2 decimals; derived DPS = damage x attack speed. */
export function fmtAttackSpeed(v: number | undefined): string {
  return v === undefined ? "" : v.toFixed(2);
}

export function dpsOf(stats: Record<string, number>): number | null {
  const dmg = stats.AttackDamage;
  const spd = stats.AttackSpeed;
  if (dmg === undefined || spd === undefined) return null;
  return Math.round(dmg * spd * 10) / 10;
}

/** Color classes for a damage-matrix multiplier (shared by the matrix page
 *  and the attack/armor hover tooltips). */
export function matrixTone(mult: number): string {
  if (mult >= 1.5) return "bg-green-900/50 text-green-300 font-semibold";
  if (mult > 1.0) return "bg-green-900/25 text-green-400";
  if (mult === 1.0) return "text-bh-mute";
  if (mult >= 0.6) return "bg-red-900/25 text-red-400";
  return "bg-red-900/50 text-red-300 font-semibold";
}

/** Human labels for the canonical attribute names used in stats objects. */
export const STAT_LABELS: Record<string, string> = {
  MaxHealth: "HP",
  HealthRegen: "HP Regen",
  MaxMana: "Mana",
  ManaRegen: "Mana Regen",
  MaxShield: "Shield",
  ShieldRegen: "Shield Regen",
  AttackDamage: "Damage",
  AttackSpeed: "Attack Speed",
  AttackRange: "Range",
  Armor: "Armor",
  MagicResist: "Magic Resist",
  MoveSpeed: "Move Speed",
  BountyPoints: "Bounty",
  BountyStormdust: "Stormdust",
};

export const STAT_ORDER = Object.keys(STAT_LABELS);
