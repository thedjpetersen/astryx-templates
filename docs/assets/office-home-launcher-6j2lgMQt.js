var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only: the Kestrel Labs workspace anchored to
 *   Tuesday 2026-07-14 ~9:41 AM — six suite apps (Docs / Sheets / Slides /
 *   Meet / Mail / Drive) with brand tints and one unread-count badge (Mail,
 *   12), eight Atlas-Q3 recent files with per-app preview art and fixed
 *   last-edited labels, three meetings for the day (the 9:30 standup pinned
 *   live), seven start-a-new-file gallery templates, five seeded recent
 *   search queries, and a storage breakdown whose per-app GB figures sum to
 *   the 38.4 / 100 GB meter. All timestamps are fixed ISO strings — no
 *   Date.now(), Math.random(), or network assets.
 * @output Productivity-suite home / app launcher ("suite front door"): a
 *   64px top nav (grid brand mark, centered 640px global search TextInput
 *   with a recent-queries + quick-open dropdown rendered open, help /
 *   settings IconButtons, Priya Raman Avatar), a greeting row, a six-tile
 *   app launcher grid of ClickableCards with brand-tinted glyph squares
 *   (corner unread Badge on Mail, live dot on Meet), an upcoming-meetings
 *   strip with per-meeting AvatarGroups and Join buttons (the live standup
 *   gets a success Badge and primary Join that flips to "In call"), a
 *   "Jump back in" recent-files rail filtered by a SegmentedControl
 *   (All / Docs / Sheets / Slides) whose cards carry per-app preview art,
 *   editor metadata, star toggles, and a MoreMenu with a working "Remove
 *   from recents", a "Start a new file" templates gallery row with a
 *   selection outline + Create action, and a storage meter Card with a
 *   stacked per-app usage bar and a right-aligned tabular legend.
 * @position Page template; emitted by \`astryx template office-home-launcher\`
 *
 * Frame: root 100dvh div (demo stage auto-height guard) around Layout
 * height="fill". LayoutHeader is the 64px nav row (brand 220px zone, search
 * flexes to 640px max, actions right); LayoutContent scrolls one centered
 * 1160px column of stacked full-width sections: greeting, app grid
 * (6 columns), meetings strip (3 columns), recent-files rail (horizontal
 * scroll, 248px cards), templates rail (horizontal scroll, 196px cards),
 * storage Card. The search dropdown is an absolutely positioned panel
 * (zIndex 40) anchored to the search wrapper inside the header — it is
 * rendered open on load and closes on outside mousedown or Escape.
 *
 * Responsive contract:
 * - >900px: 6-column app grid, 3-across meetings strip, Kbd "mod+k" hint in
 *   the search field (hidden while a query is typed, so it never collides
 *   with the clear affordance), brand wordmark visible.
 * - <=900px: brand collapses to the glyph, the Kbd hint hides, the app grid
 *   drops to 3 columns, the meetings strip stacks vertically, and both
 *   rails keep fixed card widths and scroll horizontally.
 * - The dropdown always spans exactly the search wrapper width; rails
 *   scroll with plain overflow-x (no mask fades — see footgun list).
 *
 * Container policy (suite-home launcher archetype): frame-first chrome —
 * sections are plain rows on the page body. ClickableCard is used for the
 * genuinely clickable launch tiles (apps, recent files, gallery templates,
 * per kanban-board precedent); the storage meter is the only static Card
 * (summary widget). Meetings are bordered rows, not Cards.
 *
 * Color policy: no scheme-locked surfaces — the whole page is token-pure.
 * App brand tints (glyph foreground + tile wash + preview art + storage
 * segments) are intentional literals written as light-dark() pairs, with
 * the categorical data-viz tokens (+ repo-standard fallbacks) used where a
 * hue matches (Docs blue, Sheets green, Slides orange, Meet teal, Drive
 * purple); Mail red is a plain light-dark literal since no categorical red
 * token exists. Dark halves sit at the lighter 400-weight hue for AA.
 */

import {useMemo, useState, type CSSProperties, type ReactNode} from 'react';

import {
  ArrowRightIcon,
  CalendarIcon,
  ClockIcon,
  FileTextIcon,
  HardDriveIcon,
  HelpCircleIcon,
  HistoryIcon,
  LayoutGridIcon,
  MailIcon,
  PenLineIcon,
  PlusIcon,
  PresentationIcon,
  SearchIcon,
  SettingsIcon,
  Share2Icon,
  StarIcon,
  Table2Icon,
  VideoIcon,
  XIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {AvatarGroup} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {ClickableCard} from '@astryxdesign/core/ClickableCard';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TextInput} from '@astryxdesign/core/TextInput';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// FIXTURES — one deterministic Kestrel Labs workspace, Tue 2026-07-14.
// ---------------------------------------------------------------------------

type AppId = 'docs' | 'sheets' | 'slides' | 'meet' | 'mail' | 'drive';

const CURRENT_USER = 'Priya Raman';

/**
 * Brand tints per app. Foreground pairs reuse the repo-standard categorical
 * fallback values where the hue matches; Mail red is a plain literal pair
 * (no categorical red token exists). Wash pairs are low-chroma tile fills
 * that keep AA contrast for the glyph in both schemes.
 */
const APP_TINT: Record<AppId, {fg: string; wash: string}> = {
  docs: {
    fg: 'var(--color-data-categorical-blue, light-dark(#0171E3, #4C9EFF))',
    wash: 'light-dark(#E5F0FD, #142A44)',
  },
  sheets: {
    fg: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
    wash: 'light-dark(#E4F6E7, #10301A)',
  },
  slides: {
    fg: 'var(--color-data-categorical-orange, light-dark(#EB6E00, #FF9330))',
    wash: 'light-dark(#FDEEDE, #38220D)',
  },
  meet: {
    fg: 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))',
    wash: 'light-dark(#E0F3F5, #0D2B2F)',
  },
  mail: {
    fg: 'light-dark(#D92D20, #F87171)',
    wash: 'light-dark(#FDE9E6, #391716)',
  },
  drive: {
    fg: 'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))',
    wash: 'light-dark(#EFE7FE, #241345)',
  },
};

interface SuiteApp {
  id: AppId;
  name: string;
  tagline: string;
  icon: typeof FileTextIcon;
  /** Corner badge on the glyph square (Mail unread count). */
  unreadCount?: number;
  /** Small live dot on the glyph square (Meet while the standup is on). */
  isLive?: boolean;
}

const SUITE_APPS: readonly SuiteApp[] = [
  {id: 'docs', name: 'Docs', tagline: 'Write & review', icon: FileTextIcon},
  {id: 'sheets', name: 'Sheets', tagline: 'Model & track', icon: Table2Icon},
  {
    id: 'slides',
    name: 'Slides',
    tagline: 'Present & pitch',
    icon: PresentationIcon,
  },
  {id: 'meet', name: 'Meet', tagline: 'Call & huddle', icon: VideoIcon, isLive: true},
  {id: 'mail', name: 'Mail', tagline: 'Inbox & send', icon: MailIcon, unreadCount: 12},
  {id: 'drive', name: 'Drive', tagline: 'Store & share', icon: HardDriveIcon},
];

interface RecentFile {
  id: string;
  title: string;
  app: Extract<AppId, 'docs' | 'sheets' | 'slides'>;
  /** e.g. "Marcus Webb edited" / "Sofia Ortiz commented". */
  activity: string;
  /** Fixed display label derived from the ISO stamp below. */
  whenLabel: string;
  editedIso: string;
  isStarred: boolean;
}

/** Newest-first; every file orbits the Atlas Q3 launch program. */
const RECENT_FILES: readonly RecentFile[] = [
  {
    id: 'file-launch-brief',
    title: 'Atlas Q3 Launch Brief',
    app: 'docs',
    activity: 'Marcus Webb edited',
    whenLabel: '24 min ago',
    editedIso: '2026-07-14T09:17:00-07:00',
    isStarred: true,
  },
  {
    id: 'file-budget-burn',
    title: 'Atlas Q3 Budget & Burn',
    app: 'sheets',
    activity: 'You edited',
    whenLabel: 'Yesterday, 4:42 PM',
    editedIso: '2026-07-13T16:42:00-07:00',
    isStarred: true,
  },
  {
    id: 'file-kickoff-deck',
    title: 'Atlas Kickoff — All-hands deck',
    app: 'slides',
    activity: 'Sofia Ortiz added 4 slides',
    whenLabel: 'Yesterday, 3:05 PM',
    editedIso: '2026-07-13T15:05:00-07:00',
    isStarred: false,
  },
  {
    id: 'file-onboarding-notes',
    title: 'Onboarding flow — design review notes',
    app: 'docs',
    activity: 'Sofia Ortiz commented',
    whenLabel: 'Yesterday, 11:38 AM',
    editedIso: '2026-07-13T11:38:00-07:00',
    isStarred: false,
  },
  {
    id: 'file-okr-tracker',
    title: 'Q3 OKR tracker',
    app: 'sheets',
    activity: 'Jonah Fields edited',
    whenLabel: 'Fri, Jul 10',
    editedIso: '2026-07-10T17:21:00-07:00',
    isStarred: false,
  },
  {
    id: 'file-pricing-onepager',
    title: 'Atlas pricing one-pager',
    app: 'docs',
    activity: 'Dana Whitfield shared with you',
    whenLabel: 'Thu, Jul 9',
    editedIso: '2026-07-09T10:02:00-07:00',
    isStarred: false,
  },
  {
    id: 'file-pricing-review-deck',
    title: 'Pricing review deck',
    app: 'slides',
    activity: 'Dana Whitfield edited',
    whenLabel: 'Wed, Jul 8',
    editedIso: '2026-07-08T14:47:00-07:00',
    isStarred: false,
  },
  {
    id: 'file-comms-plan',
    title: 'Launch-week comms plan',
    app: 'docs',
    activity: 'Dana Whitfield edited',
    whenLabel: 'Tue, Jul 7',
    editedIso: '2026-07-07T16:10:00-07:00',
    isStarred: false,
  },
];

interface Meeting {
  id: string;
  title: string;
  timeLabel: string;
  startIso: string;
  isLive: boolean;
  /** Shown as an AvatarGroup; overflowCount renders as "+N". */
  attendees: readonly string[];
  overflowCount: number;
  organizer: string;
}

/** Tue, Jul 14 2026 — "now" is pinned at 9:41 AM for the whole surface. */
const MEETINGS: readonly Meeting[] = [
  {
    id: 'meet-standup',
    title: 'Atlas Q3 standup',
    timeLabel: '9:30 – 9:45 AM',
    startIso: '2026-07-14T09:30:00-07:00',
    isLive: true,
    attendees: ['Priya Raman', 'Marcus Webb', 'Jonah Fields', 'Sofia Ortiz'],
    overflowCount: 0,
    organizer: 'Marcus Webb',
  },
  {
    id: 'meet-design-review',
    title: 'Design review — Atlas onboarding',
    timeLabel: '11:00 AM – 12:00 PM',
    startIso: '2026-07-14T11:00:00-07:00',
    isLive: false,
    attendees: ['Sofia Ortiz', 'Priya Raman', 'Marcus Webb'],
    overflowCount: 0,
    organizer: 'Sofia Ortiz',
  },
  {
    id: 'meet-launch-review',
    title: 'Atlas Q3 launch review',
    timeLabel: '2:00 – 3:00 PM',
    startIso: '2026-07-14T14:00:00-07:00',
    isLive: false,
    attendees: ['Dana Whitfield', 'Priya Raman', 'Marcus Webb', 'Jonah Fields'],
    overflowCount: 4,
    organizer: 'Dana Whitfield',
  },
];

interface GalleryTemplate {
  id: string;
  title: string;
  app: Extract<AppId, 'docs' | 'sheets' | 'slides'>;
  caption: string;
  /** 'blank' renders a plus glyph instead of preview art. */
  kind: 'blank' | 'preview';
}

const GALLERY_TEMPLATES: readonly GalleryTemplate[] = [
  {id: 'tpl-blank', title: 'Blank document', app: 'docs', caption: 'Docs', kind: 'blank'},
  {id: 'tpl-brief', title: 'Project brief', app: 'docs', caption: 'Docs', kind: 'preview'},
  {id: 'tpl-notes', title: 'Meeting notes', app: 'docs', caption: 'Docs', kind: 'preview'},
  {id: 'tpl-budget', title: 'Budget tracker', app: 'sheets', caption: 'Sheets', kind: 'preview'},
  {id: 'tpl-sprint', title: 'Sprint plan', app: 'sheets', caption: 'Sheets', kind: 'preview'},
  {id: 'tpl-pitch', title: 'Pitch deck', app: 'slides', caption: 'Slides', kind: 'preview'},
  {id: 'tpl-update', title: 'Team update deck', app: 'slides', caption: 'Slides', kind: 'preview'},
];

interface RecentQuery {
  id: string;
  query: string;
  scope: string;
}

const RECENT_QUERIES: readonly RecentQuery[] = [
  {id: 'q-budget', query: 'atlas q3 budget', scope: 'Sheets'},
  {id: 'q-kickoff', query: 'kickoff all-hands deck', scope: 'Slides'},
  {id: 'q-onboarding', query: 'onboarding design review', scope: 'Docs'},
  {id: 'q-pricing', query: 'dana pricing one-pager', scope: 'Mail'},
  {id: 'q-okr', query: 'q3 okr tracker', scope: 'Everything'},
];

interface StorageSlice {
  app: AppId;
  label: string;
  gb: number;
}

/** Per-app GB must sum to STORAGE_USED_GB — the meter repeats the total. */
const STORAGE_SLICES: readonly StorageSlice[] = [
  {app: 'drive', label: 'Drive', gb: 21.6},
  {app: 'mail', label: 'Mail', gb: 8.9},
  {app: 'slides', label: 'Slides', gb: 4.2},
  {app: 'sheets', label: 'Sheets', gb: 2.4},
  {app: 'docs', label: 'Docs', gb: 1.3},
];
const STORAGE_USED_GB = 38.4; // 21.6 + 8.9 + 4.2 + 2.4 + 1.3
const STORAGE_TOTAL_GB = 100;

const APP_ICON: Record<AppId, typeof FileTextIcon> = {
  docs: FileTextIcon,
  sheets: Table2Icon,
  slides: PresentationIcon,
  meet: VideoIcon,
  mail: MailIcon,
  drive: HardDriveIcon,
};

const APP_NAME: Record<AppId, string> = {
  docs: 'Docs',
  sheets: 'Sheets',
  slides: 'Slides',
  meet: 'Meet',
  mail: 'Mail',
  drive: 'Drive',
};

// ---------------------------------------------------------------------------
// STYLES — one typed inline record; tokens only, plus intentional
// light-dark() brand-tint literals declared in APP_TINT above.
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Demo stage renders templates in an auto-height container; the root div
  // gives Layout height="fill" a real box (footgun #6).
  root: {
    height: '100dvh',
    width: '100%',
  },
  navRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-4)',
    minHeight: 40,
    width: '100%',
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexShrink: 0,
  },
  brandGlyph: {
    width: 32,
    height: 32,
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-accent)',
    color: 'var(--color-text-on-accent, #FFFFFF)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // Search wrapper anchors the dropdown; flexes toward 640px in the nav.
  searchWrap: {
    position: 'relative',
    flex: 1,
    maxWidth: 640,
    marginInline: 'auto',
  },
  searchKbdHint: {
    position: 'absolute',
    insetBlockStart: '50%',
    insetInlineEnd: 'var(--spacing-3)',
    transform: 'translateY(-50%)',
    pointerEvents: 'none',
  },
  searchDropdown: {
    position: 'absolute',
    insetBlockStart: 'calc(100% + var(--spacing-1))',
    insetInline: 0,
    zIndex: 40,
    backgroundColor: 'var(--color-background-card)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    overflow: 'hidden',
    paddingBlock: 'var(--spacing-2)',
  },
  dropdownHeading: {
    paddingInline: 'var(--spacing-4)',
    paddingBlock: 'var(--spacing-1)',
  },
  dropdownRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    width: '100%',
    paddingBlock: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-4)',
    border: 'none',
    background: 'transparent',
    color: 'inherit',
    font: 'inherit',
    textAlign: 'start',
    cursor: 'pointer',
  },
  dropdownRowHover: {
    backgroundColor: 'var(--color-background-muted)',
  },
  dropdownFooter: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    paddingInline: 'var(--spacing-4)',
    paddingBlockStart: 'var(--spacing-2)',
  },
  navActions: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    flexShrink: 0,
  },
  // Centered 1160px column of stacked sections.
  main: {
    maxWidth: 1160,
    marginInline: 'auto',
    paddingBlock: 'var(--spacing-6)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-7)',
  },
  sectionHead: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
  },
  appGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(6, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  appGridCompact: {
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
  },
  appGlyph: {
    position: 'relative',
    width: 48,
    height: 48,
    borderRadius: 'var(--radius-container)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  // Compact count badge anchored to the glyph corner (footgun #10).
  glyphBadge: {
    position: 'absolute',
    insetBlockStart: -6,
    insetInlineEnd: -8,
  },
  glyphLiveDot: {
    position: 'absolute',
    insetBlockStart: -3,
    insetInlineEnd: -3,
    width: 10,
    height: 10,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))',
    boxShadow: '0 0 0 2px var(--color-background-card)',
  },
  meetingsStrip: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  meetingsStripCompact: {
    gridTemplateColumns: 'minmax(0, 1fr)',
  },
  meetingRow: {
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-4)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background-surface)',
    minWidth: 0,
  },
  meetingRowLive: {
    boxShadow: 'inset 0 0 0 1px var(--color-accent)',
    borderColor: 'var(--color-accent)',
  },
  meetingTime: {
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Horizontal-scroll rails: fixed card widths, deliberate overflow-x
  // (documented in the responsive contract). No mask fades (footgun #11).
  rail: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    overflowX: 'auto',
    paddingBlockEnd: 'var(--spacing-2)',
  },
  fileCard: {
    width: 248,
    flexShrink: 0,
  },
  filePreview: {
    height: 104,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'light-dark(#FFFFFF, #1C1E24)',
  },
  // Docs preview art: a bold "title" bar and faux paragraph lines.
  previewDocPad: {
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  previewTitleBar: {
    height: 8,
    width: '58%',
    borderRadius: 'var(--radius-full)',
  },
  previewLine: {
    height: 4,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-border)',
  },
  // Sheets preview art: hairline cell grid + tinted header row.
  previewGrid: {
    position: 'absolute',
    inset: 0,
    backgroundImage:
      'repeating-linear-gradient(to right, transparent 0 39px, var(--color-border) 39px 40px), ' +
      'repeating-linear-gradient(to bottom, transparent 0 19px, var(--color-border) 19px 20px)',
  },
  previewGridHeader: {
    position: 'absolute',
    insetBlockStart: 0,
    insetInline: 0,
    height: 20,
  },
  // Slides preview art: centered title block on a tinted canvas.
  previewSlide: {
    position: 'absolute',
    inset: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  // Centered so the stacked star + MoreMenu column (taller than the two
  // text lines) balances its extra height instead of leaving dead space
  // below the text with a floating "…" button.
  fileMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  fileAppChip: {
    width: 24,
    height: 24,
    borderRadius: 'var(--radius-control, 6px)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  templateCard: {
    width: 196,
    flexShrink: 0,
  },
  templateArt: {
    height: 88,
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
    position: 'relative',
    backgroundColor: 'light-dark(#FFFFFF, #1C1E24)',
  },
  templateSelected: {
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
  },
  storageBarTrack: {
    display: 'flex',
    height: 8,
    borderRadius: 'var(--radius-full)',
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  storageSeg: {
    height: '100%',
  },
  storageLegend: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-5)',
    flexWrap: 'wrap',
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 'var(--radius-full)',
    flexShrink: 0,
  },
  legendGb: {
    fontVariantNumeric: 'tabular-nums',
    textAlign: 'end',
  },
  emptyRail: {
    border: 'var(--border-width) dashed var(--color-border)',
    borderRadius: 'var(--radius-container)',
    padding: 'var(--spacing-6)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
};

// ---------------------------------------------------------------------------
// PREVIEW ART — deterministic per-app faux-document art (no assets).
// ---------------------------------------------------------------------------

/** Faux paragraph line widths, fixed so the art never shifts. */
const DOC_LINE_WIDTHS = ['92%', '84%', '88%', '61%'] as const;

function PreviewArt({app}: {app: RecentFile['app']}): ReactNode {
  const tint = APP_TINT[app];
  if (app === 'sheets') {
    return (
      <>
        <div style={{...styles.previewGridHeader, backgroundColor: tint.wash}} />
        <div style={styles.previewGrid} />
      </>
    );
  }
  if (app === 'slides') {
    return (
      <div style={{...styles.previewSlide, backgroundColor: tint.wash}}>
        <div
          style={{
            ...styles.previewTitleBar,
            width: '46%',
            backgroundColor: tint.fg,
          }}
        />
        <div style={{...styles.previewLine, width: '30%'}} />
      </div>
    );
  }
  return (
    <div style={styles.previewDocPad}>
      <div style={{...styles.previewTitleBar, backgroundColor: tint.fg}} />
      {DOC_LINE_WIDTHS.map(width => (
        <div key={width} style={{...styles.previewLine, width}} />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// APP TILE
// ---------------------------------------------------------------------------

function AppTile({app}: {app: SuiteApp}): ReactNode {
  const tint = APP_TINT[app.id];
  return (
    <ClickableCard label={\`Open \${app.name}\`} onClick={() => {}} padding={4}>
      <VStack gap={3}>
        <div style={{...styles.appGlyph, backgroundColor: tint.wash}}>
          <span style={{color: tint.fg, display: 'flex'}}>
            <Icon icon={app.icon} size="md" color="inherit" />
          </span>
          {app.unreadCount !== undefined ? (
            <span style={styles.glyphBadge}>
              <Badge label={\`\${app.unreadCount}\`} variant="error" />
            </span>
          ) : null}
          {app.isLive ? (
            <Tooltip content="Atlas Q3 standup is live">
              <span
                style={styles.glyphLiveDot}
                role="img"
                aria-label="A meeting is live"
              />
            </Tooltip>
          ) : null}
        </div>
        <VStack gap={0}>
          <Text type="label">{app.name}</Text>
          <Text type="supporting" color="secondary">
            {app.tagline}
          </Text>
        </VStack>
      </VStack>
    </ClickableCard>
  );
}

// ---------------------------------------------------------------------------
// SEARCH DROPDOWN — recent queries + quick open, rendered open on load.
// ---------------------------------------------------------------------------

interface SearchDropdownProps {
  query: string;
  recents: readonly RecentQuery[];
  matches: readonly RecentFile[];
  onPickQuery: (query: string) => void;
  onRemoveQuery: (id: string) => void;
  onOpenFile: (id: string) => void;
}

function SearchDropdown({
  query,
  recents,
  matches,
  onPickQuery,
  onRemoveQuery,
  onOpenFile,
}: SearchDropdownProps): ReactNode {
  const [hoveredId, setHoveredId] = useState<string | null>(null);
  const rowStyle = (id: string): CSSProperties =>
    hoveredId === id
      ? {...styles.dropdownRow, ...styles.dropdownRowHover}
      : styles.dropdownRow;
  const showRecents = query.length === 0 && recents.length > 0;
  return (
    <div style={styles.searchDropdown} aria-label="Search suggestions">
      {showRecents ? (
        <>
          <div style={styles.dropdownHeading}>
            <Text type="supporting" color="secondary">
              Recent searches
            </Text>
          </div>
          {recents.map(recent => (
            <div
              key={recent.id}
              style={rowStyle(recent.id)}
              onMouseEnter={() => setHoveredId(recent.id)}
              onMouseLeave={() => setHoveredId(null)}>
              <Icon icon={HistoryIcon} size="sm" color="secondary" />
              <StackItem size="fill">
                <button
                  type="button"
                  style={{...styles.dropdownRow, padding: 0, width: '100%'}}
                  onClick={() => onPickQuery(recent.query)}>
                  <Text type="body">{recent.query}</Text>
                </button>
              </StackItem>
              <Badge label={recent.scope} variant="neutral" />
              <IconButton
                label={\`Remove "\${recent.query}" from recent searches\`}
                tooltip="Remove"
                size="sm"
                variant="ghost"
                icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                onClick={() => onRemoveQuery(recent.id)}
              />
            </div>
          ))}
          <Divider />
        </>
      ) : null}
      <div style={styles.dropdownHeading}>
        <Text type="supporting" color="secondary">
          {query.length > 0 ? \`Files matching "\${query}"\` : 'Quick open'}
        </Text>
      </div>
      {matches.length > 0 ? (
        matches.map(file => {
          const tint = APP_TINT[file.app];
          return (
            <button
              key={file.id}
              type="button"
              style={rowStyle(file.id)}
              onMouseEnter={() => setHoveredId(file.id)}
              onMouseLeave={() => setHoveredId(null)}
              onClick={() => onOpenFile(file.id)}>
              <span style={{...styles.fileAppChip, backgroundColor: tint.wash}}>
                <span style={{color: tint.fg, display: 'flex'}}>
                  <Icon icon={APP_ICON[file.app]} size="sm" color="inherit" />
                </span>
              </span>
              <StackItem size="fill">
                <VStack gap={0}>
                  <Text type="body">{file.title}</Text>
                  <Text type="supporting" color="secondary">
                    {APP_NAME[file.app]} · {file.activity} · {file.whenLabel}
                  </Text>
                </VStack>
              </StackItem>
              <Icon icon={ArrowRightIcon} size="sm" color="secondary" />
            </button>
          );
        })
      ) : (
        <div style={styles.dropdownHeading}>
          <Text type="body" color="secondary">
            No files match "{query}" — press Enter to search everything.
          </Text>
        </div>
      )}
      <Divider />
      <div style={styles.dropdownFooter}>
        <Kbd keys="enter" />
        <Text type="supporting" color="secondary">
          to search everything
        </Text>
        <Kbd keys="esc" />
        <Text type="supporting" color="secondary">
          to dismiss
        </Text>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// MEETING CARD
// ---------------------------------------------------------------------------

interface MeetingCardProps {
  meeting: Meeting;
  isJoined: boolean;
  onJoin: (id: string) => void;
}

function MeetingCard({meeting, isJoined, onJoin}: MeetingCardProps): ReactNode {
  const rowStyleValue = meeting.isLive
    ? {...styles.meetingRow, ...styles.meetingRowLive}
    : styles.meetingRow;
  return (
    <div style={rowStyleValue}>
      <HStack gap={2} vAlign="center">
        <Icon icon={ClockIcon} size="sm" color="secondary" />
        <StackItem size="fill">
          <Text type="supporting" color="secondary" style={styles.meetingTime}>
            {meeting.timeLabel}
          </Text>
        </StackItem>
        {meeting.isLive ? (
          <Badge label={isJoined ? 'In call' : 'Live now'} variant="success" />
        ) : null}
      </HStack>
      <VStack gap={1}>
        <Text type="label" maxLines={1}>
          {meeting.title}
        </Text>
        <Text type="supporting" color="secondary" maxLines={1}>
          Organized by {meeting.organizer}
        </Text>
      </VStack>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <HStack gap={2} vAlign="center">
            <AvatarGroup size="xsmall" aria-label={\`\${meeting.title} attendees\`}>
              {meeting.attendees.map(name => (
                <Avatar key={name} name={name} size="xsmall" />
              ))}
            </AvatarGroup>
            {meeting.overflowCount > 0 ? (
              <Text type="supporting" color="secondary">
                +{meeting.overflowCount}
              </Text>
            ) : null}
          </HStack>
        </StackItem>
        <Button
          label={
            meeting.isLive
              ? isJoined
                ? \`Return to \${meeting.title}\`
                : \`Join \${meeting.title} now\`
              : \`Join \${meeting.title}\`
          }
          variant={meeting.isLive && !isJoined ? 'primary' : 'secondary'}
          size="sm"
          icon={<Icon icon={VideoIcon} size="sm" color="inherit" />}
          onClick={() => onJoin(meeting.id)}>
          {meeting.isLive && isJoined ? 'Return' : 'Join'}
        </Button>
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RECENT FILE CARD
// ---------------------------------------------------------------------------

interface RecentFileCardProps {
  file: RecentFile;
  isStarred: boolean;
  onToggleStar: (id: string) => void;
  onRemove: (id: string) => void;
}

function RecentFileCard({
  file,
  isStarred,
  onToggleStar,
  onRemove,
}: RecentFileCardProps): ReactNode {
  const tint = APP_TINT[file.app];
  return (
    <div style={styles.fileCard}>
      <ClickableCard label={\`Open \${file.title}\`} onClick={() => {}} padding={3}>
        <VStack gap={3}>
          <div style={styles.filePreview}>
            <PreviewArt app={file.app} />
          </div>
          <div style={styles.fileMetaRow}>
            <span style={{...styles.fileAppChip, backgroundColor: tint.wash}}>
              <span style={{color: tint.fg, display: 'flex'}}>
                <Icon icon={APP_ICON[file.app]} size="sm" color="inherit" />
              </span>
            </span>
            <StackItem size="fill">
              <VStack gap={0}>
                <Text type="label" maxLines={1}>
                  {file.title}
                </Text>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {file.activity} · {file.whenLabel}
                </Text>
              </VStack>
            </StackItem>
            <VStack gap={1}>
              <IconButton
                label={
                  isStarred
                    ? \`Unstar \${file.title}\`
                    : \`Star \${file.title}\`
                }
                tooltip={isStarred ? 'Unstar' : 'Star'}
                size="sm"
                variant="ghost"
                icon={
                  <Icon
                    icon={StarIcon}
                    size="sm"
                    color={isStarred ? 'warning' : 'secondary'}
                  />
                }
                onClick={() => onToggleStar(file.id)}
              />
              <MoreMenu
                label={\`Options for \${file.title}\`}
                size="sm"
                items={[
                  {label: \`Open in \${APP_NAME[file.app]}\`, icon: APP_ICON[file.app]},
                  {label: 'Share', icon: Share2Icon},
                  {label: 'Rename', icon: PenLineIcon},
                  {type: 'divider'},
                  {
                    label: 'Remove from recents',
                    icon: XIcon,
                    onClick: () => onRemove(file.id),
                  },
                ]}
              />
            </VStack>
          </div>
        </VStack>
      </ClickableCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// TEMPLATE CARD
// ---------------------------------------------------------------------------

interface TemplateCardProps {
  template: GalleryTemplate;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

function TemplateCard({
  template,
  isSelected,
  onSelect,
}: TemplateCardProps): ReactNode {
  const tint = APP_TINT[template.app];
  const artStyle = isSelected
    ? {...styles.templateArt, ...styles.templateSelected}
    : styles.templateArt;
  return (
    <div style={styles.templateCard}>
      <ClickableCard
        label={
          isSelected
            ? \`\${template.title} (selected)\`
            : \`Select the \${template.title} template\`
        }
        onClick={() => onSelect(template.id)}
        padding={3}>
        <VStack gap={3}>
          <div style={artStyle}>
            {template.kind === 'blank' ? (
              <div style={{...styles.previewSlide, backgroundColor: 'transparent'}}>
                <span style={{color: tint.fg, display: 'flex'}}>
                  <Icon icon={PlusIcon} size="lg" color="inherit" />
                </span>
              </div>
            ) : (
              <PreviewArt app={template.app} />
            )}
          </div>
          <VStack gap={0}>
            <Text type="label" maxLines={1}>
              {template.title}
            </Text>
            <Text type="supporting" color="secondary">
              {template.caption}
            </Text>
          </VStack>
        </VStack>
      </ClickableCard>
    </div>
  );
}

// ---------------------------------------------------------------------------
// STORAGE METER — the only static Card on the page (summary widget).
// ---------------------------------------------------------------------------

function StorageCard({isCompact}: {isCompact: boolean}): ReactNode {
  const availableGb = STORAGE_TOTAL_GB - STORAGE_USED_GB;
  return (
    <Card>
      <VStack gap={4}>
        <HStack gap={3} vAlign="center" wrap={isCompact ? 'wrap' : 'nowrap'}>
          <Icon icon={HardDriveIcon} size="md" color="secondary" />
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="label">Storage</Text>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {STORAGE_USED_GB.toFixed(1)} GB of {STORAGE_TOTAL_GB} GB used
              </Text>
            </VStack>
          </StackItem>
          <Button
            label="Manage Kestrel Office storage"
            variant="secondary"
            size="sm"
            onClick={() => {}}>
            Manage storage
          </Button>
        </HStack>
        <div
          style={styles.storageBarTrack}
          role="img"
          aria-label={\`Storage used: \${STORAGE_USED_GB.toFixed(1)} of \${STORAGE_TOTAL_GB} GB\`}>
          {STORAGE_SLICES.map(slice => (
            <div
              key={slice.app}
              style={{
                ...styles.storageSeg,
                width: \`\${(slice.gb / STORAGE_TOTAL_GB) * 100}%\`,
                backgroundColor: APP_TINT[slice.app].fg,
              }}
            />
          ))}
        </div>
        <HStack gap={3} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <div style={styles.storageLegend}>
              {STORAGE_SLICES.map(slice => (
                <HStack key={slice.app} gap={2} vAlign="center">
                  <span
                    style={{
                      ...styles.legendDot,
                      backgroundColor: APP_TINT[slice.app].fg,
                    }}
                  />
                  <Text type="supporting" color="secondary">
                    {slice.label}
                  </Text>
                  <Text type="supporting" hasTabularNumbers style={styles.legendGb}>
                    {slice.gb.toFixed(1)} GB
                  </Text>
                </HStack>
              ))}
            </div>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {availableGb.toFixed(1)} GB available · Shared drives not included
          </Text>
        </HStack>
      </VStack>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

type FileFilter = 'all' | 'docs' | 'sheets' | 'slides';

export default function OfficeHomeLauncherTemplate(): ReactNode {
  const isCompact = useMediaQuery('(max-width: 900px)');

  // Global search: the dropdown is rendered open on load per the surface
  // spec; it closes on outside mousedown / Escape and reopens on focus.
  const [query, setQuery] = useState('');
  const [isSearchOpen, setIsSearchOpen] = useState(true);
  const [recentQueries, setRecentQueries] =
    useState<readonly RecentQuery[]>(RECENT_QUERIES);

  // Jump back in: filter + star + remove-from-recents all mutate view state.
  const [fileFilter, setFileFilter] = useState<FileFilter>('all');
  const [removedFileIds, setRemovedFileIds] = useState<readonly string[]>([]);
  const [starredIds, setStarredIds] = useState<readonly string[]>(() =>
    RECENT_FILES.filter(file => file.isStarred).map(file => file.id),
  );

  const [joinedMeetingId, setJoinedMeetingId] = useState<string | null>(null);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(
    null,
  );

  const visibleFiles = RECENT_FILES.filter(
    file =>
      !removedFileIds.includes(file.id) &&
      (fileFilter === 'all' || file.app === fileFilter),
  );

  const searchMatches = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (needle.length === 0) {
      return RECENT_FILES.slice(0, 4);
    }
    return RECENT_FILES.filter(file =>
      file.title.toLowerCase().includes(needle),
    ).slice(0, 4);
  }, [query]);

  const selectedTemplate =
    GALLERY_TEMPLATES.find(template => template.id === selectedTemplateId) ??
    null;

  const toggleStar = (id: string) => {
    setStarredIds(previous =>
      previous.includes(id)
        ? previous.filter(starred => starred !== id)
        : [...previous, id],
    );
  };

  const header = (
    <LayoutHeader hasDivider>
      <div style={styles.navRow}>
        <div style={styles.brand}>
          <div style={styles.brandGlyph}>
            <Icon icon={LayoutGridIcon} size="sm" color="inherit" />
          </div>
          {isCompact ? null : <Text type="label">Kestrel Office</Text>}
        </div>
        <div
          style={styles.searchWrap}
          onMouseDown={event => event.stopPropagation()}
          onKeyDown={event => {
            if (event.key === 'Escape') {
              setIsSearchOpen(false);
            }
          }}>
          <TextInput
            label="Search Kestrel Office"
            isLabelHidden
            placeholder="Search Docs, Sheets, Slides, Mail, Drive, and people"
            startIcon={<Icon icon={SearchIcon} size="sm" />}
            value={query}
            onChange={value => {
              setQuery(value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            hasClear
          />
          {query.length === 0 && !isCompact ? (
            <span style={styles.searchKbdHint}>
              <Kbd keys="mod+k" />
            </span>
          ) : null}
          {isSearchOpen ? (
            <SearchDropdown
              query={query.trim()}
              recents={recentQueries}
              matches={searchMatches}
              onPickQuery={picked => setQuery(picked)}
              onRemoveQuery={id =>
                setRecentQueries(previous =>
                  previous.filter(recent => recent.id !== id),
                )
              }
              onOpenFile={() => setIsSearchOpen(false)}
            />
          ) : null}
        </div>
        <div style={styles.navActions}>
          <IconButton
            label="Help and keyboard shortcuts"
            tooltip="Help"
            variant="ghost"
            icon={<Icon icon={HelpCircleIcon} size="sm" color="inherit" />}
            onClick={() => {}}
          />
          <IconButton
            label="Workspace settings"
            tooltip="Settings"
            variant="ghost"
            icon={<Icon icon={SettingsIcon} size="sm" color="inherit" />}
            onClick={() => {}}
          />
          <Avatar name={CURRENT_USER} size="small" />
        </div>
      </div>
    </LayoutHeader>
  );

  const appGridStyle = isCompact
    ? {...styles.appGrid, ...styles.appGridCompact}
    : styles.appGrid;
  const meetingsStripStyle = isCompact
    ? {...styles.meetingsStrip, ...styles.meetingsStripCompact}
    : styles.meetingsStrip;

  return (
    <div style={styles.root} onMouseDown={() => setIsSearchOpen(false)}>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent>
            <div style={styles.main}>
              {/* Greeting — counts agree with the fixtures above. */}
              <VStack gap={1}>
                <Heading level={1}>Good morning, Priya</Heading>
                <Text type="supporting" color="secondary">
                  Tuesday, July 14, 2026 · 3 meetings today · 12 unread emails
                </Text>
              </VStack>

              {/* App launcher grid */}
              <div style={appGridStyle}>
                {SUITE_APPS.map(app => (
                  <AppTile key={app.id} app={app} />
                ))}
              </div>

              {/* Upcoming meetings strip */}
              <VStack gap={3}>
                <div style={styles.sectionHead}>
                  <StackItem size="fill">
                    <Heading level={2}>Today&apos;s meetings</Heading>
                  </StackItem>
                  <Button
                    label="Open the Kestrel Office calendar"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={CalendarIcon} size="sm" color="inherit" />}
                    onClick={() => {}}>
                    Open Calendar
                  </Button>
                </div>
                <div style={meetingsStripStyle}>
                  {MEETINGS.map(meeting => (
                    <MeetingCard
                      key={meeting.id}
                      meeting={meeting}
                      isJoined={joinedMeetingId === meeting.id}
                      onJoin={setJoinedMeetingId}
                    />
                  ))}
                </div>
              </VStack>

              {/* Jump back in — recent files rail with a working filter. */}
              <VStack gap={3}>
                <div style={styles.sectionHead}>
                  <StackItem size="fill">
                    <Heading level={2}>Jump back in</Heading>
                  </StackItem>
                  <SegmentedControl
                    label="Filter recent files by app"
                    value={fileFilter}
                    onChange={value => setFileFilter(value as FileFilter)}
                    size="sm">
                    <SegmentedControlItem label="All" value="all" />
                    <SegmentedControlItem label="Docs" value="docs" />
                    <SegmentedControlItem label="Sheets" value="sheets" />
                    <SegmentedControlItem label="Slides" value="slides" />
                  </SegmentedControl>
                </div>
                {visibleFiles.length > 0 ? (
                  <div style={styles.rail}>
                    {visibleFiles.map(file => (
                      <RecentFileCard
                        key={file.id}
                        file={file}
                        isStarred={starredIds.includes(file.id)}
                        onToggleStar={toggleStar}
                        onRemove={id =>
                          setRemovedFileIds(previous => [...previous, id])
                        }
                      />
                    ))}
                  </div>
                ) : (
                  <div style={styles.emptyRail}>
                    <Text type="body" color="secondary">
                      Nothing recent here — files you open will show up in
                      this rail.
                    </Text>
                  </div>
                )}
              </VStack>

              {/* Start a new file — templates gallery row */}
              <VStack gap={3}>
                <div style={styles.sectionHead}>
                  <StackItem size="fill">
                    <Heading level={2}>Start a new file</Heading>
                  </StackItem>
                  {selectedTemplate ? (
                    <Button
                      label={\`Create a new \${selectedTemplate.title}\`}
                      variant="primary"
                      size="sm"
                      icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
                      onClick={() => {}}>
                      Create {selectedTemplate.title}
                    </Button>
                  ) : (
                    <Text type="supporting" color="secondary">
                      Pick a template to create
                    </Text>
                  )}
                </div>
                <div style={styles.rail}>
                  {GALLERY_TEMPLATES.map(template => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      isSelected={selectedTemplateId === template.id}
                      onSelect={id =>
                        setSelectedTemplateId(previous =>
                          previous === id ? null : id,
                        )
                      }
                    />
                  ))}
                </div>
              </VStack>

              {/* Storage meter */}
              <StorageCard isCompact={isCompact} />
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};