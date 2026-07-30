import Link from "next/link";
import HoverCard from "@/components/HoverCard";
import IconImg from "@/components/IconImg";
import { slugOf, tagLeaf, type WikiMeta, type WikiRecord } from "@/lib/wiki";

/**
 * One table covering every elemental defence in the game: immunity (total) and
 * the three resistance tiers (partial), per element.
 *
 * The 21 resistance passives are pure C++ classes, so nothing about them can be
 * authored per-asset - element, tier and percentage are exported as structured
 * fields (`resistElement` / `resistTier` / `resistPercent`) and the icons come
 * from the `resistIcons` tag map in meta. Grouping is therefore data-driven; no
 * display-name string matching.
 *
 * Weaknesses do not exist in the game yet. The column is deliberately absent
 * rather than shown empty - see the note under the table.
 */

const TIERS = [
  { key: "Lesser", label: "Lesser" },
  { key: "Normal", label: "Standard" },
  { key: "Greater", label: "Greater" },
] as const;

type Carrier = { label: string; href: string; icon?: string };

function Carriers({ carriers }: { carriers: Carrier[] }) {
  if (carriers.length === 0) {
    return <span className="text-xs text-bh-mute/50">—</span>;
  }
  return (
    <span className="flex flex-wrap gap-1">
      {carriers.map((c) => (
        <HoverCard
          key={c.href + c.label}
          panel={
            <span className="flex items-center gap-2.5">
              <IconImg file={c.icon} size={36} alt="" />
              <span className="block text-sm font-medium text-bh-ink">
                {c.label}
              </span>
            </span>
          }
        >
          <Link
            href={c.href}
            aria-label={c.label}
            className="block hover:opacity-75 transition-opacity"
          >
            <IconImg file={c.icon} size={26} alt={c.label} />
          </Link>
        </HoverCard>
      ))}
    </span>
  );
}

function Cell({
  icon,
  title,
  sub,
  carriers,
}: {
  icon?: string;
  title: string;
  sub: string;
  carriers: Carrier[];
}) {
  return (
    <td className="align-top px-3 py-3 border-t border-bh-rule">
      <span className="flex items-start gap-2">
        {icon ? <IconImg file={icon} size={28} alt="" /> : null}
        <span className="block">
          <span className="block text-sm text-bh-ink">{title}</span>
          <span className="block text-xs text-bh-mute">{sub}</span>
        </span>
      </span>
      <span className="mt-2 block">
        <Carriers carriers={carriers} />
      </span>
    </td>
  );
}

export default function ElementalDefences({
  abilities,
  units,
  meta,
}: {
  abilities: WikiRecord[];
  units: WikiRecord[];
  meta: WikiMeta;
}) {
  const unitByName = new Map(
    units.map((u) => [u.displayName || u.key, u] as const),
  );
  const carrierOf = (name: string): Carrier | null => {
    // Buildings can carry these too, but they arrive suffixed; the elemental
    // defences are unit-side in practice, so resolve units and skip the rest.
    const rec = unitByName.get(name);
    if (!rec) return null;
    return {
      label: rec.displayName || rec.key,
      href: `/wiki/unit/${slugOf(rec.key)}`,
      icon: rec.icon as string | undefined,
    };
  };

  // Elements come from the data, not a hardcoded list, so a new element added
  // to the game shows up here on the next sync with no code change.
  const resists = abilities.filter((a) => a.resistElement);
  const elements = [
    ...new Set([
      ...resists.map((a) => a.resistElement as string),
      ...Object.keys(meta.immunityIcons || {}).map((t) =>
        t.replace("Unit.Immune.", "Damage.Element."),
      ),
    ]),
  ].sort((a, b) => tagLeaf(a).localeCompare(tagLeaf(b)));

  if (elements.length === 0) return null;

  // Immunity is a unit field (immuneElements), not an ability.
  const immuneByElement = new Map<string, Carrier[]>();
  for (const u of units) {
    for (const tag of (u.immuneElements as string[]) || []) {
      const el = tag.replace("Unit.Immune.", "Damage.Element.");
      if (!immuneByElement.has(el)) immuneByElement.set(el, []);
      immuneByElement.set(el, [
        ...immuneByElement.get(el)!,
        {
          label: u.displayName || u.key,
          href: `/wiki/unit/${slugOf(u.key)}`,
          icon: u.icon as string | undefined,
        },
      ]);
    }
  }

  return (
    <section className="mt-14">
      <h2 className="font-display text-2xl mb-1">Elemental defences</h2>
      <p className="mb-4 text-sm text-bh-mute">
        Immunity removes an element entirely; resistance only softens it.
        Immunity always outranks resistance, tiers of the same element never
        stack, and armour still applies on top. Resistance also blocks that
        element&rsquo;s status effect &mdash; at every tier.
      </p>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-bh-mute">
              <th className="px-3 py-2 font-medium">Element</th>
              <th className="px-3 py-2 font-medium">Immune</th>
              {TIERS.map((t) => (
                <th key={t.key} className="px-3 py-2 font-medium">
                  {t.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {elements.map((el) => {
              const leaf = tagLeaf(el);
              const immuneTag = el.replace("Damage.Element.", "Unit.Immune.");
              const immuneIcon = meta.immunityIcons?.[immuneTag];
              const hasImmunity = Boolean(immuneIcon);
              return (
                <tr key={el}>
                  <td className="align-top px-3 py-3 border-t border-bh-rule">
                    <span className="flex items-center gap-2">
                      <IconImg
                        file={meta.damageElementIcons?.[el]}
                        size={28}
                        alt=""
                      />
                      <span className="text-sm font-medium text-bh-ink">
                        {leaf}
                      </span>
                    </span>
                  </td>

                  {hasImmunity ? (
                    <Cell
                      icon={immuneIcon}
                      title="Immune"
                      sub="takes no damage"
                      carriers={immuneByElement.get(el) || []}
                    />
                  ) : (
                    <td className="align-top px-3 py-3 border-t border-bh-rule text-xs text-bh-mute/60">
                      no immunity
                    </td>
                  )}

                  {TIERS.map((t) => {
                    const ability = resists.find(
                      (a) =>
                        a.resistElement === el && a.resistTier === t.key,
                    );
                    if (!ability) {
                      return (
                        <td
                          key={t.key}
                          className="align-top px-3 py-3 border-t border-bh-rule text-xs text-bh-mute/50"
                        >
                          —
                        </td>
                      );
                    }
                    const carriers = (
                      ((ability.grantedBy as string[]) || [])
                        .map(carrierOf)
                        .filter(Boolean) as Carrier[]
                    );
                    return (
                      <Cell
                        key={t.key}
                        icon={
                          meta.resistIcons?.[ability.resistTag as string]
                        }
                        title={`−${ability.resistPercent}%`}
                        sub={(ability.displayName as string) || ""}
                        carriers={carriers}
                      />
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-bh-mute/70">
        Shadow and Acid have no immunity by design &mdash; that damage is only
        ever reduced, never removed. Elemental weaknesses are not in the game
        yet; they will appear here as a further column.
      </p>
    </section>
  );
}
