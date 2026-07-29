import Link from "next/link";
import IconImg from "@/components/IconImg";
import { GameText } from "@/lib/richtext";
import {
  dpsOf,
  findBySlug,
  getWikiMeta,
  listPokerBoons,
  slugOf,
  tagLeaf,
  type WikiRecord,
} from "@/lib/wiki";

/** Turns a boon row's kind + magnitude into a short effect chip. The row's
 *  Description already explains it in prose; this is the at-a-glance number. */
function effectChip(b: WikiRecord): string | null {
  const kind = b.kind as string | undefined;
  const m = b.magnitude as number | undefined;
  const mag = typeof m === "number" ? m : 0;
  switch (kind) {
    case "FlatAttack":
      return `${mag >= 0 ? "+" : ""}${mag} attack`;
    case "FlatArmor":
      return `${mag >= 0 ? "+" : ""}${mag} armor`;
    case "AttackSpeedMult":
      return `x${mag} attack speed`;
    case "MaxHealthMult":
      return `x${mag} max health`;
    case "MaxShieldMult":
      return `x${mag} max shield`;
    case "MaxManaMult":
      return `x${mag} max mana`;
    case "RangedRangeAdd":
      return `${mag >= 0 ? "+" : ""}${mag} range, ranged units`;
    case "NeutralArmy":
      return "spawns a neutral guard army";
    default:
      return null;
  }
}

function pct(n: number): string {
  return `${Math.round(n * 100)}%`;
}

export default async function PokerExtras() {
  const [croupier, boons, meta] = await Promise.all([
    findBySlug("units", "thecroupier"),
    listPokerBoons(),
    getWikiMeta(),
  ]);

  const chances = meta.pokerBoonChances ?? {
    rare: 0.15,
    uncommon: 0.3,
    common: 0.55,
  };
  const frequencies = [
    ["No Modifiers", "never"],
    ["Rare", `${pct(chances.rare)} of hands`],
    ["Uncommon", `${pct(chances.uncommon)} of hands`],
    ["Common", `${pct(chances.common)} of hands`],
    ["Always", "every hand"],
  ];

  // Boons help, curses hurt: split on whether any multiplier drops below 1 or a
  // flat value goes negative. Named "Battlefield boons and curses" either way.
  const isCurse = (b: WikiRecord) => {
    const kind = b.kind as string | undefined;
    const m = (b.magnitude as number) ?? 0;
    if (!kind) return false;
    if (kind.endsWith("Mult")) return m < 1;
    if (kind === "FlatAttack" || kind === "FlatArmor" || kind === "RangedRangeAdd")
      return m < 0;
    return false;
  };

  // Boons first (gold), then curses (red), each alphabetical by name.
  const sortedBoons = [...boons].sort((a, b) => {
    const ca = isCurse(a) ? 1 : 0;
    const cb = isCurse(b) ? 1 : 0;
    if (ca !== cb) return ca - cb;
    return (a.displayName as string || a.key).localeCompare(
      (b.displayName as string) || b.key,
    );
  });

  return (
    <div className="mt-12 space-y-10">
      <section className="max-w-prose">
        <h2 className="font-display text-2xl text-bh-ink mb-4">The Croupier</h2>
        <p className="text-bh-mute leading-relaxed mb-4">
          Every Poker match is run by the Croupier, the dealer at the heart of
          the pit. It is a neutral unit, fielded by no faction.
        </p>
        {croupier ? (
          <Link
            href={`/wiki/unit/${slugOf(croupier.key)}`}
            className="group flex items-center gap-3 rounded-lg border border-bh-rule bg-bh-panel p-3 hover:border-bh-blood transition-colors"
          >
            <IconImg file={croupier.icon} size={44} alt="" />
            <div className="min-w-0">
              <div className="font-medium group-hover:text-bh-blood transition-colors">
                {croupier.displayName || croupier.key}
              </div>
              <div className="text-xs text-bh-mute truncate">
                {[
                  croupier.unitClass
                    ? tagLeaf(croupier.unitClass as string)
                    : null,
                  (croupier.stats as Record<string, number>)?.MaxHealth
                    ? `${(croupier.stats as Record<string, number>).MaxHealth} HP`
                    : null,
                  dpsOf((croupier.stats as Record<string, number>) || {}) !== null
                    ? `${dpsOf((croupier.stats as Record<string, number>) || {})} DPS`
                    : null,
                ]
                  .filter(Boolean)
                  .join(" · ")}
              </div>
            </div>
          </Link>
        ) : null}
      </section>

      <section className="max-w-prose">
        <h2 className="font-display text-2xl text-bh-ink mb-4">
          Battlefield boons and curses
        </h2>
        <p className="text-bh-mute leading-relaxed">
          Each hand may roll one <strong className="text-bh-ink">boon</strong>{" "}
          or <strong className="text-bh-ink">curse</strong>, a modifier applied
          to every qualifying army at showdown. Some help (more attack, more
          health), some hurt (halved shields, slowed swings), and some spawn a
          neutral guard army hostile to everyone. The roll is announced before
          betting, as glowing text on the pit floor and on the HUD, so it is
          public information you factor into your bets.
        </p>

        <h3 className="font-display text-lg text-bh-gold mt-6 mb-2">
          How often they roll
        </h3>
        <p className="text-bh-mute leading-relaxed mb-3">
          The host picks the frequency when creating the server. It sets the
          chance that any given hand rolls a modifier at all.
        </p>
        <div className="overflow-x-auto">
          <table className="border-collapse text-sm">
            <tbody>
              {frequencies.map(([name, freq]) => (
                <tr key={name} className="border-t border-bh-rule">
                  <td className="py-2 pr-8 font-medium text-bh-ink">{name}</td>
                  <td className="py-2 text-bh-mute">{freq}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {sortedBoons.length > 0 ? (
        <section>
          <h2 className="font-display text-2xl text-bh-ink mb-1">
            The full pool
          </h2>
          <p className="text-sm text-bh-mute mb-4">
            All {sortedBoons.length} modifiers the roll can land on.
          </p>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-xs uppercase tracking-wide text-bh-mute">
                  <th className="py-2 pr-4 font-normal">Modifier</th>
                  <th className="py-2 pr-4 font-normal">Type</th>
                  <th className="py-2 pr-4 font-normal">Effect</th>
                  <th className="py-2 pr-4 font-normal">Applies to</th>
                  <th className="py-2 font-normal">What it does</th>
                </tr>
              </thead>
              <tbody>
                {sortedBoons.map((b) => {
                  const chip = effectChip(b);
                  const faction = (b.filterRace as string) || "";
                  const curse = isCurse(b);
                  return (
                    <tr key={b.id} className="border-t border-bh-rule align-top">
                      <td className="py-2 pr-4 font-medium text-bh-ink whitespace-nowrap">
                        {b.displayName || b.key}
                      </td>
                      <td className="py-2 pr-4">
                        <span className={curse ? "text-bh-blood" : "text-bh-gold"}>
                          {curse ? "Curse" : "Boon"}
                        </span>
                      </td>
                      <td className="py-2 pr-4 text-bh-mute whitespace-nowrap">
                        {chip || "—"}
                      </td>
                      <td className="py-2 pr-4 text-bh-mute whitespace-nowrap">
                        {faction || "All units"}
                      </td>
                      <td className="py-2 text-bh-mute">
                        <GameText text={b.description as string} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      ) : (
        <p className="max-w-prose text-sm text-bh-mute">
          The full boon and curse catalog syncs from the game data. Check back
          after the next content update.
        </p>
      )}
    </div>
  );
}
