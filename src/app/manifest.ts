import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    short_name: 'ProCESO',
    name: 'ProCESO | Technological Institute of the Philippines',
    description:
      "The official portal of the T.I.P's Community Extensions Service Office (CESO).",
    start_url: '/',
    scope: '/',
    background_color: '#242424',
    display: 'standalone',
    theme_color: '#ffc30a',
    icons: [
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
