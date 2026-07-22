import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import IconImg from "@/components/IconImg";
import { GameText } from "@/lib/richtext";
import {
  findBySlug,
  listBuildings,
  listUnits,
  listUpgrades,
  slugOf,
  tagLeaf,
  STAT_LABELS,
  STAT_ORDER,
  type WikiRecord,
} from "@/lib/wiki";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const buildings = await listBuildings();
  return buildings.map((b) => ({ slug: slugOf(b.key) }));
}

export default async function BuildingPage({
  params,
}: {
  params: { slug: string };
}) {
  const b = await findBySlug("buildings", params.slug);
  if (!b) notFound();

  const [units, upgrades, buildings] = await Promise.all([
    listUnits(),
    listUpgrades(),
    listBuildings(),
  ]);
  const unitMap = new Map(units.map((u) => [u.id, u]));
  const upgradeMap = new Map(upgrades.map((u) => [u.id, u]));
  const buildingMap = new Map(buildings.map((x) => [x.id, x]));

  const spawned = b.spawnedUnit ? unitMap.get(b.spawnedUnit as string) : null;
  const stats = (b.stats as Record<string, number>) || {};
  const tooltip = b.tooltip;

  const upgradeEntries = ((b.upgrades as string[]) || [])
    .map((id) => upgradeMap.get(id))
    .filter((u): u is WikiRecord => Boolean(u));

  const cost: Array<[string, number, string]> = [
    ["Gold", (b.costGold as number) || 0, "text-bh-gold"],
    ["Wood", (b.costLumber as number) || 0, "text-bh-gold"],
    ["Stardust", (b.costStardust as number) || 0, "text-bh-gold"],
    ["Food", (b.foodCost as number) || 0, "text-bh-mute"],
  ];

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <BackButton fallback="/wiki/buildings" />
      <div className="flex items-center gap-5">
        <IconImg file={b.icon} size={72} alt="" />
        <div>
          <h1 className="font-display text-4xl">{b.displayName || b.key}</h1>
          <p className="text-sm text-bh-mute mt-1">
            {[
              b.isCastle ? "Castle" : null,
              b.isTower ? "Tower" : null,
              b.isSpawner ? "Spawner" : null,
              tooltip?.subtitle,
            ]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
      </div>

      {tooltip?.body ? (
        <p className="mt-6 max-w-prose leading-relaxed">
          <GameText text={tooltip.body} />
        </p>
      ) : b.description ? (
        <p className="mt-6 max-w-prose leading-relaxed">{b.description}</p>
      ) : null}
      {tooltip?.flavor ? (
        <p className="mt-3 max-w-prose">
          <span className="rt-flavor">
            <GameText text={tooltip.flavor} />
          </span>
        </p>
      ) : null}

      <div className="mt-8 grid gap-6 sm:grid-cols-2">
        <div className="rounded-lg border border-bh-rule bg-bh-panel p-5">
          <h2 className="font-display text-lg mb-3">Cost &amp; economy</h2>
          <dl className="space-y-1 text-sm">
            {cost
              .filter(([, v]) => v > 0)
              .map(([label, v, cls]) => (
                <div key={label} className="flex justify-between">
                  <dt className="text-bh-mute">{label}</dt>
                  <dd className={cls}>{v}</dd>
                </div>
              ))}
            {(b.incomeBonus as number) ? (
              <div className="flex justify-between">
                <dt className="text-bh-mute">Income</dt>
                <dd className="text-bh-gold">+{b.incomeBonus as number}</dd>
              </div>
            ) : null}
            {(b.lumberOnBuild as number) ? (
              <div className="flex justify-between">
                <dt className="text-bh-mute">Wood on build</dt>
                <dd className="text-bh-gold">+{b.lumberOnBuild as number}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        {Object.keys(stats).length > 0 ? (
          <div className="rounded-lg border border-bh-rule bg-bh-panel p-5">
            <h2 className="font-display text-lg mb-3">Stats</h2>
            <dl className="space-y-1 text-sm">
              {STAT_ORDER.filter((k) => stats[k] !== undefined).map((k) => (
                <div key={k} className="flex justify-between">
                  <dt className="text-bh-mute">{STAT_LABELS[k]}</dt>
                  <dd>{stats[k]}</dd>
                </div>
              ))}
              {b.armorType ? (
                <div className="flex justify-between">
                  <dt className="text-bh-mute">Armor type</dt>
                  <dd>{tagLeaf(b.armorType as string)}</dd>
                </div>
              ) : null}
              {b.attackType ? (
                <div className="flex justify-between">
                  <dt className="text-bh-mute">Attack type</dt>
                  <dd>{tagLeaf(b.attackType as string)}</dd>
                </div>
              ) : null}
            </dl>
          </div>
        ) : null}
      </div>

      {spawned ? (
        <div className="mt-8">
          <h2 className="font-display text-lg mb-3">Trains</h2>
          <Link
            href={`/wiki/unit/${slugOf(spawned.key)}`}
            className="group inline-flex items-center gap-3 rounded-lg border border-bh-rule bg-bh-panel p-3 pr-5 hover:border-bh-blood transition-colors"
          >
            <IconImg file={spawned.icon} size={44} alt="" />
            <div>
              <div className="font-medium group-hover:text-bh-blood transition-colors">
                {spawned.displayName || spawned.key}
                {(b.unitsPerWave as number) > 1
                  ? ` ×${b.unitsPerWave as number}`
                  : ""}
              </div>
              <div className="text-xs text-bh-mute">per wave</div>
            </div>
          </Link>
        </div>
      ) : null}

      {upgradeEntries.length > 0 ? (
        <div className="mt-8">
          <h2 className="font-display text-lg mb-3">Upgrades into</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {upgradeEntries.map((u) => {
              const target = u.targetBuilding
                ? buildingMap.get(u.targetBuilding as string)
                : null;
              return (
                <Link
                  key={u.id}
                  href={target ? `/wiki/building/${slugOf(target.key)}` : "#"}
                  className="group flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4 hover:border-bh-blood transition-colors"
                >
                  <IconImg file={u.icon || target?.icon} size={40} alt="" />
                  <div>
                    <div className="font-medium group-hover:text-bh-blood transition-colors">
                      {u.displayName || target?.displayName || u.key}
                    </div>
                    <p className="text-sm text-bh-mute mt-1 line-clamp-3">
                      <GameText text={u.tooltip?.body || u.description} />
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
