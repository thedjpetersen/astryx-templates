// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one live auction lot — 'Harbor Dusk at
 *   Kestrel Bay', Lot 217 of the Kestrel & Gray Evening Sale, estimate
 *   $12,000–18,000, opening bid $9,500 at $250 increments; a 12-entry
 *   scripted bid tape across four fixture paddles with per-bidder colors and
 *   in-room / phone / online channels; an 8-entry watcher-join tape; a
 *   tick-counter auction clock with a 60-tick base countdown, a 10-tick
 *   anti-snipe window that extends the close to bid-tick + 15, and a hard
 *   close at tick 100. No Date.now, no Math.random, no network assets)
 * @output Live auction room on a replayable bid tape: a LayoutHeader with
 *   the sale title, LIVE Badge, and EyeIcon watcher count; a lot hero with a
 *   scheme-locked SVG "painting", catalog details, a hero price that pops
 *   with a tween on every ratchet, and a countdown chip that flips to
 *   urgency red inside 10 ticks and pulses '+15s anti-snipe' on extensions;
 *   a personal-state strip that flips between highest-bidder green and an
 *   outbid red strip with a one-tap rebid; bid controls (ZapIcon quick bid
 *   at the ask, a +/- increment stepper for jump bids, and a BotIcon proxy
 *   card whose max-stepper + arm ToggleButton auto-counters incoming bids as
 *   visible 'Proxy for you' ladder rows until the max is exhausted); a
 *   per-bidder-colored bid-history ladder with opening / proxy / extended
 *   tags; a presence row of paddle avatars plus watchers who join on
 *   scripted ticks; a going-once / going-twice / hammer three-tick finale
 *   ending in a celebratory (confetti-free) SOLD panel that knows whether
 *   you won; and a bottom transport (restart / step / play / step, tick
 *   clock, scrub Slider, 0.5–2x speed). The countdown freezes on pause
 *   because the clock IS the tick counter — auction state is a pure fold of
 *   (bid tape + your recorded bids + proxy setting) up to the tick, so
 *   scrubbing backward un-bids cleanly
 * @position Page template; emitted by `astryx template live-auction-room`
 *
 * Frame: Layout height="fill". LayoutHeader carries the sale crumb, lot
 * title, LIVE/SOLD Badge, and watcher chip. LayoutContent (padding 0) is a
 * column: a scrolling lot column (hero, price block, state strip, finale
 * strip or SOLD panel, bid controls, and — under 1024px — the inline ladder
 * and presence sections) above a compact sticky bid bar at <=640px.
 * LayoutPanel end 320 hosts the ladder, presence, and catalog details.
 * LayoutFooter is the transport. Choose over live-event-chat when the live
 * surface is a contested price state machine rather than message flow, and
 * over subscription-billing-portal when money moves by competitive bidding,
 * not plan management.
 *
 * Interaction contract:
 * - Transport: play/pause (Space), step back/forward (J/K or buttons),
 *   restart, scrub Slider, 0.5x/1x/2x speed. Only the tick advances on the
 *   playback interval; every ladder row, price, countdown, presence avatar,
 *   and phase is re-derived from the fixtures at that tick.
 * - Bidding: quick bid (button or B key) records a bid at the current tick;
 *   the stepper composes ask + N increments for jump bids; both feed the
 *   same placeBid commit path. Your rows apply in the fold only while they
 *   still beat the ladder, so rewinding past a bid removes it cleanly.
 * - Proxy: arming records the arm tick; from then on every incoming bid
 *   that beats you is auto-countered at +1 increment up to your max, as
 *   system rows in the ladder. Exhaustion is called out in the proxy card
 *   and the outbid strip.
 * - Anti-snipe: any applied bid landing within 10 ticks of the close pushes
 *   the close to bid-tick + 15 (hard cap tick 100); the countdown chip
 *   pulses and shows an 'Extended' token for 3 ticks after.
 * - Finale: remaining 3/2/1 render going-once / going-twice / hammer strips;
 *   remaining 0 is SOLD. Playback auto-pauses two ticks after the hammer.
 *
 * Responsive contract:
 * - >1024px: header | lot column (scrolls) + ladder/presence panel 320 |
 *   transport footer.
 * - <=1024px: the panel hides; the ladder, presence row, and catalog
 *   details render inline below the bid controls so nothing is lost.
 * - <=640px: the hero stacks (artwork above the catalog block); the desktop
 *   bid controls collapse and a sticky bid bar docks above the transport
 *   with a -/+ quick-bid stepper and Bid button at >=40px targets; the
 *   header drops the sale crumb; the catalog token row is the one
 *   deliberate overflow-x scroller. No hover-only interactions — tooltips
 *   only restate visible text and every action is a button.
 * - Motion (price pop, countdown pulse, finale pulse, join pop, SOLD
 *   scale-in) is JS-gated on prefers-reduced-motion; reduced motion gets
 *   instant state flips with the same colors and tokens.
 *
 * Container policy (bidding-floor archetype): frame-first rows, strips, and
 * panels — the ladder is hand-rolled rows, the state strip and finale strip
 * are tinted divs, catalog details are a List. No Cards.
 *
 * Color policy: token-pure. Every color is a var(--color-*) token, a
 * color-mix() over tokens, or an explicit light-dark() pair — bidder
 * identities, urgency reds, and winning greens are all light-dark() pairs
 * audited in dark mode. The one exception is the lot artwork SVG: a
 * painting's pigments do not follow the UI scheme, so its hex fills are a
 * documented scheme-locked surface (framed by token-derived chrome).
 */

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from 'react';

import {
  BotIcon,
  CrownIcon,
  EyeIcon,
  GavelIcon,
  MinusIcon,
  PauseIcon,
  PlayIcon,
  PlusIcon,
  RotateCcwIcon,
  SkipBackIcon,
  SkipForwardIcon,
  SparklesIcon,
  TimerIcon,
  UsersIcon,
  ZapIcon,
} from 'lucide-react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutFooter,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {Kbd} from '@astryxdesign/core/Kbd';
import {List, ListItem} from '@astryxdesign/core/List';
import {
  SegmentedControl,
  SegmentedControlItem,
} from '@astryxdesign/core/SegmentedControl';
import {Slider} from '@astryxdesign/core/Slider';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ============= AUCTION CONSTANTS =============
// The clock is the tick counter: 1 tick = 1 auction second. Pausing the
// transport freezes the countdown because nothing else advances time.

const OPENING_BID = 9500;
const INCREMENT = 250;
/** Countdown base: the lot closes at tick 60 unless a bid extends it. */
const BASE_CLOSE_TICK = 60;
/** Bids landing within this many ticks of the close trigger anti-snipe. */
const SNIPE_WINDOW = 10;
/** An anti-snipe bid pushes the close to bid-tick + this. */
const EXTEND_TICKS = 15;
/** Extensions never push the close past this tick. */
const HARD_CLOSE_TICK = 100;
const TOTAL_TICKS = 104;
/** 1x playback cadence (ms per tick) — the interval only advances the tick. */
const BASE_TICK_MS = 700;
const WATCHER_BASE = 214;
/** Each landed bid draws this many extra watchers (derived, deterministic). */
const WATCHERS_PER_BID = 3;
/** Jump-bid stepper range: ask + (1..MAX_JUMP_STEPS) increments. */
const MAX_JUMP_STEPS = 8;
const PROXY_MIN = 10000;
const PROXY_MAX_CAP = 20000;
const PROXY_DEFAULT = 12500;

// ============= EXPLICIT LIGHT-DARK PAIRS =============
// Urgency reds and winning greens are the spec's headline pairs: saturated
// on light surfaces, lifted on dark so they read over dark backgrounds.

const URGENT_RED = 'light-dark(#B91C1C, #F87171)';
const WIN_GREEN = 'light-dark(#15803D, #4ADE80)';

// ============= KEYFRAMES =============
// All animation is presentational and JS-gated on prefers-reduced-motion;
// the underlying values are always the pure per-tick derivation.

const KEYFRAME_CSS = `
@keyframes lar-price-pop {
  from { transform: translateY(10px) scale(0.96); opacity: 0.2; }
  to { transform: translateY(0) scale(1); opacity: 1; }
}
@keyframes lar-extend-pulse {
  0%, 100% { box-shadow: 0 0 0 0 transparent; }
  50% { box-shadow: 0 0 0 6px color-mix(in srgb, ${URGENT_RED} 35%, transparent); }
}
@keyframes lar-finale-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.55; }
}
@keyframes lar-sold-in {
  from { transform: scale(0.92); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
@keyframes lar-join-pop {
  from { transform: scale(0.5); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
`;

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Content column: scrolling lot column above the (mobile) sticky bid bar.
  contentRoot: {
    height: '100%',
    minHeight: 0,
    display: 'flex',
    flexDirection: 'column',
  },
  contentScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-4)',
  },
  // Lot hero: artwork beside the catalog block; wraps to a stack <=640px.
  heroRow: {
    display: 'flex',
    gap: 'var(--spacing-4)',
    flexWrap: 'wrap',
  },
  heroInfo: {flex: 1, minWidth: 240},
  // Artwork chrome is token-derived; only the painting inside is hex.
  artworkFrame: {
    width: 260,
    maxWidth: '100%',
    padding: 8,
    borderRadius: 'var(--radius-element)',
    border: '1px solid color-mix(in srgb, var(--color-border) 70%, var(--color-text-secondary))',
    backgroundColor: 'var(--color-background-secondary)',
    boxShadow: 'var(--shadow-low)',
    alignSelf: 'flex-start',
  },
  artworkSvg: {display: 'block', width: '100%', height: 'auto', borderRadius: 4},
  // <=640px: the catalog token row is the one deliberate overflow-x lane.
  catalogTokens: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    overflowX: 'auto',
    whiteSpace: 'nowrap',
    paddingBottom: 2,
  },
  // Price block: hero amount + countdown chip.
  priceRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 'var(--spacing-4)',
    flexWrap: 'wrap',
    rowGap: 'var(--spacing-2)',
  },
  priceValue: {
    display: 'inline-block',
    fontSize: 40,
    lineHeight: 1.05,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    letterSpacing: '-0.01em',
  },
  countdownChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '6px 12px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  countdownUrgent: {
    border: `1px solid color-mix(in srgb, ${URGENT_RED} 60%, var(--color-border))`,
    backgroundColor: `color-mix(in srgb, ${URGENT_RED} 12%, var(--color-background-muted))`,
  },
  // Personal-state strip: highest-bidder green vs outbid red.
  stateStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
    rowGap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-element)',
  },
  stateWinning: {
    border: `1px solid color-mix(in srgb, ${WIN_GREEN} 45%, var(--color-border))`,
    backgroundColor: `color-mix(in srgb, ${WIN_GREEN} 12%, var(--color-background-primary))`,
  },
  stateOutbid: {
    border: `1px solid color-mix(in srgb, ${URGENT_RED} 45%, var(--color-border))`,
    backgroundColor: `color-mix(in srgb, ${URGENT_RED} 10%, var(--color-background-primary))`,
  },
  stateIdle: {
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Going once / twice / hammer finale strip.
  finaleStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    borderRadius: 'var(--radius-element)',
    border: `1px solid color-mix(in srgb, ${URGENT_RED} 55%, var(--color-border))`,
    backgroundColor: `color-mix(in srgb, ${URGENT_RED} 14%, var(--color-background-primary))`,
  },
  // Celebratory (confetti-free) SOLD panel.
  soldPanel: {
    padding: 'var(--spacing-4)',
    borderRadius: 'var(--radius-element)',
    textAlign: 'center',
  },
  soldWon: {
    border: `1.5px solid color-mix(in srgb, ${WIN_GREEN} 55%, var(--color-border))`,
    backgroundColor: `color-mix(in srgb, ${WIN_GREEN} 14%, var(--color-background-primary))`,
  },
  soldLost: {
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Bid controls: quick bid + jump stepper + proxy card.
  controlsRow: {
    display: 'flex',
    gap: 'var(--spacing-3)',
    flexWrap: 'wrap',
    alignItems: 'stretch',
  },
  controlCard: {
    flex: 1,
    minWidth: 250,
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-element)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-primary)',
  },
  stepperRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
  },
  stepperValue: {
    minWidth: 92,
    textAlign: 'center',
    fontVariantNumeric: 'tabular-nums',
  },
  // Ladder rows: hand-rolled, newest on top, leader tinted green.
  ladderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: '6px var(--spacing-2)',
    borderRadius: 'var(--radius-element)',
  },
  ladderLeading: {
    backgroundColor: `color-mix(in srgb, ${WIN_GREEN} 12%, transparent)`,
  },
  paddleDot: {width: 10, height: 10, borderRadius: '50%', flexShrink: 0},
  ladderAmount: {
    marginLeft: 'auto',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Presence: avatar row with join pop-ins.
  presenceRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
  },
  presenceSeat: {display: 'inline-flex'},
  presenceRing: {
    display: 'inline-flex',
    borderRadius: '50%',
    padding: 2,
  },
  // Sticky mobile bid bar (rendered in-frame above the transport).
  bidBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2) var(--spacing-3)',
    backgroundColor: 'var(--color-background-primary)',
  },
  // Panel + transport plumbing.
  panelScroll: {
    height: '100%',
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  transportRow: {flexWrap: 'wrap', rowGap: 8},
  // paddingInline reserves room for the thumb's overhang at 0/max so it
  // never overlaps the timecode text or the speed control.
  scrubItem: {minWidth: 180, paddingInline: 10},
  clockText: {whiteSpace: 'nowrap'},
  headerChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    whiteSpace: 'nowrap',
    fontVariantNumeric: 'tabular-nums',
  },
  touchTarget: {width: 40, height: 40},
  touchWide: {height: 40},
};

// ============= BIDDER FIXTURES =============
// Identity colors are explicit light-dark() pairs so the ladder stays
// legible in both schemes; 'you' rides the accent token.

type BidderId = 'p108' | 'p221' | 'p354' | 'p077' | 'you';

interface Bidder {
  id: BidderId;
  name: string;
  paddle: string;
  channel: 'In room' | 'Phone' | 'Online';
  color: string;
}

const BIDDERS: Record<BidderId, Bidder> = {
  p108: {
    id: 'p108',
    name: 'Mara Okafor',
    paddle: 'Paddle 108',
    channel: 'In room',
    color: 'light-dark(#7C3AED, #C4B5FD)',
  },
  p221: {
    id: 'p221',
    name: 'Devon Reyes',
    paddle: 'Paddle 221',
    channel: 'Phone',
    color: 'light-dark(#0F766E, #5EEAD4)',
  },
  p354: {
    id: 'p354',
    name: 'Ines Kovac',
    paddle: 'Paddle 354',
    channel: 'Online',
    color: 'light-dark(#B45309, #FBBF24)',
  },
  p077: {
    id: 'p077',
    name: 'Felix Aldana',
    paddle: 'Paddle 077',
    channel: 'In room',
    color: 'light-dark(#BE185D, #F9A8D4)',
  },
  you: {
    id: 'you',
    name: 'You',
    paddle: 'Paddle 512',
    channel: 'Online',
    color: 'var(--color-accent)',
  },
};

const RIVAL_IDS: BidderId[] = ['p108', 'p221', 'p354', 'p077'];

// ============= THE BID TAPE =============
// The scripted spine of the room. With no local input, Paddle 108 wins at
// $12,250 after three anti-snipe extensions (ticks 53, 61, 70). Your manual
// and proxy bids interleave deterministically at their recorded ticks.

interface TapeBid {
  tick: number;
  bidder: Exclude<BidderId, 'you'>;
  amount: number;
}

const BID_TAPE: TapeBid[] = [
  {tick: 2, bidder: 'p108', amount: 9500},
  {tick: 6, bidder: 'p221', amount: 9750},
  {tick: 10, bidder: 'p354', amount: 10000},
  {tick: 15, bidder: 'p108', amount: 10250},
  {tick: 21, bidder: 'p221', amount: 10500},
  {tick: 27, bidder: 'p077', amount: 10750},
  {tick: 33, bidder: 'p354', amount: 11000},
  {tick: 40, bidder: 'p108', amount: 11250},
  {tick: 47, bidder: 'p221', amount: 11500},
  {tick: 53, bidder: 'p354', amount: 11750},
  {tick: 61, bidder: 'p077', amount: 12000},
  {tick: 70, bidder: 'p108', amount: 12250},
];

/** Watchers who join the room on scripted ticks (presence pop-ins). */
const JOIN_TAPE: Array<{tick: number; name: string}> = [
  {tick: 4, name: 'Priya Shah'},
  {tick: 9, name: 'Danish Rowe'},
  {tick: 17, name: 'Lena Marsh'},
  {tick: 29, name: 'Theo Brandt'},
  {tick: 44, name: 'Ivy Calder'},
  {tick: 57, name: 'Noor Amari'},
  {tick: 66, name: 'Gus Pell'},
  {tick: 74, name: 'Rae Lindqvist'},
];

const LOT = {
  sale: 'Kestrel & Gray · Evening Sale',
  lotNumber: 'Lot 217',
  title: 'Harbor Dusk at Kestrel Bay',
  artist: 'Edda Voss (1918–1989)',
  year: 'Oil on canvas, 1962',
  size: '61 × 46 cm, signed lower right',
  provenance: 'Private collection, Oslo; acquired directly from the artist',
  estimate: 'Estimate $12,000–18,000',
  premium: "Buyer's premium 12%",
};

// ============= PURE AUCTION DERIVATION =============
// Auction state at tick T is a fold of the bid tape, your recorded bids,
// and the proxy setting, applied in deterministic order. Nothing mutates
// outside this function, so scrubbing backward un-bids cleanly.

interface LocalBid {
  id: number;
  tick: number;
  amount: number;
}

interface LadderRow {
  key: string;
  tick: number;
  bidder: BidderId;
  amount: number;
  isProxy: boolean;
  isOpening: boolean;
  /** This bid landed inside the snipe window and pushed the close out. */
  extendedTo: number | null;
}

type Phase = 'open' | 'once' | 'twice' | 'hammer' | 'sold';

interface AuctionState {
  rows: LadderRow[];
  leader: BidderId | null;
  leaderAmount: number;
  /** Next valid bid: the opening bid, or leader + one increment. */
  ask: number;
  closeAt: number;
  remaining: number;
  phase: Phase;
  lastExtendTick: number | null;
  extensionCount: number;
  joined: string[];
  watcherCount: number;
  proxyExhausted: boolean;
}

interface MergedBid {
  tick: number;
  /** Scripted bids sort before local bids on the same tick. */
  isLocal: boolean;
  order: number;
  bidder: BidderId;
  amount: number;
}

function deriveAuction(
  tick: number,
  localBids: LocalBid[],
  proxyArmedAt: number | null,
  proxyMax: number,
): AuctionState {
  const merged: MergedBid[] = [
    ...BID_TAPE.map((bid, index) => ({
      tick: bid.tick,
      isLocal: false,
      order: index,
      bidder: bid.bidder as BidderId,
      amount: bid.amount,
    })),
    ...localBids.map(bid => ({
      tick: bid.tick,
      isLocal: true,
      order: bid.id,
      bidder: 'you' as BidderId,
      amount: bid.amount,
    })),
  ].sort(
    (a, b) =>
      a.tick - b.tick ||
      Number(a.isLocal) - Number(b.isLocal) ||
      a.order - b.order,
  );

  const rows: LadderRow[] = [];
  let leader: BidderId | null = null;
  let leaderAmount = 0;
  let closeAt = BASE_CLOSE_TICK;
  let lastExtendTick: number | null = null;
  let extensionCount = 0;

  const applyBid = (
    bidder: BidderId,
    amount: number,
    atTick: number,
    isProxy: boolean,
    key: string,
  ) => {
    let extendedTo: number | null = null;
    if (closeAt - atTick <= SNIPE_WINDOW) {
      const pushed = Math.min(atTick + EXTEND_TICKS, HARD_CLOSE_TICK);
      if (pushed > closeAt) {
        closeAt = pushed;
        extendedTo = pushed;
        lastExtendTick = atTick;
        extensionCount += 1;
      }
    }
    rows.push({
      key,
      tick: atTick,
      bidder,
      amount,
      isProxy,
      isOpening: rows.length === 0,
      extendedTo,
    });
    leader = bidder;
    leaderAmount = amount;
  };

  for (const event of merged) {
    if (event.tick > tick) {
      break;
    }
    // The hammer has fallen by this event's tick — late bids never apply.
    if (event.tick >= closeAt) {
      continue;
    }
    // A bid only applies while it still beats the ladder; a local bid never
    // outbids yourself (can happen after a rewind re-orders the ladder).
    if (event.amount <= leaderAmount) {
      continue;
    }
    if (event.isLocal && leader === 'you') {
      continue;
    }
    applyBid(
      event.bidder,
      event.amount,
      event.tick,
      false,
      `${event.isLocal ? 'local' : 'tape'}-${event.order}`,
    );
    // Proxy auto-counter: a visible system row at the same tick, +1
    // increment over the incoming bid, capped by your max.
    if (
      !event.isLocal &&
      proxyArmedAt != null &&
      event.tick >= proxyArmedAt &&
      event.tick < closeAt
    ) {
      const counter = event.amount + INCREMENT;
      if (counter <= proxyMax) {
        applyBid('you', counter, event.tick, true, `proxy-${event.order}`);
      }
    }
  }

  const remaining = Math.max(0, closeAt - tick);
  const phase: Phase =
    remaining === 0
      ? 'sold'
      : remaining === 1
        ? 'hammer'
        : remaining === 2
          ? 'twice'
          : remaining === 3
            ? 'once'
            : 'open';

  const joined = JOIN_TAPE.filter(join => join.tick <= tick).map(
    join => join.name,
  );

  return {
    rows,
    leader,
    leaderAmount,
    ask: leaderAmount === 0 ? OPENING_BID : leaderAmount + INCREMENT,
    closeAt,
    remaining,
    phase,
    lastExtendTick,
    extensionCount,
    joined,
    watcherCount: WATCHER_BASE + joined.length + rows.length * WATCHERS_PER_BID,
    proxyExhausted:
      proxyArmedAt != null &&
      leader != null &&
      leader !== 'you' &&
      leaderAmount + INCREMENT > proxyMax,
  };
}

// ============= HELPERS =============

function formatMoney(amount: number): string {
  return `$${amount.toLocaleString('en-US')}`;
}

/** Ticks render as an auction clock, m:ss. */
function formatClock(ticks: number): string {
  const minutes = Math.floor(ticks / 60);
  const seconds = ticks % 60;
  return `${minutes}:${String(seconds).padStart(2, '0')}`;
}

// ============= LOT ARTWORK =============

/**
 * The lot itself: a small dusk-harbor "painting" as inline SVG. This is the
 * file's one documented scheme-locked surface — pigments on canvas do not
 * respond to the UI color scheme, so these hex fills intentionally render
 * identically in light and dark mode. All surrounding chrome is tokens.
 */
function LotArtwork() {
  return (
    <div style={styles.artworkFrame}>
      <svg
        viewBox="0 0 244 176"
        style={styles.artworkSvg}
        role="img"
        aria-label="Harbor Dusk at Kestrel Bay — oil painting of sailboats at dusk">
        <defs>
          <linearGradient id="lar-sky" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#2E2A4F" />
            <stop offset="45%" stopColor="#8A4B6B" />
            <stop offset="75%" stopColor="#D98A56" />
            <stop offset="100%" stopColor="#EFC177" />
          </linearGradient>
          <linearGradient id="lar-sea" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#C98A63" />
            <stop offset="40%" stopColor="#6E5B7B" />
            <stop offset="100%" stopColor="#33304F" />
          </linearGradient>
        </defs>
        <rect width="244" height="104" fill="url(#lar-sky)" />
        <circle cx="176" cy="86" r="16" fill="#F6DA9C" />
        <rect y="104" width="244" height="72" fill="url(#lar-sea)" />
        <path d="M168 104 h16 l-2 40 h-12 Z" fill="#E8B87F" opacity="0.5" />
        {/* Sailboats */}
        <path d="M58 104 l14 -30 l3 30 Z" fill="#3B3358" />
        <path d="M78 104 l-2 -22 l10 22 Z" fill="#4A3B52" />
        <rect x="52" y="103" width="34" height="5" rx="2" fill="#2B2542" />
        <path d="M126 104 l10 -20 l2 20 Z" fill="#43385C" />
        <rect x="122" y="103" width="22" height="4" rx="2" fill="#2B2542" />
        {/* Breakwater and gulls */}
        <path d="M0 120 q40 -8 84 -4 l0 8 q-44 -3 -84 4 Z" fill="#2C2846" />
        <path d="M196 60 q4 -4 8 0 M208 66 q4 -4 8 0" stroke="#2E2A4F" strokeWidth="1.6" fill="none" />
      </svg>
    </div>
  );
}

// ============= COUNTDOWN CHIP =============

function CountdownChip({
  remaining,
  isUrgent,
  justExtended,
  isSold,
  isReducedMotion,
}: {
  remaining: number;
  isUrgent: boolean;
  justExtended: boolean;
  isSold: boolean;
  isReducedMotion: boolean;
}) {
  return (
    <span
      style={{
        ...styles.countdownChip,
        ...(isUrgent && !isSold ? styles.countdownUrgent : undefined),
        animation:
          justExtended && !isReducedMotion
            ? 'lar-extend-pulse 900ms ease-in-out 2'
            : undefined,
      }}>
      <Icon
        icon={isSold ? GavelIcon : TimerIcon}
        size="sm"
        color={isUrgent && !isSold ? 'error' : 'secondary'}
      />
      {isSold ? (
        <Text type="supporting" weight="semibold">
          Hammer down
        </Text>
      ) : (
        <Text
          type="supporting"
          weight="semibold"
          hasTabularNumbers
          style={isUrgent ? {color: URGENT_RED} : undefined}>
          {formatClock(remaining)}
        </Text>
      )}
      {justExtended && !isSold && (
        <Token label={`+${EXTEND_TICKS}s anti-snipe`} size="sm" color="orange" />
      )}
    </span>
  );
}

// ============= BID LADDER =============

function BidLadder({rows, leader}: {rows: LadderRow[]; leader: BidderId | null}) {
  if (rows.length === 0) {
    return (
      <Text type="supporting" color="secondary">
        No bids yet — the room opens at {formatMoney(OPENING_BID)}.
      </Text>
    );
  }
  const newestFirst = [...rows].reverse();
  return (
    <VStack gap={0}>
      {newestFirst.map((row, index) => {
        const bidder = BIDDERS[row.bidder];
        const isLeadingRow = index === 0 && leader === row.bidder;
        return (
          <div
            key={row.key}
            style={{
              ...styles.ladderRow,
              ...(isLeadingRow ? styles.ladderLeading : undefined),
            }}>
            <span
              style={{...styles.paddleDot, backgroundColor: bidder.color}}
              aria-hidden
            />
            <VStack gap={0}>
              <HStack gap={1} vAlign="center">
                <Text type="supporting" weight="semibold" style={{color: bidder.color}}>
                  {bidder.paddle}
                </Text>
                {row.bidder === 'you' && !row.isProxy && (
                  <Token label="You" size="sm" color="blue" />
                )}
                {row.isProxy && (
                  <Tooltip content="Placed automatically by your proxy max">
                    <span style={{display: 'inline-flex'}}>
                      <Token label="Proxy for you" size="sm" color="purple" />
                    </span>
                  </Tooltip>
                )}
                {row.isOpening && <Token label="Opening" size="sm" color="gray" />}
                {row.extendedTo != null && (
                  <Token label={`+${EXTEND_TICKS}s`} size="sm" color="orange" />
                )}
                {isLeadingRow && (
                  <Icon icon={CrownIcon} size="xsm" color="warning" />
                )}
              </HStack>
              <Text type="supporting" color="secondary" size="xsm" hasTabularNumbers>
                {row.isProxy ? 'Auto-counter' : bidder.channel} · {formatClock(row.tick)}
              </Text>
            </VStack>
            <div style={styles.ladderAmount}>
              <Text
                type="supporting"
                weight="semibold"
                hasTabularNumbers
                style={isLeadingRow ? {color: WIN_GREEN} : undefined}>
                {formatMoney(row.amount)}
              </Text>
            </div>
          </div>
        );
      })}
    </VStack>
  );
}

// ============= PRESENCE =============

function PresenceSection({
  joined,
  watcherCount,
  isReducedMotion,
}: {
  joined: string[];
  watcherCount: number;
  isReducedMotion: boolean;
}) {
  return (
    <VStack gap={2}>
      <HStack gap={1} vAlign="center">
        <Icon icon={UsersIcon} size="sm" color="secondary" />
        <Heading level={6} accessibilityLevel={2}>
          In the room
        </Heading>
        <StackItem size="fill">
          <span />
        </StackItem>
        <Text type="supporting" color="secondary" size="xsm" hasTabularNumbers>
          {watcherCount.toLocaleString('en-US')} watching
        </Text>
      </HStack>
      <div style={styles.presenceRow}>
        {RIVAL_IDS.map(id => {
          const bidder = BIDDERS[id];
          return (
            <Tooltip key={id} content={`${bidder.paddle} · ${bidder.channel}`}>
              <span
                style={{
                  ...styles.presenceRing,
                  border: `2px solid ${bidder.color}`,
                }}>
                <Avatar name={bidder.name} size="xsmall" />
              </span>
            </Tooltip>
          );
        })}
        <Tooltip content={`${BIDDERS.you.paddle} · that is you`}>
          <span
            style={{
              ...styles.presenceRing,
              border: '2px solid var(--color-accent)',
            }}>
            <Avatar name="You" size="xsmall" />
          </span>
        </Tooltip>
        {joined.map(name => (
          <Tooltip key={name} content={`${name} joined`}>
            <span
              style={{
                ...styles.presenceSeat,
                animation: isReducedMotion
                  ? undefined
                  : 'lar-join-pop 260ms ease-out',
              }}>
              <Avatar name={name} size="xsmall" />
            </span>
          </Tooltip>
        ))}
      </div>
    </VStack>
  );
}

// ============= CATALOG DETAILS =============

function CatalogDetails() {
  return (
    <VStack gap={2}>
      <Heading level={6} accessibilityLevel={2}>
        Catalog notes
      </Heading>
      <List density="compact" hasDividers={false}>
        <ListItem label={LOT.artist} description="Artist" />
        <ListItem label={LOT.year} description="Medium" />
        <ListItem label={LOT.size} description="Dimensions" />
        <ListItem label={LOT.provenance} description="Provenance" />
        <ListItem label={LOT.premium} description="Terms" />
      </List>
    </VStack>
  );
}

// ============= TRANSPORT =============

function TransportBar({
  tick,
  isPlaying,
  speed,
  isCompact,
  onScrub,
  onStep,
  onRestart,
  onPlayToggle,
  onSpeedChange,
}: {
  tick: number;
  isPlaying: boolean;
  speed: number;
  isCompact: boolean;
  onScrub: (tick: number) => void;
  onStep: (delta: number) => void;
  onRestart: () => void;
  onPlayToggle: () => void;
  onSpeedChange: (speed: number) => void;
}) {
  const atStart = tick <= 0;
  const atEnd = tick >= TOTAL_TICKS;
  const tapTarget = isCompact ? styles.touchTarget : undefined;

  return (
    <HStack gap={2} vAlign="center" style={styles.transportRow}>
      <IconButton
        label="Restart the bid tape"
        tooltip="Restart"
        icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTarget}
        isDisabled={atStart}
        onClick={onRestart}
      />
      <IconButton
        label="Step back one tick"
        tooltip="Step back (J)"
        icon={<Icon icon={SkipBackIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTarget}
        isDisabled={atStart}
        onClick={() => onStep(-1)}
      />
      <IconButton
        label={isPlaying ? 'Pause the auction clock' : 'Play the auction clock'}
        tooltip={isPlaying ? 'Pause (Space)' : 'Play (Space)'}
        icon={
          <Icon icon={isPlaying ? PauseIcon : PlayIcon} size="sm" color="inherit" />
        }
        variant="primary"
        size="sm"
        style={tapTarget}
        isDisabled={atEnd && !isPlaying}
        onClick={onPlayToggle}
      />
      <IconButton
        label="Step forward one tick"
        tooltip="Step forward (K)"
        icon={<Icon icon={SkipForwardIcon} size="sm" color="inherit" />}
        variant="ghost"
        size="sm"
        style={tapTarget}
        isDisabled={atEnd}
        onClick={() => onStep(1)}
      />
      <Text
        type="supporting"
        color="secondary"
        hasTabularNumbers
        style={styles.clockText}>
        {formatClock(tick)} / {formatClock(TOTAL_TICKS)}
      </Text>
      <StackItem size="fill" style={styles.scrubItem}>
        <Slider
          label="Scrub the auction clock"
          isLabelHidden
          min={0}
          max={TOTAL_TICKS}
          step={1}
          value={tick}
          onChange={onScrub}
          valueDisplay="none"
        />
      </StackItem>
      <SegmentedControl
        label="Playback speed"
        value={String(speed)}
        onChange={value => onSpeedChange(Number(value))}>
        <SegmentedControlItem value="0.5" label="0.5x" />
        <SegmentedControlItem value="1" label="1x" />
        <SegmentedControlItem value="2" label="2x" />
      </SegmentedControl>
      {!isCompact && (
        <HStack gap={1} vAlign="center">
          <Kbd keys="space" />
          <Kbd keys="j" />
          <Kbd keys="k" />
          <Kbd keys="b" />
        </HStack>
      )}
    </HStack>
  );
}

// ============= PAGE =============

export default function LiveAuctionRoomTemplate() {
  // ---- the only clock: the tick counter ----
  const [tick, setTick] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [speed, setSpeed] = useState(1);

  // ---- your recorded inputs (folded with the tape; never mutated) ----
  const [localBids, setLocalBids] = useState<LocalBid[]>([]);
  const [proxyMax, setProxyMax] = useState(PROXY_DEFAULT);
  const [proxyArmedAt, setProxyArmedAt] = useState<number | null>(null);
  /** Jump-bid stepper: ask + (steps) increments. */
  const [jumpSteps, setJumpSteps] = useState(2);

  const nextBidId = useRef(0);

  const isSinglePane = useMediaQuery('(max-width: 1024px)');
  const isCompact = useMediaQuery('(max-width: 640px)');
  const isReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');

  // ---- pure derivation: the room at this tick ----
  const auction = useMemo(
    () => deriveAuction(tick, localBids, proxyArmedAt, proxyMax),
    [tick, localBids, proxyArmedAt, proxyMax],
  );

  const {phase, remaining, leader, leaderAmount, ask} = auction;
  const isSold = phase === 'sold';
  const youLead = leader === 'you';
  const youHaveBid = auction.rows.some(row => row.bidder === 'you');
  const isUrgent = !isSold && remaining <= SNIPE_WINDOW;
  const justExtended =
    auction.lastExtendTick != null && tick - auction.lastExtendTick <= 3;
  const jumpAmount = ask + (jumpSteps - 1) * INCREMENT;
  const canBid = !isSold && !youLead;

  // ---- playback interval: advances the tick, nothing else ----
  useEffect(() => {
    if (!isPlaying) {
      return undefined;
    }
    const timer = setInterval(
      () => setTick(prev => Math.min(TOTAL_TICKS, prev + 1)),
      Math.round(BASE_TICK_MS / speed),
    );
    return () => clearInterval(timer);
  }, [isPlaying, speed]);

  // Auto-pause at the end of the tape, and two beats after the hammer so
  // the SOLD state lands and holds without running out the dead tail.
  useEffect(() => {
    if (!isPlaying) {
      return;
    }
    if (tick >= TOTAL_TICKS || (isSold && tick >= auction.closeAt + 2)) {
      setIsPlaying(false);
    }
  }, [tick, isPlaying, isSold, auction.closeAt]);

  // ---- bid commit path: quick bid, jump bid, and B key all land here ----
  const placeBid = (amount: number) => {
    if (isSold || amount <= leaderAmount || leader === 'you') {
      return;
    }
    const id = nextBidId.current++;
    setLocalBids(prev => [...prev, {id, tick, amount}]);
  };

  const handleJump = (nextTick: number) => {
    setIsPlaying(false);
    setTick(Math.min(TOTAL_TICKS, Math.max(0, nextTick)));
  };

  // ---- global transport + bid keys (Space, J, K, B) ----
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      const target = event.target as HTMLElement | null;
      if (
        target?.closest(
          'input, textarea, select, [role="slider"], [contenteditable="true"]',
        ) != null
      ) {
        return;
      }
      if (event.key === ' ') {
        if (target?.closest('button') != null) {
          return;
        }
        event.preventDefault();
        setIsPlaying(prev => (tick >= TOTAL_TICKS ? prev : !prev));
      } else if (event.key === 'j' || event.key === 'k') {
        setIsPlaying(false);
        setTick(prev =>
          Math.min(TOTAL_TICKS, Math.max(0, prev + (event.key === 'j' ? -1 : 1))),
        );
      } else if (event.key === 'b') {
        placeBid(ask);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // placeBid closes over the same derived values listed here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tick, ask, leaderAmount, isSold, leader]);

  // ---- shared fragments ----

  const leaderLine =
    leader == null ? (
      <Text type="supporting" color="secondary">
        Awaiting the opening bid of {formatMoney(OPENING_BID)}
      </Text>
    ) : (
      <HStack gap={1} vAlign="center">
        <span
          style={{...styles.paddleDot, backgroundColor: BIDDERS[leader].color}}
          aria-hidden
        />
        <Text type="supporting" color="secondary">
          {youLead ? 'You lead' : `${BIDDERS[leader].paddle} leads`} at{' '}
          {formatMoney(leaderAmount)}
        </Text>
        {youLead && <Icon icon={CrownIcon} size="xsm" color="warning" />}
      </HStack>
    );

  const stateStrip = isSold ? null : youLead ? (
    <div style={{...styles.stateStrip, ...styles.stateWinning}}>
      <Icon icon={CrownIcon} size="sm" color="success" />
      <StackItem size="fill">
        <Text type="supporting" weight="semibold" style={{color: WIN_GREEN}}>
          You are the highest bidder at {formatMoney(leaderAmount)}
        </Text>
      </StackItem>
      {proxyArmedAt != null && (
        <Token label={`Proxy armed to ${formatMoney(proxyMax)}`} size="sm" color="purple" />
      )}
    </div>
  ) : youHaveBid ? (
    <div style={{...styles.stateStrip, ...styles.stateOutbid}}>
      <Icon icon={GavelIcon} size="sm" color="error" />
      <StackItem size="fill">
        <VStack gap={0}>
          <Text type="supporting" weight="semibold" style={{color: URGENT_RED}}>
            You have been outbid — {leader != null ? BIDDERS[leader].paddle : 'the room'}{' '}
            holds {formatMoney(leaderAmount)}
          </Text>
          {auction.proxyExhausted && (
            <Text type="supporting" color="secondary" size="xsm">
              Your proxy max of {formatMoney(proxyMax)} is exhausted — raise it or
              bid manually.
            </Text>
          )}
        </VStack>
      </StackItem>
      <Button
        label={`Rebid ${formatMoney(ask)}`}
        variant="primary"
        size="sm"
        icon={<Icon icon={ZapIcon} size="sm" color="inherit" />}
        onClick={() => placeBid(ask)}
        style={isCompact ? styles.touchWide : undefined}
      />
    </div>
  ) : (
    <div style={{...styles.stateStrip, ...styles.stateIdle}}>
      <Icon icon={GavelIcon} size="sm" color="secondary" />
      <Text type="supporting" color="secondary">
        You are watching as {BIDDERS.you.paddle}. Bid {formatMoney(ask)} to join —
        or arm a proxy max and let the room bid for you.
      </Text>
    </div>
  );

  const finaleStrip =
    phase === 'once' || phase === 'twice' || phase === 'hammer' ? (
      <div
        style={{
          ...styles.finaleStrip,
          animation: isReducedMotion
            ? undefined
            : 'lar-finale-pulse 700ms ease-in-out infinite',
        }}
        role="status">
        <Icon icon={GavelIcon} size="sm" color="error" />
        <Text type="supporting" weight="semibold" style={{color: URGENT_RED}}>
          {phase === 'once'
            ? 'Going once…'
            : phase === 'twice'
              ? 'Going twice…'
              : 'Final call — hammer is up!'}
        </Text>
        <StackItem size="fill">
          <span />
        </StackItem>
        <Text type="supporting" color="secondary" size="xsm">
          Any bid now extends the clock
        </Text>
      </div>
    ) : null;

  const soldPanel = isSold ? (
    <div
      style={{
        ...styles.soldPanel,
        ...(youLead ? styles.soldWon : styles.soldLost),
        animation: isReducedMotion ? undefined : 'lar-sold-in 360ms ease-out',
      }}
      role="status">
      <VStack gap={2} hAlign="center">
        <HStack gap={2} vAlign="center">
          <Icon icon={GavelIcon} size="lg" color={youLead ? 'success' : 'secondary'} />
          <Heading level={3} accessibilityLevel={2}>
            {youLead ? 'Sold — to you!' : 'Sold'}
          </Heading>
          <Icon
            icon={SparklesIcon}
            size="sm"
            color={youLead ? 'success' : 'secondary'}
          />
        </HStack>
        <Text
          type="body"
          weight="semibold"
          hasTabularNumbers
          style={{color: youLead ? WIN_GREEN : undefined}}>
          {formatMoney(leaderAmount)}
          {leader != null && !youLead ? ` to ${BIDDERS[leader].paddle}` : ''}
        </Text>
        <Text type="supporting" color="secondary" size="xsm" hasTabularNumbers>
          Hammer at {formatClock(auction.closeAt)} on the room clock ·{' '}
          {auction.extensionCount} anti-snipe extension
          {auction.extensionCount === 1 ? '' : 's'} ·{' '}
          {auction.rows.length} bids
        </Text>
        {youLead && (
          <Text type="supporting" color="secondary" size="xsm">
            {LOT.premium} applies. The lot heads to shipping under your paddle.
          </Text>
        )}
        <Button
          label="Replay the sale"
          variant="secondary"
          size="sm"
          icon={<Icon icon={RotateCcwIcon} size="sm" color="inherit" />}
          onClick={() => handleJump(0)}
          style={isCompact ? styles.touchWide : undefined}
        />
      </VStack>
    </div>
  ) : null;

  // Desktop bid controls: quick bid + jump stepper + proxy card. On <=640px
  // the sticky bid bar carries quick bidding; the proxy card stays here.
  const bidControls = isSold ? null : (
    <div style={styles.controlsRow}>
      {!isCompact && (
        <div style={styles.controlCard}>
          <VStack gap={2}>
            <HStack gap={1} vAlign="center">
              <Icon icon={ZapIcon} size="sm" color="secondary" />
              <Heading level={6} accessibilityLevel={3}>
                Place a bid
              </Heading>
            </HStack>
            <Button
              label={youLead ? 'You hold the high bid' : `Bid ${formatMoney(ask)}`}
              variant="primary"
              size="md"
              icon={<Icon icon={GavelIcon} size="sm" color="inherit" />}
              isDisabled={!canBid}
              onClick={() => placeBid(ask)}
            />
            <Divider />
            <Text type="supporting" color="secondary" size="xsm">
              Jump bid — outrun the increments:
            </Text>
            <div style={styles.stepperRow}>
              <IconButton
                label="Lower jump bid one increment"
                tooltip={`-${formatMoney(INCREMENT)}`}
                icon={<Icon icon={MinusIcon} size="sm" color="inherit" />}
                variant="secondary"
                size="sm"
                isDisabled={jumpSteps <= 1}
                onClick={() => setJumpSteps(steps => Math.max(1, steps - 1))}
              />
              <div style={styles.stepperValue}>
                <Text type="supporting" weight="semibold" hasTabularNumbers>
                  {formatMoney(jumpAmount)}
                </Text>
              </div>
              <IconButton
                label="Raise jump bid one increment"
                tooltip={`+${formatMoney(INCREMENT)}`}
                icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
                variant="secondary"
                size="sm"
                isDisabled={jumpSteps >= MAX_JUMP_STEPS}
                onClick={() =>
                  setJumpSteps(steps => Math.min(MAX_JUMP_STEPS, steps + 1))
                }
              />
              <Button
                label="Place jump bid"
                variant="secondary"
                size="sm"
                isDisabled={!canBid}
                onClick={() => placeBid(jumpAmount)}
              />
            </div>
          </VStack>
        </div>
      )}

      <div style={styles.controlCard}>
        <VStack gap={2}>
          <HStack gap={1} vAlign="center">
            <Icon icon={BotIcon} size="sm" color="secondary" />
            <Heading level={6} accessibilityLevel={3}>
              Proxy bidding
            </Heading>
            <StackItem size="fill">
              <span />
            </StackItem>
            <ToggleButton
              label={proxyArmedAt == null ? 'Arm proxy' : 'Proxy armed'}
              size="sm"
              icon={<Icon icon={BotIcon} size="sm" color="inherit" />}
              isPressed={proxyArmedAt != null}
              onPressedChange={pressed => setProxyArmedAt(pressed ? tick : null)}
              tooltip={
                proxyArmedAt == null
                  ? 'Auto-counter incoming bids up to your max'
                  : 'Disarm the proxy'
              }
              style={isCompact ? styles.touchWide : undefined}
            />
          </HStack>
          <div style={styles.stepperRow}>
            <IconButton
              label="Lower proxy max one increment"
              tooltip={`-${formatMoney(INCREMENT)}`}
              icon={<Icon icon={MinusIcon} size="sm" color="inherit" />}
              variant="secondary"
              size="sm"
              style={isCompact ? styles.touchTarget : undefined}
              isDisabled={proxyMax <= PROXY_MIN}
              onClick={() => setProxyMax(max => Math.max(PROXY_MIN, max - INCREMENT))}
            />
            <div style={styles.stepperValue}>
              <Text type="supporting" weight="semibold" hasTabularNumbers>
                {formatMoney(proxyMax)}
              </Text>
            </div>
            <IconButton
              label="Raise proxy max one increment"
              tooltip={`+${formatMoney(INCREMENT)}`}
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
              variant="secondary"
              size="sm"
              style={isCompact ? styles.touchTarget : undefined}
              isDisabled={proxyMax >= PROXY_MAX_CAP}
              onClick={() =>
                setProxyMax(max => Math.min(PROXY_MAX_CAP, max + INCREMENT))
              }
            />
          </div>
          <Text type="supporting" color="secondary" size="xsm">
            {proxyArmedAt == null
              ? 'Armed proxies counter every incoming bid by one increment, as visible system rows in the ladder.'
              : auction.proxyExhausted
                ? `Exhausted — the room is past ${formatMoney(proxyMax)}. Raise the max to keep countering.`
                : `Armed since ${formatClock(proxyArmedAt)} — countering up to ${formatMoney(proxyMax)}.`}
          </Text>
        </VStack>
      </div>
    </div>
  );

  const ladderSection = (
    <VStack gap={2}>
      <HStack gap={1} vAlign="center">
        <Icon icon={GavelIcon} size="sm" color="secondary" />
        <Heading level={6} accessibilityLevel={2}>
          Bid history
        </Heading>
        <StackItem size="fill">
          <span />
        </StackItem>
        <Text type="supporting" color="secondary" size="xsm" hasTabularNumbers>
          {auction.rows.length} bids
        </Text>
      </HStack>
      <BidLadder rows={auction.rows} leader={leader} />
    </VStack>
  );

  const panelBody = (
    <div style={styles.panelScroll}>
      <VStack gap={4}>
        {ladderSection}
        <Divider />
        <PresenceSection
          joined={auction.joined}
          watcherCount={auction.watcherCount}
          isReducedMotion={isReducedMotion}
        />
        <Divider />
        <CatalogDetails />
      </VStack>
    </div>
  );

  // ---- lot column ----
  const lotColumn = (
    <div style={styles.contentRoot}>
      <style>{KEYFRAME_CSS}</style>
      <div style={styles.contentScroll}>
        <VStack gap={4}>
          <div style={styles.heroRow}>
            <LotArtwork />
            <div style={styles.heroInfo}>
              <VStack gap={2}>
                <HStack gap={2} vAlign="center">
                  <Text type="supporting" color="secondary" weight="semibold">
                    {LOT.lotNumber}
                  </Text>
                  <Token label={LOT.estimate} size="sm" color="gray" />
                </HStack>
                <Heading level={2} accessibilityLevel={2}>
                  {LOT.title}
                </Heading>
                <div style={styles.catalogTokens}>
                  <Token label={LOT.artist} size="sm" color="gray" />
                  <Token label={LOT.year} size="sm" color="gray" />
                  <Token label={LOT.size} size="sm" color="gray" />
                </div>
                <div style={styles.priceRow}>
                  <VStack gap={0}>
                    <Text type="supporting" color="secondary" size="xsm">
                      {leader == null ? 'Opening bid' : 'Current bid'}
                    </Text>
                    {/* Keyed on the amount so each ratchet replays the tween;
                        reduced motion renders the new value in place. */}
                    <span
                      key={leaderAmount}
                      style={{
                        ...styles.priceValue,
                        color: youLead ? WIN_GREEN : 'var(--color-text-primary)',
                        animation: isReducedMotion
                          ? undefined
                          : 'lar-price-pop 340ms ease-out',
                      }}>
                      {formatMoney(leader == null ? OPENING_BID : leaderAmount)}
                    </span>
                    {leaderLine}
                  </VStack>
                  <CountdownChip
                    remaining={remaining}
                    isUrgent={isUrgent}
                    justExtended={justExtended}
                    isSold={isSold}
                    isReducedMotion={isReducedMotion}
                  />
                </div>
              </VStack>
            </div>
          </div>

          {stateStrip}
          {finaleStrip}
          {soldPanel}
          {bidControls}

          {/* <=1024px: the panel is hidden, so its sections render inline. */}
          {isSinglePane && (
            <>
              <Divider />
              {ladderSection}
              <Divider />
              <PresenceSection
                joined={auction.joined}
                watcherCount={auction.watcherCount}
                isReducedMotion={isReducedMotion}
              />
              <Divider />
              <CatalogDetails />
            </>
          )}
        </VStack>
      </div>

      {/* <=640px: sticky quick-bid bar docks above the transport. */}
      {isCompact && !isSold && (
        <>
          <Divider />
          <div style={styles.bidBar}>
            <IconButton
              label="Lower jump bid one increment"
              tooltip={`-${formatMoney(INCREMENT)}`}
              icon={<Icon icon={MinusIcon} size="sm" color="inherit" />}
              variant="secondary"
              size="sm"
              style={styles.touchTarget}
              isDisabled={jumpSteps <= 1}
              onClick={() => setJumpSteps(steps => Math.max(1, steps - 1))}
            />
            <StackItem size="fill">
              <VStack gap={0} hAlign="center">
                <Text type="supporting" weight="semibold" hasTabularNumbers>
                  {formatMoney(jumpSteps === 1 ? ask : jumpAmount)}
                </Text>
                <Text type="supporting" color="secondary" size="xsm" hasTabularNumbers>
                  {youLead
                    ? 'You hold the high bid'
                    : `ask ${formatMoney(ask)} · ${formatClock(remaining)} left`}
                </Text>
              </VStack>
            </StackItem>
            <IconButton
              label="Raise jump bid one increment"
              tooltip={`+${formatMoney(INCREMENT)}`}
              icon={<Icon icon={PlusIcon} size="sm" color="inherit" />}
              variant="secondary"
              size="sm"
              style={styles.touchTarget}
              isDisabled={jumpSteps >= MAX_JUMP_STEPS}
              onClick={() =>
                setJumpSteps(steps => Math.min(MAX_JUMP_STEPS, steps + 1))
              }
            />
            <Button
              label="Bid"
              variant="primary"
              size="md"
              icon={<Icon icon={GavelIcon} size="sm" color="inherit" />}
              isDisabled={!canBid}
              onClick={() => placeBid(jumpSteps === 1 ? ask : jumpAmount)}
              style={styles.touchWide}
            />
          </div>
        </>
      )}
    </div>
  );

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider>
          <HStack gap={2} vAlign="center">
            <Icon icon={GavelIcon} size="sm" color="secondary" />
            <StackItem size="fill">
              <HStack gap={2} vAlign="center">
                {!isCompact && (
                  <Text type="supporting" color="secondary">
                    {LOT.sale} /
                  </Text>
                )}
                <Heading level={1}>{LOT.lotNumber}</Heading>
                <Badge
                  label={isSold ? 'SOLD' : 'LIVE'}
                  variant={isSold ? 'success' : 'error'}
                />
              </HStack>
            </StackItem>
            <div style={styles.headerChip}>
              <Icon icon={EyeIcon} size="sm" color="secondary" />
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {auction.watcherCount.toLocaleString('en-US')}
              </Text>
            </div>
          </HStack>
        </LayoutHeader>
      }
      content={<LayoutContent padding={0}>{lotColumn}</LayoutContent>}
      end={
        isSinglePane ? undefined : (
          <LayoutPanel width={320} padding={0} label="Bid history and room">
            {panelBody}
          </LayoutPanel>
        )
      }
      footer={
        <LayoutFooter hasDivider>
          <TransportBar
            tick={tick}
            isPlaying={isPlaying}
            speed={speed}
            isCompact={isCompact}
            onScrub={handleJump}
            onStep={delta => handleJump(tick + delta)}
            onRestart={() => handleJump(0)}
            onPlayToggle={() => setIsPlaying(prev => !prev)}
            onSpeedChange={setSpeed}
          />
        </LayoutFooter>
      }
    />
  );
}
