import IconImg from "@/components/IconImg";
import { getWikiMeta, matrixTone, tagLeaf } from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = {
  title: "Damage matrix",
  description:
    "The full attack-vs-armor damage table for Bloodlust & Harmony, plus armor formulas and exactly how every hit is calculated.",
  alternates: { canonical: "/wiki/matrix" },
};

export default async function MatrixPage() {
  const meta = await getWikiMeta();
  const matrix = meta.damageMatrix;

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">The damage matrix</h1>
      <div className="mt-4 max-w-prose space-y-3 text-bh-mute leading-relaxed">
        <p>
          Every attack in the game has an <strong className="text-bh-ink">attack type</strong>{" "}
          and every unit has an <strong className="text-bh-ink">armor type</strong>. When a
          hit lands, the game multiplies the damage by the cell where the two
          meet. That single table is the heart of countering: the same army
          that shreds one composition can bounce off another.
        </p>
        <p>
          Read it like this: find the attacker&apos;s row, the defender&apos;s
          column, and the number is the damage multiplier.{" "}
          <span className="text-green-400">Green cells deal extra damage</span>,{" "}
          <span className="text-red-400">red cells are resisted</span>, and 1.00
          is neutral. Elemental damage and immunities stack on top of this as a
          separate axis.
        </p>
      </div>

      {matrix ? (
        <div className="mt-10 overflow-x-auto">
          <table className="border-collapse text-base">
            <thead>
              <tr>
                <th className="p-3 text-left text-sm text-bh-mute font-normal">
                  Attack ↓ / Armor →
                </th>
                {matrix.armorTypes.map((armor) => (
                  <th key={armor} className="p-3 text-center font-normal">
                    <div className="flex flex-col items-center gap-1.5">
                      <IconImg
                        file={meta.armorTypeIcons?.[armor]}
                        size={56}
                        alt=""
                      />
                      <span className="text-sm">{tagLeaf(armor)}</span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {matrix.attackTypes.map((attack) => (
                <tr key={attack} className="border-t border-bh-rule">
                  <th className="p-3 text-left font-normal">
                    <div className="flex items-center gap-3">
                      <IconImg
                        file={meta.attackTypeIcons?.[attack]}
                        size={56}
                        alt=""
                      />
                      <span>{tagLeaf(attack)}</span>
                    </div>
                  </th>
                  {matrix.armorTypes.map((armor) => {
                    const mult = matrix.rows[attack]?.[armor] ?? 1.0;
                    return (
                      <td
                        key={armor}
                        className={`min-w-[5.5rem] p-3 text-center text-lg tabular-nums ${matrixTone(mult)}`}
                      >
                        {mult.toFixed(2)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p className="mt-10 text-bh-mute">
          The matrix data has not been synced yet. Run the wiki export and sync
          from the game, then refresh.
        </p>
      )}

      <div className="mt-12 max-w-prose space-y-3 text-bh-mute leading-relaxed">
        <h2 className="font-display text-2xl text-bh-ink">
          How a hit is calculated
        </h2>
        <p>
          Every hit runs the same pipeline, in this exact order. Knowing the
          order matters: a bonus that applies early gets multiplied by
          everything after it, and a flat bonus that applies late ignores armor
          entirely.
        </p>
        <ol className="list-decimal space-y-2 pl-5">
          <li>
            <strong className="text-bh-ink">Immunity gates.</strong> An
            invulnerable target takes zero from anything. A target immune to
            the hit&apos;s element (Fire, Ice, Poison, Lightning, Arcane) takes
            zero from that element. Spell-immune targets take zero from the
            Spells attack type. If any gate triggers, the hit ends here with an
            IMMUNE popup.
          </li>
          <li>
            <strong className="text-bh-ink">Base damage.</strong> The
            attacker&apos;s Damage stat, or the ability&apos;s own damage
            value for spells.
          </li>
          <li>
            <strong className="text-bh-ink">Conditional bonuses.</strong>{" "}
            &quot;+X% vs mounted&quot; and &quot;+X% vs heavy armor&quot;
            passives multiply the base damage now, before the matrix. That
            means they scale with a good matchup instead of being a flat
            add-on.
          </li>
          <li>
            <strong className="text-bh-ink">The matrix.</strong> Damage is
            multiplied by the cell above: attacker&apos;s attack type vs
            defender&apos;s armor type.
          </li>
          <li>
            <strong className="text-bh-ink">Partial resistances.</strong>{" "}
            &quot;Spell Resistant&quot; and &quot;Magic Resistant&quot;
            passives cut the matching attack type in half (x0.5) here. This is
            the &quot;50% damage reduction against spells&quot; effect: it
            applies after the matrix and stacks with normal mitigation below.
          </li>
          <li>
            <strong className="text-bh-ink">Armor or magic resist.</strong>{" "}
            Magic and Spells attacks are reduced by the target&apos;s Magic
            Resist percentage. Every other attack type is reduced by Armor
            using the formulas below.
          </li>
          <li>
            <strong className="text-bh-ink">Flat riders.</strong> Armor-bypass
            bonuses (Flame Arrow, Shadow Arrows, the Elemental Infusions,
            Thorns reflect) are added after mitigation, so they always land at
            full value. If the target is immune to a rider&apos;s element,
            only that rider is removed; the base hit still lands.
          </li>
          <li>
            <strong className="text-bh-ink">Amplifiers.</strong> Lightning
            damage against a Shocked target is multiplied by 1.25. A critical
            hit (Sniper headshot) doubles the final number last, so armor
            never shrinks the crit bonus separately.
          </li>
          <li>
            <strong className="text-bh-ink">Shield, then health.</strong> The
            final number drains the target&apos;s Shield first; whatever
            remains comes out of Health.
          </li>
        </ol>
      </div>

      <div className="mt-12 max-w-prose space-y-3 text-bh-mute leading-relaxed">
        <h2 className="font-display text-2xl text-bh-ink">
          The armor formula
        </h2>
        <p>
          Armor gives diminishing returns. Each point of positive armor is
          worth 6% before diminishing kicks in:
        </p>
        <p className="rounded border border-bh-rule bg-bh-panel px-4 py-3 font-mono text-sm text-bh-ink">
          damage taken = 1 / (1 + Armor x 0.06)
        </p>
        <p>
          Negative armor (from armor-shred effects) amplifies damage instead,
          on a curve that approaches but never exceeds double damage:
        </p>
        <p className="rounded border border-bh-rule bg-bh-panel px-4 py-3 font-mono text-sm text-bh-ink">
          damage taken = 2 - 0.94^|Armor| &nbsp;(caps at 200%)
        </p>
        <table className="mt-2 border-collapse text-sm">
          <thead>
            <tr className="text-left text-xs text-bh-mute">
              <th className="py-1.5 pr-8 font-normal">Armor</th>
              <th className="py-1.5 pr-8 font-normal">Damage you take</th>
              <th className="py-1.5 font-normal">Effect</th>
            </tr>
          </thead>
          <tbody className="tabular-nums">
            {[
              ["30", "36%", "64% reduced"],
              ["20", "45%", "55% reduced"],
              ["10", "63%", "37% reduced"],
              ["5", "77%", "23% reduced"],
              ["0", "100%", "neutral"],
              ["-5", "127%", "27% amplified"],
              ["-10", "146%", "46% amplified"],
              ["-20", "171%", "71% amplified"],
            ].map(([armor, taken, effect]) => (
              <tr key={armor} className="border-t border-bh-rule">
                <td className="py-1.5 pr-8">{armor}</td>
                <td className="py-1.5 pr-8">{taken}</td>
                <td className="py-1.5">{effect}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <p>
          One distinction matters here:{" "}
          <strong className="text-bh-ink">armor type</strong> (the matrix
          column) and the <strong className="text-bh-ink">Armor stat</strong>{" "}
          (the number) are two different things. Magic and Spells attacks use
          the matrix like everything else, so Magic vs Heavy still gets that
          cell&apos;s multiplier in full. What they skip is the Armor stat:
          in the mitigation step they are reduced by the target&apos;s Magic
          Resist instead of armor points. Magic Resist is a fraction, so 0.2
          means 20% less magic damage.
        </p>
      </div>

      <div className="mt-12 max-w-prose space-y-3 text-bh-mute leading-relaxed">
        <h2 className="font-display text-2xl text-bh-ink">
          Elements: the second axis
        </h2>
        <p>
          Separate from attack types, damage can carry an{" "}
          <strong className="text-bh-ink">element</strong>: Fire, Ice, Poison,
          Shadow, Acid, Lightning, or Arcane. A fireball is both
          &quot;Spells&quot; on the matrix and &quot;Fire&quot; on the element
          axis at the same time. Elements do not change the damage math by
          themselves; they drive three other things:
        </p>
        <ul className="list-disc space-y-2 pl-5">
          <li>
            <strong className="text-bh-ink">Immunities.</strong> Five elements
            can be blocked outright: a fire-immune unit takes zero Fire
            damage, full stop. Shadow and Acid have no immunity and always go
            through.
          </li>
          <li>
            <strong className="text-bh-ink">Statuses.</strong> Ice applies
            Chilled, Poison applies Poisoned, Lightning applies Shocked.
            Immune targets cannot receive the matching status either.
          </li>
          <li>
            <strong className="text-bh-ink">Interactions.</strong> Lightning
            damage hits Shocked targets 25% harder, and element-immune units
            counter same-element attackers completely.
          </li>
        </ul>
      </div>

      <div className="mt-12 max-w-prose space-y-3 text-bh-mute leading-relaxed">
        <h2 className="font-display text-2xl text-bh-ink">Worked examples</h2>
        <p>
          <strong className="text-bh-ink">
            50% damage reduction against spells.
          </strong>{" "}
          A caster hits a Spell Resistant unit with a 100 damage spell. The
          matrix cell for Spells vs that armor type is, say, 1.00, so the hit
          is still 100 after step 4. Spell Resistant halves it to 50. The
          target&apos;s 20% Magic Resist then takes it to 40. Armor is never
          consulted, because Spells damage is magical. Final hit: 40.
        </p>
        <p>
          <strong className="text-bh-ink">+50% damage to mounted units.</strong>{" "}
          A spearman with 40 damage and the anti-mounted passive hits a knight
          (Mounted, 10 armor). The bonus applies first: 40 x 1.5 = 60. The
          matrix multiplies next; with a 1.25 matchup that is 75. Then the
          knight&apos;s 10 armor reduces it to 63% of that: about 47. Because
          the bonus lands before the matrix, a green matchup multiplies the
          bonus too. The same passive on a bad matchup is worth much less.
        </p>
      </div>

      <div className="mt-12 max-w-prose space-y-3 text-bh-mute leading-relaxed">
        <h2 className="font-display text-2xl text-bh-ink">How to use it</h2>
        <p>
          Scout what armor the enemy is massing, then build attackers whose row
          is green against it. Piercing punishes light armor but struggles into
          fortifications; siege cracks buildings and fortified lines; magic
          burns through heavy plate. When your waves suddenly stop trading
          well, the answer is usually on this table, not in your stat totals.
        </p>
      </div>
    </div>
  );
}
