import { ProseIndex } from "@/components/Prose";
import { listProsePages } from "@/lib/wiki";

export const revalidate = 3600;
export const metadata = {
  title: "Patch Notes",
  description:
    "Every balance change, new unit, and bug fix in Bloodlust & Harmony, patch by patch. Stat changes are generated straight from the game data.",
  alternates: { canonical: "/patch-notes" },
};

export default async function PatchNotesIndex() {
  const pages = await listProsePages("patch-notes");
  return (
    <ProseIndex
      title="Patch Notes"
      intro="What changed, patch by patch. Balance numbers come straight out of the game data."
      basePath="/patch-notes"
      pages={pages}
    />
  );
}
