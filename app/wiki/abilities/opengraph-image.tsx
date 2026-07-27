import { fetchIcons, OG_SIZE, renderPageCard } from "@/lib/ogcard";
import { iconUrl } from "@/lib/supabase";
import { listAbilities } from "@/lib/wiki";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "All abilities in Bloodlust & Harmony";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const abilities = await listAbilities();
  const named = abilities.filter(
    (a) => a.displayName && a.displayName !== a.key && a.tooltip?.icon,
  );
  const icons = await fetchIcons(
    named.map((a) => iconUrl(a.tooltip?.icon)),
    6,
  );
  return renderPageCard({
    eyebrow: "WIKI",
    title: "All Abilities",
    subtitle: "Every spell, passive, and autocast in the game.",
    icons,
  });
}
