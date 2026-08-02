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

  // Computed once and rendered twice: as a wide table on desktop, and as a
  // stack of per-element cards on mobile. Deriving both from the same array is
  // what stops the two views drifting apart.
  type Defence = {
    label: string;
    icon?: string;
    title: string | null;
    sub: string;
    tone?: string;
    carriers: Carrier[];
  };
  const defencesFor = (el: string): Defence[] => {
    const out: Defence[] = [];

    const weak = weaknesses.find((a) => a.weaknessElement === el);
    out.push({
      label: "Weak",
      icon: weak ? meta.weaknessIcons?.[weak.resistTag as string] : undefined,
      title: weak ? `+${weak.weaknessPercent}%` : null,
      sub: weak ? ((weak.displayName as string) || "") : "",
      tone: "text-bh-blood",
      carriers: weak ? carriersFor(weak) : [],
    });

    for (const t of TIERS) {
      const ability = resists.find(
        (a) => a.resistElement === el && a.resistTier === t.key,
      );
      out.push({
        label: t.label,
        icon: ability
          ? meta.resistIcons?.[ability.resistTag as string]
          : undefined,
        title: ability ? `−${ability.resistPercent}%` : null,
        sub: ability ? ((ability.displayName as string) || "") : "",
        carriers: ability ? carriersFor(ability) : [],
      });
    }

    const immuneIcon =
      meta.immunityIcons?.[el.replace("Damage.Element.", "Unit.Immune.")];
    out.push({
      label: "Immune",
      icon: immuneIcon,
      // A missing immunity icon means the element genuinely has none (Shadow,
      // Acid) - distinct from "nobody carries it", so it gets its own wording.
      title: immuneIcon ? "Immune" : null,
      sub: immuneIcon ? "takes no damage" : "no immunity",
      tone: "text-bh-gold",
      carriers: immuneIcon ? immuneByElement.get(el) || [] : [],
    });

    return out;
  };

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

      {/* Desktop: the wide table. Hidden below md - at 389px it is 648px
          wide and scrolls sideways, which is a poor way to read a reference. */}
      <div className="hidden md:block overflow-x-auto">
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
            {elements.map((el) => (
              <tr key={el}>
                <td className="align-top px-3 py-3 border-t border-bh-rule">
                  <span className="flex items-center gap-2">
                    <IconImg
                      file={meta.damageElementIcons?.[el]}
                      size={28}
                      alt=""
                    />
                    <span className="text-sm font-medium text-bh-ink">
                      {tagLeaf(el)}
                    </span>
                  </span>
                </td>
                {defencesFor(el).map((d) =>
                  d.title ? (
                    <Cell
                      key={d.label}
                      icon={d.icon}
                      title={d.title}
                      tone={d.tone}
                      sub={d.sub}
                      carriers={d.carriers}
                      meta={meta}
                    />
                  ) : d.label === "Immune" ? (
                    <td
                      key={d.label}
                      className="align-top px-3 py-3 border-t border-bh-rule text-xs text-bh-mute/60"
                    >
                      no immunity
                    </td>
                  ) : (
                    <Empty key={d.label} />
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: one card per element, defences stacked as labelled rows.
          Same data, read top-to-bottom instead of left-to-right. */}
      <div className="md:hidden space-y-3">
        {elements.map((el) => (
          <div
            key={el}
            className="rounded-lg border border-bh-rule bg-bh-panel p-4"
          >
            <div className="flex items-center gap-2">
              <IconImg file={meta.damageElementIcons?.[el]} size={28} alt="" />
              <span className="font-medium text-bh-ink">{tagLeaf(el)}</span>
            </div>
            <dl className="mt-3 space-y-2">
              {defencesFor(el).map((d) => (
                <div
                  key={d.label}
                  className="flex items-start gap-3 border-t border-bh-rule pt-2"
                >
                  <dt className="w-20 shrink-0 text-xs uppercase tracking-wide text-bh-mute">
                    {d.label}
                  </dt>
                  <dd className="min-w-0 flex-1">
                    {d.title ? (
                      <>
                        <span className="flex items-center gap-2">
                          {d.icon ? (
                            <IconImg file={d.icon} size={22} alt="" />
                          ) : null}
                          <span className={`text-sm ${d.tone || "text-bh-ink"}`}>
                            {d.title}
                          </span>
                        </span>
                        {d.carriers.length > 0 ? (
                          <span className="mt-1.5 block">
                            <Carriers carriers={d.carriers} meta={meta} />
                          </span>
                        ) : null}
                      </>
                    ) : (
                      <span className="text-xs text-bh-mute/50">
                        {d.label === "Immune" ? "no immunity" : "—"}
                      </span>
                    )}
                  </dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
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
