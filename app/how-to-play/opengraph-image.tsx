import { fetchIcons, OG_SIZE, renderPageCard } from "@/lib/ogcard";
import { iconUrl } from "@/lib/supabase";
import { unitsByFaction } from "@/lib/wiki";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "How to play Bloodlust & Harmony";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const groups = await unitsByFaction();
  // A little cross-faction army along the bottom: each faction's first unit,
  // then its last (higher-tier, visually distinct) to fill out the row.
  const urls = [
    ...groups.flatMap((g) => g.units.slice(0, 1)),
    ...groups.flatMap((g) => g.units.slice(-1)),
  ].map((u) => iconUrl(u.icon));
  const icons = await fetchIcons(urls, 6);
  return renderPageCard({
    eyebrow: "NEW PLAYER GUIDE",
    title: "How to Play",
    subtitle: "Economy, waves, counters, and controls in five minutes.",
    icons,
  });
}
