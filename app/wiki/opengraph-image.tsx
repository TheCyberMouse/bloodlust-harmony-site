import { fetchIcons, OG_SIZE, renderPageCard } from "@/lib/ogcard";
import { iconUrl } from "@/lib/supabase";
import { listRaces, listUnits, listBuildings } from "@/lib/wiki";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "The Bloodlust & Harmony wiki";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const [races, units, buildings] = await Promise.all([
    listRaces(),
    listUnits(),
    listBuildings(),
  ]);
  // A mix that says "everything": a couple factions, units, and buildings.
  const withIcon = (arr: { icon?: string }[]) => arr.filter((x) => x.icon);
  const urls = [
    ...races.slice(0, 2).map((r) => iconUrl(r.icon)),
    ...withIcon(units).slice(0, 2).map((u) => iconUrl(u.icon)),
    ...withIcon(buildings).slice(0, 2).map((b) => iconUrl(b.icon)),
  ];
  const icons = await fetchIcons(urls, 6);
  return renderPageCard({
    eyebrow: "BLOODLUST & HARMONY",
    title: "The Wiki",
    subtitle: `${units.length} units, ${buildings.length} buildings, and every ability, synced from the live build.`,
    icons,
  });
}
