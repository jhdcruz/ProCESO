'use client';

import { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import {
  Text,
  Stack,
  Group,
  Image,
  SegmentedControl,
  ScrollArea,
  Checkbox,
  Fieldset,
  Divider,
  Button,
  Skeleton,
  Input,
  FileButton,
  Tooltip,
  Radio,
  ActionIcon,
  Center,
  SimpleGrid,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { notifications } from '@mantine/notifications';
import NextImage from 'next/image';
import {
  IconCheck,
  IconClock,
  IconFilePencil,
  IconFileZip,
  IconMailFast,
  IconSignature,
  IconTemplate,
  IconUpload,
} from '@tabler/icons-react';
import { createWorkerFactory, useWorker } from '@shopify/react-web-worker';
import { blobToDataURL } from 'blob-util';
import { createBrowserClient } from '@/libs/supabase/client';
import { ActivityInput } from './ActivityInput';
import type { CertReturnProps } from '@/libs/pdflib/certificate.worker';
import { triggerGenerateCerts } from '../actions';
import { Enums } from '@/libs/supabase/_database';
import { revalidate } from '@/app/actions';
import { systemUrl } from '@/app/routes';

const RespondentsTable = dynamic(
  () => import('./RespondentsTable').then((mod) => mod.RespondentsTable),
  { ssr: false, loading: () => <Skeleton h={500} w="100%" /> },
);

const CertRuns = dynamic(
  () => import('./CertRuns').then((mod) => mod.CertRuns),
  { ssr: false, loading: () => <Skeleton h={500} w="100%" /> },
);

const createWorker = createWorkerFactory(
  () => import('@/libs/pdflib/certificate.worker'),
);

export interface CertsProps {
  activity?: string;
  local: boolean | null;
  type: Enums<'feedback_type'>[];
  template?: string;
  qrPos?: 'left' | 'right';
}

export interface TemplateProps {
  label?: string;
  url?: string;
  name: string;
  data: Blob;
}

function CertsShellComponent() {
  // initialize worker
  const worker = useWorker(createWorker);

  // data
  const [templates, setTemplates] = useState<TemplateProps[]>([]);
  const [customTemplate, setCustomTemplate] = useState<File | null>(null);
  const [exclude, setExclude] = useState<string[]>([]);

  // Signatures
  const [coordinator, setCoordinator] = useState<File | null>(null);
  const [vpsas, setVpsas] = useState<File | null>(null);

  const form = useForm<CertsProps>({
    validateInputOnChange: true,

    initialValues: {
      activity: '',
      local: null,
      type: ['beneficiaries', 'implementers', 'partners'],
      template: 'coa_1.png',
      qrPos: 'right',
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.template) {
      notifications.show({
        title: 'Error',
        message: 'Please select a template',
        color: 'red',
        withBorder: true,
        autoClose: 4000,
      });
      return;
    }

    // get activity id
    const supabase = createBrowserClient();
    const { data: activity } = await supabase
      .from('activities')
      .select('id, date_ending')
      .eq('title', values.activity!)
      .limit(1)
      .single();

    const selectedTemplate = customTemplate
      ? new Blob([customTemplate], { type: customTemplate.type })
      : templates.find((tmpl) => tmpl.name === values.template)?.data!;

    // Convert blob to data URL properly
    const templateDataUrl = await blobToDataURL(selectedTemplate);

    if (!values.local) {
      // use trigger.dev and send emails
      if (coordinator === null || vpsas === null) {
        notifications.show({
          title: 'Missing signatures',
          message: 'Please upload the coordinator and VPSAS signatures',
          color: 'red',
          withBorder: true,
          autoClose: 6000,
        });
        return;
      }
      if (!activity) {
        notifications.show({
          title: 'No activity selected',
          message: 'Please select an activity to generate certificates for.',
          color: 'red',
          withBorder: true,
          autoClose: 4000,
        });
        return;
      }
      const coordinatorUrl = await blobToDataURL(new Blob([coordinator]));
      const vpsasUrl = await blobToDataURL(new Blob([vpsas]));

      // trigger the generate-certs trigger
      await triggerGenerateCerts(
        values.activity!,
        exclude,
        templateDataUrl,
        coordinatorUrl,
        vpsasUrl,
        values.type,
        values.qrPos ?? 'right',
      );

      notifications.show({
        title: 'Queued certificate generation',
        message: `${values.type.toLocaleString()} certificates is queued for ${values.activity}.`,
        icon: <IconClock />,
        color: 'gray',
        withBorder: true,
        autoClose: 4000,
      });

      await revalidate(`${systemUrl}/certs`);
    } else {
      // Use web worker for local generation, does not send to emails
      if (coordinator === null || vpsas === null) {
        notifications.show({
          title: 'Missing signatures',
          message: 'Please upload the coordinator and VPSAS signatures',
          color: 'red',
          withBorder: true,
          autoClose: 6000,
        });
        return;
      }
      if (!activity) {
        notifications.show({
          title: 'No activity selected',
          message: 'Please select an activity to generate certificates for.',
          color: 'red',
          withBorder: true,
          autoClose: 4000,
        });
        return;
      }

      notifications.show({
        id: 'certs',
        loading: true,
        title: 'Generating certificates...',
        message: 'Please wait while we generate the certificates.',
        withBorder: true,
        autoClose: false,
      });

      // get respondents
      const { data: respondents } = await supabase
        .from('activity_eval_view')
        .select('name, email')
        .eq('title', values.activity!)
        .in('type', values.type)
        .limit(9999)
        .not('email', 'is', null)
        .not('email', 'in', exclude)
        .not('name', 'is', null);

      const response = (await worker.generateCertificate({
        respondents: respondents!,
        activityId: activity?.id!,
        activityTitle: values.activity!,
        activityEnd: activity?.date_ending!,
        template: templateDataUrl,
        coordinator,
        vpsas,
        qrPos: values.qrPos,
      })) as CertReturnProps;

      if (response.blob) {
        // open in new tab
        const zip = URL.createObjectURL(response.blob);

        // download the zip file
        const a = document.createElement('a');
        a.href = zip;
        a.download = `${values.activity}-certs.zip`;
        a.click();

        notifications.update({
          id: 'certs',
          loading: false,
          message: 'Certificate generated successfully',
          color: 'green',
          icon: <IconCheck />,
          withBorder: true,
          autoClose: 4000,
        });
      }
    }
  };

  // fetching of templates from supabase storage
  useEffect(() => {
    const fetchTemplates = async () => {
      const supabase = createBrowserClient();

      // get available templates list
      const { data, error } = await supabase.storage
        .from('certs')
        .list('templates', {
          sortBy: { column: 'name', order: 'asc' },
        });

      if (error) {
        notifications.show({
          title: 'Error',
          message: error.message,
          color: 'red',
          withBorder: true,
          withCloseButton: true,
          autoClose: 4000,
        });
      }

      // get the files name without the extensions
      const templateNames = [...(data?.map((tmpl) => tmpl.name) || [])];
      const newTemplates = [];

      // download the templates
      for (const tmpl of templateNames) {
        const { data: template, error: templateError } = await supabase.storage
          .from('certs')
          .download(`templates/${tmpl}`);

        if (templateError) {
          notifications.show({
            title: 'Error',
            message: templateError.message,
            color: 'red',
            withBorder: true,
            withCloseButton: true,
            autoClose: 4000,
          });
        } else {
          // get readable labels for the templates
          const label = tmpl.includes('cop')
            ? `Certificate of Participation ${tmpl.split('_')[1]}`
            : `Certificate of Appreciation ${tmpl.split('_')[1]}`;
          newTemplates.push({ label, name: tmpl, data: template });
        }
      }

      setTemplates(newTemplates);
    };

    void fetchTemplates();
  }, []);

  return (
    <form onSubmit={form.onSubmit(handleSubmit)}>
      {templates.length > 0 ? (
        <ScrollArea.Autosize offsetScrollbars scrollbars="x" type="auto">
          <Input.Wrapper
            description="This will guide the placement of texts to be generated."
            label="Select a template"
            withAsterisk
          >
            <SegmentedControl
              data={templates.map((tmpl) => ({
                key: tmpl.name,
                value: tmpl.name,
                label: (
                  <Stack gap="xs" key={tmpl.name}>
                    <Image
                      alt=""
                      className="rounded-md object-contain shadow-sm"
                      component={NextImage}
                      h="auto"
                      height={183}
                      mx="auto"
                      priority={false}
                      src={URL.createObjectURL(tmpl.data as Blob)}
                      w={260}
                      width={260}
                    />
                    <Text fw="bold" size="xs" ta="center">
                      {tmpl.label}
                    </Text>
                  </Stack>
                ),
              }))}
              fullWidth
              key={form.key('template')}
              mt="xs"
              p={12}
              {...form.getInputProps('template')}
            />
          </Input.Wrapper>
        </ScrollArea.Autosize>
      ) : (
        <Skeleton height={290} width="100%" />
      )}

      {/* Certificate Generation */}
      <SimpleGrid cols={{ base: 1, sm: 1, md: 2 }} spacing="xs">
        <Fieldset legend="Certification Details">
          <Input.Wrapper
            description="For automated sending of certificates to recipients. or custom certificates template."
            label="Custom Certificate"
          >
            <Group gap="xs" mt={6} wrap="nowrap">
              {/* Custom Template Upload */}
              <FileButton
                accept="image/png,image/jpeg"
                onChange={setCustomTemplate}
              >
                {(props) => (
                  <Button
                    fullWidth
                    leftSection={<IconUpload size={16} stroke={1.5} />}
                    variant="default"
                    {...props}
                  >
                    {customTemplate
                      ? `${customTemplate.name?.slice(0, 8)}...`
                      : 'Custom Template'}
                  </Button>
                )}
              </FileButton>

              <Tooltip label="Get guided template format" withArrow>
                <ActionIcon
                  color="gray"
                  component="a"
                  href="https://www.canva.com/design/DAGXGDPJ954/zTy-hn1dQ5h7v7nnwidxcA/view?mode=preview#1"
                  target="__blank"
                  variant="subtle"
                >
                  <IconFilePencil size={18} />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Input.Wrapper>

          <Input.Wrapper
            description="Signatures must be 800x200, with signature at center."
            label="Signatures"
            mt={6}
            withAsterisk
          >
            <Group gap="xs" grow mt={6}>
              {/* Signatures Upload */}
              <FileButton accept="image/png" onChange={setCoordinator}>
                {(props) => (
                  <Button
                    leftSection={
                      coordinator ? (
                        <IconCheck size={18} />
                      ) : (
                        <IconSignature size={18} />
                      )
                    }
                    variant="light"
                    {...props}
                  >
                    {coordinator ? 'Uploaded' : 'Coordinator'}
                  </Button>
                )}
              </FileButton>

              <FileButton accept="image/png" onChange={setVpsas}>
                {(props) => (
                  <Button
                    leftSection={
                      vpsas ? (
                        <IconCheck size={18} />
                      ) : (
                        <IconSignature size={18} />
                      )
                    }
                    variant="light"
                    {...props}
                  >
                    {vpsas ? 'Uploaded' : 'VPSAS'}
                  </Button>
                )}
              </FileButton>
            </Group>
          </Input.Wrapper>

          <Divider my="md" />

          <Group gap="sm" grow justify="center" preventGrowOverflow={false}>
            <ActivityInput
              description="Enter name of activity to search"
              key={form.key('activity')}
              required
              {...form.getInputProps('activity')}
            />

            <Checkbox.Group
              description="Respondents type to generate certificates for."
              key={form.key('type')}
              label="Select respondent types"
              required
              {...form.getInputProps('type')}
            >
              <Group mt="xs">
                <Checkbox label="Partners" value="partners" />
                <Checkbox label="Implementers" value="implementers" />
                <Checkbox label="Beneficiaries" value="beneficiaries" />
              </Group>
            </Checkbox.Group>

            <Radio.Group
              description="Where to place the QR code."
              key={form.key('qrPos')}
              label="QR Code"
              {...form.getInputProps('qrPos')}
              required
            >
              <Group mt="xs">
                <Radio label="Top-Left" value="left" />
                <Radio label="Top-Right" value="right" />
              </Group>
            </Radio.Group>
          </Group>

          <Divider my="md" />

          <Group gap="xs" justify="flex-end">
            <Tooltip
              label="Save generated certificate as ZIP locally."
              multiline
              withArrow
            >
              <Button
                leftSection={<IconFileZip size={20} stroke={1.5} />}
                onClick={() => form.setValues({ local: true })}
                type="submit"
                variant="default"
              >
                Generate
              </Button>
            </Tooltip>

            <Button
              disabled={coordinator === null || vpsas === null}
              onClick={() => form.setValues({ local: false })}
              rightSection={<IconMailFast size={20} stroke={1.5} />}
              type="submit"
            >
              Send
            </Button>
          </Group>
        </Fieldset>

        <Fieldset legend="Participants List">
          {form.values.activity && form.values.type ? (
            <RespondentsTable
              activity={form.values.activity!}
              setExclude={setExclude}
              types={form.values.type}
            />
          ) : (
            <Center h={300}>
              <Stack gap="xs">
                <IconTemplate
                  className="mx-auto"
                  color="gray"
                  size={48}
                  stroke={1.5}
                />
                <Text c="dimmed" size="sm" ta="center">
                  Select an activity and types to view participants.
                </Text>
              </Stack>
            </Center>
          )}
        </Fieldset>
      </SimpleGrid>

      <Fieldset legend="Certificate Jobs" my="xs">
        <CertRuns />
      </Fieldset>
    </form>
  );
}

export const CertsShell = memo(CertsShellComponent);
