import { NextRequest } from 'next/server';
import { getActivitiesInRange } from '@/libs/supabase/api/activity';
import { activitiesToFc } from '@/utils/activities-to-fc';
import { createServerClient } from '@/libs/supabase/server';

/**
 * Get list of activities in FullCalendar ActivitySourceInput format.
 *
 * @param req - The request object in `ActivitySourceInput` format.
 */
export async function GET(req: NextRequest) {
  // get search params from request
  const params = req.nextUrl.searchParams;
  const start = params.get('start') as string;
  const end = params.get('end') as string;

  if (!start && !end) {
    return new Response('Invalid request', {
      status: 400,
    });
  }

  const cookies = req.cookies;
  const supabase = await createServerClient(cookies);

  // get activities within range
  const response = await getActivitiesInRange({
    start,
    end,
    supabase,
  });

  if (response.status !== 0 || !response.data) {
    return new Response(JSON.stringify(response), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  // return data to FullCalendar format
  const data = activitiesToFc(response.data);

  // add caching
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=10800, stale-while-revalidate=86400',
    },
  });
}
