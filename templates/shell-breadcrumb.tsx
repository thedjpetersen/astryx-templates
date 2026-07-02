// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (org tree of divisions, teams, and
 *   members; counts are computed from the tree so rollups always agree)
 * @output Breadcrumb-driven org directory shell: minimal top bar with the
 *   product mark and utility icons; hierarchy and back-navigation carried by
 *   a prominent Breadcrumbs trail (four levels deep at first render) above
 *   the page header; content shows the current node (name, summary, member
 *   and open-role rollups, lead, location) plus a List of child items —
 *   sub-teams drill deeper, members are the leaves
 * @position Page template; emitted by `astryx template shell-breadcrumb`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader is deliberately
 * minimal — brand mark left, search/notifications/avatar right — because
 * the Breadcrumbs trail, not a nav rail, carries hierarchy. LayoutContent
 * holds a single centered reading column (max 840px): breadcrumb trail,
 * back Link, page header, then the child List. Rows over cards: directory
 * entries are ListItem rows with dividers, not widget tiles.
 *
 * Interaction contract (all navigation is in-page state):
 * - `path` (useState) is the array of node ids from the root to the current
 *   node. Breadcrumb clicks truncate the path, the back Link pops one
 *   level, and clicking a sub-team row pushes its id.
 * - Every navigation is announced through a visually-hidden aria-live
 *   region ("Viewing <team> — N people").
 *
 * Responsive contract:
 * - Content column: width 100% up to 840px, centered; keeps that max width
 *   on wide viewports.
 * - Breadcrumbs render as an inline list that wraps to a second line on
 *   narrow viewports; no crumb is ever hidden (the trail IS the nav).
 * - <=640px: page-header actions drop below the title block (HStack wraps);
 *   the open-roles badge on child rows hides to keep rows single-line.
 * - Metadata row under the title wraps freely at any width.
 * - List rows rely on ListItem's built-in single-line truncation for label
 *   and description; end-content counts keep their intrinsic width.
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
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Link} from '@astryxdesign/core/Link';
import {List, ListItem} from '@astryxdesign/core/List';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Divider} from '@astryxdesign/core/Divider';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  HomeIcon,
  UserGroupIcon,
  MagnifyingGlassIcon,
  BellIcon,
  PencilSquareIcon,
  PlusIcon,
} from '@heroicons/react/24/outline';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Single centered reading column; the shell has no side nav, so the
  // column cap keeps directory rows scannable on wide monitors.
  column: {
    width: '100%',
    maxWidth: 840,
    marginInline: 'auto',
    boxSizing: 'border-box',
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============

interface OrgPerson {
  name: string;
  title: string;
  location: string;
}

interface OrgNode {
  id: string;
  name: string;
  summary: string;
  lead: string;
  location: string;
  /** Roles posted directly by this node; rollups are computed. */
  openRoles?: number;
  /** Sub-team ids — present on branch nodes. */
  childIds?: string[];
  /** Direct members — present on leaf teams. */
  people?: OrgPerson[];
}

/** One-line person fixture helper to keep the tree readable. */
const p = (name: string, title: string, location: string): OrgPerson => ({
  name,
  title,
  location,
});

const NODES: Record<string, OrgNode> = {
  halcyon: {
    id: 'halcyon',
    name: 'Halcyon Robotics',
    summary:
      'Autonomous warehouse robotics — every division, team, and person in one directory.',
    lead: 'Ingrid Vasquez',
    location: 'Portland, OR (HQ)',
    childIds: ['hardware', 'platform', 'gtm'],
  },
  // ---- Divisions ----
  hardware: {
    id: 'hardware',
    name: 'Hardware Engineering',
    summary: 'Sensors, actuation, and thermal systems for the Atlas picker line.',
    lead: 'Tomás Okafor',
    location: 'Portland, OR',
    childIds: ['perception', 'actuation', 'power-thermal'],
  },
  platform: {
    id: 'platform',
    name: 'Software Platform',
    summary:
      'Fleet cloud, the on-robot OS, and the ML infrastructure behind pick planning.',
    lead: 'Grace Lindqvist',
    location: 'Seattle, WA',
    childIds: ['cloud-services', 'embedded-os', 'ml-infra'],
  },
  gtm: {
    id: 'gtm',
    name: 'Go-to-Market',
    summary: 'Sales, partnerships, and marketing across North America and EMEA.',
    lead: 'Priya Nair',
    location: 'Chicago, IL',
    childIds: ['sales', 'marketing'],
  },
  // ---- Hardware Engineering groups ----
  perception: {
    id: 'perception',
    name: 'Perception Systems',
    summary: 'Camera, lidar, and fusion stacks that give Atlas its eyes.',
    lead: 'Amara Diallo',
    location: 'Portland, OR',
    childIds: ['camera-firmware', 'lidar', 'sensor-fusion'],
  },
  actuation: {
    id: 'actuation',
    name: 'Actuation',
    summary: 'Gripper mechanics, joint controllers, and motion safety limits.',
    lead: 'Sylvia Cheng',
    location: 'Portland, OR',
    people: [
      p('Sylvia Cheng', 'Engineering Manager', 'Portland, OR'),
      p('Rafael Duarte', 'Staff Mechatronics Engineer', 'Portland, OR'),
      p('June Holloway', 'Controls Engineer II', 'Portland, OR'),
      p('Viktor Antonov', 'Mechanical Engineer II', 'Remote (Boise, ID)'),
    ],
  },
  'power-thermal': {
    id: 'power-thermal',
    name: 'Power & Thermal',
    summary: 'Battery management, charge docks, and enclosure cooling.',
    lead: 'Owen Park',
    location: 'Portland, OR',
    openRoles: 1,
    people: [
      p('Owen Park', 'Engineering Manager', 'Portland, OR'),
      p('Farah El-Sayed', 'Senior Power Electronics Engineer', 'Portland, OR'),
      p('Gus Whitaker', 'Thermal Engineer II', 'Portland, OR'),
      p('Mei-Ling Zhou', 'Battery Systems Engineer', 'Remote (Austin, TX)'),
    ],
  },
  // ---- Perception Systems teams ----
  'camera-firmware': {
    id: 'camera-firmware',
    name: 'Camera Firmware',
    summary: 'Drivers, ISP tuning, and on-sensor diagnostics for the stereo rig.',
    lead: 'Kenji Morita',
    location: 'Portland, OR',
    openRoles: 1,
    people: [
      p('Kenji Morita', 'Engineering Manager', 'Portland, OR'),
      p('Lena Fischer', 'Staff Firmware Engineer', 'Portland, OR'),
      p('Dmitri Sokolov', 'Senior Firmware Engineer', 'Remote (Denver, CO)'),
      p('Aisha Bello', 'Firmware Engineer II', 'Portland, OR'),
      p('Caleb Nguyen', 'Firmware Engineer I', 'Portland, OR'),
      p('Rosa Delgado', 'Embedded QA Engineer', 'Portland, OR'),
    ],
  },
  lidar: {
    id: 'lidar',
    name: 'Lidar',
    summary: 'Point-cloud capture and timing sync across the four-unit array.',
    lead: 'Hana Yusuf',
    location: 'Portland, OR',
    openRoles: 2,
    people: [
      p('Hana Yusuf', 'Engineering Manager', 'Portland, OR'),
      p('Petra Novak', 'Senior Systems Engineer', 'Portland, OR'),
      p('Andre Boucher', 'Signal Processing Engineer', 'Remote (Montreal, QC)'),
      p('Iris Kalogeropoulos', 'Firmware Engineer II', 'Portland, OR'),
      p('Sam Otieno', 'Calibration Engineer', 'Portland, OR'),
    ],
  },
  'sensor-fusion': {
    id: 'sensor-fusion',
    name: 'Sensor Fusion',
    summary: 'Real-time fusion of camera, lidar, and wheel odometry.',
    lead: 'Marco Bianchi',
    location: 'Seattle, WA',
    people: [
      p('Marco Bianchi', 'Engineering Manager', 'Seattle, WA'),
      p('Yuki Tanaka', 'Staff Robotics Engineer', 'Seattle, WA'),
      p('Claire Beaumont', 'Perception Engineer II', 'Seattle, WA'),
      p('Noah Lindgren', 'Perception Engineer I', 'Remote (Minneapolis, MN)'),
    ],
  },
  // ---- Software Platform teams ----
  'cloud-services': {
    id: 'cloud-services',
    name: 'Cloud Services',
    summary: 'Fleet APIs, telemetry ingestion, and the operator console.',
    lead: 'Nadia Haddad',
    location: 'Seattle, WA',
    openRoles: 1,
    people: [
      p('Nadia Haddad', 'Engineering Manager', 'Seattle, WA'),
      p('Tobias Krause', 'Staff Backend Engineer', 'Seattle, WA'),
      p('Imani Brooks', 'Backend Engineer II', 'Remote (Atlanta, GA)'),
      p('Felix Arnason', 'Frontend Engineer II', 'Seattle, WA'),
      p('Dana Whitfield', 'Site Reliability Engineer', 'Seattle, WA'),
    ],
  },
  'embedded-os': {
    id: 'embedded-os',
    name: 'Embedded OS',
    summary: 'On-robot Linux image, OTA updates, and the safety watchdog.',
    lead: 'Jonas Weber',
    location: 'Seattle, WA',
    people: [
      p('Jonas Weber', 'Engineering Manager', 'Seattle, WA'),
      p('Alba Moreno', 'Senior Kernel Engineer', 'Remote (Madrid, ES)'),
      p('Theo Renard', 'Systems Engineer II', 'Seattle, WA'),
      p('Priti Deshmukh', 'Build & Release Engineer', 'Seattle, WA'),
    ],
  },
  'ml-infra': {
    id: 'ml-infra',
    name: 'ML Infrastructure',
    summary: 'Training pipelines and model rollout for pick planning.',
    lead: 'Talia Rosen',
    location: 'Seattle, WA',
    openRoles: 1,
    people: [
      p('Talia Rosen', 'Engineering Manager', 'Seattle, WA'),
      p('Erik Johansson', 'Staff ML Engineer', 'Remote (Stockholm, SE)'),
      p('Wei Chen', 'ML Engineer II', 'Seattle, WA'),
      p('Olu Adeyemi', 'Data Engineer II', 'Seattle, WA'),
    ],
  },
  // ---- Go-to-Market teams ----
  sales: {
    id: 'sales',
    name: 'Sales',
    summary: 'Enterprise deals and pilot programs for 3PL operators.',
    lead: 'Devon Ellis',
    location: 'Chicago, IL',
    openRoles: 1,
    people: [
      p('Devon Ellis', 'Head of Sales', 'Chicago, IL'),
      p('Marta Silva', 'Account Executive, EMEA', 'Remote (Lisbon, PT)'),
      p('Colin Fraser', 'Account Executive, NA', 'Chicago, IL'),
      p('Renee Okada', 'Sales Engineer', 'Chicago, IL'),
    ],
  },
  marketing: {
    id: 'marketing',
    name: 'Marketing',
    summary: 'Product marketing, events, and the customer story program.',
    lead: 'Maja Kowalski',
    location: 'Chicago, IL',
    people: [
      p('Maja Kowalski', 'Head of Marketing', 'Chicago, IL'),
      p('Ben Ashworth', 'Product Marketing Manager', 'Chicago, IL'),
      p('Lucia Ferrari', 'Events Manager', 'Remote (New York, NY)'),
      p('Harpreet Gill', 'Content Strategist', 'Chicago, IL'),
    ],
  },
};

// Land four levels deep so the breadcrumb trail is doing real work on
// first render: company / division / group / team.
const INITIAL_PATH = ['halcyon', 'hardware', 'perception', 'camera-firmware'];

/** Headcount rollup — leaf teams count people, branches sum children. */
function countMembers(node: OrgNode): number {
  if (node.people) {
    return node.people.length;
  }
  return (node.childIds ?? []).reduce(
    (sum, id) => sum + countMembers(NODES[id]),
    0,
  );
}

/** Open-role rollup — own postings plus everything in the subtree. */
function countOpenRoles(node: OrgNode): number {
  return (
    (node.openRoles ?? 0) +
    (node.childIds ?? []).reduce((sum, id) => sum + countOpenRoles(NODES[id]), 0)
  );
}

// ============= PAGE =============

export default function ShellBreadcrumbTemplate() {
  const [path, setPath] = useState<string[]>(INITIAL_PATH);
  const [announcement, setAnnouncement] = useState('');
  const isCompact = useMediaQuery('(max-width: 640px)');

  const node = NODES[path[path.length - 1]];
  const parent = path.length > 1 ? NODES[path[path.length - 2]] : null;
  const memberCount = countMembers(node);
  const openRoleCount = countOpenRoles(node);
  const childIds = node.childIds ?? [];
  const people = node.people ?? [];
  const isLeafTeam = node.people != null;

  const navigateTo = (nextPath: string[]) => {
    const target = NODES[nextPath[nextPath.length - 1]];
    setPath(nextPath);
    setAnnouncement(`Viewing ${target.name} — ${countMembers(target)} people`);
  };
  const jumpToCrumb = (index: number) => navigateTo(path.slice(0, index + 1));
  const drillInto = (childId: string) => navigateTo([...path, childId]);
  const goBack = () => navigateTo(path.slice(0, -1));

  return (
    <Layout
      height="fill"
      header={
        // Minimal top bar: brand mark + utilities only. Hierarchy and
        // back-navigation live in the breadcrumb trail below, not here.
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center">
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                <Icon icon={UserGroupIcon} size="md" />
                <Text type="label">Halcyon Directory</Text>
              </HStack>
            </StackItem>
            <IconButton
              label="Search people and teams"
              icon={<Icon icon={MagnifyingGlassIcon} size="sm" />}
              variant="ghost"
            />
            <IconButton
              label="Notifications"
              icon={<Icon icon={BellIcon} size="sm" />}
              variant="ghost"
            />
            <Avatar name="Dana Whitfield" size="small" />
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={isCompact ? 3 : 5} label="Team directory">
          <div aria-live="polite" style={styles.visuallyHidden}>
            {announcement}
          </div>
          <div style={styles.column}>
            <VStack gap={4}>
              {/* Breadcrumb trail — the primary navigation surface. */}
              <VStack gap={2}>
                <Breadcrumbs label="Organization hierarchy">
                  {path.map((id, index) => {
                    const crumb = NODES[id];
                    const isCurrent = index === path.length - 1;
                    return (
                      <BreadcrumbItem
                        key={id}
                        isCurrent={isCurrent}
                        href={isCurrent ? undefined : '#'}
                        onClick={
                          isCurrent
                            ? undefined
                            : event => {
                                event.preventDefault();
                                jumpToCrumb(index);
                              }
                        }
                        startIcon={
                          index === 0 ? (
                            <Icon icon={HomeIcon} size="sm" />
                          ) : undefined
                        }>
                        {crumb.name}
                      </BreadcrumbItem>
                    );
                  })}
                </Breadcrumbs>
                {parent != null && (
                  <Link
                    href="#"
                    type="supporting"
                    isStandalone
                    onClick={event => {
                      event.preventDefault();
                      goBack();
                    }}>
                    ← Back to {parent.name}
                  </Link>
                )}
              </VStack>

              {/* Page header for the current node. */}
              <HStack gap={3} vAlign="start" wrap={isCompact ? 'wrap' : 'nowrap'}>
                <StackItem size="fill">
                  <VStack gap={2}>
                    <VStack gap={1}>
                      <Heading level={1}>{node.name}</Heading>
                      <Text type="body" color="secondary">
                        {node.summary}
                      </Text>
                    </VStack>
                    <HStack gap={2} vAlign="center" wrap="wrap">
                      <Badge label={`${memberCount} people`} />
                      {openRoleCount > 0 && (
                        <Badge
                          variant="success"
                          label={`${openRoleCount} open role${
                            openRoleCount === 1 ? '' : 's'
                          }`}
                        />
                      )}
                      <Text type="supporting" color="secondary">
                        Lead · {node.lead}
                      </Text>
                      <Text type="supporting" color="secondary">
                        {node.location}
                      </Text>
                    </HStack>
                  </VStack>
                </StackItem>
                <HStack gap={2} vAlign="center">
                  <Button
                    label={isLeafTeam ? 'Edit team' : 'Edit group'}
                    variant="secondary"
                    icon={<Icon icon={PencilSquareIcon} size="sm" />}
                  />
                  <Button
                    label={isLeafTeam ? 'Add member' : 'Add sub-team'}
                    icon={<Icon icon={PlusIcon} size="sm" />}
                  />
                </HStack>
              </HStack>

              <Divider />

              {/* Children of the current node: drill targets or members. */}
              <VStack gap={2}>
                <Heading level={2}>
                  {isLeafTeam
                    ? `Members (${people.length})`
                    : `Sub-teams (${childIds.length})`}
                </Heading>
                {isLeafTeam ? (
                  <List hasDividers>
                    {people.map(person => (
                      <ListItem
                        key={person.name}
                        label={person.name}
                        description={person.title}
                        startContent={<Avatar name={person.name} size="small" />}
                        endContent={
                          <Text type="supporting" color="secondary">
                            {person.location}
                          </Text>
                        }
                        href="#"
                      />
                    ))}
                  </List>
                ) : (
                  <List hasDividers>
                    {childIds.map(childId => {
                      const child = NODES[childId];
                      const childMembers = countMembers(child);
                      const childRoles = countOpenRoles(child);
                      return (
                        <ListItem
                          key={childId}
                          label={child.name}
                          description={child.summary}
                          startContent={<Icon icon={UserGroupIcon} size="md" />}
                          endContent={
                            <HStack gap={2} vAlign="center">
                              {childRoles > 0 && !isCompact && (
                                <Badge
                                  variant="success"
                                  label={`${childRoles} open`}
                                />
                              )}
                              <Badge label={`${childMembers} people`} />
                            </HStack>
                          }
                          onClick={() => drillInto(childId)}
                        />
                      );
                    })}
                  </List>
                )}
              </VStack>
            </VStack>
          </div>
        </LayoutContent>
      }
    />
  );
}
