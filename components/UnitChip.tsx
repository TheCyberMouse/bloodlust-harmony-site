import Link from "next/link";
import HoverCard from "@/components/HoverCard";
import IconImg from "@/components/IconImg";
import { dpsOf, slugOf, tagLeaf, type WikiMeta, type WikiRecord } from "@/lib/wiki";

/**
 * A unit icon that links to its page and shows a stat tooltip on hover.
 *
 * Used anywhere a bare unit icon would otherwise be an unlabelled square — the
 * elemental tables list units by icon alone, so without this the reader has to
 * click through just to find out who they are looking at.
 *
 * The panel carries the unit's ELEMENTAL profile (damage element, immunities)
 * alongside the usual class/HP/DPS line, because every place this component is
 * used is reasoning about elements.
 */
export default function UnitChip({
  unit,
  size = 26,
  meta,
  isBuilding = false,
  note,
}: {
  unit: WikiRecord;
  size?: number;
  /** Optional: enables the element/immunity icons in the tooltip. */
  meta?: WikiMeta;
  /** Buildings share this chip - they just link and summarise differently. */
  isBuilding?: boolean;
  /** Extra qualifier shown under the name, e.g. "random roll". */
  note?: string;
}) {
  const label = unit.displayName || unit.key;
  const stats = (unit.stats as Record<string, number>) || {};
  const dps = dpsOf(stats);
  const element = unit.damageElement as string | undefined;
  const immunities = (unit.immuneElements as string[]) || [];

  const line = (
    isBuilding
      ? [
          "Building",
          stats.MaxHealth ? `${stats.MaxHealth} HP` : null,
          (unit.costGold as number) ? `${unit.costGold}g` : null,
        ]
      : [
          unit.unitClass ? tagLeaf(unit.unitClass as string) : null,
          stats.MaxHealth ? `${stats.MaxHealth} HP` : null,
          dps !== null ? `${dps} DPS` : null,
          note || null,
        ]
  )
    .filter(Boolean)
    .join(" · ");

  const panel = (
    <span className="block w-56">
      <span className="flex items-center gap-2.5">
        <IconImg file={unit.icon} size={36} alt="" />
        <span className="block text-left">
          <span className="block text-sm font-medium text-bh-ink">{label}</span>
          {line ? (
            <span className="block text-xs text-bh-mute">{line}</span>
          ) : null}
        </span>
      </span>

      {element ? (
        <span className="mt-2 flex items-center gap-1.5">
          <IconImg file={meta?.damageElementIcons?.[element]} size={18} alt="" />
          <span className="text-xs text-bh-mute">
            Deals{" "}
            <span className="text-bh-blood">{tagLeaf(element)}</span> damage
          </span>
        </span>
      ) : null}

      {immunities.length > 0 ? (
        <span className="mt-1 flex items-center gap-1.5">
          {immunities.map((t) => (
            <IconImg key={t} file={meta?.immunityIcons?.[t]} size={18} alt="" />
          ))}
          <span className="text-xs text-bh-mute">
            Immune to{" "}
            <span className="text-bh-gold">
              {immunities.map(tagLeaf).join(", ")}
            </span>
          </span>
        </span>
      ) : null}
    </span>
  );

  return (
    <HoverCard panel={panel}>
      <Link
        href={`/wiki/${isBuilding ? "building" : "unit"}/${slugOf(unit.key)}`}
        aria-label={label}
        className="block hover:opacity-75 transition-opacity"
      >
        <IconImg file={unit.icon} size={size} alt={label} />
      </Link>
    </HoverCard>
  );
}
