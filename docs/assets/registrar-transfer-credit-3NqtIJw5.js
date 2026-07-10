var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — one Articula articulation case:
 *   transfer student Maya Torres (MSU-2296014, B.S. Computer Science,
 *   admit Fall 2026) bringing 9 courses from Foothill Ridge Community
 *   College (quarter system). Quarter→semester conversion is ×2/3 rounded
 *   to 0.1 with BOTH values stored per course (dual display/math fields).
 *   Cross-checks done by hand: quarter units 5+5+4+4+4+4+4+6+1.5 = 37.5;
 *   semester equivalents 3.3+3.3+2.7+2.7+2.7+2.7+2.7+4.0+1.0 = 25.1.
 *   Initial decisions: CS 12A (2.7) and ENGL 1A (2.7) pre-approved =
 *   5.4 articulated; KIN 22 (1.0) pre-denied; pending 25.1−5.4−1.0 = 18.7.
 *   Degree-audit buckets need 6+8+12+8+6+9 = 49.0 semester credits, so the
 *   opening ring reads 5.4/49.0 = 11%. Approving everything would apply
 *   24.1/49.0 = 49% (KIN 22 stays denied). Case activity clocks are a
 *   frozen 09:41:00 session clock advancing in fixed 90-second steps —
 *   no clock reads, no randomness, no timers, no network assets.
 * @output Articula — Transfer Credit Articulation: a registrar workbench
 *   for deciding course equivalencies. Left, a degree-audit rail with an
 *   animated SVG progress ring (articulated ÷ 49.0 bucket requirement),
 *   an articulated/pending/denied credit ledger, and a remaining-credits
 *   table (six requirement buckets with applied bars). Center, the
 *   side-by-side equivalency mapper: a two-institution column header
 *   (Foothill Ridge CC quarter units ↔ Marden State semester credits)
 *   over 92px pair rows joined by a seam-arrow glyph that encodes the
 *   decision (dashed = pending, solid = approved, crossed = denied).
 *   Right, the syllabus evidence pane for the selected mapping: credit
 *   conversion math, a contact-hours comparison, a topic-coverage
 *   checklist with a match-strength meter, the syllabus excerpt (or a
 *   request-syllabus / apply-precedent gate when evidence is missing),
 *   precedent decisions, and the Approve / Deny(reason) / Reopen bar.
 *   Signature move: approving a mapping applies its semester credits to
 *   its requirement bucket in the SAME render — the audit ring sweeps
 *   forward, the bucket row's bar and remaining figure move, the ledger
 *   re-splits, the seam glyph solidifies, the header decided counter
 *   ticks, and the "Post to transcript" gate unlocks only at 9/9 decided.
 *   Posting freezes the case and stamps the activity log.
 * @position Page template; emitted by \`astryx template registrar-transfer-credit\`
 *
 * Frame: a 100dvh root gives Layout height="fill" a definite height in
 *   auto-height hosts. LayoutHeader carries the Articula ligature mark,
 *   the case identity line, the decided-count chip, and the post gate.
 *   LayoutContent owns a 3-column CSS grid: 252px audit rail ·
 *   minmax(0,1fr) mapper · 340px evidence pane, each scrolling
 *   independently under a shared 12px gutter. Hand-rolled grid (not the
 *   DS Grid) because the collapse order below is expressed in media
 *   queries the DS grid's inline styles would defeat.
 *
 * Responsive contract (subtraction, not squeeze):
 * - Default (fits the ~1045px inline demo stage with NO media query):
 *   252px rail · ~405px mapper · 340px evidence at 1045px total.
 * - <=940px: the audit rail leaves column 1 and becomes a full-width
 *   horizontal band above the mapper (ring left, buckets in a 3-up grid);
 *   mapper + evidence share the remaining width.
 * - <=700px: single column — evidence pane stacks BELOW the mapper so a
 *   selected row's evidence is one scroll away; nothing overlays.
 * - <=480px (390px embed iframe): pair rows restack vertically (incoming
 *   over catalog, seam arrow rotates 90°), decision buttons and the deny
 *   selector grow to >=44px hit targets, bucket table rows wrap their
 *   remaining figure under the bar.
 *
 * Container policy (registrar workbench archetype): panels, ledgers, and
 *   dense pair rows — no marketing cards. The mapper is a decision sheet;
 *   the evidence pane is a reading surface with one mono excerpt block;
 *   the audit rail is a figures table under a ring.
 *
 * Color policy: token-first chrome (var(--color-*), var(--spacing-*),
 *   var(--border-width), var(--font-family-sans)). ONE quarantined brand
 *   accent — Articula bronze — as a light-dark() pair with contrast math
 *   at the declaration, plus approve-green and deny-red state pairs, each
 *   with math. Warning states reuse the bronze family deliberately (the
 *   brand IS amber) at text-safe depths. The bare --color-text token is
 *   never referenced: ring track / figure strokes use --color-border and
 *   --color-text-primary.
 *
 * Density grid (repeated verbatim in the CSS): header 56 · audit rail 252
 *   · evidence pane 340 · pair rows 92 · bucket rows 48 · topic rows 32 ·
 *   ring 108 (r=44, C=276.46) · ledger rows 36 · activity rows 40 ·
 *   decision buttons 36 (44 on touch) · 12px gutter · 10px panel radius.
 *   tabular-nums on every credit, unit, hour, and percent figure.
 *
 * Fixture policy: fixed data only. All aggregates (ring percent, bucket
 *   applied/remaining, ledger split, decided count, post gate) derive
 *   live from the single decisions store, so every approve / deny /
 *   reopen / precedent toggle recomputes them in one pass. Activity
 *   timestamps derive from the frozen session clock + 90s × entry index.
 */

import {useMemo, useState} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Icon} from '@astryxdesign/core/Icon';
import {useToast} from '@astryxdesign/core/Toast';
import {
  ArrowRightIcon,
  BookOpenIcon,
  CheckIcon,
  FileClockIcon,
  FileTextIcon,
  GraduationCapIcon,
  HistoryIcon,
  ScrollTextIcon,
  SendIcon,
  ShieldCheckIcon,
  Undo2Icon,
  XIcon,
} from 'lucide-react';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color is a light-dark() pair with math.
// ---------------------------------------------------------------------------

// THE quarantined brand accent: Articula bronze. #8A5A16 on #FFFFFF ≈ 5.9:1
// (passes 4.5:1 for text at every size used here); #E3B26A on the dark
// panel (~#1C1C1E) ≈ 8.7:1. Used for selection seams, the ring sweep,
// chips, and focus rings — never for body text below 12px.
const ACCENT = 'light-dark(#8A5A16, #E3B26A)';
// Brand wash behind selected rows / chips: bronze text sits on it —
// #8A5A16 over rgba(138,90,22,.10)-on-white (≈ #F1E8DC) ≈ 5.3:1;
// #E3B26A over rgba(227,178,106,.14)-on-#1C1C1E ≈ 7.4:1.
const ACCENT_TINT =
  'light-dark(rgba(138, 90, 22, 0.10), rgba(227, 178, 106, 0.14))';
// Approve green: #166534 on #FFFFFF ≈ 6.3:1; #4ADE80 on #1C1C1E ≈ 9.0:1.
const APPROVE = 'light-dark(#166534, #4ADE80)';
const APPROVE_TINT =
  'light-dark(rgba(22, 101, 52, 0.10), rgba(74, 222, 128, 0.14))';
// Deny red: #B42318 on #FFFFFF ≈ 6.0:1; #F97066 on #1C1C1E ≈ 5.6:1.
const DENY = 'light-dark(#B42318, #F97066)';
const DENY_TINT =
  'light-dark(rgba(180, 35, 24, 0.09), rgba(249, 112, 102, 0.13))';

const MONO_FONT =
  "ui-monospace, 'SF Mono', SFMono-Regular, Menlo, Consolas, monospace";

const SCOPE = 'tpl-registrar-transfer-credit';

// ---------------------------------------------------------------------------
// DOMAIN TYPES + FIXTURES
// ---------------------------------------------------------------------------

type BucketId =
  | 'written-comm'
  | 'quant-core'
  | 'cs-core'
  | 'nat-sci'
  | 'humanities'
  | 'free-elec';

interface RequirementBucket {
  id: BucketId;
  label: string;
  /** Semester credits required by the B.S. CS lower-division audit. */
  needed: number;
}

/** 6+8+12+8+6+9 = 49.0 semester credits — the ring denominator. */
const BUCKETS: RequirementBucket[] = [
  {id: 'written-comm', label: 'Written Communication', needed: 6.0},
  {id: 'quant-core', label: 'Quantitative Core', needed: 8.0},
  {id: 'cs-core', label: 'CS Major Core', needed: 12.0},
  {id: 'nat-sci', label: 'Natural Science w/ Lab', needed: 8.0},
  {id: 'humanities', label: 'Humanities & Culture', needed: 6.0},
  {id: 'free-elec', label: 'Free Electives', needed: 9.0},
];

const BUCKET_TOTAL_NEEDED = 49.0;

type Decision = 'pending' | 'approved' | 'denied';

interface Topic {
  label: string;
  covered: boolean;
}

interface Precedent {
  caseId: string;
  term: string;
  evaluator: string;
  outcome: 'approved' | 'denied';
}

interface Mapping {
  id: string;
  /** Incoming (sending institution) side. */
  inCode: string;
  inTitle: string;
  /** Dual display/math fields: quarter units and the ×2/3 conversion. */
  quarterUnits: number;
  semCredits: number;
  inContactHours: number;
  /** Catalog (receiving institution) side. */
  outCode: string;
  outTitle: string;
  outCredits: number;
  outContactHours: number;
  bucketId: BucketId;
  /** Topic-coverage checklist against the catalog course outline. */
  topics: Topic[];
  /** Fixed-string syllabus excerpt; null = syllabus not on file. */
  syllabusExcerpt: string | null;
  syllabusSource: string;
  /** Evidence comes from an expired articulation sheet — surfaced note. */
  staleEvidence?: boolean;
  /** Precedent that can waive a missing syllabus, when one exists. */
  waiverPrecedentId?: string;
  precedents: Precedent[];
  /** Pre-seeded decision state for the opening render. */
  initialDecision: Decision;
  initialDenyReason?: string;
}

const MAPPINGS: Mapping[] = [
  {
    id: 'map-math1b',
    inCode: 'MATH 1B',
    inTitle: 'Calculus II',
    quarterUnits: 5.0,
    semCredits: 3.3,
    inContactHours: 55,
    outCode: 'MATH 162',
    outTitle: 'Calculus II',
    outCredits: 4.0,
    outContactHours: 60,
    bucketId: 'quant-core',
    topics: [
      {label: 'Techniques of integration', covered: true},
      {label: 'Improper integrals', covered: true},
      {label: 'Applications: volume, arc length, work', covered: true},
      {label: 'Sequences & series', covered: true},
      {label: 'Power series & Taylor polynomials', covered: true},
      {label: 'Differential equations intro', covered: true},
      {label: 'Polar & parametric calculus', covered: false},
    ],
    syllabusExcerpt:
      'MATH 1B — Calculus II (5 units). Continuation of MATH 1A. Techniques\\nand applications of integration, improper integrals, infinite sequences\\nand series, power series, and an introduction to first-order\\ndifferential equations. Weeks 8–10: comparison, ratio, and root tests;\\nTaylor and Maclaurin series with error bounds.',
    syllabusSource: 'Syllabus PDF · FRCC 2025–26 catalog · uploaded Jun 12',
    precedents: [
      {caseId: 'ART-1407', term: 'SP26', evaluator: 'R. Okafor', outcome: 'approved'},
      {caseId: 'ART-1288', term: 'FA25', evaluator: 'D. Lindqvist', outcome: 'approved'},
      {caseId: 'ART-1140', term: 'SP25', evaluator: 'R. Okafor', outcome: 'approved'},
    ],
    initialDecision: 'pending',
  },
  {
    id: 'map-math1c',
    inCode: 'MATH 1C',
    inTitle: 'Calculus III — Multivariable',
    quarterUnits: 5.0,
    semCredits: 3.3,
    inContactHours: 55,
    outCode: 'MATH 263',
    outTitle: 'Multivariable Calculus',
    outCredits: 4.0,
    outContactHours: 60,
    bucketId: 'quant-core',
    topics: [
      {label: 'Vectors & vector-valued functions', covered: true},
      {label: 'Partial derivatives & gradients', covered: true},
      {label: 'Multiple integrals', covered: true},
      {label: 'Lagrange multipliers', covered: true},
      {label: 'Line & surface integrals', covered: true},
      {label: "Green's / Stokes' / divergence theorems", covered: false},
      {label: 'Change of variables & Jacobians', covered: false},
    ],
    syllabusExcerpt:
      'MATH 1C — Calculus III (5 units). Multivariable calculus: vectors,\\nfunctions of several variables, partial differentiation, multiple\\nintegration, and optimization. Vector fields and line integrals are\\nintroduced in week 10 as time permits.',
    syllabusSource: 'Syllabus PDF · FRCC 2025–26 catalog · uploaded Jun 12',
    precedents: [
      {caseId: 'ART-1291', term: 'FA25', evaluator: 'D. Lindqvist', outcome: 'denied'},
      {caseId: 'ART-1152', term: 'SP25', evaluator: 'M. Vance', outcome: 'approved'},
    ],
    initialDecision: 'pending',
  },
  {
    id: 'map-cs12a',
    inCode: 'CS 12A',
    inTitle: 'Introduction to Programming (Python)',
    quarterUnits: 4.0,
    semCredits: 2.7,
    inContactHours: 44,
    outCode: 'CS 101',
    outTitle: 'Programming Fundamentals',
    outCredits: 3.0,
    outContactHours: 45,
    bucketId: 'cs-core',
    topics: [
      {label: 'Variables, types, expressions', covered: true},
      {label: 'Control flow & iteration', covered: true},
      {label: 'Functions & scope', covered: true},
      {label: 'Collections (lists, dicts)', covered: true},
      {label: 'File I/O & exceptions', covered: true},
      {label: 'Intro object orientation', covered: true},
    ],
    syllabusExcerpt:
      'CS 12A — Introduction to Programming (4 units). Problem solving with\\nPython: expressions, control structures, functions, aggregate data\\ntypes, file processing, exception handling, and an introduction to\\nclasses. Ten programming assignments; two exams.',
    syllabusSource: 'Syllabus PDF · FRCC 2025–26 catalog · uploaded Jun 12',
    precedents: [
      {caseId: 'ART-1399', term: 'SP26', evaluator: 'R. Okafor', outcome: 'approved'},
      {caseId: 'ART-1301', term: 'FA25', evaluator: 'M. Vance', outcome: 'approved'},
    ],
    initialDecision: 'approved',
  },
  {
    id: 'map-cs12b',
    inCode: 'CS 12B',
    inTitle: 'Data Structures',
    quarterUnits: 4.0,
    semCredits: 2.7,
    inContactHours: 44,
    outCode: 'CS 201',
    outTitle: 'Data Structures & Algorithms',
    outCredits: 3.0,
    outContactHours: 45,
    bucketId: 'cs-core',
    topics: [
      {label: 'Asymptotic analysis (big-O)', covered: true},
      {label: 'Linked lists, stacks, queues', covered: true},
      {label: 'Trees & binary search trees', covered: true},
      {label: 'Hash tables', covered: true},
      {label: 'Sorting algorithms', covered: true},
      {label: 'Graphs & traversals', covered: false},
      {label: 'Heaps & priority queues', covered: false},
    ],
    syllabusExcerpt: null,
    syllabusSource:
      'No syllabus on file — coverage shown is from the 2019 articulation sheet (expired)',
    staleEvidence: true,
    waiverPrecedentId: 'ART-1188',
    precedents: [
      {caseId: 'ART-1188', term: 'SP25', evaluator: 'M. Vance', outcome: 'approved'},
      {caseId: 'ART-1034', term: 'FA24', evaluator: 'D. Lindqvist', outcome: 'approved'},
      {caseId: 'ART-0961', term: 'SP24', evaluator: 'R. Okafor', outcome: 'approved'},
    ],
    initialDecision: 'pending',
  },
  {
    id: 'map-engl1a',
    inCode: 'ENGL 1A',
    inTitle: 'College Composition',
    quarterUnits: 4.0,
    semCredits: 2.7,
    inContactHours: 44,
    outCode: 'WRIT 105',
    outTitle: 'Academic Writing I',
    outCredits: 3.0,
    outContactHours: 45,
    bucketId: 'written-comm',
    topics: [
      {label: 'Thesis-driven essays (4+)', covered: true},
      {label: 'Source evaluation & citation', covered: true},
      {label: 'Revision workshop process', covered: true},
      {label: 'Rhetorical analysis', covered: true},
      {label: '6,000+ words graded writing', covered: true},
    ],
    syllabusExcerpt:
      'ENGL 1A — College Composition (4 units). Expository and argumentative\\nwriting based on critical reading of college-level texts. Minimum\\n6,500 words of evaluated writing across five essays with mandatory\\nrevision cycles and library research instruction.',
    syllabusSource: 'Syllabus PDF · FRCC 2025–26 catalog · uploaded Jun 12',
    precedents: [
      {caseId: 'ART-1402', term: 'SP26', evaluator: 'D. Lindqvist', outcome: 'approved'},
    ],
    initialDecision: 'approved',
  },
  {
    id: 'map-engl1b',
    inCode: 'ENGL 1B',
    inTitle: 'Critical Thinking & Composition',
    quarterUnits: 4.0,
    semCredits: 2.7,
    inContactHours: 44,
    outCode: 'WRIT 205',
    outTitle: 'Argument & Research Writing',
    outCredits: 3.0,
    outContactHours: 45,
    bucketId: 'written-comm',
    topics: [
      {label: 'Formal argument structures', covered: true},
      {label: 'Logical fallacy analysis', covered: true},
      {label: 'Research paper (8+ pages)', covered: true},
      {label: 'Annotated bibliography', covered: true},
      {label: 'Oral defense component', covered: false},
    ],
    syllabusExcerpt:
      'ENGL 1B — Critical Thinking & Composition (4 units). Development of\\ncritical thinking, reading, and writing skills beyond ENGL 1A;\\nemphasis on inductive/deductive argument, evidence, and a sustained\\nresearch project with an annotated bibliography.',
    syllabusSource: 'Syllabus PDF · FRCC 2025–26 catalog · uploaded Jun 12',
    precedents: [
      {caseId: 'ART-1355', term: 'FA25', evaluator: 'R. Okafor', outcome: 'approved'},
      {caseId: 'ART-1201', term: 'SP25', evaluator: 'M. Vance', outcome: 'approved'},
    ],
    initialDecision: 'pending',
  },
  {
    id: 'map-hist17b',
    inCode: 'HIST 17B',
    // 66-char stress title: exercises the pair-row two-line clamp and the
    // evidence-pane header truncation.
    inTitle:
      'Race, Gender & Class in Twentieth-Century U.S. History and Culture',
    quarterUnits: 4.0,
    semCredits: 2.7,
    inContactHours: 44,
    outCode: 'HIST 2XX',
    outTitle: 'Lower-Division History Elective',
    outCredits: 3.0,
    outContactHours: 45,
    bucketId: 'humanities',
    topics: [
      {label: 'Primary-source analysis', covered: true},
      {label: 'Historiographic essay', covered: true},
      {label: 'Post-1900 U.S. scope', covered: true},
      {label: 'Comparative/global unit', covered: false},
    ],
    syllabusExcerpt:
      'HIST 17B (4 units). Survey of the American twentieth century through\\nthe lenses of race, gender, and class: Reconstruction legacies, labor,\\nmigration, civil rights, and mass culture. Weekly primary-source\\nresponses and a 10-page historiographic essay.',
    syllabusSource: 'Syllabus PDF · FRCC 2025–26 catalog · uploaded Jun 14',
    precedents: [
      {caseId: 'ART-1216', term: 'SP25', evaluator: 'D. Lindqvist', outcome: 'approved'},
    ],
    initialDecision: 'pending',
  },
  {
    id: 'map-phys4a',
    inCode: 'PHYS 4A',
    inTitle: 'Mechanics (calculus-based, with lab)',
    quarterUnits: 6.0,
    semCredits: 4.0,
    inContactHours: 88,
    outCode: 'PHYS 141',
    outTitle: 'General Physics I + Lab',
    outCredits: 4.0,
    outContactHours: 90,
    bucketId: 'nat-sci',
    topics: [
      {label: 'Kinematics & Newtonian dynamics', covered: true},
      {label: 'Work, energy, momentum', covered: true},
      {label: 'Rotational motion', covered: true},
      {label: 'Oscillations & waves', covered: true},
      {label: 'Fluid statics', covered: true},
      {label: 'Weekly 3-hr laboratory', covered: true},
      {label: 'Formal lab reports (6+)', covered: false},
    ],
    syllabusExcerpt:
      'PHYS 4A — Mechanics (6 units). Calculus-based mechanics for majors:\\nkinematics, dynamics, conservation laws, rotation, gravitation,\\noscillations, and fluids. Includes a required weekly three-hour\\nlaboratory; four formal reports plus notebook checks.',
    syllabusSource: 'Syllabus PDF · FRCC 2025–26 catalog · uploaded Jun 14',
    precedents: [
      {caseId: 'ART-1377', term: 'FA25', evaluator: 'M. Vance', outcome: 'approved'},
      {caseId: 'ART-1108', term: 'SP25', evaluator: 'R. Okafor', outcome: 'approved'},
    ],
    initialDecision: 'pending',
  },
  {
    id: 'map-kin22',
    inCode: 'KIN 22',
    inTitle: 'Beginning Soccer',
    quarterUnits: 1.5,
    semCredits: 1.0,
    inContactHours: 33,
    outCode: '— none —',
    outTitle: 'Free elective credit only',
    outCredits: 1.0,
    outContactHours: 0,
    bucketId: 'free-elec',
    topics: [],
    syllabusExcerpt:
      'KIN 22 — Beginning Soccer (1.5 units). Fundamental skills, rules, and\\nstrategy of soccer; fitness development through drills and scrimmage.\\nActivity course; credit/no-credit available.',
    syllabusSource: 'Syllabus PDF · FRCC 2025–26 catalog · uploaded Jun 14',
    precedents: [
      {caseId: 'ART-1322', term: 'FA25', evaluator: 'D. Lindqvist', outcome: 'denied'},
      {caseId: 'ART-1055', term: 'FA24', evaluator: 'M. Vance', outcome: 'denied'},
    ],
    initialDecision: 'denied',
    initialDenyReason: 'Activity credit exceeds 2-credit cap',
  },
  {
    id: 'map-cs12c',
    inCode: 'CS 12C',
    inTitle: 'Programming Paradigms (C++)',
    quarterUnits: 4.0,
    semCredits: 2.7,
    inContactHours: 44,
    outCode: 'CS 210',
    outTitle: 'Systems Programming Concepts',
    outCredits: 3.0,
    outContactHours: 45,
    bucketId: 'cs-core',
    topics: [
      {label: 'Pointers & manual memory', covered: true},
      {label: 'Compilation & linking model', covered: true},
      {label: 'Templates / generics', covered: true},
      {label: 'C-style strings & arrays', covered: false},
      {label: 'Debugging with gdb/valgrind', covered: false},
      {label: 'Build systems (make)', covered: false},
    ],
    syllabusExcerpt:
      'CS 12C — Programming Paradigms (4 units). Object-oriented and generic\\nprogramming in C++: classes, inheritance, operator overloading,\\ntemplates, STL containers, and pointer-based structures. Capstone\\nproject: templated container library.',
    syllabusSource: 'Syllabus PDF · FRCC 2025–26 catalog · uploaded Jun 14',
    precedents: [
      {caseId: 'ART-1290', term: 'FA25', evaluator: 'R. Okafor', outcome: 'denied'},
    ],
    initialDecision: 'pending',
  },
];

/** Deny reasons offered by the evidence pane's deny selector. */
const DENY_REASONS = [
  'Topic coverage gap',
  'Insufficient contact hours',
  'Sending course below college level',
  'Duplicate of earned credit',
  'Activity credit exceeds 2-credit cap',
] as const;

const STUDENT = {
  name: 'Maya Torres',
  sid: 'MSU-2296014',
  program: 'B.S. Computer Science',
  admitTerm: 'Fall 2026',
  sending: 'Foothill Ridge Community College',
  receiving: 'Marden State University',
} as const;

// Frozen session clock for the activity ledger: 09:41:00 + 90s per entry.
const SESSION_CLOCK_START = 9 * 3600 + 41 * 60; // 09:41:00
const SESSION_CLOCK_STEP = 90;

function formatClock(totalSeconds: number): string {
  const pad = (part: number) => String(part).padStart(2, '0');
  const hours = Math.floor(totalSeconds / 3600) % 24;
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return \`\${pad(hours)}:\${pad(minutes)}:\${pad(seconds)}\`;
}

/** Credits render with one decimal everywhere (3.3, 4.0) — display rule. */
function formatCredits(value: number): string {
  return value.toFixed(1);
}

function coveragePct(topics: Topic[]): number | null {
  if (topics.length === 0) {
    return null;
  }
  const covered = topics.filter(topic => topic.covered).length;
  return Math.round((covered / topics.length) * 100);
}

type MatchStrength = 'strong' | 'partial' | 'weak' | 'none';

function matchStrength(pct: number | null): MatchStrength {
  if (pct === null) {
    return 'none';
  }
  if (pct >= 80) {
    return 'strong';
  }
  if (pct >= 60) {
    return 'partial';
  }
  return 'weak';
}

const MATCH_LABEL: Record<MatchStrength, string> = {
  strong: 'Strong match',
  partial: 'Partial match',
  weak: 'Weak match',
  none: 'No articulation basis',
};

// ---------------------------------------------------------------------------
// TEMPLATE CSS — every selector is prefixed with the tpl- scope class.
// Density grid repeated verbatim: header 56 · audit rail 252 · evidence
// pane 340 · pair rows 92 · bucket rows 48 · topic rows 32 · ring 108 ·
// ledger rows 36 · activity rows 40 · decision buttons 36 (44 touch) ·
// 12px gutter · 10px panel radius.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  --art-accent: \${ACCENT};
  --art-accent-tint: \${ACCENT_TINT};
  --art-approve: \${APPROVE};
  --art-approve-tint: \${APPROVE_TINT};
  --art-deny: \${DENY};
  --art-deny-tint: \${DENY_TINT};
  --art-mono: \${MONO_FONT};
  color: var(--color-text-primary);
  font-family: var(--font-family-sans, system-ui, sans-serif);
}
.\${SCOPE} * {
  box-sizing: border-box;
}
.\${SCOPE} h1,
.\${SCOPE} h2,
.\${SCOPE} h3,
.\${SCOPE} p,
.\${SCOPE} ul,
.\${SCOPE} ol {
  margin: 0;
}
.\${SCOPE} ul,
.\${SCOPE} ol {
  list-style: none;
  padding: 0;
}
.\${SCOPE} button {
  font-family: inherit;
}
.\${SCOPE} button:focus-visible,
.\${SCOPE} select:focus-visible {
  outline: 2px solid var(--art-accent);
  outline-offset: 2px;
}

/* ---- header (56px) ---- */
.\${SCOPE}.topbar {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
  width: 100%;
}
.\${SCOPE} .brandCluster {
  align-items: center;
  display: flex;
  flex: 1 1 auto;
  gap: var(--spacing-3);
  min-width: 0;
}
.\${SCOPE} .brandMark {
  flex: none;
  height: 36px;
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
}
.\${SCOPE} .pageTitle {
  font-size: 16px;
  font-weight: 700;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .caseMeta {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .caseMeta .mono {
  font-family: var(--art-mono);
  font-size: 11.5px;
}
.\${SCOPE} .headerActions {
  align-items: center;
  display: flex;
  flex: none;
  gap: var(--spacing-2);
}
.\${SCOPE} .decidedChip {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  display: inline-flex;
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  font-weight: 600;
  gap: 6px;
  min-height: 28px;
  padding: 2px 12px;
  white-space: nowrap;
}
.\${SCOPE} .decidedChip.isComplete {
  background: var(--art-approve-tint);
  border-color: var(--art-approve);
  color: var(--art-approve);
}
.\${SCOPE} .postButton {
  align-items: center;
  background: var(--art-accent);
  border: none;
  border-radius: 8px;
  color: light-dark(#FFFFFF, #221703);
  cursor: pointer;
  display: inline-flex;
  font-size: 13px;
  font-weight: 600;
  gap: 8px;
  min-height: 36px;
  padding: 6px 14px;
  white-space: nowrap;
}
.\${SCOPE} .postButton:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.\${SCOPE} .postedBadge {
  align-items: center;
  background: var(--art-approve-tint);
  border-radius: 999px;
  color: var(--art-approve);
  display: inline-flex;
  font-size: 12px;
  font-weight: 600;
  gap: 6px;
  min-height: 28px;
  padding: 2px 12px;
  white-space: nowrap;
}

/* ---- workspace: 252px rail · fluid mapper · 340px evidence, 12px gutter.
   The default 3-column layout is sized to fit the ~1045px inline demo
   stage with no media query. ---- */
.\${SCOPE}.workspace {
  background: var(--color-background-body);
  display: grid;
  gap: var(--spacing-3);
  grid-template-columns: 252px minmax(0, 1fr) 340px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: var(--spacing-3);
}
.\${SCOPE} .panel {
  background: var(--color-background-card, var(--color-background-body));
  border: var(--border-width) solid var(--color-border);
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.\${SCOPE} .panelHead {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex;
  flex: none;
  gap: var(--spacing-2);
  justify-content: space-between;
  min-height: 40px;
  padding: var(--spacing-2) var(--spacing-3);
}
.\${SCOPE} .panelTitle {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.\${SCOPE} .panelScroll {
  flex: 1 1 auto;
  min-height: 0;
  overflow-y: auto;
}

/* ---- audit rail ---- */
.\${SCOPE} .ringBlock {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
}
.\${SCOPE} .ringSvg {
  flex: none;
  height: 108px;
  width: 108px;
}
.\${SCOPE} .ringTrack {
  fill: none;
  stroke: var(--color-border);
  stroke-width: 10;
}
.\${SCOPE} .ringSweep {
  fill: none;
  stroke: var(--art-accent);
  stroke-linecap: round;
  stroke-width: 10;
  transition: stroke-dashoffset 420ms cubic-bezier(0.4, 0, 0.2, 1);
}
.\${SCOPE} .ringPct {
  fill: var(--color-text-primary);
  font-family: var(--font-family-sans, system-ui, sans-serif);
  font-size: 24px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
}
.\${SCOPE} .ringCaption {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.45;
  min-width: 0;
}
.\${SCOPE} .ringCaption strong {
  color: var(--color-text-primary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .ledger {
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--spacing-2) var(--spacing-3);
}
.\${SCOPE} .ledgerRow {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  justify-content: space-between;
  min-height: 36px;
}
.\${SCOPE} .ledgerLabel {
  align-items: center;
  display: inline-flex;
  font-size: 12.5px;
  gap: 8px;
}
.\${SCOPE} .ledgerDot {
  border-radius: 999px;
  flex: none;
  height: 8px;
  width: 8px;
}
.\${SCOPE} .ledgerDot.approved { background: var(--art-approve); }
.\${SCOPE} .ledgerDot.pending { background: var(--art-accent); }
.\${SCOPE} .ledgerDot.denied { background: var(--art-deny); }
.\${SCOPE} .ledgerValue {
  font-family: var(--art-mono);
  font-size: 12.5px;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .ledgerTotal {
  border-top: var(--border-width) dashed var(--color-border);
  color: var(--color-text-secondary);
  font-size: 12px;
}
.\${SCOPE} .bucketList {
  border-top: var(--border-width) solid var(--color-border);
  padding: var(--spacing-2) 0;
}
.\${SCOPE} .bucketRow {
  display: grid;
  gap: 2px 8px;
  grid-template-columns: minmax(0, 1fr) auto;
  min-height: 48px;
  padding: 6px var(--spacing-3);
}
.\${SCOPE} .bucketName {
  font-size: 12.5px;
  font-weight: 600;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .bucketFigures {
  color: var(--color-text-secondary);
  font-family: var(--art-mono);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}
.\${SCOPE} .bucketTrack {
  background: var(--color-border);
  border-radius: 999px;
  grid-column: 1 / -1;
  height: 4px;
  overflow: hidden;
}
.\${SCOPE} .bucketFill {
  background: var(--art-accent);
  border-radius: 999px;
  height: 100%;
  transition: width 420ms cubic-bezier(0.4, 0, 0.2, 1);
}
.\${SCOPE} .bucketRow.isSatisfied .bucketFill {
  background: var(--art-approve);
}
.\${SCOPE} .bucketRemaining {
  color: var(--color-text-secondary);
  font-size: 11px;
  grid-column: 1 / -1;
}
.\${SCOPE} .bucketRow.isSatisfied .bucketRemaining {
  color: var(--art-approve);
  font-weight: 600;
}

/* ---- mapper ---- */
.\${SCOPE} .instHeader {
  border-bottom: var(--border-width) solid var(--color-border);
  display: grid;
  flex: none;
  gap: var(--spacing-2);
  grid-template-columns: minmax(0, 1fr) 40px minmax(0, 1fr);
  padding: var(--spacing-2) var(--spacing-3);
}
.\${SCOPE} .instCell {
  min-width: 0;
}
.\${SCOPE} .instName {
  font-size: 12px;
  font-weight: 700;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .instUnits {
  color: var(--color-text-secondary);
  font-size: 11px;
}
.\${SCOPE} .instArrow {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  justify-content: center;
}
.\${SCOPE} .pairList {
  padding: var(--spacing-2);
}
.\${SCOPE} .pairRow {
  align-items: stretch;
  background: transparent;
  border: var(--border-width) solid transparent;
  border-radius: 8px;
  cursor: pointer;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: minmax(0, 1fr) 40px minmax(0, 1fr);
  min-height: 92px;
  padding: var(--spacing-2) var(--spacing-2);
  text-align: left;
  width: 100%;
}
.\${SCOPE} .pairRow + .pairRow {
  margin-top: 4px;
}
@media (hover: hover) {
  .\${SCOPE} .pairRow:hover {
    background: var(--color-background-hover, var(--art-accent-tint));
  }
}
.\${SCOPE} .pairRow[aria-pressed='true'] {
  background: var(--art-accent-tint);
  border-color: var(--art-accent);
}
.\${SCOPE} .courseCell {
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
  min-width: 0;
}
.\${SCOPE} .courseCode {
  align-items: baseline;
  display: flex;
  gap: 8px;
  min-width: 0;
}
.\${SCOPE} .courseCode .code {
  font-family: var(--art-mono);
  font-size: 12.5px;
  font-weight: 700;
  white-space: nowrap;
}
.\${SCOPE} .courseCode .units {
  color: var(--color-text-secondary);
  font-family: var(--art-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
.\${SCOPE} .courseTitle {
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  color: var(--color-text-secondary);
  display: -webkit-box;
  font-size: 12px;
  line-height: 1.35;
  overflow: hidden;
}
.\${SCOPE} .courseTag {
  color: var(--color-text-secondary);
  font-size: 10.5px;
  letter-spacing: 0.03em;
  text-transform: uppercase;
}
.\${SCOPE} .seamCell {
  align-items: center;
  display: flex;
  flex-direction: column;
  gap: 2px;
  justify-content: center;
}
.\${SCOPE} .seamState {
  font-size: 9.5px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
.\${SCOPE} .seamState.pending { color: var(--color-text-secondary); }
.\${SCOPE} .seamState.approved { color: var(--art-approve); }
.\${SCOPE} .seamState.denied { color: var(--art-deny); }
.\${SCOPE} .mapperTotals {
  align-items: center;
  border-top: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  display: flex;
  flex: none;
  font-size: 12px;
  gap: var(--spacing-2);
  justify-content: space-between;
  min-height: 40px;
  padding: var(--spacing-2) var(--spacing-3);
}
.\${SCOPE} .mapperTotals .mono {
  font-family: var(--art-mono);
  font-variant-numeric: tabular-nums;
}

/* ---- evidence pane ---- */
.\${SCOPE} .evidenceHead {
  border-bottom: var(--border-width) solid var(--color-border);
  flex: none;
  padding: var(--spacing-3);
}
.\${SCOPE} .evidencePair {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px 10px;
}
.\${SCOPE} .evidencePair .code {
  font-family: var(--art-mono);
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
}
.\${SCOPE} .evidenceTitle {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.35;
  margin-top: 4px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .statusChip {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 11px;
  font-weight: 700;
  gap: 5px;
  letter-spacing: 0.03em;
  min-height: 22px;
  padding: 1px 10px;
  text-transform: uppercase;
  white-space: nowrap;
}
.\${SCOPE} .statusChip.pending {
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.\${SCOPE} .statusChip.approved {
  background: var(--art-approve-tint);
  color: var(--art-approve);
}
.\${SCOPE} .statusChip.denied {
  background: var(--art-deny-tint);
  color: var(--art-deny);
}
.\${SCOPE} .evidenceSection {
  border-bottom: var(--border-width) solid var(--color-border);
  padding: var(--spacing-3);
}
.\${SCOPE} .evidenceSection:last-child {
  border-bottom: none;
}
.\${SCOPE} .sectionLabel {
  align-items: center;
  color: var(--color-text-secondary);
  display: flex;
  font-size: 11px;
  font-weight: 700;
  gap: 6px;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-2);
  text-transform: uppercase;
}
.\${SCOPE} .mathLine {
  font-family: var(--art-mono);
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  line-height: 1.6;
}
.\${SCOPE} .mathLine .dim {
  color: var(--color-text-secondary);
}
.\${SCOPE} .hoursRow {
  align-items: center;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: 72px minmax(0, 1fr) 56px;
  min-height: 28px;
}
.\${SCOPE} .hoursName {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  white-space: nowrap;
}
.\${SCOPE} .hoursTrack {
  background: var(--color-border);
  border-radius: 999px;
  height: 5px;
  overflow: hidden;
}
.\${SCOPE} .hoursFill {
  background: var(--art-accent);
  border-radius: 999px;
  height: 100%;
}
.\${SCOPE} .hoursValue {
  font-family: var(--art-mono);
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  text-align: right;
  white-space: nowrap;
}
.\${SCOPE} .hoursNote {
  color: var(--color-text-secondary);
  font-size: 11px;
  margin-top: 4px;
}
.\${SCOPE} .matchMeter {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  margin-bottom: var(--spacing-2);
}
.\${SCOPE} .matchTrack {
  background: var(--color-border);
  border-radius: 999px;
  flex: 1 1 auto;
  height: 6px;
  overflow: hidden;
}
.\${SCOPE} .matchFill {
  border-radius: 999px;
  height: 100%;
  transition: width 300ms cubic-bezier(0.4, 0, 0.2, 1);
}
.\${SCOPE} .matchFill.strong { background: var(--art-approve); }
.\${SCOPE} .matchFill.partial { background: var(--art-accent); }
.\${SCOPE} .matchFill.weak { background: var(--art-deny); }
.\${SCOPE} .matchChip {
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  font-weight: 700;
  white-space: nowrap;
}
.\${SCOPE} .matchChip.strong { color: var(--art-approve); }
.\${SCOPE} .matchChip.partial { color: var(--art-accent); }
.\${SCOPE} .matchChip.weak { color: var(--art-deny); }
.\${SCOPE} .matchChip.none { color: var(--color-text-secondary); }
.\${SCOPE} .topicRow {
  align-items: center;
  display: flex;
  gap: 8px;
  min-height: 32px;
}
.\${SCOPE} .topicRow .topicIcon {
  align-items: center;
  display: inline-flex;
  flex: none;
}
.\${SCOPE} .topicRow.covered .topicIcon { color: var(--art-approve); }
.\${SCOPE} .topicRow.missing .topicIcon { color: var(--art-deny); }
.\${SCOPE} .topicText {
  font-size: 12.5px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .topicRow.missing .topicText {
  color: var(--color-text-secondary);
}
.\${SCOPE} .excerptBlock {
  background: light-dark(#F6F4EF, #14120E);
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  font-family: var(--art-mono);
  font-size: 11.5px;
  line-height: 1.65;
  margin: 0;
  overflow-x: auto;
  padding: var(--spacing-3);
  white-space: pre-wrap;
}
.\${SCOPE} .sourceLine {
  color: var(--color-text-secondary);
  font-size: 11px;
  margin-top: 6px;
}
.\${SCOPE} .gateBox {
  background: var(--art-accent-tint);
  border: var(--border-width) solid var(--art-accent);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
}
.\${SCOPE} .gateText {
  color: var(--art-accent);
  font-size: 12.5px;
  font-weight: 600;
  line-height: 1.4;
}
.\${SCOPE} .gateActions {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.\${SCOPE} .ghostButton {
  align-items: center;
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  cursor: pointer;
  display: inline-flex;
  font-size: 12.5px;
  font-weight: 600;
  gap: 8px;
  min-height: 36px;
  padding: 4px 12px;
  white-space: nowrap;
}
.\${SCOPE} .ghostButton:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}
.\${SCOPE} .waiverToggle {
  align-items: flex-start;
  background: transparent;
  border: none;
  color: var(--color-text-primary);
  cursor: pointer;
  display: flex;
  font-size: 12.5px;
  gap: 8px;
  line-height: 1.4;
  min-height: 36px;
  padding: 4px 0;
  text-align: left;
}
.\${SCOPE} .waiverToggle .checkbox {
  align-items: center;
  border: var(--border-width) solid var(--color-border);
  border-radius: 4px;
  color: transparent;
  display: inline-flex;
  flex: none;
  height: 18px;
  justify-content: center;
  margin-top: 1px;
  width: 18px;
}
.\${SCOPE} .waiverToggle[aria-pressed='true'] .checkbox {
  background: var(--art-accent);
  border-color: var(--art-accent);
  color: light-dark(#FFFFFF, #221703);
}
.\${SCOPE} .precedentRow {
  align-items: center;
  display: flex;
  gap: var(--spacing-2);
  min-height: 32px;
}
.\${SCOPE} .precedentRow .caseId {
  font-family: var(--art-mono);
  font-size: 11.5px;
  font-weight: 700;
  white-space: nowrap;
}
.\${SCOPE} .precedentRow .meta {
  color: var(--color-text-secondary);
  flex: 1 1 auto;
  font-size: 11.5px;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.\${SCOPE} .precedentRow .outcome {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}
.\${SCOPE} .precedentRow .outcome.approved { color: var(--art-approve); }
.\${SCOPE} .precedentRow .outcome.denied { color: var(--art-deny); }

/* ---- decision bar (sticky at the pane bottom) ---- */
.\${SCOPE} .decisionBar {
  background: var(--color-background-card, var(--color-background-body));
  border-top: var(--border-width) solid var(--color-border);
  bottom: 0;
  display: flex;
  flex: none;
  flex-direction: column;
  gap: var(--spacing-2);
  padding: var(--spacing-3);
  position: sticky;
}
.\${SCOPE} .decisionRow {
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.\${SCOPE} .approveButton {
  align-items: center;
  background: var(--art-approve);
  border: none;
  border-radius: 8px;
  color: light-dark(#FFFFFF, #06251B);
  cursor: pointer;
  display: inline-flex;
  flex: 1 1 auto;
  font-size: 13px;
  font-weight: 700;
  gap: 8px;
  justify-content: center;
  min-height: 36px;
  padding: 6px 12px;
}
.\${SCOPE} .approveButton:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.\${SCOPE} .denyButton {
  align-items: center;
  background: transparent;
  border: var(--border-width) solid var(--art-deny);
  border-radius: 8px;
  color: var(--art-deny);
  cursor: pointer;
  display: inline-flex;
  flex: 1 1 auto;
  font-size: 13px;
  font-weight: 700;
  gap: 8px;
  justify-content: center;
  min-height: 36px;
  padding: 6px 12px;
}
.\${SCOPE} .denyButton:disabled {
  cursor: not-allowed;
  opacity: 0.45;
}
.\${SCOPE} .reasonSelect {
  background: var(--color-background-card, var(--color-background-body));
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
  color: var(--color-text-primary);
  font-family: inherit;
  font-size: 12.5px;
  min-height: 36px;
  padding: 4px 10px;
  width: 100%;
}
.\${SCOPE} .gateHint {
  color: var(--color-text-secondary);
  font-size: 11.5px;
  line-height: 1.4;
}
.\${SCOPE} .decidedLine {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
  justify-content: space-between;
}
.\${SCOPE} .decidedText {
  font-size: 12.5px;
  line-height: 1.4;
}
.\${SCOPE} .decidedText .reason {
  color: var(--color-text-secondary);
}

/* ---- activity ledger ---- */
.\${SCOPE} .activityRow {
  align-items: flex-start;
  display: flex;
  gap: var(--spacing-2);
  min-height: 40px;
  padding: 4px 0;
}
.\${SCOPE} .activityClock {
  color: var(--color-text-secondary);
  flex: none;
  font-family: var(--art-mono);
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  padding-top: 2px;
}
.\${SCOPE} .activityText {
  font-size: 12px;
  line-height: 1.45;
  min-width: 0;
}
.\${SCOPE} .activityText.approved { color: var(--art-approve); }
.\${SCOPE} .activityText.denied { color: var(--art-deny); }

/* ---- a11y utility ---- */
.\${SCOPE}.visuallyHidden,
.\${SCOPE} .visuallyHidden {
  clip-path: inset(50%);
  height: 1px;
  margin: -1px;
  overflow: hidden;
  position: absolute;
  white-space: nowrap;
  width: 1px;
}

/* ---- responsive: subtraction, not squeeze ---- */
@media (max-width: 940px) {
  .\${SCOPE}.workspace {
    grid-template-columns: minmax(0, 1fr) 340px;
    overflow-y: auto;
  }
  .\${SCOPE} .auditRail {
    grid-column: 1 / -1;
  }
  .\${SCOPE} .auditRail .bucketList {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
  .\${SCOPE} .mapperPanel,
  .\${SCOPE} .evidencePanel {
    max-height: none;
  }
}
@media (max-width: 700px) {
  .\${SCOPE}.workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .\${SCOPE} .auditRail .bucketList {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
  .\${SCOPE} .headerActions .decidedChip {
    display: none;
  }
}
@media (max-width: 480px) {
  .\${SCOPE} .pairRow {
    grid-template-columns: minmax(0, 1fr);
    min-height: 0;
  }
  .\${SCOPE} .seamCell {
    flex-direction: row;
    gap: 8px;
    justify-content: flex-start;
  }
  .\${SCOPE} .seamCell .seamSvg {
    transform: rotate(90deg);
  }
  .\${SCOPE} .auditRail .bucketList {
    grid-template-columns: minmax(0, 1fr);
  }
  .\${SCOPE} .approveButton,
  .\${SCOPE} .denyButton,
  .\${SCOPE} .ghostButton,
  .\${SCOPE} .postButton,
  .\${SCOPE} .reasonSelect {
    min-height: 44px;
  }
  .\${SCOPE} .caseMeta {
    display: none;
  }
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} .ringSweep,
  .\${SCOPE} .bucketFill,
  .\${SCOPE} .matchFill {
    transition: none;
  }
}
\`;

// ---------------------------------------------------------------------------
// DOMAIN GLYPHS — tiny inline SVGs (no emoji, no network assets).
// ---------------------------------------------------------------------------

/**
 * Articula mark: two course "columns" joined by an articulation bridge —
 * the ligature the product draws between institutions.
 */
function BrandMark() {
  return (
    <svg
      className="brandMark"
      viewBox="0 0 36 36"
      role="img"
      aria-label="Articula">
      <rect
        x="1"
        y="1"
        width="34"
        height="34"
        rx="8"
        fill="var(--art-accent)"
      />
      <rect x="8" y="10" width="6" height="16" rx="1.5" fill="light-dark(#FFFFFF, #221703)" />
      <rect x="22" y="10" width="6" height="16" rx="1.5" fill="light-dark(#FFFFFF, #221703)" />
      <path
        d="M11 14 C 15 8, 21 8, 25 14"
        fill="none"
        stroke="light-dark(#FFFFFF, #221703)"
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      <circle cx="18" cy="9.4" r="1.6" fill="light-dark(#FFFFFF, #221703)" />
    </svg>
  );
}

/**
 * Seam-arrow glyph between the two sides of a pair row. The stroke
 * encodes the decision: dashed neutral = pending, solid green = approved,
 * crossed red = denied. Rotated 90° by CSS when pair rows stack (<=480px).
 */
function SeamGlyph({decision}: {decision: Decision}) {
  const stroke =
    decision === 'approved'
      ? 'var(--art-approve)'
      : decision === 'denied'
        ? 'var(--art-deny)'
        : 'var(--color-text-secondary)';
  return (
    <svg
      className="seamSvg"
      width="36"
      height="16"
      viewBox="0 0 36 16"
      aria-hidden="true">
      <line
        x1="2"
        y1="8"
        x2="26"
        y2="8"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeDasharray={decision === 'pending' ? '3 4' : undefined}
      />
      <path
        d="M25 3 L 32 8 L 25 13"
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {decision === 'denied' && (
        <g stroke={stroke} strokeWidth="2" strokeLinecap="round">
          <line x1="11" y1="3" x2="19" y2="13" />
          <line x1="19" y1="3" x2="11" y2="13" />
        </g>
      )}
    </svg>
  );
}

/**
 * Degree-audit ring: r=44 → circumference 2π·44 = 276.46. The sweep's
 * dashoffset is C·(1−pct/100); the 420ms transition lives in CSS and
 * collapses under prefers-reduced-motion.
 */
const RING_RADIUS = 44;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS; // 276.46

function AuditRing({pct}: {pct: number}) {
  const clamped = Math.max(0, Math.min(100, pct));
  const offset = RING_CIRCUMFERENCE * (1 - clamped / 100);
  return (
    <svg
      className="ringSvg"
      viewBox="0 0 108 108"
      role="img"
      aria-label={\`Degree audit \${Math.round(clamped)} percent articulated\`}>
      <circle className="ringTrack" cx="54" cy="54" r={RING_RADIUS} />
      <circle
        className="ringSweep"
        cx="54"
        cy="54"
        r={RING_RADIUS}
        strokeDasharray={RING_CIRCUMFERENCE}
        strokeDashoffset={offset}
        transform="rotate(-90 54 54)"
      />
      <text className="ringPct" x="54" y="61" textAnchor="middle">
        {Math.round(clamped)}%
      </text>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

interface MappingState {
  decision: Decision;
  denyReason: string | null;
  syllabusRequested: boolean;
  precedentApplied: boolean;
}

interface ActivityEntry {
  id: string;
  clock: string;
  text: string;
  tone: 'approved' | 'denied' | 'neutral';
}

function initialStates(): Record<string, MappingState> {
  const states: Record<string, MappingState> = {};
  for (const mapping of MAPPINGS) {
    states[mapping.id] = {
      decision: mapping.initialDecision,
      denyReason: mapping.initialDenyReason ?? null,
      syllabusRequested: false,
      precedentApplied: false,
    };
  }
  return states;
}

/** Pre-session entries carry fixed clocks BEFORE the 09:41:00 session. */
const INITIAL_ACTIVITY: ActivityEntry[] = [
  {
    id: 'act-seed-3',
    clock: '09:38:30',
    text: 'KIN 22 denied — activity credit exceeds 2-credit cap (R. Okafor)',
    tone: 'denied',
  },
  {
    id: 'act-seed-2',
    clock: '09:35:00',
    text: 'ENGL 1A → WRIT 105 approved · 2.7 cr to Written Communication',
    tone: 'approved',
  },
  {
    id: 'act-seed-1',
    clock: '09:31:30',
    text: 'CS 12A → CS 101 approved · 2.7 cr to CS Major Core',
    tone: 'approved',
  },
];

function mappingOf(id: string): Mapping {
  return MAPPINGS.find(mapping => mapping.id === id) ?? MAPPINGS[0];
}

export default function RegistrarTransferCredit() {
  const toast = useToast();

  const [states, setStates] = useState<Record<string, MappingState>>(
    initialStates,
  );
  const [selectedId, setSelectedId] = useState<string>('map-math1b');
  const [denyReasonDraft, setDenyReasonDraft] = useState<string>(
    DENY_REASONS[0],
  );
  const [activity, setActivity] = useState<ActivityEntry[]>(INITIAL_ACTIVITY);
  const [sessionSteps, setSessionSteps] = useState(0);
  const [posted, setPosted] = useState(false);
  const [announcement, setAnnouncement] = useState('');

  // ---- derived (single decisions store → every surface) ----

  const selected = mappingOf(selectedId);
  const selectedState = states[selected.id];

  const articulated = MAPPINGS.reduce(
    (sum, mapping) =>
      states[mapping.id].decision === 'approved'
        ? sum + mapping.semCredits
        : sum,
    0,
  );
  const deniedCredits = MAPPINGS.reduce(
    (sum, mapping) =>
      states[mapping.id].decision === 'denied'
        ? sum + mapping.semCredits
        : sum,
    0,
  );
  const incomingTotal = MAPPINGS.reduce(
    (sum, mapping) => sum + mapping.semCredits,
    0,
  );
  const incomingQuarter = MAPPINGS.reduce(
    (sum, mapping) => sum + mapping.quarterUnits,
    0,
  );
  const pendingCredits = incomingTotal - articulated - deniedCredits;
  const decidedCount = MAPPINGS.filter(
    mapping => states[mapping.id].decision !== 'pending',
  ).length;
  const ringPct = (articulated / BUCKET_TOTAL_NEEDED) * 100;

  const appliedByBucket = useMemo(() => {
    const applied: Record<BucketId, number> = {
      'written-comm': 0,
      'quant-core': 0,
      'cs-core': 0,
      'nat-sci': 0,
      'humanities': 0,
      'free-elec': 0,
    };
    for (const mapping of MAPPINGS) {
      if (states[mapping.id].decision === 'approved') {
        applied[mapping.bucketId] += mapping.semCredits;
      }
    }
    return applied;
  }, [states]);

  const selectedPct = coveragePct(selected.topics);
  const selectedStrength = matchStrength(selectedPct);

  // Evidence gate: a missing syllabus blocks approval unless the waiver
  // precedent is applied. Requesting the syllabus logs the request but
  // cannot resolve it in-session (fixtures are frozen).
  const evidenceGated =
    selected.syllabusExcerpt === null && !selectedState.precedentApplied;

  const postReady = decidedCount === MAPPINGS.length && !posted;

  // ---- mutation helpers (one store, observable consequences) ----

  const appendActivity = (text: string, tone: ActivityEntry['tone']) => {
    const clock = formatClock(
      SESSION_CLOCK_START + sessionSteps * SESSION_CLOCK_STEP,
    );
    setActivity(prev => [
      {id: \`act-\${sessionSteps}\`, clock, text, tone},
      ...prev,
    ]);
    setSessionSteps(prev => prev + 1);
    return clock;
  };

  const patchState = (id: string, patch: Partial<MappingState>) => {
    setStates(prev => ({...prev, [id]: {...prev[id], ...patch}}));
  };

  const selectMapping = (id: string) => {
    setSelectedId(id);
    setDenyReasonDraft(DENY_REASONS[0]);
  };

  const approveSelected = () => {
    if (posted || selectedState.decision !== 'pending' || evidenceGated) {
      return;
    }
    patchState(selected.id, {decision: 'approved'});
    appendActivity(
      \`\${selected.inCode} → \${selected.outCode} approved · \${formatCredits(
        selected.semCredits,
      )} cr to \${BUCKETS.find(b => b.id === selected.bucketId)?.label ?? ''}\`,
      'approved',
    );
    toast({
      body: \`\${selected.inCode} approved — \${formatCredits(
        selected.semCredits,
      )} cr applied to the degree audit\`,
      isAutoHide: true,
    });
    setAnnouncement(
      \`\${selected.inCode} approved. Degree audit now \${Math.round(
        ((articulated + selected.semCredits) / BUCKET_TOTAL_NEEDED) * 100,
      )} percent articulated.\`,
    );
  };

  const denySelected = () => {
    if (posted || selectedState.decision !== 'pending') {
      return;
    }
    patchState(selected.id, {
      decision: 'denied',
      denyReason: denyReasonDraft,
    });
    appendActivity(
      \`\${selected.inCode} denied — \${denyReasonDraft.toLowerCase()}\`,
      'denied',
    );
    toast({
      body: \`\${selected.inCode} denied — \${denyReasonDraft}\`,
      isAutoHide: true,
    });
    setAnnouncement(\`\${selected.inCode} denied. \${denyReasonDraft}.\`);
  };

  const reopenSelected = () => {
    if (posted || selectedState.decision === 'pending') {
      return;
    }
    const wasApproved = selectedState.decision === 'approved';
    patchState(selected.id, {decision: 'pending', denyReason: null});
    appendActivity(
      \`\${selected.inCode} reopened\${
        wasApproved
          ? \` — \${formatCredits(selected.semCredits)} cr removed from the audit\`
          : ''
      }\`,
      'neutral',
    );
    toast({body: \`\${selected.inCode} reopened\`, isAutoHide: true});
    setAnnouncement(\`\${selected.inCode} decision reopened.\`);
  };

  const requestSyllabus = () => {
    if (selectedState.syllabusRequested) {
      return;
    }
    const clock = appendActivity(
      \`Syllabus requested from \${STUDENT.sending} for \${selected.inCode}\`,
      'neutral',
    );
    patchState(selected.id, {syllabusRequested: true});
    toast({
      body: \`Syllabus request sent at \${clock} — decision stays gated until it arrives or a precedent is applied\`,
      isAutoHide: true,
    });
  };

  const togglePrecedentWaiver = () => {
    const next = !selectedState.precedentApplied;
    patchState(selected.id, {precedentApplied: next});
    appendActivity(
      next
        ? \`Precedent \${selected.waiverPrecedentId ?? ''} applied to \${
            selected.inCode
          } — syllabus requirement waived\`
        : \`Precedent waiver removed from \${selected.inCode} — approval re-gated\`,
      'neutral',
    );
    setAnnouncement(
      next
        ? \`Precedent applied. Approve is now enabled for \${selected.inCode}.\`
        : \`Precedent removed. Approve is gated again for \${selected.inCode}.\`,
    );
  };

  const postCase = () => {
    if (!postReady) {
      return;
    }
    const clock = appendActivity(
      \`Case posted to the transcript — \${formatCredits(
        articulated,
      )} cr articulated, \${formatCredits(deniedCredits)} cr denied\`,
      'approved',
    );
    setPosted(true);
    toast({
      body: \`Posted to Banner SIS at \${clock} — decisions are now frozen\`,
      isAutoHide: true,
    });
    setAnnouncement('Case posted to the transcript. Decisions are frozen.');
  };

  // ---- surfaces ----

  const auditRail = (
    <aside
      className="panel auditRail"
      aria-label="Degree audit — articulated credit progress">
      <div className="panelHead">
        <p className="panelTitle">Degree audit</p>
        <Icon icon={GraduationCapIcon} size="sm" color="secondary" />
      </div>
      <div className="panelScroll">
        <div className="ringBlock">
          <AuditRing pct={ringPct} />
          <p className="ringCaption">
            <strong>{formatCredits(articulated)}</strong> of{' '}
            <strong>{formatCredits(BUCKET_TOTAL_NEEDED)}</strong> lower-division
            credits articulated from transfer work
          </p>
        </div>
        <div className="ledger" aria-label="Incoming credit ledger">
          <div className="ledgerRow">
            <span className="ledgerLabel">
              <span className="ledgerDot approved" aria-hidden="true" />
              Articulated
            </span>
            <span className="ledgerValue">
              {formatCredits(articulated)} cr
            </span>
          </div>
          <div className="ledgerRow">
            <span className="ledgerLabel">
              <span className="ledgerDot pending" aria-hidden="true" />
              Pending review
            </span>
            <span className="ledgerValue">
              {formatCredits(pendingCredits)} cr
            </span>
          </div>
          <div className="ledgerRow">
            <span className="ledgerLabel">
              <span className="ledgerDot denied" aria-hidden="true" />
              Denied
            </span>
            <span className="ledgerValue">
              {formatCredits(deniedCredits)} cr
            </span>
          </div>
          <div className="ledgerRow ledgerTotal">
            <span className="ledgerLabel">Incoming total</span>
            <span className="ledgerValue">
              {formatCredits(incomingTotal)} cr
            </span>
          </div>
        </div>
        <ul className="bucketList" aria-label="Remaining credits by requirement">
          {BUCKETS.map(bucket => {
            const applied = appliedByBucket[bucket.id];
            const remaining = Math.max(0, bucket.needed - applied);
            const satisfied = remaining === 0;
            const fillPct = Math.min(100, (applied / bucket.needed) * 100);
            return (
              <li
                key={bucket.id}
                className={\`bucketRow\${satisfied ? ' isSatisfied' : ''}\`}>
                <span className="bucketName">{bucket.label}</span>
                <span className="bucketFigures">
                  {formatCredits(applied)} / {formatCredits(bucket.needed)}
                </span>
                <span className="bucketTrack" aria-hidden="true">
                  <span
                    className="bucketFill"
                    style={{width: \`\${fillPct}%\`}}
                  />
                </span>
                <span className="bucketRemaining">
                  {satisfied
                    ? 'Requirement satisfied'
                    : \`\${formatCredits(remaining)} cr remaining\`}
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );

  const mapperPanel = (
    <section
      className="panel mapperPanel"
      aria-label="Equivalency mapper — incoming courses to catalog courses">
      <div className="panelHead">
        <p className="panelTitle">Equivalency mapper</p>
        <Icon icon={BookOpenIcon} size="sm" color="secondary" />
      </div>
      <div className="instHeader" aria-hidden="true">
        <div className="instCell">
          <p className="instName">{STUDENT.sending}</p>
          <p className="instUnits">Incoming · quarter units</p>
        </div>
        <div className="instArrow">
          <Icon icon={ArrowRightIcon} size="sm" color="inherit" />
        </div>
        <div className="instCell">
          <p className="instName">{STUDENT.receiving}</p>
          <p className="instUnits">Catalog · semester credits</p>
        </div>
      </div>
      <div className="panelScroll">
        <ul className="pairList">
          {MAPPINGS.map(mapping => {
            const state = states[mapping.id];
            const bucket = BUCKETS.find(b => b.id === mapping.bucketId);
            return (
              <li key={mapping.id}>
                <button
                  type="button"
                  className="pairRow"
                  aria-pressed={mapping.id === selectedId}
                  onClick={() => selectMapping(mapping.id)}>
                  <span className="courseCell">
                    <span className="courseCode">
                      <span className="code">{mapping.inCode}</span>
                      <span className="units">
                        {formatCredits(mapping.quarterUnits)} qu
                      </span>
                    </span>
                    <span className="courseTitle">{mapping.inTitle}</span>
                  </span>
                  <span className="seamCell">
                    <SeamGlyph decision={state.decision} />
                    <span className={\`seamState \${state.decision}\`}>
                      {state.decision}
                    </span>
                  </span>
                  <span className="courseCell">
                    <span className="courseCode">
                      <span className="code">{mapping.outCode}</span>
                      <span className="units">
                        {formatCredits(mapping.semCredits)} cr
                      </span>
                    </span>
                    <span className="courseTitle">{mapping.outTitle}</span>
                    <span className="courseTag">{bucket?.label}</span>
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      <div className="mapperTotals">
        <span>
          {MAPPINGS.length} mappings · {decidedCount} decided
        </span>
        <span className="mono">
          {formatCredits(incomingQuarter)} qu → {formatCredits(incomingTotal)}{' '}
          sem cr
        </span>
      </div>
    </section>
  );

  const decisionBar = (
    <div className="decisionBar">
      {selectedState.decision === 'pending' ? (
        <>
          {evidenceGated && (
            <p className="gateHint">
              Approval is gated: no syllabus on file. Request the syllabus or
              apply precedent {selected.waiverPrecedentId} below. Deny stays
              available.
            </p>
          )}
          <label className="visuallyHidden" htmlFor="tpl-rtc-deny-reason">
            Deny reason
          </label>
          <select
            id="tpl-rtc-deny-reason"
            className="reasonSelect"
            value={denyReasonDraft}
            disabled={posted}
            onChange={event => setDenyReasonDraft(event.target.value)}>
            {DENY_REASONS.map(reason => (
              <option key={reason} value={reason}>
                Deny reason: {reason}
              </option>
            ))}
          </select>
          <div className="decisionRow">
            <button
              type="button"
              className="approveButton"
              disabled={posted || evidenceGated}
              onClick={approveSelected}>
              <Icon icon={CheckIcon} size="sm" color="inherit" />
              Approve · {formatCredits(selected.semCredits)} cr
            </button>
            <button
              type="button"
              className="denyButton"
              disabled={posted}
              onClick={denySelected}>
              <Icon icon={XIcon} size="sm" color="inherit" />
              Deny
            </button>
          </div>
        </>
      ) : (
        <div className="decidedLine">
          <p className="decidedText">
            {selectedState.decision === 'approved' ? (
              <>
                Approved — {formatCredits(selected.semCredits)} cr applied to{' '}
                {BUCKETS.find(b => b.id === selected.bucketId)?.label}
              </>
            ) : (
              <>
                Denied
                {selectedState.denyReason !== null && (
                  <span className="reason"> — {selectedState.denyReason}</span>
                )}
              </>
            )}
          </p>
          <button
            type="button"
            className="ghostButton"
            disabled={posted}
            onClick={reopenSelected}>
            <Icon icon={Undo2Icon} size="sm" color="inherit" />
            {posted ? 'Posted — frozen' : 'Reopen'}
          </button>
        </div>
      )}
    </div>
  );

  const evidencePanel = (
    <aside
      className="panel evidencePanel"
      aria-label={\`Syllabus evidence for \${selected.inCode}\`}>
      <div className="evidenceHead">
        <div className="evidencePair">
          <span className="code">{selected.inCode}</span>
          <Icon icon={ArrowRightIcon} size="sm" color="secondary" />
          <span className="code">{selected.outCode}</span>
          <span className={\`statusChip \${selectedState.decision}\`}>
            {selectedState.decision}
          </span>
        </div>
        <p className="evidenceTitle">{selected.inTitle}</p>
      </div>
      <div className="panelScroll">
        <div className="evidenceSection">
          <p className="sectionLabel">
            <Icon icon={FileTextIcon} size="sm" color="inherit" />
            Credit conversion
          </p>
          <p className="mathLine">
            {formatCredits(selected.quarterUnits)} qu × 2⁄3 ={' '}
            {formatCredits(selected.semCredits)} sem cr{' '}
            <span className="dim">
              · catalog course carries {formatCredits(selected.outCredits)} cr
            </span>
          </p>
          <div className="hoursRow">
            <span className="hoursName">{selected.inCode}</span>
            <span className="hoursTrack" aria-hidden="true">
              <span
                className="hoursFill"
                style={{
                  width: \`\${
                    selected.outContactHours === 0
                      ? 100
                      : Math.min(
                          100,
                          (selected.inContactHours /
                            selected.outContactHours) *
                            100,
                        )
                  }%\`,
                }}
              />
            </span>
            <span className="hoursValue">{selected.inContactHours} hrs</span>
          </div>
          {selected.outContactHours > 0 && (
            <div className="hoursRow">
              <span className="hoursName">{selected.outCode}</span>
              <span className="hoursTrack" aria-hidden="true">
                <span className="hoursFill" style={{width: '100%'}} />
              </span>
              <span className="hoursValue">
                {selected.outContactHours} hrs
              </span>
            </div>
          )}
          {selected.outContactHours > selected.inContactHours &&
            selected.outContactHours > 0 && (
              <p className="hoursNote">
                {selected.outContactHours - selected.inContactHours} contact
                hours short of the catalog course — weigh against topic
                coverage.
              </p>
            )}
        </div>

        <div className="evidenceSection">
          <p className="sectionLabel">
            <Icon icon={ShieldCheckIcon} size="sm" color="inherit" />
            Topic coverage
          </p>
          <div className="matchMeter">
            <span className="matchTrack" aria-hidden="true">
              {selectedPct !== null && (
                <span
                  className={\`matchFill \${selectedStrength}\`}
                  style={{width: \`\${selectedPct}%\`}}
                />
              )}
            </span>
            <span className={\`matchChip \${selectedStrength}\`}>
              {selectedPct !== null
                ? \`\${MATCH_LABEL[selectedStrength]} · \${selectedPct}%\`
                : MATCH_LABEL.none}
            </span>
          </div>
          <ul aria-label={\`Topic checklist for \${selected.outCode}\`}>
            {selected.topics.map(topic => (
              <li
                key={topic.label}
                className={\`topicRow \${topic.covered ? 'covered' : 'missing'}\`}>
                <span className="topicIcon">
                  <Icon
                    icon={topic.covered ? CheckIcon : XIcon}
                    size="sm"
                    color="inherit"
                  />
                </span>
                <span className="topicText">{topic.label}</span>
              </li>
            ))}
            {selected.topics.length === 0 && (
              <li className="topicRow">
                <span className="topicText">
                  No catalog outline to compare — activity course.
                </span>
              </li>
            )}
          </ul>
          {selected.staleEvidence === true && (
            <p className="sourceLine">
              Coverage source is the expired 2019 articulation sheet — treat
              as indicative only.
            </p>
          )}
        </div>

        <div className="evidenceSection">
          <p className="sectionLabel">
            <Icon icon={ScrollTextIcon} size="sm" color="inherit" />
            Syllabus
          </p>
          {selected.syllabusExcerpt !== null ? (
            <>
              <pre className="excerptBlock">{selected.syllabusExcerpt}</pre>
              <p className="sourceLine">{selected.syllabusSource}</p>
            </>
          ) : (
            <div className="gateBox">
              <p className="gateText">
                No syllabus on file for {selected.inCode}.
                {selectedState.syllabusRequested
                  ? ' Request sent — awaiting the sending institution.'
                  : ' Approval is gated until one arrives or a precedent is applied.'}
              </p>
              <div className="gateActions">
                <button
                  type="button"
                  className="ghostButton"
                  disabled={selectedState.syllabusRequested || posted}
                  onClick={requestSyllabus}>
                  <Icon icon={FileClockIcon} size="sm" color="inherit" />
                  {selectedState.syllabusRequested
                    ? 'Syllabus requested'
                    : 'Request syllabus'}
                </button>
              </div>
              {selected.waiverPrecedentId !== undefined && (
                <button
                  type="button"
                  className="waiverToggle"
                  aria-pressed={selectedState.precedentApplied}
                  disabled={posted}
                  onClick={togglePrecedentWaiver}>
                  <span className="checkbox" aria-hidden="true">
                    <Icon icon={CheckIcon} size="sm" color="inherit" />
                  </span>
                  <span>
                    Apply precedent {selected.waiverPrecedentId} (same course
                    pair, approved SP25) to waive the syllabus requirement
                  </span>
                </button>
              )}
              <p className="sourceLine">{selected.syllabusSource}</p>
            </div>
          )}
        </div>

        <div className="evidenceSection">
          <p className="sectionLabel">
            <Icon icon={HistoryIcon} size="sm" color="inherit" />
            Precedent decisions
          </p>
          <ul aria-label={\`Precedents for \${selected.inCode}\`}>
            {selected.precedents.map(precedent => (
              <li key={precedent.caseId} className="precedentRow">
                <span className="caseId">{precedent.caseId}</span>
                <span className="meta">
                  {precedent.term} · {precedent.evaluator}
                </span>
                <span className={\`outcome \${precedent.outcome}\`}>
                  {precedent.outcome}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="evidenceSection">
          <p className="sectionLabel">
            <Icon icon={FileClockIcon} size="sm" color="inherit" />
            Case activity
          </p>
          <ul aria-label="Case activity ledger">
            {activity.map(entry => (
              <li key={entry.id} className="activityRow">
                <span className="activityClock">{entry.clock}</span>
                <span
                  className={\`activityText\${
                    entry.tone === 'neutral' ? '' : \` \${entry.tone}\`
                  }\`}>
                  {entry.text}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      {decisionBar}
    </aside>
  );

  // ---- frame ----

  return (
    <div style={{height: '100dvh', width: '100%'}}>
      <Layout height="fill">
        <style>{TEMPLATE_CSS}</style>
        <LayoutHeader hasDivider>
          <div className={\`\${SCOPE} topbar\`}>
            <div className="brandCluster">
              <BrandMark />
              <div className="brandText">
                <p className="eyebrow">Articula · Registrar</p>
                <h1 className="pageTitle">Transfer Credit — Case ART-1462</h1>
                <p className="caseMeta">
                  {STUDENT.name} · <span className="mono">{STUDENT.sid}</span>{' '}
                  · {STUDENT.program} · {STUDENT.admitTerm} · from{' '}
                  {STUDENT.sending}
                </p>
              </div>
            </div>
            <div className="headerActions">
              <span
                className={\`decidedChip\${
                  decidedCount === MAPPINGS.length ? ' isComplete' : ''
                }\`}>
                {decidedCount}/{MAPPINGS.length} decided
              </span>
              {posted ? (
                <span className="postedBadge">
                  <Icon icon={CheckIcon} size="sm" color="inherit" />
                  Posted to transcript
                </span>
              ) : (
                <button
                  type="button"
                  className="postButton"
                  disabled={!postReady}
                  onClick={postCase}>
                  <Icon icon={SendIcon} size="sm" color="inherit" />
                  Post to transcript
                </button>
              )}
            </div>
          </div>
        </LayoutHeader>
        <LayoutContent padding={0}>
          <div aria-live="polite" className={\`\${SCOPE} visuallyHidden\`}>
            {announcement}
          </div>
          <div className={\`\${SCOPE} workspace\`}>
            {auditRail}
            {mapperPanel}
            {evidencePanel}
          </div>
        </LayoutContent>
      </Layout>
    </div>
  );
}

`;export{e as default};