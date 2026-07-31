import Link from "next/link";
import IconImg from "@/components/IconImg";
import UnitChip from "@/components/UnitChip";
import { tagLeaf, type WikiMeta, type WikiRecord } from "@/lib/wiki";

/**
 * One table covering every elemental defence in the game, ordered worst-case to
 * best-case for the attacker: weakness (+50%), the three resistance tiers, then
 * immunity (total). That left-to-right ramp is the point of the layout - you
 * read across a row and watch the same element go from amplified to erased.
 *
 * The resistance and weakness passives are pure C++ classes, so nothing about
 * them can be authored per-asset: element, tier and percentage are exported as
 * structured fields (`resistElement` / `resistTier` / `resistPercent`,
 * `weaknessElement` / `weaknessPercent`) and the icons come from the
 * `resistIcons` / `weaknessIcons` tag maps in meta. Grouping is therefore
 * data-driven - no display-name string matching.
 *
 * Shared by /wiki/abilities, /wiki/matrix and /wiki/elements; the props only
 * change the framing around the table, never the table itself.
 */

const TIERS = [
  { key: "Lesser", label: "Lesser" },
  { key: "Normal", label: "Standard" },
  { key: "Greater", label: "Greater" },
] as const;

/** Carriers are full unit records, not stripped label/href pairs, so the hover
 *  tooltip can show real stats instead of just repeating the name. */
type Carrier = WikiRecord;

function Carriers({ carriers, meta }: { carriers: Carrier[]; meta: WikiMeta }) {
  if (carriers.length === 0) {
    return <span className="text-xs text-bh-mute/50">—</span>;
  }
  return (
    <span className="flex flex-wrap gap-1">
      {carriers.map((c) => (
        <UnitChip key={c.id as string} unit={c} meta={meta} />
      ))}
    </span>
  );
}

function Cell({
  icon,
  title,
  tone,
  sub,
  carriers,
  meta,
}: {
  icon?: string;
  title: string;
  tone?: string;
  sub: string;
  carriers: Carrier[];
  meta: WikiMeta;
}) {
  return (
    <td className="align-top px-3 py-3 border-t border-bh-rule">
      <span className="flex items-start gap-2">
        {icon ? <IconImg file={icon} size={28} alt="" /> : null}
        <span className="block">
          <span className={`block text-sm ${tone || "text-bh-ink"}`}>
            {title}
          </span>
          <span className="block text-xs text-bh-mute">{sub}</span>
        </span>
      </span>
      <span className="mt-2 block">
        <Carriers carriers={carriers} meta={meta} />
      </span>
    </td>
  );
}

const Empty = () => (
  <td className="align-top px-3 py-3 border-t border-bh-rule text-xs text-bh-mute/50">
    —
  </td>
);

export default function ElementalDefences({
  abilities,
  units,
  meta,
  heading = "Elemental defences",
  intro,
  showFootnote = true,
  moreHref,
  moreLabel = "Full elemental damage guide",
}: {
  abilities: WikiRecord[];
  units: WikiRecord[];
  meta: WikiMeta;
  heading?: string | null;
  intro?: React.ReactNode;
  showFootnote?: boolean;
  moreHref?: string;
  moreLabel?: string;
}) {
  const unitByName = new Map(
    units.map((u) => [u.displayName || u.key, u] as const),
  );
  // Buildings can carry these too, but they arrive suffixed; the elemental
  // defences are unit-side in practice, so resolve units and skip the rest.
  const carriersFor = (a: WikiRecord): Carrier[] =>
    ((a.grantedBy as string[]) || [])
      .map((name) => unitByName.get(name))
      .filter(Boolean) as Carrier[];

  const resists = abilities.filter((a) => a.resistElement);
  const weaknesses = abilities.filter((a) => a.weaknessElement);

  // Elements come from the data, not a hardcoded list, so a new element added
  // to the game shows up here on the next sync with no code change.
  const elements = [
    ...new Set([
      ...resists.map((a) => a.resistElement as string),
      ...weaknesses.map((a) => a.weaknessElement as string),
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
      const list = immuneByElement.get(el) || [];
      list.push(u);
      immuneByElement.set(el, list);
    }
  }

  return (
    <section className="mt-14">
      {heading ? (
        <h2 className="font-display text-2xl mb-1">{heading}</h2>
      ) : null}

      {intro ?? (
        <p className="mb-4 max-w-prose text-sm text-bh-mute">
          Most counters in this game are soft. Elements are the exception: a
          weakness makes a matchup half again as punishing, and an immunity
          erases it outright. Read a row left to right and the same element goes
          from amplified, through three grades of resistance, to nothing at all.
        </p>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-xs uppercase tracking-wide text-bh-mute">
              <th className="px-3 py-2 font-medium">Element</th>
              <th className="px-3 py-2 font-medium">Weak</th>
              {TIERS.map((t) => (
                <th key={t.key} className="px-3 py-2 font-medium">
                  {t.label}
                </th>
              ))}
              <th className="px-3 py-2 font-medium">Immune</th>
            </tr>
          </thead>
          <tbody>
            {elements.map((el) => {
              const leaf = tagLeaf(el);
              const immuneTag = el.replace("Damage.Element.", "Unit.Immune.");
              const immuneIcon = meta.immunityIcons?.[immuneTag];
              const weak = weaknesses.find((a) => a.weaknessElement === el);
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

                  {weak ? (
                    <Cell
                      icon={meta.weaknessIcons?.[weak.resistTag as string]}
                      title={`+${weak.weaknessPercent}%`}
                      tone="text-bh-blood"
                      sub={(weak.displayName as string) || ""}
                      carriers={carriersFor(weak)}
                      meta={meta}
                    />
                  ) : (
                    <Empty />
                  )}

                  {TIERS.map((t) => {
                    const ability = resists.find(
                      (a) => a.resistElement === el && a.resistTier === t.key,
                    );
                    if (!ability) return <Empty key={t.key} />;
                    return (
                      <Cell
                        key={t.key}
                        icon={meta.resistIcons?.[ability.resistTag as string]}
                        title={`−${ability.resistPercent}%`}
                        sub={(ability.displayName as string) || ""}
                        carriers={carriersFor(ability)}
                        meta={meta}
                      />
                    );
                  })}

                  {immuneIcon ? (
                    <Cell
                      icon={immuneIcon}
                      title="Immune"
                      tone="text-bh-gold"
                      sub="takes no damage"
                      carriers={immuneByElement.get(el) || []}
                      meta={meta}
                    />
                  ) : (
                    <td className="align-top px-3 py-3 border-t border-bh-rule text-xs text-bh-mute/60">
                      no immunity
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showFootnote ? (
        <p className="mt-3 max-w-prose text-xs text-bh-mute/70">
          Shadow and Acid have no immunity by design — that damage is only ever
          reduced, never removed. Weaknesses are untiered: every one is the same
          +50%.
        </p>
      ) : null}

      {moreHref ? (
        <p className="mt-4 text-sm">
          <Link
            href={moreHref}
            className="text-bh-blood hover:text-bh-bloodInk transition-colors"
          >
            {moreLabel} →
          </Link>
        </p>
      ) : null}
    </section>
  );
}
