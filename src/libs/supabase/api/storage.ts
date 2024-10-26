import { createElement } from 'react';
import type { FileWithPath } from '@mantine/dropzone';
import type { SupabaseClient } from '@supabase/supabase-js';
import { type notifications } from '@mantine/notifications';
import { IconAlertTriangle, IconCheck } from '@tabler/icons-react';
import type ApiResponse from '@/utils/response';
import type { ActivityFilesResponse } from './_response';
import { createBrowserClient } from '../client';

/**
 * Upload file to storage and link public url to activity.
 *
 * @param file - The file to upload.
 * @param activityId - The activity ID to link the image to.
 * @param supabase - The Supabase client to use.
 *
 * @returns {ApiResponse} which can be used for displaying notifications.
 */
export async function postActivityCover({
  file,
  activityId,
  supabase,
}: {
  file: FileWithPath;
  activityId: string;
  supabase?: SupabaseClient;
}): Promise<ApiResponse> {
  if (!supabase) supabase = createBrowserClient();

  // upload file
  const { error } = await supabase.storage
    .from('activity_covers')
    .upload(activityId, file, {
      upsert: true,
    });

  if (error)
    return {
      status: 1,
      title: 'Activity created with problems',
      message: 'Image could not be uploaded, edit activity: ' + error.message,
    };

  // get the public url
  const {
    data: { publicUrl },
  } = supabase.storage.from('activity_covers').getPublicUrl(activityId);

  // save the image url to the activity
  const { error: linkError } = await supabase
    .from('activities')
    .update({ image_url: publicUrl })
    .eq('id', activityId);

  // remove the uploaded image if there's an error in linking the url
  // to avoid duplicated image on reupload
  if (linkError) {
    await supabase.storage.from('activity_covers').remove([activityId]);
    return {
      status: 1,
      title: 'Activity created with problems',
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

/**
 * Fetch uploaded files for the activity.
 *
 * @param activityId - The activity id to get files.
 */
export async function getActivityReports(
  activityId: string,
): Promise<ActivityFilesResponse> {
  const supabase = createBrowserClient();

  const { data, error } = await supabase
    .from('activity_files')
    .select()
    .eq('activity', activityId);

  if (error) {
    return {
      status: 1,
      title: 'Files not fetched',
      message: error.message,
    };
  }

  return {
    status: 0,
    title: 'Files fetched',
    message: 'The files have been successfully fetched.',
    data: data,
  };
}

/**
 * Upload files to supabase storage /activities/[id]/file_hash
 *
 * @param files - The files array o upload.
 * @param activityId - The activity id to associate the file with.
 */
export async function uploadActivityFiles(
  activityId: string,
  {
    files,
    notify,
  }: {
    files: File[];
    notify?: typeof notifications;
  },
) {
  const supabase = createBrowserClient();

  let errors = 0;

  notify?.show({
    id: 'file-upload',
    loading: true,
    title: 'Uploading files',
    message: 'Please wait while we upload the files.',
    withBorder: true,
    withCloseButton: false,
    autoClose: false,
  });

  // lazy load hashing and toHex functions
  const hashing = import('@noble/hashes/blake3');
  const toHex = import('@noble/hashes/utils');

  const [{ blake3 }, { bytesToHex }] = await Promise.all([hashing, toHex]);

  for (const file of files) {
    const hash = bytesToHex(blake3(new Uint8Array(await file.arrayBuffer())));

    // upload file to storage
    const { error: storageError } = await supabase.storage
      .from(`activities`)
      .upload(`${activityId}/${hash}`, file, {
        upsert: true,
      });

    if (storageError) {
      errors++;

      notify?.show({
        title: `Failed to upload file: ${file.name}`,
        message: storageError.message,
        color: 'red',
        withBorder: true,
        withCloseButton: true,
        autoClose: 4000,
      });
    } else {
      // store metadata to 'activity_files' table
      await supabase.from('activity_files').insert({
        activity: activityId,
        name: file.name,
        checksum: hash,
        type: file.type,
      });
    }
  }

  if (errors) {
    notify?.update({
      id: 'file-upload',
      title: 'Failed to upload files',
      message: 'Some files failed to upload.',
      loading: false,
      icon: createElement(IconAlertTriangle),
      color: 'yellow',
      withBorder: true,
      withCloseButton: true,
      autoClose: 4000,
    });
  } else {
    notify?.update({
      id: 'file-upload',
      title: 'Files uploaded',
      message: 'Files have been successfully uploaded.',
      loading: false,
      icon: createElement(IconCheck),
      color: 'green',
      withBorder: true,
      withCloseButton: true,
      autoClose: 4000,
    });
  }
}
