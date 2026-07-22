import Link from "next/link";
import IconImg from "@/components/IconImg";
import { buildingsByFaction, slugOf } from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = { title: "All buildings" };

function roleOf(b: Record<string, unknown>): string {
  if (b.isCastle) return "Castle";
  if (b.isTower) return "Tower";
  if (b.isSpawner) return "Spawner";
  return "Utility";
}

function costOf(b: Record<string, unknown>): string {
  const parts: string[] = [];
  if (typeof b.costGold === "number" && b.costGold > 0)
    parts.push(`${b.costGold}g`);
  if (typeof b.costLumber === "number" && b.costLumber > 0)
    parts.push(`${b.costLumber} wood`);
  if (typeof b.costStardust === "number" && b.costStardust > 0)
    parts.push(`${b.costStardust} stardust`);
  return parts.join(" + ");
}

export default async function BuildingsIndex() {
  const groups = await buildingsByFaction();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">All buildings</h1>
      <p className="mt-2 text-bh-mute">
        Every building in the game, grouped by faction in build-menu order.
        Upgrades appear right after the building they grow from.
      </p>

      {groups.map(({ race, buildings }) =>
        buildings.length === 0 ? null : (
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
              <span className="text-sm text-bh-mute">
                {buildings.length} buildings
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {buildings.map((b) => {
                const stats = (b.stats as Record<string, number>) || {};
                const cost = costOf(b);
                return (
                  <Link
                    key={b.id}
                    href={`/wiki/building/${slugOf(b.key)}`}
                    className="group flex items-center gap-3 rounded-lg border border-bh-rule bg-bh-panel p-3 hover:border-bh-blood transition-colors"
                  >
                    <IconImg file={b.icon} size={44} alt="" />
                    <div className="min-w-0">
                      <div className="font-medium truncate group-hover:text-bh-blood transition-colors">
                        {b.displayName || b.key}
                      </div>
                      <div className="text-xs text-bh-mute truncate">
                        {[
                          roleOf(b),
                          cost || null,
                          stats.MaxHealth ? `${stats.MaxHealth} HP` : null,
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
