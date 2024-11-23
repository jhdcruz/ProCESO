import { NextRequest } from 'next/server';
import { createServerClient } from '@/libs/supabase/server';

/**
 * Export activities feedback responses as CSV
 *
 * @param req - The activity ID
 */
export async function GET(req: NextRequest) {
  // get search params from request
  const params = req.nextUrl.searchParams;
  const id = params.get('id') as string;

  if (!id) {
    return new Response('Invalid request', {
      status: 400,
    });
  }

  const cookies = req.cookies;
  const supabase = await createServerClient(cookies);

  const { data, error } = await supabase
    .from('activity_eval_view')
    .select()
    .csv();

  if (error) {
    return new Response(error.message, {
      status: 400,
    });
  }

  return new Response(data, {
    status: 200,
    headers: { 'Content-Type': 'text/csv' },
  });
}
