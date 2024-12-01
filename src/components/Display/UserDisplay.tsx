'use client';

import { Tables } from '@/libs/supabase/_database';
import { getDeptColor, getPosColor, getRoleColor } from '@/utils/colors';
import { Avatar, Text, Group, Badge, Stack, Box, rem } from '@mantine/core';
import { useClipboard } from '@mantine/hooks';
import { notifications } from '@mantine/notifications';
import { IconCopyCheck } from '@tabler/icons-react';
import { memo } from 'react';

/**
 * Display user details
 *
 * @param
 */
export const UserDisplay = memo(
  ({
    avatar_url,
    email,
    name,
    department,
    role,
    other_roles,
    highlightSelf,
    preventCopy,
  }: Partial<Tables<'users'>> & {
    highlightSelf?: boolean;
    preventCopy?: boolean;
  }) => {
    const clipboard = useClipboard({ timeout: 500 });

    const copyEmail = (userEmail: string) => {
      clipboard.copy(userEmail);

      notifications.show({
        message: `Email copied to clipboard`,
        autoClose: 3000,
        icon: <IconCopyCheck />,
        withBorder: true,
        withCloseButton: true,
      });
    };

    return (
      <Group gap="sm" wrap="nowrap">
        <Box maw={rem(56)} miw={rem(40)} pos="relative">
          <Avatar
            color="initials"
            mx="auto"
            name={name ?? 'Unverified User'}
            radius="md"
            src={avatar_url}
          />

          {role && (
            <Badge
              c={getRoleColor(role)}
              fw="bold"
              pos="absolute"
              size="xs"
              style={{
                left: '50%',
                bottom: rem(-8),
                transform: 'translateX(-50%)',
              }}
              tt="capitalize"
              variant="default"
              w="max-content"
            >
              {role}
            </Badge>
          )}
        </Box>

        <Stack gap={2} justify="flex-start">
          <Group gap={4} wrap="wrap-reverse">
            <Text
              fw={highlightSelf ? 'bold' : 'normal'}
              lineClamp={1}
              mr="4"
              size="sm"
              tt="capitalize"
            >
              {name?.toLowerCase() ?? 'Unknown'}
            </Text>
            <Badge
              color={getDeptColor(department)}
              key={department}
              size="xs"
              variant="light"
            >
              {department}
            </Badge>
            {other_roles?.map((role) => (
              <Badge
                color={getPosColor(role)}
                key={role}
                size="xs"
                tt="uppercase"
                variant="dot"
              >
                {role}
              </Badge>
            ))}
          </Group>

          <Text
            c="dimmed"
            className={!preventCopy ? 'cursor-pointer' : ''}
            onClick={() => {
              if (!preventCopy) copyEmail(email ?? '');
            }}
            size="xs"
            truncate
          >
            {email}
          </Text>
        </Stack>
      </Group>
    );
  },
);
UserDisplay.displayName = 'UserDisplay';
