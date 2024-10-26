import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: ['/portal/activities/**/info', '/feedback/*', '/certs/*'],
      disallow: '/*',
    },
  };
}
