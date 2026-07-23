import { ProseIndex } from "@/components/Prose";
import { listProsePages } from "@/lib/wiki";

export const revalidate = 3600;
export const metadata = {
  title: "Guides",
  description:
    "Strategy guides for Bloodlust & Harmony: build orders, faction primers, and counter play from the developer and alpha testers.",
  alternates: { canonical: "/guides" },
};

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
