import Link from "next/link";
import HoverCard from "@/components/HoverCard";
import IconImg from "@/components/IconImg";
import { matrixTone, tagLeaf } from "@/lib/wiki";
import type { DamageMatrix, WikiMeta } from "@/lib/wiki";

/**
 * Large attack-type / armor-type entry for a unit's stat card. Hovering shows
 * that type's slice of the damage matrix (its row for attack types, its
 * column for armor types); clicking goes to the full matrix page.
 */
export default function TypeStat({
  kind,
  tag,
  meta,
}: {
  kind: "attack" | "armor";
  tag: string;
  meta: WikiMeta & { damageMatrix?: DamageMatrix };
}) {
  const matrix = meta.damageMatrix;
  const iconMap = kind === "attack" ? meta.attackTypeIcons : meta.armorTypeIcons;
  const otherMap = kind === "attack" ? meta.armorTypeIcons : meta.attackTypeIcons;
  const leaf = tagLeaf(tag);

  const rows = matrix
    ? kind === "attack"
      ? matrix.armorTypes.map((a) => ({
          tag: a,
          mult: matrix.rows[tag]?.[a] ?? 1.0,
        }))
      : matrix.attackTypes.map((t) => ({
          tag: t,
          mult: matrix.rows[t]?.[tag] ?? 1.0,
        }))
    : [];

  const panel =
    rows.length > 0 ? (
      <span className="block w-56">
        <span className="mb-2 block text-xs text-bh-mute">
          {kind === "attack"
            ? `${leaf} damage vs each armor type`
            : `Damage taken by ${leaf} armor`}
        </span>
        {rows.map((r) => (
          <span
            key={r.tag}
            className="flex items-center justify-between gap-3 py-0.5"
          >
            <span className="flex items-center gap-2 text-sm text-bh-ink">
              <IconImg file={otherMap?.[r.tag]} size={20} alt="" />
              {tagLeaf(r.tag)}
            </span>
            <span
              className={`rounded px-1.5 text-sm tabular-nums ${matrixTone(r.mult)}`}
            >
              x{r.mult.toFixed(2)}
            </span>
          </span>
        ))}
      </span>
    ) : null;

  return (
    <HoverCard panel={panel}>
      <Link
        href="/wiki/matrix"
        className="flex items-center gap-3 hover:opacity-80 transition-opacity"
      >
        <IconImg file={iconMap?.[tag]} size={48} alt="" />
        <span>
          <span className="block text-xs text-bh-mute">
            {kind === "attack" ? "Attack type" : "Armor type"}
          </span>
          <span className="block text-lg font-medium">{leaf}</span>
        </span>
      </Link>
    </HoverCard>
  );
}
