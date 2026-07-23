import { brandedFallback, fetchOgImage, OG_SIZE, renderOgCard } from "@/lib/ogcard";
import { iconUrl } from "@/lib/supabase";
import { findRaceBySlug } from "@/lib/wiki";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Bloodlust & Harmony faction card";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function OgImage({
  params,
}: {
  params: { slug: string };
}) {
  const race = await findRaceBySlug(params.slug).catch(() => null);
  if (!race) return brandedFallback();

  const leader = race.leader as { name?: string; title?: string } | undefined;

  return renderOgCard({
    title: race.displayName || race.key,
    subtitle: leader?.name ? `Led by ${leader.name}` : undefined,
    image: await fetchOgImage(iconUrl(race.icon)),
  });
}
