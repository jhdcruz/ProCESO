import MillionLint from '@million/lint';
import type { NextConfig } from 'next';
import withBundleAnalyzer from '@next/bundle-analyzer';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    // Ignore node-specific modules when bundling for the browser
    // See https://webpack.js.org/configuration/resolve/#resolvealias
    config.resolve.alias = {
      ...config.resolve.alias,
      'onnxruntime-node$': false,
      '@huggingface/transformers': false,
      sharp$: false,
    };

    return config;
  },
  serverExternalPackages: [
    'sharp',
    'onnxruntime-node',
    '@huggingface/transformers',
  ],
  experimental: {
    reactCompiler: true,
    ppr: true,
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
      'recharts',
      'mapbox-gl',
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

export default MillionLint.next({
  enabled: process.env.DEBUG === '1',
  rsc: true,
})(
  withBundleAnalyzer({
    enabled: process.env.DEBUG === '1',
  })(nextConfig),
);
