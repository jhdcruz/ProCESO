'use server';

import { createServerClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import type { NewEvent } from './_components/Forms/NewEventModal';

export async function submitEvent(event: NewEvent): Promise<string | null> {
  const cookieStore = await import('next/headers').then((mod) => mod.cookies);
  const supabase = createServerClient(cookieStore());

  // get current user id for created_by
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    // just in case the session is expired
    redirect('/login');
  }

  let newEvent: NewEvent = {
    ...event,
  };

  // create series if it doesn't exist
  if (event.series) {
    const { data: seriesId, error } = await supabase
      .from('series')
      .insert({ title: event.series })
      .select('id')
      .limit(1)
      .single();

    if (error) return error.message;

    newEvent.series = seriesId.id;
  }

  const { data: eventId, error } = await supabase
    .from('events')
    .insert({
      title: newEvent.title,
      series: newEvent.series,
      features: newEvent.features,
      visibility: newEvent.visibility,
      date_ending: newEvent.date_ending?.toISOString(),
      date_starting: newEvent.date_starting?.toISOString(),
      created_by: session.user.id,
    })
    .select('id')
    .limit(1)
    .single();

  if (error) return error.message;

  // we process the image after the event is created for the id
  if (event.image_url) {
    // get extension
    const ext = event.image_url.name?.split('.').pop();

    const { error } = await supabase.storage
      .from('events')
      .upload(`${eventId.id}/cover.${ext}`, event.image_url, {
        upsert: true,
      });

    if (error) return error.message;

    // get the public url
    const {
      data: { publicUrl },
    } = supabase.storage
      .from('events')
      .getPublicUrl(`${eventId.id}/cover.${ext}`);

    // save the image url to the event
    const { error: updateError } = await supabase
      .from('events')
      .update({ image_url: publicUrl })
      .eq('id', eventId.id);

    if (updateError) return updateError.message;
  }

  return null;
}
