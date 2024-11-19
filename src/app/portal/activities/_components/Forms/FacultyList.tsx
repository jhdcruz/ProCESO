'use client';

import { useEffect, useState, Suspense, type ChangeEvent, memo } from 'react';
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
  TextInput,
  Button,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconSearch } from '@tabler/icons-react';
import { type DateValue } from '@mantine/dates';
import type { Enums, Tables } from '@/libs/supabase/_database';
import { getFacultyUsers } from '@/libs/supabase/api/user';
import { getFacultyConflicts } from '@/libs/supabase/api/faculty-assignments';
import classes from '@/styles/Table.module.css';
import { getDeptColor, getPosColor } from '@/utils/colors';
import {
  FilterDepartments,
  FilterPositions,
} from '@/components/Filters/FilterUsers';
import { useDebouncedValue } from '@mantine/hooks';

export function FacultyListComponent({
  startDate,
  endDate,
  defaultSelection,
}: {
  startDate: DateValue;
  endDate: DateValue;
  defaultSelection?: string[];
}) {
  const [selection, setSelection] = useState<string[]>(defaultSelection ?? []);

  // search
  const [search, setSearch] = useState<string>('');
  const [searchQuery] = useDebouncedValue(search, 200);

  // filters
  const [dept, setDept] = useState<Enums<'roles_dept'>[]>([]);
  const [pos, setPos] = useState<Enums<'roles_pos'>[]>([]);

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

  const handleSearchChange = (activity: ChangeEvent<HTMLInputElement>) => {
    const { value } = activity.currentTarget;
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

    void fetchData().catch((error: { message: string }) => {
      notifications.show({
        title: 'Unable to fetch series',
        message: `${error.message}, you can set it later.`,
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
            className="cursor-pointer"
            onChange={() => toggleRow(item.id)}
            value={item.id}
          />
        </Table.Td>
        <Table.Td>
          <Group gap="sm">
            <Avatar
              color="initials"
              name={item?.name ?? 'XX'}
              radius={26}
              size={32}
              src={item.avatar_url}
            />

            <Stack gap={0}>
              {/* Name and other roles */}
              <Group gap={6} preventGrowOverflow wrap="nowrap">
                <Text fw={500} size="sm" tt="capitalize">
                  {item.name?.toLowerCase() ?? 'Unverified Faculty'}
                </Text>

                {/* Display other roles, such as head rep. */}
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

              <Text c="dimmed" size="xs">
                {item.email}
              </Text>
            </Stack>
          </Group>
        </Table.Td>
        <Table.Td align="center">
          {/* Color-coded department */}
          <Badge
            color={getDeptColor(item.department)}
            tt="uppercase"
            variant="light"
          >
            {item.department}
          </Badge>
        </Table.Td>
        <Table.Td align="center">
          <Suspense fallback={<Loader size="sm" type="dots" />}>
            {assignments.includes(item.id) ? (
              <Badge color="gray" variant="outline">
                Assigned
              </Badge>
            ) : (
              <Badge variant="outline">Unassigned</Badge>
            )}
          </Suspense>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <ScrollArea mah={600}>
      <Group gap="xs" grow mt="md">
        <TextInput
          leftSection={
            <IconSearch
              stroke={1.5}
              style={{ width: rem(16), height: rem(16) }}
            />
          }
          onChange={handleSearchChange}
          placeholder="Search by name or email"
          value={search}
        />

        <Button.Group>
          <FilterDepartments dept={dept} setDept={setDept} />
          <FilterPositions pos={pos} setPos={setPos} />
        </Button.Group>
      </Group>

      <Table verticalSpacing="sm">
        <Table.Thead className={classes.header}>
          <Table.Tr>
            <Table.Th style={{ width: rem(40) }}>
              {loading && <Loader size="sm" type="dots" />}
            </Table.Th>
            <Table.Th>Name</Table.Th>
            <Table.Th className="text-center">Department</Table.Th>
            <Table.Th className="text-center">Assignment</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {!loading && faculty.length ? (
            <>
              {defaultSelection ? (
                <>
                  {/* Sort by selection (selected at top) */}
                  {rows.sort((a) =>
                    defaultSelection.includes(a.key as string) ? -1 : 1,
                  )}
                </>
              ) : (
                <>
                  {/* Sort by availability (available at top) */}
                  {rows.sort((a) =>
                    assignments.includes(a.key as string) ? 1 : -1,
                  )}
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
