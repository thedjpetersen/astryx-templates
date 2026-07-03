var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (six weekly release trains v2.39–v2.44
 *   with fixed cut/freeze/ship dates against a pinned "today" of Jul 02,
 *   per-train feature lists with flag names and rollout percentages, three
 *   blocking issues on the frozen train, a six-item go/no-go checklist with
 *   owner sign-offs, and a four-entry cherry-pick request queue)
 * @output Release-management overview for a weekly train: header with a
 *   train-count caption and Refresh/Open runbook ButtonGroup; a horizontal
 *   train rail of SelectableCard stops (version, codename Token, branch
 *   Code, and Cut/Freeze/Ship milestone rows that check off as each train
 *   advances); a selected-release detail column with a MetadataList fact
 *   sheet, a No-Go freeze Banner, a feature Table pairing mono flag Codes
 *   with On/Ramping/Dark/Unflagged Badges and thin rollout bars, and a
 *   blocking-issue List with severity StatusDots and state Tokens; plus a
 *   docked readiness panel holding the derived Go/No-Go verdict Badge, a
 *   sign-off ProgressBar, an owner CheckboxInput checklist, and a
 *   cherry-pick queue with Approve/Deny/Undo Buttons
 * @position Page template; emitted by \`astryx template release-train-overview\`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (train icon +
 * "Release Train" title, next-ship caption, Refresh/Runbook ButtonGroup).
 * LayoutContent is one scroll column: train rail, then the selected-release
 * detail (fact sheet, freeze Banner, feature Table, blocker List). A
 * resizable end LayoutPanel (380, 320–460) docks the readiness surface:
 * go/no-go verdict, sign-off checklist, cherry-pick queue.
 *
 * Interaction contract:
 * - The verdict is *derived*, never stored: an open sev1 blocker forces
 *   No-Go, any unsigned checklist row holds Pending, and a clean board is
 *   Go. Signing a checklist row or approving/denying a pick recomputes the
 *   verdict Badge, the ProgressBar, and the freeze Banner in one pass.
 * - The rail is a single-select group: choosing a stop swaps the entire
 *   detail column and readiness panel to that train. Shipped trains show a
 *   read-only archived checklist; planned trains explain that the checklist
 *   opens at branch cut.
 * - Cherry-pick rows are a tiny state machine: pending shows Approve/Deny,
 *   decided shows an Approved/Denied Badge plus Undo back to pending. The
 *   pending count feeds the panel heading and the header caption.
 * - Refresh restores the initial fixture state wholesale.
 *
 * Responsive contract:
 * - Rail: the stop cards keep a fixed 232px width at every breakpoint and
 *   the rail scrolls horizontally (overflowX auto + proximity scroll snap)
 *   — deliberate overflow, never squeezed cards. Selection works by tap or
 *   keyboard focus; nothing on the card is hover-only (milestone glyphs
 *   carry text labels, not tooltips).
 * - Panel: > 1024px the readiness panel docks at 380 with a ResizeHandle;
 *   <= 1024px it is removed and the identical readiness sections render
 *   inline after the blocker list — a single-pane fallback, no content is
 *   lost on phones.
 * - Detail Table: <= 900px hides the Owner column; <= 640px also hides the
 *   Rollout column and folds the percentage into the flag cell so Feature
 *   and Flag fit 375px without horizontal scroll.
 * - Header: <= 640px the Refresh and Open runbook buttons collapse to
 *   icon-only (labels remain as accessible names and tooltips) and the
 *   caption drops to the title's second line via wrapping.
 * - Tap targets: <= 640px Approve/Deny/Undo switch from size="sm" to
 *   size="md" (~40px), and checklist rows are full-width CheckboxInputs.
 *
 * Container policy (release-ops archetype): the rail uses SelectableCards
 * because stops are a radio-style choice; the detail column uses a Table
 * for flag/rollout density and an edge List for blockers; the readiness
 * panel uses muted Cards per cherry-pick because each row carries its own
 * action pair. Status is carried by StatusDot (severity/phase) and Token
 * (train state), with Badges reserved for verdicts and flag states.
 */

import {useState, type CSSProperties} from 'react';

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
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {Card} from '@astryxdesign/core/Card';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Code} from '@astryxdesign/core/Code';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {ResizeHandle, useResizable} from '@astryxdesign/core/Resizable';
import {SelectableCard} from '@astryxdesign/core/SelectableCard';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  CheckIcon,
  ClipboardCheckIcon,
  ExternalLinkIcon,
  GitCommitHorizontalIcon,
  RefreshCwIcon,
  RocketIcon,
  ScissorsIcon,
  ShieldAlertIcon,
  SnowflakeIcon,
  TrainFrontIcon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const RAIL_STOP_WIDTH = 232;

const styles: Record<string, CSSProperties> = {
  // The rail scrolls horizontally at every width — stops never squeeze.
  rail: {
    overflowX: 'auto',
    scrollSnapType: 'x proximity',
    paddingBottom: 'var(--spacing-2)',
  },
  railTrack: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'stretch',
    // Keeps the last card's focus ring off the scroll container edge.
    paddingRight: 'var(--spacing-1)',
  },
  railStop: {
    width: RAIL_STOP_WIDTH,
    flexShrink: 0,
    scrollSnapAlign: 'start',
    display: 'flex',
  },
  // Thin proportional rollout bar inside the feature table.
  rolloutTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
    width: '100%',
  },
  rolloutFill: {
    height: '100%',
    borderRadius: 2,
    backgroundColor: 'var(--color-icon-green)',
  },
  rolloutFillDark: {
    backgroundColor: 'var(--color-icon-secondary)',
    opacity: 0.5,
  },
  rolloutCell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
    width: '100%',
    maxWidth: 140,
  },
  panelBody: {
    padding: 'var(--spacing-4)',
    height: '100%',
    overflowY: 'auto',
  },
  signoffBar: {maxWidth: 260},
};

// ============= DATA =============
// Deterministic fixtures: the "clock" is a pinned string, every date is a
// fixed label, and milestone completion derives from train status — no
// Date.now, no randomness, no network assets.

const TODAY_LABEL = 'Wed Jul 02';
const CADENCE = 'Weekly · cut Tue, freeze +7d, ship +14d';

type TrainStatus = 'shipped' | 'frozen' | 'cut' | 'planned';
type FlagState = 'on' | 'ramping' | 'off' | 'unflagged';
type BlockerSeverity = 'sev1' | 'sev2' | 'sev3';
type BlockerStatus = 'open' | 'verifying' | 'mitigated';
type PickRisk = 'low' | 'medium' | 'high';
type PickState = 'pending' | 'approved' | 'denied';

interface Feature extends Record<string, unknown> {
  id: string;
  name: string;
  summary: string;
  flag: string | null; // null = landed without a kill switch
  flagState: FlagState;
  rollout: number; // 0–100
  owner: string;
}

interface Blocker {
  id: string;
  title: string;
  severity: BlockerSeverity;
  status: BlockerStatus;
  owner: string;
  openedAt: string;
}

interface ChecklistItem {
  id: string;
  label: string;
  owner: string;
  role: string;
  signed: boolean;
}

interface CherryPick {
  id: string;
  sha: string;
  title: string;
  author: string;
  risk: PickRisk;
  requestedAt: string;
  state: PickState;
}

interface Release {
  id: string;
  version: string;
  codename: string;
  status: TrainStatus;
  branch: string;
  captain: string;
  cutAt: string;
  freezeAt: string;
  shipAt: string;
  features: Feature[];
  blockers: Blocker[];
  checklist: ChecklistItem[];
  picks: CherryPick[];
  picksNote?: string; // shown when the queue is intentionally empty
}

const INITIAL_RELEASES: Release[] = [
  {
    id: 'v2.39',
    version: 'v2.39',
    codename: 'Amber',
    status: 'shipped',
    branch: 'release/2.39',
    captain: 'Noor Haddad',
    cutAt: 'Jun 03',
    freezeAt: 'Jun 10',
    shipAt: 'Jun 17',
    features: [
      {
        id: 'f-3901',
        name: 'Bulk export v2',
        summary: 'Streams CSV exports instead of buffering in memory.',
        flag: 'exp_bulk_export_v2',
        flagState: 'on',
        rollout: 100,
        owner: 'Dana Whitfield',
      },
      {
        id: 'f-3902',
        name: 'Session timeout banner',
        summary: 'Warns 5 minutes before idle logout.',
        flag: 'exp_session_warning',
        flagState: 'on',
        rollout: 100,
        owner: 'Ravi Menon',
      },
    ],
    blockers: [],
    checklist: [
      {
        id: 'c-3901',
        label: 'Regression suite green',
        owner: 'QA rotation',
        role: 'Quality',
        signed: true,
      },
      {
        id: 'c-3902',
        label: 'Release notes published',
        owner: 'Noor Haddad',
        role: 'Captain',
        signed: true,
      },
    ],
    picks: [],
    picksNote: 'Train shipped Jun 17 — queue archived with 2 approved picks.',
  },
  {
    id: 'v2.40',
    version: 'v2.40',
    codename: 'Copper',
    status: 'shipped',
    branch: 'release/2.40',
    captain: 'Elena Brooks',
    cutAt: 'Jun 10',
    freezeAt: 'Jun 17',
    shipAt: 'Jun 24',
    features: [
      {
        id: 'f-4001',
        name: 'Org-level audit log',
        summary: 'Admin-visible audit trail for role and billing changes.',
        flag: 'exp_org_audit_log',
        flagState: 'on',
        rollout: 100,
        owner: 'Sam Ito',
      },
      {
        id: 'f-4002',
        name: 'Faster cold start',
        summary: 'Lazy-loads the editor bundle; ~380ms off first paint.',
        flag: 'exp_lazy_editor',
        flagState: 'on',
        rollout: 100,
        owner: 'Priya Raman',
      },
      {
        id: 'f-4003',
        name: 'Legacy theme removal',
        summary: 'Deletes the 2023 theme fallback path.',
        flag: null,
        flagState: 'unflagged',
        rollout: 100,
        owner: 'Dana Whitfield',
      },
    ],
    blockers: [],
    checklist: [
      {
        id: 'c-4001',
        label: 'Regression suite green',
        owner: 'QA rotation',
        role: 'Quality',
        signed: true,
      },
      {
        id: 'c-4002',
        label: 'Perf budget within +2%',
        owner: 'Priya Raman',
        role: 'Performance',
        signed: true,
      },
      {
        id: 'c-4003',
        label: 'Release notes published',
        owner: 'Elena Brooks',
        role: 'Captain',
        signed: true,
      },
    ],
    picks: [],
    picksNote: 'Train shipped Jun 24 — queue archived with 1 approved pick.',
  },
  {
    id: 'v2.41',
    version: 'v2.41',
    codename: 'Cobalt',
    status: 'frozen',
    branch: 'release/2.41',
    captain: 'Marcus Webb',
    cutAt: 'Jun 24',
    freezeAt: 'Jul 01',
    shipAt: 'Jul 08',
    features: [
      {
        id: 'f-4101',
        name: 'Shared workspace drafts',
        summary: 'Drafts sync across members before publish.',
        flag: 'exp_shared_drafts',
        flagState: 'ramping',
        rollout: 50,
        owner: 'Ana Duarte',
      },
      {
        id: 'f-4102',
        name: 'Payment retry ladder',
        summary: 'Smart retry schedule for failed card charges.',
        flag: 'exp_payment_retry',
        flagState: 'ramping',
        rollout: 25,
        owner: 'Sam Ito',
      },
      {
        id: 'f-4103',
        name: 'New onboarding checklist',
        summary: 'Replaces the tour modal with an inline checklist.',
        flag: 'exp_onboarding_v3',
        flagState: 'on',
        rollout: 100,
        owner: 'Ravi Menon',
      },
      {
        id: 'f-4104',
        name: 'Search reranker',
        summary: 'Shipped dark; enables after the index backfill.',
        flag: 'exp_search_rerank',
        flagState: 'off',
        rollout: 0,
        owner: 'Priya Raman',
      },
      {
        id: 'f-4105',
        name: 'Currency rounding fix',
        summary: 'Correct minor-unit rounding for JPY and KRW.',
        flag: null,
        flagState: 'unflagged',
        rollout: 100,
        owner: 'Sam Ito',
      },
    ],
    blockers: [
      {
        id: 'REL-812',
        title: 'Checkout smoke test failing on retry-ladder branch',
        severity: 'sev1',
        status: 'open',
        owner: 'Sam Ito',
        openedAt: 'Jul 01',
      },
      {
        id: 'REL-809',
        title: 'Draft sync drops edits on flaky connections',
        severity: 'sev2',
        status: 'verifying',
        owner: 'Ana Duarte',
        openedAt: 'Jun 29',
      },
      {
        id: 'REL-804',
        title: 'Onboarding checklist overlaps footer at 320px',
        severity: 'sev3',
        status: 'mitigated',
        owner: 'Ravi Menon',
        openedAt: 'Jun 27',
      },
    ],
    checklist: [
      {
        id: 'c-4101',
        label: 'Regression suite green',
        owner: 'QA rotation',
        role: 'Quality',
        signed: true,
      },
      {
        id: 'c-4102',
        label: 'Perf budget within +2%',
        owner: 'Priya Raman',
        role: 'Performance',
        signed: true,
      },
      {
        id: 'c-4103',
        label: 'Security review of payment retry',
        owner: 'Noor Haddad',
        role: 'Security',
        signed: true,
      },
      {
        id: 'c-4104',
        label: 'Support macros updated',
        owner: 'Elena Brooks',
        role: 'Support',
        signed: true,
      },
      {
        id: 'c-4105',
        label: 'Sev1 blockers resolved or waived',
        owner: 'Marcus Webb',
        role: 'Captain',
        signed: false,
      },
      {
        id: 'c-4106',
        label: 'Rollback plan rehearsed',
        owner: 'On-call rotation',
        role: 'Operations',
        signed: false,
      },
    ],
    picks: [
      {
        id: 'p-4101',
        sha: '9f2c41a',
        title: 'Fix checkout smoke test: await retry queue drain',
        author: 'Sam Ito',
        risk: 'medium',
        requestedAt: 'Jul 02, 9:14 AM',
        state: 'pending',
      },
      {
        id: 'p-4102',
        sha: '3d78b02',
        title: 'Guard draft sync against duplicate patch frames',
        author: 'Ana Duarte',
        risk: 'low',
        requestedAt: 'Jul 02, 8:40 AM',
        state: 'pending',
      },
      {
        id: 'p-4103',
        sha: 'c51e9d7',
        title: 'Bump search reranker model to r14 before enable',
        author: 'Priya Raman',
        risk: 'high',
        requestedAt: 'Jul 01, 6:02 PM',
        state: 'pending',
      },
      {
        id: 'p-4104',
        sha: '714aa3f',
        title: 'Copy fix: onboarding checklist empty state',
        author: 'Ravi Menon',
        risk: 'low',
        requestedAt: 'Jul 01, 2:26 PM',
        state: 'approved',
      },
    ],
  },
  {
    id: 'v2.42',
    version: 'v2.42',
    codename: 'Dune',
    status: 'cut',
    branch: 'release/2.42',
    captain: 'Ana Duarte',
    cutAt: 'Jul 01',
    freezeAt: 'Jul 08',
    shipAt: 'Jul 15',
    features: [
      {
        id: 'f-4201',
        name: 'Inline comment threads',
        summary: 'Threaded comments on any document block.',
        flag: 'exp_inline_threads',
        flagState: 'off',
        rollout: 0,
        owner: 'Dana Whitfield',
      },
      {
        id: 'f-4202',
        name: 'SCIM provisioning',
        summary: 'Directory sync for enterprise workspaces.',
        flag: 'exp_scim_sync',
        flagState: 'off',
        rollout: 0,
        owner: 'Noor Haddad',
      },
      {
        id: 'f-4203',
        name: 'Mobile push digests',
        summary: 'Batches notification pushes into two daily digests.',
        flag: 'exp_push_digest',
        flagState: 'ramping',
        rollout: 10,
        owner: 'Ravi Menon',
      },
      {
        id: 'f-4204',
        name: 'Billing proration rewrite',
        summary: 'Mid-cycle seat changes prorate to the day.',
        flag: 'exp_proration_v2',
        flagState: 'off',
        rollout: 0,
        owner: 'Sam Ito',
      },
    ],
    blockers: [
      {
        id: 'REL-815',
        title: 'SCIM sync loops on nested groups in staging',
        severity: 'sev3',
        status: 'open',
        owner: 'Noor Haddad',
        openedAt: 'Jul 02',
      },
    ],
    checklist: [
      {
        id: 'c-4201',
        label: 'Regression suite green',
        owner: 'QA rotation',
        role: 'Quality',
        signed: false,
      },
      {
        id: 'c-4202',
        label: 'Perf budget within +2%',
        owner: 'Priya Raman',
        role: 'Performance',
        signed: false,
      },
      {
        id: 'c-4203',
        label: 'Security review of SCIM sync',
        owner: 'Noor Haddad',
        role: 'Security',
        signed: false,
      },
      {
        id: 'c-4204',
        label: 'Rollback plan rehearsed',
        owner: 'On-call rotation',
        role: 'Operations',
        signed: false,
      },
    ],
    picks: [],
    picksNote:
      'Branch is open — commits land directly until freeze on Jul 08; the pick queue activates at freeze.',
  },
  {
    id: 'v2.43',
    version: 'v2.43',
    codename: 'Ember',
    status: 'planned',
    branch: 'release/2.43',
    captain: 'Priya Raman',
    cutAt: 'Jul 08',
    freezeAt: 'Jul 15',
    shipAt: 'Jul 22',
    features: [
      {
        id: 'f-4301',
        name: 'Workspace templates',
        summary: 'Clone a workspace with structure but not content.',
        flag: 'exp_ws_templates',
        flagState: 'off',
        rollout: 0,
        owner: 'Ana Duarte',
      },
      {
        id: 'f-4302',
        name: 'API rate-limit headers',
        summary: 'Publishes remaining-quota headers on every response.',
        flag: 'exp_ratelimit_headers',
        flagState: 'off',
        rollout: 0,
        owner: 'Marcus Webb',
      },
    ],
    blockers: [],
    checklist: [],
    picks: [],
    picksNote: 'Queue opens when the branch is cut on Jul 08.',
  },
  {
    id: 'v2.44',
    version: 'v2.44',
    codename: 'Flint',
    status: 'planned',
    branch: 'release/2.44',
    captain: 'Dana Whitfield',
    cutAt: 'Jul 15',
    freezeAt: 'Jul 22',
    shipAt: 'Jul 29',
    features: [
      {
        id: 'f-4401',
        name: 'Offline draft cache',
        summary: 'Editors keep a local draft when the network drops.',
        flag: 'exp_offline_drafts',
        flagState: 'off',
        rollout: 0,
        owner: 'Ravi Menon',
      },
    ],
    blockers: [],
    checklist: [],
    picks: [],
    picksNote: 'Queue opens when the branch is cut on Jul 15.',
  },
];

// ============= STATUS VOCABULARY =============
// Four train states, each with a dot, a token color, and how many of the
// three milestones (cut, freeze, ship) it has reached. Milestone completion
// is derived from status so fixtures never need date math.

const TRAIN_STATUS: Record<
  TrainStatus,
  {
    label: string;
    dot: 'success' | 'warning' | 'accent' | 'neutral';
    token: 'green' | 'yellow' | 'blue' | 'gray';
    milestonesReached: number;
  }
> = {
  shipped: {label: 'Shipped', dot: 'success', token: 'green', milestonesReached: 3},
  frozen: {label: 'In freeze', dot: 'warning', token: 'yellow', milestonesReached: 2},
  cut: {label: 'Branch cut', dot: 'accent', token: 'blue', milestonesReached: 1},
  planned: {label: 'Planned', dot: 'neutral', token: 'gray', milestonesReached: 0},
};

const FLAG_STATE: Record<
  FlagState,
  {label: string; badge: 'success' | 'info' | 'neutral' | 'warning'}
> = {
  on: {label: 'On', badge: 'success'},
  ramping: {label: 'Ramping', badge: 'info'},
  off: {label: 'Dark', badge: 'neutral'},
  unflagged: {label: 'Unflagged', badge: 'warning'},
};

const SEVERITY: Record<
  BlockerSeverity,
  {label: string; dot: 'error' | 'warning' | 'neutral'; badge: 'error' | 'warning' | 'neutral'}
> = {
  sev1: {label: 'SEV1', dot: 'error', badge: 'error'},
  sev2: {label: 'SEV2', dot: 'warning', badge: 'warning'},
  sev3: {label: 'SEV3', dot: 'neutral', badge: 'neutral'},
};

const BLOCKER_STATUS: Record<
  BlockerStatus,
  {label: string; token: 'red' | 'yellow' | 'green'}
> = {
  open: {label: 'Open', token: 'red'},
  verifying: {label: 'Verifying fix', token: 'yellow'},
  mitigated: {label: 'Mitigated', token: 'green'},
};

const PICK_RISK: Record<
  PickRisk,
  {label: string; badge: 'neutral' | 'warning' | 'error'}
> = {
  low: {label: 'Low risk', badge: 'neutral'},
  medium: {label: 'Medium risk', badge: 'warning'},
  high: {label: 'High risk', badge: 'error'},
};

// ============= READINESS =============
// The go/no-go verdict is derived from live state: open sev1 blockers force
// No-Go, unsigned checklist rows hold Pending, a clean board is Go. Shipped
// and planned trains sit outside the gate entirely.

type Verdict = 'go' | 'no-go' | 'pending' | 'shipped' | 'not-open';

const VERDICT: Record<
  Verdict,
  {label: string; badge: 'success' | 'error' | 'warning' | 'neutral'}
> = {
  go: {label: 'Go', badge: 'success'},
  'no-go': {label: 'No-Go', badge: 'error'},
  pending: {label: 'Pending', badge: 'warning'},
  shipped: {label: 'Shipped', badge: 'neutral'},
  'not-open': {label: 'Not open', badge: 'neutral'},
};

function openSev1Count(release: Release): number {
  return release.blockers.filter(
    blocker => blocker.severity === 'sev1' && blocker.status === 'open',
  ).length;
}

function unsignedCount(release: Release): number {
  return release.checklist.filter(item => !item.signed).length;
}

function verdictOf(release: Release): Verdict {
  if (release.status === 'shipped') {
    return 'shipped';
  }
  if (release.status === 'planned') {
    return 'not-open';
  }
  if (openSev1Count(release) > 0) {
    return 'no-go';
  }
  if (unsignedCount(release) > 0) {
    return 'pending';
  }
  return 'go';
}

function verdictSummary(release: Release): string {
  const verdict = verdictOf(release);
  switch (verdict) {
    case 'shipped':
      return \`Shipped \${release.shipAt} — checklist archived.\`;
    case 'not-open':
      return \`Checklist opens at branch cut on \${release.cutAt}.\`;
    case 'go':
      return \`All sign-offs in and no open sev1 — clear to ship \${release.shipAt}.\`;
    case 'pending': {
      const unsigned = unsignedCount(release);
      return \`\${unsigned} sign-off\${unsigned === 1 ? '' : 's'} outstanding; no open sev1 blockers.\`;
    }
    case 'no-go': {
      const sev1 = openSev1Count(release);
      const unsigned = unsignedCount(release);
      const parts = [\`\${sev1} sev1 blocker\${sev1 === 1 ? '' : 's'} open\`];
      if (unsigned > 0) {
        parts.push(\`\${unsigned} sign-off\${unsigned === 1 ? '' : 's'} pending\`);
      }
      return parts.join(' · ');
    }
  }
}

// ============= TRAIN RAIL =============

const MILESTONES = [
  {key: 'cutAt', label: 'Cut', icon: ScissorsIcon},
  {key: 'freezeAt', label: 'Freeze', icon: SnowflakeIcon},
  {key: 'shipAt', label: 'Ship', icon: RocketIcon},
] as const;

function MilestoneRow({
  label,
  icon,
  date,
  reached,
}: {
  label: string;
  icon: typeof ScissorsIcon;
  date: string;
  reached: boolean;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <Icon icon={icon} size="sm" color={reached ? 'success' : 'secondary'} />
      <Text type="supporting" size="sm" color="secondary">
        {label}
      </Text>
      <StackItem size="fill" />
      <Text
        type="supporting"
        size="sm"
        color={reached ? 'secondary' : 'primary'}
        hasTabularNumbers>
        {date}
      </Text>
      {reached && (
        <Icon
          icon={CheckIcon}
          size="sm"
          color="success"
          aria-label={\`\${label} complete\`}
        />
      )}
    </HStack>
  );
}

function TrainRail({
  releases,
  selectedId,
  onSelect,
}: {
  releases: Release[];
  selectedId: string;
  onSelect: (id: string) => void;
}) {
  return (
    <div style={styles.rail} role="group" aria-label="Release train schedule">
      <div style={styles.railTrack}>
        {releases.map(release => {
          const status = TRAIN_STATUS[release.status];
          const verdict = verdictOf(release);
          return (
            <div key={release.id} style={styles.railStop}>
              <SelectableCard
                label={\`Select \${release.version} \${release.codename} (\${status.label})\`}
                isSelected={release.id === selectedId}
                onChange={() => onSelect(release.id)}
                padding={3}
                width="100%">
                <VStack gap={2}>
                  <HStack gap={2} vAlign="center">
                    <StatusDot
                      variant={status.dot}
                      label={status.label}
                      isPulsing={verdict === 'no-go'}
                    />
                    <StackItem size="fill">
                      <Text type="body" weight="semibold">
                        {release.version}
                      </Text>
                    </StackItem>
                    <Token size="sm" color={status.token} label={status.label} />
                  </HStack>
                  <Text type="supporting" size="sm" color="secondary" maxLines={1}>
                    {release.codename} · <Code>{release.branch}</Code>
                  </Text>
                  <Divider />
                  {MILESTONES.map((milestone, index) => (
                    <MilestoneRow
                      key={milestone.key}
                      label={milestone.label}
                      icon={milestone.icon}
                      date={release[milestone.key]}
                      reached={index < status.milestonesReached}
                    />
                  ))}
                </VStack>
              </SelectableCard>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ============= FEATURE TABLE =============

function RolloutBar({feature}: {feature: Feature}) {
  const isDark = feature.flagState === 'off';
  return (
    <div style={styles.rolloutCell}>
      <div style={styles.rolloutTrack} aria-hidden>
        <div
          style={{
            ...styles.rolloutFill,
            ...(isDark ? styles.rolloutFillDark : {}),
            width: \`\${feature.rollout}%\`,
          }}
        />
      </div>
      <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
        {feature.rollout}% of traffic
      </Text>
    </div>
  );
}

function FeatureTable({
  release,
  isCompact,
  isMobile,
}: {
  release: Release;
  isCompact: boolean;
  isMobile: boolean;
}) {
  return (
    <Table
      data={release.features}
      idKey="id"
      density="compact"
      hasHover
      textOverflow="truncate"
      columns={[
        {
          key: 'name',
          header: 'Feature',
          width: proportional(1.4),
          renderCell: feature => (
            <VStack gap={0.5}>
              <Text type="body" weight="semibold" maxLines={1}>
                {feature.name}
              </Text>
              <Text type="supporting" size="sm" color="secondary" maxLines={2}>
                {feature.summary}
                {/* <=900px: the Owner column is hidden, so the owner folds
                    into the summary line. */}
                {isCompact ? \` — \${feature.owner}\` : ''}
              </Text>
            </VStack>
          ),
        },
        {
          key: 'flag',
          header: 'Flag',
          width: isMobile ? proportional(1) : proportional(1.1),
          renderCell: feature => (
            <VStack gap={1}>
              {feature.flag != null ? (
                <Text type="code" size="sm" maxLines={1}>
                  {feature.flag}
                </Text>
              ) : (
                <Text type="supporting" size="sm" color="secondary">
                  no kill switch
                </Text>
              )}
              <HStack gap={1} vAlign="center">
                <Badge
                  variant={FLAG_STATE[feature.flagState].badge}
                  label={FLAG_STATE[feature.flagState].label}
                />
                {/* <=640px: the Rollout column is hidden, so the percent
                    folds in beside the state Badge. */}
                {isMobile && (
                  <Text
                    type="supporting"
                    size="sm"
                    color="secondary"
                    hasTabularNumbers>
                    {feature.rollout}%
                  </Text>
                )}
              </HStack>
            </VStack>
          ),
        },
        ...(isMobile
          ? []
          : [
              {
                key: 'rollout',
                header: 'Rollout',
                width: pixel(160),
                renderCell: (feature: Feature) => <RolloutBar feature={feature} />,
              },
            ]),
        ...(isCompact
          ? []
          : [
              {
                key: 'owner',
                header: 'Owner',
                width: pixel(140),
                renderCell: (feature: Feature) => (
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {feature.owner}
                  </Text>
                ),
              },
            ]),
      ]}
    />
  );
}

// ============= BLOCKERS =============

function BlockerList({release, isMobile}: {release: Release; isMobile: boolean}) {
  if (release.blockers.length === 0) {
    return (
      <HStack gap={2} vAlign="center">
        <Icon icon={CheckIcon} size="sm" color="success" />
        <Text type="supporting" color="secondary">
          No blocking issues filed against this train.
        </Text>
      </HStack>
    );
  }

  return (
    <List density="compact" hasDividers>
      {release.blockers.map(blocker => (
        <ListItem
          key={blocker.id}
          label={blocker.title}
          description={\`\${blocker.id} · \${blocker.owner} · opened \${blocker.openedAt}\`}
          startContent={
            <StatusDot
              variant={SEVERITY[blocker.severity].dot}
              label={SEVERITY[blocker.severity].label}
              isPulsing={
                blocker.severity === 'sev1' && blocker.status === 'open'
              }
            />
          }
          endContent={
            // Phone rows keep only the severity Badge; the state Token is
            // redundant with the pulsing dot + description at that width.
            isMobile ? (
              <Badge
                variant={SEVERITY[blocker.severity].badge}
                label={SEVERITY[blocker.severity].label}
              />
            ) : (
              <HStack gap={2} vAlign="center">
                <Badge
                  variant={SEVERITY[blocker.severity].badge}
                  label={SEVERITY[blocker.severity].label}
                />
                <Token
                  size="sm"
                  color={BLOCKER_STATUS[blocker.status].token}
                  label={BLOCKER_STATUS[blocker.status].label}
                />
              </HStack>
            )
          }
        />
      ))}
    </List>
  );
}

// ============= READINESS PANEL =============
// Rendered in the docked LayoutPanel above 1024px and inline in the content
// column below it — identical markup either way (single-pane fallback).

function ReadinessPanel({
  release,
  isMobile,
  onToggleSignoff,
  onSetPickState,
}: {
  release: Release;
  isMobile: boolean;
  onToggleSignoff: (releaseId: string, itemId: string, signed: boolean) => void;
  onSetPickState: (releaseId: string, pickId: string, state: PickState) => void;
}) {
  const verdict = verdictOf(release);
  const signedCount = release.checklist.filter(item => item.signed).length;
  const pendingPicks = release.picks.filter(pick => pick.state === 'pending');
  const isArchived = release.status === 'shipped';
  // ~40px tap targets on phones for the queue's primary actions.
  const actionSize = isMobile ? 'md' : 'sm';

  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={ClipboardCheckIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={3}>Go / No-Go</Heading>
          </StackItem>
          <Badge variant={VERDICT[verdict].badge} label={VERDICT[verdict].label} />
        </HStack>
        <Text type="supporting" color="secondary">
          {verdictSummary(release)}
        </Text>
        {release.checklist.length > 0 && (
          <VStack gap={1}>
            <div style={styles.signoffBar}>
              <ProgressBar
                value={signedCount}
                max={release.checklist.length}
                label={\`\${signedCount} of \${release.checklist.length} sign-offs recorded\`}
                isLabelHidden
                variant={verdict === 'no-go' ? 'error' : 'success'}
              />
            </div>
            <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>
              {signedCount}/{release.checklist.length} sign-offs recorded
            </Text>
          </VStack>
        )}
      </VStack>

      {release.checklist.length > 0 ? (
        <VStack gap={2}>
          {release.checklist.map(item => (
            <CheckboxInput
              key={item.id}
              label={item.label}
              description={\`\${item.owner} · \${item.role}\`}
              value={item.signed}
              isReadOnly={isArchived}
              onChange={checked => onToggleSignoff(release.id, item.id, checked)}
              width="100%"
            />
          ))}
          {isArchived && (
            <Text type="supporting" size="sm" color="secondary">
              This train shipped — the checklist is read-only for the record.
            </Text>
          )}
        </VStack>
      ) : (
        <Text type="supporting" color="secondary">
          The go/no-go checklist opens when the branch is cut on{' '}
          {release.cutAt}.
        </Text>
      )}

      <Divider />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={GitCommitHorizontalIcon} size="sm" color="secondary" />
          <StackItem size="fill">
            <Heading level={3}>Cherry-pick queue</Heading>
          </StackItem>
          {release.picks.length > 0 && (
            <Badge
              variant={pendingPicks.length > 0 ? 'warning' : 'neutral'}
              label={\`\${pendingPicks.length} pending\`}
            />
          )}
        </HStack>

        {release.picks.length === 0 ? (
          <Text type="supporting" color="secondary">
            {release.picksNote ?? 'No cherry-pick requests.'}
          </Text>
        ) : (
          <VStack gap={2}>
            {release.picks.map(pick => (
              <Card key={pick.id} variant="muted" padding={3}>
                <VStack gap={2}>
                  <HStack gap={2} vAlign="center">
                    <Code>{pick.sha}</Code>
                    <StackItem size="fill" />
                    <Badge
                      variant={PICK_RISK[pick.risk].badge}
                      label={PICK_RISK[pick.risk].label}
                    />
                  </HStack>
                  <Text type="body" size="sm">
                    {pick.title}
                  </Text>
                  <Text type="supporting" size="sm" color="secondary">
                    {pick.author} · requested {pick.requestedAt}
                  </Text>
                  {pick.state === 'pending' ? (
                    <HStack gap={2}>
                      <Button
                        label="Approve"
                        variant="secondary"
                        size={actionSize}
                        icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
                        onClick={() =>
                          onSetPickState(release.id, pick.id, 'approved')
                        }
                      />
                      <Button
                        label="Deny"
                        variant="ghost"
                        size={actionSize}
                        icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                        onClick={() =>
                          onSetPickState(release.id, pick.id, 'denied')
                        }
                      />
                    </HStack>
                  ) : (
                    <HStack gap={2} vAlign="center">
                      <Badge
                        variant={pick.state === 'approved' ? 'success' : 'error'}
                        label={pick.state === 'approved' ? 'Approved' : 'Denied'}
                      />
                      <Button
                        label="Undo"
                        variant="ghost"
                        size={actionSize}
                        onClick={() =>
                          onSetPickState(release.id, pick.id, 'pending')
                        }
                      />
                    </HStack>
                  )}
                </VStack>
              </Card>
            ))}
            <Text type="supporting" size="sm" color="secondary">
              Approved picks merge to <Code>{release.branch}</Code> on the next
              batch build. High-risk picks need a second captain approval.
            </Text>
          </VStack>
        )}
      </VStack>
    </VStack>
  );
}

// ============= PAGE =============

export default function ReleaseTrainOverviewTemplate() {
  const [releases, setReleases] = useState<Release[]>(INITIAL_RELEASES);
  const [selectedId, setSelectedId] = useState('v2.41');

  // <=1024px: the readiness panel undocks and renders inline after the
  // blocker list — single-pane fallback, nothing is hidden on phones.
  const isNarrow = useMediaQuery('(max-width: 1024px)');
  // <=900px: the feature table hides the Owner column.
  const isCompact = useMediaQuery('(max-width: 900px)');
  // <=640px: header buttons go icon-only, the Rollout column folds into the
  // flag cell, blocker rows drop the state Token, and queue actions grow to
  // ~40px tap targets.
  const isMobile = useMediaQuery('(max-width: 640px)');

  const panel = useResizable({
    defaultSize: 380,
    minSizePx: 320,
    maxSizePx: 460,
  });

  const selected =
    releases.find(release => release.id === selectedId) ?? releases[0];
  const selectedStatus = TRAIN_STATUS[selected.status];
  const selectedVerdict = verdictOf(selected);

  const frozenTrain = releases.find(release => release.status === 'frozen');
  const pendingPickTotal = releases.reduce(
    (total, release) =>
      total + release.picks.filter(pick => pick.state === 'pending').length,
    0,
  );

  const toggleSignoff = (releaseId: string, itemId: string, signed: boolean) => {
    setReleases(prev =>
      prev.map(release =>
        release.id === releaseId
          ? {
              ...release,
              checklist: release.checklist.map(item =>
                item.id === itemId ? {...item, signed} : item,
              ),
            }
          : release,
      ),
    );
  };

  const setPickState = (releaseId: string, pickId: string, state: PickState) => {
    setReleases(prev =>
      prev.map(release =>
        release.id === releaseId
          ? {
              ...release,
              picks: release.picks.map(pick =>
                pick.id === pickId ? {...pick, state} : pick,
              ),
            }
          : release,
      ),
    );
  };

  const refresh = () => {
    setReleases(
      INITIAL_RELEASES.map(release => ({
        ...release,
        checklist: release.checklist.map(item => ({...item})),
        picks: release.picks.map(pick => ({...pick})),
      })),
    );
  };

  const readinessSection = (
    <ReadinessPanel
      release={selected}
      isMobile={isMobile}
      onToggleSignoff={toggleSignoff}
      onSetPickState={setPickState}
    />
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={3} vAlign="center" wrap="wrap">
            <Icon icon={TrainFrontIcon} size="md" color="secondary" />
            <StackItem size="fill">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={1}>Release Train</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {releases.length} trains on the board
                  {frozenTrain != null
                    ? \` · next ship \${frozenTrain.shipAt}\`
                    : ''}
                  {pendingPickTotal > 0
                    ? \` · \${pendingPickTotal} picks pending\`
                    : ''}
                </Text>
              </HStack>
            </StackItem>
            <ButtonGroup label="Release train actions" size="sm">
              <Button
                label="Refresh"
                variant="secondary"
                size="sm"
                isIconOnly={isMobile}
                tooltip={isMobile ? 'Refresh' : undefined}
                icon={<Icon icon={RefreshCwIcon} size="sm" color="inherit" />}
                onClick={refresh}
              />
              <Button
                label="Open runbook"
                variant="secondary"
                size="sm"
                isIconOnly={isMobile}
                tooltip={isMobile ? 'Open runbook' : undefined}
                icon={
                  <Icon icon={ExternalLinkIcon} size="sm" color="inherit" />
                }
                onClick={() => {}}
              />
            </ButtonGroup>
          </HStack>
        </LayoutHeader>
      }
      content={
        <LayoutContent>
          <VStack gap={4}>
            <Text type="supporting" color="secondary">
              One train leaves every Tuesday: the branch is cut, stabilizes
              for a week under cherry-pick review, then ships. Today is{' '}
              {TODAY_LABEL} — pick a stop on the rail to inspect that train.
            </Text>

            <TrainRail
              releases={releases}
              selectedId={selected.id}
              onSelect={setSelectedId}
            />

            {/* ---- Selected release fact sheet ---- */}
            <VStack gap={2}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <StatusDot
                  variant={selectedStatus.dot}
                  label={selectedStatus.label}
                  isPulsing={selectedVerdict === 'no-go'}
                />
                <Heading level={2}>
                  {selected.version} {selected.codename}
                </Heading>
                <Token
                  size="sm"
                  color={selectedStatus.token}
                  label={selectedStatus.label}
                />
                <Badge
                  variant={VERDICT[selectedVerdict].badge}
                  label={VERDICT[selectedVerdict].label}
                />
              </HStack>
              <MetadataList
                columns={isMobile ? 'single' : 2}
                label={{position: 'start', width: 88}}>
                <MetadataListItem label="Branch">
                  <Code>{selected.branch}</Code>
                </MetadataListItem>
                <MetadataListItem label="Captain">
                  {selected.captain}
                </MetadataListItem>
                <MetadataListItem label="Schedule">
                  Cut {selected.cutAt} · Freeze {selected.freezeAt} · Ship{' '}
                  {selected.shipAt}
                </MetadataListItem>
                <MetadataListItem label="Cadence">{CADENCE}</MetadataListItem>
              </MetadataList>
            </VStack>

            {selected.status === 'frozen' && selectedVerdict === 'no-go' && (
              <Banner
                status="error"
                title={\`Freeze in effect — \${selected.version} is No-Go\`}
                description="An open sev1 blocker is holding the ship gate. Only reviewed cherry-picks may land on the release branch until it clears."
              />
            )}
            {selected.status === 'cut' && (
              <Banner
                status="info"
                title={\`Branch cut — \${selected.version} freezes \${selected.freezeAt}\`}
                description="Commits land directly until freeze. Features expected on this train should be behind a flag before the freeze date."
                isDismissable
              />
            )}

            {/* ---- Features on this train ---- */}
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Heading level={3}>In this train</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {selected.features.length} feature
                  {selected.features.length === 1 ? '' : 's'}
                </Text>
              </HStack>
              <FeatureTable
                release={selected}
                isCompact={isCompact}
                isMobile={isMobile}
              />
              <Text type="supporting" size="sm" color="secondary">
                Unflagged changes cannot be turned off after ship — the
                rollback path is a cherry-picked revert on the release branch.
              </Text>
            </VStack>

            {/* ---- Blocking issues ---- */}
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Icon icon={ShieldAlertIcon} size="sm" color="secondary" />
                <Heading level={3}>Blocking issues</Heading>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {selected.blockers.length} filed
                </Text>
              </HStack>
              <BlockerList release={selected} isMobile={isMobile} />
            </VStack>

            {/* <=1024px: the docked panel is gone, so readiness renders
                inline here — same component, single-pane fallback. */}
            {isNarrow && (
              <>
                <Divider />
                {readinessSection}
              </>
            )}
          </VStack>
        </LayoutContent>
      }
      end={
        isNarrow ? undefined : (
          <>
            <ResizeHandle
              direction="horizontal"
              hasDivider
              isAlwaysVisible={false}
              resizable={panel.props}
              label="Resize readiness panel"
            />
            <LayoutPanel
              width={panel.size}
              padding={0}
              label={\`Readiness for \${selected.version}\`}>
              <div style={styles.panelBody}>{readinessSection}</div>
            </LayoutPanel>
          </>
        )
      }
    />
  );
}
`;export{e as default};