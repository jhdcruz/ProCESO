'use client';

import { type FC, useState } from 'react';
import Link from 'next/link';
import {
  Box,
  Collapse,
  Group,
  Text,
  ThemeIcon,
  UnstyledButton,
  rem,
} from '@mantine/core';
import { IconChevronRight } from '@tabler/icons-react';
import classes from './LinksGroup.module.css';

interface LinksGroupProps {
  icon: FC<any>;
  label: string;
  link?: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
}

export default function LinksGroup({
  icon: Icon,
  label,
  link,
  initiallyOpened,
  links,
}: LinksGroupProps) {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened || false);

  // sub links component
  const items = (hasLinks ? links : []).map((link) => (
    <Text
      className={classes.link}
      component={Link}
      href={link.link}
      key={link.link}
    >
      {link.label}
    </Text>
  ));

  return (
    <>
      <UnstyledButton
        className={classes.control}
        component="a"
        href={link}
        onClick={() => setOpened((o) => !o)}
      >
        <Group gap={0} justify="space-between">
          <Box style={{ display: 'flex', alignItems: 'center' }}>
            <ThemeIcon size={30} variant="light">
              <Icon style={{ width: rem(18), height: rem(18) }} />
            </ThemeIcon>
            <Box ml="md">{label}</Box>
          </Box>

          {hasLinks && (
            <IconChevronRight
              className={classes.chevron}
              stroke={1.5}
              style={{
                width: rem(16),
                height: rem(16),
                transform: opened ? 'rotate(90deg)' : 'none',
              }}
            />
          )}
        </Group>
      </UnstyledButton>

      {/* Sub links */}
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
