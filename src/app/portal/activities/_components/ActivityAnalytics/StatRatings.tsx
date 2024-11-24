import { memo, useEffect, useState } from 'react';
import dynamic from 'next/dynamic';
import { Paper, Group, Skeleton, Grid } from '@mantine/core';
import { createBrowserClient } from '@/libs/supabase/client';
import {
  IconBuildings,
  IconEmpathize,
  IconPercentage,
  IconUserShield,
} from '@tabler/icons-react';
import { getEvaluatorColor } from '@/utils/colors';

const MoodRating = dynamic(
  () =>
    import('./MoodRating').then((mod) => ({
      default: mod.MoodRating,
    })),
  {
    ssr: false,
    loading: () => <Skeleton h={178} w="100%" />,
  },
);

const StatRingCard = dynamic(
  () =>
    import('@/components/Cards/StatRingCard').then((mod) => ({
      default: mod.StatsRingCard,
    })),
  {
    ssr: false,
    loading: () => <Skeleton h={114} w={280} />,
  },
);

const SummaryText = dynamic(
  () =>
    import('./SummaryText').then((mod) => ({
      default: mod.SummaryText,
    })),
  {
    ssr: false,
    loading: () => <Skeleton h={240} w="100%" />,
  },
);

export interface RatingItem {
  score: number;
  max: number;
}

export interface RatingsProps {
  partners: RatingItem;
  implementers: RatingItem;
  beneficiaries: RatingItem;
  total: number;
}

export interface RatingResult {
  type: 'partners' | 'implementers' | 'beneficiaries' | null;
  score_ratings: number | null;
  max_ratings: number | null;
}

const StatsRingComponent = ({ id }: { id: string }) => {
  const [data, setData] = useState<RatingsProps | null>();

  const [partners, setPartners] = useState<number>(0);
  const [implementers, setImplementers] = useState<number>(0);
  const [beneficiaries, setBeneficiaries] = useState<number>(0);

  useEffect(() => {
    const fetchRatings = async () => {
      const supabase = createBrowserClient();

      // get score ratings
      const scoresQuery = supabase
        .from('activity_feedback_view')
        .select('type, score_ratings, max_ratings')
        .eq('activity_id', id)
        .not('score_ratings', 'is', null)
        .limit(1000)
        .returns<RatingResult[]>();

      // get count of evaulations per type
      const countQuery = supabase
        .from('activity_feedback')
        .select('type')
        .eq('activity_id', id)
        .limit(1000);

      const [scores, counts] = await Promise.all([scoresQuery, countQuery]);
      const results = scores.data;
      const count = counts.data;

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
                acc.partners.score += score;
                acc.partners.max += max;
                break;
              case 'implementers':
                acc.implementers.score += score;
                acc.implementers.max += max;
                break;
              case 'beneficiaries':
                acc.beneficiaries.score += score;
                acc.beneficiaries.max += max;
                break;
            }
            return acc;
          },
          initialRatings,
        );

        // Calculate total count per type
        setPartners(
          count?.filter((item) => item.type === 'partners').length ?? 0,
        );
        setImplementers(
          count?.filter((item) => item.type === 'implementers').length ?? 0,
        );
        setBeneficiaries(
          count?.filter((item) => item.type === 'beneficiaries').length ?? 0,
        );

        // Calculate percentage scores per type
        if (ratings.partners.max > 0) {
          ratings.partners.score =
            (ratings.partners.score / ratings.partners.max) * 100;
        }
        if (ratings.implementers.max > 0) {
          ratings.implementers.score =
            (ratings.implementers.score / ratings.implementers.max) * 100;
        }
        if (ratings.beneficiaries.max > 0) {
          ratings.beneficiaries.score =
            (ratings.beneficiaries.score / ratings.beneficiaries.max) * 100;
        }

        // Calculate total score
        const validRatings = [
          ratings.partners,
          ratings.implementers,
          ratings.beneficiaries,
        ].filter((rating) => rating.max > 0);

        ratings.total =
          validRatings.reduce((sum, rating) => sum + rating.score, 0) /
            validRatings.length || 0;

        setData(ratings);
      }
    };

    void fetchRatings();
  }, [id]);

  return (
    <>
      <Grid align="flex-start" justify="space-between">
        <Grid.Col span={{ base: 12, sm: 12, md: 12, lg: 6 }}>
          <Paper
            bg="light-dark(
                var(--mantine-color-gray-0),
                var(--mantine-color-dark-7)
                )"
            p="md"
            shadow="xs"
            withBorder
          >
            <SummaryText id={id!} rating={data!} />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 12, md: 12, lg: 6 }}>
          {/* Rating Cards */}
          <Group gap="xs" grow preventGrowOverflow={false}>
            <StatRingCard
              color={getEvaluatorColor('partners')}
              count={partners}
              icon={<IconBuildings size="24" />}
              label="Partners"
              value={data?.partners.score ?? 0}
            />
            <StatRingCard
              color={getEvaluatorColor('implementers')}
              count={implementers}
              icon={<IconUserShield size="24" />}
              label="Implementers"
              value={data?.implementers.score ?? 0}
            />
            <StatRingCard
              color={getEvaluatorColor('beneficiaries')}
              count={beneficiaries}
              icon={<IconEmpathize size="24" />}
              label="Beneficiaries"
              value={data?.beneficiaries.score ?? 0}
            />
            <StatRingCard
              color="yellow.4"
              count={partners + implementers + beneficiaries}
              icon={<IconPercentage size="24" />}
              label="Total Ratings"
              value={data?.total ?? 0}
            />
          </Group>
        </Grid.Col>
      </Grid>

      {/* Mood Rating */}
      <Paper
        bg="light-dark(
        var(--mantine-color-gray-0),
        var(--mantine-color-dark-7)
      )"
        my="xs"
        p="md"
        shadow="xs"
        withBorder
      >
        <MoodRating rating={data?.total ?? 0} />
      </Paper>
    </>
  );
};

export const StatRatings = memo(StatsRingComponent);
