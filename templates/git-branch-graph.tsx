// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (17 commits across 4 branches with
 *   hand-authored lane/rail graph data, fixed relative-time strings, author
 *   initials avatars, branch/tag/HEAD refs, and per-commit changed-file
 *   lists with addition/deletion counts)
 * @output Commit-history browser with a lane-drawn commit DAG: every row
 *   pairs a fixed 72px SVG graph gutter (colored rails, merge and branch
 *   curves, hollow merge dots) with the commit line (message, author
 *   Avatar, monospace short sha, relative time, tinted ref Badges); a
 *   branch Selector collapses the graph to a single tinted rail for one
 *   branch; clicking a commit fills the right detail panel with parents,
 *   refs, and a changed-file list whose rows carry status letter Badges
 *   and green/red diffstat bars; a Compare toggle turns clicks into
 *   base/target picks, tints every row in the range, and swaps the panel
 *   to an aggregated range diffstat
 * @position Page template; emitted by `astryx template git-branch-graph`
 *
 * Frame: Layout height="fill". LayoutHeader carries the chrome (title,
 * commit/branch count caption, branch Selector, Compare ToggleButton).
 * LayoutContent hosts a status row over the scrolling commit stream — each
 * commit is one full-width native button so the SVG gutter rails stay
 * flush between rows. LayoutPanel end 380 is the always-on inspector
 * (single-commit detail or compare summary).
 *
 * Responsive contract:
 * - >1200px: header | commit stream (fill) | detail panel 380. The stream
 *   is the only flexible region; the panel keeps its fixed width and
 *   scrolls independently.
 * - <=1200px: the detail panel hides; selecting a commit opens the same
 *   detail content in a Dialog. In compare mode the Dialog waits until the
 *   target lands (the base pick alone never throws a modal), and a "View
 *   comparison" button in the status row reopens it on demand.
 * - <=640px: the header caption hides and the branch Selector trades its
 *   fixed 220px for a flexible share (flex 1 1 150px, minWidth 0) so the
 *   title, Selector, and Compare toggle fit a 375px phone; the Compare
 *   ToggleButton and the Selector are padded up to a 40px tap target; the
 *   author name drops out of the commit meta line (Avatar, sha, and time
 *   remain) so rows never need to pan.
 * - No horizontal scrolling at any width: the graph gutter is a fixed
 *   72px, messages and file paths truncate with maxLines, and ref badges
 *   are capped at two per commit in the stream (the panel lists them all).
 * - No hover-only affordances: commit rows are real buttons with
 *   aria-pressed selection state, ref-badge Tooltips also open on focus,
 *   and parent-sha jumps are Buttons in the detail panel.
 *
 * Container policy (history-browser archetype): frame-first rows and
 * panels, no Cards. The DAG is one small SVG per row driven entirely by
 * fixture lane data — colored rails via CSS color tokens, cubic merge and
 * branch curves, never a chart library or network image. Diffstat bars are
 * styled divs sized by fixture addition/deletion counts.
 */

import {useMemo, useState, type CSSProperties} from 'react';

import {
  HStack,
  Layout,
  LayoutContent,
  LayoutHeader,
  LayoutPanel,
  StackItem,
  VStack,
} from '@astryxdesign/core/Layout';
import {Text, Heading} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Badge, type BadgeVariant} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Dialog, DialogHeader} from '@astryxdesign/core/Dialog';
import {Divider} from '@astryxdesign/core/Divider';
import {EmptyState} from '@astryxdesign/core/EmptyState';
import {Icon} from '@astryxdesign/core/Icon';
import {Selector} from '@astryxdesign/core/Selector';
import {ToggleButton} from '@astryxdesign/core/ToggleButton';
import {Tooltip} from '@astryxdesign/core/Tooltip';
import {useMediaQuery} from '@astryxdesign/core/hooks';
import {
  GitBranchIcon,
  GitCompareArrowsIcon,
  GitMergeIcon,
  TagIcon,
} from 'lucide-react';

// ============= GRAPH GEOMETRY =============
// One SVG per commit row. Rows butt against each other (no vertical gaps),
// so rails drawn edge-to-edge read as continuous lines down the stream.

const LANE_W = 14; // horizontal distance between lane centers
const GRAPH_PAD = 8; // gutter inset before lane 0
const MAX_LANES = 4;
const ROW_H = 56; // >=40px tap target by construction
const DOT_R = 5;

const GRAPH_W = GRAPH_PAD * 2 + MAX_LANES * LANE_W; // 72
const CY = ROW_H / 2;

function laneX(lane: number): number {
  return GRAPH_PAD + LANE_W / 2 + lane * LANE_W;
}

// Lane color vocabulary: lane 0 = main (blue), lane 1 = purple, lane 2 =
// green, lane 3 = orange. Branch metadata below points back at these.
const LANE_COLORS = [
  'var(--color-icon-blue)',
  'var(--color-icon-purple)',
  'var(--color-icon-green)',
  'var(--color-icon-orange)',
];

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  contentFill: {
    height: '100%',
    minHeight: 0,
  },
  // Single scroll region for the commit stream.
  streamScroll: {
    overflowY: 'auto',
    minHeight: 0,
  },
  statusRow: {
    padding: 'var(--spacing-2) var(--spacing-3)',
    flexWrap: 'wrap',
  },
  headerRow: {
    width: '100%',
    flexWrap: 'wrap',
  },
  headerSelector: {width: 220},
  // <=640px: the fixed 220px Selector would starve the title, so it flexes
  // against the remaining header width instead (and pads up to 40px tall).
  headerSelectorCompact: {flex: '1 1 150px', minWidth: 0, minHeight: 40},
  compareToggleCompact: {minHeight: 40},
  // Commit rows are native buttons so the SVG gutter can bleed edge-to-edge
  // (ListItem padding would break rail continuity between rows).
  row: {
    display: 'flex',
    alignItems: 'stretch',
    width: '100%',
    height: ROW_H,
    padding: 0,
    border: 'none',
    borderBottom: '1px solid var(--color-border)',
    background: 'transparent',
    textAlign: 'left',
    cursor: 'pointer',
    font: 'inherit',
    color: 'inherit',
  },
  rowSelected: {
    backgroundColor: 'var(--color-background-muted)',
  },
  rowInRange: {
    backgroundColor: 'var(--color-background-blue)',
  },
  // Compare endpoints add an inset rail so base/target read at a glance
  // even where the range tint spans many rows.
  rowEndpoint: {
    backgroundColor: 'var(--color-background-blue)',
    boxShadow: 'inset 3px 0 0 var(--color-icon-blue)',
  },
  graphCell: {
    flexShrink: 0,
    display: 'block',
  },
  rowBody: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    gap: 2,
    paddingRight: 'var(--spacing-3)',
  },
  rowTitleLine: {
    display: 'flex',
    alignItems: 'center',
    gap: 'var(--spacing-2)',
    minWidth: 0,
  },
  rowMessage: {
    flex: 1,
    minWidth: 0,
  },
  refBadges: {
    display: 'flex',
    gap: 'var(--spacing-1)',
    flexShrink: 0,
  },
  monoSha: {
    fontFamily: 'var(--font-family-code, monospace)',
  },
  // Green/red diffstat bar; segment widths are proportional to fixture
  // addition/deletion counts.
  statBar: {
    display: 'flex',
    width: 64,
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
    backgroundColor: 'var(--color-background-muted)',
    flexShrink: 0,
  },
  statAdd: {backgroundColor: 'var(--color-icon-green)'},
  statDel: {backgroundColor: 'var(--color-icon-red)'},
  addText: {color: 'var(--color-text-green)'},
  delText: {color: 'var(--color-text-red)'},
  filePath: {
    flex: 1,
    minWidth: 0,
  },
  panelScroll: {
    minHeight: 0,
  },
  dialogBody: {paddingBottom: 'var(--spacing-2)'},
};

// ============= DATA =============
// Deterministic fixtures: fixed relative-time strings, hex-looking short
// shas, hand-authored lane geometry. No clocks, randomness, or images —
// avatars render initials from fixture names.

type BranchId =
  | 'main'
  | 'feature/graph-lanes'
  | 'feature/compare-range'
  | 'fix/relative-time';

type FileStatus = 'added' | 'modified' | 'deleted' | 'renamed';

interface CommitRef {
  kind: 'head' | 'branch' | 'tag';
  label: string;
}

interface ChangedFile {
  path: string;
  status: FileStatus;
  additions: number;
  deletions: number;
}

/**
 * Per-row lane geometry. `up` lists lanes at the row's top edge whose
 * lines feed this commit's dot (its children above); `down` lists lanes at
 * the bottom edge that this dot's parent lines exit toward; `through`
 * lists lanes whose rails pass straight through the row untouched.
 */
interface GraphRow {
  up: number[];
  down: number[];
  through: number[];
}

interface Commit {
  sha: string; // short sha, 7 hex chars
  message: string;
  author: string;
  relTime: string; // pre-formatted, deterministic
  lane: number;
  isMerge: boolean;
  parents: string[]; // short shas
  refs: CommitRef[];
  branch: BranchId; // branch the commit was authored on (filter key)
  graph: GraphRow;
  files: ChangedFile[];
}

const BRANCHES: Record<
  BranchId,
  {label: string; lane: number; badge: BadgeVariant}
> = {
  main: {label: 'main', lane: 0, badge: 'blue'},
  'feature/graph-lanes': {
    label: 'feature/graph-lanes',
    lane: 1,
    badge: 'purple',
  },
  'feature/compare-range': {
    label: 'feature/compare-range',
    lane: 2,
    badge: 'green',
  },
  'fix/relative-time': {
    label: 'fix/relative-time',
    lane: 3,
    badge: 'orange',
  },
};

const BRANCH_IDS: BranchId[] = [
  'main',
  'feature/graph-lanes',
  'feature/compare-range',
  'fix/relative-time',
];

const FILE_STATUS: Record<FileStatus, {letter: string; badge: BadgeVariant}> = {
  added: {letter: 'A', badge: 'green'},
  modified: {letter: 'M', badge: 'blue'},
  deleted: {letter: 'D', badge: 'red'},
  renamed: {letter: 'R', badge: 'purple'},
};

// Newest first. Graph data is hand-checked so every lane rail is
// continuous from the row where a branch forks to the row where it merges
// (or to its unmerged tip).
const COMMITS: Commit[] = [
  {
    sha: 'f47ac10',
    message: 'Merge feature/graph-lanes into main',
    author: 'Maya Okafor',
    relTime: '26 minutes ago',
    lane: 0,
    isMerge: true,
    parents: ['3c9d2e1', 'a1b2c3d'],
    refs: [
      {kind: 'head', label: 'HEAD'},
      {kind: 'branch', label: 'main'},
    ],
    branch: 'main',
    graph: {up: [], down: [0, 1], through: []},
    files: [
      {path: 'src/graph/laneRenderer.ts', status: 'modified', additions: 48, deletions: 21},
      {path: 'src/graph/curves.ts', status: 'added', additions: 96, deletions: 0},
      {path: 'src/rows/CommitRow.tsx', status: 'modified', additions: 17, deletions: 9},
    ],
  },
  {
    sha: 'a1b2c3d',
    message: 'Ease merge curves with cubic control points',
    author: 'Jonas Weber',
    relTime: '2 hours ago',
    lane: 1,
    isMerge: false,
    parents: ['58ef0aa'],
    refs: [{kind: 'branch', label: 'feature/graph-lanes'}],
    branch: 'feature/graph-lanes',
    graph: {up: [1], down: [1], through: [0]},
    files: [
      {path: 'src/graph/curves.ts', status: 'modified', additions: 34, deletions: 12},
      {path: 'src/graph/curves.test.ts', status: 'added', additions: 58, deletions: 0},
    ],
  },
  {
    sha: '3c9d2e1',
    message: 'Write release notes for v2.4.0',
    author: 'Priya Raman',
    relTime: '4 hours ago',
    lane: 0,
    isMerge: false,
    parents: ['9d01c4b'],
    refs: [{kind: 'tag', label: 'v2.4.0'}],
    branch: 'main',
    graph: {up: [0], down: [0], through: [1]},
    files: [
      {path: 'CHANGELOG.md', status: 'modified', additions: 41, deletions: 2},
      {path: 'package.json', status: 'modified', additions: 1, deletions: 1},
    ],
  },
  {
    sha: '58ef0aa',
    message: 'Draw pass-through rails behind commit dots',
    author: 'Jonas Weber',
    relTime: 'yesterday',
    lane: 1,
    isMerge: false,
    parents: ['2f8c7aa'],
    refs: [],
    branch: 'feature/graph-lanes',
    graph: {up: [1], down: [1], through: [0]},
    files: [
      {path: 'src/graph/laneRenderer.ts', status: 'modified', additions: 27, deletions: 14},
      {path: 'src/graph/zOrder.ts', status: 'added', additions: 22, deletions: 0},
    ],
  },
  {
    sha: '9d01c4b',
    message: 'Merge fix/relative-time into main',
    author: 'Maya Okafor',
    relTime: 'yesterday',
    lane: 0,
    isMerge: true,
    parents: ['6b7f2d9', 'c0ffee1'],
    refs: [],
    branch: 'main',
    graph: {up: [0], down: [0, 3], through: [1]},
    files: [
      {path: 'src/time/relative.ts', status: 'modified', additions: 19, deletions: 8},
      {path: 'src/time/relative.test.ts', status: 'modified', additions: 33, deletions: 5},
    ],
  },
  {
    sha: 'c0ffee1',
    message: 'Clamp relative-time strings at 90 days',
    author: 'Sam Torres',
    relTime: '2 days ago',
    lane: 3,
    isMerge: false,
    parents: ['1a2b3c4'],
    refs: [{kind: 'branch', label: 'fix/relative-time'}],
    branch: 'fix/relative-time',
    graph: {up: [3], down: [3], through: [0, 1]},
    files: [
      {path: 'src/time/relative.ts', status: 'modified', additions: 11, deletions: 6},
    ],
  },
  {
    sha: '6b7f2d9',
    message: 'Harden ref badge overflow on narrow rows',
    author: 'Priya Raman',
    relTime: '2 days ago',
    lane: 0,
    isMerge: false,
    parents: ['84d9e2f'],
    refs: [],
    branch: 'main',
    graph: {up: [0], down: [0], through: [1, 3]},
    files: [
      {path: 'src/rows/RefBadges.tsx', status: 'modified', additions: 15, deletions: 10},
      {path: 'src/rows/CommitRow.tsx', status: 'modified', additions: 6, deletions: 3},
    ],
  },
  {
    sha: '1a2b3c4',
    message: 'Snapshot relative-time fixture strings',
    author: 'Sam Torres',
    relTime: '3 days ago',
    lane: 3,
    isMerge: false,
    parents: ['84d9e2f'],
    refs: [],
    branch: 'fix/relative-time',
    graph: {up: [3], down: [0], through: [0, 1]},
    files: [
      {path: 'src/time/fixtures.ts', status: 'added', additions: 44, deletions: 0},
      {path: 'src/time/relative.test.ts', status: 'modified', additions: 12, deletions: 12},
    ],
  },
  {
    sha: '84d9e2f',
    message: 'Wire branch selector into the graph store',
    author: 'Maya Okafor',
    relTime: '4 days ago',
    lane: 0,
    isMerge: false,
    parents: ['deadbe1'],
    refs: [],
    branch: 'main',
    graph: {up: [0], down: [0], through: [1]},
    files: [
      {path: 'src/store/graphStore.ts', status: 'modified', additions: 29, deletions: 7},
      {path: 'src/header/BranchSelector.tsx', status: 'added', additions: 61, deletions: 0},
      {path: 'src/header/index.ts', status: 'modified', additions: 2, deletions: 0},
    ],
  },
  {
    sha: '2f8c7aa',
    message: 'Compute lane assignments per row',
    author: 'Jonas Weber',
    relTime: '5 days ago',
    lane: 1,
    isMerge: false,
    parents: ['0a1b2c3'],
    refs: [],
    branch: 'feature/graph-lanes',
    graph: {up: [1], down: [1], through: [0]},
    files: [
      {path: 'src/graph/lanes.ts', status: 'added', additions: 88, deletions: 0},
      {path: 'src/graph/lanes.test.ts', status: 'added', additions: 74, deletions: 0},
    ],
  },
  {
    sha: '5b6a7c8',
    message: 'Add compare range highlight painter',
    author: 'Priya Raman',
    relTime: '6 days ago',
    lane: 2,
    isMerge: false,
    parents: ['e9d8c7b'],
    refs: [{kind: 'branch', label: 'feature/compare-range'}],
    branch: 'feature/compare-range',
    graph: {up: [], down: [2], through: [0, 1]},
    files: [
      {path: 'src/compare/rangePainter.ts', status: 'added', additions: 52, deletions: 0},
      {path: 'src/rows/CommitRow.tsx', status: 'modified', additions: 9, deletions: 2},
    ],
  },
  {
    sha: 'e9d8c7b',
    message: 'Select base and target commits',
    author: 'Priya Raman',
    relTime: 'last week',
    lane: 2,
    isMerge: false,
    parents: ['4c5d6e7'],
    refs: [],
    branch: 'feature/compare-range',
    graph: {up: [2], down: [2], through: [0, 1]},
    files: [
      {path: 'src/compare/selection.ts', status: 'added', additions: 39, deletions: 0},
      {path: 'src/store/graphStore.ts', status: 'modified', additions: 14, deletions: 3},
    ],
  },
  {
    sha: '0a1b2c3',
    message: 'Scaffold the graph canvas component',
    author: 'Jonas Weber',
    relTime: 'last week',
    lane: 1,
    isMerge: false,
    parents: ['8f9e0d1'],
    refs: [],
    branch: 'feature/graph-lanes',
    graph: {up: [1], down: [1], through: [0, 2]},
    files: [
      {path: 'src/graph/GraphCanvas.tsx', status: 'added', additions: 67, deletions: 0},
    ],
  },
  {
    sha: '4c5d6e7',
    message: 'Branch compare mode scaffold',
    author: 'Priya Raman',
    relTime: '2 weeks ago',
    lane: 2,
    isMerge: false,
    parents: ['deadbe1'],
    refs: [],
    branch: 'feature/compare-range',
    graph: {up: [2], down: [0], through: [0, 1]},
    files: [
      {path: 'src/compare/index.ts', status: 'added', additions: 18, deletions: 0},
      {path: 'src/compare/types.ts', status: 'added', additions: 25, deletions: 0},
    ],
  },
  {
    sha: '8f9e0d1',
    message: 'Spike: single-SVG graph prototype',
    author: 'Jonas Weber',
    relTime: '2 weeks ago',
    lane: 1,
    isMerge: false,
    parents: ['deadbe1'],
    refs: [],
    branch: 'feature/graph-lanes',
    graph: {up: [1], down: [0], through: [0]},
    files: [
      {path: 'spikes/graph-svg.tsx', status: 'added', additions: 120, deletions: 0},
      {path: 'spikes/README.md', status: 'modified', additions: 8, deletions: 1},
    ],
  },
  {
    sha: 'deadbe1',
    message: 'Ship commit list virtualization',
    author: 'Maya Okafor',
    relTime: '3 weeks ago',
    lane: 0,
    isMerge: false,
    parents: ['facade2'],
    refs: [],
    branch: 'main',
    graph: {up: [0], down: [0], through: []},
    files: [
      {path: 'src/rows/VirtualList.tsx', status: 'added', additions: 93, deletions: 0},
      {path: 'src/rows/CommitRow.tsx', status: 'renamed', additions: 4, deletions: 4},
      {path: 'src/rows/legacyList.tsx', status: 'deleted', additions: 0, deletions: 71},
    ],
  },
  {
    sha: 'facade2',
    message: 'Initial import of the history browser',
    author: 'Maya Okafor',
    relTime: 'last month',
    lane: 0,
    isMerge: false,
    parents: [],
    refs: [{kind: 'tag', label: 'v2.3.0'}],
    branch: 'main',
    graph: {up: [0], down: [], through: []},
    files: [
      {path: 'src/index.ts', status: 'added', additions: 12, deletions: 0},
      {path: 'src/rows/CommitList.tsx', status: 'added', additions: 84, deletions: 0},
      {path: 'README.md', status: 'added', additions: 31, deletions: 0},
    ],
  },
];

const COMMIT_BY_SHA = new Map(COMMITS.map(commit => [commit.sha, commit]));

const BRANCH_FILTER_OPTIONS = [
  {value: 'all', label: 'All branches'},
  ...BRANCH_IDS.map(id => ({value: id, label: BRANCHES[id].label})),
];

// ============= SHARED BITS =============

function refBadgeVariant(ref: CommitRef): BadgeVariant {
  if (ref.kind === 'head') {
    return 'info';
  }
  if (ref.kind === 'tag') {
    return 'yellow';
  }
  const branch = BRANCH_IDS.find(id => BRANCHES[id].label === ref.label);
  return branch != null ? BRANCHES[branch].badge : 'neutral';
}

function refTooltip(ref: CommitRef): string {
  if (ref.kind === 'head') {
    return 'Current checkout (HEAD)';
  }
  if (ref.kind === 'tag') {
    return `Tag ${ref.label}`;
  }
  return `Branch ${ref.label}`;
}

function RefBadge({ref: commitRef}: {ref: CommitRef}) {
  return (
    <Tooltip content={refTooltip(commitRef)}>
      <Badge variant={refBadgeVariant(commitRef)} label={commitRef.label} />
    </Tooltip>
  );
}

function diffTotals(files: ChangedFile[]): {
  additions: number;
  deletions: number;
} {
  return files.reduce(
    (acc, file) => ({
      additions: acc.additions + file.additions,
      deletions: acc.deletions + file.deletions,
    }),
    {additions: 0, deletions: 0},
  );
}

/** Green/red proportional diffstat bar with a +a −d readout. */
function StatBar({
  additions,
  deletions,
}: {
  additions: number;
  deletions: number;
}) {
  const total = additions + deletions;
  return (
    <HStack gap={2} vAlign="center">
      <div style={styles.statBar} aria-hidden>
        {total > 0 && (
          <>
            <div style={{...styles.statAdd, flexGrow: additions}} />
            <div style={{...styles.statDel, flexGrow: deletions}} />
          </>
        )}
      </div>
      <Text type="supporting" hasTabularNumbers>
        <span style={styles.addText}>+{additions}</span>{' '}
        <span style={styles.delText}>−{deletions}</span>
      </Text>
    </HStack>
  );
}

// ============= GRAPH CELL =============

/**
 * One row's slice of the DAG. Rails (`through`) run edge-to-edge; `up`
 * lines land on the dot from the top edge, `down` lines leave it toward
 * the bottom edge; off-lane connections render as cubic curves colored by
 * the far lane, which is how merge and branch elbows read as one line
 * across row boundaries.
 */
function GraphCell({
  lane,
  graph,
  isMerge,
  colorForLane,
}: {
  lane: number;
  graph: GraphRow;
  isMerge: boolean;
  colorForLane: (lane: number) => string;
}) {
  const dotX = laneX(lane);
  const dotColor = colorForLane(lane);

  return (
    <svg
      width={GRAPH_W}
      height={ROW_H}
      viewBox={`0 0 ${GRAPH_W} ${ROW_H}`}
      style={styles.graphCell}
      aria-hidden
      focusable={false}>
      {graph.through.map(railLane => (
        <line
          key={`through-${railLane}`}
          x1={laneX(railLane)}
          y1={0}
          x2={laneX(railLane)}
          y2={ROW_H}
          stroke={colorForLane(railLane)}
          strokeWidth={2}
        />
      ))}
      {graph.up.map(upLane =>
        upLane === lane ? (
          <line
            key={`up-${upLane}`}
            x1={dotX}
            y1={0}
            x2={dotX}
            y2={CY}
            stroke={dotColor}
            strokeWidth={2}
          />
        ) : (
          <path
            key={`up-${upLane}`}
            d={`M ${laneX(upLane)} 0 C ${laneX(upLane)} ${CY / 2}, ${dotX} ${
              CY / 2
            }, ${dotX} ${CY}`}
            fill="none"
            stroke={colorForLane(upLane)}
            strokeWidth={2}
          />
        ),
      )}
      {graph.down.map(downLane =>
        downLane === lane ? (
          <line
            key={`down-${downLane}`}
            x1={dotX}
            y1={CY}
            x2={dotX}
            y2={ROW_H}
            stroke={dotColor}
            strokeWidth={2}
          />
        ) : (
          <path
            key={`down-${downLane}`}
            d={`M ${dotX} ${CY} C ${dotX} ${CY + CY / 2}, ${laneX(downLane)} ${
              CY + CY / 2
            }, ${laneX(downLane)} ${ROW_H}`}
            fill="none"
            stroke={colorForLane(downLane)}
            strokeWidth={2}
          />
        ),
      )}
      {/* Merge commits render hollow so join points scan differently. */}
      <circle
        cx={dotX}
        cy={CY}
        r={DOT_R}
        fill={isMerge ? 'var(--color-background-body)' : dotColor}
        stroke={isMerge ? dotColor : 'var(--color-background-body)'}
        strokeWidth={2}
      />
    </svg>
  );
}

// ============= COMMIT ROW =============

type RowCompareRole = 'base' | 'target' | 'in-range' | undefined;

function CommitRow({
  commit,
  graphOverride,
  colorForLane,
  isSelected,
  compareRole,
  isCompareOn,
  isCompact,
  onClick,
}: {
  commit: Commit;
  graphOverride: {lane: number; graph: GraphRow} | undefined;
  colorForLane: (lane: number) => string;
  isSelected: boolean;
  compareRole: RowCompareRole;
  isCompareOn: boolean;
  isCompact: boolean;
  onClick: () => void;
}) {
  const lane = graphOverride?.lane ?? commit.lane;
  const graph = graphOverride?.graph ?? commit.graph;

  const rowStateStyle =
    compareRole === 'base' || compareRole === 'target'
      ? styles.rowEndpoint
      : compareRole === 'in-range'
        ? styles.rowInRange
        : isSelected && !isCompareOn
          ? styles.rowSelected
          : undefined;

  const compareLabel =
    compareRole === 'base'
      ? ', compare base'
      : compareRole === 'target'
        ? ', compare target'
        : compareRole === 'in-range'
          ? ', in compare range'
          : '';

  return (
    <button
      type="button"
      style={{...styles.row, ...rowStateStyle}}
      aria-pressed={
        isCompareOn
          ? compareRole === 'base' || compareRole === 'target'
          : isSelected
      }
      aria-label={`${commit.message}, ${commit.sha}, ${commit.author}, ${commit.relTime}${compareLabel}`}
      onClick={onClick}>
      <GraphCell
        lane={lane}
        graph={graph}
        isMerge={commit.isMerge}
        colorForLane={colorForLane}
      />
      <span style={styles.rowBody}>
        <span style={styles.rowTitleLine}>
          <span style={styles.rowMessage}>
            <Text size="sm" maxLines={1}>
              {commit.message}
            </Text>
          </span>
          {(commit.refs.length > 0 || compareRole === 'base' || compareRole === 'target') && (
            <span style={styles.refBadges}>
              {compareRole === 'base' && <Badge variant="info" label="base" />}
              {compareRole === 'target' && (
                <Badge variant="info" label="target" />
              )}
              {commit.refs.slice(0, 2).map(ref => (
                <RefBadge key={`${ref.kind}-${ref.label}`} ref={ref} />
              ))}
            </span>
          )}
        </span>
        <HStack gap={2} vAlign="center">
          <Avatar name={commit.author} size={16} />
          {/* <=640px: the author name cedes its width to sha + time. */}
          {!isCompact && (
            <Text type="supporting" color="secondary" maxLines={1}>
              {commit.author}
            </Text>
          )}
          <Text type="supporting" color="secondary" style={styles.monoSha}>
            {commit.sha}
          </Text>
          <Text type="supporting" color="secondary" maxLines={1}>
            {commit.relTime}
          </Text>
        </HStack>
      </span>
    </button>
  );
}

// ============= FILE LIST =============

function ChangedFileList({files}: {files: ChangedFile[]}) {
  return (
    <VStack gap={2}>
      {files.map(file => (
        <HStack key={file.path} gap={2} vAlign="center">
          <Badge
            variant={FILE_STATUS[file.status].badge}
            label={FILE_STATUS[file.status].letter}
          />
          <span style={styles.filePath}>
            <Text type="code" size="sm" maxLines={1}>
              {file.path}
            </Text>
          </span>
          <StatBar additions={file.additions} deletions={file.deletions} />
        </HStack>
      ))}
    </VStack>
  );
}

// ============= COMMIT DETAIL =============

function CommitDetail({
  commit,
  onJumpToParent,
}: {
  commit: Commit;
  onJumpToParent: (sha: string) => void;
}) {
  const totals = diffTotals(commit.files);

  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          {commit.isMerge && (
            <Icon icon={GitMergeIcon} size="sm" color="secondary" />
          )}
          <Text
            type="supporting"
            color="secondary"
            style={styles.monoSha}>
            {commit.sha}
          </Text>
          <Badge
            variant={BRANCHES[commit.branch].badge}
            label={BRANCHES[commit.branch].label}
          />
        </HStack>
        <Heading level={2}>{commit.message}</Heading>
        <HStack gap={2} vAlign="center">
          <Avatar name={commit.author} size={24} />
          <Text type="supporting" color="secondary">
            {commit.author} · {commit.relTime}
          </Text>
        </HStack>
        {commit.refs.length > 0 && (
          <HStack gap={1} vAlign="center">
            {commit.refs.map(ref => (
              <RefBadge key={`${ref.kind}-${ref.label}`} ref={ref} />
            ))}
          </HStack>
        )}
      </VStack>

      <Divider />

      <VStack gap={2}>
        <Text type="label" color="secondary">
          Parents
        </Text>
        {commit.parents.length === 0 ? (
          <Text type="supporting" color="secondary">
            Root commit — no parents.
          </Text>
        ) : (
          <HStack gap={2} vAlign="center">
            {commit.parents.map(parentSha => (
              <Button
                key={parentSha}
                label={parentSha}
                variant="secondary"
                size="sm"
                onClick={() => onJumpToParent(parentSha)}
              />
            ))}
          </HStack>
        )}
      </VStack>

      <Divider />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" color="secondary">
              Changed files ({commit.files.length})
            </Text>
          </StackItem>
          <Text type="supporting" hasTabularNumbers>
            <span style={styles.addText}>+{totals.additions}</span>{' '}
            <span style={styles.delText}>−{totals.deletions}</span>
          </Text>
        </HStack>
        <ChangedFileList files={commit.files} />
      </VStack>
    </VStack>
  );
}

// ============= COMPARE DETAIL =============

interface CompareData {
  base: Commit;
  target: Commit;
  commitCount: number;
  files: ChangedFile[];
  totals: {additions: number; deletions: number};
}

function CompareDetail({
  data,
  onClear,
}: {
  data: CompareData;
  onClear: () => void;
}) {
  return (
    <VStack gap={4}>
      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Icon icon={GitCompareArrowsIcon} size="sm" color="secondary" />
          <Text type="label" color="secondary">
            Comparing range
          </Text>
        </HStack>
        <Heading level={2}>
          {data.base.sha} → {data.target.sha}
        </Heading>
        <Text type="supporting" color="secondary" hasTabularNumbers>
          {data.commitCount} {data.commitCount === 1 ? 'commit' : 'commits'} ·{' '}
          {data.files.length} {data.files.length === 1 ? 'file' : 'files'}{' '}
          changed
        </Text>
      </VStack>

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <Badge variant="info" label="base" />
          <StackItem size="fill">
            <Text size="sm" maxLines={1}>
              {data.base.message}
            </Text>
          </StackItem>
        </HStack>
        <HStack gap={2} vAlign="center">
          <Badge variant="info" label="target" />
          <StackItem size="fill">
            <Text size="sm" maxLines={1}>
              {data.target.message}
            </Text>
          </StackItem>
        </HStack>
      </VStack>

      <Divider />

      <VStack gap={2}>
        <HStack gap={2} vAlign="center">
          <StackItem size="fill">
            <Text type="label" color="secondary">
              Combined diffstat
            </Text>
          </StackItem>
          <Text type="supporting" hasTabularNumbers>
            <span style={styles.addText}>+{data.totals.additions}</span>{' '}
            <span style={styles.delText}>−{data.totals.deletions}</span>
          </Text>
        </HStack>
        <ChangedFileList files={data.files} />
      </VStack>

      <Divider />

      <Button
        label="Clear comparison"
        variant="secondary"
        size="sm"
        onClick={onClear}
      />
    </VStack>
  );
}

function ComparePending({hasBase}: {hasBase: boolean}) {
  return (
    <EmptyState
      title={hasBase ? 'Pick a target commit' : 'Pick a base commit'}
      description={
        hasBase
          ? 'Click a second commit in the stream to highlight the range and aggregate its diffstat.'
          : 'Click any commit in the stream to anchor one end of the comparison.'
      }
      icon={<Icon icon={GitCompareArrowsIcon} size="lg" />}
      isCompact
    />
  );
}

// ============= PAGE =============

export default function GitBranchGraphTemplate() {
  const [branchFilter, setBranchFilter] = useState('all');
  const [selectedSha, setSelectedSha] = useState('f47ac10');
  const [isCompareOn, setIsCompareOn] = useState(false);
  const [baseSha, setBaseSha] = useState<string | null>(null);
  const [targetSha, setTargetSha] = useState<string | null>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  // Responsive contract: detail panel hides <=1200px (Dialog takes over);
  // <=640px the header caption drops, the Selector flexes, and the compare
  // toggle pads up to a 40px tap target.
  const hasDetailPanel = !useMediaQuery('(max-width: 1200px)');
  const isCompact = useMediaQuery('(max-width: 640px)');

  // Branch filter: 'all' renders the hand-authored multi-lane DAG; a
  // single branch collapses to a linear rail in that branch's color.
  const visibleCommits = useMemo(
    () =>
      branchFilter === 'all'
        ? COMMITS
        : COMMITS.filter(commit => commit.branch === branchFilter),
    [branchFilter],
  );

  const filteredBranch =
    branchFilter === 'all' ? null : BRANCHES[branchFilter as BranchId];

  const colorForLane = (lane: number): string =>
    filteredBranch != null
      ? LANE_COLORS[filteredBranch.lane]
      : LANE_COLORS[lane % LANE_COLORS.length];

  // In single-branch view every row sits on lane 0 with straight rails.
  const graphOverrideFor = (index: number) =>
    filteredBranch == null
      ? undefined
      : {
          lane: 0,
          graph: {
            up: index > 0 ? [0] : [],
            down: index < visibleCommits.length - 1 ? [0] : [],
            through: [],
          },
        };

  const selectedCommit =
    COMMIT_BY_SHA.get(selectedSha) ?? visibleCommits[0] ?? COMMITS[0];

  const baseIndex = visibleCommits.findIndex(commit => commit.sha === baseSha);
  const targetIndex = visibleCommits.findIndex(
    commit => commit.sha === targetSha,
  );

  // Range = visible rows between the endpoints, inclusive. Files are
  // aggregated per path (summed adds/dels, first-seen status wins).
  const compareData = useMemo<CompareData | null>(() => {
    if (!isCompareOn || baseIndex < 0 || targetIndex < 0) {
      return null;
    }
    const lo = Math.min(baseIndex, targetIndex);
    const hi = Math.max(baseIndex, targetIndex);
    const range = visibleCommits.slice(lo, hi + 1);
    const byPath = new Map<string, ChangedFile>();
    for (const commit of range) {
      for (const file of commit.files) {
        const existing = byPath.get(file.path);
        if (existing == null) {
          byPath.set(file.path, {...file});
        } else {
          existing.additions += file.additions;
          existing.deletions += file.deletions;
        }
      }
    }
    const files = [...byPath.values()].sort((a, b) =>
      a.path.localeCompare(b.path),
    );
    const base = visibleCommits[baseIndex];
    const target = visibleCommits[targetIndex];
    return {
      base,
      target,
      commitCount: range.length,
      files,
      totals: diffTotals(files),
    };
  }, [isCompareOn, baseIndex, targetIndex, visibleCommits]);

  const compareRoleFor = (index: number): RowCompareRole => {
    if (!isCompareOn) {
      return undefined;
    }
    if (index === baseIndex) {
      return 'base';
    }
    if (index === targetIndex) {
      return 'target';
    }
    if (baseIndex >= 0 && targetIndex >= 0) {
      const lo = Math.min(baseIndex, targetIndex);
      const hi = Math.max(baseIndex, targetIndex);
      if (index > lo && index < hi) {
        return 'in-range';
      }
    }
    return undefined;
  };

  const clearCompare = () => {
    setBaseSha(null);
    setTargetSha(null);
  };

  const handleCompareToggle = (isOn: boolean) => {
    setIsCompareOn(isOn);
    clearCompare();
  };

  const handleBranchChange = (value: string) => {
    setBranchFilter(value);
    clearCompare();
    const stillVisible =
      value === 'all' ||
      COMMIT_BY_SHA.get(selectedSha)?.branch === (value as BranchId);
    if (!stillVisible) {
      const first = COMMITS.find(commit => commit.branch === value);
      if (first != null) {
        setSelectedSha(first.sha);
      }
    }
  };

  // Compare clicks: first pick anchors the base, second sets the target,
  // a third restarts with a fresh base; re-clicking the base un-anchors.
  const handleRowClick = (sha: string) => {
    if (!isCompareOn) {
      setSelectedSha(sha);
      if (!hasDetailPanel) {
        setIsDetailDialogOpen(true);
      }
      return;
    }
    if (baseSha == null) {
      setBaseSha(sha);
      return;
    }
    if (sha === baseSha && targetSha == null) {
      setBaseSha(null);
      return;
    }
    if (targetSha == null) {
      setTargetSha(sha);
      // <=1200px: the compare dialog waits for the target pick.
      if (!hasDetailPanel) {
        setIsDetailDialogOpen(true);
      }
      return;
    }
    setBaseSha(sha);
    setTargetSha(null);
  };

  const jumpToParent = (sha: string) => {
    if (COMMIT_BY_SHA.has(sha)) {
      // Parent may live on a filtered-out branch; widen to all branches.
      if (!visibleCommits.some(commit => commit.sha === sha)) {
        setBranchFilter('all');
        clearCompare();
      }
      setSelectedSha(sha);
    }
  };

  const compareStatus = !isCompareOn
    ? null
    : compareData != null
      ? `${compareData.base.sha} → ${compareData.target.sha} · ${compareData.commitCount} commits`
      : baseSha != null
        ? 'base picked — click a target commit'
        : 'click a base commit';

  const panelBody = isCompareOn ? (
    compareData != null ? (
      <CompareDetail data={compareData} onClear={clearCompare} />
    ) : (
      <ComparePending hasBase={baseSha != null} />
    )
  ) : (
    <CommitDetail commit={selectedCommit} onJumpToParent={jumpToParent} />
  );

  // <=1200px the end panel is hidden, so the same content opens in a
  // Dialog on selection (or once a compare target lands).
  const detailDialog = !hasDetailPanel && (
    <Dialog
      isOpen={isDetailDialogOpen}
      onOpenChange={setIsDetailDialogOpen}
      purpose="info"
      width="min(560px, 92vw)">
      <VStack gap={3} style={styles.dialogBody}>
        <DialogHeader
          title={isCompareOn ? 'Comparison' : 'Commit details'}
          subtitle={
            isCompareOn && compareData != null
              ? `${compareData.base.sha} → ${compareData.target.sha}`
              : selectedCommit.sha
          }
          onOpenChange={setIsDetailDialogOpen}
        />
        {panelBody}
      </VStack>
    </Dialog>
  );

  return (
    <>
      {detailDialog}
      <Layout
        height="fill"
        header={
          <LayoutHeader hasDivider>
            <HStack gap={3} vAlign="center" style={styles.headerRow}>
              <StackItem size="fill">
                <HStack gap={2} vAlign="center">
                  <Icon icon={GitBranchIcon} size="sm" color="secondary" />
                  <Heading level={1}>Branch Graph</Heading>
                  {/* <=640px: the caption cedes its width to the controls. */}
                  {!isCompact && (
                    <Text
                      type="supporting"
                      color="secondary"
                      hasTabularNumbers>
                      {COMMITS.length} commits · {BRANCH_IDS.length} branches
                    </Text>
                  )}
                </HStack>
              </StackItem>
              <div
                style={
                  isCompact
                    ? styles.headerSelectorCompact
                    : styles.headerSelector
                }>
                <Selector
                  label="Branch"
                  isLabelHidden
                  size="sm"
                  options={BRANCH_FILTER_OPTIONS}
                  value={branchFilter}
                  onChange={handleBranchChange}
                />
              </div>
              <ToggleButton
                label="Compare"
                size="sm"
                icon={<Icon icon={GitCompareArrowsIcon} size="sm" />}
                isPressed={isCompareOn}
                onPressedChange={handleCompareToggle}
                style={isCompact ? styles.compareToggleCompact : undefined}
              />
            </HStack>
          </LayoutHeader>
        }
        content={
          <LayoutContent padding={0} label="Commit stream">
            <VStack gap={0} style={styles.contentFill}>
              <HStack gap={2} vAlign="center" style={styles.statusRow}>
                <Text type="supporting" color="secondary" hasTabularNumbers>
                  {visibleCommits.length} of {COMMITS.length} commits
                  {filteredBranch != null ? ` on ${filteredBranch.label}` : ''}
                </Text>
                {filteredBranch != null && (
                  <Badge
                    variant={filteredBranch.badge}
                    label={filteredBranch.label}
                  />
                )}
                {compareStatus != null && (
                  <Badge variant="info" label={compareStatus} />
                )}
                {!hasDetailPanel && compareData != null && (
                  <Button
                    label="View comparison"
                    variant="secondary"
                    size="sm"
                    onClick={() => setIsDetailDialogOpen(true)}
                  />
                )}
              </HStack>
              <Divider />
              <StackItem size="fill" style={styles.streamScroll}>
                {visibleCommits.map((commit, index) => (
                  <CommitRow
                    key={commit.sha}
                    commit={commit}
                    graphOverride={graphOverrideFor(index)}
                    colorForLane={colorForLane}
                    isSelected={commit.sha === selectedCommit.sha}
                    compareRole={compareRoleFor(index)}
                    isCompareOn={isCompareOn}
                    isCompact={isCompact}
                    onClick={() => handleRowClick(commit.sha)}
                  />
                ))}
                <HStack gap={2} vAlign="center" style={styles.statusRow}>
                  <Icon icon={TagIcon} size="sm" color="secondary" />
                  <Text type="supporting" color="secondary">
                    History truncated at v2.3.0 — 214 earlier commits not
                    shown.
                  </Text>
                </HStack>
              </StackItem>
            </VStack>
          </LayoutContent>
        }
        end={
          hasDetailPanel ? (
            <LayoutPanel
              width={380}
              label={isCompareOn ? 'Comparison' : 'Commit details'}
              style={styles.panelScroll}>
              {panelBody}
            </LayoutPanel>
          ) : undefined
        }
      />
    </>
  );
}
