export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://bloodlust-harmony-site.vercel.app";

/** schema.org VideoGame graph for search engines. */
export const siteGraph = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "VideoGame",
      name: "Bloodlust & Harmony",
      url: SITE_URL,
      genre: ["Real-time strategy", "Auto battler"],
      gamePlatform: "PC",
      operatingSystem: "Windows",
      applicationCategory: "Game",
      description:
        "A Castle Fight-style auto-battler RTS. Your buildings spawn endless waves that march on the enemy castle. You win through build order, economy, and counters, not clicks.",
      author: { "@type": "Person", name: "TheCyberMouse" },
    },
    {
      "@type": "WebSite",
      name: "Bloodlust & Harmony",
      url: SITE_URL,
    },
  ],
};

export default function JsonLd({ data }: { data: object }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
