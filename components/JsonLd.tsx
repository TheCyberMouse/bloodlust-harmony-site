import { DISCORD_URL, REDDIT_URL, STEAM_URL } from "@/lib/links";
import { listScreenshots } from "@/lib/screenshots";
import type { ProsePage } from "@/lib/wiki";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://www.bloodlustandharmony.com";

const AUTHOR = { "@type": "Person", name: "TheCyberMouse", url: SITE_URL };

/** schema.org graph for search engines. A function (not a constant) so it can
 *  enumerate the screenshots folder server-side at render time. Emitted ONCE,
 *  from the root layout — never duplicate the VideoGame node on subpages. */
export function siteGraph() {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "VideoGame",
        "@id": `${SITE_URL}/#game`,
        name: "Bloodlust & Harmony",
        url: SITE_URL,
        image: `${SITE_URL}/opengraph-image.jpg`,
        screenshot: listScreenshots().map((s) => `${SITE_URL}${s.src}`),
        genre: ["Real-time strategy", "Auto battler"],
        gamePlatform: "PC",
        operatingSystem: "Windows",
        applicationCategory: "GameApplication",
        playMode: ["SinglePlayer", "MultiPlayer"],
        author: AUTHOR,
        publisher: AUTHOR,
        sameAs: [STEAM_URL, DISCORD_URL, REDDIT_URL],
        description:
          "A Castle Fight-style auto-battler RTS. Your buildings spawn endless waves that march on the enemy castle. You win through build order, economy, and counters, not clicks.",
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Bloodlust & Harmony",
        url: SITE_URL,
      },
    ],
  };
}

/** BreadcrumbList for detail pages (Wiki > Units > Footman). */
export function breadcrumbLd(
  segments: Array<{ name: string; path: string }>,
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: segments.map((s, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: s.name,
      item: `${SITE_URL}${s.path}`,
    })),
  };
}

/** Article schema for the hand-written lore/guides/devlog pages. Only
 *  updated_at exists on wiki_pages, so it honestly serves as both dates. */
export function articleLd(page: ProsePage, path: string) {
  return {
    "@context": "https://schema.org",
    "@type": page.category === "devlog" ? "BlogPosting" : "Article",
    headline: page.title,
    datePublished: page.updated_at,
    dateModified: page.updated_at,
    author: AUTHOR,
    mainEntityOfPage: `${SITE_URL}${path}`,
    image: `${SITE_URL}/opengraph-image.jpg`,
  };
}

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
