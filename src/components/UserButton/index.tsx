import { Avatar, Group, Text, UnstyledButton, rem } from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';

import classes from './UserButton.module.css';

export type UserAvatarProps = {
  avatarUrl: string;
  name: string;
  email: string;
};

export default function UserButton({
  avatarUrl,
  email,
  name,
}: UserAvatarProps) {
  return (
    <UnstyledButton className={classes.user}>
      <Group>
        <Avatar src={avatarUrl} radius="xl" />

        <div style={{ flex: 1 }}>
          <Text size="sm" fw={500}>
            {name}
          </Text>

          <Text c="dimmed" size="xs">
            {email}
          </Text>
        </div>

        <IconChevronRight
          style={{ width: rem(14), height: rem(14) }}
          stroke={1.5}
        />
      </Group>
    </UnstyledButton>
  );
}
