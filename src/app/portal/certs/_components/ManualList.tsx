import { memo, useRef } from 'react';
import {
  ActionIcon,
  Group,
  ScrollArea,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { IconPlus, IconX } from '@tabler/icons-react';

export interface ManualRespondent {
  name: string;
  email: string;
}

export const ManualList = memo(
  ({
    respondents,
    setRespondents,
  }: {
    respondents: ManualRespondent[];
    setRespondents: (items: ManualRespondent[]) => void;
  }) => {
    const nameRef = useRef<HTMLInputElement>(null);
    const emailRef = useRef<HTMLInputElement>(null);

    const rows = respondents.map((respondent: ManualRespondent) => {
      return (
        <Table.Tr key={respondent.name + '|' + respondent.email}>
          <Table.Td>
            <ActionIcon
              aria-label={`Remove ${respondent.name} from the list`}
              onClick={() =>
                setRespondents(
                  respondents.filter(
                    (item) =>
                      item.name !== respondent.name &&
                      item.email !== respondent.email,
                  ),
                )
              }
              variant="default"
            >
              <IconX size={16} stroke={1.5} />
            </ActionIcon>
          </Table.Td>
          <Table.Td>
            <Text fw={600} size="sm">
              {respondent.name}
            </Text>
          </Table.Td>
          <Table.Td>{respondent.email}</Table.Td>
        </Table.Tr>
      );
    });

    return (
      <ScrollArea.Autosize mah={550} offsetScrollbars>
        <Group align="flex-end" gap="xs">
          <TextInput label="Name" placeholder="John Doe" ref={nameRef} />

          <TextInput
            label="Email"
            placeholder="johndoe@gmail.com"
            ref={emailRef}
            type="email"
          />

          <ActionIcon
            aria-label="Add participant to the list"
            onClick={() => {
              if (nameRef.current && emailRef.current) {
                const newName = nameRef.current.value;
                const newEmail = emailRef.current.value;

                const isDuplicate = respondents.some(
                  (respondent) =>
                    respondent.name === newName &&
                    respondent.email === newEmail,
                );

                if (!isDuplicate) {
                  setRespondents([
                    ...respondents,
                    {
                      name: newName,
                      email: newEmail,
                    },
                  ]);
                  nameRef.current.value = '';
                  emailRef.current.value = '';
                }
              }
            }}
            size="lg"
          >
            <IconPlus size={16} stroke={1.5} />
          </ActionIcon>
        </Group>

        <Table mt="xs" verticalSpacing="xs">
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Actions</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Email</Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>{rows}</Table.Tbody>
        </Table>
      </ScrollArea.Autosize>
    );
  },
);
ManualList.displayName = 'ManualList';
