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
      "/wiki/unit/[slug]/opengraph-image": ["./assets/fonts/**/*"],
      "/wiki/faction/[slug]/opengraph-image": ["./assets/fonts/**/*"],
    },
  },
};

export default nextConfig;
