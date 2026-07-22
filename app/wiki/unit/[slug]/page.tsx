import { notFound } from "next/navigation";
import IconImg from "@/components/IconImg";
import TagBadge from "@/components/TagBadge";
import { GameText } from "@/lib/richtext";
import {
  dpsOf,
  findBySlug,
  fmtAttackSpeed,
  getWikiMeta,
  listAbilities,
  listUnits,
  slugOf,
  tagLeaf,
  STAT_LABELS,
  STAT_ORDER,
  type WikiRecord,
} from "@/lib/wiki";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const units = await listUnits();
  return units.map((u) => ({ slug: slugOf(u.key) }));
}

export default async function UnitPage({
  params,
}: {
  params: { slug: string };
}) {
  const u = await findBySlug("units", params.slug);
  if (!u) notFound();

  const [abilities, meta] = await Promise.all([listAbilities(), getWikiMeta()]);
  const abilityByKey = new Map(abilities.map((a) => [a.key, a]));

  const stats = (u.stats as Record<string, number>) || {};
  const tooltip = u.tooltip;
  // Every unit has the shared BasicAttack; it carries no display name and
  // says nothing about the unit, so keep it off the page.
  const grantedKeys = ((u.abilities as string[]) || []).filter(
    (k) => !k.includes("BasicAttack"),
  );
  const poolKeys = (u.randomAbilityPool as string[]) || [];
  const auras =
    (u.auras as Array<{ key: string; tooltip?: WikiRecord["tooltip"] }>) || [];
  const passives =
    (u.displayPassives as Array<{
      displayName?: string;
      icon?: string;
      tooltip?: WikiRecord["tooltip"];
    }>) || [];

  const AbilityRow = ({
    a,
    note,
  }: {
    a: WikiRecord;
    note?: string;
  }) => (
    <div className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4">
      <IconImg file={a.tooltip?.icon} size={40} alt="" />
      <div>
        <div className="font-medium">
          {a.displayName || a.key}
          {note ? (
            <span className="ml-2 text-xs text-bh-gold">{note}</span>
          ) : null}
        </div>
        <p className="text-sm text-bh-mute mt-1">
          <GameText text={a.tooltip?.body} />
        </p>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <div className="flex items-center gap-5">
        <IconImg file={u.icon} size={72} alt="" />
        <div>
          <h1 className="font-display text-4xl">{u.displayName || u.key}</h1>
          <div className="mt-2 flex flex-wrap gap-2">
            {u.unitClass ? (
              <span className="inline-block rounded border border-bh-rule bg-bh-panel px-2 py-0.5 text-xs">
                {tagLeaf(u.unitClass as string)}
              </span>
            ) : null}
            {u.attackType ? (
              <TagBadge
                tag={u.attackType as string}
                prefix="Attack:"
                iconMap={meta.attackTypeIcons}
              />
            ) : null}
            {u.armorType ? (
              <TagBadge
                tag={u.armorType as string}
                prefix="Armor:"
                iconMap={meta.armorTypeIcons}
              />
            ) : null}
            {u.damageElement ? (
              <TagBadge
                tag={u.damageElement as string}
                prefix="Element:"
                iconMap={meta.damageElementIcons}
                tone="text-bh-blood"
              />
            ) : null}
            {((u.immuneElements as string[]) || []).map((t) => (
              <TagBadge
                key={t}
                tag={t}
                prefix="Immune:"
                iconMap={meta.immunityIcons}
                tone="text-bh-gold"
              />
            ))}
          </div>
        </div>
      </div>

      {tooltip?.body ? (
        <p className="mt-6 max-w-prose leading-relaxed">
          <GameText text={tooltip.body} />
        </p>
      ) : u.description ? (
        <p className="mt-6 max-w-prose leading-relaxed">{u.description}</p>
      ) : null}
      {tooltip?.flavor ? (
        <p className="mt-3 max-w-prose">
          <span className="rt-flavor">
            <GameText text={tooltip.flavor} />
          </span>
        </p>
      ) : null}

      {Object.keys(stats).length > 0 ? (
        <div className="mt-8 rounded-lg border border-bh-rule bg-bh-panel p-5 max-w-md">
          <h2 className="font-display text-lg mb-3">Stats</h2>
          <dl className="grid grid-cols-2 gap-x-8 gap-y-1 text-sm">
            {STAT_ORDER.filter((k) => stats[k] !== undefined).map((k) => (
              <div key={k} className="flex justify-between">
                <dt className="text-bh-mute">{STAT_LABELS[k]}</dt>
                <dd>
                  {k === "AttackSpeed" ? fmtAttackSpeed(stats[k]) : stats[k]}
                </dd>
              </div>
            ))}
            {dpsOf(stats) !== null ? (
              <div className="flex justify-between">
                <dt className="text-bh-mute">DPS</dt>
                <dd className="rt-dmg">{dpsOf(stats)}</dd>
              </div>
            ) : null}
          </dl>
        </div>
      ) : null}

      {grantedKeys.length > 0 ? (
        <div className="mt-8">
          <h2 className="font-display text-lg mb-3">Abilities</h2>
          <div className="grid gap-3">
            {grantedKeys.map((key) => {
              const a = abilityByKey.get(key);
              return a ? <AbilityRow key={key} a={a} /> : null;
            })}
          </div>
        </div>
      ) : null}

      {poolKeys.length > 0 ? (
        <div className="mt-8">
          <h2 className="font-display text-lg mb-3">
            Rolls one of these at spawn
          </h2>
          <div className="grid gap-3">
            {poolKeys.map((key) => {
              const a = abilityByKey.get(key);
              return a ? <AbilityRow key={key} a={a} note="random" /> : null;
            })}
          </div>
        </div>
      ) : null}

      {auras.length > 0 ? (
        <div className="mt-8">
          <h2 className="font-display text-lg mb-3">Auras</h2>
          <div className="grid gap-3">
            {auras.map((aura) => (
              <div
                key={aura.key}
                className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4"
              >
                <IconImg file={aura.tooltip?.icon} size={40} alt="" />
                <div>
                  <div className="font-medium">
                    {aura.tooltip?.title || aura.key}
                  </div>
                  <p className="text-sm text-bh-mute mt-1">
                    <GameText text={aura.tooltip?.body} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {passives.length > 0 ? (
        <div className="mt-8">
          <h2 className="font-display text-lg mb-3">Traits</h2>
          <div className="grid gap-3">
            {passives.map((p, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4"
              >
                <IconImg file={p.icon} size={40} alt="" />
                <div>
                  <div className="font-medium">
                    {p.displayName || p.tooltip?.title}
                  </div>
                  <p className="text-sm text-bh-mute mt-1">
                    <GameText text={p.tooltip?.body} />
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
