import { fetchIcons, OG_SIZE, renderPageCard } from "@/lib/ogcard";
import { iconUrl } from "@/lib/supabase";
import { listStatuses } from "@/lib/wiki";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Status effects in Bloodlust & Harmony";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const statuses = (await listStatuses()).filter((s) => s.displayName && s.icon);
  const icons = await fetchIcons(statuses.map((s) => iconUrl(s.icon)), 6);
  return renderPageCard({
    eyebrow: "WIKI",
    title: "Status Effects",
    subtitle: "Buffs, debuffs, auras, and the stuns that answer them.",
    icons,
  });
}
