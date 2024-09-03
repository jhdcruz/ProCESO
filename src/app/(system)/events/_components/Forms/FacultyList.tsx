'use client';

import {
  useEffect,
  useState,
  Suspense,
  useDeferredValue,
  type ChangeEvent,
  memo,
} from 'react';
import {
  Table,
  Checkbox,
  ScrollArea,
  Group,
  Avatar,
  Text,
  rem,
  Loader,
  Badge,
  TextInput,
} from '@mantine/core';
import { IconSearch } from '@tabler/icons-react';
import { type DateValue } from '@mantine/dates';
import type { Tables } from '@/utils/supabase/types';
import { getFacultyUsers } from '@/api/supabase/user';
import { getFacultyConflicts } from '@/api/supabase/faculty-assignments';
import classes from '@/styles/Table.module.css';
import { notifications } from '@mantine/notifications';

export function FacultyListComponent({
  startDate,
  endDate,
  defaultSelection,
}: {
  startDate: DateValue | undefined;
  endDate: DateValue | undefined;
  defaultSelection?: string[];
}) {
  const [selection, setSelection] = useState<string[]>(defaultSelection ?? []);

  // search
  const [search, setSearch] = useState<string>('');
  const searchQuery = useDeferredValue(search);

  // data
  const [loading, setLoading] = useState<boolean>(true);
  const [faculty, setFaculty] = useState<Tables<'users'>[]>([]);
  const [assignments, setAssignments] = useState<string[]>([]);

  const toggleRow = (id: string) => {
    setSelection((current) => {
      if (current.includes(id)) {
        return current.filter((item) => item !== id);
      }

      return [...current, id];
    });
  };

  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { value } = event.currentTarget;
    setSearch(value);
  };

  // fetch faculty and assignments data
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      const facultyRequest = getFacultyUsers(searchQuery);
      const assignmentsRequest = getFacultyConflicts(startDate, endDate);

      const [facReq, assignReq] = await Promise.all([
        facultyRequest,
        assignmentsRequest,
      ]);

      if (facReq.data) {
        setFaculty(facReq.data);
      }

      if (assignReq.data) {
        setAssignments(
          // get the user IDs from the faculty assignments data
          assignReq.data
            .flatMap(
              (item) => item?.faculty_assignments?.map((i) => i.user_id) ?? [],
            )
            .filter((id): id is string => id !== null),
        );
      }

      setLoading(false);
    };

    fetchData().catch((error) => {
      notifications.show({
        title: 'Unable to fetch series',
        message: error.message + ', You can set it later.',
        color: 'yellow',
      });
    });
  }, [searchQuery, startDate, endDate]);

  const rows = faculty.map((item) => {
    const selected = selection.includes(item.id);

    return (
      <Table.Tr className={selected ? classes.rowSelected : ''} key={item.id}>
        <Table.Td>
          <Checkbox
            checked={selected}
            onChange={() => toggleRow(item.id)}
            value={item.id}
          />
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <Avatar radius={26} size={26} src={item.avatar_url} />
            <Text fw={500} size="sm">
              {item.name}
            </Text>
          </Group>
        </Table.Td>
        <Table.Td>{item.email}</Table.Td>
        <Table.Td>
          <Suspense fallback={<Loader size="sm" type="dots" />}>
            {assignments.includes(item.id) ? (
              <Badge color="gray" fullWidth variant="light">
                Busy
              </Badge>
            ) : (
              <Badge fullWidth variant="light">
                Available
              </Badge>
            )}
          </Suspense>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <ScrollArea mah={460}>
      <TextInput
        leftSection={
          <IconSearch
            stroke={1.5}
            style={{ width: rem(16), height: rem(16) }}
          />
        }
        mt="sm"
        onChange={handleSearchChange}
        placeholder="Search by name or email."
        value={search}
      />

      <Table verticalSpacing="sm">
        <Table.Thead className={classes.header}>
          <Table.Tr>
            <Table.Th style={{ width: rem(40) }}>
              {loading && <Loader size="sm" type="dots" />}
            </Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Email</Table.Th>
            <Table.Th>Availability</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {!loading && faculty.length ? (
            <>
              {defaultSelection ? (
                <>
                  {/* Sort by selection (selected at top) */}
                  {rows.sort((a) =>
                    defaultSelection.includes(a.key!) ? -1 : 1,
                  )}
                </>
              ) : (
                <>
                  {/* Sort by availability (available at top) */}
                  {rows.sort((a) => (assignments.includes(a.key!) ? 1 : -1))}
                </>
              )}
            </>
          ) : (
            <Table.Tr>
              <Table.Td colSpan={4} ta="center">
                No faculty are currently available.
              </Table.Td>
            </Table.Tr>
          )}
        </Table.Tbody>
      </Table>
    </ScrollArea>
  );
}

export const FacultyList = memo(FacultyListComponent);
