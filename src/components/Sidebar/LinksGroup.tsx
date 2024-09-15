'use client';

import { type FC, useState } from 'react';
import { Link } from 'react-transition-progress/next';
import { Box, Collapse, Group, ThemeIcon, rem } from '@mantine/core';
import { IconChevronRight, type IconProps } from '@tabler/icons-react';
import classes from './LinksGroup.module.css';

interface LinksGroupProps {
  icon: FC<IconProps>;
  label: string;
  link?: string;
  initiallyOpened?: boolean;
  links?: { label: string; link: string }[];
}

export function LinksGroup({
  icon: Icon,
  label,
  link,
  initiallyOpened,
  links,
}: LinksGroupProps) {
  const hasLinks = Array.isArray(links);
  const [opened, setOpened] = useState(initiallyOpened ?? false);

  // sub links component
  const items = (hasLinks ? links : []).map((link) => (
    <Link className={classes.link} href={link.link} key={link.link}>
      {link.label}
    </Link>
  ));

  return (
    <>
      <Link
        className={classes.control}
        href={link ?? '#'}
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
      </Link>

      {/* Sub links */}
      {hasLinks ? <Collapse in={opened}>{items}</Collapse> : null}
    </>
  );
}
