import type { Metadata } from "next";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import IconImg from "@/components/IconImg";
import JsonLd, { breadcrumbLd } from "@/components/JsonLd";
import TagBadge from "@/components/TagBadge";
import TypeStat from "@/components/TypeStat";
import Link from "next/link";
import { GameText } from "@/lib/richtext";
import { metaDescription, stripGameText } from "@/lib/seo";
import { iconUrl } from "@/lib/supabase";
import {
  dpsOf,
  findBySlug,
  fmtAttackSpeed,
  getWikiMeta,
  listAbilities,
  listUnits,
  raceSlug,
  slugOf,
  tagLeaf,
  unitContext,
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

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const u = await findBySlug("units", params.slug);
  if (!u) return { title: "Not found", robots: { index: false } };

  const name = u.displayName || u.key;
  const cls = u.unitClass ? tagLeaf(u.unitClass as string) : "";
  const description = metaDescription(
    stripGameText(u.tooltip?.body),
    u.description,
    `Stats, abilities, and counters for ${name}${cls ? `, a ${cls} unit` : ""} in Bloodlust & Harmony.`,
  );
  const ogTitle = `${name} — Bloodlust & Harmony`;
  return {
    title: cls ? `${name}, ${cls} unit` : name,
    description,
    alternates: { canonical: `/wiki/unit/${params.slug}` },
    // No openGraph.images here: this segment's opengraph-image.tsx wins.
    openGraph: { title: ogTitle, description, type: "article" },
    twitter: { card: "summary_large_image", title: ogTitle, description },
  };
}

export default async function UnitPage({
  params,
}: {
  params: { slug: string };
}) {
  const u = await findBySlug("units", params.slug);
  if (!u) notFound();

  const [abilities, meta, context] = await Promise.all([
    listAbilities(),
    getWikiMeta(),
    unitContext(u.id),
  ]);
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
  const allPassives =
    (u.displayPassives as Array<{
      displayName?: string;
      icon?: string;
      tooltip?: WikiRecord["tooltip"];
    }>) || [];

  // A DisplayPassive that restates an ability the unit already has would render
  // twice ("Fire Resistance" under Abilities, "Fire Resist" under Traits).
  // These duplicates exist because a resistance passive used to show no icon,
  // so a matching DisplayPassive was authored to supply one - the in-game
  // command card resolves that icon itself, and so does this page now.
  //
  // Matched on the description rather than the name: the duplicate is a
  // copy-paste of the ability's text, while the names deliberately differ
  // ("Fire Resistance" vs "Fire Resist"). Fails open - an edited description
  // simply shows both again rather than hiding the wrong thing.
  const norm = (s?: string) =>
    (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim().toLowerCase();
  const grantedBodies = new Set(
    grantedKeys
      .map((k) => norm(abilityByKey.get(k)?.tooltip?.body))
      .filter(Boolean),
  );
  const passives = allPassives.filter(
    (p) => !(p.tooltip?.body && grantedBodies.has(norm(p.tooltip.body))),
  );

  const AbilityRow = ({
    a,
    note,
  }: {
    a: WikiRecord;
    note?: string;
  }) => (
    <div className="flex items-start gap-3 rounded-lg border border-bh-rule bg-bh-panel p-4">
      {/* Resistance passives are C++ classes with no editable CDO, so they
          carry no tooltip icon; their art is keyed by resist tag in meta.
          Same fallback the in-game command card uses. */}
      <IconImg
        file={
          a.tooltip?.icon ||
          (a.resistTag
            ? meta.resistIcons?.[a.resistTag as string]
            : undefined)
        }
        size={40}
        alt=""
      />
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
      <JsonLd
        data={breadcrumbLd([
          { name: "Wiki", path: "/wiki" },
          { name: "Units", path: "/wiki/units" },
          { name: u.displayName || u.key, path: `/wiki/unit/${params.slug}` },
        ])}
      />
      <BackButton fallback="/wiki/units" />
      <div className="flex items-center gap-5">
        <IconImg file={u.icon} size={72} alt="" />
        <div>
          <h1 className="font-display text-4xl">{u.displayName || u.key}</h1>
          {u.unitClass ? (
            <p className="mt-1 font-display text-xl text-bh-gold">
              {tagLeaf(u.unitClass as string)}
            </p>
          ) : null}
          {/* Damage element moved into the Stats card beside attack/armor type
              - it describes the unit's damage, so it belongs with the other
              combat types rather than as a small badge up here. */}
          <div className="mt-2 flex flex-wrap gap-2">
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

      {context.faction || context.trainedBy.length > 0 ? (
        <p className="mt-4 text-sm text-bh-mute">
          {context.faction ? (
            <>
              Fielded by{" "}
              <Link
                href={`/wiki/faction/${raceSlug(context.faction)}`}
                className="text-bh-blood hover:text-bh-bloodInk transition-colors"
              >
                {context.faction.displayName || context.faction.key}
              </Link>
            </>
          ) : null}
          {context.faction && context.trainedBy.length > 0 ? " · " : ""}
          {context.trainedBy.length > 0 ? (
            <>
              Trained at{" "}
              {context.trainedBy.map((b, i) => (
                <span key={b.id}>
                  {i > 0 ? ", " : ""}
                  <Link
                    href={`/wiki/building/${slugOf(b.key)}`}
                    className="text-bh-blood hover:text-bh-bloodInk transition-colors"
                  >
                    {b.displayName || b.key}
                  </Link>
                </span>
              ))}
            </>
          ) : null}
        </p>
      ) : null}

      {u.pokerCard ? (
        <p className="mt-2 text-sm text-bh-mute">
          In{" "}
          <Link
            href="/wiki/modes/poker"
            className="text-bh-blood hover:text-bh-bloodInk transition-colors"
          >
            Poker
          </Link>
          , one dealt card is{" "}
          <span className="text-bh-ink">
            {(u.pokerMinCount as number) === (u.pokerMaxCount as number)
              ? `${u.pokerMinCount}`
              : `${u.pokerMinCount} to ${u.pokerMaxCount}`}
          </span>{" "}
          of this unit.
        </p>
      ) : null}

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

      {Object.keys(stats).length > 0 || u.attackType || u.armorType || u.portrait ? (
        <div className="mt-8 flex flex-wrap items-center gap-8">
          {Object.keys(stats).length > 0 || u.attackType || u.armorType ? (
        <div className="w-full max-w-md rounded-lg border border-bh-rule bg-bh-panel p-5">
          <h2 className="font-display text-lg mb-3">Stats</h2>
          {u.attackType || u.armorType || u.damageElement ? (
            <div className="mb-4 grid grid-cols-2 gap-4 border-b border-bh-rule pb-4">
              {u.attackType ? (
                <TypeStat kind="attack" tag={u.attackType as string} meta={meta} />
              ) : null}
              {u.armorType ? (
                <TypeStat kind="armor" tag={u.armorType as string} meta={meta} />
              ) : null}
              {/* Element sits with attack/armor type, at the same weight: the
                  unit's ordinary attacks carry it, so it is a combat type, not
                  a badge. Lands directly under Attack type in the 2-col grid. */}
              {u.damageElement ? (
                <div className="flex items-center gap-3">
                  <IconImg
                    file={meta.damageElementIcons?.[u.damageElement as string]}
                    size={48}
                    alt=""
                  />
                  <span>
                    <span className="block text-xs text-bh-mute">
                      Damage element
                    </span>
                    <span className="block text-lg font-medium text-bh-blood">
                      {tagLeaf(u.damageElement as string)}
                    </span>
                  </span>
                </div>
              ) : null}
            </div>
          ) : null}
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
          {u.portrait ? (
            // In-game rendered model (transparent PNG from the publish
            // pipeline), sitting beside the stat card.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={iconUrl(u.portrait as string) ?? undefined}
              width={320}
              height={320}
              alt={u.displayName || u.key}
              className="h-80 w-80 max-w-full object-contain"
            />
          ) : null}
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
