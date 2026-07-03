var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (one H1 2026 calibration session for a
 *   16-person product org: every reviewee carries a fixed name, role,
 *   department, review-completion status, a self rating with comment, a
 *   manager rating with comment, a seeded 9-box placement, and for a few
 *   people pre-existing calibration notes; per-cell target percentages are
 *   fixed and the seeded distribution is deliberately skewed toward the
 *   top-right boxes so rebalancing is meaningful — no clocks, randomness,
 *   or network assets; session note timestamps derive from a fixed 9:41 AM
 *   base plus a note counter)
 * @output Performance-review calibration surface: a left roster rail of
 *   reviewees with completion-status Badges and a status filter Selector, a
 *   center 9-box grid (performance x potential) of draggable employee tiles
 *   under a live rating-distribution histogram with over-target cells
 *   flagged red, a finalize banner tracking placements changed this session
 *   with reset-to-original and finalize/reopen actions, and a right packet
 *   panel showing the selected person's self and manager ratings (manager
 *   rating inline-editable) plus an appendable calibration-notes log
 * @position Page template; emitted by \`astryx template review-cycle-calibration\`
 *
 * Frame: a 100dvh root div gives Layout height="fill" a definite height in
 * auto-height hosts. LayoutHeader carries the cycle
 * title + scope caption, a reviews-complete ProgressBar, and (when the
 * roster undocks) a roster toggle IconButton. The \`start\` slot docks a
 * 260px roster LayoutPanel (filter header pinned, reviewee list scrolls);
 * the \`end\` slot docks a 320px packet LayoutPanel. LayoutContent scrolls
 * the finalize banner, the distribution histogram, and the 9-box grid as
 * one column.
 *
 * Container policy (calibration-board archetype): frame-first chrome —
 * the roster is plain divided rows (a ranked queue, not a second board),
 * the 9-box cells are muted-background wells, and each employee is a
 * compact tile (select button + MoreMenu) because tiles are the unit that
 * moves between cells. The packet uses stacked Sections-like blocks of
 * rows, not cards, so the rail reads as a dossier.
 *
 * Interaction contract:
 * - Employee→cell placement lives in one useState map; dragging a tile
 *   into another cell, the tile MoreMenu's "Move to <cell>" items, the
 *   histogram, the over-target flags, the changed-this-session counter,
 *   and the packet's "Moved this session" badge all re-render together.
 * - Pointer path: native HTML5 drag-and-drop — tiles are draggable, cells
 *   highlight while a drag hovers them. Fine-pointer only.
 * - Menu path (always available, keyboard + touch accessible): every tile
 *   carries a MoreMenu with "Move to <cell>" items for the other eight
 *   boxes plus "Open packet"; it upsizes from "sm" to "lg" when drag is
 *   unavailable so touch users keep ~40px targets.
 * - Selecting a person from the roster or a grid tile syncs both
 *   highlights and loads the packet panel.
 * - The roster filter Selector narrows rows by completion status with a
 *   live match count; the reviews-complete meter in the header always
 *   counts all 16 packets.
 * - The packet's manager rating swaps into a Selector with inline Save /
 *   Cancel (form-inline-edit pattern); saving updates the packet rating
 *   line and announces. Calibration notes append with a fixed facilitator
 *   author and a deterministic session timestamp.
 * - The finalize banner counts placements that differ from the seeded
 *   originals; Reset to original is a two-step inline confirm (arm →
 *   confirm/cancel), and Finalize locks all movement (drag off, menus
 *   collapse to "Open packet") until Reopen unlocks it.
 * - Every mutation is announced through a visually-hidden aria-live
 *   region ("Moved Priya Raman to Core performer — 3 placements changed",
 *   "Manager rating saved", …).
 *
 * Responsive contract:
 * - >1024px: roster (260px start) and packet (320px end) both dock; the
 *   grid renders three minmax(0, 1fr) columns that shrink with the content
 *   region so the docked panels never occlude the third column.
 * - <=1024px: the roster undocks behind a ~40px header toggle IconButton
 *   that swaps the content region between roster and grid; the packet
 *   stays docked at 320px.
 * - <=640px: single-pane — the packet also undocks; selecting a person
 *   navigates the content region to the packet with a Back control, and
 *   the 9-box grid stacks to one column (row-group potential labels keep
 *   the axis readable). The header caption hides and the reviews meter
 *   stretches full width.
 * - The histogram is a horizontal scroller (overflow-x auto) so nine
 *   fixed-width bars never squeeze; the grid column never overflows the
 *   page horizontally.
 * - Roster rows, tiles, and the roster/back controls keep ~40px tap
 *   targets; drag is enabled only for "(hover: hover) and (pointer:
 *   fine)" so tiles never fight touch scrolling. No interaction is
 *   hover-only.
 */

import {
  Fragment,
  useCallback,
  useMemo,
  useState,
  type CSSProperties,
} from 'react';

import {
  VStack,
  HStack,
  StackItem,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {IconButton} from '@astryxdesign/core/IconButton';
import {MoreMenu} from '@astryxdesign/core/MoreMenu';
import {ProgressBar} from '@astryxdesign/core/ProgressBar';
import {Selector} from '@astryxdesign/core/Selector';
import {TextArea} from '@astryxdesign/core/TextArea';
import {Token} from '@astryxdesign/core/Token';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  ArrowLeftIcon,
  LayoutGridIcon,
  LockIcon,
  LockOpenIcon,
  MessageSquareIcon,
  PlusIcon,
  RotateCcwIcon,
  SquarePenIcon,
  TriangleAlertIcon,
  UsersIcon,
} from 'lucide-react';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Definite height so Layout height="fill" resolves even when the host
  // container is auto-height; panels and the grid column scroll internally
  // instead of the end panel stretching past the content as a blank column.
  root: {
    height: '100dvh',
    width: '100%',
  },
  contentColumn: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-4)',
    padding: 'var(--spacing-4)',
    boxSizing: 'border-box',
  },
  banner: {
    padding: 'var(--spacing-3)',
    borderRadius: 'var(--radius-container)',
    border: '1px solid var(--color-divider)',
    backgroundColor: 'var(--color-background-muted)',
  },
  bannerFinalized: {
    borderColor: 'var(--color-success)',
  },
  // Histogram: nine fixed-width bar columns in a horizontal scroller so
  // narrow viewports scroll instead of squeezing the bars.
  histogramScroller: {
    overflowX: 'auto',
  },
  histogramRow: {
    display: 'flex',
    alignItems: 'flex-end',
    gap: 'var(--spacing-2)',
    paddingBottom: 'var(--spacing-1)',
  },
  histogramCol: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    width: 72,
    flexShrink: 0,
  },
  histogramBarWell: {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'flex-end',
    width: 36,
    height: 64,
    borderRadius: 4,
    backgroundColor: 'var(--color-background-muted)',
    overflow: 'hidden',
  },
  histogramBarFill: {
    width: '100%',
    borderRadius: '4px 4px 0 0',
    backgroundColor: 'var(--color-accent)',
    transition: 'height 120ms ease',
  },
  histogramBarFillOver: {
    backgroundColor: 'var(--color-error)',
  },
  histogramLabel: {
    textAlign: 'center',
    width: '100%',
    minWidth: 0,
  },
  // 9-box grid: three columns of cell wells on wide viewports, one
  // stacked column at phone width (row-group labels keep the axis).
  // minmax(0, 1fr) lets the columns shrink with the content region so the
  // grid never slides under the docked packet panel; tiles truncate.
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, minmax(0, 1fr))',
    gap: 'var(--spacing-3)',
  },
  gridSingleColumn: {
    gridTemplateColumns: '1fr',
  },
  rowLabel: {
    gridColumn: '1 / -1',
  },
  cell: {
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
    border: '1px solid transparent',
    minHeight: 132,
    boxSizing: 'border-box',
  },
  cellOverTarget: {
    borderColor: 'var(--color-error)',
  },
  cellDropTarget: {
    outline: '2px solid var(--color-accent)',
    outlineOffset: '-2px',
    backgroundColor: 'var(--color-accent-muted)',
  },
  tile: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-1)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-body)',
    border: '1px solid var(--color-divider)',
    padding: '0 var(--spacing-1) 0 0',
  },
  tileSelected: {
    borderColor: 'var(--color-accent)',
    outline: '1px solid var(--color-accent)',
  },
  tileDragging: {
    opacity: 0.5,
  },
  // The select half of a tile: a real button, >=40px tall for touch.
  tileButton: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    flex: 1,
    minWidth: 0,
    minHeight: 40,
    padding: 'var(--spacing-1) var(--spacing-1) var(--spacing-1) var(--spacing-2)',
    border: 'none',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
    color: 'inherit',
  },
  tileName: {
    minWidth: 0,
  },
  // Roster rows: full-width select buttons with a pinned filter header.
  rosterPane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  rosterHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3) var(--spacing-3) var(--spacing-2)',
    borderBottom: '1px solid var(--color-divider)',
  },
  rosterList: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
  },
  rosterRow: {
    display: 'block',
    width: '100%',
    minHeight: 40,
    padding: 'var(--spacing-2) var(--spacing-3)',
    border: 'none',
    borderBottom: '1px solid var(--color-divider)',
    backgroundColor: 'transparent',
    cursor: 'pointer',
    textAlign: 'left',
    font: 'inherit',
    color: 'inherit',
  },
  rosterRowSelected: {
    backgroundColor: 'var(--color-accent-muted)',
  },
  rosterEmpty: {
    padding: 'var(--spacing-6) var(--spacing-3)',
  },
  // Packet panel: pinned identity header, scrolling dossier body.
  packetPane: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    minHeight: 0,
  },
  packetHeader: {
    flexShrink: 0,
    padding: 'var(--spacing-3)',
    borderBottom: '1px solid var(--color-divider)',
  },
  packetBody: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: 'var(--spacing-3)',
  },
  noteBlock: {
    padding: 'var(--spacing-2)',
    borderRadius: 'var(--radius-container)',
    backgroundColor: 'var(--color-background-muted)',
  },
  // Header meter: fixed width in the wide header row; stretches to the
  // full wrapped row on phones.
  meterBlock: {
    width: 200,
  },
  meterBlockFill: {
    width: '100%',
  },
  iconTapTarget: {
    width: 40,
    height: 40,
  },
  visuallyHidden: {
    position: 'absolute',
    width: '1px',
    height: '1px',
    margin: '-1px',
    padding: 0,
    overflow: 'hidden',
    clipPath: 'inset(50%)',
    whiteSpace: 'nowrap',
  },
};

// ============= DATA =============

type CellId =
  | 'diamond'
  | 'future'
  | 'star'
  | 'inconsistent'
  | 'core'
  | 'high'
  | 'under'
  | 'solid'
  | 'expert';

type ReviewStatus = 'complete' | 'in-review' | 'not-started';
type TokenColor = 'blue' | 'purple' | 'green' | 'orange' | 'teal' | 'pink';

interface CellDef {
  id: CellId;
  label: string;
  /** Axis coordinates, e.g. "Exceeds · High potential". */
  axis: string;
  /** Target share of headcount for this box, as a whole percentage. */
  targetPct: number;
}

interface Employee {
  id: string;
  name: string;
  role: string;
  dept: {label: string; color: TokenColor};
  status: ReviewStatus;
  selfRating: number;
  selfComment: string;
  managerRating: number;
  managerComment: string;
  managerName: string;
  /** Seeded 9-box placement; live placement lives in useState. */
  cell: CellId;
}

interface CalibrationNote {
  author: string;
  timestamp: string;
  text: string;
}

const CYCLE = {
  title: 'H1 2026 calibration',
  scope: 'Product org · 16 reviewees · Facilitated by Jordan Blake',
  totalPeople: 16,
};

// Grid render order: potential high → low (rows), performance low → high
// (columns). Targets sum to 100%.
const CELL_ROWS: ReadonlyArray<{potential: string; cells: CellId[]}> = [
  {potential: 'High potential', cells: ['diamond', 'future', 'star']},
  {potential: 'Medium potential', cells: ['inconsistent', 'core', 'high']},
  {potential: 'Low potential', cells: ['under', 'solid', 'expert']},
];

const CELLS: Record<CellId, CellDef> = {
  diamond: {
    id: 'diamond',
    label: 'Rough diamond',
    axis: 'Below · High potential',
    targetPct: 5,
  },
  future: {
    id: 'future',
    label: 'Future star',
    axis: 'Meets · High potential',
    targetPct: 15,
  },
  star: {
    id: 'star',
    label: 'Star',
    axis: 'Exceeds · High potential',
    targetPct: 10,
  },
  inconsistent: {
    id: 'inconsistent',
    label: 'Inconsistent',
    axis: 'Below · Medium potential',
    targetPct: 5,
  },
  core: {
    id: 'core',
    label: 'Core performer',
    axis: 'Meets · Medium potential',
    targetPct: 30,
  },
  high: {
    id: 'high',
    label: 'High performer',
    axis: 'Exceeds · Medium potential',
    targetPct: 15,
  },
  under: {
    id: 'under',
    label: 'Underperformer',
    axis: 'Below · Low potential',
    targetPct: 5,
  },
  solid: {
    id: 'solid',
    label: 'Solid contributor',
    axis: 'Meets · Low potential',
    targetPct: 5,
  },
  expert: {
    id: 'expert',
    label: 'Trusted expert',
    axis: 'Exceeds · Low potential',
    targetPct: 10,
  },
};

const CELL_ORDER: CellId[] = CELL_ROWS.flatMap(row => row.cells);

const RATING_LABELS: Record<number, string> = {
  1: 'Below expectations',
  2: 'Developing',
  3: 'Meets expectations',
  4: 'Exceeds expectations',
  5: 'Outstanding',
};

const RATING_OPTIONS = [5, 4, 3, 2, 1].map(value => ({
  value: String(value),
  label: \`\${value} — \${RATING_LABELS[value]}\`,
}));

const STATUS_META: Record<
  ReviewStatus,
  {label: string; variant: 'success' | 'info' | 'warning'}
> = {
  complete: {label: 'Complete', variant: 'success'},
  'in-review': {label: 'In review', variant: 'info'},
  'not-started': {label: 'Not started', variant: 'warning'},
};

const STATUS_FILTER_OPTIONS = [
  {value: 'all', label: 'All statuses'},
  {value: 'complete', label: 'Complete'},
  {value: 'in-review', label: 'In review'},
  {value: 'not-started', label: 'Not started'},
];

const ENG = {label: 'Engineering', color: 'blue' as TokenColor};
const DES = {label: 'Design', color: 'purple' as TokenColor};
const PRO = {label: 'Product', color: 'green' as TokenColor};
const DAT = {label: 'Data', color: 'orange' as TokenColor};

// Deliberately skewed seed: Star holds 25% against a 10% target and High
// performer 25% against 15%, while Core performer sits at 12.5% against
// 30% — so the histogram opens with red flags and rebalancing toward the
// center is the obvious first move.
const EMPLOYEES: Employee[] = [
  // Star (4 of 16 — over the 10% target)
  {
    id: 'emp-01',
    name: 'Priya Raman',
    role: 'Staff Engineer',
    dept: ENG,
    status: 'complete',
    selfRating: 4,
    selfComment:
      'Led the payments re-platform to launch a quarter early and mentored two mid-level engineers through promotion packets.',
    managerRating: 5,
    managerComment:
      'Strongest technical leader on the team; the re-platform landed with zero sev-1s. Ready for broader scope.',
    managerName: 'Dana Whitfield',
    cell: 'star',
  },
  {
    id: 'emp-02',
    name: 'Marcus Webb',
    role: 'Senior Product Designer',
    dept: DES,
    status: 'complete',
    selfRating: 5,
    selfComment:
      'Shipped the design-system refresh and drove checkout conversion up 6% through the redesigned flows.',
    managerRating: 5,
    managerComment:
      'Exceptional half. The refresh unblocked three teams; partners ask for him by name.',
    managerName: 'Ines Ferreira',
    cell: 'star',
  },
  {
    id: 'emp-03',
    name: 'Elena Sosa',
    role: 'Senior PM',
    dept: PRO,
    status: 'complete',
    selfRating: 4,
    selfComment:
      'Owned the merchant-onboarding roadmap; activation improved 11% and support tickets fell by a third.',
    managerRating: 4,
    managerComment:
      'Great outcomes, though two launches slipped a sprint. Placement here assumes H2 keeps the same trajectory.',
    managerName: 'Dana Whitfield',
    cell: 'star',
  },
  {
    id: 'emp-04',
    name: 'Tom Nguyen',
    role: 'Senior Engineer',
    dept: ENG,
    status: 'in-review',
    selfRating: 4,
    selfComment:
      'Rebuilt the risk-scoring pipeline and cut fraud false positives by 18% while carrying on-call for two rotations.',
    managerRating: 4,
    managerComment:
      'Very strong execution half. Leadership signal is newer — first time leading a workstream.',
    managerName: 'Ravi Patel',
    cell: 'star',
  },
  // High performer (4 of 16 — over the 15% target)
  {
    id: 'emp-05',
    name: 'Aisha Bell',
    role: 'Engineer II',
    dept: ENG,
    status: 'complete',
    selfRating: 4,
    selfComment:
      'Delivered the webhook retry service and picked up frontend work outside my ladder to unblock the console team.',
    managerRating: 4,
    managerComment:
      'Consistently exceeds on delivery; growing influence beyond her immediate team.',
    managerName: 'Ravi Patel',
    cell: 'high',
  },
  {
    id: 'emp-06',
    name: 'Jonah Kim',
    role: 'Data Scientist',
    dept: DAT,
    status: 'complete',
    selfRating: 5,
    selfComment:
      'Built the LTV model now used in all paid-marketing budget decisions; presented methodology to the exec staff.',
    managerRating: 4,
    managerComment:
      'The LTV model is a real asset. Wants senior scope next half; needs one more cross-team win.',
    managerName: 'Marta Kovacs',
    cell: 'high',
  },
  {
    id: 'emp-07',
    name: 'Sofia Marino',
    role: 'Product Designer',
    dept: DES,
    status: 'complete',
    selfRating: 4,
    selfComment:
      'Redesigned the dispute flow end to end and ran six moderated research sessions to validate it.',
    managerRating: 4,
    managerComment:
      'Excellent craft and research rigor. Placement reflects a strong but narrow surface this half.',
    managerName: 'Ines Ferreira',
    cell: 'high',
  },
  {
    id: 'emp-08',
    name: 'Derek Chan',
    role: 'Engineer II',
    dept: ENG,
    status: 'in-review',
    selfRating: 4,
    selfComment:
      'Owned the migration off the legacy queue with zero downtime and wrote the runbook the whole org now uses.',
    managerRating: 4,
    managerComment:
      'Dependable and fast. Manager flagged the placement as provisional pending peer feedback.',
    managerName: 'Ravi Patel',
    cell: 'high',
  },
  // Future star (3 of 16 — over the 15% target by a hair)
  {
    id: 'emp-09',
    name: 'Lena Fischer',
    role: 'PM',
    dept: PRO,
    status: 'complete',
    selfRating: 3,
    selfComment:
      'Shipped the pricing experiment framework; two of four experiments hit stat-sig wins.',
    managerRating: 3,
    managerComment:
      'Solid half with clear senior-PM trajectory. Strategy docs are already at the next level.',
    managerName: 'Dana Whitfield',
    cell: 'future',
  },
  {
    id: 'emp-10',
    name: 'Omar Haddad',
    role: 'Engineer II',
    dept: ENG,
    status: 'complete',
    selfRating: 4,
    selfComment:
      'Took over the notifications service mid-quarter and stabilized delivery latency under the SLO.',
    managerRating: 3,
    managerComment:
      'Met a hard brief well. High-potential call is based on how quickly he ramped on an unfamiliar system.',
    managerName: 'Ravi Patel',
    cell: 'future',
  },
  {
    id: 'emp-11',
    name: 'Grace Liu',
    role: 'Analytics Engineer',
    dept: DAT,
    status: 'complete',
    selfRating: 3,
    selfComment:
      'Rebuilt the revenue mart with tested dbt models; finance closed the quarter two days faster.',
    managerRating: 3,
    managerComment:
      'Quietly excellent. Wants to move toward data platform work next half.',
    managerName: 'Marta Kovacs',
    cell: 'future',
  },
  // Core performer (2 of 16 — well under the 30% target)
  {
    id: 'emp-12',
    name: 'Ben Carter',
    role: 'Engineer II',
    dept: ENG,
    status: 'complete',
    selfRating: 3,
    selfComment:
      'Delivered planned roadmap items on schedule and closed out the accessibility audit findings.',
    managerRating: 3,
    managerComment:
      'Reliable, steady half. Exactly what the team needed on maintenance-heavy work.',
    managerName: 'Ravi Patel',
    cell: 'core',
  },
  {
    id: 'emp-13',
    name: 'Ruth Adeyemi',
    role: 'Product Designer',
    dept: DES,
    status: 'in-review',
    selfRating: 3,
    selfComment:
      'Supported three squads with production design and kept the component library current.',
    managerRating: 3,
    managerComment:
      'Meets across the board; stretched thin across squads, which capped bigger bets.',
    managerName: 'Ines Ferreira',
    cell: 'core',
  },
  // Trusted expert (1 of 16)
  {
    id: 'emp-14',
    name: 'Victor Salas',
    role: 'Staff Data Engineer',
    dept: DAT,
    status: 'complete',
    selfRating: 4,
    selfComment:
      'Kept the ingestion platform at 99.98% availability and mentored the on-call rotation.',
    managerRating: 4,
    managerComment:
      'Deep domain owner; prefers depth over management track, and that is exactly where he delivers.',
    managerName: 'Marta Kovacs',
    cell: 'expert',
  },
  // Solid contributor (1 of 16)
  {
    id: 'emp-15',
    name: 'Nina Kowalski',
    role: 'QA Engineer',
    dept: ENG,
    status: 'not-started',
    selfRating: 3,
    selfComment:
      'Maintained the regression suite and cut flaky-test noise roughly in half.',
    managerRating: 3,
    managerComment:
      'Steady and thorough. Review packet still in draft — placement is provisional.',
    managerName: 'Ravi Patel',
    cell: 'solid',
  },
  // Rough diamond (1 of 16)
  {
    id: 'emp-16',
    name: 'Caleb Wright',
    role: 'APM',
    dept: PRO,
    status: 'not-started',
    selfRating: 3,
    selfComment:
      'First full cycle: shipped the referral MVP but missed the instrumentation deadline.',
    managerRating: 2,
    managerComment:
      'Rocky delivery half, but the product instincts are unmistakable. Needs structure, not a lower box.',
    managerName: 'Dana Whitfield',
    cell: 'diamond',
  },
];

const EMPLOYEE_BY_ID = new Map(
  EMPLOYEES.map(person => [person.id, person] as const),
);

const ORIGINAL_PLACEMENTS: Record<string, CellId> = Object.fromEntries(
  EMPLOYEES.map(person => [person.id, person.cell] as const),
);

// Pre-session notes so the log opens with history on contested packets.
const SEEDED_NOTES: Record<string, CalibrationNote[]> = {
  'emp-03': [
    {
      author: 'Dana Whitfield (manager)',
      timestamp: 'Jun 30 · 4:12 PM',
      text: 'Holding Star placement, but flagging the two slipped launches for the committee to weigh.',
    },
  ],
  'emp-08': [
    {
      author: 'Ravi Patel (manager)',
      timestamp: 'Jun 29 · 11:05 AM',
      text: 'Peer feedback still landing — treat High performer as provisional until packets close.',
    },
  ],
  'emp-16': [
    {
      author: 'Dana Whitfield (manager)',
      timestamp: 'Jun 30 · 9:47 AM',
      text: 'Recommending Rough diamond over Inconsistent: the misses were process, not judgment.',
    },
    {
      author: 'Jordan Blake (facilitator)',
      timestamp: 'Jul 1 · 2:30 PM',
      text: 'Agreed to revisit after we rebalance the top row.',
    },
  ],
};

// Session-note timestamps derive from a fixed base plus the number of
// notes added so far — deterministic, no Date.now().
const SESSION_BASE_MINUTES = 9 * 60 + 41; // 9:41 AM

function sessionTimestamp(noteIndex: number): string {
  const total = SESSION_BASE_MINUTES + noteIndex;
  const hours24 = Math.floor(total / 60);
  const minutes = total % 60;
  const suffix = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = ((hours24 + 11) % 12) + 1;
  return \`Jul 2 · \${hours12}:\${String(minutes).padStart(2, '0')} \${suffix}\`;
}

function formatPct(count: number): string {
  return \`\${Math.round((count / CYCLE.totalPeople) * 1000) / 10}%\`;
}

function isOverTarget(count: number, cellId: CellId): boolean {
  return (count / CYCLE.totalPeople) * 100 > CELLS[cellId].targetPct;
}

// ============= PIECES =============

/**
 * Live rating-distribution histogram above the grid: one bar per box in
 * grid order, red (plus an explicit over-target caption) whenever a box
 * exceeds its target share — never color-only.
 */
function DistributionHistogram({counts}: {counts: Record<CellId, number>}) {
  const maxCount = Math.max(1, ...CELL_ORDER.map(id => counts[id]));
  return (
    <VStack gap={2}>
      <HStack gap={2} vAlign="center">
        <StackItem size="fill">
          <Heading level={2}>Rating distribution</Heading>
        </StackItem>
        <Text type="supporting" color="secondary">
          Actual vs target share
        </Text>
      </HStack>
      <div style={styles.histogramScroller}>
        <div style={styles.histogramRow} role="img" aria-label="Rating distribution histogram, one bar per 9-box cell">
          {CELL_ORDER.map(cellId => {
            const cell = CELLS[cellId];
            const count = counts[cellId];
            const over = isOverTarget(count, cellId);
            return (
              <div key={cellId} style={styles.histogramCol}>
                <Text
                  type="supporting"
                  color="secondary"
                  hasTabularNumbers>
                  {count}
                </Text>
                <div style={styles.histogramBarWell}>
                  <div
                    style={{
                      ...styles.histogramBarFill,
                      ...(over ? styles.histogramBarFillOver : undefined),
                      height: \`\${Math.round((count / maxCount) * 100)}%\`,
                    }}
                  />
                </div>
                <div style={styles.histogramLabel}>
                  <Text type="supporting" color="secondary" maxLines={1}>
                    {cell.label}
                  </Text>
                  <Text
                    type="supporting"
                    color="secondary"
                    hasTabularNumbers>
                    {formatPct(count)} / {cell.targetPct}%
                  </Text>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </VStack>
  );
}

/**
 * One employee tile inside a grid cell: a select button (name + avatar)
 * plus a MoreMenu with move targets. Drag wrapper is fine-pointer only;
 * the menu is the touch/keyboard path and upsizes when drag is off.
 */
function EmployeeTile({
  person,
  cellId,
  isSelected,
  isDraggable,
  isDragging,
  isLocked,
  onSelect,
  onMove,
  onDraggingChange,
}: {
  person: Employee;
  cellId: CellId;
  isSelected: boolean;
  isDraggable: boolean;
  isDragging: boolean;
  isLocked: boolean;
  onSelect: (id: string) => void;
  onMove: (id: string, cellId: CellId) => void;
  onDraggingChange: (id: string | null) => void;
}) {
  const moveItems = isLocked
    ? []
    : CELL_ORDER.filter(id => id !== cellId).map(id => ({
        label: \`Move to \${CELLS[id].label}\`,
        onClick: () => onMove(person.id, id),
      }));
  return (
    <div
      draggable={(isDraggable && !isLocked) || undefined}
      onDragStart={event => {
        event.dataTransfer.setData('text/plain', person.id);
        event.dataTransfer.effectAllowed = 'move';
        onDraggingChange(person.id);
      }}
      onDragEnd={() => onDraggingChange(null)}
      style={{
        ...styles.tile,
        ...(isSelected ? styles.tileSelected : undefined),
        ...(isDragging ? styles.tileDragging : undefined),
      }}>
      <button
        type="button"
        style={styles.tileButton}
        aria-pressed={isSelected}
        aria-label={\`\${person.name}, \${person.role} — open review packet\`}
        onClick={() => onSelect(person.id)}>
        <Avatar name={person.name} size="xsmall" />
        <div style={styles.tileName}>
          <Text type="body" maxLines={1}>
            {person.name}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {person.role}
          </Text>
        </div>
      </button>
      <MoreMenu
        label={\`Actions for \${person.name}\`}
        size={isDraggable ? 'sm' : 'lg'}
        items={[
          ...moveItems,
          {label: 'Open packet', onClick: () => onSelect(person.id)},
        ]}
      />
    </div>
  );
}

/** One 9-box cell well: header (label, count vs target, over flag) + tiles. */
function GridCell({
  cellId,
  people,
  selectedId,
  isDraggable,
  isLocked,
  draggingId,
  onSelect,
  onMove,
  onDraggingChange,
}: {
  cellId: CellId;
  people: Employee[];
  selectedId: string | null;
  isDraggable: boolean;
  isLocked: boolean;
  draggingId: string | null;
  onSelect: (id: string) => void;
  onMove: (id: string, cellId: CellId) => void;
  onDraggingChange: (id: string | null) => void;
}) {
  const [isDropTarget, setIsDropTarget] = useState(false);
  const cell = CELLS[cellId];
  const over = isOverTarget(people.length, cellId);
  return (
    <div
      onDragOver={event => {
        if (isLocked) {
          return;
        }
        event.preventDefault();
        event.dataTransfer.dropEffect = 'move';
        setIsDropTarget(true);
      }}
      onDragLeave={event => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) {
          setIsDropTarget(false);
        }
      }}
      onDrop={event => {
        event.preventDefault();
        setIsDropTarget(false);
        const personId = event.dataTransfer.getData('text/plain');
        if (personId && !isLocked) {
          onMove(personId, cellId);
        }
      }}
      style={{
        ...styles.cell,
        ...(over ? styles.cellOverTarget : undefined),
        ...(isDropTarget ? styles.cellDropTarget : undefined),
      }}>
      <VStack gap={1}>
        {/* wrap="wrap" drops the over-target badge under the label when a
            cell is narrow instead of overlapping it. */}
        <HStack gap={1} vAlign="center" wrap="wrap">
          <StackItem size="fill">
            <Text type="label">{cell.label}</Text>
          </StackItem>
          {over ? (
            <Badge
              variant="error"
              label="Over target"
              icon={<Icon icon={TriangleAlertIcon} size="sm" color="inherit" />}
            />
          ) : null}
        </HStack>
        <Text
          type="supporting"
          color="secondary"
          hasTabularNumbers>
          {cell.axis} · {people.length} of 16 ({formatPct(people.length)} vs{' '}
          {cell.targetPct}% target)
        </Text>
      </VStack>
      {people.length === 0 ? (
        <Text type="supporting" color="secondary">
          No one placed here.
        </Text>
      ) : (
        <VStack gap={1}>
          {people.map(person => (
            <EmployeeTile
              key={person.id}
              person={person}
              cellId={cellId}
              isSelected={selectedId === person.id}
              isDraggable={isDraggable}
              isDragging={draggingId === person.id}
              isLocked={isLocked}
              onSelect={onSelect}
              onMove={onMove}
              onDraggingChange={onDraggingChange}
            />
          ))}
        </VStack>
      )}
    </div>
  );
}

/** One roster row: select button with status Badge and current-box token. */
function RosterRow({
  person,
  cellId,
  isSelected,
  isMoved,
  onSelect,
}: {
  person: Employee;
  cellId: CellId;
  isSelected: boolean;
  isMoved: boolean;
  onSelect: (id: string) => void;
}) {
  const status = STATUS_META[person.status];
  return (
    <button
      type="button"
      style={{
        ...styles.rosterRow,
        ...(isSelected ? styles.rosterRowSelected : undefined),
      }}
      aria-pressed={isSelected}
      aria-label={\`\${person.name}, \${person.role} — review \${status.label}, placed in \${CELLS[cellId].label}\`}
      onClick={() => onSelect(person.id)}>
      <HStack gap={2} vAlign="start">
        <Avatar name={person.name} size="xsmall" />
        <StackItem size="fill">
          <VStack gap={1}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="body" maxLines={1}>
                  {person.name}
                </Text>
              </StackItem>
              <Badge variant={status.variant} label={status.label} />
            </HStack>
            <Text type="supporting" color="secondary" maxLines={1}>
              {person.role}
            </Text>
            <HStack gap={1} vAlign="center" wrap="wrap">
              <Token label={person.dept.label} color={person.dept.color} size="sm" />
              <Token label={CELLS[cellId].label} color="gray" size="sm" />
              {isMoved ? <Badge variant="info" label="Moved" /> : null}
            </HStack>
          </VStack>
        </StackItem>
      </HStack>
    </button>
  );
}

function RosterPane({
  statusFilter,
  placements,
  selectedId,
  onStatusFilterChange,
  onSelect,
}: {
  statusFilter: string;
  placements: Record<string, CellId>;
  selectedId: string | null;
  onStatusFilterChange: (next: string) => void;
  onSelect: (id: string) => void;
}) {
  const visible = EMPLOYEES.filter(
    person => statusFilter === 'all' || person.status === statusFilter,
  );
  return (
    <div style={styles.rosterPane}>
      <div style={styles.rosterHeader}>
        <VStack gap={2}>
          <HStack gap={2} vAlign="center">
            <StackItem size="fill">
              <Heading level={2}>Roster</Heading>
            </StackItem>
            <Text type="supporting" color="secondary" hasTabularNumbers>
              {visible.length} of {EMPLOYEES.length}
            </Text>
          </HStack>
          <Selector
            label="Filter roster by review status"
            isLabelHidden
            size="sm"
            options={STATUS_FILTER_OPTIONS}
            value={statusFilter}
            onChange={onStatusFilterChange}
            width="100%"
          />
        </VStack>
      </div>
      <div style={styles.rosterList}>
        {visible.length === 0 ? (
          <div style={styles.rosterEmpty}>
            <EmptyState
              isCompact
              icon={<Icon icon={UsersIcon} size="lg" />}
              title="No reviewees"
              description="No packets match the current status filter."
            />
          </div>
        ) : (
          visible.map(person => (
            <RosterRow
              key={person.id}
              person={person}
              cellId={placements[person.id]}
              isSelected={selectedId === person.id}
              isMoved={placements[person.id] !== ORIGINAL_PLACEMENTS[person.id]}
              onSelect={onSelect}
            />
          ))
        )}
      </div>
    </div>
  );
}

/** Rating line: score badge + label, used for self and manager reviews. */
function RatingLine({rating}: {rating: number}) {
  return (
    <HStack gap={2} vAlign="center">
      <Badge
        variant={rating >= 4 ? 'success' : rating === 3 ? 'info' : 'warning'}
        label={\`\${rating} / 5\`}
      />
      <Text type="body">{RATING_LABELS[rating]}</Text>
    </HStack>
  );
}

/**
 * The review packet for the selected person: placement summary, self and
 * manager reviews (manager rating inline-editable), and the calibration
 * notes log with an append composer.
 */
function PacketPane({
  person,
  cellId,
  managerRating,
  notes,
  ratingDraft,
  noteDraft,
  onBack,
  onStartRatingEdit,
  onRatingDraftChange,
  onRatingSave,
  onRatingCancel,
  onNoteDraftChange,
  onNoteAdd,
}: {
  person: Employee;
  cellId: CellId;
  managerRating: number;
  notes: CalibrationNote[];
  ratingDraft: string | null;
  noteDraft: string;
  onBack?: () => void;
  onStartRatingEdit: () => void;
  onRatingDraftChange: (next: string) => void;
  onRatingSave: () => void;
  onRatingCancel: () => void;
  onNoteDraftChange: (next: string) => void;
  onNoteAdd: () => void;
}) {
  const isMoved = cellId !== ORIGINAL_PLACEMENTS[person.id];
  const status = STATUS_META[person.status];
  return (
    <div style={styles.packetPane}>
      <div style={styles.packetHeader}>
        <VStack gap={2}>
          {onBack != null ? (
            <div>
              <Button
                label="Back to grid"
                variant="ghost"
                size="sm"
                icon={<Icon icon={ArrowLeftIcon} size="sm" />}
                onClick={onBack}
              />
            </div>
          ) : null}
          <HStack gap={2} vAlign="center">
            <Avatar name={person.name} size="small" />
            <StackItem size="fill">
              <VStack gap={1}>
                <Heading level={2}>{person.name}</Heading>
                <Text type="supporting" color="secondary" maxLines={1}>
                  {person.role} · {person.dept.label}
                </Text>
              </VStack>
            </StackItem>
          </HStack>
          <HStack gap={1} wrap="wrap">
            <Badge variant={status.variant} label={\`Review \${status.label.toLowerCase()}\`} />
            <Token label={CELLS[cellId].label} color="gray" size="sm" />
            {isMoved ? <Badge variant="info" label="Moved this session" /> : null}
          </HStack>
        </VStack>
      </div>
      <div style={styles.packetBody}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Text type="label">Placement</Text>
            <Text type="body">
              {CELLS[cellId].label} ({CELLS[cellId].axis})
            </Text>
            {isMoved ? (
              <Text type="supporting" color="secondary">
                Originally {CELLS[ORIGINAL_PLACEMENTS[person.id]].label}.
              </Text>
            ) : (
              <Text type="supporting" color="secondary">
                Unchanged from the manager submission.
              </Text>
            )}
          </VStack>

          <Divider variant="subtle" />

          <VStack gap={2}>
            <Text type="label">Self review</Text>
            <RatingLine rating={person.selfRating} />
            <Text type="supporting" color="secondary">
              {person.selfComment}
            </Text>
          </VStack>

          <Divider variant="subtle" />

          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label">Manager review · {person.managerName}</Text>
              </StackItem>
              {ratingDraft === null ? (
                <Button
                  label="Edit"
                  variant="ghost"
                  size="sm"
                  icon={<Icon icon={SquarePenIcon} size="sm" />}
                  onClick={onStartRatingEdit}
                />
              ) : null}
            </HStack>
            {ratingDraft === null ? (
              <RatingLine rating={managerRating} />
            ) : (
              <VStack gap={2}>
                <Selector
                  label="Manager rating"
                  isLabelHidden
                  options={RATING_OPTIONS}
                  value={ratingDraft}
                  onChange={onRatingDraftChange}
                  width="100%"
                />
                <HStack gap={2}>
                  <Button
                    label="Save"
                    variant="primary"
                    size="sm"
                    onClick={onRatingSave}
                  />
                  <Button
                    label="Cancel"
                    variant="secondary"
                    size="sm"
                    onClick={onRatingCancel}
                  />
                </HStack>
              </VStack>
            )}
            <Text type="supporting" color="secondary">
              {person.managerComment}
            </Text>
          </VStack>

          <Divider variant="subtle" />

          <VStack gap={2}>
            <HStack gap={2} vAlign="center">
              <StackItem size="fill">
                <Text type="label">Calibration notes</Text>
              </StackItem>
              <Text type="supporting" color="secondary" hasTabularNumbers>
                {notes.length}
              </Text>
            </HStack>
            {notes.length === 0 ? (
              <Text type="supporting" color="secondary">
                No notes yet — decisions made here should be captured below.
              </Text>
            ) : (
              <VStack gap={2}>
                {notes.map((note, index) => (
                  <div key={index} style={styles.noteBlock}>
                    <VStack gap={1}>
                      <HStack gap={2} vAlign="center">
                        <StackItem size="fill">
                          <Text type="supporting" maxLines={1}>
                            {note.author}
                          </Text>
                        </StackItem>
                        <Text type="supporting" color="secondary">
                          {note.timestamp}
                        </Text>
                      </HStack>
                      <Text type="body">{note.text}</Text>
                    </VStack>
                  </div>
                ))}
              </VStack>
            )}
            <TextArea
              label={\`Add a calibration note for \${person.name}\`}
              isLabelHidden
              rows={2}
              placeholder="Record the committee's reasoning…"
              value={noteDraft}
              onChange={onNoteDraftChange}
              width="100%"
            />
            <div>
              <Button
                label="Add note"
                variant="secondary"
                size="sm"
                icon={<Icon icon={PlusIcon} size="sm" />}
                isDisabled={noteDraft.trim() === ''}
                onClick={onNoteAdd}
              />
            </div>
          </VStack>
        </VStack>
      </div>
    </div>
  );
}

/**
 * Finalize banner: changed-placement counter, two-step reset-to-original,
 * and the finalize/reopen lock toggle.
 */
function FinalizeBanner({
  changedCount,
  isFinalized,
  isResetArmed,
  onArmReset,
  onConfirmReset,
  onCancelReset,
  onFinalize,
  onReopen,
}: {
  changedCount: number;
  isFinalized: boolean;
  isResetArmed: boolean;
  onArmReset: () => void;
  onConfirmReset: () => void;
  onCancelReset: () => void;
  onFinalize: () => void;
  onReopen: () => void;
}) {
  return (
    <div
      style={{
        ...styles.banner,
        ...(isFinalized ? styles.bannerFinalized : undefined),
      }}>
      <HStack gap={3} vAlign="center" wrap="wrap">
        <StackItem size="fill">
          <HStack gap={2} vAlign="center" wrap="wrap">
            {isFinalized ? (
              <Badge
                variant="success"
                label="Finalized"
                icon={<Icon icon={LockIcon} size="sm" color="inherit" />}
              />
            ) : (
              <Badge
                variant={changedCount > 0 ? 'info' : 'neutral'}
                label={\`\${changedCount} of \${CYCLE.totalPeople} placements changed\`}
              />
            )}
            <Text type="supporting" color="secondary">
              {isFinalized
                ? 'Placements are locked. Reopen the session to keep calibrating.'
                : changedCount > 0
                  ? 'Changes apply to this calibration session only until finalized.'
                  : 'Move tiles between boxes to rebalance the distribution.'}
            </Text>
          </HStack>
        </StackItem>
        {isFinalized ? (
          <Button
            label="Reopen session"
            variant="secondary"
            size="sm"
            icon={<Icon icon={LockOpenIcon} size="sm" />}
            onClick={onReopen}
          />
        ) : isResetArmed ? (
          <HStack gap={2}>
            <Button
              label={\`Confirm reset (\${changedCount})\`}
              variant="destructive"
              size="sm"
              onClick={onConfirmReset}
            />
            <Button
              label="Cancel"
              variant="secondary"
              size="sm"
              onClick={onCancelReset}
            />
          </HStack>
        ) : (
          <HStack gap={2}>
            <Button
              label="Reset to original"
              variant="secondary"
              size="sm"
              icon={<Icon icon={RotateCcwIcon} size="sm" />}
              isDisabled={changedCount === 0}
              onClick={onArmReset}
            />
            <Button
              label="Finalize"
              variant="primary"
              size="sm"
              icon={<Icon icon={LockIcon} size="sm" />}
              onClick={onFinalize}
            />
          </HStack>
        )}
      </HStack>
    </div>
  );
}

// ============= PAGE =============

export default function ReviewCycleCalibrationTemplate() {
  // Employee→cell placement is the single source of movement truth: the
  // grid, histogram, over-target flags, roster tokens, packet badge, and
  // changed counter all derive from it.
  const [placements, setPlacements] = useState<Record<string, CellId>>(
    () => ({...ORIGINAL_PLACEMENTS}),
  );
  const [selectedId, setSelectedId] = useState<string | null>('emp-01');
  const [statusFilter, setStatusFilter] = useState('all');
  const [managerRatings, setManagerRatings] = useState<Record<string, number>>(
    () =>
      Object.fromEntries(
        EMPLOYEES.map(person => [person.id, person.managerRating] as const),
      ),
  );
  // Manager-rating inline edit: null = display mode, string = draft value.
  const [ratingDraft, setRatingDraft] = useState<string | null>(null);
  const [notes, setNotes] = useState<Record<string, CalibrationNote[]>>(
    () => ({...SEEDED_NOTES}),
  );
  const [noteDraft, setNoteDraft] = useState('');
  // Counts session notes for deterministic 9:41-AM-plus-n timestamps.
  const [sessionNoteCount, setSessionNoteCount] = useState(0);
  const [isFinalized, setIsFinalized] = useState(false);
  const [isResetArmed, setIsResetArmed] = useState(false);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [announcement, setAnnouncement] = useState('');
  // <=1024px the roster undocks; this flag swaps it into the content pane.
  const [isRosterOpenOnMobile, setIsRosterOpenOnMobile] = useState(false);
  // <=640px the packet undocks; selection navigates to it.
  const [isPacketOpenOnMobile, setIsPacketOpenOnMobile] = useState(false);

  // <=640px: single-pane (packet undocked, grid stacks to one column).
  const isSinglePane = useMediaQuery('(max-width: 640px)');
  // <=1024px: roster undocks behind a header toggle.
  const isRosterUndocked = useMediaQuery('(max-width: 1024px)');
  // Drag only for hover-capable fine pointers; touch moves via MoreMenu.
  const canDrag = useMediaQuery('(hover: hover) and (pointer: fine)');

  const cellCounts = useMemo(() => {
    const counts = Object.fromEntries(
      CELL_ORDER.map(id => [id, 0] as const),
    ) as Record<CellId, number>;
    for (const person of EMPLOYEES) {
      counts[placements[person.id]] += 1;
    }
    return counts;
  }, [placements]);

  const peopleByCell = useMemo(() => {
    const grouped = new Map<CellId, Employee[]>();
    for (const id of CELL_ORDER) {
      grouped.set(id, []);
    }
    for (const person of EMPLOYEES) {
      grouped.get(placements[person.id])?.push(person);
    }
    return grouped;
  }, [placements]);

  const changedCount = useMemo(
    () =>
      EMPLOYEES.filter(
        person => placements[person.id] !== ORIGINAL_PLACEMENTS[person.id],
      ).length,
    [placements],
  );

  const completeCount = useMemo(
    () => EMPLOYEES.filter(person => person.status === 'complete').length,
    [],
  );

  const selectedPerson =
    selectedId !== null ? EMPLOYEE_BY_ID.get(selectedId) ?? null : null;

  const selectPerson = useCallback(
    (personId: string) => {
      setSelectedId(personId);
      setRatingDraft(null);
      setNoteDraft('');
      if (isSinglePane) {
        setIsPacketOpenOnMobile(true);
        setIsRosterOpenOnMobile(false);
      }
      const person = EMPLOYEE_BY_ID.get(personId);
      if (person) {
        setAnnouncement(\`Opened review packet for \${person.name}\`);
      }
    },
    [isSinglePane],
  );

  const movePerson = useCallback(
    (personId: string, targetCellId: CellId) => {
      const person = EMPLOYEE_BY_ID.get(personId);
      if (!person || isFinalized || placements[personId] === targetCellId) {
        return;
      }
      const nextPlacements = {...placements, [personId]: targetCellId};
      const nextChanged = EMPLOYEES.filter(
        item => nextPlacements[item.id] !== ORIGINAL_PLACEMENTS[item.id],
      ).length;
      setPlacements(nextPlacements);
      setAnnouncement(
        \`Moved \${person.name} to \${CELLS[targetCellId].label} — \${nextChanged} placement\${
          nextChanged === 1 ? '' : 's'
        } changed this session\`,
      );
    },
    [isFinalized, placements],
  );

  const startRatingEdit = useCallback(() => {
    if (selectedId !== null) {
      setRatingDraft(String(managerRatings[selectedId]));
    }
  }, [managerRatings, selectedId]);

  const saveRating = useCallback(() => {
    if (selectedId === null || ratingDraft === null) {
      return;
    }
    const next = Number(ratingDraft);
    setManagerRatings(prev => ({...prev, [selectedId]: next}));
    setRatingDraft(null);
    const person = EMPLOYEE_BY_ID.get(selectedId);
    setAnnouncement(
      \`Manager rating for \${person?.name ?? 'reviewee'} saved: \${next} — \${RATING_LABELS[next]}\`,
    );
  }, [ratingDraft, selectedId]);

  const addNote = useCallback(() => {
    const text = noteDraft.trim();
    if (selectedId === null || text === '') {
      return;
    }
    const note: CalibrationNote = {
      author: 'Jordan Blake (facilitator)',
      timestamp: sessionTimestamp(sessionNoteCount),
      text,
    };
    setNotes(prev => ({
      ...prev,
      [selectedId]: [...(prev[selectedId] ?? []), note],
    }));
    setSessionNoteCount(prev => prev + 1);
    setNoteDraft('');
    const person = EMPLOYEE_BY_ID.get(selectedId);
    setAnnouncement(\`Calibration note added for \${person?.name ?? 'reviewee'}\`);
  }, [noteDraft, selectedId, sessionNoteCount]);

  const confirmReset = useCallback(() => {
    setPlacements({...ORIGINAL_PLACEMENTS});
    setIsResetArmed(false);
    setAnnouncement('All placements reset to the original submissions');
  }, []);

  const finalize = useCallback(() => {
    setIsFinalized(true);
    setIsResetArmed(false);
    setAnnouncement(
      \`Session finalized with \${changedCount} changed placement\${
        changedCount === 1 ? '' : 's'
      } — movement locked\`,
    );
  }, [changedCount]);

  const reopen = useCallback(() => {
    setIsFinalized(false);
    setAnnouncement('Session reopened — placements can move again');
  }, []);

  const rosterPane = (
    <RosterPane
      statusFilter={statusFilter}
      placements={placements}
      selectedId={selectedId}
      onStatusFilterChange={setStatusFilter}
      onSelect={selectPerson}
    />
  );

  const packetPane =
    selectedPerson !== null ? (
      <PacketPane
        person={selectedPerson}
        cellId={placements[selectedPerson.id]}
        managerRating={managerRatings[selectedPerson.id]}
        notes={notes[selectedPerson.id] ?? []}
        ratingDraft={ratingDraft}
        noteDraft={noteDraft}
        onBack={
          isSinglePane ? () => setIsPacketOpenOnMobile(false) : undefined
        }
        onStartRatingEdit={startRatingEdit}
        onRatingDraftChange={setRatingDraft}
        onRatingSave={saveRating}
        onRatingCancel={() => setRatingDraft(null)}
        onNoteDraftChange={setNoteDraft}
        onNoteAdd={addNote}
      />
    ) : (
      <div style={styles.rosterEmpty}>
        <EmptyState
          isCompact
          icon={<Icon icon={MessageSquareIcon} size="lg" />}
          title="No packet selected"
          description="Pick a reviewee from the roster or the grid."
        />
      </div>
    );

  const gridPane = (
    <div style={styles.contentColumn}>
      <FinalizeBanner
        changedCount={changedCount}
        isFinalized={isFinalized}
        isResetArmed={isResetArmed}
        onArmReset={() => setIsResetArmed(true)}
        onConfirmReset={confirmReset}
        onCancelReset={() => setIsResetArmed(false)}
        onFinalize={finalize}
        onReopen={reopen}
      />
      <DistributionHistogram counts={cellCounts} />
      <div
        style={{
          ...styles.grid,
          ...(isSinglePane ? styles.gridSingleColumn : undefined),
        }}>
        {CELL_ROWS.map(row => (
          <Fragment key={row.potential}>
            <div style={styles.rowLabel}>
              <Text type="label" color="secondary">
                {row.potential}
              </Text>
            </div>
            {row.cells.map(cellId => (
              <GridCell
                key={cellId}
                cellId={cellId}
                people={peopleByCell.get(cellId) ?? []}
                selectedId={selectedId}
                isDraggable={canDrag}
                isLocked={isFinalized}
                draggingId={draggingId}
                onSelect={selectPerson}
                onMove={movePerson}
                onDraggingChange={setDraggingId}
              />
            ))}
          </Fragment>
        ))}
        <div style={styles.rowLabel}>
          <Text type="supporting" color="secondary">
            Performance: Below expectations → Meets → Exceeds
          </Text>
        </div>
      </div>
    </div>
  );

  const contentPane =
    isSinglePane && isPacketOpenOnMobile && selectedPerson !== null
      ? packetPane
      : isRosterUndocked && isRosterOpenOnMobile
        ? rosterPane
        : gridPane;

  return (
    <div style={styles.root}>
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            {/* wrap="wrap" drops the meter and controls under the title on
                narrow viewports instead of clipping. */}
            <HStack gap={3} vAlign="center" wrap="wrap">
              <StackItem size={isSinglePane ? 'static' : 'fill'}>
                <HStack gap={2} vAlign="center" wrap="wrap">
                  <Heading level={1}>{CYCLE.title}</Heading>
                  {isSinglePane ? null : (
                    <Text type="supporting" color="secondary" maxLines={1}>
                      {CYCLE.scope}
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <StackItem size={isSinglePane ? 'fill' : 'static'}>
                <div style={isSinglePane ? styles.meterBlockFill : styles.meterBlock}>
                  <VStack gap={1}>
                    <HStack gap={2} vAlign="center">
                      <StackItem size="fill">
                        <Text type="supporting" color="secondary">
                          Reviews complete
                        </Text>
                      </StackItem>
                      <Text type="supporting" hasTabularNumbers>
                        {completeCount} / {CYCLE.totalPeople}
                      </Text>
                    </HStack>
                    <ProgressBar
                      label={\`\${completeCount} of \${CYCLE.totalPeople} reviews complete\`}
                      isLabelHidden
                      value={completeCount}
                      max={CYCLE.totalPeople}
                      variant="accent"
                    />
                  </VStack>
                </div>
              </StackItem>
              {isRosterUndocked ? (
                // Roster undocks below 1024px; this ~40px toggle swaps the
                // content region between the roster and the grid.
                <IconButton
                  label={
                    isRosterOpenOnMobile
                      ? 'Show calibration grid'
                      : \`Show roster (\${EMPLOYEES.length} reviewees)\`
                  }
                  tooltip={isRosterOpenOnMobile ? 'Show grid' : 'Show roster'}
                  icon={
                    <Icon
                      icon={isRosterOpenOnMobile ? LayoutGridIcon : UsersIcon}
                      size="sm"
                    />
                  }
                  variant={isRosterOpenOnMobile ? 'secondary' : 'ghost'}
                  style={styles.iconTapTarget}
                  onClick={() => {
                    setIsRosterOpenOnMobile(prev => !prev);
                    setIsPacketOpenOnMobile(false);
                  }}
                />
              ) : null}
            </HStack>
          </LayoutHeader>
        }
        start={
          isRosterUndocked ? undefined : (
            <LayoutPanel width={260} padding={0} hasDivider label="Roster">
              {rosterPane}
            </LayoutPanel>
          )
        }
        end={
          isSinglePane ? undefined : (
            <LayoutPanel
              width={320}
              padding={0}
              hasDivider
              label="Review packet">
              {packetPane}
            </LayoutPanel>
          )
        }
        content={
          <LayoutContent padding={0}>
            <div aria-live="polite" style={styles.visuallyHidden}>
              {announcement}
            </div>
            {contentPane}
          </LayoutContent>
        }
      />
    </div>
  );
}
`;export{e as default};