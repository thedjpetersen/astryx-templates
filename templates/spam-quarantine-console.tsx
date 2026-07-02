// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file spam-quarantine-console.tsx
 * @input Deterministic fixtures only (11 quarantined messages with fixed ISO
 *   received times spanning Jul 1–2 2026, per-rule spam-score breakdowns that
 *   sum exactly to the displayed score, sender-reputation records, and
 *   plain-text body previews; all sender domains use `.example`)
 * @output Mail-admin quarantine review console: a LayoutHeader with the
 *   console title, compact inline stat chips ('47 quarantined today',
 *   '312 auto-blocked', 'false-positive rate 0.4%' — chips, not dashboard
 *   Cards) and a filter row (severity SegmentedControl + sender-domain
 *   TextInput); a full-width checkbox-selectable Table of quarantined
 *   messages (sender + domain, subject, severity-colored spam-score Badge,
 *   detection-reason Tokens, received Timestamp). Checking rows summons a
 *   floating bottom-center bulk Toolbar ('Release N', 'Block senders',
 *   'Delete' behind an AlertDialog). Clicking a row opens a 380px end
 *   LayoutPanel with the per-rule score breakdown (rule → points with mini
 *   ProgressBars), a sender-reputation MetadataList, a bordered plain-text
 *   body preview, and Release / Block-domain verdict buttons.
 * @position Page template; emitted by `astryx template spam-quarantine-console`
 *
 * Frame: Layout height="fill" owns the page. LayoutHeader carries the title,
 * stat chips, and the filter row. LayoutContent (padding 0) holds the
 * full-width Table with its own scroll; the bulk Toolbar floats bottom-center
 * over the table (position: absolute in the content wrapper) whenever the
 * visible selection count > 0. The end LayoutPanel (380px, own scroll,
 * closable X) opens on row selection.
 *
 * Container policy (security review-queue archetype): frame-first rows and
 * panels, zero Cards — the stat strip is inline chips, the detail panel is a
 * LayoutPanel, and the only elevated surface is the floating bulk Toolbar.
 *
 * Choose over table-bulk-actions when the table is a security review queue
 * whose detail panel explains a SCORE (rule-by-rule breakdown, sender
 * reputation) and whose actions are release/block verdicts; choose over
 * inbox because the operator is an admin judging other people's mail, not
 * reading their own.
 *
 * Responsive contract:
 * - >1000px  — header | full-width table | end LayoutPanel 380px when a row
 *   is open. Table and panel scroll independently.
 * - <=1000px — the detail panel becomes a full-height overlay sheet pinned
 *   to the right edge (380px, capped at 92vw) above the table.
 * - Detection-reason Tokens stay on one line: up to two render inline and
 *   the rest collapse into a '+N' Token whose Tooltip lists the hidden
 *   reasons. The visible budget drops to one token when the detail panel is
 *   open or at <=760px, where the filter row also wraps.
 * - The floating bulk Toolbar stays bottom-centered over the table region at
 *   every width.
 */

import {useMemo, useState, type CSSProperties} from 'react';

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
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Badge} from '@astryxdesign/core/Badge';
import {Banner} from '@astryxdesign/core/Banner';
import {Button} from '@astryxdesign/core/Button';
import {ButtonGroup} from '@astryxdesign/core/ButtonGroup';
import {CheckboxInput} from '@astryxdesign/core/CheckboxInput';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn, TablePlugin} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Toolbar} from '@astryxdesign/core/Toolbar';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

import {
  BanIcon,
  InboxIcon,
  MailCheckIcon,
  SearchIcon,
  ShieldAlertIcon,
  ShieldBanIcon,
  ShieldCheckIcon,
  Trash2Icon,
  XIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Content wrapper is the positioning context for the floating bulk
  // Toolbar; the table scrolls inside it.
  contentWrap: {
    position: 'relative',
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  bannerRow: {
    padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-2)',
  },
  tableScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    // Keep the last rows reachable underneath the floating toolbar.
    paddingBottom: 72,
  },
  // Compact inline stat chip — deliberately not a dashboard Card.
  statChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    paddingBlock: 2,
    paddingInline: 'var(--spacing-2)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    whiteSpace: 'nowrap',
  },
  // Floating bulk-action bar: bottom-centered over the table region.
  bulkBar: {
    position: 'absolute',
    left: '50%',
    bottom: 'var(--spacing-4)',
    transform: 'translateX(-50%)',
    zIndex: 5,
    maxWidth: 'calc(100% - var(--spacing-4) * 2)',
  },
  bulkBarSurface: {
    backgroundColor: 'var(--color-background-popover)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    paddingInline: 'var(--spacing-2)',
  },
  // <=1000px: the detail panel becomes a full-height overlay sheet.
  overlaySheet: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    insetInlineEnd: 0,
    width: 'min(380px, 92vw)',
    zIndex: 6,
    backgroundColor: 'var(--color-background-surface)',
    borderInlineStart: '1px solid var(--color-border)',
    boxShadow: 'var(--shadow-high)',
    overflowY: 'auto',
  },
  panelBody: {
    padding: 'var(--spacing-4)',
  },
  // Plain-text body preview in a bordered box.
  bodyPreview: {
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-3)',
    whiteSpace: 'pre-line',
  },
  breakdownPoints: {
    flexShrink: 0,
    fontVariantNumeric: 'tabular-nums',
  },
  rowTimestamp: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============
// Deterministic fixtures: fixed ISO received times, per-rule breakdowns that
// sum exactly to the displayed score, `.example` domains only. No clocks,
// randomness, or network assets; nothing resembles a real credential.

type Severity = 'high' | 'medium' | 'low';

interface ScoreRule {
  rule: string;
  points: number;
}

interface QuarantineRow extends Record<string, unknown> {
  id: string;
  sender: string; // local part
  domain: string;
  subject: string;
  score: number;
  reasons: string[];
  breakdown: ScoreRule[];
  receivedAt: string;
  firstSeen: string;
  messagesReceived: number;
  priorReleases: number;
  bodyPreview: string;
}

const QUARANTINE_FIXTURES: QuarantineRow[] = [
  {
    id: 'q-01',
    sender: 'billing-alerts',
    domain: 'paypa1-secure.example',
    subject: 'Action required: verify your account within 24 hours',
    score: 9.1,
    reasons: ['Lookalike domain', 'Link mismatch', 'SPF fail', 'Urgency'],
    breakdown: [
      {rule: 'Lookalike domain', points: 3.5},
      {rule: 'URL text/href mismatch', points: 2.4},
      {rule: 'SPF hard fail', points: 2.0},
      {rule: 'Urgency keywords', points: 1.2},
    ],
    receivedAt: '2026-07-02T06:14:00',
    firstSeen: '2026-06-29T11:20:00',
    messagesReceived: 4,
    priorReleases: 0,
    bodyPreview:
      'Dear customer,\nWe detected unusual sign-in activity. Verify your account within 24 hours or it will be suspended.\nClick here: Secure Account Center',
  },
  {
    id: 'q-02',
    sender: 'newsletter',
    domain: 'growthblast.example',
    subject: "You won't believe these numbers",
    score: 6.4,
    reasons: ['Bulk sender', 'DKIM missing'],
    breakdown: [
      {rule: 'Bulk-send fingerprint', points: 3.0},
      {rule: 'DKIM signature missing', points: 2.2},
      {rule: 'Image-heavy body', points: 1.2},
    ],
    receivedAt: '2026-07-02T05:02:00',
    firstSeen: '2026-05-14T09:00:00',
    messagesReceived: 38,
    priorReleases: 2,
    bodyPreview:
      'Growth hackers,\nOur latest case study shows a 480% lift in seven days. Screenshots inside.\nUnsubscribe at any time.',
  },
  {
    id: 'q-03',
    sender: 'invoices',
    domain: 'merrittsupply.example',
    subject: 'Invoice #8841 — Net 30 terms',
    score: 5.2,
    reasons: ['New domain', 'Attachment'],
    breakdown: [
      {rule: 'Newly registered domain', points: 2.6},
      {rule: 'PDF attachment heuristics', points: 1.6},
      {rule: 'No prior correspondence', points: 1.0},
    ],
    receivedAt: '2026-07-02T04:40:00',
    firstSeen: '2026-07-01T15:12:00',
    messagesReceived: 1,
    priorReleases: 0,
    bodyPreview:
      'Hello,\nPlease find attached invoice #8841 for the June facilities order, due on Net 30 terms.\nMerritt Supply Co. — Accounts Receivable',
  },
  {
    id: 'q-04',
    sender: 'it-helpdesk',
    domain: 'corp-sso-reset.example',
    subject: 'Your password expires today — reset now',
    score: 8.7,
    reasons: ['Credential lure', 'Link mismatch', 'SPF fail'],
    breakdown: [
      {rule: 'Credential-harvest pattern', points: 3.4},
      {rule: 'URL text/href mismatch', points: 2.5},
      {rule: 'SPF hard fail', points: 2.0},
      {rule: 'Urgency keywords', points: 0.8},
    ],
    receivedAt: '2026-07-02T03:26:00',
    firstSeen: '2026-07-02T03:26:00',
    messagesReceived: 2,
    priorReleases: 0,
    bodyPreview:
      'IT NOTICE\nYour network password expires today. Use the reset portal below to keep access to email and files.\nReset portal: Company Login',
  },
  {
    id: 'q-05',
    sender: 'promo',
    domain: 'dealstormoutlet.example',
    subject: 'FINAL HOURS: 90% off everything',
    score: 6.9,
    reasons: ['Bulk sender', 'Spam keywords', 'DKIM missing'],
    breakdown: [
      {rule: 'Bulk-send fingerprint', points: 2.8},
      {rule: 'Promotional keyword density', points: 2.1},
      {rule: 'DKIM signature missing', points: 2.0},
    ],
    receivedAt: '2026-07-01T22:48:00',
    firstSeen: '2026-04-03T08:30:00',
    messagesReceived: 61,
    priorReleases: 0,
    bodyPreview:
      'EVERYTHING MUST GO!\n90% off sitewide ends at midnight. No code needed.\nShop the clearance event now.',
  },
  {
    id: 'q-06',
    sender: 'no-reply',
    domain: 'docsign-mailer.example',
    subject: 'Document waiting: Q3 vendor agreement',
    score: 7.8,
    reasons: ['Lookalike domain', 'Link mismatch'],
    breakdown: [
      {rule: 'Lookalike domain', points: 3.2},
      {rule: 'URL text/href mismatch', points: 2.6},
      {rule: 'Hidden tracking pixels', points: 2.0},
    ],
    receivedAt: '2026-07-01T20:15:00',
    firstSeen: '2026-06-27T13:45:00',
    messagesReceived: 3,
    priorReleases: 0,
    bodyPreview:
      'A document is waiting for your signature: "Q3 vendor agreement.pdf".\nReview and sign before July 3 to avoid delays.',
  },
  {
    id: 'q-07',
    sender: 'karen.mills',
    domain: 'brightpath-consult.example',
    subject: 'Following up on our proposal',
    score: 4.6,
    reasons: ['New domain'],
    breakdown: [
      {rule: 'Newly registered domain', points: 2.4},
      {rule: 'Low sender volume', points: 1.2},
      {rule: 'Link shortener', points: 1.0},
    ],
    receivedAt: '2026-07-01T16:03:00',
    firstSeen: '2026-06-30T10:05:00',
    messagesReceived: 2,
    priorReleases: 1,
    bodyPreview:
      'Hi team,\nJust checking whether you had a chance to review the onboarding proposal we sent Monday.\nHappy to walk through it this week.\nKaren',
  },
  {
    id: 'q-08',
    sender: 'rewards',
    domain: 'air-miles-bonus.example',
    subject: 'Claim your 50,000 bonus miles before midnight',
    score: 9.4,
    reasons: ['Lookalike domain', 'Spam keywords', 'SPF fail', 'Reply-to mismatch'],
    breakdown: [
      {rule: 'Lookalike domain', points: 3.5},
      {rule: 'Promotional keyword density', points: 2.4},
      {rule: 'SPF hard fail', points: 2.0},
      {rule: 'Reply-to mismatch', points: 1.5},
    ],
    receivedAt: '2026-07-02T01:37:00',
    firstSeen: '2026-06-25T19:58:00',
    messagesReceived: 9,
    priorReleases: 0,
    bodyPreview:
      'Congratulations!\nYou were selected for 50,000 bonus miles. Claim before midnight tonight — this offer will not repeat.\nClaim now: Rewards Center',
  },
  {
    id: 'q-09',
    sender: 'security-notice',
    domain: 'm365-account-alerts.example',
    subject: 'Unusual sign-in detected on a new device',
    score: 8.2,
    reasons: ['Lookalike domain', 'Credential lure', 'SPF fail'],
    breakdown: [
      {rule: 'Lookalike domain', points: 3.3},
      {rule: 'Credential-harvest pattern', points: 2.9},
      {rule: 'SPF hard fail', points: 2.0},
    ],
    receivedAt: '2026-07-01T14:22:00',
    firstSeen: '2026-07-01T09:10:00',
    messagesReceived: 2,
    priorReleases: 0,
    bodyPreview:
      'Security alert\nWe noticed a sign-in from an unrecognized device in another region. Review the activity to keep your account safe.\nReview activity: Account Security',
  },
  {
    id: 'q-10',
    sender: 'events',
    domain: 'summitseries.example',
    subject: 'Last chance: speaker lineup revealed',
    score: 4.9,
    reasons: ['Bulk sender', 'Link shortener'],
    breakdown: [
      {rule: 'Bulk-send fingerprint', points: 2.2},
      {rule: 'Image-heavy body', points: 1.5},
      {rule: 'Link shortener', points: 1.2},
    ],
    receivedAt: '2026-07-01T12:47:00',
    firstSeen: '2026-03-18T10:00:00',
    messagesReceived: 24,
    priorReleases: 3,
    bodyPreview:
      'The full speaker lineup for Summit Series is live.\nEarly-bird pricing ends Friday — reserve your seat today.\nSee the agenda inside.',
  },
  {
    id: 'q-11',
    sender: 'shipping-update',
    domain: 'parceltrack-status.example',
    subject: 'Your package could not be delivered',
    score: 7.3,
    reasons: ['Lookalike domain', 'Link mismatch', 'Urgency'],
    breakdown: [
      {rule: 'Lookalike domain', points: 2.9},
      {rule: 'URL text/href mismatch', points: 2.4},
      {rule: 'No prior correspondence', points: 1.0},
      {rule: 'Urgency keywords', points: 1.0},
    ],
    receivedAt: '2026-07-01T11:05:00',
    firstSeen: '2026-06-30T21:40:00',
    messagesReceived: 5,
    priorReleases: 0,
    bodyPreview:
      'Delivery attempt failed.\nYour package is being held at the depot. Confirm your address within 48 hours to schedule redelivery.\nConfirm address: Delivery Portal',
  },
];

// Header stat strip — fixed daily counters for the console chrome.
const STAT_CHIPS = [
  {id: 'quarantined', icon: ShieldAlertIcon, label: '47 quarantined today'},
  {id: 'blocked', icon: ShieldBanIcon, label: '312 auto-blocked'},
  {id: 'false-positive', icon: ShieldCheckIcon, label: 'false-positive rate 0.4%'},
] as const;

function severityOf(score: number): Severity {
  if (score >= 8) {
    return 'high';
  }
  return score >= 5 ? 'medium' : 'low';
}

const SEVERITY_BADGE: Record<Severity, 'error' | 'warning' | 'neutral'> = {
  high: 'error',
  medium: 'warning',
  low: 'neutral',
};

const SEVERITY_PROGRESS: Record<Severity, 'error' | 'warning' | 'neutral'> = {
  high: 'error',
  medium: 'warning',
  low: 'neutral',
};

/** Newest first, stable — fixtures are unique by receivedAt. */
function byNewest(a: QuarantineRow, b: QuarantineRow): number {
  return a.receivedAt < b.receivedAt ? 1 : -1;
}

// ============= PAGE =============

export default function SpamQuarantineConsoleTemplate() {
  const [rows, setRows] = useState<QuarantineRow[]>(
    () => [...QUARANTINE_FIXTURES].sort(byNewest),
  );
  const [selectedIds, setSelectedIds] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [openRowId, setOpenRowId] = useState<string | null>(null);
  const [severityFilter, setSeverityFilter] = useState('all');
  const [domainQuery, setDomainQuery] = useState('');
  const [blockedDomains, setBlockedDomains] = useState<ReadonlySet<string>>(
    () => new Set(),
  );
  const [banner, setBanner] = useState<{
    status: 'success' | 'info';
    title: string;
  } | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Responsive contract (see file header).
  const isPanelOverlay = useMediaQuery('(max-width: 1000px)');
  const isNarrow = useMediaQuery('(max-width: 760px)');

  // ---- derived state ----
  const normalizedQuery = domainQuery.trim().toLowerCase();
  const visibleRows = useMemo(
    () =>
      rows.filter(row => {
        if (severityFilter !== 'all' && severityOf(row.score) !== severityFilter) {
          return false;
        }
        if (normalizedQuery === '') {
          return true;
        }
        return `${row.sender}@${row.domain}`
          .toLowerCase()
          .includes(normalizedQuery);
      }),
    [rows, severityFilter, normalizedQuery],
  );

  // Bulk actions only ever operate on rows the admin can currently see.
  const selectedVisibleIds = useMemo(
    () => visibleRows.filter(row => selectedIds.has(row.id)).map(row => row.id),
    [visibleRows, selectedIds],
  );
  const selectedCount = selectedVisibleIds.length;
  const allVisibleSelected =
    visibleRows.length > 0 && selectedCount === visibleRows.length;

  const openRow = rows.find(row => row.id === openRowId) ?? null;
  const openRowBlocked = openRow != null && blockedDomains.has(openRow.domain);

  // ---- selection ----
  const toggleRow = (id: string, checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (checked) {
        next.add(id);
      } else {
        next.delete(id);
      }
      return next;
    });
  };

  const toggleAllVisible = (checked: boolean) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      for (const row of visibleRows) {
        if (checked) {
          next.add(row.id);
        } else {
          next.delete(row.id);
        }
      }
      return next;
    });
  };

  const clearSelection = () => setSelectedIds(new Set());

  // ---- verdict actions ----
  const removeRows = (ids: string[]) => {
    const removed = new Set(ids);
    setRows(prev => prev.filter(row => !removed.has(row.id)));
    setSelectedIds(prev => {
      const next = new Set(prev);
      for (const id of ids) {
        next.delete(id);
      }
      return next;
    });
    if (openRowId != null && removed.has(openRowId)) {
      setOpenRowId(null);
    }
  };

  const releaseRows = (ids: string[]) => {
    if (ids.length === 0) {
      return;
    }
    removeRows(ids);
    setBanner({
      status: 'success',
      title: `Released ${ids.length} ${
        ids.length === 1 ? 'message' : 'messages'
      } to recipient ${ids.length === 1 ? 'inbox' : 'inboxes'}.`,
    });
  };

  const blockSelectedSenders = () => {
    if (selectedCount === 0) {
      return;
    }
    const domains = new Set(
      rows
        .filter(row => selectedVisibleIds.includes(row.id))
        .map(row => row.domain),
    );
    setBlockedDomains(prev => new Set([...prev, ...domains]));
    setBanner({
      status: 'info',
      title: `Blocked ${domains.size} sender ${
        domains.size === 1 ? 'domain' : 'domains'
      } — future mail is rejected at the gateway.`,
    });
    clearSelection();
  };

  const deleteSelected = () => {
    const count = selectedCount;
    removeRows(selectedVisibleIds);
    setIsDeleteDialogOpen(false);
    setBanner({
      status: 'info',
      title: `Deleted ${count} ${
        count === 1 ? 'message' : 'messages'
      } permanently.`,
    });
  };

  const blockDomain = (domain: string) => {
    setBlockedDomains(prev => new Set([...prev, domain]));
  };

  // ---- table ----
  // Tokens never wrap to a second line: render up to `budget` inline and
  // collapse the rest into a '+N' Token with a Tooltip. The budget shrinks
  // to one when the reasons column is squeezed (narrow viewport or open
  // detail panel).
  const reasonTokenBudget = isNarrow || openRowId != null ? 1 : 2;
  const reasonTokens = (row: QuarantineRow) => {
    const color = severityOf(row.score) === 'high' ? 'red' : 'default';
    const visible = row.reasons.slice(0, reasonTokenBudget);
    const hidden = row.reasons.slice(reasonTokenBudget);
    return (
      <HStack gap={1} vAlign="center" style={{whiteSpace: 'nowrap'}}>
        {visible.map(reason => (
          <Token key={reason} label={reason} size="sm" color={color} />
        ))}
        {hidden.length > 0 && (
          <Tooltip content={hidden.join(' · ')}>
            <Token label={`+${hidden.length}`} size="sm" />
          </Tooltip>
        )}
      </HStack>
    );
  };

  const columns: TableColumn<QuarantineRow>[] = [
    {
      key: 'select',
      header: (
        <CheckboxInput
          label="Select all visible messages"
          isLabelHidden
          size="sm"
          value={
            allVisibleSelected
              ? true
              : selectedCount > 0
                ? 'indeterminate'
                : false
          }
          onChange={toggleAllVisible}
        />
      ),
      width: pixel(44),
      renderCell: row => (
        // Stop the click so checking a row never also opens the panel.
        <div onClick={event => event.stopPropagation()}>
          <CheckboxInput
            label={`Select message from ${row.sender}@${row.domain}`}
            isLabelHidden
            size="sm"
            value={selectedIds.has(row.id)}
            onChange={checked => toggleRow(row.id, checked)}
          />
        </div>
      ),
    },
    {
      key: 'sender',
      header: 'Sender',
      width: proportional(1.2),
      renderCell: row => (
        <VStack gap={0}>
          <Text type="label" maxLines={1}>
            {row.sender}
          </Text>
          <HStack gap={1} vAlign="center">
            {blockedDomains.has(row.domain) && (
              <StatusDot variant="error" label="Domain blocked" />
            )}
            <Text type="supporting" color="secondary" maxLines={1}>
              {blockedDomains.has(row.domain)
                ? `${row.domain} · blocked`
                : row.domain}
            </Text>
          </HStack>
        </VStack>
      ),
    },
    {
      key: 'subject',
      header: 'Subject',
      width: proportional(2),
      renderCell: row => (
        <Text type="body" maxLines={1}>
          {row.subject}
        </Text>
      ),
    },
    {
      key: 'score',
      header: 'Score',
      width: pixel(84),
      renderCell: row => (
        <Badge
          label={row.score.toFixed(1)}
          variant={SEVERITY_BADGE[severityOf(row.score)]}
        />
      ),
    },
    {
      key: 'reasons',
      header: 'Detection reasons',
      width: proportional(1.8),
      renderCell: reasonTokens,
    },
    {
      key: 'received',
      header: 'Received',
      width: pixel(150),
      align: 'end',
      renderCell: row => (
        <div style={styles.rowTimestamp}>
          <Timestamp
            value={row.receivedAt}
            format="date_time"
            hasTooltip={false}
            type="supporting"
            color="secondary"
          />
        </div>
      ),
    },
  ];

  // Row click opens the score-breakdown panel; the open row keeps an
  // accent wash so the admin can see which message the panel explains.
  const rowOpenPlugin: TablePlugin<QuarantineRow> = {
    transformBodyRow: (props, item) => ({
      ...props,
      htmlProps: {
        ...props.htmlProps,
        onClick: () => setOpenRowId(item.id),
        style: {
          ...props.htmlProps.style,
          cursor: 'pointer',
          backgroundColor:
            item.id === openRowId ? 'var(--color-accent-muted)' : undefined,
        },
      },
    }),
  };

  // ---- detail panel ----
  const panelContent =
    openRow === null ? null : (
      <VStack gap={4} style={styles.panelBody}>
        <HStack gap={2} vAlign="start">
          <StackItem size="fill">
            <VStack gap={1}>
              <HStack gap={2} vAlign="center">
                <Heading level={2}>Score {openRow.score.toFixed(1)}</Heading>
                <Badge
                  label={severityOf(openRow.score)}
                  variant={SEVERITY_BADGE[severityOf(openRow.score)]}
                />
              </HStack>
              <Text type="supporting" color="secondary" maxLines={1}>
                {openRow.sender}@{openRow.domain}
              </Text>
              <Text type="label" maxLines={2}>
                {openRow.subject}
              </Text>
            </VStack>
          </StackItem>
          <IconButton
            label="Close details"
            tooltip="Close"
            size="sm"
            variant="ghost"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
            onClick={() => setOpenRowId(null)}
          />
        </HStack>

        <Divider />

        <VStack gap={2}>
          <Heading level={3}>Rule breakdown</Heading>
          {openRow.breakdown.map(entry => (
            <VStack key={entry.rule} gap={0.5}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <Text type="supporting" color="primary" maxLines={1}>
                    {entry.rule}
                  </Text>
                </StackItem>
                <div style={styles.breakdownPoints}>
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    +{entry.points.toFixed(1)}
                  </Text>
                </div>
              </HStack>
              <ProgressBar
                label={`${entry.rule} contribution`}
                isLabelHidden
                value={entry.points}
                max={openRow.score}
                variant={SEVERITY_PROGRESS[severityOf(openRow.score)]}
              />
            </VStack>
          ))}
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Rules sum to the quarantine score: {openRow.score.toFixed(1)} /
            threshold 5.0
          </Text>
        </VStack>

        <Divider />

        <VStack gap={2}>
          <Heading level={3}>Sender reputation</Heading>
          <MetadataList columns="single">
            <MetadataListItem label="First seen">
              <Timestamp
                value={openRow.firstSeen}
                format="date"
                hasTooltip={false}
              />
            </MetadataListItem>
            <MetadataListItem label="Messages received">
              {openRow.messagesReceived}
            </MetadataListItem>
            <MetadataListItem label="Released before">
              {openRow.priorReleases}
            </MetadataListItem>
            <MetadataListItem label="Domain status">
              <HStack gap={1} vAlign="center">
                <StatusDot
                  variant={openRowBlocked ? 'error' : 'warning'}
                  label={openRowBlocked ? 'Blocked' : 'Under review'}
                />
                <Text type="body">
                  {openRowBlocked ? 'Blocked' : 'Under review'}
                </Text>
              </HStack>
            </MetadataListItem>
          </MetadataList>
        </VStack>

        <Divider />

        <VStack gap={2}>
          <Heading level={3}>Body preview</Heading>
          <div style={styles.bodyPreview}>
            <Text type="supporting" color="secondary">
              {openRow.bodyPreview}
            </Text>
          </div>
        </VStack>

        <ButtonGroup label="Verdict" size="sm">
          <Button
            label="Release"
            variant="secondary"
            icon={<Icon icon={MailCheckIcon} size="sm" color="inherit" />}
            onClick={() => releaseRows([openRow.id])}
          />
          <Button
            label={openRowBlocked ? 'Domain blocked' : 'Block domain'}
            variant="secondary"
            icon={<Icon icon={BanIcon} size="sm" color="inherit" />}
            isDisabled={openRowBlocked}
            onClick={() => blockDomain(openRow.domain)}
          />
        </ButtonGroup>
      </VStack>
    );

  // ---- header ----
  const header = (
    <LayoutHeader hasDivider>
      <VStack gap={2}>
        <HStack gap={3} vAlign="center" style={{flexWrap: 'wrap'}}>
          <HStack gap={2} vAlign="center">
            <Icon icon={ShieldAlertIcon} size="md" color="secondary" />
            <Heading level={1}>Spam quarantine</Heading>
          </HStack>
          <StackItem size="fill">
            <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
              {STAT_CHIPS.map(chip => (
                <span key={chip.id} style={styles.statChip}>
                  <Icon icon={chip.icon} size="xsm" color="secondary" />
                  <Text type="supporting" color="secondary" hasTabularNumbers>
                    {chip.label}
                  </Text>
                </span>
              ))}
            </HStack>
          </StackItem>
        </HStack>
        <HStack gap={2} vAlign="center" style={{flexWrap: 'wrap'}}>
          <SegmentedControl
            label="Severity filter"
            value={severityFilter}
            onChange={setSeverityFilter}
            size="sm">
            <SegmentedControlItem value="all" label="All" />
            <SegmentedControlItem value="high" label="High" />
            <SegmentedControlItem value="medium" label="Medium" />
            <SegmentedControlItem value="low" label="Low" />
          </SegmentedControl>
          <TextInput
            label="Filter by sender domain"
            isLabelHidden
            size="sm"
            width={240}
            placeholder="Filter by sender domain…"
            startIcon={SearchIcon}
            value={domainQuery}
            onChange={setDomainQuery}
          />
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {visibleRows.length} of {rows.length} shown
          </Text>
        </HStack>
      </VStack>
    </LayoutHeader>
  );

  // ---- floating bulk toolbar ----
  const bulkToolbar =
    selectedCount === 0 ? null : (
      <div style={styles.bulkBar}>
        <div style={styles.bulkBarSurface}>
          <Toolbar
            label="Bulk quarantine actions"
            size="sm"
            gap={2}
            startContent={
              <HStack gap={2} vAlign="center">
                <Text
                  type="label"
                  hasTabularNumbers
                  style={{whiteSpace: 'nowrap'}}>
                  {selectedCount} selected
                </Text>
                <IconButton
                  label="Clear selection"
                  tooltip="Clear selection"
                  size="sm"
                  variant="ghost"
                  icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                  onClick={clearSelection}
                />
              </HStack>
            }
            endContent={
              <HStack gap={2} vAlign="center">
                <Button
                  label={`Release ${selectedCount}`}
                  variant="secondary"
                  icon={<Icon icon={MailCheckIcon} size="sm" color="inherit" />}
                  onClick={() => releaseRows(selectedVisibleIds)}
                />
                <Button
                  label="Block senders"
                  variant="secondary"
                  icon={<Icon icon={BanIcon} size="sm" color="inherit" />}
                  onClick={blockSelectedSenders}
                />
                <Button
                  label="Delete"
                  variant="destructive"
                  icon={<Icon icon={Trash2Icon} size="sm" color="inherit" />}
                  onClick={() => setIsDeleteDialogOpen(true)}
                />
              </HStack>
            }
          />
        </div>
      </div>
    );

  const emptyTitle =
    rows.length === 0 ? 'Quarantine is clear' : 'No messages match';
  const emptyDescription =
    rows.length === 0
      ? 'Every quarantined message has been released, blocked, or deleted.'
      : 'Adjust the severity filter or the sender-domain search.';

  return (
    <Layout
      height="fill"
      header={header}
      content={
        <LayoutContent padding={0}>
          <div style={styles.contentWrap}>
            {banner != null && (
              <div style={styles.bannerRow}>
                <Banner
                  status={banner.status}
                  title={banner.title}
                  isDismissable
                  onDismiss={() => setBanner(null)}
                />
              </div>
            )}
            <div style={styles.tableScroll}>
              <Table<QuarantineRow>
                data={visibleRows}
                columns={columns}
                idKey="id"
                density="balanced"
                dividers="rows"
                hasHover
                plugins={{rowOpen: rowOpenPlugin}}
                emptyState={
                  <VStack gap={1} hAlign="center">
                    <Icon icon={InboxIcon} size="lg" color="secondary" />
                    <Text type="label">{emptyTitle}</Text>
                    <Text type="supporting" color="secondary">
                      {emptyDescription}
                    </Text>
                  </VStack>
                }
              />
            </div>
            {bulkToolbar}
            {/* <=1000px: the detail panel renders as an overlay sheet over
                the table instead of an end LayoutPanel. */}
            {isPanelOverlay && openRow !== null && (
              <div style={styles.overlaySheet} role="dialog" aria-label="Message details">
                {panelContent}
              </div>
            )}
          </div>
        </LayoutContent>
      }
      end={
        !isPanelOverlay && openRow !== null ? (
          <LayoutPanel
            width={380}
            padding={0}
            isScrollable
            hasDivider
            label="Message details">
            {panelContent}
          </LayoutPanel>
        ) : undefined
      }>
      <AlertDialog
        isOpen={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        title={`Delete ${selectedCount} ${
          selectedCount === 1 ? 'message' : 'messages'
        }?`}
        description="Deleted quarantine messages cannot be recovered, and recipients are never notified. Release instead if any message might be legitimate."
        cancelLabel="Cancel"
        actionLabel="Delete permanently"
        actionVariant="destructive"
        onAction={deleteSelected}
      />
    </Layout>
  );
}
