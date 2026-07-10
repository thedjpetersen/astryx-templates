var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Aperia pre-certification queue
 *   for Meridian Imaging Partners on Wed Jul 8 2026: six imaging auths
 *   with payer policies, per-criterion weights, clinical-note passages,
 *   and chart documents. Denial-risk arithmetic, hand-checked (score =
 *   payer base + Σ unmet weight, where a satisfied criterion adds 0, an
 *   attached-but-unverified criterion adds ⌈w/2⌉, an unmet one adds w;
 *   tiers: low < 25 ≤ moderate < 50 ≤ high):
 *     A-24187 Vasquez  MRI lumbar 72148: 12 + C2·16 + C3·18 + C5·⌈14/2⌉=7
 *              = 53 · HIGH (C1, C4 satisfied). Full interactive path:
 *              attach C2 → 45, verify C2 → 37, attach C3 → 28, verify C3
 *              → 19, verify C5 → 12 · LOW → all 5 satisfied → READY.
 *     A-24186 Webb     CT chest 71260:  15 + W2·14            = 29 · MODERATE
 *     A-24185 Raghavan MRI brain 70553: 10 + 0                = 10 · LOW, READY
 *     A-24183 Kowalczyk-Brennan CT abd/pelvis 74178:
 *              16 + K1·18 + K2·15 + K3·⌈12/2⌉=6 = 55 · HIGH (no chart
 *              evidence for K1/K2 — the request-records zero state)
 *     A-24181 Okafor   MRI shoulder 73221: 11, all satisfied · SUBMITTED
 *     A-24180 Delgado  CT sinus 70486:  20 + D1·17 = 37 · DENIED (locked)
 *   ⇒ header chips at first render: 4 in review · 1 ready · 2 high-risk.
 *   No clock reads, no randomness, no timers, no network assets.
 * @output Aperia — Radiology Prior-Auth Workbench: a payer pre-cert
 *   surface for an imaging group. A 56px brand header (aperture-iris
 *   mark, live queue chips) over a split frame: a 300px auth queue
 *   (76px rows — patient, CPT + study, payer, due chip, live risk pip)
 *   beside the workbench for the selected auth — a derived verdict
 *   banner, a patient/order banner with a 240° denial-risk gauge (SVG),
 *   then a two-pane split: the payer-rule checklist (weighted criterion
 *   rows with status chips and Locate / Verify / Detach actions) and a
 *   384px clinical-evidence pane (note passages that highlight as
 *   candidates and take Attach chips inline, plus a chart-document tray
 *   with system checks), and a submit bar gated on all criteria.
 *   Signature move: Locate → Attach → Verify walks evidence from the
 *   note into a criterion; every attach/verify/detach re-derives the
 *   rule chip, the gauge, the verdict banner, the queue row's risk pip,
 *   and the header's ready / high-risk counters from ONE link map in the
 *   same render — and Submit flips the row's status across every surface.
 * @position Page template; emitted by \`astryx template radiology-prior-auth-workbench\`
 *
 * Frame: root 100dvh div > Layout height="fill". header | content: flex
 *   row — aside queue 300 (scrolls) | work column (verdict 44 → patient
 *   banner min 84 → two-pane grid minmax(320px,1fr) + 384px, both panes
 *   scroll independently → submit bar 56). No LayoutPanel side rails —
 *   the split frame is hand-rolled so the queue can restyle to a strip
 *   on phones (a DS panel would keep its column geometry).
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): 300 +
 *   minmax(320,1fr) + 384 fits with the rules pane at ~360px. Nothing
 *   depends on a breakpoint firing.
 * - <= 920px: the evidence pane drops under the rules pane (grid goes
 *   single-column block flow; both sections keep full function, the pane
 *   column scrolls as one).
 * - <= 640px (390px embed): the queue becomes a horizontal chip strip
 *   (200px chips, scroll-x) above the work column; the payer/due line
 *   hides inside queue chips; the patient banner wraps under the gauge.
 * Container policy: work-surface archetype — rows, panes, and one gated
 *   action bar; no Cards. Queue rows, inline Attach chips, and criterion
 *   actions are real <button>s (aria-pressed on the selected queue row);
 *   all numerals tabular; one polite live region announces every
 *   re-derivation.
 * Color policy: token-pure chrome. ONE quarantined brand accent (Aperia
 *   cyan): light-dark(#0E7490, #4DD4EC) — #0E7490 on #FFFFFF ≈ 5.4:1,
 *   #4DD4EC on #1C1C1E ≈ 9.7:1 — carries the mark, attached-evidence
 *   underlines, criterion codes, and the selected queue row. State pairs
 *   with math at the declaration: satisfied green light-dark(#15803D,
 *   #4ADE80) (≈5.0:1 / ≈9.6:1), unverified amber light-dark(#B45309,
 *   #F5B458) (≈4.7:1 / ≈9.0:1), denial red light-dark(#DC2626, #F87171)
 *   (≈4.5:1 / ≈7.2:1). Tints are ≤16% alpha washes under text that keeps
 *   its own contrast.
 * Density grid (repeated verbatim in the CSS): header 56 · queue 300
 *   (rows 76) · verdict banner 44 · patient banner min 84 · gauge 72×48 ·
 *   criterion rows min 64 · evidence pane 384 · document rows 48 ·
 *   submit bar 56 · action buttons min 40 · risk pips 22.
 * Fixture policy: one link map \`Record<authId.ruleId, {sourceId,
 *   verified}>\` plus a submitted-id set are the only mutable clinical
 *   state; rule status, contribution, risk score, tier, readiness, queue
 *   pips, and header counters are ALL pure functions of fixtures + that
 *   map, recomputed every render, so no counter can drift from the rows.
 */

import {useMemo, useState, type ReactNode} from 'react';

import {
  AlertTriangleIcon,
  BadgeCheckIcon,
  CheckCircle2Icon,
  DatabaseIcon,
  FileTextIcon,
  PaperclipIcon,
  SearchIcon,
  SendIcon,
  XCircleIcon,
  XIcon,
  type LucideIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem, VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome stays token-pure.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-radiology-prior-auth-workbench';

// THE quarantined Aperia brand cyan. #0E7490 on #FFFFFF ≈ 5.4:1 (passes
// 4.5:1 at the 11–13px sizes it colors); #4DD4EC on ~#1C1C1E ≈ 9.7:1.
const BRAND = 'light-dark(#0E7490, #4DD4EC)';
// Attached-evidence / selected-row wash (10% / 14% alpha — text on it keeps
// its own pair).
const BRAND_TINT = 'light-dark(rgba(14, 116, 144, 0.10), rgba(77, 212, 236, 0.14))';
// Satisfied green: #15803D on #FFFFFF ≈ 5.0:1; #4ADE80 on #1C1C1E ≈ 9.6:1.
const OK = 'light-dark(#15803D, #4ADE80)';
const OK_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// Attached-but-unverified amber: #B45309 ≈ 4.7:1 on white; #F5B458 ≈ 9.0:1.
const WARN = 'light-dark(#B45309, #F5B458)';
const WARN_TINT = 'light-dark(rgba(180, 83, 9, 0.12), rgba(245, 180, 88, 0.16))';
// Denial red: #DC2626 ≈ 4.5:1 on white; #F87171 ≈ 7.2:1 on #1C1C1E.
const RISK = 'light-dark(#DC2626, #F87171)';
const RISK_TINT = 'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))';

// ---------------------------------------------------------------------------
// DOMAIN TYPES
// ---------------------------------------------------------------------------

type SourceKind = 'passage' | 'document' | 'system';

/** A piece of chart evidence a criterion can link to. Passages also appear
 * inline in the clinical note; documents and system checks live in the
 * tray. */
type EvidenceSource = {
  id: string;
  kind: SourceKind;
  label: string;
  meta: string;
  /** Criteria this source can satisfy. */
  ruleIds: string[];
};

type Rule = {
  id: string;
  /** Display code — C1…C5 etc. */
  code: string;
  text: string;
  /** Denial-risk weight when unmet; ⌈w/2⌉ while attached-unverified. */
  weight: number;
  /** Pre-linked evidence at first render. */
  initial?: {sourceId: string; verified: boolean};
};

/** Clinical-note content: plain strings flow as prose; passage segments are
 * attachable evidence keyed to sources of kind 'passage'. */
type NoteSegment = string | {p: string; text: string};
type NoteSection = {heading: string; segments: NoteSegment[]};

type AuthStatus = 'review' | 'submitted' | 'denied';

type Auth = {
  id: string;
  patient: string;
  demo: string; // "54F · MRN 004-1187"
  cpt: string;
  study: string;
  studyShort: string;
  modality: string;
  icd: string;
  payer: string;
  payerShort: string;
  policyRef: string;
  orderedBy: string;
  due: string;
  dueTone: 'normal' | 'urgent';
  status: AuthStatus;
  /** Payer floor for this study class — risk never derives below it. */
  base: number;
  rules: Rule[];
  sources: EvidenceSource[];
  note: NoteSection[];
  /** Denied auths carry the payer's stated reason. */
  denialReason?: string;
};

// ---------------------------------------------------------------------------
// FIXTURES — six auths. Weights, bases, and initial links reconcile with the
// @input ledger; stress fixtures are marked.
// ---------------------------------------------------------------------------

const AUTHS: Auth[] = [
  {
    // The seeded story auth — default selection; the full Locate → Attach →
    // Verify path lives in this fixture.
    id: 'A-24187',
    patient: 'Elena Vasquez',
    demo: '54F · MRN 004-1187',
    cpt: '72148',
    study: 'MRI lumbar spine without contrast',
    studyShort: 'MRI lumbar',
    modality: 'MRI',
    icd: 'M54.16 · M51.26',
    payer: 'Meridian Health PPO',
    payerShort: 'Meridian PPO',
    policyRef: 'MER-RAD-014',
    orderedBy: 'N. Oyelaran, MD · PM&R',
    due: 'Due Jul 9 · 14:00',
    dueTone: 'normal',
    status: 'review',
    base: 12,
    rules: [
      {
        id: 'c1',
        code: 'C1',
        text: '≥ 6 weeks of documented conservative therapy (PT, chiropractic, or home program)',
        weight: 14,
        initial: {sourceId: 'd-pt', verified: true},
      },
      {
        id: 'c2',
        code: 'C2',
        text: 'Progressive neurologic deficit or radiculopathy on exam',
        weight: 16,
      },
      {
        id: 'c3',
        code: 'C3',
        text: 'Plain radiographs of the lumbar spine within 90 days',
        weight: 18,
      },
      {
        id: 'c4',
        code: 'C4',
        text: 'No lumbar MRI within the prior 12 months',
        weight: 12,
        initial: {sourceId: 's-claims', verified: true},
      },
      {
        id: 'c5',
        code: 'C5',
        text: 'Documented failure of an adequate NSAID trial',
        weight: 14,
        initial: {sourceId: 'p-nsaid', verified: false},
      },
    ],
    sources: [
      {id: 'p-radic', kind: 'passage', label: 'H&P — exam findings', meta: 'Clinical note · Jul 6 2026', ruleIds: ['c2']},
      {id: 'p-pt', kind: 'passage', label: 'H&P — conservative course', meta: 'Clinical note · Jul 6 2026', ruleIds: ['c1']},
      {id: 'p-nsaid', kind: 'passage', label: 'H&P — medication trial', meta: 'Clinical note · Jul 6 2026', ruleIds: ['c5']},
      {id: 'p-xray', kind: 'passage', label: 'H&P — imaging summary', meta: 'Clinical note · Jul 6 2026', ruleIds: ['c3']},
      {id: 'd-pt', kind: 'document', label: 'PT discharge summary — Meridian Rehab', meta: 'PDF · 16 visits · Jun 12 2026', ruleIds: ['c1']},
      {id: 'd-xray', kind: 'document', label: 'Lumbar spine X-ray report — Meridian Imaging', meta: 'Report · acc MI-77410 · May 22 2026', ruleIds: ['c3']},
      {id: 'd-meds', kind: 'document', label: 'Pharmacy fill history', meta: 'CSV · naproxen, meloxicam · Jul 1 2026', ruleIds: ['c5']},
      {id: 's-claims', kind: 'system', label: 'Claims history check — no lumbar MRI since Jul 2025', meta: 'Auto-verified · payer clearinghouse', ruleIds: ['c4']},
    ],
    note: [
      {
        heading: 'History of present illness',
        segments: [
          '54-year-old female with 9 weeks of axial low back pain radiating below the left knee into the dorsal foot after a lifting injury on 2026-05-04. ',
          {p: 'p-radic', text: 'Interval exam shows new left ankle dorsiflexion weakness (4/5) and a positive straight-leg raise at 40 degrees.'},
          ' Denies bowel or bladder change; no saddle anesthesia.',
        ],
      },
      {
        heading: 'Conservative management',
        segments: [
          {p: 'p-pt', text: 'Completed 8 weeks of directed physical therapy at Meridian Rehab (16 visits, discharged 2026-06-12) without durable relief.'},
          ' ',
          {p: 'p-nsaid', text: 'Trialed naproxen 500 mg BID for 6 weeks, stopped for epigastric pain; then meloxicam 15 mg daily for 3 weeks without benefit.'},
        ],
      },
      {
        heading: 'Imaging & plan',
        segments: [
          {p: 'p-xray', text: 'Weight-bearing lumbar radiographs 2026-05-22 show grade 1 L4–L5 spondylolisthesis without acute fracture.'},
          ' No advanced lumbar imaging in the prior 12 months. Requesting MRI lumbar spine without contrast (CPT 72148) for progressive left L5 radiculopathy.',
        ],
      },
    ],
  },
  {
    id: 'A-24186',
    patient: 'Marcus Webb',
    demo: '61M · MRN 002-8834',
    cpt: '71260',
    study: 'CT chest with contrast',
    studyShort: 'CT chest',
    modality: 'CT',
    icd: 'R91.1',
    payer: 'Lakeshore Medicare Advantage',
    payerShort: 'Lakeshore MA',
    policyRef: 'LKS-RAD-201',
    orderedBy: 'A. Reyes, MD · Pulmonology',
    due: 'Due Jul 9 · 11:30',
    dueTone: 'normal',
    status: 'review',
    base: 15,
    rules: [
      {
        id: 'w1',
        code: 'W1',
        text: 'Prior imaging identifying the nodule under surveillance',
        weight: 16,
        initial: {sourceId: 'd-prior-ct', verified: true},
      },
      {
        id: 'w2',
        code: 'W2',
        text: 'Follow-up interval consistent with Fleischner Society guidance',
        weight: 14,
      },
      {
        id: 'w3',
        code: 'W3',
        text: 'Ordered by pulmonology or with documented specialty referral',
        weight: 10,
        initial: {sourceId: 's-referral', verified: true},
      },
    ],
    sources: [
      {id: 'p-nodule', kind: 'passage', label: 'Note — index finding', meta: 'Clinical note · Jul 2 2026', ruleIds: ['w1']},
      {id: 'p-fleisch', kind: 'passage', label: 'Note — surveillance rationale', meta: 'Clinical note · Jul 2 2026', ruleIds: ['w2']},
      {id: 'd-prior-ct', kind: 'document', label: 'CT chest report — index study', meta: 'Report · acc MI-88213 · Jan 9 2026', ruleIds: ['w1']},
      {id: 's-referral', kind: 'system', label: 'Referral check — Lakeshore Pulmonology on file', meta: 'Auto-verified · referral #LP-2091', ruleIds: ['w3']},
    ],
    note: [
      {
        heading: 'Indication',
        segments: [
          '61-year-old male, 30 pack-year former smoker (quit 2019). ',
          {p: 'p-nodule', text: 'CT chest 2026-01-09 identified an 8 mm solid right-upper-lobe nodule (accession MI-88213).'},
        ],
      },
      {
        heading: 'Surveillance rationale',
        segments: [
          {p: 'p-fleisch', text: 'Per Fleischner Society guidance for a single solid 8 mm nodule in a high-risk patient, follow-up CT at 6–12 months is indicated; this order falls at month 6.'},
          ' Referred from Lakeshore Pulmonology, Dr. A. Reyes.',
        ],
      },
    ],
  },
  {
    // Ready-at-first-render fixture — proves the green verdict + enabled
    // Submit without any interaction, and feeds the header "1 ready" chip.
    id: 'A-24185',
    patient: 'Priya Raghavan',
    demo: '38F · MRN 006-2251',
    cpt: '70553',
    study: 'MRI brain with and without contrast',
    studyShort: 'MRI brain',
    modality: 'MRI',
    icd: 'G50.0',
    payer: 'Meridian Health PPO',
    payerShort: 'Meridian PPO',
    policyRef: 'MER-RAD-032',
    orderedBy: 'T. Nakagawa, MD · Neurology',
    due: 'Due Jul 10 · 09:00',
    dueTone: 'normal',
    status: 'review',
    base: 10,
    rules: [
      {
        id: 'r1',
        code: 'R1',
        text: 'Symptoms consistent with a cranial neuropathy',
        weight: 12,
        initial: {sourceId: 'p-tn', verified: true},
      },
      {
        id: 'r2',
        code: 'R2',
        text: 'No MRI brain within the prior 6 months',
        weight: 10,
        initial: {sourceId: 's-claims-b', verified: true},
      },
      {
        id: 'r3',
        code: 'R3',
        text: 'Neurology consult on file',
        weight: 12,
        initial: {sourceId: 'd-neuro', verified: true},
      },
    ],
    sources: [
      {id: 'p-tn', kind: 'passage', label: 'Note — presentation', meta: 'Clinical note · Jul 5 2026', ruleIds: ['r1']},
      {id: 'd-neuro', kind: 'document', label: 'Neurology consult — T. Nakagawa, MD', meta: 'PDF · Jul 3 2026', ruleIds: ['r3']},
      {id: 's-claims-b', kind: 'system', label: 'Claims history check — no MRI brain since 2024', meta: 'Auto-verified · payer clearinghouse', ruleIds: ['r2']},
    ],
    note: [
      {
        heading: 'Indication',
        segments: [
          {p: 'p-tn', text: 'New-onset right V2 lancinating facial pain, seconds-long, triggered by chewing — clinically trigeminal neuralgia.'},
          ' MRI brain with and without contrast requested to exclude a compressive lesion. All MER-RAD-032 criteria verified at intake by K. Ellison, RN.',
        ],
      },
    ],
  },
  {
    // Stress fixture: 22-char hyphenated surname; urgent statutory clock;
    // TWO criteria with no chart evidence — exercises the request-records
    // zero state in the evidence pane.
    id: 'A-24183',
    patient: 'Dale Kowalczyk-Brennan',
    demo: '72M · MRN 001-0492',
    cpt: '74178',
    study: 'CT abdomen and pelvis with contrast',
    studyShort: 'CT abd/pelvis',
    modality: 'CT',
    icd: 'R10.84',
    payer: 'Beacon State Medicaid',
    payerShort: 'Beacon Medicaid',
    policyRef: 'BSM-RAD-118',
    orderedBy: 'External — Ridgeline Family Medicine',
    due: 'Due today · 17:30',
    dueTone: 'urgent',
    status: 'review',
    base: 16,
    rules: [
      {
        id: 'k1',
        code: 'K1',
        text: 'Documented red-flag symptoms or acute abdomen findings',
        weight: 18,
      },
      {
        id: 'k2',
        code: 'K2',
        text: 'Prior ultrasound or plain film where clinically applicable',
        weight: 15,
      },
      {
        id: 'k3',
        code: 'K3',
        text: 'Renal function documented within 30 days (contrast study)',
        weight: 12,
        initial: {sourceId: 'd-renal', verified: false},
      },
      {
        id: 'k4',
        code: 'K4',
        text: 'No duplicate CT abdomen/pelvis within 30 days',
        weight: 10,
        initial: {sourceId: 's-dup', verified: true},
      },
    ],
    sources: [
      {id: 'd-renal', kind: 'document', label: 'Outside lab fax — eGFR 54', meta: 'Scan · legibility poor · Jun 30 2026', ruleIds: ['k3']},
      {id: 's-dup', kind: 'system', label: 'Duplicate-study check — none in 30 days', meta: 'Auto-verified · payer clearinghouse', ruleIds: ['k4']},
    ],
    note: [
      {
        heading: 'External progress note (scanned)',
        segments: [
          '72-year-old male with two weeks of vague abdominal discomfort. Exam benign; vitals stable. Outside labs pending; no imaging on file at Meridian. Referral packet did not include red-flag documentation or prior imaging.',
        ],
      },
    ],
  },
  {
    // Locked: already submitted — actions read-only; feeds the queue's
    // state variety.
    id: 'A-24181',
    patient: 'Janet Okafor',
    demo: '45F · MRN 003-7719',
    cpt: '73221',
    study: 'MRI shoulder without contrast, right',
    studyShort: 'MRI shoulder',
    modality: 'MRI',
    icd: 'M75.101',
    payer: 'Meridian Health PPO',
    payerShort: 'Meridian PPO',
    policyRef: 'MER-RAD-021',
    orderedBy: 'S. Marsh, DO · Orthopedics',
    due: 'Submitted Jul 7 · 16:12',
    dueTone: 'normal',
    status: 'submitted',
    base: 11,
    rules: [
      {id: 'o1', code: 'O1', text: '≥ 4 weeks conservative therapy for rotator cuff pathology', weight: 14, initial: {sourceId: 'd-ortho', verified: true}},
      {id: 'o2', code: 'O2', text: 'Weakness or positive impingement signs on exam', weight: 12, initial: {sourceId: 'd-ortho', verified: true}},
    ],
    sources: [
      {id: 'd-ortho', kind: 'document', label: 'Ortho clinic note — S. Marsh, DO', meta: 'PDF · Jul 1 2026', ruleIds: ['o1', 'o2']},
    ],
    note: [
      {
        heading: 'Packet summary',
        segments: [
          'Submitted to Meridian Health PPO on Jul 7 at 16:12 with the ortho clinic note attached. Awaiting payer determination — turnaround SLA 72 h.',
        ],
      },
    ],
  },
  {
    // Locked: denied — red verdict with the payer's reason; proves the
    // denial state end-to-end.
    id: 'A-24180',
    patient: 'Sam Delgado',
    demo: '29M · MRN 007-5580',
    cpt: '70486',
    study: 'CT maxillofacial (sinus) without contrast',
    studyShort: 'CT sinus',
    modality: 'CT',
    icd: 'J32.4',
    payer: 'Lakeshore Medicare Advantage',
    payerShort: 'Lakeshore MA',
    policyRef: 'LKS-RAD-090',
    orderedBy: 'External — Harborview ENT',
    due: 'Denied Jul 7 · appeal window 30d',
    dueTone: 'urgent',
    status: 'denied',
    base: 20,
    denialReason:
      'Medical-necessity criterion D1 not met — maximal medical therapy not documented before imaging.',
    rules: [
      {id: 'd1', code: 'D1', text: '≥ 4 weeks maximal medical therapy for chronic sinusitis', weight: 17},
      {id: 'd2', code: 'D2', text: 'Symptoms persisting beyond 12 weeks', weight: 12, initial: {sourceId: 'd-ent', verified: true}},
    ],
    sources: [
      {id: 'd-ent', kind: 'document', label: 'ENT note — symptom timeline', meta: 'PDF · Jun 24 2026', ruleIds: ['d2']},
    ],
    note: [
      {
        heading: 'Denial summary',
        segments: [
          'Payer peer reviewer found no documentation of an adequate antibiotic + intranasal steroid course. Peer-to-peer scheduled Jul 10 · 08:30 with Dr. Feld (Lakeshore medical director).',
        ],
      },
    ],
  },
];

const AUTH_BY_ID = new Map(AUTHS.map(a => [a.id, a]));

// ---------------------------------------------------------------------------
// DERIVATION ENGINE — pure functions of fixtures + the link map. The link
// map is the single state owner for evidence; a submitted-id set finishes
// the lifecycle.
// ---------------------------------------------------------------------------

type EvidenceLink = {sourceId: string; verified: boolean};
/** Keyed \`\${authId}.\${ruleId}\`. */
type Links = Record<string, EvidenceLink>;

type RuleStatus = 'satisfied' | 'unverified' | 'available' | 'missing';
type Tier = 'low' | 'moderate' | 'high';

function buildInitialLinks(): Links {
  const links: Links = {};
  for (const auth of AUTHS) {
    for (const rule of auth.rules) {
      if (rule.initial !== undefined) {
        links[\`\${auth.id}.\${rule.id}\`] = {...rule.initial};
      }
    }
  }
  return links;
}

function candidatesFor(auth: Auth, ruleId: string): EvidenceSource[] {
  return auth.sources.filter(s => s.ruleIds.includes(ruleId));
}

function ruleStatusOf(auth: Auth, rule: Rule, links: Links): RuleStatus {
  const link = links[\`\${auth.id}.\${rule.id}\`];
  if (link !== undefined) {
    return link.verified ? 'satisfied' : 'unverified';
  }
  return candidatesFor(auth, rule.id).length > 0 ? 'available' : 'missing';
}

/** Weight contribution to the denial-risk score (see @input math). */
function contributionOf(status: RuleStatus, weight: number): number {
  if (status === 'satisfied') {
    return 0;
  }
  if (status === 'unverified') {
    return Math.ceil(weight / 2);
  }
  return weight;
}

function riskOf(auth: Auth, links: Links): number {
  return auth.rules.reduce(
    (score, rule) => score + contributionOf(ruleStatusOf(auth, rule, links), rule.weight),
    auth.base,
  );
}

function tierOf(score: number): Tier {
  if (score < 25) {
    return 'low';
  }
  return score < 50 ? 'moderate' : 'high';
}

function isReadyToSubmit(auth: Auth, links: Links): boolean {
  return auth.rules.every(rule => ruleStatusOf(auth, rule, links) === 'satisfied');
}

const TIER_LABEL: Record<Tier, string> = {low: 'low', moderate: 'moderate', high: 'high'};

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors scoped under .tpl-radiology-prior-auth-
// workbench. Density grid repeated verbatim: header 56 · queue 300 (rows
// 76) · verdict banner 44 · patient banner min 84 · gauge 72×48 · criterion
// rows min 64 · evidence pane 384 · document rows 48 · submit bar 56 ·
// action buttons min 40 · risk pips 22.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  font-family: var(--font-family-sans);
}
.\${SCOPE} button {
  font: inherit;
  color: inherit;
}
.\${SCOPE} .rpa-focusable:focus-visible {
  outline: 2px solid \${BRAND};
  outline-offset: 2px;
}
.\${SCOPE} .rpa-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.\${SCOPE} .rpa-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: \${BRAND};
}
.\${SCOPE} .rpa-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  padding: 2px 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .rpa-chip strong { color: var(--color-text-primary); font-weight: 700; }
.\${SCOPE} .rpa-chip--ok { color: \${OK}; border-color: \${OK}; background: \${OK_TINT}; }
.\${SCOPE} .rpa-chip--ok strong { color: \${OK}; }
.\${SCOPE} .rpa-chip--risk { color: \${RISK}; border-color: \${RISK}; background: \${RISK_TINT}; }
.\${SCOPE} .rpa-chip--risk strong { color: \${RISK}; }
/* --- frame ---------------------------------------------------------------- */
.\${SCOPE} .rpa-frame {
  height: 100%;
  min-height: 0;
  display: flex;
  position: relative;
}
/* --- queue: 300px, 76px rows ----------------------------------------------- */
.\${SCOPE} .rpa-queue {
  flex: 0 0 300px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border-right: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
}
.\${SCOPE} .rpa-queue-head {
  flex-shrink: 0;
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .rpa-queue-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
}
.\${SCOPE} .rpa-qrow {
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 3px;
  width: 100%;
  min-height: 76px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  text-align: start;
  cursor: pointer;
}
.\${SCOPE} .rpa-qrow[aria-pressed='true'] {
  background: \${BRAND_TINT};
  box-shadow: inset 3px 0 0 \${BRAND};
}
.\${SCOPE} .rpa-qrow-top {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.\${SCOPE} .rpa-qrow-name {
  font-size: 13px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  min-width: 0;
  flex: 1;
}
/* 22px live risk pip */
.\${SCOPE} .rpa-pip {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  flex-shrink: 0;
  height: 22px;
  box-sizing: border-box;
  padding: 0 7px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.\${SCOPE} .rpa-pip--low { color: \${OK}; border-color: \${OK}; background: \${OK_TINT}; }
.\${SCOPE} .rpa-pip--moderate { color: \${WARN}; border-color: \${WARN}; background: \${WARN_TINT}; }
.\${SCOPE} .rpa-pip--high { color: \${RISK}; border-color: \${RISK}; background: \${RISK_TINT}; }
.\${SCOPE} .rpa-qrow-line {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .rpa-due--urgent { color: \${RISK}; font-weight: 600; }
/* --- work column ------------------------------------------------------------ */
.\${SCOPE} .rpa-work {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
/* verdict banner: 44px */
.\${SCOPE} .rpa-verdict {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  box-sizing: border-box;
  padding: var(--spacing-1) var(--spacing-4);
  font-size: 13px;
  font-weight: 600;
  border-bottom: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .rpa-verdict strong { font-variant-numeric: tabular-nums; }
.\${SCOPE} .rpa-verdict--ready { color: \${OK}; background: \${OK_TINT}; }
.\${SCOPE} .rpa-verdict--blocked-moderate { color: \${WARN}; background: \${WARN_TINT}; }
.\${SCOPE} .rpa-verdict--blocked-high { color: \${RISK}; background: \${RISK_TINT}; }
.\${SCOPE} .rpa-verdict--submitted { color: var(--color-text-secondary); background: var(--color-background-muted); }
.\${SCOPE} .rpa-verdict--denied { color: \${RISK}; background: \${RISK_TINT}; }
/* patient banner: min 84px, gauge on the trailing edge */
.\${SCOPE} .rpa-patient {
  flex-shrink: 0;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-2) var(--spacing-5);
  min-height: 84px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .rpa-patient-main {
  flex: 1 1 320px;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.\${SCOPE} .rpa-patient-title {
  display: flex;
  align-items: baseline;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 14px;
  font-weight: 700;
}
.\${SCOPE} .rpa-patient-title .rpa-demo {
  font-size: 12px;
  font-weight: 500;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .rpa-patient-line {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .rpa-gauge {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
}
.\${SCOPE} .rpa-gauge-num {
  font-size: 20px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  line-height: 1;
}
.\${SCOPE} .rpa-gauge-cap {
  font-size: 10.5px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
/* --- panes: rules + evidence -------------------------------------------------- */
.\${SCOPE} .rpa-panes {
  flex: 1;
  min-height: 0;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) 384px;
}
.\${SCOPE} .rpa-pane {
  min-height: 0;
  overflow-y: auto;
  padding: var(--spacing-3) var(--spacing-4);
}
.\${SCOPE} .rpa-pane--evidence {
  border-left: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
}
.\${SCOPE} .rpa-pane-head {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: var(--spacing-2);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .rpa-pane-head .rpa-pane-meta {
  margin-inline-start: auto;
  font-weight: 600;
  letter-spacing: normal;
  text-transform: none;
  font-variant-numeric: tabular-nums;
}
/* criterion rows: min 64px */
.\${SCOPE} .rpa-rule {
  display: flex;
  flex-direction: column;
  gap: 6px;
  min-height: 64px;
  box-sizing: border-box;
  padding: var(--spacing-2) 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .rpa-rule-top {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.\${SCOPE} .rpa-rule-code {
  flex-shrink: 0;
  width: 26px;
  font-size: 12px;
  font-weight: 700;
  color: \${BRAND};
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .rpa-rule--active .rpa-rule-code { text-decoration: underline; }
.\${SCOPE} .rpa-rule-text {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  line-height: 1.35;
}
.\${SCOPE} .rpa-rule-weight {
  flex-shrink: 0;
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .rpa-rule-status {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  align-self: flex-start;
  padding: 1px 8px;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 700;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
}
.\${SCOPE} .rpa-rule-status--satisfied { color: \${OK}; border-color: \${OK}; background: \${OK_TINT}; }
.\${SCOPE} .rpa-rule-status--unverified { color: \${WARN}; border-color: \${WARN}; background: \${WARN_TINT}; }
.\${SCOPE} .rpa-rule-status--missing { color: \${RISK}; border-color: \${RISK}; background: \${RISK_TINT}; }
.\${SCOPE} .rpa-rule-linked {
  font-size: 11.5px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .rpa-rule-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--spacing-2);
}
/* Density-grid contract: criterion + submit actions keep a 40px hit box
   even though the DS small button renders shorter. */
.\${SCOPE} .rpa-rule-actions button,
.\${SCOPE} .rpa-submit button {
  min-height: 40px;
}
/* --- evidence pane ------------------------------------------------------------ */
.\${SCOPE} .rpa-note-section { margin-bottom: var(--spacing-3); }
.\${SCOPE} .rpa-note-heading {
  font-size: 12px;
  font-weight: 700;
  margin: 0 0 4px;
  color: var(--color-text-primary);
}
.\${SCOPE} .rpa-note-body {
  margin: 0;
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--color-text-primary);
}
.\${SCOPE} .rpa-passage {
  border-radius: 3px;
  padding: 0 1px;
}
.\${SCOPE} .rpa-passage--attached {
  background: \${BRAND_TINT};
  box-shadow: inset 0 -2px 0 \${BRAND};
}
.\${SCOPE} .rpa-passage--candidate {
  background: \${WARN_TINT};
  box-shadow: inset 0 -2px 0 \${WARN};
}
.\${SCOPE} .rpa-passage-tag {
  display: inline-flex;
  align-items: center;
  gap: 3px;
  margin-inline-start: 4px;
  padding: 0 6px;
  border-radius: 999px;
  font-size: 10.5px;
  font-weight: 700;
  vertical-align: 1px;
  border: var(--border-width) solid \${BRAND};
  color: \${BRAND};
  background: var(--color-background-surface);
  white-space: nowrap;
}
.\${SCOPE} .rpa-passage-tag--unverified { border-color: \${WARN}; color: \${WARN}; }
.\${SCOPE} .rpa-attach-btn {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin-inline-start: 6px;
  padding: 2px 8px;
  border-radius: 999px;
  border: var(--border-width) solid \${BRAND};
  background: var(--color-background-surface);
  color: \${BRAND};
  font-size: 11px;
  font-weight: 700;
  cursor: pointer;
  white-space: nowrap;
}
/* document tray rows: 48px */
.\${SCOPE} .rpa-doc {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 48px;
  box-sizing: border-box;
  padding: var(--spacing-1) 0;
  border-bottom: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .rpa-doc--candidate {
  background: \${WARN_TINT};
  border-radius: var(--radius-container, 8px);
  padding-inline: var(--spacing-2);
}
.\${SCOPE} .rpa-doc-glyph {
  display: inline-flex;
  flex-shrink: 0;
  color: var(--color-text-secondary);
}
.\${SCOPE} .rpa-doc-text {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}
.\${SCOPE} .rpa-doc-label {
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .rpa-doc-meta {
  font-size: 11px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .rpa-callout {
  display: flex;
  gap: 8px;
  align-items: flex-start;
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--radius-container, 8px);
  border: var(--border-width) solid \${RISK};
  background: \${RISK_TINT};
  color: \${RISK};
  font-size: 12px;
  font-weight: 600;
  margin-bottom: var(--spacing-3);
}
.\${SCOPE} .rpa-locating {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--spacing-1) var(--spacing-3);
  border-radius: 999px;
  border: var(--border-width) solid \${WARN};
  background: \${WARN_TINT};
  color: \${WARN};
  font-size: 12px;
  font-weight: 600;
  margin-bottom: var(--spacing-3);
}
/* --- submit bar: 56px --------------------------------------------------------- */
.\${SCOPE} .rpa-submit {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  min-height: 56px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-4);
  border-top: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
}
.\${SCOPE} .rpa-submit-note {
  font-size: 12px;
  color: var(--color-text-secondary);
  font-variant-numeric: tabular-nums;
  min-width: 0;
}
.\${SCOPE} .rpa-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* --- responsive subtraction ----------------------------------------------------- */
@media (max-width: 920px) {
  .\${SCOPE} .rpa-panes {
    display: block;
    overflow-y: auto;
  }
  .\${SCOPE} .rpa-pane { overflow-y: visible; }
  .\${SCOPE} .rpa-pane--evidence {
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
  }
}
@media (max-width: 640px) {
  .\${SCOPE} .rpa-frame { flex-direction: column; }
  .\${SCOPE} .rpa-queue {
    flex: 0 0 auto;
    border-right: none;
    border-bottom: var(--border-width) solid var(--color-border);
  }
  .\${SCOPE} .rpa-queue-scroll {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
  }
  .\${SCOPE} .rpa-qrow {
    flex: 0 0 200px;
    min-height: 64px;
    border-bottom: none;
    border-right: var(--border-width) solid var(--color-border);
  }
  .\${SCOPE} .rpa-qrow-line--payer { display: none; }
}
\`;

// ---------------------------------------------------------------------------
// BRAND MARK + GAUGE — inline SVGs. The gauge is a 240° arc; the angle math
// runs on fixed inputs only, so output is deterministic.
// ---------------------------------------------------------------------------

/** Aperia mark: a three-blade aperture iris in the brand cyan. */
function AperiaMark({size = 22}: {size?: number}) {
  return (
    <span className="rpa-mark" aria-hidden="true">
      <svg width={size} height={size} viewBox="0 0 22 22" fill="none">
        <circle cx="11" cy="11" r="9.2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M11 3.4 L14.8 9.9 H7.2 Z" fill="currentColor" opacity="0.9" />
        <path d="M11 3.4 L14.8 9.9 H7.2 Z" fill="currentColor" opacity="0.65" transform="rotate(120 11 11)" />
        <path d="M11 3.4 L14.8 9.9 H7.2 Z" fill="currentColor" opacity="0.4" transform="rotate(240 11 11)" />
      </svg>
    </span>
  );
}

function polar(cx: number, cy: number, r: number, deg: number): {x: number; y: number} {
  const rad = ((deg - 90) * Math.PI) / 180;
  return {x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad)};
}

function arcPath(cx: number, cy: number, r: number, startDeg: number, endDeg: number): string {
  const start = polar(cx, cy, r, startDeg);
  const end = polar(cx, cy, r, endDeg);
  const large = endDeg - startDeg > 180 ? 1 : 0;
  return \`M \${start.x.toFixed(2)} \${start.y.toFixed(2)} A \${r} \${r} 0 \${large} 1 \${end.x.toFixed(2)} \${end.y.toFixed(2)}\`;
}

const TIER_COLOR: Record<Tier, string> = {low: OK, moderate: WARN, high: RISK};

/** 72×48 denial-risk gauge: 240° track from −120° to +120°, value arc
 * colored by tier. Score is capped at 100 for geometry only. */
function RiskGauge({score, tier}: {score: number; tier: Tier}) {
  const clamped = Math.min(score, 100);
  const end = -120 + (240 * clamped) / 100;
  return (
    <div className="rpa-gauge">
      <svg width={72} height={48} viewBox="0 0 72 48" aria-hidden="true">
        <path
          d={arcPath(36, 40, 28, -120, 120)}
          fill="none"
          stroke="var(--color-border)"
          strokeWidth={6}
          strokeLinecap="round"
        />
        {clamped > 0 && (
          <path
            d={arcPath(36, 40, 28, -120, end)}
            fill="none"
            stroke={TIER_COLOR[tier]}
            strokeWidth={6}
            strokeLinecap="round"
          />
        )}
      </svg>
      <div role="status" aria-label={\`Denial risk \${score}, \${TIER_LABEL[tier]}\`}>
        <div className="rpa-gauge-num" style={{color: TIER_COLOR[tier]}}>
          {score}
        </div>
        <div className="rpa-gauge-cap">denial risk · {TIER_LABEL[tier]}</div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

const RULE_STATUS_META: Record<RuleStatus, {label: string; cls: string; icon: LucideIcon}> = {
  satisfied: {label: 'Satisfied', cls: 'rpa-rule-status--satisfied', icon: CheckCircle2Icon},
  unverified: {label: 'Attached · unverified', cls: 'rpa-rule-status--unverified', icon: PaperclipIcon},
  available: {label: 'Not documented · evidence in chart', cls: 'rpa-rule-status--missing', icon: AlertTriangleIcon},
  missing: {label: 'Not documented · no chart evidence', cls: 'rpa-rule-status--missing', icon: AlertTriangleIcon},
};

export default function RadiologyPriorAuthWorkbenchTemplate() {
  // State owners: the evidence-link map (+ submitted set + records-requested
  // set). Selection and the active criterion are view state; every score,
  // chip, and counter derives from AUTHS + links each render.
  const [links, setLinks] = useState<Links>(buildInitialLinks);
  const [submittedIds, setSubmittedIds] = useState<ReadonlySet<string>>(() => new Set());
  const [requested, setRequested] = useState<ReadonlySet<string>>(() => new Set());
  const [selectedId, setSelectedId] = useState('A-24187');
  const [activeRuleId, setActiveRuleId] = useState<string | null>('c2');
  const [announcement, setAnnouncement] = useState('');

  const auth = AUTH_BY_ID.get(selectedId) ?? AUTHS[0];
  const statusOf = (a: Auth): AuthStatus => (submittedIds.has(a.id) ? 'submitted' : a.status);
  const isLocked = statusOf(auth) !== 'review';

  // ---- live queue-wide derivations (header chips) ----
  const queueStats = useMemo(() => {
    let inReview = 0;
    let ready = 0;
    let high = 0;
    for (const a of AUTHS) {
      const status: AuthStatus = submittedIds.has(a.id) ? 'submitted' : a.status;
      if (status === 'review') {
        inReview += 1;
        if (isReadyToSubmit(a, links)) {
          ready += 1;
        }
        if (tierOf(riskOf(a, links)) === 'high') {
          high += 1;
        }
      }
    }
    return {inReview, ready, high};
  }, [links, submittedIds]);

  const risk = riskOf(auth, links);
  const tier = tierOf(risk);
  const ready = isReadyToSubmit(auth, links);
  const ruleStatuses = auth.rules.map(rule => ({rule, status: ruleStatusOf(auth, rule, links)}));
  const satisfiedCount = ruleStatuses.filter(r => r.status === 'satisfied').length;
  const unverifiedCount = ruleStatuses.filter(r => r.status === 'unverified').length;
  const unmetCount = auth.rules.length - satisfiedCount - unverifiedCount;
  const activeRule = activeRuleId !== null ? auth.rules.find(r => r.id === activeRuleId) : undefined;
  const activeCandidates = activeRule !== undefined ? candidatesFor(auth, activeRule.id) : [];

  // ---- mutations — a pure \`next\` map is committed, then the re-derived
  // consequence is announced (computed outside setState, so StrictMode's
  // double-invoke can't double it).
  const announceRisk = (a: Auth, prefix: string, nextLinks: Links) => {
    const nextRisk = riskOf(a, nextLinks);
    const nextTier = tierOf(nextRisk);
    const nowReady = isReadyToSubmit(a, nextLinks);
    setAnnouncement(
      \`\${prefix} \${a.id} denial risk \${nextRisk}, \${TIER_LABEL[nextTier]}.\` +
        (nowReady ? ' All criteria satisfied — ready to submit.' : ''),
    );
  };

  const attach = (ruleId: string, source: EvidenceSource) => {
    const rule = auth.rules.find(r => r.id === ruleId);
    if (rule === undefined || isLocked) {
      return;
    }
    const next = {...links, [\`\${auth.id}.\${ruleId}\`]: {sourceId: source.id, verified: false}};
    setLinks(next);
    setActiveRuleId(null);
    announceRisk(
      auth,
      \`\${rule.code} evidence attached from \${source.label} — pending verification.\`,
      next,
    );
  };

  const verify = (ruleId: string) => {
    const key = \`\${auth.id}.\${ruleId}\`;
    const link = links[key];
    const rule = auth.rules.find(r => r.id === ruleId);
    if (link === undefined || rule === undefined || isLocked) {
      return;
    }
    const next = {...links, [key]: {...link, verified: true}};
    setLinks(next);
    announceRisk(auth, \`\${rule.code} verified.\`, next);
  };

  const detach = (ruleId: string) => {
    const key = \`\${auth.id}.\${ruleId}\`;
    const rule = auth.rules.find(r => r.id === ruleId);
    if (links[key] === undefined || rule === undefined || isLocked) {
      return;
    }
    const next = {...links};
    delete next[key];
    setLinks(next);
    announceRisk(auth, \`\${rule.code} evidence detached.\`, next);
  };

  const requestRecords = (ruleId: string) => {
    const rule = auth.rules.find(r => r.id === ruleId);
    if (rule === undefined || isLocked) {
      return;
    }
    setRequested(prev => new Set(prev).add(\`\${auth.id}.\${ruleId}\`));
    setAnnouncement(
      \`Outside records requested for \${rule.code}. The criterion stays unmet until documents arrive — denial risk unchanged at \${risk}.\`,
    );
  };

  const submit = () => {
    if (!ready || isLocked) {
      return;
    }
    setSubmittedIds(prev => new Set(prev).add(auth.id));
    setActiveRuleId(null);
    setAnnouncement(
      \`\${auth.id} submitted to \${auth.payer} with \${auth.rules.length} of \${auth.rules.length} criteria satisfied — denial risk \${risk}, \${TIER_LABEL[tier]}.\`,
    );
  };

  const selectAuth = (id: string) => {
    setSelectedId(id);
    setActiveRuleId(null);
  };

  const toggleLocate = (ruleId: string) => {
    setActiveRuleId(prev => (prev === ruleId ? null : ruleId));
  };

  // ---- header ----
  const header = (
    <LayoutHeader>
      <div className="rpa-header-row">
        <HStack gap={3} vAlign="center" wrap="wrap">
          <AperiaMark />
          <StackItem size="fill" style={{minWidth: 0}}>
            <VStack gap={0}>
              <HStack gap={2} vAlign="center" wrap="wrap">
                <Heading level={2}>Aperia · Prior-Auth Workbench</Heading>
                <Badge label="Radiology" variant="neutral" />
              </HStack>
              <Text type="supporting" color="secondary">
                Meridian Imaging Partners · Wed Jul 8, 2026 · pre-cert desk K. Ellison, RN
              </Text>
            </VStack>
          </StackItem>
          <span className="rpa-chip">
            In review <strong>{queueStats.inReview}</strong>
          </span>
          <span className={\`rpa-chip \${queueStats.ready > 0 ? 'rpa-chip--ok' : ''}\`}>
            <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
            Ready <strong>{queueStats.ready}</strong>
          </span>
          <span className={\`rpa-chip \${queueStats.high > 0 ? 'rpa-chip--risk' : 'rpa-chip--ok'}\`}>
            <Icon icon={AlertTriangleIcon} size="xsm" color="inherit" />
            High risk <strong>{queueStats.high}</strong>
          </span>
        </HStack>
      </div>
    </LayoutHeader>
  );

  // ---- queue ----
  const queue = (
    <aside className="rpa-queue" aria-label="Authorization queue">
      <div className="rpa-queue-head">Auth queue · {AUTHS.length}</div>
      <div className="rpa-queue-scroll">
        {AUTHS.map(a => {
          const aRisk = riskOf(a, links);
          const aTier = tierOf(aRisk);
          const aStatus = statusOf(a);
          const aReady = aStatus === 'review' && isReadyToSubmit(a, links);
          const statusLabel =
            aStatus === 'submitted'
              ? 'Submitted'
              : aStatus === 'denied'
                ? 'Denied'
                : aReady
                  ? 'Ready'
                  : 'In review';
          return (
            <button
              key={a.id}
              type="button"
              className="rpa-qrow rpa-focusable"
              aria-pressed={a.id === selectedId}
              onClick={() => selectAuth(a.id)}>
              <span className="rpa-qrow-top">
                <span className="rpa-qrow-name">{a.patient}</span>
                <span
                  className={\`rpa-pip rpa-pip--\${aTier}\`}
                  aria-label={\`Denial risk \${aRisk}, \${TIER_LABEL[aTier]}\`}>
                  {aRisk}
                </span>
              </span>
              <span className="rpa-qrow-line">
                {a.id} · CPT {a.cpt} · {a.studyShort} · {statusLabel}
              </span>
              <span className="rpa-qrow-line rpa-qrow-line--payer">
                {a.payerShort} ·{' '}
                <span className={a.dueTone === 'urgent' ? 'rpa-due--urgent' : undefined}>
                  {a.due}
                </span>
              </span>
            </button>
          );
        })}
      </div>
    </aside>
  );

  // ---- verdict banner (fully derived) ----
  const status = statusOf(auth);
  let verdict: ReactNode;
  if (status === 'submitted') {
    verdict = (
      <div className="rpa-verdict rpa-verdict--submitted">
        <Icon icon={SendIcon} size="sm" color="inherit" />
        Submitted to {auth.payer} — awaiting determination (SLA 72 h).
      </div>
    );
  } else if (status === 'denied') {
    verdict = (
      <div className="rpa-verdict rpa-verdict--denied">
        <Icon icon={XCircleIcon} size="sm" color="inherit" />
        Denied — {auth.denialReason ?? 'see payer letter.'}
      </div>
    );
  } else if (ready) {
    verdict = (
      <div className="rpa-verdict rpa-verdict--ready">
        <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
        Ready to submit — all {auth.rules.length} criteria satisfied · denial risk{' '}
        <strong>{risk}</strong> ({TIER_LABEL[tier]}).
      </div>
    );
  } else {
    verdict = (
      <div
        className={\`rpa-verdict \${
          tier === 'high' ? 'rpa-verdict--blocked-high' : 'rpa-verdict--blocked-moderate'
        }\`}>
        <Icon icon={AlertTriangleIcon} size="sm" color="inherit" />
        Submission blocked — {unmetCount} not documented · {unverifiedCount} unverified · denial
        risk <strong>{risk}</strong> ({TIER_LABEL[tier]}).
      </div>
    );
  }

  // ---- rules pane ----
  const rulesPane = (
    <section className="rpa-pane" aria-label="Payer criteria checklist">
      <div className="rpa-pane-head">
        Payer criteria — {auth.policyRef} · {auth.payerShort}
        <span className="rpa-pane-meta">
          {satisfiedCount}/{auth.rules.length} satisfied
        </span>
      </div>
      {ruleStatuses.map(({rule, status: rs}) => {
        const link = links[\`\${auth.id}.\${rule.id}\`];
        const linkedSource =
          link !== undefined ? auth.sources.find(s => s.id === link.sourceId) : undefined;
        const meta = RULE_STATUS_META[rs];
        const contribution = contributionOf(rs, rule.weight);
        const isActive = activeRuleId === rule.id;
        const wasRequested = requested.has(\`\${auth.id}.\${rule.id}\`);
        return (
          <div key={rule.id} className={\`rpa-rule\${isActive ? ' rpa-rule--active' : ''}\`}>
            <div className="rpa-rule-top">
              <span className="rpa-rule-code">{rule.code}</span>
              <span className="rpa-rule-text">{rule.text}</span>
              <Tooltip
                content={\`Weight \${rule.weight} — adds \${contribution} to the score right now (unmet \${rule.weight}, unverified \${Math.ceil(rule.weight / 2)}, satisfied 0)\`}>
                <span className="rpa-rule-weight">
                  +{contribution}/{rule.weight}
                </span>
              </Tooltip>
            </div>
            <HStack gap={2} vAlign="center" wrap="wrap">
              <span className={\`rpa-rule-status \${meta.cls}\`}>
                <Icon icon={meta.icon} size="xsm" color="inherit" />
                {meta.label}
              </span>
              {linkedSource !== undefined && (
                <span className="rpa-rule-linked">
                  {link !== undefined && link.verified ? 'Verified from' : 'Attached from'}{' '}
                  {linkedSource.label}
                </span>
              )}
              {wasRequested && rs === 'missing' && (
                <span className="rpa-rule-linked">Outside records requested Jul 8</span>
              )}
            </HStack>
            {!isLocked && (
              <div className="rpa-rule-actions">
                {(rs === 'available' || rs === 'missing') && (
                  <Button
                    label={isActive ? 'Stop locating' : 'Locate evidence'}
                    variant="secondary"
                    size="sm"
                    icon={<Icon icon={SearchIcon} size="sm" color="inherit" />}
                    onClick={() => toggleLocate(rule.id)}
                  />
                )}
                {rs === 'unverified' && (
                  <Button
                    label="Verify"
                    variant="primary"
                    size="sm"
                    icon={<Icon icon={BadgeCheckIcon} size="sm" color="inherit" />}
                    onClick={() => verify(rule.id)}
                  />
                )}
                {link !== undefined && (
                  <Button
                    label="Detach"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={XIcon} size="sm" color="inherit" />}
                    onClick={() => detach(rule.id)}
                  />
                )}
                {rs === 'missing' && !wasRequested && (
                  <Button
                    label="Request outside records"
                    variant="ghost"
                    size="sm"
                    onClick={() => requestRecords(rule.id)}
                  />
                )}
              </div>
            )}
          </div>
        );
      })}
    </section>
  );

  // ---- evidence pane ----
  const trayDocs = auth.sources.filter(s => s.kind !== 'passage');
  const evidencePane = (
    <section className="rpa-pane rpa-pane--evidence" aria-label="Clinical evidence">
      <div className="rpa-pane-head">
        Clinical evidence
        <span className="rpa-pane-meta">
          {auth.sources.length} sources · {trayDocs.length} in tray
        </span>
      </div>

      {activeRule !== undefined && activeCandidates.length > 0 && (
        <div className="rpa-locating" role="status">
          <Icon icon={SearchIcon} size="xsm" color="inherit" />
          Locating for {activeRule.code} — {activeCandidates.length} candidate
          {activeCandidates.length === 1 ? '' : 's'} highlighted below.
        </div>
      )}
      {activeRule !== undefined && activeCandidates.length === 0 && (
        <div className="rpa-callout" role="status">
          <Icon icon={AlertTriangleIcon} size="sm" color="inherit" />
          <span>
            No matching passage or document in the chart for {activeRule.code}. The referral
            packet is the gap — request outside records from the ordering practice.
          </span>
        </div>
      )}

      {auth.note.map(section => (
        <div key={section.heading} className="rpa-note-section">
          <h3 className="rpa-note-heading">{section.heading}</h3>
          <p className="rpa-note-body">
            {section.segments.map((seg, i) => {
              if (typeof seg === 'string') {
                return <span key={i}>{seg}</span>;
              }
              const source = auth.sources.find(s => s.id === seg.p);
              // A passage may serve several rules; surface the first linked
              // rule's tag, else candidate styling for the active rule.
              const linkedRule = auth.rules.find(
                r => links[\`\${auth.id}.\${r.id}\`]?.sourceId === seg.p,
              );
              const linkedState =
                linkedRule !== undefined ? links[\`\${auth.id}.\${linkedRule.id}\`] : undefined;
              const isCandidate =
                activeRule !== undefined &&
                source !== undefined &&
                source.ruleIds.includes(activeRule.id) &&
                linkedRule === undefined;
              return (
                <span key={i}>
                  <span
                    className={\`rpa-passage\${
                      linkedRule !== undefined
                        ? ' rpa-passage--attached'
                        : isCandidate
                          ? ' rpa-passage--candidate'
                          : ''
                    }\`}>
                    {seg.text}
                  </span>
                  {linkedRule !== undefined && linkedState !== undefined && (
                    <span
                      className={\`rpa-passage-tag\${
                        linkedState.verified ? '' : ' rpa-passage-tag--unverified'
                      }\`}>
                      {linkedRule.code}
                      {linkedState.verified ? (
                        <Icon icon={BadgeCheckIcon} size="xsm" color="inherit" />
                      ) : (
                        ' · unverified'
                      )}
                    </span>
                  )}
                  {isCandidate && activeRule !== undefined && source !== undefined && !isLocked && (
                    <button
                      type="button"
                      className="rpa-attach-btn rpa-focusable"
                      onClick={() => attach(activeRule.id, source)}>
                      <Icon icon={PaperclipIcon} size="xsm" color="inherit" />
                      Attach to {activeRule.code}
                    </button>
                  )}
                </span>
              );
            })}
          </p>
        </div>
      ))}

      <div className="rpa-pane-head" style={{marginTop: 'var(--spacing-3)'}}>
        Chart documents & system checks
      </div>
      {trayDocs.map(doc => {
        const linkedRule = auth.rules.find(r => links[\`\${auth.id}.\${r.id}\`]?.sourceId === doc.id);
        const linkedState =
          linkedRule !== undefined ? links[\`\${auth.id}.\${linkedRule.id}\`] : undefined;
        const isCandidate =
          activeRule !== undefined &&
          doc.ruleIds.includes(activeRule.id) &&
          linkedRule === undefined;
        return (
          <div key={doc.id} className={\`rpa-doc\${isCandidate ? ' rpa-doc--candidate' : ''}\`}>
            <span className="rpa-doc-glyph">
              <Icon
                icon={doc.kind === 'system' ? DatabaseIcon : FileTextIcon}
                size="sm"
                color="inherit"
              />
            </span>
            <span className="rpa-doc-text">
              <span className="rpa-doc-label">{doc.label}</span>
              <span className="rpa-doc-meta">{doc.meta}</span>
            </span>
            {linkedRule !== undefined && linkedState !== undefined && (
              <span
                className={\`rpa-passage-tag\${
                  linkedState.verified ? '' : ' rpa-passage-tag--unverified'
                }\`}>
                {linkedRule.code}
                {linkedState.verified ? (
                  <Icon icon={BadgeCheckIcon} size="xsm" color="inherit" />
                ) : (
                  ' · unverified'
                )}
              </span>
            )}
            {isCandidate && activeRule !== undefined && !isLocked && (
              <button
                type="button"
                className="rpa-attach-btn rpa-focusable"
                onClick={() => attach(activeRule.id, doc)}>
                <Icon icon={PaperclipIcon} size="xsm" color="inherit" />
                Attach to {activeRule.code}
              </button>
            )}
          </div>
        );
      })}
    </section>
  );

  // ---- submit bar ----
  const submitBar = (
    <div className="rpa-submit">
      <span className="rpa-submit-note">
        {status === 'review'
          ? \`\${satisfiedCount}/\${auth.rules.length} criteria satisfied · denial risk \${risk} (\${TIER_LABEL[tier]}) · \${auth.due}\`
          : status === 'submitted'
            ? \`Packet locked — submitted with denial risk \${risk} (\${TIER_LABEL[tier]}).\`
            : 'Packet locked — denied. Prepare the appeal from the payer letter.'}
      </span>
      <StackItem size="fill" />
      {status === 'review' &&
        (ready ? (
          <Button
            label={\`Submit to \${auth.payerShort}\`}
            variant="primary"
            size="sm"
            icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
            onClick={submit}
          />
        ) : (
          <Tooltip content={\`Blocked — \${unmetCount + unverifiedCount} criteria still open\`}>
            <span>
              <Button
                label={\`Submit to \${auth.payerShort}\`}
                variant="primary"
                size="sm"
                isDisabled
                icon={<Icon icon={SendIcon} size="sm" color="inherit" />}
              />
            </span>
          </Tooltip>
        ))}
    </div>
  );

  return (
    <div className={SCOPE} style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className="rpa-frame">
              <div aria-live="polite" className="rpa-vh">
                {announcement}
              </div>
              {queue}
              <div className="rpa-work">
                {verdict}
                <div className="rpa-patient">
                  <div className="rpa-patient-main">
                    <span className="rpa-patient-title">
                      {auth.patient}
                      <span className="rpa-demo">{auth.demo}</span>
                    </span>
                    <span className="rpa-patient-line">
                      {auth.study} · CPT {auth.cpt} · ICD-10 {auth.icd}
                    </span>
                    <span className="rpa-patient-line">
                      {auth.payer} · policy {auth.policyRef} · ordered by {auth.orderedBy}
                    </span>
                  </div>
                  <RiskGauge score={risk} tier={tier} />
                </div>
                <div className="rpa-panes">
                  {rulesPane}
                  {evidencePane}
                </div>
                {submitBar}
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};