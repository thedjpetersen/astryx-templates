var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — the Cutline runbook for the Meridian
 *   Foods order-management cutover (legacy ATLAS AS/400 → NovaCore cloud
 *   ERP). One cutover window: Sat Jul 18 2026 20:00 → Sun Jul 19 08:00,
 *   go-live moment T-0 = Sun 02:00, "now" FIXED at T−03:30 (Sat 22:30).
 *   Minute math is one ledger — wall(offset) = 1560 + offset minutes since
 *   Sat 00:00, hand-checked: −360→20:00 Sat (window open) · −210→22:30 Sat
 *   (now) · −60→01:00 Sun (gate) · 0→02:00 Sun (T-0) · F4 end 120+240=360
 *   →08:00 Sun (window close) ✓. Seventeen tasks across six phases
 *   (3+3+3+1+3+4=17 ✓); opening states: 5 done (A1,A2,A3,B1,B2), 1 running
 *   (B3, started T−03:45, now inside its 45m span), 11 pending. The
 *   now-line therefore renders between B3 and C1 (first task with start >
 *   −210 is C1 at −180). Gate checklist: 6 items, 5 required (the optional
 *   vendor-TAM row is excluded from the verdict); "all pre-gate tasks
 *   complete" is AUTO — it derives from the 9 tasks that start before the
 *   T−01:00 gate (A1–C3), unsatisfied at open (B3,C1,C2,C3 outstanding).
 *   Opening verdict: PENDING 2 of 5 (rollback rehearsal + exec approver
 *   pre-checked). Rollback rail: 3 checkpoints (RB-1 covers ≥T−06:00 all
 *   17 tasks · RB-2 covers ≥T−04:15 = 13 tasks · RB-3 covers ≥T−00:30 =
 *   6 tasks ✓ counted from start offsets) plus a non-interactive point of
 *   no return at T+00:45. No clock reads, no randomness, no timers, no
 *   network assets.
 * @output Cutline — Implementation Cutover Plan: a go-live command surface.
 *   A 56px brand header (cut-mark glyph, cutover title, live verdict /
 *   tasks-complete / window chips) over a two-region body: the T-minus
 *   runbook (flex) — six sticky 36px phase headers over 56px task rows,
 *   each row a real toggle button with a T−HH:MM + wall-clock column,
 *   status glyph, task + owner·system line, duration, and status chip,
 *   with a 2px NOW rule pinned between the last started and first future
 *   task — beside a 360px decision aside holding the Go/No-Go gate panel
 *   (verdict banner + six 44px gate rows, one auto-derived from the
 *   runbook itself) and the rollback checkpoint rail (three trip-able
 *   checkpoints + the point-of-no-return marker). Signature moves: (1)
 *   checking a gate row re-derives the verdict banner AND the header chip
 *   (GO only when all five required rows pass); checking runbook rows
 *   B3–C3 flips the AUTO gate row without touching the checklist. (2)
 *   Tripping a rollback checkpoint restyles every task at-or-after its
 *   coverage line — pending work strikes through as “skipped”, finished
 *   work restyles “reverted” — forces the verdict to NO-GO with the
 *   checkpoint named in the banner, re-derives the tasks chip to count
 *   only surviving work, and Stand down restores everything.
 * @position Page template; emitted by \`astryx template implementation-cutover-plan\`
 *
 * Frame: root 100dvh div > Layout height="fill". LayoutHeader carries the
 *   brand row. Content: one flex row — runbook scroller (flex 1, minWidth
 *   0, own overflow-y) + decision aside (360px, own overflow-y, gate panel
 *   stacked over rollback rail). No modals; the aside is the only decision
 *   surface and the runbook is the only list.
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): runbook
 *   gets ~685px — T-column 88 + glyph 24 + flexible label + duration 56 +
 *   status chip 92 fit without truncating the T-labels; aside keeps 360.
 * - <=900px: task rows drop the duration column and the wall-clock
 *   subline (the T-label keeps the row identifiable); aside narrows to 320.
 * - <=680px (390px embed): the body stacks — aside flows under the
 *   runbook full-width with a top divider; the T-column narrows to 64
 *   (T-label only) and header chips wrap under the title. Subtraction,
 *   not squeeze.
 * Container policy: work-surface archetype — sticky phase rows, task-row
 *   buttons, one aside of two stacked panels; no Cards. Task rows and gate
 *   rows are real <button>s with aria-pressed; trip/stand-down are 40px
 *   Button paths; every mutation lands in one polite live region. All
 *   numerals tabular; T-labels and wall clocks are mono.
 * Color policy: token-pure chrome — the “charcoal” of the brand IS the
 *   neutral token ramp (no charcoal literal). ONE quarantined brand accent
 *   (Cutline safety orange): light-dark(#C2410C, #FB923C) — #C2410C on
 *   #FFFFFF ≈ 4.9:1, #FB923C on ~#1C1C1E ≈ 8.7:1 — used for the mark, the
 *   NOW rule + chip (chip text #FFFFFF on #C2410C ≈ 4.9:1; #26150B on
 *   #FB923C ≈ 8.0:1), the running state, and focus rings. State pairs
 *   with math at the declaration: done/GO green light-dark(#15803D,
 *   #4ADE80) (≈5.0:1 / ≈9.6:1), NO-GO red light-dark(#DC2626, #F87171)
 *   (≈4.5:1 / ≈7.2:1). Skipped/reverted restyle with text-secondary +
 *   line-through, never color alone (each carries a labeled chip). Tints
 *   are ≤16%-alpha washes under text that keeps its own contrast.
 * Density grid (repeated verbatim in the CSS): header 56 · phase headers
 *   36 (sticky) · task rows 56 · T-column 88 (64 below 680px) · status
 *   glyph 24 · duration 56 · status chips 22 · aside 360 (320 below
 *   900px) · verdict banner min 64 · gate rows 44 · checkpoint cards min
 *   64 · action buttons 40 · NOW rule 2.
 * Fixture policy: one state object {taskDone overrides, gateChecks,
 *   trippedId} is the single owner. Effective task status, the AUTO gate
 *   row, the verdict, the header chips, and the rollback coverage counts
 *   all re-derive from fixtures + that object every render — the worked
 *   examples in @input stay true because they run through the same
 *   functions.
 */

import {useMemo, useState} from 'react';

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  CircleDotIcon,
  CircleIcon,
  Clock3Icon,
  FlagIcon,
  LockIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
  XCircleIcon,
  type LucideIcon,
} from 'lucide-react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome is token-pure; these are product semantics only.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-implementation-cutover-plan';

// THE quarantined Cutline safety orange. #C2410C on #FFFFFF ≈ 4.9:1 (passes
// 4.5:1 for the 11–13px labels it colors); #FB923C on a ~#1C1C1E dark
// surface ≈ 8.7:1. Colors the mark, NOW rule/chip, running state, focus.
const ORANGE = 'light-dark(#C2410C, #FB923C)';
// Text ON the solid NOW chip: #FFFFFF on #C2410C ≈ 4.9:1 (light); #26150B
// on #FB923C ≈ 8.0:1 (dark) — white on #FB923C would fail at ~1.9:1.
const ORANGE_ON = 'light-dark(#FFFFFF, #26150B)';
// ≤14% wash behind ORANGE text: #C2410C over rgba(194,65,12,.10) on white
// (≈ #F9EBE4) ≈ 4.5:1; #FB923C over rgba(251,146,60,.14) on #1C1C1E ≈ 7.4:1.
const ORANGE_TINT =
  'light-dark(rgba(194, 65, 12, 0.10), rgba(251, 146, 60, 0.14))';
// Done / GO green: #15803D on #FFFFFF ≈ 5.0:1; #4ADE80 on ~#1C1C1E ≈ 9.6:1.
const GREEN = 'light-dark(#15803D, #4ADE80)';
const GREEN_TINT =
  'light-dark(rgba(21, 128, 61, 0.12), rgba(74, 222, 128, 0.14))';
// NO-GO / tripped red: #DC2626 on #FFFFFF ≈ 4.5:1; #F87171 on ~#1C1C1E ≈ 7.2:1.
const RED = 'light-dark(#DC2626, #F87171)';
const RED_TINT =
  'light-dark(rgba(220, 38, 38, 0.10), rgba(248, 113, 113, 0.14))';

const MONO = 'var(--font-family-code, monospace)';

// ---------------------------------------------------------------------------
// MINUTE LEDGER — offsets are minutes relative to T-0 (go-live, Sun 02:00).
// wall(offset) = 1560 + offset minutes since Sat 00:00.
// ---------------------------------------------------------------------------

/** Sun 02:00 expressed as minutes since Sat 00:00. */
const T0_ABS_MIN = 1560;
/** The fixed "now": T−03:30 = Sat 22:30. */
const NOW_OFFSET = -210;

/** −210 → 'T−03:30' · 45 → 'T+00:45' (U+2212 minus for optical width). */
function formatT(offset: number): string {
  const sign = offset < 0 ? '−' : '+';
  const abs = Math.abs(offset);
  const h = String(Math.floor(abs / 60)).padStart(2, '0');
  const m = String(abs % 60).padStart(2, '0');
  return \`T\${sign}\${h}:\${m}\`;
}

/** −210 → 'Sat 22:30' · 45 → 'Sun 02:45'. */
function formatWall(offset: number): string {
  const wall = T0_ABS_MIN + offset;
  const day = wall < 1440 ? 'Sat' : 'Sun';
  const h = String(Math.floor((wall % 1440) / 60)).padStart(2, '0');
  const m = String(wall % 60).padStart(2, '0');
  return \`\${day} \${h}:\${m}\`;
}

/** 45 → '45m' · 240 → '4h 00m'. */
function formatDuration(mins: number): string {
  if (mins < 60) {
    return \`\${mins}m\`;
  }
  return \`\${Math.floor(mins / 60)}h \${String(mins % 60).padStart(2, '0')}m\`;
}

// ---------------------------------------------------------------------------
// DOMAIN TYPES + FIXTURES — six phases, seventeen tasks, one gate, three
// rollback checkpoints. All offsets/durations are the math fields; every
// displayed time formats live from them.
// ---------------------------------------------------------------------------

type BaseStatus = 'done' | 'running' | 'pending';
type EffectiveStatus = BaseStatus | 'skipped' | 'reverted';

interface RunbookTask {
  id: string;
  phaseId: string;
  offset: number; // start, minutes relative to T-0
  duration: number; // minutes
  label: string;
  owner: string;
  system: string;
  status: BaseStatus; // opening state; the taskDone map overrides it
}

interface Phase {
  id: string;
  code: string; // 'A'…'F'
  label: string;
}

const PHASES: Phase[] = [
  {id: 'ph-freeze', code: 'A', label: 'Freeze & comms'},
  {id: 'ph-extract', code: 'B', label: 'Extract'},
  {id: 'ph-load', code: 'C', label: 'Transform & load'},
  {id: 'ph-gate', code: 'D', label: 'Go/No-Go gate'},
  {id: 'ph-switch', code: 'E', label: 'Switch'},
  {id: 'ph-validate', code: 'F', label: 'Validate & hypercare'},
];

/** Seventeen tasks (3+3+3+1+3+4). Stress fixtures live here on purpose:
 * F4 carries a deliberately long label to exercise single-line truncation,
 * and B3 opens mid-flight so the running state renders above the NOW rule. */
const TASKS: RunbookTask[] = [
  {
    id: 'A1',
    phaseId: 'ph-freeze',
    offset: -360,
    duration: 30,
    label: 'Change freeze in effect — lock ATLAS order entry',
    owner: 'Elena Voss',
    system: 'ATLAS',
    status: 'done',
  },
  {
    id: 'A2',
    phaseId: 'ph-freeze',
    offset: -330,
    duration: 15,
    label: 'Maintenance notice live on status page + storefront banner',
    owner: 'Jordan Blake',
    system: 'Statuspage',
    status: 'done',
  },
  {
    id: 'A3',
    phaseId: 'ph-freeze',
    offset: -315,
    duration: 15,
    label: 'Bridge open — roster check against the on-call matrix',
    owner: 'Elena Voss',
    system: 'Bridge',
    status: 'done',
  },
  {
    id: 'B1',
    phaseId: 'ph-extract',
    offset: -300,
    duration: 45,
    label: 'Final delta export: open orders + customer master',
    owner: 'Priya Nair',
    system: 'ATLAS',
    status: 'done',
  },
  {
    id: 'B2',
    phaseId: 'ph-extract',
    offset: -255,
    duration: 30,
    label: 'Checksum manifest — 1,482,905 rows vs control totals',
    owner: 'Priya Nair',
    system: 'ATLAS',
    status: 'done',
  },
  {
    id: 'B3',
    phaseId: 'ph-extract',
    offset: -225,
    duration: 45,
    label: 'Transfer encrypted extracts to NovaCore landing bucket',
    owner: 'Sam Ortiz',
    system: 'S3',
    status: 'running',
  },
  {
    id: 'C1',
    phaseId: 'ph-load',
    offset: -180,
    duration: 60,
    label: 'Run mapping jobs M-101…M-118 (orders, customers, pricing)',
    owner: 'Sam Ortiz',
    system: 'NovaCore ETL',
    status: 'pending',
  },
  {
    id: 'C2',
    phaseId: 'ph-load',
    offset: -120,
    duration: 30,
    label: 'Load sequence: master data → open orders → pricing rules',
    owner: 'Sam Ortiz',
    system: 'NovaCore',
    status: 'pending',
  },
  {
    id: 'C3',
    phaseId: 'ph-load',
    offset: -90,
    duration: 30,
    label: 'Reconciliation report RPT-4471 — spot-check 50 orders',
    owner: 'Priya Nair',
    system: 'NovaCore',
    status: 'pending',
  },
  {
    id: 'D1',
    phaseId: 'ph-gate',
    offset: -60,
    duration: 15,
    label: 'Go/No-Go review — exec decision recorded in Cutline',
    owner: 'Elena Voss',
    system: 'Cutline',
    status: 'pending',
  },
  {
    id: 'E1',
    phaseId: 'ph-switch',
    offset: -45,
    duration: 15,
    label: 'Repoint EDI + storefront APIs to NovaCore endpoints',
    owner: 'Kofi Mensah',
    system: 'Boomi',
    status: 'pending',
  },
  {
    id: 'E2',
    phaseId: 'ph-switch',
    offset: -30,
    duration: 20,
    label: 'DNS cutover: orders.meridianfoods.com — 60s TTL swing',
    owner: 'Kofi Mensah',
    system: 'Route 53',
    status: 'pending',
  },
  {
    id: 'E3',
    phaseId: 'ph-switch',
    offset: -10,
    duration: 10,
    label: 'Unlock order entry in NovaCore — go-live',
    owner: 'Elena Voss',
    system: 'NovaCore',
    status: 'pending',
  },
  {
    id: 'F1',
    phaseId: 'ph-validate',
    offset: 0,
    duration: 45,
    label: 'Smoke suite S-01…S-12: order create, price, ship, invoice',
    owner: 'Mei Tanaka',
    system: 'NovaCore',
    status: 'pending',
  },
  {
    id: 'F2',
    phaseId: 'ph-validate',
    offset: 45,
    duration: 30,
    label: 'First live EDI 850 from Hartwell Grocers end-to-end',
    owner: 'Kofi Mensah',
    system: 'Boomi',
    status: 'pending',
  },
  {
    id: 'F3',
    phaseId: 'ph-validate',
    offset: 75,
    duration: 45,
    label: 'Hypercare handoff: on-call rotation + triage channel live',
    owner: 'Elena Voss',
    system: 'PagerDuty',
    status: 'pending',
  },
  {
    id: 'F4',
    phaseId: 'ph-validate',
    offset: 120,
    duration: 240,
    label:
      'Hypercare monitoring — watch order intake, allocation runs, invoice posting, and integration error queues on 15-minute checkpoints until window close',
    owner: 'Mei Tanaka',
    system: 'NovaCore',
    status: 'pending',
  },
];

const TASK_BY_ID = new Map(TASKS.map(t => [t.id, t]));

/** The first task strictly after the fixed now — the NOW rule renders
 * immediately before it (C1 at −180 for NOW_OFFSET −210). */
const NOW_BEFORE_TASK_ID = TASKS.find(t => t.offset > NOW_OFFSET)?.id ?? null;

/** Gate moment: phase D's single task. */
const GATE_OFFSET = -60;

// ---------------------------------------------------------------------------
// GATE CHECKLIST — five required rows + one optional; g-tasks is AUTO and
// derives from the runbook (all 9 pre-gate tasks A1–C3 complete).
// ---------------------------------------------------------------------------

interface GateItem {
  id: string;
  label: string;
  evidence: string;
  required: boolean;
  auto: boolean;
}

const GATE_ITEMS: GateItem[] = [
  {
    id: 'g-recon',
    label: 'Reconciliation variance ≤ 0.5% vs control totals',
    evidence: 'RPT-4471',
    required: true,
    auto: false,
  },
  {
    id: 'g-tasks',
    label: 'All pre-gate runbook tasks complete (A1–C3)',
    evidence: 'Runbook',
    required: true,
    auto: true,
  },
  {
    id: 'g-rollback',
    label: 'Rollback rehearsal RB-DRY-3 signed off ≤ 7 days old',
    evidence: 'CHG-20114',
    required: true,
    auto: false,
  },
  {
    id: 'g-exec',
    label: 'Exec approver on bridge (COO — R. Calloway)',
    evidence: 'Bridge roster',
    required: true,
    auto: false,
  },
  {
    id: 'g-sev',
    label: 'No open Sev-1/Sev-2 against ATLAS or NovaCore',
    evidence: 'PagerDuty',
    required: true,
    auto: false,
  },
  {
    id: 'g-vendor',
    label: 'NovaCore vendor TAM on standby',
    evidence: 'Optional',
    required: false,
    auto: false,
  },
];

/** Opening manual checks: rehearsal + exec approver → verdict PENDING 2/5. */
const INITIAL_GATE_CHECKS: Record<string, boolean> = {
  'g-rollback': true,
  'g-exec': true,
};

// ---------------------------------------------------------------------------
// ROLLBACK CHECKPOINTS — tripping one restyles every task at-or-after its
// coverage offset. Coverage counts (from start offsets): RB-1 ≥−360 = all
// 17 · RB-2 ≥−255 = 13 · RB-3 ≥−30 = 6.
// ---------------------------------------------------------------------------

interface RollbackCheckpoint {
  id: string;
  code: string;
  label: string;
  procedure: string;
  armedAt: number; // offset when this checkpoint became available
  coverFrom: number; // tasks with offset >= coverFrom roll back
}

const CHECKPOINTS: RollbackCheckpoint[] = [
  {
    id: 'rb-1',
    code: 'RB-1',
    label: 'Restore ATLAS snapshot + lift change freeze',
    procedure: 'Snapshot SNAP-0718-1955 restores in ~40m; comms template R1.',
    armedAt: -360,
    coverFrom: -360,
  },
  {
    id: 'rb-2',
    code: 'RB-2',
    label: 'Purge landing bucket + re-extract clean deltas',
    procedure: 'Drops transferred extracts; re-run B1–B2 against ATLAS.',
    armedAt: -255,
    coverFrom: -255,
  },
  {
    id: 'rb-3',
    code: 'RB-3',
    label: 'DNS swing-back (60s TTL) + EDI repoint to ATLAS',
    procedure: 'Reverses E1–E2; ATLAS order entry unlocks behind it.',
    armedAt: -30,
    coverFrom: -30,
  },
];

const CHECKPOINT_BY_ID = new Map(CHECKPOINTS.map(c => [c.id, c]));

/** After the first live EDI transaction lands in NovaCore, rollback is no
 * longer clean — rendered as a non-interactive rail terminus. */
const POINT_OF_NO_RETURN_OFFSET = 45;

// ---------------------------------------------------------------------------
// DERIVATION — fixtures + the single state object in, every pixel out.
// ---------------------------------------------------------------------------

type TaskDoneOverrides = Record<string, boolean>;

function isTaskDone(task: RunbookTask, taskDone: TaskDoneOverrides): boolean {
  return taskDone[task.id] ?? task.status === 'done';
}

function effectiveStatus(
  task: RunbookTask,
  taskDone: TaskDoneOverrides,
  tripped: RollbackCheckpoint | null,
): EffectiveStatus {
  const done = isTaskDone(task, taskDone);
  if (tripped != null && task.offset >= tripped.coverFrom) {
    return done ? 'reverted' : 'skipped';
  }
  if (done) {
    return 'done';
  }
  return task.status === 'running' ? 'running' : 'pending';
}

/** The AUTO gate row: every task that starts before the T−01:00 gate must
 * be effectively done (a tripped rollback un-does them too). */
function preGateTasksComplete(
  taskDone: TaskDoneOverrides,
  tripped: RollbackCheckpoint | null,
): boolean {
  return TASKS.filter(t => t.offset < GATE_OFFSET).every(
    t => effectiveStatus(t, taskDone, tripped) === 'done',
  );
}

interface Verdict {
  kind: 'go' | 'nogo' | 'pending';
  passed: number;
  requiredTotal: number;
  headline: string;
  detail: string;
}

function gateItemSatisfied(
  item: GateItem,
  gateChecks: Record<string, boolean>,
  taskDone: TaskDoneOverrides,
  tripped: RollbackCheckpoint | null,
): boolean {
  if (item.auto) {
    return preGateTasksComplete(taskDone, tripped);
  }
  return gateChecks[item.id] ?? false;
}

function deriveVerdict(
  gateChecks: Record<string, boolean>,
  taskDone: TaskDoneOverrides,
  tripped: RollbackCheckpoint | null,
): Verdict {
  const required = GATE_ITEMS.filter(i => i.required);
  const passed = required.filter(i =>
    gateItemSatisfied(i, gateChecks, taskDone, tripped),
  ).length;
  if (tripped != null) {
    return {
      kind: 'nogo',
      passed,
      requiredTotal: required.length,
      headline: 'NO-GO',
      detail: \`Rollback \${tripped.code} tripped — \${tripped.label}\`,
    };
  }
  if (passed === required.length) {
    return {
      kind: 'go',
      passed,
      requiredTotal: required.length,
      headline: 'GO',
      detail: 'All five required gate criteria satisfied — cleared to switch.',
    };
  }
  return {
    kind: 'pending',
    passed,
    requiredTotal: required.length,
    headline: \`PENDING \${passed}/\${required.length}\`,
    detail: 'Gate closes at T−01:00 (Sun 01:00) — outstanding criteria below.',
  };
}

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors scoped under .tpl-implementation-cutover-plan.
// Density grid repeated verbatim: header 56 · phase headers 36 · task rows
// 56 · T-column 88 (64 below 680px) · status glyph 24 · duration 56 ·
// status chips 22 · aside 360 (320 below 900px) · verdict banner min 64 ·
// gate rows 44 · checkpoint cards min 64 · action buttons 40 · NOW rule 2.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = \`
.\${SCOPE} {
  font-family: var(--font-family-sans);
}
.\${SCOPE} button {
  font: inherit;
  color: inherit;
}
.\${SCOPE} .icp-focusable:focus-visible {
  outline: 2px solid \${ORANGE};
  outline-offset: -2px;
}
.\${SCOPE} .icp-live {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* --- header: 56px brand row ---------------------------------------------- */
.\${SCOPE} .icp-header-row {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-2) var(--spacing-3);
  min-height: 56px;
  box-sizing: border-box;
  padding: var(--spacing-2) var(--spacing-4);
}
.\${SCOPE} .icp-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: \${ORANGE};
}
.\${SCOPE} .icp-title-cluster {
  display: flex;
  align-items: baseline;
  gap: var(--spacing-2);
  min-width: 0;
  flex: 1 1 300px;
}
.\${SCOPE} .icp-chips {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
.\${SCOPE} .icp-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
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
.\${SCOPE} .icp-chip strong {
  color: var(--color-text-primary);
  font-weight: 700;
}
.\${SCOPE} .icp-chip--go {
  border-color: \${GREEN};
  background: \${GREEN_TINT};
  color: \${GREEN};
}
.\${SCOPE} .icp-chip--nogo {
  border-color: \${RED};
  background: \${RED_TINT};
  color: \${RED};
}
.\${SCOPE} .icp-chip--pending {
  border-color: \${ORANGE};
  background: \${ORANGE_TINT};
  color: \${ORANGE};
}
/* --- body: runbook + 360px decision aside -------------------------------- */
.\${SCOPE} .icp-body {
  height: 100%;
  min-height: 0;
  display: flex;
}
.\${SCOPE} .icp-runbook {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
}
/* Sticky 36px phase headers: code chip · label · span · task count. */
.\${SCOPE} .icp-phase {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  height: 36px;
  box-sizing: border-box;
  padding: 0 var(--spacing-4);
  background: var(--color-background-muted);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .icp-phase-code {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border-radius: 4px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  color: var(--color-text-primary);
  font-size: 10px;
}
.\${SCOPE} .icp-phase-span {
  font-family: \${MONO};
  font-variant-numeric: tabular-nums;
  text-transform: none;
  letter-spacing: 0;
}
.\${SCOPE} .icp-phase-fill {
  flex: 1;
}
/* 56px task rows — real toggle <button>s. Grid: T 88 · glyph 24 ·
   label/meta flex · duration 56 · status chip 92. */
.\${SCOPE} .icp-task {
  display: grid;
  grid-template-columns: 88px 24px minmax(0, 1fr) 56px 92px;
  align-items: center;
  column-gap: var(--spacing-3);
  width: 100%;
  box-sizing: border-box;
  height: 56px;
  padding: 0 var(--spacing-4);
  border: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  text-align: left;
  cursor: pointer;
}
@media (hover: hover) {
  .\${SCOPE} .icp-task:hover:not(:disabled) {
    background: var(--color-background-muted);
  }
}
.\${SCOPE} .icp-task:disabled {
  cursor: not-allowed;
}
.\${SCOPE} .icp-tcol {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.\${SCOPE} .icp-tlabel {
  font-family: \${MONO};
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.\${SCOPE} .icp-twall {
  font-family: \${MONO};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
.\${SCOPE} .icp-glyph {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.\${SCOPE} .icp-glyph--done { color: \${GREEN}; }
.\${SCOPE} .icp-glyph--running { color: \${ORANGE}; }
.\${SCOPE} .icp-glyph--pending { color: var(--color-text-secondary); }
.\${SCOPE} .icp-glyph--skipped { color: var(--color-text-secondary); }
.\${SCOPE} .icp-glyph--reverted { color: \${RED}; }
.\${SCOPE} .icp-task-main {
  display: flex;
  flex-direction: column;
  gap: 1px;
  min-width: 0;
}
.\${SCOPE} .icp-task-label {
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.\${SCOPE} .icp-task-meta {
  font-size: 12px;
  color: var(--color-text-secondary);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
/* Rolled-back restyle: never color alone — the status chip names it too. */
.\${SCOPE} .icp-task--cut .icp-task-label {
  text-decoration: line-through;
  color: var(--color-text-secondary);
}
.\${SCOPE} .icp-task--cut .icp-tlabel {
  color: var(--color-text-secondary);
}
.\${SCOPE} .icp-duration {
  font-size: 12px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  text-align: right;
  white-space: nowrap;
}
/* 22px status chips. */
.\${SCOPE} .icp-status {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 22px;
  box-sizing: border-box;
  padding: 0 8px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  white-space: nowrap;
  justify-self: end;
  color: var(--color-text-secondary);
}
.\${SCOPE} .icp-status--done {
  border-color: \${GREEN};
  background: \${GREEN_TINT};
  color: \${GREEN};
}
.\${SCOPE} .icp-status--running {
  border-color: \${ORANGE};
  background: \${ORANGE_TINT};
  color: \${ORANGE};
}
.\${SCOPE} .icp-status--skipped {
  background: var(--color-background-muted);
}
.\${SCOPE} .icp-status--reverted {
  border-color: \${RED};
  background: \${RED_TINT};
  color: \${RED};
}
/* The 2px NOW rule + solid chip, pinned between runbook rows. */
.\${SCOPE} .icp-now {
  position: relative;
  height: 2px;
  background: \${ORANGE};
}
.\${SCOPE} .icp-now-chip {
  position: absolute;
  right: var(--spacing-4);
  top: -9px;
  display: inline-flex;
  align-items: center;
  padding: 2px 8px;
  border-radius: 999px;
  background: \${ORANGE};
  color: \${ORANGE_ON};
  font-family: \${MONO};
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  white-space: nowrap;
}
/* --- decision aside ------------------------------------------------------- */
.\${SCOPE} .icp-aside {
  width: 360px;
  flex-shrink: 0;
  box-sizing: border-box;
  border-left: var(--border-width) solid var(--color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.\${SCOPE} .icp-panel {
  padding: var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
.\${SCOPE} .icp-rail {
  padding: var(--spacing-4);
}
.\${SCOPE} .icp-section-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 var(--spacing-2);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.05em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.\${SCOPE} .icp-section-title .icp-mono {
  font-family: \${MONO};
  letter-spacing: 0;
  text-transform: none;
}
/* Verdict banner: min 64px, restated by the header chip. */
.\${SCOPE} .icp-verdict {
  box-sizing: border-box;
  min-height: 64px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 2px;
  margin-bottom: var(--spacing-3);
}
.\${SCOPE} .icp-verdict-head {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0.03em;
  font-variant-numeric: tabular-nums;
}
.\${SCOPE} .icp-verdict-detail {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .icp-verdict--go {
  border-color: \${GREEN};
  background: \${GREEN_TINT};
}
.\${SCOPE} .icp-verdict--go .icp-verdict-head { color: \${GREEN}; }
.\${SCOPE} .icp-verdict--nogo {
  border-color: \${RED};
  background: \${RED_TINT};
}
.\${SCOPE} .icp-verdict--nogo .icp-verdict-head { color: \${RED}; }
.\${SCOPE} .icp-verdict--pending {
  border-color: \${ORANGE};
  background: \${ORANGE_TINT};
}
.\${SCOPE} .icp-verdict--pending .icp-verdict-head { color: \${ORANGE}; }
/* 44px gate rows: manual rows are toggle buttons; the auto row is inert. */
.\${SCOPE} .icp-gate-row {
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) auto;
  align-items: center;
  column-gap: var(--spacing-2);
  width: 100%;
  box-sizing: border-box;
  min-height: 44px;
  padding: var(--spacing-1) 0;
  border: 0;
  border-bottom: var(--border-width) solid var(--color-border);
  background: transparent;
  text-align: left;
}
.\${SCOPE} button.icp-gate-row {
  cursor: pointer;
}
@media (hover: hover) {
  .\${SCOPE} button.icp-gate-row:hover {
    background: var(--color-background-muted);
  }
}
.\${SCOPE} .icp-gate-label {
  font-size: 12px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.\${SCOPE} .icp-gate-sub {
  font-size: 11px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .icp-gate-evidence {
  font-family: \${MONO};
  font-size: 11px;
  color: var(--color-text-secondary);
  white-space: nowrap;
}
/* Rollback checkpoint cards: min 64px; tripped card restyles red. */
.\${SCOPE} .icp-cp {
  box-sizing: border-box;
  min-height: 64px;
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 8px);
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-1);
  margin-bottom: var(--spacing-2);
}
.\${SCOPE} .icp-cp--tripped {
  border-color: \${RED};
  background: \${RED_TINT};
}
.\${SCOPE} .icp-cp-top {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.\${SCOPE} .icp-cp-code {
  font-family: \${MONO};
  font-size: 11px;
  font-weight: 700;
  color: \${ORANGE};
  border: var(--border-width) solid \${ORANGE};
  border-radius: 4px;
  padding: 0 5px;
}
.\${SCOPE} .icp-cp--tripped .icp-cp-code {
  color: \${RED};
  border-color: \${RED};
}
.\${SCOPE} .icp-cp-label {
  flex: 1;
  min-width: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--color-text-primary);
}
.\${SCOPE} .icp-cp-proc {
  font-size: 12px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .icp-cp-foot {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}
.\${SCOPE} .icp-cp-meta {
  flex: 1;
  font-family: \${MONO};
  font-size: 11px;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.\${SCOPE} .icp-cp-tripped-note {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  font-weight: 700;
  color: \${RED};
}
/* Density-grid contract: trip / stand-down are the 40px action path. */
.\${SCOPE} .icp-cp-foot button {
  min-height: 40px;
}
/* Point of no return: dashed, inert. */
.\${SCOPE} .icp-ponr {
  border: var(--border-width) dashed var(--color-border);
  border-radius: var(--radius-container, 8px);
  padding: var(--spacing-2) var(--spacing-3);
  display: flex;
  align-items: flex-start;
  gap: var(--spacing-2);
  font-size: 12px;
  color: var(--color-text-secondary);
}
.\${SCOPE} .icp-ponr strong {
  color: var(--color-text-primary);
  font-family: \${MONO};
  font-variant-numeric: tabular-nums;
}
/* --- responsive subtraction ----------------------------------------------- */
@media (max-width: 900px) {
  .\${SCOPE} .icp-aside {
    width: 320px;
  }
  .\${SCOPE} .icp-task {
    grid-template-columns: 88px 24px minmax(0, 1fr) 92px;
  }
  .\${SCOPE} .icp-duration {
    display: none;
  }
  .\${SCOPE} .icp-twall {
    display: none;
  }
}
@media (max-width: 680px) {
  .\${SCOPE} .icp-body {
    flex-direction: column;
    overflow-y: auto;
  }
  .\${SCOPE} .icp-runbook {
    flex: none;
    overflow-y: visible;
  }
  .\${SCOPE} .icp-phase {
    position: static;
  }
  .\${SCOPE} .icp-aside {
    width: auto;
    border-left: 0;
    border-top: var(--border-width) solid var(--color-border);
  }
  .\${SCOPE} .icp-task {
    grid-template-columns: 64px 24px minmax(0, 1fr) 92px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .\${SCOPE} * {
    transition: none !important;
  }
}
\`;

// ---------------------------------------------------------------------------
// PRESENTATIONAL PIECES — props in, JSX out; all state lives in the page.
// ---------------------------------------------------------------------------

/** Cutline mark — a “cut here” glyph: dashed rule + solid notch. */
function BrandMark() {
  return (
    <span className="icp-mark" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
        <path
          d="M2 15h20"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray="3 3"
        />
        <path d="M12 6l4.5 6h-9L12 6z" fill="currentColor" />
      </svg>
    </span>
  );
}

const STATUS_META: Record<
  EffectiveStatus,
  {label: string; icon: LucideIcon}
> = {
  done: {label: 'Done', icon: CheckCircle2Icon},
  running: {label: 'Running', icon: CircleDotIcon},
  pending: {label: 'Pending', icon: CircleIcon},
  skipped: {label: 'Skipped', icon: XCircleIcon},
  reverted: {label: 'Reverted', icon: RotateCcwIcon},
};

/** One 56px runbook row — a real toggle button (done ↔ not done) that
 * refuses interaction once a rollback has cut it. */
function TaskRow({
  task,
  status,
  onToggle,
}: {
  task: RunbookTask;
  status: EffectiveStatus;
  onToggle: (taskId: string) => void;
}) {
  const isCut = status === 'skipped' || status === 'reverted';
  const meta = STATUS_META[status];
  return (
    <button
      type="button"
      className={\`icp-task icp-focusable\${isCut ? ' icp-task--cut' : ''}\`}
      disabled={isCut}
      aria-pressed={status === 'done'}
      aria-label={\`\${task.id} \${task.label} — \${formatT(task.offset)} (\${formatWall(
        task.offset,
      )}), \${meta.label}\${isCut ? ' by rollback' : ''}\`}
      onClick={() => onToggle(task.id)}>
      <span className="icp-tcol">
        <span className="icp-tlabel">{formatT(task.offset)}</span>
        <span className="icp-twall">{formatWall(task.offset)}</span>
      </span>
      <span className={\`icp-glyph icp-glyph--\${status}\`} aria-hidden>
        <Icon icon={meta.icon} size="sm" color="inherit" />
      </span>
      <span className="icp-task-main">
        <span className="icp-task-label">{task.label}</span>
        <span className="icp-task-meta">
          {task.id} · {task.owner} · {task.system}
        </span>
      </span>
      <span className="icp-duration">{formatDuration(task.duration)}</span>
      <span className={\`icp-status icp-status--\${status}\`}>{meta.label}</span>
    </button>
  );
}

/** The NOW rule — a 2px brand rule with a solid T/wall chip. */
function NowRule() {
  return (
    <div className="icp-now" role="presentation">
      <span className="icp-now-chip">
        NOW · {formatT(NOW_OFFSET)} · {formatWall(NOW_OFFSET)}
      </span>
    </div>
  );
}

/** One 44px gate row. Manual rows toggle; the auto row is inert and
 * explains its derivation. */
function GateRow({
  item,
  satisfied,
  outstandingPreGate,
  onToggle,
}: {
  item: GateItem;
  satisfied: boolean;
  outstandingPreGate: number;
  onToggle: (itemId: string) => void;
}) {
  const glyph = (
    <span
      className={\`icp-glyph \${satisfied ? 'icp-glyph--done' : 'icp-glyph--pending'}\`}
      aria-hidden>
      <Icon
        icon={satisfied ? CheckCircle2Icon : CircleIcon}
        size="sm"
        color="inherit"
      />
    </span>
  );
  const labelBlock = (
    <span>
      <span className="icp-gate-label">
        {item.label}
        {!item.required && ' (optional)'}
      </span>
      {item.auto && (
        <span className="icp-gate-sub">
          {' '}
          — auto:{' '}
          {satisfied
            ? 'all pre-gate tasks complete'
            : \`\${outstandingPreGate} pre-gate task\${
                outstandingPreGate === 1 ? '' : 's'
              } outstanding\`}
        </span>
      )}
    </span>
  );
  if (item.auto) {
    return (
      <div className="icp-gate-row">
        {glyph}
        {labelBlock}
        <Tooltip content="Derived from runbook rows A1–C3 — check them off in the runbook to satisfy this criterion.">
          <span className="icp-gate-evidence">
            <Icon icon={LockIcon} size="sm" color="secondary" /> {item.evidence}
          </span>
        </Tooltip>
      </div>
    );
  }
  return (
    <button
      type="button"
      className="icp-gate-row icp-focusable"
      aria-pressed={satisfied}
      aria-label={\`\${item.label} — \${satisfied ? 'satisfied' : 'not satisfied'}\`}
      onClick={() => onToggle(item.id)}>
      {glyph}
      {labelBlock}
      <span className="icp-gate-evidence">{item.evidence}</span>
    </button>
  );
}

/** One rollback checkpoint card with its 40px trip / stand-down path. */
function CheckpointCard({
  checkpoint,
  isTripped,
  isArmed,
  coveredCount,
  onTrip,
  onStandDown,
}: {
  checkpoint: RollbackCheckpoint;
  isTripped: boolean;
  isArmed: boolean;
  coveredCount: number;
  onTrip: (id: string) => void;
  onStandDown: () => void;
}) {
  return (
    <div className={\`icp-cp\${isTripped ? ' icp-cp--tripped' : ''}\`}>
      <div className="icp-cp-top">
        <span className="icp-cp-code">{checkpoint.code}</span>
        <span className="icp-cp-label">{checkpoint.label}</span>
      </div>
      <span className="icp-cp-proc">{checkpoint.procedure}</span>
      <div className="icp-cp-foot">
        <span className="icp-cp-meta">
          {isArmed
            ? \`armed \${formatT(checkpoint.armedAt)} · covers \${formatT(
                checkpoint.coverFrom,
              )} → · \${coveredCount} tasks\`
            : \`arms at \${formatT(checkpoint.armedAt)} — not yet available\`}
        </span>
        {isTripped ? (
          <>
            <span className="icp-cp-tripped-note">
              <Icon icon={ShieldAlertIcon} size="sm" color="inherit" />
              Tripped
            </span>
            <Button
              label="Stand down"
              variant="secondary"
              size="sm"
              onClick={onStandDown}
            />
          </>
        ) : (
          <Button
            label="Trip checkpoint"
            variant="ghost"
            size="sm"
            isDisabled={!isArmed}
            onClick={() => onTrip(checkpoint.id)}
          />
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one {taskDone, gateChecks, trippedId} owner; everything re-derives.
// ---------------------------------------------------------------------------

export default function ImplementationCutoverPlanTemplate() {
  const [taskDone, setTaskDone] = useState<TaskDoneOverrides>({});
  const [gateChecks, setGateChecks] =
    useState<Record<string, boolean>>(INITIAL_GATE_CHECKS);
  const [trippedId, setTrippedId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');

  const tripped =
    trippedId != null ? (CHECKPOINT_BY_ID.get(trippedId) ?? null) : null;

  const statusById = useMemo(() => {
    const map = new Map<string, EffectiveStatus>();
    for (const task of TASKS) {
      map.set(task.id, effectiveStatus(task, taskDone, tripped));
    }
    return map;
  }, [taskDone, tripped]);

  const doneCount = TASKS.filter(t => statusById.get(t.id) === 'done').length;
  const activeTotal = TASKS.filter(t => {
    const s = statusById.get(t.id);
    return s !== 'skipped' && s !== 'reverted';
  }).length;
  const outstandingPreGate = TASKS.filter(
    t => t.offset < GATE_OFFSET && statusById.get(t.id) !== 'done',
  ).length;

  const verdict = deriveVerdict(gateChecks, taskDone, tripped);

  const toggleTask = (taskId: string) => {
    const task = TASK_BY_ID.get(taskId);
    if (task == null || statusById.get(taskId) === 'skipped') {
      return;
    }
    const nextDone = !isTaskDone(task, taskDone);
    const nextOverrides = {...taskDone, [taskId]: nextDone};
    setTaskDone(nextOverrides);
    const autoNowSatisfied = preGateTasksComplete(nextOverrides, tripped);
    const nextVerdict = deriveVerdict(gateChecks, nextOverrides, tripped);
    setAnnouncement(
      \`\${task.id} marked \${nextDone ? 'done' : 'not done'}.\${
        task.offset < GATE_OFFSET
          ? \` Pre-gate gate criterion \${
              autoNowSatisfied ? 'satisfied' : 'not satisfied'
            }; verdict \${nextVerdict.headline}.\`
          : ''
      }\`,
    );
  };

  const toggleGate = (itemId: string) => {
    const item = GATE_ITEMS.find(i => i.id === itemId);
    if (item == null || item.auto) {
      return;
    }
    const next = {...gateChecks, [itemId]: !(gateChecks[itemId] ?? false)};
    setGateChecks(next);
    const nextVerdict = deriveVerdict(next, taskDone, tripped);
    setAnnouncement(
      \`\${item.label} \${next[itemId] ? 'checked' : 'unchecked'} — verdict \${
        nextVerdict.headline
      }.\`,
    );
  };

  const tripCheckpoint = (checkpointId: string) => {
    const checkpoint = CHECKPOINT_BY_ID.get(checkpointId);
    if (checkpoint == null) {
      return;
    }
    setTrippedId(checkpointId);
    const covered = TASKS.filter(t => t.offset >= checkpoint.coverFrom).length;
    setAnnouncement(
      \`Rollback \${checkpoint.code} tripped — \${covered} tasks rolled back, verdict NO-GO.\`,
    );
  };

  const standDown = () => {
    if (tripped != null) {
      setAnnouncement(
        \`Rollback \${tripped.code} stood down — runbook restored, verdict \${
          deriveVerdict(gateChecks, taskDone, null).headline
        }.\`,
      );
    }
    setTrippedId(null);
  };

  const verdictChipClass =
    verdict.kind === 'go'
      ? 'icp-chip--go'
      : verdict.kind === 'nogo'
        ? 'icp-chip--nogo'
        : 'icp-chip--pending';

  const header = (
    <LayoutHeader hasDivider padding={0}>
      <div className="icp-header-row">
        <div className="icp-title-cluster">
          <BrandMark />
          <Heading level={1}>Cutline · Meridian Foods ERP cutover</Heading>
          <Text type="supporting" color="secondary">
            Runbook rev C · window Sat Jul 18 20:00 → Sun 08:00
          </Text>
        </div>
        <div className="icp-chips">
          <span className={\`icp-chip \${verdictChipClass}\`}>
            <Icon icon={FlagIcon} size="sm" color="inherit" />
            Gate <strong>{verdict.headline}</strong>
          </span>
          <span className="icp-chip">
            Tasks{' '}
            <strong>
              {doneCount}/{activeTotal}
            </strong>{' '}
            done
          </span>
          <span className="icp-chip">
            <Icon icon={Clock3Icon} size="sm" color="inherit" />
            T-0 Sun 02:00 · now <strong>{formatT(NOW_OFFSET)}</strong>
          </span>
        </div>
      </div>
    </LayoutHeader>
  );

  const runbook = (
    <div className="icp-runbook" role="list" aria-label="Cutover runbook">
      {PHASES.map(phase => {
        const phaseTasks = TASKS.filter(t => t.phaseId === phase.id);
        const first = phaseTasks[0];
        const last = phaseTasks[phaseTasks.length - 1];
        return (
          <div key={phase.id} role="presentation">
            <div className="icp-phase">
              <span className="icp-phase-code">{phase.code}</span>
              {phase.label}
              <span className="icp-phase-span">
                {formatT(first.offset)} → {formatT(last.offset)}
              </span>
              <span className="icp-phase-fill" />
              {phaseTasks.length} task{phaseTasks.length === 1 ? '' : 's'}
            </div>
            {phaseTasks.map(task => (
              <div key={task.id} role="listitem">
                {task.id === NOW_BEFORE_TASK_ID && <NowRule />}
                <TaskRow
                  task={task}
                  status={statusById.get(task.id) ?? 'pending'}
                  onToggle={toggleTask}
                />
              </div>
            ))}
          </div>
        );
      })}
    </div>
  );

  const aside = (
    <aside className="icp-aside" aria-label="Go/No-Go gate and rollback rail">
      <section className="icp-panel" aria-label="Go/No-Go gate">
        <h2 className="icp-section-title">
          <Icon icon={FlagIcon} size="sm" color="inherit" />
          Go / No-Go gate
          <span className="icp-mono">
            {formatT(GATE_OFFSET)} · {formatWall(GATE_OFFSET)}
          </span>
        </h2>
        <div className={\`icp-verdict icp-verdict--\${verdict.kind}\`}>
          <span className="icp-verdict-head">
            <Icon
              icon={
                verdict.kind === 'go'
                  ? CheckCircle2Icon
                  : verdict.kind === 'nogo'
                    ? XCircleIcon
                    : FlagIcon
              }
              size="sm"
              color="inherit"
            />
            {verdict.headline}
          </span>
          <span className="icp-verdict-detail">{verdict.detail}</span>
        </div>
        {GATE_ITEMS.map(item => (
          <GateRow
            key={item.id}
            item={item}
            satisfied={gateItemSatisfied(item, gateChecks, taskDone, tripped)}
            outstandingPreGate={outstandingPreGate}
            onToggle={toggleGate}
          />
        ))}
      </section>
      <section className="icp-rail" aria-label="Rollback checkpoints">
        <h2 className="icp-section-title">
          <Icon icon={ShieldAlertIcon} size="sm" color="inherit" />
          Rollback checkpoints
        </h2>
        {CHECKPOINTS.map(checkpoint => (
          <CheckpointCard
            key={checkpoint.id}
            checkpoint={checkpoint}
            isTripped={checkpoint.id === trippedId}
            isArmed={checkpoint.armedAt <= NOW_OFFSET}
            coveredCount={
              TASKS.filter(t => t.offset >= checkpoint.coverFrom).length
            }
            onTrip={tripCheckpoint}
            onStandDown={standDown}
          />
        ))}
        <div className="icp-ponr">
          <Icon icon={AlertTriangleIcon} size="sm" color="secondary" />
          <span>
            <strong>Point of no return — {formatT(POINT_OF_NO_RETURN_OFFSET)}</strong>
            {' · '}
            once the first live EDI 850 posts in NovaCore (F2), swing-back is
            no longer clean; recovery becomes forward-fix only.
          </span>
        </div>
      </section>
    </aside>
  );

  const content = (
    <LayoutContent padding={0}>
      <div className="icp-body">
        {runbook}
        {aside}
      </div>
    </LayoutContent>
  );

  return (
    <div className={SCOPE} style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <div className="icp-live" aria-live="polite">
        {announcement}
      </div>
      <Layout height="fill" header={header} content={content} />
    </div>
  );
}


`;export{e as default};