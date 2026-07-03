var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (person record, stats, activity feed,
 *   metadata fields, skill tokens)
 * @output Profile page for an internal people directory: breadcrumb header,
 *   identity block (large Avatar, name, role, Follow/Message actions), a 4-up
 *   stats row, and a TabList switching between an activity feed List and a
 *   details section (MetadataList + skill Tokens)
 * @position Page template; emitted by \`astryx template profile-page\`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries directory
 * breadcrumbs and a profile MoreMenu and stays pinned; LayoutContent scrolls
 * the profile column. Layout contentWidth={880} centers the column — profile
 * pages read as a document, not a dense tool surface, so the column is
 * constrained and every frame slot shares the cap.
 *
 * Interaction contract:
 * - Follow is real state: the button flips between "Follow" (primary) and
 *   "Following" (secondary) and the Followers stat increments with it.
 * - The Activity / Details TabList is useState-driven; Activity shows a
 *   divided List feed, Details shows MetadataList facts plus skill Tokens.
 *
 * Responsive contract:
 * - Identity row: HStack wrap — avatar + name/role stay together; the
 *   Follow/Message action cluster wraps below the identity on narrow
 *   viewports instead of squeezing the name.
 * - Stats row: Grid columns={{minWidth: 160, max: 4}} — 4-up on wide
 *   viewports, reflowing to 2-up and 1-up as the column narrows.
 * - Content column: Layout contentWidth={880} centers the column on wide
 *   viewports; below that it takes full width (LayoutContent padding
 *   provides the gutters). The header stays pinned and only LayoutContent
 *   scrolls (height="fill").
 * - Activity rows: label/description truncate to one line each; the date
 *   stays pinned right as endContent.
 * - Details facts: MetadataList columns="multi" auto-fills two columns when
 *   space allows and collapses to one; skill Tokens wrap freely.
 */

import {useState, type CSSProperties} from 'react';

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
import {Grid} from '@astryxdesign/core/Grid';
import {Stat} from '@astryxdesign/core/Stat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {TabList, Tab} from '@astryxdesign/core/TabList';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {Token} from '@astryxdesign/core/Token';
import type {TokenColor} from '@astryxdesign/core/Token';
import {
  PlusIcon,
  MessagesSquareIcon,
  SquarePenIcon,
  BookmarkIcon,
  UsersIcon,
  HashIcon,
  MegaphoneIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Circular container for activity feed icons so rows scan as a timeline.
  activityIcon: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    flexShrink: 0,
    borderRadius: '50%',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Keep the feed date from wrapping when the row compresses.
  activityDate: {whiteSpace: 'nowrap'},
};

// ============= DATA =============

const PROFILE = {
  name: 'Maya Chen',
  role: 'Staff Product Designer',
  team: 'Design Systems',
  location: 'San Francisco, CA',
  pronouns: 'she/her',
  bio:
    'I look after Meridian, our shared design system — component APIs, ' +
    'motion guidelines, and the token pipeline. Before this I shipped the ' +
    'checkout redesign on the Payments team. Ask me about accessibility ' +
    'reviews or why your spacing scale has too many steps.',
};

// Followers is derived from follow state so the button visibly "does"
// something; both values are fixed so the page stays deterministic.
const FOLLOWER_BASE = 1284;

const ACTIVITY_FEED: ReadonlyArray<{
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  description: string;
  date: string;
}> = [
  {
    id: 'act-1',
    icon: SquarePenIcon,
    label: 'Published “Motion guidelines v2”',
    description: 'Design system docs · 14 comments',
    date: 'Jun 30',
  },
  {
    id: 'act-2',
    icon: MessagesSquareIcon,
    label: 'Replied to “Token naming for elevation”',
    description: '#design-systems · thread with Jonah Fields',
    date: 'Jun 28',
  },
  {
    id: 'act-3',
    icon: PlusIcon,
    label: 'Created project “Meridian dark mode audit”',
    description: 'Design Systems · 6 collaborators',
    date: 'Jun 26',
  },
  {
    id: 'act-4',
    icon: BookmarkIcon,
    label: 'Saved “Q3 component deprecation plan”',
    description: 'Shared by Priya Raman',
    date: 'Jun 24',
  },
  {
    id: 'act-5',
    icon: UsersIcon,
    label: 'Joined the Accessibility working group',
    description: 'Cross-functional guild · meets Thursdays',
    date: 'Jun 19',
  },
  {
    id: 'act-6',
    icon: SquarePenIcon,
    label: 'Published “Focus ring specs for nested controls”',
    description: 'Design system docs · 9 comments',
    date: 'Jun 12',
  },
  {
    id: 'act-7',
    icon: HashIcon,
    label: 'Started the #meridian-office-hours channel',
    description: 'Weekly drop-in help for component questions',
    date: 'Jun 9',
  },
  {
    id: 'act-8',
    icon: MegaphoneIcon,
    label: 'Announced Meridian 4.0 release candidate',
    description: '#announcements · 48 reactions',
    date: 'Jun 3',
  },
];

// Details tab — directory facts rendered through MetadataList.
const DETAILS: ReadonlyArray<{label: string; value: string}> = [
  {label: 'Team', value: 'Design Systems (Platform org)'},
  {label: 'Manager', value: 'Sofia Ortiz'},
  {label: 'Office', value: 'San Francisco — Mission Bay, Floor 4'},
  {label: 'Timezone', value: 'Pacific (UTC−7) · core hours 10:00–15:00'},
  {label: 'Email', value: 'maya.chen@northbeam.io'},
  {label: 'Slack', value: '@mayachen'},
  {label: 'Started', value: 'March 15, 2021'},
  {label: 'Employee ID', value: 'NB-04182'},
];

const SKILLS: ReadonlyArray<{label: string; color: TokenColor}> = [
  {label: 'Design systems', color: 'blue'},
  {label: 'Accessibility', color: 'green'},
  {label: 'Motion design', color: 'purple'},
  {label: 'Prototyping', color: 'orange'},
  {label: 'Design tokens', color: 'teal'},
  {label: 'User research', color: 'pink'},
  {label: 'Figma plugins', color: 'gray'},
];

// ============= PAGE =============

export default function ProfilePageTemplate() {
  const [tab, setTab] = useState('activity');
  const [isFollowing, setIsFollowing] = useState(false);

  const followerCount = FOLLOWER_BASE + (isFollowing ? 1 : 0);
  const stats = [
    {label: 'Posts', value: '96'},
    {label: 'Followers', value: followerCount.toLocaleString('en-US')},
    {label: 'Following', value: '312'},
    {label: 'Kudos received', value: '2,190'},
  ];

  return (
    <Layout
      height="fill"
      contentWidth={880}
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Breadcrumbs label="Directory">
                <BreadcrumbItem href="#">People</BreadcrumbItem>
                <BreadcrumbItem href="#">Design Systems</BreadcrumbItem>
                <BreadcrumbItem isCurrent>Maya Chen</BreadcrumbItem>
              </Breadcrumbs>
            </StackItem>
            <MoreMenu
              label="Profile options"
              size="sm"
              items={[
                {label: 'Copy profile link', onClick: () => {}},
                {label: 'Export vCard', onClick: () => {}},
                {label: 'Report profile', onClick: () => {}},
              ]}
            />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={6}>
          <VStack gap={6}>
            {/* Identity block — avatar, name/role, action cluster */}
            <HStack gap={4} vAlign="center" wrap="wrap">
              <Avatar name={PROFILE.name} size={96} />
              <StackItem size="fill">
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center">
                    <Heading level={1}>{PROFILE.name}</Heading>
                    <Badge variant="green" label="Active" />
                  </HStack>
                  <Text type="body" color="secondary">
                    {PROFILE.role} · {PROFILE.team}
                  </Text>
                  <Text type="supporting" color="secondary">
                    {PROFILE.location} · {PROFILE.pronouns} · Joined March
                    2021
                  </Text>
                </VStack>
              </StackItem>
              <HStack gap={2} vAlign="center">
                <Button
                  label={isFollowing ? 'Following' : 'Follow'}
                  variant={isFollowing ? 'secondary' : 'primary'}
                  icon={
                    isFollowing ? undefined : (
                      <Icon icon={PlusIcon} size="sm" />
                    )
                  }
                  onClick={() => setIsFollowing(prev => !prev)}
                />
                <Button
                  label="Message"
                  variant="secondary"
                  icon={<Icon icon={MessagesSquareIcon} size="sm" />}
                />
              </HStack>
            </HStack>

            {/* Stats row — follower count reacts to the Follow button */}
            <Grid columns={{minWidth: 160, max: 4}} gap={4}>
              {stats.map(stat => (
                <Card key={stat.label}>
                  <Stat label={stat.label} value={stat.value} />
                </Card>
              ))}
            </Grid>

            {/* Activity / Details tabs */}
            <VStack gap={4}>
              <TabList value={tab} onChange={setTab} hasDivider>
                <Tab
                  value="activity"
                  label="Activity"
                  endContent={
                    <Badge label={String(ACTIVITY_FEED.length)} />
                  }
                />
                <Tab value="details" label="Details" />
              </TabList>

              {tab === 'activity' ? (
                <Card>
                  <List hasDividers density="balanced">
                    {ACTIVITY_FEED.map(entry => (
                      <ListItem
                        key={entry.id}
                        label={entry.label}
                        description={entry.description}
                        startContent={
                          <div style={styles.activityIcon}>
                            <Icon icon={entry.icon} size="sm" />
                          </div>
                        }
                        endContent={
                          <span style={styles.activityDate}>
                            <Text type="supporting" color="secondary">
                              {entry.date}
                            </Text>
                          </span>
                        }
                      />
                    ))}
                  </List>
                </Card>
              ) : (
                <VStack gap={4}>
                  <Card>
                    <VStack gap={2}>
                      <Heading level={3}>About</Heading>
                      <Text type="body" color="secondary">
                        {PROFILE.bio}
                      </Text>
                    </VStack>
                  </Card>
                  <Card>
                    <VStack gap={4}>
                      <Heading level={3}>Details</Heading>
                      <MetadataList columns="multi">
                        {DETAILS.map(item => (
                          <MetadataListItem
                            key={item.label}
                            label={item.label}>
                            {item.value}
                          </MetadataListItem>
                        ))}
                      </MetadataList>
                    </VStack>
                  </Card>
                  <Card>
                    <VStack gap={3}>
                      <Heading level={3}>Skills</Heading>
                      <HStack gap={1} wrap="wrap">
                        {SKILLS.map(skill => (
                          <Token
                            key={skill.label}
                            label={skill.label}
                            color={skill.color}
                            size="md"
                          />
                        ))}
                      </HStack>
                    </VStack>
                  </Card>
                </VStack>
              )}
            </VStack>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};