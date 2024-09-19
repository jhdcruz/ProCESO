import { NextRequest } from 'next/server';
import { getEventsInRange } from '@/libs/supabase/api/event';
import { eventsToFc } from '@/utils/events-to-fc';

/**
 * Get list of events in FullCalendar EventSourceInput format.
 *
 * @param req - The request object in `EventSourceInput` format.
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

  // get events within range
  const response = await getEventsInRange({
    start,
    end,
  });

  if (response.status !== 0) {
    return new Response(JSON.stringify(response), {
      status: 500,
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
      'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=86400',
    },
  });
}
