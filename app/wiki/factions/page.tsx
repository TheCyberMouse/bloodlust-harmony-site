import Link from "next/link";
import IconImg from "@/components/IconImg";
import { slugOf, unitsByFaction } from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = { title: "Factions" };

export default async function FactionsIndex() {
  const groups = await unitsByFaction();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-4xl">Factions</h1>
      <p className="mt-2 max-w-prose text-bh-mute">
        Five armies, five ways to win. Every faction fields its own buildings,
        units, researches, and shop, and none of them play alike.
      </p>

      <div className="mt-10 space-y-4">
        {groups.map(({ race, units, summons }) => {
          const leader = race.leader as
            | { name?: string; title?: string }
            | undefined;
          const buildingCount =
            ((race.buildings as string[] | undefined)?.length ?? 0) +
            ((race.specialBuildings as string[] | undefined)?.length ?? 0);
          const researchCount =
            (race.researches as string[] | undefined)?.length ?? 0;
          return (
            <Link
              key={race.id}
              href={`/wiki/faction/${slugOf(race.key)}`}
              className="group flex items-start gap-5 rounded-lg border border-bh-rule bg-bh-panel p-5 hover:border-bh-blood transition-colors"
            >
              <IconImg file={race.icon} size={64} alt="" />
              <div className="min-w-0">
                <h2 className="font-display text-xl group-hover:text-bh-blood transition-colors">
                  {race.displayName || race.key}
                </h2>
                {leader?.name ? (
                  <p className="mt-0.5 text-sm text-bh-gold">
                    Led by {leader.name}
                    {leader.title ? `, ${leader.title}` : ""}
                  </p>
                ) : null}
                <p className="mt-2 text-sm text-bh-mute leading-relaxed line-clamp-3">
                  {race.description}
                </p>
                <p className="mt-2 text-xs text-bh-mute">
                  {[
                    `${units.length + summons.length} units`,
                    `${buildingCount} buildings`,
                    researchCount ? `${researchCount} researches` : null,
                  ]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
