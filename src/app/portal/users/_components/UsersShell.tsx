'use client';

import { useState, useDeferredValue, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  AppShell,
  Button,
  Divider,
  Group,
  Loader,
  rem,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconX } from '@tabler/icons-react';
import type { Enums, Tables } from '@/libs/supabase/_database';
import { getUsers } from '@/libs/supabase/api/user';
import { PageLoader } from '@/components/Loader/PageLoader';
import { FilterUsers } from '@/components/Filters/FilterUsers';
import { UserInvite } from './UserInvite';

const UsersTable = dynamic(
  () =>
    import('@portal/users/_components/UsersTable').then(
      (mod) => mod.UsersTable,
    ),
  {
    ssr: false,
    loading: () => <PageLoader />,
  },
);

export default function UsersShell() {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);

  // search
  const [query, setQuery] = useState<string>('');
  const searchQuery = useDeferredValue<string>(query);

  // pagination
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // filters
  const [dept, setDept] = useState<Enums<'roles_dept'>[]>([]);
  const [roles, setRoles] = useState<Enums<'roles_user'>[]>([]);
  const [pos, setPos] = useState<Enums<'roles_pos'>[]>([]);

  // data
  const [data, setData] = useState<Tables<'users'>[]>([]);
  const [count, setCount] = useState<number>(0);

  const handlePagination = (page: 'prev' | 'next') => {
    const range = searchParams.get('range') ?? '0-24';
    const [start, end] = range.split('-').map(Number);

    if (page === 'next') {
      const nextRange = `${start + 24}-${end + 24}`;
      router.push(pathname + `?range=${nextRange}`);
    } else {
      const prevRange = `${start - 24}-${end - 24}`;
      router.push(pathname + `?range=${prevRange}`);
    }
  };

  // reset range when changing filters
  useEffect(() => {
    if (searchParams.get('range')) {
      router.push(pathname);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dept, roles, pos]);

  // reset filters to default state
  const resetFilters = () => {
    setQuery('');
    setDept([]);
    setRoles([]);
    setPos([]);
  };

  // Fetch users data and update based on filters
  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);

      const range = searchParams.get('range') ?? '0-24';
      const [start, end] = range.split('-').map(Number);

      const response = await getUsers({
        filter: searchQuery,
        depts: dept,
        roles: roles,
        pos: pos,
        range: [start, end],
      });

      setData(response?.data ?? []);
      setCount(response?.count ?? 0);

      setLoading(false);
    };

    void fetchUsers().catch((error: Record<string, unknown>) => {
      notifications.show({
        title: 'Unable to get users list',
        message: error?.message as string,
        color: 'red',
      });
    });
  }, [searchQuery, searchParams, dept, roles, pos]);

  return (
    <AppShell.Main>
      {/* Table controls  */}
      <Group className="content-center" mb="md">
        {/* Invite user by email */}
        <UserInvite />

        {/*  Event search */}
        <TextInput
          leftSection={<IconSearch size={16} stroke={1.5} />}
          onChange={(e) => setQuery(e.currentTarget.value)}
          placeholder="Search by name or email"
          value={query}
          w={rem(300)}
        />
        <Divider orientation="vertical" />
        <FilterUsers
          dept={dept}
          pos={pos}
          roles={roles}
          setDept={setDept}
          setPos={setPos}
          setRoles={setRoles}
        />

        {/* Clear filters */}
        {(dept.length || pos.length || roles.length || query.length) && (
          <Button
            leftSection={<IconX size={16} />}
            onClick={resetFilters}
            variant="subtle"
          >
            Clear filters
          </Button>
        )}

        {/* Loading indicator */}
        {loading && <Loader size="sm" type="dots" />}
      </Group>

      <UsersTable setUsers={setData} users={data ?? []} />

      {/* Pagination Controls */}
      <Button.Group className="justify-center" mt="xl">
        <Button
          // disable previous button if range is 0-24 or not set
          disabled={
            searchParams.get('range') === '0-24' || !searchParams.get('range')
          }
          onClick={() => handlePagination('prev')}
          variant="default"
        >
          Previous
        </Button>
        <Button
          // disable if total data count exceeds the range
          disabled={
            searchParams.get('range')
              ? count <= Number(searchParams.get('range')?.split('-')[1])
              : true
          }
          onClick={() => handlePagination('next')}
          variant="default"
        >
          Next
        </Button>
      </Button.Group>
    </AppShell.Main>
  );
}
