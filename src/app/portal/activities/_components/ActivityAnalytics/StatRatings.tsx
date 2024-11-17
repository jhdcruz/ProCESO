import { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Paper, Group, rem } from '@mantine/core';
import { createBrowserClient } from '@/libs/supabase/client';
import { PageLoader } from '@/components/Loader/PageLoader';
import {
  IconBuildings,
  IconEmpathize,
  IconPercentage,
  IconUserShield,
} from '@tabler/icons-react';
import { getEvaluatorColor } from '@/utils/colors';

const StatRingCard = dynamic(
  () =>
    import('@/components/Cards/StatRingCard').then((mod) => ({
      default: mod.StatsRingCard,
    })),
  {
    ssr: false,
    loading: () => (
      <Paper
        bg="light-dark(
        var(--mantine-color-gray-0),
        var(--mantine-color-dark-7)
      )"
        mb="xs"
        p="md"
        w={{ base: '100%', sm: rem(240) }}
        withBorder
      >
        <PageLoader label={false} />
      </Paper>
    ),
  },
);

interface RatingItem {
  score: number;
  max: number;
}

interface RatingsProps {
  partners: RatingItem;
  implementers: RatingItem;
  beneficiaries: RatingItem;
  total: number;
}

interface RatingResult {
  type: 'partners' | 'implementers' | 'beneficiaries' | null;
  score_ratings: number | null;
  max_ratings: number | null;
}

const StatsRingComponent = ({ id }: { id: string }) => {
  const [data, setData] = useState<RatingsProps | null>();

  useEffect(() => {
    const fetchRatings = async () => {
      const supabase = createBrowserClient();

      const { data: results } = await supabase
        .from('activity_feedback_view')
        .select('type, score_ratings, max_ratings')
        .eq('activity_id', id)
        .limit(1000)
        .returns<RatingResult[]>();

      if (!results || results.length === 0) {
        setData(null);
      } else {
        const initialRatings: RatingsProps = {
          partners: { score: 0, max: 0 },
          implementers: { score: 0, max: 0 },
          beneficiaries: { score: 0, max: 0 },
          total: 0,
        };

        const ratings = results.reduce(
          (acc: RatingsProps, curr: RatingResult) => {
            const score = curr.score_ratings ?? 0;
            const max = curr.max_ratings ?? 0;

            switch (curr.type) {
              case 'partners':
                acc.partners = { score: (score / max) * 100, max };
                break;
              case 'implementers':
                acc.implementers = { score: (score / max) * 100, max };
                break;
              case 'beneficiaries':
                acc.beneficiaries = { score: (score / max) * 100, max };
                break;
            }

            return acc;
          },
          initialRatings,
        );

        // Filter out ratings with max value of 0
        const validRatings = [
          ratings.partners,
          ratings.implementers,
          ratings.beneficiaries,
        ].filter((rating) => rating.max > 0);

        // Calculate maxTotal only from ratings with non-zero max values
        const maxTotal = validRatings.reduce(
          (sum, rating) => sum + rating.max,
          0,
        );

        // Calculate total score only from ratings with non-zero max values
        ratings.total =
          maxTotal > 0
            ? validRatings.reduce((sum, rating) => sum + rating.score, 0) /
              validRatings.length
            : 0;

        setData(ratings);
      }
    };

    void fetchRatings();
  }, [id]);

  return (
    <Group gap="xs" my="sm" grow preventGrowOverflow={false}>
      <StatRingCard
        color={getEvaluatorColor('partners')}
        icon={<IconBuildings size="24" />}
        label="Partners"
        value={data?.partners.score ?? 0}
      />
      <StatRingCard
        color={getEvaluatorColor('implementers')}
        icon={<IconUserShield size="24" />}
        label="Implementers"
        value={data?.implementers.score ?? 0}
      />
      <StatRingCard
        color={getEvaluatorColor('beneficiaries')}
        icon={<IconEmpathize size="24" />}
        label="Beneficiaries"
        value={data?.beneficiaries.score ?? 0}
      />
      <StatRingCard
        color="yellow.4"
        icon={<IconPercentage size="24" />}
        label="Total Ratings"
        value={data?.total ?? 0}
      />
    </Group>
  );
};

export const StatRatings = memo(StatsRingComponent);
