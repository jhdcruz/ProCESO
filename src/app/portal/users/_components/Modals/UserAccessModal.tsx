'use client';

import { memo, useEffect, useState } from 'react';
import { Text, Button, Modal, Group } from '@mantine/core';
import { IconShieldCancel, IconShieldCheck } from '@tabler/icons-react';
import { changeUserAccess } from '@portal/users/actions';
import { notifications } from '@mantine/notifications';
import type { Tables } from '@/libs/supabase/_database';

function UserAccess({
  selected,
  users,
  setUsers,
  opened,
  close,
}: {
  selected: Tables<'users'> | null;
  users: Tables<'users'>[];
  setUsers: (users: Tables<'users'>[]) => void;
  opened: boolean;
  close: () => void;
}) {
  const [id, setId] = useState<string>(selected?.id as string);
  const [active, setActive] = useState<boolean>(selected?.active ?? false);
  const onAccessChange = async () => {
    const response = await changeUserAccess(id, !active);

    notifications.show({
      title: response.title,
      message: response.message,
      color: response.status === 2 ? 'red' : 'green',
      withBorder: true,
      withCloseButton: true,
      autoClose: 4000,
    });

    close();

    // reflect changes locally
    if (response.status === 0) {
      setUsers(
        users.map((user) =>
          user.id === id ? { ...user, active: !active } : user,
        ),
      );
    }
  };

  // reflect changes in selected user
  useEffect(() => {
    setId(selected?.id as string);
    setActive(selected?.active ?? false);
  }, [selected]);

  return (
    <Modal
      centered
      onClose={close}
      opened={opened}
      title={`${active ? 'Disable' : 'Enable'} user?`}
    >
      {active ? (
        <>
          <Text>The user won&apos;t be able to access the system anymore.</Text>
          <Text fw="bold" mt="sm">
            This will not delete the user from the database.
          </Text>
        </>
      ) : (
        <>
          <Text>This will allow the user to access the system again.</Text>
        </>
      )}

      <Group gap="sm" justify="flex-end" mt="md">
        <Button onClick={close} variant="default">
          Cancel
        </Button>

        <Button
          color={active ? 'red' : 'green'}
          leftSection={
            active ? (
              <IconShieldCancel size={20} stroke={1.6} />
            ) : (
              <IconShieldCheck size={20} stroke={1.6} />
            )
          }
          onClick={onAccessChange}
          variant="filled"
        >
          {active ? 'Disable' : 'Enable'}
        </Button>
      </Group>
    </Modal>
  );
}

export const UserAccessModal = memo(UserAccess);
