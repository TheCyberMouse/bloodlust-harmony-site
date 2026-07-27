import { fetchIcons, OG_SIZE, renderPageCard } from "@/lib/ogcard";
import { iconUrl } from "@/lib/supabase";
import { unitsByFaction } from "@/lib/wiki";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "All units in Bloodlust & Harmony";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const groups = await unitsByFaction();
  const total = groups.reduce((s, g) => s + g.units.length + g.summons.length, 0);
  // Each faction's first unit, then its last (higher-tier, visually distinct)
  // to fill out the row without repeating near-identical low-tier art.
  const urls = [
    ...groups.flatMap((g) => g.units.slice(0, 1)),
    ...groups.flatMap((g) => g.units.slice(-1)),
  ].map((u) => iconUrl(u.icon));
  const icons = await fetchIcons(urls, 6);
  return renderPageCard({
    eyebrow: "WIKI",
    title: "All Units",
    subtitle: `Stats, DPS, and counters for all ${total} units.`,
    icons,
  });
}
