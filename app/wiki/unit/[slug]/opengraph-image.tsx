import { brandedFallback, fetchOgImage, OG_SIZE, renderOgCard } from "@/lib/ogcard";
import { iconUrl } from "@/lib/supabase";
import { dpsOf, findBySlug, tagLeaf } from "@/lib/wiki";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Bloodlust & Harmony unit card";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  const u = await findBySlug("units", params.slug).catch(() => null);
  if (!u) return brandedFallback();

  const stats = (u.stats as Record<string, number>) || {};
  const dps = dpsOf(stats);
  const chips: string[] = [];
  if (stats.MaxHealth !== undefined) chips.push(`${stats.MaxHealth} HP`);
  if (dps !== null) chips.push(`${dps} DPS`);

  return renderOgCard({
    title: u.displayName || u.key,
    subtitle: u.unitClass ? tagLeaf(u.unitClass as string) : undefined,
    chips,
    image: await fetchOgImage(iconUrl(u.icon)),
  });
}
