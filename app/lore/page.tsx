import { ProseIndex } from "@/components/Prose";
import { listProsePages } from "@/lib/wiki";

export const revalidate = 3600;
export const metadata = {
  title: "Lore",
  description:
    "The world of Bloodlust & Harmony: its factions, their leaders, and the war between bloodlust and harmony.",
  alternates: { canonical: "/lore" },
};

export default async function LoreIndex() {
  const pages = await listProsePages("lore");
  return (
    <ProseIndex
      title="Lore"
      intro="Histories of the factions and the world they bleed over."
      basePath="/lore"
      pages={pages}
    />
  );
}
