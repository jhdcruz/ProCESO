import { memo, useEffect, useState } from 'react';
import { notifications } from '@mantine/notifications';
import { Badge, Table, Text } from '@mantine/core';
import { getTriggerStatusColor } from '@/utils/colors';
import dayjs from 'dayjs';
import { getCertRuns } from '../actions';

export const CertRuns = memo(() => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [data, setData] = useState<Record<string, any>[]>([]);

  useEffect(() => {
    const fetchRuns = async () => {
      const response = await getCertRuns();

      if (response.status === 0) {
        setData(response.data);
      } else {
        notifications.show({
          title: response.title,
          message: response.data,
          color: 'red',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });
      }
    };

    void fetchRuns();
  }, []);

  const rows = data.map((run) => (
    <Table.Tr
      className="cursor-pointer"
      key={run.id}
      // use <a> and the table implodes
      onClick={() =>
        window.open(
          `https://cloud.trigger.dev/orgs/deuz-systems-8040/projects/v3/proceso-G0w1/runs/${run.id}`,
          '_blank',
        )
      }
    >
      <Table.Td>
        <Badge
          color={getTriggerStatusColor(run.status)}
          size="sm"
          variant="dot"
        >
          {run.status.replace(/_/g, ' ')}
        </Badge>
      </Table.Td>
      <Table.Td>
        <Text fw={600} size="sm" span>
          {run.taskIdentifier}
        </Text>
      </Table.Td>
      <Table.Td>
        {run.tags?.map((tag: string) => (
          <Badge key={tag} size="sm" variant="default">
            {tag}
          </Badge>
        ))}
      </Table.Td>
      <Table.Td>{dayjs(run.createdAt).fromNow()}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Table.ScrollContainer minWidth={400}>
      <Table highlightOnHover>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Status</Table.Th>
            <Table.Th>Task ID</Table.Th>
            <Table.Th>Tags</Table.Th>
            <Table.Th>Created At</Table.Th>
          </Table.Tr>
        </Table.Thead>

        <Table.Tbody>{rows}</Table.Tbody>
      </Table>
    </Table.ScrollContainer>
  );
});
CertRuns.displayName = 'CertRuns';
