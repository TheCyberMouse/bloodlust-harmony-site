import { matrixToneHex, OG_SIZE, renderPageCard } from "@/lib/ogcard";
import { getWikiMeta } from "@/lib/wiki";

export const runtime = "nodejs";
export const revalidate = 3600;
export const alt = "The damage matrix in Bloodlust & Harmony";
export const size = OG_SIZE;
export const contentType = "image/png";

export default async function Image() {
  const meta = await getWikiMeta();
  const m = meta.damageMatrix;
  const grid = m
    ? m.attackTypes.map((a) =>
        m.armorTypes.map((ar) => matrixToneHex(m.rows[a]?.[ar] ?? 1.0)),
      )
    : undefined;
  return renderPageCard({
    eyebrow: "WIKI",
    title: "The Damage Matrix",
    subtitle: "Which attack type shreds which armor.",
    grid,
  });
}
