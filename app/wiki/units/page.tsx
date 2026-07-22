import Link from "next/link";
import IconImg from "@/components/IconImg";
import { dpsOf, slugOf, tagLeaf, unitsByFaction } from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = { title: "All units" };

export default async function UnitsIndex() {
  const groups = await unitsByFaction();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">All units</h1>
      <p className="mt-2 text-bh-mute">
        Every unit in the game, grouped by the faction that fields it.
      </p>

      {groups.map(({ race, units }) =>
        units.length === 0 ? null : (
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
              {units.map((u) => {
                const stats = (u.stats as Record<string, number>) || {};
                const dps = dpsOf(stats);
                return (
                  <Link
                    key={u.id}
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
              })}
            </div>
          </section>
        ),
      )}
    </div>
  );
}
