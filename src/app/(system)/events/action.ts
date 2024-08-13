import { redirect } from 'next/navigation';
import { createBrowserClient } from '@/utils/supabase/client';
import { NewEvent } from './_components/Forms/NewEventModal';

interface EventResponse {
  status: 0 | 1 | 2; // 0 for success, 1 for warning, 2 for error
  title: string;
  message: string;
}

export async function submitEvent(event: NewEvent): Promise<EventResponse> {
  const supabase = createBrowserClient();

  // get current user id for created_by
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // just in case the session is expired
    redirect('/login');
  }

  // create event series if it doesn't exist
  let seriesId = null;
  if (event.series) {
    const { data: series, error } = await supabase
      .from('series')
      .insert({ title: event.series })
      .select('id')
      .limit(1)
      .single();

    if (error)
      return {
        status: 2,
        title: 'Unable to create series group',
        message: error.message,
      };

    // return the id for event link
    seriesId = series.id;
  }

  // create the event
  const { data: eventId, error } = await supabase
    .from('events')
    .insert({
      title: event.title,
      series: event.series,
      features: event.features,
      visibility: event.visibility,
      date_ending: event.date_ending?.toISOString(),
      date_starting: event.date_starting?.toISOString(),
      created_by: session.user.id,
    })
    .select('id')
    .limit(1)
    .single();

  if (error)
    return {
      status: 2,
      title: 'Unable to create event',
      message: error.message,
    };

  // we process the image after the event is created for the id
  if (event.image_url) {
    const { error } = await supabase.storage
      .from('event_covers')
      .upload(eventId.id, event.image_url, {
        upsert: true,
      });

    if (error)
      return {
        status: 1,
        title: 'Image could not be uploaded',
        message: error.message,
      };

    // get the public url
    const {
      data: { publicUrl },
    } = supabase.storage.from('event_covers').getPublicUrl(eventId.id);

    // save the image url to the event
    const { error: linkError } = await supabase
      .from('events')
      .update({ image_url: publicUrl })
      .eq('id', eventId.id);

    // remove the image if there's an error
    if (linkError) {
      await supabase.storage.from('event_covers').remove([eventId.id]);
      return {
        status: 1,
        title: 'Image could not be linked',
        message: linkError.message,
      };
    }
  }

  return {
    status: 0,
    title: 'New event created',
    message: 'Event has been successfully created.',
  };
}
