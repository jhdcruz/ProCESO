import { memo, useEffect, useState } from 'react';
import {
  Badge,
  Button,
  Center,
  Checkbox,
  type CheckboxProps,
  Group,
  Loader,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDebouncedValue } from '@mantine/hooks';
import dayjs from 'dayjs';
import type { Enums } from '@/libs/supabase/_database';
import { getEvaluatorColor } from '@/utils/colors';
import { createBrowserClient } from '@/libs/supabase/client';
import classes from '@/styles/Table.module.css';
import { IconHourglass, IconMinus, IconX } from '@tabler/icons-react';

interface RespondentProps {
  type: Enums<'feedback_type'>;
  name: string;
  email: string;
  submitted_at: string;
}

const CheckboxIcon: CheckboxProps['icon'] = ({ indeterminate, ...others }) =>
  indeterminate ? (
    <IconMinus stroke={3} {...others} />
  ) : (
    <IconX stroke={3} {...others} />
  );

export const RespondentsTable = memo(
  ({
    activity,
    types,
    setExclude,
  }: {
    activity: string;
    types: Enums<'feedback_type'>[];
    setExclude: (exclude: string[]) => void;
  }) => {
    const [respondents, setRespondents] = useState<RespondentProps[]>([]);
    const [selection, setSelection] = useState<string[]>([]);
    const [loading, setLoading] = useState(false);

    // filters
    const [query, setQuery] = useState('');
    const [searchQuery] = useDebouncedValue(query, 300);
    const [range, setRange] = useState([0, 14]);
    const [count, setCount] = useState(0);

    const toggleRow = (email: string) =>
      setSelection((current) => {
        const newSelection = current.includes(email)
          ? current.filter((item) => item !== email)
          : [...current, email];

        setExclude(newSelection);
        return newSelection;
      });

    useEffect(() => {
      const fetchRespondents = async () => {
        setLoading(true);
        const supabase = createBrowserClient();

        let query = supabase
          .from('activity_eval_view')
          .select('name, email, type, submitted_at', { count: 'exact' })
          .eq('title', activity)
          .in('type', types)
          .not('email', 'is', null)
          .not('name', 'is', null)
          .order('submitted_at', { ascending: false })
          .range(range[0], range[1]);

        if (searchQuery) {
          query = query.or(
            `name.ilike.%${searchQuery}%,email.ilike.%${searchQuery}%`,
          );
        }

        const { data, count, error } = await query.returns<RespondentProps[]>();

        if (error) {
          notifications.show({
            title: 'Error',
            message: error.message,
            color: 'red',
            withBorder: true,
            withCloseButton: true,
            autoClose: 5000,
          });
        } else {
          setRespondents(data || []);
          setCount(count || 0);
        }

        setLoading(false);
      };

      if (activity && types) fetchRespondents();
    }, [activity, types, searchQuery, range]);

    const rows = respondents.map((respondent: RespondentProps) => {
      const selected = selection.includes(respondent.email);
      return (
        <Table.Tr
          className={selected ? classes.selected : ''}
          key={respondent.name + '|' + respondent.email}
        >
          <Table.Td>
            <Checkbox
              checked={selection.includes(respondent.email)}
              color="red"
              icon={CheckboxIcon}
              iconColor="gray.3"
              onChange={() => toggleRow(respondent.email)}
            />
          </Table.Td>
          <Table.Td>
            <Group gap={6}>
              <Text fw={600} size="sm">
                {respondent.name}
              </Text>
              <Badge
                color={getEvaluatorColor(respondent.type)}
                size="xs"
                variant="dot"
              >
                {respondent.type}
              </Badge>
            </Group>
          </Table.Td>
          <Table.Td>{respondent.email}</Table.Td>
          <Table.Td>
            {dayjs(respondent.submitted_at).format(
              dayjs(respondent.submitted_at).year() !== dayjs().year()
                ? 'MMM D, YYYY h:mm A'
                : 'MMM D h:mm A',
            )}
          </Table.Td>
        </Table.Tr>
      );
    });

    return (
      <ScrollArea.Autosize mah={550} offsetScrollbars>
        {rows.length > 0 ? (
          <>
            {/* Table Controls */}
            <Group gap="xs" justify="space-between" wrap="nowrap">
              <TextInput
                miw={250}
                onChange={(event) => setQuery(event.currentTarget.value)}
                placeholder="Search by name or email"
                value={query}
              />
              <Button.Group>
                <Button
                  disabled={count === 0 || range[0] <= 0}
                  onClick={() =>
                    setRange((current) => [current[0] - 14, current[1] - 14])
                  }
                  variant="default"
                >
                  Previous
                </Button>
                <Button
                  disabled={
                    count === 0 || range[1] >= count || respondents.length < 14
                  }
                  onClick={() =>
                    setRange((current) => [current[0] + 14, current[1] + 14])
                  }
                  variant="default"
                >
                  Next
                </Button>
              </Button.Group>
            </Group>

            <Table verticalSpacing="xs">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th w={30}>
                    {loading && (
                      <Loader className="mx-auto" size="sm" type="dots" />
                    )}
                  </Table.Th>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Email</Table.Th>
                  <Table.Th>Submitted at</Table.Th>
                </Table.Tr>
              </Table.Thead>

              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </>
        ) : (
          <Center h={300}>
            <Stack gap="xs">
              <IconHourglass
                className="mx-auto"
                color="gray"
                size={48}
                stroke={1.5}
              />
              <Text c="dimmed" size="sm" ta="center">
                No respondents yet.
              </Text>
            </Stack>
          </Center>
        )}
      </ScrollArea.Autosize>
    );
  },
);
RespondentsTable.displayName = 'RespondentsTable';
