import { fetchIcons, OG_SIZE, renderPageCard } from "@/lib/ogcard";
import { iconUrl } from "@/lib/supabase";
import { listResearches } from "@/lib/wiki";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Researches in Bloodlust & Harmony";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const researches = (await listResearches()).filter((r) => r.icon);
  const icons = await fetchIcons(researches.map((r) => iconUrl(r.icon)), 6);
  return renderPageCard({
    eyebrow: "WIKI",
    title: "Researches",
    subtitle: "Match-long upgrades, faction by faction.",
    icons,
  });
}
