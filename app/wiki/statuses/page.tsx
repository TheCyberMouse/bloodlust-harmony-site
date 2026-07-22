import IconImg from "@/components/IconImg";
import { GameText } from "@/lib/richtext";
import { listStatuses } from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = { title: "Status effects" };

const KIND_ORDER = ["Buff", "Debuff", "Aura", "State"];

export default async function StatusesPage() {
  const statuses = await listStatuses();
  const byKind = new Map<string, typeof statuses>();
  for (const s of statuses) {
    const kind = (s.kind as string) || "State";
    if (!byKind.has(kind)) byKind.set(kind, []);
    byKind.get(kind)!.push(s);
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-4xl">Status effects</h1>
      <p className="mt-2 text-bh-mute">
        Every buff, debuff, and aura in the game, straight from the game data.
      </p>

      {KIND_ORDER.filter((k) => byKind.has(k)).map((kind) => (
        <section key={kind}>
          <h2 className="font-display text-2xl mt-10 mb-4">{kind}s</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {byKind
              .get(kind)!
              .sort((a, b) =>
                (a.displayName || a.key).localeCompare(b.displayName || b.key),
              )
              .map((s) => (
                <div
                  key={s.id}
                  className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4"
                >
                  <IconImg file={s.icon} size={36} alt="" />
                  <div>
                    <div className="font-medium">
                      {s.displayName || s.key}
                      {s.dispelable ? (
                        <span className="ml-2 text-xs text-bh-gold">
                          dispelable
                        </span>
                      ) : null}
                    </div>
                    <p className="text-sm text-bh-mute mt-1">
                      <GameText text={(s.description as string) || s.tooltip?.body} />
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      ))}
    </div>
  );
}
