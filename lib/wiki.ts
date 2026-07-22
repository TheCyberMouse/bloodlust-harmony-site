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

/** Units grouped per faction, derived the same way the game reaches them:
 *  race -> buildings (+ upgrade targets, transitively) -> spawned units. */
export async function unitsByFaction(): Promise<
  Array<{ race: WikiRecord; units: WikiRecord[] }>
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

  return races.map((race) => {
    const seenBuildings = new Set<string>();
    const unitIds: string[] = [];
    const seenUnits = new Set<string>();

    const visit = (buildingId: string | undefined) => {
      if (!buildingId || seenBuildings.has(buildingId)) return;
      seenBuildings.add(buildingId);
      const b = buildingMap.get(buildingId);
      if (!b) return;
      const spawned = b.spawnedUnit as string | undefined;
      if (spawned && !seenUnits.has(spawned) && unitMap.has(spawned)) {
        seenUnits.add(spawned);
        unitIds.push(spawned);
      }
      for (const upgId of (b.upgrades as string[]) || []) {
        const upg = upgradeMap.get(upgId);
        if (upg) visit(upg.targetBuilding as string | undefined);
      }
    };

    for (const id of (race.buildings as string[]) || []) visit(id);
    for (const id of (race.specialBuildings as string[]) || []) visit(id);
    visit(race.castle as string | undefined);

    return {
      race,
      units: unitIds
        .map((id) => unitMap.get(id))
        .filter((u): u is WikiRecord => Boolean(u)),
    };
  });
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
