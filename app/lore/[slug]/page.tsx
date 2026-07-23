import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProseArticle } from "@/components/Prose";
import { metaDescription, stripHtml } from "@/lib/seo";
import { getProsePage, listProsePages } from "@/lib/wiki";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await listProsePages("lore");
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await getProsePage(params.slug);
  if (!page || page.category !== "lore")
    return { title: "Not found", robots: { index: false } };
  const description = metaDescription(
    stripHtml(page.body),
    `${page.title}: lore for Bloodlust & Harmony.`,
  );
  const ogTitle = `${page.title} — Bloodlust & Harmony`;
  return {
    title: page.title,
    description,
    alternates: { canonical: `/lore/${page.slug}` },
    openGraph: {
      title: ogTitle,
      description,
      type: "article",
      modifiedTime: page.updated_at,
    },
    twitter: { card: "summary_large_image", title: ogTitle, description },
  };
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
