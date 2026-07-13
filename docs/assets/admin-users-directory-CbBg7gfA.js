var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (10 directory users with fixed emails,
 *   mono user ids, roles, created dates, session counts, last-active labels,
 *   sandbox counts, group memberships, and integration lists; platform-wide
 *   header stats)
 * @output Admin users directory: LayoutHeader with "Users" heading and a
 *   platform stats caption; a search TextInput that live-filters rows by
 *   email, userId, or role; a dense Table whose columns cover email (shield
 *   icon on admins + mono userId), role, created date, tabular session
 *   counts, last-active labels ("Never" dimmed), sandbox counts, removable
 *   group Tokens with an inline "Add group…" Selector on the selected row,
 *   and wrapped integration Badges; a row-count footer; and an EmptyState
 *   when a search misses
 * @position Page template; emitted by \`astryx template admin-users-directory\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the heading + stats
 * caption. LayoutContent hosts the search toolbar, the Table (the page
 * centerpiece — only it scrolls with the content area), and the count
 * footer. No side panels: row selection happens inline (the Groups cell of
 * the selected row grows an add-group Selector) rather than in a drawer.
 *
 * Responsive contract:
 * - The demo stage never fires viewport media queries, so compactness is
 *   measured with a local ResizeObserver on the page root (useElementWidth).
 * - >860px: all 8 columns render; the search input sits right of the
 *   toolbar label at 360px max width.
 * - <=860px: the Created and Sandboxes columns drop (the remaining
 *   proportional columns absorb the space); the stats caption wraps.
 * - Groups and Integrations cells wrap their Tokens/Badges onto multiple
 *   lines at any width instead of truncating.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {SearchIcon, ShieldIcon} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100%'},
  contentColumn: {
    maxWidth: 1240,
    marginInline: 'auto',
  },
  searchBox: {width: '100%', maxWidth: 360},
  // Group/integration cells wrap chips instead of truncating.
  chipWrap: {flexWrap: 'wrap', rowGap: 'var(--spacing-1)'},
  addGroupBox: {minWidth: 148},
  emailCell: {minWidth: 0},
  tableEmpty: {
    paddingBlock: 'var(--spacing-8)',
  },
  footerRow: {
    paddingBlock: 'var(--spacing-2)',
  },
};

// ============= RESPONSIVE HELPER =============
// The demo stage renders this page in an inline frame narrower than the
// window, so viewport media queries never fire — measure our own width.

function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// ============= DATA =============
// Deterministic fixtures: fixed dates around 2026-07, no clocks, no
// randomness. Platform totals are directory-wide; the table shows one page.

const HEADER_STATS =
  '1,248 total · 312 active today · 741 active this week · 89,412 total sessions';

const ALL_GROUPS = [
  'core',
  'deploy-reviewers',
  'sandbox-admins',
  'oncall',
  'beta-cohort',
  'billing',
  'research',
  'external',
] as const;

type IntegrationName =
  | 'GitHub'
  | 'TeamChat'
  | 'BYOT'
  | 'Ecto'
  | 'Hatch'
  | 'Prism'
  | 'Quill'
  | 'Slate'
  | 'Vault';

const INTEGRATION_VARIANT: Record<
  IntegrationName,
  'neutral' | 'blue' | 'purple' | 'teal' | 'orange' | 'cyan' | 'pink' | 'yellow'
> = {
  GitHub: 'neutral',
  TeamChat: 'blue',
  BYOT: 'purple',
  Ecto: 'teal',
  Hatch: 'orange',
  Prism: 'cyan',
  Quill: 'pink',
  Slate: 'neutral',
  Vault: 'yellow',
};

type LastActiveKind = 'active' | 'never';

interface DirectoryUser extends Record<string, unknown> {
  id: string;
  email: string;
  userId: string;
  role: 'Admin' | 'Member' | 'Viewer' | 'Support';
  isAdmin: boolean;
  created: string;
  sessions: string; // pre-formatted for deterministic tabular display
  lastActive: string;
  lastActiveKind: LastActiveKind;
  sandboxes: number;
  integrations: IntegrationName[];
}

// All row states appear: both admins, a contractor viewer, a support seat,
// a fully-integrated power user, a stale account, and a freshly-invited
// user with zero sessions / "Never" active / no groups or integrations.
const USERS: DirectoryUser[] = [
  {
    id: 'usr-1',
    email: 'maya.okafor@driftlab.io',
    userId: 'u_8f3a92c1',
    role: 'Admin',
    isAdmin: true,
    created: 'Jan 8, 2026',
    sessions: '1,204',
    lastActive: 'Just now',
    lastActiveKind: 'active',
    sandboxes: 3,
    integrations: ['GitHub', 'TeamChat', 'Ecto', 'Hatch'],
  },
  {
    id: 'usr-2',
    email: 'jordan.reyes@driftlab.io',
    userId: 'u_2b917fd4',
    role: 'Member',
    isAdmin: false,
    created: 'Feb 2, 2026',
    sessions: '862',
    lastActive: '5m ago',
    lastActiveKind: 'active',
    sandboxes: 2,
    integrations: ['GitHub', 'TeamChat'],
  },
  {
    id: 'usr-3',
    email: 'priya.raman@driftlab.io',
    userId: 'u_c44d1a09',
    role: 'Admin',
    isAdmin: true,
    created: 'Nov 19, 2025',
    sessions: '2,318',
    lastActive: '2h ago',
    lastActiveKind: 'active',
    sandboxes: 4,
    integrations: [
      'GitHub',
      'TeamChat',
      'BYOT',
      'Ecto',
      'Hatch',
      'Prism',
      'Quill',
      'Slate',
      'Vault',
    ],
  },
  {
    id: 'usr-4',
    email: 'tomas.lindgren@driftlab.io',
    userId: 'u_91e0b7c3',
    role: 'Member',
    isAdmin: false,
    created: 'Mar 14, 2026',
    sessions: '431',
    lastActive: '42m ago',
    lastActiveKind: 'active',
    sandboxes: 1,
    integrations: ['GitHub', 'BYOT'],
  },
  {
    id: 'usr-5',
    email: 'amara.diallo@contractor.driftlab.io',
    userId: 'u_5f6621ab',
    role: 'Viewer',
    isAdmin: false,
    created: 'Apr 30, 2026',
    sessions: '57',
    lastActive: 'Yesterday',
    lastActiveKind: 'active',
    sandboxes: 0,
    integrations: ['Slate'],
  },
  {
    id: 'usr-6',
    email: 'kenji.watanabe@driftlab.io',
    userId: 'u_7a08d95e',
    role: 'Member',
    isAdmin: false,
    created: 'Dec 3, 2025',
    sessions: '1,077',
    lastActive: '3h ago',
    lastActiveKind: 'active',
    sandboxes: 2,
    integrations: ['GitHub', 'TeamChat', 'Prism', 'Quill'],
  },
  {
    id: 'usr-7',
    email: 'sofia.marchetti@driftlab.io',
    userId: 'u_e3b52c17',
    role: 'Support',
    isAdmin: false,
    created: 'Jan 27, 2026',
    sessions: '693',
    lastActive: 'Jul 6',
    lastActiveKind: 'active',
    sandboxes: 1,
    integrations: ['TeamChat', 'Vault'],
  },
  {
    id: 'usr-8',
    email: 'noah.brandt@driftlab.io',
    userId: 'u_0d78e4f2',
    role: 'Member',
    isAdmin: false,
    created: 'May 21, 2026',
    sessions: '208',
    lastActive: 'Jun 12',
    lastActiveKind: 'active',
    sandboxes: 1,
    integrations: ['GitHub', 'Ecto'],
  },
  {
    id: 'usr-9',
    email: 'lena.hoffman@driftlab.io',
    userId: 'u_66aa03d9',
    role: 'Member',
    isAdmin: false,
    created: 'Jul 9, 2026',
    sessions: '0',
    lastActive: 'Never',
    lastActiveKind: 'never',
    sandboxes: 0,
    integrations: [],
  },
  {
    id: 'usr-10',
    email: 'rachel.osei@driftlab.io',
    userId: 'u_b8c1f204',
    role: 'Member',
    isAdmin: false,
    created: 'Oct 8, 2025',
    sessions: '1,842',
    lastActive: '18m ago',
    lastActiveKind: 'active',
    sandboxes: 2,
    integrations: ['GitHub', 'TeamChat', 'BYOT', 'Hatch'],
  },
];

const INITIAL_GROUPS: Record<string, string[]> = {
  'usr-1': ['core', 'deploy-reviewers'],
  'usr-2': ['core'],
  'usr-3': ['core', 'sandbox-admins', 'oncall'],
  'usr-4': ['beta-cohort'],
  'usr-5': ['external'],
  'usr-6': ['core', 'oncall', 'deploy-reviewers', 'beta-cohort'],
  'usr-7': ['billing'],
  'usr-8': ['research'],
  'usr-9': [],
  'usr-10': ['core', 'billing'],
};

// ============= PAGE =============

export default function AdminUsersDirectoryTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 860;

  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>('usr-1');
  const [groupsByUser, setGroupsByUser] =
    useState<Record<string, string[]>>(INITIAL_GROUPS);

  const query = search.trim().toLowerCase();
  const filteredUsers = useMemo(() => {
    if (query === '') {
      return USERS;
    }
    return USERS.filter(
      user =>
        user.email.toLowerCase().includes(query) ||
        user.userId.toLowerCase().includes(query) ||
        user.role.toLowerCase().includes(query),
    );
  }, [query]);

  const removeGroup = (userId: string, group: string) => {
    setGroupsByUser(prev => ({
      ...prev,
      [userId]: (prev[userId] ?? []).filter(item => item !== group),
    }));
  };

  const addGroup = (userId: string, group: string) => {
    if (group === '') {
      return;
    }
    setGroupsByUser(prev => {
      const current = prev[userId] ?? [];
      if (current.includes(group)) {
        return prev;
      }
      return {...prev, [userId]: [...current, group]};
    });
  };

  const columns = useMemo<TableColumn<DirectoryUser>[]>(() => {
    const emailColumn: TableColumn<DirectoryUser> = {
      key: 'email',
      header: 'Email',
      width: proportional(2, {minWidth: 200}),
      renderCell: user => (
        <VStack gap={0} style={styles.emailCell}>
          <HStack gap={1} vAlign="center">
            {user.isAdmin && (
              <Tooltip content="Workspace admin">
                <Icon icon={ShieldIcon} size="xsm" color="accent" />
              </Tooltip>
            )}
            <Text size="sm" maxLines={1}>
              {user.email}
            </Text>
          </HStack>
          <Text type="code" size="xsm" color="secondary">
            {user.userId}
          </Text>
        </VStack>
      ),
    };

    const roleColumn: TableColumn<DirectoryUser> = {
      key: 'role',
      header: 'Role',
      width: pixel(92),
      renderCell: user => (
        <Text size="sm" color={user.isAdmin ? 'accent' : 'primary'}>
          {user.role}
        </Text>
      ),
    };

    const createdColumn: TableColumn<DirectoryUser> = {
      key: 'created',
      header: 'Created',
      width: pixel(108),
      renderCell: user => (
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {user.created}
        </Text>
      ),
    };

    const sessionsColumn: TableColumn<DirectoryUser> = {
      key: 'sessions',
      header: 'Sessions',
      width: pixel(88),
      align: 'end',
      renderCell: user => (
        <Text size="sm" hasTabularNumbers>
          {user.sessions}
        </Text>
      ),
    };

    const lastActiveColumn: TableColumn<DirectoryUser> = {
      key: 'lastActive',
      header: 'Last Active',
      width: pixel(104),
      renderCell: user => (
        <Text
          size="sm"
          color={user.lastActiveKind === 'never' ? 'disabled' : 'primary'}>
          {user.lastActive}
        </Text>
      ),
    };

    const sandboxesColumn: TableColumn<DirectoryUser> = {
      key: 'sandboxes',
      header: 'Sandboxes',
      width: pixel(96),
      align: 'end',
      renderCell: user => (
        <Text
          size="sm"
          hasTabularNumbers
          color={user.sandboxes === 0 ? 'disabled' : 'primary'}>
          {user.sandboxes}
        </Text>
      ),
    };

    const groupsColumn: TableColumn<DirectoryUser> = {
      key: 'groups',
      header: 'Groups',
      width: proportional(2, {minWidth: 190}),
      renderCell: user => {
        const userGroups = groupsByUser[user.id] ?? [];
        const isSelected = user.id === selectedId;
        const available = ALL_GROUPS.filter(
          group => !userGroups.includes(group),
        );
        return (
          <HStack gap={1} vAlign="center" style={styles.chipWrap}>
            {userGroups.map(group => (
              <Token
                key={group}
                label={group}
                size="sm"
                onRemove={event => {
                  event.stopPropagation();
                  removeGroup(user.id, group);
                }}
              />
            ))}
            {userGroups.length === 0 && !isSelected && (
              <Text type="supporting" color="disabled">
                No groups
              </Text>
            )}
            {isSelected && available.length > 0 && (
              <div style={styles.addGroupBox}>
                <Selector
                  label={\`Add group for \${user.email}\`}
                  isLabelHidden
                  size="sm"
                  placeholder="Add group…"
                  options={available.map(group => ({
                    value: group,
                    label: group,
                  }))}
                  value=""
                  onChange={value => addGroup(user.id, value)}
                />
              </div>
            )}
          </HStack>
        );
      },
    };

    const integrationsColumn: TableColumn<DirectoryUser> = {
      key: 'integrations',
      header: 'Integrations',
      width: proportional(2, {minWidth: 180}),
      renderCell: user =>
        user.integrations.length === 0 ? (
          <Text type="supporting" color="disabled">
            None connected
          </Text>
        ) : (
          <HStack gap={1} vAlign="center" style={styles.chipWrap}>
            {user.integrations.map(name => (
              <Badge
                key={name}
                label={name}
                variant={INTEGRATION_VARIANT[name]}
              />
            ))}
          </HStack>
        ),
    };

    // Compact: Created and Sandboxes are the droppable metadata columns.
    return isCompact
      ? [
          emailColumn,
          roleColumn,
          sessionsColumn,
          lastActiveColumn,
          groupsColumn,
          integrationsColumn,
        ]
      : [
          emailColumn,
          roleColumn,
          createdColumn,
          sessionsColumn,
          lastActiveColumn,
          sandboxesColumn,
          groupsColumn,
          integrationsColumn,
        ];
  }, [groupsByUser, isCompact, selectedId]);

  // Row click selects the user; the selected row grows the inline
  // add-group Selector and carries an accent inset marker.
  const selectionPlugin: TablePlugin<DirectoryUser> = {
    transformBodyRow: (props, item) => {
      const prevOnClick = props.htmlProps.onClick;
      const isSelected = item.id === selectedId;
      return {
        ...props,
        htmlProps: {
          ...props.htmlProps,
          onClick: event => {
            prevOnClick?.(event);
            setSelectedId(item.id);
          },
          'aria-selected': isSelected || undefined,
          style: {
            ...props.htmlProps.style,
            cursor: 'pointer',
            ...(isSelected
              ? {boxShadow: 'inset 2px 0 0 var(--color-accent)'}
              : null),
          },
        },
      };
    },
  };

  return (
    <div ref={wrapRef} style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <VStack gap={1}>
              <Heading level={1}>Users</Heading>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {HEADER_STATS}
              </Text>
            </VStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent>
            <div style={styles.contentColumn}>
              <VStack gap={3}>
                <HStack gap={3} vAlign="center">
                  <div style={styles.searchBox}>
                    <TextInput
                      label="Search users"
                      isLabelHidden
                      size="sm"
                      startIcon={<Icon icon={SearchIcon} size="sm" />}
                      placeholder="Search by email, userId, or role..."
                      value={search}
                      onChange={value => setSearch(value)}
                      hasClear
                    />
                  </div>
                  <StackItem size="fill" />
                  {!isCompact && (
                    <Text type="supporting" color="secondary">
                      Click a row to manage its groups
                    </Text>
                  )}
                </HStack>

                <Table<DirectoryUser>
                  data={filteredUsers}
                  columns={columns}
                  idKey="id"
                  density="balanced"
                  dividers="rows"
                  hasHover
                  verticalAlign="middle"
                  plugins={{selection: selectionPlugin}}
                  emptyState={
                    <div style={styles.tableEmpty}>
                      <EmptyState
                        isCompact
                        icon={<Icon icon={SearchIcon} size="lg" />}
                        title="No users match your search."
                        description="Try a different email, userId, or role."
                      />
                    </div>
                  }
                />

                <HStack gap={2} vAlign="center" style={styles.footerRow}>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {filteredUsers.length} of {USERS.length} users shown
                  </Text>
                  <StackItem size="fill" />
                  <Text type="supporting" color="secondary">
                    Page 1 of 125 · sorted by last active
                  </Text>
                </HStack>
              </VStack>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};