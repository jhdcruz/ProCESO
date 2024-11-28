'use client';

import { memo, useEffect, useState } from 'react';
import {
  Button,
  Modal,
  Group,
  rem,
  Text,
  Blockquote,
  List,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  IconDeviceFloppy,
  IconInfoCircle,
  IconTrash,
} from '@tabler/icons-react';
import { deleteUser, updateUser } from '@portal/users/actions';
import type { Tables, Enums } from '@/libs/supabase/_database';
import { FilterUsers } from '@/components/Filters/FilterUsers';
import { modals } from '@mantine/modals';

function UserEdit({
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
  const [dept, setDept] = useState<Enums<'roles_dept'>[]>([
    selected?.department ?? 'na',
  ]);
  const [role, setRole] = useState<Enums<'roles_user'>[]>([
    selected?.role ?? 'student',
  ]);
  const [pos, setPos] = useState<Enums<'roles_pos'>[]>(
    selected?.other_roles ?? [],
  );

  const handleDelete = async () => {
    if (!selected?.id) return;

    modals.openConfirmModal({
      centered: true,
      title: 'Delete User?',
      children: (
        <>
          <Text>Are you sure you want to delete this user?</Text>
          <Text fw="bold" mt="sm">
            This action is irreversible!
          </Text>
        </>
      ),
      labels: { confirm: 'Delete', cancel: 'Cancel' },
      confirmProps: { color: 'red' },
      onConfirm: async () => {
        const response = await deleteUser(selected.id);

        if (response.status === 0) {
          setUsers(users.filter((user) => user.id !== selected.id));
        }

        notifications.show({
          title: response.title,
          message: response.message,
          color: response.status === 0 ? 'green' : 'red',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });
      },
    });
  };

  const handleSubmit = async () => {
    const response = await updateUser(selected?.id as string, {
      dept: dept[0],
      role: role[0],
      pos: pos,
    });

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
          user.id === selected?.id
            ? {
                ...user,
                department: dept[0],
                role: role[0],
                other_roles: pos,
              }
            : user,
        ),
      );
    }
  };

  const resetState = () => {
    setDept([selected?.department ?? 'na']);
    setRole([selected?.role ?? 'student']);
    setPos(selected?.other_roles ?? []);

    close();
  };

  // reflect changes on selected user
  useEffect(() => {
    setDept([selected?.department ?? 'na']);
    setRole([selected?.role ?? 'student']);
    setPos(selected?.other_roles ?? []);
  }, [selected]);

  return (
    <Modal
      centered
      onClose={resetState}
      opened={opened}
      size={rem(450)}
      title={
        <Text tt="capitalize">
          {selected?.name?.toLowerCase() ?? 'Unverified User'}
        </Text>
      }
    >
      <FilterUsers
        dept={dept}
        pos={pos}
        roles={role}
        setDept={setDept}
        setPos={setPos}
        setRoles={setRole}
        single
      />

      <Blockquote
        color="blue"
        icon={<IconInfoCircle size={20} />}
        iconSize={32}
        mx="xs"
        my="lg"
        p="lg"
      >
        <Text mb={6} size="sm">
          The ff. are linked to Google Workspaces:
        </Text>
        <List size="sm">
          <List.Item>Name</List.Item>
          <List.Item>Email</List.Item>
          <List.Item>Avatar (Profile Picture)</List.Item>
        </List>{' '}
        <Text mt={6} size="sm">
          Contact or proceed to ITSO for changes.
        </Text>
      </Blockquote>

      <Group gap="sm" justify="space-between" mt="lg">
        <Button
          color="red"
          leftSection={<IconTrash size={18} />}
          onClick={handleDelete}
          variant="filled"
        >
          Delete
        </Button>

        <Group gap="xs">
          <Button onClick={resetState} variant="default">
            Cancel
          </Button>

          <Button
            leftSection={<IconDeviceFloppy size={20} stroke={1.6} />}
            onClick={handleSubmit}
            variant="filled"
          >
            Update
          </Button>
        </Group>
      </Group>
    </Modal>
  );
}

export const UserEditModal = memo(UserEdit);
