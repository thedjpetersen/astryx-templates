// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one fictional product — Relay, a sync
 *   platform — described across four feature-section variants: six icon-grid
 *   features each with a short blurb and a longer expandable description,
 *   three alternating rows for realtime sync / audit log / roles with
 *   CSS-drawn schematic mocks, four centered-grid capabilities over a
 *   browser-style screenshot panel with two fixture tabs, and a dark API
 *   spotlight whose offset code-card holds fixed TypeScript and cURL
 *   snippets)
 * @output Stacked feature-section showcase: a segmented control in the
 *   header shows all four variants in page order or isolates any single one
 *   for copy-ready viewing. Variant 1 is a 3-column icon grid whose cards
 *   expand on click (tap or Enter/Space) to reveal the longer description,
 *   with Expand all / Collapse all in its section header. Variant 2
 *   alternates image-left/image-right rows whose schematic mocks reveal
 *   with a subtle fade-and-rise as they scroll into view (replayable, and
 *   skipped under prefers-reduced-motion). Variant 3 is a centered 2x2
 *   capability grid above a screenshot panel whose Overview / Audit trail
 *   tabs swap the CSS-drawn mock. Variant 4 is a dark feature spotlight
 *   with an offset codeblock-style card — TypeScript/cURL tabs plus a copy
 *   button — and every CTA fires a corner Toast naming its variant so the
 *   wiring is provable
 * @position Page template; emitted by `astryx template marketing-feature-sections`
 *
 * Frame: Layout height="fill". LayoutHeader carries the showcase title, a
 * variant-count Badge, and the variant-switcher SegmentedControl
 * (All / Icon grid / Alternating / Centered / Spotlight). LayoutContent
 * scrolls a centered 1040px document column holding the four labeled
 * sections; when a single section is isolated, a dashed copy-ready note
 * replaces the others. The Toast sits fixed bottom-right.
 *
 * Interaction contract:
 * - The header SegmentedControl either stacks all four variants or
 *   isolates one; isolation renders an "Isolated for copy-ready viewing"
 *   note so the state is legible.
 * - Icon-grid cards are real buttons: click, Enter, or Space toggles the
 *   longer description open with aria-expanded; the chevron rotates and
 *   Expand all / Collapse all act on the whole grid.
 * - Alternating rows use an IntersectionObserver reveal (30% threshold)
 *   that fades and raises each row once; Replay reveal remounts the rows
 *   to run it again. Without IntersectionObserver, or when
 *   prefers-reduced-motion is set, rows render visible immediately.
 * - The screenshot panel's Overview / Audit trail tabs swap the CSS-drawn
 *   mock body; the code-card's TypeScript / cURL tabs swap the snippet and
 *   reset the copied state; Copy snippet writes the fixture text through a
 *   guarded clipboard call and flips the button to a Copied check.
 * - Every CTA button ("Start syncing", "Read the API docs", per-row Learn
 *   more, etc.) fires the corner Toast naming its variant; no dead buttons.
 *
 * Responsive contract:
 * - >900px: icon grid is 3 columns, the centered grid is 2x2, alternating
 *   rows sit text/mock side by side with mock order flipping per row, and
 *   the spotlight pairs copy left with the offset code-card right.
 * - <=900px: icon grid drops to 2 columns; alternating rows and the
 *   spotlight stack (mock and code-card below the copy, offset removed).
 * - <=640px: both grids go single-column, headline sizes step down, the
 *   header SegmentedControl wraps below the title, and section-header
 *   action rows wrap. All action rows are wrap="wrap" and mocks are
 *   width-fluid, so the page holds at 375px with no overflow-x; only the
 *   code-card scrolls horizontally, deliberately, inside its own bounds.
 * - Tap targets: expandable cards are full-width buttons well over 40px
 *   tall, tab and CTA Buttons carry visible labels, and nothing is
 *   hover-only — reveal-on-scroll is scroll-driven, not hover-driven.
 *
 * Container policy (marketing-showcase archetype): frame-first page chrome;
 * each feature-section variant is its own painted panel or bordered Card
 * inside the document column. Dark surfaces lock literal fixture gradients
 * via colorScheme so they read identically in light and dark app themes.
 * Color policy: the Variant 4 spotlight panel and its code card are
 * deliberately scheme-locked (colorScheme:'dark' with literal gradient,
 * ring, border, shadow, chip, and syntax-highlight colors — including the
 * literal white/soft-slate text that sits on them) so the marketing art
 * reads identically in both app themes. Everything else follows the app
 * theme: accents on theme-following surfaces use Astryx tokens or
 * light-dark() pairs that keep the light appearance exact and brighten
 * one ramp step in dark.
 * Fixture policy: fixed Relay copy and code snippets only — no Date.now,
 * no randomness, no network assets; every "image" is a CSS-drawn schematic.
 */

import {
  Fragment,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
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
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Toast} from '@astryxdesign/core/Toast';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  ChevronDownIcon,
  ClipboardCopyIcon,
  FingerprintIcon,
  GitBranchIcon,
  KeyRoundIcon,
  LockIcon,
  PlayIcon,
  RefreshCwIcon,
  RotateCcwIcon,
  ScrollTextIcon,
  ShieldCheckIcon,
  TerminalIcon,
  UsersIcon,
  WebhookIcon,
  ZapIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

// ============= PAINT CONSTANTS =============
// Painted marketing surfaces use literal fixture colors locked with
// colorScheme:'dark' so the panels read identically in both app themes.

const DARK_TEXT = '#FFFFFF';
const DARK_TEXT_SOFT = 'rgba(226, 232, 240, 0.82)';
const DARK_TEXT_FAINT = 'rgba(226, 232, 240, 0.62)';
const CHIP_BG = 'rgba(255, 255, 255, 0.14)';
const CHIP_BORDER = 'rgba(255, 255, 255, 0.24)';

// Codeblock syntax palette (fixture colors on the dark code card).
const CODE_KEYWORD = '#C4B5FD';
const CODE_STRING = '#86EFAC';
const CODE_FUNCTION = '#93C5FD';
const CODE_COMMENT = '#64748B';
const CODE_PLAIN = '#E2E8F0';

// ============= ACCENT RAMPS =============
// Feature accents on theme-following surfaces: light-dark() pairs keep the
// exact light values and step up to the brighter end of the same hue ramp
// in dark mode so discs, dots, and tints stay legible on dark backgrounds.

const ACCENT_INDIGO = 'light-dark(#4F46E5, #818CF8)';
const ACCENT_INDIGO_TINT =
  'light-dark(rgba(99, 102, 241, 0.14), rgba(129, 140, 248, 0.2))';
const ACCENT_SKY = 'light-dark(#0284C7, #38BDF8)';
const ACCENT_SKY_TINT =
  'light-dark(rgba(14, 165, 233, 0.14), rgba(56, 189, 248, 0.2))';
const ACCENT_GREEN = 'light-dark(#16A34A, #4ADE80)';
const ACCENT_GREEN_TINT =
  'light-dark(rgba(34, 197, 94, 0.14), rgba(74, 222, 128, 0.2))';
const ACCENT_ORANGE = 'light-dark(#EA580C, #FB923C)';
const ACCENT_ORANGE_TINT =
  'light-dark(rgba(249, 115, 22, 0.14), rgba(251, 146, 60, 0.2))';
const ACCENT_PURPLE = 'light-dark(#9333EA, #C084FC)';
const ACCENT_PURPLE_TINT =
  'light-dark(rgba(168, 85, 247, 0.14), rgba(192, 132, 252, 0.2))';
const ACCENT_PINK = 'light-dark(#DB2777, #F472B6)';
const ACCENT_PINK_TINT =
  'light-dark(rgba(236, 72, 153, 0.14), rgba(244, 114, 182, 0.2))';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Document column: 1040px cap with page gutters.
  column: {
    width: '100%',
    maxWidth: 1040,
    marginInline: 'auto',
    padding: 'var(--spacing-6)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-7)',
  },
  columnCompact: {
    padding: 'var(--spacing-4)',
    gap: 'var(--spacing-6)',
  },
  // ---- copy-ready isolation note ----
  isolationNote: {
    border: '1.5px dashed var(--color-border)',
    borderRadius: 12,
    padding: 'var(--spacing-3) var(--spacing-4)',
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    color: 'var(--color-text-secondary)',
  },
  // ---- variant 1: 3-column icon grid ----
  featureGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 'var(--spacing-4)',
    alignItems: 'start',
  },
  featureGridTwoCol: {
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
  },
  featureGridOneCol: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  // Expandable card is a real <button> so tap + keyboard both work.
  featureCard: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-3)',
    width: '100%',
    minHeight: 44,
    textAlign: 'left',
    padding: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    font: 'inherit',
    boxSizing: 'border-box',
  },
  featureCardOpen: {
    borderColor: 'var(--color-border-focus, light-dark(#6366F1, #818CF8))',
    boxShadow: 'var(--shadow-med)',
  },
  featureIconDisc: {
    width: 40,
    height: 40,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  featureChevron: {
    marginLeft: 'auto',
    display: 'flex',
    alignItems: 'center',
    color: 'var(--color-text-secondary)',
    transition: 'transform 160ms ease',
  },
  featureChevronOpen: {
    transform: 'rotate(180deg)',
  },
  // ---- variant 2: alternating rows ----
  altRow: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'center',
  },
  altRowReversed: {
    flexDirection: 'row-reverse',
  },
  altRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-4)',
  },
  altRowHalf: {
    flex: '1 1 0',
    minWidth: 0,
  },
  altReveal: {
    opacity: 0,
    transform: 'translateY(18px)',
    transition: 'opacity 560ms ease, transform 560ms ease',
  },
  altRevealVisible: {
    opacity: 1,
    transform: 'translateY(0)',
  },
  // ---- schematic mocks (CSS-drawn; no imagery) ----
  mockPanel: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    overflow: 'hidden',
  },
  mockNode: {
    flex: '1 1 0',
    minWidth: 0,
    borderRadius: 10,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  mockBar: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  mockBarAccent: {
    height: 8,
    borderRadius: 4,
    backgroundImage:
      'linear-gradient(90deg, light-dark(rgba(99, 102, 241, 0.55), rgba(129, 140, 248, 0.6)), light-dark(rgba(14, 165, 233, 0.45), rgba(56, 189, 248, 0.5)))',
    border: 'none',
  },
  mockLinkRail: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    color: 'var(--color-text-secondary)',
  },
  mockLogRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '6px 10px',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  mockLogDot: {
    width: 8,
    height: 8,
    borderRadius: '50%',
    flexShrink: 0,
  },
  mockMatrix: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1.4fr) repeat(3, minmax(0, 1fr))',
    gap: 6,
  },
  mockMatrixHead: {
    fontSize: 11,
    fontWeight: 600,
    letterSpacing: '0.04em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
    padding: '2px 4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  mockMatrixCell: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 26,
    borderRadius: 6,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
  },
  mockMatrixLabel: {
    display: 'flex',
    alignItems: 'center',
    height: 26,
    fontSize: 12,
    color: 'var(--color-text)',
    padding: '0 4px',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // ---- variant 3: centered 2x2 grid + screenshot panel ----
  centeredHeader: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 'var(--spacing-2)',
    maxWidth: 640,
    marginInline: 'auto',
  },
  centeredGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 'var(--spacing-4)',
  },
  centeredGridOneCol: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  centeredItem: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    alignItems: 'flex-start',
    padding: 'var(--spacing-4)',
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
  },
  screenshotWindow: {
    borderRadius: 14,
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
    boxShadow: 'var(--shadow-med)',
    backgroundColor: 'var(--color-background)',
  },
  screenshotChrome: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '8px 12px',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border)',
  },
  screenshotDot: {
    width: 10,
    height: 10,
    borderRadius: '50%',
  },
  screenshotUrl: {
    flex: 1,
    marginLeft: 8,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    display: 'flex',
    alignItems: 'center',
    paddingInline: 10,
    fontSize: 10,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  screenshotBody: {
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    minHeight: 208,
  },
  screenshotHero: {
    height: 56,
    borderRadius: 8,
    backgroundImage:
      'linear-gradient(120deg, light-dark(rgba(99, 102, 241, 0.28), rgba(129, 140, 248, 0.32)), light-dark(rgba(14, 165, 233, 0.22), rgba(56, 189, 248, 0.26)))',
    border: '1px solid var(--color-border)',
  },
  screenshotCards: {
    display: 'flex',
    gap: 'var(--spacing-2)',
  },
  screenshotCard: {
    flex: 1,
    height: 52,
    borderRadius: 8,
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
  },
  // ---- variant 4: dark spotlight with offset code card ----
  spotlight: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: DARK_TEXT,
    borderRadius: 16,
    backgroundImage: [
      'radial-gradient(75% 85% at 100% 0%, rgba(56, 189, 248, 0.22), transparent 55%)',
      'radial-gradient(60% 80% at 0% 100%, rgba(129, 140, 248, 0.24), transparent 55%)',
      'linear-gradient(160deg, #0B1220 0%, #111827 60%, #1E1B4B 100%)',
    ].join(', '),
    padding: 'var(--spacing-7) var(--spacing-6)',
  },
  spotlightCompact: {
    padding: 'var(--spacing-5) var(--spacing-4)',
  },
  spotlightRing: {
    position: 'absolute',
    left: -90,
    top: -110,
    width: 280,
    height: 280,
    borderRadius: '50%',
    border: '1.5px solid rgba(255, 255, 255, 0.12)',
    pointerEvents: 'none',
  },
  spotlightRow: {
    display: 'flex',
    gap: 'var(--spacing-6)',
    alignItems: 'center',
  },
  spotlightRowStacked: {
    flexDirection: 'column',
    alignItems: 'stretch',
    gap: 'var(--spacing-4)',
  },
  spotlightCopy: {
    flex: '1 1 0',
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  spotlightCodeWrap: {
    flex: '1 1 0',
    minWidth: 0,
  },
  // Offset: the code card rises out of the panel on wide screens.
  spotlightCodeOffset: {
    transform: 'translateY(-40px) rotate(1.2deg)',
  },
  chip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 999,
    backgroundColor: CHIP_BG,
    border: `1px solid ${CHIP_BORDER}`,
    fontSize: 13,
    fontWeight: 600,
    lineHeight: '20px',
    whiteSpace: 'nowrap',
    alignSelf: 'flex-start',
  },
  headline: {
    fontSize: 30,
    fontWeight: 700,
    lineHeight: 1.2,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  headlineCompact: {
    fontSize: 23,
  },
  darkSubcopy: {
    fontSize: 16,
    lineHeight: 1.55,
    color: DARK_TEXT_SOFT,
    margin: 0,
  },
  spotlightBullet: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: DARK_TEXT_SOFT,
    fontSize: 14,
  },
  // ---- codeblock-style card ----
  codeCard: {
    colorScheme: 'dark',
    borderRadius: 12,
    border: '1px solid rgba(148, 163, 184, 0.28)',
    backgroundColor: '#0B1120',
    boxShadow: '0 18px 44px rgba(2, 6, 23, 0.5)',
    overflow: 'hidden',
  },
  codeCardHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderBottom: '1px solid rgba(148, 163, 184, 0.22)',
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
  },
  codeTabButton: {
    minHeight: 40,
    padding: '0 14px',
    borderRadius: 8,
    border: '1px solid transparent',
    backgroundColor: 'transparent',
    color: DARK_TEXT_FAINT,
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    font: 'inherit',
  },
  codeTabButtonActive: {
    color: DARK_TEXT,
    backgroundColor: CHIP_BG,
    border: `1px solid ${CHIP_BORDER}`,
  },
  codeBody: {
    margin: 0,
    padding: 'var(--spacing-4)',
    fontFamily:
      'ui-monospace, SFMono-Regular, Menlo, Consolas, "Liberation Mono", monospace',
    fontSize: 13,
    lineHeight: 1.65,
    // The one deliberate horizontal scroller on the page.
    overflowX: 'auto',
    whiteSpace: 'pre',
  },
  codeLineNumber: {
    display: 'inline-block',
    width: 26,
    marginRight: 14,
    textAlign: 'right',
    color: 'rgba(100, 116, 139, 0.75)',
    userSelect: 'none',
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
// One fictional brand across all variants: Relay, a data-sync platform.
// Fixed copy and code only — no clocks, randomness, or network assets.

type SectionId = 'all' | 'grid' | 'rows' | 'centered' | 'spotlight';

interface SectionMeta {
  id: Exclude<SectionId, 'all'>;
  label: string;
  title: string;
  description: string;
  tokenColor: 'purple' | 'blue' | 'green' | 'orange';
}

const SECTIONS: readonly SectionMeta[] = [
  {
    id: 'grid',
    label: 'Icon grid',
    title: 'Everything Relay keeps in sync',
    description:
      '3-column icon grid, six features. Cards expand on click (or Enter/Space) to reveal the longer description.',
    tokenColor: 'purple',
  },
  {
    id: 'rows',
    label: 'Alternating',
    title: 'How teams run on Relay',
    description:
      'Image-left / image-right rows with schematic product mocks; each row fades and rises as it scrolls into view.',
    tokenColor: 'blue',
  },
  {
    id: 'centered',
    label: 'Centered',
    title: 'Built for platform teams',
    description:
      'Centered 2x2 capability grid over a screenshot panel; the panel tabs swap between the Overview and Audit trail mocks.',
    tokenColor: 'green',
  },
  {
    id: 'spotlight',
    label: 'Spotlight',
    title: 'Ship on the Relay API',
    description:
      'Dark feature spotlight with an offset codeblock-style card — switch snippets between TypeScript and cURL, then copy.',
    tokenColor: 'orange',
  },
];

interface GridFeature {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconBg: string;
  iconColor: string;
  title: string;
  blurb: string;
  detail: string;
}

const GRID_FEATURES: readonly GridFeature[] = [
  {
    id: 'sync',
    icon: RefreshCwIcon,
    iconBg: ACCENT_INDIGO_TINT,
    iconColor: ACCENT_INDIGO,
    title: 'Realtime sync',
    blurb: 'Every record lands everywhere within 200ms, conflict-free.',
    detail:
      'Relay diffs at the field level and merges with CRDT semantics, so two ' +
      'edits to the same customer record never clobber each other. Offline ' +
      'writes queue locally and reconcile on reconnect in commit order.',
  },
  {
    id: 'audit',
    icon: ScrollTextIcon,
    iconBg: ACCENT_SKY_TINT,
    iconColor: ACCENT_SKY,
    title: 'Audit log',
    blurb: 'An append-only trail of who changed what, and from where.',
    detail:
      'Every mutation is written to an immutable ledger with the actor, the ' +
      'source app, and the before/after values. Export to your SIEM on a ' +
      'schedule or stream entries the moment they land.',
  },
  {
    id: 'roles',
    icon: UsersIcon,
    iconBg: ACCENT_GREEN_TINT,
    iconColor: ACCENT_GREEN,
    title: 'Role-based access',
    blurb: 'Grant by role, not by spreadsheet of one-off exceptions.',
    detail:
      'Admins, editors, and read-only auditors are first-class roles, and ' +
      'custom roles compose per-collection permissions. Access reviews export ' +
      'as a one-page diff your compliance team can actually read.',
  },
  {
    id: 'api',
    icon: TerminalIcon,
    iconBg: ACCENT_ORANGE_TINT,
    iconColor: ACCENT_ORANGE,
    title: 'Typed API',
    blurb: 'REST and streaming endpoints with generated client types.',
    detail:
      'The schema you define is the schema you query — SDKs for TypeScript, ' +
      'Python, and Go are generated from it on every publish, so a breaking ' +
      'change fails your build instead of your weekend.',
  },
  {
    id: 'webhooks',
    icon: WebhookIcon,
    iconBg: ACCENT_PURPLE_TINT,
    iconColor: ACCENT_PURPLE,
    title: 'Webhooks',
    blurb: 'Signed delivery with automatic retries and a replay console.',
    detail:
      'Each delivery is HMAC-signed and retried on a backoff curve for 24 ' +
      'hours. The replay console shows every attempt with response codes, so ' +
      'a flaky consumer never means silent data loss.',
  },
  {
    id: 'sso',
    icon: KeyRoundIcon,
    iconBg: ACCENT_PINK_TINT,
    iconColor: ACCENT_PINK,
    title: 'SSO & SCIM',
    blurb: 'SAML sign-in and directory sync on every paid plan.',
    detail:
      'Connect Okta, Entra, or Google Workspace in minutes. SCIM keeps ' +
      'seats in step with your directory — offboarded users lose access ' +
      'before the exit interview ends.',
  },
];

type AltMockKind = 'sync' | 'audit' | 'roles';

interface AltRow {
  id: string;
  mock: AltMockKind;
  kicker: string;
  title: string;
  body: string;
  bullets: readonly string[];
  cta: string;
}

const ALT_ROWS: readonly AltRow[] = [
  {
    id: 'row-sync',
    mock: 'sync',
    kicker: 'Sync engine',
    title: 'One source of truth, every surface',
    body:
      'Point Relay at your primary store and every app — web, mobile, the ' +
      'warehouse — reads the same record at the same moment. No nightly ' +
      'jobs, no “which number is right” meetings.',
    bullets: [
      'Field-level merge, not last-write-wins',
      'Offline queues reconcile in commit order',
    ],
    cta: 'See the sync engine',
  },
  {
    id: 'row-audit',
    mock: 'audit',
    kicker: 'Audit log',
    title: 'Answer “who changed this?” in seconds',
    body:
      'The ledger keeps actor, source, and before/after values for every ' +
      'write. Filter to a record, a teammate, or an API key and read the ' +
      'story straight down the page.',
    bullets: [
      'Immutable, append-only entries',
      'Streaming export to your SIEM',
    ],
    cta: 'Browse a sample trail',
  },
  {
    id: 'row-roles',
    mock: 'roles',
    kicker: 'Roles & access',
    title: 'Access that matches your org chart',
    body:
      'Compose per-collection permissions into named roles, assign them ' +
      'from your directory, and let quarterly access reviews export as a ' +
      'diff instead of a screenshot safari.',
    bullets: [
      'Custom roles from per-collection grants',
      'SCIM keeps seats current automatically',
    ],
    cta: 'Explore role controls',
  },
];

interface CenteredFeature {
  id: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  iconBg: string;
  iconColor: string;
  title: string;
  body: string;
}

const CENTERED_FEATURES: readonly CenteredFeature[] = [
  {
    id: 'c-latency',
    icon: ZapIcon,
    iconBg: ACCENT_ORANGE_TINT,
    iconColor: ACCENT_ORANGE,
    title: 'p99 under 200ms',
    body: 'Fan-out is edge-cached per region, so reads stay fast at any scale.',
  },
  {
    id: 'c-branch',
    icon: GitBranchIcon,
    iconBg: ACCENT_INDIGO_TINT,
    iconColor: ACCENT_INDIGO,
    title: 'Schema branching',
    body: 'Draft schema changes on a branch and merge with a migration plan.',
  },
  {
    id: 'c-lock',
    icon: LockIcon,
    iconBg: ACCENT_GREEN_TINT,
    iconColor: ACCENT_GREEN,
    title: 'Encryption everywhere',
    body: 'AES-256 at rest, TLS 1.3 in transit, optional customer-held keys.',
  },
  {
    id: 'c-audit',
    icon: FingerprintIcon,
    iconBg: ACCENT_SKY_TINT,
    iconColor: ACCENT_SKY,
    title: 'Compliance-ready',
    body: 'SOC 2 Type II and ISO 27001, with the audit log as your evidence.',
  },
];

type ScreenshotTab = 'overview' | 'audit';

const AUDIT_LOG_ROWS: readonly {
  actor: string;
  action: string;
  dotColor: string;
}[] = [
  {actor: 'maya@acme.dev', action: 'updated customers/1042 · plan: pro → scale', dotColor: ACCENT_INDIGO},
  {actor: 'api-key ci-deploy', action: 'created webhooks/checkout-sync', dotColor: ACCENT_SKY},
  {actor: 'jordan@acme.dev', action: 'granted role auditor to sam@acme.dev', dotColor: ACCENT_GREEN},
  {actor: 'sam@acme.dev', action: 'exported audit range Q2 · 4,182 entries', dotColor: ACCENT_ORANGE},
  {actor: 'maya@acme.dev', action: 'merged schema branch billing-v2', dotColor: ACCENT_PURPLE},
];

const ROLE_MATRIX = {
  columns: ['Read', 'Write', 'Admin'],
  rows: [
    {label: 'Customers', grants: [true, true, false]},
    {label: 'Invoices', grants: [true, true, false]},
    {label: 'API keys', grants: [true, false, false]},
    {label: 'Audit log', grants: [true, false, false]},
  ],
} as const;

type CodeTab = 'ts' | 'curl';

interface CodeSegment {
  text: string;
  color: string;
}

type CodeLine = readonly CodeSegment[];

const TS_SNIPPET: readonly CodeLine[] = [
  [
    {text: 'import', color: CODE_KEYWORD},
    {text: ' { Relay } ', color: CODE_PLAIN},
    {text: 'from', color: CODE_KEYWORD},
    {text: " '@relay/sdk'", color: CODE_STRING},
    {text: ';', color: CODE_PLAIN},
  ],
  [],
  [
    {text: 'const', color: CODE_KEYWORD},
    {text: ' relay = ', color: CODE_PLAIN},
    {text: 'new', color: CODE_KEYWORD},
    {text: ' Relay', color: CODE_FUNCTION},
    {text: '({ token: process.env.RELAY_TOKEN });', color: CODE_PLAIN},
  ],
  [],
  [{text: '// Subscribe to field-level changes on a collection', color: CODE_COMMENT}],
  [
    {text: 'relay.collection', color: CODE_PLAIN},
    {text: '(', color: CODE_PLAIN},
    {text: "'customers'", color: CODE_STRING},
    {text: ').subscribe', color: CODE_FUNCTION},
    {text: '(event => {', color: CODE_PLAIN},
  ],
  [
    {text: '  console.log', color: CODE_FUNCTION},
    {text: '(event.actor, event.diff);', color: CODE_PLAIN},
  ],
  [{text: '});', color: CODE_PLAIN}],
  [],
  [{text: '// Writes merge conflict-free, even offline', color: CODE_COMMENT}],
  [
    {text: 'await', color: CODE_KEYWORD},
    {text: ' relay.update', color: CODE_FUNCTION},
    {text: '(', color: CODE_PLAIN},
    {text: "'customers/1042'", color: CODE_STRING},
    {text: ', { plan: ', color: CODE_PLAIN},
    {text: "'scale'", color: CODE_STRING},
    {text: ' });', color: CODE_PLAIN},
  ],
];

const CURL_SNIPPET: readonly CodeLine[] = [
  [{text: '# Read a record with its audit trail inline', color: CODE_COMMENT}],
  [
    {text: 'curl', color: CODE_FUNCTION},
    {text: ' https://api.relay.dev/v1/customers/1042 \\', color: CODE_PLAIN},
  ],
  [
    {text: '  -H ', color: CODE_PLAIN},
    {text: '"Authorization: Bearer $RELAY_TOKEN"', color: CODE_STRING},
    {text: ' \\', color: CODE_PLAIN},
  ],
  [
    {text: '  -H ', color: CODE_PLAIN},
    {text: '"Relay-Include: audit"', color: CODE_STRING},
  ],
  [],
  [{text: '# Update — the merge happens server-side', color: CODE_COMMENT}],
  [
    {text: 'curl', color: CODE_FUNCTION},
    {text: ' -X PATCH https://api.relay.dev/v1/customers/1042 \\', color: CODE_PLAIN},
  ],
  [
    {text: '  -H ', color: CODE_PLAIN},
    {text: '"Authorization: Bearer $RELAY_TOKEN"', color: CODE_STRING},
    {text: ' \\', color: CODE_PLAIN},
  ],
  [
    {text: '  -d ', color: CODE_PLAIN},
    {text: '\'{"plan": "scale"}\'', color: CODE_STRING},
  ],
];

/** Plain-text form of each snippet for the copy button. */
function snippetToText(lines: readonly CodeLine[]): string {
  return lines
    .map(line => line.map(segment => segment.text).join(''))
    .join('\n');
}

const SPOTLIGHT_BULLETS: readonly string[] = [
  'Generated SDKs for TypeScript, Python, and Go',
  'Streaming subscriptions over one WebSocket',
  'Signed webhooks with a 24-hour retry curve',
];

// ============= HELPERS =============

/**
 * True once the node has intersected the viewport (30% visible). Falls
 * back to visible when IntersectionObserver is unavailable so rows never
 * stay hidden in static environments.
 */
function useInView(): [RefObject<HTMLDivElement | null>, boolean] {
  const ref = useRef<HTMLDivElement | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) {
      return;
    }
    if (typeof IntersectionObserver === 'undefined') {
      setInView(true);
      return;
    }
    const observer = new IntersectionObserver(
      entries => {
        if (entries.some(entry => entry.isIntersecting)) {
          setInView(true);
          observer.disconnect();
        }
      },
      {threshold: 0.3},
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return [ref, inView];
}

/** True when the OS asks for reduced motion; reveals then render static. */
function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) {
      return;
    }
    const query = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReduced(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReduced(event.matches);
    query.addEventListener('change', onChange);
    return () => query.removeEventListener('change', onChange);
  }, []);
  return reduced;
}

// ============= SMALL PIECES =============

/** Section header: variant Token + title + supporting copy + actions. */
function SectionHeader({
  section,
  actions,
}: {
  section: SectionMeta;
  actions?: ReactNode;
}) {
  return (
    <HStack gap={3} vAlign="start" wrap="wrap">
      <StackItem size="fill">
        <VStack gap={1}>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <Heading level={2}>{section.title}</Heading>
            <Token
              label={`Variant — ${section.label}`}
              size="sm"
              color={section.tokenColor}
            />
          </HStack>
          <Text type="supporting" color="secondary">
            {section.description}
          </Text>
        </VStack>
      </StackItem>
      {actions}
    </HStack>
  );
}

/** Tinted rounded disc holding a feature icon. */
function FeatureIcon({
  icon,
  background,
  color,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  background: string;
  color: string;
}) {
  return (
    <div style={{...styles.featureIconDisc, backgroundColor: background, color}}>
      <Icon icon={icon} size="sm" color="inherit" />
    </div>
  );
}

/** Sync schematic: two app nodes linked through a Relay node. */
function SyncMock() {
  return (
    <div
      style={styles.mockPanel}
      role="img"
      aria-label="Schematic of two apps syncing through Relay">
      <div aria-hidden style={{display: 'flex', gap: 10, alignItems: 'stretch'}}>
        <div style={styles.mockNode}>
          <div style={{...styles.mockBarAccent, width: '55%'}} />
          <div style={{...styles.mockBar, width: '90%'}} />
          <div style={{...styles.mockBar, width: '72%'}} />
        </div>
        <div style={styles.mockLinkRail}>
          <Icon icon={RefreshCwIcon} size="sm" color="inherit" />
        </div>
        <div style={styles.mockNode}>
          <div style={{...styles.mockBarAccent, width: '55%'}} />
          <div style={{...styles.mockBar, width: '90%'}} />
          <div style={{...styles.mockBar, width: '72%'}} />
        </div>
      </div>
      <div aria-hidden style={styles.mockLogRow}>
        <span style={{...styles.mockLogDot, backgroundColor: ACCENT_GREEN}} />
        customers/1042 · merged 2 fields · 184ms
      </div>
    </div>
  );
}

/** Audit schematic: a short stack of ledger rows. */
function AuditMock() {
  return (
    <div
      style={styles.mockPanel}
      role="img"
      aria-label="Schematic of the Relay audit ledger">
      <div aria-hidden style={{display: 'flex', flexDirection: 'column', gap: 6}}>
        {AUDIT_LOG_ROWS.slice(0, 4).map(row => (
          <div key={row.action} style={styles.mockLogRow}>
            <span
              style={{...styles.mockLogDot, backgroundColor: row.dotColor}}
            />
            <strong style={{color: 'var(--color-text)', fontWeight: 600}}>
              {row.actor}
            </strong>{' '}
            {row.action}
          </div>
        ))}
      </div>
    </div>
  );
}

/** Roles schematic: a permission matrix with check/blank cells. */
function RolesMock() {
  return (
    <div
      style={styles.mockPanel}
      role="img"
      aria-label="Schematic of a Relay role permission matrix">
      <div aria-hidden style={styles.mockMatrix}>
        <span style={styles.mockMatrixHead}>Collection</span>
        {ROLE_MATRIX.columns.map(column => (
          <span
            key={column}
            style={{...styles.mockMatrixHead, textAlign: 'center'}}>
            {column}
          </span>
        ))}
        {ROLE_MATRIX.rows.map(row => (
          <Fragment key={row.label}>
            <span style={styles.mockMatrixLabel}>{row.label}</span>
            {row.grants.map((granted, index) => (
              <span
                key={`${row.label}-${ROLE_MATRIX.columns[index]}`}
                style={{
                  ...styles.mockMatrixCell,
                  ...(granted
                    ? {
                        backgroundColor:
                          'light-dark(rgba(34, 197, 94, 0.12), rgba(74, 222, 128, 0.16))',
                        color: ACCENT_GREEN,
                      }
                    : {color: 'var(--color-border)'}),
                }}>
                {granted ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : '—'}
              </span>
            ))}
          </Fragment>
        ))}
      </div>
    </div>
  );
}

const ALT_MOCKS: Record<AltMockKind, ComponentType> = {
  sync: SyncMock,
  audit: AuditMock,
  roles: RolesMock,
};

/** One alternating row with the scroll-reveal treatment applied. */
function AlternatingRow({
  row,
  isReversed,
  isStacked,
  reduceMotion,
  onCta,
}: {
  row: AltRow;
  isReversed: boolean;
  isStacked: boolean;
  reduceMotion: boolean;
  onCta: (message: string) => void;
}) {
  const [ref, inView] = useInView();
  const isVisible = reduceMotion || inView;
  const Mock = ALT_MOCKS[row.mock];

  return (
    <div
      ref={ref}
      style={{
        ...styles.altRow,
        ...(isReversed && !isStacked ? styles.altRowReversed : null),
        ...(isStacked ? styles.altRowStacked : null),
        ...(reduceMotion ? null : styles.altReveal),
        ...(isVisible && !reduceMotion ? styles.altRevealVisible : null),
      }}>
      <div style={styles.altRowHalf}>
        <VStack gap={3}>
          <Token label={row.kicker} size="sm" color="blue" />
          <Heading level={3}>{row.title}</Heading>
          <Text type="body" color="secondary">
            {row.body}
          </Text>
          <VStack gap={1}>
            {row.bullets.map(bullet => (
              <HStack key={bullet} gap={2} vAlign="center">
                <Icon icon={CheckIcon} size="xsm" color="success" />
                <Text size="sm">{bullet}</Text>
              </HStack>
            ))}
          </VStack>
          <HStack gap={2} wrap="wrap">
            <Button
              label={row.cta}
              variant="secondary"
              icon={<Icon icon={ArrowRightIcon} size="sm" color="inherit" />}
              onClick={() =>
                onCta(`Alternating rows — ${row.cta} clicked.`)
              }
            />
          </HStack>
        </VStack>
      </div>
      <div style={styles.altRowHalf}>
        <Mock />
      </div>
    </div>
  );
}

/** Browser-chrome screenshot panel; the body swaps with the active tab. */
function ScreenshotPanel({tab}: {tab: ScreenshotTab}) {
  return (
    <div
      style={styles.screenshotWindow}
      role="img"
      aria-label={
        tab === 'overview'
          ? 'Stylized screenshot of the Relay overview dashboard'
          : 'Stylized screenshot of the Relay audit trail'
      }>
      <div aria-hidden style={styles.screenshotChrome}>
        <span
          style={{
            ...styles.screenshotDot,
            backgroundColor: 'light-dark(#F87171, #FCA5A5)',
          }}
        />
        <span
          style={{
            ...styles.screenshotDot,
            backgroundColor: 'light-dark(#FBBF24, #FCD34D)',
          }}
        />
        <span
          style={{
            ...styles.screenshotDot,
            backgroundColor: 'light-dark(#34D399, #6EE7B7)',
          }}
        />
        <span style={styles.screenshotUrl}>
          {tab === 'overview'
            ? 'relay.dev/app/overview'
            : 'relay.dev/app/audit'}
        </span>
      </div>
      <div aria-hidden style={styles.screenshotBody}>
        {tab === 'overview' ? (
          <>
            <div style={styles.screenshotHero} />
            <div style={{...styles.mockBar, width: '58%'}} />
            <div style={styles.screenshotCards}>
              <div style={styles.screenshotCard} />
              <div style={styles.screenshotCard} />
              <div style={styles.screenshotCard} />
            </div>
            <div style={{...styles.mockBar, width: '42%'}} />
          </>
        ) : (
          <>
            <div style={{...styles.mockBar, width: '36%'}} />
            {AUDIT_LOG_ROWS.map(row => (
              <div key={row.action} style={styles.mockLogRow}>
                <span
                  style={{...styles.mockLogDot, backgroundColor: row.dotColor}}
                />
                <strong style={{color: 'var(--color-text)', fontWeight: 600}}>
                  {row.actor}
                </strong>{' '}
                {row.action}
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}

/** Codeblock-style card: header tabs + copy, numbered syntax-tinted lines. */
function CodeCard({
  tab,
  isCopied,
  onTabChange,
  onCopy,
}: {
  tab: CodeTab;
  isCopied: boolean;
  onTabChange: (tab: CodeTab) => void;
  onCopy: () => void;
}) {
  const lines = tab === 'ts' ? TS_SNIPPET : CURL_SNIPPET;
  return (
    <div style={styles.codeCard}>
      <div style={styles.codeCardHeader}>
        <button
          type="button"
          style={{
            ...styles.codeTabButton,
            ...(tab === 'ts' ? styles.codeTabButtonActive : null),
          }}
          aria-pressed={tab === 'ts'}
          onClick={() => onTabChange('ts')}>
          TypeScript
        </button>
        <button
          type="button"
          style={{
            ...styles.codeTabButton,
            ...(tab === 'curl' ? styles.codeTabButtonActive : null),
          }}
          aria-pressed={tab === 'curl'}
          onClick={() => onTabChange('curl')}>
          cURL
        </button>
        <span style={{flex: '1 1 0'}} />
        <Button
          label={isCopied ? 'Copied' : 'Copy snippet'}
          variant="ghost"
          size="sm"
          icon={
            <Icon
              icon={isCopied ? CheckIcon : ClipboardCopyIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={onCopy}
        />
      </div>
      <pre style={styles.codeBody} tabIndex={0} aria-label="Code sample">
        {lines.map((line, lineIndex) => (
          <span key={`${tab}-${lineIndex}`}>
            <span style={styles.codeLineNumber}>{lineIndex + 1}</span>
            {line.map((segment, segmentIndex) => (
              <span
                key={`${tab}-${lineIndex}-${segmentIndex}`}
                style={{color: segment.color}}>
                {segment.text}
              </span>
            ))}
            {'\n'}
          </span>
        ))}
      </pre>
    </div>
  );
}

// ============= PAGE =============

export default function MarketingFeatureSectionsTemplate() {
  // ---- variant switcher: 'all' stacks everything; else isolate one ----
  const [activeSection, setActiveSection] = useState<SectionId>('all');

  // ---- variant 1: expanded icon-grid cards ----
  const [openFeatures, setOpenFeatures] = useState<Record<string, boolean>>(
    {},
  );

  // ---- variant 2: reveal replay token (remounts the rows) ----
  const [revealToken, setRevealToken] = useState(0);

  // ---- variant 3: screenshot panel tab ----
  const [screenshotTab, setScreenshotTab] = useState<ScreenshotTab>('overview');

  // ---- variant 4: code card tab + copied state ----
  const [codeTab, setCodeTab] = useState<CodeTab>('ts');
  const [isCopied, setIsCopied] = useState(false);

  // ---- toast: keyed so back-to-back clicks re-announce ----
  const [toast, setToast] = useState<{key: number; message: string} | null>(
    null,
  );

  // Responsive contract: <=900px stacks rows/spotlight and drops the grid
  // to 2 columns; <=640px goes single column and steps headlines down.
  const isStacked = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');
  const reduceMotion = usePrefersReducedMotion();

  // ---- derived ----
  const openCount = GRID_FEATURES.filter(
    feature => openFeatures[feature.id],
  ).length;
  const allOpen = openCount === GRID_FEATURES.length;
  const showSection = (id: Exclude<SectionId, 'all'>) =>
    activeSection === 'all' || activeSection === id;

  // ---- interactions ----
  const fireToast = (message: string) => {
    setToast(previous => ({key: (previous?.key ?? 0) + 1, message}));
  };

  const toggleFeature = (id: string) => {
    setOpenFeatures(previous => ({...previous, [id]: !previous[id]}));
  };

  const setAllFeatures = (open: boolean) => {
    const next: Record<string, boolean> = {};
    for (const feature of GRID_FEATURES) {
      next[feature.id] = open;
    }
    setOpenFeatures(next);
  };

  const replayReveal = () => {
    setRevealToken(previous => previous + 1);
    fireToast('Alternating rows — reveal replayed; scroll to watch it run.');
  };

  const changeCodeTab = (tab: CodeTab) => {
    setCodeTab(tab);
    setIsCopied(false);
  };

  const copySnippet = () => {
    const text = snippetToText(codeTab === 'ts' ? TS_SNIPPET : CURL_SNIPPET);
    if (
      typeof navigator !== 'undefined' &&
      navigator.clipboard !== undefined
    ) {
      void navigator.clipboard.writeText(text).catch(() => undefined);
    }
    setIsCopied(true);
    fireToast(
      `Feature spotlight — ${codeTab === 'ts' ? 'TypeScript' : 'cURL'} snippet copied.`,
    );
  };

  // ============= SECTIONS =============

  const sectionMeta = (id: Exclude<SectionId, 'all'>): SectionMeta =>
    SECTIONS.find(section => section.id === id) as SectionMeta;

  // ---- variant 1: 3-column icon grid, expandable cards ----
  const iconGridSection = (
    <VStack gap={4}>
      <SectionHeader
        section={sectionMeta('grid')}
        actions={
          <HStack gap={2} wrap="wrap">
            <Button
              label="Expand all"
              variant="secondary"
              size="sm"
              isDisabled={allOpen}
              onClick={() => setAllFeatures(true)}
            />
            <Button
              label="Collapse all"
              variant="secondary"
              size="sm"
              isDisabled={openCount === 0}
              onClick={() => setAllFeatures(false)}
            />
          </HStack>
        }
      />
      <div
        style={{
          ...styles.featureGrid,
          ...(isStacked && !isPhone ? styles.featureGridTwoCol : null),
          ...(isPhone ? styles.featureGridOneCol : null),
        }}>
        {GRID_FEATURES.map(feature => {
          const isOpen = openFeatures[feature.id] === true;
          return (
            <button
              key={feature.id}
              type="button"
              aria-expanded={isOpen}
              onClick={() => toggleFeature(feature.id)}
              style={{
                ...styles.featureCard,
                ...(isOpen ? styles.featureCardOpen : null),
              }}>
              <HStack gap={3} vAlign="center">
                <FeatureIcon
                  icon={feature.icon}
                  background={feature.iconBg}
                  color={feature.iconColor}
                />
                <Text weight="semibold">{feature.title}</Text>
                <span
                  aria-hidden
                  style={{
                    ...styles.featureChevron,
                    ...(isOpen ? styles.featureChevronOpen : null),
                  }}>
                  <Icon icon={ChevronDownIcon} size="sm" color="inherit" />
                </span>
              </HStack>
              <Text type="supporting" color="secondary">
                {feature.blurb}
              </Text>
              {isOpen && (
                <>
                  <Divider />
                  <Text size="sm" color="secondary">
                    {feature.detail}
                  </Text>
                </>
              )}
            </button>
          );
        })}
      </div>
    </VStack>
  );

  // ---- variant 2: alternating rows with scroll reveal ----
  const alternatingSection = (
    <VStack gap={5}>
      <SectionHeader
        section={sectionMeta('rows')}
        actions={
          <Button
            label="Replay reveal"
            variant="secondary"
            size="sm"
            icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
            onClick={replayReveal}
          />
        }
      />
      {ALT_ROWS.map((row, index) => (
        <AlternatingRow
          key={`${row.id}-${revealToken}`}
          row={row}
          isReversed={index % 2 === 1}
          isStacked={isStacked}
          reduceMotion={reduceMotion}
          onCta={fireToast}
        />
      ))}
    </VStack>
  );

  // ---- variant 3: centered 2x2 grid + screenshot panel ----
  const centeredSection = (
    <VStack gap={4}>
      <SectionHeader section={sectionMeta('centered')} />
      <Card padding={isPhone ? 4 : 6}>
        <VStack gap={5}>
          <div style={styles.centeredHeader}>
            <Token label="Platform" size="sm" color="green" />
            <h3
              style={{
                ...styles.headline,
                ...(isPhone ? styles.headlineCompact : null),
              }}>
              The boring parts, already handled
            </h3>
            <Text type="supporting" color="secondary">
              Relay ships the platform features your team would otherwise
              spend a quarter building — and keeps the receipts.
            </Text>
          </div>
          <div
            style={{
              ...styles.centeredGrid,
              ...(isPhone ? styles.centeredGridOneCol : null),
            }}>
            {CENTERED_FEATURES.map(feature => (
              <div key={feature.id} style={styles.centeredItem}>
                <FeatureIcon
                  icon={feature.icon}
                  background={feature.iconBg}
                  color={feature.iconColor}
                />
                <VStack gap={1}>
                  <Text weight="semibold">{feature.title}</Text>
                  <Text type="supporting" color="secondary">
                    {feature.body}
                  </Text>
                </VStack>
              </div>
            ))}
          </div>
          <VStack gap={3}>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <SegmentedControl
                label="Screenshot panel view"
                value={screenshotTab}
                onChange={value => setScreenshotTab(value as ScreenshotTab)}
                size="sm">
                <SegmentedControlItem label="Overview" value="overview" />
                <SegmentedControlItem label="Audit trail" value="audit" />
              </SegmentedControl>
              <StackItem size="fill">
                <span />
              </StackItem>
              <Button
                label="Watch the tour"
                variant="ghost"
                size="sm"
                icon={<Icon icon={PlayIcon} size="sm" color="inherit" />}
                onClick={() =>
                  fireToast('Centered grid — Watch the tour clicked.')
                }
              />
            </HStack>
            <ScreenshotPanel tab={screenshotTab} />
          </VStack>
        </VStack>
      </Card>
    </VStack>
  );

  // ---- variant 4: dark spotlight with offset code card ----
  const spotlightSection = (
    <VStack gap={4}>
      <SectionHeader section={sectionMeta('spotlight')} />
      <div
        style={{
          ...styles.spotlight,
          ...(isPhone ? styles.spotlightCompact : null),
          // Leave headroom for the offset card rising out of the panel.
          ...(isStacked ? null : {marginTop: 40}),
        }}>
        <div aria-hidden style={styles.spotlightRing} />
        <div
          style={{
            ...styles.spotlightRow,
            ...(isStacked ? styles.spotlightRowStacked : null),
          }}>
          <div style={styles.spotlightCopy}>
            <span style={styles.chip}>
              <Icon icon={TerminalIcon} size="xsm" color="inherit" />
              Feature spotlight — Relay API
            </span>
            <h3
              style={{
                ...styles.headline,
                ...(isPhone ? styles.headlineCompact : null),
              }}>
              Your schema, typed end to end
            </h3>
            <p style={styles.darkSubcopy}>
              Publish a schema once and Relay generates the clients, the
              docs, and the audit hooks. Subscribe to changes over one
              socket and write back with server-side merge.
            </p>
            <VStack gap={1}>
              {SPOTLIGHT_BULLETS.map(bullet => (
                <span key={bullet} style={styles.spotlightBullet}>
                  <Icon icon={ShieldCheckIcon} size="xsm" color="inherit" />
                  {bullet}
                </span>
              ))}
            </VStack>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <Button
                label="Read the API docs"
                variant="primary"
                icon={<Icon icon={BookOpenIcon} size="sm" color="inherit" />}
                onClick={() =>
                  fireToast('Feature spotlight — Read the API docs clicked.')
                }
              />
              <Button
                label="Get an API key"
                variant="secondary"
                onClick={() =>
                  fireToast('Feature spotlight — Get an API key clicked.')
                }
              />
            </HStack>
          </div>
          <div
            style={{
              ...styles.spotlightCodeWrap,
              ...(isStacked ? null : styles.spotlightCodeOffset),
            }}>
            <CodeCard
              tab={codeTab}
              isCopied={isCopied}
              onTabChange={changeCodeTab}
              onCopy={copySnippet}
            />
          </div>
        </div>
      </div>
    </VStack>
  );

  const isolationNote = activeSection !== 'all' && (
    <div style={styles.isolationNote}>
      <Icon icon={ZapIcon} size="sm" color="secondary" />
      <Text type="supporting" color="secondary">
        Isolated for copy-ready viewing — the other three variants are
        hidden. Switch back to All in the header to stack every section.
      </Text>
    </div>
  );

  // ============= FRAME =============

  return (
    <>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider role="banner">
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size="fill">
                <VStack gap={0}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Heading level={1}>Feature section showcase</Heading>
                    <Badge variant="info" label="4 variants" />
                  </HStack>
                  <Text type="supporting" color="secondary">
                    Four feature-section treatments for Relay — stack them
                    all or isolate one for copy-ready viewing.
                  </Text>
                </VStack>
              </StackItem>
              <SegmentedControl
                label="Feature section variant"
                value={activeSection}
                onChange={value => setActiveSection(value as SectionId)}
                size="sm">
                <SegmentedControlItem label="All" value="all" />
                {SECTIONS.map(section => (
                  <SegmentedControlItem
                    key={section.id}
                    label={section.label}
                    value={section.id}
                  />
                ))}
              </SegmentedControl>
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent
            padding={0}
            role="main"
            label="Feature section showcase">
            <div
              style={{
                ...styles.column,
                ...(isPhone ? styles.columnCompact : null),
              }}>
              {isolationNote}

              {showSection('grid') && iconGridSection}
              {showSection('grid') && activeSection === 'all' && <Divider />}

              {showSection('rows') && alternatingSection}
              {showSection('rows') && activeSection === 'all' && <Divider />}

              {showSection('centered') && centeredSection}
              {showSection('centered') && activeSection === 'all' && (
                <Divider />
              )}

              {showSection('spotlight') && spotlightSection}
            </div>
          </LayoutContent>
        }
      />

      {/* Interaction receipt toast: keyed so repeat clicks re-announce. */}
      {toast !== null && (
        <div style={styles.toastWrap}>
          <Toast
            key={toast.key}
            type="info"
            isAutoHide={false}
            autoHideDuration={6000}
            onDismiss={() => setToast(null)}
            body={<Text weight="semibold">{toast.message}</Text>}
          />
        </div>
      )}
    </>
  );
}
