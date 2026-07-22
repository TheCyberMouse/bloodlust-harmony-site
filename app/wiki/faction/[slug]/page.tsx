import Link from "next/link";
import { notFound } from "next/navigation";
import IconImg from "@/components/IconImg";
import { GameText } from "@/lib/richtext";
import {
  findBySlug,
  listBuildings,
  listRaces,
  listResearches,
  listShopItems,
  listUnits,
  slugOf,
  type WikiRecord,
} from "@/lib/wiki";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const races = await listRaces();
  return races.map((r) => ({ slug: slugOf(r.key) }));
}

function byId(records: WikiRecord[]): Map<string, WikiRecord> {
  return new Map(records.map((r) => [r.id, r]));
}

function BuildingCard({
  b,
  spawnedUnit,
}: {
  b: WikiRecord;
  spawnedUnit: WikiRecord | null;
}) {
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
            (b.costGold as number) ? `${b.costGold}g` : null,
            (b.costLumber as number) ? `${b.costLumber}w` : null,
            (b.costStardust as number) ? `${b.costStardust}s` : null,
            spawnedUnit ? `trains ${spawnedUnit.displayName || spawnedUnit.key}` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
    </Link>
  );
}

export default async function FactionPage({
  params,
}: {
  params: { slug: string };
}) {
  const race = await findBySlug("races", params.slug);
  if (!race) notFound();

  const [buildings, units, researches, shopItems] = await Promise.all([
    listBuildings(),
    listUnits(),
    listResearches(),
    listShopItems(),
  ]);
  const buildingMap = byId(buildings);
  const unitMap = byId(units);
  const researchMap = byId(researches);
  const shopMap = byId(shopItems);

  const resolve = (ids: unknown): WikiRecord[] =>
    ((ids as string[]) || [])
      .map((id) => buildingMap.get(id))
      .filter((b): b is WikiRecord => Boolean(b));

  const roster = resolve(race.buildings);
  const specials = resolve(race.specialBuildings);
  const spawners = roster.filter((b) => !b.isTower);
  const towers = roster.filter((b) => b.isTower);
  const castle = race.castle ? buildingMap.get(race.castle as string) : null;
  const leader = race.leader as
    | { name?: string; title?: string; description?: string; portrait?: string }
    | undefined;

  const spawnedOf = (b: WikiRecord) =>
    b.spawnedUnit ? unitMap.get(b.spawnedUnit as string) ?? null : null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <div className="flex items-center gap-5">
        <IconImg file={race.icon} size={72} alt="" />
        <div>
          <h1 className="font-display text-4xl">{race.displayName || race.key}</h1>
          <p className="mt-1 text-bh-mute max-w-prose">{race.description}</p>
        </div>
      </div>

      {leader?.name ? (
        <div className="mt-8 rounded-lg border border-bh-rule bg-bh-panel p-5 flex items-center gap-5">
          <IconImg file={leader.portrait} size={64} alt="" />
          <div>
            <div className="font-display text-lg">{leader.name}</div>
            {leader.title ? (
              <div className="text-sm text-bh-gold">{leader.title}</div>
            ) : null}
            {leader.description ? (
              <p className="mt-1 text-sm text-bh-mute max-w-prose">
                {leader.description}
              </p>
            ) : null}
          </div>
        </div>
      ) : null}

      {castle ? (
        <>
          <h2 className="font-display text-2xl mt-12 mb-4">Castle</h2>
          <div className="max-w-md">
            <BuildingCard b={castle} spawnedUnit={spawnedOf(castle)} />
          </div>
        </>
      ) : null}

      <h2 className="font-display text-2xl mt-12 mb-4">Buildings</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {spawners.map((b) => (
          <BuildingCard key={b.id} b={b} spawnedUnit={spawnedOf(b)} />
        ))}
      </div>

      {towers.length > 0 ? (
        <>
          <h2 className="font-display text-2xl mt-12 mb-4">Towers</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {towers.map((b) => (
              <BuildingCard key={b.id} b={b} spawnedUnit={spawnedOf(b)} />
            ))}
          </div>
        </>
      ) : null}

      {specials.length > 0 ? (
        <>
          <h2 className="font-display text-2xl mt-12 mb-4">Special buildings</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {specials.map((b) => (
              <BuildingCard key={b.id} b={b} spawnedUnit={spawnedOf(b)} />
            ))}
          </div>
        </>
      ) : null}

      {((race.researches as string[]) || []).length > 0 ? (
        <>
          <h2 className="font-display text-2xl mt-12 mb-4">Researches</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {((race.researches as string[]) || []).map((id) => {
              const r = researchMap.get(id);
              if (!r) return null;
              return (
                <div
                  key={id}
                  className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4"
                >
                  <IconImg file={r.icon} size={40} alt="" />
                  <div>
                    <div className="font-medium">
                      {r.displayName || r.key}{" "}
                      <span className="text-xs text-bh-mute">
                        ({r.maxTiers as number} tier
                        {(r.maxTiers as number) === 1 ? "" : "s"})
                      </span>
                    </div>
                    <p className="text-sm text-bh-mute mt-1">
                      <GameText text={r.tooltip?.body || r.description} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}

      {((race.shopItems as string[]) || []).length > 0 ? (
        <>
          <h2 className="font-display text-2xl mt-12 mb-4">Shop</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {((race.shopItems as string[]) || []).map((id) => {
              const s = shopMap.get(id);
              if (!s) return null;
              return (
                <div
                  key={id}
                  className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4"
                >
                  <IconImg file={s.icon} size={40} alt="" />
                  <div>
                    <div className="font-medium">{s.displayName || s.key}</div>
                    <p className="text-sm text-bh-mute mt-1">
                      <GameText text={s.tooltip?.body || s.description} />
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </>
      ) : null}
    </div>
  );
}
