import { buildingsByFaction } from "@/lib/wiki";
import { fetchIcons, OG_SIZE, renderPageCard } from "@/lib/ogcard";
import { iconUrl } from "@/lib/supabase";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "All buildings in Bloodlust & Harmony";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const groups = await buildingsByFaction();
  const total = groups.reduce(
    (s, g) =>
      s + g.mainTrees.flat().length + g.specialTrees.flat().length + g.castleTree.length,
    0,
  );
  // First building of each faction's roster, then fill for a cross-faction spread.
  const urls = [
    ...groups.flatMap((g) => g.mainTrees[0]?.slice(0, 1) ?? []),
    ...groups.flatMap((g) => g.mainTrees[1]?.slice(0, 1) ?? []),
  ].map((b) => iconUrl(b.icon));
  const icons = await fetchIcons(urls, 6);
  return renderPageCard({
    eyebrow: "WIKI",
    title: "All Buildings",
    subtitle: `Costs, upgrade trees, and the units all ${total} of them train.`,
    icons,
  });
}
