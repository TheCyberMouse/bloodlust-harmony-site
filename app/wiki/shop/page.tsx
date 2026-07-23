import Link from "next/link";
import IconImg from "@/components/IconImg";
import { GameText } from "@/lib/richtext";
import {
  listRaces,
  listShopItems,
  raceSlug,
  type WikiRecord,
} from "@/lib/wiki";

export const revalidate = 3600;

export async function generateMetadata() {
  const items = await listShopItems();
  return {
    title: "Shop items",
    description: `Every shop item in Bloodlust & Harmony by faction: resource trades, team buffs, costs, and cooldowns.`,
    alternates: { canonical: "/wiki/shop" },
  };
}

function tradeLine(s: WikiRecord): string {
  const costs = [
    (s.costGold as number) > 0 ? `${s.costGold}g` : null,
    (s.costLumber as number) > 0 ? `${s.costLumber} wood` : null,
    (s.costStardust as number) > 0 ? `${s.costStardust} stardust` : null,
  ].filter(Boolean);
  const grants = [
    (s.grantGold as number) > 0 ? `${s.grantGold}g` : null,
    (s.grantLumber as number) > 0 ? `${s.grantLumber} wood` : null,
    (s.grantStardust as number) > 0 ? `${s.grantStardust} stardust` : null,
  ].filter(Boolean);
  const parts: string[] = [];
  if (costs.length > 0 && grants.length > 0)
    parts.push(`${costs.join(" + ")} for ${grants.join(" + ")}`);
  else if (costs.length > 0) parts.push(`costs ${costs.join(" + ")}`);
  if ((s.cooldownSeconds as number) > 0)
    parts.push(`${s.cooldownSeconds}s cooldown`);
  return parts.join(" · ");
}

function ShopCard({ s }: { s: WikiRecord }) {
  const trade = tradeLine(s);
  return (
    <div className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4">
      <IconImg file={s.icon} size={40} alt="" />
      <div className="min-w-0">
        <div className="font-medium">
          {s.displayName || s.key}
          {trade ? (
            <span className="ml-2 text-xs text-bh-mute">{trade}</span>
          ) : null}
        </div>
        <p className="text-sm text-bh-mute mt-1">
          <GameText text={s.tooltip?.body || s.description} />
        </p>
        {s.tooltip?.flavor ? (
          <p className="mt-1 text-sm">
            <span className="rt-flavor">
              <GameText text={s.tooltip.flavor} />
            </span>
          </p>
        ) : null}
      </div>
    </div>
  );
}

export default async function ShopIndex() {
  const [races, items] = await Promise.all([listRaces(), listShopItems()]);
  const byId = new Map(items.map((s) => [s.id, s]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">Shop items</h1>
      <p className="mt-2 max-w-prose text-bh-mute">
        One-off purchases from the Shop tab: resource trades and team-wide
        buffs, each on its own cooldown.
      </p>

      {races.map((race) => {
        const rows = ((race.shopItems as string[]) || [])
          .map((id) => byId.get(id))
          .filter((s): s is WikiRecord => Boolean(s));
        if (rows.length === 0) return null;
        return (
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
              <span className="text-sm text-bh-mute">{rows.length} items</span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map((s) => (
                <ShopCard key={s.id} s={s} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
