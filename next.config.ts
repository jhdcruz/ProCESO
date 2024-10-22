import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    reactCompiler: true,
    optimizePackageImports: [
      '@mantine/core',
      '@mantine/hooks',
      '@mantine/dates',
      '@mantine/charts',
      '@mantine/tiptap',
      '@react-email/components',
      '@fullcalendar/core',
      '@fullcalendar/react',
      '@noble/hashes',
      '@noble/ciphers',
      '@trigger.dev/sdk',
      '@tiptap/pm',
      '@tiptap/react',
      '@tabler/icons-react',
      'framer-motion',
      'dayjs',
      'resend',
      'little-date',
      'recharts'
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

export default withBundleAnalyzer({
  enabled: process.env.DEBUG === '1',
})(nextConfig);
