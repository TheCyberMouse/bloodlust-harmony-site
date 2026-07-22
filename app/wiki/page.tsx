import Link from "next/link";
import IconImg from "@/components/IconImg";
import {
  listRaces,
  listUnits,
  listBuildings,
  listResearches,
  slugOf,
} from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = { title: "Wiki" };

export default async function WikiHub() {
  const [races, units, buildings, researches] = await Promise.all([
    listRaces(),
    listUnits(),
    listBuildings(),
    listResearches(),
  ]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">Wiki</h1>
      <p className="mt-2 text-bh-mute">
        Generated straight from the game data: {units.length} units,{" "}
        {buildings.length} buildings, {researches.length} researches across{" "}
        {races.length} factions. Always current with the live build.
      </p>

      <h2 className="font-display text-2xl mt-12 mb-6">Factions</h2>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {races.map((race) => (
          <Link
            key={race.id}
            href={`/wiki/faction/${slugOf(race.key)}`}
            className="group rounded-lg border border-bh-rule bg-bh-panel p-5 hover:border-bh-blood transition-colors"
          >
            <div className="flex items-center gap-4">
              <IconImg file={race.icon} size={48} alt="" />
              <div>
                <h3 className="font-display group-hover:text-bh-blood transition-colors">
                  {race.displayName || race.key}
                </h3>
                <p className="text-xs text-bh-mute mt-1">
                  {(race.buildings as string[] | undefined)?.length ?? 0}{" "}
                  buildings ·{" "}
                  {(race.researches as string[] | undefined)?.length ?? 0}{" "}
                  researches
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <h2 className="font-display text-2xl mt-12 mb-4">Reference</h2>
      <div className="flex flex-wrap gap-4 text-sm">
        <Link
          href="/wiki/units"
          className="rounded border border-bh-rule px-4 py-2 hover:border-bh-mute transition-colors"
        >
          All units
        </Link>
        <Link
          href="/wiki/buildings"
          className="rounded border border-bh-rule px-4 py-2 hover:border-bh-mute transition-colors"
        >
          All buildings
        </Link>
        <Link
          href="/wiki/abilities"
          className="rounded border border-bh-rule px-4 py-2 hover:border-bh-mute transition-colors"
        >
          All abilities
        </Link>
        <Link
          href="/wiki/matrix"
          className="rounded border border-bh-rule px-4 py-2 hover:border-bh-mute transition-colors"
        >
          Damage matrix
        </Link>
        <Link
          href="/wiki/statuses"
          className="rounded border border-bh-rule px-4 py-2 hover:border-bh-mute transition-colors"
        >
          Status effects
        </Link>
      </div>
    </div>
  );
}
