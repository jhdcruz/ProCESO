import { memo, useState } from 'react';
import { Button, Group, Modal, rem, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useDisclosure } from '@mantine/hooks';
import { IconMailSpark, IconSend } from '@tabler/icons-react';
import type { Enums } from '@/libs/supabase/_database';
import { FilterUsers } from '@/components/Filters/FilterUsers';
import { inviteUserAction } from '@portal/users/actions';

function UserInvite() {
  const [opened, { open, close }] = useDisclosure(false);
  const [pending, setPending] = useState(false);

  const [email, setEmail] = useState<string>('');
  const [dept, setDept] = useState<Enums<'roles_dept'>[]>([]);
  const [role, setRole] = useState<Enums<'roles_user'>[]>([]);
  const [pos, setPos] = useState<Enums<'roles_pos'>[]>([]);

  const inviteUser = async () => {
    setPending(true);

    const response = await inviteUserAction(email, {
      dept: dept[0],
      pos: pos,
      role: role[0],
    });

    notifications.show({
      title: response.title,
      message: response.message,
      color: response.status === 0 ? 'green' : 'red',
      withBorder: true,
      withCloseButton: true,
      autoClose: 4000,
    });

    setPending(false);
    close();
  };

  return (
    <>
      <Modal
        onClose={close}
        opened={opened}
        size={rem(450)}
        title="Invite User"
      >
        <Stack>
          <TextInput
            autoComplete="off"
            label="Email Address"
            onChange={(e) => setEmail(e.currentTarget.value)}
            placeholder="mjdoe@tip.edu.ph"
            required
            value={email}
          />
          <FilterUsers
            dept={dept}
            pos={pos}
            roles={role}
            setDept={setDept}
            setPos={setPos}
            setRoles={setRole}
            single
          />
        </Stack>

        <Group gap="sm" justify="flex-end" mt="lg">
          <Button
            loaderProps={{ type: 'dots' }}
            loading={pending}
            mt="md"
            onClick={inviteUser}
            rightSection={!pending && <IconSend size={16} />}
            variant={pending ? 'default' : 'filled'}
          >
            Send
          </Button>
        </Group>
      </Modal>

      <Button
        className="shadow-md"
        leftSection={<IconMailSpark size={16} />}
        onClick={open}
        type="button"
      >
        Invite user
      </Button>
    </>
  );
}

export const UserInviteModal = memo(UserInvite);
