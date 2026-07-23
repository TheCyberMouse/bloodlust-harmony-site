import { ProseIndex } from "@/components/Prose";
import { listProsePages } from "@/lib/wiki";

export const revalidate = 3600;
export const metadata = {
  title: "Devlog",
  description:
    "Development updates for Bloodlust & Harmony: new factions, balance passes, and the road to Steam. Follow along and help shape the alpha.",
  alternates: { canonical: "/devlog" },
};

export default async function DevlogIndex() {
  const pages = await listProsePages("devlog");
  return (
    <ProseIndex
      title="Devlog"
      intro="Development notes from the solo dev building the game."
      basePath="/devlog"
      pages={pages}
    />
  );
}
