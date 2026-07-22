import { ProseIndex } from "@/components/Prose";
import { listProsePages } from "@/lib/wiki";

export const revalidate = 3600;
export const metadata = { title: "Guides" };

export default async function GuidesIndex() {
  const pages = await listProsePages("guide");
  return (
    <ProseIndex
      title="Guides"
      intro="Strategy, build orders, and how the systems really work."
      basePath="/guides"
      pages={pages}
    />
  );
}
