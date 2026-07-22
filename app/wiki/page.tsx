import Link from "next/link";
import IconImg from "@/components/IconImg";
import {
  listAbilities,
  listBuildings,
  listRaces,
  listResearches,
  listStatuses,
  listUnits,
  raceSlug,
} from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = { title: "Wiki" };

function RefCard({
  href,
  title,
  blurb,
  count,
}: {
  href: string;
  title: string;
  blurb: string;
  count?: string;
}) {
  return (
    <Link
      href={href}
      className="group rounded-lg border border-bh-rule bg-bh-panel p-5 hover:border-bh-blood transition-colors"
    >
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="font-display text-lg group-hover:text-bh-blood transition-colors">
          {title}
        </h3>
        {count ? <span className="text-xs text-bh-mute">{count}</span> : null}
      </div>
      <p className="mt-1.5 text-sm text-bh-mute leading-relaxed">{blurb}</p>
    </Link>
  );
}

export default async function WikiHub() {
  const [races, units, buildings, researches, abilities, statuses] =
    await Promise.all([
      listRaces(),
      listUnits(),
      listBuildings(),
      listResearches(),
      listAbilities(),
      listStatuses(),
    ]);

  const namedAbilities = abilities.filter(
    (a) => a.displayName && a.displayName !== a.key,
  ).length;
  const namedStatuses = statuses.filter((s) => s.displayName).length;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">Wiki</h1>
      <p className="mt-2 max-w-prose text-bh-mute">
        Generated straight from the game data: {units.length} units,{" "}
        {buildings.length} buildings, {namedAbilities} abilities, and{" "}
        {namedStatuses} status effects across {races.length} factions. Every
        stat, tooltip, and icon here is the real one from the live build.
      </p>
      <p className="mt-3 text-sm">
        <Link
          href="/how-to-play"
          className="text-bh-blood hover:text-bh-bloodInk transition-colors"
        >
          New here? Start with How to Play →
        </Link>
      </p>

      <h2 className="font-display text-2xl mt-12 mb-6">Factions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {races.map((race) => {
          const leader = race.leader as
            | { name?: string; title?: string }
            | undefined;
          return (
            <Link
              key={race.id}
              href={`/wiki/faction/${raceSlug(race)}`}
              className="group rounded-lg border border-bh-rule bg-bh-panel p-5 hover:border-bh-blood transition-colors"
            >
              <div className="flex items-center gap-4">
                <IconImg file={race.icon} size={48} alt="" />
                <div className="min-w-0">
                  <h3 className="font-display group-hover:text-bh-blood transition-colors">
                    {race.displayName || race.key}
                  </h3>
                  <p className="text-xs text-bh-mute mt-1 truncate">
                    {leader?.name
                      ? `Led by ${leader.name}${leader.title ? `, ${leader.title}` : ""}`
                      : `${(race.buildings as string[] | undefined)?.length ?? 0} buildings · ${(race.researches as string[] | undefined)?.length ?? 0} researches`}
                  </p>
                </div>
              </div>
            </Link>
          );
        })}
      </div>

      <h2 className="font-display text-2xl mt-12 mb-6">The database</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RefCard
          href="/wiki/units"
          title="All units"
          count={`${units.length}`}
          blurb="Every unit by faction, with HP, DPS, and class at a glance. Includes each faction's summons."
        />
        <RefCard
          href="/wiki/buildings"
          title="All buildings"
          count={`${buildings.length}`}
          blurb="Spawners, towers, utility, and castles in build-menu order, with costs and upgrade lines."
        />
        <RefCard
          href="/wiki/abilities"
          title="All abilities"
          count={`${namedAbilities}`}
          blurb="Spells, passives, and autocasts A to Z, with the units and buildings that carry them."
        />
        <RefCard
          href="/wiki/matrix"
          title="Damage matrix"
          blurb="The attack-vs-armor chart, the armor formulas, elements, and exactly how a hit is calculated."
        />
        <RefCard
          href="/wiki/statuses"
          title="Status effects"
          count={`${namedStatuses}`}
          blurb="Buffs, debuffs, auras and their effects, and which ones can be dispelled."
        />
      </div>

      <h2 className="font-display text-2xl mt-12 mb-6">Reading</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RefCard
          href="/how-to-play"
          title="How to play"
          blurb="The goal, the economy, waves, counters, and controls. Five minutes to your first match."
        />
        <RefCard
          href="/guides"
          title="Guides"
          blurb="Strategy write-ups: build orders, faction primers, and countering common compositions."
        />
        <RefCard
          href="/lore"
          title="Lore"
          blurb="The world behind the war: the factions, their leaders, and why they fight."
        />
        <RefCard
          href="/devlog"
          title="Devlog"
          blurb="What changed and what is coming: patch notes and development updates from the alpha."
        />
      </div>
    </div>
  );
}
