'use client';

import { memo, useEffect, useState } from 'react';
import {
  Badge,
  Table,
  Checkbox,
  ScrollArea,
  Group,
  Avatar,
  Text,
  rem,
  ActionIcon,
  Loader,
} from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { Tables } from '@/libs/supabase/_database';
import { getDeptColor, getPosColor, getRoleColor } from '@/utils/colors';
import { IconEdit, IconPencil, IconTrash } from '@tabler/icons-react';
import classes from '@/styles/Table.module.css';

function UsersTableComponent({
  users,
  loading,
}: {
  users: Tables<'users'>[];
  loading: boolean;
}) {
  const [selection, setSelection] = useState<string[]>([]);
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

  const toggleRow = (id: string) =>
    setSelection((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );

  const toggleAll = () =>
    setSelection((current) =>
      current.length === users?.length
        ? []
        : (users?.map((item) => item.id) ?? []),
    );

  const rows = users?.map((item) => {
    const selected = selection.includes(item.id);

    return (
      <Table.Tr
        className={selected ? classes.rowSelected : '' + ' cursor-context-menu'}
        key={item.id}
      >
        <Table.Td>
          <Checkbox
            checked={selection.includes(item.id)}
            onChange={() => toggleRow(item.id)}
          />
        </Table.Td>
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
          <Group gap={0} justify="flex-end">
            <ActionIcon color="gray" size="md" variant="subtle">
              <IconEdit
                stroke={1.5}
                style={{ width: rem(16), height: rem(16) }}
              />
            </ActionIcon>
            <ActionIcon color="red" size="md" variant="subtle">
              <IconTrash
                stroke={1.5}
                style={{ width: rem(16), height: rem(16) }}
              />
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
            <Table.Th style={{ width: rem(44) }}>
              {/* Loading indicator */}
              {loading && <Loader size="sm" type="dots" />}
            </Table.Th>
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
