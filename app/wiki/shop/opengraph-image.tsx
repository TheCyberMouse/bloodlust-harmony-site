import { fetchIcons, OG_SIZE, renderPageCard } from "@/lib/ogcard";
import { iconUrl } from "@/lib/supabase";
import { listShopItems } from "@/lib/wiki";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "Shop items in Bloodlust & Harmony";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const items = (await listShopItems()).filter((s) => s.icon);
  const icons = await fetchIcons(items.map((s) => iconUrl(s.icon)), 6);
  return renderPageCard({
    eyebrow: "WIKI",
    title: "Shop",
    subtitle: "Resource trades and team-wide buffs, each on a cooldown.",
    icons,
  });
}
