export const siteUrl = () => {
  let url =
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000';

  // Make sure to include `https://` when not localhost.
  url = url.includes('http') ? url : `https://${url}/`;

  return url;
};
