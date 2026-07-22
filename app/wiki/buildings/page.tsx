import Link from "next/link";
import IconImg from "@/components/IconImg";
import { buildingsByFaction, raceSlug, slugOf, type WikiRecord } from "@/lib/wiki";

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

function BuildingCard({ b }: { b: WikiRecord }) {
  const stats = (b.stats as Record<string, number>) || {};
  const cost = costOf(b);
  return (
    <Link
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
}

/** Upgrade trees with 2+ buildings each get their own row; standalone
 *  buildings pool together in one grid at the end. */
function TreeRows({ trees }: { trees: WikiRecord[][] }) {
  const multi = trees.filter((t) => t.length > 1);
  const singles = trees.filter((t) => t.length === 1).flat();
  return (
    <div className="space-y-3">
      {multi.map((tree) => (
        <div key={tree[0].id} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tree.map((b) => (
            <BuildingCard key={b.id} b={b} />
          ))}
        </div>
      ))}
      {singles.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {singles.map((b) => (
            <BuildingCard key={b.id} b={b} />
          ))}
        </div>
      ) : null}
    </div>
  );
}

function SubHeading({ title, blurb }: { title: string; blurb?: string }) {
  return (
    <div className="mt-6 mb-3 flex items-baseline gap-3">
      <h3 className="font-display text-lg text-bh-gold">{title}</h3>
      {blurb ? <span className="text-xs text-bh-mute">{blurb}</span> : null}
    </div>
  );
}

export default async function BuildingsIndex() {
  const groups = await buildingsByFaction();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">All buildings</h1>
      <p className="mt-2 text-bh-mute">
        Every building in the game by faction. Each row is one upgrade line,
        base building first.
      </p>

      {groups.map(({ race, mainTrees, specialTrees, castleTree }) => {
        const spawnerTrees = mainTrees.filter((t) => !t[0].isTower);
        const towerTrees = mainTrees.filter((t) => Boolean(t[0].isTower));
        const total =
          mainTrees.flat().length +
          specialTrees.flat().length +
          castleTree.length;
        if (total === 0) return null;
        return (
          <section key={race.id}>
            <div className="mt-12 mb-1 flex items-center gap-3">
              <IconImg file={race.icon} size={36} alt="" />
              <h2 className="font-display text-2xl">
                <Link
                  href={`/wiki/faction/${raceSlug(race)}`}
                  className="hover:text-bh-blood transition-colors"
                >
                  {race.displayName || race.key}
                </Link>
              </h2>
              <span className="text-sm text-bh-mute">{total} buildings</span>
            </div>

            {spawnerTrees.length > 0 ? (
              <>
                <SubHeading title="Buildings" />
                <TreeRows trees={spawnerTrees} />
              </>
            ) : null}

            {towerTrees.length > 0 ? (
              <>
                <SubHeading title="Towers" blurb="Built on tower spots only." />
                <TreeRows trees={towerTrees} />
              </>
            ) : null}

            {specialTrees.length > 0 ? (
              <>
                <SubHeading title="Special buildings" />
                <TreeRows trees={specialTrees} />
              </>
            ) : null}

            {castleTree.length > 0 ? (
              <>
                <SubHeading title="Castle" blurb="Lose it and the match is over." />
                <TreeRows trees={[castleTree]} />
              </>
            ) : null}
          </section>
        );
      })}
    </div>
  );
}
