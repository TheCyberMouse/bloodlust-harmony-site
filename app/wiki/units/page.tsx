import Link from "next/link";
import IconImg from "@/components/IconImg";
import { dpsOf, slugOf, tagLeaf, unitsByFaction, type WikiRecord } from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = { title: "All units" };

function UnitCard({ u }: { u: WikiRecord }) {
  const stats = (u.stats as Record<string, number>) || {};
  const dps = dpsOf(stats);
  return (
    <Link
      href={`/wiki/unit/${slugOf(u.key)}`}
      className="group flex items-center gap-3 rounded-lg border border-bh-rule bg-bh-panel p-3 hover:border-bh-blood transition-colors"
    >
      <IconImg file={u.icon} size={44} alt="" />
      <div className="min-w-0">
        <div className="font-medium truncate group-hover:text-bh-blood transition-colors">
          {u.displayName || u.key}
        </div>
        <div className="text-xs text-bh-mute truncate">
          {[
            u.unitClass ? tagLeaf(u.unitClass as string) : null,
            stats.MaxHealth ? `${stats.MaxHealth} HP` : null,
            dps !== null ? `${dps} DPS` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
    </Link>
  );
}

export default async function UnitsIndex() {
  const groups = await unitsByFaction();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">All units</h1>
      <p className="mt-2 text-bh-mute">
        Every unit in the game, grouped by the faction that fields it.
      </p>

      {groups.map(({ race, units, summons, inWorks }) =>
        units.length === 0 && summons.length === 0 && inWorks.length === 0 ? null : (
          <section key={race.id}>
            <div className="mt-12 mb-4 flex items-center gap-3">
              <IconImg file={race.icon} size={36} alt="" />
              <h2 className="font-display text-2xl">
                <Link
                  href={`/wiki/faction/${slugOf(race.key)}`}
                  className="hover:text-bh-blood transition-colors"
                >
                  {race.displayName || race.key}
                </Link>
              </h2>
              <span className="text-sm text-bh-mute">{units.length} units</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {units.map((u) => (
                <UnitCard key={u.id} u={u} />
              ))}
            </div>

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
