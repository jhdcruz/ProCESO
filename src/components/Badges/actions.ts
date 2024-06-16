'use server';

/**
 * Check the health of the system.
 *
 * Query all the services and check if they are up.
 */
export async function checkHealth() {
  const url = process.env.SUPABASE_URL!!;

  const db = await fetch(url, {
    method: 'HEAD',
    headers: {
      apikey: `${process.env.SUPABASE_ANON_KEY}`,
    },
  });

  const status = await Promise.all([db]);

  // check if all promises resolves
  // we'll include 404, since technically it is accessible
  if (status.every((res) => res.status === 404 || res.ok)) {
    return 0; // healthy
  }

  // check if some promise returns an error
  if (status.some((res) => res.status !== 404 || !res.ok)) {
    return 1; // warning
  }

  return 2; // critical, all down
}
