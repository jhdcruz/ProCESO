import { createBrowserClient } from '../client';
import type { FileWithPath } from '@mantine/dropzone';
import type { SupabaseClient } from '@supabase/supabase-js';
import type ApiResponse from '@/utils/response';

/**
 * Upload file to storage and link public url to event.
 *
 * @param file - The file to upload.
 * @param eventId - The event ID to link the image to.
 * @param supabase - The Supabase client to use.
 *
 * @returns {ApiResponse} which can be used for displaying notifications.
 */
export async function postEventCover({
  file,
  eventId,
  supabase,
}: {
  file: FileWithPath;
  eventId: string;
  supabase?: SupabaseClient;
}): Promise<ApiResponse> {
  if (!supabase) supabase = createBrowserClient();

  // upload file
  const { error } = await supabase.storage
    .from('event_covers')
    .upload(eventId, file, {
      upsert: true,
    });

  if (error)
    return {
      status: 1,
      title: 'Event created with problems',
      message: 'Image could not be uploaded, edit event: ' + error.message,
    };

  // get the public url
  const {
    data: { publicUrl },
  } = supabase.storage.from('event_covers').getPublicUrl(eventId);

  // save the image url to the event
  const { error: linkError } = await supabase
    .from('events')
    .update({ image_url: publicUrl })
    .eq('id', eventId);

  // remove the uploaded image if there's an error in linking the url
  // to avoid duplicated image on reupload
  if (linkError) {
    await supabase.storage.from('event_covers').remove([eventId]);
    return {
      status: 1,
      title: 'Event created with problems',
      message: "Image couldn't be linked, upload again: " + linkError.message,
    };
  }

  return {
    status: 0,
    title: 'Image uploaded',
    message: 'The image has been successfully uploaded.',
    data: publicUrl,
  };
}
