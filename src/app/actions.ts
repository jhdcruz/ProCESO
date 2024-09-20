// Contains global action functions that can be used across routes

'use server';

import { revalidatePath } from 'next/cache';

/**
 * Render a pathname stale, and in need of fresh data.
 *
 * Use for every updating and inserting of data.
 *
 * @params pathname - The path to revalidate
 */
export async function revalidate(pathname: string) {
  revalidatePath(pathname);
}
