/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      // Supabase Storage: game icons + portraits uploaded by Tools/WikiSync.
      { protocol: "https", hostname: "*.supabase.co" },
    ],
  },
};

export default nextConfig;
