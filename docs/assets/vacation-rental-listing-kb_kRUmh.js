var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one Hearthstay listing — 'Cedar & Sea',
 *   an A-frame cabin in Mendocino, CA at $284/night — with 12 gradient-art
 *   photos, a 32-amenity set with 10 featured, 3 sleeping-arrangement rooms
 *   totaling 4 beds, a fixed July 2026 availability strip with 11 booked
 *   nights, a 187-review histogram averaging 4.93, three featured review
 *   cards, host response stats, and 4 neighborhood highlights — no clocks,
 *   no randomness, no network image assets)
 * @output Vacation-rental listing detail page (Airbnb-style): a 5-photo
 *   mosaic with a show-all-photos chip that opens a 12-photo Dialog grid,
 *   a title row with rating / Hearth Host badge / location and share-save
 *   actions, stay highlights, sleeping-arrangement cards, an icon amenity
 *   grid, a click-to-select July 2026 availability calendar strip, a sticky
 *   booking widget whose dates, guests stepper, and nightly fee breakdown
 *   recompute from the selected range (rate x nights + cleaning + service
 *   fee = total), a reviews section with rating histogram and category
 *   scores, a host card with response stats, and a schematic map placeholder
 *   with neighborhood highlights
 * @position Page template; emitted by \`astryx template vacation-rental-listing\`
 *
 * Frame: root 100dvh div > Layout height="fill". LayoutHeader carries the
 * Hearthstay wordmark, a compact search summary pill, and host/nav actions.
 * LayoutContent (padding 0) scrolls the whole page inside a centered
 * maxWidth 1180 wrapper: title row and photo mosaic span full width; below
 * them the left column (flexible, min 460) stacks host line -> highlights ->
 * description -> sleeping arrangements -> amenities -> availability strip ->
 * reviews -> host card -> map, while the right column is a fixed 372px rail
 * whose booking Card is position: sticky so price math stays in view.
 *
 * Responsive contract:
 * - >1024px: content column (min 460, fills) | booking rail 372 (sticky).
 * - <=1024px: one column — the booking widget renders inline between the
 *   availability strip and reviews (sticky dropped so the tall Card never
 *   pins over content); the photo mosaic swaps from the 5-tile grid to a
 *   single hero stage with a horizontal 4-thumb strip (a deliberate
 *   overflowX scroller).
 * - <=760px: the header search pill hides (wordmark + actions remain), the
 *   title-row actions collapse to icon buttons, and amenity / sleeping /
 *   neighborhood grids drop from two columns to one.
 * - The availability strip is a deliberate horizontal scroller at every
 *   width (31 fixed 44px day cells, legend above, documented x-scroll).
 *   Nothing is hover-only: day cells, steppers, and photo tiles are real
 *   buttons with visible states at rest.
 *
 * Color policy: ONE brand accent — Hearthstay coral,
 * light-dark(#E11D48, #FB7185) — used for the wordmark flame, the rating
 * star, the Reserve CTA (white text on the light scheme, near-black
 * #4C0519 text on the lighter dark-scheme coral to hold AA), selected
 * calendar-day fills, and the map pin. Soft coral tints back the Hearth
 * Host chip and the rare-find banner. All 12 photo tiles are deliberately
 * scheme-locked gradient art (colorScheme: 'dark' pinned on the art layers,
 * literal rgba caption chips) so the "photography" reads identically in
 * both schemes; every other surface is token-pure light-dark().
 *
 * Container policy (listing-detail archetype): frame-first page chrome;
 * Cards for the booking widget, the photos Dialog tiles' parent stage, the
 * sleeping-arrangement room cards, and the host card. Amenity rows,
 * histogram bars, review entries, and neighborhood rows are plain rows —
 * no card-in-card nesting.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  AwardIcon,
  BedDoubleIcon,
  BedSingleIcon,
  CalendarCheckIcon,
  CarIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  FlameIcon,
  GemIcon,
  GlobeIcon,
  HeartIcon,
  KeyRoundIcon,
  LaptopIcon,
  LayoutGridIcon,
  MapPinIcon,
  MenuIcon,
  MessageSquareIcon,
  MinusIcon,
  PlusIcon,
  SearchIcon,
  Share2Icon,
  ShieldCheckIcon,
  SunsetIcon,
  TvIcon,
  UtensilsIcon,
  WashingMachineIcon,
  WavesIcon,
  WifiIcon,
  type LucideIcon,
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
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Card} from '@astryxdesign/core/Card';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= BRAND =============

// Hearthstay coral — the ONE brand accent (see Color policy above).
const BRAND_ACCENT = 'light-dark(#E11D48, #FB7185)';
// Text placed ON an accent-filled control: white clears AA on #E11D48;
// the lighter dark-scheme coral needs near-black text to clear AA.
const BRAND_ON_ACCENT = 'light-dark(#FFFFFF, #4C0519)';
// Tinted fills only — never text.
const BRAND_SOFT = 'light-dark(rgba(225, 29, 72, 0.09), rgba(251, 113, 133, 0.14))';
const BRAND_BORDER_SOFT =
  'light-dark(rgba(225, 29, 72, 0.35), rgba(251, 113, 133, 0.4))';

// ============= FIXTURES =============

const LISTING = {
  title: 'Cedar & Sea — A-frame cabin with cliffside hot tub',
  location: 'Mendocino, California, United States',
  type: 'Entire cabin',
  hostName: 'Maren Okafor',
  guestsMax: 6,
  bedrooms: 3,
  beds: 4,
  baths: 2,
  nightlyRate: 284,
  cleaningFee: 95,
  serviceFeeRate: 0.142, // Hearthstay service fee, applied to the night subtotal
  ratingAvg: '4.93',
  reviewCount: 187,
};

// Photo art kinds drive the deterministic gradient composition (see
// photoArtStyle); hues are fixed per photo — no randomness, no assets.
type PhotoKind = 'sky' | 'room' | 'wood' | 'water';

interface Photo {
  id: string;
  label: string;
  kind: PhotoKind;
  hues: [number, number];
}

const PHOTOS: Photo[] = [
  {id: 'p1', label: 'A-frame at dusk', kind: 'sky', hues: [346, 258]},
  {id: 'p2', label: 'Living room & fireplace', kind: 'room', hues: [28, 16]},
  {id: 'p3', label: 'Cliffside hot tub', kind: 'water', hues: [196, 216]},
  {id: 'p4', label: 'Loft bedroom', kind: 'wood', hues: [34, 22]},
  {id: 'p5', label: 'Chef kitchen', kind: 'room', hues: [42, 30]},
  {id: 'p6', label: 'Ocean view from deck', kind: 'water', hues: [204, 226]},
  {id: 'p7', label: 'Primary bedroom', kind: 'wood', hues: [26, 14]},
  {id: 'p8', label: 'Rain shower bath', kind: 'room', hues: [188, 204]},
  {id: 'p9', label: 'Dining nook', kind: 'wood', hues: [38, 24]},
  {id: 'p10', label: 'Headlands trail below', kind: 'sky', hues: [152, 196]},
  {id: 'p11', label: 'Fire pit at night', kind: 'sky', hues: [16, 262]},
  {id: 'p12', label: 'Cabin from the meadow', kind: 'water', hues: [140, 96]},
];

interface Amenity {
  id: string;
  label: string;
  icon: LucideIcon;
}

// 10 featured of the fixed 32-amenity set (AMENITY_TOTAL below).
const AMENITIES: Amenity[] = [
  {id: 'wifi', label: 'Fast wifi — 420 Mbps', icon: WifiIcon},
  {id: 'kitchen', label: 'Full chef kitchen', icon: UtensilsIcon},
  {id: 'parking', label: 'Free parking on premises', icon: CarIcon},
  {id: 'hottub', label: 'Cliffside hot tub', icon: WavesIcon},
  {id: 'fireplace', label: 'Indoor wood fireplace', icon: FlameIcon},
  {id: 'washer', label: 'Washer & dryer', icon: WashingMachineIcon},
  {id: 'workspace', label: 'Dedicated workspace', icon: LaptopIcon},
  {id: 'tv', label: '65" TV with streaming', icon: TvIcon},
  {id: 'view', label: 'Pacific ocean view', icon: SunsetIcon},
  {id: 'checkin', label: 'Self check-in with smart lock', icon: KeyRoundIcon},
];

const AMENITY_TOTAL = 32;

interface SleepingRoom {
  id: string;
  name: string;
  beds: string;
  icon: LucideIcon;
}

// 1 queen + 1 double + 2 singles = the 4 beds in the capacity line.
const SLEEPING_ROOMS: SleepingRoom[] = [
  {id: 'r1', name: 'Bedroom 1', beds: '1 queen bed', icon: BedDoubleIcon},
  {id: 'r2', name: 'Bedroom 2', beds: '1 double bed', icon: BedDoubleIcon},
  {id: 'r3', name: 'Loft', beds: '2 single beds', icon: BedSingleIcon},
];

interface Highlight {
  id: string;
  title: string;
  body: string;
  icon: LucideIcon;
}

const HIGHLIGHTS: Highlight[] = [
  {
    id: 'checkin',
    title: 'Self check-in',
    body: 'Check yourself in with the smart lock after 3:00 PM.',
    icon: KeyRoundIcon,
  },
  {
    id: 'hearthhost',
    title: 'Maren is a Hearth Host',
    body: 'Hearth Hosts are experienced, highly rated hosts on Hearthstay.',
    icon: AwardIcon,
  },
  {
    id: 'cancel',
    title: 'Free cancellation before Jul 5',
    body: 'Full refund if plans change up to 7 days before check-in.',
    icon: CalendarCheckIcon,
  },
];

const DESCRIPTION_PARAGRAPHS = [
  'Perched on the Mendocino headlands, Cedar & Sea is a 1972 A-frame rebuilt in 2023 with floor-to-ceiling glass facing the Pacific. Fall asleep to the foghorn, wake up to whales in March and July, and spend evenings in the cedar hot tub twelve feet from the cliff edge.',
  'The cabin sleeps six across two bedrooms and a lofted bunk space. The kitchen is stocked for real cooking — induction range, Dutch oven, pour-over bar with local roast — and the wood fireplace is laid and ready on arrival.',
  'You are 15 minutes on foot from the village bakery and a 6 minute drive from Glass Beach. The headlands trail starts at the meadow gate below the deck.',
];

// ----- July 2026 availability (fixed month; July 1, 2026 is a Wednesday) -----

const MONTH_LABEL = 'July 2026';
const DAYS_IN_MONTH = 31;
const FIRST_WEEKDAY = 3; // 0 = Sunday … 3 = Wednesday
const WEEKDAY_LETTERS = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];

// Nights already booked by other guests (guests cannot check in on these).
const BOOKED_DAYS = new Set([3, 4, 5, 6, 20, 21, 22, 23, 24, 29, 30]);

const DEFAULT_CHECK_IN = 12; // Sunday, July 12
const DEFAULT_CHECK_OUT = 17; // Friday, July 17

function weekdayOf(day: number): number {
  return (FIRST_WEEKDAY + day - 1) % 7;
}

function dateLabel(day: number | null): string {
  return day === null ? 'Add date' : \`Jul \${day}, 2026\`;
}

// ----- Reviews: histogram counts sum to 187; 922 / 187 = 4.93 avg -----

const RATING_HISTOGRAM: Array<{stars: number; count: number}> = [
  {stars: 5, count: 175},
  {stars: 4, count: 11},
  {stars: 3, count: 1},
  {stars: 2, count: 0},
  {stars: 1, count: 0},
];

const CATEGORY_RATINGS: Array<{id: string; label: string; score: string}> = [
  {id: 'clean', label: 'Cleanliness', score: '4.9'},
  {id: 'accuracy', label: 'Accuracy', score: '5.0'},
  {id: 'checkin', label: 'Check-in', score: '5.0'},
  {id: 'comms', label: 'Communication', score: '5.0'},
  {id: 'location', label: 'Location', score: '4.8'},
  {id: 'value', label: 'Value', score: '4.7'},
];

interface Review {
  id: string;
  name: string;
  date: string;
  stayNote: string;
  text: string;
}

const REVIEWS: Review[] = [
  {
    id: 'rv1',
    name: 'Priya Shenoy',
    date: 'June 2026',
    stayNote: 'Stayed 4 nights · Group trip',
    text: 'The A-frame is even better than the photos. We watched a pod of whales from the hot tub on our second morning and never wanted to leave. The kitchen had everything we needed for two big dinners.',
  },
  {
    id: 'rv2',
    name: 'Daniel Reyes',
    date: 'May 2026',
    stayNote: 'Stayed 3 nights · Couple',
    text: 'Maren thinks of everything — firewood stacked, pour-over beans from a roaster in town, a laminated map of the headlands trail. The cliff view from the loft is unreal at sunset.',
  },
  {
    id: 'rv3',
    name: 'Yusuf Kadir',
    date: 'April 2026',
    stayNote: 'Stayed 5 nights · Remote work',
    text: 'Check-in took thirty seconds and the wifi really is fast enough for video calls all week. Quiet, warm, and the fog rolling over the meadow every morning is worth the trip alone.',
  },
];

const HOST = {
  name: 'Maren Okafor',
  since: 'Hosting since 2019',
  reviewTotal: 312, // across all three of Maren's Hearthstay listings
  listingCount: 3,
  responseRate: '98%',
  responseTime: 'within an hour',
};

interface NeighborhoodSpot {
  id: string;
  name: string;
  distance: string;
}

const NEIGHBORHOOD: NeighborhoodSpot[] = [
  {id: 'n1', name: 'Glass Beach', distance: '6 min drive'},
  {id: 'n2', name: 'Headlands trailhead', distance: '12 min walk'},
  {id: 'n3', name: 'Noyo Harbor seafood', distance: '9 min drive'},
  {id: 'n4', name: 'Village bakery', distance: '15 min walk'},
];

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  root: {height: '100dvh', width: '100%'},
  wrapper: {
    width: '100%',
    maxWidth: 1180,
    marginInline: 'auto',
    padding: 'var(--spacing-5)',
  },
  // ----- Header -----
  wordmark: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    color: BRAND_ACCENT,
    whiteSpace: 'nowrap',
  },
  wordmarkText: {
    fontSize: 20,
    fontWeight: 700,
    letterSpacing: '-0.02em',
    color: BRAND_ACCENT,
  },
  // Compact search summary pill (display-only demo affordance).
  searchPill: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBlock: 6,
    paddingInlineStart: 16,
    paddingInlineEnd: 6,
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    boxShadow: 'var(--shadow-low)',
    cursor: 'pointer',
  },
  searchPillDivider: {
    width: 1,
    height: 20,
    backgroundColor: 'var(--color-border)',
  },
  searchPillButton: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 30,
    height: 30,
    borderRadius: '50%',
    backgroundColor: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
  },
  // ----- Title row -----
  ratingStar: {color: BRAND_ACCENT, fontSize: 14, lineHeight: 1},
  heartWrap: {display: 'inline-flex'},
  // Saved state = the brand accent (the save action is a brand moment).
  savedHeart: {display: 'inline-flex', color: BRAND_ACCENT},
  hostChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    paddingInline: 8,
    paddingBlock: 2,
    borderRadius: 999,
    backgroundColor: BRAND_SOFT,
    border: \`var(--border-width) solid \${BRAND_BORDER_SOFT}\`,
    whiteSpace: 'nowrap',
  },
  // ----- Photo mosaic -----
  mosaic: {
    position: 'relative',
    display: 'grid',
    gridTemplateColumns: '2fr 1fr 1fr',
    gridTemplateRows: '1fr 1fr',
    gap: 8,
    height: 420,
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  mosaicHero: {gridRow: 'span 2'},
  photoButton: {
    position: 'relative',
    width: '100%',
    height: '100%',
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    overflow: 'hidden',
    display: 'block',
  },
  // Scheme-locked photo art layer (see Color policy): gradient
  // "photography" renders identically in light and dark.
  photoArt: {position: 'absolute', inset: 0, colorScheme: 'dark'},
  // Caption chip ON the locked art: literal scrim + white in BOTH schemes.
  photoChip: {
    position: 'absolute',
    left: 10,
    bottom: 10,
    zIndex: 2,
    colorScheme: 'dark',
    backgroundColor: 'rgba(8, 8, 10, 0.66)',
    color: '#FFFFFF',
    fontSize: 12,
    paddingInline: 8,
    paddingBlock: 3,
    borderRadius: 999,
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
  },
  showAllChip: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    zIndex: 3,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    paddingInline: 12,
    paddingBlock: 7,
    borderRadius: 'var(--radius-element)',
    border: 'var(--border-width) solid var(--color-border-strong, var(--color-border))',
    backgroundColor: 'var(--color-background-surface)',
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: 'var(--shadow-low)',
  },
  heroStage: {
    position: 'relative',
    height: 340,
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
  },
  thumbStrip: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    paddingBottom: 4,
    WebkitOverflowScrolling: 'touch',
  },
  thumbTile: {
    position: 'relative',
    width: 132,
    height: 88,
    flexShrink: 0,
    borderRadius: 'var(--radius-element)',
    overflow: 'hidden',
    padding: 0,
    border: 'none',
    background: 'none',
    cursor: 'pointer',
  },
  dialogPhotoGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
  },
  dialogPhotoTile: {
    position: 'relative',
    height: 150,
    borderRadius: 'var(--radius-element)',
    overflow: 'hidden',
  },
  // ----- Columns -----
  // No alignItems override: the booking rail must stretch to the full row
  // height so its sticky child has room to travel while the left column
  // scrolls (flex-start would collapse the rail to the Card's height and
  // kill the sticky behavior).
  columns: {display: 'flex', gap: 'var(--spacing-6)'},
  leftColumn: {flex: 1, minWidth: 460},
  bookingRail: {width: 372, flexShrink: 0},
  bookingSticky: {position: 'sticky', top: 'var(--spacing-5)'},
  // ----- Content sections -----
  sectionGridTwo: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 'var(--spacing-2) var(--spacing-4)',
  },
  sectionGridOne: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: 'var(--spacing-2)',
  },
  amenityRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    paddingBlock: 8,
    minWidth: 0,
  },
  sleepingGrid: {display: 'flex', gap: 'var(--spacing-3)', flexWrap: 'wrap'},
  sleepingCard: {flex: '1 1 160px', minWidth: 160},
  // ----- Availability calendar strip -----
  // Deliberate horizontal scroller: 31 fixed-width day cells (see
  // responsive contract). The mask lives on this non-scrolling wrapper.
  stripWrap: {position: 'relative'},
  strip: {
    display: 'flex',
    gap: 4,
    overflowX: 'auto',
    paddingBlock: 4,
    WebkitOverflowScrolling: 'touch',
  },
  dayCell: {
    width: 44,
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 2,
    paddingBlock: 8,
    borderRadius: 'var(--radius-element)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-surface)',
    cursor: 'pointer',
    fontVariantNumeric: 'tabular-nums',
  },
  dayCellBooked: {
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
    cursor: 'not-allowed',
    textDecoration: 'line-through',
  },
  dayCellInRange: {
    backgroundColor: BRAND_SOFT,
    borderColor: BRAND_BORDER_SOFT,
  },
  dayCellEndpoint: {
    backgroundColor: BRAND_ACCENT,
    borderColor: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
  },
  legendSwatch: {
    width: 12,
    height: 12,
    borderRadius: 3,
    border: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  // ----- Booking widget -----
  bookingDatesGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    borderRadius: 'var(--radius-element)',
    border: 'var(--border-width) solid var(--color-border)',
    overflow: 'hidden',
  },
  bookingDateCell: {
    padding: '8px 12px',
    minWidth: 0,
  },
  bookingDateCellStart: {
    borderInlineEnd: 'var(--border-width) solid var(--color-border)',
  },
  guestsToggle: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    padding: '8px 12px',
    borderRadius: 'var(--radius-element)',
    border: 'var(--border-width) solid var(--color-border)',
    background: 'var(--color-background-surface)',
    cursor: 'pointer',
    textAlign: 'start',
  },
  stepperCount: {minWidth: 24, textAlign: 'center'},
  reserveButton: {
    width: '100%',
    backgroundColor: BRAND_ACCENT,
    borderColor: 'transparent',
    color: BRAND_ON_ACCENT,
  },
  rareFind: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 'var(--radius-element)',
    backgroundColor: BRAND_SOFT,
    border: \`var(--border-width) solid \${BRAND_BORDER_SOFT}\`,
  },
  feeRow: {
    display: 'flex',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: 12,
  },
  feeAmount: {fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  // ----- Reviews -----
  histogramRow: {display: 'flex', alignItems: 'center', gap: 10},
  histogramTrack: {
    flex: 1,
    height: 8,
    borderRadius: 999,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  histogramFill: {
    height: '100%',
    borderRadius: 999,
    backgroundColor: 'var(--color-text-primary)',
  },
  histogramCount: {
    width: 32,
    textAlign: 'end',
    fontVariantNumeric: 'tabular-nums',
    flexShrink: 0,
  },
  categoryRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBlock: 4,
  },
  // ----- Map placeholder -----
  // Schematic neighborhood map: token-pure gradient wash + grid "streets";
  // no geographic data, no tiles. The pin is the brand accent.
  mapStage: {
    position: 'relative',
    height: 260,
    borderRadius: 'var(--radius-container)',
    overflow: 'hidden',
    border: 'var(--border-width) solid var(--color-border)',
    background: [
      'repeating-linear-gradient(0deg, var(--color-border) 0 1px, transparent 1px 44px)',
      'repeating-linear-gradient(90deg, var(--color-border) 0 1px, transparent 1px 44px)',
      'radial-gradient(120% 90% at 20% 0%, light-dark(rgba(14, 116, 144, 0.14), rgba(34, 211, 238, 0.1)), transparent 55%)',
      'var(--color-background-muted)',
    ].join(', '),
  },
  mapPin: {
    position: 'absolute',
    left: '50%',
    top: '46%',
    transform: 'translate(-50%, -50%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    borderRadius: '50%',
    backgroundColor: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    boxShadow: 'var(--shadow-high)',
  },
  mapCaption: {
    position: 'absolute',
    left: 12,
    bottom: 12,
    paddingInline: 10,
    paddingBlock: 5,
    borderRadius: 'var(--radius-element)',
    backgroundColor: 'var(--color-background-surface)',
    border: 'var(--border-width) solid var(--color-border)',
    boxShadow: 'var(--shadow-low)',
  },
  neighborhoodRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    paddingBlock: 8,
    borderBottom: 'var(--border-width) solid var(--color-border)',
  },
};

// ============= HELPERS =============

function formatMoney(amount: number): string {
  return \`$\${amount.toLocaleString('en-US')}\`;
}

/**
 * Deterministic gradient "photography" keyed to the fixed per-photo hue
 * pair and pattern kind — zero image assets, zero randomness. The layers
 * are scheme-locked via styles.photoArt (see Color policy).
 */
function photoArtStyle(photo: Photo): CSSProperties {
  const [h1, h2] = photo.hues;
  let layers: string[];
  switch (photo.kind) {
    case 'sky':
      // Dusk gradient with a low sun glow and a dark treeline band.
      layers = [
        \`radial-gradient(80% 55% at 30% 62%, hsla(\${h1}, 80%, 66%, 0.55), transparent 60%)\`,
        \`linear-gradient(0deg, rgba(10, 10, 16, 0.72) 0 18%, transparent 34%)\`,
        \`linear-gradient(190deg, hsl(\${h2}, 42%, 30%) 0%, hsl(\${h1}, 58%, 44%) 100%)\`,
      ];
      break;
    case 'room':
      // Warm interior: window key light + soft floor bounce.
      layers = [
        \`radial-gradient(70% 90% at 76% 22%, hsla(\${h1}, 70%, 80%, 0.5), transparent 58%)\`,
        \`linear-gradient(0deg, rgba(12, 10, 8, 0.5) 0 12%, transparent 30%)\`,
        \`linear-gradient(160deg, hsl(\${h1}, 36%, 38%) 0%, hsl(\${h2}, 40%, 22%) 100%)\`,
      ];
      break;
    case 'wood':
      // Cedar paneling: soft plank stripes under a lamp glow.
      layers = [
        \`repeating-linear-gradient(90deg, hsla(\${h2}, 32%, 18%, 0.4) 0 3px, transparent 3px 34px)\`,
        \`radial-gradient(85% 70% at 28% 26%, hsla(\${h1}, 62%, 72%, 0.42), transparent 60%)\`,
        \`linear-gradient(150deg, hsl(\${h1}, 38%, 36%) 0%, hsl(\${h2}, 42%, 20%) 100%)\`,
      ];
      break;
    case 'water':
      // Ocean horizon: banded swells below a bright sky line.
      layers = [
        \`linear-gradient(0deg, transparent 0 55%, hsla(\${h1}, 55%, 82%, 0.4) 56%, transparent 62%)\`,
        \`repeating-linear-gradient(0deg, hsla(\${h2}, 48%, 20%, 0.35) 0 6px, transparent 6px 20px)\`,
        \`linear-gradient(0deg, hsl(\${h2}, 46%, 24%) 0%, hsl(\${h1}, 52%, 46%) 100%)\`,
      ];
      break;
  }
  return {background: layers.join(', ')};
}

// ============= HEADER =============

interface HeaderBarProps {
  isNarrow: boolean;
}

/** Wordmark + compact search summary pill + host/nav actions. */
function HeaderBar({isNarrow}: HeaderBarProps) {
  return (
    <HStack gap={3} vAlign="center">
      <div style={styles.wordmark}>
        <Icon icon={FlameIcon} size="md" color="inherit" />
        <span style={styles.wordmarkText}>Hearthstay</span>
      </div>
      <StackItem size="fill">
        {!isNarrow && (
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <button
              type="button"
              aria-label="Search stays: Mendocino, July 12 to 17, 2 guests"
              style={styles.searchPill}>
              <Text type="label">Mendocino</Text>
              <span style={styles.searchPillDivider} aria-hidden />
              <Text type="label">Jul 12 – 17</Text>
              <span style={styles.searchPillDivider} aria-hidden />
              <Text type="label" color="secondary">
                2 guests
              </Text>
              <span style={styles.searchPillButton} aria-hidden>
                <Icon icon={SearchIcon} size="xsm" color="inherit" />
              </span>
            </button>
          </div>
        )}
      </StackItem>
      <HStack gap={2} vAlign="center">
        {!isNarrow && (
          <Button label="Become a host" variant="ghost">
            Become a host
          </Button>
        )}
        <IconButton
          label="Language and region"
          tooltip="Language and region"
          icon={<Icon icon={GlobeIcon} size="sm" />}
          variant="ghost"
        />
        <IconButton
          label="Account menu"
          icon={<Icon icon={MenuIcon} size="sm" />}
          variant="secondary"
        />
        <Avatar name={HOST.name} size={32} />
      </HStack>
    </HStack>
  );
}

// ============= TITLE ROW =============

interface TitleRowProps {
  isSaved: boolean;
  onSaveToggle: () => void;
  isNarrow: boolean;
}

function TitleRow({isSaved, onSaveToggle, isNarrow}: TitleRowProps) {
  const facts = (
    <HStack gap={2} vAlign="center" wrap="wrap">
      <HStack gap={1} vAlign="center">
        <span style={styles.ratingStar} aria-hidden>
          ★
        </span>
        <Text type="label" hasTabularNumbers>
          {LISTING.ratingAvg}
        </Text>
        <Text type="label" color="secondary" hasTabularNumbers>
          ({LISTING.reviewCount} reviews)
        </Text>
      </HStack>
      <Text type="label" color="secondary">
        ·
      </Text>
      <span style={styles.hostChip}>
        <Icon icon={AwardIcon} size="xsm" color="secondary" />
        <Text type="supporting">Hearth Host</Text>
      </span>
      <Text type="label" color="secondary">
        ·
      </Text>
      <Text type="label" color="secondary">
        {LISTING.location}
      </Text>
    </HStack>
  );

  const actions = isNarrow ? (
    <HStack gap={1} vAlign="center">
      <IconButton
        label="Share this listing"
        tooltip="Share"
        icon={<Icon icon={Share2Icon} size="sm" />}
        variant="ghost"
      />
      <IconButton
        label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        tooltip={isSaved ? 'Saved' : 'Save'}
        icon={
          <span style={isSaved ? styles.savedHeart : styles.heartWrap}>
            <Icon icon={HeartIcon} size="sm" color="inherit" />
          </span>
        }
        variant="ghost"
        onClick={onSaveToggle}
      />
    </HStack>
  ) : (
    <HStack gap={2} vAlign="center">
      <Button
        label="Share this listing"
        variant="ghost"
        icon={<Icon icon={Share2Icon} size="sm" color="inherit" />}>
        Share
      </Button>
      <Button
        label={isSaved ? 'Remove from wishlist' : 'Save to wishlist'}
        variant="ghost"
        icon={
          <span style={isSaved ? styles.savedHeart : styles.heartWrap}>
            <Icon icon={HeartIcon} size="sm" color="inherit" />
          </span>
        }
        onClick={onSaveToggle}>
        {isSaved ? 'Saved' : 'Save'}
      </Button>
    </HStack>
  );

  return (
    <VStack gap={1}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <Heading level={1}>{LISTING.title}</Heading>
        </StackItem>
        {actions}
      </HStack>
      {facts}
    </VStack>
  );
}

// ============= PHOTO MOSAIC =============

interface PhotoTileProps {
  photo: Photo;
  onOpen: () => void;
  showChip?: boolean;
  style?: CSSProperties;
}

/** One mosaic tile: a real button over scheme-locked gradient art. */
function PhotoTile({photo, onOpen, showChip = false, style}: PhotoTileProps) {
  return (
    <button
      type="button"
      aria-label={\`Open photo: \${photo.label}\`}
      style={{...styles.photoButton, ...style}}
      onClick={onOpen}>
      <div style={{...styles.photoArt, ...photoArtStyle(photo)}} />
      {showChip && <span style={styles.photoChip}>{photo.label}</span>}
    </button>
  );
}

interface PhotoMosaicProps {
  onShowAll: () => void;
  isStacked: boolean;
}

/**
 * Wide: hero (2 rows) + four tiles in a 2fr/1fr/1fr grid. Stacked
 * (<=1024px): hero stage + horizontal 4-thumb strip (deliberate x-scroll).
 * The show-all chip always names the full photo count.
 */
function PhotoMosaic({onShowAll, isStacked}: PhotoMosaicProps) {
  const [hero, ...rest] = PHOTOS;
  const gridTiles = rest.slice(0, 4);

  const showAllChip = (
    <button type="button" style={styles.showAllChip} onClick={onShowAll}>
      <Icon icon={LayoutGridIcon} size="sm" color="inherit" />
      Show all {PHOTOS.length} photos
    </button>
  );

  if (isStacked) {
    return (
      <VStack gap={2}>
        <div style={styles.heroStage}>
          <PhotoTile photo={hero} onOpen={onShowAll} showChip />
          {showAllChip}
        </div>
        <div style={styles.thumbStrip}>
          {gridTiles.map(photo => (
            <PhotoTile
              key={photo.id}
              photo={photo}
              onOpen={onShowAll}
              style={styles.thumbTile}
            />
          ))}
        </div>
      </VStack>
    );
  }

  return (
    <div style={styles.mosaic}>
      <PhotoTile photo={hero} onOpen={onShowAll} showChip style={styles.mosaicHero} />
      {gridTiles.map(photo => (
        <PhotoTile key={photo.id} photo={photo} onOpen={onShowAll} />
      ))}
      {showAllChip}
    </div>
  );
}

interface PhotosDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

/** All 12 photos in a labeled 3-up grid. */
function PhotosDialog({isOpen, onOpenChange}: PhotosDialogProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      width="min(880px, 94vw)">
      <Layout
        header={
          <DialogHeader
            title={\`All photos · \${PHOTOS.length}\`}
            subtitle="Cedar & Sea — A-frame cabin, Mendocino"
            onOpenChange={onOpenChange}
          />
        }
        content={
          <LayoutContent label="All listing photos">
            <div style={styles.dialogPhotoGrid}>
              {PHOTOS.map(photo => (
                <VStack key={photo.id} gap={1}>
                  <div style={styles.dialogPhotoTile}>
                    <div style={{...styles.photoArt, ...photoArtStyle(photo)}} />
                  </div>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {photo.label}
                  </Text>
                </VStack>
              ))}
            </div>
          </LayoutContent>
        }
      />
    </Dialog>
  );
}

// ============= STAY DETAILS (host line, highlights, description) =============

/** "Entire cabin hosted by …" line with the capacity facts + host avatar. */
function HostLine() {
  return (
    <HStack gap={3} vAlign="center">
      <StackItem size="fill">
        <VStack gap={0}>
          <Heading level={2}>
            {LISTING.type} hosted by {HOST.name.split(' ')[0]}
          </Heading>
          <Text type="label" color="secondary" hasTabularNumbers>
            {LISTING.guestsMax} guests · {LISTING.bedrooms} bedrooms ·{' '}
            {LISTING.beds} beds · {LISTING.baths} baths
          </Text>
        </VStack>
      </StackItem>
      <Avatar name={HOST.name} size={48} />
    </HStack>
  );
}

function HighlightsList() {
  return (
    <VStack gap={3}>
      {HIGHLIGHTS.map(highlight => (
        <HStack key={highlight.id} gap={3} vAlign="start">
          <Icon icon={highlight.icon} size="md" color="secondary" />
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="body" weight="semibold">
                {highlight.title}
              </Text>
              <Text type="supporting" color="secondary">
                {highlight.body}
              </Text>
            </VStack>
          </StackItem>
        </HStack>
      ))}
    </VStack>
  );
}

function Description() {
  return (
    <VStack gap={2}>
      {DESCRIPTION_PARAGRAPHS.map(paragraph => (
        <Text key={paragraph.slice(0, 24)} type="body">
          {paragraph}
        </Text>
      ))}
    </VStack>
  );
}

// ============= SLEEPING ARRANGEMENTS =============

function SleepingArrangements() {
  return (
    <VStack gap={3}>
      <Heading level={2}>Where you&apos;ll sleep</Heading>
      <div style={styles.sleepingGrid}>
        {SLEEPING_ROOMS.map(room => (
          <Card key={room.id} style={styles.sleepingCard}>
            <VStack gap={2}>
              <Icon icon={room.icon} size="md" color="secondary" />
              <VStack gap={0}>
                <Text type="body" weight="semibold">
                  {room.name}
                </Text>
                <Text type="supporting" color="secondary">
                  {room.beds}
                </Text>
              </VStack>
            </VStack>
          </Card>
        ))}
      </div>
    </VStack>
  );
}

// ============= AMENITIES =============

interface AmenityGridProps {
  isNarrow: boolean;
}

function AmenityGrid({isNarrow}: AmenityGridProps) {
  return (
    <VStack gap={3}>
      <Heading level={2}>What this place offers</Heading>
      <div style={isNarrow ? styles.sectionGridOne : styles.sectionGridTwo}>
        {AMENITIES.map(amenity => (
          <div key={amenity.id} style={styles.amenityRow}>
            <Icon icon={amenity.icon} size="md" color="secondary" />
            <Text type="body">{amenity.label}</Text>
          </div>
        ))}
      </div>
      <div>
        <Button label={\`Show all \${AMENITY_TOTAL} amenities\`} variant="secondary">
          Show all {AMENITY_TOTAL} amenities
        </Button>
      </div>
    </VStack>
  );
}

// ============= AVAILABILITY STRIP =============

/** True when every night in [from, to) is open (checkout morning may abut
 * a booked night, so \`to\` itself is not checked). */
function rangeIsClear(from: number, to: number): boolean {
  for (let day = from; day < to; day++) {
    if (BOOKED_DAYS.has(day)) {
      return false;
    }
  }
  return true;
}

interface CalendarStripProps {
  checkIn: number | null;
  checkOut: number | null;
  onSelectDay: (day: number) => void;
}

/**
 * July 2026 as one horizontal strip of 31 fixed 44px day cells (deliberate
 * x-scroll, see responsive contract). Booked nights are struck and
 * disabled; tapping an open day sets check-in, then check-out.
 */
function CalendarStrip({checkIn, checkOut, onSelectDay}: CalendarStripProps) {
  const nights =
    checkIn !== null && checkOut !== null ? checkOut - checkIn : null;

  const heading =
    nights !== null
      ? \`\${nights} night\${nights === 1 ? '' : 's'} in Mendocino\`
      : 'Select check-in date';
  const subheading =
    checkIn !== null && checkOut !== null
      ? \`\${dateLabel(checkIn)} – \${dateLabel(checkOut)}\`
      : checkIn !== null
        ? \`Check-in \${dateLabel(checkIn)} — now pick a check-out day\`
        : 'Tap an open day below to start your stay';

  const legend = (
    <HStack gap={3} vAlign="center" wrap="wrap">
      <HStack gap={1} vAlign="center">
        <span style={styles.legendSwatch} aria-hidden />
        <Text type="supporting" color="secondary">
          Open
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <span
          style={{
            ...styles.legendSwatch,
            backgroundColor: 'var(--color-background-muted)',
          }}
          aria-hidden
        />
        <Text type="supporting" color="secondary">
          Booked
        </Text>
      </HStack>
      <HStack gap={1} vAlign="center">
        <span
          style={{
            ...styles.legendSwatch,
            backgroundColor: BRAND_ACCENT,
            borderColor: BRAND_ACCENT,
          }}
          aria-hidden
        />
        <Text type="supporting" color="secondary">
          Your stay
        </Text>
      </HStack>
    </HStack>
  );

  const cells = [];
  for (let day = 1; day <= DAYS_IN_MONTH; day++) {
    const isBooked = BOOKED_DAYS.has(day);
    const isEndpoint = day === checkIn || day === checkOut;
    const isInRange =
      checkIn !== null &&
      checkOut !== null &&
      day > checkIn &&
      day < checkOut;
    const cellStyle: CSSProperties = {
      ...styles.dayCell,
      ...(isBooked ? styles.dayCellBooked : undefined),
      ...(isInRange ? styles.dayCellInRange : undefined),
      ...(isEndpoint ? styles.dayCellEndpoint : undefined),
    };
    cells.push(
      <button
        key={day}
        type="button"
        disabled={isBooked}
        aria-label={\`July \${day}, 2026 — \${
          isBooked ? 'booked' : isEndpoint ? 'selected' : 'open'
        }\`}
        aria-pressed={isEndpoint || isInRange}
        style={cellStyle}
        onClick={() => onSelectDay(day)}>
        <span style={{fontSize: 10, opacity: 0.8}}>
          {WEEKDAY_LETTERS[weekdayOf(day)]}
        </span>
        <span style={{fontSize: 14, fontWeight: 600}}>{day}</span>
      </button>,
    );
  }

  return (
    <VStack gap={2}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <VStack gap={0}>
            <Heading level={2}>{heading}</Heading>
            <Text type="supporting" color="secondary">
              {subheading}
            </Text>
          </VStack>
        </StackItem>
        <Badge label={MONTH_LABEL} variant="neutral" />
      </HStack>
      {legend}
      <div style={styles.stripWrap}>
        <div style={styles.strip} aria-label="July 2026 availability">
          {cells}
        </div>
      </div>
      <Text type="supporting" color="secondary">
        Minimum stay 2 nights · Check-in after 3:00 PM, check-out by 11:00 AM
      </Text>
    </VStack>
  );
}

// ============= BOOKING WIDGET =============

interface GuestStepperRowProps {
  label: string;
  supporting: string;
  count: number;
  min: number;
  canIncrement: boolean;
  onChange: (next: number) => void;
}

function GuestStepperRow({
  label,
  supporting,
  count,
  min,
  canIncrement,
  onChange,
}: GuestStepperRowProps) {
  return (
    <HStack gap={2} vAlign="center">
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="body" weight="semibold">
            {label}
          </Text>
          <Text type="supporting" color="secondary">
            {supporting}
          </Text>
        </VStack>
      </StackItem>
      <IconButton
        label={\`Decrease \${label.toLowerCase()}\`}
        icon={<Icon icon={MinusIcon} size="sm" />}
        variant="secondary"
        size="sm"
        isDisabled={count <= min}
        onClick={() => onChange(count - 1)}
      />
      <Text type="label" hasTabularNumbers style={styles.stepperCount}>
        {count}
      </Text>
      <IconButton
        label={\`Increase \${label.toLowerCase()}\`}
        icon={<Icon icon={PlusIcon} size="sm" />}
        variant="secondary"
        size="sm"
        isDisabled={!canIncrement}
        onClick={() => onChange(count + 1)}
      />
    </HStack>
  );
}

interface BookingWidgetProps {
  checkIn: number | null;
  checkOut: number | null;
  adults: number;
  onAdultsChange: (next: number) => void;
  childCount: number;
  onChildCountChange: (next: number) => void;
  infants: number;
  onInfantsChange: (next: number) => void;
  isGuestsOpen: boolean;
  onGuestsOpenToggle: () => void;
  isReserved: boolean;
  onReserve: () => void;
}

/**
 * Sticky booking Card. Every number derives from the selected range:
 * rate x nights = subtotal, + cleaning + service (14.2% of the night
 * subtotal, rounded) = total before taxes. Reserve stays disabled until
 * both dates exist.
 */
function BookingWidget(props: BookingWidgetProps) {
  const {checkIn, checkOut, adults, childCount, infants} = props;
  const nights =
    checkIn !== null && checkOut !== null ? checkOut - checkIn : null;
  const guestTotal = adults + childCount; // infants do not count toward the cap
  const canAddGuest = guestTotal < LISTING.guestsMax;

  const subtotal = nights !== null ? nights * LISTING.nightlyRate : null;
  const serviceFee =
    subtotal !== null ? Math.round(subtotal * LISTING.serviceFeeRate) : null;
  const total =
    subtotal !== null && serviceFee !== null
      ? subtotal + LISTING.cleaningFee + serviceFee
      : null;

  const guestSummary = \`\${guestTotal} guest\${guestTotal === 1 ? '' : 's'}\${
    infants > 0 ? \`, \${infants} infant\${infants === 1 ? '' : 's'}\` : ''
  }\`;

  return (
    <Card style={{boxShadow: 'var(--shadow-high)'}}>
      <VStack gap={3}>
        <HStack gap={1} vAlign="end" wrap="wrap">
          <Heading level={2}>{formatMoney(LISTING.nightlyRate)}</Heading>
          <Text type="label" color="secondary">
            night
          </Text>
          <StackItem size="fill">
            <div style={{textAlign: 'end'}}>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                ★ {LISTING.ratingAvg} · {LISTING.reviewCount} reviews
              </Text>
            </div>
          </StackItem>
        </HStack>

        <div style={styles.bookingDatesGrid}>
          <div style={{...styles.bookingDateCell, ...styles.bookingDateCellStart}}>
            <VStack gap={0}>
              <Text type="supporting" color="secondary">
                CHECK-IN
              </Text>
              <Text type="label" hasTabularNumbers>
                {dateLabel(checkIn)}
              </Text>
            </VStack>
          </div>
          <div style={styles.bookingDateCell}>
            <VStack gap={0}>
              <Text type="supporting" color="secondary">
                CHECK-OUT
              </Text>
              <Text type="label" hasTabularNumbers>
                {dateLabel(checkOut)}
              </Text>
            </VStack>
          </div>
        </div>

        <VStack gap={2}>
          <button
            type="button"
            style={styles.guestsToggle}
            aria-expanded={props.isGuestsOpen}
            onClick={props.onGuestsOpenToggle}>
            <VStack gap={0}>
              <Text type="supporting" color="secondary">
                GUESTS
              </Text>
              <Text type="label">{guestSummary}</Text>
            </VStack>
            <Icon
              icon={props.isGuestsOpen ? ChevronUpIcon : ChevronDownIcon}
              size="sm"
              color="secondary"
            />
          </button>
          {props.isGuestsOpen && (
            <VStack gap={2}>
              <GuestStepperRow
                label="Adults"
                supporting="Age 13+"
                count={adults}
                min={1}
                canIncrement={canAddGuest}
                onChange={props.onAdultsChange}
              />
              <GuestStepperRow
                label="Children"
                supporting="Ages 2–12"
                count={childCount}
                min={0}
                canIncrement={canAddGuest}
                onChange={props.onChildCountChange}
              />
              <GuestStepperRow
                label="Infants"
                supporting="Under 2 — don't count toward the 6-guest max"
                count={infants}
                min={0}
                canIncrement={infants < 2}
                onChange={props.onInfantsChange}
              />
            </VStack>
          )}
        </VStack>

        <Button
          label={props.isReserved ? 'Reservation requested' : 'Reserve'}
          variant="primary"
          size="lg"
          isDisabled={nights === null || props.isReserved}
          style={styles.reserveButton}
          onClick={props.onReserve}>
          {props.isReserved ? 'Reservation requested' : 'Reserve'}
        </Button>
        <div style={{textAlign: 'center'}}>
          <Text type="supporting" color="secondary">
            {props.isReserved
              ? \`Maren usually responds \${HOST.responseTime}\`
              : nights === null
                ? 'Pick a check-out day on the calendar to see the total'
                : "You won't be charged yet"}
          </Text>
        </div>

        {nights !== null && subtotal !== null && serviceFee !== null && total !== null && (
          <VStack gap={2}>
            <div style={styles.feeRow}>
              <Text type="body">
                {formatMoney(LISTING.nightlyRate)} × {nights} night
                {nights === 1 ? '' : 's'}
              </Text>
              <Text type="body" hasTabularNumbers style={styles.feeAmount}>
                {formatMoney(subtotal)}
              </Text>
            </div>
            <div style={styles.feeRow}>
              <Text type="body">Cleaning fee</Text>
              <Text type="body" hasTabularNumbers style={styles.feeAmount}>
                {formatMoney(LISTING.cleaningFee)}
              </Text>
            </div>
            <div style={styles.feeRow}>
              <Text type="body">Hearthstay service fee</Text>
              <Text type="body" hasTabularNumbers style={styles.feeAmount}>
                {formatMoney(serviceFee)}
              </Text>
            </div>
            <Divider />
            <div style={styles.feeRow}>
              <Text type="body" weight="semibold">
                Total before taxes
              </Text>
              <Text type="body" weight="semibold" hasTabularNumbers style={styles.feeAmount}>
                {formatMoney(total)}
              </Text>
            </div>
          </VStack>
        )}

        <div style={styles.rareFind}>
          <Icon icon={GemIcon} size="md" color="secondary" />
          <Text type="supporting">
            <strong>This is a rare find.</strong> Maren&apos;s place is
            usually booked in July.
          </Text>
        </div>
      </VStack>
    </Card>
  );
}

// ============= REVIEWS =============

interface ReviewsSectionProps {
  isNarrow: boolean;
}

function ReviewsSection({isNarrow}: ReviewsSectionProps) {
  const maxCount = RATING_HISTOGRAM[0].count;

  const histogram = (
    <VStack gap={1}>
      {RATING_HISTOGRAM.map(row => (
        <div key={row.stars} style={styles.histogramRow}>
          <Text
            type="supporting"
            color="secondary"
            hasTabularNumbers
            style={{width: 12, flexShrink: 0}}>
            {row.stars}
          </Text>
          <div style={styles.histogramTrack}>
            <div
              style={{
                ...styles.histogramFill,
                width: \`\${(row.count / maxCount) * 100}%\`,
              }}
            />
          </div>
          <Text
            type="supporting"
            color="secondary"
            hasTabularNumbers
            style={styles.histogramCount}>
            {row.count}
          </Text>
        </div>
      ))}
    </VStack>
  );

  const categories = (
    <div style={isNarrow ? styles.sectionGridOne : styles.sectionGridTwo}>
      {CATEGORY_RATINGS.map(category => (
        <div key={category.id} style={styles.categoryRow}>
          <Text type="supporting" color="secondary">
            {category.label}
          </Text>
          <Text type="label" hasTabularNumbers>
            {category.score}
          </Text>
        </div>
      ))}
    </div>
  );

  return (
    <VStack gap={4}>
      <HStack gap={2} vAlign="center">
        <span style={{...styles.ratingStar, fontSize: 18}} aria-hidden>
          ★
        </span>
        <Heading level={2}>
          {LISTING.ratingAvg} · {LISTING.reviewCount} reviews
        </Heading>
      </HStack>

      <div style={isNarrow ? styles.sectionGridOne : styles.sectionGridTwo}>
        <VStack gap={2}>
          <Text type="label" color="secondary">
            Overall rating
          </Text>
          {histogram}
        </VStack>
        <VStack gap={2}>
          <Text type="label" color="secondary">
            Category scores
          </Text>
          {categories}
        </VStack>
      </div>

      <Divider />

      <div style={isNarrow ? styles.sectionGridOne : styles.sectionGridTwo}>
        {REVIEWS.map(review => (
          <VStack key={review.id} gap={2}>
            <HStack gap={2} vAlign="center">
              <Avatar name={review.name} size={40} />
              <VStack gap={0}>
                <Text type="body" weight="semibold">
                  {review.name}
                </Text>
                <Text type="supporting" color="secondary">
                  {review.date} · {review.stayNote}
                </Text>
              </VStack>
            </HStack>
            <Text type="body">{review.text}</Text>
          </VStack>
        ))}
      </div>

      <div>
        <Button
          label={\`Show all \${LISTING.reviewCount} reviews\`}
          variant="secondary">
          Show all {LISTING.reviewCount} reviews
        </Button>
      </div>
    </VStack>
  );
}

// ============= HOST CARD =============

function HostCard() {
  return (
    <Card>
      <VStack gap={3}>
        <HStack gap={3} vAlign="center">
          <Avatar name={HOST.name} size={64} />
          <StackItem size="fill">
            <VStack gap={0}>
              <Heading level={2}>Hosted by {HOST.name}</Heading>
              <Text type="supporting" color="secondary">
                {HOST.since} · {HOST.listingCount} listings
              </Text>
            </VStack>
          </StackItem>
          <span style={styles.hostChip}>
            <Icon icon={AwardIcon} size="xsm" color="secondary" />
            <Text type="supporting">Hearth Host</Text>
          </span>
        </HStack>

        <HStack gap={4} vAlign="center" wrap="wrap">
          <HStack gap={1} vAlign="center">
            <span style={styles.ratingStar} aria-hidden>
              ★
            </span>
            <Text type="supporting" hasTabularNumbers>
              {HOST.reviewTotal} reviews across listings
            </Text>
          </HStack>
          <HStack gap={1} vAlign="center">
            <Icon icon={ShieldCheckIcon} size="sm" color="secondary" />
            <Text type="supporting">Identity verified</Text>
          </HStack>
        </HStack>

        <VStack gap={1}>
          <Text type="supporting" color="secondary">
            Response rate: {HOST.responseRate}
          </Text>
          <Text type="supporting" color="secondary">
            Responds {HOST.responseTime}
          </Text>
        </VStack>

        <div>
          <Button
            label={\`Message \${HOST.name.split(' ')[0]}\`}
            variant="secondary"
            icon={<Icon icon={MessageSquareIcon} size="sm" color="inherit" />}>
            Message host
          </Button>
        </div>

        <Text type="supporting" color="secondary">
          To protect your payment, always communicate and pay through
          Hearthstay.
        </Text>
      </VStack>
    </Card>
  );
}

// ============= MAP & NEIGHBORHOOD =============

interface MapSectionProps {
  isNarrow: boolean;
}

/** Schematic map placeholder (token-pure grid wash, brand-accent pin) with
 * the neighborhood-highlights list beside it. */
function MapSection({isNarrow}: MapSectionProps) {
  return (
    <VStack gap={3}>
      <Heading level={2}>Where you&apos;ll be</Heading>
      <Text type="label" color="secondary">
        {LISTING.location}
      </Text>
      <div style={styles.mapStage} role="img" aria-label="Schematic neighborhood map of Mendocino with the cabin at the center">
        <Tooltip content="Cedar & Sea — exact location after booking">
          <div style={styles.mapPin}>
            <Icon icon={MapPinIcon} size="md" color="inherit" />
          </div>
        </Tooltip>
        <div style={styles.mapCaption}>
          <Text type="supporting" color="secondary">
            Exact location provided after booking
          </Text>
        </div>
      </div>
      <div style={isNarrow ? styles.sectionGridOne : styles.sectionGridTwo}>
        {NEIGHBORHOOD.map(spot => (
          <div key={spot.id} style={styles.neighborhoodRow}>
            <HStack gap={2} vAlign="center">
              <Icon icon={MapPinIcon} size="sm" color="secondary" />
              <Text type="body">{spot.name}</Text>
            </HStack>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {spot.distance}
            </Text>
          </div>
        ))}
      </div>
    </VStack>
  );
}

// ============= PAGE =============

export default function VacationRentalListingTemplate() {
  // Stay selection: day-of-July numbers; checkout picks complete a range.
  const [checkIn, setCheckIn] = useState<number | null>(DEFAULT_CHECK_IN);
  const [checkOut, setCheckOut] = useState<number | null>(DEFAULT_CHECK_OUT);
  const [adults, setAdults] = useState(2);
  const [childCount, setChildCount] = useState(0);
  const [infants, setInfants] = useState(0);
  const [isGuestsOpen, setIsGuestsOpen] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReserved, setIsReserved] = useState(false);
  const [isPhotosOpen, setIsPhotosOpen] = useState(false);

  // Responsive contract: <=1024px the booking widget renders inline
  // between the availability strip and reviews (sticky dropped) and the
  // mosaic becomes hero + thumb strip; <=760px the header search pill
  // hides, title actions collapse to icons, and grids go single-column.
  const isStacked = useMediaQuery('(max-width: 1024px)');
  const isNarrow = useMediaQuery('(max-width: 760px)');

  const handleSelectDay = (day: number) => {
    if (BOOKED_DAYS.has(day)) {
      return;
    }
    setIsReserved(false);
    if (checkIn === null || checkOut !== null) {
      // Start a fresh range.
      setCheckIn(day);
      setCheckOut(null);
    } else if (day > checkIn && day - checkIn >= 2 && rangeIsClear(checkIn, day)) {
      // Valid checkout: 2-night minimum, no booked night in between.
      setCheckOut(day);
    } else {
      // Too short, backwards, or crosses a booked night — restart there.
      setCheckIn(day);
      setCheckOut(null);
    }
  };

  const bookingWidget = (
    <BookingWidget
      checkIn={checkIn}
      checkOut={checkOut}
      adults={adults}
      onAdultsChange={setAdults}
      childCount={childCount}
      onChildCountChange={setChildCount}
      infants={infants}
      onInfantsChange={setInfants}
      isGuestsOpen={isGuestsOpen}
      onGuestsOpenToggle={() => setIsGuestsOpen(previous => !previous)}
      isReserved={isReserved}
      onReserve={() => setIsReserved(true)}
    />
  );

  const detailSections = (
    <VStack gap={4}>
      <HostLine />
      <Divider />
      <HighlightsList />
      <Divider />
      <Description />
      <Divider />
      <SleepingArrangements />
      <Divider />
      <AmenityGrid isNarrow={isNarrow} />
      <Divider />
      <CalendarStrip
        checkIn={checkIn}
        checkOut={checkOut}
        onSelectDay={handleSelectDay}
      />
    </VStack>
  );

  const lowerSections = (
    <VStack gap={4}>
      <Divider />
      <ReviewsSection isNarrow={isNarrow} />
      <Divider />
      <HostCard />
      <Divider />
      <MapSection isNarrow={isNarrow} />
    </VStack>
  );

  let body: ReactNode;
  if (isStacked) {
    // One column: the booking widget sits inline between the availability
    // strip and reviews so price math stays adjacent to date selection.
    body = (
      <VStack gap={4}>
        {detailSections}
        {bookingWidget}
        {lowerSections}
      </VStack>
    );
  } else {
    body = (
      <div style={styles.columns}>
        <div style={styles.leftColumn}>
          <VStack gap={4}>
            {detailSections}
            {lowerSections}
          </VStack>
        </div>
        <div style={styles.bookingRail}>
          <div style={styles.bookingSticky}>{bookingWidget}</div>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HeaderBar isNarrow={isNarrow} />
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} label="Vacation rental listing">
            <div style={styles.wrapper}>
              <VStack gap={4}>
                <TitleRow
                  isSaved={isSaved}
                  onSaveToggle={() => setIsSaved(previous => !previous)}
                  isNarrow={isNarrow}
                />
                <PhotoMosaic
                  onShowAll={() => setIsPhotosOpen(true)}
                  isStacked={isStacked}
                />
                {body}
              </VStack>
            </div>
          </LayoutContent>
        }
      />
      <PhotosDialog isOpen={isPhotosOpen} onOpenChange={setIsPhotosOpen} />
    </div>
  );
}
`;export{e as default};