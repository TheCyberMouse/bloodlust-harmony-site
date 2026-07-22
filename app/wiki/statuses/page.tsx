import IconImg from "@/components/IconImg";
import { GameText } from "@/lib/richtext";
import { listStatuses, type WikiRecord } from "@/lib/wiki";

export const revalidate = 3600;

export const metadata = { title: "Status effects" };

// Aura tags follow a naming convention: Status.AuraSource.X marks the unit
// PROJECTING the aura; Status.Aura.X is the effect nearby units receive.
// Split on the tag, not the authored kind, since a few sources are
// classified inconsistently in the game data.
const isAuraSource = (s: WikiRecord) =>
  (s.key as string).startsWith("Status.AuraSource.");
const isAuraEffect = (s: WikiRecord) =>
  (s.key as string).startsWith("Status.Aura.") ||
  ((s.kind as string) === "Aura" && !isAuraSource(s));

function StatusCard({ s }: { s: WikiRecord }) {
  return (
    <div className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4">
      <IconImg file={s.icon} size={36} alt="" />
      <div>
        <div className="font-medium">
          {s.displayName || s.key}
          {s.dispelable ? (
            <span className="ml-2 text-xs text-bh-gold">dispelable</span>
          ) : null}
        </div>
        <p className="text-sm text-bh-mute mt-1">
          <GameText text={(s.description as string) || s.tooltip?.body} />
        </p>
      </div>
    </div>
  );
}

function Section({
  title,
  blurb,
  items,
}: {
  title: string;
  blurb?: string;
  items: WikiRecord[];
}) {
  if (items.length === 0) return null;
  return (
    <section>
      <h2 className="font-display text-2xl mt-10 mb-1">{title}</h2>
      {blurb ? <p className="mb-4 text-sm text-bh-mute">{blurb}</p> : null}
      <div className={`grid gap-3 sm:grid-cols-2 ${blurb ? "" : "mt-4"}`}>
        {items
          .sort((a, b) =>
            (a.displayName || a.key).localeCompare(b.displayName || b.key),
          )
          .map((s) => (
            <StatusCard key={s.id} s={s} />
          ))}
      </div>
    </section>
  );
}

export default async function StatusesPage() {
  // Entries without a display name are internal bookkeeping tags (caster
  // reservations and the like); keep them off the page.
  const statuses = (await listStatuses()).filter((s) => s.displayName);

  const auraSources = statuses.filter(isAuraSource);
  const auraEffects = statuses.filter(
    (s) => !isAuraSource(s) && isAuraEffect(s),
  );
  const rest = statuses.filter((s) => !isAuraSource(s) && !isAuraEffect(s));

  const buffs = rest.filter((s) => (s.kind as string) === "Buff");
  const debuffs = rest.filter((s) => (s.kind as string) === "Debuff");
  const states = rest.filter(
    (s) => (s.kind as string) !== "Buff" && (s.kind as string) !== "Debuff",
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <h1 className="font-display text-4xl">Status effects</h1>
      <p className="mt-2 text-bh-mute">
        Every buff, debuff, and aura in the game, straight from the game data.
      </p>

      <Section title="Buffs" items={buffs} />
      <Section title="Debuffs" items={debuffs} />
      <Section
        title="Auras"
        blurb="Carried by the unit projecting the aura. Nearby units receive the matching aura effect below."
        items={auraSources}
      />
      <Section
        title="Aura effects"
        blurb="What units receive while standing inside an aura."
        items={auraEffects}
      />
      <Section title="States" items={states} />
    </div>
  );
}
