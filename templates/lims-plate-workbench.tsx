// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Aliquot LIMS plate-and-sample
 *   console for run RUN-2026-0417 (plate PLT-88F3A1, assay
 *   "25-OH Vitamin D — LC-MS/MS"): a 96-well plate (8 rows A–H × 12 cols)
 *   whose wells carry three orthogonal encodings (fill intensity = measured
 *   value, ring style = sample type, corner tick = QC role), a logical
 *   sample manifest of the same 96 wells, a four-node chain-of-custody rail
 *   with one pre-severed segment, and a dilution lineage for sample S-1047
 *   (parent D7 → 1:10 aliquot F7 → extract H7). The demo "today" is
 *   Tue Apr 07, 2026 — every timestamp is a pre-computed string, never
 *   clock math. No randomness, no network assets. Signed-in user:
 *   Dr. Elena Rivera (analyst).
 * @output Aliquot Plate Workbench — a bench scientist's console: pick a
 *   run, read the physical 96-well plate beside the logical manifest, and
 *   trace any tube's custody and dilution ancestry. The signature is
 *   consequence traversal: flagging ONE well (D7) as contaminated
 *   propagates through a single store to FOUR other surfaces — the 7
 *   reagent-lot siblings (EB-2292: D5–D8, E5–E8) gain amber hold rings, the
 *   manifest rows for the derived aliquot F7 and extract H7 flip to
 *   "Hold — parent flagged", their dilution chips taint red, the custody
 *   rail appends an amber QC-deviation node, and the release gate disables
 *   with a tooltip listing all 8 blocked wells. Spatial selection drives
 *   the table: clicking a column selector or row label filters the manifest;
 *   clicking a manifest row selects its well back on the grid.
 * @position Page template; emitted by `astryx template lims-plate-workbench`
 *
 * Frame: root 100dvh div > Layout height="fill".
 *   header (48px app bar: brand + RunSelector | ReleaseGate + avatar)
 *   > run meta strip (40px filter row: run id, barcode, assay, lot legend,
 *     active-filter chip)
 *   > content row: PLATE PANEL (560 fixed, own scroll, 44px legend footer)
 *     | MANIFEST PANEL (flex, own scroll, 32px sticky header + sticky
 *     aggregate footer) | CUSTODY ASIDE (360 fixed, own scroll).
 * Container policy: dense tool-surface archetype — frame panels and rows
 *   only, no Cards. The plate is a fully-custom inline-SVG grid; the manifest
 *   is a native <table>; the custody rail and lineage chips are styled divs.
 * Color policy: token-pure chrome. ONE quarantined brand literal (#7C3AED,
 *   a `light-dark()` pair) is the runtime value that drives well fill
 *   intensity and the selection ring. Brand *text* is a separate darker
 *   pair (contrast math below). Amber (hold) and danger (contamination) are
 *   `light-dark()` pairs; corner-tick colors use data-viz categorical tokens
 *   with the repo-standard fallback. No scheme-locked surfaces.
 *
 * FIXED DENSITY GRID (honored everywhere):
 * - App header bar height: 48px
 * - Run meta strip (filter row) height: 40px
 * - Manifest column-header row height: 32px
 * - Manifest data row height: 34px
 * - Legend footer strip height: 44px
 * - Plate canvas panel: 560px FIXED width (never flexes)
 * - Custody aside: 360px FIXED width
 * - Well cell: 36px × 36px square, 4px inter-well gap
 * - Plate row-label lane (A–H): 28px wide
 * - Plate column-selector lane (1–12): 20px tall
 * - Panel inner padding: 20px (all three panels)
 * - Gutter (--space-gutter): 16px between composite pieces
 * - Micro spacing reused elsewhere: 4 / 8 / 12 only
 * - Hairline border: 1px, --color-border-subtle
 * - Type scale: 11px caps, 12px meta, 13px row body, 15px panel titles
 * Fit check: 560 − 40 padding = 520; 28 + (12×36) + (11×4) = 504 ≤ 520. OK.
 *
 * Responsive contract (SUBTRACTION, not reflow — single breakpoint 1200px,
 * measured on the template ROOT's own width via ResizeObserver, not the
 * viewport — host chrome around the template starves the panels
 * independently of the viewport; see useElementWidth):
 * - > 1200px: three columns (plate 560 fixed + manifest flex + custody 360).
 * - <= 1200px: the 360 custody aside is REMOVED from flow and reached via a
 *   "Custody" button in the header right cluster that opens a Dialog holding
 *   the same rail. Plate 560 + manifest flex remain; nothing restacks. The
 *   plate never shrinks (physical fidelity); a narrow manifest scrolls
 *   horizontally rather than collapsing columns. This is a bench
 *   workstation — no mobile stacking pretense.
 */

import {Fragment, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type RefObject} from 'react';

import {
  ClipboardCheckIcon,
  DropletIcon,
  FlagIcon,
  FlaskConicalIcon,
  MicroscopeIcon,
  PackageIcon,
  PanelRightOpenIcon,
  ThermometerIcon,
  TriangleAlertIcon,
  TruckIcon,
  UserRoundIcon,
  XIcon,
} from 'lucide-react';

import {
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  VStack,
} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Dialog} from '@astryxdesign/core/Dialog';
import {DropdownMenu} from '@astryxdesign/core/DropdownMenu';
import {Icon} from '@astryxdesign/core/Icon';
import {Popover} from '@astryxdesign/core/Popover';
import {StatusDot} from '@astryxdesign/core/StatusDot';
import {Token} from '@astryxdesign/core/Token';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — every non-token color on the page, each a light-dark pair
// (dark side shifted to the lighter 300–400-weight hue). Data-viz categorical
// tokens are NOT injected by the demo, so each carries the repo-standard
// fallback.
// ---------------------------------------------------------------------------

// The ONE quarantined brand literal (#7C3AED). Used as a RUNTIME value: the
// SVG well-fill paint (at the opacity ramp) and the selection focus ring.
const BRAND = 'light-dark(#7C3AED, #A78BFA)';
// Brand-tinted TEXT is a separate, darker pair so it passes 4.5:1 in both
// schemes: #6D28D9 on white ≈ 7.1:1; #C4B5FD on the dark card ≈ 8.0:1.
const BRAND_TEXT = 'light-dark(#6D28D9, #C4B5FD)';

// Hold (QC hold / reagent-lot cascade) — amber. Stroke/icon pair; passes the
// 3:1 graphics bar on both surfaces (#B45309 on white ≈ 4.9:1; #FBBF24 on
// dark ≈ 10:1). Amber TEXT uses the darker AMBER_TEXT pair below.
const AMBER = 'light-dark(#B45309, #FBBF24)';
const AMBER_SOFT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(251, 191, 36, 0.16))';
// Amber TEXT is a separate, darker light-half (same split as BRAND vs
// BRAND_TEXT): the 12px supporting note and the label on the AMBER_SOFT card
// need more headroom than the stroke pair. #92400E on white ≈ 7.1:1 and on
// the AMBER_SOFT-tinted light card ≈ 6.2:1; dark side unchanged (#FBBF24 on
// dark ≈ 10:1).
const AMBER_TEXT = 'light-dark(#92400E, #FBBF24)';
// Contamination — danger red.
const DANGER = 'light-dark(#DC2626, #F87171)';
const DANGER_SOFT = 'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.16))';

// Neutral well outline (ring style is drawn in this, so shape — not color —
// carries the sample-type encoding).
const WELL_RING = 'light-dark(#475569, #CBD5E1)';

// Corner-tick QC-role colors (data-viz categorical tokens + fallbacks).
const TICK_BLANK = 'var(--color-data-categorical-gray, light-dark(#64748B, #94A3B8))';
const TICK_SPIKE = 'var(--color-data-categorical-teal, light-dark(#0E7E8B, #33B8C7))';
const TICK_DUPLICATE = 'var(--color-data-categorical-indigo, light-dark(#4F46E5, #818CF8))';

// ---------------------------------------------------------------------------
// DATA MODEL
// ---------------------------------------------------------------------------

type SampleType = 'patient' | 'calibrator' | 'blank' | 'duplicate' | 'extract';
type QcRole = 'none' | 'blank' | 'spike' | 'duplicate';
type FlagState = 'contaminated';

interface Well {
  id: string; // 'D7'
  row: string; // 'D'
  rowIdx: number; // 0–7
  col: number; // 1–12
  sampleId: string | null;
  type: SampleType;
  qcRole: QcRole;
  value: number | null; // measured ng/mL, null = unmeasured
  valueDisplay: string; // '42.7 ng/mL' or '—'
  reagentLot: string;
  lineageId?: string; // key into LINEAGE when part of a derivation chain
  flag?: FlagState;
}

interface Sample {
  id: string;
  patientRef?: string;
  note?: string;
}

const ROWS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'] as const;

// The featured reagent block: exactly D5–D8 and E5–E8 share EB-2292, so a
// single flag on D7 puts a tractable 8-well sibling set on hold.
const EB2292_WELLS = new Set([
  'D5', 'D6', 'D7', 'D8', 'E5', 'E6', 'E7', 'E8',
]);

function reagentLotFor(id: string, rowIdx: number, col: number): string {
  if (EB2292_WELLS.has(id)) return 'EB-2292';
  const seg = col <= 4 ? 0 : col <= 8 ? 1 : 2; // 3 column bands
  const band = Math.floor(rowIdx / 2); // A/B=0, C/D=1, E/F=2, G/H=3
  let code = 2291 + band * 3 + seg;
  if (code === 2292) code = 2291; // EB-2292 is reserved for the featured block
  return `EB-${code}`;
}

// Per-well overrides for the QC controls, calibrator curve, lineage, and the
// deliberate stress specimens. Everything else is a measured patient sample.
interface Override {
  sampleId: string;
  type?: SampleType;
  qcRole?: QcRole;
  value: number | null;
  lineageId?: string;
}

// Calibrator curve C0–C6 in column 1 (A1–G1) — values span the FULL fill
// ramp (0 → 140 ng/mL) so the intensity encoding is legible in one line.
const CAL_VALUES = [0, 8, 20, 40, 60, 95, 140];

const OVERRIDES: Record<string, Override> = {
  // Calibrator curve (column 1, rows A–G).
  A1: {sampleId: 'CAL-C0', type: 'calibrator', value: CAL_VALUES[0]},
  B1: {sampleId: 'CAL-C1', type: 'calibrator', value: CAL_VALUES[1]},
  C1: {sampleId: 'CAL-C2', type: 'calibrator', value: CAL_VALUES[2]},
  D1: {sampleId: 'CAL-C3', type: 'calibrator', value: CAL_VALUES[3]},
  E1: {sampleId: 'CAL-C4', type: 'calibrator', value: CAL_VALUES[4]},
  F1: {sampleId: 'CAL-C5', type: 'calibrator', value: CAL_VALUES[5]},
  G1: {sampleId: 'CAL-C6', type: 'calibrator', value: CAL_VALUES[6]},
  // Method blanks (dotted ring + slate tick, near-zero fill).
  A2: {sampleId: 'BLK-01', type: 'blank', qcRole: 'blank', value: 0.6},
  D2: {sampleId: 'BLK-02', type: 'blank', qcRole: 'blank', value: 0.8},
  H2: {sampleId: 'BLK-03', type: 'blank', qcRole: 'blank', value: 0.5},
  // Recovery spikes (teal tick, high fill) — patient matrix, spiked.
  B10: {sampleId: 'S-1180-SPK', qcRole: 'spike', value: 112.4},
  E10: {sampleId: 'S-1210-SPK', qcRole: 'spike', value: 126.9},
  H10: {sampleId: 'S-1244-SPK', qcRole: 'spike', value: 138.2},
  // Duplicates (double ring + indigo tick).
  C6: {sampleId: 'S-1093-DUP', type: 'duplicate', qcRole: 'duplicate', value: 33.1},
  F9: {sampleId: 'S-1155-DUP', type: 'duplicate', qcRole: 'duplicate', value: 51.7},
  // MAX-ENCODING stress well: duplicate TYPE + spike ROLE + 0.90 fill — proves
  // all three encodings compose (double ring + teal tick + top fill ramp).
  G11: {sampleId: 'S-2210-DUP-SPK', type: 'duplicate', qcRole: 'spike', value: 149.5},
  // Dilution lineage for S-1047: parent (D7) → 1:10 aliquot (F7) → extract (H7).
  D7: {sampleId: 'S-1047', value: 42.7, lineageId: 'S-1047'},
  F7: {sampleId: 'S-1047-D10', value: 4.3, lineageId: 'S-1047'},
  // Long id 'S-1047-D10-EX-RERUN' (stress: truncates in the mono column).
  H7: {sampleId: 'S-1047-D10-EX-RERUN', type: 'extract', value: 8.9, lineageId: 'S-1047'},
};

const LINEAGE_PARENT_WELL = 'D7';
const LINEAGE_DERIVED_WELLS = ['F7', 'H7'];

function buildWells(): Well[] {
  const wells: Well[] = [];
  for (let r = 0; r < ROWS.length; r++) {
    const row = ROWS[r];
    for (let col = 1; col <= 12; col++) {
      const id = `${row}${col}`;
      const ov = OVERRIDES[id];
      // Column 12 is a reserved, UNMEASURED lane (stress: hollow wells + em-dash
      // manifest results — the omit-when-undefined proof).
      const isReserved = col === 12 && ov == null;
      // Deterministic base value — no clock, no randomness.
      const base = 12 + ((r * 5 + col * 7) % 70) + ((r + col) % 10) / 10;
      const value = ov != null ? ov.value : isReserved ? null : Number(base.toFixed(1));
      const valueDisplay = value == null ? '—' : `${value.toFixed(1)} ng/mL`;
      const sampleId = ov?.sampleId ?? (isReserved ? `S-RSV-${id}` : `S-${1000 + r * 12 + col}`);
      wells.push({
        id,
        row,
        rowIdx: r,
        col,
        sampleId,
        type: ov?.type ?? 'patient',
        qcRole: ov?.qcRole ?? 'none',
        value,
        valueDisplay,
        reagentLot: reagentLotFor(id, r, col),
        lineageId: ov?.lineageId,
      });
    }
  }
  return wells;
}

const WELLS: Well[] = buildWells();

const SAMPLES: Record<string, Sample> = {
  'S-1047': {id: 'S-1047', patientRef: 'MRN-4471', note: 'Parent draw, Ward 4B'},
  'S-1047-D10': {id: 'S-1047-D10', patientRef: 'MRN-4471', note: '1:10 dilution of S-1047'},
  'S-1047-D10-EX-RERUN': {
    id: 'S-1047-D10-EX-RERUN',
    patientRef: 'MRN-4471',
    note: 'Solid-phase extract, rerun',
  },
};

// Sample-type distribution CROSS-CHECKS to 96 (footer asserts sum === 96):
// 80 patient + 7 calibrators + 3 blanks + 3 spikes + 3 duplicates.
// Extract (H7) and the 1:10 aliquot (F7) fold into the Patient tally; the 8
// reserved col-12 wells are unmeasured patient slots.
type FooterCategory = 'Patient' | 'Calibrator' | 'Blank' | 'Spike' | 'Duplicate';
function footerCategory(w: Well): FooterCategory {
  if (w.type === 'calibrator') return 'Calibrator';
  if (w.type === 'blank') return 'Blank';
  if (w.type === 'duplicate') return 'Duplicate';
  if (w.qcRole === 'spike') return 'Spike';
  return 'Patient';
}

// Fill-intensity ramp: measured value → one of five opacity steps.
function fillLevel(value: number | null): number {
  if (value == null) return 0;
  if (value < 10) return 0.12;
  if (value < 25) return 0.3;
  if (value < 45) return 0.5;
  if (value < 70) return 0.7;
  return 0.9;
}

const TYPE_LABEL: Record<SampleType, string> = {
  patient: 'Patient',
  calibrator: 'Calibrator',
  blank: 'Blank',
  duplicate: 'Duplicate',
  extract: 'Extract',
};

const TYPE_TOKEN_COLOR: Record<SampleType, 'gray' | 'purple' | 'blue' | 'teal' | 'cyan'> = {
  patient: 'gray',
  calibrator: 'blue',
  blank: 'gray',
  duplicate: 'purple',
  extract: 'cyan',
};

const QC_TICK_COLOR: Record<QcRole, string | null> = {
  none: null,
  blank: TICK_BLANK,
  spike: TICK_SPIKE,
  duplicate: TICK_DUPLICATE,
};

const QC_ROLE_LABEL: Record<QcRole, string | null> = {
  none: null,
  blank: 'Blank',
  spike: 'Spike',
  duplicate: 'Dup',
};

// ---------------------------------------------------------------------------
// CUSTODY + LINEAGE FIXTURES — ticket-shaped prose, fixed timestamps.
// ---------------------------------------------------------------------------

const PEOPLE = {
  MBEKI: 'Thandi Mbeki', // collector
  CHEN: 'Wei Chen', // courier
  OKAFOR: 'Sam Okafor', // accessioner
  RIVERA: 'Dr. Elena Rivera', // analyst (signed-in user)
} as const;

type NodeState = 'signed' | 'pending' | 'deviation';

interface CustodyNode {
  id: string;
  role: string;
  person: string;
  timestamp: string;
  note: string;
  container: string;
  tempDisplay: string;
  state: NodeState;
  // Connector INTO this node from the previous one: false = severed.
  linkIntact: boolean;
  glyph: typeof TruckIcon;
}

const CUSTODY_NODES: CustodyNode[] = [
  {
    id: 'collector',
    role: 'Collector',
    person: PEOPLE.MBEKI,
    timestamp: '07 Apr 2026, 09:14',
    note: 'Draw at Ward 4B, gel-barrier tube, ambient.',
    container: 'Gel-barrier tube',
    tempDisplay: 'Ambient',
    state: 'signed',
    linkIntact: true, // first node — no inbound connector
    glyph: UserRoundIcon,
  },
  {
    id: 'courier',
    role: 'Courier',
    person: PEOPLE.CHEN,
    timestamp: '07 Apr 2026, 10:02',
    note: 'Cooler in transit, 3.8 °C at pickup.',
    container: 'Insulated cooler',
    tempDisplay: '3.8 °C',
    state: 'signed',
    linkIntact: true,
    glyph: TruckIcon,
  },
  {
    id: 'accessioner',
    role: 'Accessioner',
    person: PEOPLE.OKAFOR,
    timestamp: '07 Apr 2026, 13:41',
    // Stress: wraps to 2 lines in the meta table.
    note: 'Received — SEVERED: temp excursion 9.2 °C, seal intact, logged as CUST-DEV-021.',
    container: 'Seal intact',
    tempDisplay: '9.2 °C',
    state: 'deviation',
    linkIntact: false, // PRE-SEVERED on load: courier → accessioner break
    glyph: ClipboardCheckIcon,
  },
  {
    id: 'analyst',
    role: 'Analyst',
    person: PEOPLE.RIVERA,
    timestamp: '07 Apr 2026, 15:20',
    note: 'Extracted and plated — awaiting sign-off.',
    container: 'Plate PLT-88F3A1',
    tempDisplay: '4.0 °C',
    state: 'pending', // signable — see onSign
    linkIntact: true,
    glyph: MicroscopeIcon,
  },
];

interface LineageNode {
  key: string;
  label: string;
  shape: 'parent' | 'aliquot' | 'extract';
  volumeDisplay: string;
}
interface LineageEdge {
  factor: string;
}
const LINEAGE_NODES: LineageNode[] = [
  {key: 'parent', label: 'S-1047', shape: 'parent', volumeDisplay: '500 µL'},
  {key: 'aliquot', label: 'S-1047-D10', shape: 'aliquot', volumeDisplay: '50 µL'},
  {key: 'extract', label: 'S-1047-EX', shape: 'extract', volumeDisplay: '200 µL'},
];
const LINEAGE_EDGES: LineageEdge[] = [{factor: '1:10'}, {factor: 'EX'}];

const RUNS = [
  {id: 'RUN-2026-0417', barcode: 'PLT-88F3A1', archived: false},
  {id: 'RUN-2026-0416', barcode: 'PLT-88F2C7', archived: true},
];
const ASSAY = '25-OH Vitamin D — LC-MS/MS'; // long — truncates in the meta strip

// ---------------------------------------------------------------------------
// STORE — ONE state owner. update(id, patch) shallow-merges into wells[id] OR
// samples[id] (uniform keyed entity table) OR the top-level state (id 'run').
// selectWell / selectColumn / selectRow / flagWell / releaseRun / signNode are
// thin named wrappers over the same setState. Every consequence is DERIVED
// (useMemo in the page) from this single source, never stored.
// ---------------------------------------------------------------------------

interface RunState {
  selectedRunId: string;
  wells: Record<string, Well>;
  samples: Record<string, Sample>;
  nodeStates: Record<string, NodeState>;
  selectedWellId: string | null;
  selectedColumn: number | null;
  selectedRow: string | null;
  runStatus: 'in-review' | 'released';
  announce: string;
}

function initialState(): RunState {
  const wells: Record<string, Well> = {};
  for (const w of WELLS) wells[w.id] = w;
  const nodeStates: Record<string, NodeState> = {};
  for (const n of CUSTODY_NODES) nodeStates[n.id] = n.state;
  return {
    selectedRunId: RUNS[0].id,
    wells,
    samples: SAMPLES,
    nodeStates,
    selectedWellId: LINEAGE_PARENT_WELL, // D7 pre-selected — the flag target
    selectedColumn: null,
    selectedRow: null,
    runStatus: 'in-review',
    announce: '',
  };
}

function useRunStore() {
  const [state, setState] = useState<RunState>(initialState);

  // The one keyed mutation every surface routes through.
  const update = useCallback((id: string, patch: Record<string, unknown>) => {
    setState(prev => {
      if (id in prev.wells) {
        return {...prev, wells: {...prev.wells, [id]: {...prev.wells[id], ...patch}}};
      }
      if (id in prev.samples) {
        return {...prev, samples: {...prev.samples, [id]: {...prev.samples[id], ...patch}}};
      }
      return {...prev, ...patch}; // top-level keys (e.g. id === 'run')
    });
  }, []);

  const selectWell = useCallback((id: string) => {
    setState(prev => ({...prev, selectedWellId: id}));
  }, []);

  const selectColumn = useCallback((col: number) => {
    setState(prev => ({
      ...prev,
      selectedColumn: prev.selectedColumn === col ? null : col,
      selectedRow: null,
    }));
  }, []);

  const selectRow = useCallback((row: string) => {
    setState(prev => ({
      ...prev,
      selectedRow: prev.selectedRow === row ? null : row,
      selectedColumn: null,
    }));
  }, []);

  const clearFilter = useCallback(() => {
    setState(prev => ({...prev, selectedColumn: null, selectedRow: null}));
  }, []);

  const flagWell = useCallback((id: string) => {
    setState(prev => {
      const well = prev.wells[id];
      if (well == null) return prev;
      const nextFlag: FlagState | undefined = well.flag === 'contaminated' ? undefined : 'contaminated';
      // Count the reagent-lot siblings that will go on hold, for the announce.
      const lot = well.reagentLot;
      const siblings = nextFlag
        ? Object.values(prev.wells).filter(w => w.reagentLot === lot).length
        : 0;
      return {
        ...prev,
        wells: {...prev.wells, [id]: {...well, flag: nextFlag}},
        announce: nextFlag
          ? `Contamination hold applied to ${siblings} wells; run release blocked.`
          : `Contamination flag cleared on ${id}; run release restored.`,
      };
    });
  }, []);

  const releaseRun = useCallback((holdCount: number) => {
    setState(prev => {
      if (holdCount > 0) return prev; // guarded no-op
      return {
        ...prev,
        runStatus: 'released',
        announce: `Run ${prev.selectedRunId} released.`,
      };
    });
  }, []);

  const signNode = useCallback((nodeId: string) => {
    setState(prev => ({
      ...prev,
      nodeStates: {...prev.nodeStates, [nodeId]: 'signed'},
      announce: 'Custody node signed.',
    }));
  }, []);

  return {state, update, selectWell, selectColumn, selectRow, clearFilter, flagWell, releaseRun, signNode};
}

// ---------------------------------------------------------------------------
// STYLES
// ---------------------------------------------------------------------------

const styles: Record<string, CSSProperties> = {
  // Footgun: `Layout height="fill"` collapses in the demo's auto-height stage —
  // the root div pins the page to the viewport.
  root: {height: '100dvh', width: '100%'},

  // App header bar (48px) --------------------------------------------------
  headerBar: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--space-gutter, 16px)',
    height: 48,
    padding: '0 20px',
  },
  brand: {display: 'flex', alignItems: 'center', gap: 8, flexShrink: 0},
  brandGlyph: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    color: BRAND_TEXT,
  },
  wordmark: {color: BRAND_TEXT, fontWeight: 600, letterSpacing: '0.01em'},

  // Run meta strip (40px filter row) --------------------------------------
  metaStrip: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    height: 40,
    padding: '0 20px',
    overflow: 'hidden',
  },
  metaAssay: {minWidth: 0, maxWidth: 240, overflow: 'hidden'},
  legendChips: {display: 'flex', alignItems: 'center', gap: 4, flexShrink: 0},
  spacer: {flex: 1},

  // Content row ------------------------------------------------------------
  contentRow: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    minHeight: 0,
    overflow: 'hidden',
  },

  // Plate panel (560 fixed) ------------------------------------------------
  platePanel: {
    width: 560,
    flexShrink: 0,
    borderRight: '1px solid var(--color-border-subtle)',
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  plateScroll: {flex: 1, minHeight: 0, overflow: 'auto', padding: 20},
  plateControlRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
    minHeight: 32,
  },
  plateInner: {width: 520},
  colLane: {
    display: 'grid',
    gridTemplateColumns: '28px repeat(12, 36px)',
    columnGap: 4,
    height: 20,
    marginBottom: 4,
  },
  colBtn: {
    height: 20,
    padding: 0,
    border: 'none',
    borderRadius: 4,
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    font: 'inherit',
    fontSize: 11,
    fontVariantNumeric: 'tabular-nums',
    cursor: 'pointer',
  },
  colBtnActive: {
    backgroundColor: AMBER_SOFT,
    color: BRAND_TEXT,
    fontWeight: 600,
  },
  plateBody: {display: 'flex', flexDirection: 'row'},
  rowLane: {
    display: 'grid',
    gridTemplateRows: 'repeat(8, 36px)',
    rowGap: 4,
    width: 28,
    marginRight: 4,
  },
  rowBtn: {
    width: 28,
    padding: 0,
    border: 'none',
    borderRadius: 4,
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    font: 'inherit',
    fontSize: 11,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBtnActive: {
    backgroundColor: AMBER_SOFT,
    color: BRAND_TEXT,
    fontWeight: 600,
  },
  wellGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(12, 36px)',
    gridTemplateRows: 'repeat(8, 36px)',
    gap: 4,
  },
  wellBtn: {
    width: 36,
    height: 36,
    padding: 0,
    border: 'none',
    borderRadius: 9,
    background: 'transparent',
    cursor: 'pointer',
    display: 'block',
  },
  legendFooter: {
    height: 44,
    flexShrink: 0,
    borderTop: '1px solid var(--color-border-subtle)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 20px',
    overflowX: 'auto',
  },
  legendItem: {display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0, whiteSpace: 'nowrap'},

  // Manifest panel (flex) --------------------------------------------------
  manifestPanel: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    minHeight: 0,
  },
  manifestScroll: {flex: 1, minHeight: 0, overflow: 'auto'},
  table: {
    width: '100%',
    // = the colgroup sum (52+150+96+108+112+64+132). A percent Sample ID col
    // under tableLayout:fixed only got the leftover after the px cols
    // (620−564 = 56px → every id ellipsized to "S-…"), so the col is fixed at
    // 150px and the table scrolls horizontally when the panel is narrower.
    minWidth: 714,
    borderCollapse: 'collapse',
    tableLayout: 'fixed',
  },
  thRow: {height: 32},
  th: {
    position: 'sticky',
    top: 0,
    zIndex: 1,
    height: 32,
    padding: '0 12px',
    textAlign: 'left',
    backgroundColor: 'var(--color-background-muted)',
    borderBottom: '1px solid var(--color-border-subtle)',
    whiteSpace: 'nowrap',
  },
  thNum: {textAlign: 'right'},
  td: {
    height: 34,
    padding: '0 12px',
    borderBottom: '1px solid var(--color-border-subtle)',
    verticalAlign: 'middle',
    overflow: 'hidden',
  },
  tdNum: {textAlign: 'right', fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap'},
  mono: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
  },
  cellTrunc: {overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'},
  manifestFooter: {
    height: 44,
    flexShrink: 0,
    borderTop: '1px solid var(--color-border-subtle)',
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 20px',
    overflowX: 'auto',
  },

  // Custody aside (360 fixed) ---------------------------------------------
  custodyScroll: {padding: 20},
  railHead: {display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 16},
  rail: {position: 'relative', paddingLeft: 44},
  spine: {
    position: 'absolute',
    left: 20,
    top: 12,
    bottom: 12,
    width: 2,
    backgroundColor: 'var(--color-border)',
  },
  node: {position: 'relative', marginBottom: 8},
  nodeDot: {
    position: 'absolute',
    left: -38,
    top: 2,
    width: 28,
    height: 28,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: '2px solid var(--color-border)',
    backgroundColor: 'var(--color-background-card)',
    zIndex: 1,
  },
  nodeCard: {
    border: '1px solid var(--color-border-subtle)',
    borderRadius: 'var(--radius-container, 8px)',
    padding: 12,
    backgroundColor: 'var(--color-background-card)',
  },
  connector: {height: 24, width: 2, marginLeft: -24, backgroundColor: 'var(--color-border)'},
  nodeIdentity: {display: 'flex', alignItems: 'baseline', gap: 6, flexWrap: 'wrap', marginTop: 2},
  nodeNote: {marginTop: 4},
  metaTable: {display: 'grid', gridTemplateColumns: 'auto 1fr', columnGap: 8, marginTop: 8},
  metaTableRow: {minHeight: 20, display: 'flex', alignItems: 'center'},

  // Dilution lineage chip --------------------------------------------------
  lineageChip: {
    display: 'inline-flex',
    alignItems: 'center',
    height: 22,
    borderRadius: 11,
    padding: '0 8px',
    gap: 2,
    border: '1px solid var(--color-border-subtle)',
    backgroundColor: 'var(--color-background-muted)',
    cursor: 'default',
  },
  lineageEdge: {display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '0 1px'},
  lineageFactor: {fontSize: 9, lineHeight: 1, color: 'var(--color-text-secondary)'},
  lineageLine: {width: 12, height: 2, backgroundColor: WELL_RING},
  volTable: {display: 'grid', gridTemplateColumns: 'auto auto auto', columnGap: 12, rowGap: 4},

  noShrink: {flexShrink: 0, whiteSpace: 'nowrap'},
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
// WELL SVG — the three orthogonal encodings + overlays. Purely presentational.
// (1) FILL INTENSITY = value ramp; (2) RING STYLE = sample type; (3) CORNER
// TICK = QC role. Overlays: hold = amber dashed ring, contaminated = red ring
// + X, selected = brand ring.
// ---------------------------------------------------------------------------

function ringDash(type: SampleType): string | undefined {
  switch (type) {
    case 'calibrator':
      return '4 2'; // dashed
    case 'blank':
      return '1 3'; // dotted
    default:
      return undefined; // solid
  }
}

function WellSvg({
  well,
  selected,
  hold,
  contaminated,
  reduceMotion,
}: {
  well: Well;
  selected: boolean;
  hold: boolean;
  contaminated: boolean;
  reduceMotion: boolean;
}) {
  const level = fillLevel(well.value);
  const measured = well.value != null;
  const dash = ringDash(well.type);
  const tick = QC_TICK_COLOR[well.qcRole];
  const ringStyle: CSSProperties = {
    fill: 'none',
    stroke: WELL_RING,
    strokeWidth: 2,
    ...(dash != null ? {strokeDasharray: dash} : null),
  };
  return (
    <svg
      viewBox="0 0 36 36"
      width={36}
      height={36}
      aria-hidden
      style={{transition: reduceMotion ? 'none' : 'opacity 120ms ease'}}>
      {/* (1) fill intensity — brand paint at the value ramp opacity */}
      {measured ? (
        <rect x={5} y={5} width={26} height={26} rx={7} style={{fill: BRAND, fillOpacity: level}} />
      ) : null}
      {/* (2) ring style = sample type */}
      <rect x={5} y={5} width={26} height={26} rx={7} style={ringStyle} />
      {well.type === 'duplicate' ? (
        <rect x={8.5} y={8.5} width={19} height={19} rx={5} style={{...ringStyle, strokeWidth: 1.5}} />
      ) : null}
      {well.type === 'extract' ? (
        <rect x={9} y={9} width={18} height={18} rx={4} style={{fill: 'none', stroke: WELL_RING, strokeWidth: 2}} />
      ) : null}
      {/* (3) corner tick = QC role (6px triangle, top-right) */}
      {tick != null ? <polygon points="24,6 30,6 30,12" style={{fill: tick}} /> : null}
      {/* overlay: reagent-lot hold ring (amber dashed) */}
      {hold ? (
        <rect x={2} y={2} width={32} height={32} rx={10} style={{fill: 'none', stroke: AMBER, strokeWidth: 2, strokeDasharray: '3 3'}} />
      ) : null}
      {/* overlay: contamination (red ring + X) */}
      {contaminated ? (
        <>
          <rect x={2} y={2} width={32} height={32} rx={10} style={{fill: 'none', stroke: DANGER, strokeWidth: 2}} />
          <line x1={12} y1={12} x2={24} y2={24} style={{stroke: DANGER, strokeWidth: 2}} />
          <line x1={24} y1={12} x2={12} y2={24} style={{stroke: DANGER, strokeWidth: 2}} />
        </>
      ) : null}
      {/* overlay: selection (brand ring) */}
      {selected ? (
        <rect x={1} y={1} width={34} height={34} rx={11} style={{fill: 'none', stroke: BRAND, strokeWidth: 2}} />
      ) : null}
    </svg>
  );
}

function wellAriaLabel(well: Well, hold: boolean): string {
  const parts = [`Well ${well.id}`, `${TYPE_LABEL[well.type]} sample ${well.sampleId ?? 'none'}`];
  const role = QC_ROLE_LABEL[well.qcRole];
  if (role != null) parts.push(`QC ${role}`);
  parts.push(well.value == null ? 'unmeasured' : well.valueDisplay);
  if (well.flag === 'contaminated') parts.push('contamination flagged');
  else if (hold) parts.push('QC hold');
  return parts.join(', ');
}

// ---------------------------------------------------------------------------
// PLATE MAP GRID — role="grid", roving tabindex, arrow-key nav, Enter selects,
// F flags. All state lifted to the run store.
// ---------------------------------------------------------------------------

interface PlateGridProps {
  wells: Record<string, Well>;
  selectedWellId: string | null;
  selectedColumn: number | null;
  selectedRow: string | null;
  holdSet: ReadonlySet<string>;
  flaggedSet: ReadonlySet<string>;
  reduceMotion: boolean;
  onSelectWell: (id: string) => void;
  onSelectColumn: (col: number) => void;
  onSelectRow: (row: string) => void;
  onFlagWell: (id: string) => void;
}

function PlateMapGrid(props: PlateGridProps) {
  const {wells, selectedWellId, selectedColumn, selectedRow, holdSet, flaggedSet, reduceMotion} = props;
  const gridRef = useRef<HTMLDivElement>(null);
  const rovingId = selectedWellId ?? 'A1';

  const focusWell = (id: string) => {
    const el = gridRef.current?.querySelector<HTMLButtonElement>(`[data-well="${id}"]`);
    el?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent, well: Well) => {
    let target: string | null = null;
    if (e.key === 'ArrowRight') target = `${well.row}${Math.min(12, well.col + 1)}`;
    else if (e.key === 'ArrowLeft') target = `${well.row}${Math.max(1, well.col - 1)}`;
    else if (e.key === 'ArrowUp') target = `${ROWS[Math.max(0, well.rowIdx - 1)]}${well.col}`;
    else if (e.key === 'ArrowDown') target = `${ROWS[Math.min(7, well.rowIdx + 1)]}${well.col}`;
    else if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      props.onSelectWell(well.id);
      return;
    } else if (e.key === 'f' || e.key === 'F') {
      e.preventDefault();
      props.onFlagWell(well.id);
      return;
    }
    if (target != null) {
      e.preventDefault();
      props.onSelectWell(target);
      focusWell(target);
    }
  };

  return (
    <div style={styles.plateInner}>
      {/* column-selector lane */}
      <div style={styles.colLane} role="presentation">
        <span aria-hidden />
        {Array.from({length: 12}, (_, i) => i + 1).map(col => (
          <button
            key={col}
            type="button"
            style={col === selectedColumn ? {...styles.colBtn, ...styles.colBtnActive} : styles.colBtn}
            aria-pressed={col === selectedColumn}
            aria-label={`Filter manifest to column ${col}`}
            onClick={() => props.onSelectColumn(col)}>
            {col}
          </button>
        ))}
      </div>
      <div style={styles.plateBody}>
        {/* row-label lane */}
        <div style={styles.rowLane} role="presentation">
          {ROWS.map(row => (
            <button
              key={row}
              type="button"
              style={row === selectedRow ? {...styles.rowBtn, ...styles.rowBtnActive} : styles.rowBtn}
              aria-pressed={row === selectedRow}
              aria-label={`Filter manifest to row ${row}`}
              onClick={() => props.onSelectRow(row)}>
              {row}
            </button>
          ))}
        </div>
        {/* well grid */}
        <div
          ref={gridRef}
          style={styles.wellGrid}
          role="grid"
          aria-label="96-well plate PLT-88F3A1 — value, sample type, and QC role encoded per well">
          {WELLS.map(baseWell => {
            const well = wells[baseWell.id];
            const selected = selectedWellId === well.id;
            const hold = holdSet.has(well.id);
            const contaminated = flaggedSet.has(well.id);
            return (
              <button
                key={well.id}
                type="button"
                role="gridcell"
                data-well={well.id}
                aria-selected={selected}
                aria-label={wellAriaLabel(well, hold)}
                tabIndex={well.id === rovingId ? 0 : -1}
                style={styles.wellBtn}
                onClick={() => props.onSelectWell(well.id)}
                onKeyDown={e => handleKeyDown(e, well)}>
                <WellSvg
                  well={well}
                  selected={selected}
                  hold={hold}
                  contaminated={contaminated}
                  reduceMotion={reduceMotion}
                />
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function WellLegend() {
  return (
    <div style={styles.legendFooter} aria-label="Plate legend">
      <span style={styles.legendItem}>
        <Text type="supporting" size="xsm" color="secondary">
          Fill = value
        </Text>
        <span aria-hidden style={{display: 'flex', gap: 2}}>
          {[0.12, 0.3, 0.5, 0.7, 0.9].map(op => (
            <span
              key={op}
              style={{width: 12, height: 12, borderRadius: 3, backgroundColor: BRAND, opacity: op}}
            />
          ))}
        </span>
      </span>
      <span style={styles.legendItem}>
        <Text type="supporting" size="xsm" color="secondary">
          Hollow = unmeasured
        </Text>
        {/* matches the col-12 wells: type ring only, no fill */}
        <span
          aria-hidden
          style={{
            width: 12,
            height: 12,
            borderRadius: 3,
            border: `2px solid ${WELL_RING}`,
            boxSizing: 'border-box',
          }}
        />
      </span>
      {/* No style enumeration here — the four items must fit the panel's
          fixed 520px inner width on one 44px line (the old
          "solid / dashed / dotted / double / inner" descriptor flat-cut at
          the panel edge once the unmeasured swatch joined the row). */}
      <span style={styles.legendItem}>
        <Text type="supporting" size="xsm" color="secondary">
          Ring = type
        </Text>
      </span>
      <span style={styles.legendItem}>
        <Text type="supporting" size="xsm" color="secondary">
          Tick = QC
        </Text>
        <span aria-hidden style={{width: 8, height: 8, borderRadius: 2, backgroundColor: TICK_BLANK}} />
        <span aria-hidden style={{width: 8, height: 8, borderRadius: 2, backgroundColor: TICK_SPIKE}} />
        <span aria-hidden style={{width: 8, height: 8, borderRadius: 2, backgroundColor: TICK_DUPLICATE}} />
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DILUTION LINEAGE CHIP — parent → aliquot → extract with transformation
// factors; taints when the parent well is flagged.
// ---------------------------------------------------------------------------

function LineageGlyph({shape, tainted}: {shape: LineageNode['shape']; tainted: boolean}) {
  const color = tainted && shape === 'parent' ? DANGER : BRAND_TEXT;
  if (shape === 'extract') {
    return (
      <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden>
        <polygon points="5,0 10,5 5,10 0,5" style={{fill: 'none', stroke: color, strokeWidth: 1.5}} />
      </svg>
    );
  }
  return (
    <svg width={10} height={10} viewBox="0 0 10 10" aria-hidden>
      <circle cx={5} cy={5} r={4} style={{fill: shape === 'parent' ? color : 'none', stroke: color, strokeWidth: 1.5}} />
    </svg>
  );
}

function DilutionLineageChip({tainted}: {tainted: boolean}) {
  const chipStyle: CSSProperties = tainted
    ? {...styles.lineageChip, borderColor: AMBER, backgroundColor: AMBER_SOFT}
    : styles.lineageChip;
  const content = (
    <div style={styles.volTable}>
      <Text type="label" size="xsm">
        Node
      </Text>
      <Text type="label" size="xsm">
        Sample
      </Text>
      <Text type="label" size="xsm">
        Volume
      </Text>
      {LINEAGE_NODES.map(n => (
        <Fragment key={n.key}>
          <Text type="supporting" size="xsm" color="secondary">
            {n.shape === 'parent' ? 'Parent' : n.shape === 'aliquot' ? `Aliquot @ ${LINEAGE_EDGES[0].factor}` : 'Extract'}
          </Text>
          <Text type="supporting" size="xsm">
            {n.label}
          </Text>
          <Text type="supporting" size="xsm" hasTabularNumbers>
            {n.volumeDisplay}
          </Text>
        </Fragment>
      ))}
    </div>
  );
  return (
    <Popover content={content} placement="above" label="Dilution lineage volumes" width={280}>
      <button type="button" style={chipStyle} aria-label="Dilution lineage: parent, aliquot, extract">
        {tainted ? (
          <span aria-hidden style={{marginRight: 2, display: 'inline-flex'}}>
            <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" style={{color: AMBER}} />
          </span>
        ) : null}
        {LINEAGE_NODES.map((n, i) => (
          <span key={n.key} style={{display: 'inline-flex', alignItems: 'center', gap: 2}}>
            <LineageGlyph shape={n.shape} tainted={tainted} />
            {i < LINEAGE_EDGES.length ? (
              <span style={styles.lineageEdge}>
                <span style={styles.lineageFactor}>{LINEAGE_EDGES[i].factor}</span>
                <span
                  style={
                    tainted && i === 0
                      ? {...styles.lineageLine, backgroundColor: DANGER, height: 2}
                      : styles.lineageLine
                  }
                />
              </span>
            ) : null}
          </span>
        ))}
      </button>
    </Popover>
  );
}

// ---------------------------------------------------------------------------
// MANIFEST — native <table>; row selects its well; on-hold rows go amber,
// contaminated rows go red; derived (parent-flagged) rows re-status.
// ---------------------------------------------------------------------------

interface ManifestRowProps {
  well: Well;
  selected: boolean;
  hold: boolean;
  contaminated: boolean;
  parentFlagged: boolean;
  samples: Record<string, Sample>;
  onSelect: (id: string) => void;
}

function ManifestRow({well, selected, hold, contaminated, parentFlagged, samples, onSelect}: ManifestRowProps) {
  const rowBg = contaminated
    ? DANGER_SOFT
    : hold || parentFlagged
      ? AMBER_SOFT
      : selected
        ? 'var(--color-background-muted)'
        : undefined;
  const statusLabel = contaminated
    ? 'Contaminated'
    : parentFlagged
      ? 'Hold — parent flagged'
      : hold
        ? 'Hold — reagent lot'
        : well.value == null
          ? 'Unmeasured'
          : 'Ready';
  const statusColor: 'red' | 'orange' | 'gray' | 'green' = contaminated
    ? 'red'
    : hold || parentFlagged
      ? 'orange'
      : well.value == null
        ? 'gray'
        : 'green';
  const isLineage = well.lineageId != null;
  const sample = well.sampleId != null ? samples[well.sampleId] : undefined;
  const role = QC_ROLE_LABEL[well.qcRole];
  return (
    <tr
      onClick={() => onSelect(well.id)}
      aria-selected={selected}
      style={{cursor: 'pointer', backgroundColor: rowBg}}>
      <td style={{...styles.td, ...styles.mono}}>{well.id}</td>
      <td style={styles.td}>
        <Tooltip content={sample?.patientRef != null ? `${well.sampleId} · ${sample.patientRef}` : (well.sampleId ?? '')}>
          <span style={{...styles.mono, ...styles.cellTrunc, display: 'block'}}>{well.sampleId}</span>
        </Tooltip>
      </td>
      <td style={styles.td}>
        <Token size="sm" color={TYPE_TOKEN_COLOR[well.type]} label={TYPE_LABEL[well.type]} />
      </td>
      <td style={styles.td}>
        {isLineage ? <DilutionLineageChip tainted={parentFlagged || contaminated} /> : null}
      </td>
      <td style={{...styles.td, ...styles.tdNum}}>{well.valueDisplay}</td>
      <td style={styles.td}>
        {role != null ? <Token size="sm" color="default" label={role} /> : null}
      </td>
      <td style={styles.td}>
        <Token size="sm" color={statusColor} label={statusLabel} />
      </td>
    </tr>
  );
}

// ---------------------------------------------------------------------------
// CUSTODY HANDOFF RAIL — vertical spine; solid connector = intact custody,
// dashed danger = severed; a deviation node appends on contamination.
// ---------------------------------------------------------------------------

const NODE_DOT_STYLE: Record<NodeState, CSSProperties> = {
  signed: {backgroundColor: BRAND, borderColor: BRAND, color: '#fff'},
  pending: {backgroundColor: 'var(--color-background-card)', borderColor: 'var(--color-border)'},
  deviation: {backgroundColor: AMBER_SOFT, borderColor: AMBER, color: AMBER},
};

interface CustodyRailProps {
  nodeStates: Record<string, NodeState>;
  flagged: boolean;
  holdCount: number;
  onSign: (nodeId: string) => void;
}

function CustodyHandoffRail({nodeStates, flagged, holdCount, onSign}: CustodyRailProps) {
  return (
    <div>
      <div style={styles.railHead}>
        <Heading level={3}>Chain of custody</Heading>
        <Text type="supporting" size="xsm" color="secondary">
          Sample S-1047 · four handoffs
        </Text>
      </div>
      <div style={styles.rail}>
        <span style={styles.spine} aria-hidden />
        <ol role="list" style={{listStyle: 'none', margin: 0, padding: 0}}>
          {CUSTODY_NODES.map((node, i) => {
            const state = nodeStates[node.id];
            const dotStyle = NODE_DOT_STYLE[state];
            return (
              <li key={node.id} role="listitem">
                {i > 0 ? (
                  <div
                    aria-label={node.linkIntact ? undefined : 'Custody break — temperature excursion'}
                    style={
                      node.linkIntact
                        ? styles.connector
                        : {...styles.connector, width: 0, borderLeft: `2px dashed`, borderColor: DANGER, backgroundColor: 'transparent'}
                    }
                  />
                ) : null}
                <div style={styles.node}>
                  <span style={{...styles.nodeDot, ...dotStyle}} aria-hidden>
                    <Icon icon={node.glyph} size="xsm" color="inherit" />
                  </span>
                  <div style={styles.nodeCard}>
                    <Text as="div" type="label" size="xsm" color="secondary">
                      {node.role.toUpperCase()}
                    </Text>
                    <div style={styles.nodeIdentity}>
                      <Text type="body" size="sm">
                        {node.person}
                      </Text>
                      <Text type="supporting" size="xsm" color="secondary" aria-hidden>
                        ·
                      </Text>
                      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                        {node.timestamp}
                      </Text>
                    </div>
                    <Text
                      as="div"
                      type="supporting"
                      size="xsm"
                      color={state === 'deviation' ? 'inherit' : 'secondary'}
                      style={state === 'deviation' ? {...styles.nodeNote, color: AMBER_TEXT} : styles.nodeNote}>
                      {node.note}
                    </Text>
                    <div style={styles.metaTable}>
                      <div style={styles.metaTableRow}>
                        <Icon icon={PackageIcon} size="xsm" color="secondary" />
                      </div>
                      <div style={styles.metaTableRow}>
                        <Text type="supporting" size="xsm" color="secondary">
                          {node.container}
                        </Text>
                      </div>
                      <div style={styles.metaTableRow}>
                        <Icon icon={ThermometerIcon} size="xsm" color="secondary" />
                      </div>
                      <div style={styles.metaTableRow}>
                        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
                          {node.tempDisplay}
                        </Text>
                      </div>
                    </div>
                    {state === 'pending' ? (
                      <div style={{marginTop: 8}}>
                        <Button label="Sign handoff" variant="secondary" size="sm" onClick={() => onSign(node.id)} />
                      </div>
                    ) : null}
                  </div>
                </div>
              </li>
            );
          })}
          {/* Deviation node — appended by the contamination cascade */}
          {flagged ? (
            <li role="listitem">
              <div style={{...styles.connector, width: 0, borderLeft: '2px dashed', borderColor: AMBER, backgroundColor: 'transparent'}} />
              <div style={styles.node}>
                <span style={{...styles.nodeDot, ...NODE_DOT_STYLE.deviation}} aria-hidden>
                  <Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />
                </span>
                <div style={{...styles.nodeCard, borderColor: AMBER, backgroundColor: AMBER_SOFT}}>
                  <Text as="div" type="label" size="xsm" style={{color: AMBER_TEXT}}>
                    QC DEVIATION
                  </Text>
                  <Text as="div" type="body" size="sm" style={{marginTop: 2}}>
                    Contamination flagged at {LINEAGE_PARENT_WELL}
                  </Text>
                  <Text as="div" type="supporting" size="xsm" color="secondary" hasTabularNumbers style={styles.nodeNote}>
                    07 Apr 2026, 15:52 · {holdCount} wells on hold
                  </Text>
                </div>
              </div>
            </li>
          ) : null}
        </ol>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// RELEASE GATE BUTTON — primary; disabled (with a tooltip listing blocked
// wells) whenever the derived hold count is > 0.
// ---------------------------------------------------------------------------

function ReleaseGateButton({
  holdCount,
  blockedWells,
  released,
  onRelease,
}: {
  holdCount: number;
  blockedWells: string[];
  released: boolean;
  onRelease: () => void;
}) {
  if (released) {
    return <Button label="Run released" variant="primary" size="sm" isDisabled icon={<Icon icon={ClipboardCheckIcon} size="sm" />} />;
  }
  if (holdCount > 0) {
    const tip = `Blocked: ${blockedWells.join(', ')} — reagent lot EB-2292 on QC hold`;
    return (
      <Tooltip content={tip}>
        <span style={styles.noShrink}>
          <Button label={`Release ${RUNS[0].id}`} variant="primary" size="sm" isDisabled />
        </span>
      </Tooltip>
    );
  }
  return <Button label={`Release ${RUNS[0].id}`} variant="primary" size="sm" onClick={onRelease} />;
}

// ---------------------------------------------------------------------------
// PAGE
// ---------------------------------------------------------------------------

/**
 * Observe the template root's real width. Host chrome around the template
 * (the demo's sidebar, preview padding) starves the panels independently of
 * the viewport, so viewport media queries alone cannot tell when the fixed
 * 560px plate + 360px custody aside have run the flex manifest out of room.
 */
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
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

export default function LimsPlateWorkbenchTemplate() {
  const store = useRunStore();
  const {state} = store;
  // Responsive subtraction: < 1200px of ROOT width removes the 360 custody
  // aside (reached via the header "Custody" Dialog). Measured on the root
  // itself, not the viewport — see useElementWidth. Width 0 = first
  // pre-observer render; fall back to the viewport query for that frame so
  // wide hosts don't flash the aside away.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rootWidth = useElementWidth(rootRef);
  const isViewportNarrow = useMediaQuery('(max-width: 1200px)');
  const isNarrow = rootWidth > 0 ? rootWidth < 1200 : isViewportNarrow;
  const reduceMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
  const [custodyOpen, setCustodyOpen] = useState(false);

  // ---- DERIVED (never stored) ------------------------------------------
  const wellList = useMemo(() => Object.values(state.wells), [state.wells]);

  const flaggedSet = useMemo(
    () => new Set(wellList.filter(w => w.flag === 'contaminated').map(w => w.id)),
    [wellList],
  );

  // Hold = every well sharing a flagged well's reagent lot (the 8-well EB-2292
  // block when D7 is flagged). This is the number the release gate reads.
  const {holdSet, holdCount, blockedWells} = useMemo(() => {
    const lots = new Set(wellList.filter(w => w.flag === 'contaminated').map(w => w.reagentLot));
    const set = new Set(wellList.filter(w => lots.has(w.reagentLot)).map(w => w.id));
    const blocked = [...set].sort((a, b) => a.localeCompare(b, undefined, {numeric: true}));
    return {holdSet: set, holdCount: set.size, blockedWells: blocked};
  }, [wellList]);

  // Lineage-derived hold: F7/H7 re-status when their parent (D7) is flagged.
  const lineageParentFlagged = flaggedSet.has(LINEAGE_PARENT_WELL);
  const lineageHoldSet = useMemo(
    () => new Set(lineageParentFlagged ? LINEAGE_DERIVED_WELLS : []),
    [lineageParentFlagged],
  );

  // Spatial selection drives the table.
  const filteredWells = useMemo(() => {
    if (state.selectedColumn != null) return WELLS.filter(w => w.col === state.selectedColumn);
    if (state.selectedRow != null) return WELLS.filter(w => w.row === state.selectedRow);
    return WELLS;
  }, [state.selectedColumn, state.selectedRow]);

  // Footer sample-type tally — derived live from the rows, asserts === 96.
  const typeCounts = useMemo(() => {
    const counts: Record<FooterCategory, number> = {Patient: 0, Calibrator: 0, Blank: 0, Spike: 0, Duplicate: 0};
    for (const w of wellList) counts[footerCategory(w)] += 1;
    return counts;
  }, [wellList]);
  const typeTotal = typeCounts.Patient + typeCounts.Calibrator + typeCounts.Blank + typeCounts.Spike + typeCounts.Duplicate;

  const activeFilterLabel =
    state.selectedColumn != null ? `Column ${state.selectedColumn}` : state.selectedRow != null ? `Row ${state.selectedRow}` : null;

  const selectedWell = state.selectedWellId != null ? state.wells[state.selectedWellId] : null;

  const rail = (
    <CustodyHandoffRail
      nodeStates={state.nodeStates}
      flagged={flaggedSet.size > 0}
      holdCount={holdCount}
      onSign={store.signNode}
    />
  );

  return (
    <div ref={rootRef} style={styles.root}>
      {/* polite/assertive live region for the cascade announcement */}
      <div aria-live="assertive" style={styles.srOnly}>
        {state.announce}
      </div>
      <Layout
        height="fill"
        header={
          <LayoutHeader padding={0} hasDivider>
            <VStack gap={0}>
              {/* App header bar (48px) */}
              <div style={styles.headerBar}>
                <span style={styles.brand}>
                  <span style={styles.brandGlyph} aria-hidden>
                    <Icon icon={DropletIcon} size="sm" color="inherit" />
                  </span>
                  <Text type="body" size="sm" color="inherit" style={styles.wordmark}>
                    Aliquot
                  </Text>
                </span>
                <DropdownMenu
                  button={{
                    label: `${state.selectedRunId} · ${RUNS[0].barcode}`,
                    variant: 'secondary',
                    size: 'sm',
                  }}
                  menuWidth={260}
                  items={RUNS.map(run => ({
                    label: run.archived ? `${run.id} · archived` : `${run.id} · ${run.barcode}`,
                    isDisabled: run.archived,
                    onClick: () => store.update('run', {selectedRunId: run.id}),
                  }))}
                />
                <span style={styles.spacer} />
                {isNarrow ? (
                  <Button
                    label="Custody"
                    variant="ghost"
                    size="sm"
                    icon={<Icon icon={PanelRightOpenIcon} size="sm" />}
                    onClick={() => setCustodyOpen(true)}
                  />
                ) : null}
                <ReleaseGateButton
                  holdCount={holdCount}
                  blockedWells={blockedWells}
                  released={state.runStatus === 'released'}
                  onRelease={() => store.releaseRun(holdCount)}
                />
                <Avatar name={PEOPLE.RIVERA} size="small" />
              </div>
              {/* Run meta strip (40px filter row) */}
              <div style={styles.metaStrip}>
                <Token size="sm" color="purple" label={state.selectedRunId} />
                <Text type="supporting" size="xsm" color="secondary" style={styles.mono}>
                  {RUNS[0].barcode}
                </Text>
                <span style={styles.metaAssay}>
                  <Text type="supporting" size="xsm" color="secondary" maxLines={1}>
                    {ASSAY}
                  </Text>
                </span>
                <span style={styles.legendChips} aria-label="Reagent lots">
                  {['EB-2291', 'EB-2292', 'EB-2293'].map(lot => (
                    <Token
                      key={lot}
                      size="sm"
                      color={lot === 'EB-2292' && holdCount > 0 ? 'orange' : 'gray'}
                      label={lot}
                    />
                  ))}
                </span>
                <span style={styles.spacer} />
                {activeFilterLabel != null ? (
                  <span style={styles.noShrink}>
                    <Token
                      size="sm"
                      color="default"
                      label={`Filter: ${activeFilterLabel}`}
                      icon={<Icon icon={XIcon} size="xsm" color="inherit" />}
                      onClick={store.clearFilter}
                    />
                  </span>
                ) : null}
              </div>
            </VStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0}>
            <div style={styles.contentRow}>
              {/* PLATE PANEL (560 fixed) */}
              <div style={styles.platePanel}>
                <div style={styles.plateScroll}>
                  <div style={styles.plateControlRow}>
                    <Heading level={2}>Plate</Heading>
                    {selectedWell != null ? (
                      <>
                        <Text type="supporting" size="xsm" color="secondary" style={styles.mono}>
                          {selectedWell.id}
                        </Text>
                        <Button
                          label={selectedWell.flag === 'contaminated' ? 'Clear flag' : 'Flag contamination'}
                          variant={selectedWell.flag === 'contaminated' ? 'ghost' : 'secondary'}
                          size="sm"
                          icon={<Icon icon={FlagIcon} size="sm" />}
                          onClick={() => store.flagWell(selectedWell.id)}
                        />
                      </>
                    ) : null}
                  </div>
                  <PlateMapGrid
                    wells={state.wells}
                    selectedWellId={state.selectedWellId}
                    selectedColumn={state.selectedColumn}
                    selectedRow={state.selectedRow}
                    holdSet={holdSet}
                    flaggedSet={flaggedSet}
                    reduceMotion={reduceMotion}
                    onSelectWell={store.selectWell}
                    onSelectColumn={store.selectColumn}
                    onSelectRow={store.selectRow}
                    onFlagWell={store.flagWell}
                  />
                </div>
                <WellLegend />
              </div>

              {/* MANIFEST PANEL (flex) */}
              <div style={styles.manifestPanel}>
                <div style={styles.manifestScroll}>
                  <table style={styles.table}>
                    <colgroup>
                      <col style={{width: 52}} />
                      <col style={{width: 150}} />
                      <col style={{width: 96}} />
                      <col style={{width: 108}} />
                      <col style={{width: 112}} />
                      <col style={{width: 64}} />
                      <col style={{width: 132}} />
                    </colgroup>
                    <thead>
                      <tr style={styles.thRow}>
                        <th scope="col" style={styles.th}>
                          <Text type="label" size="xsm" color="secondary">Well</Text>
                        </th>
                        <th scope="col" style={styles.th}>
                          <Text type="label" size="xsm" color="secondary">Sample ID</Text>
                        </th>
                        <th scope="col" style={styles.th}>
                          <Text type="label" size="xsm" color="secondary">Type</Text>
                        </th>
                        <th scope="col" style={styles.th}>
                          <Text type="label" size="xsm" color="secondary">Lineage</Text>
                        </th>
                        <th scope="col" style={{...styles.th, ...styles.thNum}}>
                          <Text type="label" size="xsm" color="secondary">Result</Text>
                        </th>
                        <th scope="col" style={styles.th}>
                          <Text type="label" size="xsm" color="secondary">QC</Text>
                        </th>
                        <th scope="col" style={styles.th}>
                          <Text type="label" size="xsm" color="secondary">Status</Text>
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredWells.map(baseWell => {
                        const well = state.wells[baseWell.id];
                        return (
                          <ManifestRow
                            key={well.id}
                            well={well}
                            selected={state.selectedWellId === well.id}
                            hold={holdSet.has(well.id)}
                            contaminated={flaggedSet.has(well.id)}
                            parentFlagged={lineageHoldSet.has(well.id)}
                            samples={state.samples}
                            onSelect={store.selectWell}
                          />
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {/* Aggregate footer — counts cross-check to 96 + live hold count.
                    Every item is nowrap + flexShrink 0 so a squeezed footer
                    scrolls horizontally instead of stacking word-per-line.
                    (StatusDot's label is aria-only; the trailing Text is its
                    visible echo and must stay at every width.) */}
                <div style={styles.manifestFooter} aria-live="polite">
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers style={styles.noShrink}>
                    {typeCounts.Patient} patient · {typeCounts.Calibrator} cal · {typeCounts.Blank} blank ·{' '}
                    {typeCounts.Spike} spike · {typeCounts.Duplicate} dup = {typeTotal}
                  </Text>
                  <span style={styles.spacer} />
                  {holdCount > 0 ? (
                    <span style={styles.noShrink}>
                      <StatusDot variant="warning" label={`${holdCount} wells on hold`} />
                    </span>
                  ) : (
                    <span style={styles.noShrink}>
                      <StatusDot variant="success" label="No holds" />
                    </span>
                  )}
                  <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers style={styles.noShrink}>
                    {holdCount > 0 ? `${holdCount} on hold` : 'No holds'}
                  </Text>
                </div>
              </div>
            </div>
          </LayoutContent>
        }
        end={
          isNarrow ? undefined : (
            <LayoutPanel width={360} padding={0} hasDivider isScrollable={false} label="Chain of custody">
              <div style={styles.custodyScroll}>{rail}</div>
            </LayoutPanel>
          )
        }
      />
      {/* Below 1200px the aside is reached through this Dialog (subtraction, not
          reflow — nothing on the plate/manifest restacks). */}
      {isNarrow ? (
        <Dialog isOpen={custodyOpen} onOpenChange={setCustodyOpen} width={400} aria-label="Chain of custody">
          <div style={{padding: 20}}>{rail}</div>
        </Dialog>
      ) : null}
    </div>
  );
}
