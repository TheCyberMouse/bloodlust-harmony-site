/** @type {import('next').NextConfig} */
const nextConfig = {
  // Force Node runtime for the MCP route — we use crypto and the
  // Supabase JS client, which expect Node APIs.
  experimental: { serverActions: { bodySizeLimit: "5mb" } },
};

export default nextConfig;
