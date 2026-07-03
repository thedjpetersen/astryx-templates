var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one event — 'Northbeam Product Summit
 *   2026' on Thursday July 23 2026 at The Foundry, San Francisco — with fixed
 *   base response counts going 47 / maybe 12 / cannot go 5 against a
 *   180-seat capacity, 10 named attendees, a 7-session agenda with speaker
 *   names and track labels, venue facts, and 4 discussion comments with fixed
 *   ISO timestamps between 2026-06-29T18:05:00Z and 2026-07-01T15:12:00Z)
 * @output Event detail page with a live RSVP flow: a hero band painted with
 *   fixture CSS gradients (event chips, title, date/time/venue meta rows,
 *   hosted-by Avatars), a sticky RSVP Card with a Going/Maybe/Cannot-go
 *   SegmentedControl, a guest-count stepper (0–4, only counted while Going),
 *   a capacity ProgressBar, and an Add-to-calendar confirmation; an attendee
 *   section with an AvatarGroup + overflow and per-response count rows that
 *   recompute from your choice; an agenda List of sessions with time ranges,
 *   track Tokens, speaker Avatars, and working save-to-schedule bookmark
 *   toggles; a location block pairing a schematic CSS-drawn map placeholder
 *   (street grid, park, venue pin) with a venue MetadataList and
 *   directions/copy-address Buttons; and a small discussion thread with a
 *   TextArea composer that appends comments with a fixed literal timestamp
 * @position Page template; emitted by \`astryx template event-detail-rsvp\`
 *
 * Frame: Layout height="fill". LayoutHeader carries Events breadcrumbs plus
 * Share and a MoreMenu; LayoutContent (padding 0) scrolls the document —
 * a full-bleed gradient hero band, then a centered 760px column for agenda,
 * location, and discussion. LayoutPanel end 340 docks the RSVP card
 * (position:sticky inside the panel scroll) above the attendee roster so the
 * response controls never scroll away while the page is browsed.
 *
 * Interaction contract:
 * - The RSVP SegmentedControl is real state: picking Going/Maybe/Cannot go
 *   updates the response-count rows, the AvatarGroup (your Avatar joins the
 *   stack while Going), the capacity ProgressBar, and the status line.
 * - The guest stepper (0–4) only counts toward "going" while your response
 *   is Going; its buttons disable at the bounds and while not Going.
 * - Add to calendar flips to a confirmed state; Copy address flips to
 *   'Copied'; both are plain state flips — no clipboard or calendar APIs.
 * - Each agenda session has a bookmark toggle that adds/removes it from "My
 *   schedule" and updates the saved-count Badge in the section header.
 * - The discussion composer appends a comment as Maya Chen with the fixed
 *   literal timestamp 2026-07-02T16:00:00Z; Post disables while empty.
 *
 * Responsive contract:
 * - >900px: header | content column (hero band full width, sections capped
 *   at 760px and centered) | RSVP panel 340 (fixed, scrolls internally with
 *   the RSVP card sticky at its top). Only LayoutContent and the panel
 *   scroll.
 * - <=900px: the panel leaves the right edge and the page becomes a single
 *   pane — the RSVP card lands directly under the hero (still first in the
 *   reading order) with the attendee section after it, and LayoutContent
 *   scrolls everything as one document.
 * - <=640px: header chrome collapses — Share drops its label to an
 *   IconButton and the breadcrumb trail shortens to the current event; hero
 *   padding tightens and its title steps down; agenda rows restack with the
 *   time range above the session title instead of a left time column; the
 *   location facts collapse to one MetadataList column.
 * - Tap targets: the RSVP SegmentedControl is size="lg", and the guest
 *   stepper and agenda bookmark toggles are explicit 40px buttons at every
 *   width. Nothing is hover-only — Tooltips only annotate controls that
 *   also carry visible labels or aria-pressed state.
 * - No horizontal scroll surfaces: hero chips, meta rows, speaker lists,
 *   and action rows all wrap="wrap"; the schematic map and ProgressBar are
 *   fluid width, so the page holds at 375px with zero overflow-x.
 *
 * Container policy (event-page archetype): the page chrome is frame-first;
 * Cards wrap the RSVP controls, attendee roster, agenda, location block, and
 * discussion. The hero band and map placeholder are painted with literal
 * fixture gradients (colorScheme-locked) — no clocks, no randomness, no
 * network assets or real imagery anywhere.
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
import {Avatar} from '@astryxdesign/core/Avatar';
import {
  AvatarGroup,
  AvatarGroupOverflow,
} from '@astryxdesign/core/AvatarGroup';
import {Badge} from '@astryxdesign/core/Badge';
import {Breadcrumbs, BreadcrumbItem} from '@astryxdesign/core/Breadcrumbs';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {
  MetadataList,
  MetadataListItem,
} from '@astryxdesign/core/MetadataList';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Timestamp} from '@astryxdesign/core/Timestamp';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  BookmarkCheckIcon,
  BookmarkIcon,
  CalendarDaysIcon,
  CalendarPlusIcon,
  CheckIcon,
  CircleHelpIcon,
  ClockIcon,
  CoffeeIcon,
  CopyIcon,
  MapPinIcon,
  MessageSquareTextIcon,
  MicIcon,
  MinusIcon,
  NavigationIcon,
  PlusIcon,
  PresentationIcon,
  SendIcon,
  Share2Icon,
  SparklesIcon,
  UsersIcon,
  UtensilsIcon,
  WrenchIcon,
  XIcon,
} from 'lucide-react';
import type {ComponentType, SVGProps} from 'react';

// ============= HERO PAINT CONSTANTS =============
// The hero band is a painted fixture surface: literal colors locked with
// colorScheme:'dark' so it reads identically in light and dark app themes.

const HERO_TEXT = '#FFFFFF';
const HERO_TEXT_SOFT = 'rgba(226, 230, 255, 0.86)';
const HERO_TEXT_FAINT = 'rgba(226, 230, 255, 0.68)';
const HERO_CHIP_BG = 'rgba(255, 255, 255, 0.14)';
const HERO_CHIP_BORDER = 'rgba(255, 255, 255, 0.22)';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Hero band: layered fixture gradients — dusk indigo base with a warm
  // top-right glow and a teal floor wash. Full bleed inside LayoutContent.
  hero: {
    position: 'relative',
    overflow: 'hidden',
    colorScheme: 'dark',
    color: HERO_TEXT,
    backgroundImage: [
      'radial-gradient(90% 85% at 88% 8%, rgba(255, 173, 96, 0.30), transparent 58%)',
      'radial-gradient(75% 95% at 6% 96%, rgba(94, 234, 212, 0.20), transparent 55%)',
      'linear-gradient(135deg, #312E81 0%, #4338CA 48%, #6D28D9 100%)',
    ].join(', '),
    padding: 'var(--spacing-8) var(--spacing-6)',
  },
  heroCompact: {
    padding: 'var(--spacing-6) var(--spacing-4)',
  },
  // Decorative concentric ring anchored off the hero's right edge.
  heroRing: {
    position: 'absolute',
    right: -80,
    top: -110,
    width: 280,
    height: 280,
    borderRadius: '50%',
    border: '1.5px solid rgba(255, 255, 255, 0.16)',
    pointerEvents: 'none',
  },
  heroRingInner: {
    position: 'absolute',
    right: -20,
    top: -50,
    width: 160,
    height: 160,
    borderRadius: '50%',
    border: '1.5px solid rgba(255, 255, 255, 0.10)',
    pointerEvents: 'none',
  },
  // Hero inner column shares the 760px content cap so the band and the
  // sections below align on the same rails.
  heroInner: {
    position: 'relative',
    width: '100%',
    maxWidth: 760,
    marginInline: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
  },
  heroChipRow: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: 'var(--spacing-2)',
  },
  heroChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '4px 12px',
    borderRadius: 999,
    backgroundColor: HERO_CHIP_BG,
    border: \`1px solid \${HERO_CHIP_BORDER}\`,
    fontSize: 13,
    fontWeight: 600,
    lineHeight: '20px',
    color: HERO_TEXT,
    whiteSpace: 'nowrap',
  },
  heroTitle: {
    fontSize: 40,
    fontWeight: 700,
    lineHeight: 1.15,
    letterSpacing: '-0.02em',
    margin: 0,
  },
  heroTitleCompact: {
    fontSize: 28,
  },
  heroMetaList: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  heroMetaRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    fontSize: 15,
    color: HERO_TEXT_SOFT,
    flexWrap: 'wrap',
  },
  heroMetaStrong: {
    color: HERO_TEXT,
    fontWeight: 600,
  },
  heroHostRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    fontSize: 14,
    color: HERO_TEXT_FAINT,
  },
  // Content column below the hero: same 760px cap, page gutters.
  column: {
    width: '100%',
    maxWidth: 760,
    marginInline: 'auto',
    padding: 'var(--spacing-6)',
  },
  columnCompact: {
    padding: 'var(--spacing-4)',
  },
  // Docked RSVP panel: the scroll container owns the height; the RSVP card
  // wrapper is sticky so response controls stay put while the roster
  // scrolls beneath it.
  panelScroll: {
    height: '100%',
    overflowY: 'auto',
  },
  panelSticky: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    padding: 'var(--spacing-3)',
    backgroundColor: 'var(--color-background)',
  },
  panelRest: {
    padding: 'var(--spacing-3)',
    paddingTop: 0,
  },
  // Guest stepper: explicit 40px buttons so the touch targets clear ~40px
  // at every viewport width (Button caps at 36px).
  stepButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: '1px solid var(--color-border)',
    backgroundColor: 'var(--color-background)',
    color: 'var(--color-text)',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  },
  stepButtonDisabled: {
    opacity: 0.4,
    cursor: 'default',
  },
  stepValue: {
    minWidth: 48,
    textAlign: 'center',
  },
  // Response-count rows: small tinted icon discs keyed to each response.
  responseDisc: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
  },
  // Agenda: 40px bookmark toggle, session icon disc, muted time column.
  agendaTime: {
    width: 88,
    flexShrink: 0,
  },
  agendaIcon: {
    width: 36,
    height: 36,
    borderRadius: 10,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    backgroundColor: 'var(--color-background-muted)',
  },
  bookmarkButton: {
    width: 40,
    height: 40,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    border: 'none',
    backgroundColor: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    padding: 0,
    flexShrink: 0,
  },
  bookmarkButtonActive: {
    color: 'var(--color-accent)',
    backgroundColor: 'var(--color-accent-muted)',
  },
  // Schematic map placeholder: a CSS street grid, no tiles or imagery.
  map: {
    position: 'relative',
    height: 220,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage: [
      'repeating-linear-gradient(0deg, transparent 0px, transparent 44px, var(--color-border) 44px, var(--color-border) 47px)',
      'repeating-linear-gradient(90deg, transparent 0px, transparent 58px, var(--color-border) 58px, var(--color-border) 61px)',
    ].join(', '),
  },
  // Two wider "avenues" crossing the block grid.
  mapAvenueH: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: '52%',
    height: 10,
    backgroundColor: 'var(--color-background)',
    borderTop: '1px solid var(--color-border)',
    borderBottom: '1px solid var(--color-border)',
  },
  mapAvenueV: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: '30%',
    width: 10,
    backgroundColor: 'var(--color-background)',
    borderLeft: '1px solid var(--color-border)',
    borderRight: '1px solid var(--color-border)',
  },
  // A park block and a waterline corner give the schematic some anatomy.
  mapPark: {
    position: 'absolute',
    left: '8%',
    top: '14%',
    width: '16%',
    height: '30%',
    borderRadius: 8,
    backgroundColor: 'rgba(52, 168, 83, 0.18)',
    border: '1px solid rgba(52, 168, 83, 0.35)',
  },
  mapWater: {
    position: 'absolute',
    right: '-6%',
    bottom: '-18%',
    width: '34%',
    height: '52%',
    borderRadius: '50%',
    backgroundColor: 'rgba(66, 133, 244, 0.16)',
    border: '1px solid rgba(66, 133, 244, 0.30)',
  },
  // Venue pin: accent disc centered on the block east of the avenue
  // crossing, with a label chip pinned beneath it.
  mapPin: {
    position: 'absolute',
    left: '58%',
    top: '38%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
  },
  mapPinDot: {
    width: 40,
    height: 40,
    borderRadius: '50% 50% 50% 4px',
    transform: 'rotate(-45deg)',
    backgroundColor: 'var(--color-accent)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: 'var(--shadow-med)',
  },
  mapPinGlyph: {
    transform: 'rotate(45deg)',
    color: 'var(--color-on-accent)',
    display: 'flex',
  },
  mapPinLabel: {
    padding: '2px 10px',
    borderRadius: 999,
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    fontSize: 12,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    boxShadow: 'var(--shadow-low)',
  },
  mapCorner: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    padding: '2px 8px',
    borderRadius: 6,
    backgroundColor: 'var(--color-background)',
    border: '1px solid var(--color-border)',
    fontSize: 11,
  },
  commentBody: {whiteSpace: 'pre-wrap', overflowWrap: 'anywhere'},
};

// ============= EVENT DATA =============
// Deterministic fixtures: fixed counts, names, and ISO timestamps.
// No clocks, no randomness, no network assets.

const EVENT = {
  title: 'Northbeam Product Summit 2026',
  series: 'Northbeam Events',
  dateLine: 'Thursday, July 23, 2026',
  timeLine: '9:00 AM – 4:30 PM PT',
  venueLine: 'The Foundry · 500 Harrison St, San Francisco',
  rsvpDeadline: 'RSVP by July 16',
  hostTeam: 'Developer Platform',
  hosts: ['Dana Whitfield', 'Alex Kim'],
};

const CURRENT_USER = 'Maya Chen';
const CAPACITY = 180;
const MAX_GUESTS = 4;
const POST_TIMESTAMP = '2026-07-02T16:00:00Z'; // fixed literal for new comments

// Base counts EXCLUDE the current user; her response and guests are layered
// on top so every total on the page reacts to the RSVP controls.
const BASE_COUNTS = {going: 47, maybe: 12, declined: 5} as const;

// Named attendees for the avatar stack — all part of the "going" base.
const GOING_ATTENDEES: readonly string[] = [
  'Priya Nair',
  'Jordan Ellis',
  'Sam Okafor',
  'Dana Whitfield',
  'Alex Kim',
  'Jonah Fields',
  'Sofia Ortiz',
  'Ravi Patel',
  'Elena Vasquez',
  'Marcus Webb',
];
const AVATAR_STACK_LIMIT = 6;

type RsvpChoice = 'going' | 'maybe' | 'declined';
type RsvpValue = RsvpChoice | 'none';

// ============= AGENDA DATA =============

interface Speaker {
  name: string;
  role: string;
}

interface AgendaSession {
  id: string;
  start: string;
  end: string;
  title: string;
  description: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  track: string;
  trackColor: 'gray' | 'purple' | 'blue' | 'orange' | 'teal' | 'green';
  speakers: Speaker[];
}

const AGENDA: readonly AgendaSession[] = [
  {
    id: 'session-1',
    start: '9:00 AM',
    end: '9:45 AM',
    title: 'Registration & coffee',
    description: 'Badge pickup on the mezzanine; pastries until they run out.',
    icon: CoffeeIcon,
    track: 'Welcome',
    trackColor: 'gray',
    speakers: [],
  },
  {
    id: 'session-2',
    start: '9:45 AM',
    end: '10:30 AM',
    title: 'Keynote: The next platform year',
    description:
      'Where the developer platform is headed — APIs, extensibility, and the partner marketplace.',
    icon: PresentationIcon,
    track: 'Keynote',
    trackColor: 'purple',
    speakers: [{name: 'Dana Whitfield', role: 'VP Product'}],
  },
  {
    id: 'session-3',
    start: '10:45 AM',
    end: '12:00 PM',
    title: 'Workshop: Shipping with the design system',
    description:
      'Hands-on with Meridian components — bring a laptop with the sandbox repo cloned.',
    icon: WrenchIcon,
    track: 'Workshop',
    trackColor: 'blue',
    speakers: [
      {name: 'Maya Chen', role: 'Staff Product Designer'},
      {name: 'Jonah Fields', role: 'Design Engineer'},
    ],
  },
  {
    id: 'session-4',
    start: '12:00 PM',
    end: '1:00 PM',
    title: 'Lunch',
    description: 'Catered on the terrace; dietary options labeled at each station.',
    icon: UtensilsIcon,
    track: 'Break',
    trackColor: 'gray',
    speakers: [],
  },
  {
    id: 'session-5',
    start: '1:00 PM',
    end: '2:15 PM',
    title: 'Panel: Pricing the platform',
    description:
      'The pricing refresh team debates tiers, migration, and what the council pushed back on.',
    icon: MicIcon,
    track: 'Panel',
    trackColor: 'orange',
    speakers: [
      {name: 'Priya Nair', role: 'Monetization Lead'},
      {name: 'Sam Okafor', role: 'Growth PM'},
      {name: 'Jordan Ellis', role: 'Data Science'},
    ],
  },
  {
    id: 'session-6',
    start: '2:30 PM',
    end: '3:45 PM',
    title: 'Roadmap AMA',
    description:
      'Open floor with product leadership — questions collected in the event thread below.',
    icon: MessageSquareTextIcon,
    track: 'AMA',
    trackColor: 'teal',
    speakers: [
      {name: 'Dana Whitfield', role: 'VP Product'},
      {name: 'Alex Kim', role: 'Platform PM'},
    ],
  },
  {
    id: 'session-7',
    start: '3:45 PM',
    end: '4:30 PM',
    title: 'Closing social',
    description: 'Wind down on the terrace; shuttle passes at the front desk.',
    icon: SparklesIcon,
    track: 'Social',
    trackColor: 'green',
    speakers: [],
  },
];

const INITIALLY_SAVED_SESSIONS = ['session-3'];

// ============= VENUE DATA =============

const VENUE_FACTS: ReadonlyArray<{label: string; value: string}> = [
  {label: 'Venue', value: 'The Foundry — Main Hall'},
  {label: 'Address', value: '500 Harrison St, San Francisco, CA 94105'},
  {label: 'Room', value: 'Main Hall, 2nd floor (elevator by the atrium)'},
  {label: 'Doors open', value: '8:30 AM — badge required after 10:00'},
  {label: 'Transit', value: 'Salesforce Transit Center · 8 min walk'},
  {label: 'Parking', value: 'Sterling Garage on 2nd St · $28/day'},
];

const VENUE_ADDRESS = '500 Harrison St, San Francisco, CA 94105';

// ============= DISCUSSION DATA =============

interface EventComment {
  id: string;
  author: string;
  ts: string; // fixed ISO timestamp
  body: string;
}

const COMMENTS: readonly EventComment[] = [
  {
    id: 'comment-1',
    author: 'Priya Nair',
    ts: '2026-06-29T18:05:00Z',
    body: 'Will the keynote be recorded? Half my team is remote that week.',
  },
  {
    id: 'comment-2',
    author: 'Alex Kim',
    ts: '2026-06-30T09:20:00Z',
    body: 'Yes — keynote and the AMA both stream, workshop is in-person only. Links go out the morning of.',
  },
  {
    id: 'comment-3',
    author: 'Jordan Ellis',
    ts: '2026-06-30T16:44:00Z',
    body: 'Heads up that the Harrison St entrance is closed for construction; use the 2nd St doors and take the atrium elevator.',
  },
  {
    id: 'comment-4',
    author: 'Sofia Ortiz',
    ts: '2026-07-01T15:12:00Z',
    body: 'Bringing two folks from the partner team for the pricing panel — added them as guests on my RSVP.',
  },
];

// ============= SMALL PIECES =============

/** Hero chip: icon + label pill painted on the gradient band. */
function HeroChip({
  icon,
  label,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
}) {
  return (
    <span style={styles.heroChip}>
      <Icon icon={icon} size="xsm" color="inherit" />
      {label}
    </span>
  );
}

/** One icon + count row in the attendee section; highlights your response. */
function ResponseCountRow({
  icon,
  tint,
  tintBg,
  label,
  count,
  isYou,
  youNote,
}: {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  tint: string;
  tintBg: string;
  label: string;
  count: number;
  isYou: boolean;
  youNote: string;
}) {
  return (
    <HStack gap={3} vAlign="center">
      <div style={{...styles.responseDisc, backgroundColor: tintBg, color: tint}}>
        <Icon icon={icon} size="sm" color="inherit" />
      </div>
      <StackItem size="fill">
        <HStack gap={2} vAlign="center">
          <Text type="body">{label}</Text>
          {isYou && <Token label={youNote} size="sm" color="blue" />}
        </HStack>
      </StackItem>
      <Text type="body" weight="bold" hasTabularNumbers>
        {count}
      </Text>
    </HStack>
  );
}

/** One agenda row; time column on wide viewports, stacked on phones. */
function AgendaRow({
  session,
  isSaved,
  isCompact,
  onToggleSaved,
}: {
  session: AgendaSession;
  isSaved: boolean;
  isCompact: boolean;
  onToggleSaved: (id: string) => void;
}) {
  const timeRange = \`\${session.start} – \${session.end}\`;

  const bookmark = (
    <Tooltip
      content={isSaved ? 'Remove from my schedule' : 'Add to my schedule'}>
      <button
        type="button"
        aria-label={
          isSaved
            ? \`Remove \${session.title} from my schedule\`
            : \`Add \${session.title} to my schedule\`
        }
        aria-pressed={isSaved}
        onClick={() => onToggleSaved(session.id)}
        style={{
          ...styles.bookmarkButton,
          ...(isSaved ? styles.bookmarkButtonActive : null),
        }}>
        <Icon
          icon={isSaved ? BookmarkCheckIcon : BookmarkIcon}
          size="sm"
          color="inherit"
        />
      </button>
    </Tooltip>
  );

  const detail = (
    <VStack gap={1}>
      <HStack gap={2} vAlign="center" wrap="wrap">
        <Text type="body" weight="bold">
          {session.title}
        </Text>
        <Token label={session.track} size="sm" color={session.trackColor} />
      </HStack>
      <Text type="supporting" color="secondary">
        {session.description}
      </Text>
      {session.speakers.length > 0 && (
        <HStack gap={3} vAlign="center" wrap="wrap">
          {session.speakers.map(speaker => (
            <HStack key={speaker.name} gap={1} vAlign="center">
              <Avatar name={speaker.name} size="xsmall" />
              <Text type="supporting" color="secondary">
                {speaker.name} · {speaker.role}
              </Text>
            </HStack>
          ))}
        </HStack>
      )}
    </VStack>
  );

  if (isCompact) {
    // <=640px: the time range moves above the title; the bookmark keeps its
    // 40px hit box pinned to the right of the time row.
    return (
      <HStack gap={3} vAlign="start">
        <div style={styles.agendaIcon}>
          <Icon icon={session.icon} size="sm" color="secondary" />
        </div>
        <StackItem size="fill">
          <VStack gap={1}>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {timeRange}
            </Text>
            {detail}
          </VStack>
        </StackItem>
        {bookmark}
      </HStack>
    );
  }

  return (
    <HStack gap={3} vAlign="start">
      <div style={styles.agendaTime}>
        <VStack gap={0}>
          <Text type="supporting" weight="bold" hasTabularNumbers>
            {session.start}
          </Text>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {session.end}
          </Text>
        </VStack>
      </div>
      <div style={styles.agendaIcon}>
        <Icon icon={session.icon} size="sm" color="secondary" />
      </div>
      <StackItem size="fill">{detail}</StackItem>
      {bookmark}
    </HStack>
  );
}

// ============= PAGE =============

export default function EventDetailRsvpTemplate() {
  // ---- RSVP state ----
  const [rsvp, setRsvp] = useState<RsvpValue>('none');
  const [guests, setGuests] = useState(0);
  const [isCalendarAdded, setIsCalendarAdded] = useState(false);
  // ---- section state ----
  const [savedSessionIds, setSavedSessionIds] = useState<Set<string>>(
    () => new Set(INITIALLY_SAVED_SESSIONS),
  );
  const [isAddressCopied, setIsAddressCopied] = useState(false);
  const [comments, setComments] = useState<EventComment[]>(() => [
    ...COMMENTS,
  ]);
  const [draft, setDraft] = useState('');

  // Responsive contract: <=900px the RSVP panel stacks into the document
  // under the hero; <=640px header chrome and agenda rows compress.
  const isStacked = useMediaQuery('(max-width: 900px)');
  const isPhone = useMediaQuery('(max-width: 640px)');

  // ---- derived counts ----
  // Guests only count while Going; your own seat counts for Going or Maybe.
  const goingTotal =
    BASE_COUNTS.going + (rsvp === 'going' ? 1 + guests : 0);
  const maybeTotal = BASE_COUNTS.maybe + (rsvp === 'maybe' ? 1 : 0);
  const declinedTotal = BASE_COUNTS.declined + (rsvp === 'declined' ? 1 : 0);
  const spotsLeft = CAPACITY - goingTotal;
  const savedCount = savedSessionIds.size;

  const stackNames =
    rsvp === 'going'
      ? [CURRENT_USER, ...GOING_ATTENDEES]
      : [...GOING_ATTENDEES];
  const visibleStack = stackNames.slice(0, AVATAR_STACK_LIMIT);
  const stackOverflow = goingTotal - visibleStack.length;

  const statusLine =
    rsvp === 'going'
      ? guests > 0
        ? \`You're going with \${guests} \${guests === 1 ? 'guest' : 'guests'} — see you July 23.\`
        : "You're going — see you July 23."
      : rsvp === 'maybe'
        ? "Marked as maybe — we'll nudge you again on July 9."
        : rsvp === 'declined'
          ? "You can't make it — thanks for letting us know."
          : \`\${EVENT.rsvpDeadline} · \${spotsLeft} spots left.\`;

  // ---- interactions ----
  const changeRsvp = (value: string) => {
    const next = value as RsvpChoice;
    setRsvp(next);
    // Leaving "Going" clears the party size and the calendar confirmation
    // so re-responding always starts from a clean slate.
    if (next !== 'going') {
      setGuests(0);
      setIsCalendarAdded(false);
    }
  };

  const stepGuests = (delta: number) => {
    setGuests(prev => Math.min(MAX_GUESTS, Math.max(0, prev + delta)));
  };

  const toggleSaved = (id: string) => {
    setSavedSessionIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  /** Post appends a comment with the fixed literal timestamp. */
  const postComment = () => {
    const body = draft.trim();
    if (body.length === 0) {
      return;
    }
    setComments(prev => [
      ...prev,
      {
        id: \`comment-\${prev.length + 1}\`,
        author: CURRENT_USER,
        ts: POST_TIMESTAMP,
        body,
      },
    ]);
    setDraft('');
  };

  const canStepDown = rsvp === 'going' && guests > 0;
  const canStepUp = rsvp === 'going' && guests < MAX_GUESTS;
  const canPost = draft.trim().length > 0;

  // ---- hero band ----
  const hero = (
    <div style={{...styles.hero, ...(isPhone ? styles.heroCompact : null)}}>
      <div aria-hidden style={styles.heroRing} />
      <div aria-hidden style={styles.heroRingInner} />
      <div style={styles.heroInner}>
        <div style={styles.heroChipRow}>
          <HeroChip icon={CalendarDaysIcon} label="In-person event" />
          <HeroChip icon={UsersIcon} label={\`\${goingTotal} going\`} />
          <HeroChip icon={ClockIcon} label={EVENT.rsvpDeadline} />
        </div>
        <h1
          style={{
            ...styles.heroTitle,
            ...(isPhone ? styles.heroTitleCompact : null),
          }}>
          {EVENT.title}
        </h1>
        <div style={styles.heroMetaList}>
          <div style={styles.heroMetaRow}>
            <Icon icon={CalendarDaysIcon} size="sm" color="inherit" />
            <span style={styles.heroMetaStrong}>{EVENT.dateLine}</span>
            <span>· {EVENT.timeLine}</span>
          </div>
          <div style={styles.heroMetaRow}>
            <Icon icon={MapPinIcon} size="sm" color="inherit" />
            <span>{EVENT.venueLine}</span>
          </div>
        </div>
        <div style={styles.heroHostRow}>
          <AvatarGroup size="xsmall" aria-label="Event hosts">
            {EVENT.hosts.map(host => (
              <Avatar key={host} name={host} />
            ))}
          </AvatarGroup>
          <span>
            Hosted by {EVENT.hostTeam} · {EVENT.hosts.join(' & ')}
          </span>
        </div>
      </div>
    </div>
  );

  // ---- RSVP card ----
  const rsvpCard = (
    <Card padding={4}>
      <VStack gap={4}>
        <VStack gap={1}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Heading level={2}>Are you going?</Heading>
            </StackItem>
            {rsvp === 'going' && <Badge label="Going" variant="green" />}
            {rsvp === 'maybe' && <Badge label="Maybe" variant="info" />}
          </HStack>
          <Text type="supporting" color="secondary">
            {statusLine}
          </Text>
        </VStack>

        <SegmentedControl
          label="Your RSVP"
          value={rsvp}
          onChange={changeRsvp}
          size="lg"
          layout="fill">
          <SegmentedControlItem
            value="going"
            label="Going"
            icon={<Icon icon={CheckIcon} size="sm" color="inherit" />}
          />
          <SegmentedControlItem
            value="maybe"
            label="Maybe"
            icon={<Icon icon={CircleHelpIcon} size="sm" color="inherit" />}
          />
          <SegmentedControlItem
            value="declined"
            label="Cannot go"
            icon={<Icon icon={XIcon} size="sm" color="inherit" />}
          />
        </SegmentedControl>

        {/* Guest stepper — enabled only while Going; counts into totals. */}
        <HStack gap={3} vAlign="center">
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="body" weight="bold">
                Guests
              </Text>
              <Text type="supporting" color="secondary">
                {rsvp === 'going'
                  ? guests === 0
                    ? 'Just you'
                    : \`You + \${guests} \${guests === 1 ? 'guest' : 'guests'}\`
                  : 'Respond "Going" to bring guests'}
              </Text>
            </VStack>
          </StackItem>
          <button
            type="button"
            aria-label="Remove a guest"
            disabled={!canStepDown}
            onClick={() => stepGuests(-1)}
            style={{
              ...styles.stepButton,
              ...(canStepDown ? null : styles.stepButtonDisabled),
            }}>
            <Icon icon={MinusIcon} size="sm" color="inherit" />
          </button>
          <div style={styles.stepValue} aria-live="polite">
            <Text type="body" weight="bold" hasTabularNumbers>
              {guests}
            </Text>
          </div>
          <button
            type="button"
            aria-label="Add a guest"
            disabled={!canStepUp}
            onClick={() => stepGuests(1)}
            style={{
              ...styles.stepButton,
              ...(canStepUp ? null : styles.stepButtonDisabled),
            }}>
            <Icon icon={PlusIcon} size="sm" color="inherit" />
          </button>
        </HStack>

        <ProgressBar
          label="Capacity"
          value={goingTotal}
          max={CAPACITY}
          hasValueLabel
          formatValueLabel={(value, max) => \`\${max - value} spots left\`}
          variant={spotsLeft <= 20 ? 'warning' : 'accent'}
        />

        {(rsvp === 'going' || rsvp === 'maybe') && (
          <Button
            label={isCalendarAdded ? 'Added to calendar' : 'Add to calendar'}
            variant={isCalendarAdded ? 'secondary' : 'primary'}
            icon={
              <Icon
                icon={isCalendarAdded ? CheckIcon : CalendarPlusIcon}
                size="sm"
                color="inherit"
              />
            }
            isDisabled={isCalendarAdded}
            onClick={() => setIsCalendarAdded(true)}
          />
        )}
      </VStack>
    </Card>
  );

  // ---- attendee section ----
  const attendeeCard = (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Who's coming</Heading>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            {goingTotal + maybeTotal} responses
          </Text>
        </HStack>

        <HStack gap={3} vAlign="center" wrap="wrap">
          <AvatarGroup size="small" aria-label="Attendees going">
            {visibleStack.map(name => (
              <Avatar key={name} name={name} />
            ))}
            {stackOverflow > 0 && (
              <AvatarGroupOverflow count={stackOverflow} />
            )}
          </AvatarGroup>
          <Text type="supporting" color="secondary">
            {rsvp === 'going'
              ? \`You, \${GOING_ATTENDEES[0]}, \${GOING_ATTENDEES[1]}, and \${
                  goingTotal - 3
                } others\`
              : \`\${GOING_ATTENDEES[0]}, \${GOING_ATTENDEES[1]}, and \${
                  goingTotal - 2
                } others\`}
          </Text>
        </HStack>

        <Divider />

        <VStack gap={3}>
          <ResponseCountRow
            icon={CheckIcon}
            tint="var(--color-success, #1E8E3E)"
            tintBg="rgba(52, 168, 83, 0.14)"
            label="Going"
            count={goingTotal}
            isYou={rsvp === 'going'}
            youNote={guests > 0 ? \`You +\${guests}\` : 'You'}
          />
          <ResponseCountRow
            icon={CircleHelpIcon}
            tint="var(--color-warning, #B26A00)"
            tintBg="rgba(249, 171, 0, 0.16)"
            label="Maybe"
            count={maybeTotal}
            isYou={rsvp === 'maybe'}
            youNote="You"
          />
          <ResponseCountRow
            icon={XIcon}
            tint="var(--color-error, #C5221F)"
            tintBg="rgba(217, 48, 37, 0.12)"
            label="Cannot go"
            count={declinedTotal}
            isYou={rsvp === 'declined'}
            youNote="You"
          />
        </VStack>
      </VStack>
    </Card>
  );

  // ---- agenda section ----
  const agendaCard = (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Heading level={2}>Agenda</Heading>
          </StackItem>
          <Badge
            label={\`\${savedCount} saved\`}
            variant={savedCount > 0 ? 'info' : undefined}
          />
        </HStack>
        <VStack gap={0}>
          {AGENDA.map((session, index) => (
            <VStack key={session.id} gap={0}>
              {index > 0 && (
                <div style={{paddingBlock: 'var(--spacing-3)'}}>
                  <Divider />
                </div>
              )}
              <AgendaRow
                session={session}
                isSaved={savedSessionIds.has(session.id)}
                isCompact={isPhone}
                onToggleSaved={toggleSaved}
              />
            </VStack>
          ))}
        </VStack>
      </VStack>
    </Card>
  );

  // ---- location section ----
  const locationCard = (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Getting there</Heading>
          </StackItem>
        </HStack>

        {/* Schematic map placeholder: pure CSS street grid, park, water,
            and a venue pin. Decorative — the facts below carry the info. */}
        <div
          style={styles.map}
          role="img"
          aria-label="Schematic map showing The Foundry at 500 Harrison St, one block east of the avenue crossing">
          <div aria-hidden style={styles.mapPark} />
          <div aria-hidden style={styles.mapWater} />
          <div aria-hidden style={styles.mapAvenueH} />
          <div aria-hidden style={styles.mapAvenueV} />
          <div aria-hidden style={styles.mapPin}>
            <div style={styles.mapPinDot}>
              <span style={styles.mapPinGlyph}>
                <Icon icon={MapPinIcon} size="sm" color="inherit" />
              </span>
            </div>
            <span style={styles.mapPinLabel}>The Foundry</span>
          </div>
          <span aria-hidden style={styles.mapCorner}>
            Schematic — not to scale
          </span>
        </div>

        <MetadataList columns={isPhone ? 'single' : 'multi'}>
          {VENUE_FACTS.map(fact => (
            <MetadataListItem key={fact.label} label={fact.label}>
              {fact.value}
            </MetadataListItem>
          ))}
        </MetadataList>

        <HStack gap={2} wrap="wrap">
          <Button
            label="Get directions"
            variant="secondary"
            icon={<Icon icon={NavigationIcon} size="sm" color="inherit" />}
          />
          <Button
            label={isAddressCopied ? 'Copied' : 'Copy address'}
            variant="secondary"
            icon={
              <Icon
                icon={isAddressCopied ? CheckIcon : CopyIcon}
                size="sm"
                color="inherit"
              />
            }
            tooltip={VENUE_ADDRESS}
            onClick={() => setIsAddressCopied(true)}
          />
        </HStack>
      </VStack>
    </Card>
  );

  // ---- discussion section ----
  const discussionCard = (
    <Card padding={4}>
      <VStack gap={4}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Heading level={2}>Discussion</Heading>
          </StackItem>
          <Badge label={String(comments.length)} />
        </HStack>

        <VStack gap={4}>
          {comments.map(comment => (
            <HStack key={comment.id} gap={3} vAlign="start">
              <Avatar name={comment.author} size="small" />
              <StackItem size="fill">
                <VStack gap={1}>
                  <HStack gap={2} vAlign="center" wrap="wrap">
                    <Text type="body" weight="bold">
                      {comment.author}
                    </Text>
                    <Timestamp
                      value={comment.ts}
                      format="date_time"
                      type="supporting"
                      color="secondary"
                    />
                    {comment.author === CURRENT_USER && (
                      <Token label="You" size="sm" color="blue" />
                    )}
                  </HStack>
                  <Text type="body" style={styles.commentBody}>
                    {comment.body}
                  </Text>
                </VStack>
              </StackItem>
            </HStack>
          ))}
        </VStack>

        <Divider />

        <VStack gap={2}>
          <TextArea
            label="Add to the discussion"
            isLabelHidden
            placeholder="Ask the hosts a question…"
            rows={2}
            value={draft}
            onChange={setDraft}
          />
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Text type="supporting" color="secondary">
                Posting as {CURRENT_USER}
              </Text>
            </StackItem>
            <Button
              label="Post"
              variant="primary"
              icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              isDisabled={!canPost}
              onClick={postComment}
            />
          </HStack>
        </VStack>
      </VStack>
    </Card>
  );

  // ---- frame ----
  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center" wrap="wrap">
            <StackItem size="fill">
              <Breadcrumbs label="Events">
                {!isPhone && <BreadcrumbItem href="#">Events</BreadcrumbItem>}
                {!isPhone && (
                  <BreadcrumbItem href="#">{EVENT.series}</BreadcrumbItem>
                )}
                <BreadcrumbItem isCurrent>{EVENT.title}</BreadcrumbItem>
              </Breadcrumbs>
            </StackItem>
            {isPhone ? (
              <IconButton
                label="Share event"
                tooltip="Share event"
                variant="secondary"
                size="sm"
                icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}
              />
            ) : (
              <Button
                label="Share"
                variant="secondary"
                size="sm"
                icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}
              />
            )}
            <MoreMenu
              label="Event options"
              size="sm"
              items={[
                {label: 'Copy event link', onClick: () => {}},
                {label: 'Download .ics', onClick: () => {}},
                {label: 'Contact hosts', onClick: () => {}},
                {label: 'Report event', onClick: () => {}},
              ]}
            />
          </HStack>
        </LayoutHeader>
      }
      end={
        isStacked ? undefined : (
          <LayoutPanel width={340} padding={0} label="RSVP and attendees">
            <div style={styles.panelScroll}>
              {/* Sticky RSVP card: stays pinned while the roster scrolls. */}
              <div style={styles.panelSticky}>{rsvpCard}</div>
              <div style={styles.panelRest}>
                <VStack gap={3}>{attendeeCard}</VStack>
              </div>
            </div>
          </LayoutPanel>
        )
      }
      content={
        <LayoutContent padding={0}>
          <VStack gap={0}>
            {hero}
            <div
              style={{
                ...styles.column,
                ...(isPhone ? styles.columnCompact : null),
              }}>
              <VStack gap={4}>
                {/* <=900px: single pane — RSVP and attendees join the
                    document right under the hero, keeping the response
                    controls first in the reading order. */}
                {isStacked && rsvpCard}
                {isStacked && attendeeCard}
                {agendaCard}
                {locationCard}
                {discussionCard}
              </VStack>
            </div>
          </VStack>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};