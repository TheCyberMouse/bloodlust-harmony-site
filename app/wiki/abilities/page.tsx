import Link from "next/link";
import HoverCard from "@/components/HoverCard";
import IconImg from "@/components/IconImg";
import { GameText } from "@/lib/richtext";
import {
  dpsOf,
  listAbilities,
  listBuildings,
  listUnits,
  slugOf,
  tagLeaf,
  type WikiRecord,
} from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = { title: "All abilities" };

/** grantedBy entries are display names; buildings carry a " (bld)" suffix. */
function resolveUser(
  name: string,
  unitByName: Map<string, WikiRecord>,
  bldByName: Map<string, WikiRecord>,
): { label: string; href: string; rec: WikiRecord; isBuilding: boolean } | null {
  const isBuilding = name.endsWith(" (bld)");
  const label = isBuilding ? name.slice(0, -" (bld)".length) : name;
  const rec = isBuilding ? bldByName.get(label) : unitByName.get(label);
  if (!rec) return null;
  return {
    label,
    href: `/wiki/${isBuilding ? "building" : "unit"}/${slugOf(rec.key)}`,
    rec,
    isBuilding,
  };
}

function UserPanel({
  label,
  rec,
  isBuilding,
}: {
  label: string;
  rec: WikiRecord;
  isBuilding: boolean;
}) {
  const stats = (rec.stats as Record<string, number>) || {};
  const dps = dpsOf(stats);
  const subtitle = isBuilding
    ? [
        "Building",
        stats.MaxHealth ? `${stats.MaxHealth} HP` : null,
        (rec.costGold as number) ? `${rec.costGold}g` : null,
      ]
    : [
        rec.unitClass ? tagLeaf(rec.unitClass as string) : null,
        stats.MaxHealth ? `${stats.MaxHealth} HP` : null,
        dps !== null ? `${dps} DPS` : null,
      ];
  return (
    <span className="flex items-center gap-2.5">
      <IconImg file={rec.icon} size={36} alt="" />
      <span className="block text-left">
        <span className="block text-sm font-medium text-bh-ink">{label}</span>
        <span className="block text-xs text-bh-mute">
          {subtitle.filter(Boolean).join(" · ")}
        </span>
      </span>
    </span>
  );
}

export default async function AbilitiesIndex() {
  const [abilities, units, buildings] = await Promise.all([
    listAbilities(),
    listUnits(),
    listBuildings(),
  ]);

  const unitByName = new Map(
    units.map((u) => [u.displayName || u.key, u] as const),
  );
  const bldByName = new Map(
    buildings.map((b) => [b.displayName || b.key, b] as const),
  );

  // Only abilities with a real display name are player-facing; internal
  // scaffolding classes (the shared BasicAttack, abstract bases) keep their
  // class name and are skipped. Alphabetical by display name.
  const shown = abilities
    .filter(
      (a) =>
        a.displayName &&
        a.displayName !== a.key &&
        !a.key.includes("BasicAttack"),
    )
    .sort((a, b) => (a.displayName || "").localeCompare(b.displayName || ""));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">All abilities</h1>
      <p className="mt-2 text-bh-mute">
        Every ability in the game, A to Z: {shown.length} spells, passives, and
        autocasts.
      </p>

      <div className="mt-10 grid gap-3 sm:grid-cols-2">
        {shown.map((a) => {
          const users = (a.grantedBy as string[]) || [];
          return (
            <div
              key={a.id}
              className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4"
            >
              <IconImg file={a.tooltip?.icon} size={40} alt="" />
              <div className="min-w-0">
                <div className="font-medium">
                  {a.displayName}
                  <span className="ml-2 text-xs text-bh-mute">
                    {[
                      a.passive ? "passive" : null,
                      a.autoCast ? "autocast" : null,
                      (a.costMana as number)
                        ? `${a.costMana} mana`
                        : (a.manaCost as number)
                          ? `${a.manaCost} mana`
                          : null,
                      (a.cooldownSeconds as number)
                        ? `${a.cooldownSeconds}s cd`
                        : null,
                    ]
                      .filter(Boolean)
                      .join(" · ")}
                  </span>
                </div>
                <p className="text-sm text-bh-mute mt-1">
                  <GameText text={a.tooltip?.body} />
                </p>
                {users.length > 0 ? (
                  <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <span className="text-xs text-bh-mute/70">Used by:</span>
                    {users.map((name) => {
                      const user = resolveUser(name, unitByName, bldByName);
                      if (!user) {
                        return (
                          <span
                            key={name}
                            className="text-xs text-bh-mute/70"
                          >
                            {name}
                          </span>
                        );
                      }
                      return (
                        <HoverCard
                          key={name}
                          panel={
                            <UserPanel
                              label={user.label}
                              rec={user.rec}
                              isBuilding={user.isBuilding}
                            />
                          }
                        >
                          <Link
                            href={user.href}
                            aria-label={user.label}
                            className="block hover:opacity-75 transition-opacity"
                          >
                            <IconImg file={user.rec.icon} size={30} alt={user.label} />
                          </Link>
                        </HoverCard>
                      );
                    })}
                  </div>
                ) : null}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
