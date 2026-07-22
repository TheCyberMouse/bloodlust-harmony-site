import IconImg from "@/components/IconImg";
import { getWikiMeta, tagLeaf } from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = { title: "Damage matrix" };

function cellTone(mult: number): string {
  if (mult >= 1.5) return "bg-green-900/50 text-green-300 font-semibold";
  if (mult > 1.0) return "bg-green-900/25 text-green-400";
  if (mult === 1.0) return "text-bh-mute";
  if (mult >= 0.6) return "bg-red-900/25 text-red-400";
  return "bg-red-900/50 text-red-300 font-semibold";
}

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
                        className={`min-w-[5.5rem] p-3 text-center text-lg tabular-nums ${cellTone(mult)}`}
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

      <div className="mt-10 max-w-prose space-y-3 text-bh-mute leading-relaxed">
        <h2 className="font-display text-xl text-bh-ink">How to use it</h2>
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
