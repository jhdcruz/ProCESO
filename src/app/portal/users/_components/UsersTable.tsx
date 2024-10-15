'use client';

import { memo, useEffect } from 'react';
import {
  Badge,
  Table,
  ScrollArea,
  Group,
  Avatar,
  Text,
  rem,
  ActionIcon,
  Button,
} from '@mantine/core';
import { modals } from '@mantine/modals';
import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Tables } from '@/libs/supabase/_database';
import { getDeptColor, getPosColor, getRoleColor } from '@/utils/colors';
import {
  IconEdit,
  IconShieldCancel,
  IconShieldCheck,
} from '@tabler/icons-react';
import { changeUserAccess } from '../actions';

function UsersTableComponent({
  users,
  setUsers,
}: {
  users: Tables<'users'>[];
  setUsers: (users: Tables<'users'>[]) => void;
}) {
  const clipboard = useClipboard({ timeout: 500 });

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

  const disableUserModal = (userId: string, enable: boolean) =>
    modals.openConfirmModal({
      centered: true,
      title: `${enable ? 'Enable' : 'Disable'} User?`,
      children: (
        <>
          {enable ? (
            <>
              <Text>This will allow the user to access the system again.</Text>
            </>
          ) : (
            <>
              <Text>
                The user won&apos;t be able to access the system anymore.
              </Text>
              <Text fw="bold" mt="sm">
                This will not delete the user from the database.
              </Text>
            </>
          )}
        </>
      ),
      labels: { confirm: enable ? 'Enable' : 'Disable', cancel: 'Cancel' },
      confirmProps: {
        color: enable ? 'green' : 'red',
        leftSection: enable ? (
          <IconShieldCheck size={20} stroke={1.6} />
        ) : (
          <IconShieldCancel size={20} stroke={1.6} />
        ),
      },
      onCancel: () => console.log('Cancel'),
      onConfirm: async () => {
        const response = await changeUserAccess(userId, enable);

        notifications.show({
          title: response?.title,
          message: response?.message,
          color: response?.status === 2 ? 'red' : 'green',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });

        // update local data
        setUsers(
          users.map((user) =>
            user.id === userId ? { ...user, active: enable } : user,
          ),
        );
      },
    });

  const rows = users?.map((item) => {
    return (
      <Table.Tr className="cursor-context-menu" key={item.id}>
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
          <Text
            className="cursor-pointer"
            onClick={() => clipboard.copy(item.email)}
            size="sm"
          >
            <Badge tt="lowercase" variant="default">
              {item.email}
            </Badge>
          </Text>
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
              onClick={() => disableUserModal(item.id, !item.active)}
              size="xs"
              variant="light"
            >
              {item.active ? 'Enabled' : 'Disabled'}
            </Button>

            <ActionIcon color="gray" variant="subtle">
              <IconEdit size={18} stroke={1.5} />
            </ActionIcon>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <ScrollArea>
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
