/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
  },
  images: {
    domains: ["https://kcgvoeyhpkxzvanujxlt.supabase.co"],
  },
};

export default nextConfig;
