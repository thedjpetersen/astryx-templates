// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Kestrel Labs Atlas-program roster
 *   (12 people across San Francisco, Lisbon, and US-remote), fixed working
 *   hour bands expressed in PT decimal hours, fixed busy blocks for
 *   Wed Jul 15, 2026, and a frozen "now" anchor of 10:30 AM PT. Local times
 *   are derived arithmetically from fixed timezone offsets — no clocks, no
 *   Date.now(), no randomness, no network media.
 * @output Team Directory & Working Hours — a people directory for the Atlas
 *   program at Kestrel Labs: a timezone-overlap strip stacking the SF /
 *   Lisbon / Remote working-hour bands on one shared 24h PT axis with the
 *   highlighted 3-hour golden window (9:00 AM–12:00 PM PT); an out-today
 *   strip (Dana Whitfield, PTO, time-off-ledger citation and coverage chip);
 *   a filter bar (team Selector, office chips, skill chips, search); a
 *   person-card grid (avatar, role, local time with day/night glyph,
 *   working-hours bar on the same 24h axis, status emoji, skill tokens,
 *   compare pin); and a pinned compare tray for two selected people showing
 *   shared hours and the next mutual free slot.
 * @position Page template; emitted by `astryx template team-directory-timezones`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (title, fixed now-chip, search) | content (overlap strip,
 *   out-today strip, filter bar, card grid — one scroll column) | footer
 *   compare tray (rendered only while at least one person is pinned).
 * Container policy: app-shell page — the overlap strip, out-today strip, and
 *   compare tray are styled bordered divs (frame rows), not Cards; the
 *   directory tiles are styled bordered divs in a CSS grid (a card GRID is
 *   the directory archetype, but the tiles are hand-rolled so their hour
 *   bars, chips, and pin affordances stay on the shared geometry).
 * Color policy: token-pure chrome; ONE accent (interactive/pinned states).
 *   Literals are limited to (a) the data-viz categorical fallback pairs for
 *   the office bands (the demo does not inject --color-data-categorical-*),
 *   (b) an amber light-dark() pair for the golden-overlap window, and
 *   (c) a red light-dark() pair for the frozen now line.
 *
 * Responsive contract:
 * - > 1180px: full frame; the card grid auto-fills 3–4 columns
 *   (minmax(300px, 1fr)).
 * - <= 860px: the overlap strip drops its per-lane local-hours sublabels and
 *   halves the axis tick density (every 6h); the lane label column narrows;
 *   header and filter rows wrap instead of clipping.
 * - <= 640px: the card grid is single column; the compare tray stacks its
 *   two person rows vertically. All rows wrap via flexWrap — nothing clips.
 * - The single content column scrolls; the compare tray sits in the Layout
 *   footer slot (its own layout space, not an overlay), so the last card row
 *   always scrolls fully clear of it without extra clearance.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  CalendarClockIcon,
  Clock3Icon,
  MapPinIcon,
  MoonIcon,
  PinIcon,
  PinOffIcon,
  SearchIcon,
  SunIcon,
  SunriseIcon,
  SunsetIcon,
  UsersIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Selector} from '@astryxdesign/core/Selector';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  headerBar: {padding: 'var(--spacing-3) var(--spacing-4)'},
  nowChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '2px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // No footer clearance needed: the compare tray renders in the Layout
  // footer SLOT (it takes its own layout space, never overlaying the scroll
  // column), so the last card row always scrolls fully into view.
  contentScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  sectionStack: {maxWidth: 1360, marginInline: 'auto', width: '100%'},
  // Overlap strip -----------------------------------------------------------
  stripFrame: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-3) var(--spacing-4)',
  },
  laneGrid: {
    display: 'grid',
    gridTemplateColumns: '190px 1fr',
    columnGap: 'var(--spacing-3)',
    alignItems: 'center',
  },
  laneGridCompact: {gridTemplateColumns: '96px 1fr'},
  laneLabelCell: {minWidth: 0},
  axisRow: {position: 'relative', height: 16},
  axisTick: {
    position: 'absolute',
    transform: 'translateX(-50%)',
    fontSize: 10,
    lineHeight: '16px',
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  track: {
    position: 'relative',
    height: 16,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    border: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  cardTrack: {height: 10},
  band: {
    position: 'absolute',
    insetBlock: 2,
    borderRadius: 999,
    opacity: 0.9,
  },
  goldenOverlay: {
    position: 'absolute',
    insetBlock: 0,
    backgroundColor: 'light-dark(rgba(235, 110, 0, 0.16), rgba(255, 147, 48, 0.20))',
    borderInline: '1px dashed light-dark(#B45309, #FBBF24)',
  },
  nowLine: {
    position: 'absolute',
    insetBlock: 0,
    width: 2,
    backgroundColor: 'light-dark(#EF4444, #F87171)',
  },
  legendDot: {width: 8, height: 8, borderRadius: '50%', flexShrink: 0},
  goldenLegendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    flexShrink: 0,
    backgroundColor: 'light-dark(rgba(235, 110, 0, 0.16), rgba(255, 147, 48, 0.20))',
    border: '1px dashed light-dark(#B45309, #FBBF24)',
  },
  nowLegendSwatch: {
    width: 2,
    height: 12,
    flexShrink: 0,
    backgroundColor: 'light-dark(#EF4444, #F87171)',
  },
  // Out-today strip ----------------------------------------------------------
  outFrame: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-2) var(--spacing-3)',
  },
  // Filter bar ---------------------------------------------------------------
  filterBar: {rowGap: 'var(--spacing-2)'},
  chipButton: {
    appearance: 'none',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    fontFamily: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  chipButtonActive: {
    // Selection reads via an inset outline so it never bleeds onto neighbors.
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
    color: 'var(--color-text-primary)',
    backgroundColor: 'var(--color-background-card)',
  },
  chipCount: {color: 'var(--color-text-secondary)', fontVariantNumeric: 'tabular-nums'},
  // Person cards -------------------------------------------------------------
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: 'var(--spacing-3)',
  },
  personCard: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-card)',
    padding: 'var(--spacing-3)',
    minWidth: 0,
  },
  personCardPinned: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  personCardOut: {opacity: 0.72},
  statusEmoji: {fontSize: 15, lineHeight: 1, flexShrink: 0},
  localTime: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
  },
  hoursLabel: {
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Compare tray -------------------------------------------------------------
  trayBar: {
    borderTop: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    padding: 'var(--spacing-2) var(--spacing-4)',
  },
  trayPersonRow: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '4px 10px 4px 6px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    minWidth: 0,
  },
  trayStat: {minWidth: 0},
  mono: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
};

// ---------------------------------------------------------------------------
// FIXTURES — Kestrel Labs · Atlas program, frozen at Wed Jul 15, 2026,
// 10:30 AM PT. All hours are PT decimal hours on one shared 24h axis;
// local times derive from fixed per-zone offsets (WEST +8, MT +1, CT +2,
// ET +3 relative to PT). No clocks — the anchor never moves.
// ---------------------------------------------------------------------------

/** Frozen "now": 10:30 AM PT on Wed Jul 15, 2026. */
const NOW_PT = 10.5;

type OfficeId = 'sf' | 'lisbon' | 'remote';

interface Office {
  id: OfficeId;
  label: string;
  shortLabel: string;
  /** Office core-hours band in PT decimal hours. */
  corePT: readonly [number, number];
  coreNote: string;
  color: string;
  count: number;
}

/**
 * Office core bands. Golden window = the intersection of all three:
 * 9:00 AM–12:00 PM PT (= 5:00–8:00 PM WEST), exactly 3 hours.
 */
const OFFICES: readonly Office[] = [
  {
    id: 'sf',
    label: 'San Francisco',
    shortLabel: 'SF',
    corePT: [9, 17],
    coreNote: 'Core 9:00 AM – 5:00 PM PT',
    color: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
    count: 5,
  },
  {
    id: 'lisbon',
    label: 'Lisbon',
    shortLabel: 'Lisbon',
    corePT: [4, 12],
    coreNote: 'Core 12:00 – 8:00 PM WEST',
    color: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
    count: 4,
  },
  {
    id: 'remote',
    label: 'Remote (US)',
    shortLabel: 'Remote',
    corePT: [6, 15],
    // Kept short so the 190px lane-label column never truncates it.
    coreNote: 'Core 6:00 AM – 3:00 PM PT',
    color: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
    count: 3,
  },
];

/** Golden overlap window: SF ∩ Lisbon ∩ Remote, in PT decimal hours. */
const GOLDEN_PT: readonly [number, number] = [9, 12];

type TeamId =
  | 'program'
  | 'platform'
  | 'product'
  | 'gtm'
  | 'pricing'
  | 'enablement';

const TEAM_LABELS: Record<TeamId, string> = {
  program: 'Program',
  platform: 'Platform & Infra',
  product: 'Product & Beta',
  gtm: 'GTM & Launch',
  pricing: 'Pricing & Billing',
  enablement: 'Enablement & Comms',
};

interface BusyBlock {
  /** PT decimal hours. */
  start: number;
  end: number;
  label: string;
}

interface Person {
  id: string;
  name: string;
  role: string;
  team: TeamId;
  office: OfficeId;
  /** Timezone short label rendered next to the local clock. */
  tz: 'PT' | 'MT' | 'CT' | 'ET' | 'WEST';
  /** Offset relative to PT in hours (WEST +8, MT +1, CT +2, ET +3). */
  tzOffset: number;
  city: string;
  /** Personal working-hours band in PT decimal hours. */
  hoursPT: readonly [number, number];
  statusEmoji: string;
  statusLabel: string;
  skills: readonly string[];
  /** Busy blocks for Wed Jul 15, PT decimal hours (compare-tray math). */
  busy: readonly BusyBlock[];
  joinedChip?: string;
  outToday?: {
    chip: string;
    citation: string;
    coverage: string;
  };
}

/**
 * The Atlas program group — 12 people. Office counts reconcile with the
 * OFFICES fixture and the filter chips: SF 5 · Lisbon 4 · Remote 3.
 */
const PEOPLE: readonly Person[] = [
  {
    id: 'priya',
    name: 'Priya Raman',
    role: 'VP Engineering · Atlas program lead',
    team: 'program',
    office: 'sf',
    tz: 'PT',
    tzOffset: 0,
    city: 'San Francisco',
    hoursPT: [8, 16],
    statusEmoji: '📅',
    statusLabel: 'In a meeting · Pricing sync, back 11:00 AM',
    skills: ['Program leadership', 'Systems design', 'Hiring'],
    busy: [
      {start: 9, end: 9.5, label: 'Standup review'},
      {start: 10, end: 11, label: 'Pricing sync'},
      {start: 14, end: 15, label: 'Workstream 1:1s'},
    ],
  },
  {
    id: 'marcus',
    name: 'Marcus Webb',
    role: 'Platform lead',
    team: 'platform',
    office: 'sf',
    tz: 'PT',
    tzOffset: 0,
    city: 'San Francisco',
    hoursPT: [9, 17],
    statusEmoji: '🎧',
    statusLabel: 'Deep work · load-test follow-up, until 11:00 AM',
    skills: ['Go', 'Kubernetes', 'Load testing'],
    busy: [
      {start: 9, end: 9.5, label: 'Standup review'},
      {start: 10, end: 11, label: 'Load-test debrief'},
      {start: 13, end: 13.5, label: 'Vendor call'},
    ],
  },
  {
    id: 'sofia',
    name: 'Sofia Ortiz',
    role: 'Design lead',
    team: 'product',
    office: 'lisbon',
    tz: 'WEST',
    tzOffset: 8,
    city: 'Lisbon',
    hoursPT: [4, 12],
    statusEmoji: '✅',
    statusLabel: 'Available · in the golden window until 8:00 PM WEST',
    skills: ['Figma', 'User research', 'Prototyping'],
    busy: [
      {start: 9.5, end: 10, label: 'Beta themes readout'},
      {start: 11, end: 11.5, label: 'Design crit'},
    ],
  },
  {
    id: 'jonah',
    name: 'Jonah Fields',
    role: 'Launch PM',
    team: 'gtm',
    office: 'sf',
    tz: 'PT',
    tzOffset: 0,
    city: 'San Francisco',
    hoursPT: [9, 17],
    statusEmoji: '☕',
    statusLabel: 'Away · back at 10:45 AM',
    skills: ['Launch ops', 'Copywriting', 'Analytics'],
    busy: [
      {start: 9, end: 9.5, label: 'Standup review'},
      {start: 10.25, end: 10.75, label: 'Checklist sweep'},
      {start: 13, end: 14, label: 'Comms review'},
    ],
  },
  {
    id: 'dana',
    name: 'Dana Whitfield',
    role: 'People Ops',
    team: 'enablement',
    office: 'remote',
    tz: 'MT',
    tzOffset: 1,
    city: 'Denver',
    hoursPT: [7, 15],
    statusEmoji: '🌴',
    statusLabel: 'PTO today · back Thu Jul 16',
    skills: ['Enablement', 'Comms', 'Onboarding'],
    busy: [],
    outToday: {
      chip: 'PTO · back Thu Jul 16',
      citation: 'Approved Jun 30 · Time-off ledger',
      coverage: 'Coverage: Jonah Fields',
    },
  },
  {
    id: 'elena',
    name: 'Elena Voss',
    role: 'Finance lead',
    team: 'pricing',
    office: 'lisbon',
    tz: 'WEST',
    tzOffset: 8,
    city: 'Lisbon',
    hoursPT: [3, 11],
    statusEmoji: '✅',
    statusLabel: 'Available · wraps at 7:00 PM WEST',
    skills: ['Pricing', 'FP&A', 'Billing systems'],
    busy: [{start: 9, end: 10, label: 'Billing dry-run prep'}],
  },
  {
    id: 'tom',
    name: 'Tom Okonkwo',
    role: 'IT admin',
    team: 'platform',
    office: 'sf',
    tz: 'PT',
    tzOffset: 0,
    city: 'San Francisco',
    hoursPT: [7.5, 15.5],
    statusEmoji: '✅',
    statusLabel: 'Available',
    skills: ['Okta', 'MDM', 'AV systems'],
    busy: [
      {start: 7.5, end: 8, label: 'Access reviews'},
      {start: 12, end: 13, label: 'AV refresh · Bldg 2'},
    ],
  },
  {
    id: 'ava',
    name: 'Ava Lindqvist',
    role: 'Engineer',
    team: 'platform',
    office: 'lisbon',
    tz: 'WEST',
    tzOffset: 8,
    city: 'Lisbon',
    hoursPT: [4, 12],
    statusEmoji: '✅',
    statusLabel: 'Available',
    skills: ['TypeScript', 'React'],
    busy: [
      {start: 9, end: 9.5, label: 'Onboarding sync'},
      {start: 11.5, end: 12, label: 'Buddy chat'},
    ],
    joinedChip: 'Joined Jul 1',
  },
  {
    id: 'ken',
    name: 'Ken Tanaka',
    role: 'GTM',
    team: 'gtm',
    office: 'remote',
    tz: 'CT',
    tzOffset: 2,
    city: 'Austin',
    hoursPT: [7, 15],
    statusEmoji: '🎓',
    statusLabel: 'Onboarding · GTM track, week 2',
    skills: ['Field marketing', 'Events'],
    busy: [
      {start: 9, end: 10, label: 'GTM onboarding'},
      {start: 13, end: 14, label: 'Shadowing · launch ops'},
    ],
    joinedChip: 'Joined Jul 6',
  },
  {
    id: 'noor',
    name: 'Noor Haddad',
    role: 'Platform engineer',
    team: 'platform',
    office: 'lisbon',
    tz: 'WEST',
    tzOffset: 8,
    city: 'Lisbon',
    hoursPT: [4.5, 12.5],
    statusEmoji: '🎧',
    statusLabel: 'Deep work · until 7:30 PM WEST',
    skills: ['Go', 'Terraform', 'Postgres'],
    busy: [
      {start: 9, end: 9.5, label: 'Standup review'},
      {start: 10.5, end: 11.5, label: 'Deep work block'},
    ],
  },
  {
    id: 'ravi',
    name: 'Ravi Menon',
    role: 'Data engineer',
    team: 'platform',
    office: 'remote',
    tz: 'ET',
    tzOffset: 3,
    city: 'Toronto',
    hoursPT: [6, 14],
    statusEmoji: '📅',
    statusLabel: 'In a meeting · pipeline review, until 11:00 AM PT',
    skills: ['SQL', 'dbt', 'TypeScript'],
    busy: [
      {start: 10, end: 11, label: 'Pipeline review'},
      {start: 12, end: 13, label: 'Data QA pairing'},
    ],
  },
  {
    id: 'grace',
    name: 'Grace Park',
    role: 'Product designer',
    team: 'product',
    office: 'sf',
    tz: 'PT',
    tzOffset: 0,
    city: 'San Francisco',
    hoursPT: [9.5, 17.5],
    statusEmoji: '✅',
    statusLabel: 'Available',
    skills: ['Figma', 'Accessibility', 'Motion design'],
    busy: [
      {start: 10, end: 10.5, label: 'Design pairing'},
      {start: 14, end: 15, label: 'Beta usability review'},
    ],
  },
];

/** id → Person for O(1) pin lookups. */
const PEOPLE_BY_ID = new Map(PEOPLE.map(p => [p.id, p]));

const OFFICE_BY_ID = new Map(OFFICES.map(o => [o.id, o]));

/**
 * Skill filter chips — counts reconcile with the PEOPLE skills arrays
 * (Figma: Sofia + Grace; Go: Marcus + Noor; TypeScript: Ava + Ravi; the
 * rest are single-holder specialties surfaced for cross-team lookup).
 */
const SKILL_CHIPS: readonly {skill: string; count: number}[] = [
  {skill: 'Figma', count: 2},
  {skill: 'Go', count: 2},
  {skill: 'TypeScript', count: 2},
  {skill: 'Copywriting', count: 1},
  {skill: 'SQL', count: 1},
  {skill: 'Accessibility', count: 1},
];

const TEAM_OPTIONS = [
  {value: 'all', label: 'All teams (12)'},
  {value: 'program', label: 'Program (1)'},
  {value: 'platform', label: 'Platform & Infra (5)'},
  {value: 'product', label: 'Product & Beta (2)'},
  {value: 'gtm', label: 'GTM & Launch (2)'},
  {value: 'pricing', label: 'Pricing & Billing (1)'},
  {value: 'enablement', label: 'Enablement & Comms (1)'},
];

/** Default compare pair: Marcus (SF) × Ava (Lisbon) — the classic 3h pair. */
const DEFAULT_PINNED: readonly string[] = ['marcus', 'ava'];

// ---------------------------------------------------------------------------
// HELPERS — pure arithmetic over the frozen fixtures (deterministic).
// ---------------------------------------------------------------------------

/** 24h-axis position for a PT decimal hour, as a CSS percentage string. */
function pctOf(hour: number): string {
  return `${(hour / 24) * 100}%`;
}

/** Width between two PT decimal hours, as a CSS percentage string. */
function pctSpan(start: number, end: number): string {
  return `${((end - start) / 24) * 100}%`;
}

/** "9:00 AM" / "12:30 PM" from a decimal hour (wraps past midnight). */
function fmtHour(hour: number): string {
  const wrapped = ((hour % 24) + 24) % 24;
  const h24 = Math.floor(wrapped);
  const minutes = Math.round((wrapped - h24) * 60);
  const meridiem = h24 < 12 ? 'AM' : 'PM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(minutes).padStart(2, '0')} ${meridiem}`;
}

/** "9:00 AM – 5:00 PM" range label from PT decimal hours + a zone offset. */
function fmtRange(start: number, end: number, offset = 0): string {
  return `${fmtHour(start + offset)} – ${fmtHour(end + offset)}`;
}

/** "3h" / "2h 30m" from a decimal-hour duration. */
function fmtDuration(hours: number): string {
  const h = Math.floor(hours);
  const m = Math.round((hours - h) * 60);
  if (m === 0) return `${h}h`;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

/** Day/night glyph for a LOCAL decimal hour. */
function glyphForLocalHour(localHour: number) {
  const h = ((localHour % 24) + 24) % 24;
  if (h >= 6 && h < 8) return SunriseIcon;
  if (h >= 8 && h < 17) return SunIcon;
  if (h >= 17 && h < 21) return SunsetIcon;
  return MoonIcon;
}

/** Working-hours overlap of two people, in PT decimal hours (null if none). */
function overlapOf(a: Person, b: Person): readonly [number, number] | null {
  const start = Math.max(a.hoursPT[0], b.hoursPT[0]);
  const end = Math.min(a.hoursPT[1], b.hoursPT[1]);
  return end > start ? [start, end] : null;
}

/** Whether a person is busy anywhere inside [t, t + 0.5). */
function isBusyDuring(person: Person, t: number): boolean {
  return person.busy.some(block => t < block.end && t + 0.5 > block.start);
}

interface MutualSlot {
  day: 'today' | 'tomorrow';
  start: number;
  end: number;
}

/**
 * First mutual 30-minute free slot inside the pair's overlap window, at or
 * after the frozen now. Falls to tomorrow's overlap start when either person
 * is out today or no slot remains today. Pure function of fixtures.
 */
function nextMutualFree(a: Person, b: Person): MutualSlot | null {
  const overlap = overlapOf(a, b);
  if (overlap === null) return null;
  if (a.outToday === undefined && b.outToday === undefined) {
    const first = Math.max(overlap[0], Math.ceil(NOW_PT * 4) / 4);
    for (let t = first; t + 0.5 <= overlap[1]; t += 0.25) {
      if (!isBusyDuring(a, t) && !isBusyDuring(b, t)) {
        return {day: 'today', start: t, end: t + 0.5};
      }
    }
  }
  return {day: 'tomorrow', start: overlap[0], end: overlap[0] + 0.5};
}

interface Filters {
  query: string;
  team: string;
  office: string;
  skills: readonly string[];
}

/** Directory filter: search AND team AND office AND (any selected skill). */
function matchesFilters(person: Person, filters: Filters): boolean {
  if (filters.team !== 'all' && person.team !== filters.team) return false;
  if (filters.office !== 'all' && person.office !== filters.office) return false;
  if (
    filters.skills.length > 0 &&
    !filters.skills.some(skill => person.skills.includes(skill))
  ) {
    return false;
  }
  const query = filters.query.trim().toLowerCase();
  if (query !== '') {
    const haystack = `${person.name} ${person.role} ${person.city} ${person.skills.join(' ')}`.toLowerCase();
    if (!haystack.includes(query)) return false;
  }
  return true;
}

// ---------------------------------------------------------------------------
// SHARED 24H AXIS — every hour bar on the page (strip lanes AND card bars)
// derives from the same PT decimal-hour → percentage scale, so bands, the
// golden window, and the frozen now line stay registered everywhere.
// ---------------------------------------------------------------------------

function HoursTrack({
  band,
  color,
  isCompact: isCardSize = false,
  isDimmed = false,
  ariaLabel,
}: {
  band: readonly [number, number];
  color: string;
  isCompact?: boolean;
  isDimmed?: boolean;
  ariaLabel: string;
}) {
  return (
    <div
      role="img"
      aria-label={ariaLabel}
      style={
        isCardSize ? {...styles.track, ...styles.cardTrack} : styles.track
      }>
      <div
        style={{
          ...styles.goldenOverlay,
          left: pctOf(GOLDEN_PT[0]),
          width: pctSpan(GOLDEN_PT[0], GOLDEN_PT[1]),
        }}
      />
      <div
        style={{
          ...styles.band,
          left: pctOf(band[0]),
          width: pctSpan(band[0], band[1]),
          backgroundColor: color,
          opacity: isDimmed ? 0.35 : 0.9,
        }}
      />
      <div style={{...styles.nowLine, left: pctOf(NOW_PT)}} />
    </div>
  );
}

/** Hour ticks under/over the tracks — 3h steps, 6h when compact. */
function AxisTicks({isCompact}: {isCompact: boolean}) {
  const step = isCompact ? 6 : 3;
  const ticks: number[] = [];
  for (let h = 0; h <= 24; h += step) ticks.push(h);
  return (
    <div style={styles.axisRow} aria-hidden>
      {ticks.map(h => (
        <span
          key={h}
          style={{
            ...styles.axisTick,
            left: pctOf(h),
            // Keep the edge labels inside the track bounds.
            transform:
              h === 0
                ? 'translateX(0)'
                : h === 24
                  ? 'translateX(-100%)'
                  : 'translateX(-50%)',
          }}>
          {h === 0 || h === 24 ? '12a' : h === 12 ? '12p' : h < 12 ? `${h}a` : `${h - 12}p`}
        </span>
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// TIMEZONE-OVERLAP STRIP
// ---------------------------------------------------------------------------

function OverlapStrip({isCompact}: {isCompact: boolean}) {
  const laneGrid = isCompact
    ? {...styles.laneGrid, ...styles.laneGridCompact}
    : styles.laneGrid;
  return (
    <section aria-label="Timezone overlap" style={styles.stripFrame}>
      <VStack gap={2}>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <Heading level={2}>
            Timezone overlap
          </Heading>
          <Text type="supporting" color="secondary">
            Wed, Jul 15 · all lanes on one 24h axis (PT)
          </Text>
          <StackItem size="fill" />
          <HStack gap={2} vAlign="center">
            <span style={styles.goldenLegendSwatch} aria-hidden />
            <Text type="supporting" color="secondary">
              Golden window · 3h · {fmtRange(GOLDEN_PT[0], GOLDEN_PT[1])} PT ·{' '}
              {fmtRange(GOLDEN_PT[0], GOLDEN_PT[1], 8)} WEST
            </Text>
          </HStack>
          <HStack gap={2} vAlign="center">
            <span style={styles.nowLegendSwatch} aria-hidden />
            <Text type="supporting" color="secondary">
              Now · 10:30 AM PT
            </Text>
          </HStack>
        </HStack>
        <div style={laneGrid}>
          <span />
          <AxisTicks isCompact={isCompact} />
        </div>
        {OFFICES.map(office => (
          <div key={office.id} style={laneGrid}>
            <div style={styles.laneLabelCell}>
              <HStack gap={2} vAlign="center">
                <span
                  style={{...styles.legendDot, backgroundColor: office.color}}
                  aria-hidden
                />
                <VStack gap={0} style={{minWidth: 0}}>
                  <Text type="supporting" maxLines={1}>
                    {isCompact ? office.shortLabel : office.label} ·{' '}
                    {office.count}
                  </Text>
                  {!isCompact && (
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {office.coreNote}
                    </Text>
                  )}
                </VStack>
              </HStack>
            </div>
            <HoursTrack
              band={office.corePT}
              color={office.color}
              ariaLabel={`${office.label}: ${office.coreNote}`}
            />
          </div>
        ))}
      </VStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// OUT-TODAY STRIP — cites the workforce time-off ledger for Dana's PTO day.
// ---------------------------------------------------------------------------

function OutTodayStrip() {
  const outPeople = PEOPLE.filter(person => person.outToday !== undefined);
  return (
    <section aria-label="Out today" style={styles.outFrame}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <Text type="label">Out today · {outPeople.length}</Text>
        {outPeople.map(person => {
          const out = person.outToday;
          if (out === undefined) return null;
          return (
            <HStack key={person.id} gap={2} vAlign="center" wrap="wrap">
              <Avatar name={person.name} size="xsmall" />
              <Text type="body" maxLines={1}>
                {person.name}
              </Text>
              <Text type="supporting" color="secondary" maxLines={1}>
                {person.role}
              </Text>
              <Token size="sm" color="orange" label={out.chip} />
              <Token size="sm" color="gray" label={out.citation} />
              <Token size="sm" color="blue" label={out.coverage} />
            </HStack>
          );
        })}
      </HStack>
    </section>
  );
}

// ---------------------------------------------------------------------------
// FILTER BAR
// ---------------------------------------------------------------------------

function FilterChip({
  label,
  count,
  isActive,
  onToggle,
}: {
  label: string;
  count: number;
  isActive: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      aria-pressed={isActive}
      onClick={onToggle}
      style={
        isActive
          ? {...styles.chipButton, ...styles.chipButtonActive}
          : styles.chipButton
      }>
      {label}
      <span style={styles.chipCount}>{count}</span>
    </button>
  );
}

function FilterBar({
  filters,
  visibleCount,
  onTeamChange,
  onOfficeChange,
  onSkillToggle,
  onClear,
}: {
  filters: Filters;
  visibleCount: number;
  onTeamChange: (team: string) => void;
  onOfficeChange: (office: string) => void;
  onSkillToggle: (skill: string) => void;
  onClear: () => void;
}) {
  const hasActiveFilters =
    filters.team !== 'all' ||
    filters.office !== 'all' ||
    filters.skills.length > 0 ||
    filters.query.trim() !== '';
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center" wrap="wrap" style={styles.filterBar}>
        <Selector
          label="Team"
          isLabelHidden
          options={TEAM_OPTIONS}
          value={filters.team}
          onChange={value => onTeamChange(String(value))}
          size="sm"
          width={210}
        />
        <Divider orientation="vertical" />
        <FilterChip
          label="All offices"
          count={12}
          isActive={filters.office === 'all'}
          onToggle={() => onOfficeChange('all')}
        />
        {OFFICES.map(office => (
          <FilterChip
            key={office.id}
            label={office.label}
            count={office.count}
            isActive={filters.office === office.id}
            onToggle={() => onOfficeChange(office.id)}
          />
        ))}
        <Divider orientation="vertical" />
        {SKILL_CHIPS.map(({skill, count}) => (
          <FilterChip
            key={skill}
            label={skill}
            count={count}
            isActive={filters.skills.includes(skill)}
            onToggle={() => onSkillToggle(skill)}
          />
        ))}
        <StackItem size="fill" />
        <Text type="supporting" color="secondary" hasTabularNumbers>
          Showing {visibleCount} of {PEOPLE.length}
        </Text>
        {hasActiveFilters && (
          <Button label="Clear filters" variant="ghost" size="sm" onClick={onClear} />
        )}
      </HStack>
    </VStack>
  );
}

// ---------------------------------------------------------------------------
// PERSON CARD
// ---------------------------------------------------------------------------

function PersonCard({
  person,
  isPinned,
  isPinDisabled,
  onTogglePin,
}: {
  person: Person;
  isPinned: boolean;
  isPinDisabled: boolean;
  onTogglePin: (id: string) => void;
}) {
  const office = OFFICE_BY_ID.get(person.office);
  const localNow = NOW_PT + person.tzOffset;
  const GlyphIcon = glyphForLocalHour(localNow);
  const isOut = person.outToday !== undefined;

  let cardStyle: CSSProperties = styles.personCard;
  if (isPinned) cardStyle = {...cardStyle, ...styles.personCardPinned};
  if (isOut) cardStyle = {...cardStyle, ...styles.personCardOut};

  return (
    <article aria-label={person.name} style={cardStyle}>
      <HStack gap={2} vAlign="center">
        <Avatar name={person.name} size="small" />
        <StackItem size="fill" style={{minWidth: 0}}>
          <VStack gap={0}>
            <HStack gap={2} vAlign="center">
              <Text type="label" maxLines={1}>
                {person.name}
              </Text>
              <span
                style={styles.statusEmoji}
                role="img"
                aria-label={`Status: ${person.statusLabel}`}
                title={person.statusLabel}>
                {person.statusEmoji}
              </span>
            </HStack>
            <Text type="supporting" color="secondary" maxLines={1}>
              {person.role}
            </Text>
          </VStack>
        </StackItem>
        <IconButton
          label={
            isPinned
              ? `Unpin ${person.name} from compare`
              : `Pin ${person.name} to compare`
          }
          tooltip={isPinned ? 'Unpin from compare' : 'Pin to compare'}
          variant={isPinned ? 'secondary' : 'ghost'}
          size="sm"
          isDisabled={isPinDisabled && !isPinned}
          onClick={() => onTogglePin(person.id)}
          icon={<Icon icon={isPinned ? PinOffIcon : PinIcon} size="sm" />}
        />
      </HStack>

      <HStack gap={2} vAlign="center" wrap="wrap">
        <Icon icon={GlyphIcon} size="sm" color="secondary" />
        <span style={styles.localTime}>
          {fmtHour(localNow)} · {person.tz}
        </span>
        <Icon icon={MapPinIcon} size="xsm" color="secondary" />
        <Text type="supporting" color="secondary" maxLines={1}>
          {person.city}
        </Text>
        {/* Skip the office token when it would just repeat the city
            (Lisbon people read "Lisbon · Lisbon" otherwise). */}
        {office !== undefined && office.shortLabel !== person.city && (
          <Token size="sm" color="gray" label={office.shortLabel} />
        )}
        {person.joinedChip !== undefined && (
          <Token size="sm" color="green" label={person.joinedChip} />
        )}
        {isOut && <Token size="sm" color="orange" label="Out · PTO" />}
      </HStack>

      <VStack gap={1}>
        <HoursTrack
          isCompact
          isDimmed={isOut}
          band={person.hoursPT}
          color={office?.color ?? 'var(--color-accent)'}
          ariaLabel={`Working hours: ${fmtRange(
            person.hoursPT[0],
            person.hoursPT[1],
            person.tzOffset,
          )} ${person.tz}`}
        />
        <HStack gap={2} vAlign="center">
          <span style={styles.hoursLabel}>
            {fmtRange(person.hoursPT[0], person.hoursPT[1], person.tzOffset)}{' '}
            {person.tz}
          </span>
          <StackItem size="fill" />
          {person.tzOffset !== 0 && (
            <span style={styles.hoursLabel}>
              = {fmtRange(person.hoursPT[0], person.hoursPT[1])} PT
            </span>
          )}
        </HStack>
      </VStack>

      <HStack gap={1} vAlign="center" wrap="wrap">
        {person.skills.map(skill => (
          <Token key={skill} size="sm" color="default" label={skill} />
        ))}
      </HStack>
    </article>
  );
}

// ---------------------------------------------------------------------------
// COMPARE TRAY — pinned footer; overlap + next-mutual-free math is pure
// arithmetic over the frozen fixtures.
// ---------------------------------------------------------------------------

function TrayPersonChip({
  person,
  onUnpin,
}: {
  person: Person;
  onUnpin: (id: string) => void;
}) {
  const localNow = NOW_PT + person.tzOffset;
  return (
    <span style={styles.trayPersonRow}>
      <Avatar name={person.name} size="xsmall" />
      <Text type="supporting" maxLines={1}>
        {person.name}
      </Text>
      <span style={styles.localTime}>
        {fmtHour(localNow)} {person.tz}
      </span>
      <IconButton
        label={`Remove ${person.name} from compare`}
        variant="ghost"
        size="sm"
        onClick={() => onUnpin(person.id)}
        icon={<Icon icon={XIcon} size="xsm" />}
      />
    </span>
  );
}

function CompareTray({
  pinned,
  onUnpin,
  onClear,
}: {
  pinned: readonly Person[];
  onUnpin: (id: string) => void;
  onClear: () => void;
}) {
  const [a, b] = pinned;
  const overlap = a !== undefined && b !== undefined ? overlapOf(a, b) : null;
  const slot = a !== undefined && b !== undefined ? nextMutualFree(a, b) : null;

  return (
    <div style={styles.trayBar}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <HStack gap={2} vAlign="center">
          <Icon icon={UsersIcon} size="sm" color="secondary" />
          <Text type="label" hasTabularNumbers>
            Compare · {pinned.length}/2
          </Text>
        </HStack>
        <HStack gap={2} vAlign="center" wrap="wrap">
          {pinned.map(person => (
            <TrayPersonChip key={person.id} person={person} onUnpin={onUnpin} />
          ))}
          {pinned.length === 1 && (
            <Text type="supporting" color="secondary">
              Pin one more person to compare working hours.
            </Text>
          )}
        </HStack>
        {a !== undefined && b !== undefined && (
          <HStack gap={3} vAlign="center" wrap="wrap" style={styles.trayStat}>
            <HStack gap={2} vAlign="center">
              <Icon icon={Clock3Icon} size="sm" color="secondary" />
              {overlap !== null ? (
                <Text type="supporting" hasTabularNumbers>
                  {fmtDuration(overlap[1] - overlap[0])} shared ·{' '}
                  {fmtRange(overlap[0], overlap[1])} PT
                  {b.tzOffset !== 0 &&
                    ` (${fmtRange(overlap[0], overlap[1], b.tzOffset)} ${b.tz})`}
                </Text>
              ) : (
                <Text type="supporting" color="secondary">
                  No shared working hours
                </Text>
              )}
            </HStack>
            {slot !== null && (
              <HStack gap={2} vAlign="center">
                <Icon icon={CalendarClockIcon} size="sm" color="secondary" />
                <Text type="supporting" hasTabularNumbers>
                  Next mutual free ·{' '}
                  {slot.day === 'today' ? 'Today' : 'Thu Jul 16'} ·{' '}
                  {fmtRange(slot.start, slot.end)} PT
                  {b.tzOffset !== 0 &&
                    ` (${fmtRange(slot.start, slot.end, b.tzOffset)} ${b.tz})`}
                </Text>
              </HStack>
            )}
          </HStack>
        )}
        <StackItem size="fill" />
        <Button label="Clear" variant="ghost" size="sm" onClick={onClear} />
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function TeamDirectoryTimezonesTemplate() {
  const isCompact = useMediaQuery('(max-width: 860px)');

  const [query, setQuery] = useState('');
  const [team, setTeam] = useState('all');
  const [office, setOffice] = useState('all');
  const [skills, setSkills] = useState<readonly string[]>([]);
  const [pinnedIds, setPinnedIds] = useState<readonly string[]>(DEFAULT_PINNED);

  const filters = useMemo<Filters>(
    () => ({query, team, office, skills}),
    [query, team, office, skills],
  );

  const visiblePeople = useMemo(
    () => PEOPLE.filter(person => matchesFilters(person, filters)),
    [filters],
  );

  const pinnedPeople = useMemo(
    () =>
      pinnedIds
        .map(id => PEOPLE_BY_ID.get(id))
        .filter((person): person is Person => person !== undefined),
    [pinnedIds],
  );

  const togglePin = (id: string) => {
    setPinnedIds(previous =>
      previous.includes(id)
        ? previous.filter(pinnedId => pinnedId !== id)
        : previous.length < 2
          ? [...previous, id]
          : previous,
    );
  };

  const toggleSkill = (skill: string) => {
    setSkills(previous =>
      previous.includes(skill)
        ? previous.filter(s => s !== skill)
        : [...previous, skill],
    );
  };

  const clearFilters = () => {
    setQuery('');
    setTeam('all');
    setOffice('all');
    setSkills([]);
  };

  // ----- header --------------------------------------------------------
  const header = (
    <div style={styles.headerBar}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <VStack gap={0}>
          <Heading level={1}>People directory</Heading>
          <Text type="supporting" color="secondary">
            Kestrel Labs · Atlas program — 12 people · 3 offices
          </Text>
        </VStack>
        <span style={styles.nowChip}>
          <Icon icon={Clock3Icon} size="xsm" color="inherit" />
          Wed, Jul 15, 2026 · 10:30 AM PT
        </span>
        <StackItem size="fill" />
        <TextInput
          label="Search people"
          isLabelHidden
          placeholder="Search name, role, or skill"
          value={query}
          onChange={setQuery}
          size="sm"
          width={isCompact ? 200 : 280}
          startIcon={<Icon icon={SearchIcon} size="sm" />}
        />
      </HStack>
    </div>
  );

  // ----- content -------------------------------------------------------
  const content = (
    <div style={styles.contentScroll}>
      <VStack gap={3} style={styles.sectionStack}>
        <OverlapStrip isCompact={isCompact} />
        <OutTodayStrip />
        <FilterBar
          filters={filters}
          visibleCount={visiblePeople.length}
          onTeamChange={setTeam}
          onOfficeChange={setOffice}
          onSkillToggle={toggleSkill}
          onClear={clearFilters}
        />
        {visiblePeople.length === 0 ? (
          <EmptyState
            icon={<Icon icon={UsersIcon} size="lg" />}
            title="No people match"
            description="No one in the Atlas program matches the current team, office, skill, or search filters."
            actions={
              <Button
                label="Clear filters"
                variant="secondary"
                size="sm"
                onClick={clearFilters}
              />
            }
          />
        ) : (
          <div style={styles.grid}>
            {visiblePeople.map(person => (
              <PersonCard
                key={person.id}
                person={person}
                isPinned={pinnedIds.includes(person.id)}
                isPinDisabled={pinnedIds.length >= 2}
                onTogglePin={togglePin}
              />
            ))}
          </div>
        )}
      </VStack>
    </div>
  );

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={<LayoutHeader hasDivider>{header}</LayoutHeader>}
        content={<LayoutContent padding={0}>{content}</LayoutContent>}
        footer={
          pinnedPeople.length > 0 ? (
            <LayoutFooter>
              <CompareTray
                pinned={pinnedPeople}
                onUnpin={togglePin}
                onClear={() => setPinnedIds([])}
              />
            </LayoutFooter>
          ) : undefined
        }
      />
    </div>
  );
}
