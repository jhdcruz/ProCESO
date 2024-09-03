/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
    reactCompiler: true,
    ppr: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kcgvoeyhpkxzvanujxlt.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
    ],
  },
};

export default nextConfig;
