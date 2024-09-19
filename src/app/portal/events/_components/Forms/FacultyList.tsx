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
  Stack,
  Badge,
  MultiSelect,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { type DateValue } from '@mantine/dates';
import type { Tables } from '@/libs/supabase/_database';
import { getFacultyUsers } from '@/libs/supabase/api/user';
import { getFacultyConflicts } from '@/libs/supabase/api/faculty-assignments';
import classes from '@/styles/Table.module.css';

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
  const [dept, setDept] = useState<string[]>([]);
  const [pos, setPos] = useState<string[]>([]);

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
      const facultyRequest = getFacultyUsers(searchQuery, dept, pos);
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

    fetchData().catch((error: Record<string, unknown>) => {
      notifications.show({
        title: 'Unable to fetch series',
        message: error.message + ', You can set it later.',
        color: 'yellow',
      });
    });
  }, [searchQuery, startDate, endDate, dept, pos]);

  // individual rows component
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
            <Avatar
              alt={item.name}
              color="initials"
              radius={26}
              size={32}
              src={item.avatar_url}
            />
            <Stack gap={0}>
              <Text fw={500} size="sm" tt="capitalize">
                {item.name}
              </Text>
              <Text c="dimmed" size="xs">
                {item.email}
              </Text>
            </Stack>
          </Group>
        </Table.Td>
        <Table.Td>
          <Group gap={4}>
            {/* Color-coded department */}
            <Badge
              color={(() => {
                switch (item.department?.toLowerCase()) {
                  case 'ccs':
                    return 'blue';
                  case 'cea':
                    return 'red';
                  case 'coa':
                    return 'green';
                  case 'cbe':
                    return 'violet';
                  default:
                    return 'gray';
                }
              })()}
              tt="uppercase"
              variant="light"
            >
              {item.department}
            </Badge>

            {/* Display other roles, such as head rep. */}
            {item.other_roles?.map((role) => (
              <Badge
                className="uppercase"
                color="gray"
                key={role}
                tt="uppercase"
                variant="light"
              >
                {role}
              </Badge>
            ))}
          </Group>
        </Table.Td>
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
        placeholder="Search by name, email, dept, or committee."
        value={search}
      />

      <Group gap="xs" grow mt="sm">
        <MultiSelect
          data={[
            { value: 'ccs', label: 'CCS' },
            { value: 'cea', label: 'CEA' },
            { value: 'cbe', label: 'CBE' },
            { value: 'coa', label: 'COA' },
          ]}
          onChange={setDept}
          placeholder="Filter by dept."
          value={dept}
        />
        <MultiSelect
          data={[
            { value: 'head', label: 'Head' },
            { value: 'dean', label: 'Dean' },
          ]}
          onChange={setPos}
          placeholder="Filter by position."
          value={pos}
        />
      </Group>

      <Table verticalSpacing="sm">
        <Table.Thead className={classes.header}>
          <Table.Tr>
            <Table.Th style={{ width: rem(40) }}>
              {loading && <Loader size="sm" type="dots" />}
            </Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th>Department</Table.Th>
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
