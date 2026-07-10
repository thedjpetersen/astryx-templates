var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file nonprofit-donor-stewardship.tsx
 * @input Deterministic fixtures only — the Stewardly "Every Child Reads"
 *   campaign book: 14 donor records spread across the four moves-management
 *   stages, each with an authored risk score, a money field that matches its
 *   stage (target → ask → committed), and a touch history of fixed date
 *   labels + integer daysAgo (the demo's internal today is Thu Jul 9).
 *   Cross-checks done by hand:
 *   - Steward committed: 450,000 + 300,000 + 250,000 + 120,000 + 85,000
 *     = $1,205,000.
 *   - Initially secured (Steward donors with risk < 60): 450,000 + 250,000
 *     + 120,000 = $820,000 = 34% of the $2,400,000 goal (34.17, floored).
 *   - Initially at risk (Steward donors with risk >= 60): 300,000 + 85,000
 *     = $385,000 = 16% of goal.
 *   - Open asks (Solicit): 200,000 + 150,000 + 75,000 = $425,000.
 *   - Cultivate targets: 100,000 + 50,000 + 60,000 = $210,000; Qualify
 *     targets: 25,000 + 40,000 + 15,000 = $80,000.
 *   - Touches this week (history rows with daysAgo <= 3): Okafor Jul 8,
 *     Brightwater Jul 7, Adeyemi-Grant Jul 6, Trask Jul 7, Fitch Jul 6,
 *     Okonjo-Bell Jul 8 = 6 — all three aggregates derive live from the
 *     donor set, never from parallel constants.
 *   No clock reads, no randomness, no timers, no network assets.
 * @output Stewardly — Donor Stewardship Desk: a major-gifts kanban for a
 *   nonprofit development office. Four moves-management columns (Qualify →
 *   Cultivate → Solicit → Steward) hold donor cards, each carrying a 40px
 *   pledge-risk arc dial, a tier pill, a last-touch line, and a
 *   next-best-action chip derived from stage × risk tier. The header owns
 *   the campaign coverage bar — secured fill, hatched at-risk band, open
 *   track to the $2.4M goal — plus officer filter chips and a
 *   touches-this-week counter. Signature move: opening a donor card slides
 *   in the touch composer drawer; picking a touch type previews exactly how
 *   far the risk dial will ease and what the next-best action becomes, and
 *   logging it appends to the donor's history, eases the dial in place,
 *   re-derives the action chip, and — when a Steward donor crosses below
 *   the risk-60 line — visibly moves their dollars from the hatched at-risk
 *   band into the secured fill of the campaign bar. Every mutation is
 *   announced through an aria-live region.
 * @position Page template; emitted by \`astryx template nonprofit-donor-stewardship\`
 *
 * Frame: Layout height="fill". The header block is two strips — a 56px
 *   topbar (brand mark · campaign title · officer chips · week counter) and
 *   a 44px coverage strip (segmented goal bar + dollar legend). Content is
 *   a single board wrapper (position:relative, fills, minHeight:0): a
 *   4-up CSS grid of stage columns, each column a panel with a 44px header
 *   (name · count · stage dollars) over a scrollable card list. The touch
 *   composer is a 360px absolute drawer pinned to the wrapper's right edge
 *   (overlay with shadow — it never squeezes the board), owning donor
 *   summary, a 64px risk dial, the touch-type list with easing weights, a
 *   note field, a live preview line, and the touch-history timeline.
 * Responsive contract:
 * - >= 981px (and the ~1045px inline demo stage, which fires no viewport
 *   media queries — the DEFAULT layout below is this one): the board is
 *   grid-template-columns: repeat(4, minmax(232px, 1fr)); at 1045px each
 *   column resolves to ~240px, comfortably above the 232px card floor.
 * - <= 980px: the board becomes a horizontal scroll-snap lane of fixed
 *   272px columns (subtraction: columns keep their anatomy, the viewport
 *   scrolls); the coverage legend wraps under the bar.
 * - <= 640px (the 390px embed iframe): the drawer goes full-width, the
 *   topbar wraps to two rows with the chip row taking its own line, and
 *   every interactive element stays >= 40px tall.
 * Container policy: panels and rows — stage columns are bordered panels,
 *   donor cards are single <button> rows with internal anatomy (the whole
 *   card is the affordance that opens the composer). No nested
 *   cards-in-cards; the drawer is one flat surface with dividers.
 * Color policy: token-pure chrome. ONE quarantined brand literal —
 *   Stewardly plum — as BRAND_ACCENT = light-dark(#86198F, #F0ABFC):
 *   #86198F on #FFFFFF ≈ 8.2:1, #F0ABFC on a ~#1C1C1E dark card ≈ 9.8:1
 *   (both clear 4.5:1 for text at any size used here). Text/glyphs painted
 *   ON an accent fill use BRAND_ON = light-dark(#FFFFFF, #3D0A44):
 *   #FFFFFF on #86198F ≈ 8.2:1, #3D0A44 on #F0ABFC ≈ 9.0:1. Risk-tier
 *   colors are DS state tokens (--color-error/warning/success + their
 *   -muted washes) so they re-derive per scheme; tier-pill text is always
 *   --color-text-primary on a -muted wash, never colored-on-colored.
 * Density grid (repeated verbatim): 56px topbar · 44px coverage strip ·
 *   44px column headers · 12px board gutter · 12px card padding · 40px
 *   card risk dial · 64px drawer risk dial · 44px touch-type rows · 44px
 *   history rows · 360px drawer · 40px officer chips · every interactive
 *   element >= 40px tall.
 * Fixture policy: one state owner — the donors array. logTouch(donorId,
 *   typeId, note) is the only mutation: it prepends a history row, eases
 *   riskScore by the touch weight (floor 5), and every derived surface
 *   (dial, tier pill, next-best-action chip, column badge, coverage bar,
 *   week counter, history timeline) recomputes from that array in the same
 *   render. Officer chips and the drawer are local UI state.
 */

import {useCallback, useEffect, useMemo, useRef, useState} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {
  BuildingIcon,
  CalendarHeartIcon,
  HandshakeIcon,
  LandmarkIcon,
  MailIcon,
  PenLineIcon,
  PhoneIcon,
  SparklesIcon,
  UserRoundIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// BRAND
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-nonprofit-donor-stewardship';

/**
 * THE quarantined brand literal — Stewardly plum.
 * Light arm #86198F on #FFFFFF ≈ 8.2:1; dark arm #F0ABFC on ~#1C1C1E ≈ 9.8:1.
 */
const BRAND_ACCENT = 'light-dark(#86198F, #F0ABFC)';
/**
 * Ink painted over a BRAND_ACCENT fill.
 * #FFFFFF on #86198F ≈ 8.2:1; #3D0A44 on #F0ABFC ≈ 9.0:1.
 */
const BRAND_ON = 'light-dark(#FFFFFF, #3D0A44)';

const CAMPAIGN = {
  org: 'Stewardly',
  name: 'Every Child Reads',
  goal: 2_400_000,
  cycle: 'FY26 · Q1 close Sep 30',
};

/** Risk at or above this line counts a Steward pledge as "at risk". */
const RISK_LINE = 60;
/** Risk never fully retires — the floor a touch can ease a donor to. */
const RISK_FLOOR = 5;
/** History rows with daysAgo <= 3 count as "this week" (today = Thu Jul 9). */
const WEEK_WINDOW_DAYS = 3;

// ---------------------------------------------------------------------------
// DOMAIN VOCABULARY
// ---------------------------------------------------------------------------

type StageId = 'qualify' | 'cultivate' | 'solicit' | 'steward';
type TierId = 'high' | 'watch' | 'steady';
type OfficerId = 'pn' | 'mw' | 'es';
type DonorKind = 'individual' | 'foundation' | 'corporate' | 'daf';
type TouchTypeId = 'visit' | 'call' | 'event' | 'note' | 'thanks';

interface StageMeta {
  id: StageId;
  label: string;
  /** What the stage's money column means — targets, open asks, committed. */
  moneyLabel: string;
}

const STAGES: StageMeta[] = [
  {id: 'qualify', label: 'Qualify', moneyLabel: 'targets'},
  {id: 'cultivate', label: 'Cultivate', moneyLabel: 'targets'},
  {id: 'solicit', label: 'Solicit', moneyLabel: 'open asks'},
  {id: 'steward', label: 'Steward', moneyLabel: 'committed'},
];

const OFFICERS: Record<OfficerId, {initials: string; name: string}> = {
  pn: {initials: 'PN', name: 'Priya Natarajan'},
  mw: {initials: 'MW', name: 'Marcus Webb'},
  es: {initials: 'ES', name: 'Elena Sosa'},
};
const OFFICER_ORDER: OfficerId[] = ['pn', 'mw', 'es'];

interface TouchTypeMeta {
  id: TouchTypeId;
  label: string;
  /** How many risk points this touch eases (subtracted, floored at 5). */
  weight: number;
  icon: typeof PhoneIcon;
}

/** Ordered heaviest-first — the composer lists them in this order. */
const TOUCH_TYPES: TouchTypeMeta[] = [
  {id: 'visit', label: 'Site visit', weight: 18, icon: HandshakeIcon},
  {id: 'call', label: 'Phone call', weight: 12, icon: PhoneIcon},
  {id: 'event', label: 'Event invite', weight: 10, icon: CalendarHeartIcon},
  {id: 'note', label: 'Handwritten note', weight: 8, icon: PenLineIcon},
  {id: 'thanks', label: 'Thank-you email', weight: 5, icon: MailIcon},
];
const TOUCH_TYPE_BY_ID = new Map(TOUCH_TYPES.map(t => [t.id, t]));

const KIND_META: Record<DonorKind, {label: string; icon: typeof UserRoundIcon}> = {
  individual: {label: 'Individual', icon: UserRoundIcon},
  foundation: {label: 'Foundation', icon: LandmarkIcon},
  corporate: {label: 'Corporate', icon: BuildingIcon},
  daf: {label: 'DAF / trust', icon: LandmarkIcon},
};

interface TouchRecord {
  dateLabel: string;
  daysAgo: number;
  type: TouchTypeId;
  note: string;
}

interface Donor {
  id: string;
  name: string;
  kind: DonorKind;
  stage: StageId;
  officer: OfficerId;
  /** Stage-appropriate dollars: target (qualify/cultivate), ask, committed. */
  amount: number;
  /** One line of gift mechanics — schedule, vehicle, or pipeline note. */
  vehicle: string;
  /** 0–100; >= RISK_LINE counts committed dollars as at-risk. */
  riskScore: number;
  history: TouchRecord[];
}

// ---------------------------------------------------------------------------
// DONOR FIXTURES — see @input for the hand-checked aggregates.
// ---------------------------------------------------------------------------

const INITIAL_DONORS: Donor[] = [
  // ---- Steward: committed $1,205,000 -------------------------------------
  {
    id: 'd-okafor',
    name: 'Marguerite Okafor',
    kind: 'individual',
    stage: 'steward',
    officer: 'pn',
    amount: 450_000,
    vehicle: '5-yr pledge · $90K/yr · current',
    riskScore: 22,
    history: [
      {
        dateLabel: 'Jul 8',
        daysAgo: 1,
        type: 'thanks',
        note: 'Thanked her for the Q2 installment; she asked about naming the Westside reading room.',
      },
      {
        dateLabel: 'Jun 19',
        daysAgo: 20,
        type: 'visit',
        note: 'Site visit to the Lincoln Elementary cohort — brought her granddaughter, stayed for story hour.',
      },
      {
        dateLabel: 'May 30',
        daysAgo: 40,
        type: 'call',
        note: 'Quarterly check-in; confirmed summer travel dates so the fall ask lands after Labor Day.',
      },
    ],
  },
  {
    // Stress fixture: 61-char legal name exercises card + drawer wrapping.
    id: 'd-hollenbeck',
    name: 'The Hollenbeck–Aizenberg Family Charitable Remainder Unitrust',
    kind: 'daf',
    stage: 'steward',
    officer: 'mw',
    amount: 300_000,
    vehicle: 'CRUT distribution · 2 installments behind',
    riskScore: 68,
    history: [
      {
        dateLabel: 'May 12',
        daysAgo: 58,
        type: 'note',
        note: 'Mailed the pledge-schedule reminder to the trustee. No reply as of July.',
      },
      {
        dateLabel: 'Mar 27',
        daysAgo: 104,
        type: 'call',
        note: 'Trustee says distributions wait on their fiscal close; asked us to re-send wiring instructions.',
      },
    ],
  },
  {
    id: 'd-calloway',
    name: 'Calloway Family Foundation',
    kind: 'foundation',
    stage: 'steward',
    officer: 'es',
    amount: 250_000,
    vehicle: '3-yr grant · interim report due Sep 15',
    riskScore: 41,
    history: [
      {
        dateLabel: 'Jun 30',
        daysAgo: 9,
        type: 'note',
        note: 'Sent the mid-year literacy outcomes memo ahead of the September report.',
      },
      {
        dateLabel: 'Apr 22',
        daysAgo: 78,
        type: 'call',
        note: 'Program officer wants third-grade reading-level data broken out by school in the next report.',
      },
    ],
  },
  {
    id: 'd-brightwater',
    name: 'Brightwater Paper Co.',
    kind: 'corporate',
    stage: 'steward',
    officer: 'mw',
    amount: 120_000,
    vehicle: 'Sponsorship + employee match',
    riskScore: 35,
    history: [
      {
        dateLabel: 'Jul 7',
        daysAgo: 2,
        type: 'call',
        note: 'CSR lead confirmed the match portal reopens Aug 1; wants co-branded bookplate art by then.',
      },
      {
        dateLabel: 'Jun 3',
        daysAgo: 36,
        type: 'event',
        note: 'Invited their leadership team to the fall kickoff; three RSVPs so far.',
      },
    ],
  },
  {
    id: 'd-reyes',
    name: 'Dean & Alma Reyes',
    kind: 'individual',
    stage: 'steward',
    officer: 'es',
    amount: 85_000,
    vehicle: 'Pledge · paid 40% · balance $51K',
    riskScore: 74,
    history: [
      {
        dateLabel: 'Jan 12',
        daysAgo: 178,
        type: 'event',
        note: 'Attended the winter gala. No contact since — their last two installments are unscheduled.',
      },
    ],
  },
  // ---- Solicit: open asks $425,000 ----------------------------------------
  {
    id: 'd-adeyemi',
    name: 'Yusuf Adeyemi-Grant',
    kind: 'individual',
    stage: 'solicit',
    officer: 'pn',
    amount: 200_000,
    vehicle: 'Proposal delivered Jun 26',
    riskScore: 58,
    history: [
      {
        dateLabel: 'Jul 6',
        daysAgo: 3,
        type: 'call',
        note: 'Left voicemail — second attempt since the proposal went out. Assistant says he is traveling.',
      },
      {
        dateLabel: 'Jun 26',
        daysAgo: 13,
        type: 'note',
        note: 'Hand-delivered the $200K proposal with the tutoring-corps budget he asked for.',
      },
    ],
  },
  {
    id: 'd-trask',
    name: 'Nell Trask',
    kind: 'individual',
    stage: 'solicit',
    officer: 'pn',
    amount: 150_000,
    vehicle: 'Ask meeting set · Jul 17',
    riskScore: 30,
    history: [
      {
        dateLabel: 'Jul 7',
        daysAgo: 2,
        type: 'call',
        note: 'Confirmed the July 17 ask meeting; she wants the ED in the room.',
      },
      {
        dateLabel: 'Jun 11',
        daysAgo: 28,
        type: 'visit',
        note: 'Walked her through the new-readers wing plans; she lingered on the family literacy lab.',
      },
    ],
  },
  {
    id: 'd-ferris',
    name: 'Ferris & Wong LLP',
    kind: 'corporate',
    stage: 'solicit',
    officer: 'mw',
    amount: 75_000,
    vehicle: 'Partner vote this month',
    riskScore: 45,
    history: [
      {
        dateLabel: 'Jun 24',
        daysAgo: 15,
        type: 'note',
        note: 'Sent the one-pager their managing partner requested for the July partners meeting.',
      },
    ],
  },
  // ---- Cultivate: targets $210,000 ----------------------------------------
  {
    id: 'd-nakamura',
    name: 'Priscilla Nakamura',
    kind: 'individual',
    stage: 'cultivate',
    officer: 'es',
    amount: 100_000,
    vehicle: 'Warm — two tours attended',
    riskScore: 52,
    history: [
      {
        dateLabel: 'Jun 14',
        daysAgo: 25,
        type: 'event',
        note: 'Joined the volunteer reader orientation; asked pointed questions about per-student cost.',
      },
    ],
  },
  {
    id: 'd-fitch',
    name: 'Ambrose Fitch',
    kind: 'individual',
    stage: 'cultivate',
    officer: 'mw',
    amount: 50_000,
    vehicle: 'Legacy society member',
    riskScore: 26,
    history: [
      {
        dateLabel: 'Jul 6',
        daysAgo: 3,
        type: 'note',
        note: 'Birthday card with a photo from the spring read-a-thon he sponsored.',
      },
      {
        dateLabel: 'May 20',
        daysAgo: 50,
        type: 'call',
        note: 'Talked estate planning timing; his attorney meets him in August.',
      },
    ],
  },
  {
    id: 'd-sablecreek',
    name: 'The Sable Creek Donor-Advised Fund',
    kind: 'daf',
    stage: 'cultivate',
    officer: 'pn',
    amount: 60_000,
    vehicle: 'Advisor gatekeeps contact',
    riskScore: 63,
    history: [
      {
        dateLabel: 'Apr 30',
        daysAgo: 70,
        type: 'note',
        note: 'Quarterly update mailed via the fund advisor — no direct channel to the family yet.',
      },
    ],
  },
  // ---- Qualify: targets $80,000 --------------------------------------------
  {
    id: 'd-ibarra',
    name: 'Tomás Ibarra',
    kind: 'individual',
    stage: 'qualify',
    officer: 'es',
    amount: 25_000,
    vehicle: 'Board referral · June',
    riskScore: 38,
    history: [
      {
        dateLabel: 'Jun 20',
        daysAgo: 19,
        type: 'call',
        note: 'Intro call via board chair — ran a bilingual bookstore for 20 years, wants to help sourcing.',
      },
    ],
  },
  {
    id: 'd-okonjo',
    name: 'Winnie Okonjo-Bell',
    kind: 'individual',
    stage: 'qualify',
    officer: 'mw',
    amount: 40_000,
    vehicle: 'Event walk-in · high engagement',
    riskScore: 55,
    history: [
      {
        dateLabel: 'Jul 8',
        daysAgo: 1,
        type: 'event',
        note: 'Came to the summer open house unprompted and signed up for the newsletter and a tour.',
      },
    ],
  },
  {
    // Stress fixture: zero history — the drawer timeline shows its empty state.
    id: 'd-voss',
    name: 'Harriet Voss',
    kind: 'individual',
    stage: 'qualify',
    officer: 'pn',
    amount: 15_000,
    vehicle: 'From Jun 30 wealth screen',
    riskScore: 47,
    history: [],
  },
];

// ---------------------------------------------------------------------------
// PURE DERIVATIONS
// ---------------------------------------------------------------------------

function riskTier(score: number): TierId {
  if (score >= RISK_LINE) {
    return 'high';
  }
  if (score >= 30) {
    return 'watch';
  }
  return 'steady';
}

const TIER_LABELS: Record<TierId, string> = {
  high: 'At risk',
  watch: 'Watch',
  steady: 'On track',
};

/**
 * Next-best action — a pure table over stage × risk tier, so logging a
 * touch that changes the tier visibly rewrites the chip on the card, in
 * the drawer preview, and in the announcement.
 */
const NEXT_BEST_ACTION: Record<StageId, Record<TierId, string>> = {
  qualify: {
    high: 'Discovery call before month end',
    watch: 'Screen giving history, then intro call',
    steady: 'Invite to a classroom story hour',
  },
  cultivate: {
    high: 'Officer coffee — re-anchor the vision',
    watch: 'Program tour with a student reader',
    steady: 'Share the Q3 literacy outcomes memo',
  },
  solicit: {
    high: 'ED joins the ask meeting',
    watch: 'Send the tailored proposal follow-up',
    steady: 'Set the ask date',
  },
  steward: {
    high: 'Site visit + pledge schedule reset',
    watch: 'Handwritten impact note',
    steady: 'Quarterly impact report is enough',
  },
};

function nextBestAction(stage: StageId, score: number): string {
  return NEXT_BEST_ACTION[stage][riskTier(score)];
}

function formatMoney(value: number): string {
  return \`$\${value.toLocaleString('en-US')}\`;
}

/** Compact dollars for tight chrome: $450K / $1.21M. */
function formatMoneyCompact(value: number): string {
  if (value >= 1_000_000) {
    const millions = value / 1_000_000;
    const text = millions.toFixed(millions >= 10 ? 1 : 2).replace(/\\.?0+$/, '');
    return \`$\${text}M\`;
  }
  return \`$\${Math.round(value / 1000)}K\`;
}

function lastTouchLine(donor: Donor): string {
  const last = donor.history[0];
  if (last == null) {
    return 'Never touched';
  }
  const meta = TOUCH_TYPE_BY_ID.get(last.type);
  const when = last.daysAgo === 0 ? 'today' : \`\${last.daysAgo}d ago\`;
  return \`\${meta?.label ?? last.type} · \${when}\`;
}

interface Coverage {
  secured: number;
  atRisk: number;
  securedPct: number;
  atRiskPct: number;
  committed: number;
}

/** Campaign coverage derives live: Steward dollars split at the risk line. */
function deriveCoverage(donors: Donor[]): Coverage {
  let secured = 0;
  let atRisk = 0;
  for (const donor of donors) {
    if (donor.stage !== 'steward') {
      continue;
    }
    if (donor.riskScore >= RISK_LINE) {
      atRisk += donor.amount;
    } else {
      secured += donor.amount;
    }
  }
  return {
    secured,
    atRisk,
    securedPct: (secured / CAMPAIGN.goal) * 100,
    atRiskPct: (atRisk / CAMPAIGN.goal) * 100,
    committed: secured + atRisk,
  };
}

function touchesThisWeek(donors: Donor[]): number {
  let count = 0;
  for (const donor of donors) {
    for (const touch of donor.history) {
      if (touch.daysAgo <= WEEK_WINDOW_DAYS) {
        count += 1;
      }
    }
  }
  return count;
}

const STAGE_AMOUNT_PREFIX: Record<StageId, string> = {
  qualify: 'Target',
  cultivate: 'Target',
  solicit: 'Ask',
  steward: 'Committed',
};

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector scoped under .tpl-nonprofit-donor-stewardship
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  --nds-accent: \${BRAND_ACCENT};
  --nds-on-accent: \${BRAND_ON};
  --nds-accent-wash: color-mix(in srgb, \${BRAND_ACCENT} 12%, var(--color-background-card));
  --nds-accent-border: color-mix(in srgb, \${BRAND_ACCENT} 40%, var(--color-border));
  color: var(--color-text-primary);
  font-family: var(--font-family-sans, var(--font-family-body, system-ui, sans-serif));
}
.\${SCOPE} *,
.\${SCOPE} *::before,
.\${SCOPE} *::after {
  box-sizing: border-box;
}
.\${SCOPE} h1,
.\${SCOPE} h2,
.\${SCOPE} h3,
.\${SCOPE} p,
.\${SCOPE} ul,
.\${SCOPE} ol,
.\${SCOPE} li {
  margin: 0;
  padding: 0;
}
.\${SCOPE} ul,
.\${SCOPE} ol {
  list-style: none;
}
.\${SCOPE} button {
  background: none;
  border: 0;
  color: inherit;
  cursor: pointer;
  font: inherit;
  padding: 0;
  text-align: inherit;
}
.\${SCOPE} button:focus-visible,
.\${SCOPE} textarea:focus-visible {
  border-radius: 6px;
  outline: 2px solid var(--nds-accent);
  outline-offset: 2px;
}
.\${SCOPE} .num {
  font-variant-numeric: tabular-nums;
}

/* ---- header: 56px topbar + 44px coverage strip -------------------------- */
.\${SCOPE}.topbar {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
}
.\${SCOPE} .brandCluster {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--spacing-3);
  min-width: 0;
}
.\${SCOPE} .brandMark {
  align-items: center;
  background: var(--nds-accent);
  border-radius: 10px;
  color: var(--nds-on-accent);
  display: inline-flex;
  flex: none;
  height: 36px;
  justify-content: center;
  width: 36px;
}
.\${SCOPE} .brandText {
  min-width: 0;
}
.\${SCOPE} .eyebrow {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.06em;
  line-height: 1.3;
  text-transform: uppercase;
  white-space: nowrap;
}
.\${SCOPE} h1 {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .topbarSpring {
  flex: 1 1 auto;
  min-width: 0;
}
.\${SCOPE} .officerChips {
  display: flex;
  flex: none;
  gap: var(--spacing-1);
  overflow-x: auto;
}
.\${SCOPE} .officerChip {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  gap: 6px;
  min-height: 40px;
  padding: 0 12px;
  transition: background-color 140ms ease, border-color 140ms ease, color 140ms ease;
}
@media (hover: hover) {
  .\${SCOPE} .officerChip:hover {
    background: var(--color-overlay-hover);
  }
}
.\${SCOPE} .officerChip[aria-pressed='true'] {
  background: var(--nds-accent);
  border-color: var(--nds-accent);
  color: var(--nds-on-accent);
}
.\${SCOPE} .officerChip .chipCount {
  font-size: 11px;
  font-weight: 700;
}
.\${SCOPE} .officerChip .chipLabel {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
}
.\${SCOPE} .weekCounter {
  align-items: baseline;
  color: var(--color-text-secondary);
  display: flex;
  flex: none;
  font-size: 12px;
  gap: 6px;
  white-space: nowrap;
}
.\${SCOPE} .weekCounter strong {
  color: var(--color-text-primary);
  font-size: 15px;
  font-weight: 700;
}

.\${SCOPE}.coverage {
  align-items: center;
  border-top: var(--border-width) solid var(--color-border);
  display: flex;
  gap: var(--spacing-4);
  min-height: 44px;
  padding: var(--spacing-1) var(--spacing-4);
}
.\${SCOPE} .coverageBarWrap {
  flex: 1 1 auto;
  min-width: 160px;
}
.\${SCOPE} .coverageBar {
  background: var(--color-background-muted);
  border-radius: 999px;
  display: flex;
  height: 10px;
  overflow: hidden;
}
.\${SCOPE} .coverageSecured {
  background: var(--nds-accent);
  transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
/* At-risk band: warning hatch — reads as "counted, but not safe". */
.\${SCOPE} .coverageAtRisk {
  background: repeating-linear-gradient(
    -45deg,
    var(--color-warning) 0 4px,
    var(--color-warning-muted) 4px 8px
  );
  transition: width 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.\${SCOPE} .coverageLegend {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  flex: none;
  flex-wrap: wrap;
  font-size: 12px;
  gap: var(--spacing-1) var(--spacing-3);
  white-space: nowrap;
}
.\${SCOPE} .legendSwatch {
  border-radius: 3px;
  display: inline-block;
  height: 10px;
  margin-right: 5px;
  vertical-align: -1px;
  width: 10px;
}
.\${SCOPE} .legendSwatch.secured {
  background: var(--nds-accent);
}
.\${SCOPE} .legendSwatch.atRisk {
  background: repeating-linear-gradient(
    -45deg,
    var(--color-warning) 0 3px,
    var(--color-warning-muted) 3px 6px
  );
}
.\${SCOPE} .coverageLegend strong {
  color: var(--color-text-primary);
  font-weight: 700;
}

/* ---- board ---------------------------------------------------------------- */
.\${SCOPE}.boardwrap {
  background: var(--color-background-body);
  height: 100%;
  min-height: 0;
  overflow: hidden;
  position: relative;
}
.\${SCOPE} .board {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(232px, 1fr));
  height: 100%;
  min-height: 0;
  overflow: hidden auto;
  padding: var(--spacing-3) var(--spacing-4) var(--spacing-4);
}
.\${SCOPE} .stageCol {
  background: var(--color-background-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.\${SCOPE} .stageHeader {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex: none;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 0 var(--spacing-3);
}
.\${SCOPE} .stageName {
  font-size: 13px;
  font-weight: 700;
}
.\${SCOPE} .stageCount {
  background: var(--color-background-muted);
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  min-width: 20px;
  padding: 2px 7px;
  text-align: center;
}
.\${SCOPE} .stageMoney {
  color: var(--color-text-secondary);
  font-size: 12px;
  margin-left: auto;
  white-space: nowrap;
}
.\${SCOPE} .stageMoney strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.\${SCOPE} .stageRiskBadge {
  align-items: center;
  background: var(--color-error-muted);
  border-radius: 999px;
  color: var(--color-text-primary);
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  gap: 4px;
  padding: 2px 8px;
}
.\${SCOPE} .cardList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-2);
}
.\${SCOPE} .emptyCol {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin: var(--spacing-2);
  padding: var(--spacing-4) var(--spacing-3);
  text-align: center;
}

/* ---- donor card: one <button>, 12px padding, 40px dial ------------------- */
.\${SCOPE} .donorCard {
  background: var(--color-background-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: block;
  padding: 12px;
  transition: border-color 140ms ease, background-color 140ms ease;
  width: 100%;
}
@media (hover: hover) {
  .\${SCOPE} .donorCard:hover {
    background: var(--color-overlay-hover);
    border-color: var(--nds-accent-border);
  }
}
.\${SCOPE} .donorCard[aria-pressed='true'] {
  background: var(--nds-accent-wash);
  border-color: var(--nds-accent);
}
.\${SCOPE} .cardTop {
  align-items: flex-start;
  display: flex;
  gap: var(--spacing-2);
}
.\${SCOPE} .kindGlyph {
  color: var(--color-icon-secondary);
  flex: none;
  margin-top: 1px;
}
.\${SCOPE} .donorName {
  flex: 1 1 auto;
  font-size: 13px;
  font-weight: 600;
  line-height: 1.35;
  min-width: 0;
  overflow-wrap: anywhere;
}
.\${SCOPE} .officerDot {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  font-size: 10px;
  font-weight: 700;
  height: 22px;
  justify-content: center;
  letter-spacing: 0.04em;
  width: 26px;
}
.\${SCOPE} .cardAmount {
  color: var(--color-text-secondary);
  display: block;
  font-size: 12px;
  line-height: 1.4;
  margin-top: 4px;
}
.\${SCOPE} .cardAmount strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.\${SCOPE} .cardRiskRow {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  margin-top: 8px;
}
.\${SCOPE} .tierPill {
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  padding: 3px 8px;
  white-space: nowrap;
}
.\${SCOPE} .tierPill.high { background: var(--color-error-muted); }
.\${SCOPE} .tierPill.watch { background: var(--color-warning-muted); }
.\${SCOPE} .tierPill.steady { background: var(--color-success-muted); }
.\${SCOPE} .lastTouch {
  color: var(--color-text-secondary);
  flex: 1 1 auto;
  font-size: 11px;
  min-width: 0;
  overflow: hidden;
  text-align: right;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .nbaChip {
  align-items: center;
  background: var(--nds-accent-wash);
  border: var(--border-width) solid var(--nds-accent-border);
  border-radius: 6px;
  color: var(--color-text-primary);
  display: flex;
  font-size: 11px;
  font-weight: 600;
  gap: 6px;
  line-height: 1.35;
  margin-top: 8px;
  min-height: 28px;
  padding: 4px 8px;
}
.\${SCOPE} .nbaChip .nbaIcon {
  color: var(--nds-accent);
  display: inline-flex;
  flex: none;
}

/* ---- risk dial ------------------------------------------------------------ */
.\${SCOPE} .riskDial {
  flex: none;
}
.\${SCOPE} .riskDial .dialTrack {
  stroke: var(--color-background-muted);
}
.\${SCOPE} .riskDial .dialArc {
  transition: stroke-dasharray 420ms cubic-bezier(0.22, 1, 0.36, 1);
}
.\${SCOPE} .riskDial.high .dialArc { stroke: var(--color-error); }
.\${SCOPE} .riskDial.watch .dialArc { stroke: var(--color-warning); }
.\${SCOPE} .riskDial.steady .dialArc { stroke: var(--color-success); }
.\${SCOPE} .riskDial .dialValue {
  fill: var(--color-text-primary);
  font-family: inherit;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}

/* ---- touch composer drawer: 360px absolute overlay ----------------------- */
.\${SCOPE} .drawerScrim {
  background: transparent;
  inset: 0;
  position: absolute;
  z-index: 4;
}
.\${SCOPE} .drawer {
  background: var(--color-background-card);
  border-left: var(--border-width) solid var(--color-border);
  bottom: 0;
  box-shadow: -12px 0 32px var(--color-shadow, rgba(0, 0, 0, 0.18));
  display: flex;
  flex-direction: column;
  min-height: 0;
  position: absolute;
  right: 0;
  top: 0;
  width: 360px;
  z-index: 5;
}
.\${SCOPE} .drawerHeader {
  align-items: flex-start;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  flex: none;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
}
.\${SCOPE} .drawerTitleBlock {
  flex: 1 1 auto;
  min-width: 0;
}
.\${SCOPE} .drawerDonorName {
  font-size: 14px;
  font-weight: 700;
  line-height: 1.3;
  overflow-wrap: anywhere;
}
.\${SCOPE} .drawerMeta {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.4;
  margin-top: 2px;
}
.\${SCOPE} .drawerClose {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  display: inline-flex;
  flex: none;
  height: 40px;
  justify-content: center;
  width: 40px;
}
@media (hover: hover) {
  .\${SCOPE} .drawerClose:hover {
    background: var(--color-overlay-hover);
  }
}
.\${SCOPE} .drawerBody {
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: var(--spacing-3);
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3);
}
.\${SCOPE} .drawerDialRow {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
}
.\${SCOPE} .drawerDialCopy {
  flex: 1 1 auto;
  min-width: 0;
}
.\${SCOPE} .drawerDialCopy .nbaNow {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.45;
  margin-top: 4px;
}
.\${SCOPE} .drawerDialCopy .nbaNow strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
.\${SCOPE} .sectionLabel {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}
.\${SCOPE} .touchTypeList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
}
.\${SCOPE} .touchTypeRow {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  display: flex;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: 0 var(--spacing-3);
  transition: border-color 140ms ease, background-color 140ms ease;
}
@media (hover: hover) {
  .\${SCOPE} .touchTypeRow:hover {
    background: var(--color-overlay-hover);
  }
}
.\${SCOPE} .touchTypeRow[aria-pressed='true'] {
  background: var(--nds-accent-wash);
  border-color: var(--nds-accent);
}
.\${SCOPE} .touchTypeRow .touchIcon {
  color: var(--color-icon-secondary);
  display: inline-flex;
  flex: none;
}
.\${SCOPE} .touchTypeRow[aria-pressed='true'] .touchIcon {
  color: var(--nds-accent);
}
.\${SCOPE} .touchTypeLabel {
  flex: 1 1 auto;
  font-size: 13px;
  font-weight: 600;
}
.\${SCOPE} .touchWeight {
  color: var(--color-text-secondary);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .noteField {
  background: var(--color-background-body);
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font: inherit;
  font-size: 13px;
  line-height: 1.5;
  min-height: 72px;
  padding: var(--spacing-2) var(--spacing-3);
  resize: vertical;
  width: 100%;
}
.\${SCOPE} .previewLine {
  background: var(--color-background-muted);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.55;
  padding: var(--spacing-2) var(--spacing-3);
}
.\${SCOPE} .previewLine strong {
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
.\${SCOPE} .logButton {
  align-items: center;
  background: var(--nds-accent);
  border-radius: 8px;
  color: var(--nds-on-accent);
  display: flex;
  font-size: 13px;
  font-weight: 700;
  gap: var(--spacing-2);
  justify-content: center;
  min-height: 40px;
  padding: 0 var(--spacing-3);
  width: 100%;
}
@media (hover: hover) {
  .\${SCOPE} .logButton:hover {
    filter: brightness(1.08);
  }
}
.\${SCOPE} .historyList {
  border-top: var(--border-width) solid var(--color-border);
  display: flex;
  flex-direction: column;
  padding-top: var(--spacing-2);
}
.\${SCOPE} .historyRow {
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: var(--spacing-2) 0;
}
.\${SCOPE} .historyRow:last-child {
  border-bottom: 0;
}
.\${SCOPE} .historyIcon {
  color: var(--color-icon-secondary);
  flex: none;
  margin-top: 2px;
}
.\${SCOPE} .historyCopy {
  flex: 1 1 auto;
  min-width: 0;
}
.\${SCOPE} .historyHead {
  color: var(--color-text-secondary);
  font-size: 11px;
  font-weight: 600;
}
.\${SCOPE} .historyHead strong {
  color: var(--color-text-primary);
}
.\${SCOPE} .historyNote {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  margin-top: 2px;
}
.\${SCOPE} .historyEmpty {
  border: var(--border-width) dashed var(--color-border);
  border-radius: 8px;
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.5;
  padding: var(--spacing-3);
  text-align: center;
}

/* ---- a11y helpers ---------------------------------------------------------- */
.\${SCOPE} .visuallyHidden,
.\${SCOPE}.visuallyHidden {
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* ---- responsive: subtraction, not squeeze --------------------------------- */
@media (max-width: 980px) {
  .\${SCOPE} .board {
    display: flex;
    overflow-x: auto;
    scroll-snap-type: x mandatory;
  }
  .\${SCOPE} .stageCol {
    flex: none;
    scroll-snap-align: start;
    width: 272px;
  }
  .\${SCOPE}.coverage {
    align-items: flex-start;
    flex-direction: column;
    gap: var(--spacing-1);
    padding-bottom: var(--spacing-2);
  }
}
@media (max-width: 640px) {
  .\${SCOPE}.topbar {
    flex-wrap: wrap;
    padding-bottom: var(--spacing-2);
  }
  .\${SCOPE} .topbarSpring {
    display: none;
  }
  .\${SCOPE} .officerChips {
    flex: 1 1 100%;
    order: 3;
  }
  .\${SCOPE} .drawer {
    width: 100%;
  }
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} *,
  .\${SCOPE} *::before,
  .\${SCOPE} *::after {
    animation-duration: 0ms !important;
    transition-duration: 0ms !important;
  }
}
\`;

// ---------------------------------------------------------------------------
// BRAND MARK — a cupped hand holding a rising seed-leaf, drawn inline.
// ---------------------------------------------------------------------------

function StewardlyMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
      {/* Cupped hand: a shallow open arc. */}
      <path
        d="M3 12c0 3.3 3.1 5.5 7 5.5s7-2.2 7-5.5"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      {/* Rising stem + seed. */}
      <path d="M10 13V6.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      <circle cx="10" cy="4.4" r="1.9" fill="currentColor" />
      {/* Leaf flick. */}
      <path d="M10 9.5c1.9 0 3.2-1.2 3.6-3-1.9 0-3.2 1.2-3.6 3z" fill="currentColor" />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// RISK DIAL — 240° gauge arc; pathLength=100 keeps the dash math trivial.
// ---------------------------------------------------------------------------

function dialArcPath(cx: number, cy: number, r: number): string {
  // 240° sweep from 210° (lower-left) clockwise across the top to -30°.
  const start = (210 * Math.PI) / 180;
  const end = (-30 * Math.PI) / 180;
  const x1 = cx + r * Math.cos(start);
  const y1 = cy - r * Math.sin(start);
  const x2 = cx + r * Math.cos(end);
  const y2 = cy - r * Math.sin(end);
  return \`M \${x1.toFixed(2)} \${y1.toFixed(2)} A \${r} \${r} 0 1 1 \${x2.toFixed(2)} \${y2.toFixed(2)}\`;
}

function RiskDial({
  value,
  size,
  label,
}: {
  value: number;
  size: 40 | 64;
  label: string;
}) {
  const tier = riskTier(value);
  const r = size === 64 ? 26 : 16;
  const strokeWidth = size === 64 ? 6 : 4.5;
  const c = size / 2;
  const path = dialArcPath(c, c, r);
  return (
    <svg
      className={\`riskDial \${tier}\`}
      width={size}
      height={size}
      viewBox={\`0 0 \${size} \${size}\`}
      role="img"
      aria-label={label}>
      <path
        className="dialTrack"
        d={path}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        pathLength={100}
      />
      <path
        className="dialArc"
        d={path}
        fill="none"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        pathLength={100}
        strokeDasharray={\`\${Math.max(0.5, value)} 100\`}
      />
      <text
        className="dialValue"
        x={c}
        y={c + (size === 64 ? 6 : 4.5)}
        textAnchor="middle"
        fontSize={size === 64 ? 17 : 11}>
        {value}
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// DONOR CARD — the whole card is the button that opens the composer.
// ---------------------------------------------------------------------------

function DonorCard({
  donor,
  isOpen,
  onOpen,
}: {
  donor: Donor;
  isOpen: boolean;
  onOpen: (id: string) => void;
}) {
  const kind = KIND_META[donor.kind];
  const tier = riskTier(donor.riskScore);
  return (
    <li>
      <button
        type="button"
        id={\`nds-card-\${donor.id}\`}
        className="donorCard"
        aria-pressed={isOpen}
        aria-label={\`\${donor.name} — \${STAGE_AMOUNT_PREFIX[donor.stage]} \${formatMoney(
          donor.amount,
        )}, risk \${donor.riskScore} (\${TIER_LABELS[tier]}). Open the touch composer.\`}
        onClick={() => onOpen(donor.id)}>
        <span className="cardTop">
          <span className="kindGlyph" title={kind.label}>
            <Icon icon={kind.icon} size="sm" color="inherit" />
          </span>
          <span className="donorName">{donor.name}</span>
          <span className="officerDot" title={OFFICERS[donor.officer].name}>
            {OFFICERS[donor.officer].initials}
          </span>
        </span>
        <span className="cardAmount">
          {STAGE_AMOUNT_PREFIX[donor.stage]}{' '}
          <strong className="num">{formatMoney(donor.amount)}</strong> · {donor.vehicle}
        </span>
        <span className="cardRiskRow">
          <RiskDial
            value={donor.riskScore}
            size={40}
            label={\`Pledge risk \${donor.riskScore} of 100\`}
          />
          <span className={\`tierPill \${tier}\`}>{TIER_LABELS[tier]}</span>
          <span className="lastTouch">{lastTouchLine(donor)}</span>
        </span>
        <span className="nbaChip">
          <span className="nbaIcon">
            <Icon icon={SparklesIcon} size="xsm" color="inherit" />
          </span>
          {nextBestAction(donor.stage, donor.riskScore)}
        </span>
      </button>
    </li>
  );
}

// ---------------------------------------------------------------------------
// TOUCH COMPOSER DRAWER
// ---------------------------------------------------------------------------

function TouchComposer({
  donor,
  onClose,
  onLog,
}: {
  donor: Donor;
  onClose: () => void;
  onLog: (donorId: string, typeId: TouchTypeId, note: string) => void;
}) {
  const [typeId, setTypeId] = useState<TouchTypeId>('call');
  const [note, setNote] = useState('');
  const drawerRef = useRef<HTMLDivElement | null>(null);

  // Reset the composer + move focus in whenever it re-targets a donor.
  useEffect(() => {
    setTypeId('call');
    setNote('');
    drawerRef.current?.focus({preventScroll: true});
  }, [donor.id]);

  const selected = TOUCH_TYPE_BY_ID.get(typeId);
  const weight = selected?.weight ?? 0;
  const previewRisk = Math.max(RISK_FLOOR, donor.riskScore - weight);
  const previewTier = riskTier(previewRisk);
  const previewAction = nextBestAction(donor.stage, previewRisk);
  const crossesLine =
    donor.stage === 'steward' &&
    donor.riskScore >= RISK_LINE &&
    previewRisk < RISK_LINE;

  return (
    <div
      ref={drawerRef}
      className="drawer"
      role="dialog"
      aria-label={\`Touch composer for \${donor.name}\`}
      tabIndex={-1}
      onKeyDown={event => {
        if (event.key === 'Escape') {
          event.stopPropagation();
          onClose();
        }
      }}>
      <div className="drawerHeader">
        <div className="drawerTitleBlock">
          <h2 className="drawerDonorName">{donor.name}</h2>
          <p className="drawerMeta">
            {STAGES.find(stage => stage.id === donor.stage)?.label} ·{' '}
            {STAGE_AMOUNT_PREFIX[donor.stage]}{' '}
            <span className="num">{formatMoney(donor.amount)}</span> ·{' '}
            {OFFICERS[donor.officer].name}
          </p>
        </div>
        <button
          type="button"
          className="drawerClose"
          aria-label="Close the touch composer"
          onClick={onClose}>
          <Icon icon={XIcon} size="sm" color="inherit" />
        </button>
      </div>
      <div className="drawerBody">
        <div className="drawerDialRow">
          <RiskDial
            value={donor.riskScore}
            size={64}
            label={\`Pledge risk \${donor.riskScore} of 100 — \${
              TIER_LABELS[riskTier(donor.riskScore)]
            }\`}
          />
          <div className="drawerDialCopy">
            <span className={\`tierPill \${riskTier(donor.riskScore)}\`}>
              {TIER_LABELS[riskTier(donor.riskScore)]}
            </span>
            <p className="nbaNow">
              Next best action:{' '}
              <strong>{nextBestAction(donor.stage, donor.riskScore)}</strong>
            </p>
          </div>
        </div>

        <p className="sectionLabel" id={\`nds-touch-types-\${donor.id}\`}>
          Log a stewardship touch
        </p>
        <div
          className="touchTypeList"
          role="group"
          aria-labelledby={\`nds-touch-types-\${donor.id}\`}>
          {TOUCH_TYPES.map(touch => (
            <button
              key={touch.id}
              type="button"
              className="touchTypeRow"
              aria-pressed={typeId === touch.id}
              onClick={() => setTypeId(touch.id)}>
              <span className="touchIcon">
                <Icon icon={touch.icon} size="sm" color="inherit" />
              </span>
              <span className="touchTypeLabel">{touch.label}</span>
              <span className="touchWeight">eases −{touch.weight}</span>
            </button>
          ))}
        </div>

        <label className="visuallyHidden" htmlFor={\`nds-note-\${donor.id}\`}>
          Touch note
        </label>
        <textarea
          id={\`nds-note-\${donor.id}\`}
          className="noteField"
          placeholder="What happened? (optional — lands in the history timeline)"
          value={note}
          onChange={event => setNote(event.target.value)}
        />

        <p className="previewLine">
          Logging a {selected?.label.toLowerCase()} eases risk{' '}
          <strong>{donor.riskScore}</strong> → <strong>{previewRisk}</strong> (
          {TIER_LABELS[previewTier]}). Next action becomes “{previewAction}”.
          {crossesLine
            ? \` Moves \${formatMoney(donor.amount)} from at-risk to secured on the campaign bar.\`
            : ''}
        </p>

        <button
          type="button"
          className="logButton"
          onClick={() => onLog(donor.id, typeId, note.trim())}>
          <Icon icon={SparklesIcon} size="sm" color="inherit" />
          Log {selected?.label.toLowerCase()}
        </button>

        <p className="sectionLabel">Touch history</p>
        {donor.history.length === 0 ? (
          <p className="historyEmpty">
            No touches yet — this record was created from the Jun 30 wealth
            screen. The first logged touch starts the timeline.
          </p>
        ) : (
          <ol className="historyList">
            {donor.history.map((touch, index) => {
              const meta = TOUCH_TYPE_BY_ID.get(touch.type);
              const TouchTypeIcon = meta?.icon ?? PhoneIcon;
              return (
                <li className="historyRow" key={\`\${touch.dateLabel}-\${index}\`}>
                  <span className="historyIcon">
                    <Icon icon={TouchTypeIcon} size="sm" color="inherit" />
                  </span>
                  <span className="historyCopy">
                    <span className="historyHead">
                      <strong>{meta?.label ?? touch.type}</strong> · {touch.dateLabel}
                      {touch.daysAgo === 0 ? ' (today)' : ''}
                    </span>
                    {touch.note !== '' && <p className="historyNote">{touch.note}</p>}
                  </span>
                </li>
              );
            })}
          </ol>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function NonprofitDonorStewardshipTemplate() {
  const [donors, setDonors] = useState<Donor[]>(INITIAL_DONORS);
  const [officerFilter, setOfficerFilter] = useState<'all' | OfficerId>('all');
  const [openDonorId, setOpenDonorId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const coverage = useMemo(() => deriveCoverage(donors), [donors]);
  const weekTouches = useMemo(() => touchesThisWeek(donors), [donors]);

  const visibleDonors = useMemo(
    () =>
      officerFilter === 'all'
        ? donors
        : donors.filter(donor => donor.officer === officerFilter),
    [donors, officerFilter],
  );

  const byStage = useMemo(() => {
    const map = new Map<StageId, Donor[]>();
    for (const stage of STAGES) {
      map.set(stage.id, []);
    }
    for (const donor of visibleDonors) {
      map.get(donor.stage)?.push(donor);
    }
    return map;
  }, [visibleDonors]);

  const officerCounts = useMemo(() => {
    const counts: Record<OfficerId, number> = {pn: 0, mw: 0, es: 0};
    for (const donor of donors) {
      counts[donor.officer] += 1;
    }
    return counts;
  }, [donors]);

  const openDonor =
    openDonorId != null
      ? donors.find(donor => donor.id === openDonorId) ?? null
      : null;

  const closeComposer = useCallback(() => {
    setOpenDonorId(currentId => {
      // Restore focus to the card that opened the drawer — every close path
      // (X button, scrim, Escape) funnels through here.
      if (currentId != null) {
        const card = document.getElementById(\`nds-card-\${currentId}\`);
        if (card instanceof HTMLElement) {
          card.focus({preventScroll: true});
        }
      }
      return null;
    });
  }, []);

  const logTouch = useCallback(
    (donorId: string, typeId: TouchTypeId, note: string) => {
      const touchMeta = TOUCH_TYPE_BY_ID.get(typeId);
      if (touchMeta == null) {
        return;
      }
      setDonors(current => {
        const target = current.find(donor => donor.id === donorId);
        if (target == null) {
          return current;
        }
        const previousRisk = target.riskScore;
        const nextRisk = Math.max(RISK_FLOOR, previousRisk - touchMeta.weight);
        const crossedLine =
          target.stage === 'steward' &&
          previousRisk >= RISK_LINE &&
          nextRisk < RISK_LINE;
        setAnnouncement(
          \`Logged \${touchMeta.label.toLowerCase()} for \${target.name}. Risk \${previousRisk} to \${nextRisk} (\${
            TIER_LABELS[riskTier(nextRisk)]
          }). Next action: \${nextBestAction(target.stage, nextRisk)}.\${
            crossedLine
              ? \` \${formatMoney(target.amount)} moved from at-risk to secured.\`
              : ''
          }\`,
        );
        return current.map(donor =>
          donor.id === donorId
            ? {
                ...donor,
                riskScore: nextRisk,
                history: [
                  {
                    dateLabel: 'Today',
                    daysAgo: 0,
                    type: typeId,
                    note:
                      note !== ''
                        ? note
                        : \`\${touchMeta.label} logged from the stewardship desk.\`,
                  },
                  ...donor.history,
                ],
              }
            : donor,
        );
      });
    },
    [],
  );

  const remainderPct = Math.max(0, 100 - coverage.securedPct - coverage.atRiskPct);

  return (
    <Layout
      height="fill"
      header={
        <LayoutHeader hasDivider padding={0}>
          <style>{TEMPLATE_CSS}</style>
          <div style={{width: '100%'}}>
            <div className={\`\${SCOPE} topbar\`}>
              <div className="brandCluster">
                <span className="brandMark" aria-hidden="true">
                  <StewardlyMark />
                </span>
                <div className="brandText">
                  <p className="eyebrow">
                    {CAMPAIGN.org} · {CAMPAIGN.cycle}
                  </p>
                  <h1>{CAMPAIGN.name} — Donor Stewardship Desk</h1>
                </div>
              </div>
              <div className="topbarSpring" />
              <div
                className="officerChips"
                role="group"
                aria-label="Filter by gift officer">
                <button
                  type="button"
                  className="officerChip"
                  aria-pressed={officerFilter === 'all'}
                  onClick={() => setOfficerFilter('all')}>
                  <span className="chipLabel">All officers</span>
                  <span className="chipCount num">{donors.length}</span>
                </button>
                {OFFICER_ORDER.map(id => (
                  <button
                    key={id}
                    type="button"
                    className="officerChip"
                    aria-pressed={officerFilter === id}
                    aria-label={\`Show \${OFFICERS[id].name}'s portfolio, \${officerCounts[id]} donors\`}
                    onClick={() =>
                      setOfficerFilter(current => (current === id ? 'all' : id))
                    }>
                    <span className="chipLabel">{OFFICERS[id].initials}</span>
                    <span className="chipCount num">{officerCounts[id]}</span>
                  </button>
                ))}
              </div>
              <p className="weekCounter">
                <strong className="num">{weekTouches}</strong> touches this week
              </p>
            </div>
            <div className={\`\${SCOPE} coverage\`}>
              <div className="coverageBarWrap">
                <div
                  className="coverageBar"
                  role="img"
                  aria-label={\`Campaign coverage: \${formatMoney(
                    coverage.secured,
                  )} secured and \${formatMoney(
                    coverage.atRisk,
                  )} at risk of the \${formatMoneyCompact(CAMPAIGN.goal)} goal\`}>
                  <span
                    className="coverageSecured"
                    style={{width: \`\${coverage.securedPct}%\`}}
                  />
                  <span
                    className="coverageAtRisk"
                    style={{width: \`\${coverage.atRiskPct}%\`}}
                  />
                  <span style={{width: \`\${remainderPct}%\`}} aria-hidden="true" />
                </div>
              </div>
              <p className="coverageLegend">
                <span>
                  <span className="legendSwatch secured" aria-hidden="true" />
                  Secured{' '}
                  <strong className="num">{formatMoney(coverage.secured)}</strong>
                </span>
                <span>
                  <span className="legendSwatch atRisk" aria-hidden="true" />
                  At risk{' '}
                  <strong className="num">{formatMoney(coverage.atRisk)}</strong>
                </span>
                <span>
                  Goal{' '}
                  <strong className="num">
                    {formatMoneyCompact(CAMPAIGN.goal)}
                  </strong>{' '}
                  · <strong className="num">{Math.floor(coverage.securedPct)}%</strong>{' '}
                  secured
                </span>
              </p>
            </div>
          </div>
        </LayoutHeader>
      }
      content={
        <LayoutContent padding={0} role="main" label="Gift-stage board">
          <div className={\`\${SCOPE} boardwrap\`}>
            <div aria-live="polite" className="visuallyHidden">
              {announcement}
            </div>
            <div className="board">
              {STAGES.map(stage => {
                const stageDonors = byStage.get(stage.id) ?? [];
                const stageTotal = stageDonors.reduce(
                  (sum, donor) => sum + donor.amount,
                  0,
                );
                const stageAtRisk = stageDonors.filter(
                  donor => donor.riskScore >= RISK_LINE,
                ).length;
                return (
                  <section
                    key={stage.id}
                    className="stageCol"
                    aria-label={\`\${stage.label} — \${stageDonors.length} donors\`}>
                    <header className="stageHeader">
                      <h2 className="stageName">{stage.label}</h2>
                      <span className="stageCount num">{stageDonors.length}</span>
                      {stageAtRisk > 0 && (
                        <span
                          className="stageRiskBadge"
                          title={\`\${stageAtRisk} donor\${
                            stageAtRisk === 1 ? '' : 's'
                          } at risk\`}>
                          <span className="num">{stageAtRisk}</span> at risk
                        </span>
                      )}
                      <span className="stageMoney">
                        {stage.moneyLabel}{' '}
                        <strong className="num">
                          {formatMoneyCompact(stageTotal)}
                        </strong>
                      </span>
                    </header>
                    {stageDonors.length === 0 ? (
                      <p className="emptyCol">
                        No {stage.label.toLowerCase()} donors in{' '}
                        {officerFilter === 'all'
                          ? 'this view'
                          : \`\${OFFICERS[officerFilter].name}'s portfolio\`}
                        . Clear the officer filter to see the full board.
                      </p>
                    ) : (
                      <ul className="cardList">
                        {stageDonors.map(donor => (
                          <DonorCard
                            key={donor.id}
                            donor={donor}
                            isOpen={openDonorId === donor.id}
                            onOpen={setOpenDonorId}
                          />
                        ))}
                      </ul>
                    )}
                  </section>
                );
              })}
            </div>
            {openDonor != null && (
              <>
                {/* Click-away scrim: transparent, sits under the drawer. */}
                <button
                  type="button"
                  className="drawerScrim"
                  aria-label="Close the touch composer"
                  onClick={closeComposer}
                />
                <TouchComposer
                  donor={openDonor}
                  onClose={closeComposer}
                  onLog={logTouch}
                />
              </>
            )}
          </div>
        </LayoutContent>
      }
    />
  );
}
`;export{e as default};