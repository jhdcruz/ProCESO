/**
 * Get the current deployment site url.
 *
 * @returns The current deployment site url with protocol (http/https).
 */
export const siteUrl = () => {
  const url =
    process.env.NEXT_PUBLIC_VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.NEXT_PUBLIC_VERCEL_URL ??
    'http://localhost:3000';

  // Make sure to include `https://` when not localhost.
  const formattedUrl = url.includes('http') ? url : `https://${url}`;
  return formattedUrl.replace(/\/$/, ''); // remove trailing slash
};
