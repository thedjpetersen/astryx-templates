// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (per-scope tag lists with session
 *   counts, auto-tag condition rows, fixed match counts, and matching-
 *   session previews with static relative-time labels)
 * @output Two-pane session tag manager for an AI assistant ("Skylark"):
 *   left pane has a scope Selector (Personal / two workspaces) over the
 *   tag list — a pinned "Uncategorized" pseudo-tag, then color-dotted tags
 *   with session counts, a Wand glyph on auto-tagged ones, hover-reveal
 *   rename (inline TextInput) and delete (confirm AlertDialog) actions,
 *   and a "+" new-tag action; right pane is the selected tag's
 *   auto-tagging rule editor — AND-matched condition rows (type Selector +
 *   value TextInput with per-type placeholder, add/remove), a "Matches 7
 *   of last 50 sessions" preview line, and a preview list of matching
 *   session rows with StatusDots. Uncategorized shows an explanatory
 *   EmptyState instead of an editor.
 * @position Page template; emitted by `astryx template session-tag-manager`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * tag-count caption). Wide: LayoutPanel (300px, divider) hosts the scope
 * selector + tag list, LayoutContent hosts the rule editor. No chat
 * transcript: unlike ai-chat-session-sidebar this surface is about
 * *managing the taxonomy*, not navigating sessions.
 *
 * Responsive contract:
 * - The demo stage never resizes the viewport, so compactness is derived
 *   from the page's own width via ResizeObserver (useElementWidth), NOT
 *   from a viewport media query.
 * - >720px: two-pane Layout — 300px tag-list panel + editor column
 *   (maxWidth 760).
 * - <=720px: the panel folds into a bordered card stacked above the
 *   editor inside a single scrolling column; condition rows wrap the
 *   value input onto its own line so the type Selector never crushes it.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {
  CheckIcon,
  InboxIcon,
  PencilIcon,
  PlusIcon,
  Trash2Icon,
  WandSparklesIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  eyebrow: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  // Tag list rows: quiet by default, muted fill when selected; actions
  // are always in the DOM (no layout shift) and revealed on hover/select.
  tagRow: {
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-2)',
    paddingBlock: 'var(--spacing-1)',
    cursor: 'pointer',
  },
  tagRowSelected: {backgroundColor: 'var(--color-background-muted)'},
  rowActionsHidden: {visibility: 'hidden'},
  tagDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
    flexShrink: 0,
  },
  tagDotLarge: {
    width: 14,
    height: 14,
    borderRadius: '50%',
    flexShrink: 0,
  },
  tagNameCell: {minWidth: 0},
  // Editor column sits in LayoutContent; cap the line length.
  editorColumn: {maxWidth: 760},
  // Condition rows: fixed connector + type cells keep the inputs aligned.
  connectorCell: {width: 44, flexShrink: 0, textAlign: 'right'},
  conditionTypeCell: {width: 200, flexShrink: 0},
  conditionValueCell: {minWidth: 0},
  previewRow: {paddingBlock: 'var(--spacing-2)'},
  previewTitleCell: {minWidth: 0},
  // <=720px: the tag panel folds into a bordered card above the editor.
  stackedPanelCard: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
  },
};

// ============= RESPONSIVE =============
// The demo stage is ~1045-1075px inside a 1440px window, so viewport
// media queries never fire there; measure the page's own width instead.

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
// Deterministic fixtures: fixed counts, static relative-time labels,
// no clocks, no randomness.

const PRODUCT_NAME = 'Skylark';

type ScopeId = 'personal' | 'ws-atlas' | 'ws-harbor';

const SCOPE_OPTIONS: Array<{value: ScopeId; label: string}> = [
  {value: 'personal', label: 'Personal'},
  {value: 'ws-atlas', label: 'Atlas Platform workspace'},
  {value: 'ws-harbor', label: 'Harbor Infra workspace'},
];

type ConditionType = 'title' | 'message' | 'path' | 'tool';

const CONDITION_OPTIONS: Array<{value: ConditionType; label: string}> = [
  {value: 'title', label: 'Title contains'},
  {value: 'message', label: 'Message contains'},
  {value: 'path', label: 'Touches file path'},
  {value: 'tool', label: 'Uses tool'},
];

const CONDITION_PLACEHOLDER: Record<ConditionType, string> = {
  title: 'launch / deploy',
  message: 'rollback plan',
  path: 'app/api/',
  tool: 'bash',
};

interface TagCondition {
  id: string;
  type: ConditionType;
  value: string;
}

type PreviewStatus = 'running' | 'done' | 'review' | 'archived';

const PREVIEW_STATUS: Record<
  PreviewStatus,
  {variant: 'accent' | 'success' | 'warning' | 'neutral'; label: string}
> = {
  running: {variant: 'accent', label: 'Running'},
  done: {variant: 'success', label: 'Complete'},
  review: {variant: 'warning', label: 'Needs review'},
  archived: {variant: 'neutral', label: 'Archived'},
};

interface PreviewSession {
  id: string;
  title: string;
  status: PreviewStatus;
  time: string; // static relative-time label
  matched: string; // which condition matched, mono chip
}

interface SessionTag {
  id: string;
  name: string;
  color: string; // CSS color token
  sessionCount: number;
  isAuto: boolean;
  conditions: TagCondition[];
  matchCount: number; // of the last 50 sessions
  preview: PreviewSession[];
}

const UNCATEGORIZED_ID = 'uncategorized';

const INITIAL_UNCATEGORIZED: Record<ScopeId, number> = {
  personal: 12,
  'ws-atlas': 5,
  'ws-harbor': 9,
};

const INITIAL_TAGS: Record<ScopeId, SessionTag[]> = {
  personal: [
    {
      id: 'tag-deploys',
      name: 'deploys',
      color: 'var(--color-icon-blue)',
      sessionCount: 14,
      isAuto: true,
      conditions: [
        {id: 'c-dep-1', type: 'title', value: 'deploy'},
        {id: 'c-dep-2', type: 'tool', value: 'bash'},
      ],
      matchCount: 7,
      preview: [
        {
          id: 'pv-dep-1',
          title: 'Deploy checkout-service 2.14 to staging',
          status: 'running',
          time: '2 hours ago',
          matched: 'title ~ "deploy"',
        },
        {
          id: 'pv-dep-2',
          title: 'Rollback plan for the search deploy',
          status: 'done',
          time: 'yesterday',
          matched: 'title ~ "deploy"',
        },
        {
          id: 'pv-dep-3',
          title: 'deploy.yml matrix cleanup',
          status: 'review',
          time: '3 days ago',
          matched: 'tool = bash',
        },
        {
          id: 'pv-dep-4',
          title: 'Canary deploy for billing-api',
          status: 'archived',
          time: 'last week',
          matched: 'title ~ "deploy"',
        },
      ],
    },
    {
      id: 'tag-incidents',
      name: 'incident-review',
      color: 'var(--color-icon-red)',
      sessionCount: 9,
      isAuto: true,
      conditions: [
        {id: 'c-inc-1', type: 'title', value: 'incident'},
        {id: 'c-inc-2', type: 'message', value: 'postmortem'},
      ],
      matchCount: 4,
      preview: [
        {
          id: 'pv-inc-1',
          title: 'Incident 0712: gateway 502 spike',
          status: 'review',
          time: '5 hours ago',
          matched: 'title ~ "incident"',
        },
        {
          id: 'pv-inc-2',
          title: 'Draft postmortem for the cache stampede',
          status: 'done',
          time: 'yesterday',
          matched: 'message ~ "postmortem"',
        },
        {
          id: 'pv-inc-3',
          title: 'Incident timeline reconstruction',
          status: 'done',
          time: '4 days ago',
          matched: 'title ~ "incident"',
        },
        {
          id: 'pv-inc-4',
          title: 'Pager noise audit after incident week',
          status: 'archived',
          time: '2 weeks ago',
          matched: 'title ~ "incident"',
        },
      ],
    },
    {
      id: 'tag-code-review',
      name: 'code-review',
      color: 'var(--color-icon-purple)',
      sessionCount: 12,
      isAuto: true,
      conditions: [
        {id: 'c-rev-1', type: 'path', value: 'src/'},
        {id: 'c-rev-2', type: 'tool', value: 'edit'},
      ],
      matchCount: 11,
      preview: [
        {
          id: 'pv-rev-1',
          title: 'Review pass on src/checkout/tax.ts',
          status: 'running',
          time: '40 minutes ago',
          matched: 'path ~ src/',
        },
        {
          id: 'pv-rev-2',
          title: 'Nit sweep before the release branch',
          status: 'done',
          time: 'yesterday',
          matched: 'tool = edit',
        },
        {
          id: 'pv-rev-3',
          title: 'Refactor: extract retry helper',
          status: 'review',
          time: '2 days ago',
          matched: 'path ~ src/',
        },
        {
          id: 'pv-rev-4',
          title: 'Type-narrowing cleanup in src/api',
          status: 'done',
          time: '6 days ago',
          matched: 'path ~ src/',
        },
      ],
    },
    {
      id: 'tag-infra-cost',
      name: 'infra-cost',
      color: 'var(--color-icon-orange)',
      sessionCount: 6,
      isAuto: true,
      conditions: [{id: 'c-cost-1', type: 'message', value: 'budget'}],
      matchCount: 3,
      preview: [
        {
          id: 'pv-cost-1',
          title: 'July compute budget check-in',
          status: 'done',
          time: '3 hours ago',
          matched: 'message ~ "budget"',
        },
        {
          id: 'pv-cost-2',
          title: 'Right-size the staging node pool',
          status: 'review',
          time: '2 days ago',
          matched: 'message ~ "budget"',
        },
        {
          id: 'pv-cost-3',
          title: 'Egress spike investigation',
          status: 'archived',
          time: 'last week',
          matched: 'message ~ "budget"',
        },
      ],
    },
    {
      id: 'tag-research',
      name: 'research',
      color: 'var(--color-icon-teal)',
      sessionCount: 7,
      isAuto: false,
      conditions: [],
      matchCount: 0,
      preview: [],
    },
    {
      id: 'tag-onboarding',
      name: 'onboarding',
      color: 'var(--color-icon-green)',
      sessionCount: 4,
      isAuto: false,
      conditions: [],
      matchCount: 0,
      preview: [],
    },
    {
      id: 'tag-writing',
      name: 'writing',
      color: 'var(--color-icon-pink)',
      sessionCount: 5,
      isAuto: false,
      conditions: [],
      matchCount: 0,
      preview: [],
    },
    {
      id: 'tag-experiments',
      name: 'experiments',
      color: 'var(--color-icon-yellow)',
      sessionCount: 8,
      isAuto: true,
      conditions: [
        {id: 'c-exp-1', type: 'title', value: 'experiment'},
        {id: 'c-exp-2', type: 'tool', value: 'ipython'},
      ],
      matchCount: 5,
      preview: [
        {
          id: 'pv-exp-1',
          title: 'Experiment: ranker weight sweep',
          status: 'running',
          time: '1 hour ago',
          matched: 'tool = ipython',
        },
        {
          id: 'pv-exp-2',
          title: 'A/B readout for the new composer',
          status: 'done',
          time: 'yesterday',
          matched: 'title ~ "experiment"',
        },
        {
          id: 'pv-exp-3',
          title: 'Experiment cleanup: stale flags',
          status: 'review',
          time: '3 days ago',
          matched: 'title ~ "experiment"',
        },
        {
          id: 'pv-exp-4',
          title: 'Notebook: retention cohort slices',
          status: 'archived',
          time: '2 weeks ago',
          matched: 'tool = ipython',
        },
      ],
    },
  ],
  'ws-atlas': [
    {
      id: 'tag-platform-api',
      name: 'platform-api',
      color: 'var(--color-icon-blue)',
      sessionCount: 11,
      isAuto: true,
      conditions: [
        {id: 'c-api-1', type: 'path', value: 'services/gateway/'},
        {id: 'c-api-2', type: 'title', value: 'api'},
      ],
      matchCount: 6,
      preview: [
        {
          id: 'pv-api-1',
          title: 'Gateway API rate-limit rework',
          status: 'running',
          time: '30 minutes ago',
          matched: 'path ~ services/gateway/',
        },
        {
          id: 'pv-api-2',
          title: 'Deprecate v1 pagination API',
          status: 'review',
          time: 'yesterday',
          matched: 'title ~ "api"',
        },
        {
          id: 'pv-api-3',
          title: 'API error taxonomy proposal',
          status: 'done',
          time: '4 days ago',
          matched: 'title ~ "api"',
        },
        {
          id: 'pv-api-4',
          title: 'Gateway timeout budget tuning',
          status: 'archived',
          time: 'last week',
          matched: 'path ~ services/gateway/',
        },
      ],
    },
    {
      id: 'tag-migrations',
      name: 'migrations',
      color: 'var(--color-icon-orange)',
      sessionCount: 5,
      isAuto: false,
      conditions: [],
      matchCount: 0,
      preview: [],
    },
    {
      id: 'tag-oncall',
      name: 'oncall',
      color: 'var(--color-icon-red)',
      sessionCount: 8,
      isAuto: false,
      conditions: [],
      matchCount: 0,
      preview: [],
    },
    {
      id: 'tag-docs',
      name: 'docs',
      color: 'var(--color-icon-green)',
      sessionCount: 3,
      isAuto: false,
      conditions: [],
      matchCount: 0,
      preview: [],
    },
  ],
  'ws-harbor': [
    {
      id: 'tag-capacity',
      name: 'capacity-plan',
      color: 'var(--color-icon-cyan)',
      sessionCount: 7,
      isAuto: true,
      conditions: [
        {id: 'c-cap-1', type: 'message', value: 'forecast'},
        {id: 'c-cap-2', type: 'tool', value: 'ipython'},
      ],
      matchCount: 4,
      preview: [
        {
          id: 'pv-cap-1',
          title: 'Q3 storage forecast refresh',
          status: 'running',
          time: '2 hours ago',
          matched: 'message ~ "forecast"',
        },
        {
          id: 'pv-cap-2',
          title: 'Rack headroom model for eu-west',
          status: 'done',
          time: '2 days ago',
          matched: 'tool = ipython',
        },
        {
          id: 'pv-cap-3',
          title: 'Forecast drift vs. actuals, June',
          status: 'review',
          time: '5 days ago',
          matched: 'message ~ "forecast"',
        },
        {
          id: 'pv-cap-4',
          title: 'GPU pool waitlist triage',
          status: 'archived',
          time: '3 weeks ago',
          matched: 'tool = ipython',
        },
      ],
    },
    {
      id: 'tag-vendor',
      name: 'vendor-review',
      color: 'var(--color-icon-purple)',
      sessionCount: 4,
      isAuto: false,
      conditions: [],
      matchCount: 0,
      preview: [],
    },
    {
      id: 'tag-runbooks',
      name: 'runbooks',
      color: 'var(--color-icon-teal)',
      sessionCount: 6,
      isAuto: false,
      conditions: [],
      matchCount: 0,
      preview: [],
    },
  ],
};

// ============= TAG ROW =============

function TagRow({
  tag,
  isSelected,
  isHovered,
  isRenaming,
  renameDraft,
  onSelect,
  onHover,
  onStartRename,
  onRenameDraft,
  onCommitRename,
  onCancelRename,
  onRequestDelete,
}: {
  tag: SessionTag;
  isSelected: boolean;
  isHovered: boolean;
  isRenaming: boolean;
  renameDraft: string;
  onSelect: (id: string) => void;
  onHover: (id: string | null) => void;
  onStartRename: (tag: SessionTag) => void;
  onRenameDraft: (value: string) => void;
  onCommitRename: () => void;
  onCancelRename: () => void;
  onRequestDelete: (id: string) => void;
}) {
  const showActions = isHovered || isSelected;

  if (isRenaming) {
    return (
      <HStack
        gap={2}
        vAlign="center"
        style={{...styles.tagRow, ...styles.tagRowSelected}}>
        <span style={{...styles.tagDot, backgroundColor: tag.color}} aria-hidden />
        <StackItem size="fill" style={styles.tagNameCell}>
          <TextInput
            label={`Rename tag ${tag.name}`}
            isLabelHidden
            size="sm"
            width="100%"
            value={renameDraft}
            hasAutoFocus
            onChange={onRenameDraft}
            onEnter={onCommitRename}
            onKeyDown={event => {
              if (event.key === 'Escape') {
                onCancelRename();
              }
            }}
          />
        </StackItem>
        <IconButton
          label={`Save new name for ${tag.name}`}
          tooltip="Save"
          icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          onClick={onCommitRename}
        />
        <IconButton
          label={`Cancel renaming ${tag.name}`}
          tooltip="Cancel"
          icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          onClick={onCancelRename}
        />
      </HStack>
    );
  }

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      onSelect(tag.id);
    }
  };

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={isSelected}
      style={
        isSelected ? {...styles.tagRow, ...styles.tagRowSelected} : styles.tagRow
      }
      onClick={() => onSelect(tag.id)}
      onKeyDown={handleKeyDown}
      onMouseEnter={() => onHover(tag.id)}
      onMouseLeave={() => onHover(null)}>
      <HStack gap={2} vAlign="center">
        <span style={{...styles.tagDot, backgroundColor: tag.color}} aria-hidden />
        <StackItem size="fill" style={styles.tagNameCell}>
          <Text size="sm" maxLines={1}>
            {tag.name}
          </Text>
        </StackItem>
        {tag.isAuto && (
          <Icon icon={WandSparklesIcon} size="sm" color="secondary" />
        )}
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {tag.sessionCount}
        </Text>
        <div style={showActions ? undefined : styles.rowActionsHidden}>
          <HStack gap={0} vAlign="center">
            <IconButton
              label={`Rename tag ${tag.name}`}
              tooltip="Rename"
              icon={<Icon icon={PencilIcon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={event => {
                event.stopPropagation();
                onStartRename(tag);
              }}
            />
            <IconButton
              label={`Delete tag ${tag.name}`}
              tooltip="Delete"
              icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
              variant="ghost"
              size="sm"
              onClick={event => {
                event.stopPropagation();
                onRequestDelete(tag.id);
              }}
            />
          </HStack>
        </div>
      </HStack>
    </div>
  );
}

// ============= PAGE =============

export default function SessionTagManagerTemplate() {
  const [scope, setScope] = useState<ScopeId>('personal');
  const [tagsByScope, setTagsByScope] = useState(INITIAL_TAGS);
  const [uncategorizedByScope, setUncategorizedByScope] = useState(
    INITIAL_UNCATEGORIZED,
  );
  const [selectedTagId, setSelectedTagId] = useState<string>('tag-deploys');
  const [hoveredTagId, setHoveredTagId] = useState<string | null>(null);
  const [renamingTagId, setRenamingTagId] = useState<string | null>(null);
  const [renameDraft, setRenameDraft] = useState('');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  // Deterministic id counters for new tags / condition rows.
  const [nextTagId, setNextTagId] = useState(1);
  const [nextConditionId, setNextConditionId] = useState(1);

  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 720;

  const tags = tagsByScope[scope];
  const uncategorizedCount = uncategorizedByScope[scope];
  const selectedTag = tags.find(tag => tag.id === selectedTagId) ?? null;
  const deleteTarget = tags.find(tag => tag.id === deleteTargetId) ?? null;
  const autoCount = tags.filter(tag => tag.isAuto).length;

  const changeScope = (value: string) => {
    const nextScope = value as ScopeId;
    setScope(nextScope);
    setSelectedTagId(tagsByScope[nextScope][0]?.id ?? UNCATEGORIZED_ID);
    setHoveredTagId(null);
    setRenamingTagId(null);
  };

  const selectTag = (id: string) => {
    setSelectedTagId(id);
    setRenamingTagId(null);
  };

  const updateTag = (id: string, patch: (tag: SessionTag) => SessionTag) => {
    setTagsByScope(prev => ({
      ...prev,
      [scope]: prev[scope].map(tag => (tag.id === id ? patch(tag) : tag)),
    }));
  };

  const startRename = (tag: SessionTag) => {
    setRenamingTagId(tag.id);
    setRenameDraft(tag.name);
  };

  const commitRename = () => {
    const name = renameDraft.trim();
    if (renamingTagId != null && name.length > 0) {
      updateTag(renamingTagId, tag => ({...tag, name}));
    }
    setRenamingTagId(null);
  };

  const cancelRename = () => {
    setRenamingTagId(null);
  };

  // Deleting a tag folds its sessions back into Uncategorized.
  const confirmDelete = () => {
    if (deleteTarget == null) {
      setDeleteTargetId(null);
      return;
    }
    setUncategorizedByScope(prev => ({
      ...prev,
      [scope]: prev[scope] + deleteTarget.sessionCount,
    }));
    setTagsByScope(prev => ({
      ...prev,
      [scope]: prev[scope].filter(tag => tag.id !== deleteTarget.id),
    }));
    if (selectedTagId === deleteTarget.id) {
      setSelectedTagId(UNCATEGORIZED_ID);
    }
    setDeleteTargetId(null);
  };

  const addTag = () => {
    const id = `tag-new-${nextTagId}`;
    const newTag: SessionTag = {
      id,
      name: `new-tag-${nextTagId}`,
      color: 'var(--color-icon-gray)',
      sessionCount: 0,
      isAuto: false,
      conditions: [],
      matchCount: 0,
      preview: [],
    };
    setTagsByScope(prev => ({...prev, [scope]: [...prev[scope], newTag]}));
    setNextTagId(prev => prev + 1);
    setSelectedTagId(id);
    setRenamingTagId(id);
    setRenameDraft(newTag.name);
  };

  const addCondition = (tagId: string) => {
    const conditionId = `c-added-${nextConditionId}`;
    setNextConditionId(prev => prev + 1);
    updateTag(tagId, tag => ({
      ...tag,
      isAuto: true,
      conditions: [
        ...tag.conditions,
        {id: conditionId, type: 'title', value: ''},
      ],
    }));
  };

  const removeCondition = (tagId: string, conditionId: string) => {
    updateTag(tagId, tag => {
      const conditions = tag.conditions.filter(
        condition => condition.id !== conditionId,
      );
      return {...tag, conditions, isAuto: conditions.length > 0};
    });
  };

  const updateCondition = (
    tagId: string,
    conditionId: string,
    patch: Partial<Omit<TagCondition, 'id'>>,
  ) => {
    updateTag(tagId, tag => ({
      ...tag,
      conditions: tag.conditions.map(condition =>
        condition.id === conditionId ? {...condition, ...patch} : condition,
      ),
    }));
  };

  // ----- Left pane: scope + tag list -----

  const tagListPane = (
    <VStack gap={3}>
      <Selector
        label="Tag scope"
        isLabelHidden
        size="sm"
        options={SCOPE_OPTIONS}
        value={scope}
        onChange={changeScope}
      />
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <div style={styles.eyebrow}>Tags · {tags.length}</div>
        </StackItem>
        <IconButton
          label="New tag"
          tooltip="New tag"
          icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
          variant="ghost"
          size="sm"
          onClick={addTag}
        />
      </HStack>

      {/* Pinned pseudo-tag: catch-all, no rename/delete/rules. */}
      <div
        role="button"
        tabIndex={0}
        aria-pressed={selectedTagId === UNCATEGORIZED_ID}
        style={
          selectedTagId === UNCATEGORIZED_ID
            ? {...styles.tagRow, ...styles.tagRowSelected}
            : styles.tagRow
        }
        onClick={() => selectTag(UNCATEGORIZED_ID)}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            selectTag(UNCATEGORIZED_ID);
          }
        }}>
        <HStack gap={2} vAlign="center">
          <Icon icon={InboxIcon} size="sm" color="secondary" />
          <StackItem size="fill" style={styles.tagNameCell}>
            <Text size="sm" color="secondary" maxLines={1}>
              Uncategorized
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {uncategorizedCount}
          </Text>
        </HStack>
      </div>
      <Divider />

      <VStack gap={0}>
        {tags.map(tag => (
          <TagRow
            key={tag.id}
            tag={tag}
            isSelected={tag.id === selectedTagId}
            isHovered={tag.id === hoveredTagId}
            isRenaming={tag.id === renamingTagId}
            renameDraft={renameDraft}
            onSelect={selectTag}
            onHover={setHoveredTagId}
            onStartRename={startRename}
            onRenameDraft={setRenameDraft}
            onCommitRename={commitRename}
            onCancelRename={cancelRename}
            onRequestDelete={setDeleteTargetId}
          />
        ))}
      </VStack>

      <HStack gap={1} vAlign="center">
        <Icon icon={WandSparklesIcon} size="sm" color="secondary" />
        <Text type="supporting" color="secondary">
          Auto-tagged by rules
        </Text>
      </HStack>
    </VStack>
  );

  // ----- Right pane: rule editor / empty states -----

  const uncategorizedEditor = (
    <EmptyState
      icon={<Icon icon={InboxIcon} size="lg" color="secondary" />}
      title="Uncategorized is the catch-all"
      description={`Sessions that match no tag rules land here — ${uncategorizedCount} in this scope right now. It has no rules of its own. Pick a tag to edit its conditions, or create a new tag to start routing sessions automatically.`}
      actions={<Button label="New tag" variant="secondary" onClick={addTag} />}
    />
  );

  const ruleEditor =
    selectedTag == null ? null : (
      <VStack gap={4} style={styles.editorColumn}>
        {/* Tag header */}
        <HStack gap={3} vAlign="center">
          <span
            style={{...styles.tagDotLarge, backgroundColor: selectedTag.color}}
            aria-hidden
          />
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={2}>{selectedTag.name}</Heading>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {selectedTag.sessionCount} tagged session
                {selectedTag.sessionCount === 1 ? '' : 's'} · {PRODUCT_NAME}{' '}
                {scope === 'personal' ? 'personal scope' : 'workspace scope'}
              </Text>
            </VStack>
          </StackItem>
          <Badge
            label={selectedTag.isAuto ? 'Auto-tagging on' : 'Manual'}
            variant={selectedTag.isAuto ? 'info' : 'neutral'}
          />
        </HStack>

        {/* Conditions */}
        <VStack gap={2}>
          <div style={styles.eyebrow}>Auto-tag rules · all must match</div>
          {selectedTag.conditions.length === 0 ? (
            <Text type="supporting" color="secondary">
              This tag is applied manually. Add a condition to start tagging
              matching sessions automatically.
            </Text>
          ) : (
            <VStack gap={2}>
              {selectedTag.conditions.map((condition, index) => (
                <HStack
                  key={condition.id}
                  gap={2}
                  vAlign="center"
                  style={isCompact ? {flexWrap: 'wrap'} : undefined}>
                  <div style={styles.connectorCell}>
                    <Text type="supporting" color="secondary">
                      {index === 0 ? 'When' : 'AND'}
                    </Text>
                  </div>
                  <div style={styles.conditionTypeCell}>
                    <Selector
                      label={`Condition ${index + 1} type`}
                      isLabelHidden
                      size="sm"
                      width="100%"
                      options={CONDITION_OPTIONS}
                      value={condition.type}
                      onChange={value =>
                        updateCondition(selectedTag.id, condition.id, {
                          type: value as ConditionType,
                          value: '',
                        })
                      }
                    />
                  </div>
                  <StackItem size="fill" style={styles.conditionValueCell}>
                    <TextInput
                      label={`Condition ${index + 1} value`}
                      isLabelHidden
                      size="sm"
                      width="100%"
                      value={condition.value}
                      placeholder={CONDITION_PLACEHOLDER[condition.type]}
                      onChange={value =>
                        updateCondition(selectedTag.id, condition.id, {value})
                      }
                    />
                  </StackItem>
                  <IconButton
                    label={`Remove condition ${index + 1}`}
                    tooltip="Remove condition"
                    icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                    variant="ghost"
                    size="sm"
                    onClick={() =>
                      removeCondition(selectedTag.id, condition.id)
                    }
                  />
                </HStack>
              ))}
            </VStack>
          )}
          <HStack gap={2} vAlign="center">
            <Button
              label="Add condition"
              variant="ghost"
              size="sm"
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
              onClick={() => addCondition(selectedTag.id)}
            />
          </HStack>
        </VStack>

        {/* Match preview */}
        {selectedTag.conditions.length > 0 && (
          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <Icon icon={WandSparklesIcon} size="sm" color="secondary" />
              <Text type="supporting" hasTabularNumbers>
                Matches {selectedTag.matchCount} of last 50 sessions
              </Text>
            </HStack>
            {selectedTag.preview.length > 0 && (
              <VStack gap={2}>
                <div style={styles.eyebrow}>Matching sessions</div>
                <Card padding={3}>
                  <VStack gap={0}>
                    {selectedTag.preview.map((session, index) => (
                      <VStack key={session.id} gap={0}>
                        <HStack
                          gap={2}
                          vAlign="center"
                          style={styles.previewRow}>
                          <StatusDot
                            variant={PREVIEW_STATUS[session.status].variant}
                            label={PREVIEW_STATUS[session.status].label}
                            isPulsing={session.status === 'running'}
                          />
                          <StackItem size="fill" style={styles.previewTitleCell}>
                            <Text size="sm" maxLines={1}>
                              {session.title}
                            </Text>
                          </StackItem>
                          {!isCompact && (
                            <Text type="code" size="sm" color="secondary">
                              {session.matched}
                            </Text>
                          )}
                          <Text type="supporting" color="secondary">
                            {session.time}
                          </Text>
                        </HStack>
                        {index < selectedTag.preview.length - 1 && <Divider />}
                      </VStack>
                    ))}
                  </VStack>
                </Card>
                <Text type="supporting" color="secondary">
                  ~ Estimated — matches are re-scored when a session ends.
                </Text>
              </VStack>
            )}
          </VStack>
        )}
      </VStack>
    );

  const editorPane =
    selectedTagId === UNCATEGORIZED_ID || selectedTag == null
      ? uncategorizedEditor
      : ruleEditor;

  const header = (
    <LayoutHeader hasDivider>
      <HStack gap={3} vAlign="center">
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <Heading level={1}>Session tags</Heading>
            {!isCompact && (
              <Text type="supporting" color="secondary">
                Group and auto-route {PRODUCT_NAME} sessions
              </Text>
            )}
          </HStack>
        </StackItem>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {tags.length} tags · {autoCount} auto-tagged
        </Text>
      </HStack>
    </LayoutHeader>
  );

  return (
    <div ref={wrapRef} style={{height: '100%'}}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel hasDivider width={300} label="Tag list">
              {tagListPane}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent>
            {isCompact ? (
              <VStack gap={4}>
                <div style={styles.stackedPanelCard}>{tagListPane}</div>
                {editorPane}
              </VStack>
            ) : (
              editorPane
            )}
          </LayoutContent>
        }
      />
      <AlertDialog
        isOpen={deleteTarget != null}
        onOpenChange={isOpen => {
          if (!isOpen) {
            setDeleteTargetId(null);
          }
        }}
        title={`Delete tag "${deleteTarget?.name ?? ''}"?`}
        description={`${deleteTarget?.sessionCount ?? 0} tagged sessions keep their history and move to Uncategorized. Auto-tag conditions for this tag are deleted. This cannot be undone.`}
        actionLabel="Delete tag"
        onAction={confirmDelete}
      />
    </div>
  );
}
