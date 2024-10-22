'use client';

import { type FC, useState } from 'react';
import { Link } from 'react-transition-progress/next';
import { usePathname } from 'next/navigation';
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

  const pathname = usePathname();

  // sub links component
  const items = (hasLinks ? links : []).map((link) => (
    <Link
      aria-selected={pathname === link.link}
      className={`${classes.link} ${pathname === link.link ? classes.selected + ' shadow-sm' : ''}`}
      href={link.link}
      key={link.link}
    >
      {link.label}
    </Link>
  ));

  return (
    <>
      <Link
        aria-selected={pathname === link}
        className={`${classes.control} ${pathname === link ? classes.selected + ' shadow-sm' : ''}`}
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
