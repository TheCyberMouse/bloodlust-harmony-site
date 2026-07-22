import { notFound } from "next/navigation";
import { ProseArticle } from "@/components/Prose";
import { getProsePage, listProsePages } from "@/lib/wiki";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await listProsePages("lore");
  return pages.map((p) => ({ slug: p.slug }));
}

export default async function LorePage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getProsePage(params.slug);
  if (!page || page.category !== "lore") notFound();
  return <ProseArticle page={page} />;
}
