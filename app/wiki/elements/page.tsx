import Link from "next/link";
import ElementalDefences from "@/components/ElementalDefences";
import IconImg from "@/components/IconImg";
import JsonLd, { breadcrumbLd } from "@/components/JsonLd";
import UnitChip from "@/components/UnitChip";
import {
  getWikiMeta,
  listAbilities,
  listUnits,
  tagLeaf,
  type WikiRecord,
} from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = {
  title: "Elemental damage",
  description:
    "How elemental damage works in Bloodlust & Harmony: the seven elements, weakness, resistance and immunity, and why elements are the game's only hard counter.",
  alternates: { canonical: "/wiki/elements" },
};

export default async function ElementsPage() {
  const [abilities, units, meta] = await Promise.all([
    listAbilities(),
    listUnits(),
    getWikiMeta(),
  ]);

  // Which units actually deal each element, straight from UnitDefinition
  // .DamageElement — this is the offensive half the defences table implies.
  const dealersByElement = new Map<string, WikiRecord[]>();
  for (const u of units) {
    const el = u.damageElement as string | undefined;
    if (!el) continue;
    if (u.unassigned) continue; // not reachable in a match
    const list = dealersByElement.get(el) || [];
    list.push(u);
    dealersByElement.set(el, list);
  }
  const dealerElements = [...dealersByElement.keys()].sort((a, b) =>
    tagLeaf(a).localeCompare(tagLeaf(b)),
  );

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <JsonLd
        data={breadcrumbLd([
          { name: "Wiki", path: "/wiki" },
          { name: "Elemental damage", path: "/wiki/elements" },
        ])}
      />

      <h1 className="font-display text-4xl">Elemental damage</h1>

      <div className="mt-4 max-w-prose space-y-3 text-bh-mute leading-relaxed">
        <p>
          Almost every counter in this game is soft. The{" "}
          <Link
            href="/wiki/matrix"
            className="text-bh-blood hover:text-bh-bloodInk transition-colors"
          >
            damage matrix
          </Link>{" "}
          nudges a matchup up or down, armour shaves a slice off, and a bad
          composition still trades — just badly. Elements are the exception.
          They are the one axis where a matchup can become{" "}
          <strong className="text-bh-ink">absolute</strong>: an immune unit
          takes literally nothing from that element, no matter how much damage
          you stack behind it.
        </p>
        <p>
          Elements are a <strong className="text-bh-ink">separate axis</strong>{" "}
          from attack and armour type. A fireball is Spell damage on the matrix{" "}
          <em>and</em> Fire on the elemental axis, and the two are resolved
          independently. A unit can be resistant to spells and weak to fire at
          the same time.
        </p>
      </div>

      <h2 className="font-display text-2xl mt-12 mb-1">The three defences</h2>
      <div className="mt-2 max-w-prose space-y-3 text-bh-mute leading-relaxed">
        <p>
          <strong className="text-bh-ink">Weakness</strong> raises incoming
          damage of one element by 50%. There is only one grade — every weakness
          is the same size. It affects damage only: a fire-weak unit is not
          easier to chill, poison or shock.
        </p>
        <p>
          <strong className="text-bh-ink">Resistance</strong> lowers it, in
          three grades: 25%, 50% or 75%. Grades never stack — a unit carrying two
          of the same element uses the strongest. Resistance also blocks that
          element&apos;s status effect outright, at every grade, so even the
          cheapest tier stops the chill or the poison entirely.
        </p>
        <p>
          <strong className="text-bh-ink">Immunity</strong> removes the element
          completely — zero damage, and no status from it either. Immunity
          outranks everything else. Shadow and Acid deliberately have no
          immunity: that damage can be reduced, never erased.
        </p>
        <p>
          Weakness and resistance are independent, so a unit holding both simply
          multiplies them together. All of it lands{" "}
          <em>before</em> armour, so armour still applies on top.
        </p>
      </div>

      <ElementalDefences
        abilities={abilities}
        units={units}
        meta={meta}
        heading="Every element, every defence"
        intro={
          <p className="mb-4 max-w-prose text-sm text-bh-mute">
            Read a row left to right and watch the same element go from
            amplified, through three grades of resistance, to nothing at all.
            Icons under each cell are the units that carry it — hover for a
            name, click to open the unit.
          </p>
        }
      />

      {dealerElements.length > 0 ? (
        <section className="mt-14">
          <h2 className="font-display text-2xl mb-1">Who deals what</h2>
          <p className="mb-4 max-w-prose text-sm text-bh-mute">
            Units whose ordinary attacks carry an element. Their basic attacks
            are amplified or erased by the table above — which is what makes a
            single immune defender able to blank an entire army.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            {dealerElements.map((el) => (
              <div
                key={el}
                className="rounded-lg border border-bh-rule bg-bh-panel p-4"
              >
                <div className="flex items-center gap-2">
                  <IconImg
                    file={meta.damageElementIcons?.[el]}
                    size={28}
                    alt=""
                  />
                  <span className="font-medium text-bh-ink">{tagLeaf(el)}</span>
                  <span className="text-xs text-bh-mute">
                    {dealersByElement.get(el)!.length} unit
                    {dealersByElement.get(el)!.length === 1 ? "" : "s"}
                  </span>
                </div>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {dealersByElement.get(el)!.map((d) => (
                    <UnitChip
                      key={d.id as string}
                      unit={d}
                      size={30}
                      meta={meta}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mt-14 max-w-prose space-y-3 text-bh-mute leading-relaxed">
        <h2 className="font-display text-2xl text-bh-ink">How to use it</h2>
        <p>
          Elemental units hit hard and uniformly — until they meet the one
          defender built against them. If an ooze wave suddenly stops working,
          check what the enemy added rather than adding more oozes; a single
          immunity in the front line can blank the whole composition.
        </p>
        <p>
          From the other side, elemental damage is the sharpest tool you have
          against a known composition. A weakness is worth more than most
          upgrades, and it applies to elemental bonus damage too — so an
          elemental arrow passive gets the same multiplier as the attack itself.
        </p>
      </section>

      <p className="mt-12 text-sm">
        <Link
          href="/wiki/matrix"
          className="text-bh-blood hover:text-bh-bloodInk transition-colors"
        >
          The damage matrix
        </Link>
        <span className="text-bh-mute"> · </span>
        <Link
          href="/wiki/abilities"
          className="text-bh-blood hover:text-bh-bloodInk transition-colors"
        >
          All abilities
        </Link>
        <span className="text-bh-mute"> · </span>
        <Link
          href="/wiki/statuses"
          className="text-bh-blood hover:text-bh-bloodInk transition-colors"
        >
          Status effects
        </Link>
      </p>
    </div>
  );
}
