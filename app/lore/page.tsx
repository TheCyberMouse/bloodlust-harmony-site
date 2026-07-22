import { ProseIndex } from "@/components/Prose";
import { listProsePages } from "@/lib/wiki";

export const revalidate = 3600;
export const metadata = { title: "Lore" };

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
