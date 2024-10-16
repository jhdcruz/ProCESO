import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: true,
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/charts',
      '@react-email/components',
      'framer-motion',
      'dayjs',
      'little-date',
      'recharts',
    ],
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'kcgvoeyhpkxzvanujxlt.supabase.co',
        port: '',
        pathname: '/storage/**',
      },
      {
        protocol: 'https',
        hostname: '**.googleusercontent.com',
        port: '',
        search: '',
      },
    ],
  },
};

export default nextConfig;
