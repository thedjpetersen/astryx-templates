var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (session rows across personal, two team
 *   workspaces, shared-with-me, and archived sections; tag groupings;
 *   sub-agent child tasks; a compact two-turn transcript per selection)
 * @output Full app shell where the pinned ~288px session sidebar is the star:
 *   search + filter reveal with segmented pill rows, uppercase eyebrow
 *   section headers (collapse chevron, "you are here" accent mark, amber
 *   default-workspace star, hover kebab), tag-grouped session rows with
 *   right-aligned counts and a "3 more…" expander, status dots (accent pulse
 *   on processing), pin/fork glyphs, author initial avatars with relative
 *   time and share-role labels, one row expanding into nested sub-agent
 *   children, hover-reveal per-row kebabs, an active/archived/running count
 *   footer, and a collapse toggle that narrows the sidebar to a 56px icon
 *   rail; the right pane is a modest chat transcript + composer that follows
 *   the selected session
 * @position Page template; emitted by \`astryx template ai-chat-session-sidebar\`
 *
 * Frame: Layout height="fill". The sidebar is a start LayoutPanel
 * (width 288, or 56 in rail mode) with its own pinned header, scrolling
 * section list, and pinned footer (isScrollable={false}; the list scrolls).
 * LayoutContent (padding 0) hosts a slim chat header + centered ChatLayout.
 * Unlike ai-chat-tool-stream this surface is about *finding and organizing
 * sessions*, not how the agent executed one.
 *
 * Responsive contract:
 * - Width is measured with a local ResizeObserver (useElementWidth) — the
 *   demo's inline stage never fires viewport media queries.
 * - >720px: pinned 288px sidebar; the collapse toggle narrows it to a 56px
 *   icon rail (section icons with tooltips, running dot in the footer).
 * - <=720px: the sidebar auto-collapses to the rail; the expand button
 *   still works, and the chat column simply narrows beside it.
 * - Only the session list and the transcript scroll; sidebar header/footer
 *   and the chat header/composer are fixed chrome.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {
  ChatLayout,
  ChatMessage,
  ChatMessageBubble,
  ChatMessageList,
  ChatMessageMetadata,
  ChatSystemMessage,
} from '@astryxdesign/core/Chat';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon, type IconType} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Spinner} from '@astryxdesign/core/Spinner';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {
  ArchiveIcon,
  BoxesIcon,
  ChevronDownIcon,
  FolderIcon,
  GitBranchIcon,
  PanelLeftCloseIcon,
  PanelLeftOpenIcon,
  PaperclipIcon,
  PinIcon,
  RocketIcon,
  SearchIcon,
  SendIcon,
  Share2Icon,
  SlidersHorizontalIcon,
  StarIcon,
  UserIcon,
} from 'lucide-react';

// ============= STYLES =============

// Scoped CSS: the processing pulse and the hover-reveal kebabs need real
// pseudo-class selectors, so a small scoped stylesheet backs the inline maps.
const SCOPE = 'scs-root';

const TEMPLATE_CSS = \`
@keyframes scs-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.3; }
}
.\${SCOPE} .scs-pulse {
  display: inline-flex;
  animation: scs-pulse 1.5s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .scs-pulse { animation: none; }
}
.\${SCOPE} .scs-row { border-radius: var(--radius-container); }
.\${SCOPE} .scs-row:hover { background-color: var(--color-background-muted); }
.\${SCOPE} .scs-row[data-active='true'] {
  background-color: var(--color-accent-muted);
}
.\${SCOPE} .scs-actions { opacity: 0; transition: opacity 0.12s ease; }
.\${SCOPE} .scs-row:hover .scs-actions,
.\${SCOPE} .scs-row:focus-within .scs-actions,
.\${SCOPE} .scs-head:hover .scs-actions,
.\${SCOPE} .scs-head:focus-within .scs-actions,
.\${SCOPE} .scs-actions[data-open='true'] { opacity: 1; }
.\${SCOPE} .scs-rowbtn,
.\${SCOPE} .scs-headbtn {
  font: inherit;
  color: inherit;
  text-align: left;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  min-width: 0;
}
.\${SCOPE} .scs-rowbtn:focus-visible,
.\${SCOPE} .scs-headbtn:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 1px;
  border-radius: var(--radius-container);
}
\`;

const styles: Record<string, CSSProperties> = {
  root: {height: '100%'},
  // Sidebar: pinned header + scrolling list + pinned footer.
  sidebar: {height: '100%', display: 'flex', flexDirection: 'column'},
  sidebarTop: {
    padding: 'var(--spacing-2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  filterWrap: {position: 'relative', display: 'inline-flex'},
  filterDot: {
    position: 'absolute',
    top: 2,
    right: 2,
    width: 7,
    height: 7,
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    pointerEvents: 'none',
  },
  sectionList: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-1)',
    paddingBottom: 'var(--spacing-2)',
  },
  // 11px uppercase tracking-wide section eyebrow.
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  headRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-1)',
    paddingBlock: 'var(--spacing-1)',
    marginTop: 'var(--spacing-2)',
  },
  headBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    flex: 1,
    minWidth: 0,
  },
  chevron: {display: 'inline-flex', transition: 'transform 0.15s ease'},
  chevronCollapsed: {transform: 'rotate(-90deg)'},
  contextDot: {
    width: 6,
    height: 6,
    borderRadius: '50%',
    backgroundColor: 'var(--color-accent)',
    display: 'inline-block',
    flexShrink: 0,
  },
  starMark: {display: 'inline-flex', color: 'var(--color-warning)'},
  tagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-2)',
    paddingTop: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-1)',
  },
  // Session row: a flex shell so the kebab is a sibling of the select
  // button (no nested interactive elements).
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    paddingInline: 'var(--spacing-1)',
    paddingBlock: 'var(--spacing-1)',
  },
  rowMain: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  rowStatusCell: {
    width: 12,
    display: 'flex',
    justifyContent: 'center',
    flexShrink: 0,
  },
  rowBody: {minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2},
  rowTitleLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    minWidth: 0,
  },
  rowGlyph: {display: 'inline-flex', flexShrink: 0},
  rowMeta: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)'},
  subList: {
    paddingLeft: 34,
    display: 'flex',
    flexDirection: 'column',
    paddingBottom: 'var(--spacing-1)',
  },
  subRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingBlock: 3,
    paddingInline: 'var(--spacing-1)',
  },
  moreBtnWrap: {paddingLeft: 30},
  footer: {
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-2)',
  },
  // Collapsed 56px icon rail.
  rail: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    paddingBlock: 'var(--spacing-2)',
  },
  railFoot: {marginTop: 'auto', paddingBottom: 'var(--spacing-1)'},
  // Chat pane: slim header + scrolling transcript + pinned composer.
  chatWrap: {height: '100%', display: 'flex', flexDirection: 'column'},
  chatHeader: {
    borderBottom: 'var(--border-width) solid var(--color-border)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  chatBody: {flex: 1, minHeight: 0},
  chatColumn: {
    height: '100%',
    maxWidth: 760,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-3)',
  },
  composerArea: {paddingTop: 'var(--spacing-2)'},
  composerCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-2)',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed relative-time labels as static text, fixed
// ISO timestamps in the transcript, no clocks, no randomness.

const ASSISTANT_NAME = 'Halo Copilot';
const CURRENT_USER = 'Mara Ellis';

type SectionKind = 'personal' | 'workspace' | 'shared' | 'archived';

interface SectionDef {
  id: string;
  label: string;
  icon: IconType;
  kind: SectionKind;
  /** Amber star: new chats start here unless routed elsewhere. */
  isDefaultWorkspace?: boolean;
  /** Accent "you are here" mark: the context the open chat lives in. */
  isCurrentContext?: boolean;
}

const SECTION_DEFS: Record<string, SectionDef> = {
  personal: {id: 'personal', label: 'Personal', icon: UserIcon, kind: 'personal'},
  'ws-atlas': {
    id: 'ws-atlas',
    label: 'Atlas Core',
    icon: BoxesIcon,
    kind: 'workspace',
    isDefaultWorkspace: true,
  },
  'ws-growth': {
    id: 'ws-growth',
    label: 'Growth Pod',
    icon: RocketIcon,
    kind: 'workspace',
    isCurrentContext: true,
  },
  shared: {
    id: 'shared',
    label: 'Shared with me',
    icon: Share2Icon,
    kind: 'shared',
  },
  archived: {id: 'archived', label: 'Archived', icon: ArchiveIcon, kind: 'archived'},
};

type RowStatus = 'idle' | 'ready' | 'processing' | 'review' | 'failed';
type SubAgentStatus = 'running' | 'complete' | 'error';
type ShareRole = 'Can reply' | 'View only';

interface SubAgentTask {
  id: string;
  /** null falls back to the "Agent task" placeholder title. */
  title: string | null;
  status: SubAgentStatus;
}

interface Session {
  id: string;
  sectionId: string;
  title: string;
  author: string;
  timeAgo: string; // static relative label, deterministic
  status: RowStatus;
  tag?: string; // workspace tag; undefined lands in "Uncategorized"
  isPinned?: boolean;
  isForked?: boolean;
  role?: ShareRole; // only on shared rows
  subAgents?: SubAgentTask[];
}

const ROW_STATUS: Record<
  RowStatus,
  {
    variant: 'neutral' | 'success' | 'accent' | 'warning' | 'error';
    label: string;
    hasPulse: boolean;
  }
> = {
  idle: {variant: 'neutral', label: 'Idle', hasPulse: false},
  ready: {variant: 'success', label: 'Complete', hasPulse: false},
  processing: {variant: 'accent', label: 'Processing', hasPulse: true},
  review: {variant: 'warning', label: 'Needs review', hasPulse: false},
  failed: {variant: 'error', label: 'Failed', hasPulse: false},
};

const SUB_STATUS: Record<
  SubAgentStatus,
  {variant: 'warning' | 'success' | 'error'; label: string; hasPulse: boolean}
> = {
  running: {variant: 'warning', label: 'Running', hasPulse: true},
  complete: {variant: 'success', label: 'Complete', hasPulse: false},
  error: {variant: 'error', label: 'Failed', hasPulse: false},
};

const INITIAL_SESSIONS: Session[] = [
  // ----- PERSONAL -----
  {
    id: 'p-1',
    sectionId: 'personal',
    title: 'Rework billing webhook retries',
    author: CURRENT_USER,
    timeAgo: '3 hours ago',
    status: 'idle',
    isPinned: true,
  },
  {
    id: 'p-2',
    sectionId: 'personal',
    title: 'Pricing page copy explorations',
    author: CURRENT_USER,
    timeAgo: 'Yesterday',
    status: 'ready',
    isForked: true,
  },
  // ----- ATLAS CORE · launch-prep (8 rows: 5 visible + "3 more…") -----
  {
    id: 'a-1',
    sectionId: 'ws-atlas',
    tag: 'launch-prep',
    title: 'Cut the v2.9 release branch',
    author: 'Jonah Reyes',
    timeAgo: '26 minutes ago',
    status: 'ready',
    isPinned: true,
  },
  {
    id: 'a-2',
    sectionId: 'ws-atlas',
    tag: 'launch-prep',
    title: 'Bundle-size regression triage',
    author: CURRENT_USER,
    timeAgo: '2 minutes ago',
    status: 'processing',
    subAgents: [
      {id: 'sa-1', title: 'Scan route-level bundle graph', status: 'running'},
      {id: 'sa-2', title: 'Diff vendor chunks vs v2.8', status: 'complete'},
      {id: 'sa-3', title: 'Compare against size budget', status: 'error'},
      {id: 'sa-4', title: null, status: 'complete'},
    ],
  },
  {
    id: 'a-3',
    sectionId: 'ws-atlas',
    tag: 'launch-prep',
    title: 'Write the launch-day runbook',
    author: 'Lin Xu',
    timeAgo: '1 hour ago',
    status: 'idle',
  },
  {
    id: 'a-4',
    sectionId: 'ws-atlas',
    tag: 'launch-prep',
    title: 'Load-test checkout at 4x traffic',
    author: 'Jonah Reyes',
    timeAgo: '2 hours ago',
    status: 'review',
  },
  {
    id: 'a-5',
    sectionId: 'ws-atlas',
    tag: 'launch-prep',
    title: 'Migrate flags to the config service',
    author: CURRENT_USER,
    timeAgo: '5 hours ago',
    status: 'failed',
  },
  {
    id: 'a-6',
    sectionId: 'ws-atlas',
    tag: 'launch-prep',
    title: 'Draft the rollback plan',
    author: 'Lin Xu',
    timeAgo: 'Yesterday',
    status: 'idle',
  },
  {
    id: 'a-7',
    sectionId: 'ws-atlas',
    tag: 'launch-prep',
    title: 'Refresh press-kit screenshots',
    author: 'Priya Nair',
    timeAgo: 'Yesterday',
    status: 'idle',
  },
  {
    id: 'a-8',
    sectionId: 'ws-atlas',
    tag: 'launch-prep',
    title: 'Update status-page templates',
    author: CURRENT_USER,
    timeAgo: '2 days ago',
    status: 'ready',
  },
  // ----- ATLAS CORE · Uncategorized catch-all -----
  {
    id: 'a-9',
    sectionId: 'ws-atlas',
    title: 'Unicode bug in receipt emails',
    author: CURRENT_USER,
    timeAgo: '3 days ago',
    status: 'idle',
  },
  {
    id: 'a-10',
    sectionId: 'ws-atlas',
    title: 'Notes from the infra sync',
    author: 'Jonah Reyes',
    timeAgo: '4 days ago',
    status: 'idle',
  },
  // ----- GROWTH POD (current context; holds the open session) -----
  {
    id: 'g-1',
    sectionId: 'ws-growth',
    title: 'Onboarding drip experiment',
    author: CURRENT_USER,
    timeAgo: 'Just now',
    status: 'processing',
  },
  {
    id: 'g-2',
    sectionId: 'ws-growth',
    title: 'Activation cohort deep-dive',
    author: 'Priya Nair',
    timeAgo: '6 hours ago',
    status: 'ready',
  },
  // ----- SHARED WITH ME -----
  {
    id: 's-1',
    sectionId: 'shared',
    title: 'Incident 4412 postmortem',
    author: 'Priya Nair',
    timeAgo: '2 hours ago',
    status: 'idle',
    role: 'Can reply',
  },
  {
    id: 's-2',
    sectionId: 'shared',
    title: 'Design tokens audit',
    author: 'Tom Okafor',
    timeAgo: 'Yesterday',
    status: 'ready',
    role: 'View only',
  },
  // ----- ARCHIVED -----
  {
    id: 'z-1',
    sectionId: 'archived',
    title: 'Legacy importer sunset',
    author: CURRENT_USER,
    timeAgo: '3 weeks ago',
    status: 'idle',
  },
  {
    id: 'z-2',
    sectionId: 'archived',
    title: 'Q2 growth retro summary',
    author: 'Lin Xu',
    timeAgo: 'Last month',
    status: 'idle',
  },
];

type SessionFilter = 'all' | 'personal' | 'shared' | 'workspace';
type GroupMode = 'recent' | 'people' | 'tags';

const UNCATEGORIZED = 'Uncategorized';
const MAX_TAG_ROWS = 5;
const AGENT_TASK_FALLBACK = 'Agent task';

// ============= HELPERS =============

// Local ResizeObserver width hook — the demo's inline stage never fires
// viewport media queries, so the page measures itself.
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

interface SessionGroup {
  key: string;
  label: string | null; // null renders a flat list (Recent mode)
  icon: IconType | null;
  rows: Session[];
}

/**
 * Groups a workspace's sessions by the active group mode. Tags mode uses
 * the session tag with an "Uncategorized" catch-all pinned last; People
 * mode groups by author; Recent mode returns one flat unlabeled group.
 */
function groupWorkspaceSessions(
  rows: Session[],
  mode: GroupMode,
): SessionGroup[] {
  if (mode === 'recent') {
    return [{key: 'recent', label: null, icon: null, rows}];
  }
  const buckets = new Map<string, Session[]>();
  for (const row of rows) {
    const key =
      mode === 'tags' ? (row.tag ?? UNCATEGORIZED) : row.author;
    const bucket = buckets.get(key);
    if (bucket == null) {
      buckets.set(key, [row]);
    } else {
      bucket.push(row);
    }
  }
  const groups = Array.from(buckets.entries()).map(([key, bucketRows]) => ({
    key,
    label: key,
    icon: mode === 'tags' ? FolderIcon : UserIcon,
    rows: bucketRows,
  }));
  if (mode === 'tags') {
    // Uncategorized catch-all always sorts last.
    groups.sort((a, b) =>
      a.key === UNCATEGORIZED ? 1 : b.key === UNCATEGORIZED ? -1 : 0,
    );
  }
  return groups;
}

// ============= SIDEBAR PIECES =============

function RowStatusGlyph({status}: {status: RowStatus}) {
  const config = ROW_STATUS[status];
  const dot = <StatusDot variant={config.variant} label={config.label} />;
  return config.hasPulse ? <span className="scs-pulse">{dot}</span> : dot;
}

function SubAgentRow({task}: {task: SubAgentTask}) {
  const config = SUB_STATUS[task.status];
  const dot = <StatusDot variant={config.variant} label={config.label} />;
  return (
    <div style={styles.subRow}>
      <span style={styles.rowStatusCell}>
        {config.hasPulse ? <span className="scs-pulse">{dot}</span> : dot}
      </span>
      <Text
        type="supporting"
        color={task.title == null ? 'secondary' : undefined}
        maxLines={1}>
        {task.title ?? AGENT_TASK_FALLBACK}
      </Text>
    </div>
  );
}

function SessionRow({
  session,
  isActive,
  isExpanded,
  isMenuOpen,
  onSelect,
  onToggleExpand,
  onTogglePin,
  onArchive,
  onMenuOpenChange,
}: {
  session: Session;
  isActive: boolean;
  isExpanded: boolean;
  isMenuOpen: boolean;
  onSelect: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onTogglePin: (id: string) => void;
  onArchive: (id: string) => void;
  onMenuOpenChange: (id: string, isOpen: boolean) => void;
}) {
  const hasChildren = session.subAgents != null && session.subAgents.length > 0;
  return (
    <div>
      <div className="scs-row" data-active={isActive} style={styles.row}>
        <button
          type="button"
          className="scs-rowbtn"
          style={styles.rowMain}
          aria-current={isActive ? 'true' : undefined}
          onClick={() => onSelect(session.id)}>
          <span style={styles.rowStatusCell}>
            <RowStatusGlyph status={session.status} />
          </span>
          <span style={styles.rowBody}>
            <span style={styles.rowTitleLine}>
              {session.isPinned === true && (
                <span style={styles.rowGlyph} title="Pinned">
                  <Icon icon={PinIcon} size="xsm" color="tertiary" />
                </span>
              )}
              {session.isForked === true && (
                <span style={styles.rowGlyph} title="Forked from another session">
                  <Icon icon={GitBranchIcon} size="xsm" color="tertiary" />
                </span>
              )}
              <Text size="sm" maxLines={1}>
                {session.title}
              </Text>
            </span>
            <span style={styles.rowMeta}>
              <Avatar name={session.author} size={16} />
              <Text type="supporting" color="secondary" maxLines={1}>
                {session.timeAgo}
                {session.role != null ? \` · \${session.role}\` : ''}
              </Text>
            </span>
          </span>
        </button>
        {hasChildren && (
          <IconButton
            label={
              isExpanded
                ? \`Hide sub-agents of \${session.title}\`
                : \`Show sub-agents of \${session.title}\`
            }
            tooltip={isExpanded ? 'Hide sub-agents' : 'Show sub-agents'}
            icon={
              <span
                style={{
                  ...styles.chevron,
                  ...(isExpanded ? undefined : styles.chevronCollapsed),
                }}>
                <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
              </span>
            }
            variant="ghost"
            size="sm"
            onClick={() => onToggleExpand(session.id)}
          />
        )}
        <span className="scs-actions" data-open={isMenuOpen}>
          <MoreMenu
            label={\`Session actions: \${session.title}\`}
            size="sm"
            onOpenChange={isOpen => onMenuOpenChange(session.id, isOpen)}
            items={[
              {
                label: session.isPinned === true ? 'Unpin' : 'Pin',
                onClick: () => onTogglePin(session.id),
              },
              {label: 'Rename', onClick: () => {}},
              {label: 'Copy URL', onClick: () => {}},
              {label: 'Move to…', onClick: () => {}},
              {type: 'divider'},
              {label: 'Archive', onClick: () => onArchive(session.id)},
            ]}
          />
        </span>
      </div>
      {hasChildren && isExpanded && (
        <div style={styles.subList}>
          {session.subAgents?.map(task => (
            <SubAgentRow key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  );
}

// ============= PAGE =============

export default function AiChatSessionSidebarTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isNarrow = wrapWidth > 0 && wrapWidth <= 720;

  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [selectedId, setSelectedId] = useState('g-1');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [query, setQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sessionFilter, setSessionFilter] = useState<SessionFilter>('all');
  const [groupMode, setGroupMode] = useState<GroupMode>('tags');
  const [wsOrder, setWsOrder] = useState(['ws-atlas', 'ws-growth']);
  const [collapsedSections, setCollapsedSections] = useState<Set<string>>(
    () => new Set(['archived']),
  );
  const [expandedTags, setExpandedTags] = useState<Set<string>>(
    () => new Set(),
  );
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(
    () => new Set(['a-2']),
  );
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [draft, setDraft] = useState('');
  const [sentBySession, setSentBySession] = useState<Record<string, string[]>>(
    {},
  );

  // The inline demo stage narrows without firing media queries: fold the
  // sidebar into the icon rail whenever the page itself gets narrow. The
  // expand button still works below the breakpoint — the chat just squeezes.
  useEffect(() => {
    if (isNarrow) {
      setIsCollapsed(true);
    }
  }, [isNarrow]);

  const hasCustomFilter = sessionFilter !== 'all' || groupMode !== 'tags';
  const normalizedQuery = query.trim().toLowerCase();

  const sectionOrder = ['personal', ...wsOrder, 'shared', 'archived'];
  const visibleSectionIds = sectionOrder.filter(id => {
    const def = SECTION_DEFS[id];
    if (def == null) {
      return false;
    }
    switch (sessionFilter) {
      case 'personal':
        return def.kind === 'personal';
      case 'shared':
        return def.kind === 'shared';
      case 'workspace':
        return def.kind === 'workspace';
      default:
        return true;
    }
  });

  const sessionsFor = (sectionId: string) =>
    sessions.filter(
      session =>
        session.sectionId === sectionId &&
        (normalizedQuery.length === 0 ||
          session.title.toLowerCase().includes(normalizedQuery)),
    );

  const toggleSection = (id: string) => {
    setCollapsedSections(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const toggleTagGroup = (key: string) => {
    setExpandedTags(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  };

  const toggleSessionExpand = (id: string) => {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const togglePin = (id: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === id
          ? {...session, isPinned: session.isPinned !== true}
          : session,
      ),
    );
  };

  const archiveSession = (id: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.id === id
          ? {...session, sectionId: 'archived', tag: undefined, role: undefined}
          : session,
      ),
    );
  };

  const moveWorkspaceUp = (id: string) => {
    setWsOrder(prev => {
      const index = prev.indexOf(id);
      if (index <= 0) {
        return prev;
      }
      const next = [...prev];
      next[index] = next[index - 1];
      next[index - 1] = id;
      return next;
    });
  };

  const archiveWorkspace = (id: string) => {
    setSessions(prev =>
      prev.map(session =>
        session.sectionId === id
          ? {...session, sectionId: 'archived', tag: undefined}
          : session,
      ),
    );
    setWsOrder(prev => prev.filter(wsId => wsId !== id));
  };

  const handleMenuOpenChange = (id: string, isOpen: boolean) => {
    setOpenMenuId(prev => (isOpen ? id : prev === id ? null : prev));
  };

  const sendDraft = () => {
    const text = draft.trim();
    if (text.length === 0) {
      return;
    }
    setSentBySession(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), text],
    }));
    setDraft('');
  };

  const selectedSession = sessions.find(session => session.id === selectedId);
  const selectedSectionDef =
    selectedSession != null ? SECTION_DEFS[selectedSession.sectionId] : undefined;

  // ----- session rows renderer (shared by flat + grouped sections) -----

  const renderRows = (rows: Session[]) =>
    rows.map(session => (
      <SessionRow
        key={session.id}
        session={session}
        isActive={session.id === selectedId}
        isExpanded={expandedSessions.has(session.id)}
        isMenuOpen={openMenuId === session.id}
        onSelect={setSelectedId}
        onToggleExpand={toggleSessionExpand}
        onTogglePin={togglePin}
        onArchive={archiveSession}
        onMenuOpenChange={handleMenuOpenChange}
      />
    ));

  const renderSection = (sectionId: string) => {
    const def = SECTION_DEFS[sectionId];
    if (def == null) {
      return null;
    }
    const rows = sessionsFor(sectionId);
    if (normalizedQuery.length > 0 && rows.length === 0) {
      return null; // searching: hide sections with no matches
    }
    const isSectionCollapsed = collapsedSections.has(sectionId);
    const isWorkspace = def.kind === 'workspace';
    const wsIndex = wsOrder.indexOf(sectionId);

    let body = null;
    if (!isSectionCollapsed) {
      if (isWorkspace) {
        const groups = groupWorkspaceSessions(rows, groupMode);
        body = groups.map(group => {
          const groupKey = \`\${sectionId}:\${group.key}\`;
          const isTagExpanded = expandedTags.has(groupKey);
          const visibleRows = isTagExpanded
            ? group.rows
            : group.rows.slice(0, MAX_TAG_ROWS);
          const hiddenCount = group.rows.length - MAX_TAG_ROWS;
          return (
            <div key={groupKey}>
              {group.label != null && (
                <div style={styles.tagRow}>
                  {group.icon != null && (
                    <Icon icon={group.icon} size="xsm" color="tertiary" />
                  )}
                  <StackItem size="fill">
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {group.label}
                    </Text>
                  </StackItem>
                  <Text
                    type="supporting"
                    color="secondary"
                    hasTabularNumbers>
                    {group.rows.length}
                  </Text>
                </div>
              )}
              {renderRows(visibleRows)}
              {hiddenCount > 0 && (
                <div style={styles.moreBtnWrap}>
                  <Button
                    label={
                      isTagExpanded ? 'Show less' : \`\${hiddenCount} more…\`
                    }
                    variant="ghost"
                    size="sm"
                    onClick={() => toggleTagGroup(groupKey)}
                  />
                </div>
              )}
            </div>
          );
        });
      } else {
        body = <div>{renderRows(rows)}</div>;
      }
    }

    return (
      <div key={sectionId}>
        <div className="scs-head" style={styles.headRow}>
          <button
            type="button"
            className="scs-headbtn"
            style={styles.headBtn}
            aria-expanded={!isSectionCollapsed}
            onClick={() => toggleSection(sectionId)}>
            <span
              style={{
                ...styles.chevron,
                ...(isSectionCollapsed ? styles.chevronCollapsed : undefined),
              }}>
              <Icon icon={ChevronDownIcon} size="xsm" color="tertiary" />
            </span>
            <Icon icon={def.icon} size="xsm" color="tertiary" />
            <span style={styles.eyebrow}>{def.label}</span>
            {def.isCurrentContext === true && (
              <Tooltip content="You're here — the open chat lives in this workspace">
                <span style={styles.contextDot} aria-label="Current context" />
              </Tooltip>
            )}
            {def.isDefaultWorkspace === true && (
              <Tooltip content="Default workspace — new chats start here">
                <span style={styles.starMark} aria-label="Default workspace">
                  <Icon
                    icon={StarIcon}
                    size="xsm"
                    color="inherit"
                    fill="currentColor"
                  />
                </span>
              </Tooltip>
            )}
          </button>
          {isWorkspace && (
            <span className="scs-actions" data-open={openMenuId === \`head-\${sectionId}\`}>
              <MoreMenu
                label={\`Workspace actions: \${def.label}\`}
                size="sm"
                onOpenChange={isOpen =>
                  handleMenuOpenChange(\`head-\${sectionId}\`, isOpen)
                }
                items={[
                  {
                    label: 'Move up',
                    isDisabled: wsIndex <= 0,
                    onClick: () => moveWorkspaceUp(sectionId),
                  },
                  {label: 'Settings', onClick: () => {}},
                  {type: 'divider'},
                  {label: 'Archive', onClick: () => archiveWorkspace(sectionId)},
                ]}
              />
            </span>
          )}
        </div>
        {body}
      </div>
    );
  };

  // ----- sidebar (expanded) -----

  const sidebar = (
    <div style={styles.sidebar}>
      <div style={styles.sidebarTop}>
        <HStack gap={1} vAlign="center">
          <StackItem size="fill">
            <TextInput
              label="Search chats"
              isLabelHidden
              size="sm"
              placeholder="Search chats…"
              startIcon={SearchIcon}
              value={query}
              onChange={setQuery}
            />
          </StackItem>
          <span style={styles.filterWrap}>
            <IconButton
              label={
                hasCustomFilter
                  ? 'Filters (customized)'
                  : isFilterOpen
                    ? 'Hide filters'
                    : 'Show filters'
              }
              tooltip="Filters"
              icon={
                <Icon icon={SlidersHorizontalIcon} size="sm" color="inherit" />
              }
              variant="ghost"
              size="sm"
              onClick={() => setIsFilterOpen(prev => !prev)}
            />
            {hasCustomFilter && <span style={styles.filterDot} aria-hidden />}
          </span>
          <IconButton
            label="Collapse sidebar"
            tooltip="Collapse sidebar"
            icon={<Icon icon={PanelLeftCloseIcon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={() => setIsCollapsed(true)}
          />
        </HStack>
        {isFilterOpen && (
          <VStack gap={1}>
            <SegmentedControl
              label="Session filter"
              size="sm"
              layout="fill"
              value={sessionFilter}
              onChange={value => setSessionFilter(value as SessionFilter)}>
              <SegmentedControlItem value="all" label="All" />
              <SegmentedControlItem value="personal" label="Personal" />
              <SegmentedControlItem value="shared" label="Shared" />
              <SegmentedControlItem value="workspace" label="Workspace" />
            </SegmentedControl>
            <SegmentedControl
              label="Group sessions by"
              size="sm"
              layout="fill"
              value={groupMode}
              onChange={value => setGroupMode(value as GroupMode)}>
              <SegmentedControlItem value="recent" label="Recent" />
              <SegmentedControlItem value="people" label="People" />
              <SegmentedControlItem value="tags" label="Tags" />
            </SegmentedControl>
          </VStack>
        )}
      </div>
      <Divider />
      <div style={styles.sectionList}>
        {visibleSectionIds.map(sectionId => renderSection(sectionId))}
      </div>
      <div style={styles.footer}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="supporting" color="secondary" hasTabularNumbers>
              14 active · 6 archived
            </Text>
          </StackItem>
          <span className="scs-pulse">
            <StatusDot variant="accent" label="Sessions running" />
          </span>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            2 running
          </Text>
        </HStack>
      </div>
    </div>
  );

  // ----- sidebar (56px icon rail) -----

  const rail = (
    <div style={styles.rail}>
      <IconButton
        label="Expand sidebar"
        tooltip="Expand sidebar"
        icon={<Icon icon={PanelLeftOpenIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        onClick={() => setIsCollapsed(false)}
      />
      <Divider />
      {sectionOrder.map(sectionId => {
        const def = SECTION_DEFS[sectionId];
        if (def == null) {
          return null;
        }
        return (
          <IconButton
            key={sectionId}
            label={\`Open sidebar at \${def.label}\`}
            tooltip={def.label}
            icon={<Icon icon={def.icon} size="sm" color="inherit" />}
            variant="ghost"
            size="sm"
            onClick={() => {
              setIsCollapsed(false);
              setCollapsedSections(prev => {
                const next = new Set(prev);
                next.delete(sectionId);
                return next;
              });
            }}
          />
        );
      })}
      <div style={styles.railFoot}>
        <Tooltip content="2 sessions running">
          <span className="scs-pulse">
            <StatusDot variant="accent" label="2 sessions running" />
          </span>
        </Tooltip>
      </div>
    </div>
  );

  // ----- chat pane (modest transcript + composer; the sidebar is the star) -----

  const isActiveTranscript = selectedId === 'g-1';
  const sentMessages = sentBySession[selectedId] ?? [];

  const composer = (
    <VStack gap={2} style={styles.composerArea}>
      <div style={styles.composerCard}>
        <VStack gap={2}>
          <TextArea
            label={\`Message \${ASSISTANT_NAME}\`}
            isLabelHidden
            rows={2}
            placeholder={\`Message \${ASSISTANT_NAME}…\`}
            value={draft}
            onChange={setDraft}
          />
          <HStack gap={2} vAlign="center">
            <IconButton
              label="Attach file"
              tooltip="Attach file"
              icon={<Icon icon={PaperclipIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={() => {}}
            />
            <Text type="supporting" color="secondary">
              relay-mini-2 · {selectedSectionDef?.label ?? 'Personal'}
            </Text>
            <StackItem size="fill" />
            <Button
              label="Send"
              size="sm"
              icon={<Icon icon={SendIcon} size="sm" />}
              onClick={sendDraft}
            />
          </HStack>
        </VStack>
      </div>
    </VStack>
  );

  return (
    <div ref={wrapRef} className={SCOPE} style={styles.root}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        start={
          <LayoutPanel
            hasDivider
            width={isCollapsed ? 56 : 288}
            padding={0}
            isScrollable={false}
            label="Sessions">
            {isCollapsed ? rail : sidebar}
          </LayoutPanel>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.chatWrap}>
              <div style={styles.chatHeader}>
                <HStack gap={2} vAlign="center">
                  <StackItem size="fill">
                    <HStack gap={2} vAlign="center">
                      <Heading level={1} maxLines={1}>
                        {selectedSession?.title ?? 'New chat'}
                      </Heading>
                      {selectedSession?.status === 'processing' ? (
                        <span className="scs-pulse">
                          <StatusDot variant="accent" label="Agent running" />
                        </span>
                      ) : (
                        <StatusDot variant="neutral" label="Session idle" />
                      )}
                    </HStack>
                  </StackItem>
                  {!isNarrow && (
                    <Text type="supporting" color="secondary">
                      {selectedSectionDef?.label ?? 'Personal'} ·{' '}
                      {selectedSession?.timeAgo ?? 'Just now'}
                    </Text>
                  )}
                </HStack>
              </div>
              <div style={styles.chatBody}>
                <div style={styles.chatColumn}>
                  <ChatLayout composer={composer}>
                    <ChatMessageList density="balanced">
                      <ChatSystemMessage variant="divider">
                        Sunday, July 12
                      </ChatSystemMessage>
                      {isActiveTranscript ? (
                        <>
                          <ChatSystemMessage>
                            {ASSISTANT_NAME} can read experiment configs in the
                            Growth Pod workspace.
                          </ChatSystemMessage>
                          <ChatMessage sender="user">
                            <ChatMessageBubble
                              metadata={
                                <ChatMessageMetadata
                                  timestamp={
                                    <Timestamp
                                      value="2026-07-12T09:14:00"
                                      format="time"
                                    />
                                  }
                                />
                              }>
                              How is the onboarding drip experiment tracking
                              against the holdout after two weeks?
                            </ChatMessageBubble>
                          </ChatMessage>
                          <ChatMessage
                            sender="assistant"
                            avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                            <ChatMessageBubble name={ASSISTANT_NAME}>
                              Day-14 activation is 34.2% in the drip arm vs
                              29.8% in the holdout — a +4.4pt lift, and email
                              opt-outs are flat. The week-2 nudge drives most
                              of the gap; the day-3 checklist email barely
                              moves it.
                            </ChatMessageBubble>
                            <ChatMessageMetadata
                              timestamp={
                                <Timestamp
                                  value="2026-07-12T09:14:40"
                                  format="time"
                                />
                              }
                            />
                          </ChatMessage>
                          <ChatMessage
                            sender="assistant"
                            avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                            <HStack gap={2} vAlign="center">
                              <Spinner
                                size="sm"
                                aria-label="Assistant working"
                              />
                              <Text type="supporting" color="secondary">
                                Running the 14-day cohort comparison…
                              </Text>
                            </HStack>
                            <ChatMessageBubble variant="ghost">
                              Splitting the lift by acquisition channel now —
                              paid social looks like the outlier so far
                            </ChatMessageBubble>
                          </ChatMessage>
                        </>
                      ) : (
                        <>
                          <ChatSystemMessage>
                            History synced from “
                            {selectedSession?.title ?? 'this session'}”.
                          </ChatSystemMessage>
                          <ChatMessage
                            sender="assistant"
                            avatar={<Avatar name={ASSISTANT_NAME} size="small" />}>
                            <ChatMessageBubble name={ASSISTANT_NAME}>
                              Resuming “{selectedSession?.title ?? 'this session'}
                              ”. The full transcript is loaded — ask a follow-up
                              or pick up the last thread.
                            </ChatMessageBubble>
                          </ChatMessage>
                        </>
                      )}
                      {sentMessages.map((text, index) => (
                        <ChatMessage key={\`sent-\${index}\`} sender="user">
                          <ChatMessageBubble>{text}</ChatMessageBubble>
                        </ChatMessage>
                      ))}
                    </ChatMessageList>
                  </ChatLayout>
                </div>
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};