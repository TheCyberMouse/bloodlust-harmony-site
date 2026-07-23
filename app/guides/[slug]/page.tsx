import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ProseArticle } from "@/components/Prose";
import { metaDescription, stripHtml } from "@/lib/seo";
import { getProsePage, listProsePages } from "@/lib/wiki";

export const revalidate = 3600;
export const dynamicParams = true;

export async function generateStaticParams() {
  const pages = await listProsePages("guide");
  return pages.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const page = await getProsePage(params.slug);
  if (!page || page.category !== "guide")
    return { title: "Not found", robots: { index: false } };
  const description = metaDescription(
    stripHtml(page.body),
    `${page.title}: a guide for Bloodlust & Harmony.`,
  );
  const ogTitle = `${page.title} — Bloodlust & Harmony`;
  return {
    title: page.title,
    description,
    alternates: { canonical: `/guides/${page.slug}` },
    openGraph: {
      title: ogTitle,
      description,
      type: "article",
      modifiedTime: page.updated_at,
    },
    twitter: { card: "summary_large_image", title: ogTitle, description },
  };
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
