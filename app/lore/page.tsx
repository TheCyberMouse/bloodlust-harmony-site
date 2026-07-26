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
      intro="A grim high-fantasy world torn between two souls, Harmony and Bloodlust. Start with the cosmology, then read the factions and the wars that bind them."
      basePath="/lore"
      pages={pages}
    />
  );
}
