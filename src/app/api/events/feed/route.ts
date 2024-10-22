import { NextRequest } from 'next/server';
import { getEventsInRange } from '@/libs/supabase/api/event';
import { eventsToFc } from '@/utils/events-to-fc';
import { createServerClient } from '@/libs/supabase/server';

/**
 * Get list of events in FullCalendar EventSourceInput format.
 *
 * @param req - The request object in `EventSourceInput` format.
 */
export async function GET(req: NextRequest) {
  // get search params from request
  const params = req.nextUrl.searchParams;
  const start = params.get('start')!;
  const end = params.get('end')!;

  if (!start && !end) {
    return new Response('Invalid request', {
      status: 400,
    });
  }

  const cookies = req.cookies;
  const supabase = await createServerClient(cookies);

  // get events within range
  const response = await getEventsInRange({
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
  const data = eventsToFc(response.data);

  // add caching
  return new Response(JSON.stringify(data), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, s-maxage=10800, stale-while-revalidate=86400',
    },
  });
}
