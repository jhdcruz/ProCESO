import { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  ActionIcon,
  Group,
  Divider,
  Text,
  Loader,
  Badge,
  Anchor,
  Tooltip,
  Box,
  Timeline,
  Grid,
  Stack,
  Code,
  Textarea,
  Modal,
  Button,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import type { Enums, Tables } from '@/libs/supabase/_database';
import { ActivityDetailsProps } from '@/libs/supabase/api/_response';
import { getAssignedFaculties } from '@/libs/supabase/api/faculty-assignments';
import { getActivityReports } from '@/libs/supabase/api/storage';
import {
  IconAlertTriangle,
  IconCheck,
  IconCornerDownRight,
  IconFlagCheck,
  IconFlagQuestion,
  IconFlagX,
  IconLibrary,
  IconRosetteDiscountCheck,
  IconScanEye,
  IconShieldExclamation,
  IconShieldX,
  IconUsersGroup,
  IconX,
} from '@tabler/icons-react';
import {
  deleteActivityFile,
  downloadActivityFile,
} from '@portal/activities/actions';
import dayjs from '@/libs/dayjs';
import { isPrivate, isInternal } from '@/utils/access-control';
import { identifyFileType } from '@/utils/file-types';
import { PageLoader } from '@/components/Loader/PageLoader';
import { UserDisplay } from '@/components/Display/UserDisplay';
import { createBrowserClient } from '@/libs/supabase/client';
import { modals } from '@mantine/modals';
import { useUser } from '@/components/Providers/UserProvider';

const RTEditor = dynamic(
  () =>
    import('@/components/RTEditor/RTEditor').then((mod) => ({
      default: mod.RTEditor,
    })),
  {
    loading: () => <PageLoader />,
    ssr: false,
  },
);

interface FacultyAssignment {
  rsvp: boolean;
  faculty: Pick<
    Tables<'activities_faculties_view'>,
    'name' | 'email' | 'department'
  >;
  referrer: string;
}

interface FacultyGroup {
  referrerEmail: string;
  referrer: Tables<'activities_faculties_view'> | null;
  members: Tables<'activities_faculties_view'>[];
}

/**
 * Description of the activity with aside information
 * for published by, date created and updated, etc.
 */
function ActivityDetailsBody({
  role,
  content,
  activity,
  editable,
  loading,
  onSave,
}: {
  role: Enums<'roles_user'>;
  content: string | null;
  activity: ActivityDetailsProps;
  editable: boolean;
  loading: boolean;
  onSave: (content: string) => void;
}) {
  const { id: currentUser } = useUser();

  const clipboard = useClipboard({ timeout: 1000 });

  const [faculties, setFaculties] = useState<FacultyGroup[] | null>();
  const [files, setFiles] = useState<Tables<'activity_files'>[] | null>();

  // RSVP assignment of current user
  const [reasonModal, { open: reasonOpen, close: reasonClose }] =
    useDisclosure(false);
  const [assignSelection, setAssignSelection] =
    useState<FacultyAssignment | null>(null);
  const [acceptLoading, setAcceptLoading] = useState(false);
  const [accept, setAccept] = useState<boolean | null>(null);
  const [reason, setReason] = useState<string>('');

  const saveFile = async (fileName: string, localChecksum: string) => {
    notifications.show({
      id: localChecksum,
      loading: true,
      title: 'Downloading file...',
      message: fileName,
      withBorder: true,
    });

    // download encrypted file
    const encryptedBlob = await downloadActivityFile(
      activity.id as string,
      localChecksum,
    );

    if (!encryptedBlob) {
      notifications.update({
        id: localChecksum,
        loading: false,
        title: 'Unable to download file',
        message: 'The file may have been deleted or is inaccessible.',
        color: 'red',
        withBorder: true,
        withCloseButton: true,
        autoClose: 8000,
      });

      return;
    }

    // get key and server version of checksums
    const supabase = createBrowserClient();
    const { data, error } = await supabase
      .from('activity_files')
      .select('type, key, checksum, encrypted_checksum')
      .eq('checksum', localChecksum)
      .limit(1)
      .single();

    if (error || !data) {
      notifications.update({
        id: localChecksum,
        loading: false,
        title: 'Unable to decrypt and verify file',
        message: "Couldn't acquire key and checksum for file: " + fileName,
        color: 'red',
        withBorder: true,
        withCloseButton: true,
        autoClose: 8000,
      });
      return;
    }

    notifications.update({
      id: localChecksum,
      loading: true,
      title: `Decrypting ${fileName}...`,
      message:
        'Decrypting and verifying integrity of the file. It may open in a new tab instead of downloading.',
      withBorder: true,
    });

    // lazy load encryption modules
    const hashing = import('@noble/hashes/blake3');
    const utils = import('@noble/hashes/utils');
    const cipher = import('@noble/ciphers/chacha');
    const webcrypto = import('@noble/ciphers/webcrypto');

    const [
      { blake3 },
      { hexToBytes, bytesToHex },
      { chacha20poly1305 },
      { managedNonce },
    ] = await Promise.all([hashing, utils, cipher, webcrypto]);

    // convert data to file
    const encryptedFile = new File([encryptedBlob.data], localChecksum);

    // verify encrypted file checksum
    const encryptedHash = bytesToHex(
      blake3(new Uint8Array(await encryptedFile.arrayBuffer())),
    );

    if (encryptedHash !== data.encrypted_checksum) {
      notifications.update({
        id: localChecksum,
        loading: false,
        title: 'File integrity compromised',
        message: 'The file has been tampered with during download.',
        color: 'red',
        icon: <IconShieldExclamation />,
        withBorder: true,
        withCloseButton: true,
        autoClose: 8000,
      });

      return;
    }

    // decrypt file and verify integrity through AAD
    const key = hexToBytes(data.key!);
    const aad = hexToBytes(data.checksum!);
    const decryptedFile = managedNonce(chacha20poly1305)(key, aad).decrypt(
      new Uint8Array(await encryptedFile.arrayBuffer()),
    );

    if (decryptedFile) {
      notifications.update({
        id: localChecksum,
        loading: false,
        title: `File decrypted: ${fileName}`,
        message: 'File may open in a new tab instead of downloading.',
        color: 'green',
        icon: <IconCheck />,
        withBorder: true,
        withCloseButton: true,
        autoClose: 8000,
      });

      const blob = new Blob([decryptedFile], {
        type: data.type,
      });

      const url = URL.createObjectURL(blob);

      // open file in new tab, suchas PDFs,
      // download directly if unsupported
      window.open(url, '_blank');
    } else {
      notifications.update({
        id: localChecksum,
        loading: false,
        title: `File decryption failed`,
        message: 'Unable to decrypt file, refer to an Admin.',
        color: 'red',
        icon: <IconShieldX />,
        withBorder: true,
        withCloseButton: true,
        autoClose: 8000,
      });
    }
  };

  const handleDeleteFile = async (name: string, checksum: string) => {
    modals.openConfirmModal({
      centered: true,
      title: `Delete file`,
      size: 'lg',
      children: (
        <>
          <Text>Are you sure you want to delete this file?</Text>
          <Code block mt="sm">
            {name}
          </Code>

          <Text fw="bold" mt="sm">
            This action is irreversible!
          </Text>
        </>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        notifications.show({
          id: `delete-${checksum}`,
          loading: true,
          title: 'Deleting file...',
          message: name,
          withBorder: true,
        });

        const response = await deleteActivityFile(activity.id!, checksum);

        if (response.status === 0) {
          notifications.update({
            id: `delete-${checksum}`,
            loading: false,
            title: 'File deleted',
            message: 'The file has been successfully deleted.',
            color: 'green',
            icon: <IconCheck />,
            withBorder: true,
            withCloseButton: true,
            autoClose: 4000,
          });

          // remove file from list
          setFiles((files) => {
            if (!files) return null;
            return files.filter((file) => file.checksum !== checksum);
          });
        } else {
          notifications.update({
            id: `delete-${checksum}`,
            loading: false,
            title: 'Unable to delete file',
            message: 'The file may have been deleted or is inaccessible.',
            color: 'red',
            withBorder: true,
            withCloseButton: true,
            autoClose: 4000,
          });
        }
      },
    });
  };

  const handleRsvp = async ({ rsvp, faculty, referrer }: FacultyAssignment) => {
    if (accept === rsvp) return;

    setAcceptLoading(true);
    const supabase = createBrowserClient();

    // save rsvp resposne
    const { error } = await supabase
      .from('faculty_assignments')
      .update({
        rsvp,
        rsvp_comments: reason,
      })
      .eq('activity_id', activity.id!)
      .eq('user_id', currentUser);

    // email referrer or staff about faculty assignment response
    const emailResponse = await fetch('/api/activities/rsvp', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        activity,
        rsvp: rsvp,
        reason: reason,
        faculty: {
          name: faculty.name,
          email: faculty.email,
          dept: faculty.department,
        },
        referrer: referrer,
      }),
    });

    if (!emailResponse.ok) {
      console.error('Email error', { emailResponse });
      notifications.show({
        title: 'Unable to notify referrer',
        message:
          'A technical error occured, please approach the referrer directly.',
        color: 'yellow',
        withBorder: true,
        withCloseButton: true,
        autoClose: 4000,
      });
    } else {
      notifications.show({
        title: error ? 'Unable to respond' : 'Response saved',
        message: error
          ? error.message
          : 'Referrer has been notified of your response.',
        color: error ? 'red' : 'green',
        icon: error ? <IconAlertTriangle /> : <IconCheck />,
        withBorder: true,
        withCloseButton: true,
        autoClose: 4000,
      });
    }

    // update local state
    if (error === null) {
      setAccept(rsvp);
    }

    setAcceptLoading(false);
  };

  // show notification when email is copied to clipboard
  useEffect(() => {
    // fixes notification appearing twice
    if (clipboard.copied) {
      notifications.show({
        message: 'Checksum copied to clipboard',
        color: 'green',
        withBorder: true,
        withCloseButton: true,
        autoClose: 1400,
      });
    }
  }, [clipboard.copied]);

  // fetch additional activity details
  useEffect(() => {
    const fetchActivityDetails = async () => {
      const getAssigned = getAssignedFaculties({
        activityId: activity.id as string,
      });

      let getFiles;
      if (isInternal(role)) {
        getFiles = getActivityReports(activity.id as string);
      }

      const [activityFiles, activityFaculties] = await Promise.all([
        getFiles,
        getAssigned,
      ]);

      if (activityFaculties?.status !== 0) {
        notifications.show({
          title: 'Cannot get assigned faculties',
          message: activityFaculties.message,
          color: 'yellow',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });
      }

      if (getFiles && activityFiles?.status !== 0) {
        notifications.show({
          title: 'Cannot get activity files',
          message: activityFiles?.message,
          color: 'yellow',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });
      }

      if (activityFaculties?.data) {
        // Transform flat faculty array into grouped structure by referrer
        const groups = activityFaculties.data.reduce((acc, faculty) => {
          // Use referrer's email as group identifier, fallback to 'none' if no referrer
          const referrerEmail = faculty.referrer_email ?? 'none';

          // Check if a group with this referrer already exists
          const existingGroup = acc.find(
            (g) => g.referrerEmail === referrerEmail,
          );

          if (existingGroup) {
            // If group exists, add faculty to its members array
            existingGroup.members.push(faculty);
          } else {
            // If no group exists yet, create new group with:
            // - referrerEmail: identifier for the group
            // - referrer: faculty object if has referrer, null if none
            // - members: array starting with current faculty
            acc.push({
              referrerEmail,
              referrer: faculty.referrer_email ? faculty : null,
              members: [faculty],
            });
          }
          return acc;
        }, [] as FacultyGroup[]); // Initialize with empty array typed as FacultyGroup[]

        const userRsvp = groups
          .find((g) => g.members.find((m) => m.id === currentUser)?.id)
          ?.members.find((m) => m.id === currentUser)?.rsvp;

        // Check if current user RSVP status
        setAccept(userRsvp ?? null);

        setFaculties(groups);
      } else {
        // If no faculty data, reset state to null
        setFaculties(null);
      }

      setFiles(activityFiles?.data ?? null);
    };

    void fetchActivityDetails();
  }, [activity.id, role, currentUser]);

  return (
    <Grid align="start" justify="space-between">
      <Grid.Col
        order={{ base: 1, sm: 2, md: 2, lg: 1 }}
        span={{ base: 'auto', sm: 12, md: 12, lg: 8 }}
      >
        <RTEditor
          content={content}
          editable={editable}
          loading={loading}
          onSubmit={onSave}
        />
      </Grid.Col>

      <Grid.Col
        order={{ base: 2, md: 1, lg: 2 }}
        span={{ base: 'auto', sm: 12, md: 12, lg: 4 }}
      >
        {isPrivate(role) && (
          <>
            <Divider
              label={
                <Group gap={0} wrap="nowrap">
                  <IconScanEye className="mr-2" size={16} />
                  Published {dayjs(activity.created_at).fromNow()} by
                </Group>
              }
              labelPosition="left"
              mb="md"
            />

            <Box mb="lg">
              <UserDisplay
                avatar_url={activity.creator_avatar}
                department={activity.creator_department!}
                email={activity.creator_email!}
                name={activity.created_by!}
                other_roles={activity.creator_other_roles}
                role={activity.creator_role!}
              />
            </Box>
          </>
        )}

        <Divider
          label={
            <Group gap={0} wrap="nowrap">
              <IconUsersGroup className="mr-2" size={16} />
              Delegation
            </Group>
          }
          labelPosition="left"
          mt="xs"
          my="md"
        />

        <Modal
          centered
          onClose={reasonClose}
          opened={reasonModal}
          size="md"
          title="Please state your reason"
        >
          <Textarea
            onChange={(e) => setReason(e.currentTarget.value)}
            placeholder="I would not be able to go due to ..."
            required
            rows={5}
            value={reason}
          />

          <Group justify="flex-end" mt="lg">
            <Button onClick={reasonClose} variant="subtle">
              Cancel
            </Button>
            <Button
              onClick={() => {
                handleRsvp({
                  rsvp: false,
                  faculty: assignSelection!.faculty,
                  referrer: assignSelection!.referrer,
                });
                reasonClose();
              }}
            >
              Submit
            </Button>
          </Group>
        </Modal>
        {faculties ? (
          <>
            {faculties.length ? (
              <>
                {faculties.map((group) => (
                  <Box key={group.referrerEmail}>
                    {group.referrer && (
                      <Box mb="xs">
                        <Text c="dimmed" mb={4} size="xs">
                          Referrer:
                        </Text>
                        <UserDisplay
                          avatar_url={group.referrer.referrer_avatar}
                          department={group.referrer.referrer_department!}
                          email={group.referrer.referrer_email!}
                          name={group.referrer.referrer_name!}
                          other_roles={group.referrer.referrer_other_roles}
                          role={group.referrer.referrer_role!}
                        />
                      </Box>
                    )}

                    <Timeline bulletSize={22} lineWidth={2} my="lg">
                      {group.members.map((faculty) => (
                        <Timeline.Item
                          bullet={<IconCornerDownRight size={12} />}
                          key={faculty.id}
                          mt="md"
                        >
                          <Group gap={6} justify="space-between">
                            <UserDisplay
                              avatar_url={faculty.avatar_url}
                              department={faculty.department!}
                              email={faculty.email!}
                              highlightSelf={currentUser === faculty.id}
                              name={faculty.name!}
                              other_roles={faculty.other_roles}
                              role={faculty.role!}
                            />

                            <Box ml="auto">
                              {currentUser === faculty.id ? (
                                // RSVP controls for current logged-in faculty
                                <ActionIcon.Group my={6}>
                                  <Tooltip label="Will Go" withArrow>
                                    <ActionIcon
                                      color="green"
                                      loading={acceptLoading}
                                      onClick={() =>
                                        handleRsvp({
                                          rsvp: true,
                                          faculty,
                                          referrer: group.referrerEmail,
                                        })
                                      }
                                      size="lg"
                                      variant={
                                        accept === true ? 'filled' : 'outline'
                                      }
                                    >
                                      <IconFlagCheck size={16} />
                                    </ActionIcon>
                                  </Tooltip>

                                  <Tooltip label="Can't Go" withArrow>
                                    <ActionIcon
                                      color="red"
                                      loading={acceptLoading}
                                      onClick={() => {
                                        setAssignSelection({
                                          rsvp: false,
                                          faculty,
                                          referrer: group.referrerEmail,
                                        });
                                        reasonOpen();
                                      }}
                                      size="lg"
                                      variant={
                                        accept === false ? 'filled' : 'outline'
                                      }
                                    >
                                      <IconFlagX size={16} />
                                    </ActionIcon>
                                  </Tooltip>
                                </ActionIcon.Group>
                              ) : (
                                // Show RSVP status for other faculty
                                <Tooltip
                                  label={
                                    faculty.rsvp === null
                                      ? 'Waiting for response'
                                      : faculty.rsvp
                                        ? 'Will Go'
                                        : "Can't Go"
                                  }
                                  withArrow
                                >
                                  <ActionIcon
                                    className="cursor-default"
                                    color={
                                      faculty.rsvp === null
                                        ? 'gray'
                                        : faculty.rsvp
                                          ? 'green'
                                          : 'red'
                                    }
                                    size="lg"
                                    variant="light"
                                  >
                                    {faculty.rsvp === null ? (
                                      <IconFlagQuestion size={16} />
                                    ) : faculty.rsvp ? (
                                      <IconFlagCheck size={16} />
                                    ) : (
                                      <IconFlagX size={16} />
                                    )}
                                  </ActionIcon>
                                </Tooltip>
                              )}
                            </Box>
                          </Group>
                        </Timeline.Item>
                      ))}
                    </Timeline>
                  </Box>
                ))}
              </>
            ) : (
              <Text c="dimmed" fs="italic" mt="xs" size="xs" ta="center">
                No faculty assigned yet.
              </Text>
            )}
          </>
        ) : (
          <Loader className="mx-auto my-5" size="sm" type="dots" />
        )}

        {isInternal(role) && files && (
          <>
            <Divider
              label={
                <Group gap={0} wrap="nowrap">
                  <IconLibrary className="mr-2" size={16} />
                  Reports
                </Group>
              }
              labelPosition="left"
              mt="xs"
              my="md"
            />

            {files.length > 0 ? (
              <>
                {files.map((file) => (
                  <Group
                    align="flex-start"
                    gap={6}
                    key={file.checksum}
                    my={16}
                    wrap="nowrap"
                  >
                    <Badge miw={40} size="sm" variant="default">
                      {identifyFileType(file.type)}
                    </Badge>

                    <Stack gap={6}>
                      <Tooltip
                        label={file.name}
                        multiline
                        openDelay={400}
                        withArrow
                      >
                        <Anchor
                          component="button"
                          fw={500}
                          lineClamp={2}
                          onClick={() => saveFile(file.name, file.checksum)}
                          size="sm"
                          ta="left"
                        >
                          {file.name}
                        </Anchor>
                      </Tooltip>

                      <Group gap={2} mt={4}>
                        <Text c="dimmed" size="xs">
                          {dayjs(file.uploaded_at).fromNow()}
                        </Text>

                        <Tooltip
                          label="Verified checksum of the uploaded file, should match the downloaded file."
                          multiline
                          withArrow
                        >
                          <Badge
                            className="cursor-pointer"
                            color="gray"
                            leftSection={<IconRosetteDiscountCheck size={16} />}
                            onClick={() => clipboard.copy(file.checksum)}
                            size="xs"
                            variant="transparent"
                          >
                            {file.checksum.slice(0, 8)}
                          </Badge>
                        </Tooltip>
                      </Group>
                    </Stack>

                    <ActionIcon
                      aria-label="Delete file"
                      color="dimmed"
                      ml="auto"
                      onClick={() => handleDeleteFile(file.name, file.checksum)}
                      variant="transparent"
                    >
                      <IconX size={16} />
                    </ActionIcon>
                  </Group>
                ))}
              </>
            ) : (
              <Text c="dimmed" fs="italic" mt="xs" size="xs" ta="center">
                No reports uploaded yet.
              </Text>
            )}
          </>
        )}
      </Grid.Col>
    </Grid>
  );
}

export const ActivityInfoBody = memo(ActivityDetailsBody);
