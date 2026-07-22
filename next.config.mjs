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
    outputFileTracingIncludes: {
      "/": ["./public/screenshots/**/*"],
    },
  },
};

export default nextConfig;
