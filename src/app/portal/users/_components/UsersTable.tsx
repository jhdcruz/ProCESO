'use client';

import { memo, useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import {
  Badge,
  Table,
  ScrollArea,
  Group,
  Avatar,
  Text,
  ActionIcon,
  Button,
} from '@mantine/core';
import { useClipboard, useDisclosure } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Tables } from '@/libs/supabase/_database';
import { getDeptColor, getPosColor, getRoleColor } from '@/utils/colors';
import {
  IconEdit,
  IconShieldCancel,
  IconShieldCheck,
} from '@tabler/icons-react';
import { UserEditModal } from './Modals/UserEditModal';

const UserAccessModal = dynamic(
  () => import('./Modals/UserAccessModal').then((mod) => mod.UserAccessModal),
  {
    ssr: false,
  },
);

function UsersTableComponent({
  users,
  setUsers,
}: {
  users: Tables<'users'>[];
  setUsers: (users: Tables<'users'>[]) => void;
}) {
  const [deleteState, { open: deleteOpen, close: deleteClose }] =
    useDisclosure();
  const [editState, { open: editOpen, close: editClose }] = useDisclosure();

  const clipboard = useClipboard({ timeout: 500 });
  const [selectedUser, setSelectedUser] = useState<Tables<'users'> | null>(
    null,
  );

  // show notification when email is copied to clipboard
  useEffect(() => {
    // fixes notification appearing twice
    if (clipboard.copied) {
      notifications.show({
        message: 'Email copied to clipboard',
        color: 'green',
        withBorder: true,
        withCloseButton: true,
        autoClose: 2000,
      });
    }
  }, [clipboard.copied]);

  const rows = users.map((item) => {
    return (
      <Table.Tr className="cursor-pointer" key={item.id}>
        <Table.Td>
          <Group gap="sm">
            <Avatar
              color="initials"
              name={item.name}
              size={36}
              src={item.avatar_url}
            />
            <Text fw={500} size="sm" tt="capitalize">
              {item.name.toLowerCase()}
            </Text>

            {/* Inline other roles, such as committee head or dean. */}
            {item.other_roles?.map((role) => (
              <Badge
                color={getPosColor(role)}
                key={role}
                size="sm"
                tt="uppercase"
                variant="dot"
              >
                {role}
              </Badge>
            ))}
          </Group>
        </Table.Td>
        <Table.Td>
          <span onClick={() => clipboard.copy(item.email)}>
            <Badge className="cursor-copy" tt="lowercase" variant="default">
              {item.email}
            </Badge>
          </span>
        </Table.Td>
        <Table.Td>
          <Badge color={getDeptColor(item.department)} variant="light">
            {item.department}
          </Badge>
        </Table.Td>
        <Table.Td>
          <Badge color={getRoleColor(item.role)} variant="outline">
            {item.role}
          </Badge>
        </Table.Td>

        {/* Button Actions */}
        <Table.Td>
          <Group gap={8} justify="flex-end">
            <Button
              color={item.active ? 'green' : 'red'}
              leftSection={
                item.active ? (
                  <IconShieldCheck size={18} />
                ) : (
                  <IconShieldCancel size={18} />
                )
              }
              onClick={() => {
                setSelectedUser(item);
                deleteOpen();
              }}
              size="xs"
              variant="light"
            >
              {item.active ? 'Enabled' : 'Disabled'}
            </Button>

            <ActionIcon
              aria-label={`Edit user ${item.name.toLowerCase()}`}
              color="gray"
              onClick={() => {
                setSelectedUser(item);
                editOpen();
              }}
              variant="subtle"
            >
              <IconEdit size={18} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <ScrollArea>
      <UserAccessModal
        close={deleteClose}
        opened={deleteState}
        selected={selectedUser}
        setUsers={setUsers}
        users={users}
      />

      <UserEditModal
        close={editClose}
        opened={editState}
        selected={selectedUser}
        setUsers={setUsers}
        users={users}
      />

      <Table highlightOnHover miw={800} verticalSpacing="sm">
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Department</Table.Th>
            <Table.Th>Role</Table.Th>
            <Table.Th>{/* Button Actions */}</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>
          {users?.length ? (
            <>{rows}</>
          ) : (
            <Table.Tr>
              <Table.Td colSpan={5} ta="center">
                <Text my="xl" size="sm">
                  There are currently no users to display. Try adjusting the
                  filters selected, if any.
                </Text>
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

export const UsersTable = memo(UsersTableComponent);
