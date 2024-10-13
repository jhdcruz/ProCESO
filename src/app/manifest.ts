import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    lang: 'en',
    short_name: 'ProCESO',
    name: 'ProCESO | T.I.P Community Extensions Service Office',
    description:
      "The official portal of the T.I.P's Community Extensions Service Office (CESO).",
    start_url: '/',
    background_color: '#242424',
    display: 'standalone',
    theme_color: '#ffc30a',
    icons: [
      {
        src: '/assets/tip-r.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'maskable',
      },
      {
        src: '/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
    ],
  };
}
