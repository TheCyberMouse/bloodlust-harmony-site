import { fetchIcons, OG_SIZE, renderPageCard } from "@/lib/ogcard";
import { iconUrl } from "@/lib/supabase";
import { listRaces } from "@/lib/wiki";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Factions in Bloodlust & Harmony";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const races = await listRaces();
  const icons = await fetchIcons(races.map((r) => iconUrl(r.icon)), 5);
  return renderPageCard({
    eyebrow: "WIKI",
    title: "Factions",
    subtitle: "Five armies, five ways to win.",
    icons,
  });
}
