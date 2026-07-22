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

type ResolvedUser = {
  label: string;
  href: string;
  rec: WikiRecord;
  isBuilding: boolean;
  fromPool?: boolean;
};

/** grantedBy entries are display names; buildings carry a " (bld)" suffix. */
function resolveUser(
  name: string,
  unitByName: Map<string, WikiRecord>,
  bldByName: Map<string, WikiRecord>,
): ResolvedUser | null {
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

function UserPanel({ user }: { user: ResolvedUser }) {
  const stats = (user.rec.stats as Record<string, number>) || {};
  const dps = dpsOf(stats);
  const subtitle = user.isBuilding
    ? [
        "Building",
        stats.MaxHealth ? `${stats.MaxHealth} HP` : null,
        (user.rec.costGold as number) ? `${user.rec.costGold}g` : null,
      ]
    : [
        user.rec.unitClass ? tagLeaf(user.rec.unitClass as string) : null,
        stats.MaxHealth ? `${stats.MaxHealth} HP` : null,
        dps !== null ? `${dps} DPS` : null,
        user.fromPool ? "random roll" : null,
      ];
  return (
    <span className="flex items-center gap-2.5">
      <IconImg file={user.rec.icon} size={36} alt="" />
      <span className="block text-left">
        <span className="block text-sm font-medium text-bh-ink">
          {user.label}
        </span>
        <span className="block text-xs text-bh-mute">
          {subtitle.filter(Boolean).join(" · ")}
        </span>
      </span>
    </span>
  );
}

function AbilityCard({
  a,
  users,
  unresolved,
}: {
  a: WikiRecord;
  users: ResolvedUser[];
  unresolved: string[];
}) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4">
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
        {users.length > 0 || unresolved.length > 0 ? (
          <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
            <span className="text-xs text-bh-mute/70">Used by:</span>
            {users.map((user) => (
              <HoverCard key={user.rec.id} panel={<UserPanel user={user} />}>
                <Link
                  href={user.href}
                  aria-label={user.label}
                  className="block hover:opacity-75 transition-opacity"
                >
                  <IconImg file={user.rec.icon} size={30} alt={user.label} />
                </Link>
              </HoverCard>
            ))}
            {unresolved.map((name) => (
              <span key={name} className="text-xs text-bh-mute/70">
                {name}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </div>
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

  // Random-spawn ability pools (Sorcerer arrows, the Elemental Infusions)
  // don't appear in grantedBy; count the pool's unit as a user too.
  const poolUsers = new Map<string, WikiRecord[]>();
  for (const u of units) {
    for (const k of (u.randomAbilityPool as string[]) || []) {
      if (!poolUsers.has(k)) poolUsers.set(k, []);
      poolUsers.get(k)!.push(u);
    }
  }

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

  const resolved = shown.map((a) => {
    const users: ResolvedUser[] = [];
    const unresolved: string[] = [];
    for (const name of (a.grantedBy as string[]) || []) {
      const user = resolveUser(name, unitByName, bldByName);
      if (user) users.push(user);
      else unresolved.push(name);
    }
    for (const u of poolUsers.get(a.key) || []) {
      if (!users.some((x) => x.rec.id === u.id)) {
        users.push({
          label: u.displayName || u.key,
          href: `/wiki/unit/${slugOf(u.key)}`,
          rec: u,
          isBuilding: false,
          fromPool: true,
        });
      }
    }
    return { a, users, unresolved };
  });

  const inUse = resolved.filter(
    (r) => r.users.length > 0 || r.unresolved.length > 0,
  );
  const unused = resolved.filter(
    (r) => r.users.length === 0 && r.unresolved.length === 0,
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">All abilities</h1>
      <p className="mt-2 text-bh-mute">
        Every ability in the game, A to Z: {shown.length} spells, passives, and
        autocasts.
      </p>

      <h2 className="font-display text-2xl mt-10 mb-1">In use</h2>
      <p className="mb-4 text-sm text-bh-mute">
        {inUse.length} abilities carried by a unit or building right now.
      </p>
      <div className="grid gap-3 sm:grid-cols-2">
        {inUse.map(({ a, users, unresolved }) => (
          <AbilityCard key={a.id} a={a} users={users} unresolved={unresolved} />
        ))}
      </div>

      {unused.length > 0 ? (
        <>
          <h2 className="font-display text-2xl mt-12 mb-1">Not yet in use</h2>
          <p className="mb-4 text-sm text-bh-mute">
            {unused.length} abilities that exist in the game data but are not
            granted by any current unit or building.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {unused.map(({ a, users, unresolved }) => (
              <AbilityCard
                key={a.id}
                a={a}
                users={users}
                unresolved={unresolved}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
