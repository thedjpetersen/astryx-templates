// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Podium civic-hearing docket for
 *   the City of Alder Glen Planning Commission, Jul 14 2026, Item 7B
 *   (rezoning of 400 Larch Street, RM-2 → MX-3; docket 2026-118). Written
 *   comment window closed Jul 13 17:00. 65 written comments across six
 *   topic clusters (18 + 12 + 14 + 7 + 9 + 5 = 65 ✓). 17 speaker-queue
 *   entries: 9 individuals (7 × 2:00 + one 3:00 organization slot + one
 *   4:00 slot with 2:00 ceded by Harold Yun = 21:00) + 5 members of
 *   form-letter group A (5 × 2:00 = 10:00) + 3 members of form-letter
 *   group B (3 × 2:00 = 6:00) → 37:00 requested against a 30:00 public-
 *   comment block (over by 7:00). Merging group A converts 5 slots into
 *   one 3:00 spokesperson slot (−7:00 → exactly 30:00); merging group B
 *   converts 3 slots into one 3:00 slot (−3:00 → 27:00, 3:00 spare).
 *   Check-in ledger: 11 checked in + 4 remote + 2 not arrived = 17 ✓.
 *   No clock reads, no randomness, no timers, no network assets.
 * @output Podium — Public Comment Moderation: the clerk's console for
 *   running the public-comment block of a city-council hearing. A 56px
 *   topbar (lectern mark · hearing title · docket badges · Reset ·
 *   budget-gated "Publish speaker order"); a 72px time-budget strip whose
 *   stacked allocation bar overflows the 30:00 block with a hatched
 *   over-budget segment and an over/spare chip; a left 240px topic-cluster
 *   panel (six clusters, each a filter button with an entry count that
 *   collapses on merge and a support/oppose/neutral sentiment split bar);
 *   a center speaker queue of 64px rows (position · check-in dot · name/
 *   affiliation · stance tag · time-allocation bar · form-letter badge)
 *   that expand in place to the full comment excerpt and a check-in
 *   toggle; and a right 312px duplicate stack of form-letter groups
 *   (similarity %, representative text, submitter chips, savings math).
 *   Signature move: "Merge — 1 spokesperson" on a duplicate group
 *   collapses its members into one 3:00 spokesperson slot IN PLACE — queue
 *   positions renumber, the topic cluster's entry count drops (14 → 9),
 *   the allocation bar sheds its hatched overflow, the over-budget chip
 *   flips 7:00-over → at-budget → 3:00-spare, the projected end time
 *   walks back from 7:07 PM, and the Publish gate unlocks at ≤ 30:00.
 *   Unmerge restores the exact prior queue. No screenshot can show it.
 * @position Page template; emitted by `astryx template public-comment-moderation`
 *
 * Frame: root 100dvh div > Layout height="fill". header (topbar) |
 *   content: budget strip over a hand-rolled CSS grid
 *   `240px minmax(0,1fr) 312px` (cluster panel · queue · duplicate
 *   stack), each column its own scroll region under `minHeight: 0`.
 *   The grid is hand-rolled because the DS layout panels pin widths via
 *   inline styles that a media query cannot override — the reflow below
 *   980px (clusters become a horizontal chip strip) needs the columns in
 *   CSS.
 * Container policy: work-surface archetype — rails, rows, and panels; no
 *   Cards. Cluster rows, queue rows, and submitter chips are real
 *   `<button>`s; the duplicate group is a bordered section whose one
 *   action is a 40px merge/unmerge button.
 * Color policy: token-pure chrome. ONE quarantined brand accent —
 *   Podium purple light-dark(#6D28D9, #C4B5FD): #6D28D9 on white = 7.1:1,
 *   #C4B5FD on #1B1B1F = 9.2:1. State pairs (each with math at the
 *   declaration): support green light-dark(#15803D, #4ADE80) (5.0:1 /
 *   9.7:1), oppose red light-dark(#B91C1C, #F87171) (6.5:1 / 6.1:1),
 *   warn amber light-dark(#B45309, #FCD34D) (5.0:1 / 11.7:1). The phantom
 *   bare color-text token is never referenced — text uses
 *   --color-text-primary / --color-text-secondary only.
 * Density grid (repeated verbatim): topbar 56 · budget strip 72 · cluster
 *   rows 56 · queue rows 64 · position cell 32 · allocation track 96×8 ·
 *   sentiment bar 6 · duplicate cards min 148 · merge buttons 40 · left
 *   panel 240 · right panel 312 · gutter var(--spacing-4).
 * Fixture policy: sign-up order, allocations, cluster tallies, and
 *   check-in states are literal fixtures; EVERYTHING displayed about time
 *   (total requested, over/spare, projected 6:30 PM + total end time,
 *   per-cluster entry counts, checked-in tally) derives live from the one
 *   queue derivation, so a merge, unmerge, or check-in toggle moves every
 *   surface in the same render.
 *
 * Responsive contract:
 * - Default desktop (~1045px demo stage — media queries do NOT fire
 *   there): full three-column grid; the queue column gets ~490px and every
 *   row segment fits without truncation stress.
 * - <= 980px: the cluster panel leaves the grid and becomes a horizontal
 *   scroll strip of the same filter buttons above the queue (sentiment
 *   bars kept, fixed 128px width per chip); grid becomes
 *   `minmax(0,1fr) 300px`.
 * - <= 700px: single column — queue first, duplicate stack after it; the
 *   topbar wraps; allocation bars keep their 96px track (subtraction, not
 *   squeeze: the affiliation line is the only segment that ellipsizes).
 */

import {useMemo, useState} from 'react';

import {
  CheckCircle2Icon,
  CircleDotIcon,
  CopyIcon,
  MegaphoneIcon,
  MergeIcon,
  MicIcon,
  RotateCcwIcon,
  UserCheckIcon,
  UsersIcon,
  VideoIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// Podium brand purple. #6D28D9 on white: L=0.098 → (1.05)/(0.148) = 7.1:1.
// #C4B5FD on #1B1B1F (L≈0.012): (0.569)/(0.062) = 9.2:1. Text-safe both ways.
const ACCENT = 'light-dark(#6D28D9, #C4B5FD)';
const ACCENT_TINT = 'light-dark(rgba(109, 40, 217, 0.10), rgba(196, 181, 253, 0.16))';

// Support green. #15803D on white: L=0.159 → 5.0:1. #4ADE80 on #1B1B1F: 9.7:1.
const SUPPORT = 'light-dark(#15803D, #4ADE80)';
// Oppose red. #B91C1C on white: L=0.112 → 6.5:1. #F87171 on #1B1B1F: 6.1:1.
const OPPOSE = 'light-dark(#B91C1C, #F87171)';
const OPPOSE_TINT = 'light-dark(rgba(185, 28, 28, 0.10), rgba(248, 113, 113, 0.16))';
// Warn amber (not-arrived, waits). #B45309 on white: L=0.159 → 5.0:1.
// #FCD34D on #1B1B1F: 11.7:1.
const WARN = 'light-dark(#B45309, #FCD34D)';

// ---------------------------------------------------------------------------
// DOMAIN TYPES + FIXTURES — Alder Glen Planning Commission · Item 7B.
// Cross-checks are in the @input comment; the queue derivation re-proves the
// time math live on every render.
// ---------------------------------------------------------------------------

type Stance = 'support' | 'oppose' | 'neutral';
type CheckIn = 'checked-in' | 'remote' | 'not-arrived';

type TopicCluster = {
  id: string;
  label: string;
  /** Written comments received in this cluster (fixed). */
  comments: number;
  support: number;
  oppose: number;
  neutral: number;
};

// 18 + 12 + 14 + 7 + 9 + 5 = 65 written comments; each row's
// support + oppose + neutral equals its comment count.
const CLUSTERS: TopicCluster[] = [
  {id: 'traffic', label: 'Traffic & parking on Larch', comments: 18, support: 5, oppose: 11, neutral: 2},
  {id: 'housing', label: 'Affordable housing set-aside', comments: 12, support: 9, oppose: 2, neutral: 1},
  {id: 'oaks', label: 'Heritage oak removal', comments: 14, support: 0, oppose: 13, neutral: 1},
  {id: 'shadow', label: 'Shadow & height study', comments: 7, support: 1, oppose: 4, neutral: 2},
  {id: 'jobs', label: 'Local jobs & construction', comments: 9, support: 8, oppose: 0, neutral: 1},
  {id: 'noise', label: 'Noise & construction hours', comments: 5, support: 0, oppose: 3, neutral: 2},
];

type Speaker = {
  id: string;
  name: string;
  affiliation?: string;
  clusterId: string;
  stance: Stance;
  /** Requested speaking time in seconds — display derives from this. */
  allocSec: number;
  cededBy?: string;
  checkIn: CheckIn;
  /** Fixed sign-up timestamp label (window Jul 10–13). */
  signedUp: string;
  excerpt: string;
  dupGroupId?: string;
};

// Sign-up order IS queue order. 17 entries: 9 individuals + 5 group-A + 3
// group-B. Time ledger: individuals 7×120 + 180 + 240 = 1,260s (21:00);
// group A 5×120 = 600s; group B 3×120 = 360s; total 2,220s = 37:00.
const SPEAKERS: Speaker[] = [
  {
    id: 's-eleanor',
    name: 'Eleanor Whitcomb-Ashford',
    // Deliberate stress fixture: 63-char affiliation exercises the one
    // ellipsizing segment in the queue row.
    affiliation: 'Larch & 9th Neighborhood Coalition, co-chair (212 households)',
    clusterId: 'traffic',
    stance: 'oppose',
    allocSec: 120,
    checkIn: 'checked-in',
    signedUp: 'Jul 10 · 9:02 AM',
    excerpt:
      'Larch Street already backs up past 9th Avenue every weekday between 7:40 and 8:15. The traffic memo counts trips at 10 AM on a Tuesday and calls it peak. Before you add 240 units with 96 parking stalls, count the school run.',
  },
  {
    id: 's-nadia',
    name: 'Nadia Ferreira',
    clusterId: 'oaks',
    stance: 'oppose',
    allocSec: 120,
    checkIn: 'checked-in',
    signedUp: 'Jul 10 · 9:41 AM',
    excerpt:
      'The three coast live oaks on the Larch frontage predate the city itself — the 1911 plat map shows them. The applicant’s arborist report gives them "fair" condition and then removes all three for a curb cut that could shift 40 feet north.',
    dupGroupId: 'dup-oaks',
  },
  {
    id: 's-dan',
    name: 'Dan Okafor',
    clusterId: 'housing',
    stance: 'support',
    allocSec: 120,
    checkIn: 'remote',
    signedUp: 'Jul 10 · 11:15 AM',
    excerpt:
      'I teach at Alder Glen Middle and commute 48 minutes each way because nothing near school rents under $2,400. Twenty-two inclusionary units at 60% AMI is the first project in four years that would let staff live in the district they serve.',
  },
  {
    id: 's-bill',
    name: 'Bill Hutchins',
    clusterId: 'oaks',
    stance: 'oppose',
    allocSec: 120,
    checkIn: 'checked-in',
    signedUp: 'Jul 10 · 2:20 PM',
    excerpt:
      'The three coast live oaks on the Larch frontage predate the city itself. The arborist report gives them "fair" condition and then removes all three for a curb cut that could shift 40 feet north. Signed, a 30-year resident.',
    dupGroupId: 'dup-oaks',
  },
  {
    id: 's-maya',
    name: 'Maya Lindstrom',
    affiliation: 'Alder Glen Housing Trust — registered organization (3:00 slot)',
    clusterId: 'housing',
    stance: 'support',
    allocSec: 180,
    checkIn: 'checked-in',
    signedUp: 'Jul 11 · 8:55 AM',
    excerpt:
      'The Trust holds the ground lease on two comparable MX-3 parcels. Our waitlist for two-bedroom units is 31 months. We ask the commission to approve with the staff condition that the set-aside recorded covenant runs 55 years, not 30.',
  },
  {
    id: 's-marcus',
    name: 'Marcus Webb',
    affiliation: 'Cornerstone Builders, site foreman',
    clusterId: 'jobs',
    stance: 'support',
    allocSec: 120,
    checkIn: 'checked-in',
    signedUp: 'Jul 11 · 10:05 AM',
    excerpt:
      'This project is 14 months of work for a 60-person crew that lives here — apprentices included. Cornerstone commits to the city’s local-hire goal of 35% and hit 41% on the Dover Yards build. Vote yes.',
    dupGroupId: 'dup-jobs',
  },
  {
    id: 's-grace',
    name: 'Grace Yun',
    clusterId: 'shadow',
    stance: 'oppose',
    allocSec: 240,
    cededBy: 'Harold Yun',
    checkIn: 'checked-in',
    signedUp: 'Jul 11 · 1:12 PM',
    excerpt:
      'The shadow study models March 21 and September 21 and skips December entirely, when the 7-story massing puts my entire south-facing garden — and the community plot behind it — in shade from 1 PM on. I have the sun-path charts to show you; that is why my father ceded me his time.',
  },
  {
    id: 's-rosa',
    name: 'Rosa Delgado-Marsh',
    clusterId: 'oaks',
    stance: 'oppose',
    allocSec: 120,
    checkIn: 'checked-in',
    signedUp: 'Jul 11 · 4:44 PM',
    excerpt:
      'The three coast live oaks on the Larch frontage predate the city itself — the 1911 plat map shows them. Removing all three for a curb cut that could shift 40 feet north is a choice, not a necessity.',
    dupGroupId: 'dup-oaks',
  },
  {
    id: 's-sam',
    name: 'Sam Petrucci',
    clusterId: 'traffic',
    stance: 'oppose',
    allocSec: 120,
    checkIn: 'checked-in',
    signedUp: 'Jul 12 · 9:30 AM',
    excerpt:
      'I run the hardware store at Larch and 8th. Delivery trucks already double-park because there is no loading zone for three blocks. The plan removes six street spaces and adds zero commercial loading. Where do you think those trucks go?',
  },
  {
    id: 's-priya',
    name: 'Priya Raman',
    clusterId: 'oaks',
    stance: 'oppose',
    allocSec: 120,
    checkIn: 'checked-in',
    signedUp: 'Jul 12 · 11:58 AM',
    excerpt:
      'The coast live oaks on the Larch frontage predate the city — the 1911 plat map shows them. The arborist report calls them "fair" and then removes all three for a curb cut that could shift 40 feet north.',
    dupGroupId: 'dup-oaks',
  },
  {
    id: 's-dre',
    name: 'Dre Holloway',
    affiliation: 'Cornerstone Builders, apprentice electrician',
    clusterId: 'jobs',
    stance: 'support',
    allocSec: 120,
    checkIn: 'remote',
    signedUp: 'Jul 12 · 2:31 PM',
    excerpt:
      'This project is 14 months of work for a 60-person crew that lives here — apprentices included. Cornerstone commits to the local-hire goal of 35% and hit 41% on Dover Yards. I am one of those hires. Vote yes.',
    dupGroupId: 'dup-jobs',
  },
  {
    id: 's-felix',
    name: 'Felix Arroyo',
    clusterId: 'noise',
    stance: 'neutral',
    allocSec: 120,
    checkIn: 'not-arrived',
    signedUp: 'Jul 12 · 5:07 PM',
    excerpt:
      'Not against the project — against the hours. Dover Yards ran generators from 6:45 AM. If the commission approves, please add a condition holding exterior work to 8 AM–6 PM weekdays and no Saturday concrete pours.',
  },
  {
    id: 's-ingrid',
    name: 'Ingrid Halvorsen',
    affiliation: 'Alder Glen Chamber of Commerce',
    clusterId: 'jobs',
    stance: 'support',
    allocSec: 120,
    checkIn: 'remote',
    signedUp: 'Jul 13 · 8:20 AM',
    excerpt:
      'Ground-floor retail on Larch has three vacancies out of eleven storefronts. 240 households within a two-block walk is the difference between a lease and another year of paper on the windows. The Chamber supports with the staff conditions.',
  },
  {
    id: 's-tom',
    name: 'Tom Ellery',
    clusterId: 'oaks',
    stance: 'oppose',
    allocSec: 120,
    checkIn: 'checked-in',
    signedUp: 'Jul 13 · 10:46 AM',
    excerpt:
      'The three coast live oaks on the Larch frontage predate the city itself — the 1911 plat map shows them. Removing all three for a curb cut that could shift 40 feet north is a choice, not a necessity. Save the oaks.',
    dupGroupId: 'dup-oaks',
  },
  {
    id: 's-sofia',
    name: 'Sofia Antunes',
    affiliation: 'Cornerstone Builders, carpenter',
    clusterId: 'jobs',
    stance: 'support',
    allocSec: 120,
    checkIn: 'remote',
    signedUp: 'Jul 13 · 1:19 PM',
    excerpt:
      '14 months of work for a 60-person crew that lives here — apprentices included. Cornerstone hit 41% local hire on Dover Yards against a 35% goal. Vote yes.',
    dupGroupId: 'dup-jobs',
  },
  {
    id: 's-aisha',
    name: 'Aisha Okonjo',
    clusterId: 'shadow',
    stance: 'support',
    allocSec: 120,
    checkIn: 'not-arrived',
    signedUp: 'Jul 13 · 3:02 PM',
    excerpt:
      'I live in the building that would cast the "new" shadow — the study is honest about it. Two hours of winter shade on a parking lot is a fair trade for 240 homes. I support the project as designed.',
  },
  {
    id: 's-ruth',
    name: 'Ruth Ann McAllister',
    clusterId: 'oaks',
    stance: 'oppose',
    allocSec: 120,
    checkIn: 'checked-in',
    signedUp: 'Jul 13 · 4:50 PM',
    excerpt:
      'Separate from the form letter you have been receiving: my objection is procedural. The tree-removal permit was noticed under the old parcel number, so adjacent owners never got the mailer. Continue the item and re-notice it properly.',
  },
];

type DupGroup = {
  id: string;
  title: string;
  clusterId: string;
  /** Similarity of member texts to the representative text. */
  similarity: number;
  representative: string;
  /** Speaker ids in sign-up order; first is the designated spokesperson. */
  memberIds: string[];
  /** Written-only signatories (submitted the letter, did not sign up). */
  writtenOnly: string[];
  mergedAllocSec: number;
};

// Group A: 6 signatories (5 speaking + 1 written-only); merging trades
// 5 × 2:00 = 10:00 of queue time for one 3:00 slot → saves 7:00.
// Group B: 4 signatories (3 speaking + 1 written-only); 3 × 2:00 = 6:00 →
// one 3:00 slot → saves 3:00.
const DUP_GROUPS: DupGroup[] = [
  {
    id: 'dup-oaks',
    title: 'Save the Larch Street Oaks — form letter',
    clusterId: 'oaks',
    similarity: 94,
    representative:
      'The three coast live oaks on the Larch frontage predate the city itself — the 1911 plat map shows them. The arborist report gives them "fair" condition and then removes all three for a curb cut that could shift 40 feet north.',
    memberIds: ['s-nadia', 's-bill', 's-rosa', 's-priya', 's-tom'],
    writtenOnly: ['Janet Kowalczyk'],
    mergedAllocSec: 180,
  },
  {
    id: 'dup-jobs',
    title: 'Cornerstone Builders crew template',
    clusterId: 'jobs',
    similarity: 88,
    representative:
      'This project is 14 months of work for a 60-person crew that lives here — apprentices included. Cornerstone commits to the city’s local-hire goal of 35% and hit 41% on the Dover Yards build. Vote yes.',
    memberIds: ['s-marcus', 's-dre', 's-sofia'],
    writtenOnly: ['Kyle Brandt'],
    mergedAllocSec: 180,
  },
];

const SPEAKER_BY_ID = new Map(SPEAKERS.map(s => [s.id, s]));
const DUP_BY_ID = new Map(DUP_GROUPS.map(g => [g.id, g]));
const CLUSTER_BY_ID = new Map(CLUSTERS.map(c => [c.id, c]));

/** Public-comment block per council rule 4.6(b): 30 minutes. */
const BLOCK_SEC = 30 * 60;
/** Item 7B is gaveled in at 6:30 PM — projected end derives from this. */
const BLOCK_START_MIN = 18 * 60 + 30;

const STANCE_META: Record<Stance, {label: string; color: string}> = {
  support: {label: 'Support', color: SUPPORT},
  oppose: {label: 'Oppose', color: OPPOSE},
  neutral: {label: 'Neutral', color: 'var(--color-text-secondary)'},
};

const CHECKIN_META: Record<CheckIn, {label: string; color: string}> = {
  'checked-in': {label: 'Checked in', color: SUPPORT},
  remote: {label: 'Remote', color: ACCENT},
  'not-arrived': {label: 'Not arrived', color: WARN},
};

// ---------------------------------------------------------------------------
// SCOPED CSS — every selector is prefixed with the tpl- scope class. The
// three-column grid is hand-rolled (not DS panels) because the <=980px
// reflow moves the cluster panel out of the column flow entirely, which a
// width-pinned panel component cannot do from a media query.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-public-comment-moderation';

const TEMPLATE_CSS = `
.${SCOPE} {
  color: var(--color-text-primary);
  font-family: var(--font-family-sans, system-ui, sans-serif);
}
.${SCOPE} *,
.${SCOPE} *::before,
.${SCOPE} *::after {
  box-sizing: border-box;
}
.${SCOPE} button {
  font: inherit;
  color: inherit;
}
.${SCOPE} :is(button):focus-visible {
  outline: 2px solid ${ACCENT};
  outline-offset: 2px;
}

/* ---- topbar (56px) ------------------------------------------------------ */
.${SCOPE}.topbar {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
}
.${SCOPE} .brandMark {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 9px;
  flex-shrink: 0;
  background: ${ACCENT_TINT};
  color: ${ACCENT};
}
.${SCOPE} .titleBlock {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1px;
}
.${SCOPE} .eyebrow {
  margin: 0;
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${ACCENT};
}
.${SCOPE} .pageTitle {
  margin: 0;
  font-size: 16px;
  font-weight: 650;
  line-height: 1.2;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .titleMeta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${SCOPE} .topbarActions {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-shrink: 0;
}

/* ---- shell + grid ------------------------------------------------------- */
.${SCOPE}.shell {
  display: flex;
  flex-direction: column;
  height: 100%;
  min-height: 0;
}
.${SCOPE} .grid {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: 240px minmax(0, 1fr) 312px;
}
.${SCOPE} .col {
  min-height: 0;
  display: flex;
  flex-direction: column;
  border-inline-end: var(--border-width) solid var(--color-border);
}
.${SCOPE} .col:last-child {
  border-inline-end: none;
}
.${SCOPE} .colHeader {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 44px;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .colTitle {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${SCOPE} .colCount {
  margin-inline-start: auto;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .colScroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}

/* ---- budget strip (72px) ------------------------------------------------ */
.${SCOPE} .budgetStrip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  flex-wrap: wrap;
  min-height: 72px;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
}
.${SCOPE} .budgetBarBlock {
  flex: 1;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.${SCOPE} .budgetLegend {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  font-size: 12px;
  color: var(--color-text-secondary);
}
.${SCOPE} .budgetLegend strong {
  font-size: 13px;
  font-weight: 650;
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .budgetTrack {
  position: relative;
  height: 14px;
  border-radius: 7px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.${SCOPE} .budgetFill {
  position: absolute;
  inset-block: 0;
  inset-inline-start: 0;
  background: ${ACCENT};
  opacity: 0.85;
  border-radius: 7px 0 0 7px;
}
/* Over-budget overflow: hatched so the state is not color-only. */
.${SCOPE} .budgetOverflow {
  position: absolute;
  inset-block: 0;
  background: repeating-linear-gradient(
    -45deg,
    ${OPPOSE},
    ${OPPOSE} 4px,
    ${OPPOSE_TINT} 4px,
    ${OPPOSE_TINT} 8px
  );
}
.${SCOPE} .budgetBlockTick {
  position: absolute;
  inset-block: -2px;
  width: 2px;
  background: var(--color-text-primary);
}
.${SCOPE} .budgetScale {
  display: flex;
  justify-content: space-between;
  font-size: 10.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${SCOPE} .budgetStats {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  flex-wrap: wrap;
}
.${SCOPE} .statChip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 28px;
  padding: 2px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 12px;
  white-space: nowrap;
  background: var(--color-background-body);
}
.${SCOPE} .statChip strong {
  font-weight: 650;
  font-variant-numeric: tabular-nums;
}
.${SCOPE} .statChip.isOver {
  border-color: ${OPPOSE};
  color: ${OPPOSE};
  background: ${OPPOSE_TINT};
}
.${SCOPE} .statChip.isSpare {
  border-color: ${SUPPORT};
  color: ${SUPPORT};
}
.${SCOPE} .statChip.isEven {
  border-color: ${ACCENT};
  color: ${ACCENT};
}

/* ---- cluster panel (rows 56px) ------------------------------------------ */
.${SCOPE} .clusterList {
  display: flex;
  flex-direction: column;
  padding: var(--spacing-2);
  gap: 2px;
}
.${SCOPE} .clusterRow {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
  min-height: 56px;
  padding: 6px 10px;
  border: var(--border-width) solid transparent;
  border-radius: var(--radius-container, 8px);
  background: none;
  text-align: start;
  cursor: pointer;
}
@media (hover: hover) {
  .${SCOPE} .clusterRow:hover {
    background: var(--color-background-muted);
  }
}
.${SCOPE} .clusterRow[aria-pressed='true'] {
  border-color: ${ACCENT};
  background: ${ACCENT_TINT};
}
.${SCOPE} .clusterTop {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  min-width: 0;
}
.${SCOPE} .clusterLabel {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 550;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .clusterCount {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.${SCOPE} .clusterCount.didCollapse {
  color: ${ACCENT};
  font-weight: 650;
}
/* Sentiment split bar: 6px, three flex segments sized by count. */
.${SCOPE} .sentimentBar {
  display: flex;
  height: 6px;
  border-radius: 3px;
  overflow: hidden;
  background: var(--color-background-muted);
}
.${SCOPE} .sentimentBar .seg-support { background: ${SUPPORT}; }
.${SCOPE} .sentimentBar .seg-oppose { background: ${OPPOSE}; }
.${SCOPE} .sentimentBar .seg-neutral { background: var(--color-border); }
.${SCOPE} .clusterFootnote {
  padding: var(--spacing-3) var(--spacing-4);
  font-size: 11.5px;
  line-height: 1.45;
  color: var(--color-text-secondary);
  border-top: var(--border-width) solid var(--color-border);
}

/* ---- speaker queue (rows 64px) ------------------------------------------ */
.${SCOPE} .queueList {
  list-style: none;
  margin: 0;
  padding: 0;
}
.${SCOPE} .queueList li {
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .qRow {
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: var(--spacing-3);
  width: 100%;
  min-height: 64px;
  padding: var(--spacing-2) var(--spacing-4);
  border: none;
  background: none;
  text-align: start;
  cursor: pointer;
}
@media (hover: hover) {
  .${SCOPE} .qRow:hover {
    background: var(--color-background-muted);
  }
}
.${SCOPE} .qRow[aria-expanded='true'] {
  background: ${ACCENT_TINT};
}
.${SCOPE} .qPos {
  font-size: 13px;
  font-weight: 650;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  text-align: end;
}
.${SCOPE} .qMain {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.${SCOPE} .qNameRow {
  display: flex;
  align-items: center;
  gap: 6px;
  min-width: 0;
}
.${SCOPE} .qCheckDot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.${SCOPE} .qName {
  font-size: 13.5px;
  font-weight: 600;
  white-space: nowrap;
}
.${SCOPE} .qStance {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  white-space: nowrap;
}
.${SCOPE} .qMergedBadge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 650;
  color: ${ACCENT};
  border: var(--border-width) solid ${ACCENT};
  white-space: nowrap;
}
.${SCOPE} .qDupTag {
  font-size: 10.5px;
  font-weight: 650;
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  padding: 1px 8px;
  white-space: nowrap;
}
/* The affiliation line is the ONE segment allowed to ellipsize. */
.${SCOPE} .qAffiliation {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.${SCOPE} .qTimeCell {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
/* Allocation track 96×8; fill scales against the 4:00 ceiling. */
.${SCOPE} .allocTrack {
  width: 96px;
  height: 8px;
  border-radius: 4px;
  background: var(--color-background-muted);
  overflow: hidden;
}
.${SCOPE} .allocFill {
  height: 100%;
  border-radius: 4px;
  background: ${ACCENT};
}
.${SCOPE} .allocFill.isCeded {
  background: linear-gradient(to right, ${ACCENT} 50%, ${WARN} 50%);
}
.${SCOPE} .allocLabel {
  min-width: 34px;
  font-size: 12.5px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  text-align: end;
}
.${SCOPE} .qExpand {
  padding: 0 var(--spacing-4) var(--spacing-3) calc(32px + var(--spacing-3) + var(--spacing-4));
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}
.${SCOPE} .qExcerpt {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--color-text-primary);
  border-inline-start: 3px solid ${ACCENT};
  padding-inline-start: var(--spacing-3);
}
.${SCOPE} .qMetaRow {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.${SCOPE} .checkinToggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 40px;
  padding: 0 var(--spacing-3);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  background: var(--color-background-body);
  cursor: pointer;
  font-size: 12.5px;
  font-weight: 550;
  align-self: flex-start;
}
@media (hover: hover) {
  .${SCOPE} .checkinToggle:hover {
    background: var(--color-background-muted);
  }
}
.${SCOPE} .queueEmpty {
  padding: var(--spacing-6) var(--spacing-4);
  font-size: 12.5px;
  color: var(--color-text-secondary);
  text-align: center;
}
.${SCOPE} .filterPill {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 2px 4px 2px 10px;
  border: var(--border-width) solid ${ACCENT};
  border-radius: 999px;
  color: ${ACCENT};
  background: ${ACCENT_TINT};
  font-size: 11.5px;
  font-weight: 600;
  white-space: nowrap;
}
.${SCOPE} .filterPill button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  border: none;
  border-radius: 50%;
  background: none;
  cursor: pointer;
  color: inherit;
  font-size: 13px;
  line-height: 1;
}

/* ---- duplicate stack ----------------------------------------------------- */
.${SCOPE} .dupList {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
}
.${SCOPE} .dupCard {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  min-height: 148px;
  padding: var(--spacing-3);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  background: var(--color-background-surface);
}
.${SCOPE} .dupCard.isMerged {
  border-color: ${ACCENT};
  background: ${ACCENT_TINT};
}
.${SCOPE} .dupCard.isDimmed {
  opacity: 0.45;
}
.${SCOPE} .dupHead {
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
}
.${SCOPE} .dupTitle {
  margin: 0;
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 650;
  line-height: 1.3;
}
.${SCOPE} .simBadge {
  flex-shrink: 0;
  font-size: 10.5px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: ${ACCENT};
  border: var(--border-width) solid ${ACCENT};
  border-radius: 999px;
  padding: 1px 8px;
  white-space: nowrap;
}
.${SCOPE} .dupExcerpt {
  margin: 0;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.${SCOPE} .dupChips {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}
.${SCOPE} .subChip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 11px;
  white-space: nowrap;
  background: var(--color-background-body);
}
.${SCOPE} .subChip.isSpokes {
  border-color: ${ACCENT};
  color: ${ACCENT};
  font-weight: 650;
}
.${SCOPE} .dupMath {
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${SCOPE} .mergeButton {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  min-height: 40px;
  border: var(--border-width) solid ${ACCENT};
  border-radius: var(--radius-container, 8px);
  background: none;
  color: ${ACCENT};
  font-size: 12.5px;
  font-weight: 650;
  cursor: pointer;
}
@media (hover: hover) {
  .${SCOPE} .mergeButton:hover {
    background: ${ACCENT_TINT};
  }
}
.${SCOPE} .mergeButton.isUnmerge {
  border-color: var(--color-border);
  color: var(--color-text-secondary);
}
.${SCOPE} .mergedNote {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
  font-weight: 600;
  color: ${ACCENT};
}
.${SCOPE} .srOnly {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  overflow: hidden;
  clip: rect(0 0 0 0);
  white-space: nowrap;
}

/* ---- responsive subtraction ---------------------------------------------- */
/* <=980px: cluster panel leaves the grid and becomes a horizontal strip of
   128px filter chips above the queue; grid keeps the duplicate stack. */
@media (max-width: 980px) {
  .${SCOPE} .grid {
    grid-template-columns: minmax(0, 1fr) 300px;
  }
  .${SCOPE} .col.clusterCol {
    grid-column: 1 / -1;
    border-inline-end: none;
    border-bottom: var(--border-width) solid var(--color-border);
  }
  .${SCOPE} .col.clusterCol .colScroll {
    overflow-y: visible;
    overflow-x: auto;
  }
  .${SCOPE} .clusterList {
    flex-direction: row;
  }
  .${SCOPE} .clusterRow {
    width: 128px;
    flex-shrink: 0;
  }
  .${SCOPE} .clusterFootnote {
    display: none;
  }
}
/* <=700px: single column — queue first, duplicate stack after. */
@media (max-width: 700px) {
  .${SCOPE} .grid {
    display: flex;
    flex-direction: column;
    overflow-y: auto;
  }
  .${SCOPE} .col {
    border-inline-end: none;
  }
  .${SCOPE} .col.queueCol {
    order: 1;
  }
  .${SCOPE} .col.dupCol {
    order: 2;
    border-top: var(--border-width) solid var(--color-border);
  }
  .${SCOPE} .col.clusterCol {
    order: 0;
  }
  .${SCOPE} .colScroll {
    overflow-y: visible;
  }
  .${SCOPE} .qAffiliation {
    max-width: 60vw;
  }
}
@media (prefers-reduced-motion: no-preference) {
  .${SCOPE} .budgetFill,
  .${SCOPE} .allocFill {
    transition: width 0.25s ease;
  }
}
`;

// ---------------------------------------------------------------------------
// DERIVATION HELPERS — one queue derivation feeds every surface.
// ---------------------------------------------------------------------------

/** 2220 → "37:00". Every duration on the page renders through this. */
function fmtMinSec(totalSec: number): string {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

/** Minutes-since-midnight → "7:07 PM" (fixed hearing clock, no Date). */
function fmtClock(totalMin: number): string {
  const h24 = Math.floor(totalMin / 60) % 24;
  const m = totalMin % 60;
  const suffix = h24 >= 12 ? 'PM' : 'AM';
  const h12 = h24 % 12 === 0 ? 12 : h24 % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${suffix}`;
}

type QueueEntry = {
  /** Stable key: speaker id, or `merged-<groupId>` for a merged slot. */
  key: string;
  speaker: Speaker;
  allocSec: number;
  /** Present when this entry is a merged form-letter spokesperson slot. */
  mergedGroup?: DupGroup;
};

/**
 * The single queue derivation. Sign-up order is preserved; when a group is
 * merged its earliest member (the designated spokesperson, memberIds[0])
 * keeps that queue position as a 3:00 slot and the later members drop out —
 * which is exactly why positions renumber and the time total collapses.
 */
function deriveQueue(merged: Record<string, boolean>): QueueEntry[] {
  const entries: QueueEntry[] = [];
  for (const speaker of SPEAKERS) {
    const groupId = speaker.dupGroupId;
    if (groupId !== undefined && merged[groupId] === true) {
      const group = DUP_BY_ID.get(groupId);
      if (group === undefined) {
        continue;
      }
      if (group.memberIds[0] === speaker.id) {
        entries.push({
          key: `merged-${group.id}`,
          speaker,
          allocSec: group.mergedAllocSec,
          mergedGroup: group,
        });
      }
      // Later members of a merged group leave the queue entirely.
      continue;
    }
    entries.push({key: speaker.id, speaker, allocSec: speaker.allocSec});
  }
  return entries;
}

/** Signatory count = speaking members + written-only submitters. */
function groupSignatories(group: DupGroup): number {
  return group.memberIds.length + group.writtenOnly.length;
}

/** Queue seconds a merge releases: members × their slots − one 3:00 slot. */
function groupSavingsSec(group: DupGroup): number {
  const memberSec = group.memberIds.reduce(
    (sum, id) => sum + (SPEAKER_BY_ID.get(id)?.allocSec ?? 0),
    0,
  );
  return memberSec - group.mergedAllocSec;
}

/**
 * Cluster entry count shown in the left panel: written comments minus the
 * signatories a merge collapsed into one entry (14 → 9 for the oaks group,
 * 9 → 6 for the crew template).
 */
function clusterEntryCount(cluster: TopicCluster, merged: Record<string, boolean>): number {
  let count = cluster.comments;
  for (const group of DUP_GROUPS) {
    if (group.clusterId === cluster.id && merged[group.id] === true) {
      count -= groupSignatories(group) - 1;
    }
  }
  return count;
}

// ---------------------------------------------------------------------------
// SUB-COMPONENTS
// ---------------------------------------------------------------------------

/** Podium lectern mark — inline SVG, currentColor, no external assets. */
function BrandMark() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4.5 5.5h15l-2.4 5H6.9l-2.4-5Z" fill="currentColor" />
      <rect x="10.75" y="10.5" width="2.5" height="8" rx="1" fill="currentColor" />
      <path
        d="M7.5 20.5h9"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="19.5" cy="2.8" r="1.6" fill="currentColor" />
    </svg>
  );
}

function SentimentBar({cluster}: {cluster: TopicCluster}) {
  return (
    <div
      className="sentimentBar"
      role="img"
      aria-label={`${cluster.support} support, ${cluster.oppose} oppose, ${cluster.neutral} neutral`}>
      {cluster.support > 0 && <span className="seg-support" style={{flex: cluster.support}} />}
      {cluster.oppose > 0 && <span className="seg-oppose" style={{flex: cluster.oppose}} />}
      {cluster.neutral > 0 && <span className="seg-neutral" style={{flex: cluster.neutral}} />}
    </div>
  );
}

function ClusterRow({
  cluster,
  entryCount,
  isActive,
  onToggle,
}: {
  cluster: TopicCluster;
  entryCount: number;
  isActive: boolean;
  onToggle: (id: string) => void;
}) {
  const collapsed = entryCount < cluster.comments;
  return (
    <button
      type="button"
      className="clusterRow"
      aria-pressed={isActive}
      onClick={() => onToggle(cluster.id)}>
      <span className="clusterTop">
        <span className="clusterLabel">{cluster.label}</span>
        <span className={collapsed ? 'clusterCount didCollapse' : 'clusterCount'}>
          {entryCount}
          {collapsed ? ` of ${cluster.comments}` : ''}
        </span>
      </span>
      <SentimentBar cluster={cluster} />
    </button>
  );
}

/** Allocation bar: 96px track scaled to the 4:00 (240s) per-speaker ceiling. */
const ALLOC_CEILING_SEC = 240;

function AllocationCell({allocSec, isCeded}: {allocSec: number; isCeded: boolean}) {
  const pct = Math.min(100, (allocSec / ALLOC_CEILING_SEC) * 100);
  return (
    <span className="qTimeCell">
      <span className="allocTrack" aria-hidden="true">
        <span className={isCeded ? 'allocFill isCeded' : 'allocFill'} style={{width: `${pct}%`}} />
      </span>
      <span className="allocLabel">{fmtMinSec(allocSec)}</span>
    </span>
  );
}

function QueueRowItem({
  entry,
  position,
  checkIn,
  isExpanded,
  onToggleExpand,
  onToggleCheckIn,
}: {
  entry: QueueEntry;
  position: number;
  checkIn: CheckIn;
  isExpanded: boolean;
  onToggleExpand: (key: string) => void;
  onToggleCheckIn: (speakerId: string) => void;
}) {
  const {speaker, mergedGroup} = entry;
  const stance = STANCE_META[speaker.stance];
  const check = CHECKIN_META[checkIn];
  const cluster = CLUSTER_BY_ID.get(speaker.clusterId);
  const group = speaker.dupGroupId !== undefined ? DUP_BY_ID.get(speaker.dupGroupId) : undefined;
  const detailId = `pcm-detail-${entry.key}`;
  return (
    <li>
      <button
        type="button"
        className="qRow"
        aria-expanded={isExpanded}
        aria-controls={detailId}
        onClick={() => onToggleExpand(entry.key)}>
        <span className="qPos">{position}</span>
        <span className="qMain">
          <span className="qNameRow">
            <span
              className="qCheckDot"
              style={{background: check.color}}
              title={check.label}
              aria-hidden="true"
            />
            <span className="qName">{speaker.name}</span>
            <span className="qStance" style={{color: stance.color}}>
              {stance.label}
            </span>
            {mergedGroup !== undefined ? (
              <span className="qMergedBadge">
                <Icon icon={UsersIcon} size="xsm" color="inherit" />
                Speaks for {groupSignatories(mergedGroup)}
              </span>
            ) : group !== undefined ? (
              <span className="qDupTag">Form letter {group.id === 'dup-oaks' ? 'A' : 'B'}</span>
            ) : null}
          </span>
          <span className="qAffiliation">
            {mergedGroup !== undefined
              ? mergedGroup.title
              : speaker.affiliation ?? `${cluster?.label ?? ''} · signed up ${speaker.signedUp}`}
          </span>
        </span>
        <AllocationCell allocSec={entry.allocSec} isCeded={speaker.cededBy !== undefined} />
      </button>
      {isExpanded && (
        <div className="qExpand" id={detailId}>
          <p className="qExcerpt">{speaker.excerpt}</p>
          <div className="qMetaRow">
            <span>Signed up {speaker.signedUp}</span>
            <span>Topic: {cluster?.label}</span>
            <span style={{color: check.color, fontWeight: 600}}>{check.label}</span>
            {speaker.cededBy !== undefined && (
              <span style={{color: WARN, fontWeight: 600}}>
                +2:00 ceded by {speaker.cededBy} (rule 4.6(d))
              </span>
            )}
            {mergedGroup !== undefined && (
              <span>
                Reads once into the record for {groupSignatories(mergedGroup)} signatories
              </span>
            )}
          </div>
          {checkIn === 'remote' ? (
            <div className="qMetaRow">
              <Icon icon={VideoIcon} size="xsm" color="inherit" />
              <span>Joining remotely — the clerk unmutes at the position call.</span>
            </div>
          ) : (
            <button
              type="button"
              className="checkinToggle"
              onClick={() => onToggleCheckIn(speaker.id)}>
              <Icon icon={UserCheckIcon} size="sm" color="inherit" />
              {checkIn === 'checked-in' ? 'Mark not arrived' : 'Mark arrived at the podium desk'}
            </button>
          )}
        </div>
      )}
    </li>
  );
}

function DupGroupCard({
  group,
  isMerged,
  isDimmed,
  onToggleMerge,
}: {
  group: DupGroup;
  isMerged: boolean;
  isDimmed: boolean;
  onToggleMerge: (groupId: string) => void;
}) {
  const spokesperson = SPEAKER_BY_ID.get(group.memberIds[0]);
  const signatories = groupSignatories(group);
  const memberSec = group.memberIds.reduce(
    (sum, id) => sum + (SPEAKER_BY_ID.get(id)?.allocSec ?? 0),
    0,
  );
  const savings = groupSavingsSec(group);
  const cardClass = [
    'dupCard',
    isMerged ? 'isMerged' : '',
    isDimmed ? 'isDimmed' : '',
  ]
    .filter(Boolean)
    .join(' ');
  return (
    <section className={cardClass} aria-label={group.title}>
      <div className="dupHead">
        <h3 className="dupTitle">{group.title}</h3>
        <span className="simBadge">{group.similarity}% match</span>
      </div>
      <p className="dupExcerpt">“{group.representative}”</p>
      <div className="dupChips">
        {group.memberIds.map(id => {
          const member = SPEAKER_BY_ID.get(id);
          if (member === undefined) {
            return null;
          }
          const isSpokes = id === group.memberIds[0];
          return (
            <span key={id} className={isSpokes ? 'subChip isSpokes' : 'subChip'}>
              <Icon icon={MicIcon} size="xsm" color="inherit" />
              {member.name}
            </span>
          );
        })}
        {group.writtenOnly.map(name => (
          <span key={name} className="subChip">
            <Icon icon={CopyIcon} size="xsm" color="inherit" />
            {name} (written)
          </span>
        ))}
      </div>
      <span className="dupMath">
        {group.memberIds.length} of {signatories} signatories asked to speak ·{' '}
        {fmtMinSec(memberSec)} of queue time
      </span>
      {isMerged ? (
        <>
          <span className="mergedNote">
            <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
            Merged — {spokesperson?.name} speaks for {signatories}
          </span>
          <button
            type="button"
            className="mergeButton isUnmerge"
            onClick={() => onToggleMerge(group.id)}>
            <Icon icon={RotateCcwIcon} size="sm" color="inherit" />
            Unmerge — restore {group.memberIds.length} slots
          </button>
        </>
      ) : (
        <button type="button" className="mergeButton" onClick={() => onToggleMerge(group.id)}>
          <Icon icon={MergeIcon} size="sm" color="inherit" />
          Merge — 1 spokesperson · saves {fmtMinSec(savings)}
        </button>
      )}
    </section>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

export default function PublicCommentModerationTemplate() {
  const [merged, setMerged] = useState<Record<string, boolean>>({});
  const [activeCluster, setActiveCluster] = useState<string | null>(null);
  const [expandedKey, setExpandedKey] = useState<string | null>(null);
  const [checkInOverrides, setCheckInOverrides] = useState<Record<string, CheckIn>>({});
  const [announcement, setAnnouncement] = useState('');

  const queue = useMemo(() => deriveQueue(merged), [merged]);

  // ---- derived totals: the ONE place time math happens --------------------
  const totalSec = queue.reduce((sum, entry) => sum + entry.allocSec, 0);
  const overSec = totalSec - BLOCK_SEC;
  const projectedEndMin = BLOCK_START_MIN + Math.ceil(totalSec / 60);

  const effectiveCheckIn = (speakerId: string): CheckIn =>
    checkInOverrides[speakerId] ?? SPEAKER_BY_ID.get(speakerId)?.checkIn ?? 'not-arrived';

  const arrivedCount = queue.filter(e => effectiveCheckIn(e.speaker.id) === 'checked-in').length;
  const remoteCount = queue.filter(e => effectiveCheckIn(e.speaker.id) === 'remote').length;

  // Positions are assigned against the FULL queue, then filtered for display
  // so a cluster filter never renumbers anyone.
  const positioned = queue.map((entry, index) => ({entry, position: index + 1}));
  const visible =
    activeCluster === null
      ? positioned
      : positioned.filter(({entry}) => entry.speaker.clusterId === activeCluster);

  const activeClusterMeta = activeCluster !== null ? CLUSTER_BY_ID.get(activeCluster) : undefined;

  // ---- budget bar geometry: track spans max(total, block) -----------------
  const scaleSec = Math.max(totalSec, BLOCK_SEC);
  const fillPct = (Math.min(totalSec, BLOCK_SEC) / scaleSec) * 100;
  const blockPct = (BLOCK_SEC / scaleSec) * 100;
  const overflowPct = overSec > 0 ? (overSec / scaleSec) * 100 : 0;

  // ---- handlers ------------------------------------------------------------
  const handleToggleMerge = (groupId: string) => {
    const group = DUP_BY_ID.get(groupId);
    if (group === undefined) {
      return;
    }
    const next = {...merged, [groupId]: merged[groupId] !== true};
    const nextQueue = deriveQueue(next);
    const nextTotal = nextQueue.reduce((sum, entry) => sum + entry.allocSec, 0);
    const nextOver = nextTotal - BLOCK_SEC;
    const budgetWord =
      nextOver > 0
        ? `over by ${fmtMinSec(nextOver)}`
        : nextOver === 0
          ? 'exactly at budget'
          : `${fmtMinSec(-nextOver)} spare`;
    setMerged(next);
    // A removed member's expanded row must not leave a dangling detail id.
    if (
      expandedKey !== null &&
      nextQueue.every(entry => entry.key !== expandedKey)
    ) {
      setExpandedKey(null);
    }
    setAnnouncement(
      next[groupId] === true
        ? `Merged “${group.title}” — ${nextQueue.length} queue entries, ${fmtMinSec(nextTotal)} requested, ${budgetWord}.`
        : `Unmerged “${group.title}” — ${nextQueue.length} queue entries, ${fmtMinSec(nextTotal)} requested, ${budgetWord}.`,
    );
  };

  const handleToggleCluster = (clusterId: string) => {
    const next = activeCluster === clusterId ? null : clusterId;
    setActiveCluster(next);
    const cluster = CLUSTER_BY_ID.get(clusterId);
    setAnnouncement(
      next === null
        ? 'Cluster filter cleared — showing the full queue.'
        : `Filtering the queue to “${cluster?.label ?? clusterId}”.`,
    );
  };

  const handleToggleExpand = (key: string) => {
    setExpandedKey(prev => (prev === key ? null : key));
  };

  const handleToggleCheckIn = (speakerId: string) => {
    const current = effectiveCheckIn(speakerId);
    if (current === 'remote') {
      return;
    }
    const next: CheckIn = current === 'checked-in' ? 'not-arrived' : 'checked-in';
    setCheckInOverrides(prev => ({...prev, [speakerId]: next}));
    const speaker = SPEAKER_BY_ID.get(speakerId);
    setAnnouncement(
      next === 'checked-in'
        ? `${speaker?.name} checked in at the podium desk.`
        : `${speaker?.name} marked not arrived.`,
    );
  };

  const handleReset = () => {
    setMerged({});
    setActiveCluster(null);
    setExpandedKey(null);
    setCheckInOverrides({});
    setAnnouncement('Console reset to the docket as filed.');
  };

  const handlePublish = () => {
    setAnnouncement(
      `Speaker order published to the chamber display — ${queue.length} entries, ${fmtMinSec(totalSec)} total.`,
    );
  };

  // ---- topbar ---------------------------------------------------------------
  const publishButton = (
    <Button
      label="Publish speaker order"
      variant="primary"
      size="sm"
      icon={<Icon icon={MegaphoneIcon} size="sm" color="inherit" />}
      isDisabled={overSec > 0}
      onClick={handlePublish}
    />
  );

  const header = (
    <LayoutHeader>
      <div className={`${SCOPE} topbar`}>
        <span className="brandMark">
          <BrandMark />
        </span>
        <div className="titleBlock">
          <p className="eyebrow">Podium · Clerk console</p>
          <h1 className="pageTitle">Item 7B — 400 Larch Street rezoning (RM-2 → MX-3)</h1>
          <div className="titleMeta">
            <span>Alder Glen Planning Commission · Jul 14, 2026</span>
            <Badge label="Docket 2026-118" variant="neutral" />
            <Badge label="Comment window closed" variant="success" />
            <span style={{display: 'inline-flex', alignItems: 'center', gap: 4}}>
              <Icon icon={CircleDotIcon} size="xsm" color="inherit" />
              65 written comments on file
            </span>
          </div>
        </div>
        <div className="topbarActions">
          <Button
            label="Reset"
            variant="ghost"
            size="sm"
            icon={<Icon icon={RotateCcwIcon} size="sm" />}
            onClick={handleReset}
          />
          {overSec > 0 ? (
            <Tooltip
              content={`Trim ${fmtMinSec(overSec)} to publish — merge a duplicate group or the chair must extend the block`}>
              <span>{publishButton}</span>
            </Tooltip>
          ) : (
            publishButton
          )}
        </div>
      </div>
    </LayoutHeader>
  );

  // ---- budget strip -----------------------------------------------------------
  const budgetChip =
    overSec > 0 ? (
      <span className="statChip isOver">
        Over by <strong>{fmtMinSec(overSec)}</strong>
      </span>
    ) : overSec === 0 ? (
      <span className="statChip isEven">
        <strong>At budget</strong> — 0:00 spare
      </span>
    ) : (
      <span className="statChip isSpare">
        <strong>{fmtMinSec(-overSec)}</strong> spare
      </span>
    );

  const budgetStrip = (
    <section className="budgetStrip" aria-label="Public comment time budget">
      <div className="budgetBarBlock">
        <div className="budgetLegend">
          <span>
            Requested <strong>{fmtMinSec(totalSec)}</strong> of the 30:00 block
          </span>
          <span>· gavel 6:30 PM</span>
        </div>
        <div className="budgetTrack">
          <span className="budgetFill" style={{width: `${fillPct}%`}} />
          {overflowPct > 0 && (
            <span
              className="budgetOverflow"
              style={{insetInlineStart: `${blockPct}%`, width: `${overflowPct}%`}}
            />
          )}
          {overSec > 0 && (
            <span className="budgetBlockTick" style={{insetInlineStart: `${blockPct}%`}} />
          )}
        </div>
        <div className="budgetScale">
          <span>0:00</span>
          {overSec > 0 && <span>30:00 block ↑</span>}
          <span>{fmtMinSec(scaleSec)}</span>
        </div>
      </div>
      <div className="budgetStats">
        <span className="statChip">
          <Icon icon={UsersIcon} size="xsm" color="inherit" />
          <strong>{queue.length}</strong> in queue
        </span>
        <span className="statChip">
          <Icon icon={UserCheckIcon} size="xsm" color="inherit" />
          <strong>{arrivedCount}</strong> arrived · <strong>{remoteCount}</strong> remote
        </span>
        {budgetChip}
        <span className="statChip">
          Ends ~<strong>{fmtClock(projectedEndMin)}</strong>
        </span>
      </div>
    </section>
  );

  // ---- columns ------------------------------------------------------------------
  const clusterCol = (
    <section className="col clusterCol" aria-label="Topic clusters">
      <div className="colHeader">
        <h2 className="colTitle">Topic clusters</h2>
        <span className="colCount">65 comments</span>
      </div>
      <div className="colScroll">
        <div className="clusterList">
          {CLUSTERS.map(cluster => (
            <ClusterRow
              key={cluster.id}
              cluster={cluster}
              entryCount={clusterEntryCount(cluster, merged)}
              isActive={activeCluster === cluster.id}
              onToggle={handleToggleCluster}
            />
          ))}
        </div>
        <p className="clusterFootnote">
          Clustered by the clerk’s similarity model (Podium v3.2). Counts are docket entries —
          merging a form letter collapses its signatories to one entry while keeping every name
          on the public record.
        </p>
      </div>
    </section>
  );

  const queueCol = (
    <section className="col queueCol" aria-label="Speaker queue">
      <div className="colHeader">
        <h2 className="colTitle">Speaker queue</h2>
        {activeClusterMeta !== undefined && (
          <span className="filterPill">
            {activeClusterMeta.label}
            <button
              type="button"
              aria-label={`Clear the ${activeClusterMeta.label} filter`}
              onClick={() => handleToggleCluster(activeClusterMeta.id)}>
              ×
            </button>
          </span>
        )}
        <span className="colCount">
          {visible.length} of {queue.length} · {fmtMinSec(totalSec)}
        </span>
      </div>
      <div className="colScroll">
        {visible.length === 0 ? (
          <p className="queueEmpty">
            No speakers signed up under this topic — its written comments are still on the
            docket and will be entered into the record by the clerk.
          </p>
        ) : (
          <ul className="queueList">
            {visible.map(({entry, position}) => (
              <QueueRowItem
                key={entry.key}
                entry={entry}
                position={position}
                checkIn={effectiveCheckIn(entry.speaker.id)}
                isExpanded={expandedKey === entry.key}
                onToggleExpand={handleToggleExpand}
                onToggleCheckIn={handleToggleCheckIn}
              />
            ))}
          </ul>
        )}
      </div>
    </section>
  );

  const dupCol = (
    <section className="col dupCol" aria-label="Duplicate comment stack">
      <div className="colHeader">
        <h2 className="colTitle">Duplicate stack</h2>
        <span className="colCount">{DUP_GROUPS.length} form-letter groups</span>
      </div>
      <div className="colScroll">
        <div className="dupList">
          {DUP_GROUPS.map(group => (
            <DupGroupCard
              key={group.id}
              group={group}
              isMerged={merged[group.id] === true}
              isDimmed={activeCluster !== null && group.clusterId !== activeCluster}
              onToggleMerge={handleToggleMerge}
            />
          ))}
        </div>
      </div>
    </section>
  );

  // ---- frame ----------------------------------------------------------------------
  return (
    <div style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className={`${SCOPE} shell`}>
              <div aria-live="polite" className={`${SCOPE} srOnly`}>
                {announcement}
              </div>
              {budgetStrip}
              <div className="grid">
                {clusterCol}
                {queueCol}
                {dupCol}
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
