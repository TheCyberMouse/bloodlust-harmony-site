import Link from "next/link";
import IconImg from "@/components/IconImg";
import { GameText } from "@/lib/richtext";
import {
  listRaces,
  listResearches,
  raceSlug,
  type WikiRecord,
} from "@/lib/wiki";

export const revalidate = 3600;

export async function generateMetadata() {
  const researches = await listResearches();
  return {
    title: "All researches",
    description: `All ${researches.length} researches in Bloodlust & Harmony by faction: tiers, costs, and what each upgrade actually does for your army.`,
    alternates: { canonical: "/wiki/researches" },
  };
}

function costLine(r: WikiRecord): string {
  const tiers =
    (r.tiers as Array<{ costGold: number; costLumber: number; costStardust: number }>) ||
    [];
  if (tiers.length === 0) return "";
  const fmt = (t: { costGold: number; costLumber: number; costStardust: number }) =>
    [
      t.costGold > 0 ? `${t.costGold}g` : null,
      t.costLumber > 0 ? `${t.costLumber} wood` : null,
      t.costStardust > 0 ? `${t.costStardust} stardust` : null,
    ]
      .filter(Boolean)
      .join(" + ");
  const first = fmt(tiers[0]);
  const last = fmt(tiers[tiers.length - 1]);
  return tiers.length > 1 && first !== last ? `${first} to ${last}` : first;
}

function ResearchCard({ r }: { r: WikiRecord }) {
  const tiers = (r.maxTiers as number) || 1;
  const cost = costLine(r);
  return (
    <div className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4">
      <IconImg file={r.icon} size={40} alt="" />
      <div className="min-w-0">
        <div className="font-medium">
          {r.displayName || r.key}{" "}
          <span className="text-xs text-bh-mute">
            ({tiers} tier{tiers === 1 ? "" : "s"}
            {cost ? ` · ${cost}` : ""})
          </span>
        </div>
        <p className="text-sm text-bh-mute mt-1">
          <GameText text={r.tooltip?.body || r.description} />
        </p>
      </div>
    </div>
  );
}

export default async function ResearchesIndex() {
  const [races, researches] = await Promise.all([
    listRaces(),
    listResearches(),
  ]);
  const byId = new Map(researches.map((r) => [r.id, r]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-14">
      <h1 className="font-display text-4xl">All researches</h1>
      <p className="mt-2 max-w-prose text-bh-mute">
        Match-long upgrades bought from the Research tab. Most are tiered:
        each purchase stacks the effect and raises the price of the next.
      </p>

      {races.map((race) => {
        const rows = ((race.researches as string[]) || [])
          .map((id) => byId.get(id))
          .filter((r): r is WikiRecord => Boolean(r));
        if (rows.length === 0) return null;
        return (
          <section key={race.id}>
            <div className="mt-12 mb-4 flex items-center gap-3">
              <IconImg file={race.icon} size={36} alt="" />
              <h2 className="font-display text-2xl">
                <Link
                  href={`/wiki/faction/${raceSlug(race)}`}
                  className="hover:text-bh-blood transition-colors"
                >
                  {race.displayName || race.key}
                </Link>
              </h2>
              <span className="text-sm text-bh-mute">
                {rows.length} researches
              </span>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {rows.map((r) => (
                <ResearchCard key={r.id} r={r} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}
