/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage: game icons + portraits uploaded by Tools/WikiSync.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
  experimental: {
    // The home page enumerates public/screenshots with fs at render time;
    // include the folder in the serverless bundle so ISR regeneration sees it.
    // The OG card routes readFile the vendored Cinzel font — tracing misses
    // it, so include it explicitly or the routes 500 on Vercel.
    outputFileTracingIncludes: {
      "/": ["./public/screenshots/**/*"],
      // Every opengraph-image route readFiles the vendored Cinzel font;
      // trace it into each so ISR regeneration on Vercel doesn't 500.
      "/**/opengraph-image": ["./assets/fonts/**/*"],
      "/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/unit/[slug]/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/faction/[slug]/opengraph-image": ["./assets/fonts/**/*"],
      "/how-to-play/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/factions/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/units/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/buildings/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/abilities/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/researches/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/shop/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/statuses/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/matrix/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/modes/opengraph-image": ["./assets/fonts/**/*"],
    },
  },
};

export default nextConfig;
