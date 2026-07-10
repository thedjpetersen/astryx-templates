var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file lab-sample-chain-of-custody.tsx
 * @input Deterministic Chainpoint fixtures only: twelve hand-authored
 *   specimens (SP-24-018319 … SP-24-018347) with tube-type meta, draw
 *   sites, priorities, literal draw times and stability windows in
 *   minutes-since-midnight, and authored custody event chains. There is NO
 *   real clock: the lab clock is a fixture that starts at 872 min (14:32)
 *   and advances exactly +4 minutes per recorded custody event — the only
 *   thing that moves time. Cross-checks verified by hand: initial derived
 *   census is 3 awaiting pickup (018336, 018342, 018347) · 3 in transit
 *   (018334, 018338, 018339) · 2 received (018341, 018319) · 4 accessioned
 *   (018326, 018327, 018330, 018345); 1 authored exception — CSF 018319
 *   received at 864 vs its 802+60=862 deadline (+2 min late) — so the
 *   header reads 11/12 clean ≈ 92%. Ammonia 018336 has 845+30−872 = 3 min
 *   remaining at load and lactate 018334 has 850+30−872 = 8 (both inside
 *   the ≤40%-of-window amber band; 40% of 30 = 12). No clock reads, no
 *   randomness, no timers, no network assets.
 * @output Chainpoint — Lab Sample Chain of Custody: a specimen custody
 *   ledger. A brand header carries the action-driven lab clock and four
 *   derived stats (awaiting pickup, in transit, exceptions, clean rate);
 *   a 32px filter-chip strip scopes the ledger by custody status; each
 *   64px ledger row is a real <button> with a cap-colored tube glyph,
 *   barcode + de-identified patient, panel name, a four-node custody
 *   spine (draw → courier pickup → lab receipt → accession), and a
 *   hold-time chip counting minutes against the specimen's stability
 *   window. A 340px custody rail shows the selected specimen's full
 *   event ledger — actor, time, and note per event — its stability
 *   deadline math, and the ONE next action. Signature move: recording a
 *   handoff appends the custody event AND advances the lab clock 4
 *   minutes, so every OTHER specimen's hold chip re-derives in the same
 *   render — a chip across the ledger can slip green → amber → expired
 *   because you processed someone else first. Recording past the
 *   deadline attaches a stability exception to the event, flips the row
 *   into the exception lane, drops the clean-rate stat, and unlocks a
 *   "Request recollect" escalation that appends its own ledger event.
 * @position Page template; emitted by \`astryx template lab-sample-chain-of-custody\`
 *
 * Frame: Layout height="fill" → LayoutHeader (brand + lab clock + stat
 *   strip) → LayoutContent padding 0 → \`.lcc-body\` hand-rolled grid
 *   \`minmax(0, 1fr) 340px\` (hand-rolled rather than LayoutPanel so the
 *   <=900px restructure — the custody rail becomes a right-side overlay
 *   drawer with a shadow and close button — stays pure CSS). One state
 *   owner: \`samples\`, \`clockMin\`, \`selectedId\`, \`filter\`,
 *   \`announcement\`; recordNext() and requestRecollect() are the only
 *   mutations, and both re-derive every chip, stat, spine, and filter
 *   count from the same two values.
 * Container policy: dense ledger rows + one detail rail — no cards. Rows
 *   and filter chips are real <button>s (aria-pressed on chips; the
 *   selected row carries aria-pressed too); the spine is decorative SVG
 *   with the custody status carried by the row's aria-label.
 * Color policy: token-pure chrome. ONE quarantined brand accent
 *   (Chainpoint violet) as a light-dark() pair with contrast math at the
 *   declaration; hold-state green/amber/red pairs likewise. Tube-cap
 *   colors are NON-TEXT glyph fills (token-bordered 14px caps) — each
 *   still ships as a light-dark() pair so caps stay saturated on the
 *   dark scheme. The nonexistent bare text token is never used — text is
 *   --color-text-primary / --color-text-secondary throughout.
 * Density grid (repeated verbatim): 12px page gutter · 64px ledger rows ·
 *   32px filter chips · 14px spine nodes on 2px connectors (spine track
 *   132px) · 340px custody rail · 22px hold chips · 60px stat tiles ·
 *   40px minimum hit targets · 2px focus ring at 2px offset. Type:
 *   13px/600 barcodes and values · 12px meta · 11px/600 chips and
 *   overlines — nothing under 11px; tabular-nums on every time, minute
 *   count, and percent.
 * Fixture policy: all times are minute integers formatted by fmtClock();
 *   aggregates derive live from the sample set (never captions). Stress
 *   fixtures live in the data: 018345's 56-character send-out panel name
 *   exercises row ellipsis, 018319 is the authored exception so the
 *   exception lane is populated at load, and 018336 is 3 minutes from
 *   expiry so one unrelated handoff visibly flips it.
 *
 * Responsive contract:
 * - >= 901px (including the ~1045px inline demo stage, where viewport
 *   media queries never fire — this default IS the stage layout): ledger
 *   + docked 340px custody rail; rows show tube, identity, panel, spine,
 *   and hold chip.
 * - <= 900px: the rail undocks into a fixed right-edge drawer
 *   (min(340px, 92vw)) with a shadow and a close button that appears
 *   only in this mode; the ledger keeps full width beneath it.
 * - <= 560px (the 390px embed iframe): rows drop the panel-name column
 *   (subtraction — identity and spine stay), the spine track compresses
 *   to 96px, stat tiles wrap two-up, and every control keeps a >= 40px
 *   hit target.
 * - prefers-reduced-motion removes the next-node pulse and all
 *   transitions.
 */

import {useMemo, useState} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {
  AlertTriangleIcon,
  ClockIcon,
  FlaskConicalIcon,
  RotateCcwIcon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined Chainpoint brand accent (violet). #6D28D9 on #FFFFFF ≈
// 7.6:1; #B6A3F7 on the dark body (~#17191C) ≈ 8.3:1 — both clear 4.5:1
// down to the 11px chip floor.
const BRAND_ACCENT = 'light-dark(#6D28D9, #B6A3F7)';
// Text/glyphs over a BRAND_ACCENT fill: #FFFFFF on #6D28D9 ≈ 7.6:1;
// #231447 on #B6A3F7 ≈ 7.9:1 (white on #B6A3F7 would fail at ≈1.9:1).
const BRAND_ON = 'light-dark(#FFFFFF, #231447)';
// Brand wash (selected rows, active filter chips). Text on the wash is
// BRAND_ACCENT: #6D28D9 on rgba(109,40,217,.08)-over-white ≈ 6.9:1;
// #B6A3F7 on rgba(182,163,247,.12)-over-#17191C ≈ 7.4:1.
const BRAND_TINT = 'light-dark(rgba(109, 40, 217, 0.08), rgba(182, 163, 247, 0.12))';

// Hold-chip amber (≤40% of window remaining): #92400E on #FFFFFF ≈ 7.3:1;
// #F2B84B on #17191C ≈ 9.8:1.
const WARN_TEXT = 'light-dark(#92400E, #F2B84B)';
const WARN_TINT = 'light-dark(rgba(180, 83, 9, 0.12), rgba(242, 184, 75, 0.14))';
// Expired / exception red: #B42318 on #FFFFFF ≈ 6.4:1; #FF8A7A on #17191C
// ≈ 7.4:1.
const ERR_TEXT = 'light-dark(#B42318, #FF8A7A)';
const ERR_TINT = 'light-dark(rgba(180, 35, 24, 0.10), rgba(255, 138, 122, 0.14))';
// Healthy hold-chip green: #15703B on #FFFFFF ≈ 5.9:1; #6FD597 on #17191C
// ≈ 9.1:1.
const OK_TEXT = 'light-dark(#15703B, #6FD597)';
const OK_TINT = 'light-dark(rgba(21, 112, 59, 0.10), rgba(111, 213, 151, 0.14))';
// Drawer shadow (the one sanctioned shadow literal).
const DRAWER_SHADOW = 'light-dark(rgba(24, 18, 43, 0.18), rgba(0, 0, 0, 0.55))';

// ---------------------------------------------------------------------------
// DOMAIN TYPES + META TABLES
// ---------------------------------------------------------------------------

/** 'recollect' is a ledger-only annotation stage — never on the spine. */
type StageId = 'draw' | 'pickup' | 'receipt' | 'accession' | 'recollect';

/** The custody spine: the four stages every specimen must clear, in order. */
const STAGE_ORDER: StageId[] = ['draw', 'pickup', 'receipt', 'accession'];

const STAGE_META: Record<StageId, {label: string; action: string}> = {
  draw: {label: 'Drawn', action: 'Record draw'},
  pickup: {label: 'Courier pickup', action: 'Record courier pickup'},
  receipt: {label: 'Lab receipt', action: 'Record lab receipt'},
  accession: {label: 'Accessioned', action: 'Record accession'},
  recollect: {label: 'Recollect requested', action: 'Request recollect'},
};

type TubeKind =
  | 'lavender'
  | 'pink'
  | 'gold'
  | 'lightblue'
  | 'gray'
  | 'green'
  | 'culture'
  | 'clear'
  | 'yellow';

/**
 * Tube-cap meta: cap colors are NON-TEXT glyph fills on a token-bordered
 * 14px cap (the tube shape carries meaning; cap color is reinforcement).
 * Pairs keep caps saturated against the dark scheme; none is used as text.
 */
const TUBE_META: Record<TubeKind, {cap: string; label: string}> = {
  lavender: {cap: 'light-dark(#9D8CE0, #B0A2ED)', label: 'Lavender · EDTA'},
  pink: {cap: 'light-dark(#E58BB4, #F0A3C6)', label: 'Pink · EDTA crossmatch'},
  gold: {cap: 'light-dark(#D9A917, #E7C24D)', label: 'Gold · SST'},
  lightblue: {cap: 'light-dark(#5BA7DC, #7FBDE8)', label: 'Light blue · citrate'},
  gray: {cap: 'light-dark(#8E959D, #A8AFB8)', label: 'Gray · NaF/KOx'},
  green: {cap: 'light-dark(#4E9E63, #6FBE84)', label: 'Green · lithium heparin'},
  culture: {cap: 'light-dark(#7A5C3E, #A3805C)', label: 'Culture bottle set'},
  clear: {cap: 'light-dark(#B9C0C7, #CDD3D9)', label: 'Sterile · no additive'},
  yellow: {cap: 'light-dark(#C9B93A, #DACD5E)', label: 'Urine collection cup'},
};

interface CustodyEvent {
  stage: StageId;
  /** Minutes since midnight — formatted by fmtClock(). */
  timeMin: number;
  actor: string;
  note?: string;
  /** Present when the event was recorded past the stability deadline. */
  exception?: string;
}

interface Sample {
  id: string;
  patient: string;
  panel: string;
  tube: TubeKind;
  site: string;
  priority: 'stat' | 'routine';
  drawMin: number;
  /** Stability window in minutes from draw; deadline = drawMin + windowMin. */
  windowMin: number;
  events: CustodyEvent[];
  /** True once a recollect has been escalated. */
  recollect: boolean;
}

/** Lab clock fixture: starts 14:32; +4 min per recorded custody event. */
const CLOCK_START_MIN = 872;
const HANDLING_MIN = 4;
/** Hold chip goes amber when remaining ≤ 40% of the window. */
const AMBER_FRACTION = 0.4;

function fmtClock(min: number): string {
  const h = Math.floor(min / 60);
  const m = min % 60;
  return \`\${String(h).padStart(2, '0')}:\${String(m).padStart(2, '0')}\`;
}

// ---------------------------------------------------------------------------
// SPECIMEN FIXTURES — twelve hand-authored chains (census cross-checked in
// the @input comment: 3 awaiting pickup · 3 in transit · 2 received ·
// 4 accessioned · 1 authored exception).
// ---------------------------------------------------------------------------

const INITIAL_SAMPLES: Sample[] = [
  {
    id: 'SP-24-018327',
    patient: 'K. Osei · ····4821',
    panel: 'CBC with differential',
    tube: 'lavender',
    site: 'Draw Site 12 — Fairview',
    priority: 'routine',
    drawMin: 730,
    windowMin: 1440,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 730, actor: 'M. Arendt, phlebotomy'},
      {stage: 'pickup', timeMin: 745, actor: 'Courier R-7 · T. Vidal', note: 'Cooler 3, ambient'},
      {stage: 'receipt', timeMin: 810, actor: 'Central receiving · J. Mun'},
      {stage: 'accession', timeMin: 818, actor: 'L. Ortiz', note: 'Acc #A-55201'},
    ],
  },
  {
    id: 'SP-24-018330',
    patient: 'R. Calder · ····9032',
    panel: 'Basic metabolic panel',
    tube: 'gold',
    site: 'Draw Site 12 — Fairview',
    priority: 'routine',
    drawMin: 735,
    windowMin: 480,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 735, actor: 'M. Arendt, phlebotomy'},
      {stage: 'pickup', timeMin: 745, actor: 'Courier R-7 · T. Vidal', note: 'Cooler 3, ambient'},
      {stage: 'receipt', timeMin: 810, actor: 'Central receiving · J. Mun'},
      {stage: 'accession', timeMin: 821, actor: 'L. Ortiz', note: 'Acc #A-55202'},
    ],
  },
  {
    id: 'SP-24-018334',
    patient: 'D. Whelan · ····2214',
    panel: 'Lactate, plasma — confirm POC',
    tube: 'gray',
    site: 'ED phlebotomy',
    priority: 'stat',
    drawMin: 850,
    windowMin: 30,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 850, actor: 'S. Kwan, RN', note: 'On ice per protocol'},
      {stage: 'pickup', timeMin: 858, actor: 'Tube station 4 → core lab', note: 'Pneumatic send'},
    ],
  },
  {
    id: 'SP-24-018336',
    patient: 'A. Mireles · ····7748',
    panel: 'Ammonia, plasma — on ice',
    tube: 'lavender',
    site: 'ICU-4',
    priority: 'stat',
    drawMin: 845,
    windowMin: 30,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 845, actor: 'B. Ferro, RN', note: 'Ice slurry, capped'},
    ],
  },
  {
    id: 'SP-24-018338',
    patient: 'H. Stroud · ····1189',
    panel: 'Prothrombin time / INR',
    tube: 'lightblue',
    site: 'Draw Site 3 — Northgate',
    priority: 'routine',
    drawMin: 800,
    windowMin: 240,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 800, actor: 'P. Ilic, phlebotomy', note: 'Full draw, no clots'},
      {stage: 'pickup', timeMin: 812, actor: 'Courier R-3 · K. Adeyemi', note: 'Route 3 north loop'},
    ],
  },
  {
    id: 'SP-24-018339',
    patient: 'H. Stroud · ····1189',
    panel: 'Activated PTT',
    tube: 'lightblue',
    site: 'Draw Site 3 — Northgate',
    priority: 'routine',
    drawMin: 801,
    windowMin: 240,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 801, actor: 'P. Ilic, phlebotomy'},
      {stage: 'pickup', timeMin: 812, actor: 'Courier R-3 · K. Adeyemi', note: 'Route 3 north loop'},
    ],
  },
  {
    id: 'SP-24-018341',
    patient: 'W. Nakato · ····5507',
    panel: 'Blood culture ×2, set A (aerobic + anaerobic)',
    tube: 'culture',
    site: 'ED bay 9',
    priority: 'stat',
    drawMin: 820,
    windowMin: 120,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 820, actor: 'S. Kwan, RN', note: 'Two-site draw, 10 mL each'},
      {stage: 'pickup', timeMin: 838, actor: 'Courier R-5 · M. Grau'},
      {stage: 'receipt', timeMin: 866, actor: 'Micro receiving · F. Ellery', note: 'To incubator queue'},
    ],
  },
  {
    id: 'SP-24-018342',
    patient: 'J. Paz · ····6631',
    panel: 'Type and screen',
    tube: 'pink',
    site: 'L&D triage',
    priority: 'stat',
    drawMin: 860,
    windowMin: 180,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 860, actor: 'C. Roth, RN', note: 'Armband verified ×2'},
    ],
  },
  {
    id: 'SP-24-018345',
    patient: 'E. Fontaine · ····3390',
    // 56-char send-out panel name — the row-ellipsis stress fixture.
    panel: 'Heparin-induced thrombocytopenia PF4 IgG ELISA, send-out',
    tube: 'gold',
    site: 'Draw Site 3 — Northgate',
    priority: 'routine',
    drawMin: 780,
    windowMin: 480,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 780, actor: 'P. Ilic, phlebotomy'},
      {stage: 'pickup', timeMin: 795, actor: 'Courier R-3 · K. Adeyemi'},
      {stage: 'receipt', timeMin: 840, actor: 'Central receiving · J. Mun'},
      {stage: 'accession', timeMin: 846, actor: 'P. Deng', note: 'Acc #A-55214 · batch to ref lab 16:00'},
    ],
  },
  {
    id: 'SP-24-018326',
    patient: 'T. Ibarra · ····8873',
    panel: 'Ionized calcium',
    tube: 'green',
    site: 'ICU-4',
    priority: 'stat',
    drawMin: 815,
    windowMin: 60,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 815, actor: 'B. Ferro, RN', note: 'Anaerobic, capped'},
      {stage: 'pickup', timeMin: 826, actor: 'Tube station 7 → core lab', note: 'Pneumatic send'},
      {stage: 'receipt', timeMin: 852, actor: 'Central receiving · J. Mun'},
      {stage: 'accession', timeMin: 858, actor: 'P. Deng', note: 'Acc #A-55217'},
    ],
  },
  {
    id: 'SP-24-018319',
    patient: 'N. Vasquez · ····0456',
    panel: 'CSF cell count, tube 3 — irreplaceable specimen',
    tube: 'clear',
    site: 'OR 2 — neurosurgery',
    priority: 'stat',
    drawMin: 802,
    windowMin: 60,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 802, actor: 'Dr. Y. Halloran', note: 'Hand-carry ordered'},
      {stage: 'pickup', timeMin: 815, actor: 'OR runner · D. Small'},
      {
        stage: 'receipt',
        timeMin: 864,
        actor: 'Central receiving · J. Mun',
        note: 'Runner diverted to code — delay documented',
        exception:
          'Received 2 min past the 60-min stability window (deadline 14:22).',
      },
    ],
  },
  {
    id: 'SP-24-018347',
    patient: 'G. Brandt · ····7702',
    panel: 'Urine culture, clean catch',
    tube: 'yellow',
    site: 'Draw Site 12 — Fairview',
    priority: 'routine',
    drawMin: 855,
    windowMin: 120,
    recollect: false,
    events: [
      {stage: 'draw', timeMin: 855, actor: 'M. Arendt, phlebotomy', note: 'Refrigerate if delayed'},
    ],
  },
];

// ---------------------------------------------------------------------------
// DERIVATIONS — pure functions of (sample, clock).
// ---------------------------------------------------------------------------

type CustodyStatus = 'awaiting' | 'transit' | 'received' | 'accessioned';

const STATUS_LABEL: Record<CustodyStatus, string> = {
  awaiting: 'Awaiting pickup',
  transit: 'In transit',
  received: 'Received',
  accessioned: 'Accessioned',
};

function custodyStatus(sample: Sample): CustodyStatus {
  const stages = new Set(sample.events.map(event => event.stage));
  if (stages.has('accession')) {
    return 'accessioned';
  }
  if (stages.has('receipt')) {
    return 'received';
  }
  if (stages.has('pickup')) {
    return 'transit';
  }
  return 'awaiting';
}

function hasException(sample: Sample): boolean {
  return sample.events.some(event => event.exception != null);
}

function nextStage(sample: Sample): StageId | null {
  const stages = new Set(sample.events.map(event => event.stage));
  for (const stage of STAGE_ORDER) {
    if (!stages.has(stage)) {
      return stage;
    }
  }
  return null;
}

type HoldTone = 'ok' | 'warn' | 'expired' | 'closed';

interface Hold {
  tone: HoldTone;
  /** Chip copy, e.g. "3 min left", "over by 6", "closed 14:38". */
  text: string;
  /** Long-form for aria-labels and the rail. */
  detail: string;
}

/**
 * Hold-time derivation. The clock STOPS mattering once the specimen is
 * accessioned — the chip then reports the closed chain (still red if the
 * chain carries an exception).
 */
function deriveHold(sample: Sample, clockMin: number): Hold {
  const deadline = sample.drawMin + sample.windowMin;
  if (custodyStatus(sample) === 'accessioned') {
    const closedAt = sample.events.find(event => event.stage === 'accession');
    const late = hasException(sample);
    return {
      tone: late ? 'expired' : 'closed',
      text: \`closed \${fmtClock(closedAt?.timeMin ?? deadline)}\`,
      detail: late
        ? 'Chain closed with a stability exception.'
        : 'Chain closed inside the stability window.',
    };
  }
  const remaining = deadline - clockMin;
  if (hasException(sample) || remaining <= 0) {
    const over = Math.max(0, -remaining);
    return {
      tone: 'expired',
      text: hasException(sample)
        ? 'exception'
        : \`over by \${over} min\`,
      detail: hasException(sample)
        ? 'Stability exception on the chain — escalate or annotate.'
        : \`Stability window exceeded by \${over} min (deadline \${fmtClock(deadline)}).\`,
    };
  }
  const amberAt = Math.round(sample.windowMin * AMBER_FRACTION);
  const span = fmtRemaining(remaining);
  return {
    tone: remaining <= amberAt ? 'warn' : 'ok',
    text: \`\${span} left\`,
    detail: \`\${span} left in the \${sample.windowMin}-min window (deadline \${fmtClock(deadline)}).\`,
  };
}

/** "8 min" under two hours, "3.2 h" beyond — long windows stay readable. */
function fmtRemaining(min: number): string {
  return min < 120 ? \`\${min} min\` : \`\${(min / 60).toFixed(1)} h\`;
}

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector scoped under .tpl-lab-sample-chain-of-custody.
// Density grid repeated verbatim: 12px page gutter · 64px ledger rows · 32px
// filter chips · 14px spine nodes / 2px connectors on a 132px track · 340px
// custody rail · 22px hold chips · 60px stat tiles · 40px hit targets ·
// 2px focus ring offset 2.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.tpl-lab-sample-chain-of-custody {
  --lcc-accent: \${BRAND_ACCENT};
  --lcc-on-accent: \${BRAND_ON};
  --lcc-accent-tint: \${BRAND_TINT};
  --lcc-warn-text: \${WARN_TEXT};
  --lcc-warn-tint: \${WARN_TINT};
  --lcc-err-text: \${ERR_TEXT};
  --lcc-err-tint: \${ERR_TINT};
  --lcc-ok-text: \${OK_TEXT};
  --lcc-ok-tint: \${OK_TINT};
  font-family: var(--font-family-sans);
  color: var(--color-text-primary);
  height: 100%;
  min-height: 0;
}
.tpl-lab-sample-chain-of-custody *,
.tpl-lab-sample-chain-of-custody *::before,
.tpl-lab-sample-chain-of-custody *::after {
  box-sizing: border-box;
}
.tpl-lab-sample-chain-of-custody button {
  font: inherit;
  color: inherit;
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  text-align: inherit;
  cursor: pointer;
}
.tpl-lab-sample-chain-of-custody button:focus-visible {
  outline: 2px solid var(--lcc-accent);
  outline-offset: 2px;
}
.tpl-lab-sample-chain-of-custody .lcc-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}

/* ---- header --------------------------------------------------------------- */
.tpl-lab-sample-chain-of-custody .lcc-head {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  flex-wrap: wrap;
  width: 100%;
}
.tpl-lab-sample-chain-of-custody .lcc-brand {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-width: 0;
}
.tpl-lab-sample-chain-of-custody .lcc-brand-mark {
  flex: none;
  width: 28px;
  height: 28px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  background: var(--lcc-accent);
  color: var(--lcc-on-accent);
}
.tpl-lab-sample-chain-of-custody .lcc-brand-name {
  font-size: 15px;
  font-weight: 700;
  letter-spacing: -0.01em;
  margin: 0;
}
.tpl-lab-sample-chain-of-custody .lcc-brand-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
}
/* Action-driven lab clock readout. */
.tpl-lab-sample-chain-of-custody .lcc-clock {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-lab-sample-chain-of-custody .lcc-clock strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.tpl-lab-sample-chain-of-custody .lcc-stats {
  display: flex;
  gap: var(--spacing-2);
  margin-inline-start: auto;
  flex-wrap: wrap;
}
/* 60px stat tiles (density grid). */
.tpl-lab-sample-chain-of-custody .lcc-stat {
  min-width: 104px;
  height: 60px;
  padding: 8px 12px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
}
.tpl-lab-sample-chain-of-custody .lcc-stat-label {
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.tpl-lab-sample-chain-of-custody .lcc-stat-value {
  font-size: 18px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1.1;
}
.tpl-lab-sample-chain-of-custody .lcc-stat-value.is-accent { color: var(--lcc-accent); }
.tpl-lab-sample-chain-of-custody .lcc-stat-value.is-err { color: var(--lcc-err-text); }

/* ---- body grid --------------------------------------------------------------
   Hand-rolled minmax(0,1fr)/340px grid (not LayoutPanel) so the <=900px
   restructure — rail undocks into a fixed right-edge drawer — is pure CSS. */
.tpl-lab-sample-chain-of-custody .lcc-body {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 340px;
  gap: 12px;
  padding: 12px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
}
.tpl-lab-sample-chain-of-custody .lcc-main {
  min-width: 0;
  min-height: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

/* ---- filter strip: 32px chips ------------------------------------------------ */
.tpl-lab-sample-chain-of-custody .lcc-filters {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  flex: none;
}
.tpl-lab-sample-chain-of-custody .lcc-chip {
  height: 32px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-secondary);
  white-space: nowrap;
  transition: border-color 160ms ease, background-color 160ms ease, color 160ms ease;
}
.tpl-lab-sample-chain-of-custody .lcc-chip[aria-pressed='true'] {
  background: var(--lcc-accent);
  border-color: var(--lcc-accent);
  color: var(--lcc-on-accent);
}
.tpl-lab-sample-chain-of-custody .lcc-chip-count {
  font-variant-numeric: tabular-nums;
}
@media (hover: hover) {
  .tpl-lab-sample-chain-of-custody .lcc-chip:not([aria-pressed='true']):hover {
    border-color: color-mix(in srgb, var(--color-text-primary) 35%, var(--color-border));
    color: var(--color-text-primary);
  }
}

/* ---- ledger: 64px rows --------------------------------------------------------- */
.tpl-lab-sample-chain-of-custody .lcc-ledger {
  min-height: 0;
  overflow-y: auto;
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  display: flex;
  flex-direction: column;
}
.tpl-lab-sample-chain-of-custody .lcc-row {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 64px;
  padding: 8px 12px;
  border-bottom: var(--border-width) solid var(--color-border);
  transition: background-color 160ms ease;
}
.tpl-lab-sample-chain-of-custody .lcc-row:last-child { border-bottom: none; }
.tpl-lab-sample-chain-of-custody .lcc-row[aria-pressed='true'] {
  background: var(--lcc-accent-tint);
  box-shadow: inset 3px 0 0 var(--lcc-accent);
}
@media (hover: hover) {
  .tpl-lab-sample-chain-of-custody .lcc-row:not([aria-pressed='true']):hover {
    background: color-mix(in srgb, var(--color-text-primary) 4%, transparent);
  }
}
.tpl-lab-sample-chain-of-custody .lcc-row.is-exception {
  box-shadow: inset 3px 0 0 var(--lcc-err-text);
}
.tpl-lab-sample-chain-of-custody .lcc-row.is-exception[aria-pressed='true'] {
  background: var(--lcc-err-tint);
}
.tpl-lab-sample-chain-of-custody .lcc-tube { flex: none; }
.tpl-lab-sample-chain-of-custody .lcc-ident {
  flex: none;
  width: 168px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tpl-lab-sample-chain-of-custody .lcc-ident-id {
  font-size: 13px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: flex;
  align-items: center;
  gap: 6px;
}
.tpl-lab-sample-chain-of-custody .lcc-stat-chip {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.04em;
  padding: 1px 6px;
  border-radius: 4px;
  background: var(--lcc-err-tint);
  color: var(--lcc-err-text);
}
.tpl-lab-sample-chain-of-custody .lcc-ident-patient {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-lab-sample-chain-of-custody .lcc-panel {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.tpl-lab-sample-chain-of-custody .lcc-panel-name {
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.tpl-lab-sample-chain-of-custody .lcc-panel-site {
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Custody spine: 132px track, 14px nodes, 2px connectors. */
.tpl-lab-sample-chain-of-custody .lcc-spine { flex: none; width: 132px; }
.tpl-lab-sample-chain-of-custody .lcc-spine svg { display: block; }
/* 22px hold chips (density grid). */
.tpl-lab-sample-chain-of-custody .lcc-hold {
  flex: none;
  min-width: 92px;
  height: 22px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  transition: background-color 200ms ease, color 200ms ease;
}
.tpl-lab-sample-chain-of-custody .lcc-hold.is-ok { background: var(--lcc-ok-tint); color: var(--lcc-ok-text); }
.tpl-lab-sample-chain-of-custody .lcc-hold.is-warn { background: var(--lcc-warn-tint); color: var(--lcc-warn-text); }
.tpl-lab-sample-chain-of-custody .lcc-hold.is-expired { background: var(--lcc-err-tint); color: var(--lcc-err-text); }
.tpl-lab-sample-chain-of-custody .lcc-hold.is-closed { background: var(--color-background-muted); color: var(--color-text-secondary); }

/* ---- custody rail ---------------------------------------------------------------- */
.tpl-lab-sample-chain-of-custody .lcc-rail {
  min-width: 0;
  min-height: 0;
  overflow-y: auto;
  border: var(--border-width) solid var(--color-border);
  border-radius: 12px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  background: var(--color-background-body);
}
.tpl-lab-sample-chain-of-custody .lcc-rail-close { display: none; }
.tpl-lab-sample-chain-of-custody .lcc-rail-head {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.tpl-lab-sample-chain-of-custody .lcc-rail-id {
  font-size: 13px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  margin: 0;
}
.tpl-lab-sample-chain-of-custody .lcc-rail-sub {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.tpl-lab-sample-chain-of-custody .lcc-window {
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  padding: 10px 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-size: 12px;
  color: var(--color-text-secondary);
}
.tpl-lab-sample-chain-of-custody .lcc-window strong {
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
/* Event ledger rows: dot + time + actor + note. */
.tpl-lab-sample-chain-of-custody .lcc-events {
  display: flex;
  flex-direction: column;
}
.tpl-lab-sample-chain-of-custody .lcc-event {
  position: relative;
  padding: 8px 0 8px 22px;
}
.tpl-lab-sample-chain-of-custody .lcc-event::before {
  content: '';
  position: absolute;
  left: 5px;
  top: 14px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: var(--lcc-accent);
}
.tpl-lab-sample-chain-of-custody .lcc-event::after {
  content: '';
  position: absolute;
  left: 8px;
  top: 26px;
  bottom: -6px;
  width: 2px;
  background: var(--color-border);
}
.tpl-lab-sample-chain-of-custody .lcc-event:last-child::after { display: none; }
.tpl-lab-sample-chain-of-custody .lcc-event.is-exception::before { background: var(--lcc-err-text); }
.tpl-lab-sample-chain-of-custody .lcc-event-top {
  display: flex;
  align-items: baseline;
  gap: 8px;
  font-size: 12px;
}
.tpl-lab-sample-chain-of-custody .lcc-event-stage { font-weight: 600; }
.tpl-lab-sample-chain-of-custody .lcc-event-time {
  margin-inline-start: auto;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.tpl-lab-sample-chain-of-custody .lcc-event-actor,
.tpl-lab-sample-chain-of-custody .lcc-event-note {
  font-size: 11px;
  color: var(--color-text-secondary);
  line-height: 1.35;
}
.tpl-lab-sample-chain-of-custody .lcc-event-exc {
  margin-top: 4px;
  font-size: 11px;
  line-height: 1.4;
  padding: 6px 8px;
  border-radius: 8px;
  background: var(--lcc-err-tint);
  color: var(--lcc-err-text);
}
/* Rail actions: primary record button + recollect escalation. */
.tpl-lab-sample-chain-of-custody .lcc-action {
  min-height: 40px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border-radius: 10px;
  font-size: 13px;
  font-weight: 600;
  background: var(--lcc-accent);
  color: var(--lcc-on-accent);
  transition: opacity 160ms ease;
}
@media (hover: hover) {
  .tpl-lab-sample-chain-of-custody .lcc-action:hover { opacity: 0.88; }
}
.tpl-lab-sample-chain-of-custody .lcc-action.is-danger {
  background: transparent;
  border: var(--border-width) solid color-mix(in srgb, var(--lcc-err-text) 45%, var(--color-border));
  color: var(--lcc-err-text);
}
.tpl-lab-sample-chain-of-custody .lcc-action-note {
  font-size: 11px;
  line-height: 1.4;
  color: var(--color-text-secondary);
}
.tpl-lab-sample-chain-of-custody .lcc-done {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: var(--lcc-ok-text);
  font-weight: 600;
}
.tpl-lab-sample-chain-of-custody .lcc-empty {
  padding: 24px 12px;
  text-align: center;
  font-size: 12px;
  color: var(--color-text-secondary);
}

/* ---- responsive: drawer at <=900px, subtraction at <=560px ------------------------ */
@media (max-width: 900px) {
  .tpl-lab-sample-chain-of-custody .lcc-body {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-lab-sample-chain-of-custody .lcc-rail {
    position: fixed;
    inset-block: 0;
    inset-inline-end: 0;
    width: min(340px, 92vw);
    border-radius: 12px 0 0 12px;
    box-shadow: -12px 0 32px \${DRAWER_SHADOW};
    z-index: 30;
  }
  .tpl-lab-sample-chain-of-custody .lcc-rail.is-drawer-closed { display: none; }
  .tpl-lab-sample-chain-of-custody .lcc-rail-close {
    display: grid;
    place-items: center;
    flex: none;
    width: 40px;
    height: 40px;
    margin-inline-start: auto;
    border-radius: 8px;
    color: var(--color-text-secondary);
  }
}
@media (max-width: 560px) {
  .tpl-lab-sample-chain-of-custody .lcc-brand-sub { display: none; }
  .tpl-lab-sample-chain-of-custody .lcc-stats { margin-inline-start: 0; width: 100%; }
  .tpl-lab-sample-chain-of-custody .lcc-stat { flex: 1 1 40%; min-width: 0; }
  .tpl-lab-sample-chain-of-custody .lcc-panel { display: none; }
  .tpl-lab-sample-chain-of-custody .lcc-ident { flex: 1 1 auto; width: auto; }
  .tpl-lab-sample-chain-of-custody .lcc-spine { width: 96px; }
  .tpl-lab-sample-chain-of-custody .lcc-hold { min-width: 76px; }
}
/* Next-node pulse on the custody spine (opacity only — SVG-safe). */
@keyframes lcc-node-pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.35; }
}
.tpl-lab-sample-chain-of-custody .lcc-spine-next {
  animation: lcc-node-pulse 1.6s ease-in-out infinite;
}
@media (prefers-reduced-motion: reduce) {
  .tpl-lab-sample-chain-of-custody .lcc-chip,
  .tpl-lab-sample-chain-of-custody .lcc-row,
  .tpl-lab-sample-chain-of-custody .lcc-hold,
  .tpl-lab-sample-chain-of-custody .lcc-action { transition: none; }
  .tpl-lab-sample-chain-of-custody .lcc-spine-next { animation: none; }
}
\`;

// ---------------------------------------------------------------------------
// PRESENTATIONAL PIECES — all state lifts to the page owner below.
// ---------------------------------------------------------------------------

/** Chainpoint mark: three custody links reduced to a chain glyph. */
function BrandMark() {
  return (
    <span className="lcc-brand-mark" aria-hidden>
      <svg width={16} height={16} viewBox="0 0 16 16" fill="none">
        <circle cx={4} cy={8} r={2.4} stroke="currentColor" strokeWidth={1.5} />
        <circle cx={12} cy={8} r={2.4} stroke="currentColor" strokeWidth={1.5} />
        <path d="M6.4 8h3.2" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" />
      </svg>
    </span>
  );
}

/**
 * Tube glyph: 16×28 tube silhouette with a cap-colored 14px cap band. Cap
 * color is reinforcement only (never text); the border is a token so the
 * shape survives both schemes.
 */
function TubeGlyph({tube}: {tube: TubeKind}) {
  return (
    <span className="lcc-tube" title={TUBE_META[tube].label} aria-hidden>
      <svg width={16} height={28} viewBox="0 0 16 28">
        <rect
          x={3.5}
          y={1}
          width={9}
          height={5}
          rx={1.5}
          fill={TUBE_META[tube].cap}
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        <path
          d="M4.5 7h7v14.5a3.5 3.5 0 0 1-7 0Z"
          fill="var(--color-background-muted)"
          stroke="var(--color-border)"
          strokeWidth={1}
        />
        <path
          d="M5.5 13h5v8.3a2.5 2.5 0 0 1-5 0Z"
          fill={TUBE_META[tube].cap}
          opacity={0.45}
        />
      </svg>
    </span>
  );
}

/**
 * Custody spine: four 14px nodes on 2px connectors across a 132px track.
 * Done nodes fill with the accent (red when that event carries an
 * exception); the next expected node pulses as a ring. Decorative — the
 * row's aria-label narrates the same status.
 */
function CustodySpine({sample}: {sample: Sample}) {
  const doneByStage = new Map(sample.events.map(event => [event.stage, event]));
  const next = nextStage(sample);
  const positions = [10, 47, 84, 121];
  return (
    <span className="lcc-spine" aria-hidden>
      <svg width="100%" height={20} viewBox="0 0 132 20" preserveAspectRatio="xMidYMid meet">
        {STAGE_ORDER.slice(0, -1).map((stage, index) => {
          const from = positions[index];
          const to = positions[index + 1];
          const reached = doneByStage.has(STAGE_ORDER[index + 1]);
          return (
            <line
              key={stage}
              x1={from + 7}
              y1={10}
              x2={to - 7}
              y2={10}
              stroke={reached ? 'var(--lcc-accent)' : 'var(--color-border)'}
              strokeWidth={2}
            />
          );
        })}
        {STAGE_ORDER.map((stage, index) => {
          const event = doneByStage.get(stage);
          const isNext = stage === next;
          if (event != null) {
            return (
              <circle
                key={stage}
                cx={positions[index]}
                cy={10}
                r={7}
                fill={event.exception != null ? 'var(--lcc-err-text)' : 'var(--lcc-accent)'}
              />
            );
          }
          return (
            <circle
              key={stage}
              cx={positions[index]}
              cy={10}
              r={6}
              fill="none"
              stroke={isNext ? 'var(--lcc-accent)' : 'var(--color-border)'}
              strokeWidth={2}
              className={isNext ? 'lcc-spine-next' : undefined}
            />
          );
        })}
      </svg>
    </span>
  );
}

/** One 64px ledger row: real <button>; selection is aria-pressed. */
function LedgerRow({
  sample,
  hold,
  isSelected,
  onSelect,
}: {
  sample: Sample;
  hold: Hold;
  isSelected: boolean;
  onSelect: (id: string) => void;
}) {
  const status = custodyStatus(sample);
  const exception = hasException(sample);
  return (
    <button
      type="button"
      className={\`lcc-row\${exception ? ' is-exception' : ''}\`}
      aria-pressed={isSelected}
      aria-label={\`\${sample.id}, \${sample.panel}, \${TUBE_META[sample.tube].label}, \${
        sample.priority === 'stat' ? 'STAT, ' : ''
      }\${STATUS_LABEL[status]}\${exception ? ', stability exception' : ''}. \${hold.detail}\`}
      onClick={() => onSelect(sample.id)}>
      <TubeGlyph tube={sample.tube} />
      <span className="lcc-ident">
        <span className="lcc-ident-id">
          {sample.id}
          {sample.priority === 'stat' ? (
            <span className="lcc-stat-chip">STAT</span>
          ) : null}
        </span>
        <span className="lcc-ident-patient">{sample.patient}</span>
      </span>
      <span className="lcc-panel">
        <span className="lcc-panel-name">{sample.panel}</span>
        <span className="lcc-panel-site">
          {sample.site} · drawn {fmtClock(sample.drawMin)}
        </span>
      </span>
      <CustodySpine sample={sample} />
      <span className={\`lcc-hold is-\${hold.tone}\`}>{hold.text}</span>
    </button>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the single state owner. recordNext() and requestRecollect() are
// the only mutations; both advance the action-driven lab clock, so every
// hold chip, stat tile, filter count, and spine re-derives together.
// ---------------------------------------------------------------------------

type FilterId = 'all' | CustodyStatus | 'exceptions';

const FILTERS: Array<{id: FilterId; label: string}> = [
  {id: 'all', label: 'All'},
  {id: 'awaiting', label: 'Awaiting pickup'},
  {id: 'transit', label: 'In transit'},
  {id: 'received', label: 'Received'},
  {id: 'accessioned', label: 'Accessioned'},
  {id: 'exceptions', label: 'Exceptions'},
];

export default function LabSampleChainOfCustody() {
  const [samples, setSamples] = useState<Sample[]>(INITIAL_SAMPLES);
  const [clockMin, setClockMin] = useState(CLOCK_START_MIN);
  const [filter, setFilter] = useState<FilterId>('all');
  const [selectedId, setSelectedId] = useState<string | null>(
    INITIAL_SAMPLES[3].id, // Ammonia 018336 — 3 min from expiry at load.
  );
  // Drawer state only matters <=900px (the docked rail ignores it); it
  // starts closed so the 390px embed opens on the ledger, not the detail.
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // ---- derived census (live from the sample set — never captions) ----
  const counts = useMemo(() => {
    const byFilter: Record<FilterId, number> = {
      all: samples.length,
      awaiting: 0,
      transit: 0,
      received: 0,
      accessioned: 0,
      exceptions: 0,
    };
    for (const sample of samples) {
      byFilter[custodyStatus(sample)] += 1;
      if (hasException(sample)) {
        byFilter.exceptions += 1;
      }
    }
    return byFilter;
  }, [samples]);
  const cleanCount = samples.length - counts.exceptions;
  const cleanPct = Math.round((cleanCount / samples.length) * 100);

  const visible = useMemo(
    () =>
      samples.filter(sample =>
        filter === 'all'
          ? true
          : filter === 'exceptions'
            ? hasException(sample)
            : custodyStatus(sample) === filter,
      ),
    [samples, filter],
  );

  const selected = selectedId != null
    ? samples.find(sample => sample.id === selectedId) ?? null
    : null;
  const selectedHold = selected != null ? deriveHold(selected, clockMin) : null;
  const selectedNext = selected != null ? nextStage(selected) : null;

  // ---- mutations ----
  const selectSample = (id: string) => {
    setSelectedId(id);
    setDrawerOpen(true);
    const sample = samples.find(entry => entry.id === id);
    if (sample != null) {
      const hold = deriveHold(sample, clockMin);
      setAnnouncement(
        \`\${sample.id} selected — \${STATUS_LABEL[custodyStatus(sample)]}. \${hold.detail}\`,
      );
    }
  };

  /**
   * The signature mutation: append the next custody event stamped at the
   * lab clock, then advance the clock 4 minutes — so every other
   * specimen's hold chip re-derives against the new time.
   */
  const recordNext = () => {
    if (selected == null || selectedNext == null) {
      return;
    }
    const stage = selectedNext;
    const deadline = selected.drawMin + selected.windowMin;
    const late = clockMin > deadline;
    const actorByStage: Record<StageId, string> = {
      draw: 'Recorded at console',
      pickup: 'Courier dispatch · console',
      receipt: 'Central receiving · console',
      accession: 'Accessioning · console',
      recollect: 'Console escalation',
    };
    setSamples(prev =>
      prev.map(sample =>
        sample.id === selected.id
          ? {
              ...sample,
              events: [
                ...sample.events,
                {
                  stage,
                  timeMin: clockMin,
                  actor: actorByStage[stage],
                  ...(late
                    ? {
                        exception: \`Recorded \${clockMin - deadline} min past the \${sample.windowMin}-min stability window (deadline \${fmtClock(deadline)}).\`,
                      }
                    : {}),
                },
              ],
            }
          : sample,
      ),
    );
    setClockMin(prev => prev + HANDLING_MIN);
    setAnnouncement(
      late
        ? \`\${STAGE_META[stage].label} recorded for \${selected.id} at \${fmtClock(clockMin)} — STABILITY EXCEPTION, \${clockMin - deadline} min past the window. Lab clock is now \${fmtClock(clockMin + HANDLING_MIN)}.\`
        : \`\${STAGE_META[stage].label} recorded for \${selected.id} at \${fmtClock(clockMin)}. Lab clock is now \${fmtClock(clockMin + HANDLING_MIN)} — hold timers updated on every open specimen.\`,
    );
  };

  /** Escalation: appends its own ledger event; the chain stays flagged. */
  const requestRecollect = () => {
    if (selected == null) {
      return;
    }
    setSamples(prev =>
      prev.map(sample =>
        sample.id === selected.id
          ? {
              ...sample,
              recollect: true,
              events: [
                ...sample.events,
                {
                  stage: 'recollect' as const,
                  timeMin: clockMin,
                  actor: 'Console escalation',
                  note: \`Recollect requested from \${sample.site}; original specimen held for review.\`,
                },
              ],
            }
          : sample,
      ),
    );
    setClockMin(prev => prev + HANDLING_MIN);
    setAnnouncement(
      \`Recollect requested for \${selected.id}. Lab clock is now \${fmtClock(clockMin + HANDLING_MIN)}.\`,
    );
  };

  // ---- render ----
  return (
    <div className="tpl-lab-sample-chain-of-custody">
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <div className="lcc-head">
              <div className="lcc-brand">
                <BrandMark />
                <div>
                  <h1 className="lcc-brand-name">Chainpoint · Central Lab</h1>
                  <div className="lcc-brand-sub">
                    Specimen chain of custody · Meridian Health draw network
                  </div>
                </div>
              </div>
              <span className="lcc-clock">
                <Icon icon={ClockIcon} size="xsm" color="inherit" />
                Lab clock <strong>{fmtClock(clockMin)}</strong>
              </span>
              <div className="lcc-stats">
                <div className="lcc-stat">
                  <span className="lcc-stat-label">Awaiting pickup</span>
                  <span className="lcc-stat-value">{counts.awaiting}</span>
                </div>
                <div className="lcc-stat">
                  <span className="lcc-stat-label">In transit</span>
                  <span className="lcc-stat-value is-accent">{counts.transit}</span>
                </div>
                <div className="lcc-stat">
                  <span className="lcc-stat-label">Exceptions</span>
                  <span
                    className={\`lcc-stat-value\${counts.exceptions > 0 ? ' is-err' : ''}\`}>
                    {counts.exceptions}
                  </span>
                </div>
                <div className="lcc-stat">
                  <span className="lcc-stat-label">Clean chains</span>
                  <span className="lcc-stat-value">
                    {cleanCount}/{samples.length} · {cleanPct}%
                  </span>
                </div>
              </div>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} role="main" label="Specimen custody ledger">
            <div aria-live="polite" className="lcc-vh">
              {announcement}
            </div>
            <div className="lcc-body">
              <div className="lcc-main">
                {/* 32px status filter chips with live counts. */}
                <div className="lcc-filters" role="group" aria-label="Filter by custody status">
                  {FILTERS.map(entry => (
                    <button
                      key={entry.id}
                      type="button"
                      className="lcc-chip"
                      aria-pressed={filter === entry.id}
                      onClick={() => setFilter(entry.id)}>
                      {entry.label}
                      <span className="lcc-chip-count">{counts[entry.id]}</span>
                    </button>
                  ))}
                </div>

                <div className="lcc-ledger" aria-label="Specimen ledger">
                  {visible.length === 0 ? (
                    <div className="lcc-empty">
                      No specimens in this lane right now — every chain here has
                      moved on. Pick another status or All.
                    </div>
                  ) : (
                    visible.map(sample => (
                      <LedgerRow
                        key={sample.id}
                        sample={sample}
                        hold={deriveHold(sample, clockMin)}
                        isSelected={selectedId === sample.id}
                        onSelect={selectSample}
                      />
                    ))
                  )}
                </div>
              </div>

              {/* Custody rail (docked >=901px; overlay drawer below). */}
              {selected != null ? (
                <aside
                  className={\`lcc-rail\${drawerOpen ? '' : ' is-drawer-closed'}\`}
                  aria-label={\`Custody detail for \${selected.id}\`}>
                  <div className="lcc-rail-head">
                    <TubeGlyph tube={selected.tube} />
                    <div style={{minWidth: 0, flex: 1}}>
                      <h2 className="lcc-rail-id">{selected.id}</h2>
                      <div className="lcc-rail-sub">
                        {selected.panel}
                        <br />
                        {selected.patient} · {selected.site}
                      </div>
                    </div>
                    <button
                      type="button"
                      className="lcc-rail-close"
                      aria-label="Close custody detail"
                      onClick={() => setDrawerOpen(false)}>
                      <Icon icon={XIcon} size="sm" color="inherit" />
                    </button>
                  </div>

                  <div className="lcc-window">
                    <span>
                      Stability window <strong>{selected.windowMin} min</strong> from
                      draw at <strong>{fmtClock(selected.drawMin)}</strong> — deadline{' '}
                      <strong>{fmtClock(selected.drawMin + selected.windowMin)}</strong>
                    </span>
                    {selectedHold != null ? (
                      <span className={\`lcc-hold is-\${selectedHold.tone}\`} style={{alignSelf: 'flex-start'}}>
                        {selectedHold.text}
                      </span>
                    ) : null}
                  </div>

                  <div className="lcc-events" aria-label="Custody events">
                    {selected.events.map((event, index) => (
                      <div
                        key={\`\${event.stage}-\${index}\`}
                        className={\`lcc-event\${event.exception != null ? ' is-exception' : ''}\`}>
                        <div className="lcc-event-top">
                          <span className="lcc-event-stage">
                            {STAGE_META[event.stage].label}
                          </span>
                          <span className="lcc-event-time">{fmtClock(event.timeMin)}</span>
                        </div>
                        <div className="lcc-event-actor">{event.actor}</div>
                        {event.note != null ? (
                          <div className="lcc-event-note">{event.note}</div>
                        ) : null}
                        {event.exception != null ? (
                          <div className="lcc-event-exc" role="alert">
                            <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />{' '}
                            {event.exception}
                          </div>
                        ) : null}
                      </div>
                    ))}
                  </div>

                  {selectedNext != null ? (
                    <>
                      <button type="button" className="lcc-action" onClick={recordNext}>
                        <Icon icon={FlaskConicalIcon} size="sm" color="inherit" />
                        {STAGE_META[selectedNext].action} · {fmtClock(clockMin)}
                      </button>
                      <span className="lcc-action-note">
                        Recording stamps the event at the lab clock and advances it{' '}
                        {HANDLING_MIN} minutes — hold timers on every open specimen
                        re-derive.
                      </span>
                    </>
                  ) : (
                    <span className="lcc-done">
                      <Icon icon={FlaskConicalIcon} size="sm" color="inherit" />
                      Chain complete — accessioned and in the LIS.
                    </span>
                  )}

                  {hasException(selected) && !selected.recollect ? (
                    <button
                      type="button"
                      className="lcc-action is-danger"
                      onClick={requestRecollect}>
                      <Icon icon={RotateCcwIcon} size="sm" color="inherit" />
                      Request recollect from {selected.site}
                    </button>
                  ) : null}
                  {selected.recollect ? (
                    <span className="lcc-action-note">
                      Recollect requested — original specimen held for pathologist
                      review.
                    </span>
                  ) : null}
                </aside>
              ) : null}
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}

`;export{e as default};