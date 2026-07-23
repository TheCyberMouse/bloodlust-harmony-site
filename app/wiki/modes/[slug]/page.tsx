import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import BackButton from "@/components/BackButton";
import JsonLd, { breadcrumbLd } from "@/components/JsonLd";
import ModeBody from "@/components/ModeBody";
import { GAME_MODES, getMode } from "@/lib/modes";

export const dynamicParams = false;

export function generateStaticParams() {
  return GAME_MODES.map((m) => ({ slug: m.slug }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const mode = getMode(params.slug);
  if (!mode) return { title: "Not found", robots: { index: false } };
  const ogTitle = `${mode.name} mode — Bloodlust & Harmony`;
  return {
    title: `${mode.name} mode`,
    description: mode.summary,
    alternates: { canonical: `/wiki/modes/${mode.slug}` },
    openGraph: { title: ogTitle, description: mode.summary, type: "article" },
    twitter: {
      card: "summary_large_image",
      title: ogTitle,
      description: mode.summary,
    },
  };
}

export default function ModePage({ params }: { params: { slug: string } }) {
  const mode = getMode(params.slug);
  if (!mode) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14">
      <JsonLd
        data={breadcrumbLd([
          { name: "Wiki", path: "/wiki" },
          { name: "Game modes", path: "/wiki/modes" },
          { name: mode.name, path: `/wiki/modes/${mode.slug}` },
        ])}
      />
      <BackButton fallback="/wiki/modes" />

      <h1 className="font-display text-4xl">{mode.name}</h1>
      <p className="mt-2 max-w-prose text-lg text-bh-mute">{mode.tagline}</p>

      <dl className="mt-8 grid grid-cols-2 gap-4 rounded-lg border border-bh-rule bg-bh-panel p-5 sm:grid-cols-4">
        {[
          ["Players", mode.glance.players],
          ["Economy", mode.glance.economy],
          ["Buildings", mode.glance.buildings],
          ["Win", mode.glance.win],
        ].map(([label, value]) => (
          <div key={label}>
            <dt className="text-xs uppercase tracking-wide text-bh-mute">
              {label}
            </dt>
            <dd className="mt-0.5 text-bh-ink">{value}</dd>
          </div>
        ))}
      </dl>

      <ModeBody sections={mode.sections} />

      <div className="mt-14 border-t border-bh-rule pt-6">
        <Link
          href="/wiki/modes"
          className="text-sm text-bh-blood hover:text-bh-bloodInk transition-colors"
        >
          ← All game modes
        </Link>
      </div>
    </div>
  );
}
