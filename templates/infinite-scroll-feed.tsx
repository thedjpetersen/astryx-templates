// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file infinite-scroll-feed.tsx
 * @input Deterministic fixtures only (company update posts, followed authors,
 *   seeded saved-post ids); no clocks, randomness, or network assets
 * @output Infinite Scroll Page: a continuous vertical feed of update Cards
 *   under a sticky LayoutHeader with filter controls (SegmentedControl for
 *   All / Following / Saved, Selector for team) and a compose action. The
 *   feed ends with a Skeleton loading group implying the next page is
 *   fetching — a purely static affordance, no timers or observers.
 * @position Page template; emitted by `astryx template infinite-scroll-feed`
 *
 * Responsive contract:
 * - Header stays pinned frame-first: Layout height="fill" keeps LayoutHeader
 *   fixed while LayoutContent owns the vertical scroll — no position:sticky.
 * - Feed column: max-width 680px, centered; below 720px it spans the full
 *   viewport width minus the LayoutContent gutters.
 * - <=720px: the header drops the visible update count and the compose
 *   button collapses to icon-only; the segmented filter and team selector
 *   keep a single row.
 * - Card text self-manages width: titles clamp to 2 lines, excerpts to 3;
 *   tag Tokens wrap onto additional rows instead of overflowing.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Card} from '@astryxdesign/core/Card';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Icon} from '@astryxdesign/core/Icon';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Token} from '@astryxdesign/core/Token';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  BookmarkIcon,
  ChatBubbleLeftRightIcon,
  InboxIcon,
  PencilSquareIcon,
} from '@heroicons/react/24/outline';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Single centered reading column; the column, not the cards, owns width.
  feedColumn: {
    width: '100%',
    maxWidth: 680,
    margin: '0 auto',
    boxSizing: 'border-box',
  },
  // Tag rows wrap instead of forcing horizontal overflow on narrow columns.
  tagRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-1)',
  },
};

// ============= DATA =============

type Team = 'Platform' | 'Design' | 'Growth' | 'Data' | 'Mobile';
type TokenColor = 'blue' | 'purple' | 'green' | 'orange' | 'teal' | 'pink';

interface FeedPost {
  id: string;
  author: string;
  role: string;
  team: Team;
  postedAt: string; // pre-formatted relative time — deterministic fixture
  title: string;
  excerpt: string;
  tags: string[];
  comments: number;
  isPinned?: boolean;
}

const TEAM_COLOR: Record<Team, TokenColor> = {
  Platform: 'purple',
  Design: 'pink',
  Growth: 'green',
  Data: 'orange',
  Mobile: 'blue',
};

const TEAM_OPTIONS = [
  {value: 'all', label: 'All teams'},
  {value: 'Platform', label: 'Platform'},
  {value: 'Design', label: 'Design'},
  {value: 'Growth', label: 'Growth'},
  {value: 'Data', label: 'Data'},
  {value: 'Mobile', label: 'Mobile'},
];

// Authors the current user follows — drives the "Following" segment.
const FOLLOWED_AUTHORS = new Set([
  'Maya Lindqvist',
  'Dev Patel',
  'Sana Okafor',
]);

const POSTS: FeedPost[] = [
  {
    id: 'post-901',
    author: 'Maya Lindqvist',
    role: 'Head of Platform',
    team: 'Platform',
    postedAt: '35m ago',
    title: 'Payments v2 is now serving 100% of EU traffic',
    excerpt:
      'Rollout completed this morning at 09:40 UTC with zero failed ' +
      'migrations. Median authorize latency dropped from 310 ms to 180 ms, ' +
      'and the legacy gateway goes read-only on July 14. Integration ' +
      'owners: work through the migration checklist before Friday.',
    tags: ['launch', 'payments'],
    comments: 18,
    isPinned: true,
  },
  {
    id: 'post-899',
    author: 'Dev Patel',
    role: 'Staff Engineer',
    team: 'Platform',
    postedAt: '2h ago',
    title: 'Retro notes: June 19 checkout latency incident',
    excerpt:
      'Root cause was connection-pool exhaustion in the EU cache tier ' +
      'after the failover drill left stale replicas in rotation. Full ' +
      'timeline, contributing factors, and the four follow-up actions ' +
      '(two already merged) are in the linked doc. Comments open until ' +
      'Thursday.',
    tags: ['incident', 'retro'],
    comments: 42,
  },
  {
    id: 'post-897',
    author: 'Sana Okafor',
    role: 'Product Designer',
    team: 'Design',
    postedAt: '4h ago',
    title: 'Onboarding revamp: crit takeaways and next steps',
    excerpt:
      'Strong support for the progressive checklist over the modal tour. ' +
      'Biggest open question is where workspace invites belong — step two ' +
      'or post-setup. Updated flows are in the shared file; async ' +
      'feedback welcome through Wednesday.',
    tags: ['design-crit', 'onboarding'],
    comments: 9,
  },
  {
    id: 'post-894',
    author: 'Jonas Weber',
    role: 'Growth PM',
    team: 'Growth',
    postedAt: '6h ago',
    title: 'Q3 experiment lineup is locked',
    excerpt:
      'Six experiments made the cut: annual-plan nudge, referral credit ' +
      'bump, two pricing-page variants, trial extension for activated ' +
      'teams, and the reworked invite email. First readouts land the week ' +
      'of July 21.',
    tags: ['experiments', 'roadmap'],
    comments: 14,
  },
  {
    id: 'post-890',
    author: 'Priya Nair',
    role: 'Analytics Engineer',
    team: 'Data',
    postedAt: 'Yesterday',
    title: 'Warehouse office hours move to Tuesdays',
    excerpt:
      'Starting next week, warehouse office hours run Tuesdays 14:00–15:00 ' +
      'CET. Bring slow queries, model questions, or dashboard reviews. The ' +
      'dbt style guide got a refresh too — new naming rules for staging ' +
      'models.',
    tags: ['data', 'office-hours'],
    comments: 5,
  },
  {
    id: 'post-886',
    author: 'Alex Fontaine',
    role: 'Mobile Lead',
    team: 'Mobile',
    postedAt: 'Yesterday',
    title: 'App 4.2 rollout paused at 50%',
    excerpt:
      'We are holding the staged rollout after a crash spike on Android 13 ' +
      'devices tied to the new share sheet. Fix is in review; expecting to ' +
      'resume tomorrow morning. iOS is unaffected and continues to 100%.',
    tags: ['release', 'mobile'],
    comments: 27,
  },
  {
    id: 'post-882',
    author: 'Maya Lindqvist',
    role: 'Head of Platform',
    team: 'Platform',
    postedAt: '2d ago',
    title: 'Deprecating the v1 webhooks endpoint',
    excerpt:
      'v1 webhooks stop accepting new subscriptions on August 1 and shut ' +
      'down fully on October 1. The v2 endpoint adds signed payloads and ' +
      'automatic retries with backoff. Eleven internal consumers still on ' +
      'v1 — owners have been tagged in the tracking issue.',
    tags: ['api', 'deprecation'],
    comments: 31,
  },
  {
    id: 'post-879',
    author: 'Sana Okafor',
    role: 'Product Designer',
    team: 'Design',
    postedAt: '2d ago',
    title: 'New icon set lands in the design kit',
    excerpt:
      'All 240 glyphs are redrawn on the 24px grid with consistent stroke ' +
      'weights, and the kit now ships outline and filled pairs for every ' +
      'icon. Old components are marked deprecated; swap guidance is on the ' +
      'first page of the library file.',
    tags: ['design-system'],
    comments: 7,
  },
];

// ============= COMPONENTS =============

function PostCard({
  post,
  isSaved,
  onToggleSaved,
}: {
  post: FeedPost;
  isSaved: boolean;
  onToggleSaved: (postId: string, isPressed: boolean) => void;
}) {
  return (
    <Card padding={4}>
      <VStack gap={3}>
        {/* Byline row: author identity left, timestamp + overflow right. */}
        <HStack gap={2} vAlign="center">
          <Avatar name={post.author} size="small" />
          <StackItem size="fill">
            <VStack gap={0.5}>
              <HStack gap={2} vAlign="center">
                <Text type="label">{post.author}</Text>
                {post.isPinned ? <Badge label="Pinned" /> : null}
              </HStack>
              <Text type="supporting" color="secondary" maxLines={1}>
                {post.role} · {post.team}
              </Text>
            </VStack>
          </StackItem>
          <Text type="supporting" color="secondary">
            {post.postedAt}
          </Text>
          <MoreMenu
            label={`Options for ${post.title}`}
            size="sm"
            items={[
              {label: 'Copy link', onClick: () => {}},
              {label: `Mute ${post.author}`, onClick: () => {}},
              {label: 'Report post', onClick: () => {}},
            ]}
          />
        </HStack>
        {/* Body: clamped title + excerpt keep card heights bounded. */}
        <VStack gap={1}>
          <Text type="body" weight="semibold" maxLines={2}>
            {post.title}
          </Text>
          <Text type="body" color="secondary" maxLines={3}>
            {post.excerpt}
          </Text>
        </VStack>
        <div style={styles.tagRow}>
          {post.tags.map(tag => (
            <Token
              key={tag}
              label={tag}
              color={TEAM_COLOR[post.team]}
              size="sm"
            />
          ))}
        </div>
        {/* Footer actions: comments count + save toggle (feeds "Saved"). */}
        <HStack gap={1} vAlign="center">
          <Button
            label={`${post.comments} comments`}
            variant="ghost"
            size="sm"
            icon={<Icon icon={ChatBubbleLeftRightIcon} size="sm" />}
          />
          <StackItem size="fill" />
          <ToggleButton
            label={isSaved ? 'Remove from saved' : 'Save post'}
            size="sm"
            isIconOnly
            icon={<Icon icon={BookmarkIcon} size="sm" />}
            isPressed={isSaved}
            onPressedChange={pressed => onToggleSaved(post.id, pressed)}
          />
        </HStack>
      </VStack>
    </Card>
  );
}

/**
 * Static end-of-feed affordance: two ghost post cards plus a visible
 * "Loading more" line. The skeletons are decorative (aria-hidden); the
 * text row carries the meaning for assistive tech. No timers, no
 * IntersectionObserver — the next page never actually loads.
 */
function FeedLoadingGroup() {
  return (
    <VStack gap={3}>
      <div aria-hidden="true">
        <VStack gap={3}>
          {[0, 1].map(cardIndex => (
            <Card key={cardIndex} padding={4}>
              <HStack gap={2} vAlign="start">
                <Skeleton
                  width={36}
                  height={36}
                  radius="rounded"
                  index={cardIndex * 4}
                />
                <StackItem size="fill">
                  <VStack gap={2}>
                    <Skeleton
                      width="35%"
                      height={14}
                      index={cardIndex * 4 + 1}
                    />
                    <Skeleton
                      width="90%"
                      height={12}
                      index={cardIndex * 4 + 2}
                    />
                    <Skeleton
                      width="65%"
                      height={12}
                      index={cardIndex * 4 + 3}
                    />
                  </VStack>
                </StackItem>
              </HStack>
            </Card>
          ))}
        </VStack>
      </div>
      <Text type="supporting" color="secondary" justify="center">
        Loading more updates…
      </Text>
    </VStack>
  );
}

export default function InfiniteScrollFeedTemplate() {
  const [segment, setSegment] = useState('all');
  const [team, setTeam] = useState('all');
  // Saved-post ids live in state so the bookmark toggle re-renders and the
  // "Saved" segment reflects toggles immediately. Seeded deterministically.
  const [savedIds, setSavedIds] = useState<ReadonlySet<string>>(
    () => new Set(['post-899', 'post-886']),
  );
  const isNarrow = useMediaQuery('(max-width: 720px)');

  const toggleSaved = (postId: string, isPressed: boolean) => {
    setSavedIds(prev => {
      const next = new Set(prev);
      if (isPressed) {
        next.add(postId);
      } else {
        next.delete(postId);
      }
      return next;
    });
  };

  const visiblePosts = useMemo(() => {
    return POSTS.filter(post => {
      if (team !== 'all' && post.team !== team) {
        return false;
      }
      if (segment === 'following') {
        return FOLLOWED_AUTHORS.has(post.author);
      }
      if (segment === 'saved') {
        return savedIds.has(post.id);
      }
      return true;
    });
  }, [segment, team, savedIds]);

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Heading level={1}>Team pulse</Heading>
                {isNarrow ? null : (
                  <Text type="supporting" color="secondary">
                    {visiblePosts.length} updates
                  </Text>
                )}
              </HStack>
            </StackItem>
            <SegmentedControl
              label="Filter updates"
              value={segment}
              onChange={setSegment}
              size="sm">
              <SegmentedControlItem label="All" value="all" />
              <SegmentedControlItem label="Following" value="following" />
              <SegmentedControlItem label="Saved" value="saved" />
            </SegmentedControl>
            <Selector
              label="Team"
              isLabelHidden
              size="sm"
              options={TEAM_OPTIONS}
              value={team}
              onChange={setTeam}
            />
            <Button
              label="New post"
              icon={<Icon icon={PencilSquareIcon} size="sm" />}
              isIconOnly={isNarrow}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <div style={styles.feedColumn}>
            {visiblePosts.length === 0 ? (
              <EmptyState
                icon={<Icon icon={InboxIcon} size="lg" />}
                title="No updates match"
                description="Try a different team, or switch back to All updates."
              />
            ) : (
              <VStack gap={3}>
                {visiblePosts.map(post => (
                  <PostCard
                    key={post.id}
                    post={post}
                    isSaved={savedIds.has(post.id)}
                    onToggleSaved={toggleSaved}
                  />
                ))}
                <FeedLoadingGroup />
              </VStack>
            )}
          </div>
        </LayoutContent>
      }
    />
  );
}
