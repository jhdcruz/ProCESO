'use client';

import { Tooltip, Badge } from '@mantine/core';
import { useEffect, useState } from 'react';
import { checkHealth } from './actions';

/**
 * Check the system status and display health badge.
 */
export default function SystemHealth() {
  const [health, setHealth] = useState(0);

  useEffect(() => {
    checkHealth().then((health) => {
      setHealth(health);
    });
  }, []);

  return health === 2 ? (
    <Tooltip label="All systems are not working!">
      <Badge
        className="cursor-pointer font-semibold normal-case"
        component="a"
        variant="dot"
        color="red"
        size="md"
        px={15}
        py={12}
        radius="md"
        target="__blank"
        href={process.env.NEXT_PUBLIC_STATUS_PAGE}
      >
        All systems down!
      </Badge>
    </Tooltip>
  ) : health === 1 ? (
    <Tooltip label="Some functionality might not work.">
      <Badge
        className="cursor-pointer font-semibold normal-case"
        component="a"
        variant="dot"
        color="yellow"
        size="md"
        px={15}
        py={12}
        radius="md"
        target="__blank"
        href={process.env.NEXT_PUBLIC_STATUS_PAGE}
      >
        Some systems are down.
      </Badge>
    </Tooltip>
  ) : (
    <Tooltip label="All systems are working as expected.">
      <Badge
        className="cursor-pointer font-semibold normal-case"
        component="a"
        variant="dot"
        color="green"
        size="md"
        px={15}
        py={12}
        radius="md"
        target="__blank"
        href={process.env.NEXT_PUBLIC_STATUS_PAGE}
      >
        All systems working.
      </Badge>
    </Tooltip>
  );
}
