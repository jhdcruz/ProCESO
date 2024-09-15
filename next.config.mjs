/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    instrumentationHook: true,
    reactCompiler: true,
    ppr: true,
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/charts',
      '@react-email/components',
      'framer-motion',
      'dayjs',
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
        hostname: '*.googleusercontet.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
