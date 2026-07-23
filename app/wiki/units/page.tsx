import Link from "next/link";
import IconImg from "@/components/IconImg";
import UnitCard, { UnitTreeRows } from "@/components/UnitCard";
import { raceSlug, unitsByFaction } from "@/lib/wiki";

export const revalidate = 3600;

export async function generateMetadata() {
  const groups = await unitsByFaction();
  const n = groups.reduce((s, g) => s + g.units.length + g.summons.length, 0);
  return {
    title: "All units",
    description: `Stats, DPS, abilities, and counters for all ${n} units in Bloodlust & Harmony, updated automatically from the current alpha build.`,
    alternates: { canonical: "/wiki/units" },
  };
}

export default async function UnitsIndex() {
  const groups = await unitsByFaction();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">All units</h1>
      <p className="mt-2 text-bh-mute">
        Every unit in the game, grouped by the faction that fields it.
      </p>

      {groups.map(({ race, units, unitTrees, summons, inWorks }) =>
        units.length === 0 && summons.length === 0 && inWorks.length === 0 ? null : (
          <section key={race.id}>
            <div className="mt-12 mb-4 flex items-center gap-3">
              <IconImg file={race.icon} size={36} alt="" />
              <h2 className="font-display text-2xl">
                <Link
                  href={`/wiki/faction/${raceSlug(race)}`}
                  className="hover:text-bh-blood transition-colors"
                >
                  {race.displayName || race.key}
                </Link>
              </h2>
              <span className="text-sm text-bh-mute">{units.length} units</span>
            </div>
            <UnitTreeRows trees={unitTrees} />

            {summons.length > 0 ? (
              <>
                <div className="mt-6 mb-3 flex items-baseline gap-3">
                  <h3 className="font-display text-lg text-bh-gold">Summons</h3>
                  <span className="text-xs text-bh-mute">
                    Called into battle by abilities, not built.
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {summons.map((u) => (
                    <UnitCard key={u.id} u={u} />
                  ))}
                </div>
              </>
            ) : null}

            {inWorks.length > 0 ? (
              <>
                <div className="mt-6 mb-3 flex items-baseline gap-3">
                  <h3 className="font-display text-lg text-bh-mute">In Works</h3>
                  <span className="text-xs text-bh-mute">
                    In development. Stats and design subject to change.
                  </span>
                </div>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {inWorks.map((u) => (
                    <UnitCard key={u.id} u={u} />
                  ))}
                </div>
              </>
            ) : null}
          </section>
        ),
      )}
    </div>
  );
}
