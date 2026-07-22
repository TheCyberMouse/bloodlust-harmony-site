import IconImg from "@/components/IconImg";
import { GameText } from "@/lib/richtext";
import { listAbilities } from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = { title: "All abilities" };

export default async function AbilitiesIndex() {
  const abilities = await listAbilities();

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
        {shown.map((a) => (
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
              {((a.grantedBy as string[]) || []).length > 0 ? (
                <p className="text-xs text-bh-mute/70 mt-2 truncate">
                  Used by: {((a.grantedBy as string[]) || []).join(", ")}
                </p>
              ) : null}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
