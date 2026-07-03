// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs "Engineering
 *   day-one setup" employee-lifecycle workflow (node graph, per-node config
 *   fields, 30-day run stats, last-5 run history with fixed ISO timestamps
 *   in June/July 2026). No clocks, no randomness, no network media.
 * @output Workflow Studio (Automation Canvas) — a Rippling-style
 *   workforce-automation builder. A left palette rail of trigger /
 *   condition / action node types grouped by pillar app (HR, IT, Finance,
 *   Comms) with a search filter; a pannable, zoomable canvas rendering the
 *   live workflow as connected node tiles (employee-starts trigger →
 *   department condition with labeled Yes/No branches → four fan-out
 *   actions: create GitHub account, add to Slack channels, order laptop,
 *   schedule buddy lunch; plus a dashed parallel badge-provisioning branch
 *   and a join node) over an SVG bezier edge layer with typed connector
 *   labels; a red validation badge on the misconfigured laptop node; a
 *   right config panel for the selected node (editable fields, error
 *   FieldStatus, test-run controls, node stats); zoom controls + issues
 *   chip in the canvas toolbar; and a pinned run-history strip (last 5
 *   runs — success / failed / running / skipped; the failed run
 *   deep-links to its failing node).
 * @position Page template; emitted by `astryx template workflow-studio-canvas`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (workflow title, Live/version badges, Test + Publish actions)
 *   | palette rail 264 (search + grouped node-type tiles, scrolls)
 *   | content (canvas toolbar, two-axis canvas scroller with background
 *   pan, pinned run-history strip) | end config panel 340 (scrolls).
 * Container policy: app-shell archetype — frame rows and panels only; no
 *   Cards. Canvas node tiles are absolutely positioned styled buttons,
 *   palette tiles are styled buttons, run chips are styled buttons.
 * Color policy: token-pure everywhere; the only literals are the
 *   `light-dark()` fallback pairs on the data-viz categorical tokens used
 *   for pillar chips, node rails, and typed edges (the demo does not
 *   inject `--color-data-categorical-*`), plus the standing red pair for
 *   error edges/badges.
 *
 * Responsive contract:
 * - > 1280px: full three-region frame.
 * - <= 1280px: the config panel is dropped (node selection still
 *   highlights on canvas; the validation chip stays in the toolbar).
 * - <= 960px: the palette rail is dropped; the canvas + run strip remain.
 *   The header row wraps instead of clipping the action buttons.
 * - The canvas scroller is the one deliberate two-axis scroll region
 *   (documented pan + zoom); palette and config panel scroll vertically,
 *   the run strip scrolls horizontally on narrow viewports. `minHeight: 0`
 *   is held down every flex chain.
 */

import {useMemo, useState, type CSSProperties, type PointerEvent as ReactPointerEvent, useRef} from 'react';
import {
  AlertTriangleIcon,
  ArrowLeftIcon,
  BadgeCheckIcon,
  BanknoteIcon,
  CalendarClockIcon,
  CheckCircle2Icon,
  CreditCardIcon,
  FilterIcon,
  FlagIcon,
  GitBranchIcon,
  GitPullRequestIcon,
  HashIcon,
  IdCardIcon,
  LandmarkIcon,
  LaptopIcon,
  MailIcon,
  MaximizeIcon,
  MegaphoneIcon,
  MinusCircleIcon,
  MinusIcon,
  PlayIcon,
  PlusIcon,
  RocketIcon,
  SearchIcon,
  UserMinusIcon,
  UserPlusIcon,
  UtensilsIcon,
  XCircleIcon,
  XIcon,
  ZapIcon,
  type LucideIcon,
} from 'lucide-react';
import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Field} from '@astryxdesign/core/Field';
import {FieldStatus} from '@astryxdesign/core/FieldStatus';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MetadataList, MetadataListItem} from '@astryxdesign/core/MetadataList';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Switch} from '@astryxdesign/core/Switch';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// GEOMETRY — the node layout and the SVG edge layer share these; every px on
// the canvas derives from the same unscaled unit grid so zoom keeps nodes,
// edges, and labels registered.
// ---------------------------------------------------------------------------

const NODE_W = 236;
const NODE_H = 96;
// 72 fits the end tiles' three text rows (kind row + title + stats); at 56
// the title span (overflow: hidden) flex-shrinks to zero height.
const END_H = 72;
const CANVAS_W = 1264;
const CANVAS_H = 712;
const ZOOM_LEVELS = [0.5, 0.67, 0.8, 1, 1.25, 1.5] as const;

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  headerRow: {padding: 'var(--spacing-2) var(--spacing-4)'},
  headerTitleBlock: {minWidth: 0},
  // Palette rail --------------------------------------------------------
  paletteFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  paletteSearch: {flexShrink: 0, padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)'},
  paletteScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: '0 var(--spacing-3) var(--spacing-3)'},
  paletteGroupHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-1) var(--spacing-1)',
  },
  paletteTile: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    padding: '6px 8px',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    background: 'var(--color-background-surface)',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'grab',
  },
  paletteGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    borderRadius: 8,
    flexShrink: 0,
  },
  paletteTileText: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column'},
  paletteHint: {flexShrink: 0, padding: 'var(--spacing-2) var(--spacing-3)'},
  // Canvas region --------------------------------------------------------
  contentFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  canvasToolbar: {
    flexShrink: 0,
    padding: 'var(--spacing-2) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  zoomReadout: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    minWidth: 40,
    textAlign: 'center',
  },
  issueChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 10px',
    borderRadius: 999,
    border: '1px solid light-dark(#DC2626, #F87171)',
    color: 'light-dark(#DC2626, #F87171)',
    background: 'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))',
    font: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    cursor: 'pointer',
  },
  cleanChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontSize: 12,
    color: 'var(--color-text-secondary)',
  },
  // The one deliberate two-axis scroll region on the page; background drag
  // pans it (cursor flips to grabbing while a pan is live). A subtle token
  // dot-grid marks the surface as a canvas.
  canvasScroll: {
    flex: 1,
    minHeight: 0,
    position: 'relative',
    overflow: 'auto',
    cursor: 'grab',
    touchAction: 'pan-x pan-y',
    backgroundColor: 'var(--color-background-body)',
  },
  canvasScrollPanning: {cursor: 'grabbing', userSelect: 'none'},
  // Zoom wrapper: sized to CANVAS_* × zoom so the scroller's extent tracks
  // the scaled surface; the surface itself scales from the top-left corner.
  canvasZoomBox: {position: 'relative', overflow: 'hidden'},
  canvasSurface: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: CANVAS_W,
    height: CANVAS_H,
    transformOrigin: '0 0',
    backgroundImage:
      'radial-gradient(circle, var(--color-border) 1px, transparent 1px)',
    backgroundSize: '24px 24px',
  },
  edgeLayer: {position: 'absolute', inset: 0, pointerEvents: 'none'},
  edgeLabel: {
    position: 'absolute',
    transform: 'translate(-50%, -50%)',
    padding: '1px 8px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    border: '1px solid var(--color-border)',
    background: 'var(--color-background-surface)',
    pointerEvents: 'none',
  },
  // Canvas node tiles — plain buttons styled as tiles so the whole node is
  // one click target (no nested interactive containers).
  node: {
    position: 'absolute',
    width: NODE_W,
    height: NODE_H,
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
    padding: '8px 10px',
    border: 'var(--border-width) solid var(--color-border)',
    borderLeftWidth: 4,
    borderRadius: 10,
    background: 'var(--color-background-surface)',
    boxShadow: 'var(--shadow-low, 0 1px 2px rgba(0, 0, 0, 0.08))',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
  },
  nodeEnd: {
    height: END_H,
    justifyContent: 'center',
    borderStyle: 'dashed',
    borderLeftStyle: 'solid',
    background: 'var(--color-background-muted)',
    boxShadow: 'none',
  },
  nodeSelected: {boxShadow: 'inset 0 0 0 1px var(--color-accent), 0 0 0 2px var(--color-accent)'},
  nodeHeaderRow: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  nodeKindTag: {
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    whiteSpace: 'nowrap',
  },
  nodeAppTag: {
    marginInlineStart: 'auto',
    fontSize: 10,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
  },
  nodeTitle: {
    fontSize: 13,
    fontWeight: 600,
    lineHeight: 1.25,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nodeSummary: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  nodeStats: {
    marginTop: 'auto',
    fontSize: 10.5,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  },
  // Validation badge — anchored to the tile's top-right corner glyph-style.
  nodeErrorBadge: {
    position: 'absolute',
    top: -9,
    right: -9,
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 20,
    height: 20,
    borderRadius: '50%',
    background: 'light-dark(#DC2626, #F87171)',
    color: 'light-dark(#FFFFFF, #1B1B1F)',
    fontSize: 11,
    fontWeight: 700,
    boxShadow: '0 0 0 2px var(--color-background-body)',
  },
  // Run-history strip ----------------------------------------------------
  runStrip: {
    flexShrink: 0,
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: 'var(--spacing-2) var(--spacing-4)',
    background: 'var(--color-background-surface)',
  },
  runStripScroll: {display: 'flex', gap: 'var(--spacing-2)', overflowX: 'auto', paddingBottom: 2},
  runChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '6px 10px',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    background: 'var(--color-background-body)',
    font: 'inherit',
    color: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  runId: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11,
    color: 'var(--color-text-secondary)',
  },
  runMeta: {fontSize: 11, color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  // Config panel ---------------------------------------------------------
  configFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  configHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
  configScroll: {flex: 1, minHeight: 0, overflowY: 'auto', padding: 'var(--spacing-4)'},
  configGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 32,
    height: 32,
    borderRadius: 8,
    flexShrink: 0,
  },
  tokenWrap: {display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 6},
  testResult: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    background: 'var(--color-background-muted)',
  },
  visuallyHidden: {
    position: 'absolute',
    width: 1,
    height: 1,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
  },
};

// ---------------------------------------------------------------------------
// DATA — Kestrel Labs (140-person platform company). This is the live
// "Engineering day-one setup" workflow owned by Tom Okonkwo (IT admin):
// 8 trigger fires in the last 30 days — 4 succeeded, 1 failed at the laptop
// step, 1 is running (Ken Tanaka), 2 took the No branch (non-Engineering
// hires). Every count repeated across the header, node footers, and the run
// strip reconciles with that ledger.
// ---------------------------------------------------------------------------

// Data-viz categorical tokens are not injected by the demo — every use
// carries the repo-standard `light-dark()` fallback pair.
const PILLAR_COLOR = {
  hr: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
  it: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
  finance: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
  comms: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
  ops: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
} as const;

const PILLAR_TINT = {
  hr: 'light-dark(rgba(11, 153, 31, 0.12), rgba(52, 199, 89, 0.18))',
  it: 'light-dark(rgba(1, 113, 227, 0.12), rgba(76, 158, 255, 0.18))',
  finance: 'light-dark(rgba(235, 110, 0, 0.12), rgba(255, 147, 48, 0.18))',
  comms: 'light-dark(rgba(107, 30, 253, 0.10), rgba(157, 107, 255, 0.18))',
  ops: 'light-dark(rgba(14, 126, 139, 0.12), rgba(51, 184, 199, 0.18))',
} as const;

const ERROR_COLOR = 'light-dark(#DC2626, #F87171)';

type Pillar = keyof typeof PILLAR_COLOR;
type NodeKind = 'trigger' | 'condition' | 'action' | 'end';

const KIND_LABEL: Record<NodeKind, string> = {
  trigger: 'Trigger',
  condition: 'Condition',
  action: 'Action',
  end: 'End',
};

type FieldKind = 'text' | 'select' | 'textarea' | 'switch' | 'tokens';

type ConfigField = {
  id: string;
  label: string;
  kind: FieldKind;
  /** text/textarea/select: string · switch: boolean · tokens: string[] */
  value: string | boolean | readonly string[];
  options?: readonly {value: string; label: string}[];
  hint?: string;
  /** Shown while the (editable) value is empty — drives the page-wide
   * validation count. */
  requiredError?: string;
  placeholder?: string;
};

type FlowNode = {
  id: string;
  kind: NodeKind;
  pillar: Pillar;
  app: string;
  title: string;
  summary: string;
  icon: LucideIcon;
  x: number;
  y: number;
  /** Footer readout, already reconciled with the 30-day ledger. */
  stats: string;
  fields: ConfigField[];
  lastEditedBy: string;
  lastEditedAt: string;
  runs30d: string;
  avgDuration: string;
};

// ---- Palette: node types grouped by pillar app -----------------------------

type PaletteEntry = {
  id: string;
  label: string;
  kind: Exclude<NodeKind, 'end'>;
  icon: LucideIcon;
};

type PaletteGroup = {
  id: Pillar;
  label: string;
  app: string;
  entries: PaletteEntry[];
};

const PALETTE_GROUPS: PaletteGroup[] = [
  {
    id: 'hr',
    label: 'HR',
    app: 'Kestrel People',
    entries: [
      {id: 'p-emp-starts', label: 'Employee starts', kind: 'trigger', icon: UserPlusIcon},
      {id: 'p-emp-exits', label: 'Employee exits', kind: 'trigger', icon: UserMinusIcon},
      {id: 'p-dept-is', label: 'Department is…', kind: 'condition', icon: FilterIcon},
      {id: 'p-assign-plan', label: 'Assign onboarding plan', kind: 'action', icon: FlagIcon},
      {id: 'p-buddy-lunch', label: 'Schedule buddy lunch', kind: 'action', icon: UtensilsIcon},
    ],
  },
  {
    id: 'it',
    label: 'IT',
    app: 'Kestrel Devices',
    entries: [
      {id: 'p-github', label: 'Create GitHub account', kind: 'action', icon: GitPullRequestIcon},
      {id: 'p-laptop', label: 'Order laptop', kind: 'action', icon: LaptopIcon},
      {id: 'p-badge', label: 'Provision access badge', kind: 'action', icon: IdCardIcon},
      {id: 'p-device-enrolled', label: 'Device enrolled…', kind: 'condition', icon: BadgeCheckIcon},
      {id: 'p-suspend', label: 'Suspend accounts', kind: 'action', icon: MinusCircleIcon},
    ],
  },
  {
    id: 'finance',
    label: 'Finance',
    app: 'Kestrel Payroll',
    entries: [
      {id: 'p-payroll', label: 'Add to payroll', kind: 'action', icon: BanknoteIcon},
      {id: 'p-card', label: 'Issue corporate card', kind: 'action', icon: CreditCardIcon},
      {id: 'p-cost-center', label: 'Cost center is…', kind: 'condition', icon: LandmarkIcon},
    ],
  },
  {
    id: 'comms',
    label: 'Comms',
    app: 'Slack + Email',
    entries: [
      {id: 'p-slack', label: 'Add to Slack channels', kind: 'action', icon: HashIcon},
      {id: 'p-welcome', label: 'Send welcome email', kind: 'action', icon: MailIcon},
      {id: 'p-announce', label: 'Post to #people-ops', kind: 'action', icon: MegaphoneIcon},
    ],
  },
];

// ---- Canvas nodes -----------------------------------------------------------

const NODES: FlowNode[] = [
  {
    id: 'trigger',
    kind: 'trigger',
    pillar: 'hr',
    app: 'Kestrel People',
    title: 'Employee starts',
    summary: 'New hire record reaches start date',
    icon: ZapIcon,
    x: 32,
    y: 262,
    stats: '8 fires · 30d',
    runs30d: '8 fires',
    avgDuration: '—',
    lastEditedBy: 'Tom Okonkwo',
    lastEditedAt: '2026-06-12T17:20:00Z',
    fields: [
      {
        id: 'source',
        label: 'Source event',
        kind: 'select',
        value: 'hire-start',
        options: [
          {value: 'hire-start', label: 'HRIS — new hire reaches start date'},
          {value: 'hire-created', label: 'HRIS — new hire record created'},
          {value: 'manual', label: 'Manual — run for a chosen employee'},
        ],
      },
      {
        id: 'offset',
        label: 'Fire at',
        kind: 'select',
        value: 'start-0800',
        options: [
          {value: 'start-0800', label: 'On start date · 08:00 employee-local'},
          {value: 'start-minus-3', label: '3 days before start date'},
          {value: 'start-minus-7', label: '7 days before start date'},
        ],
        hint: 'Kestrel start dates are always Mondays; 6 of the last 8 fires were SF HQ hires.',
      },
      {
        id: 'contractors',
        label: 'Include contractors',
        kind: 'switch',
        value: false,
      },
    ],
  },
  {
    id: 'condition',
    kind: 'condition',
    pillar: 'hr',
    app: 'Kestrel People',
    title: 'Department = Engineering',
    summary: 'employee.department equals "Engineering"',
    icon: GitBranchIcon,
    x: 336,
    y: 262,
    stats: '8 checks · 6 Yes / 2 No',
    runs30d: '8 evaluations',
    avgDuration: '0.1s',
    lastEditedBy: 'Dana Whitfield',
    lastEditedAt: '2026-06-12T17:24:00Z',
    fields: [
      {
        id: 'attribute',
        label: 'Attribute',
        kind: 'select',
        value: 'department',
        options: [
          {value: 'department', label: 'employee.department'},
          {value: 'office', label: 'employee.office'},
          {value: 'employment-type', label: 'employee.employment_type'},
        ],
      },
      {
        id: 'operator',
        label: 'Operator',
        kind: 'select',
        value: 'equals',
        options: [
          {value: 'equals', label: 'equals'},
          {value: 'not-equals', label: 'does not equal'},
          {value: 'in', label: 'is one of'},
        ],
      },
      {
        id: 'value',
        label: 'Value',
        kind: 'select',
        value: 'engineering',
        options: [
          {value: 'engineering', label: 'Engineering (52 people)'},
          {value: 'design', label: 'Design (18 people)'},
          {value: 'gtm', label: 'GTM (34 people)'},
          {value: 'ops', label: 'Ops (16 people)'},
          {value: 'finance', label: 'Finance (8 people)'},
          {value: 'people', label: 'People (12 people)'},
        ],
        hint: '2 of the last 8 hires (GTM, Ops) took the No branch and were skipped.',
      },
    ],
  },
  {
    id: 'github',
    kind: 'action',
    pillar: 'it',
    app: 'GitHub',
    title: 'Create GitHub account',
    summary: 'kestrel-labs org · team eng-core',
    icon: GitPullRequestIcon,
    x: 648,
    y: 36,
    stats: '6 runs · 100%',
    runs30d: '6 runs',
    avgDuration: '4.2s',
    lastEditedBy: 'Tom Okonkwo',
    lastEditedAt: '2026-06-12T17:31:00Z',
    fields: [
      {
        id: 'org',
        label: 'Organization',
        kind: 'select',
        value: 'kestrel-labs',
        options: [{value: 'kestrel-labs', label: 'kestrel-labs'}],
      },
      {
        id: 'team',
        label: 'Team',
        kind: 'select',
        value: 'eng-core',
        options: [
          {value: 'eng-core', label: 'eng-core (52 members)'},
          {value: 'eng-platform', label: 'eng-platform (14 members)'},
          {value: 'eng-oncall', label: 'eng-oncall (9 members)'},
        ],
      },
      {
        id: 'role',
        label: 'Role',
        kind: 'select',
        value: 'member',
        options: [
          {value: 'member', label: 'Member'},
          {value: 'maintainer', label: 'Maintainer'},
        ],
      },
      {id: 'invite', label: 'Email invite on create', kind: 'switch', value: true},
    ],
  },
  {
    id: 'slack',
    kind: 'action',
    pillar: 'comms',
    app: 'Slack',
    title: 'Add to Slack channels',
    summary: '#eng-core, #kestrel-all + 2 more',
    icon: HashIcon,
    x: 648,
    y: 164,
    stats: '6 runs · 100%',
    runs30d: '6 runs',
    avgDuration: '2.8s',
    lastEditedBy: 'Dana Whitfield',
    lastEditedAt: '2026-06-30T09:05:00Z',
    fields: [
      {
        id: 'workspace',
        label: 'Workspace',
        kind: 'select',
        value: 'kestrel',
        options: [{value: 'kestrel', label: 'kestrel-labs.slack.com'}],
      },
      {
        id: 'channels',
        label: 'Channels',
        kind: 'tokens',
        value: ['#eng-core', '#kestrel-all', '#new-hires', '#eng-onboarding'],
        hint: 'Private channels need svc-people-ops invited first.',
      },
      {
        id: 'message',
        label: 'Invite message',
        kind: 'textarea',
        value:
          'Welcome to Kestrel Engineering, {{employee.first_name}}! Your buddy is {{buddy.name}} — say hi in #eng-onboarding.',
      },
      {
        id: 'run-as',
        label: 'Run as',
        kind: 'select',
        value: 'svc-people-ops',
        options: [
          {value: 'svc-people-ops', label: 'svc-people-ops (service account)'},
          {value: 'dana', label: 'Dana Whitfield'},
        ],
      },
      {id: 'notify-owners', label: 'Notify channel owners', kind: 'switch', value: true},
    ],
  },
  {
    id: 'laptop',
    kind: 'action',
    pillar: 'it',
    app: 'Kestrel Devices',
    title: 'Order laptop',
    summary: 'MacBook Pro 14″ · Engineering standard',
    icon: LaptopIcon,
    x: 648,
    y: 292,
    stats: '6 runs · 1 error',
    runs30d: '6 runs · 1 failed',
    avgDuration: '9.4s',
    lastEditedBy: 'Tom Okonkwo',
    lastEditedAt: '2026-07-01T16:42:00Z',
    fields: [
      {
        id: 'vendor',
        label: 'Vendor',
        kind: 'select',
        value: 'apple-biz',
        options: [
          {value: 'apple-biz', label: 'Apple Business — MacBook Pro 14″ M4'},
          {value: 'cdw', label: 'CDW — ThinkPad X1 Carbon'},
        ],
      },
      {
        id: 'config',
        label: 'Configuration',
        kind: 'select',
        value: 'eng-standard',
        options: [
          {value: 'eng-standard', label: '32 GB / 1 TB — Engineering standard'},
          {value: 'eng-max', label: '64 GB / 2 TB — ML workstation'},
        ],
      },
      {
        id: 'ship-to',
        label: 'Shipping address',
        kind: 'text',
        value: '',
        placeholder: 'Map a field or pick an office…',
        requiredError:
          'Required — map employee.home_address or pick an office. Run #1282 (Ines Marchetti) failed on this step.',
        hint: 'Remote-US hires need a mapped home address; SF HQ and Lisbon hires can ship to the office.',
      },
      {
        id: 'cost-center',
        label: 'Cost center',
        kind: 'select',
        value: 'eng-52',
        options: [
          {value: 'eng-52', label: 'ENG-52 · Engineering'},
          {value: 'ops-16', label: 'OPS-16 · Ops'},
        ],
      },
      {id: 'rush', label: 'Rush shipping (2-day)', kind: 'switch', value: false},
    ],
  },
  {
    id: 'lunch',
    kind: 'action',
    pillar: 'hr',
    app: 'Kestrel People',
    title: 'Schedule buddy lunch',
    summary: 'First week · Thursday 12:30 local',
    icon: UtensilsIcon,
    x: 648,
    y: 420,
    stats: '6 runs · 100%',
    runs30d: '6 runs',
    avgDuration: '1.6s',
    lastEditedBy: 'Dana Whitfield',
    lastEditedAt: '2026-06-19T11:12:00Z',
    fields: [
      {
        id: 'pool',
        label: 'Buddy pool',
        kind: 'select',
        value: 'eng-buddies',
        options: [
          {value: 'eng-buddies', label: 'Engineering buddies (12 volunteers)'},
          {value: 'all-buddies', label: 'All-company buddies (31 volunteers)'},
        ],
      },
      {
        id: 'window',
        label: 'Scheduling window',
        kind: 'select',
        value: 'first-week-thu',
        options: [
          {value: 'first-week-thu', label: 'First week · Thursday 12:30'},
          {value: 'first-week-any', label: 'First week · any open slot'},
          {value: 'second-week', label: 'Second week'},
        ],
      },
      {
        id: 'calendar',
        label: 'Calendar',
        kind: 'select',
        value: 'kestrel-cal',
        options: [{value: 'kestrel-cal', label: 'Kestrel Calendar — invite both parties'}],
      },
      {id: 'reminder', label: 'Remind buddy the day before', kind: 'switch', value: true},
    ],
  },
  {
    id: 'skip',
    kind: 'end',
    pillar: 'hr',
    app: 'Kestrel People',
    title: 'End — skip Engineering setup',
    summary: 'Non-Engineering hires exit here',
    icon: MinusCircleIcon,
    x: 336,
    y: 436,
    stats: '2 exits · 30d',
    runs30d: '2 exits',
    avgDuration: '—',
    lastEditedBy: 'Dana Whitfield',
    lastEditedAt: '2026-06-12T17:26:00Z',
    fields: [
      {
        id: 'note-people-ops',
        label: 'Note skip in #people-ops',
        kind: 'switch',
        value: true,
        hint: 'Mara Okafor (GTM) and Diego Serrano (Ops) exited here in the last 30 days.',
      },
    ],
  },
  {
    id: 'badge',
    kind: 'action',
    pillar: 'ops',
    app: 'Kestrel Devices',
    title: 'Provision access badge',
    summary: 'SF HQ template · zones: Lobby, Floor 3',
    icon: IdCardIcon,
    x: 336,
    y: 548,
    stats: '8 runs · 100%',
    runs30d: '8 runs',
    avgDuration: '3.1s',
    lastEditedBy: 'Tom Okonkwo',
    lastEditedAt: '2026-06-24T15:02:00Z',
    fields: [
      {
        id: 'template',
        label: 'Badge template',
        kind: 'select',
        value: 'sf-employee',
        options: [
          {value: 'sf-employee', label: 'SF HQ — Employee'},
          {value: 'lisbon-employee', label: 'Lisbon — Employee'},
          {value: 'visitor', label: 'Visitor (30-day)'},
        ],
      },
      {
        id: 'zones',
        label: 'Access zones',
        kind: 'tokens',
        value: ['Lobby', 'Floor 3', 'Lab'],
      },
      {
        id: 'photo',
        label: 'Photo source',
        kind: 'select',
        value: 'hris-photo',
        options: [
          {value: 'hris-photo', label: 'HRIS profile photo'},
          {value: 'capture', label: 'Capture at front desk'},
        ],
        hint: 'Runs for every hire in parallel with the department check.',
      },
    ],
  },
  {
    id: 'pickup',
    kind: 'action',
    pillar: 'ops',
    app: 'Kestrel Devices',
    title: 'Schedule badge pickup',
    summary: 'SF HQ front desk · day one, 09:00',
    icon: CalendarClockIcon,
    x: 648,
    y: 548,
    stats: '8 runs · 100%',
    runs30d: '8 runs',
    avgDuration: '0.9s',
    lastEditedBy: 'Tom Okonkwo',
    lastEditedAt: '2026-06-24T15:04:00Z',
    fields: [
      {
        id: 'location',
        label: 'Pickup location',
        kind: 'select',
        value: 'sf-front-desk',
        options: [
          {value: 'sf-front-desk', label: 'SF HQ front desk'},
          {value: 'lisbon-reception', label: 'Lisbon reception'},
          {value: 'mail', label: 'Mail to home address (Remote-US)'},
        ],
      },
      {id: 'notify-security', label: 'Notify security desk', kind: 'switch', value: true},
    ],
  },
  {
    id: 'complete',
    kind: 'end',
    pillar: 'hr',
    app: 'Kestrel People',
    title: 'Mark day-one setup complete',
    summary: 'Joins all branches · posts summary',
    icon: RocketIcon,
    x: 960,
    y: 282,
    stats: '4 completed · 30d',
    runs30d: '4 completions',
    avgDuration: '—',
    lastEditedBy: 'Dana Whitfield',
    lastEditedAt: '2026-06-12T17:40:00Z',
    fields: [
      {
        id: 'summary-channel',
        label: 'Post summary to #people-ops',
        kind: 'switch',
        value: true,
      },
      {
        id: 'close-tasks',
        label: 'Close onboarding tasks in Kestrel People',
        kind: 'switch',
        value: true,
        hint: 'Ava Lindqvist and Ken Tanaka stay mid-onboarding elsewhere — this closes day-one setup only.',
      },
    ],
  },
];

const NODE_BY_ID = new Map(NODES.map(node => [node.id, node]));

// ---- Typed edges ------------------------------------------------------------

type EdgeType = 'flow' | 'yes' | 'no' | 'parallel';

type FlowEdge = {
  id: string;
  from: string;
  to: string;
  type: EdgeType;
  label?: string;
};

const EDGES: FlowEdge[] = [
  {id: 'e-trigger-condition', from: 'trigger', to: 'condition', type: 'flow', label: 'then'},
  {id: 'e-trigger-badge', from: 'trigger', to: 'badge', type: 'parallel', label: 'parallel'},
  {id: 'e-condition-github', from: 'condition', to: 'github', type: 'yes', label: 'Yes'},
  {id: 'e-condition-slack', from: 'condition', to: 'slack', type: 'yes'},
  {id: 'e-condition-laptop', from: 'condition', to: 'laptop', type: 'yes'},
  {id: 'e-condition-lunch', from: 'condition', to: 'lunch', type: 'yes'},
  {id: 'e-condition-skip', from: 'condition', to: 'skip', type: 'no', label: 'No'},
  {id: 'e-badge-pickup', from: 'badge', to: 'pickup', type: 'flow'},
  {id: 'e-github-complete', from: 'github', to: 'complete', type: 'flow'},
  {id: 'e-slack-complete', from: 'slack', to: 'complete', type: 'flow'},
  {id: 'e-laptop-complete', from: 'laptop', to: 'complete', type: 'flow'},
  {id: 'e-lunch-complete', from: 'lunch', to: 'complete', type: 'flow'},
  {id: 'e-pickup-complete', from: 'pickup', to: 'complete', type: 'flow'},
];

const EDGE_STROKE: Record<EdgeType, {stroke: string; dash?: string}> = {
  flow: {stroke: 'var(--color-border)'},
  yes: {stroke: PILLAR_COLOR.hr},
  no: {stroke: ERROR_COLOR, dash: '6 4'},
  parallel: {stroke: PILLAR_COLOR.comms, dash: '6 4'},
};

const EDGE_LABEL_COLOR: Record<EdgeType, string> = {
  flow: 'var(--color-text-secondary)',
  yes: PILLAR_COLOR.hr,
  no: ERROR_COLOR,
  parallel: PILLAR_COLOR.comms,
};

// ---- Run history (last 5 of the 8 runs in the 30-day window; the 3 older
// runs — Lena Fischer ✓ Jun 22, Diego Serrano skipped Jun 20, Noor Haddad ✓
// Jun 17 — complete the ledger the node footers report) -----------------------

type RunStatus = 'success' | 'failed' | 'running' | 'skipped';

type RunRecord = {
  id: string;
  employee: string;
  department: string;
  status: RunStatus;
  startedAt: string;
  detail: string;
  /** Set on failed runs — clicking the chip selects this node. */
  failedNodeId?: string;
};

const RUNS: RunRecord[] = [
  {
    id: '#1284',
    employee: 'Ken Tanaka',
    department: 'Engineering',
    status: 'running',
    startedAt: '2026-07-03T15:00:00Z',
    detail: '4 of 9 steps',
  },
  {
    id: '#1283',
    employee: 'Ava Lindqvist',
    department: 'Engineering',
    status: 'success',
    startedAt: '2026-07-02T15:00:00Z',
    detail: '41s',
  },
  {
    id: '#1282',
    employee: 'Ines Marchetti',
    department: 'Engineering',
    status: 'failed',
    startedAt: '2026-07-01T15:00:00Z',
    detail: 'Order laptop',
    failedNodeId: 'laptop',
  },
  {
    id: '#1281',
    employee: 'Mara Okafor',
    department: 'GTM',
    status: 'skipped',
    startedAt: '2026-06-29T15:00:00Z',
    detail: 'No branch',
  },
  {
    id: '#1280',
    employee: 'Rohan Mehta',
    department: 'Engineering',
    status: 'success',
    startedAt: '2026-06-26T15:00:00Z',
    detail: '38s',
  },
];

const RUN_STATUS_META: Record<
  RunStatus,
  {label: string; dot: 'success' | 'error' | 'accent' | 'neutral'; icon: LucideIcon}
> = {
  success: {label: 'Success', dot: 'success', icon: CheckCircle2Icon},
  failed: {label: 'Failed', dot: 'error', icon: XCircleIcon},
  running: {label: 'Running', dot: 'accent', icon: PlayIcon},
  skipped: {label: 'Skipped', dot: 'neutral', icon: MinusCircleIcon},
};

// ---------------------------------------------------------------------------
// GEOMETRY HELPERS
// ---------------------------------------------------------------------------

function nodeHeight(node: FlowNode): number {
  return node.kind === 'end' ? END_H : NODE_H;
}

type EdgeGeometry = {d: string; midX: number; midY: number};

/**
 * Cubic bezier from the source's right port to the target's left port.
 * With symmetric control offsets the true t=0.5 point is the port midpoint,
 * so edge labels sit exactly on their line at every zoom level.
 */
function edgeGeometry(edge: FlowEdge): EdgeGeometry | null {
  const from = NODE_BY_ID.get(edge.from);
  const to = NODE_BY_ID.get(edge.to);
  if (from === undefined || to === undefined) {
    return null;
  }
  // Vertically stacked pair (the condition's No branch drops straight down
  // to its end marker): use bottom → top ports instead of a backward loop.
  if (from.x === to.x) {
    const sx = from.x + NODE_W / 2;
    const sy = from.y + nodeHeight(from);
    const ty = to.y;
    return {
      d: `M ${sx} ${sy} C ${sx} ${sy + 24}, ${sx} ${ty - 24}, ${sx} ${ty}`,
      midX: sx,
      midY: (sy + ty) / 2,
    };
  }
  const sx = from.x + NODE_W;
  const sy = from.y + nodeHeight(from) / 2;
  const tx = to.x;
  const ty = to.y + nodeHeight(to) / 2;
  const bend = Math.min(64, Math.max(32, (tx - sx) / 2));
  return {
    d: `M ${sx} ${sy} C ${sx + bend} ${sy}, ${tx - bend} ${ty}, ${tx} ${ty}`,
    midX: (sx + tx) / 2,
    midY: (sy + ty) / 2,
  };
}

// Precomputed once — node positions are static fixtures.
const EDGE_GEOMETRY = EDGES.map(edge => ({edge, geometry: edgeGeometry(edge)})).filter(
  (entry): entry is {edge: FlowEdge; geometry: EdgeGeometry} => entry.geometry !== null,
);

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------

function PaletteTile({entry, pillar}: {entry: PaletteEntry; pillar: Pillar}) {
  return (
    <button
      type="button"
      style={styles.paletteTile}
      title="Drag onto the canvas to add this step"
      aria-label={`${entry.label} — ${KIND_LABEL[entry.kind]} block`}>
      <span
        style={{
          ...styles.paletteGlyph,
          backgroundColor: PILLAR_TINT[pillar],
          color: PILLAR_COLOR[pillar],
        }}>
        <Icon icon={entry.icon} size="sm" color="inherit" />
      </span>
      <span style={styles.paletteTileText}>
        <Text type="label">{entry.label}</Text>
        <Text type="supporting" color="secondary">
          {KIND_LABEL[entry.kind]}
        </Text>
      </span>
    </button>
  );
}

function CanvasNodeTile({
  node,
  isSelected,
  errorCount,
  onSelect,
}: {
  node: FlowNode;
  isSelected: boolean;
  errorCount: number;
  onSelect: (id: string) => void;
}) {
  const accent = PILLAR_COLOR[node.pillar];
  const isEnd = node.kind === 'end';
  return (
    <button
      type="button"
      data-wsc-node
      onClick={() => onSelect(node.id)}
      aria-pressed={isSelected}
      aria-label={`${node.title} — ${KIND_LABEL[node.kind]}${
        errorCount > 0 ? `, ${errorCount} validation error` : ''
      }`}
      style={{
        ...styles.node,
        ...(isEnd ? styles.nodeEnd : undefined),
        ...(isSelected ? styles.nodeSelected : undefined),
        left: node.x,
        top: node.y,
        borderLeftColor: accent,
        ...(errorCount > 0 && !isSelected
          ? {borderColor: ERROR_COLOR, borderLeftColor: ERROR_COLOR}
          : undefined),
      }}>
      <span style={styles.nodeHeaderRow}>
        <span style={{display: 'inline-flex', color: accent}}>
          <Icon icon={node.icon} size="xsm" color="inherit" />
        </span>
        <span style={{...styles.nodeKindTag, color: accent}}>{KIND_LABEL[node.kind]}</span>
        <span style={styles.nodeAppTag}>{node.app}</span>
      </span>
      <span style={styles.nodeTitle}>{node.title}</span>
      {!isEnd && <span style={styles.nodeSummary}>{node.summary}</span>}
      <span style={styles.nodeStats}>{node.stats}</span>
      {errorCount > 0 && (
        <span style={styles.nodeErrorBadge} aria-hidden="true">
          {errorCount}
        </span>
      )}
    </button>
  );
}

// ---- Config field control ---------------------------------------------------

type FieldValue = string | boolean | readonly string[];

function ConfigFieldControl({
  nodeId,
  field,
  value,
  onChange,
}: {
  nodeId: string;
  field: ConfigField;
  value: FieldValue;
  onChange: (nodeId: string, fieldId: string, value: FieldValue) => void;
}) {
  const hint =
    field.hint !== undefined ? (
      <Text type="supporting" color="secondary">
        {field.hint}
      </Text>
    ) : null;

  if (field.kind === 'switch') {
    return (
      <VStack gap={1}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label">{field.label}</Text>
          </StackItem>
          <Switch
            label={field.label}
            isLabelHidden
            value={value === true}
            onChange={next => onChange(nodeId, field.id, next)}
          />
        </HStack>
        {hint}
      </VStack>
    );
  }

  if (field.kind === 'tokens') {
    const tokens = Array.isArray(value) ? (value as readonly string[]) : [];
    return (
      <Field label={field.label} inputID={`wsc-${nodeId}-${field.id}`}>
        <VStack gap={1}>
          <div id={`wsc-${nodeId}-${field.id}`} style={styles.tokenWrap}>
            {tokens.map(token => (
              <Token key={token} size="sm" color="gray" label={token} />
            ))}
            <Button label="Add" variant="ghost" size="sm" icon={<Icon icon={PlusIcon} size="sm" />} />
          </div>
          {hint}
        </VStack>
      </Field>
    );
  }

  if (field.kind === 'select') {
    return (
      <VStack gap={1}>
        <Selector
          label={field.label}
          options={field.options !== undefined ? [...field.options] : []}
          value={typeof value === 'string' ? value : ''}
          onChange={next => onChange(nodeId, field.id, next)}
          size="sm"
        />
        {hint}
      </VStack>
    );
  }

  if (field.kind === 'textarea') {
    return (
      <VStack gap={1}>
        <TextArea
          label={field.label}
          rows={3}
          width="100%"
          value={typeof value === 'string' ? value : ''}
          onChange={next => onChange(nodeId, field.id, next)}
        />
        {hint}
      </VStack>
    );
  }

  // text — the only kind that can carry a requiredError while empty.
  const text = typeof value === 'string' ? value : '';
  const hasError = field.requiredError !== undefined && text.trim().length === 0;
  return (
    <VStack gap={1}>
      <TextInput
        label={field.label}
        size="sm"
        width="100%"
        placeholder={field.placeholder}
        value={text}
        onChange={next => onChange(nodeId, field.id, next)}
      />
      {hasError && (
        <FieldStatus variant="detached" type="error" message={field.requiredError ?? ''} />
      )}
      {hint}
    </VStack>
  );
}

// ---- Config side panel -------------------------------------------------------

type TestResult = {ok: boolean; message: string};

const TEST_EMPLOYEE_OPTIONS = [
  {value: 'ava', label: 'Ava Lindqvist — Engineering · starts Jul 6'},
  {value: 'ken', label: 'Ken Tanaka — Engineering · starts Jul 6'},
];

function ConfigPanel({
  node,
  values,
  errorCount,
  testEmployee,
  testResult,
  onFieldChange,
  onTestEmployeeChange,
  onTestRun,
  onClose,
}: {
  node: FlowNode;
  values: Record<string, FieldValue>;
  errorCount: number;
  testEmployee: string;
  testResult: TestResult | undefined;
  onFieldChange: (nodeId: string, fieldId: string, value: FieldValue) => void;
  onTestEmployeeChange: (value: string) => void;
  onTestRun: (nodeId: string) => void;
  onClose: () => void;
}) {
  return (
    <div style={styles.configFill}>
      <div style={styles.configHeader}>
        <HStack gap={3} vAlign="center">
          <span
            style={{
              ...styles.configGlyph,
              backgroundColor: PILLAR_TINT[node.pillar],
              color: PILLAR_COLOR[node.pillar],
            }}>
            <Icon icon={node.icon} size="sm" color="inherit" />
          </span>
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={3}>{node.title}</Heading>
              <HStack gap={2} vAlign="center">
                <Badge label={KIND_LABEL[node.kind]} variant="neutral" />
                <Text type="supporting" color="secondary">
                  {node.app}
                </Text>
              </HStack>
            </VStack>
          </StackItem>
          <IconButton
            label="Close configuration panel"
            tooltip="Close"
            variant="ghost"
            size="sm"
            icon={<Icon icon={XIcon} size="sm" />}
            onClick={onClose}
          />
        </HStack>
      </div>
      <div style={styles.configScroll}>
        <VStack gap={4}>
          {errorCount > 0 && (
            <Banner
              status="error"
              title={`${errorCount} validation error`}
              description="Publishing is blocked until every required field on this step is mapped."
            />
          )}
          {node.fields.map(field => (
            <ConfigFieldControl
              key={field.id}
              nodeId={node.id}
              field={field}
              value={values[`${node.id}.${field.id}`] ?? field.value}
              onChange={onFieldChange}
            />
          ))}

          <Divider />

          <VStack gap={2}>
            <Text type="label">Test run</Text>
            <Selector
              label="Sample employee"
              options={TEST_EMPLOYEE_OPTIONS}
              value={testEmployee}
              onChange={onTestEmployeeChange}
              size="sm"
            />
            <Button
              label="Test-run this step"
              variant="secondary"
              size="sm"
              icon={<Icon icon={PlayIcon} size="sm" />}
              onClick={() => onTestRun(node.id)}
            />
            {testResult !== undefined && (
              <div style={styles.testResult}>
                <span
                  style={{
                    display: 'inline-flex',
                    flexShrink: 0,
                    marginTop: 2,
                    color: testResult.ok ? PILLAR_COLOR.hr : ERROR_COLOR,
                  }}>
                  <Icon icon={testResult.ok ? CheckCircle2Icon : XCircleIcon} size="sm" color="inherit" />
                </span>
                <Text type="supporting" color="secondary">
                  {testResult.message}
                </Text>
              </div>
            )}
          </VStack>

          <Divider />

          <MetadataList columns={1} label={{position: 'start', width: 104}}>
            <MetadataListItem label="Runs (30d)">
              <Text type="supporting" hasTabularNumbers>
                {node.runs30d}
              </Text>
            </MetadataListItem>
            <MetadataListItem label="Avg duration">
              <Text type="supporting" hasTabularNumbers>
                {node.avgDuration}
              </Text>
            </MetadataListItem>
            <MetadataListItem label="Last edited">
              <HStack gap={2} vAlign="center">
                <Avatar name={node.lastEditedBy} size="xsmall" />
                <VStack gap={0}>
                  <Text type="supporting" color="secondary">
                    {node.lastEditedBy}
                  </Text>
                  <Text type="supporting" color="secondary">
                    <Timestamp value={node.lastEditedAt} format="date" />
                  </Text>
                </VStack>
              </HStack>
            </MetadataListItem>
          </MetadataList>
        </VStack>
      </div>
    </div>
  );
}

// ---- Run-history strip --------------------------------------------------------

const RUN_DATE_LABEL: Record<string, string> = {
  '#1284': 'Jul 3 · 08:00',
  '#1283': 'Jul 2 · 08:00',
  '#1282': 'Jul 1 · 08:00',
  '#1281': 'Jun 29 · 08:00',
  '#1280': 'Jun 26 · 08:00',
};

function RunChip({run, onJumpToNode}: {run: RunRecord; onJumpToNode: (nodeId: string) => void}) {
  const meta = RUN_STATUS_META[run.status];
  const body = (
    <>
      <StatusDot variant={meta.dot} label={meta.label} isPulsing={run.status === 'running'} />
      <VStack gap={0}>
        <HStack gap={2} vAlign="center">
          <Text type="label">{run.employee}</Text>
          <span style={styles.runId}>{run.id}</span>
        </HStack>
        <span style={styles.runMeta}>
          {RUN_DATE_LABEL[run.id]} · {meta.label}
          {run.status === 'skipped' ? ` (${run.department})` : ''} · {run.detail}
        </span>
      </VStack>
    </>
  );
  if (run.failedNodeId !== undefined) {
    const failedNodeId = run.failedNodeId;
    return (
      <Tooltip content="Jump to the failing step">
        <button
          type="button"
          style={{...styles.runChip, borderColor: ERROR_COLOR}}
          onClick={() => onJumpToNode(failedNodeId)}>
          {body}
        </button>
      </Tooltip>
    );
  }
  return <div style={{...styles.runChip, cursor: 'default'}}>{body}</div>;
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

function buildInitialValues(): Record<string, FieldValue> {
  const values: Record<string, FieldValue> = {};
  for (const node of NODES) {
    for (const field of node.fields) {
      values[`${node.id}.${field.id}`] = field.value;
    }
  }
  return values;
}

export default function WorkflowStudioCanvasTemplate() {
  const isConfigHidden = useMediaQuery('(max-width: 1280px)');
  const isCompact = useMediaQuery('(max-width: 960px)');

  const [selectedId, setSelectedId] = useState<string | null>('slack');
  const [zoomIdx, setZoomIdx] = useState(3); // 100%
  const [query, setQuery] = useState('');
  const [fieldValues, setFieldValues] = useState<Record<string, FieldValue>>(buildInitialValues);
  const [testEmployee, setTestEmployee] = useState('ava');
  const [testResults, setTestResults] = useState<Record<string, TestResult>>({});
  const [announcement, setAnnouncement] = useState('');
  const [isPanning, setIsPanning] = useState(false);
  const scrollRef = useRef<HTMLDivElement | null>(null);
  const panRef = useRef<{startX: number; startY: number; scrollLeft: number; scrollTop: number} | null>(
    null,
  );

  const zoom = ZOOM_LEVELS[zoomIdx];

  // ---- validation: the laptop step's shipping address is the one required
  // field left unmapped; every issue count on the page derives from here, so
  // fixing the field inline clears the badge, the chip, and unblocks Publish.
  const shipTo = fieldValues['laptop.ship-to'];
  const laptopErrors = typeof shipTo === 'string' && shipTo.trim().length === 0 ? 1 : 0;
  const errorsByNode: Record<string, number> = {laptop: laptopErrors};
  const totalErrors = laptopErrors;

  const selectedNode = selectedId !== null ? NODE_BY_ID.get(selectedId) : undefined;

  // ---- handlers ----
  const handleFieldChange = (nodeId: string, fieldId: string, value: FieldValue) => {
    setFieldValues(prev => ({...prev, [`${nodeId}.${fieldId}`]: value}));
    if (nodeId === 'laptop' && fieldId === 'ship-to' && typeof value === 'string') {
      if (value.trim().length > 0 && laptopErrors === 1) {
        setAnnouncement('Validation error resolved — the workflow can be published.');
      }
    }
  };

  const handleSelect = (id: string) => {
    setSelectedId(id);
    const node = NODE_BY_ID.get(id);
    if (node !== undefined) {
      setAnnouncement(`${node.title} selected.`);
    }
  };

  const handleTestRun = (nodeId: string) => {
    const node = NODE_BY_ID.get(nodeId);
    if (node === undefined) {
      return;
    }
    const employee = testEmployee === 'ava' ? 'Ava Lindqvist' : 'Ken Tanaka';
    const failing = (errorsByNode[nodeId] ?? 0) > 0;
    const result: TestResult = failing
      ? {
          ok: false,
          message: `Test failed for ${employee} — Shipping address is required. Map employee.home_address or pick an office, then re-run.`,
        }
      : {
          ok: true,
          message: `Test passed for ${employee} in ${node.avgDuration === '—' ? '0.2s' : node.avgDuration} (sandbox — no real accounts touched).`,
        };
    setTestResults(prev => ({...prev, [nodeId]: result}));
    setAnnouncement(result.ok ? `Test passed for ${node.title}.` : `Test failed for ${node.title}.`);
  };

  const zoomOut = () => setZoomIdx(idx => Math.max(0, idx - 1));
  const zoomIn = () => setZoomIdx(idx => Math.min(ZOOM_LEVELS.length - 1, idx + 1));
  const zoomFit = () => setZoomIdx(1); // 67% shows the full graph at 1440x900

  // ---- background pan (org-chart-explorer idiom) ----
  const handlePanStart = (event: ReactPointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest('[data-wsc-node]') !== null) {
      return;
    }
    const scroller = scrollRef.current;
    if (scroller === null) {
      return;
    }
    panRef.current = {
      startX: event.clientX,
      startY: event.clientY,
      scrollLeft: scroller.scrollLeft,
      scrollTop: scroller.scrollTop,
    };
    setIsPanning(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePanMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    const pan = panRef.current;
    const scroller = scrollRef.current;
    if (pan === null || scroller === null) {
      return;
    }
    scroller.scrollLeft = pan.scrollLeft - (event.clientX - pan.startX);
    scroller.scrollTop = pan.scrollTop - (event.clientY - pan.startY);
  };

  const handlePanEnd = () => {
    panRef.current = null;
    setIsPanning(false);
  };

  // ---- palette (search-filtered) ----
  const filteredGroups = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) {
      return PALETTE_GROUPS;
    }
    return PALETTE_GROUPS.map(group => ({
      ...group,
      entries: group.entries.filter(entry => entry.label.toLowerCase().includes(needle)),
    })).filter(group => group.entries.length > 0);
  }, [query]);

  // ---- header ----
  const publishButton = (
    <Button
      label="Publish"
      variant="primary"
      size="sm"
      icon={<Icon icon={RocketIcon} size="sm" color="inherit" />}
      isDisabled={totalErrors > 0}
      onClick={() => setAnnouncement('Version 15 published.')}
    />
  );
  const header = (
    <LayoutHeader>
      <HStack gap={3} vAlign="center" style={styles.headerRow} wrap="wrap">
        <IconButton
          label="Back to all workflows"
          tooltip="All workflows"
          variant="ghost"
          size="sm"
          icon={<Icon icon={ArrowLeftIcon} size="sm" />}
        />
        <StackItem size="fill" style={styles.headerTitleBlock}>
          <VStack gap={0}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Heading level={2}>Engineering day-one setup</Heading>
              <Badge label="Live" variant="success" />
              <Badge label="v14" variant="neutral" />
            </HStack>
            <Text type="supporting" color="secondary">
              Onboarding · Owned by Tom Okonkwo · 8 runs in the last 30 days · Autosaved Jul 3,
              08:12
            </Text>
          </VStack>
        </StackItem>
        <HStack gap={2} vAlign="center">
          <Button
            label="Test workflow"
            variant="secondary"
            size="sm"
            icon={<Icon icon={PlayIcon} size="sm" />}
            onClick={() =>
              setAnnouncement('Sandbox run queued for Ava Lindqvist — watch the run strip.')
            }
          />
          {totalErrors > 0 ? (
            <Tooltip content={`Resolve ${totalErrors} validation error to publish`}>
              <span>{publishButton}</span>
            </Tooltip>
          ) : (
            publishButton
          )}
        </HStack>
      </HStack>
    </LayoutHeader>
  );

  // ---- palette rail ----
  const palette = (
    <div style={styles.paletteFill}>
      <div style={styles.paletteSearch}>
        <TextInput
          label="Search step blocks"
          isLabelHidden
          size="sm"
          width="100%"
          placeholder="Search blocks…"
          startIcon={<Icon icon={SearchIcon} size="sm" />}
          value={query}
          onChange={setQuery}
        />
      </div>
      <div style={styles.paletteScroll}>
        {filteredGroups.length === 0 ? (
          <Text type="supporting" color="secondary">
            No blocks match “{query.trim()}”.
          </Text>
        ) : (
          filteredGroups.map(group => (
            <VStack key={group.id} gap={1}>
              <div style={styles.paletteGroupHeader}>
                <span
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: '50%',
                    flexShrink: 0,
                    backgroundColor: PILLAR_COLOR[group.id],
                  }}
                />
                <Text type="label">{group.label}</Text>
                <StackItem size="fill" />
                <Text type="supporting" color="secondary">
                  {group.app}
                </Text>
              </div>
              {group.entries.map(entry => (
                <PaletteTile key={entry.id} entry={entry} pillar={group.id} />
              ))}
            </VStack>
          ))
        )}
      </div>
      <Divider />
      <div style={styles.paletteHint}>
        <Text type="supporting" color="secondary">
          Drag a block onto the canvas to add a step. Grants, seats, and orders stay in sync with
          Kestrel Devices and Payroll.
        </Text>
      </div>
    </div>
  );

  // ---- canvas toolbar ----
  const canvasToolbar = (
    <HStack gap={3} vAlign="center" style={styles.canvasToolbar} wrap="wrap">
      <Text type="supporting" color="secondary" hasTabularNumbers>
        {NODES.length} blocks · {EDGES.length} connections
      </Text>
      <StackItem size="fill" />
      {totalErrors > 0 ? (
        <button type="button" style={styles.issueChip} onClick={() => handleSelect('laptop')}>
          <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
          {totalErrors} issue
        </button>
      ) : (
        <span style={styles.cleanChip}>
          <span style={{display: 'inline-flex', color: PILLAR_COLOR.hr}}>
            <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
          </span>
          No issues
        </span>
      )}
      <HStack gap={1} vAlign="center">
        <IconButton
          label="Zoom out"
          tooltip="Zoom out"
          variant="ghost"
          size="sm"
          icon={<Icon icon={MinusIcon} size="sm" />}
          isDisabled={zoomIdx === 0}
          onClick={zoomOut}
        />
        <span style={styles.zoomReadout}>{Math.round(zoom * 100)}%</span>
        <IconButton
          label="Zoom in"
          tooltip="Zoom in"
          variant="ghost"
          size="sm"
          icon={<Icon icon={PlusIcon} size="sm" />}
          isDisabled={zoomIdx === ZOOM_LEVELS.length - 1}
          onClick={zoomIn}
        />
        <IconButton
          label="Fit workflow to view"
          tooltip="Fit to view"
          variant="ghost"
          size="sm"
          icon={<Icon icon={MaximizeIcon} size="sm" />}
          onClick={zoomFit}
        />
      </HStack>
    </HStack>
  );

  // ---- canvas ----
  const edgeTypes: EdgeType[] = ['flow', 'yes', 'no', 'parallel'];
  const canvas = (
    <div
      ref={scrollRef}
      role="group"
      aria-label="Workflow canvas — Engineering day-one setup"
      style={{
        ...styles.canvasScroll,
        ...(isPanning ? styles.canvasScrollPanning : undefined),
      }}
      onPointerDown={handlePanStart}
      onPointerMove={handlePanMove}
      onPointerUp={handlePanEnd}
      onPointerCancel={handlePanEnd}>
      <div
        style={{
          ...styles.canvasZoomBox,
          width: CANVAS_W * zoom,
          height: CANVAS_H * zoom,
        }}>
        <div style={{...styles.canvasSurface, transform: `scale(${zoom})`}}>
          <svg width={CANVAS_W} height={CANVAS_H} style={styles.edgeLayer} aria-hidden="true">
            <defs>
              {edgeTypes.map(type => (
                <marker
                  key={type}
                  id={`wsc-arrow-${type}`}
                  viewBox="0 0 8 8"
                  refX={7}
                  refY={4}
                  markerWidth={7}
                  markerHeight={7}
                  orient="auto-start-reverse">
                  <path d="M 0 0 L 8 4 L 0 8 z" fill={EDGE_STROKE[type].stroke} />
                </marker>
              ))}
            </defs>
            {EDGE_GEOMETRY.map(({edge, geometry}) => (
              <path
                key={edge.id}
                d={geometry.d}
                fill="none"
                stroke={EDGE_STROKE[edge.type].stroke}
                strokeWidth={1.75}
                strokeDasharray={EDGE_STROKE[edge.type].dash}
                markerEnd={`url(#wsc-arrow-${edge.type})`}
              />
            ))}
          </svg>
          {EDGE_GEOMETRY.filter(({edge}) => edge.label !== undefined).map(({edge, geometry}) => (
            <span
              key={`label-${edge.id}`}
              style={{
                ...styles.edgeLabel,
                left: geometry.midX,
                top: geometry.midY,
                color: EDGE_LABEL_COLOR[edge.type],
              }}
              aria-hidden="true">
              {edge.label}
            </span>
          ))}
          {NODES.map(node => (
            <CanvasNodeTile
              key={node.id}
              node={node}
              isSelected={node.id === selectedId}
              errorCount={errorsByNode[node.id] ?? 0}
              onSelect={handleSelect}
            />
          ))}
        </div>
      </div>
    </div>
  );

  // ---- run-history strip ----
  const runStrip = (
    <div style={styles.runStrip}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Text type="label">Last 5 runs</Text>
          <StackItem size="fill" />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            30 days: 8 runs · 4 completed · 2 skipped · 1 failed · 1 running
          </Text>
        </HStack>
        <div style={styles.runStripScroll}>
          {RUNS.map(run => (
            <RunChip key={run.id} run={run} onJumpToNode={handleSelect} />
          ))}
        </div>
      </VStack>
    </div>
  );

  // ---- frame ----
  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={header}
        start={
          isCompact ? undefined : (
            <LayoutPanel width={264} padding={0} hasDivider label="Step block palette">
              {palette}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentFill}>
              <div aria-live="polite" style={styles.visuallyHidden}>
                {announcement}
              </div>
              {canvasToolbar}
              {canvas}
              {runStrip}
            </div>
          </LayoutContent>
        }
        end={
          !isConfigHidden && selectedNode !== undefined ? (
            <LayoutPanel width={340} padding={0} hasDivider label="Step configuration">
              <ConfigPanel
                node={selectedNode}
                values={fieldValues}
                errorCount={errorsByNode[selectedNode.id] ?? 0}
                testEmployee={testEmployee}
                testResult={testResults[selectedNode.id]}
                onFieldChange={handleFieldChange}
                onTestEmployeeChange={setTestEmployee}
                onTestRun={handleTestRun}
                onClose={() => setSelectedId(null)}
              />
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
