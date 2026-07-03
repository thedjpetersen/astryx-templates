var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (suite products, top-level sections,
 *   per-section sidebar groups, page metadata for each destination)
 * @output Two-level navigation shell for a cloud infrastructure console:
 *   global TopNav (product switcher heading, section items, search,
 *   notifications, user menu) over an AppShell frame whose contextual
 *   SideNav swaps its groups to match the active top-level section. The
 *   content area renders a breadcrumbed page header plus a skeleton
 *   placeholder body where the destination page mounts.
 * @position Page template; emitted by \`astryx template shell-top-nav-sidebar\`
 *
 * Responsive contract:
 * - >1024px: full frame — TopNav section items inline, 264px SideNav,
 *   search input visible in the top bar.
 * - <=1024px: the top-bar search input is replaced by an icon-only search
 *   button; everything else keeps width.
 * - <=768px (AppShell breakpoint 'md'): the SideNav moves into AppShell's
 *   auto mobile drawer behind a hamburger toggle, and TopNav collapses its
 *   items per its own mobile-bar/drawer modes; content keeps full width.
 * - Content: summary cards reflow 3-up → 2-up → 1-up via Grid minWidth;
 *   page-header actions stay pinned right and the header row wraps under
 *   the title when space runs out.
 */

import {useState, type CSSProperties} from 'react';

import {AppShell} from '@astryxdesign/core/AppShell';
import {TopNav, TopNavHeading, TopNavItem} from '@astryxdesign/core/TopNav';
import {SideNav, SideNavItem, SideNavSection} from '@astryxdesign/core/SideNav';
import {NavIcon} from '@astryxdesign/core/NavIcon';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {VStack, HStack, StackItem} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Icon} from '@astryxdesign/core/Icon';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Card} from '@astryxdesign/core/Card';
import {Grid} from '@astryxdesign/core/Grid';
import {Skeleton} from '@astryxdesign/core/Skeleton';
import {TextInput} from '@astryxdesign/core/TextInput';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {List, ListItem} from '@astryxdesign/core/List';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  BellIcon,
  CircleHelpIcon,
  CloudIcon,
  PlusIcon,
  RefreshCwIcon,
  SearchIcon,
  SettingsIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Content column: full width with console-standard padding; the AppShell
  // main region owns the scroll, so no height management is needed here.
  page: {
    padding: 'var(--spacing-5)',
    boxSizing: 'border-box',
  },
  // Fixed-width search field so the TopNav end slot stays stable.
  search: {width: 260},
  // Product switcher popover body.
  switcher: {width: 300, padding: 'var(--spacing-1)'},
};

// ============= DATA =============

// Suite products for the top-bar switcher. The console keeps you inside
// one product; siblings are links out (fixtures use '#').
const PRODUCTS = [
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'Compute, storage, and networking',
  },
  {
    id: 'analytics',
    name: 'Analytics',
    description: 'Warehouses, pipelines, and BI',
  },
  {
    id: 'identity',
    name: 'Identity & Access',
    description: 'Users, roles, and policies',
  },
  {
    id: 'billing',
    name: 'Billing',
    description: 'Invoices, budgets, and cost reports',
  },
];

const ACTIVE_PRODUCT_ID = 'infrastructure';

// Top-level sections of the active product. Each owns the sidebar groups
// rendered while it is selected.
const SECTIONS = [
  {id: 'overview', label: 'Overview'},
  {id: 'compute', label: 'Compute'},
  {id: 'storage', label: 'Storage'},
  {id: 'networking', label: 'Networking'},
  {id: 'observability', label: 'Observability'},
];

interface NavDestination {
  id: string;
  label: string;
  /** Supporting copy for the page header. */
  description: string;
  /** Primary page action; omitted for read-only surfaces. */
  action?: string;
  /** Count badge in the sidebar (open items, resources, etc.). */
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavDestination[];
}

// Contextual sidebar: groups keyed by the active top-level section.
const SECTION_NAV: Record<string, NavGroup[]> = {
  overview: [
    {
      title: 'Home',
      items: [
        {
          id: 'dashboard',
          label: 'Dashboard',
          description:
            'Project health, spend, and recent activity for acme-prod.',
        },
        {
          id: 'activity',
          label: 'Activity feed',
          description:
            'Audit trail of console and API actions across the project.',
        },
        {
          id: 'recommendations',
          label: 'Recommendations',
          description:
            'Cost and reliability recommendations, refreshed nightly.',
          badge: '4',
        },
      ],
    },
    {
      title: 'Account',
      items: [
        {
          id: 'billing-summary',
          label: 'Billing summary',
          description: 'Month-to-date spend and forecast for acme-prod.',
        },
        {
          id: 'support-cases',
          label: 'Support cases',
          description: 'Open and recently resolved cases with Solstice support.',
          action: 'New case',
          badge: '2',
        },
      ],
    },
  ],
  compute: [
    {
      title: 'Virtual machines',
      items: [
        {
          id: 'instances',
          label: 'Instances',
          description:
            '48 running instances across us-east1, us-west2, and eu-west1.',
          action: 'Create instance',
          badge: '48',
        },
        {
          id: 'instance-groups',
          label: 'Instance groups',
          description: 'Managed groups with health checks and rolling updates.',
          action: 'Create group',
        },
        {
          id: 'machine-images',
          label: 'Machine images',
          description: 'Golden images built by the nightly packer pipeline.',
          action: 'Create image',
        },
        {
          id: 'snapshots',
          label: 'Snapshots',
          description: 'Point-in-time disk snapshots and schedules.',
          action: 'Create snapshot',
        },
      ],
    },
    {
      title: 'Automation',
      items: [
        {
          id: 'autoscaling',
          label: 'Autoscaling policies',
          description: 'Scale rules driven by CPU, queue depth, and schedules.',
          action: 'New policy',
        },
        {
          id: 'startup-scripts',
          label: 'Startup scripts',
          description: 'Boot-time provisioning scripts shared across groups.',
          action: 'New script',
        },
      ],
    },
    {
      title: 'Configuration',
      items: [
        {
          id: 'quotas',
          label: 'Quotas',
          description: 'Per-region vCPU, GPU, and disk quota usage.',
        },
        {
          id: 'ssh-keys',
          label: 'SSH keys',
          description: 'Project-wide keys injected into new instances.',
          action: 'Add key',
        },
      ],
    },
  ],
  storage: [
    {
      title: 'Object storage',
      items: [
        {
          id: 'buckets',
          label: 'Buckets',
          description: '12 buckets holding 84.2 TB across three regions.',
          action: 'Create bucket',
          badge: '12',
        },
        {
          id: 'lifecycle-rules',
          label: 'Lifecycle rules',
          description: 'Tiering and expiry rules applied to bucket prefixes.',
          action: 'New rule',
        },
        {
          id: 'access-logs',
          label: 'Access logs',
          description: 'Bucket access logs delivered hourly to acme-audit.',
        },
      ],
    },
    {
      title: 'Block storage',
      items: [
        {
          id: 'volumes',
          label: 'Volumes',
          description: 'Attached and orphaned volumes with IOPS provisioning.',
          action: 'Create volume',
        },
        {
          id: 'volume-snapshots',
          label: 'Volume snapshots',
          description: 'Snapshot history and cross-region copies.',
          action: 'Create snapshot',
        },
      ],
    },
    {
      title: 'Configuration',
      items: [
        {
          id: 'encryption-keys',
          label: 'Encryption keys',
          description: 'Customer-managed keys and rotation schedules.',
          action: 'Add key',
        },
      ],
    },
  ],
  networking: [
    {
      title: 'Networks',
      items: [
        {
          id: 'vpc-networks',
          label: 'VPC networks',
          description: 'Four VPCs with shared services peering in us-east1.',
          action: 'Create VPC',
        },
        {
          id: 'subnets',
          label: 'Subnets',
          description: 'Regional subnets and secondary ranges per VPC.',
          action: 'Add subnet',
        },
        {
          id: 'routes',
          label: 'Routes',
          description: 'Static and dynamic routes, including BGP-learned.',
          action: 'Add route',
        },
      ],
    },
    {
      title: 'Services',
      items: [
        {
          id: 'load-balancers',
          label: 'Load balancers',
          description: 'Six external HTTPS balancers fronting production.',
          action: 'Create balancer',
          badge: '6',
        },
        {
          id: 'dns-zones',
          label: 'DNS zones',
          description: 'Public and private zones for acmerobotics.dev.',
          action: 'Create zone',
        },
        {
          id: 'firewall-rules',
          label: 'Firewall rules',
          description: 'Ingress and egress rules ordered by priority.',
          action: 'Add rule',
        },
      ],
    },
    {
      title: 'Connectivity',
      items: [
        {
          id: 'peering',
          label: 'Peering',
          description: 'VPC peering connections and exchange status.',
          action: 'New peering',
        },
        {
          id: 'vpn-tunnels',
          label: 'VPN tunnels',
          description: 'Site-to-site tunnels to the Fremont datacenter.',
          action: 'Create tunnel',
        },
      ],
    },
  ],
  observability: [
    {
      title: 'Monitoring',
      items: [
        {
          id: 'dashboards',
          label: 'Dashboards',
          description: 'Team dashboards for API, checkout, and batch fleets.',
          action: 'New dashboard',
        },
        {
          id: 'alert-policies',
          label: 'Alert policies',
          description: 'Three policies currently firing; paging on-call SRE.',
          action: 'New policy',
          badge: '3',
        },
        {
          id: 'uptime-checks',
          label: 'Uptime checks',
          description: 'Global HTTPS checks against public endpoints.',
          action: 'New check',
        },
      ],
    },
    {
      title: 'Telemetry',
      items: [
        {
          id: 'logs-explorer',
          label: 'Logs explorer',
          description: 'Query structured logs across all services and regions.',
        },
        {
          id: 'traces',
          label: 'Traces',
          description: 'Distributed traces sampled at 10% for production.',
        },
        {
          id: 'metrics-explorer',
          label: 'Metrics explorer',
          description: 'Ad hoc charts over platform and custom metrics.',
        },
      ],
    },
  ],
};

const CURRENT_USER = {name: 'Priya Raman', email: 'priya@acmerobotics.dev'};

// Widths of the skeleton "rows" in the wide placeholder card — fixed so the
// render is deterministic while still reading like a loading resource table.
const PLACEHOLDER_ROW_WIDTHS = ['92%', '78%', '85%', '64%', '71%'];

// ============= COMPONENTS =============

/** Product switcher body for the TopNavHeading popover. */
function ProductSwitcher() {
  return (
    <div style={styles.switcher}>
      <List density="compact" hasDividers={false}>
        {PRODUCTS.map(product => (
          <ListItem
            key={product.id}
            label={product.name}
            description={product.description}
            href="#"
            isSelected={product.id === ACTIVE_PRODUCT_ID}
            endContent={
              product.id === ACTIVE_PRODUCT_ID ? (
                <Badge label="Current" variant="neutral" />
              ) : undefined
            }
          />
        ))}
      </List>
    </div>
  );
}

/** Placeholder widget: titled Card whose body is a skeleton stack. */
function PlaceholderCard({
  title,
  caption,
  lines,
}: {
  title: string;
  caption: string;
  lines: string[];
}) {
  return (
    <Card>
      <VStack gap={2}>
        <VStack gap={0.5}>
          <Heading level={3}>{title}</Heading>
          <Text type="supporting" color="secondary">
            {caption}
          </Text>
        </VStack>
        <VStack gap={2}>
          {lines.map((width, index) => (
            <Skeleton key={index} width={width} height={16} index={index} />
          ))}
        </VStack>
      </VStack>
    </Card>
  );
}

// ============= PAGE =============

export default function ShellTopNavSidebarTemplate() {
  const [sectionId, setSectionId] = useState('compute');
  const [itemId, setItemId] = useState('instances');
  const [searchQuery, setSearchQuery] = useState('');
  // <=1024px: swap the search input for an icon-only button (see header).
  const isSearchCompact = useMediaQuery('(max-width: 1024px)');

  const section = SECTIONS.find(entry => entry.id === sectionId) ?? SECTIONS[0];
  const groups = SECTION_NAV[section.id] ?? [];
  const activeItem =
    groups.flatMap(group => group.items).find(item => item.id === itemId) ??
    groups[0].items[0];

  // Switching top-level sections re-targets the sidebar; land on the
  // section's first destination so the content pane never dangles.
  const selectSection = (nextSectionId: string) => {
    setSectionId(nextSectionId);
    setItemId(SECTION_NAV[nextSectionId][0].items[0].id);
  };

  const topNav = (
    <TopNav
      label="Global navigation"
      heading={
        <TopNavHeading
          logo={<NavIcon icon={<Icon icon={CloudIcon} size="sm" />} />}
          superheading="Solstice Cloud"
          heading="Infrastructure"
          subheading="acme-prod"
          menu={<ProductSwitcher />}
        />
      }
      startContent={
        <>
          {SECTIONS.map(entry => (
            <TopNavItem
              key={entry.id}
              label={entry.label}
              isSelected={entry.id === sectionId}
              onClick={event => {
                event.preventDefault();
                selectSection(entry.id);
              }}
              href="#"
            />
          ))}
        </>
      }
      endContent={
        <HStack gap={2} vAlign="center">
          {isSearchCompact ? (
            <IconButton
              label="Search resources"
              tooltip="Search resources"
              icon={<Icon icon={SearchIcon} size="sm" />}
              variant="ghost"
              onClick={() => {}}
            />
          ) : (
            <div style={styles.search}>
              <TextInput
                label="Search resources"
                isLabelHidden
                size="sm"
                placeholder="Search resources, docs, IPs..."
                startIcon={SearchIcon}
                value={searchQuery}
                onChange={setSearchQuery}
              />
            </div>
          )}
          <IconButton
            label="Notifications"
            tooltip="Notifications"
            icon={<Icon icon={BellIcon} size="sm" />}
            variant="ghost"
            onClick={() => {}}
          />
          <DropdownMenu
            button={{
              label: \`Account: \${CURRENT_USER.name}\`,
              icon: <Avatar name={CURRENT_USER.name} size="xsmall" />,
              isIconOnly: true,
              variant: 'ghost',
            }}
            hasChevron={false}
            menuWidth={240}
            items={[
              {
                type: 'section',
                title: CURRENT_USER.email,
                items: [
                  {label: 'Profile', onClick: () => {}},
                  {label: 'Preferences', onClick: () => {}},
                ],
              },
              {type: 'divider'},
              {label: 'Sign out', onClick: () => {}},
            ]}
          />
        </HStack>
      }
    />
  );

  const sideNav = (
    // Contextual navigation: groups belong to the active top-level section.
    <SideNav
      footer={
        <VStack gap={0.5}>
          <SideNavItem
            label="Docs & support"
            icon={CircleHelpIcon}
            onClick={() => {}}
          />
          <SideNavItem
            label="Console settings"
            icon={SettingsIcon}
            onClick={() => {}}
          />
        </VStack>
      }>
      {groups.map(group => (
        <SideNavSection key={group.title} title={group.title}>
          {group.items.map(item => (
            <SideNavItem
              key={item.id}
              label={item.label}
              isSelected={item.id === activeItem.id}
              onClick={() => setItemId(item.id)}
              endContent={
                item.badge ? (
                  <Badge label={item.badge} variant="neutral" />
                ) : undefined
              }
            />
          ))}
        </SideNavSection>
      ))}
    </SideNav>
  );

  return (
    <AppShell topNav={topNav} sideNav={sideNav} contentPadding={0}>
      <div style={styles.page}>
        <VStack gap={5}>
          {/* Breadcrumbed page header for the active destination. */}
          <VStack gap={2}>
            <Breadcrumbs variant="supporting">
              <BreadcrumbItem href="#">Infrastructure</BreadcrumbItem>
              <BreadcrumbItem href="#">{section.label}</BreadcrumbItem>
              <BreadcrumbItem isCurrent>{activeItem.label}</BreadcrumbItem>
            </Breadcrumbs>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={1}>
                  <Heading level={1}>{activeItem.label}</Heading>
                  <Text type="supporting" color="secondary">
                    {activeItem.description}
                  </Text>
                </VStack>
              </StackItem>
              <HStack gap={2} vAlign="center">
                <IconButton
                  label="Refresh"
                  tooltip="Refresh"
                  icon={<Icon icon={RefreshCwIcon} size="sm" />}
                  variant="ghost"
                  onClick={() => {}}
                />
                {activeItem.action ? (
                  <Button
                    label={activeItem.action}
                    variant="primary"
                    icon={<Icon icon={PlusIcon} size="sm" />}
                    onClick={() => {}}
                  />
                ) : null}
              </HStack>
            </HStack>
          </VStack>

          {/* Placeholder body — this shell template stops at the frame; the
              destination page (table, dashboard, form) mounts here. */}
          <Grid columns={{minWidth: 260, max: 3}} gap={4}>
            <PlaceholderCard
              title="Summary"
              caption="Key figures for this page"
              lines={['70%', '55%', '62%']}
            />
            <PlaceholderCard
              title="Usage"
              caption="Last 30 days"
              lines={['85%', '60%', '74%']}
            />
            <PlaceholderCard
              title="Recent events"
              caption="Newest first"
              lines={['90%', '68%', '80%']}
            />
          </Grid>
          <PlaceholderCard
            title={activeItem.label}
            caption="Resource list loads here"
            lines={PLACEHOLDER_ROW_WIDTHS}
          />
        </VStack>
      </div>
    </AppShell>
  );
}
`;export{e as default};