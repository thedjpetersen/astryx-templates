// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file security-trust-center.tsx
 * @input Deterministic fixtures only (the fictional "Vantage" data
 *   platform's trust center: a live-status row with a fixed 99.98% 90-day
 *   uptime figure and a 90-day per-day uptime history ending 2026-07-12
 *   with one maintenance window and one degraded day, four compliance
 *   frameworks (SOC 2 Type II / ISO 27001 / GDPR / HIPAA) each with seal
 *   monogram, auditor blurb, and artifact chip, twelve security-practice
 *   rows grouped into Encryption / Access / Infrastructure / People, a
 *   three-node client → edge → vault data-flow schematic with per-node
 *   detail copy, six subprocessors with region and DPA state, a
 *   security.txt body plus PGP fingerprint, and the last three security
 *   changelog entries)
 * @output Full trust-center marketing page: sticky navbar (brand mark +
 *   five smooth-scrolling anchor links + Request-reports CTA, collapsing
 *   to a menu button with a dropdown at compact widths), an assurance
 *   hero with a pulsing operational StatusDot, a counting uptime chip,
 *   a status-page link chip, and a trust-snapshot card whose 90-day
 *   uptime tick strip draws in staggered on first view (the signature
 *   moment) above three counting stats; a tinted compliance band of four
 *   seal cards whose "Report available" chips open an inline validating
 *   request-access email capture with a per-card sent state; a
 *   twelve-row practices accordion grouped by category; an architecture
 *   band with an interactive SVG data-flow schematic (hover/focus/click
 *   a node to swap the detail panel); a subprocessor Table that becomes
 *   stacked cards at narrow widths; a responsible-disclosure card with a
 *   copyable security.txt CodeBlock and a PGP fingerprint row with
 *   copied feedback; a three-entry security-changelog strip; and a
 *   footer with legal links and a last-reviewed line. Scroll-reveals
 *   rise 12px and fire once; count-ups run on first view; everything is
 *   gated by prefers-reduced-motion (reveals render visible, counters
 *   render final, the tick strip draws instantly).
 * @position Page template; emitted by `astryx template security-trust-center`
 *
 * Frame: Layout height="fill" with LayoutContent padding 0 — the page
 * owns its own chrome. A measured wrapper div (ResizeObserver) hosts the
 * scroll container; the navbar is position:sticky top:0 inside it, and a
 * centered 1100px column carries every section while tinted bands and
 * the footer paint full-bleed. The Toast sits fixed bottom-right.
 *
 * Color policy: token-pure except ONE quarantined brand accent declared
 * as a light-dark() pair (plus its low-alpha soft tint of the same two
 * hexes) with contrast math documented at the declaration. Status tints
 * (success / warning / error) use var(--color-*) tokens with explicit
 * light-dark() fallbacks, matching the repo convention.
 *
 * Responsive contract (element width, not viewport — the inline demo
 * stage is ~1045px wide, so the page measures itself):
 * - Column: max-width 1100px, centered; tinted bands and footer bleed.
 * - <=980px: compliance wall drops 4-up → 2-up; practices grid 2 → 1.
 * - <=880px: nav anchors + CTA collapse behind a 40px menu button whose
 *   dropdown closes on Escape, outside pointerdown, or selection.
 * - <=760px: hero splits stack (snapshot card below copy), the data-flow
 *   schematic swaps to its vertical layout, and the disclosure /
 *   changelog pair stacks.
 * - <=640px: the subprocessor Table becomes stacked vendor cards.
 * - <=540px: compliance wall goes single column, headline steps down,
 *   band paddings tighten, and the request forms stack their buttons.
 *   Action rows wrap, so the page holds at 390px with no overflow-x.
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
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {CodeBlock} from '@astryxdesign/core/CodeBlock';
import {Collapsible} from '@astryxdesign/core/Collapsible';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Table, pixel, proportional} from '@astryxdesign/core/Table';
import type {TableColumn} from '@astryxdesign/core/Table';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Toast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {
  ActivityIcon,
  ArrowRightIcon,
  BugIcon,
  CheckIcon,
  CopyIcon,
  ExternalLinkIcon,
  FileTextIcon,
  KeyRoundIcon,
  LockKeyholeIcon,
  MailCheckIcon,
  MenuIcon,
  SendIcon,
  ServerIcon,
  ShieldCheckIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

type Glyph = ComponentType<SVGProps<SVGSVGElement>>;

// ============= QUARANTINED ACCENT =============
// The single sanctioned accent literal for the Vantage brand — a deep
// "audited calm" teal. Contrast math: #0F766E on a white light-mode body
// is 5.5:1 (AA for normal text and UI glyphs); #5EEAD4 on a ~#1E1E1E
// dark surface is 11.2:1 (AAA). ACCENT_SOFT is the same two hexes at low
// alpha, used only as a fill behind accent-colored glyphs/chips — never
// as a text color. Everything else on the page is token-pure.
const ACCENT = 'light-dark(#0F766E, #5EEAD4)';
const ACCENT_SOFT =
  'light-dark(rgba(15, 118, 110, 0.10), rgba(94, 234, 212, 0.13))';

// Status tints follow the repo convention: token first, explicit
// light-dark() fallback second.
const SUCCESS = 'var(--color-success, light-dark(#1E8E3E, #6DD58C))';
const WARNING = 'var(--color-warning, light-dark(#B26A00, #FCD34D))';
const ERROR = 'var(--color-error, light-dark(#B3261E, #F2B8B5))';

/** Sticky-nav height; smooth-scroll allows for it. */
const NAV_ALLOWANCE = 64;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  page: {
    position: 'relative',
    height: '100%',
    overflowY: 'auto',
    backgroundColor: 'var(--color-background-body)',
    color: 'var(--color-text-primary)',
  },
  column: {
    width: '100%',
    maxWidth: 1100,
    marginInline: 'auto',
    paddingInline: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-9)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-6)',
  },
  columnCompact: {
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-6)',
    gap: 'var(--spacing-5)',
  },
  bandTinted: {
    backgroundColor: 'var(--color-background-muted)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  // ---- sticky navbar ----
  navBar: {
    position: 'sticky',
    top: 0,
    zIndex: 30,
    backgroundColor: 'var(--color-background-body)',
    borderBottom: '1px solid var(--color-border)',
  },
  navInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 1100,
    marginInline: 'auto',
    boxSizing: 'border-box',
    padding: 'var(--spacing-2) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minHeight: 56,
  },
  brandTile: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  navLink: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 40,
    paddingInline: 11,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  iconButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
    color: 'var(--color-text-primary)',
  },
  menuPanel: {
    position: 'absolute',
    top: 'calc(100% + 4px)',
    right: 'var(--spacing-4)',
    left: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-body)',
    boxShadow:
      'var(--shadow-high, 0 12px 32px light-dark(rgba(15, 23, 42, 0.18), rgba(0, 0, 0, 0.5)))',
    padding: 'var(--spacing-3)',
    zIndex: 40,
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  menuLink: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    width: '100%',
    minHeight: 44,
    paddingInline: 8,
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 15,
    fontWeight: 600,
    color: 'var(--color-text-primary)',
    textAlign: 'left',
  },
  // ---- hero ----
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-8)',
    alignItems: 'center',
  },
  heroRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-5)',
  },
  heroText: {
    flex: '1.1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroHeadline: {
    fontSize: 42,
    fontWeight: 700,
    lineHeight: 1.12,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroHeadlineCompact: {
    fontSize: 29,
  },
  heroSubcopy: {
    fontSize: 17,
    lineHeight: 1.55,
    color: 'var(--color-text-secondary)',
    maxWidth: 500,
    margin: 0,
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: 700,
    letterSpacing: '0.12em',
    textTransform: 'uppercase',
    color: ACCENT,
  },
  statusChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 8,
    height: 32,
    paddingInline: 12,
    borderRadius: 999,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    fontSize: 13,
    fontWeight: 600,
    whiteSpace: 'nowrap',
  },
  // ---- trust snapshot card (hero right) ----
  snapshotCard: {
    flex: '1 1 0',
    minWidth: 0,
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    boxShadow: 'var(--shadow-med)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  tickStrip: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 2,
    height: 34,
  },
  tick: {
    flex: '1 1 0',
    minWidth: 0,
    height: '100%',
    borderRadius: 1.5,
    transformOrigin: 'bottom',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 2,
    flexShrink: 0,
  },
  statValue: {
    fontSize: 26,
    fontWeight: 700,
    lineHeight: 1.1,
    letterSpacing: '-0.01em',
    fontVariantNumeric: 'tabular-nums',
  },
  // ---- section headers ----
  sectionHead: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    maxWidth: 680,
  },
  sectionTitle: {
    fontSize: 28,
    fontWeight: 700,
    letterSpacing: '-0.015em',
    lineHeight: 1.2,
    margin: 0,
  },
  sectionTitleCompact: {
    fontSize: 22,
  },
  // ---- compliance wall ----
  complianceGrid: {
    display: 'grid',
    gap: 'var(--spacing-4)',
  },
  complianceCard: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  requestForm: {
    display: 'flex',
    gap: 'var(--spacing-2)',
    alignItems: 'flex-start',
  },
  requestFormStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  requestInput: {
    flex: '1 1 0',
    minWidth: 0,
  },
  errorText: {
    fontSize: 13,
    margin: 0,
    color: ERROR,
  },
  successDisc: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  // ---- practices accordion ----
  practicesGrid: {
    display: 'grid',
    gap: 'var(--spacing-5)',
  },
  categoryBlock: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    minWidth: 0,
  },
  categoryGlyph: {
    width: 34,
    height: 34,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 9,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
  },
  practiceCard: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    paddingInline: 'var(--spacing-3)',
    paddingBlock: 'var(--spacing-1)',
  },
  // ---- data-flow schematic ----
  flowCard: {
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  flowDetail: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    minHeight: 96,
    boxSizing: 'border-box',
  },
  // ---- subprocessors ----
  vendorTile: {
    width: 32,
    height: 32,
    flexShrink: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: ACCENT_SOFT,
    color: ACCENT,
    fontSize: 12,
    fontWeight: 700,
    letterSpacing: '0.02em',
  },
  vendorCard: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  tableFrame: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    overflow: 'hidden',
  },
  // ---- disclosure + changelog ----
  duoRow: {
    display: 'flex',
    gap: 'var(--spacing-5)',
    alignItems: 'stretch',
  },
  duoRowStacked: {
    flexDirection: 'column',
  },
  disclosureCard: {
    flex: '1.25 1 0',
    minWidth: 0,
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    boxSizing: 'border-box',
  },
  fingerprintRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    flexWrap: 'wrap',
  },
  mono: {
    fontFamily: 'var(--font-family-mono, ui-monospace, monospace)',
    fontSize: 12,
    letterSpacing: '0.02em',
    wordBreak: 'break-word',
  },
  changelogCol: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  changelogEntry: {
    borderRadius: 12,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3) var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // ---- footer ----
  footer: {
    borderTop: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  footerLink: {
    display: 'inline-flex',
    alignItems: 'center',
    minHeight: 36,
    paddingInline: 4,
    border: 'none',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    fontSize: 14,
    color: 'var(--color-text-secondary)',
    textAlign: 'left',
  },
  // ---- toast ----
  toastWrap: {
    position: 'fixed',
    bottom: 'var(--spacing-5)',
    right: 'var(--spacing-5)',
    width: 352,
    maxWidth: 'calc(100vw - 2 * var(--spacing-5))',
    zIndex: 60,
  },
};

// ============= DATA =============
// Deterministic fixtures for the fictional Vantage data platform.
// No Date.now, no randomness, no network assets, no real logos.

const BRAND = {
  name: 'Vantage',
  suffix: 'Trust Center',
  statusHost: 'status.vantagedata.io',
};

const HERO = {
  eyebrow: 'Vantage Trust Center',
  headline: 'Your data, provably safe',
  subcopy:
    'Vantage moves and stores your most sensitive records. This page is ' +
    'the living inventory of how we protect them — the audits we pass, ' +
    'the controls we run, and the people who answer when something looks ' +
    'wrong.',
  uptimePercent: 99.98,
};

type SectionId =
  | 'compliance'
  | 'practices'
  | 'architecture'
  | 'subprocessors'
  | 'disclosure';

const NAV_ANCHORS: readonly {id: SectionId; label: string}[] = [
  {id: 'compliance', label: 'Compliance'},
  {id: 'practices', label: 'Practices'},
  {id: 'architecture', label: 'Architecture'},
  {id: 'subprocessors', label: 'Subprocessors'},
  {id: 'disclosure', label: 'Disclosure'},
];

/** 90-day uptime history ending 2026-07-12: 88 green, 1 amber, 1 red. */
type DayStatus = 'operational' | 'maintenance' | 'degraded';

interface UptimeDay {
  iso: string;
  status: DayStatus;
  note: string;
}

const UPTIME_EPOCH_UTC = Date.UTC(2026, 3, 14); // 2026-04-14, fixed fixture
const DAY_MS = 86_400_000;

const UPTIME_DAYS: readonly UptimeDay[] = Array.from({length: 90}, (_, i) => {
  const iso = new Date(UPTIME_EPOCH_UTC + i * DAY_MS)
    .toISOString()
    .slice(0, 10);
  if (iso === '2026-05-14') {
    return {
      iso,
      status: 'maintenance' as const,
      note: 'Scheduled maintenance · 02:00–02:35 UTC',
    };
  }
  if (iso === '2026-06-03') {
    return {
      iso,
      status: 'degraded' as const,
      note: 'Elevated ingest errors · 41 min · postmortem published',
    };
  }
  return {iso, status: 'operational' as const, note: 'Operational'};
});

const TICK_COLOR: Record<DayStatus, string> = {
  operational: SUCCESS,
  maintenance: WARNING,
  degraded: ERROR,
};

/** Hero snapshot stats — all counted up on first view. */
const SNAPSHOT_STATS: readonly {
  id: string;
  target: number;
  suffix: string;
  label: string;
}[] = [
  {id: 'controls', target: 247, suffix: '', label: 'automated controls monitored'},
  {id: 'patch', target: 48, suffix: ' h', label: 'critical-patch SLA (median 11 h)'},
  {id: 'frameworks', target: 4, suffix: '', label: 'frameworks audited annually'},
];

// ---- compliance wall ----

interface Framework {
  id: string;
  seal: string;
  name: string;
  blurb: string;
  chipLabel: string;
  artifact: string;
}

const FRAMEWORKS: readonly Framework[] = [
  {
    id: 'soc2',
    seal: 'SOC 2',
    name: 'SOC 2 Type II',
    blurb:
      'Audited annually by Meridian Assurance LLP against the Security, ' +
      'Availability, and Confidentiality criteria. Latest period Nov 2024 ' +
      '– Oct 2025: zero exceptions noted.',
    chipLabel: 'Report available',
    artifact: 'SOC 2 Type II report',
  },
  {
    id: 'iso27001',
    seal: '27001',
    name: 'ISO/IEC 27001:2022',
    blurb:
      'Certified since 2023 by Nordcert. Scope covers the Vantage ' +
      'platform, corporate IT, and the Frankfurt and Toronto regions; ' +
      'surveillance audit passed May 2026.',
    chipLabel: 'Certificate available',
    artifact: 'ISO 27001 certificate',
  },
  {
    id: 'gdpr',
    seal: 'GDPR',
    name: 'GDPR',
    blurb:
      'EU customer data stays in eu-central by default. Standard ' +
      'Contractual Clauses ship in every DPA, and DSAR tooling closes ' +
      'requests inside a 30-day SLA.',
    chipLabel: 'DPA available',
    artifact: 'Data Processing Addendum',
  },
  {
    id: 'hipaa',
    seal: 'HIPAA',
    name: 'HIPAA',
    blurb:
      'Business Associate Agreements are available on the Scale plan. ' +
      'PHI workloads run in dedicated cells with customer-managed keys ' +
      'and separate audit trails.',
    chipLabel: 'BAA on request',
    artifact: 'Business Associate Agreement',
  },
];

// ---- security practices (12 rows across 4 categories) ----

interface Practice {
  id: string;
  title: string;
  copy: string;
}

interface PracticeCategory {
  id: string;
  name: string;
  icon: Glyph;
  rows: readonly Practice[];
}

const PRACTICE_CATEGORIES: readonly PracticeCategory[] = [
  {
    id: 'encryption',
    name: 'Encryption',
    icon: LockKeyholeIcon,
    rows: [
      {
        id: 'transit',
        title: 'Encryption in transit',
        copy:
          'TLS 1.3 everywhere, HSTS preloaded, and internal service-to-' +
          'service traffic authenticated over mTLS with SPIFFE identities. ' +
          'TLS 1.0–1.2 are disabled at the edge.',
      },
      {
        id: 'rest',
        title: 'Encryption at rest',
        copy:
          'AES-256-GCM on every datastore, queue, and backup. Envelope ' +
          'encryption issues a distinct data key per tenant, rotated every ' +
          '90 days without downtime.',
      },
      {
        id: 'keys',
        title: 'Key management',
        copy:
          'Root keys live in cloud HSMs validated to FIPS 140-2 Level 3. ' +
          'Scale customers can bring their own keys (BYOK); root-key ' +
          'operations require dual control.',
      },
    ],
  },
  {
    id: 'access',
    name: 'Access',
    icon: KeyRoundIcon,
    rows: [
      {
        id: 'sso',
        title: 'Single sign-on & MFA',
        copy:
          'SSO is enforced org-wide and every employee authenticates with ' +
          'a hardware security key. No shared accounts, no SMS codes, no ' +
          'password-only fallback.',
      },
      {
        id: 'least-privilege',
        title: 'Least-privilege production access',
        copy:
          'Production access is granted through short-lived, peer-approved ' +
          'sessions — median grant length 42 minutes. Standing admin ' +
          'credentials: zero.',
      },
      {
        id: 'reviews',
        title: 'Access reviews & offboarding',
        copy:
          'Every role and grant is re-certified quarterly and the review ' +
          'is written to the audit trail. Offboarding revokes all access ' +
          'within 15 minutes of HR trigger.',
      },
    ],
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    icon: ServerIcon,
    rows: [
      {
        id: 'isolation',
        title: 'Network isolation',
        copy:
          'Tenants are logically isolated end to end. The vault tier ' +
          'accepts traffic only from the edge tier over mTLS; nothing in ' +
          'production is reachable from the public internet directly.',
      },
      {
        id: 'vulns',
        title: 'Vulnerability management',
        copy:
          'Authenticated scans run weekly; criticals carry a 48-hour patch ' +
          'SLA (90-day median: 11 hours). An independent penetration test ' +
          'runs annually with a published summary.',
      },
      {
        id: 'backups',
        title: 'Backups & resilience',
        copy:
          'Continuous replication across three availability zones, 35-day ' +
          'point-in-time recovery, and quarterly restore drills averaging ' +
          'a 22-minute recovery.',
      },
    ],
  },
  {
    id: 'people',
    name: 'People',
    icon: UsersIcon,
    rows: [
      {
        id: 'screening',
        title: 'Background screening',
        copy:
          'Every employee is screened before start where legally ' +
          'permitted; privileged roles are re-screened every two years.',
      },
      {
        id: 'training',
        title: 'Security training',
        copy:
          'Security onboarding plus annual refreshers, with phishing ' +
          'simulations every six weeks. 2025 completion rate: 100% of 312 ' +
          'employees.',
      },
      {
        id: 'vendors',
        title: 'Vendor review',
        copy:
          'Every subprocessor passes a security review and signs a DPA ' +
          'before touching customer data; reviews are refreshed annually ' +
          'and tracked below.',
      },
    ],
  },
];

// ---- data-flow schematic ----

type FlowNodeId = 'client' | 'edge' | 'vault';

interface FlowNode {
  id: FlowNodeId;
  title: string;
  subtitle: string;
  detail: string;
  chips: readonly string[];
}

const FLOW_NODES: readonly FlowNode[] = [
  {
    id: 'client',
    title: 'Client',
    subtitle: 'SDKs · browser · CLI',
    detail:
      'Your applications sign every request with a scoped API key. Keys ' +
      'never grant more than one workspace, and browser sessions ride on ' +
      'short-lived tokens refreshed every 15 minutes.',
    chips: ['Scoped API keys', 'TLS 1.3', '15-min session tokens'],
  },
  {
    id: 'edge',
    title: 'Edge',
    subtitle: 'AuthN · rate limits · WAF',
    detail:
      'The edge tier terminates TLS, verifies identity, applies per-tenant ' +
      'rate limits, and strips anything malformed before it can reach ' +
      'storage. It holds no customer data at rest.',
    chips: ['WAF + anomaly rules', 'Per-tenant rate limits', 'Zero data at rest'],
  },
  {
    id: 'vault',
    title: 'Vault',
    subtitle: 'Isolated storage cells',
    detail:
      'Records land in per-tenant storage cells encrypted with AES-256-GCM ' +
      'under per-tenant data keys. The vault accepts connections only from ' +
      'the edge tier over mTLS — never from the internet.',
    chips: ['AES-256-GCM at rest', 'Per-tenant keys', 'mTLS-only ingress'],
  },
];

// ---- subprocessors ----

interface Subprocessor extends Record<string, unknown> {
  id: string;
  vendor: string;
  monogram: string;
  purpose: string;
  region: string;
  dpa: 'signed' | 'renewal';
}

const SUBPROCESSORS: readonly Subprocessor[] = [
  {
    id: 'helios',
    vendor: 'Helios Cloud',
    monogram: 'HC',
    purpose: 'Infrastructure hosting',
    region: 'EU (Frankfurt) · US (Virginia)',
    dpa: 'signed',
  },
  {
    id: 'stackwatch',
    vendor: 'Stackwatch',
    monogram: 'SW',
    purpose: 'Logging & monitoring',
    region: 'US (Oregon)',
    dpa: 'signed',
  },
  {
    id: 'relaypost',
    vendor: 'Relay Post',
    monogram: 'RP',
    purpose: 'Transactional email',
    region: 'EU (Dublin)',
    dpa: 'signed',
  },
  {
    id: 'brightpay',
    vendor: 'Brightpay',
    monogram: 'BP',
    purpose: 'Payment processing',
    region: 'US (San Francisco)',
    dpa: 'signed',
  },
  {
    id: 'answerdesk',
    vendor: 'Answerdesk',
    monogram: 'AD',
    purpose: 'Customer support tooling',
    region: 'EU (Amsterdam)',
    dpa: 'renewal',
  },
  {
    id: 'lexicon',
    vendor: 'Lexicon Search',
    monogram: 'LS',
    purpose: 'In-product search index',
    region: 'EU (Frankfurt)',
    dpa: 'signed',
  },
];

// ---- responsible disclosure ----

const SECURITY_TXT = [
  'Contact: mailto:security@vantagedata.io',
  'Encryption: https://vantagedata.io/pgp.txt',
  'Policy: https://vantagedata.io/security/disclosure',
  'Preferred-Languages: en, pt',
  'Expires: 2027-01-31T00:00:00Z',
].join('\n');

const PGP_FINGERPRINT = '7A31 9C4E 02BD 55F1 8E60  4D2A C9F3 1B77 D480 62E5';

const DISCLOSURE = {
  title: 'Responsible disclosure',
  copy:
    'Found something? Tell us first — we triage every report within 24 ' +
    'hours and pay $250–$12,000 for qualifying findings. Anything under ' +
    '*.vantagedata.io is in scope except the marketing site; no social ' +
    'engineering, no customer data exfiltration.',
};

// ---- security changelog (last 3 updates) ----

interface ChangelogEntry {
  id: string;
  date: string;
  tag: string;
  tagColor: 'blue' | 'orange' | 'green';
  copy: string;
  link?: string;
}

const CHANGELOG: readonly ChangelogEntry[] = [
  {
    id: 'byok',
    date: 'Jun 27, 2026',
    tag: 'Improved',
    tagColor: 'blue',
    copy: 'Customer-managed keys (BYOK) are now available in eu-central-1 for Scale plans.',
  },
  {
    id: 'incident',
    date: 'Jun 3, 2026',
    tag: 'Incident',
    tagColor: 'orange',
    copy: '41 minutes of elevated error rates on the ingest API. No data loss; root cause was a connection-pool regression.',
    link: 'Read the postmortem',
  },
  {
    id: 'soc2',
    date: 'May 12, 2026',
    tag: 'Compliance',
    tagColor: 'green',
    copy: 'SOC 2 Type II report covering Nov 2024 – Oct 2025 is available under NDA — zero exceptions.',
  },
];

const FOOTER_LINKS: readonly string[] = [
  'Status',
  'Privacy',
  'Terms',
  'DPA',
  'security.txt',
];

// ============= HELPERS =============

/**
 * Element-width hook — the inline demo stage is ~1045px wide inside a
 * 1440px window, so viewport media queries never fire there. The page
 * measures itself instead.
 */
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

/** prefers-reduced-motion gate: reveals render visible, counters final. */
function usePrefersReducedMotion(): boolean {
  const [prefersReduced, setPrefersReduced] = useState(false);
  useEffect(() => {
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) =>
      setPrefersReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return prefersReduced;
}

/** Fire-once IntersectionObserver reveal. Disabled → always revealed. */
function useRevealOnce(isDisabled: boolean): {
  ref: RefObject<HTMLDivElement | null>;
  isRevealed: boolean;
} {
  const ref = useRef<HTMLDivElement | null>(null);
  const [isRevealed, setIsRevealed] = useState(false);
  useEffect(() => {
    if (isDisabled || isRevealed) {
      return undefined;
    }
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setIsRevealed(true);
          observer.disconnect();
        }
      },
      {threshold: 0.12},
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [isDisabled, isRevealed]);
  return {ref, isRevealed: isDisabled ? true : isRevealed};
}

/** Rise+fade 12px scroll reveal wrapper; renders visible when motion is off. */
function Reveal({
  isMotionOff,
  delay = 0,
  children,
}: {
  isMotionOff: boolean;
  delay?: number;
  children: React.ReactNode;
}) {
  const {ref, isRevealed} = useRevealOnce(isMotionOff);
  return (
    <div
      ref={ref}
      style={{
        opacity: isRevealed ? 1 : 0,
        transform: isRevealed ? 'none' : 'translateY(12px)',
        transition: isMotionOff
          ? 'none'
          : `opacity 0.5s ease ${delay}ms, transform 0.5s ease ${delay}ms`,
      }}>
      {children}
    </div>
  );
}

/** rAF count-up toward a fixed target; motion-off renders the final value. */
function useCountUp(
  target: number,
  isStarted: boolean,
  isMotionOff: boolean,
  durationMs = 1100,
): number {
  const [value, setValue] = useState(0);
  useEffect(() => {
    if (!isStarted) {
      return undefined;
    }
    if (isMotionOff) {
      setValue(target);
      return undefined;
    }
    let frame = 0;
    let startedAt: number | null = null;
    const tick = (now: number) => {
      if (startedAt === null) {
        startedAt = now;
      }
      const progress = Math.min(1, (now - startedAt) / durationMs);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(target * eased);
      if (progress < 1) {
        frame = requestAnimationFrame(tick);
      }
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, isStarted, isMotionOff, durationMs]);
  return value;
}

function validateEmail(raw: string): string | null {
  const trimmed = raw.trim();
  if (trimmed.length === 0) {
    return 'Enter your work email to receive the document.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) {
    return "That doesn't look like an email address.";
  }
  return null;
}

// ============= SMALL PIECES =============

/** Vantage brand mark: soft accent shield tile + wordmark. */
function BrandMark() {
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.brandTile} aria-hidden="true">
        <Icon icon={ShieldCheckIcon} size="sm" color="inherit" />
      </div>
      <VStack gap={0}>
        <Text type="label">{BRAND.name}</Text>
        <Text type="supporting" color="secondary">
          {BRAND.suffix}
        </Text>
      </VStack>
    </HStack>
  );
}

/** Schematic compliance seal: dashed audit ring + monogram disc. */
function Seal({short}: {short: string}) {
  return (
    <svg
      width={60}
      height={60}
      viewBox="0 0 60 60"
      role="img"
      aria-label={`${short} schematic seal`}>
      <circle
        cx={30}
        cy={30}
        r={27}
        fill="none"
        stroke={ACCENT}
        strokeWidth={1.5}
        strokeDasharray="3 4"
      />
      <circle
        cx={30}
        cy={30}
        r={20}
        fill={ACCENT_SOFT}
        stroke={ACCENT}
        strokeWidth={1}
      />
      <text
        x={30}
        y={33.5}
        textAnchor="middle"
        fontSize={short.length > 4 ? 8.5 : 10}
        fontWeight={700}
        letterSpacing="0.06em"
        fill={ACCENT}>
        {short}
      </text>
    </svg>
  );
}

/** Section header: uppercase accent eyebrow + title + supporting copy. */
function SectionHead({
  eyebrow,
  title,
  copy,
  isCompact,
}: {
  eyebrow: string;
  title: string;
  copy: string;
  isCompact: boolean;
}) {
  return (
    <div style={styles.sectionHead}>
      <span style={styles.eyebrow}>{eyebrow}</span>
      <h2
        style={{
          ...styles.sectionTitle,
          ...(isCompact ? styles.sectionTitleCompact : null),
        }}>
        {title}
      </h2>
      <Text type="supporting" color="secondary">
        {copy}
      </Text>
    </div>
  );
}

/** Counting stat used in the hero snapshot card. */
function SnapshotStat({
  target,
  suffix,
  label,
  isStarted,
  isMotionOff,
}: {
  target: number;
  suffix: string;
  label: string;
  isStarted: boolean;
  isMotionOff: boolean;
}) {
  const value = useCountUp(target, isStarted, isMotionOff);
  return (
    <VStack gap={0}>
      <span style={styles.statValue}>
        {Math.round(value).toLocaleString('en-US')}
        {suffix}
      </span>
      <Text type="supporting" color="secondary">
        {label}
      </Text>
    </VStack>
  );
}

// ============= DATA-FLOW SCHEMATIC =============

const NODE_W = 190;
const NODE_H = 118;

/** Small glyphs drawn per node (monitor / hex shield / lock). */
function nodeGlyphPath(id: FlowNodeId, x: number, y: number) {
  const cx = x + 26;
  const cy = y + 30;
  if (id === 'client') {
    return (
      <g stroke={ACCENT} strokeWidth={1.6} fill="none" strokeLinecap="round">
        <rect x={cx - 11} y={cy - 9} width={22} height={14} rx={2} />
        <line x1={cx - 5} y1={cy + 9} x2={cx + 5} y2={cy + 9} />
        <line x1={cx} y1={cy + 5} x2={cx} y2={cy + 9} />
      </g>
    );
  }
  if (id === 'edge') {
    return (
      <g stroke={ACCENT} strokeWidth={1.6} fill="none" strokeLinejoin="round">
        <path
          d={`M ${cx} ${cy - 11} L ${cx + 10} ${cy - 5} L ${cx + 10} ${cy + 6} L ${cx} ${cy + 12} L ${cx - 10} ${cy + 6} L ${cx - 10} ${cy - 5} Z`}
        />
        <path d={`M ${cx - 4} ${cy} l 3 3 l 6 -7`} strokeLinecap="round" />
      </g>
    );
  }
  return (
    <g stroke={ACCENT} strokeWidth={1.6} fill="none" strokeLinecap="round">
      <rect x={cx - 9} y={cy - 3} width={18} height={14} rx={2.5} />
      <path d={`M ${cx - 5} ${cy - 3} v -4 a 5 5 0 0 1 10 0 v 4`} />
    </g>
  );
}

/**
 * Client → edge → vault schematic. Horizontal at wide widths, vertical
 * when stacked. Nodes are focusable buttons: hover/focus/click selects a
 * node and the detail panel below explains it (works on touch too).
 */
function FlowDiagram({
  isVertical,
  activeId,
  onSelect,
}: {
  isVertical: boolean;
  activeId: FlowNodeId;
  onSelect: (id: FlowNodeId) => void;
}) {
  const positions: Record<FlowNodeId, {x: number; y: number}> = isVertical
    ? {
        client: {x: 60, y: 12},
        edge: {x: 60, y: 206},
        vault: {x: 60, y: 400},
      }
    : {
        client: {x: 12, y: 36},
        edge: {x: 295, y: 36},
        vault: {x: 578, y: 36},
      };
  const viewBox = isVertical ? '0 0 320 530' : '0 0 780 190';

  const arrows = isVertical ? (
    <g
      stroke="var(--color-text-secondary)"
      strokeWidth={1.4}
      fill="none"
      aria-hidden="true">
      <line x1={160} y1={132} x2={160} y2={198} markerEnd="url(#flow-arrow)" />
      <line x1={160} y1={326} x2={160} y2={392} markerEnd="url(#flow-arrow)" />
      <text
        x={172}
        y={168}
        fontSize={10}
        fill="var(--color-text-secondary)"
        stroke="none">
        TLS 1.3
      </text>
      <text
        x={172}
        y={356}
        fontSize={10}
        fill="var(--color-text-secondary)"
        stroke="none">
        mTLS · tenant-scoped
      </text>
    </g>
  ) : (
    <g
      stroke="var(--color-text-secondary)"
      strokeWidth={1.4}
      fill="none"
      aria-hidden="true">
      <line x1={204} y1={95} x2={289} y2={95} markerEnd="url(#flow-arrow)" />
      <line x1={487} y1={95} x2={572} y2={95} markerEnd="url(#flow-arrow)" />
      <text
        x={246}
        y={84}
        fontSize={10}
        textAnchor="middle"
        fill="var(--color-text-secondary)"
        stroke="none">
        TLS 1.3
      </text>
      <text
        x={529}
        y={78}
        fontSize={10}
        textAnchor="middle"
        fill="var(--color-text-secondary)"
        stroke="none">
        mTLS
      </text>
      <text
        x={529}
        y={90}
        fontSize={10}
        textAnchor="middle"
        fill="var(--color-text-secondary)"
        stroke="none">
        tenant-scoped
      </text>
    </g>
  );

  return (
    <svg
      viewBox={viewBox}
      width="100%"
      role="group"
      aria-label="Data flow: client to edge to vault"
      style={{display: 'block', maxWidth: isVertical ? 340 : 780}}>
      <defs>
        <marker
          id="flow-arrow"
          viewBox="0 0 8 8"
          refX={7}
          refY={4}
          markerWidth={7}
          markerHeight={7}
          orient="auto-start-reverse">
          <path d="M 0 0 L 8 4 L 0 8 z" fill="var(--color-text-secondary)" />
        </marker>
      </defs>
      {arrows}
      {FLOW_NODES.map(node => {
        const {x, y} = positions[node.id];
        const isActive = node.id === activeId;
        return (
          <g
            key={node.id}
            tabIndex={0}
            role="button"
            aria-pressed={isActive}
            aria-label={`${node.title}: ${node.subtitle}`}
            style={{cursor: 'pointer', outline: 'none'}}
            onMouseEnter={() => onSelect(node.id)}
            onFocus={() => onSelect(node.id)}
            onClick={() => onSelect(node.id)}
            onKeyDown={event => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect(node.id);
              }
            }}>
            <rect
              x={x}
              y={y}
              width={NODE_W}
              height={NODE_H}
              rx={14}
              fill={isActive ? ACCENT_SOFT : 'var(--color-background-muted)'}
              stroke={isActive ? ACCENT : 'var(--color-border)'}
              strokeWidth={isActive ? 2 : 1}
            />
            {nodeGlyphPath(node.id, x, y)}
            <text
              x={x + 52}
              y={y + 30}
              fontSize={14}
              fontWeight={700}
              fill="var(--color-text-primary)">
              {node.title}
            </text>
            <text
              x={x + 52}
              y={y + 46}
              fontSize={10.5}
              fill="var(--color-text-secondary)">
              {node.subtitle}
            </text>
            <text
              x={x + 16}
              y={y + 78}
              fontSize={9.5}
              fontFamily="var(--font-family-mono, ui-monospace, monospace)"
              fill="var(--color-text-secondary)">
              {node.chips[0]}
            </text>
            <text
              x={x + 16}
              y={y + 94}
              fontSize={9.5}
              fontFamily="var(--font-family-mono, ui-monospace, monospace)"
              fill="var(--color-text-secondary)">
              {node.chips[2]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

// ============= PAGE =============

export default function SecurityTrustCenterTemplate() {
  // ---- responsive: measure the page itself (demo-stage quirk) ----
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isMid = wrapWidth > 0 && wrapWidth <= 980;
  const isNavCompact = wrapWidth > 0 && wrapWidth <= 880;
  const isStacked = wrapWidth > 0 && wrapWidth <= 760;
  const isTableCards = wrapWidth > 0 && wrapWidth <= 640;
  const isPhone = wrapWidth > 0 && wrapWidth <= 540;

  const isMotionOff = usePrefersReducedMotion();

  // ---- scroll plumbing ----
  const pageRef = useRef<HTMLDivElement | null>(null);
  const navRef = useRef<HTMLElement | null>(null);
  const sectionRefs = useRef<Record<string, HTMLElement | null>>({});
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuTriggerRef = useRef<HTMLButtonElement | null>(null);

  // ---- hero: snapshot reveal starts the tick stagger + count-ups ----
  const {ref: snapshotRef, isRevealed: isSnapshotRevealed} =
    useRevealOnce(isMotionOff);
  const uptimeValue = useCountUp(
    HERO.uptimePercent,
    isSnapshotRevealed,
    isMotionOff,
    1300,
  );

  // ---- compliance request-access forms (one open at a time) ----
  const [openRequestId, setOpenRequestId] = useState<string | null>(null);
  const [requestEmail, setRequestEmail] = useState('');
  const [requestError, setRequestError] = useState<string | null>(null);
  const [sentRequests, setSentRequests] = useState<Record<string, string>>({});

  // ---- architecture ----
  const [activeFlowNode, setActiveFlowNode] = useState<FlowNodeId>('edge');

  // ---- disclosure: PGP copy feedback ----
  const [isFingerprintCopied, setIsFingerprintCopied] = useState(false);
  useEffect(() => {
    if (!isFingerprintCopied) {
      return undefined;
    }
    const timer = setTimeout(() => setIsFingerprintCopied(false), 2000);
    return () => clearTimeout(timer);
  }, [isFingerprintCopied]);

  // ---- toast (replaced/keyed so repeat clicks re-announce) ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  // Compact menu dismisses on Escape (refocusing the trigger) and on any
  // pointerdown outside the sticky navbar.
  useEffect(() => {
    if (!isMenuOpen) {
      return undefined;
    }
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
        menuTriggerRef.current?.focus();
      }
    };
    const onPointerDown = (event: PointerEvent) => {
      const nav = navRef.current;
      if (
        nav !== null &&
        event.target instanceof Node &&
        !nav.contains(event.target)
      ) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isMenuOpen]);

  const registerSection = (id: SectionId) => (node: HTMLElement | null) => {
    sectionRefs.current[id] = node;
  };

  const jumpToSection = (id: SectionId) => {
    setIsMenuOpen(false);
    const container = pageRef.current;
    const section = sectionRefs.current[id];
    if (container == null || section == null) {
      return;
    }
    container.scrollTo({
      top: section.offsetTop - NAV_ALLOWANCE,
      behavior: isMotionOff ? 'auto' : 'smooth',
    });
  };

  const openRequestForm = (frameworkId: string) => {
    setOpenRequestId(previous =>
      previous === frameworkId ? null : frameworkId,
    );
    setRequestEmail('');
    setRequestError(null);
  };

  const submitRequest = (framework: Framework) => {
    const error = validateEmail(requestEmail);
    if (error !== null) {
      setRequestError(error);
      return;
    }
    const trimmed = requestEmail.trim();
    setSentRequests(previous => ({...previous, [framework.id]: trimmed}));
    setOpenRequestId(null);
    setRequestEmail('');
    setRequestError(null);
    fireToast(`${framework.artifact} — request sent for ${trimmed}.`);
  };

  const copyFingerprint = () => {
    void navigator.clipboard?.writeText(PGP_FINGERPRINT).catch(() => {});
    setIsFingerprintCopied(true);
  };

  const heroCtaToCompliance = () => {
    setOpenRequestId('soc2');
    setRequestEmail('');
    setRequestError(null);
    jumpToSection('compliance');
  };

  const uptimeSummary =
    '90-day uptime history: 88 days operational, 1 scheduled maintenance window (May 14), 1 degraded day (Jun 3).';

  // ============= NAVBAR =============

  const navLinks = NAV_ANCHORS.map(anchor => (
    <button
      key={anchor.id}
      type="button"
      style={styles.navLink}
      onClick={() => jumpToSection(anchor.id)}>
      {anchor.label}
    </button>
  ));

  const navbar = (
    <nav ref={navRef} style={styles.navBar} aria-label="Trust center">
      <div style={styles.navInner}>
        <BrandMark />
        <StackItem size="fill">
          <span />
        </StackItem>
        {!isNavCompact && (
          <>
            {navLinks}
            <Button
              label="Request reports"
              variant="primary"
              size="sm"
              icon={<Icon icon={FileTextIcon} size="sm" color="inherit" />}
              onClick={heroCtaToCompliance}
            />
          </>
        )}
        {isNavCompact && (
          <button
            ref={menuTriggerRef}
            type="button"
            aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={isMenuOpen}
            style={styles.iconButton}
            onClick={() => setIsMenuOpen(open => !open)}>
            <Icon icon={isMenuOpen ? XIcon : MenuIcon} size="sm" color="inherit" />
          </button>
        )}
        {isNavCompact && isMenuOpen && (
          <div style={styles.menuPanel} role="menu" aria-label="Sections">
            {NAV_ANCHORS.map(anchor => (
              <button
                key={anchor.id}
                type="button"
                role="menuitem"
                style={styles.menuLink}
                onClick={() => jumpToSection(anchor.id)}>
                <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
                {anchor.label}
              </button>
            ))}
            <Divider />
            <Button
              label="Request reports"
              variant="primary"
              size="sm"
              icon={<Icon icon={FileTextIcon} size="sm" color="inherit" />}
              onClick={heroCtaToCompliance}
            />
          </div>
        )}
      </div>
    </nav>
  );

  // ============= HERO =============

  const statusRow = (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <span style={styles.statusChip}>
        <StatusDot
          variant="success"
          label="All systems operational"
          isPulsing={!isMotionOff}
        />
        All systems operational
      </span>
      <span style={{...styles.statusChip, fontVariantNumeric: 'tabular-nums'}}>
        <Icon icon={ActivityIcon} size="xsm" color="inherit" />
        {uptimeValue.toFixed(2)}% uptime (90d)
      </span>
      <Token
        label={BRAND.statusHost}
        size="md"
        icon={<Icon icon={ExternalLinkIcon} size="xsm" color="inherit" />}
        onClick={() => fireToast(`Status page — ${BRAND.statusHost} opened.`)}
      />
    </HStack>
  );

  const tickStrip = (
    <VStack gap={2}>
      <div
        style={styles.tickStrip}
        role="img"
        aria-label={uptimeSummary}>
        {UPTIME_DAYS.map((day, index) => (
          <span
            key={day.iso}
            title={`${day.iso} — ${day.note}`}
            style={{
              ...styles.tick,
              backgroundColor: TICK_COLOR[day.status],
              opacity: day.status === 'operational' ? 0.75 : 1,
              transform: isSnapshotRevealed ? 'scaleY(1)' : 'scaleY(0.06)',
              transition: isMotionOff
                ? 'none'
                : `transform 0.4s ease ${index * 9}ms`,
            }}
          />
        ))}
      </div>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={1} vAlign="center">
          <span
            style={{...styles.legendDot, backgroundColor: SUCCESS}}
            aria-hidden="true"
          />
          <Text type="supporting" color="secondary">
            Operational
          </Text>
        </HStack>
        <HStack gap={1} vAlign="center">
          <span
            style={{...styles.legendDot, backgroundColor: WARNING}}
            aria-hidden="true"
          />
          <Text type="supporting" color="secondary">
            Maintenance · May 14
          </Text>
        </HStack>
        <HStack gap={1} vAlign="center">
          <span
            style={{...styles.legendDot, backgroundColor: ERROR}}
            aria-hidden="true"
          />
          <Text type="supporting" color="secondary">
            Degraded 41 min · Jun 3
          </Text>
        </HStack>
      </HStack>
    </VStack>
  );

  const hero = (
    <section>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
        }}>
        <div
          style={{
            ...styles.heroRow,
            ...(isStacked ? styles.heroRowStacked : null),
          }}>
          <div style={styles.heroText}>
            <span style={styles.eyebrow}>{HERO.eyebrow}</span>
            <h1
              style={{
                ...styles.heroHeadline,
                ...(isPhone ? styles.heroHeadlineCompact : null),
              }}>
              {HERO.headline}
            </h1>
            <p style={styles.heroSubcopy}>{HERO.subcopy}</p>
            {statusRow}
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Button
                label="Request reports"
                variant="primary"
                icon={<Icon icon={FileTextIcon} size="sm" color="inherit" />}
                onClick={heroCtaToCompliance}
              />
              <Button
                label="Contact security"
                variant="secondary"
                icon={<Icon icon={BugIcon} size="sm" color="inherit" />}
                onClick={() => jumpToSection('disclosure')}
              />
            </HStack>
          </div>
          <div ref={snapshotRef} style={styles.snapshotCard}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label">Last 90 days</Text>
              </StackItem>
              <Text type="supporting" color="secondary">
                Apr 14 – Jul 12, 2026
              </Text>
            </HStack>
            {tickStrip}
            <Divider />
            <HStack gap={4} vAlign="start" wrap="wrap">
              {SNAPSHOT_STATS.map(stat => (
                <SnapshotStat
                  key={stat.id}
                  target={stat.target}
                  suffix={stat.suffix}
                  label={stat.label}
                  isStarted={isSnapshotRevealed}
                  isMotionOff={isMotionOff}
                />
              ))}
            </HStack>
          </div>
        </div>
      </div>
    </section>
  );

  // ============= COMPLIANCE =============

  const complianceColumns = isPhone ? 1 : isMid ? 2 : 4;

  const compliance = (
    <section ref={registerSection('compliance')} style={styles.bandTinted}>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
        }}>
        <Reveal isMotionOff={isMotionOff}>
          <SectionHead
            eyebrow="Compliance"
            title="Audited by people we can't influence"
            copy="Reports and certificates are shared under NDA. Request one and a secure link arrives from our compliance desk within one business day."
            isCompact={isPhone}
          />
        </Reveal>
        <div
          style={{
            ...styles.complianceGrid,
            gridTemplateColumns: `repeat(${complianceColumns}, minmax(0, 1fr))`,
          }}>
          {FRAMEWORKS.map((framework, index) => {
            const sentEmail = sentRequests[framework.id];
            const isFormOpen = openRequestId === framework.id;
            return (
              <Reveal
                key={framework.id}
                isMotionOff={isMotionOff}
                delay={index * 90}>
                <div style={styles.complianceCard}>
                  <HStack gap={3} vAlign="center">
                    <Seal short={framework.seal} />
                    <VStack gap={1}>
                      <Text type="label">{framework.name}</Text>
                      <Token
                        label={framework.chipLabel}
                        size="sm"
                        color="green"
                        icon={
                          <Icon icon={FileTextIcon} size="xsm" color="inherit" />
                        }
                        onClick={() => openRequestForm(framework.id)}
                      />
                    </VStack>
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {framework.blurb}
                  </Text>
                  {sentEmail != null ? (
                    <HStack gap={2} vAlign="center">
                      <div style={styles.successDisc} aria-hidden="true">
                        <Icon icon={MailCheckIcon} size="sm" color="inherit" />
                      </div>
                      <StackItem size="fill">
                        <Text type="supporting" color="secondary">
                          Request sent — secure link to {sentEmail} within 1
                          business day.
                        </Text>
                      </StackItem>
                    </HStack>
                  ) : isFormOpen ? (
                    <VStack gap={1}>
                      <div
                        style={{
                          ...styles.requestForm,
                          ...(isPhone ? styles.requestFormStacked : null),
                        }}>
                        <div style={styles.requestInput}>
                          <TextInput
                            label={`Email for the ${framework.artifact}`}
                            isLabelHidden
                            placeholder="you@company.com"
                            value={requestEmail}
                            onChange={value => {
                              setRequestEmail(value);
                              setRequestError(null);
                            }}
                          />
                        </div>
                        <Button
                          label="Send request"
                          variant="primary"
                          icon={
                            <Icon icon={SendIcon} size="sm" color="inherit" />
                          }
                          onClick={() => submitRequest(framework)}
                        />
                      </div>
                      {requestError !== null && (
                        <p style={styles.errorText}>{requestError}</p>
                      )}
                    </VStack>
                  ) : (
                    <div>
                      <Button
                        label="Request access"
                        variant="ghost"
                        size="sm"
                        icon={
                          <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
                        }
                        onClick={() => openRequestForm(framework.id)}
                      />
                    </div>
                  )}
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );

  // ============= PRACTICES =============

  const practices = (
    <section ref={registerSection('practices')}>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
        }}>
        <Reveal isMotionOff={isMotionOff}>
          <SectionHead
            eyebrow="Security practices"
            title="Twelve controls, in plain language"
            copy="No 'bank-grade security' hand-waving. These are the controls we actually run, with the numbers our auditors verify."
            isCompact={isPhone}
          />
        </Reveal>
        <div
          style={{
            ...styles.practicesGrid,
            gridTemplateColumns: isMid
              ? 'minmax(0, 1fr)'
              : 'repeat(2, minmax(0, 1fr))',
          }}>
          {PRACTICE_CATEGORIES.map((category, categoryIndex) => (
            <Reveal
              key={category.id}
              isMotionOff={isMotionOff}
              delay={categoryIndex * 70}>
              <div style={styles.categoryBlock}>
                <HStack gap={2} vAlign="center">
                  <div style={styles.categoryGlyph} aria-hidden="true">
                    <Icon icon={category.icon} size="sm" color="inherit" />
                  </div>
                  <StackItem size="fill">
                    <Text type="label">{category.name}</Text>
                  </StackItem>
                  <Text type="supporting" color="secondary">
                    {category.rows.length} controls
                  </Text>
                </HStack>
                <VStack gap={2}>
                  {category.rows.map((practice, rowIndex) => (
                    <div key={practice.id} style={styles.practiceCard}>
                      <Collapsible
                        trigger={
                          <Text size="sm" weight="semibold">
                            {practice.title}
                          </Text>
                        }
                        defaultIsOpen={categoryIndex === 0 && rowIndex === 0}>
                        <Text type="supporting" color="secondary">
                          {practice.copy}
                        </Text>
                      </Collapsible>
                    </div>
                  ))}
                </VStack>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );

  // ============= ARCHITECTURE =============

  const activeNode =
    FLOW_NODES.find(node => node.id === activeFlowNode) ?? FLOW_NODES[1];

  const architecture = (
    <section ref={registerSection('architecture')} style={styles.bandTinted}>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
        }}>
        <Reveal isMotionOff={isMotionOff}>
          <SectionHead
            eyebrow="Architecture"
            title="Where your data actually goes"
            copy="Three tiers, two encrypted hops, zero public paths to storage. Hover or tap a node for the details."
            isCompact={isPhone}
          />
        </Reveal>
        <Reveal isMotionOff={isMotionOff} delay={120}>
          <div style={styles.flowCard}>
            <FlowDiagram
              isVertical={isStacked}
              activeId={activeFlowNode}
              onSelect={setActiveFlowNode}
            />
            <div style={styles.flowDetail} aria-live="polite">
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Text type="label">{activeNode.title}</Text>
                <Text type="supporting" color="secondary">
                  {activeNode.subtitle}
                </Text>
              </HStack>
              <Text type="supporting" color="secondary">
                {activeNode.detail}
              </Text>
              <HStack gap={1} vAlign="center" wrap="wrap">
                {activeNode.chips.map(chip => (
                  <Token key={chip} label={chip} size="sm" color="teal" />
                ))}
              </HStack>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  );

  // ============= SUBPROCESSORS =============

  const dpaChip = (row: Subprocessor) =>
    row.dpa === 'signed' ? (
      <Token label="DPA signed" size="sm" color="green" />
    ) : (
      <Token label="Renewal Aug 2026" size="sm" color="yellow" />
    );

  const subprocessorColumns: TableColumn<Subprocessor>[] = [
    {
      key: 'vendor',
      header: 'Vendor',
      width: proportional(1.3, {minWidth: 170}),
      renderCell: row => (
        <HStack gap={2} vAlign="center">
          <span style={styles.vendorTile} aria-hidden="true">
            {row.monogram}
          </span>
          <Text size="sm" weight="semibold">
            {row.vendor}
          </Text>
        </HStack>
      ),
    },
    {
      key: 'purpose',
      header: 'Purpose',
      width: proportional(1.6, {minWidth: 180}),
      renderCell: row => (
        <Text type="supporting" color="secondary">
          {row.purpose}
        </Text>
      ),
    },
    {
      key: 'region',
      header: 'Region',
      width: proportional(1.4, {minWidth: 170}),
      renderCell: row => (
        <Text type="supporting" color="secondary">
          {row.region}
        </Text>
      ),
    },
    {
      key: 'dpa',
      header: 'DPA',
      width: pixel(150),
      renderCell: row => dpaChip(row),
    },
  ];

  const subprocessors = (
    <section ref={registerSection('subprocessors')}>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
        }}>
        <Reveal isMotionOff={isMotionOff}>
          <SectionHead
            eyebrow="Subprocessors"
            title="Everyone who touches your data"
            copy="Six vendors, each behind a signed DPA and an annual security review. We announce additions 30 days before they process anything."
            isCompact={isPhone}
          />
        </Reveal>
        <Reveal isMotionOff={isMotionOff} delay={120}>
          {isTableCards ? (
            <VStack gap={2}>
              {SUBPROCESSORS.map(row => (
                <div key={row.id} style={styles.vendorCard}>
                  <HStack gap={2} vAlign="center">
                    <span style={styles.vendorTile} aria-hidden="true">
                      {row.monogram}
                    </span>
                    <StackItem size="fill">
                      <Text size="sm" weight="semibold">
                        {row.vendor}
                      </Text>
                    </StackItem>
                    {dpaChip(row)}
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {row.purpose} · {row.region}
                  </Text>
                </div>
              ))}
            </VStack>
          ) : (
            <div style={styles.tableFrame}>
              <Table<Subprocessor>
                data={[...SUBPROCESSORS]}
                columns={subprocessorColumns}
                idKey="id"
                density="balanced"
                dividers="rows"
                hasHover
              />
            </div>
          )}
        </Reveal>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <Text type="supporting" color="secondary">
            Last updated Jul 1, 2026
          </Text>
          <Token
            label="Subscribe to subprocessor changes"
            size="sm"
            icon={<Icon icon={MailCheckIcon} size="xsm" color="inherit" />}
            onClick={() =>
              fireToast('Subprocessor list — change notifications subscribed.')
            }
          />
        </HStack>
      </div>
    </section>
  );

  // ============= DISCLOSURE + CHANGELOG =============

  const disclosure = (
    <section ref={registerSection('disclosure')} style={styles.bandTinted}>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
        }}>
        <Reveal isMotionOff={isMotionOff}>
          <SectionHead
            eyebrow="Disclosure & updates"
            title="Tell us before you tell anyone"
            copy="Our disclosure program pays researchers, and this strip logs every security-relevant change we ship."
            isCompact={isPhone}
          />
        </Reveal>
        <div
          style={{
            ...styles.duoRow,
            ...(isStacked ? styles.duoRowStacked : null),
          }}>
          <Reveal isMotionOff={isMotionOff} delay={80}>
            <div style={styles.disclosureCard}>
              <HStack gap={2} vAlign="center">
                <div style={styles.categoryGlyph} aria-hidden="true">
                  <Icon icon={BugIcon} size="sm" color="inherit" />
                </div>
                <Text type="label">{DISCLOSURE.title}</Text>
              </HStack>
              <Text type="supporting" color="secondary">
                {DISCLOSURE.copy}
              </Text>
              <HStack gap={1} vAlign="center" wrap="wrap">
                <Token label="24 h triage" size="sm" color="teal" />
                <Token label="$250–$12,000 bounty" size="sm" color="teal" />
                <Token label="Safe harbor" size="sm" color="teal" />
              </HStack>
              <CodeBlock
                code={SECURITY_TXT}
                language="text"
                title="/.well-known/security.txt"
                width="100%"
                size="sm"
                hasCopyButton
                onCopy={() => fireToast('security.txt copied to clipboard.')}
              />
              <div style={styles.fingerprintRow}>
                <Icon icon={KeyRoundIcon} size="xsm" color="secondary" />
                <StackItem size="fill">
                  <span style={styles.mono}>PGP {PGP_FINGERPRINT}</span>
                </StackItem>
                <button
                  type="button"
                  aria-label={
                    isFingerprintCopied
                      ? 'PGP fingerprint copied'
                      : 'Copy PGP fingerprint'
                  }
                  style={{...styles.iconButton, width: 32, height: 32}}
                  onClick={copyFingerprint}>
                  <Icon
                    icon={isFingerprintCopied ? CheckIcon : CopyIcon}
                    size="xsm"
                    color="inherit"
                  />
                </button>
              </div>
              {isFingerprintCopied && (
                <Text type="supporting" color="secondary">
                  Fingerprint copied.
                </Text>
              )}
            </div>
          </Reveal>
          <Reveal isMotionOff={isMotionOff} delay={160}>
            <div style={styles.changelogCol}>
              <Text type="label">Latest security updates</Text>
              {CHANGELOG.map(entry => (
                <div key={entry.id} style={styles.changelogEntry}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Token label={entry.tag} size="sm" color={entry.tagColor} />
                    <Text type="supporting" color="secondary">
                      {entry.date}
                    </Text>
                  </HStack>
                  <Text type="supporting" color="secondary">
                    {entry.copy}
                  </Text>
                  {entry.link != null && (
                    <div>
                      <Button
                        label={entry.link}
                        variant="ghost"
                        size="sm"
                        icon={
                          <Icon
                            icon={ExternalLinkIcon}
                            size="sm"
                            color="inherit"
                          />
                        }
                        onClick={() =>
                          fireToast('Postmortem — Jun 3 ingest incident opened.')
                        }
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );

  // ============= FOOTER =============

  const footer = (
    <footer style={styles.footer}>
      <div
        style={{
          ...styles.column,
          ...(isPhone ? styles.columnCompact : null),
          paddingBlock: 'var(--spacing-6)',
          gap: 'var(--spacing-4)',
        }}>
        <HStack gap={4} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <BrandMark />
          </StackItem>
          {FOOTER_LINKS.map(label => (
            <button
              key={label}
              type="button"
              style={styles.footerLink}
              onClick={() => fireToast(`Footer — ${label} opened.`)}>
              {label}
            </button>
          ))}
        </HStack>
        <Divider />
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text type="supporting" color="secondary">
              © 2026 Vantage Data, Inc. · security@vantagedata.io
            </Text>
          </StackItem>
          <Text type="supporting" color="secondary">
            Trust Center last reviewed Jul 1, 2026
          </Text>
        </HStack>
      </div>
    </footer>
  );

  // ============= RENDER =============

  return (
    <Layout height="fill">
      <LayoutContent padding={0}>
        <div ref={wrapRef} style={{height: '100%'}}>
          <div ref={pageRef} style={styles.page}>
            {navbar}
            {hero}
            {compliance}
            {practices}
            {architecture}
            {subprocessors}
            {disclosure}
            {footer}
          </div>
          {toast !== null && (
            <div style={styles.toastWrap}>
              <Toast
                key={toast.key}
                type="info"
                isAutoHide
                autoHideDuration={5000}
                onDismiss={() => setToast(null)}
                body={<Text weight="semibold">{toast.message}</Text>}
              />
            </div>
          )}
        </div>
      </LayoutContent>
    </Layout>
  );
}
