import { notFound } from "next/navigation";
import { ProseArticle } from "@/components/Prose";
import { getProsePage, listProsePages } from "@/lib/wiki";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await listProsePages("guide");
  return pages.map((p) => ({ slug: p.slug }));
}

export default async function GuidesPage({
  params,
}: {
  params: { slug: string };
}) {
  const page = await getProsePage(params.slug);
  if (!page || page.category !== "guide") notFound();
  return <ProseArticle page={page} />;
}
