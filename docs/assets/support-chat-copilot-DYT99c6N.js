var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Clearway support workspace on the
 *   morning of Jul 2, 2026: seven conversations (five open, two closed with
 *   CSAT ratings), fixed SLA countdown labels, per-conversation chat threads
 *   with fixed ISO timestamps, a copilot payload per conversation (suggested
 *   reply + confidence, summary bullets, help-article matches), and a
 *   customer-context record whose seat counts and LTV math reconcile with the
 *   thread they annotate. In-session sends stamp one fixed SESSION_TIME — no
 *   Date.now(), no Math.random(), no network assets.
 * @output Support Inbox with AI Copilot — an Intercom-style live-support
 *   surface for the fictional startup Clearway. Left 320px conversation rail
 *   (All/Assigned/Unassigned SegmentedControl, per-row SLA StatusDot, CSAT
 *   emoji on closed rows); center chat thread (customer bubbles left, brand
 *   blue agent bubbles right, amber internal notes, pulsing typing indicator,
 *   macro quick-row above a Reply/Internal-note composer); right 340px AI
 *   copilot rail (suggested-reply Card with an Insert-to-composer button,
 *   rendered conversation-summary Card, help-article suggestions with
 *   confidence pills, and a customer-context Card with plan, MRR, LTV math,
 *   and a recent-events timeline). Every control is live: rail selection
 *   drives the thread and copilot, Insert and macros fill the composer,
 *   sending appends a brand-blue bubble, and Close flips the row to
 *   awaiting-CSAT.
 * @position Page template; emitted by \`astryx template support-chat-copilot\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header | start rail 320 (conversation list) | content (thread pane)
 *   | end panel 340 (copilot rail, scrolls).
 * Container policy: app-shell archetype — the rail and thread are dense rows
 *   and panels, no Cards. The only Cards are the copilot rail's genuine
 *   summary widgets (suggested reply, conversation summary, customer
 *   context), which are inspector-style surfaces by design.
 * Color policy: ONE brand accent — Clearway blue
 *   \`light-dark(#2563EB, #60A5FA)\` — on the brand mark, the copilot
 *   identity, high-confidence emphasis, and the primary send CTA. Agent
 *   bubbles are a scheme-stable brand surface \`light-dark(#2563EB, #1D4ED8)\`
 *   with explicit white text literals (both sides clear AA at >= 5.2:1);
 *   this is the documented exception. Internal notes ride the token amber
 *   surfaces; everything else is token-pure so both schemes work.
 *
 * Responsive contract:
 * - > 1240px: full three-region frame.
 * - <= 1240px: the copilot rail collapses behind a Sparkles IconButton in
 *   the page header; toggling docks the 340px end panel back.
 * - <= 860px: single-pane — the conversation rail collapses behind a back
 *   IconButton in the thread header, and the copilot toggle swaps the
 *   content region wholesale (rail, thread, or copilot always fills the
 *   width). The macro quick-row scrolls horizontally at every width.
 * - The rail list, message stream, and copilot rail scroll independently
 *   (\`minHeight: 0\` down every flex chain); the page header, thread header,
 *   macro row, and composer stay pinned.
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import {
  ArrowLeftIcon,
  BookOpenIcon,
  CheckIcon,
  ClockIcon,
  CompassIcon,
  HistoryIcon,
  MailIcon,
  MessageCircleIcon,
  PaperclipIcon,
  RefreshCwIcon,
  ReplyIcon,
  SearchIcon,
  SendIcon,
  SparklesIcon,
  StickyNoteIcon,
  ZapIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  Stack,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Tab, TabList} from '@astryxdesign/core/TabList';
import {TextArea} from '@astryxdesign/core/TextArea';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// BRAND — Clearway blue, the single accent (see Color policy above).
// ---------------------------------------------------------------------------

const BRAND_ACCENT = 'light-dark(#2563EB, #60A5FA)';
const BRAND_ACCENT_SOFT =
  'light-dark(rgba(37, 99, 235, 0.10), rgba(96, 165, 250, 0.16))';
// Agent bubbles: scheme-stable brand surface; white text clears AA on both
// sides (#2563EB 5.2:1, #1D4ED8 6.3:1 against #FFFFFF).
const BUBBLE_AGENT_BG = 'light-dark(#2563EB, #1D4ED8)';
const BUBBLE_AGENT_TEXT = '#FFFFFF';
const BUBBLE_AGENT_META = 'rgba(255, 255, 255, 0.78)';

// ---------------------------------------------------------------------------
// STYLES — one typed inline record; tokens everywhere, brand literals only.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  headerTitle: {minWidth: 0},
  brandMark: {
    width: 28,
    height: 28,
    borderRadius: 'var(--radius-container)',
    backgroundColor: BRAND_ACCENT_SOFT,
    color: BRAND_ACCENT,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // ---- conversation rail ----
  railColumn: {height: '100%', minHeight: 0},
  railControls: {paddingInline: 'var(--spacing-3)', paddingBlock: 'var(--spacing-2)'},
  railCounts: {paddingInline: 'var(--spacing-1)'},
  railScroll: {
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-3)',
  },
  railEmpty: {paddingInline: 'var(--spacing-3)', paddingTop: 'var(--spacing-4)'},
  // CSAT emoji sized to the row without inflating line height.
  csatEmoji: {fontSize: 16, lineHeight: '16px', flexShrink: 0},
  slaDotSlot: {display: 'inline-flex', alignItems: 'center', height: 16},
  // ---- thread pane ----
  threadColumn: {height: '100%', minHeight: 0},
  threadHeader: {paddingInline: 'var(--spacing-4)', paddingBlock: 'var(--spacing-3)'},
  // Status badges live on their own row — the title row's fixed content
  // (avatar + Close) must never squeeze the customer name into ellipsis at
  // narrow thread widths.
  badgeRow: {paddingTop: 'var(--spacing-2)'},
  // height 0 + flexGrow keeps long threads from pushing the pinned composer
  // below the fold; the viewport floor keeps the frame tall in an
  // auto-sized container (560px ≈ headers + macro row + composer chrome).
  messageScroll: {
    height: 0,
    minHeight: 'max(300px, calc(100dvh - 560px))',
    flexGrow: 1,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-4)',
  },
  messageStream: {maxWidth: 760, marginInline: 'auto', width: '100%'},
  bubbleRowCustomer: {justifyContent: 'flex-start'},
  bubbleRowAgent: {justifyContent: 'flex-end'},
  bubbleCustomer: {
    maxWidth: 520,
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 16,
    borderStartStartRadius: 4,
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  bubbleAgent: {
    maxWidth: 520,
    backgroundColor: BUBBLE_AGENT_BG,
    color: BUBBLE_AGENT_TEXT,
    borderRadius: 16,
    borderEndEndRadius: 4,
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  bubbleAgentMeta: {color: BUBBLE_AGENT_META},
  bubbleMetaRow: {paddingInline: 'var(--spacing-1)'},
  // Amber "team eyes only" surface — internal notes must read as a
  // different material than customer-visible bubbles.
  noteBlock: {
    backgroundColor: 'var(--color-background-yellow)',
    border: 'var(--border-width) solid var(--color-border-yellow)',
    borderRadius: 'var(--radius-container)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
  },
  typingBubble: {
    backgroundColor: 'var(--color-background-muted)',
    borderRadius: 16,
    borderStartStartRadius: 4,
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-2)',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  dayDivider: {paddingBlock: 'var(--spacing-1)'},
  // ---- macro quick-row + composer ----
  macroRow: {
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-2)',
    overflowX: 'auto',
    flexShrink: 0,
  },
  macroTrack: {display: 'flex', gap: 'var(--spacing-2)', width: 'max-content'},
  composer: {paddingInline: 'var(--spacing-4)', paddingBlock: 'var(--spacing-3)'},
  composerNoteTint: {backgroundColor: 'var(--color-background-yellow)'},
  // ---- copilot rail ----
  copilotColumn: {height: '100%', minHeight: 0},
  copilotScroll: {
    minHeight: 0,
    overflowY: 'auto',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-3)',
  },
  copilotIdentity: {color: BRAND_ACCENT},
  suggestedCard: {borderColor: BRAND_ACCENT, boxShadow: \`inset 0 0 0 1px \${BRAND_ACCENT}\`},
  suggestedQuote: {
    borderInlineStart: \`2px solid \${BRAND_ACCENT}\`,
    paddingInlineStart: 'var(--spacing-3)',
  },
  articleRow: {alignItems: 'flex-start'},
  articleConfidence: {flexShrink: 0},
  eventRow: {alignItems: 'baseline'},
  healthRow: {display: 'inline-flex', alignItems: 'center', gap: 6},
  ltvMath: {fontFamily: 'var(--font-family-code, monospace)', fontVariantNumeric: 'tabular-nums'},
  // ~40px touch targets in single-pane mode (size="sm" renders 28px).
  buttonTapTarget: {height: 40},
  iconTapTarget: {width: 40, height: 40},
};

// ---------------------------------------------------------------------------
// DATA — deterministic fixtures. The signed-in agent is Dana Whitfield on the
// Clearway live-support inbox (15-minute first-reply SLA on Scale plans).
// All in-session writes stamp SESSION_TIME so renders never touch a clock.
// ---------------------------------------------------------------------------

const SESSION_TIME = '2026-07-02T10:15:00';
const CURRENT_AGENT = 'Dana Whitfield';

type Channel = 'messenger' | 'email';
type SlaLevel = 'green' | 'amber' | 'red';
type ConversationStatus = 'open' | 'closed';
type CsatRating = 'great' | 'okay' | 'poor';

const CHANNEL_META: Record<Channel, {icon: typeof MailIcon; label: string}> = {
  messenger: {icon: MessageCircleIcon, label: 'Messenger'},
  email: {icon: MailIcon, label: 'Email'},
};

const SLA_DOT: Record<SlaLevel, 'success' | 'warning' | 'error'> = {
  green: 'success',
  amber: 'warning',
  red: 'error',
};

const SLA_BADGE: Record<SlaLevel, 'success' | 'warning' | 'error'> = {
  green: 'success',
  amber: 'warning',
  red: 'error',
};

const CSAT_META: Record<CsatRating, {emoji: string; label: string}> = {
  great: {emoji: '😄', label: 'Rated great'},
  okay: {emoji: '😐', label: 'Rated okay'},
  poor: {emoji: '😞', label: 'Rated poor'},
};

interface Conversation {
  id: string;
  customer: string;
  company: string;
  email: string;
  subject: string;
  channel: Channel;
  /** Fixed countdown label — no live clock in fixtures. */
  sla: string;
  slaLevel: SlaLevel;
  slaTarget: string;
  assignee: string | null;
  status: ConversationStatus;
  csat: CsatRating | null;
  lastActivity: string;
  snippet: string;
}

const CONVERSATIONS: Conversation[] = [
  {
    id: 'conv-sso', channel: 'messenger', status: 'open', csat: null,
    customer: 'Priya Nair', company: 'Brightloom',
    email: 'priya.nair@brightloom.io',
    subject: 'SSO login loop after domain change',
    sla: '9m left', slaLevel: 'amber', slaTarget: 'First reply 15m (Scale)',
    assignee: 'Dana Whitfield', lastActivity: '2026-07-02T10:09:00',
    snippet: 'Is there any way to let people in while we fix this? Support queue is piling up on our side.',
  },
  {
    id: 'conv-export', channel: 'email', status: 'open', csat: null,
    customer: 'Tobias Krug', company: 'Fernhollow Labs',
    email: 'tobias@fernhollowlabs.com',
    subject: 'Usage export stuck at 0 rows',
    sla: '4m left', slaLevel: 'red', slaTarget: 'First reply 30m (Growth)',
    assignee: null, lastActivity: '2026-07-02T09:49:00',
    snippet: 'The June usage export finishes instantly but every file comes back with headers and zero rows.',
  },
  {
    id: 'conv-webhook', channel: 'messenger', status: 'open', csat: null,
    customer: 'Amara Diallo', company: 'Quillstone',
    email: 'amara@quillstone.app',
    subject: 'Webhook retries hammering our endpoint',
    sla: '12m left', slaLevel: 'amber', slaTarget: 'First reply 15m (Scale)',
    assignee: null, lastActivity: '2026-07-02T10:03:00',
    snippet: 'We returned 503s during a deploy and now retries are arriving faster than our rate limit allows.',
  },
  {
    id: 'conv-billing', channel: 'email', status: 'open', csat: null,
    customer: 'Elena Vasquez', company: 'Copperleaf Studio',
    email: 'elena@copperleaf.studio',
    subject: 'Charged after downgrade to Starter',
    sla: '38m left', slaLevel: 'green', slaTarget: 'First reply 1h (Starter)',
    assignee: 'Marcus Lee', lastActivity: '2026-07-02T09:12:00',
    snippet: 'We downgraded on Jun 28 but the July 1 invoice still shows the Growth price.',
  },
  {
    id: 'conv-onboard', channel: 'messenger', status: 'open', csat: null,
    customer: 'Jonah Petrides', company: 'Saltgrass Outfitters',
    email: 'jonah@saltgrass.co',
    subject: 'Invite links expire before teammates click',
    sla: '1h 02m left', slaLevel: 'green', slaTarget: 'First reply 30m (Growth)',
    assignee: 'Ivy Tran', lastActivity: '2026-07-02T08:41:00',
    snippet: 'Half my invites bounce with "link expired" even when people click within a day.',
  },
  {
    id: 'conv-rate', channel: 'email', status: 'closed', csat: 'great',
    customer: 'Hana Sato', company: 'Miyabi Goods',
    email: 'hana@miyabigoods.jp',
    subject: 'Rate limits on the search API',
    sla: 'Met · 11m', slaLevel: 'green', slaTarget: 'First reply 15m (Scale)',
    assignee: 'Dana Whitfield', lastActivity: '2026-07-01T16:20:00',
    snippet: 'Perfect, the burst allowance covers our reindex window. Thanks!',
  },
  {
    id: 'conv-import', channel: 'email', status: 'closed', csat: 'okay',
    customer: 'Wes Corrigan', company: 'Bramblewood & Co.',
    email: 'wes@bramblewood.co',
    subject: 'CSV import mapping question',
    sla: 'Met · 26m', slaLevel: 'green', slaTarget: 'First reply 30m (Growth)',
    assignee: 'Rosa Delgado', lastActivity: '2026-07-01T11:47:00',
    snippet: 'Got it working, though the docs could spell out the date format.',
  },
];

type MessageKind = 'customer' | 'agent' | 'note';

interface ThreadMessage {
  id: string;
  kind: MessageKind;
  author: string;
  time: string;
  body: string[];
}

const INITIAL_THREADS: Record<string, ThreadMessage[]> = {
  'conv-sso': [
    {
      id: 'sso-1', kind: 'customer', author: 'Priya Nair', time: '2026-07-02T09:58:00',
      body: [
        'Hi — since we moved from brightloom.co to brightloom.io this morning, everyone who signs in with SSO gets bounced back to the login screen in a loop.',
        'Google Workspace is our IdP. Password sign-in still works for our two admins, but the other 46 seats are SSO-only.',
      ],
    },
    {
      id: 'sso-2', kind: 'agent', author: 'Dana Whitfield', time: '2026-07-02T10:02:00',
      body: [
        "Hi Priya — sorry about that, let's get you unlooped. Quick check: did the primary domain change in your IdP as well, or only on the Clearway workspace?",
      ],
    },
    {
      id: 'sso-3', kind: 'customer', author: 'Priya Nair', time: '2026-07-02T10:04:00',
      body: [
        'Only on the workspace so far. Google Workspace still shows brightloom.co as the primary domain.',
      ],
    },
    {
      id: 'sso-4', kind: 'note', author: 'Marcus Lee', time: '2026-07-02T10:06:00',
      body: [
        'Same signature as CW-4821 last month — the SAML audience URI still points at the old domain, so the IdP rejects the assertion after redirect. Fix is re-issuing metadata from Settings → SSO, not an IdP change.',
      ],
    },
    {
      id: 'sso-5', kind: 'customer', author: 'Priya Nair', time: '2026-07-02T10:09:00',
      body: [
        'Also — is there any way to let people in while we fix this? Support queue is piling up on our side.',
      ],
    },
  ],
  'conv-export': [
    {
      id: 'export-1', kind: 'customer', author: 'Tobias Krug', time: '2026-07-02T09:49:00',
      body: [
        'The June usage export finishes instantly but every file comes back with headers and zero rows. Same result from the dashboard and the API.',
        'May exports still download fine, so it looks specific to the June period.',
      ],
    },
  ],
  'conv-webhook': [
    {
      id: 'webhook-1', kind: 'customer', author: 'Amara Diallo', time: '2026-07-02T09:57:00',
      body: [
        'We returned 503s for about four minutes during a deploy and now Clearway webhook retries are arriving faster than our rate limit allows — the backlog keeps growing.',
      ],
    },
    {
      id: 'webhook-2', kind: 'customer', author: 'Amara Diallo', time: '2026-07-02T10:03:00',
      body: [
        'Is there a way to pause deliveries for an endpoint, or flush the retry queue once we are healthy again?',
      ],
    },
  ],
  'conv-billing': [
    {
      id: 'billing-1', kind: 'customer', author: 'Elena Vasquez', time: '2026-07-02T08:55:00',
      body: [
        'We downgraded from Growth to Starter on Jun 28, but the July 1 invoice still shows the Growth price of $249. Shouldn’t it be $59?',
      ],
    },
    {
      id: 'billing-2', kind: 'agent', author: 'Marcus Lee', time: '2026-07-02T09:12:00',
      body: [
        'Hi Elena — you’re right, the downgrade landed after the July invoice was generated. I’ve asked billing to reissue it at the Starter price and credit the $190 difference; you’ll see the corrected invoice within one business day.',
      ],
    },
  ],
  'conv-onboard': [
    {
      id: 'onboard-1', kind: 'customer', author: 'Jonah Petrides', time: '2026-07-02T08:20:00',
      body: [
        'Half my invites bounce with "link expired" even when people click within a day. Is there a setting I’m missing?',
      ],
    },
    {
      id: 'onboard-2', kind: 'agent', author: 'Ivy Tran', time: '2026-07-02T08:33:00',
      body: [
        'Hi Jonah — invite links inherit your workspace’s session policy, and yours is set to a 4-hour lifetime. I can raise invite-link expiry to 7 days without touching session length — want me to do that?',
      ],
    },
    {
      id: 'onboard-3', kind: 'customer', author: 'Jonah Petrides', time: '2026-07-02T08:41:00',
      body: ['Yes please — 7 days would solve it.'],
    },
  ],
  'conv-rate': [
    {
      id: 'rate-1', kind: 'customer', author: 'Hana Sato', time: '2026-07-01T16:02:00',
      body: [
        'Our nightly reindex bursts past the search API limit for a few minutes. Do we need a higher tier, or is there burst room on Scale?',
      ],
    },
    {
      id: 'rate-2', kind: 'agent', author: 'Dana Whitfield', time: '2026-07-01T16:13:00',
      body: [
        'Scale includes a 5-minute burst allowance at 3× your base limit — I’ve enabled it for your workspace, so the reindex window should pass cleanly tonight.',
      ],
    },
    {
      id: 'rate-3', kind: 'customer', author: 'Hana Sato', time: '2026-07-01T16:20:00',
      body: ['Perfect, the burst allowance covers our reindex window. Thanks!'],
    },
  ],
  'conv-import': [
    {
      id: 'import-1', kind: 'customer', author: 'Wes Corrigan', time: '2026-07-01T11:21:00',
      body: [
        'Trying to import our contact CSV — which column headers does the mapper expect, and what date format?',
      ],
    },
    {
      id: 'import-2', kind: 'agent', author: 'Rosa Delgado', time: '2026-07-01T11:39:00',
      body: [
        'Headers can be anything — the mapper lets you match columns on step 2. Dates need ISO format (2026-07-01); I’ve attached our template so the first import goes smoothly.',
      ],
    },
    {
      id: 'import-3', kind: 'customer', author: 'Wes Corrigan', time: '2026-07-01T11:47:00',
      body: ['Got it working, though the docs could spell out the date format.'],
    },
  ],
};

/** Fixed presence fixture: which customer is mid-message right now. */
const CUSTOMER_TYPING: Record<string, string> = {
  'conv-sso': 'Priya Nair',
};

// ---------------------------------------------------------------------------
// COPILOT — deterministic per-conversation payloads: a drafted reply with a
// confidence score and basis line, rendered summary bullets, and ranked
// help-article matches. Generated timestamps are fixed fixtures.
// ---------------------------------------------------------------------------

interface ArticleMatch {
  id: string;
  title: string;
  collection: string;
  confidence: number;
}

interface CopilotPayload {
  suggestedReply: {paragraphs: string[]; basis: string; confidence: number};
  generatedAt: string;
  summary: string[];
  articles: ArticleMatch[];
}

const COPILOT: Record<string, CopilotPayload> = {
  'conv-sso': {
    suggestedReply: {
      paragraphs: [
        'Thanks Priya — this is the SAML audience URI still pointing at brightloom.co, so Google rejects the assertion after the redirect and you land back on the login screen.',
        'Two steps: in Clearway open Settings → SSO → Download metadata, then re-upload that file to Google Workspace. The audience URI updates to brightloom.io and sessions recover on the next sign-in — no seat re-invites needed.',
        'In the meantime I’ve enabled 24-hour backup codes for your workspace so the other 46 seats can sign in while the metadata propagates.',
      ],
      basis:
        'Drafted from resolved conversation CW-4821 and “Fix a SAML redirect loop after changing domains”.',
      confidence: 92,
    },
    generatedAt: '2026-07-02T10:12:00',
    summary: [
      '48-seat Scale workspace hit an SSO redirect loop after this morning’s brightloom.co → brightloom.io domain change.',
      'Google Workspace IdP still lists the old primary domain; password sign-in works for the 2 admins only.',
      'Marcus matched the audience-URI signature to CW-4821 — fix is re-issued SAML metadata, not an IdP change.',
      'Customer is now asking for an interim unblock while the fix lands.',
    ],
    articles: [
      {id: 'art-sso-loop', title: 'Fix a SAML redirect loop after changing domains', collection: 'SSO & security', confidence: 92},
      {id: 'art-sso-metadata', title: 'Re-issue workspace SSO metadata', collection: 'SSO & security', confidence: 87},
      {id: 'art-backup-codes', title: 'Backup codes and break-glass access', collection: 'Account access', confidence: 74},
    ],
  },
  'conv-export': {
    suggestedReply: {
      paragraphs: [
        'Hi Tobias — empty June exports usually mean the export job is scoped to the workspace’s previous billing period boundary. Your period rolled on Jul 1, so the June window needs the “custom range” picker rather than the period preset.',
        'Could you retry with an explicit Jun 1 – Jun 30 range? If that also returns 0 rows, I’ll escalate to engineering with your workspace ID.',
      ],
      basis: 'Drafted from “Export a custom usage date range”.',
      confidence: 81,
    },
    generatedAt: '2026-07-02T10:11:00',
    summary: [
      'June usage exports return headers with 0 rows from both dashboard and API; May exports work.',
      'Workspace billing period rolled on Jul 1 — period-preset scoping is the likely cause.',
    ],
    articles: [
      {id: 'art-export-range', title: 'Export a custom usage date range', collection: 'Reporting', confidence: 81},
      {id: 'art-export-api', title: 'Usage export API reference', collection: 'Developers', confidence: 66},
    ],
  },
  'conv-webhook': {
    suggestedReply: {
      paragraphs: [
        'Hi Amara — you can pause deliveries per endpoint from Developers → Webhooks → Pause; Clearway holds events for 72 hours and replays them in order once you resume.',
        'Retries back off exponentially only after the endpoint stops answering — a 503 with a Retry-After header will slow them immediately if you want relief before pausing.',
      ],
      basis: 'Drafted from “Pause and replay webhook deliveries”.',
      confidence: 76,
    },
    generatedAt: '2026-07-02T10:08:00',
    summary: [
      'Endpoint returned 503s for ~4 minutes during a deploy; retry volume now exceeds their rate limit.',
      'Asking to pause deliveries or flush the retry queue once healthy.',
    ],
    articles: [
      {id: 'art-webhook-pause', title: 'Pause and replay webhook deliveries', collection: 'Developers', confidence: 76},
      {id: 'art-webhook-retry', title: 'Webhook retry and backoff schedule', collection: 'Developers', confidence: 71},
    ],
  },
  'conv-billing': {
    suggestedReply: {
      paragraphs: [
        'Hi Elena — confirming what Marcus set up: the corrected Starter invoice ($59) replaces the July 1 Growth invoice, and the $190 difference lands as a credit on the same billing profile within one business day.',
      ],
      basis: 'Drafted from “Prorations, downgrades, and invoice reissues”.',
      confidence: 88,
    },
    generatedAt: '2026-07-02T09:15:00',
    summary: [
      'Downgraded Growth → Starter on Jun 28; July 1 invoice still billed $249 instead of $59.',
      'Marcus queued a reissue at Starter pricing with a $190 credit.',
    ],
    articles: [
      {id: 'art-billing-proration', title: 'Prorations, downgrades, and invoice reissues', collection: 'Billing', confidence: 88},
    ],
  },
  'conv-onboard': {
    suggestedReply: {
      paragraphs: [
        'Hi Jonah — done! Invite-link expiry for Saltgrass Outfitters is now 7 days, independent of your 4-hour session policy. Links already sent stay on the old clock, so re-send any outstanding invites.',
      ],
      basis: 'Drafted from “Invite links and session policies”.',
      confidence: 69,
    },
    generatedAt: '2026-07-02T08:44:00',
    summary: [
      'Invite links expire in 4 hours because they inherit the workspace session policy.',
      'Ivy offered a 7-day invite expiry; customer accepted at 8:41 AM.',
    ],
    articles: [
      {id: 'art-invite-links', title: 'Invite links and session policies', collection: 'Workspace admin', confidence: 69},
      {id: 'art-invite-bulk', title: 'Bulk-invite teammates via CSV', collection: 'Workspace admin', confidence: 58},
    ],
  },
  'conv-rate': {
    suggestedReply: {
      paragraphs: [
        'Resolved — burst allowance (3× base for 5 minutes) is enabled for Miyabi Goods; no further action needed unless tonight’s reindex still trips the limit.',
      ],
      basis: 'Conversation resolved; drafted as a closing recap.',
      confidence: 84,
    },
    generatedAt: '2026-07-01T16:21:00',
    summary: [
      'Nightly reindex bursts past the search API base limit for a few minutes.',
      'Dana enabled the Scale burst allowance (3× base, 5 minutes); customer confirmed it covers the window.',
    ],
    articles: [
      {id: 'art-rate-limits', title: 'Search API rate limits and burst allowance', collection: 'Developers', confidence: 84},
    ],
  },
  'conv-import': {
    suggestedReply: {
      paragraphs: [
        'Glad it’s working, Wes — I’ve flagged the docs gap so the CSV guide calls out the ISO date requirement explicitly. Anything else on the import, just reply here.',
      ],
      basis: 'Conversation resolved; drafted as a closing recap.',
      confidence: 78,
    },
    generatedAt: '2026-07-01T11:49:00',
    summary: [
      'CSV import mapping question: headers map on step 2, dates must be ISO (2026-07-01).',
      'Rosa shared the import template; customer confirmed success but flagged a docs gap.',
    ],
    articles: [
      {id: 'art-import-csv', title: 'Import contacts from CSV', collection: 'Getting started', confidence: 78},
    ],
  },
};

// ---------------------------------------------------------------------------
// CUSTOMER CONTEXT — plan, LTV (months × MRR, shown as math), health, and a
// recent-events feed that reconciles with the thread it annotates (e.g.
// Brightloom: 46 SSO-only + 2 admin seats = the 48 seats shown here).
// ---------------------------------------------------------------------------

type CustomerHealth = 'healthy' | 'watch' | 'at-risk';

const HEALTH_META: Record<
  CustomerHealth,
  {label: string; dot: 'success' | 'warning' | 'error'}
> = {
  healthy: {label: 'Healthy', dot: 'success'},
  watch: {label: 'Watch', dot: 'warning'},
  'at-risk': {label: 'At risk', dot: 'error'},
};

interface CustomerEvent {
  id: string;
  label: string;
  time: string;
}

interface CustomerContext {
  plan: string;
  mrr: string;
  seats: number;
  since: string;
  ltv: string;
  /** months × MRR — must multiply out to \`ltv\` exactly. */
  ltvMath: string;
  health: CustomerHealth;
  events: CustomerEvent[];
}

const CUSTOMER_CONTEXT: Record<string, CustomerContext> = {
  'conv-sso': {
    plan: 'Scale', mrr: '$749', seats: 48, since: 'Mar 2024',
    ltv: '$20,972', ltvMath: '28 mo × $749', health: 'watch',
    events: [
      {id: 'ev-sso-1', label: 'Primary domain changed to brightloom.io', time: '2026-07-02T09:41:00'},
      {id: 'ev-sso-2', label: 'SSO sign-in failures spiked — 61 in 15 min', time: '2026-07-02T09:52:00'},
      {id: 'ev-sso-3', label: '2 admin password sign-ins', time: '2026-07-02T09:55:00'},
    ],
  },
  'conv-export': {
    plan: 'Growth', mrr: '$249', seats: 12, since: 'Nov 2025',
    ltv: '$1,992', ltvMath: '8 mo × $249', health: 'healthy',
    events: [
      {id: 'ev-export-1', label: 'Billing period rolled over', time: '2026-07-01T00:00:00'},
      {id: 'ev-export-2', label: '4 empty export jobs completed', time: '2026-07-02T09:47:00'},
    ],
  },
  'conv-webhook': {
    plan: 'Scale', mrr: '$749', seats: 31, since: 'Jun 2023',
    ltv: '$27,713', ltvMath: '37 mo × $749', health: 'healthy',
    events: [
      {id: 'ev-webhook-1', label: 'Endpoint error rate hit 100% for 4 min', time: '2026-07-02T09:38:00'},
      {id: 'ev-webhook-2', label: 'Webhook retry queue reached 1,840 events', time: '2026-07-02T10:01:00'},
    ],
  },
  'conv-billing': {
    plan: 'Starter', mrr: '$59', seats: 4, since: 'Jan 2026',
    ltv: '$354', ltvMath: '6 mo × $59', health: 'watch',
    events: [
      {id: 'ev-billing-1', label: 'Plan downgraded Growth → Starter', time: '2026-06-28T14:03:00'},
      {id: 'ev-billing-2', label: 'Invoice #INV-20441 issued at $249', time: '2026-07-01T06:00:00'},
    ],
  },
  'conv-onboard': {
    plan: 'Growth', mrr: '$249', seats: 9, since: 'Apr 2026',
    ltv: '$747', ltvMath: '3 mo × $249', health: 'healthy',
    events: [
      {id: 'ev-onboard-1', label: '6 invites sent, 3 expired unclicked', time: '2026-07-01T17:22:00'},
      {id: 'ev-onboard-2', label: 'Session policy set to 4h lifetime', time: '2026-06-30T10:10:00'},
    ],
  },
  'conv-rate': {
    plan: 'Scale', mrr: '$749', seats: 22, since: 'Sep 2024',
    ltv: '$16,478', ltvMath: '22 mo × $749', health: 'healthy',
    events: [
      {id: 'ev-rate-1', label: 'Burst allowance enabled (3× base, 5 min)', time: '2026-07-01T16:13:00'},
    ],
  },
  'conv-import': {
    plan: 'Growth', mrr: '$249', seats: 7, since: 'May 2026',
    ltv: '$498', ltvMath: '2 mo × $249', health: 'healthy',
    events: [
      {id: 'ev-import-1', label: 'First CSV import completed — 312 contacts', time: '2026-07-01T11:45:00'},
    ],
  },
};

// ---------------------------------------------------------------------------
// MACROS — the quick-row above the composer; clicking loads the body into
// the draft so the agent edits before sending.
// ---------------------------------------------------------------------------

interface Macro {
  id: string;
  label: string;
  body: string;
}

const MACROS: Macro[] = [
  {
    id: 'macro-har',
    label: 'Ask for HAR file',
    body: 'Could you capture a HAR file of the failing request? In Chrome: DevTools → Network → check "Preserve log", reproduce the issue, then right-click → "Save all as HAR" and attach it here.',
  },
  {
    id: 'macro-backup',
    label: 'Enable backup codes',
    body: 'I’ve enabled 24-hour backup codes for your workspace — admins can issue them from Settings → Members while we work on the fix.',
  },
  {
    id: 'macro-escalate',
    label: 'Escalate to engineering',
    body: 'I’m escalating this to our engineering team with your workspace ID and the details above. You’ll hear back in this conversation as soon as we have a diagnosis — typically within a few hours.',
  },
  {
    id: 'macro-refund',
    label: 'Refund policy',
    body: 'Our refund policy: billing mistakes are always corrected with a credit or refund to the original payment method within 5 business days. Downgrades take effect at the next billing period unless a proration is requested.',
  },
  {
    id: 'macro-close',
    label: 'Close with CSAT',
    body: 'Glad we could get this sorted! I’m closing the conversation now — you’ll get a one-tap rating request, and replying here any time will reopen it with the full history intact.',
  },
];

type RailFilter = 'all' | 'assigned' | 'unassigned';
type ComposerMode = 'reply' | 'note';

// ---------------------------------------------------------------------------
// MESSAGE BLOCKS — customer bubbles left, brand-blue agent bubbles right,
// amber internal notes full-width. Defined at module level (never inline in
// the page component) so React state is preserved across re-renders.
// ---------------------------------------------------------------------------

function MessageBlock({message}: {message: ThreadMessage}) {
  if (message.kind === 'note') {
    return (
      <div style={styles.noteBlock}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <Icon icon={StickyNoteIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <Text type="supporting" weight="semibold">
                Internal note · {message.author}
              </Text>
            </StackItem>
            <Timestamp
              value={message.time}
              format="time"
              hasTooltip={false}
              type="supporting"
              color="secondary"
            />
          </HStack>
          {message.body.map((paragraph, index) => (
            <Text key={index} type="body">
              {paragraph}
            </Text>
          ))}
          <Text type="supporting" color="secondary">
            Only visible to the Clearway team.
          </Text>
        </VStack>
      </div>
    );
  }
  const isAgent = message.kind === 'agent';
  return (
    <HStack
      gap={2}
      vAlign="end"
      style={isAgent ? styles.bubbleRowAgent : styles.bubbleRowCustomer}>
      {!isAgent && <Avatar name={message.author} size="small" />}
      <VStack gap={1}>
        <div style={isAgent ? styles.bubbleAgent : styles.bubbleCustomer}>
          <VStack gap={1}>
            {message.body.map((paragraph, index) => (
              <Text key={index} type="body" color="inherit">
                {paragraph}
              </Text>
            ))}
            <div style={isAgent ? styles.bubbleAgentMeta : undefined}>
              <Text type="supporting" color={isAgent ? 'inherit' : 'secondary'}>
                {message.author} ·{' '}
                <Timestamp
                  value={message.time}
                  format="time"
                  hasTooltip={false}
                  type="supporting"
                  color="inherit"
                />
              </Text>
            </div>
          </VStack>
        </div>
      </VStack>
      {isAgent && <Avatar name={message.author} size="small" />}
    </HStack>
  );
}

/** Pulsing "customer is typing" bubble — presence is a fixed fixture. */
function TypingIndicator({name}: {name: string}) {
  return (
    <HStack gap={2} vAlign="end" style={styles.bubbleRowCustomer}>
      <Avatar name={name} size="small" />
      <div style={styles.typingBubble} aria-label={\`\${name} is typing\`}>
        <StatusDot variant="accent" isPulsing label="Typing" />
        <Text type="supporting" color="secondary">
          {name.split(' ')[0]} is typing…
        </Text>
      </div>
    </HStack>
  );
}

/** Confidence pill — success ≥ 85, warning ≥ 70, neutral below. */
function ConfidencePill({confidence}: {confidence: number}) {
  const variant =
    confidence >= 85 ? 'success' : confidence >= 70 ? 'warning' : 'neutral';
  return (
    <Tooltip content="Copilot match confidence against resolved conversations and the help center">
      <Badge label={\`\${confidence}% match\`} variant={variant} />
    </Tooltip>
  );
}

/** Copilot rail section heading with the brand-accented sparkle. */
function CopilotSectionTitle({
  icon,
  title,
}: {
  icon: typeof SparklesIcon;
  title: string;
}) {
  return (
    <HStack gap={2} vAlign="center">
      <Icon icon={icon} size="sm" color="secondary" />
      <Text type="supporting" weight="semibold">
        {title}
      </Text>
    </HStack>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function SupportChatCopilotTemplate() {
  const [selectedId, setSelectedId] = useState('conv-sso');
  const [railFilter, setRailFilter] = useState<RailFilter>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [composerMode, setComposerMode] = useState<ComposerMode>('reply');
  const [draft, setDraft] = useState('');
  const [threadById, setThreadById] =
    useState<Record<string, ThreadMessage[]>>(INITIAL_THREADS);
  const [statusById, setStatusById] = useState<
    Record<string, ConversationStatus>
  >(() => Object.fromEntries(CONVERSATIONS.map(c => [c.id, c.status])));
  // Responsive contract (see file header).
  const isCopilotCollapsed = useMediaQuery('(max-width: 1240px)');
  const [isCopilotOpen, setIsCopilotOpen] = useState(false);
  const isSinglePane = useMediaQuery('(max-width: 860px)');
  const [isRailShownOnMobile, setIsRailShownOnMobile] = useState(false);
  const streamRef = useRef<HTMLElement | null>(null);

  const selected =
    CONVERSATIONS.find(conversation => conversation.id === selectedId) ??
    CONVERSATIONS[0];
  const selectedThread = threadById[selected.id];
  const selectedStatus = statusById[selected.id];
  const selectedCopilot = COPILOT[selected.id];
  const selectedContext = CUSTOMER_CONTEXT[selected.id];
  const typingCustomer =
    selectedStatus === 'open' ? CUSTOMER_TYPING[selected.id] : undefined;

  // Live chat opens pinned to the newest message; re-pin on switch and send.
  useEffect(() => {
    const streamEl = streamRef.current;
    if (streamEl) {
      streamEl.scrollTop = streamEl.scrollHeight;
    }
  }, [selectedId, selectedThread.length]);

  const openCount = useMemo(
    () =>
      CONVERSATIONS.filter(
        conversation => statusById[conversation.id] === 'open',
      ).length,
    [statusById],
  );
  const unassignedCount = useMemo(
    () =>
      CONVERSATIONS.filter(
        conversation =>
          conversation.assignee === null &&
          statusById[conversation.id] === 'open',
      ).length,
    [statusById],
  );

  const normalizedQuery = searchQuery.trim().toLowerCase();
  const visibleConversations = useMemo(() => {
    return CONVERSATIONS.filter(conversation => {
      if (railFilter === 'assigned' && conversation.assignee === null) {
        return false;
      }
      if (railFilter === 'unassigned' && conversation.assignee !== null) {
        return false;
      }
      if (normalizedQuery === '') {
        return true;
      }
      return (
        conversation.customer.toLowerCase().includes(normalizedQuery) ||
        conversation.company.toLowerCase().includes(normalizedQuery) ||
        conversation.subject.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [railFilter, normalizedQuery]);

  const openConversation = (id: string) => {
    setSelectedId(id);
    setDraft('');
    setComposerMode('reply');
    setIsRailShownOnMobile(false);
    setIsCopilotOpen(false);
  };

  const sendDraft = () => {
    const body = draft.trim();
    if (body === '') {
      return;
    }
    const kind: MessageKind = composerMode === 'reply' ? 'agent' : 'note';
    setThreadById(prev => ({
      ...prev,
      [selected.id]: [
        ...prev[selected.id],
        {
          id: \`live-\${selected.id}-\${prev[selected.id].length}\`,
          kind,
          author: CURRENT_AGENT,
          time: SESSION_TIME,
          body: body.split('\\n\\n'),
        },
      ],
    }));
    setDraft('');
  };

  const insertIntoComposer = (text: string) => {
    setDraft(text);
    setComposerMode('reply');
  };

  const closeConversation = () => {
    setStatusById(prev => ({...prev, [selected.id]: 'closed'}));
  };
  const reopenConversation = () => {
    setStatusById(prev => ({...prev, [selected.id]: 'open'}));
  };

  // ---- conversation rail ----
  const railPane = (
    <Stack direction="vertical" style={styles.railColumn}>
      <VStack gap={2} style={styles.railControls}>
        <SegmentedControl
          label="Inbox filter"
          value={railFilter}
          onChange={value => setRailFilter(value as RailFilter)}
          size="sm"
          layout="fill">
          <SegmentedControlItem value="all" label="All" />
          <SegmentedControlItem value="assigned" label="Assigned" />
          <SegmentedControlItem value="unassigned" label="Unassigned" />
        </SegmentedControl>
        <TextInput
          label="Search conversations"
          isLabelHidden
          size="sm"
          placeholder="Search name, company, subject…"
          startIcon={SearchIcon}
          value={searchQuery}
          onChange={setSearchQuery}
        />
        <div style={styles.railCounts}>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {openCount} open · {unassignedCount} unassigned
          </Text>
        </div>
      </VStack>
      <Divider />
      <StackItem size="fill" style={styles.railScroll}>
        {visibleConversations.length === 0 ? (
          <div style={styles.railEmpty}>
            <Text type="supporting" color="secondary">
              {normalizedQuery === ''
                ? 'Nothing in this view — switch the filter to see the rest of the inbox.'
                : \`No conversations match "\${searchQuery.trim()}".\`}
            </Text>
          </div>
        ) : (
          <List density="compact" hasDividers>
            {visibleConversations.map(conversation => {
              const status = statusById[conversation.id];
              const isClosed = status === 'closed';
              return (
                <ListItem
                  key={conversation.id}
                  isSelected={conversation.id === selectedId}
                  onClick={() => openConversation(conversation.id)}
                  startContent={
                    <Tooltip
                      content={
                        isClosed
                          ? \`Closed · \${conversation.sla}\`
                          : \`SLA · \${conversation.sla} (\${conversation.slaTarget})\`
                      }>
                      <span style={styles.slaDotSlot}>
                        <StatusDot
                          variant={
                            isClosed ? 'neutral' : SLA_DOT[conversation.slaLevel]
                          }
                          label={isClosed ? 'Closed' : \`SLA \${conversation.sla}\`}
                        />
                      </span>
                    </Tooltip>
                  }
                  label={
                    <HStack gap={2} vAlign="center">
                      <StackItem size="fill">
                        <Text type="body" weight="semibold" maxLines={1}>
                          {conversation.customer} · {conversation.company}
                        </Text>
                      </StackItem>
                      {isClosed &&
                        (conversation.csat !== null ? (
                          <Tooltip
                            content={\`CSAT: \${CSAT_META[conversation.csat].label}\`}>
                            <span
                              style={styles.csatEmoji}
                              role="img"
                              aria-label={CSAT_META[conversation.csat].label}>
                              {CSAT_META[conversation.csat].emoji}
                            </span>
                          </Tooltip>
                        ) : (
                          <Token label="Awaiting CSAT" size="sm" color="gray" />
                        ))}
                    </HStack>
                  }
                  description={
                    <VStack gap={1}>
                      <Text type="supporting" color="primary" maxLines={1}>
                        {conversation.subject}
                      </Text>
                      <HStack gap={2} vAlign="center">
                        <Icon
                          icon={CHANNEL_META[conversation.channel].icon}
                          size="sm"
                          color="secondary"
                        />
                        {conversation.assignee === null ? (
                          <Token label="Unassigned" size="sm" color="gray" />
                        ) : (
                          <HStack gap={1} vAlign="center">
                            <Avatar name={conversation.assignee} size={16} />
                            <Text type="supporting" color="secondary" maxLines={1}>
                              {conversation.assignee.split(' ')[0]}
                            </Text>
                          </HStack>
                        )}
                        <StackItem size="fill">
                          <span />
                        </StackItem>
                        <Timestamp
                          value={conversation.lastActivity}
                          format="time"
                          hasTooltip={false}
                          type="supporting"
                          color="secondary"
                        />
                      </HStack>
                    </VStack>
                  }
                />
              );
            })}
          </List>
        )}
      </StackItem>
    </Stack>
  );

  // ---- thread pane ----
  const threadBadges = (
    <>
      {selectedStatus === 'open' ? (
        <>
          <Badge label="Open" variant="info" />
          <Tooltip content={selected.slaTarget}>
            <Badge
              label={\`SLA · \${selected.sla}\`}
              variant={SLA_BADGE[selected.slaLevel]}
              icon={<Icon icon={ClockIcon} size="sm" />}
            />
          </Tooltip>
        </>
      ) : (
        <>
          <Badge label="Closed" variant="neutral" />
          {selected.csat !== null && (
            <Tooltip content={\`CSAT: \${CSAT_META[selected.csat].label}\`}>
              <Badge
                label={\`\${CSAT_META[selected.csat].emoji} \${CSAT_META[selected.csat].label}\`}
                variant="neutral"
              />
            </Tooltip>
          )}
        </>
      )}
    </>
  );

  const threadPane = (
    <Stack direction="vertical" style={styles.threadColumn}>
      <div style={styles.threadHeader}>
        <HStack gap={3} vAlign="center">
          {isSinglePane && (
            <IconButton
              label="Back to inbox"
              tooltip="Back to inbox"
              size="sm"
              variant="ghost"
              icon={<Icon icon={ArrowLeftIcon} size="sm" />}
              style={styles.iconTapTarget}
              onClick={() => setIsRailShownOnMobile(true)}
            />
          )}
          <Avatar name={selected.customer} size="medium" />
          <StackItem size="fill" style={styles.headerTitle}>
            <VStack gap={0}>
              <Heading level={2} maxLines={1}>
                {selected.customer} · {selected.company}
              </Heading>
              <Text type="supporting" color="secondary" maxLines={1}>
                {selected.subject} · via {CHANNEL_META[selected.channel].label}
              </Text>
            </VStack>
          </StackItem>
          {selectedStatus === 'open' ? (
            <Button
              label="Close"
              size="sm"
              variant="secondary"
              icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
              style={isSinglePane ? styles.buttonTapTarget : undefined}
              onClick={closeConversation}
            />
          ) : (
            <Button
              label="Reopen"
              size="sm"
              variant="secondary"
              icon={<Icon icon={ReplyIcon} size="sm" color="inherit" />}
              style={isSinglePane ? styles.buttonTapTarget : undefined}
              onClick={reopenConversation}
            />
          )}
        </HStack>
        <HStack gap={2} vAlign="center" style={styles.badgeRow}>
          {threadBadges}
        </HStack>
      </div>
      <Divider />
      <StackItem ref={streamRef} size="fill" style={styles.messageScroll}>
        <VStack gap={3} style={styles.messageStream}>
          <HStack gap={2} vAlign="center" style={styles.dayDivider}>
            <StackItem size="fill">
              <Divider />
            </StackItem>
            <Timestamp
              value={selectedThread[0].time}
              format="date"
              hasTooltip={false}
              type="supporting"
              color="secondary"
            />
            <StackItem size="fill">
              <Divider />
            </StackItem>
          </HStack>
          {selectedThread.map(message => (
            <MessageBlock key={message.id} message={message} />
          ))}
          {typingCustomer !== undefined && (
            <TypingIndicator name={typingCustomer} />
          )}
        </VStack>
      </StackItem>
      <Divider />
      {/* Macro quick-row — scrolls horizontally at every width. */}
      <div style={styles.macroRow}>
        <div style={styles.macroTrack}>
          {MACROS.map(macro => (
            <Button
              key={macro.id}
              label={macro.label}
              size="sm"
              variant="secondary"
              icon={<Icon icon={ZapIcon} size="sm" color="inherit" />}
              onClick={() => insertIntoComposer(macro.body)}
            />
          ))}
        </div>
      </div>
      <Divider />
      <div
        style={{
          ...styles.composer,
          ...(composerMode === 'note' ? styles.composerNoteTint : undefined),
        }}>
        <VStack gap={2}>
          <TabList
            value={composerMode}
            onChange={value => setComposerMode(value as ComposerMode)}
            size="sm">
            <Tab
              value="reply"
              label="Reply"
              icon={<Icon icon={ReplyIcon} size="sm" />}
            />
            <Tab
              value="note"
              label="Internal note"
              icon={<Icon icon={StickyNoteIcon} size="sm" />}
            />
          </TabList>
          <TextArea
            label={composerMode === 'reply' ? 'Reply' : 'Internal note'}
            isLabelHidden
            rows={3}
            value={draft}
            onChange={setDraft}
            placeholder={
              composerMode === 'reply'
                ? \`Reply to \${selected.customer.split(' ')[0]}…\`
                : 'Add a note for the team — the customer never sees these…'
            }
          />
          <HStack gap={2} vAlign="center">
            <IconButton
              label="Attach file"
              tooltip="Attach file"
              size="sm"
              variant="ghost"
              icon={<Icon icon={PaperclipIcon} size="sm" />}
            />
            <StackItem size="fill">
              <Text type="supporting" color="secondary" maxLines={1}>
                {composerMode === 'reply'
                  ? \`Delivers over \${CHANNEL_META[selected.channel].label} as \${CURRENT_AGENT}.\`
                  : 'Notes stay internal — amber means team-only.'}
              </Text>
            </StackItem>
            <Button
              label={composerMode === 'reply' ? 'Send' : 'Add note'}
              size="sm"
              variant="primary"
              icon={
                <Icon
                  icon={composerMode === 'reply' ? SendIcon : StickyNoteIcon}
                  size="sm"
                  color="inherit"
                />
              }
              style={isSinglePane ? styles.buttonTapTarget : undefined}
              isDisabled={draft.trim() === ''}
              onClick={sendDraft}
            />
          </HStack>
        </VStack>
      </div>
    </Stack>
  );

  // ---- AI copilot rail ----
  const healthMeta = HEALTH_META[selectedContext.health];
  const copilotRail = (
    <Stack direction="vertical" style={styles.copilotColumn}>
      <StackItem size="fill" style={styles.copilotScroll}>
        <VStack gap={3}>
          <HStack gap={2} vAlign="center">
            <span style={styles.copilotIdentity}>
              <Icon icon={SparklesIcon} size="sm" color="inherit" />
            </span>
            <StackItem size="fill">
              <Text type="body" weight="semibold">
                Clearway Copilot
              </Text>
            </StackItem>
            <Badge label="Beta" variant="info" />
          </HStack>

          {/* Suggested reply */}
          <Card padding={3} style={styles.suggestedCard}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <CopilotSectionTitle
                    icon={ReplyIcon}
                    title="Suggested reply"
                  />
                </StackItem>
                <ConfidencePill
                  confidence={selectedCopilot.suggestedReply.confidence}
                />
              </HStack>
              <div style={styles.suggestedQuote}>
                <VStack gap={1}>
                  {selectedCopilot.suggestedReply.paragraphs.map(
                    (paragraph, index) => (
                      <Text key={index} type="supporting">
                        {paragraph}
                      </Text>
                    ),
                  )}
                </VStack>
              </div>
              <Text type="supporting" color="secondary">
                {selectedCopilot.suggestedReply.basis}
              </Text>
              {/* Caption sits under the button — beside it, the 340px rail
                  squashes "Edits stay yours." into an awkward two-line wrap. */}
              <VStack gap={1} hAlign="start">
                <Button
                  label="Insert into composer"
                  size="sm"
                  variant="primary"
                  icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
                  onClick={() =>
                    insertIntoComposer(
                      selectedCopilot.suggestedReply.paragraphs.join('\\n\\n'),
                    )
                  }
                />
                <Text type="supporting" color="secondary">
                  Edits stay yours.
                </Text>
              </VStack>
            </VStack>
          </Card>

          {/* Conversation summary */}
          <Card padding={3}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <StackItem size="fill">
                  <CopilotSectionTitle
                    icon={HistoryIcon}
                    title="Conversation summary"
                  />
                </StackItem>
                <IconButton
                  label="Regenerate summary"
                  tooltip="Regenerate summary"
                  size="sm"
                  variant="ghost"
                  icon={<Icon icon={RefreshCwIcon} size="sm" />}
                />
              </HStack>
              <VStack gap={2}>
                {selectedCopilot.summary.map((bullet, index) => (
                  <HStack key={index} gap={2} style={styles.eventRow}>
                    <StatusDot variant="neutral" label="Summary point" />
                    <StackItem size="fill">
                      <Text type="supporting">{bullet}</Text>
                    </StackItem>
                  </HStack>
                ))}
              </VStack>
              <Text type="supporting" color="secondary">
                Generated{' '}
                <Timestamp
                  value={selectedCopilot.generatedAt}
                  format="time"
                  hasTooltip={false}
                  type="supporting"
                  color="secondary"
                />{' '}
                from {selectedThread.length} messages.
              </Text>
            </VStack>
          </Card>

          {/* Help-article matches */}
          <VStack gap={2}>
            <CopilotSectionTitle icon={BookOpenIcon} title="Relevant articles" />
            <VStack gap={2}>
              {selectedCopilot.articles.map(article => (
                <HStack key={article.id} gap={2} style={styles.articleRow}>
                  <Icon icon={BookOpenIcon} size="sm" color="secondary" />
                  <StackItem size="fill">
                    <VStack gap={0}>
                      <Text type="supporting" weight="semibold">
                        {article.title}
                      </Text>
                      <Text type="supporting" color="secondary">
                        {article.collection}
                      </Text>
                    </VStack>
                  </StackItem>
                  <div style={styles.articleConfidence}>
                    <ConfidencePill confidence={article.confidence} />
                  </div>
                </HStack>
              ))}
            </VStack>
          </VStack>

          <Divider />

          {/* Customer context */}
          <Card padding={3}>
            <VStack gap={2}>
              <HStack gap={2} vAlign="center">
                <Avatar name={selected.customer} size="small" />
                <StackItem size="fill">
                  <VStack gap={0}>
                    <Text type="supporting" weight="semibold" maxLines={1}>
                      {selected.customer}
                    </Text>
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {selected.company} · {selected.email}
                    </Text>
                  </VStack>
                </StackItem>
              </HStack>
              <MetadataList columns="single">
                <MetadataListItem label="Plan">
                  <HStack gap={2} vAlign="center">
                    <Badge label={selectedContext.plan} variant="info" />
                    <Text type="supporting" color="secondary">
                      {selectedContext.mrr}/mo
                    </Text>
                  </HStack>
                </MetadataListItem>
                <MetadataListItem label="Seats">
                  <Text type="supporting" hasTabularNumbers>
                    {selectedContext.seats}
                  </Text>
                </MetadataListItem>
                <MetadataListItem label="Customer since">
                  <Text type="supporting">{selectedContext.since}</Text>
                </MetadataListItem>
                <MetadataListItem label="Lifetime value">
                  <Text type="supporting" hasTabularNumbers>
                    {selectedContext.ltv}{' '}
                    <span style={styles.ltvMath}>
                      ({selectedContext.ltvMath})
                    </span>
                  </Text>
                </MetadataListItem>
                <MetadataListItem label="Health">
                  <span style={styles.healthRow}>
                    <StatusDot variant={healthMeta.dot} label={healthMeta.label} />
                    <Text type="supporting">{healthMeta.label}</Text>
                  </span>
                </MetadataListItem>
              </MetadataList>
              <Divider />
              <VStack gap={2}>
                <Text type="supporting" weight="semibold">
                  Recent events
                </Text>
                {selectedContext.events.map(event => (
                  <HStack key={event.id} gap={2} style={styles.eventRow}>
                    <StatusDot variant="neutral" label="Event" />
                    <StackItem size="fill">
                      <Text type="supporting" color="secondary">
                        {event.label} ·{' '}
                        <Timestamp
                          value={event.time}
                          format="time"
                          hasTooltip={false}
                          type="supporting"
                          color="secondary"
                        />
                      </Text>
                    </StackItem>
                  </HStack>
                ))}
              </VStack>
            </VStack>
          </Card>
        </VStack>
      </StackItem>
    </Stack>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center">
              <span style={styles.brandMark} aria-hidden>
                <Icon icon={CompassIcon} size="sm" color="inherit" />
              </span>
              <StackItem size="fill" style={styles.headerTitle}>
                <HStack gap={2} vAlign="center">
                  <Heading level={1} maxLines={1}>
                    Clearway Support
                  </Heading>
                  <Badge label={\`\${openCount} open\`} variant="info" />
                </HStack>
              </StackItem>
              {!isSinglePane && (
                <Tooltip content={\`Signed in as \${CURRENT_AGENT}\`}>
                  <HStack gap={2} vAlign="center">
                    <Avatar name={CURRENT_AGENT} size={24} />
                    <Text type="supporting" color="secondary">
                      {CURRENT_AGENT}
                    </Text>
                  </HStack>
                </Tooltip>
              )}
              {isCopilotCollapsed && (
                <IconButton
                  label={isCopilotOpen ? 'Hide copilot' : 'Show copilot'}
                  tooltip={isCopilotOpen ? 'Hide copilot' : 'Show copilot'}
                  size="sm"
                  variant={isCopilotOpen ? 'secondary' : 'ghost'}
                  icon={<Icon icon={SparklesIcon} size="sm" />}
                  style={isSinglePane ? styles.iconTapTarget : undefined}
                  onClick={() => setIsCopilotOpen(prev => !prev)}
                />
              )}
            </HStack>
          </LayoutHeader>
        }
        start={
          isSinglePane ? undefined : (
            <LayoutPanel width={320} padding={0} hasDivider label="Inbox">
              {railPane}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            {/* <=860px the copilot and inbox swap into the content region —
                a docked panel would leave the thread a sliver at phone
                width, so whichever surface shows always fills the width. */}
            {isSinglePane && isCopilotOpen
              ? copilotRail
              : isSinglePane && isRailShownOnMobile
                ? railPane
                : threadPane}
          </LayoutContent>
        }
        end={
          !isCopilotCollapsed || (isCopilotOpen && !isSinglePane) ? (
            <LayoutPanel
              width={340}
              padding={0}
              hasDivider
              label="Clearway Copilot">
              {copilotRail}
            </LayoutPanel>
          ) : undefined
        }
      />
    </div>
  );
}
`;export{e as default};