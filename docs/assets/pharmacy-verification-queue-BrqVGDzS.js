var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Pestle pharmacist verification
 *   queue mid-shift ("Shift 14:32" is a fixed string; no Date.now(), no
 *   Math.random(), no network assets): twelve fills RX-7741…RX-7752 with
 *   dual-field quantities/waits/day-supplies, four patients, eight drug
 *   consts, parsed-sig token/chip pairs with fixed confidences, per-fill
 *   NxN interaction matrices, counseling flags, and a seeded immutable
 *   audit trail (seq 101–103, stamped by the other pharmacist AO).
 * @output Pharmacy Verification Queue — the pharmacist-side release gate
 *   for a pharmacy OS: a 48px Pestle header (mark + wordmark, queue tabs
 *   with computed count badges, pharmacist identity chip), a filterable
 *   40px-row Rx queue grouped under sticky section labels, and a working
 *   aside where each fill is checked against a two-lane sig translation
 *   (raw prescriber tokens with confidence underlines vs parsed chips),
 *   an upper-triangle drug-interaction severity matrix with severity-3
 *   override semantics, a regulatory counseling flag stack with keyboard
 *   acks, and a Verify gate. Every override/ack/verify stamps an
 *   append-only audit ticker footer.
 * @position Page template; emitted by \`astryx template pharmacy-verification-queue\`
 *
 * Frame: root 100dvh div > Layout height="fill"; content is a flex column:
 *   view root (flex row, minHeight 0, overflow hidden — main queue column
 *   | aside) above the full-width AuditTicker footer.
 * Container policy: app-shell archetype — frame rows, rails, and panels
 *   only; no Cards. Queue rows, matrix cells, and flag rows are styled
 *   divs/buttons on the content surface.
 * Color policy: token-pure chrome. ONE quarantined brand literal (Pestle
 *   teal #12857B as a light-dark pair) consumed only by the PestleMark
 *   fill and the active-tab underline. Severity red/amber/slate and the
 *   verify green ride the data-viz categorical tokens with repo-standard
 *   light-dark fallbacks; every wash is a light-dark pair. Amber text
 *   (#B45309 on light, 4.6:1; #FBBF24 on dark, 9.7:1) and red text
 *   (#DC2626, 4.5:1; #F87171, 7.3:1) pass 4.5:1 in both schemes; cell
 *   fills only need 3:1 non-text contrast and pass in both.
 *
 * DENSITY GRID (verbatim, used everywhere): header bar 48px; filter row
 * 36px; queue rows 40px; heavy detail rows 44px; SigTranslationRow 64px
 * (84px when chips wrap in narrowest band); matrix cells 24px with 4px
 * gap (20px below 1024px container); counsel flag rows 44px; audit ticker
 * footer 56px expanded / 28px collapsed; aside 420px (>=1200px container)
 * / 384px (1024–1199, the demo-stage default) / 340px (900–1023);
 * GUTTER = 12px single gutter token; inner cell padding 8px; chips 20px
 * tall; initials chip 24x24px; font sizes 13px primary / 12px secondary /
 * 11px chips-mono.
 *
 * Responsive contract — bands key off MEASURED CONTAINER WIDTH of the
 * view root (useElementWidth ResizeObserver; width 0 = pre-observer first
 * frame, falls back to viewport queries so wide hosts don't flash):
 * - >= 1200px: aside 420px, matrix cells 24px, all queue-row segments.
 * - 1024–1199px (STAGE DEFAULT): aside 384px, matrix cells 24px, queue
 *   rows drop the 64px wait chip (waitDisplay moves into the row title
 *   attr); everything else intact.
 * - 900–1023px: aside 340px, matrix cells 20px, severity dot cluster
 *   collapses to a single count chip ("x3").
 * - < 900px: the aside leaves the row and becomes a 384px right
 *   slide-over (opens on row select, Esc closes, focus returns to the
 *   row); the audit ticker auto-collapses to 28px; the filter row folds
 *   trailing chips into a DS overflow menu; SigTranslationRow chips wrap
 *   (row grows 64 -> 84px). Subtraction, never reflow-squeeze.
 *
 * Corner map: top-left PestleMark + wordmark; top-right pharmacist
 * identity chip + static shift label; bottom-left audit collapse toggle +
 * entry-count badge; bottom-right computed throughput stat + keycap
 * legend ("A ack · O override · V verify"). Floating chrome never
 * collides — the ticker owns the full bottom edge.
 */

import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react';

import {
  CheckIcon,
  ChevronDownIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  SearchIcon,
  SlidersHorizontalIcon,
  XIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {DropdownMenu, DropdownMenuItem} from '@astryxdesign/core/DropdownMenu';
import {Icon} from '@astryxdesign/core/Icon';
import {Kbd} from '@astryxdesign/core/Kbd';
import {Popover} from '@astryxdesign/core/Popover';
import {RadioList, RadioListItem} from '@astryxdesign/core/RadioList';
import {TextInput} from '@astryxdesign/core/TextInput';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark
// pair (dark side shifted to the lighter 300–400-weight hue). Data-viz
// categorical tokens carry the repo-standard fallback pairs.
// ---------------------------------------------------------------------------

// THE one quarantined brand literal — consumed ONLY by PestleMark's mortar
// fill and the active-tab underline (both non-text: #12857B vs white
// 4.7:1, #2FB3A8 vs dark surface ~6:1 — beyond the 3:1 non-text floor).
const BRAND = 'light-dark(#12857B, #2FB3A8)';

// Severity + status colors. Text uses: red 4.5:1 light / 7.3:1 dark,
// amber #B45309 4.6:1 light / #FBBF24 9.7:1 dark.
const SEV_RED = 'var(--color-data-categorical-red, light-dark(#DC2626, #F87171))';
const SEV_RED_SOFT = 'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.16))';
const SEV_AMBER = 'var(--color-data-categorical-orange, light-dark(#B45309, #FBBF24))';
const SEV_AMBER_SOFT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.14))';
const SEV_SLATE = 'light-dark(#94A3B8, #64748B)'; // severity-1 cell fill, non-text
const OK_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const OK_GREEN_SOFT = 'light-dark(rgba(11, 153, 31, 0.10), rgba(52, 199, 89, 0.16))';
const BRAND_SOFT = 'light-dark(rgba(18, 133, 123, 0.08), rgba(47, 179, 168, 0.14))';

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings, hover states on dense custom rows, and the
// reduced-motion guard. Transitions animate color/opacity only.
// ---------------------------------------------------------------------------

const PVQ_CSS = \`
.pvq-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.pvq-focusable:focus-visible,
.pvq-row:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: -2px;
}
.pvq-row:hover { background-color: var(--color-background-muted); }
.pvq-chipbtn { transition: background-color 120ms ease, color 120ms ease; }
.pvq-chipbtn:hover { background-color: var(--color-background-muted); }
.pvq-ticker { scrollbar-width: thin; }
@media (prefers-reduced-motion: reduce) {
  .pvq-chipbtn, .pvq-cell { transition: none !important; }
}
\`;

// ---------------------------------------------------------------------------
// TYPES
// ---------------------------------------------------------------------------

type TabId = 'ready' | 'blocked' | 'counsel' | 'verified';
type Band = 'wide' | 'stage' | 'narrow' | 'compact';
type Severity = 0 | 1 | 2 | 3;

interface Pharmacist {
  id: string;
  initials: string;
  name: string;
}

interface Patient {
  id: string;
  name: string;
  dob: string; // fixed string, never Date math
}

interface Drug {
  id: string;
  name: string;
  abbrev: string;
}

interface RawToken {
  id: string;
  text: string;
  /** Parser confidence 0–1: >=0.95 no underline; 0.80–0.94 dotted amber; <0.80 solid red. */
  confidence: number;
}

interface ParsedChip {
  id: string;
  kind: 'dose' | 'route' | 'freq' | 'duration';
  label: string;
  tokenId: string;
  /** Only chips whose raw token confidence < 0.80 need confirming. */
  confirmed?: boolean;
}

interface InteractionCell {
  aId: string;
  bId: string;
  severity: Severity;
  status: 'active' | 'overridden';
  overriddenBy?: string; // pharmacist initials
  reasonCode?: string;
  mechanism: string;
  onset: string;
  doc: string;
}

interface CounselFlag {
  id: string;
  label: string;
  kind: 'regulatory' | 'info';
  glyph: 'shake' | 'snowflake' | 'document';
  ackedBy?: {initials: string; seq: number};
  dismissed?: boolean;
}

interface Fill {
  id: string;
  rxNumber: string;
  patientId: string;
  drugId: string;
  prescriber: string;
  quantityNum: number;
  quantityDisplay: string;
  daysSupplyNum: number;
  daysSupplyDisplay: string;
  waitMin?: number;
  waitDisplay?: string;
  sigRaw: string;
  rawTokens: RawToken[];
  parsed: ParsedChip[];
  medIds: string[];
  interactions: InteractionCell[];
  flags: CounselFlag[];
  status: TabId;
  verifiedBy?: string; // pharmacist id
  /** Initials chip in the queue row — set only after an override or verify. */
  stampedBy?: string; // pharmacist initials
}

interface AuditEntry {
  seq: number;
  verb: 'VERIFY' | 'ACK' | 'OVERRIDE';
  detail: string;
  initials: string;
  time: string; // static shift time string
}

// ---------------------------------------------------------------------------
// FIXTURES — Pestle pharmacy OS, one mid-shift snapshot. Shift clock is the
// const SHIFT_TIME; every aggregate on screen derives live from FILLS.
// ---------------------------------------------------------------------------

const SHIFT_TIME = '14:32';

const RPH_TAN: Pharmacist = {id: 'rph-tan', initials: 'JT', name: 'J. Tan, PharmD'};
// Appears only in seeded history — keeps verified-tab initials chips non-uniform.
const RPH_OYELARAN: Pharmacist = {id: 'rph-oyelaran', initials: 'AO', name: 'A. Oyelaran, PharmD'};

const PATIENTS: Record<string, Patient> = {
  // 29-char hyphenated name — stresses the queue row's flex column at the
  // 900–1023 band and the 44px patient strip.
  'pat-okonkwo': {id: 'pat-okonkwo', name: 'Wilhelmina Okonkwo-Vanterpool', dob: '1948-03-11'},
  'pat-brauer': {id: 'pat-brauer', name: 'Marcus Brauer', dob: '1961-07-29'},
  'pat-leung': {id: 'pat-leung', name: 'Priya Leung', dob: '1990-02-14'},
  'pat-delacroix': {id: 'pat-delacroix', name: 'Sam Delacroix', dob: '1976-11-02'},
};

const DRUG_WARFARIN: Drug = {id: 'drug-warfarin', name: 'warfarin sodium 5 mg tablet', abbrev: 'warf'};
const DRUG_SERTRALINE: Drug = {id: 'drug-sertraline', name: 'sertraline 50 mg tablet', abbrev: 'sertr'};
// 47-char name — ellipsizes in the 40px queue row and the 64px matrix
// header (abbrev 'trim/sulf'; title attr carries the full name).
const DRUG_TRIMSULF: Drug = {
  id: 'drug-trimsulf',
  name: 'sulfamethoxazole-trimethoprim 800-160 mg tablet',
  abbrev: 'trim/sulf',
};
const DRUG_LISINOPRIL: Drug = {id: 'drug-lisinopril', name: 'lisinopril 10 mg tablet', abbrev: 'lisin'};
const DRUG_METFORMIN: Drug = {id: 'drug-metformin', name: 'metformin 500 mg tablet', abbrev: 'metf'};
const DRUG_APIXABAN: Drug = {id: 'drug-apixaban', name: 'apixaban 5 mg tablet', abbrev: 'apix'};
const DRUG_LEVOTHYROXINE: Drug = {id: 'drug-levothyroxine', name: 'levothyroxine 75 mcg tablet', abbrev: 'levo'};
// Eighth drug beyond the base seven: RX-7746's low-confidence ophthalmic
// sig needs a drop-form drug, and it fills the 7x7 matrix seat sertraline
// vacates on RX-7744 (keeps that matrix at exactly two severity-3 cells).
const DRUG_KETOROLAC: Drug = {
  id: 'drug-ketorolac',
  name: 'ketorolac tromethamine 0.5% ophthalmic solution',
  abbrev: 'ketor',
};

const DRUGS: Record<string, Drug> = Object.fromEntries(
  [
    DRUG_WARFARIN,
    DRUG_SERTRALINE,
    DRUG_TRIMSULF,
    DRUG_LISINOPRIL,
    DRUG_METFORMIN,
    DRUG_APIXABAN,
    DRUG_LEVOTHYROXINE,
    DRUG_KETOROLAC,
  ].map(d => [d.id, d]),
);

const cell = (
  a: Drug,
  b: Drug,
  severity: Severity,
  mechanism: string,
  onset: string,
  doc: string,
): InteractionCell => ({
  aId: a.id,
  bId: b.id,
  severity,
  status: 'active',
  mechanism,
  onset,
  doc,
});

const tok = (id: string, text: string, confidence: number): RawToken => ({id, text, confidence});

// Standard high-confidence oral sig used by several fills.
const oralSig = (
  prefix: string,
  freqText: string,
  freqLabel: string,
  durText: string,
  durLabel: string,
): {rawTokens: RawToken[]; parsed: ParsedChip[]} => ({
  rawTokens: [
    tok(\`\${prefix}-t1\`, '1', 0.99),
    tok(\`\${prefix}-t2\`, 'tab', 0.99),
    tok(\`\${prefix}-t3\`, 'PO', 0.98),
    tok(\`\${prefix}-t4\`, freqText, 0.96),
    tok(\`\${prefix}-t5\`, durText, 0.97),
  ],
  parsed: [
    {id: \`\${prefix}-c1\`, kind: 'dose', label: '1 tablet', tokenId: \`\${prefix}-t2\`},
    {id: \`\${prefix}-c2\`, kind: 'route', label: 'oral', tokenId: \`\${prefix}-t3\`},
    {id: \`\${prefix}-c3\`, kind: 'freq', label: freqLabel, tokenId: \`\${prefix}-t4\`},
    {id: \`\${prefix}-c4\`, kind: 'duration', label: durLabel, tokenId: \`\${prefix}-t5\`},
  ],
});

const INITIAL_FILLS: Record<string, Fill> = {
  'rx-7741': {
    id: 'rx-7741',
    rxNumber: 'RX-7741',
    patientId: 'pat-leung',
    drugId: DRUG_LISINOPRIL.id,
    prescriber: 'Dr. Ferreira',
    quantityNum: 30,
    quantityDisplay: '30 tabs',
    daysSupplyNum: 30,
    daysSupplyDisplay: '30d',
    waitMin: 14,
    waitDisplay: '14m',
    sigRaw: '1 tab PO QD x30d',
    ...oralSig('s7741', 'QD', 'once daily', 'x30d', '30 days'),
    medIds: [DRUG_LISINOPRIL.id, DRUG_METFORMIN.id],
    interactions: [
      cell(DRUG_LISINOPRIL, DRUG_METFORMIN, 1, 'ACE inhibitor may enhance hypoglycemic effect', 'delayed, 1-2wk', 'theoretical'),
    ],
    flags: [
      {id: 'f7741-1', kind: 'info', glyph: 'document', label: 'Refill 2 of 5 — no counseling due'},
    ],
    status: 'ready',
  },
  'rx-7742': {
    id: 'rx-7742',
    rxNumber: 'RX-7742',
    patientId: 'pat-okonkwo',
    drugId: DRUG_SERTRALINE.id,
    prescriber: 'Dr. Naylor',
    quantityNum: 30,
    quantityDisplay: '30 tabs',
    daysSupplyNum: 30,
    daysSupplyDisplay: '30d',
    waitMin: 26,
    waitDisplay: '26m',
    sigRaw: '1 tab PO QHS x30d',
    ...oralSig('s7742', 'QHS', 'at bedtime', 'x30d', '30 days'),
    medIds: [DRUG_WARFARIN.id, DRUG_SERTRALINE.id, DRUG_LEVOTHYROXINE.id],
    interactions: [
      cell(DRUG_WARFARIN, DRUG_SERTRALINE, 3, 'CYP2C9 inhibition — elevated INR risk', 'delayed, 3-5d', 'established'),
      cell(DRUG_WARFARIN, DRUG_LEVOTHYROXINE, 2, 'Increased warfarin sensitivity', 'delayed, 1-2wk', 'probable'),
      cell(DRUG_SERTRALINE, DRUG_LEVOTHYROXINE, 0, 'No interaction on file', '—', '—'),
    ],
    flags: [
      {id: 'f7742-1', kind: 'regulatory', glyph: 'document', label: 'MedGuide required — dispense with print'},
    ],
    status: 'blocked',
  },
  'rx-7743': {
    id: 'rx-7743',
    rxNumber: 'RX-7743',
    patientId: 'pat-brauer',
    drugId: DRUG_METFORMIN.id,
    prescriber: 'Dr. Ferreira',
    quantityNum: 180,
    quantityDisplay: '180 tabs',
    daysSupplyNum: 90,
    daysSupplyDisplay: '90d',
    waitMin: 3,
    waitDisplay: '3m',
    sigRaw: '1 tab PO BID x90d',
    ...oralSig('s7743', 'BID', 'twice daily', 'x90d', '90 days'),
    medIds: [DRUG_METFORMIN.id, DRUG_LISINOPRIL.id],
    interactions: [
      cell(DRUG_METFORMIN, DRUG_LISINOPRIL, 1, 'ACE inhibitor may enhance hypoglycemic effect', 'delayed, 1-2wk', 'theoretical'),
    ],
    // Zero flags — exercises the CounselFlagStack quiet empty row.
    flags: [],
    status: 'ready',
  },
  'rx-7744': {
    id: 'rx-7744',
    rxNumber: 'RX-7744',
    patientId: 'pat-okonkwo',
    drugId: DRUG_TRIMSULF.id,
    prescriber: 'Dr. Naylor',
    quantityNum: 20,
    quantityDisplay: '20 tabs',
    daysSupplyNum: 10,
    daysSupplyDisplay: '10d',
    waitMin: 41,
    waitDisplay: '41m',
    sigRaw: '1 tab PO BID x10d',
    ...oralSig('s7744', 'BID', 'twice daily', 'x10d', '10 days'),
    // Seven active meds — 7x7 matrix, 21 upper-triangle cells, exactly two
    // severity-3. Must fit the 340px aside at 20px cells (64+7*20+6*4=228px).
    medIds: [
      DRUG_WARFARIN.id,
      DRUG_TRIMSULF.id,
      DRUG_LISINOPRIL.id,
      DRUG_METFORMIN.id,
      DRUG_APIXABAN.id,
      DRUG_LEVOTHYROXINE.id,
      DRUG_KETOROLAC.id,
    ],
    interactions: [
      cell(DRUG_WARFARIN, DRUG_TRIMSULF, 3, 'CYP2C9 inhibition + protein-binding displacement — INR spike', 'delayed, 2-5d', 'established'),
      cell(DRUG_WARFARIN, DRUG_LISINOPRIL, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_WARFARIN, DRUG_METFORMIN, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_WARFARIN, DRUG_APIXABAN, 3, 'Duplicate anticoagulation — additive major-bleed risk', 'rapid, <24h', 'established'),
      cell(DRUG_WARFARIN, DRUG_LEVOTHYROXINE, 2, 'Increased warfarin sensitivity', 'delayed, 1-2wk', 'probable'),
      cell(DRUG_WARFARIN, DRUG_KETOROLAC, 2, 'NSAID — GI-bleed risk potentiation', 'rapid, 1-3d', 'probable'),
      cell(DRUG_TRIMSULF, DRUG_LISINOPRIL, 2, 'Additive potassium retention — hyperkalemia', 'delayed, 3-7d', 'established'),
      cell(DRUG_TRIMSULF, DRUG_METFORMIN, 1, 'Lactic-acidosis case reports', 'delayed', 'theoretical'),
      cell(DRUG_TRIMSULF, DRUG_APIXABAN, 1, 'Possible CYP3A4 competition', 'delayed', 'theoretical'),
      cell(DRUG_TRIMSULF, DRUG_LEVOTHYROXINE, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_TRIMSULF, DRUG_KETOROLAC, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_LISINOPRIL, DRUG_METFORMIN, 1, 'ACE inhibitor may enhance hypoglycemic effect', 'delayed, 1-2wk', 'theoretical'),
      cell(DRUG_LISINOPRIL, DRUG_APIXABAN, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_LISINOPRIL, DRUG_LEVOTHYROXINE, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_LISINOPRIL, DRUG_KETOROLAC, 1, 'NSAID blunts ACE-inhibitor effect', 'delayed, 3-7d', 'probable'),
      cell(DRUG_METFORMIN, DRUG_APIXABAN, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_METFORMIN, DRUG_LEVOTHYROXINE, 1, 'Levothyroxine may reduce glycemic control', 'delayed', 'probable'),
      cell(DRUG_METFORMIN, DRUG_KETOROLAC, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_APIXABAN, DRUG_LEVOTHYROXINE, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_APIXABAN, DRUG_KETOROLAC, 2, 'NSAID + anticoagulant — additive bleed risk', 'rapid, 1-3d', 'probable'),
      cell(DRUG_LEVOTHYROXINE, DRUG_KETOROLAC, 0, 'No interaction on file', '—', '—'),
    ],
    flags: [
      {id: 'f7744-1', kind: 'regulatory', glyph: 'document', label: 'Sulfa allergy check — chart review documented 14:02'},
    ],
    status: 'blocked',
  },
  'rx-7745': {
    id: 'rx-7745',
    rxNumber: 'RX-7745',
    patientId: 'pat-delacroix',
    drugId: DRUG_LEVOTHYROXINE.id,
    prescriber: 'Dr. Whitcombe',
    quantityNum: 90,
    quantityDisplay: '90 tabs',
    daysSupplyNum: 90,
    daysSupplyDisplay: '90d',
    waitMin: 8,
    waitDisplay: '8m',
    sigRaw: '1 tab PO QAM x90d',
    ...oralSig('s7745', 'QAM', 'every morning', 'x90d', '90 days'),
    // Single-med list — matrix collapses to the lone diagonal med dot.
    medIds: [DRUG_LEVOTHYROXINE.id],
    interactions: [],
    flags: [
      {id: 'f7745-1', kind: 'info', glyph: 'document', label: 'Take 30 min before breakfast — reinforce timing'},
    ],
    status: 'ready',
  },
  'rx-7746': {
    id: 'rx-7746',
    rxNumber: 'RX-7746',
    patientId: 'pat-leung',
    drugId: DRUG_KETOROLAC.id,
    prescriber: 'Dr. Whitcombe',
    quantityNum: 1,
    quantityDisplay: '1 bottle (5 mL)',
    daysSupplyNum: 7,
    daysSupplyDisplay: '7d',
    waitMin: 19,
    waitDisplay: '19m',
    // Three tokens under 0.80 confidence (solid red underlines, '?' chips)
    // prove the confirm-before-verify gate; the fill stays Blocked until
    // all three parsed chips are confirmed.
    sigRaw: '1-2 gtt OU q4-6h prn pain',
    rawTokens: [
      tok('s7746-t1', '1-2', 0.74),
      tok('s7746-t2', 'gtt', 0.86),
      tok('s7746-t3', 'OU', 0.72),
      tok('s7746-t4', 'q4-6h', 0.78),
      tok('s7746-t5', 'prn', 0.93),
      tok('s7746-t6', 'pain', 0.97),
    ],
    parsed: [
      {id: 's7746-c1', kind: 'dose', label: '1-2 drops', tokenId: 's7746-t1'},
      {id: 's7746-c2', kind: 'route', label: 'both eyes', tokenId: 's7746-t3'},
      {id: 's7746-c3', kind: 'freq', label: 'every 4-6 hours', tokenId: 's7746-t4'},
      {id: 's7746-c4', kind: 'duration', label: 'as needed — pain', tokenId: 's7746-t5'},
    ],
    medIds: [DRUG_KETOROLAC.id, DRUG_LISINOPRIL.id, DRUG_METFORMIN.id],
    interactions: [
      cell(DRUG_KETOROLAC, DRUG_LISINOPRIL, 1, 'NSAID blunts ACE-inhibitor effect', 'delayed, 3-7d', 'probable'),
      cell(DRUG_KETOROLAC, DRUG_METFORMIN, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_LISINOPRIL, DRUG_METFORMIN, 1, 'ACE inhibitor may enhance hypoglycemic effect', 'delayed, 1-2wk', 'theoretical'),
    ],
    flags: [
      {id: 'f7746-1', kind: 'regulatory', glyph: 'shake', label: 'Shake well before instilling — suspension settles'},
      {id: 'f7746-2', kind: 'info', glyph: 'snowflake', label: 'Refrigerate until first use — then room temp OK'},
    ],
    status: 'blocked',
  },
  'rx-7747': {
    id: 'rx-7747',
    rxNumber: 'RX-7747',
    patientId: 'pat-delacroix',
    drugId: DRUG_WARFARIN.id,
    prescriber: 'Dr. Whitcombe',
    quantityNum: 30,
    quantityDisplay: '30 tabs',
    daysSupplyNum: 30,
    daysSupplyDisplay: '30d',
    waitMin: 12,
    waitDisplay: '12m',
    sigRaw: '1 tab PO QPM x30d',
    ...oralSig('s7747', 'QPM', 'every evening', 'x30d', '30 days'),
    medIds: [DRUG_WARFARIN.id, DRUG_LEVOTHYROXINE.id],
    interactions: [
      cell(DRUG_WARFARIN, DRUG_LEVOTHYROXINE, 2, 'Increased warfarin sensitivity', 'delayed, 1-2wk', 'probable'),
    ],
    flags: [
      {id: 'f7747-1', kind: 'regulatory', glyph: 'document', label: 'MedGuide required — dispense with print'},
      {id: 'f7747-2', kind: 'regulatory', glyph: 'document', label: 'New anticoagulant start — bleed-risk counseling'},
    ],
    status: 'counsel',
  },
  'rx-7748': {
    id: 'rx-7748',
    rxNumber: 'RX-7748',
    patientId: 'pat-brauer',
    drugId: DRUG_APIXABAN.id,
    prescriber: 'Dr. Naylor',
    quantityNum: 60,
    quantityDisplay: '60 tabs',
    daysSupplyNum: 30,
    daysSupplyDisplay: '30d',
    waitMin: 22,
    waitDisplay: '22m',
    sigRaw: '1 tab PO BID x30d',
    ...oralSig('s7748', 'BID', 'twice daily', 'x30d', '30 days'),
    medIds: [DRUG_APIXABAN.id, DRUG_METFORMIN.id, DRUG_SERTRALINE.id],
    interactions: [
      cell(DRUG_APIXABAN, DRUG_METFORMIN, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_APIXABAN, DRUG_SERTRALINE, 2, 'SSRI + anticoagulant — additive bleed risk', 'rapid, 1-3d', 'probable'),
      cell(DRUG_METFORMIN, DRUG_SERTRALINE, 0, 'No interaction on file', '—', '—'),
    ],
    flags: [
      {id: 'f7748-1', kind: 'info', glyph: 'document', label: 'Dose-pack candidate — flag for sync program'},
    ],
    status: 'ready',
  },
  'rx-7749': {
    id: 'rx-7749',
    rxNumber: 'RX-7749',
    patientId: 'pat-brauer',
    drugId: DRUG_SERTRALINE.id,
    prescriber: 'Dr. Naylor',
    quantityNum: 30,
    quantityDisplay: '30 tabs',
    daysSupplyNum: 30,
    daysSupplyDisplay: '30d',
    waitMin: 9,
    waitDisplay: '9m',
    sigRaw: '1 tab PO QD x30d',
    ...oralSig('s7749', 'QD', 'once daily', 'x30d', '30 days'),
    medIds: [DRUG_SERTRALINE.id, DRUG_APIXABAN.id, DRUG_METFORMIN.id],
    interactions: [
      cell(DRUG_SERTRALINE, DRUG_APIXABAN, 2, 'SSRI + anticoagulant — additive bleed risk', 'rapid, 1-3d', 'probable'),
      cell(DRUG_SERTRALINE, DRUG_METFORMIN, 0, 'No interaction on file', '—', '—'),
      cell(DRUG_APIXABAN, DRUG_METFORMIN, 0, 'No interaction on file', '—', '—'),
    ],
    flags: [
      {id: 'f7749-1', kind: 'regulatory', glyph: 'document', label: 'MedGuide required — antidepressant class'},
      {id: 'f7749-2', kind: 'info', glyph: 'document', label: 'May cause drowsiness during first week'},
    ],
    status: 'counsel',
  },
  'rx-7750': {
    id: 'rx-7750',
    rxNumber: 'RX-7750',
    patientId: 'pat-okonkwo',
    drugId: DRUG_LEVOTHYROXINE.id,
    prescriber: 'Dr. Naylor',
    quantityNum: 90,
    quantityDisplay: '90 tabs',
    daysSupplyNum: 90,
    daysSupplyDisplay: '90d',
    waitMin: 6,
    waitDisplay: '6m',
    sigRaw: '1 tab PO QAM x90d',
    ...oralSig('s7750', 'QAM', 'every morning', 'x90d', '90 days'),
    medIds: [DRUG_LEVOTHYROXINE.id, DRUG_WARFARIN.id],
    interactions: [
      cell(DRUG_LEVOTHYROXINE, DRUG_WARFARIN, 2, 'Increased warfarin sensitivity', 'delayed, 1-2wk', 'probable'),
    ],
    flags: [
      {id: 'f7750-1', kind: 'info', glyph: 'document', label: 'Same manufacturer as last fill — no switch counsel'},
    ],
    status: 'ready',
  },
  // Two seeded verified fills, stamped by the OTHER pharmacist (AO) so the
  // initials chips in the Verified tab are not uniform. Wait fields are
  // intentionally undefined — exercises the omit-when-undefined wait chip.
  'rx-7751': {
    id: 'rx-7751',
    rxNumber: 'RX-7751',
    patientId: 'pat-leung',
    drugId: DRUG_METFORMIN.id,
    prescriber: 'Dr. Ferreira',
    quantityNum: 60,
    quantityDisplay: '60 tabs',
    daysSupplyNum: 30,
    daysSupplyDisplay: '30d',
    sigRaw: '1 tab PO BID x30d',
    ...oralSig('s7751', 'BID', 'twice daily', 'x30d', '30 days'),
    medIds: [DRUG_METFORMIN.id, DRUG_LISINOPRIL.id],
    interactions: [
      cell(DRUG_METFORMIN, DRUG_LISINOPRIL, 1, 'ACE inhibitor may enhance hypoglycemic effect', 'delayed, 1-2wk', 'theoretical'),
    ],
    flags: [],
    status: 'verified',
    verifiedBy: RPH_OYELARAN.id,
    stampedBy: RPH_OYELARAN.initials,
  },
  'rx-7752': {
    id: 'rx-7752',
    rxNumber: 'RX-7752',
    patientId: 'pat-brauer',
    drugId: DRUG_LISINOPRIL.id,
    prescriber: 'Dr. Ferreira',
    quantityNum: 30,
    quantityDisplay: '30 tabs',
    daysSupplyNum: 30,
    daysSupplyDisplay: '30d',
    sigRaw: '1 tab PO QD x30d',
    ...oralSig('s7752', 'QD', 'once daily', 'x30d', '30 days'),
    medIds: [DRUG_LISINOPRIL.id, DRUG_METFORMIN.id],
    interactions: [
      cell(DRUG_LISINOPRIL, DRUG_METFORMIN, 1, 'ACE inhibitor may enhance hypoglycemic effect', 'delayed, 1-2wk', 'theoretical'),
    ],
    flags: [],
    status: 'verified',
    verifiedBy: RPH_OYELARAN.id,
    stampedBy: RPH_OYELARAN.initials,
  },
};

// Seeded audit trail — RX-7739/7740 released earlier this shift by AO.
// nextSeq starts after the seeded max (104).
const SEED_AUDIT: AuditEntry[] = [
  {seq: 103, verb: 'VERIFY', detail: 'RX-7740 amlodipine release', initials: 'AO', time: '14:12'},
  {seq: 102, verb: 'ACK', detail: 'RX-7740 MedGuide print', initials: 'AO', time: '14:11'},
  {seq: 101, verb: 'VERIFY', detail: 'RX-7739 rosuvastatin release', initials: 'AO', time: '14:07'},
];

const TAB_LABELS: {id: TabId; label: string}[] = [
  {id: 'ready', label: 'Ready to Verify'},
  {id: 'blocked', label: 'Blocked'},
  {id: 'counsel', label: 'Counsel'},
  {id: 'verified', label: 'Verified'},
];

const OVERRIDE_REASONS: {code: string; description: string}[] = [
  {code: 'MD-CONFIRMED', description: 'Prescriber contacted; combination confirmed as intended'},
  {code: 'THERAPY-MONITORED', description: 'Interaction managed under active lab monitoring (e.g. INR)'},
  {code: 'DUPLICATE-INTENTIONAL', description: 'Documented bridge or intentional duplicate therapy'},
  {code: 'PATIENT-COUNSELED', description: 'Risk counseled at pickup; patient accepts and understands'},
];

// ---------------------------------------------------------------------------
// STYLES — density grid verbatim: header 48, filter row 36, queue rows 40,
// heavy detail rows 44, sig row 64 (84 wrapped), matrix cells 24/20 gap 4,
// flag rows 44, ticker 56/28, aside 420/384/340, GUTTER 12, cell padding 8,
// chips 20, initials 24x24, fonts 13/12/11.
// ---------------------------------------------------------------------------

const GUTTER = 12;
const MONO = 'var(--font-family-code, monospace)';

const styles: Record<string, CSSProperties> = {
  // Footgun: \`Layout height="fill"\` collapses in the demo's auto-height
  // stage — the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},
  // 48px header bar --------------------------------------------------------
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    height: 48,
    padding: \`0 \${GUTTER}px\`,
    overflow: 'hidden',
  },
  wordmark: {fontSize: 14, fontWeight: 600, whiteSpace: 'nowrap'},
  brandBlock: {display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0},
  identityChip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 24,
    padding: '0 8px 0 0',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    whiteSpace: 'nowrap',
  },
  initialsDisc: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    borderRadius: 999,
    backgroundColor: BRAND_SOFT,
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
  },
  // Tab bar (custom thin wrapper — brand underline is the 2nd BRAND consumer)
  tabBar: {display: 'flex', alignItems: 'stretch', gap: 4, height: 48, minWidth: 0, overflow: 'hidden'},
  tabBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    padding: '0 10px',
    border: 'none',
    borderBottom: '2px solid transparent',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontFamily: 'inherit',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  tabBtnActive: {
    color: 'var(--color-text)',
    fontWeight: 600,
    borderBottom: \`2px solid \${BRAND}\`,
  },
  // View root + main column -------------------------------------------------
  viewRoot: {
    display: 'flex',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },
  mainCol: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  // 36px filter row
  filterRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 36,
    padding: \`0 \${GUTTER}px\`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
  },
  filterChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    padding: '0 8px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 11,
    fontFamily: MONO,
    cursor: 'pointer',
    whiteSpace: 'nowrap',
  },
  filterChipActive: {
    borderColor: BRAND,
    backgroundColor: BRAND_SOFT,
    color: 'var(--color-text)',
  },
  searchSlot: {marginInlineStart: 'auto', width: 200, flexShrink: 0},
  // Queue list
  queueScroll: {flex: 1, minHeight: 0, overflowY: 'auto'},
  sectionLabel: {
    position: 'sticky',
    top: 0,
    zIndex: 2,
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 28,
    padding: \`0 \${GUTTER}px\`,
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: 'var(--border-width) solid var(--color-border)',
    fontSize: 11,
    fontFamily: MONO,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
  },
  queueRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 40,
    padding: \`0 \${GUTTER}px\`,
    borderBottom: 'var(--border-width) solid var(--color-border)',
    cursor: 'pointer',
    boxSizing: 'border-box',
  },
  queueRowSelected: {
    boxShadow: 'inset 0 0 0 2px var(--color-accent)',
    backgroundColor: 'var(--color-background-raised, var(--color-background-muted))',
  },
  rxNum: {
    width: 88,
    flexShrink: 0,
    fontFamily: MONO,
    fontSize: 12,
    fontVariantNumeric: 'tabular-nums',
    color: 'var(--color-text-secondary)',
  },
  rowTitle: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    fontSize: 13,
  },
  rowTitleName: {fontWeight: 600},
  rowTitleDrug: {fontSize: 12, color: 'var(--color-text-secondary)'},
  waitChip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 64,
    height: 20,
    flexShrink: 0,
    borderRadius: 999,
    fontFamily: MONO,
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    backgroundColor: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  waitChipHot: {backgroundColor: SEV_AMBER_SOFT, color: SEV_AMBER},
  dotCluster: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    width: 72,
    flexShrink: 0,
    border: 'none',
    background: 'transparent',
    padding: 0,
    cursor: 'pointer',
    height: 20,
  },
  sevDot: {width: 8, height: 8, borderRadius: 999, flexShrink: 0},
  dotCountChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    padding: '0 6px',
    borderRadius: 999,
    fontFamily: MONO,
    fontSize: 11,
    backgroundColor: SEV_RED_SOFT,
    color: SEV_RED,
  },
  initialsChip: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 24,
    height: 24,
    flexShrink: 0,
    borderRadius: 6,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
    color: 'var(--color-text-secondary)',
  },
  chevSlot: {width: 24, flexShrink: 0, display: 'inline-flex', justifyContent: 'center', color: 'var(--color-text-secondary)'},
  // Aside --------------------------------------------------------------------
  aside: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    borderInlineStart: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
  },
  asideScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: GUTTER,
    padding: GUTTER,
  },
  slideOver: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    insetInlineEnd: 0,
    width: 384,
    maxWidth: '92%',
    zIndex: 20,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
    backgroundColor: 'var(--color-background, Canvas)',
    borderInlineStart: 'var(--border-width) solid var(--color-border)',
    boxShadow: 'var(--shadow-overlay, 0 8px 32px rgba(0,0,0,0.24))',
  },
  // 44px patient strip
  patientStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 44,
    padding: '0 8px',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    flexShrink: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  asideSectionTitle: {
    fontSize: 11,
    fontFamily: MONO,
    textTransform: 'uppercase',
    letterSpacing: '0.04em',
    color: 'var(--color-text-secondary)',
  },
  // SigTranslationRow: two 28px lanes inside 64px. The chip lane wraps
  // whenever the four parsed chips exceed the aside width (row grows
  // 64 -> 84px) — chips never squeeze or clip.
  sigRow: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 4,
    minHeight: 64,
    maxHeight: 84,
    padding: '4px 8px',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  sigLaneRaw: {
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    height: 28,
    flexShrink: 0,
    overflow: 'hidden',
  },
  sigLaneChips: {
    display: 'flex',
    alignItems: 'center',
    gap: 4,
    flexWrap: 'wrap',
    minHeight: 28,
    rowGap: 4,
  },
  rawToken: {
    fontFamily: MONO,
    fontSize: 13,
    border: 'none',
    background: 'transparent',
    padding: '2px 1px',
    cursor: 'default',
    color: 'var(--color-text)',
    borderRadius: 2,
  },
  rawTokenHover: {backgroundColor: BRAND_SOFT},
  parseChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    padding: '0 6px',
    borderRadius: 999,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    fontFamily: MONO,
    fontSize: 11,
    cursor: 'default',
    whiteSpace: 'nowrap',
    color: 'var(--color-text)',
  },
  parseChipLow: {borderColor: SEV_RED, color: SEV_RED, cursor: 'pointer'},
  parseChipConfirmed: {borderColor: OK_GREEN, backgroundColor: OK_GREEN_SOFT, color: 'var(--color-text)'},
  parseChipKind: {color: 'var(--color-text-secondary)', fontSize: 10, textTransform: 'uppercase'},
  // Matrix
  matrixWrap: {display: 'flex', flexDirection: 'column', gap: 6, flexShrink: 0},
  matrixGrid: {display: 'grid', width: 'max-content'},
  matrixHeadCell: {
    display: 'flex',
    alignItems: 'center',
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  matrixCellBase: {
    position: 'relative',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 4,
    background: 'transparent',
    padding: 0,
    boxSizing: 'border-box',
  },
  medDot: {width: 6, height: 6, borderRadius: 999, backgroundColor: 'var(--color-text-secondary)'},
  cellInitials: {
    position: 'absolute',
    insetBlockEnd: 0,
    insetInlineEnd: 1,
    fontFamily: MONO,
    fontSize: 11,
    lineHeight: 1,
    fontWeight: 700,
    color: 'light-dark(#FFFFFF, #1A1A1A)',
  },
  popoverTable: {display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '2px 8px', fontSize: 12},
  popoverKey: {color: 'var(--color-text-secondary)', fontFamily: MONO, fontSize: 11},
  // Counsel flag rows 44px
  flagRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 44,
    padding: '0 8px',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) solid var(--color-border)',
    boxSizing: 'border-box',
    flexShrink: 0,
    overflow: 'hidden',
  },
  flagIconSlot: {
    width: 24,
    flexShrink: 0,
    display: 'inline-flex',
    justifyContent: 'center',
    color: 'var(--color-text-secondary)',
  },
  flagLabel: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  kindBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    padding: '0 6px',
    borderRadius: 4,
    fontFamily: MONO,
    fontSize: 11,
    flexShrink: 0,
  },
  kindBadgeReg: {border: \`1px solid \${SEV_RED}\`, color: SEV_RED},
  kindBadgeInfo: {border: \`1px solid \${SEV_SLATE}\`, color: 'var(--color-text-secondary)'},
  keycapHint: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    height: 20,
    minWidth: 20,
    borderRadius: 4,
    border: 'var(--border-width) solid var(--color-border)',
    backgroundColor: 'var(--color-background-muted)',
    fontFamily: MONO,
    fontSize: 11,
    flexShrink: 0,
  },
  stampChip: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 20,
    padding: '0 6px',
    borderRadius: 999,
    backgroundColor: OK_GREEN_SOFT,
    color: 'var(--color-text)',
    fontFamily: MONO,
    fontSize: 11,
    flexShrink: 0,
    whiteSpace: 'nowrap',
  },
  quietRow: {
    display: 'flex',
    alignItems: 'center',
    height: 44,
    padding: '0 8px',
    borderRadius: 'var(--radius-container)',
    border: 'var(--border-width) dashed var(--color-border)',
    color: 'var(--color-text-secondary)',
    fontSize: 12,
    boxSizing: 'border-box',
  },
  // Override reason panel
  overridePanel: {
    display: 'flex',
    flexDirection: 'column',
    gap: 8,
    padding: 8,
    borderRadius: 'var(--radius-container)',
    border: \`1px solid \${SEV_RED}\`,
    backgroundColor: SEV_RED_SOFT,
    flexShrink: 0,
  },
  // 44px verify action bar pinned to the aside's bottom
  verifyBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 44,
    padding: \`0 \${GUTTER}px\`,
    borderTop: 'var(--border-width) solid var(--color-border)',
    flexShrink: 0,
    boxSizing: 'border-box',
  },
  // Audit ticker footer
  ticker: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    borderTop: 'var(--border-width) solid var(--color-border)',
    padding: \`0 \${GUTTER}px\`,
    flexShrink: 0,
    boxSizing: 'border-box',
    overflow: 'hidden',
  },
  tickerToggle: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 28,
    height: 28,
    flexShrink: 0,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 6,
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
    padding: 0,
  },
  tickerList: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    minWidth: 0,
    overflowX: 'auto',
    overflowY: 'hidden',
  },
  tickerPill: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    height: 36,
    padding: '0 8px',
    borderRadius: 8,
    border: 'var(--border-width) solid var(--color-border)',
    background: 'transparent',
    cursor: 'pointer',
    flexShrink: 0,
    fontSize: 12,
    color: 'var(--color-text)',
    whiteSpace: 'nowrap',
  },
  tickerSeq: {fontFamily: MONO, fontSize: 11, color: 'var(--color-text-secondary)'},
  verbChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 20,
    padding: '0 6px',
    borderRadius: 4,
    fontFamily: MONO,
    fontSize: 11,
    fontWeight: 700,
  },
  cornerStat: {
    display: 'flex',
    alignItems: 'center',
    gap: GUTTER,
    flexShrink: 0,
    whiteSpace: 'nowrap',
    fontSize: 12,
    color: 'var(--color-text-secondary)',
  },
  // Keystroke chars render as DS Kbd chips (the workforce-approvals idiom)
  // so keys read as keycaps, separated from their lowercase labels.
  keycapLegend: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    fontFamily: MONO,
    fontSize: 11,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
  },
  emptyState: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: GUTTER,
    padding: '48px 16px',
    color: 'var(--color-text-secondary)',
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
};

// ---------------------------------------------------------------------------
// useElementWidth — container-width breakpoints. The demo stage renders in a
// ~1045–1075px container inside a 1440px window, so viewport queries never
// fire there; measure the view root instead. Width 0 = first pre-observer
// frame; callers fall back to viewport queries for that frame only.
// ---------------------------------------------------------------------------

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
        setWidth(Math.round(rect.width));
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// ---------------------------------------------------------------------------
// PestleMark — fully-custom inline SVG, the ONE brand-hex consumer (fill).
// Rounded-square mortar bowl; the pestle's two round-cap strokes read as a
// diagonal pestle whose negative space forms a checkmark.
// ---------------------------------------------------------------------------

function PestleMark({size = 28, variant = 'brand'}: {size?: number; variant?: 'brand' | 'outline'}) {
  const isOutline = variant === 'outline';
  return (
    <svg width={size} height={size} viewBox="0 0 28 28" aria-hidden focusable="false">
      <rect
        x={2}
        y={2}
        width={24}
        height={24}
        rx={8}
        fill={isOutline ? 'none' : BRAND}
        stroke={isOutline ? 'var(--color-border)' : 'none'}
        strokeWidth={isOutline ? 2 : 0}
      />
      <path
        d="M8 17 L12.5 21.5 L21 8"
        fill="none"
        stroke={isOutline ? 'var(--color-border)' : 'var(--color-background, Canvas)'}
        strokeWidth={4}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// QueueTabBar — role=tablist wrapper; counts are COMPUTED by the parent from
// fills (never stored). Active underline is the brand teal (2nd and last
// BRAND consumer).
// ---------------------------------------------------------------------------

interface QueueTabBarProps {
  tabs: {id: TabId; label: string; count: number}[];
  activeId: TabId;
  onSelect: (id: TabId) => void;
}

function QueueTabBar({tabs, activeId, onSelect}: QueueTabBarProps) {
  return (
    <div role="tablist" aria-label="Fill queues" style={styles.tabBar}>
      {tabs.map(tab => {
        const isActive = tab.id === activeId;
        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={\`pvq-queue-\${tab.id}\`}
            className="pvq-focusable"
            style={isActive ? {...styles.tabBtn, ...styles.tabBtnActive} : styles.tabBtn}
            onClick={() => onSelect(tab.id)}>
            {tab.label}
            <Badge label={String(tab.count)} variant={isActive ? 'teal' : 'neutral'} />
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// RxQueueRow — 40px dense composite row. Columns: 88px mono Rx number | flex
// patient · drug (ellipsis, title attr) | 64px wait chip (amber >= 20m;
// omitted when waitMin undefined; dropped below 1200px container — the
// waitDisplay moves into the title attr) | 72px severity dot cluster (one
// 8px dot per unresolved severity>=2 interaction; count chip at the
// 900–1023 band; omitted at zero) | 24x24 initials chip (only after
// override/verify) | 24px chevron. Row is a role=option div with roving
// tabindex — inner dot cluster stays a real <button> (no nested buttons).
// ---------------------------------------------------------------------------

interface RxQueueRowProps {
  fill: Fill;
  selected: boolean;
  band: Band;
  onSelect: (id: string) => void;
  onDotsClick: (id: string) => void;
  rowRef: (id: string, el: HTMLDivElement | null) => void;
  onRowKeyDown: (event: ReactKeyboardEvent<HTMLDivElement>, id: string) => void;
}

function RxQueueRow({fill, selected, band, onSelect, onDotsClick, rowRef, onRowKeyDown}: RxQueueRowProps) {
  const patient = PATIENTS[fill.patientId];
  const drug = DRUGS[fill.drugId];
  const unresolved = fill.interactions.filter(c => c.severity >= 2 && c.status === 'active');
  const showWaitChip = band === 'wide' && fill.waitDisplay != null;
  const title = \`\${patient.name} · \${drug.name}\${
    !showWaitChip && fill.waitDisplay != null ? \` · waiting \${fill.waitDisplay}\` : ''
  }\`;
  return (
    <div
      ref={el => rowRef(fill.id, el)}
      role="option"
      aria-selected={selected}
      tabIndex={selected ? 0 : -1}
      className="pvq-row"
      style={selected ? {...styles.queueRow, ...styles.queueRowSelected} : styles.queueRow}
      title={title}
      onClick={() => onSelect(fill.id)}
      onKeyDown={event => onRowKeyDown(event, fill.id)}>
      <span style={styles.rxNum}>{fill.rxNumber}</span>
      <span style={styles.rowTitle}>
        <span style={styles.rowTitleName}>{patient.name}</span>
        <span style={styles.rowTitleDrug}> · {drug.name}</span>
      </span>
      {showWaitChip ? (
        <span
          style={
            fill.waitMin != null && fill.waitMin >= 20
              ? {...styles.waitChip, ...styles.waitChipHot}
              : styles.waitChip
          }>
          {fill.waitDisplay}
        </span>
      ) : null}
      {unresolved.length > 0 ? (
        <button
          type="button"
          className="pvq-focusable"
          style={styles.dotCluster}
          aria-label={\`\${unresolved.length} unresolved interactions — open matrix\`}
          onClick={event => {
            event.stopPropagation();
            onDotsClick(fill.id);
          }}>
          {band === 'narrow' || band === 'compact' ? (
            <span style={styles.dotCountChip}>x{unresolved.length}</span>
          ) : (
            unresolved.map((c, i) => (
              <span
                key={\`\${c.aId}-\${c.bId}-\${i}\`}
                style={{...styles.sevDot, backgroundColor: c.severity === 3 ? SEV_RED : SEV_AMBER}}
              />
            ))
          )}
        </button>
      ) : null}
      {fill.stampedBy != null ? (
        <span style={styles.initialsChip} title={\`Actioned by \${fill.stampedBy}\`}>
          {fill.stampedBy}
        </span>
      ) : null}
      <span style={styles.chevSlot} aria-hidden>
        <Icon icon={ChevronRightIcon} size="sm" color="inherit" />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SigTranslationRow — 64px two-lane composite (84px wrapped band). Top lane:
// raw prescriber tokens in 13px mono with 2px confidence underlines
// (>=0.95 none; 0.80–0.94 dotted amber; <0.80 solid red — those are click
// targets that focus the paired chip). Bottom lane: parsed 20px chips; hover
// or focus on either side highlights its counterpart via the owner-lifted
// hoveredTokenId. '?' chips are the confirm-before-verify affordance.
// ---------------------------------------------------------------------------

interface SigTranslationRowProps {
  rawTokens: RawToken[];
  parsed: ParsedChip[];
  hoveredTokenId: string | null;
  wrapped: boolean;
  onTokenHover: (id: string | null) => void;
  onChipConfirm: (id: string) => void;
}

const underlineFor = (confidence: number): CSSProperties => {
  if (confidence >= 0.95) {
    return {};
  }
  if (confidence >= 0.8) {
    return {borderBottom: \`2px dotted \${SEV_AMBER}\`};
  }
  return {borderBottom: \`2px solid \${SEV_RED}\`};
};

function SigTranslationRow({
  rawTokens,
  parsed,
  hoveredTokenId,
  wrapped,
  onTokenHover,
  onChipConfirm,
}: SigTranslationRowProps) {
  const chipByToken = useMemo(() => {
    const map = new Map<string, ParsedChip>();
    for (const chip of parsed) {
      map.set(chip.tokenId, chip);
    }
    return map;
  }, [parsed]);
  // \`wrapped\` (compact band) only relaxes the max height cap — the chip
  // lane itself wraps at any band where four chips exceed the aside width.
  return (
    <div
      style={wrapped ? {...styles.sigRow, maxHeight: 'none'} : styles.sigRow}
      role="group"
      aria-label="Sig translation">
      <div style={styles.sigLaneRaw}>
        {rawTokens.map(token => {
          const pairedChip = chipByToken.get(token.id);
          const isLow = token.confidence < 0.8;
          return (
            <button
              key={token.id}
              type="button"
              className="pvq-focusable"
              style={{
                ...styles.rawToken,
                ...underlineFor(token.confidence),
                ...(hoveredTokenId === token.id ? styles.rawTokenHover : null),
                ...(isLow ? {cursor: 'pointer'} : null),
              }}
              title={\`Parser confidence \${Math.round(token.confidence * 100)}%\${
                isLow ? ' — click to review the parsed chip' : ''
              }\`}
              onMouseEnter={() => onTokenHover(token.id)}
              onMouseLeave={() => onTokenHover(null)}
              onFocus={() => onTokenHover(token.id)}
              onBlur={() => onTokenHover(null)}
              onClick={() => {
                // Low-confidence underlines deep-link to their paired chip.
                if (isLow && pairedChip != null) {
                  document
                    .querySelector<HTMLButtonElement>(\`[data-pvq-chip="\${pairedChip.id}"]\`)
                    ?.focus();
                }
              }}>
              {token.text}
            </button>
          );
        })}
      </div>
      <div style={styles.sigLaneChips}>
        {parsed.map(chip => {
          const token = rawTokens.find(t => t.id === chip.tokenId);
          const isLow = token != null && token.confidence < 0.8;
          const needsConfirm = isLow && chip.confirmed !== true;
          return (
            <button
              key={chip.id}
              type="button"
              data-pvq-chip={chip.id}
              className="pvq-focusable pvq-chipbtn"
              style={{
                ...styles.parseChip,
                ...(needsConfirm ? styles.parseChipLow : null),
                ...(isLow && chip.confirmed === true ? styles.parseChipConfirmed : null),
                ...(hoveredTokenId === chip.tokenId ? styles.rawTokenHover : null),
              }}
              aria-label={\`\${chip.kind} \${chip.label}\${
                needsConfirm ? ' — low-confidence parse, press Enter to confirm' : ''
              }\`}
              title={needsConfirm ? 'Low-confidence parse — click to confirm against the raw sig' : undefined}
              onMouseEnter={() => onTokenHover(chip.tokenId)}
              onMouseLeave={() => onTokenHover(null)}
              onFocus={() => onTokenHover(chip.tokenId)}
              onBlur={() => onTokenHover(null)}
              onClick={() => {
                if (needsConfirm) {
                  onChipConfirm(chip.id);
                }
              }}>
              <span style={styles.parseChipKind}>{chip.kind}</span>
              {chip.label}
              {needsConfirm ? ' ?' : null}
              {isLow && chip.confirmed === true ? <Icon icon={CheckIcon} size="xsm" color="inherit" /> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// InteractionSeverityMatrix — upper-triangle NxN glyph grid. Cells 24px
// (20px below 1024px container) with 4px gap; 64px row headers; column
// headers run vertical (writing-mode) so 'trim/sulf' survives a 20px
// column — the title attr carries the full 47-char drug name. Severity
// fill: 0 transparent, 1 slate, 2 amber, 3 red; overridden = red base +
// 45deg 4px surface hatching + the overriding pharmacist's initials.
// Severity-3 cells set pendingOverride on click/Enter; every cell carries
// a DS Popover (hover AND focus) with the Mechanism/Onset/Documentation
// meta table. RX-7744's 7x7 (21 upper-triangle cells, two severity-3)
// must fit the 340px aside at 20px cells: 64 + 7*20 + 6*4 = 228px. A
// single-med list (RX-7745) collapses to the lone diagonal med dot.
// ---------------------------------------------------------------------------

const severityFill = (severity: Severity): string | undefined => {
  if (severity === 1) {
    return SEV_SLATE;
  }
  if (severity === 2) {
    return SEV_AMBER;
  }
  if (severity === 3) {
    return SEV_RED;
  }
  return undefined;
};

interface MatrixCellProps {
  cellData: InteractionCell;
  aDrug: Drug;
  bDrug: Drug;
  cellSize: number;
  isSelectedPair: boolean;
  onCellSelect: (aId: string, bId: string) => void;
}

function MatrixCell({cellData, aDrug, bDrug, cellSize, isSelectedPair, onCellSelect}: MatrixCellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const isSev3 = cellData.severity === 3;
  const isOverridden = cellData.status === 'overridden';
  const fillColor = severityFill(cellData.severity);
  const ariaLabel = \`\${aDrug.name.split(' ')[0]} x \${bDrug.name.split(' ')[0]}, severity \${cellData.severity}, \${
    cellData.status
  }\${isSev3 && !isOverridden ? ' — press Enter to review override' : ''}\`;
  const cellStyle: CSSProperties = {
    ...styles.matrixCellBase,
    width: cellSize,
    height: cellSize,
    backgroundColor: fillColor,
    borderColor: fillColor ?? 'var(--color-border)',
    cursor: isSev3 && !isOverridden ? 'pointer' : 'default',
    ...(isOverridden
      ? {
          // Static hatching — never animated (prefers-reduced-motion holds
          // by construction; there is no shimmer to suppress).
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent 0 2px, var(--color-background, Canvas) 2px 4px)',
        }
      : null),
    ...(isSelectedPair ? {outline: '2px solid var(--color-accent)', outlineOffset: 1} : null),
  };
  return (
    <Popover
      isOpen={isOpen}
      onOpenChange={setIsOpen}
      label={\`\${aDrug.abbrev} x \${bDrug.abbrev} interaction detail\`}
      placement="below"
      width={260}
      content={
        <VStack gap={2} style={{padding: 8}}>
          <Text type="label" size="sm">
            {aDrug.abbrev} × {bDrug.abbrev} — severity {cellData.severity}
            {isOverridden ? \` · overridden by \${cellData.overriddenBy}\` : ''}
          </Text>
          <div style={styles.popoverTable}>
            <span style={styles.popoverKey}>Mechanism</span>
            <span>{cellData.mechanism}</span>
            <span style={styles.popoverKey}>Onset</span>
            <span>{cellData.onset}</span>
            <span style={styles.popoverKey}>Documentation</span>
            <span>{cellData.doc}</span>
            {isOverridden && cellData.reasonCode != null ? (
              <>
                <span style={styles.popoverKey}>Reason</span>
                <span>{cellData.reasonCode}</span>
              </>
            ) : null}
          </div>
        </VStack>
      }>
      <button
        type="button"
        role="gridcell"
        aria-label={ariaLabel}
        data-pvq-cell={\`\${cellData.aId}:\${cellData.bId}\`}
        className="pvq-focusable pvq-cell"
        style={cellStyle}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        onFocus={() => setIsOpen(true)}
        onBlur={() => setIsOpen(false)}
        onClick={() => {
          if (isSev3 && !isOverridden) {
            onCellSelect(cellData.aId, cellData.bId);
          }
        }}>
        {isOverridden ? <span style={styles.cellInitials}>{cellData.overriddenBy}</span> : null}
      </button>
    </Popover>
  );
}

interface InteractionSeverityMatrixProps {
  meds: Drug[];
  cells: InteractionCell[];
  selectedPair: {aId: string; bId: string} | null;
  cellSize: number;
  onCellSelect: (aId: string, bId: string) => void;
}

function InteractionSeverityMatrix({
  meds,
  cells,
  selectedPair,
  cellSize,
  onCellSelect,
}: InteractionSeverityMatrixProps) {
  const cellByPair = useMemo(() => {
    const map = new Map<string, InteractionCell>();
    for (const c of cells) {
      map.set(\`\${c.aId}:\${c.bId}\`, c);
      map.set(\`\${c.bId}:\${c.aId}\`, c);
    }
    return map;
  }, [cells]);
  const gap = 4;
  return (
    <div style={styles.matrixWrap}>
      <span style={styles.asideSectionTitle}>Drug utilization review — {meds.length} active meds</span>
      <div
        role="grid"
        aria-label="Interaction severity matrix"
        style={{
          ...styles.matrixGrid,
          gridTemplateColumns: \`64px repeat(\${meds.length}, \${cellSize}px)\`,
          gap,
        }}>
        <div role="row" style={{display: 'contents'}}>
          <span aria-hidden />
          {meds.map(med => (
            <span
              key={\`col-\${med.id}\`}
              role="columnheader"
              title={med.name}
              style={{
                ...styles.matrixHeadCell,
                // 64px: the longest abbrev ('trim/sulf', 9 glyphs of 11px
                // mono ≈ 60px) must render unclipped in the rotated box.
                height: 64,
                writingMode: 'vertical-rl',
                transform: 'rotate(180deg)',
                justifyContent: 'flex-end',
              }}>
              {med.abbrev}
            </span>
          ))}
        </div>
        {meds.map((rowMed, i) => (
          <div key={\`row-\${rowMed.id}\`} role="row" style={{display: 'contents'}}>
            <span role="rowheader" title={rowMed.name} style={{...styles.matrixHeadCell, width: 64, height: cellSize}}>
              {rowMed.abbrev}
            </span>
            {meds.map((colMed, j) => {
              if (j < i) {
                // Lower triangle stays empty — the upper triangle owns the pair.
                return <span key={\`\${rowMed.id}-\${colMed.id}\`} aria-hidden />;
              }
              if (j === i) {
                return (
                  <span
                    key={\`\${rowMed.id}-\${colMed.id}\`}
                    role="gridcell"
                    aria-label={\`\${rowMed.abbrev} — active medication\`}
                    style={{
                      ...styles.matrixCellBase,
                      width: cellSize,
                      height: cellSize,
                      borderStyle: 'dashed',
                    }}>
                    <span style={styles.medDot} />
                  </span>
                );
              }
              const cellData = cellByPair.get(\`\${rowMed.id}:\${colMed.id}\`);
              if (cellData == null) {
                return (
                  <span
                    key={\`\${rowMed.id}-\${colMed.id}\`}
                    role="gridcell"
                    aria-label={\`\${rowMed.abbrev} x \${colMed.abbrev}, no data\`}
                    style={{...styles.matrixCellBase, width: cellSize, height: cellSize}}
                  />
                );
              }
              const isSelectedPair =
                selectedPair != null &&
                ((selectedPair.aId === cellData.aId && selectedPair.bId === cellData.bId) ||
                  (selectedPair.aId === cellData.bId && selectedPair.bId === cellData.aId));
              return (
                <MatrixCell
                  key={\`\${rowMed.id}-\${colMed.id}\`}
                  cellData={cellData}
                  aDrug={rowMed}
                  bDrug={colMed}
                  cellSize={cellSize}
                  isSelectedPair={isSelectedPair}
                  onCellSelect={onCellSelect}
                />
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CounselFlagStack — 44px flag rows. 24px icon slot (inline 16px SVG
// glyphs: shake / snowflake / document), 13px label, 20px kind badge
// (REGULATORY red-outline / INFO slate). Right slot: unacked regulatory
// flags show an 'A' keycap hint when focused (duplicated as a real Ack
// button for pointer users); acked flags show the immutable '✓ JT · #seq'
// stamp. INFO flags get a quiet dismiss; regulatory flags can only be
// acknowledged. Up/Down roves, 'A' acks the focused regulatory flag.
// RX-7743 has zero flags — the quiet empty row below.
// ---------------------------------------------------------------------------

function FlagGlyph({glyph}: {glyph: CounselFlag['glyph']}) {
  if (glyph === 'shake') {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden focusable="false">
        <rect x={6} y={4} width={4} height={9} rx={1.5} fill="none" stroke="currentColor" strokeWidth={1.4} />
        <path d="M7 2.5h2" stroke="currentColor" strokeWidth={1.4} strokeLinecap="round" />
        <path d="M2.5 6.5c1-.8 1-2.2 0-3M2.5 12.5c1-.8 1-2.2 0-3" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
        <path d="M13.5 6.5c-1-.8-1-2.2 0-3M13.5 12.5c-1-.8-1-2.2 0-3" fill="none" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
      </svg>
    );
  }
  if (glyph === 'snowflake') {
    return (
      <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden focusable="false">
        <path
          d="M8 1.5v13M2.4 4.75l11.2 6.5M2.4 11.25l11.2-6.5"
          stroke="currentColor"
          strokeWidth={1.3}
          strokeLinecap="round"
        />
        <path d="M6 3l2 1.6L10 3M6 13l2-1.6 2 1.6" fill="none" stroke="currentColor" strokeWidth={1.1} strokeLinecap="round" />
      </svg>
    );
  }
  return (
    <svg width={16} height={16} viewBox="0 0 16 16" aria-hidden focusable="false">
      <path d="M4 1.5h5.5L12 4v10.5H4z" fill="none" stroke="currentColor" strokeWidth={1.3} strokeLinejoin="round" />
      <path d="M6 7h4M6 9.5h4M6 12h2.5" stroke="currentColor" strokeWidth={1.2} strokeLinecap="round" />
    </svg>
  );
}

interface CounselFlagStackProps {
  flags: CounselFlag[];
  focusedFlagId: string | null;
  onFocusFlag: (id: string | null) => void;
  onAck: (id: string) => void;
  onDismiss: (id: string) => void;
}

function CounselFlagStack({flags, focusedFlagId, onFocusFlag, onAck, onDismiss}: CounselFlagStackProps) {
  const visible = flags.filter(f => f.dismissed !== true);
  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  if (visible.length === 0) {
    return (
      <VStack gap={1}>
        <span style={styles.asideSectionTitle}>Counseling flags</span>
        <div style={styles.quietRow}>No flags parsed for this fill</div>
      </VStack>
    );
  }
  const rove = (fromId: string, delta: 1 | -1) => {
    const index = visible.findIndex(f => f.id === fromId);
    const next = visible[index + delta];
    if (next != null) {
      rowRefs.current.get(next.id)?.focus();
    }
  };
  return (
    <div role="group" aria-label="Counseling flags" style={{display: 'flex', flexDirection: 'column', gap: 6}}>
      <span style={styles.asideSectionTitle}>Counseling flags</span>
      {visible.map(flag => {
        const isFocused = focusedFlagId === flag.id;
        const isRegulatory = flag.kind === 'regulatory';
        return (
          <div
            key={flag.id}
            ref={el => {
              if (el != null) {
                rowRefs.current.set(flag.id, el);
              } else {
                rowRefs.current.delete(flag.id);
              }
            }}
            tabIndex={0}
            className="pvq-focusable"
            style={styles.flagRow}
            onFocus={() => onFocusFlag(flag.id)}
            onBlur={() => onFocusFlag(null)}
            onKeyDown={event => {
              if (event.key === 'ArrowDown') {
                event.preventDefault();
                rove(flag.id, 1);
              } else if (event.key === 'ArrowUp') {
                event.preventDefault();
                rove(flag.id, -1);
              } else if ((event.key === 'a' || event.key === 'A') && isRegulatory && flag.ackedBy == null) {
                event.preventDefault();
                onAck(flag.id);
              }
            }}>
            <span style={styles.flagIconSlot}>
              <FlagGlyph glyph={flag.glyph} />
            </span>
            <span style={styles.flagLabel} title={flag.label}>
              {flag.label}
            </span>
            <span style={isRegulatory ? {...styles.kindBadge, ...styles.kindBadgeReg} : {...styles.kindBadge, ...styles.kindBadgeInfo}}>
              {isRegulatory ? 'REGULATORY' : 'INFO'}
            </span>
            {isRegulatory ? (
              flag.ackedBy != null ? (
                <span style={styles.stampChip} title={\`Acknowledged — audit #\${flag.ackedBy.seq}\`}>
                  ✓ {flag.ackedBy.initials} · #{flag.ackedBy.seq}
                </span>
              ) : isFocused ? (
                <span style={styles.keycapHint} aria-hidden>
                  A
                </span>
              ) : (
                <Button label="Ack" variant="ghost" size="sm" onClick={() => onAck(flag.id)} />
              )
            ) : (
              <Button label="Dismiss" variant="ghost" size="sm" onClick={() => onDismiss(flag.id)} />
            )}
          </div>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// OverrideReasonPanel — thin wrapper over DS RadioList + Button; appears in
// the aside only while pendingOverride != null. Confirm stays disabled
// until a reason code is picked; the button's aria-describedby points at
// the picked reason's description.
// ---------------------------------------------------------------------------

interface OverrideReasonPanelProps {
  pairLabel: string;
  reasonCode: string | null;
  onPickReason: (code: string) => void;
  onConfirm: () => void;
  onCancel: () => void;
  panelRef: RefObject<HTMLDivElement | null>;
}

function OverrideReasonPanel({
  pairLabel,
  reasonCode,
  onPickReason,
  onConfirm,
  onCancel,
  panelRef,
}: OverrideReasonPanelProps) {
  const picked = OVERRIDE_REASONS.find(r => r.code === reasonCode);
  return (
    <div ref={panelRef} style={styles.overridePanel} role="group" aria-label="Override reason">
      <Text type="label" size="sm">
        Override severity-3 · {pairLabel}
      </Text>
      <RadioList
        label="Reason code"
        isLabelHidden
        value={reasonCode ?? ''}
        onChange={value => onPickReason(value)}>
        {OVERRIDE_REASONS.map(reason => (
          <RadioListItem key={reason.code} value={reason.code} label={reason.code} description={reason.description} />
        ))}
      </RadioList>
      <span id="pvq-override-reason-desc" style={styles.srOnly}>
        {picked != null ? \`\${picked.code}: \${picked.description}\` : 'Pick a reason code to enable the override'}
      </span>
      <HStack gap={2} vAlign="center">
        <Button
          label="Override severity-3 · stamps audit"
          variant="destructive"
          size="sm"
          isDisabled={reasonCode == null}
          aria-describedby="pvq-override-reason-desc"
          onClick={onConfirm}
        />
        <Button label="Cancel" variant="ghost" size="sm" onClick={onCancel} />
      </HStack>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AuditTicker — 56px footer (28px collapsed), horizontally scrollable
// append-only entries newest-first-left. role=log + aria-live=polite so
// override/ack/verify entries announce without focus steal; entries are
// never edited or removed. Pills click-select their Rx row. Bottom-left
// corner: collapse toggle + entry count. Bottom-right corner: computed
// throughput stat + the keycap legend. No slide-in animation — static by
// construction, so prefers-reduced-motion needs nothing to suppress.
// ---------------------------------------------------------------------------

const VERB_COLOR: Record<AuditEntry['verb'], {color: string; soft: string}> = {
  OVERRIDE: {color: SEV_RED, soft: SEV_RED_SOFT},
  ACK: {color: 'var(--color-text-secondary)', soft: 'var(--color-background-muted)'},
  VERIFY: {color: OK_GREEN, soft: OK_GREEN_SOFT},
};

interface AuditTickerProps {
  entries: AuditEntry[];
  collapsed: boolean;
  throughputLabel: string;
  onToggle: () => void;
  onEntryClick: (detail: string) => void;
}

function AuditTicker({entries, collapsed, throughputLabel, onToggle, onEntryClick}: AuditTickerProps) {
  return (
    <div style={{...styles.ticker, height: collapsed ? 28 : 56}}>
      <button
        type="button"
        className="pvq-focusable"
        style={styles.tickerToggle}
        aria-expanded={!collapsed}
        aria-label={collapsed ? 'Expand audit ticker' : 'Collapse audit ticker'}
        onClick={onToggle}>
        <Icon icon={collapsed ? ChevronUpIcon : ChevronDownIcon} size="sm" color="inherit" />
      </button>
      <HStack gap={1} vAlign="center" style={{flexShrink: 0}}>
        <Text type="supporting" size="xsm" color="secondary">
          Audit
        </Text>
        <Badge label={String(entries.length)} variant="neutral" />
      </HStack>
      {collapsed ? (
        <Text type="supporting" size="xsm" color="secondary" style={{whiteSpace: 'nowrap'}}>
          Audit · {entries.length} entries
        </Text>
      ) : (
        <div role="log" aria-live="polite" aria-label="Audit trail" className="pvq-ticker" style={styles.tickerList}>
          {entries.map(entry => {
            const verbMeta = VERB_COLOR[entry.verb];
            return (
              <button
                key={entry.seq}
                type="button"
                className="pvq-focusable"
                style={styles.tickerPill}
                title="Select this fill in the queue"
                onClick={() => onEntryClick(entry.detail)}>
                <span style={styles.tickerSeq}>#{entry.seq}</span>
                <span style={{...styles.verbChip, color: verbMeta.color, backgroundColor: verbMeta.soft}}>
                  {entry.verb}
                </span>
                <span>{entry.detail}</span>
                <span style={styles.tickerSeq}>{entry.initials}</span>
                <span style={styles.tickerSeq}>{entry.time}</span>
              </button>
            );
          })}
        </div>
      )}
      {/* Spacer only while collapsed — expanded, the ticker list owns the
          free width (flex:1 + its own overflow-x scroll), so no sibling may
          compete for it or the newest pill gets flat-cut mid-glyph. */}
      {collapsed ? <span style={{flex: 1}} aria-hidden /> : null}
      <div style={styles.cornerStat}>
        <span style={{fontVariantNumeric: 'tabular-nums'}}>{throughputLabel}</span>
        <span style={styles.keycapLegend}>
          <Kbd keys="a" />
          <span>ack</span>
          <span aria-hidden>·</span>
          <Kbd keys="o" />
          <span>override</span>
          <span aria-hidden>·</span>
          <Kbd keys="v" />
          <span>verify</span>
        </span>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// VERIFICATION ASIDE — patient strip (44px) > SigTranslationRow (64px) >
// InteractionSeverityMatrix > CounselFlagStack > OverrideReasonPanel (only
// while pendingOverride) > 44px Verify action bar pinned to the bottom.
// Purely presentational; every mutation flows through the owner.
// ---------------------------------------------------------------------------

interface VerifyGate {
  regOk: boolean;
  sigOk: boolean;
  sev3Ok: boolean;
}

const gateFor = (fill: Fill): VerifyGate => ({
  regOk: fill.flags.every(f => f.kind !== 'regulatory' || f.ackedBy != null),
  sigOk: fill.parsed.every(chip => {
    const token = fill.rawTokens.find(t => t.id === chip.tokenId);
    return token == null || token.confidence >= 0.8 || chip.confirmed === true;
  }),
  sev3Ok: fill.interactions.every(c => c.severity !== 3 || c.status === 'overridden'),
});

interface VerificationAsideProps {
  fill: Fill;
  band: Band;
  hoveredTokenId: string | null;
  focusedFlagId: string | null;
  pendingPair: {aId: string; bId: string} | null;
  reasonCode: string | null;
  overridePanelRef: RefObject<HTMLDivElement | null>;
  onTokenHover: (id: string | null) => void;
  onChipConfirm: (chipId: string) => void;
  onCellSelect: (aId: string, bId: string) => void;
  onFocusFlag: (id: string | null) => void;
  onAck: (flagId: string) => void;
  onDismiss: (flagId: string) => void;
  onPickReason: (code: string) => void;
  onConfirmOverride: () => void;
  onCancelOverride: () => void;
  onVerify: () => void;
  onClose?: () => void;
}

function VerificationAside({
  fill,
  band,
  hoveredTokenId,
  focusedFlagId,
  pendingPair,
  reasonCode,
  overridePanelRef,
  onTokenHover,
  onChipConfirm,
  onCellSelect,
  onFocusFlag,
  onAck,
  onDismiss,
  onPickReason,
  onConfirmOverride,
  onCancelOverride,
  onVerify,
  onClose,
}: VerificationAsideProps) {
  const patient = PATIENTS[fill.patientId];
  const drug = DRUGS[fill.drugId];
  const meds = fill.medIds.map(id => DRUGS[id]);
  const cellSize = band === 'wide' || band === 'stage' ? 24 : 20;
  const gate = gateFor(fill);
  const isVerified = fill.status === 'verified';
  const canVerify = !isVerified && gate.regOk && gate.sigOk && gate.sev3Ok;
  const gateHint = isVerified
    ? \`Verified by \${fill.verifiedBy === RPH_OYELARAN.id ? RPH_OYELARAN.name : RPH_TAN.name}\`
    : !gate.sev3Ok
      ? 'Severity-3 interactions unresolved'
      : !gate.sigOk
        ? 'Confirm low-confidence sig chips'
        : !gate.regOk
          ? 'Regulatory flags need ack (A)'
          : 'All checks clear';
  const pendingLabel =
    pendingPair != null
      ? \`\${DRUGS[pendingPair.aId].name.split(' ')[0]} x \${DRUGS[pendingPair.bId].name.split(' ')[0]}\`
      : '';
  return (
    <>
      <div style={styles.asideScroll}>
        <div style={styles.patientStrip}>
          <StackItem size="fill">
            <VStack gap={0}>
              <Text type="label" size="sm" maxLines={1} style={{fontSize: 13}}>
                {patient.name}
              </Text>
              <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers maxLines={1}>
                DOB {patient.dob} · {fill.rxNumber} · {fill.quantityDisplay} · {fill.daysSupplyDisplay} ·{' '}
                {fill.prescriber}
              </Text>
            </VStack>
          </StackItem>
          {onClose != null ? (
            <button
              type="button"
              className="pvq-focusable"
              style={styles.tickerToggle}
              aria-label="Close fill detail"
              onClick={onClose}>
              <Icon icon={XIcon} size="sm" color="inherit" />
            </button>
          ) : null}
        </div>
        <VStack gap={1}>
          <span style={styles.asideSectionTitle}>
            Sig translation — {drug.name.split(' ')[0]}
          </span>
          <SigTranslationRow
            rawTokens={fill.rawTokens}
            parsed={fill.parsed}
            hoveredTokenId={hoveredTokenId}
            wrapped={band === 'compact'}
            onTokenHover={onTokenHover}
            onChipConfirm={onChipConfirm}
          />
        </VStack>
        <InteractionSeverityMatrix
          meds={meds}
          cells={fill.interactions}
          selectedPair={pendingPair}
          cellSize={cellSize}
          onCellSelect={onCellSelect}
        />
        <CounselFlagStack
          flags={fill.flags}
          focusedFlagId={focusedFlagId}
          onFocusFlag={onFocusFlag}
          onAck={onAck}
          onDismiss={onDismiss}
        />
        {pendingPair != null ? (
          <OverrideReasonPanel
            pairLabel={pendingLabel}
            reasonCode={reasonCode}
            onPickReason={onPickReason}
            onConfirm={onConfirmOverride}
            onCancel={onCancelOverride}
            panelRef={overridePanelRef}
          />
        ) : null}
      </div>
      <div style={styles.verifyBar}>
        <Text type="supporting" size="xsm" color="secondary" maxLines={1} style={{minWidth: 0, flex: 1}}>
          {gateHint}
        </Text>
        <Button
          label={isVerified ? 'Verified' : 'Verify & release'}
          variant="primary"
          size="sm"
          isDisabled={!canVerify}
          onClick={onVerify}
        />
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// PAGE — the SINGLE state owner. One update(id, patch) shallow-merges into
// fills[id]; appendAudit is append-only (never edited, never removed). All
// tab badges, the queue count, and the corner throughput derive live from
// the fills record.
// ---------------------------------------------------------------------------

interface PageState {
  fills: Record<string, Fill>;
  selectedFillId: string;
  activeTab: TabId;
  hoveredTokenId: string | null;
  focusedFlagId: string | null;
  pendingOverride: {fillId: string; aId: string; bId: string} | null;
  overrideReasonCode: string | null;
  auditEntries: AuditEntry[];
  nextSeq: number;
  /** null = automatic (collapses in the compact band). */
  tickerCollapsed: boolean | null;
}

type FilterMode = 'all' | 'hot' | 'wait';

const drugWord = (drugId: string): string => DRUGS[drugId].name.split(' ')[0];

/** Derived blocked-gate check used after overrides and chip confirms. */
const stillBlocked = (fill: Fill): boolean => {
  const gate = gateFor(fill);
  return !(gate.sev3Ok && gate.sigOk);
};

export default function PharmacyVerificationQueueTemplate() {
  const viewRootRef = useRef<HTMLDivElement | null>(null);
  const measuredWidth = useElementWidth(viewRootRef);
  // Viewport queries cover only the pre-observer first frame (width 0).
  const vpStage = useMediaQuery('(max-width: 1199px)');
  const vpNarrow = useMediaQuery('(max-width: 1023px)');
  const vpCompact = useMediaQuery('(max-width: 899px)');
  const containerWidth =
    measuredWidth > 0 ? measuredWidth : vpCompact ? 880 : vpNarrow ? 1000 : vpStage ? 1100 : 1280;
  const band: Band =
    containerWidth >= 1200 ? 'wide' : containerWidth >= 1024 ? 'stage' : containerWidth >= 900 ? 'narrow' : 'compact';
  const asideWidth = band === 'wide' ? 420 : band === 'stage' ? 384 : 340;

  const [state, setState] = useState<PageState>({
    fills: INITIAL_FILLS,
    selectedFillId: 'rx-7744',
    activeTab: 'blocked',
    hoveredTokenId: null,
    focusedFlagId: null,
    pendingOverride: null,
    overrideReasonCode: null,
    auditEntries: SEED_AUDIT,
    nextSeq: 104,
    tickerCollapsed: null,
  });
  const [searchText, setSearchText] = useState('');
  const [filterMode, setFilterMode] = useState<FilterMode>('all');
  const [isSlideOverOpen, setIsSlideOverOpen] = useState(false);

  const rowRefs = useRef(new Map<string, HTMLDivElement>());
  const overridePanelRef = useRef<HTMLDivElement | null>(null);

  const registerRowRef = useCallback((id: string, el: HTMLDivElement | null) => {
    if (el != null) {
      rowRefs.current.set(id, el);
    } else {
      rowRefs.current.delete(id);
    }
  }, []);

  // THE one mutator — every fill mutation flows through here.
  const update = useCallback((id: string, patch: Partial<Fill>) => {
    setState(prev => ({...prev, fills: {...prev.fills, [id]: {...prev.fills[id], ...patch}}}));
  }, []);

  const setHoveredToken = useCallback((id: string | null) => {
    setState(prev => (prev.hoveredTokenId === id ? prev : {...prev, hoveredTokenId: id}));
  }, []);
  const setFocusedFlag = useCallback((id: string | null) => {
    setState(prev => (prev.focusedFlagId === id ? prev : {...prev, focusedFlagId: id}));
  }, []);

  const selectFill = useCallback(
    (id: string) => {
      setState(prev => ({
        ...prev,
        selectedFillId: id,
        pendingOverride: prev.pendingOverride?.fillId === id ? prev.pendingOverride : null,
        overrideReasonCode: prev.pendingOverride?.fillId === id ? prev.overrideReasonCode : null,
      }));
      if (band === 'compact') {
        setIsSlideOverOpen(true);
      }
    },
    [band],
  );

  const selectTab = useCallback((tab: TabId) => {
    setState(prev => {
      const inTab = Object.values(prev.fills).filter(f => f.status === tab);
      const selectedStays = inTab.some(f => f.id === prev.selectedFillId);
      return {
        ...prev,
        activeTab: tab,
        selectedFillId: selectedStays ? prev.selectedFillId : (inTab[0]?.id ?? prev.selectedFillId),
      };
    });
  }, []);

  const openOverride = useCallback((aId: string, bId: string) => {
    setState(prev => ({
      ...prev,
      pendingOverride: {fillId: prev.selectedFillId, aId, bId},
      overrideReasonCode: null,
    }));
  }, []);

  // The aside scrolls the reason panel into view once it exists.
  useEffect(() => {
    if (state.pendingOverride != null) {
      overridePanelRef.current?.scrollIntoView({block: 'nearest'});
    }
  }, [state.pendingOverride]);

  const cancelOverride = useCallback(() => {
    setState(prev => {
      if (prev.pendingOverride != null) {
        const {aId, bId} = prev.pendingOverride;
        requestAnimationFrame(() => {
          document.querySelector<HTMLButtonElement>(\`[data-pvq-cell="\${aId}:\${bId}"]\`)?.focus();
        });
      }
      return {...prev, pendingOverride: null, overrideReasonCode: null};
    });
  }, []);

  // Signature interaction — ONE confirm, five visible consequences:
  // (1) the matrix cell re-renders hatched with the JT glyph, (2) the audit
  // ticker appends an OVERRIDE entry (aria-live announces it), (3) the tab
  // badges re-derive (Blocked 3 -> 2, Ready 5 -> 6 when the gate clears),
  // (4) the queue row gains the JT initials chip and its severity cluster
  // drops a dot, (5) the corner throughput/queue stats recompute. Focus
  // returns to the originating matrix cell.
  const confirmOverride = useCallback(() => {
    setState(prev => {
      const pending = prev.pendingOverride;
      if (pending == null || prev.overrideReasonCode == null) {
        return prev;
      }
      const fill = prev.fills[pending.fillId];
      const interactions = fill.interactions.map(c =>
        (c.aId === pending.aId && c.bId === pending.bId) || (c.aId === pending.bId && c.bId === pending.aId)
          ? {
              ...c,
              status: 'overridden' as const,
              overriddenBy: RPH_TAN.initials,
              reasonCode: prev.overrideReasonCode ?? undefined,
            }
          : c,
      );
      const patched: Fill = {...fill, interactions, stampedBy: RPH_TAN.initials};
      const nextStatus: TabId = patched.status === 'blocked' && !stillBlocked(patched) ? 'ready' : patched.status;
      const entry: AuditEntry = {
        seq: prev.nextSeq,
        verb: 'OVERRIDE',
        detail: \`\${fill.rxNumber} \${drugWord(pending.aId)} x \${drugWord(pending.bId)}\`,
        initials: RPH_TAN.initials,
        time: SHIFT_TIME,
      };
      requestAnimationFrame(() => {
        document
          .querySelector<HTMLButtonElement>(\`[data-pvq-cell="\${pending.aId}:\${pending.bId}"]\`)
          ?.focus();
      });
      return {
        ...prev,
        fills: {...prev.fills, [fill.id]: {...patched, status: nextStatus}},
        auditEntries: [entry, ...prev.auditEntries],
        nextSeq: prev.nextSeq + 1,
        pendingOverride: null,
        overrideReasonCode: null,
      };
    });
  }, []);

  const confirmChip = useCallback((chipId: string) => {
    setState(prev => {
      const fill = prev.fills[prev.selectedFillId];
      const parsed = fill.parsed.map(chip => (chip.id === chipId ? {...chip, confirmed: true} : chip));
      const patched: Fill = {...fill, parsed};
      const nextStatus: TabId = patched.status === 'blocked' && !stillBlocked(patched) ? 'ready' : patched.status;
      return {...prev, fills: {...prev.fills, [fill.id]: {...patched, status: nextStatus}}};
    });
  }, []);

  const ackFlag = useCallback((flagId: string) => {
    setState(prev => {
      const fill = prev.fills[prev.selectedFillId];
      const flag = fill.flags.find(f => f.id === flagId);
      if (flag == null || flag.kind !== 'regulatory' || flag.ackedBy != null) {
        return prev;
      }
      const flags = fill.flags.map(f =>
        f.id === flagId ? {...f, ackedBy: {initials: RPH_TAN.initials, seq: prev.nextSeq}} : f,
      );
      const entry: AuditEntry = {
        seq: prev.nextSeq,
        verb: 'ACK',
        detail: \`\${fill.rxNumber} \${flag.label.split(' — ')[0]}\`,
        initials: RPH_TAN.initials,
        time: SHIFT_TIME,
      };
      return {
        ...prev,
        fills: {...prev.fills, [fill.id]: {...fill, flags}},
        auditEntries: [entry, ...prev.auditEntries],
        nextSeq: prev.nextSeq + 1,
      };
    });
  }, []);

  const dismissFlag = useCallback(
    (flagId: string) => {
      setState(prev => {
        const fill = prev.fills[prev.selectedFillId];
        const flags = fill.flags.map(f => (f.id === flagId && f.kind === 'info' ? {...f, dismissed: true} : f));
        return {...prev, fills: {...prev.fills, [fill.id]: {...fill, flags}}};
      });
    },
    [],
  );

  const verifyFill = useCallback(() => {
    setState(prev => {
      const fill = prev.fills[prev.selectedFillId];
      const gate = gateFor(fill);
      if (fill.status === 'verified' || !gate.regOk || !gate.sigOk || !gate.sev3Ok) {
        return prev;
      }
      // Advance selection to the next fill remaining in the active tab.
      const tabList = Object.values(prev.fills).filter(f => f.status === prev.activeTab && f.id !== fill.id);
      const nextSelected = tabList[0]?.id ?? fill.id;
      const entry: AuditEntry = {
        seq: prev.nextSeq,
        verb: 'VERIFY',
        detail: \`\${fill.rxNumber} \${drugWord(fill.drugId)} release\`,
        initials: RPH_TAN.initials,
        time: SHIFT_TIME,
      };
      if (nextSelected !== fill.id) {
        requestAnimationFrame(() => {
          rowRefs.current.get(nextSelected)?.focus();
        });
      }
      return {
        ...prev,
        fills: {
          ...prev.fills,
          [fill.id]: {...fill, status: 'verified', verifiedBy: RPH_TAN.id, stampedBy: RPH_TAN.initials},
        },
        selectedFillId: nextSelected,
        auditEntries: [entry, ...prev.auditEntries],
        nextSeq: prev.nextSeq + 1,
      };
    });
  }, []);

  const closeSlideOver = useCallback(() => {
    setIsSlideOverOpen(false);
    requestAnimationFrame(() => {
      setState(prev => {
        rowRefs.current.get(prev.selectedFillId)?.focus();
        return prev;
      });
    });
  }, []);

  // Global shortcuts (A ack · O override · V verify · Esc layers) with a
  // typing-target guard. Handler lives in a ref so the listener binds once.
  const shortcutRef = useRef<(event: KeyboardEvent) => void>(() => {});
  shortcutRef.current = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    if (
      target != null &&
      (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT' || target.isContentEditable)
    ) {
      return;
    }
    if (event.defaultPrevented) {
      return;
    }
    if (event.key === 'Escape') {
      // Escape layering: reason panel first, then the compact slide-over.
      if (state.pendingOverride != null) {
        cancelOverride();
      } else if (band === 'compact' && isSlideOverOpen) {
        closeSlideOver();
      }
      return;
    }
    const selected = state.fills[state.selectedFillId];
    if (event.key === 'a' || event.key === 'A') {
      const flag =
        selected.flags.find(f => f.id === state.focusedFlagId && f.kind === 'regulatory' && f.ackedBy == null) ??
        selected.flags.find(f => f.kind === 'regulatory' && f.ackedBy == null);
      if (flag != null) {
        event.preventDefault();
        ackFlag(flag.id);
      }
    } else if (event.key === 'o' || event.key === 'O') {
      const sev3 = selected.interactions.find(c => c.severity === 3 && c.status === 'active');
      if (sev3 != null) {
        event.preventDefault();
        openOverride(sev3.aId, sev3.bId);
      }
    } else if (event.key === 'v' || event.key === 'V') {
      event.preventDefault();
      verifyFill();
    }
  };
  useEffect(() => {
    const listener = (event: KeyboardEvent) => shortcutRef.current(event);
    window.addEventListener('keydown', listener);
    return () => window.removeEventListener('keydown', listener);
  }, []);

  // -------------------------------------------------------------------------
  // Derived aggregates — computed from the fills record, never stored.
  // -------------------------------------------------------------------------
  const allFills = Object.values(state.fills);
  const tabCounts = TAB_LABELS.map(t => ({
    ...t,
    count: allFills.filter(f => f.status === t.id).length,
  }));
  const verifiedCount = allFills.filter(f => f.status === 'verified').length;
  const queueCount = allFills.length - verifiedCount;
  const throughputLabel = \`Verified this shift: \${verifiedCount} of \${allFills.length}\`;

  const search = searchText.trim().toLowerCase();
  const matchesSearch = (fill: Fill): boolean => {
    if (search === '') {
      return true;
    }
    return (
      fill.rxNumber.toLowerCase().includes(search) ||
      PATIENTS[fill.patientId].name.toLowerCase().includes(search) ||
      DRUGS[fill.drugId].name.toLowerCase().includes(search)
    );
  };
  const tabFills = allFills.filter(f => f.status === state.activeTab && matchesSearch(f));
  const filtered = filterMode === 'hot' ? tabFills.filter(f => (f.waitMin ?? 0) >= 20) : tabFills;
  // Sections: 'Longest wait' flattens and sorts; otherwise fills group under
  // sticky 28px labels by the 20-minute wait threshold (the amber split).
  const sections: {id: string; label: string; fills: Fill[]}[] = [];
  if (state.activeTab === 'verified') {
    sections.push({id: 'verified', label: \`Verified this shift · stamped\`, fills: filtered});
  } else if (filterMode === 'wait') {
    sections.push({
      id: 'wait',
      label: 'Longest wait first',
      fills: [...filtered].sort((a, b) => (b.waitMin ?? 0) - (a.waitMin ?? 0)),
    });
  } else {
    const hot = filtered.filter(f => (f.waitMin ?? 0) >= 20).sort((a, b) => (b.waitMin ?? 0) - (a.waitMin ?? 0));
    const rest = filtered.filter(f => (f.waitMin ?? 0) < 20);
    if (hot.length > 0) {
      sections.push({id: 'hot', label: 'Waiting 20 min +', fills: hot});
    }
    if (rest.length > 0) {
      sections.push({id: 'rest', label: 'In window', fills: rest});
    }
  }
  const flatOrder = sections.flatMap(s => s.fills.map(f => f.id));

  const onRowKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>, id: string) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      selectFill(id);
    } else if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
      event.preventDefault();
      const index = flatOrder.indexOf(id);
      const nextId = flatOrder[event.key === 'ArrowDown' ? index + 1 : index - 1];
      if (nextId != null) {
        rowRefs.current.get(nextId)?.focus();
        selectFill(nextId);
      }
    }
  };

  const onDotsClick = useCallback(
    (id: string) => {
      // Severity dots deep-link: select the fill and pull the matrix into view.
      selectFill(id);
      requestAnimationFrame(() => {
        document.querySelector('[aria-label="Interaction severity matrix"]')?.scrollIntoView({block: 'nearest'});
      });
    },
    [selectFill],
  );

  const onTickerEntryClick = useCallback((detail: string) => {
    const rxNumber = detail.split(' ')[0];
    setState(prev => {
      const hit = Object.values(prev.fills).find(f => f.rxNumber === rxNumber);
      if (hit == null) {
        return prev; // Seeded RX-7739/7740 released before this queue view.
      }
      return {...prev, activeTab: hit.status, selectedFillId: hit.id};
    });
  }, []);

  const selectedFill = state.fills[state.selectedFillId];
  const pendingPair =
    state.pendingOverride != null && state.pendingOverride.fillId === state.selectedFillId
      ? {aId: state.pendingOverride.aId, bId: state.pendingOverride.bId}
      : null;
  const tickerCollapsed = state.tickerCollapsed ?? band === 'compact';

  const filterChips: {id: FilterMode; label: string}[] = [
    {id: 'all', label: 'All'},
    {id: 'hot', label: 'Waiting 20m+'},
    {id: 'wait', label: 'Longest wait'},
  ];

  const asideContent = (
    <VerificationAside
      fill={selectedFill}
      band={band}
      hoveredTokenId={state.hoveredTokenId}
      focusedFlagId={state.focusedFlagId}
      pendingPair={pendingPair}
      reasonCode={state.overrideReasonCode}
      overridePanelRef={overridePanelRef}
      onTokenHover={setHoveredToken}
      onChipConfirm={confirmChip}
      onCellSelect={openOverride}
      onFocusFlag={setFocusedFlag}
      onAck={ackFlag}
      onDismiss={dismissFlag}
      onPickReason={code => setState(prev => ({...prev, overrideReasonCode: code}))}
      onConfirmOverride={confirmOverride}
      onCancelOverride={cancelOverride}
      onVerify={verifyFill}
      onClose={band === 'compact' ? closeSlideOver : undefined}
    />
  );

  return (
    <div style={styles.root}>
      <style>{PVQ_CSS}</style>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <div style={styles.headerBar}>
              <div style={styles.brandBlock}>
                <PestleMark size={28} />
                <span style={styles.wordmark}>Pestle</span>
              </div>
              <QueueTabBar tabs={tabCounts} activeId={state.activeTab} onSelect={selectTab} />
              <span style={{flex: 1}} aria-hidden />
              <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers style={{whiteSpace: 'nowrap'}}>
                Shift {SHIFT_TIME}
              </Text>
              <span style={styles.identityChip} title={RPH_TAN.name}>
                <span style={styles.initialsDisc}>{RPH_TAN.initials}</span>
                <Text type="supporting" size="xsm" style={{whiteSpace: 'nowrap'}}>
                  {RPH_TAN.name}
                </Text>
              </span>
            </div>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={{height: '100%', minHeight: 0, display: 'flex', flexDirection: 'column'}}>
              <div ref={viewRootRef} style={{...styles.viewRoot, flex: 1, position: 'relative'}}>
                <div style={styles.mainCol}>
                  <div style={styles.filterRow}>
                    {(band === 'compact' ? filterChips.slice(0, 1) : filterChips).map(chip => (
                      <button
                        key={chip.id}
                        type="button"
                        className="pvq-focusable pvq-chipbtn"
                        style={
                          filterMode === chip.id ? {...styles.filterChip, ...styles.filterChipActive} : styles.filterChip
                        }
                        aria-pressed={filterMode === chip.id}
                        onClick={() => setFilterMode(chip.id)}>
                        {chip.label}
                      </button>
                    ))}
                    {band === 'compact' ? (
                      <DropdownMenu
                        button={{
                          label: 'Filters',
                          variant: 'ghost',
                          size: 'sm',
                          icon: <Icon icon={SlidersHorizontalIcon} size="sm" />,
                        }}
                        menuWidth={180}
                        items={filterChips.slice(1).map(chip => ({
                          label: chip.label,
                          onClick: () => setFilterMode(chip.id),
                        }))}
                      />
                    ) : null}
                    <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers style={{whiteSpace: 'nowrap'}}>
                      Fills in queue: {queueCount}
                    </Text>
                    <div style={styles.searchSlot}>
                      <TextInput
                        label="Search fills"
                        isLabelHidden
                        size="sm"
                        placeholder="Rx, patient, drug"
                        value={searchText}
                        onChange={value => setSearchText(value)}
                        startIcon={SearchIcon}
                      />
                    </div>
                  </div>
                  <div
                    id={\`pvq-queue-\${state.activeTab}\`}
                    role="listbox"
                    aria-label={\`\${TAB_LABELS.find(t => t.id === state.activeTab)?.label} fills\`}
                    style={styles.queueScroll}>
                    {sections.length === 0 ? (
                      <div style={styles.emptyState}>
                        <PestleMark size={40} variant="outline" />
                        <Text type="supporting" size="sm" color="secondary">
                          {state.activeTab === 'counsel'
                            ? 'No fills awaiting counseling review'
                            : search !== '' || filterMode === 'hot'
                              ? 'No fills match the current filters'
                              : 'Queue clear'}
                        </Text>
                      </div>
                    ) : (
                      sections.map(section => (
                        <div key={section.id}>
                          <div style={styles.sectionLabel}>
                            {section.label}
                            <span style={{fontVariantNumeric: 'tabular-nums'}}>{section.fills.length}</span>
                          </div>
                          {section.fills.map(fill => (
                            <RxQueueRow
                              key={fill.id}
                              fill={fill}
                              selected={fill.id === state.selectedFillId}
                              band={band}
                              onSelect={selectFill}
                              onDotsClick={onDotsClick}
                              rowRef={registerRowRef}
                              onRowKeyDown={onRowKeyDown}
                            />
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
                {band !== 'compact' ? (
                  <div style={{...styles.aside, width: asideWidth}}>{asideContent}</div>
                ) : isSlideOverOpen ? (
                  <div role="dialog" aria-modal="true" aria-label={\`\${selectedFill.rxNumber} detail\`} style={styles.slideOver}>
                    {asideContent}
                  </div>
                ) : null}
              </div>
              <AuditTicker
                entries={state.auditEntries}
                collapsed={tickerCollapsed}
                throughputLabel={throughputLabel}
                onToggle={() => setState(prev => ({...prev, tickerCollapsed: !(prev.tickerCollapsed ?? band === 'compact')}))}
                onEntryClick={onTickerEntryClick}
              />
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};