import Link from "next/link";
import IconImg from "@/components/IconImg";
import { dpsOf, slugOf, tagLeaf, type WikiRecord } from "@/lib/wiki";

/** Compact unit link card: icon, name, class · HP · DPS. Used by the units
 *  index and the faction pages. */
export default function UnitCard({ u }: { u: WikiRecord }) {
  const stats = (u.stats as Record<string, number>) || {};
  const dps = dpsOf(stats);
  return (
    <Link
      href={`/wiki/unit/${slugOf(u.key)}`}
      className="group flex items-center gap-3 rounded-lg border border-bh-rule bg-bh-panel p-3 hover:border-bh-blood transition-colors"
    >
      <IconImg file={u.icon} size={44} alt="" />
      <div className="min-w-0">
        <div className="font-medium truncate group-hover:text-bh-blood transition-colors">
          {u.displayName || u.key}
        </div>
        <div className="text-xs text-bh-mute truncate">
          {[
            u.unitClass ? tagLeaf(u.unitClass as string) : null,
            stats.MaxHealth ? `${stats.MaxHealth} HP` : null,
            dps !== null ? `${dps} DPS` : null,
          ]
            .filter(Boolean)
            .join(" · ")}
        </div>
      </div>
    </Link>
  );
}

/** Tree-grouped unit grid: units from one tech tree (a spawner and its
 *  upgrades) share a row; single-unit trees pool together at the end. */
export function UnitTreeRows({ trees }: { trees: WikiRecord[][] }) {
  const multi = trees.filter((t) => t.length > 1);
  const singles = trees.filter((t) => t.length === 1).flat();
  return (
    <div className="space-y-3">
      {multi.map((tree) => (
        <div key={tree[0].id} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {tree.map((u) => (
            <UnitCard key={u.id} u={u} />
          ))}
        </div>
      ))}
      {singles.length > 0 ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {singles.map((u) => (
            <UnitCard key={u.id} u={u} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
