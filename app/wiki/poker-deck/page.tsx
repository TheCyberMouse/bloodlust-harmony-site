import BackButton from "@/components/BackButton";
import JsonLd, { breadcrumbLd } from "@/components/JsonLd";
import PokerDeckTable, { type DeckRow } from "@/components/PokerDeckTable";
import { stripGameText, truncate } from "@/lib/seo";
import { dpsOf, listUnits, slugOf, tagLeaf, unitsByFaction } from "@/lib/wiki";

export const revalidate = 3600;

export async function generateMetadata() {
  const units = await listUnits();
  const n = units.filter((u) => u.pokerCard).length;
  return {
    title: "Poker deck",
    description: `Every one of the ${n} cards in Bloodlust & Harmony's Poker mode, with the unit each deals and how many spawn per card. Sortable by faction, class, and count.`,
    alternates: { canonical: "/wiki/poker-deck" },
  };
}

export default async function PokerDeckPage() {
  const [units, groups] = await Promise.all([listUnits(), unitsByFaction()]);

  const factionOf = new Map<string, string>();
  for (const g of groups) {
    for (const u of [...g.units, ...g.summons, ...g.inWorks]) {
      factionOf.set(u.id, g.race.displayName || g.race.key);
    }
  }

  const rows: DeckRow[] = units
    .filter((u) => u.pokerCard)
    .map((u) => {
      const stats = (u.stats as Record<string, number>) || {};
      const dps = dpsOf(stats);
      const statsLine = [
        stats.MaxHealth ? `${stats.MaxHealth} HP` : null,
        stats.AttackDamage ? `${stats.AttackDamage} DMG` : null,
        dps !== null ? `${dps} DPS` : null,
      ]
        .filter(Boolean)
        .join(" · ");
      return {
        id: u.id,
        slug: slugOf(u.key),
        name: u.displayName || u.key,
        icon: (u.icon as string) ?? null,
        faction: factionOf.get(u.id) || "Neutral",
        unitClass: u.unitClass ? tagLeaf(u.unitClass as string) : "",
        min: (u.pokerMinCount as number) ?? 1,
        max: (u.pokerMaxCount as number) ?? 1,
        statsLine,
        description: truncate(
          stripGameText((u.tooltip?.body as string) || (u.description as string)),
          180,
        ),
      };
    });

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <JsonLd
        data={breadcrumbLd([
          { name: "Wiki", path: "/wiki" },
          { name: "Game modes", path: "/wiki/modes" },
          { name: "Poker", path: "/wiki/modes/poker" },
          { name: "Deck", path: "/wiki/poker-deck" },
        ])}
      />
      <BackButton fallback="/wiki/modes/poker" />
      <h1 className="font-display text-4xl">Poker deck</h1>
      <p className="mt-2 max-w-prose text-bh-mute">
        Every card in Poker is one of these {rows.length} units, dealt in a
        random count from its own range. Hover a unit for its details, click to
        open its page, and sort by any column.
      </p>

      <div className="mt-8">
        <PokerDeckTable rows={rows} />
      </div>
    </div>
  );
}
