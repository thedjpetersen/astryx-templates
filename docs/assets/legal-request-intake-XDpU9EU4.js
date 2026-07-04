var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Casewright Legal Ops intake
 *   queue for Kestrel Labs' in-house legal team on Wed Jul 15, 2026,
 *   9:40 AM (the suite "now" anchor): eight open requests from business
 *   teams (NDA reviews, vendor contracts, marketing claim reviews, an
 *   employment question) with pre-computed SLA countdown strings (never
 *   clock math), exactly one breached; per-request Casewright triage
 *   fixtures — classification + classifier score, suggested route,
 *   auto-extracted key terms with confidence bands and citation chips,
 *   three similar past requests with outcomes and cycle times; and a
 *   quarter-to-date self-serve-deflection stat strip. No clocks, no
 *   randomness, no network media.
 * @output Legal Request Intake & Triage — the queue a legal-ops manager
 *   works every morning: privilege strip + page header, a deflection
 *   stat strip (38% QTD with labeled month mini-bars, median cycle
 *   time, open-request and SLA-health readouts), a 360px request list
 *   (requester avatars, type + urgency chips, SLA countdowns, one
 *   breached red), and the selected request's AI triage panel —
 *   classification chip with verification state and a Mark-verified
 *   action, suggested route with one-click actions (self-serve send and
 *   outside-counsel routing are confirm-gated), auto-extracted key
 *   terms with confidence dots, and similar past requests — over a
 *   pinned assignment footer (assignee, priority, due date, Assign).
 * @position Page template; emitted by \`astryx template legal-request-intake\`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (privilege strip, title row, deflection stat strip)
 *   | start panel 360 (pinned search + type filter, scrolling request List)
 *   | content (detail header, scrolling triage column, pinned assignment
 *     footer — the footer sits in normal flex flow, so no overlay
 *     scroll-clearance is needed).
 * Container policy: list+detail archetype per table-split-pane — dense
 *   List rows and framed panels, no Cards; the two route-option tiles
 *   are styled divs (selectable-tile idiom), not Card components.
 * Color policy: token-pure chrome; ONE accent (the theme accent) for
 *   selection and the recommended-route ring. Intentional literals, all
 *   light-dark() pairs: the Casewright AI-purple mark/wash (the suite's
 *   shared disclosure treatment), SLA-breach red + at-risk amber, the
 *   verification traffic colors, and the deflection mini-bar blue —
 *   data-viz categorical tokens carry the repo-standard fallbacks (the
 *   demo does not inject them). No scheme-locked surfaces on this page.
 *
 * Responsive contract:
 * - > 1280px: full frame.
 * - <= 1280px: the stat strip wraps to two rows (flexWrap), never clips.
 * - <= 900px: single-pane swap — the request list becomes the content
 *   fill; selecting a row swaps to the triage detail with a back
 *   IconButton; the title row and assignment-footer controls wrap.
 * - The request list and the triage column scroll independently
 *   (minHeight: 0 down both flex chains); the detail header and
 *   assignment footer are pinned by flex order, not position.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  ArrowLeftIcon,
  ArrowUpRightIcon,
  CheckIcon,
  CircleCheckBigIcon,
  CircleDashedIcon,
  FileTextIcon,
  HistoryIcon,
  InboxIcon,
  LockIcon,
  PaperclipIcon,
  ScaleIcon,
  SearchIcon,
  SendIcon,
  ShieldCheckIcon,
  SparklesIcon,
  TimerIcon,
  TrendingDownIcon,
  TrendingUpIcon,
  TriangleAlertIcon,
  UserPlusIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {AlertDialog} from '@astryxdesign/core/AlertDialog';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Selector} from '@astryxdesign/core/Selector';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback pair.
// ---------------------------------------------------------------------------

const AI_ACCENT =
  'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const AI_SOFT = 'light-dark(rgba(107, 30, 253, 0.08), rgba(157, 107, 255, 0.16))';
const BREACH_RED = 'light-dark(#DC2626, #F87171)';
const BREACH_SOFT =
  'light-dark(rgba(220, 38, 38, 0.08), rgba(248, 113, 113, 0.14))';
const RISK_AMBER = 'light-dark(#B45309, #FBBF24)';
const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const BAR_BLUE = 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))';
const BAR_MUTED = 'light-dark(rgba(1, 113, 227, 0.28), rgba(76, 158, 255, 0.32))';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // Privilege strip: persistent legal furniture, never a shouting Banner.
  privilegeStrip: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    flexWrap: 'wrap', padding: 'var(--spacing-1) var(--spacing-4)',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: 'var(--border-width) solid var(--color-border)'},
  titleRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-3)', flexWrap: 'wrap',
    padding: 'var(--spacing-3) var(--spacing-4) var(--spacing-2)'},
  titleGlyph: {display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 36,
    height: 36, flexShrink: 0, borderRadius: 'var(--radius-container)', backgroundColor: AI_SOFT,
    color: AI_ACCENT},
  // Deflection stat strip — wraps at <=1280px instead of clipping.
  statStrip: {display: 'flex', alignItems: 'stretch', gap: 'var(--spacing-3)', flexWrap: 'wrap', padding: '0 var(--spacing-4) var(--spacing-3)'},
  statBlock: {flex: '1 1 220px', minWidth: 200, display: 'flex', flexDirection: 'column', gap: 4,
    padding: 'var(--spacing-2) var(--spacing-3)', borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)'},
  statLabelRow: {display: 'flex', alignItems: 'center', gap: 6, minWidth: 0},
  statValueRow: {display: 'flex', alignItems: 'baseline', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  statValue: {fontSize: 22, fontWeight: 650, lineHeight: 1.1, fontVariantNumeric: 'tabular-nums'},
  statTrend: {display: 'inline-flex', alignItems: 'center', gap: 4, whiteSpace: 'nowrap'},
  // Labeled month mini-bars (footgun 10: no axis-less charts — every bar
  // carries a month label and a % readout above it).
  miniBarRow: {display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-2)', marginTop: 2},
  miniBarCol: {display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2, width: 34},
  miniBarTrack: {display: 'flex', alignItems: 'flex-end', width: '100%', height: 28,
    borderRadius: 3, backgroundColor: 'var(--color-background-muted)', overflow: 'hidden'},
  miniBar: {width: '100%', borderRadius: 3},
  // Queue panel (start slot).
  panelFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  panelSearch: {flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: 'var(--border-width) solid var(--color-border)'},
  panelList: {flex: 1, minHeight: 0, overflowY: 'auto'},
  panelEmpty: {padding: 'var(--spacing-4) var(--spacing-3)'},
  queueEndCol: {display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 3},
  slaText: {display: 'inline-flex', alignItems: 'center', gap: 4, fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  slaBreached: {color: BREACH_RED},
  slaRisk: {color: RISK_AMBER},
  // Detail column (content slot): header — scroll body — footer, all in
  // normal flex flow so the pinned footer needs no overlay clearance.
  detailFill: {height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'},
  detailHeader: {flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    borderBottom: 'var(--border-width) solid var(--color-border)'},
  detailTitleRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap', minWidth: 0},
  detailMetaRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  breachNote: {display: 'flex', alignItems: 'center', gap: 6,
    padding: 'var(--spacing-1) var(--spacing-2)', borderRadius: 'var(--radius-container)',
    backgroundColor: BREACH_SOFT, color: BREACH_RED},
  detailScroll: {flex: 1, minHeight: 0, overflowY: 'auto', display: 'flex',
    flexDirection: 'column', gap: 'var(--spacing-3)',
    padding: 'var(--spacing-3) var(--spacing-4)'},
  // Triage sections: framed panels on the content surface — no Cards.
  section: {display: 'flex', flexDirection: 'column', gap: 'var(--spacing-2)',
    padding: 'var(--spacing-3)', borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)'},
  // The Casewright triage panel gets the suite's AI wash.
  sectionAi: {backgroundColor: AI_SOFT},
  sectionHead: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  classRow: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  // Verification chip + action wrap as ONE unit and stay end-aligned even on
  // a wrapped line (marginLeft auto), so the button never strands as orphan
  // text mid-panel.
  verifyGroup: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    marginLeft: 'auto', flexShrink: 0},
  // Route-option tiles: recommended tile carries an inset accent ring so
  // the outline never bleeds onto its neighbor.
  routeGrid: {display: 'flex', gap: 'var(--spacing-2)', flexWrap: 'wrap', alignItems: 'stretch'},
  routeTile: {flex: '1 1 300px', minWidth: 280, display: 'flex', flexDirection: 'column',
    gap: 'var(--spacing-2)', padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)'},
  routeTileRecommended: {boxShadow: 'inset 0 0 0 1px var(--color-accent)', borderColor: 'var(--color-accent)'},
  routeTileHead: {display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap'},
  routeActions: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap', marginTop: 'auto'},
  // Auto-extracted key terms.
  termRow: {display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-2)', flexWrap: 'wrap', paddingBlock: 'var(--spacing-1)'},
  termLabel: {width: 132, flexShrink: 0, paddingTop: 1},
  termBody: {flex: '1 1 220px', minWidth: 180, display: 'flex', flexDirection: 'column', gap: 3},
  termMeta: {display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)', flexWrap: 'wrap'},
  deviation: {color: RISK_AMBER},
  // Similar past requests.
  similarRow: {display: 'flex', alignItems: 'flex-start', gap: 'var(--spacing-2)', paddingBlock: 'var(--spacing-2)'},
  similarBody: {minWidth: 0, flex: 1, display: 'flex', flexDirection: 'column', gap: 3},
  cycleText: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // Assignment footer.
  footerBar: {flexShrink: 0, display: 'flex', alignItems: 'flex-end', gap: 'var(--spacing-3)',
    flexWrap: 'wrap', padding: 'var(--spacing-2) var(--spacing-4)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)'},
  footerField: {display: 'flex', flexDirection: 'column', gap: 4},
  // Shared trust-pattern chrome (suite treatment).
  aiMark: {display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: 22,
    height: 22, flexShrink: 0, borderRadius: 7, backgroundColor: AI_SOFT, color: AI_ACCENT},
  disclosureRow: {display: 'flex', alignItems: 'center', gap: 6, color: AI_ACCENT, whiteSpace: 'nowrap'},
  // Footgun 18: Tokens sharing a flex row with wrapping prose never shrink.
  noShrink: {flexShrink: 0, whiteSpace: 'nowrap'},
  citeRow: {display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap'},
  dotBand: {display: 'inline-flex', alignItems: 'center', gap: 5, whiteSpace: 'nowrap'},
};

// ---------------------------------------------------------------------------
// TYPES + DISPLAY MAPS
// ---------------------------------------------------------------------------

type RequestType = 'nda' | 'vendor' | 'marketing' | 'employment';
type Urgency = 'high' | 'normal' | 'low';
type RouteKind = 'self-serve' | 'counsel' | 'escalate';
type Band = 'high' | 'medium' | 'low';
type SlaState = 'ok' | 'risk' | 'breached';
type RequestStatus = 'open' | 'assigned' | 'self-served' | 'escalated';

interface KeyTerm {
  label: string;
  value: string;
  /** Off-playbook note rendered in amber — honest deviation surfacing. */
  deviation?: string;
  band: Band;
  cite: string;
}

interface SimilarRequest {
  id: string;
  subject: string;
  outcome: 'self-served' | 'counsel' | 'escalated';
  note: string;
  cycle: string;
}

interface Triage {
  /** e.g. 'NDA · Low complexity'. */
  classification: string;
  /** Raw classifier score — labeled as such, never as legal confidence. */
  score: string;
  /** Pre-verified triage carries reviewer provenance; else unverified. */
  verifiedLabel?: string;
  route: RouteKind;
  routeTitle: string;
  routeRationale: string;
  routeBand: Band;
  routeCites: string[];
  primaryAction: string;
  altTitle: string;
  altNote: string;
  altAction: string;
  termsSource: string;
  terms: KeyTerm[];
  similar: SimilarRequest[];
  suggestedAssignee: string;
  suggestedPriority: string;
  suggestedDue: string;
}

interface IntakeRequest {
  id: string;
  subject: string;
  requester: string;
  team: string;
  type: RequestType;
  urgency: Urgency;
  submitted: string;
  slaPolicy: string;
  sla: string;
  slaState: SlaState;
  doc?: string;
  triage: Triage;
}

const TYPE_META: Record<RequestType, {label: string; color: 'teal' | 'blue' | 'pink' | 'cyan'}> = {
  nda: {label: 'NDA', color: 'teal'},
  vendor: {label: 'Vendor contract', color: 'blue'},
  marketing: {label: 'Marketing claims', color: 'pink'},
  employment: {label: 'Employment', color: 'cyan'},
};

const URGENCY_META: Record<Urgency, {label: string; color: 'orange' | 'blue' | 'gray'}> = {
  high: {label: 'High', color: 'orange'},
  normal: {label: 'Normal', color: 'blue'},
  low: {label: 'Low', color: 'gray'},
};

// Honest confidence: bands only — the dot color mirrors the band, and low
// confidence renders neutral, shown rather than hidden (§ trust patterns).
const BAND_META: Record<Band, {label: string; variant: 'success' | 'warning' | 'neutral'}> = {
  high: {label: 'High confidence', variant: 'success'},
  medium: {label: 'Medium confidence', variant: 'warning'},
  low: {label: 'Low confidence', variant: 'neutral'},
};

const OUTCOME_META: Record<
  SimilarRequest['outcome'],
  {label: string; color: 'green' | 'blue' | 'purple'}
> = {
  'self-served': {label: 'Self-served', color: 'green'},
  counsel: {label: 'Counsel review', color: 'blue'},
  escalated: {label: 'Escalated', color: 'purple'},
};

const STATUS_META: Record<Exclude<RequestStatus, 'open'>, {label: string; color: 'green' | 'blue' | 'purple'}> = {
  assigned: {label: 'Assigned', color: 'blue'},
  'self-served': {label: 'Self-served · closed', color: 'green'},
  escalated: {label: 'Escalated · M&V LLP', color: 'purple'},
};

// ---------------------------------------------------------------------------
// FIXTURES — Casewright Legal Ops at Kestrel Labs, Wed Jul 15, 2026, 9:40 AM.
// SLA countdowns are pre-computed strings against that anchor, never clock
// math. Requesters are established Kestrel people in their prior-suite roles
// (plus plausible new business-team names); the in-house legal roster is
// Dana Whitfield (GC), Marcus Bell (commercial counsel), and Sana Qureshi
// (legal ops — the signed-in triage owner). The two Skylark/Larchpay vendor
// agreements stay with outside counsel Marlow & Voss LLP under M-2431 —
// intake only ROUTES to that matter team, never re-reviews in-house.
// ---------------------------------------------------------------------------

const REQUESTS: IntakeRequest[] = [
  {
    id: 'LR-1042',
    subject: 'Mutual NDA — Northgate Systems (prospect)',
    requester: 'Jonah Fields', team: 'GTM', type: 'nda', urgency: 'normal',
    submitted: 'Tue Jul 14, 4:12 PM', slaPolicy: 'SLA 2 business days',
    sla: '1d 6h left', slaState: 'ok',
    doc: 'Northgate_Mutual_NDA_(their_paper).docx',
    triage: {
      classification: 'NDA · Low complexity', score: '0.94', route: 'self-serve',
      routeTitle: 'Self-serve — Kestrel Mutual NDA v3.2',
      routeRationale:
        'The draft matches the standard mutual-NDA pattern; the two off-playbook terms below (3-year term, New York law) are both covered by the pre-approved template, so sending Kestrel paper resolves them without counsel time.',
      routeBand: 'high', routeCites: ['Playbook · NDA-STD-01', 'Kestrel Mutual NDA v3.2'],
      primaryAction: 'Send template & close', altTitle: 'Assign to counsel',
      altNote: 'Pick this if Northgate insists on their paper — the term and governing-law deltas then need a lawyer.', altAction: 'Assign to Marcus Bell',
      termsSource: 'Northgate_Mutual_NDA_(their_paper).docx',
      terms: [
        {label: 'Counterparty', value: 'Northgate Systems, Inc. (Delaware corp.)', band: 'high', cite: 'Draft · Preamble'},
        {label: 'Term', value: '3 years', deviation: 'Playbook standard: 2 years', band: 'high', cite: 'Draft · § 8.1'},
        {label: 'Governing law', value: 'New York', deviation: 'Playbook standard: Delaware', band: 'high', cite: 'Draft · § 11.3'},
        {label: 'Confidentiality tail', value: '5 years post-expiry', band: 'medium', cite: 'Draft · § 8.2'},
        {label: 'Non-solicit', value: 'None detected', band: 'low', cite: 'Full-text scan'},
      ],
      similar: [
        {id: 'LR-982', subject: 'Mutual NDA — Halbrook Media', outcome: 'self-served', note: 'Kestrel template accepted unchanged', cycle: '0.8d'},
        {id: 'LR-963', subject: 'Mutual NDA — Corvid Metrics', outcome: 'counsel', note: 'Non-standard IP clause · M. Bell', cycle: '3.2d'},
        {id: 'LR-941', subject: 'One-way NDA — Vantor Security', outcome: 'self-served', note: 'Standard inbound paper', cycle: '1.1d'},
      ],
      suggestedAssignee: 'Marcus Bell', suggestedPriority: 'P3 — Normal', suggestedDue: 'Thu Jul 16',
    },
  },
  {
    id: 'LR-1038',
    subject: 'Fernbrook Analytics — SaaS order form + DPA ($48k/yr)',
    requester: 'Elena Voss', team: 'Finance', type: 'vendor', urgency: 'high',
    submitted: 'Fri Jul 10, 9:05 AM', slaPolicy: 'SLA 2 business days',
    sla: 'Breached · 16h over', slaState: 'breached',
    doc: 'Fernbrook_OrderForm_DPA_v2.pdf',
    triage: {
      classification: 'Vendor contract · Medium complexity', score: '0.88', route: 'counsel',
      routeTitle: 'Assign to counsel — Marcus Bell',
      routeRationale:
        'Two terms sit outside the vendor playbook: liability is uncapped for data incidents (playbook caps at 2× annual fees) and the 12-month auto-renewal has only a 60-day notice window. Both need negotiated fallbacks, not template language.',
      routeBand: 'medium', routeCites: ['Playbook · VND-LIA-02', 'DPA v2 · § 9.2'],
      primaryAction: 'Assign to Marcus Bell', altTitle: 'Self-serve template',
      altNote: 'Not recommended — the uncapped data-incident liability cannot be resolved with rider language.', altAction: 'Send rider anyway',
      termsSource: 'Fernbrook_OrderForm_DPA_v2.pdf',
      terms: [
        {label: 'Vendor', value: 'Fernbrook Analytics Ltd. (England & Wales)', band: 'high', cite: 'Order form · p. 1'},
        {label: 'Annual value', value: '$48,000 · 12-month term', band: 'high', cite: 'Order form · § 2'},
        {label: 'Auto-renewal', value: '12 months · 60-day notice to cancel', band: 'high', cite: 'Order form · § 4'},
        {label: 'Liability cap', value: 'Uncapped for data incidents', deviation: 'Playbook: 2× annual fees', band: 'medium', cite: 'DPA v2 · § 9.2'},
        {label: 'Governing law', value: 'England & Wales', deviation: 'Playbook standard: Delaware', band: 'high', cite: 'MSA · § 14.1'},
      ],
      similar: [
        {id: 'LR-1004', subject: 'Trellix Data — order form renewal', outcome: 'counsel', note: 'Liability cap negotiated to 2×', cycle: '4.1d'},
        {id: 'LR-988', subject: 'Mapstack — renewal + rider', outcome: 'self-served', note: 'Playbook rider accepted', cycle: '1.2d'},
        {id: 'LR-951', subject: 'Fernbrook — pilot agreement', outcome: 'counsel', note: 'Same DPA issue last cycle', cycle: '5.0d'},
      ],
      suggestedAssignee: 'Marcus Bell', suggestedPriority: 'P2 — High', suggestedDue: 'Today · Jul 15',
    },
  },
  {
    id: 'LR-1051',
    subject: 'Skylark Cloud MSA — security addendum question',
    requester: 'Priya Raman', team: 'Engineering', type: 'vendor', urgency: 'high',
    submitted: 'Wed Jul 15, 8:20 AM', slaPolicy: 'SLA 8 business hours',
    sla: '6h 40m left', slaState: 'risk',
    doc: 'Skylark_Security_Addendum_draft.docx',
    triage: {
      classification: 'Vendor contract · High complexity', score: '0.81', route: 'escalate',
      verifiedLabel: 'Verified · S. Qureshi · Jul 15',
      routeTitle: 'Route to outside counsel — M-2431 matter team',
      routeRationale:
        'The Skylark Cloud MSA is in active negotiation at Marlow & Voss LLP (M-2431, D. Chen), racing the Atlas launch. The security addendum touches the open § 9.2 liability-cap flag, so it belongs with the matter team — re-reviewing in-house would fork the negotiation.',
      routeBand: 'high', routeCites: ['M-2431 · Skylark Cloud MSA v4', 'MSA v4 · § 9.2'],
      primaryAction: 'Route to M-2431 team', altTitle: 'Keep in-house',
      altNote: 'Pick this only for questions severable from the open MSA turn — this one is not.', altAction: 'Assign to Dana Whitfield',
      termsSource: 'Skylark_Security_Addendum_draft.docx',
      terms: [
        {label: 'Counterparty', value: 'Skylark Cloud, Inc.', band: 'high', cite: 'MSA v4 · Preamble'},
        {label: 'Addendum scope', value: 'SOC 2 Type II + annual pen-test cadence', band: 'medium', cite: 'Addendum · § 2'},
        {label: 'Liability cap', value: 'Cross-references MSA § 9.2 — under negotiation', band: 'high', cite: 'MSA v4 · § 9.2'},
      ],
      similar: [
        {id: 'LR-1029', subject: 'Skylark MSA v3 markup — intake', outcome: 'escalated', note: 'Routed to M-2431 · D. Chen', cycle: '0.3d'},
        {id: 'LR-1017', subject: 'Larchpay PPA v2 — chargeback question', outcome: 'escalated', note: 'Routed to M-2431 · D. Chen', cycle: '0.4d'},
        {id: 'LR-996', subject: 'CDN vendor — SLA credits', outcome: 'counsel', note: 'Handled in-house · M. Bell', cycle: '2.9d'},
      ],
      suggestedAssignee: 'Marlow & Voss LLP (outside)', suggestedPriority: 'P1 — Urgent', suggestedDue: 'Today · Jul 15',
    },
  },
  {
    id: 'LR-1036',
    subject: "Atlas launch page — performance claims ('3× faster deploys')",
    requester: 'Nadia Rahman', team: 'Product Marketing', type: 'marketing', urgency: 'high',
    submitted: 'Mon Jul 13, 2:40 PM', slaPolicy: 'SLA 2 business days',
    sla: '5h left', slaState: 'risk',
    doc: 'Atlas_landing_hero_copy_v3.pdf',
    triage: {
      classification: 'Marketing claims · Medium complexity', score: '0.86', route: 'counsel',
      routeTitle: 'Assign to counsel — Dana Whitfield',
      routeRationale:
        'The hero copy makes a quantified comparative claim. The cited support is an internal June benchmark, not a third-party study, so a lawyer needs to pass on the substantiation file before the Jul 21 beta expansion.',
      routeBand: 'medium', routeCites: ['Playbook · MKT-CLM-04', 'Benchmark memo · p. 2'],
      primaryAction: 'Assign to Dana Whitfield', altTitle: 'Self-serve checklist',
      altNote: 'Only for claims already on the approved-language list — quantified comparatives never are.', altAction: 'Send checklist anyway',
      termsSource: 'Atlas_landing_hero_copy_v3.pdf',
      terms: [
        {label: 'Claim', value: "'3× faster deploys than legacy CI pipelines'", band: 'medium', cite: 'Hero copy · line 2'},
        {label: 'Substantiation', value: 'Internal benchmark, Jun 2026 (n=40 repos)', band: 'low', cite: 'Benchmark memo · p. 2'},
        {label: 'Named competitor', value: 'None detected', band: 'high', cite: 'Full-text scan'},
      ],
      similar: [
        {id: 'LR-1011', subject: 'Q2 email campaign — uptime claims', outcome: 'counsel', note: 'Reworded to supportable range', cycle: '2.2d'},
        {id: 'LR-978', subject: "'SOC 2 certified' badge usage", outcome: 'self-served', note: 'Approved-language list', cycle: '0.6d'},
        {id: 'LR-969', subject: 'Beta customer testimonial release', outcome: 'counsel', note: 'Release form added', cycle: '1.9d'},
      ],
      suggestedAssignee: 'Dana Whitfield', suggestedPriority: 'P2 — High', suggestedDue: 'Today · Jul 15',
    },
  },
  {
    id: 'LR-1049',
    subject: 'Contractor-to-FTE conversion — Oregon remote hire',
    requester: 'Rosa Delgado', team: 'People Ops', type: 'employment', urgency: 'normal',
    submitted: 'Tue Jul 14, 11:30 AM', slaPolicy: 'SLA 3 business days',
    sla: '2d 1h left', slaState: 'ok',
    doc: 'Intake_form_LR-1049.pdf',
    triage: {
      classification: 'Employment · Medium complexity', score: '0.77', route: 'counsel',
      routeTitle: 'Assign to counsel — Dana Whitfield',
      routeRationale:
        'Employment questions are never self-serve under intake policy LGL-07. A 14-month 1099 engagement converting in Oregon raises classification-history exposure that needs counsel judgment, not a template.',
      routeBand: 'high', routeCites: ['Intake policy · LGL-07', 'Intake form · § 3'],
      primaryAction: 'Assign to Dana Whitfield', altTitle: 'Self-serve template',
      altNote: 'Unavailable for this category — policy LGL-07 routes all employment questions to counsel.', altAction: 'Not available',
      termsSource: 'Intake_form_LR-1049.pdf',
      terms: [
        {label: 'Worker location', value: 'Portland, Oregon (remote)', band: 'high', cite: 'Intake form · § 2'},
        {label: 'Current status', value: '1099 contractor · 14 months', band: 'medium', cite: 'Intake form · § 3'},
        {label: 'Target start', value: 'FTE offer targeted Aug 1, 2026', band: 'medium', cite: 'Intake form · § 4'},
      ],
      similar: [
        {id: 'LR-1002', subject: 'CA contractor conversion', outcome: 'counsel', note: 'Offer restructured · D. Whitfield', cycle: '3.5d'},
        {id: 'LR-972', subject: 'NY intern offer terms', outcome: 'counsel', note: 'Stipend terms revised', cycle: '2.0d'},
        {id: 'LR-955', subject: 'WA remote-work addendum', outcome: 'self-served', note: 'Standard addendum applied', cycle: '0.9d'},
      ],
      suggestedAssignee: 'Dana Whitfield', suggestedPriority: 'P3 — Normal', suggestedDue: 'Fri Jul 17',
    },
  },
  {
    id: 'LR-1044',
    subject: 'One-way NDA — Vantor Security (pen-test vendor)',
    requester: 'Tom Okonkwo', team: 'IT', type: 'nda', urgency: 'low',
    submitted: 'Tue Jul 14, 9:15 AM', slaPolicy: 'SLA 5 business days',
    sla: '4d 23h left', slaState: 'ok',
    doc: 'Vantor_OneWay_NDA_2026.docx',
    triage: {
      classification: 'NDA · Low complexity', score: '0.95', route: 'self-serve',
      routeTitle: 'Self-serve — approve inbound paper',
      routeRationale:
        'Kestrel is recipient-only under this one-way NDA and the draft matches the paper Vantor signed for the 2025 engagement (LR-941) clause-for-clause except the dates. Nothing here needs counsel.',
      routeBand: 'high', routeCites: ['Playbook · NDA-STD-02', 'LR-941 · 2025 engagement'],
      primaryAction: 'Approve & close', altTitle: 'Assign to counsel',
      altNote: 'Pick this if the scope expands beyond the pen-test engagement — e.g. source-code access.', altAction: 'Assign to Marcus Bell',
      termsSource: 'Vantor_OneWay_NDA_2026.docx',
      terms: [
        {label: 'Counterparty', value: 'Vantor Security LLC', band: 'high', cite: 'Draft · Preamble'},
        {label: 'Direction', value: 'One-way · Kestrel as recipient', band: 'high', cite: 'Draft · § 1.2'},
        {label: 'Term', value: '2 years', band: 'high', cite: 'Draft · § 6.1'},
      ],
      similar: [
        {id: 'LR-941', subject: 'One-way NDA — Vantor Security (2025)', outcome: 'self-served', note: 'Same paper, prior engagement', cycle: '1.1d'},
        {id: 'LR-1019', subject: 'NDA — Redcliff Audit Partners', outcome: 'self-served', note: 'Standard inbound paper', cycle: '0.7d'},
        {id: 'LR-987', subject: 'Pen-test SOW — Vantor Security', outcome: 'counsel', note: 'Liability rider added · M. Bell', cycle: '2.4d'},
      ],
      suggestedAssignee: 'Marcus Bell', suggestedPriority: 'P4 — Low', suggestedDue: 'Mon Jul 20',
    },
  },
  {
    id: 'LR-1052',
    subject: 'Brightloop — event swag PO terms ($9.4k)',
    requester: 'Jonah Fields', team: 'GTM', type: 'vendor', urgency: 'low',
    submitted: 'Wed Jul 15, 9:02 AM', slaPolicy: 'SLA 5 business days',
    sla: '5d 23h left', slaState: 'ok',
    doc: 'Brightloop_PO_terms.pdf',
    triage: {
      classification: 'Vendor contract · Low complexity', score: '0.91', route: 'self-serve',
      routeTitle: 'Self-serve — standard PO rider',
      routeRationale:
        'One-time purchase under the $10k procurement threshold with mutual indemnity capped at PO value. The standard PO rider covers it; procurement can countersign without counsel.',
      routeBand: 'high', routeCites: ['Playbook · PRC-PO-01', 'PO terms · § 5'],
      primaryAction: 'Send PO rider & close', altTitle: 'Assign to counsel',
      altNote: 'Pick this if Brightloop rejects the rider or the order becomes recurring.', altAction: 'Assign to Marcus Bell',
      termsSource: 'Brightloop_PO_terms.pdf',
      terms: [
        {label: 'Vendor', value: 'Brightloop Promotions LLC', band: 'high', cite: 'PO · p. 1'},
        {label: 'Value', value: '$9,400 · one-time', band: 'high', cite: 'PO · p. 1'},
        {label: 'Indemnity', value: 'Mutual, capped at PO value', band: 'medium', cite: 'Terms · § 5'},
      ],
      similar: [
        {id: 'LR-1015', subject: 'Conference booth vendor PO', outcome: 'self-served', note: 'Rider accepted', cycle: '0.5d'},
        {id: 'LR-993', subject: 'Print vendor PO terms', outcome: 'self-served', note: 'Rider accepted', cycle: '0.4d'},
        {id: 'LR-961', subject: 'Catering MSA — annual', outcome: 'counsel', note: 'Recurring spend · M. Bell', cycle: '2.1d'},
      ],
      suggestedAssignee: 'Marcus Bell', suggestedPriority: 'P4 — Low', suggestedDue: 'Wed Jul 22',
    },
  },
  {
    id: 'LR-1047',
    subject: 'Customer logo use — Halbrook Media case study',
    requester: 'Nadia Rahman', team: 'Product Marketing', type: 'marketing', urgency: 'normal',
    submitted: 'Tue Jul 14, 3:55 PM', slaPolicy: 'SLA 2 business days',
    sla: '2d 6h left', slaState: 'ok',
    doc: 'Halbrook_case_study_draft.pdf',
    triage: {
      classification: 'Marketing claims · Low complexity', score: '0.89', route: 'self-serve',
      routeTitle: 'Self-serve — logo-use checklist',
      routeRationale:
        'A signed reference agreement (Mar 2026) already grants logo and case-study rights. The checklist covers the remaining step — written customer approval of the two quotes, which is pending on the Jul 12 email thread.',
      routeBand: 'medium', routeCites: ['Reference agmt · § 4', 'Email thread · Jul 12'],
      primaryAction: 'Send checklist & close', altTitle: 'Assign to counsel',
      altNote: 'Pick this if Halbrook pushes back on quote approval or asks for copy changes.', altAction: 'Assign to Dana Whitfield',
      termsSource: 'Halbrook_case_study_draft.pdf',
      terms: [
        {label: 'Customer', value: 'Halbrook Media', band: 'high', cite: 'Draft · p. 1'},
        {label: 'Reference agreement', value: 'Signed Mar 2026 · logo + case-study rights', band: 'high', cite: 'Contract index · HAL-026'},
        {label: 'Quote approval', value: 'Pending customer sign-off', band: 'medium', cite: 'Email thread · Jul 12'},
      ],
      similar: [
        {id: 'LR-1008', subject: 'Corvid Metrics logo use', outcome: 'self-served', note: 'Checklist completed', cycle: '0.6d'},
        {id: 'LR-976', subject: 'Testimonial video release', outcome: 'counsel', note: 'Release drafted · D. Whitfield', cycle: '1.8d'},
        {id: 'LR-948', subject: 'G2 badge usage', outcome: 'self-served', note: 'Approved-language list', cycle: '0.3d'},
      ],
      suggestedAssignee: 'Dana Whitfield', suggestedPriority: 'P3 — Normal', suggestedDue: 'Fri Jul 17',
    },
  },
];

// Stat strip — quarter-to-date (Q3 QTD, Jul 1–15). Counts reconcile with the
// queue: 8 open rows, 1 breached (LR-1038), 2 at SLA risk (LR-1051, LR-1036).
// Month deflection bars: Q2 avg (30+34+36)/3 = 33% → QTD 38% = +5 pts.
const DEFLECTION_MONTHS: {month: string; pct: number; isCurrent?: boolean}[] = [
  {month: 'Apr', pct: 30}, {month: 'May', pct: 34}, {month: 'Jun', pct: 36},
  {month: 'Jul', pct: 38, isCurrent: true},
];

const ASSIGNEE_OPTIONS: {value: string; label: string}[] = [
  {value: 'Dana Whitfield', label: 'Dana Whitfield · General Counsel'},
  {value: 'Marcus Bell', label: 'Marcus Bell · Commercial Counsel'},
  {value: 'Sana Qureshi', label: 'Sana Qureshi · Legal Ops'},
  {value: 'Marlow & Voss LLP (outside)', label: 'Marlow & Voss LLP · outside counsel'},
];

const PRIORITY_OPTIONS: {value: string; label: string}[] = [
  {value: 'P1 — Urgent', label: 'P1 — Urgent'}, {value: 'P2 — High', label: 'P2 — High'},
  {value: 'P3 — Normal', label: 'P3 — Normal'}, {value: 'P4 — Low', label: 'P4 — Low'},
];

const DUE_OPTIONS: {value: string; label: string}[] = [
  {value: 'Today · Jul 15', label: 'Today · Wed Jul 15'},
  {value: 'Thu Jul 16', label: 'Thu Jul 16'}, {value: 'Fri Jul 17', label: 'Fri Jul 17'},
  {value: 'Mon Jul 20', label: 'Mon Jul 20'}, {value: 'Wed Jul 22', label: 'Wed Jul 22'},
];

const FILTER_OPTIONS: {value: 'all' | RequestType; label: string}[] = [
  {value: 'all', label: 'All'}, {value: 'nda', label: 'NDA'}, {value: 'vendor', label: 'Vendor'},
  {value: 'marketing', label: 'Claims'}, {value: 'employment', label: 'HR'},
];

// ---------------------------------------------------------------------------
// SHARED TRUST-PATTERN PRIMITIVES — one visual vocabulary across the suite:
// sparkle disclosure, citation chips, confidence bands (never fake
// precision — the raw classifier score is labeled as a classifier score,
// and legal judgment always renders as a band), and the
// verified/unverified traffic states. AI output never self-verifies;
// verification labels carry a human actor + date.
// ---------------------------------------------------------------------------

function AiMark() {
  return (
    <span style={styles.aiMark} aria-hidden>
      <Icon icon={SparklesIcon} size="sm" color="inherit" />
    </span>
  );
}

/** The suite-wide AI disclosure line — small, consistent, never buried. */
function DisclosureLine() {
  return (
    <span style={{...styles.disclosureRow, ...styles.noShrink}}>
      <Icon icon={SparklesIcon} size="xsm" color="inherit" />
      <Text type="supporting" size="xsm" color="inherit">AI-generated · verify before relying</Text>
    </span>
  );
}

/** Compact source-citation chip — every AI assertion carries at least one. */
function CitationChip({label}: {label: string}) {
  return (
    <span style={styles.noShrink}>
      <Token
        size="sm"
        color="gray"
        icon={<Icon icon={FileTextIcon} size="xsm" color="inherit" />}
        label={label}
      />
    </span>
  );
}

/** Confidence dot + band label — honest bands, low shown not hidden. */
function ConfidenceBand({band}: {band: Band}) {
  const meta = BAND_META[band];
  return (
    <span style={{...styles.dotBand, ...styles.noShrink}}>
      <StatusDot variant={meta.variant} label={meta.label} />
      <Text type="supporting" size="xsm" color="secondary">{meta.label}</Text>
    </span>
  );
}

function VerificationChip({label, state}: {label: string; state: 'verified' | 'unverified'}) {
  return (
    <span style={styles.noShrink}>
      <Token
        size="sm"
        color={state === 'verified' ? 'green' : 'yellow'}
        icon={
          <Icon
            icon={state === 'verified' ? CheckIcon : CircleDashedIcon}
            size="xsm"
            color="inherit"
          />
        }
        label={label}
      />
    </span>
  );
}

// ---------------------------------------------------------------------------
// HEADER — privilege strip, title row, deflection stat strip
// ---------------------------------------------------------------------------

function PrivilegeStrip() {
  return (
    <div style={styles.privilegeStrip}>
      <Icon icon={LockIcon} size="xsm" color="secondary" />
      <Text type="supporting" size="xsm" color="secondary">
        Attorney-Client Privileged · Attorney Work Product — do not forward
        outside Kestrel Legal
      </Text>
      <span style={{flex: 1}} aria-hidden />
      <Text type="supporting" size="xsm" color="secondary">
        Casewright Legal Ops · Kestrel Labs workspace
      </Text>
    </div>
  );
}

function TitleRow() {
  return (
    <div style={styles.titleRow}>
      <span style={styles.titleGlyph} aria-hidden>
        <Icon icon={ScaleIcon} size="md" color="inherit" />
      </span>
      <VStack gap={0}>
        <Heading level={1}>Legal request intake</Heading>
        <Text type="supporting" size="sm" color="secondary">
          Triage queue · Wed Jul 15, 2026 · signed in as Sana Qureshi, Legal Ops
        </Text>
      </VStack>
      <span style={{flex: 1}} aria-hidden />
      <span style={styles.noShrink}>
        <Token
          size="sm"
          color="purple"
          icon={<Icon icon={SparklesIcon} size="xsm" color="inherit" />}
          label="Casewright triage on"
        />
      </span>
    </div>
  );
}

interface StatBlockProps {
  icon: typeof InboxIcon;
  label: string;
  value: string;
  trend: ReactNode;
  children?: ReactNode;
}

function StatBlock({icon, label, value, trend, children}: StatBlockProps) {
  return (
    <div style={styles.statBlock}>
      <div style={styles.statLabelRow}>
        <Icon icon={icon} size="xsm" color="secondary" />
        <Text type="supporting" size="xsm" color="secondary">{label}</Text>
      </div>
      <div style={styles.statValueRow}>
        <span style={styles.statValue}>{value}</span>
        {trend}
      </div>
      {children}
    </div>
  );
}

function DeflectionBars() {
  return (
    <div style={styles.miniBarRow} role="img" aria-label="Self-serve deflection by month: April 30%, May 34%, June 36%, July to date 38%">
      {DEFLECTION_MONTHS.map(m => (
        <div key={m.month} style={styles.miniBarCol}>
          <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>{\`\${m.pct}%\`}</Text>
          <div style={styles.miniBarTrack}>
            <div
              style={{
                ...styles.miniBar,
                height: \`\${Math.round((m.pct / 50) * 100)}%\`,
                backgroundColor: m.isCurrent ? BAR_BLUE : BAR_MUTED,
              }}
            />
          </div>
          <Text type="supporting" size="xsm" color={m.isCurrent ? 'primary' : 'secondary'}>
            {m.month}
          </Text>
        </div>
      ))}
    </div>
  );
}

// Data-driven stat blocks; the deflection block additionally carries the
// labeled month mini-bars.
const STAT_BLOCKS: (Omit<StatBlockProps, 'trend' | 'children'> & {
  trendIcon: typeof TrendingUpIcon;
  trendColor: string;
  trendText: string;
  caption?: string;
})[] = [
  {icon: CircleCheckBigIcon, label: 'Self-serve deflection · QTD', value: '38%', trendIcon: TrendingUpIcon, trendColor: OK_GREEN, trendText: '+5 pts vs Q2'},
  {icon: TimerIcon, label: 'Median cycle time · QTD', value: '1.6d', trendIcon: TrendingDownIcon, trendColor: OK_GREEN, trendText: '−0.5d vs Q2', caption: 'Self-served 0.6d · counsel-reviewed 2.8d'},
  {icon: InboxIcon, label: 'Open requests', value: '8', trendIcon: TriangleAlertIcon, trendColor: BREACH_RED, trendText: '1 breached · 2 at risk', caption: 'Oldest open: LR-1038 · Fri Jul 10'},
  {icon: ShieldCheckIcon, label: 'SLA on-target · QTD', value: '92%', trendIcon: TrendingDownIcon, trendColor: RISK_AMBER, trendText: '−2 pts vs Q2 · target 95%', caption: '46 of 50 requests closed in SLA'},
];

function StatStrip() {
  return (
    <div style={styles.statStrip}>
      {STAT_BLOCKS.map((stat, index) => (
        <StatBlock
          key={stat.label}
          icon={stat.icon}
          label={stat.label}
          value={stat.value}
          trend={
            <span style={{...styles.statTrend, color: stat.trendColor}}>
              <Icon icon={stat.trendIcon} size="xsm" color="inherit" />
              <Text type="supporting" size="xsm" color="inherit" hasTabularNumbers>
                {stat.trendText}
              </Text>
            </span>
          }>
          {index === 0 ? (
            <DeflectionBars />
          ) : (
            <Text type="supporting" size="xsm" color="secondary">{stat.caption}</Text>
          )}
        </StatBlock>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// QUEUE PANEL — pinned search + type filter over an independently scrolling
// request List; dense rows, not cards. SLA countdowns are fixed strings;
// the one breached row reads red, at-risk rows amber.
// ---------------------------------------------------------------------------

function SlaReadout({request}: {request: IntakeRequest}) {
  const stateStyle =
    request.slaState === 'breached'
      ? styles.slaBreached
      : request.slaState === 'risk'
        ? styles.slaRisk
        : undefined;
  return (
    <span style={{...styles.slaText, ...stateStyle}}>
      <Icon
        icon={request.slaState === 'breached' ? TriangleAlertIcon : TimerIcon}
        size="xsm"
        color={request.slaState === 'ok' ? 'secondary' : 'inherit'}
      />
      <Text
        type="supporting"
        size="xsm"
        color={request.slaState === 'ok' ? 'secondary' : 'inherit'}
        hasTabularNumbers>
        {request.sla}
      </Text>
    </span>
  );
}

interface QueuePanelProps {
  requests: IntakeRequest[];
  selectedId: string;
  statusById: Record<string, RequestStatus>;
  query: string;
  onQueryChange: (value: string) => void;
  filter: 'all' | RequestType;
  onFilterChange: (value: 'all' | RequestType) => void;
  onSelect: (id: string) => void;
}

function QueuePanel({
  requests,
  selectedId,
  statusById,
  query,
  onQueryChange,
  filter,
  onFilterChange,
  onSelect,
}: QueuePanelProps) {
  return (
    <div style={styles.panelFill}>
      <div style={styles.panelSearch}>
        <TextInput
          label="Search requests"
          isLabelHidden
          size="sm"
          width="100%"
          placeholder="Search id, subject, requester…"
          startIcon={<Icon icon={SearchIcon} size="sm" />}
          value={query}
          onChange={onQueryChange}
        />
        <SegmentedControl
          label="Filter by request type"
          value={filter}
          onChange={value => onFilterChange(value as 'all' | RequestType)}
          size="sm">
          {FILTER_OPTIONS.map(option => (
            <SegmentedControlItem
              key={option.value}
              label={option.label}
              value={option.value}
            />
          ))}
        </SegmentedControl>
      </div>
      <div style={styles.panelList}>
        {requests.length === 0 ? (
          <div style={styles.panelEmpty}>
            <EmptyState
              isCompact
              icon={<Icon icon={InboxIcon} size="lg" />}
              title="No matching requests"
              description="Try a different search or type filter."
            />
          </div>
        ) : (
          <List density="compact" hasDividers>
            {requests.map(request => {
              const status = statusById[request.id] ?? 'open';
              return (
                <ListItem
                  key={request.id}
                  label={request.subject}
                  description={\`\${request.id} · \${request.requester} · \${request.team}\`}
                  startContent={<Avatar name={request.requester} size="small" />}
                  endContent={
                    <div style={styles.queueEndCol}>
                      <HStack gap={1} vAlign="center">
                        <Token
                          size="sm"
                          color={TYPE_META[request.type].color}
                          label={TYPE_META[request.type].label}
                        />
                        <Token
                          size="sm"
                          color={URGENCY_META[request.urgency].color}
                          label={URGENCY_META[request.urgency].label}
                        />
                      </HStack>
                      {status === 'open' ? (
                        <SlaReadout request={request} />
                      ) : (
                        <Token
                          size="sm"
                          color={STATUS_META[status].color}
                          label={STATUS_META[status].label}
                        />
                      )}
                    </div>
                  }
                  onClick={() => onSelect(request.id)}
                  isSelected={request.id === selectedId}
                />
              );
            })}
          </List>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DETAIL HEADER — request identity, requester, SLA, uploaded doc chip.
// ---------------------------------------------------------------------------

interface DetailHeaderProps {
  request: IntakeRequest;
  status: RequestStatus;
  statusNote?: string;
  isPhone: boolean;
  onBack: () => void;
}

function DetailHeader({request, status, statusNote, isPhone, onBack}: DetailHeaderProps) {
  return (
    <div style={styles.detailHeader}>
      <div style={styles.detailTitleRow}>
        {isPhone ? (
          <IconButton
            label="Back to request queue"
            tooltip="Back to request queue"
            size="sm"
            variant="ghost"
            icon={<Icon icon={ArrowLeftIcon} size="sm" />}
            onClick={onBack}
          />
        ) : null}
        <Text type="supporting" size="sm" color="secondary" hasTabularNumbers>{request.id}</Text>
        <div style={{flex: '1 1 200px', minWidth: 160}}>
          <Heading level={2}>{request.subject}</Heading>
        </div>
        {status !== 'open' ? (
          <span style={styles.noShrink}>
            <Token
              size="sm"
              color={STATUS_META[status].color}
              label={statusNote ?? STATUS_META[status].label}
            />
          </span>
        ) : null}
      </div>
      <div style={styles.detailMetaRow}>
        <HStack gap={1} vAlign="center">
          <Avatar name={request.requester} size="small" />
          <Text size="sm">{request.requester}</Text>
          <Text type="supporting" size="sm" color="secondary">· {request.team}</Text>
        </HStack>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          Submitted {request.submitted}
        </Text>
        <Text type="supporting" size="xsm" color="secondary">{request.slaPolicy}</Text>
        {status === 'open' ? <SlaReadout request={request} /> : null}
        {request.doc ? (
          <span style={styles.noShrink}>
            <Token
              size="sm"
              color="gray"
              icon={<Icon icon={PaperclipIcon} size="xsm" color="inherit" />}
              label={request.doc}
            />
          </span>
        ) : null}
      </div>
      {status === 'open' && request.slaState === 'breached' ? (
        <div style={styles.breachNote}>
          <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
          <Text type="supporting" size="xsm" color="inherit">
            SLA breached {request.sla.replace('Breached · ', '')} — due Tue Jul 14,
            5:00 PM. Triage or reassign now; breaches page the legal-ops channel.
          </Text>
        </div>
      ) : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// CASEWRIGHT TRIAGE — classification (with verification state + Mark
// verified), then the two route tiles with one-click actions. The raw
// classifier score is labeled as a classifier score; routing judgment
// carries an honest confidence band instead.
// ---------------------------------------------------------------------------

const ROUTE_ICON: Record<RouteKind, typeof SendIcon> = {
  'self-serve': SendIcon,
  counsel: UserPlusIcon,
  escalate: ArrowUpRightIcon,
};

interface TriageSectionProps {
  request: IntakeRequest;
  isVerified: boolean;
  verifiedLabel: string;
  isActionable: boolean;
  onVerify: () => void;
  onPrimary: () => void;
  onAlt: () => void;
}

function TriageSection({
  request,
  isVerified,
  verifiedLabel,
  isActionable,
  onVerify,
  onPrimary,
  onAlt,
}: TriageSectionProps) {
  const {triage} = request;
  const altUnavailable = triage.altAction === 'Not available';
  return (
    <section style={{...styles.section, ...styles.sectionAi}}>
      <div style={styles.sectionHead}>
        <AiMark />
        <Heading level={3}>Casewright triage</Heading>
        <span style={{flex: 1}} aria-hidden />
        <DisclosureLine />
      </div>
      <div style={styles.classRow}>
        <span style={styles.noShrink}>
          <Token size="md" color="purple" label={\`\${triage.classification} · \${triage.score}\`} />
        </span>
        <Text type="supporting" size="xsm" color="secondary">
          {triage.score} is the classifier score — not legal confidence
        </Text>
        <span style={styles.verifyGroup}>
          <VerificationChip
            label={isVerified ? verifiedLabel : 'Unverified'}
            state={isVerified ? 'verified' : 'unverified'}
          />
          {!isVerified && (
            <Button label="Mark verified" size="sm" variant="secondary" onClick={onVerify} />
          )}
        </span>
      </div>
      <div style={styles.routeGrid}>
        <div style={{...styles.routeTile, ...styles.routeTileRecommended}}>
          <div style={styles.routeTileHead}>
            <Icon icon={ROUTE_ICON[triage.route]} size="sm" color="secondary" />
            <Text size="sm" weight="bold">{triage.routeTitle}</Text>
            <span style={styles.noShrink}>
              <Token size="sm" color="purple" label="Recommended" />
            </span>
          </div>
          <Text type="supporting" size="sm" color="secondary">{triage.routeRationale}</Text>
          <div style={styles.citeRow}>
            <ConfidenceBand band={triage.routeBand} />
            {triage.routeCites.map(cite => (
              <CitationChip key={cite} label={cite} />
            ))}
          </div>
          <div style={styles.routeActions}>
            <Button
              label={triage.primaryAction}
              size="sm"
              icon={<Icon icon={ROUTE_ICON[triage.route]} size="sm" />}
              onClick={onPrimary}
              isDisabled={!isActionable}
            />
            <DisclosureLine />
          </div>
        </div>
        <div style={styles.routeTile}>
          <div style={styles.routeTileHead}>
            <Icon icon={UserPlusIcon} size="sm" color="secondary" />
            <Text size="sm" weight="bold">{triage.altTitle}</Text>
          </div>
          <Text type="supporting" size="sm" color="secondary">{triage.altNote}</Text>
          <div style={styles.routeActions}>
            <Button
              label={triage.altAction}
              size="sm"
              variant="secondary"
              onClick={onAlt}
              isDisabled={!isActionable || altUnavailable}
            />
          </div>
        </div>
      </div>
    </section>
  );
}

// ---------------------------------------------------------------------------
// KEY TERMS — auto-extracted from the uploaded doc; every value carries a
// confidence dot + band and a citation chip pointing at the source passage.
// Off-playbook deviations render in amber next to the value.
// ---------------------------------------------------------------------------

function KeyTermsSection({triage}: {triage: Triage}) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHead}>
        <AiMark />
        <Heading level={3}>Extracted key terms</Heading>
        <Text type="supporting" size="xsm" color="secondary">from {triage.termsSource}</Text>
        <span style={{flex: 1}} aria-hidden />
        <DisclosureLine />
      </div>
      <VStack gap={0}>
        {triage.terms.map((term, index) => (
          <div key={term.label}>
            {index > 0 ? <Divider /> : null}
            <div style={styles.termRow}>
              <div style={styles.termLabel}>
                <Text type="supporting" size="xsm" color="secondary">{term.label}</Text>
              </div>
              <div style={styles.termBody}>
                <Text size="sm">{term.value}</Text>
                {term.deviation ? (
                  <span style={styles.deviation}>
                    <Text type="supporting" size="xsm" color="inherit">⚠ {term.deviation}</Text>
                  </span>
                ) : null}
              </div>
              <div style={styles.termMeta}>
                <ConfidenceBand band={term.band} />
                <CitationChip label={term.cite} />
              </div>
            </div>
          </div>
        ))}
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// SIMILAR PAST REQUESTS — outcomes and cycle times, matched by Casewright.
// ---------------------------------------------------------------------------

function SimilarSection({triage}: {triage: Triage}) {
  return (
    <section style={styles.section}>
      <div style={styles.sectionHead}>
        <Icon icon={HistoryIcon} size="sm" color="secondary" />
        <Heading level={3}>Similar past requests</Heading>
        <Text type="supporting" size="xsm" color="secondary">matched by Casewright</Text>
        <span style={{flex: 1}} aria-hidden />
        <DisclosureLine />
      </div>
      <VStack gap={0}>
        {triage.similar.map((item, index) => (
          <div key={item.id}>
            {index > 0 ? <Divider /> : null}
            <div style={styles.similarRow}>
              <div style={styles.similarBody}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                    {item.id}
                  </Text>
                  <Text size="sm">{item.subject}</Text>
                </HStack>
                <Text type="supporting" size="xsm" color="secondary">{item.note}</Text>
              </div>
              <span style={styles.noShrink}>
                <Token
                  size="sm"
                  color={OUTCOME_META[item.outcome].color}
                  label={OUTCOME_META[item.outcome].label}
                />
              </span>
              <span style={{...styles.cycleText, ...styles.noShrink}}>
                <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                  {item.cycle} cycle
                </Text>
              </span>
            </div>
          </div>
        ))}
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// ASSIGNMENT FOOTER — assignee, priority, due date, Assign. Sits in normal
// flex flow under the scroll body (no overlay clearance needed). Values are
// controlled by the page so the route tiles can prefill the assignee.
// ---------------------------------------------------------------------------

interface AssignmentDraft {
  assignee: string;
  priority: string;
  due: string;
}

interface AssignmentFooterProps {
  draft: AssignmentDraft;
  isActionable: boolean;
  onChange: (patch: Partial<AssignmentDraft>) => void;
  onAssign: () => void;
}

const FOOTER_FIELDS: {key: keyof AssignmentDraft; label: string; width: number; options: {value: string; label: string}[]}[] = [
  {key: 'assignee', label: 'Assignee', width: 250, options: ASSIGNEE_OPTIONS},
  {key: 'priority', label: 'Priority', width: 140, options: PRIORITY_OPTIONS},
  {key: 'due', label: 'Due date', width: 160, options: DUE_OPTIONS},
];

function AssignmentFooter({draft, isActionable, onChange, onAssign}: AssignmentFooterProps) {
  return (
    <div style={styles.footerBar}>
      {FOOTER_FIELDS.map(field => (
        <div key={field.key} style={styles.footerField}>
          <Text type="supporting" size="xsm" color="secondary">{field.label}</Text>
          <Selector
            label={field.label}
            isLabelHidden
            size="sm"
            width={field.width}
            options={field.options}
            value={draft[field.key]}
            onChange={value => onChange({[field.key]: value})}
            isDisabled={!isActionable}
          />
        </div>
      ))}
      {/* marginLeft auto (not a flex spacer) keeps the button end-aligned
          even when it wraps to its own row below the selectors. */}
      <span style={{marginLeft: 'auto'}}>
        <Button
          label="Assign request"
          size="sm"
          icon={<Icon icon={UserPlusIcon} size="sm" />}
          onClick={onAssign}
          isDisabled={!isActionable}
        />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type DialogKind = 'send' | 'escalate';

function getDefaultDraft(request: IntakeRequest): AssignmentDraft {
  return {
    assignee: request.triage.suggestedAssignee,
    priority: request.triage.suggestedPriority,
    due: request.triage.suggestedDue,
  };
}

export default function LegalRequestIntakeTemplate() {
  const isPhone = useMediaQuery('(max-width: 900px)');

  const [selectedId, setSelectedId] = useState('LR-1042');
  const [isDetailShownOnPhone, setIsDetailShownOnPhone] = useState(false);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState<'all' | RequestType>('all');
  // In-session verdicts: request status, human verification of the triage,
  // and the per-request assignment drafts (prefillable from the route tiles).
  const [statusById, setStatusById] = useState<Record<string, RequestStatus>>({});
  const [statusNoteById, setStatusNoteById] = useState<Record<string, string>>({});
  const [verifiedIds, setVerifiedIds] = useState<Set<string>>(() => new Set());
  const [drafts, setDrafts] = useState<Record<string, AssignmentDraft>>({});
  const [dialogKind, setDialogKind] = useState<DialogKind | null>(null);

  const normalizedQuery = query.trim().toLowerCase();
  const filtered = REQUESTS.filter(request => {
    if (filter !== 'all' && request.type !== filter) return false;
    if (normalizedQuery === '') return true;
    return \`\${request.id} \${request.subject} \${request.requester} \${request.team}\`
      .toLowerCase()
      .includes(normalizedQuery);
  });

  const selected = REQUESTS.find(request => request.id === selectedId) ?? REQUESTS[0];
  const selectedStatus = statusById[selected.id] ?? 'open';
  const isActionable = selectedStatus === 'open';
  const isVerified =
    verifiedIds.has(selected.id) || selected.triage.verifiedLabel !== undefined;
  const verifiedLabel = verifiedIds.has(selected.id)
    ? 'Verified · S. Qureshi · Jul 15'
    : (selected.triage.verifiedLabel ?? 'Unverified');
  const draft = drafts[selected.id] ?? getDefaultDraft(selected);

  const handleSelect = (id: string) => {
    setSelectedId(id);
    setIsDetailShownOnPhone(true);
  };

  const patchDraft = (patch: Partial<AssignmentDraft>) => {
    setDrafts(prev => ({
      ...prev,
      [selected.id]: {...(prev[selected.id] ?? getDefaultDraft(selected)), ...patch},
    }));
  };

  const settleRequest = (status: RequestStatus, note: string) => {
    setStatusById(prev => ({...prev, [selected.id]: status}));
    setStatusNoteById(prev => ({...prev, [selected.id]: note}));
  };

  const handleVerify = () => {
    setVerifiedIds(prev => {
      const next = new Set(prev);
      next.add(selected.id);
      return next;
    });
  };

  // Route-tile one-click actions. Self-serve sends and outside-counsel
  // routing are irreversible hand-offs, so both are confirm-gated
  // (AlertDialog); assigning to counsel only prefills the footer.
  const handlePrimary = () => {
    if (selected.triage.route === 'self-serve') setDialogKind('send');
    else if (selected.triage.route === 'escalate') setDialogKind('escalate');
    else patchDraft({assignee: selected.triage.suggestedAssignee});
  };

  const handleAlt = () => {
    const {altAction} = selected.triage;
    if (altAction.startsWith('Assign to ')) {
      patchDraft({assignee: altAction.replace('Assign to ', '')});
    } else if (selected.triage.route === 'escalate') {
      patchDraft({assignee: 'Dana Whitfield'});
    } else {
      setDialogKind('send');
    }
  };

  const handleAssign = () => {
    const isOutside = draft.assignee.includes('Marlow & Voss');
    settleRequest(
      isOutside ? 'escalated' : 'assigned',
      isOutside
        ? 'Escalated · M&V LLP'
        : \`Assigned · \${draft.assignee} · due \${draft.due.replace('Today · ', '')}\`,
    );
  };

  const confirmDialog = () => {
    if (dialogKind === 'send') settleRequest('self-served', 'Self-served · closed');
    else settleRequest('escalated', 'Escalated · M&V LLP · M-2431');
    setDialogKind(null);
  };

  // The send dialog is reached from the PRIMARY tile on self-serve routes
  // and from the ALT ("send anyway") tile on counsel routes — title with
  // whichever action actually opened it.
  const sendTitle =
    selected.triage.route === 'self-serve'
      ? selected.triage.primaryAction
      : selected.triage.altAction;

  const queuePane = (
    <QueuePanel
      requests={filtered}
      selectedId={selected.id}
      statusById={statusById}
      query={query}
      onQueryChange={setQuery}
      filter={filter}
      onFilterChange={setFilter}
      onSelect={handleSelect}
    />
  );

  const detailPane = (
    <div style={styles.detailFill}>
      <DetailHeader
        request={selected}
        status={selectedStatus}
        statusNote={statusNoteById[selected.id]}
        isPhone={isPhone}
        onBack={() => setIsDetailShownOnPhone(false)}
      />
      <div style={styles.detailScroll}>
        <TriageSection
          request={selected}
          isVerified={isVerified}
          verifiedLabel={verifiedLabel}
          isActionable={isActionable}
          onVerify={handleVerify}
          onPrimary={handlePrimary}
          onAlt={handleAlt}
        />
        <KeyTermsSection triage={selected.triage} />
        <SimilarSection triage={selected.triage} />
      </div>
      <AssignmentFooter
        draft={draft}
        isActionable={isActionable}
        onChange={patchDraft}
        onAssign={handleAssign}
      />
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider padding={0}>
            <PrivilegeStrip />
            <TitleRow />
            <StatStrip />
          </LayoutHeader>
        }
        start={
          isPhone ? undefined : (
            <LayoutPanel width={360} padding={0} hasDivider label="Request queue">
              {queuePane}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            {isPhone && !isDetailShownOnPhone ? queuePane : detailPane}
          </LayoutContent>
        }
      />
      <AlertDialog
        isOpen={dialogKind === 'send'}
        onOpenChange={isOpen => setDialogKind(isOpen ? 'send' : null)}
        title={\`\${sendTitle}?\`}
        description={\`Casewright sends the pre-approved self-serve packet to \${selected.requester} and closes \${selected.id} as self-served. The requester is told legal review is complete — reopening requires a new request.\`}
        actionLabel="Send & close"
        cancelLabel="Keep open"
        onAction={confirmDialog}
      />
      <AlertDialog
        isOpen={dialogKind === 'escalate'}
        onOpenChange={isOpen => setDialogKind(isOpen ? 'escalate' : null)}
        title="Route to outside counsel?"
        description={\`\${selected.id} and its attached draft leave Kestrel Legal for Marlow & Voss LLP (matter M-2431). Privileged material is shared under the joint engagement and the matter team takes over the SLA.\`}
        actionLabel="Route to M-2431"
        cancelLabel="Keep in-house"
        onAction={confirmDialog}
      />
    </div>
  );
}
`;export{e as default};