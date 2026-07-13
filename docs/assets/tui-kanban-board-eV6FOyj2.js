var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only (four kanban lanes of agent sessions —
 *   Backlog / Active / Your Turn / Archived — with fixed relative times,
 *   status dots, sub-agent rosters, invented model names like relay-ultra,
 *   and 6-line last-response previews; no clocks, no randomness)
 * @output Terminal-styled kanban board for agent sessions: a scheme-locked
 *   dark mono stage centered on a token backdrop, with a \`⌘ Kanban\` header
 *   and yellow-key/gray-label hint strip (\`wasd: move  1-4: lanes  ...\`),
 *   four bordered lane columns whose focused lane gets a thick colored
 *   border + colored legend title, 2-line session cards (\`▸ ● title\` /
 *   \`3h ago  ● ↳2\` with green processing dots and sub-agent counts, the
 *   selected card highlighted white-on-blue tint, one lane showing an
 *   \`empty\` placeholder), and a right Detail panel (~30%) with Status /
 *   Updated / Model rows, a \`Sub-agents (2)\` ●/◦ roster, a dim 6-line
 *   \`Last response\` preview, and an \`enter: open chat  esc: back\` footer.
 *   Arrow keys / wasd / 1-4 genuinely move focus between lanes and cards;
 *   clicking a card selects it and fills the detail panel
 * @position Page template; emitted by \`astryx template tui-kanban-board\`
 *
 * Frame: no Layout shell — a full-height token backdrop
 * (var(--color-background-muted)) centers the fixed-palette terminal stage,
 * with a token-styled caption row underneath naming the surface so the
 * template still reads inside light demo chrome.
 *
 * Responsive contract (measured via a local ResizeObserver, not viewport
 * media queries — the demo stage is narrower than the window):
 * - >900px: stage lays out \`lanes | detail\` — four lane columns in a
 *   minmax grid plus a 300px detail panel.
 * - <=900px: lanes reflow to a 2x2 grid and the detail panel drops below
 *   them full-width; the header hint strip wraps.
 * - Cards are real <button>s (>=40px tall rows) so touch selection works
 *   at every width; keyboard nav listens on the stage wrapper (tabIndex 0)
 *   and bubbled keydowns from the card buttons are handled identically.
 *
 * Color policy: the stage (styles.stage) is a scheme-locked terminal-dark
 * surface — real TUIs are dark in both themes, so colorScheme is pinned to
 * 'dark' and every color painted inside it comes from the fixed TERM
 * palette (raw literals by design; do NOT convert to theme tokens).
 * Everything outside the stage (backdrop, caption row) uses Astryx tokens
 * and follows the active color scheme.
 */

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent,
  type RefObject,
} from 'react';

import {HStack} from '@astryxdesign/core/Layout';
import {Text} from '@astryxdesign/core/Text';
import {Kbd} from '@astryxdesign/core/Kbd';

// ============= TERMINAL PALETTE =============
// Scheme-locked: the whole stage reproduces a terminal UI and stays dark in
// both themes. Raw literals are intentional — never theme tokens here.

const TERM = {
  bg: '#0d1117',
  panel: '#161b22',
  border: '#30363d',
  text: '#e6edf3',
  dim: '#8b949e',
  green: '#3fb950',
  yellow: '#d29922',
  red: '#f85149',
  cyan: '#39c5cf',
  blue: '#58a6ff',
  magenta: '#bc8cff',
} as const;

const MONO_FONT = 'ui-monospace, SFMono-Regular, Menlo, monospace';

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Token backdrop: centers the dark stage and keeps the page legible in
  // light demo chrome; the caption row sits just under the stage.
  backdrop: {
    height: '100%',
    overflow: 'auto',
    backgroundColor: 'var(--color-background-muted)',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: 'var(--spacing-6)',
  },
  stageColumn: {
    marginBlock: 'auto',
    width: '100%',
    maxWidth: 1120,
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
  },
  // Scheme-locked terminal stage (see Color policy above).
  stage: {
    colorScheme: 'dark',
    backgroundColor: TERM.bg,
    border: \`1px solid \${TERM.border}\`,
    borderRadius: 10,
    padding: '14px 16px 16px',
    fontFamily: MONO_FONT,
    fontSize: 12.5,
    lineHeight: 1.6,
    color: TERM.text,
    outline: 'none',
  },
  stageFocused: {
    borderColor: 'rgba(57, 197, 207, 0.55)',
    boxShadow: '0 0 0 1px rgba(57, 197, 207, 0.25)',
  },
  headerRow: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 16,
    flexWrap: 'wrap',
    marginBottom: 14,
  },
  brand: {
    color: TERM.cyan,
    fontWeight: 700,
    whiteSpace: 'nowrap',
  },
  hintStrip: {
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap',
    marginLeft: 'auto',
  },
  hintKey: {color: TERM.yellow},
  hintLabel: {color: TERM.dim},
  // Main region: lanes grid + detail panel.
  mainWide: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr) 300px',
    gap: 12,
    alignItems: 'start',
  },
  mainCompact: {
    display: 'grid',
    gridTemplateColumns: 'minmax(0, 1fr)',
    gap: 12,
    alignItems: 'start',
  },
  lanesWide: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
    gap: 10,
  },
  lanesCompact: {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, minmax(0, 1fr))',
    gap: 10,
  },
  // A lane pane: bordered box with a legend-style title cut into the top
  // border (CSS borders + border-radius, not literal box-drawing rows).
  lane: {
    position: 'relative',
    border: \`1px solid \${TERM.border}\`,
    borderRadius: 8,
    padding: '14px 8px 8px',
    marginTop: 8,
    minHeight: 220,
  },
  laneTitle: {
    position: 'absolute',
    top: -9,
    left: 8,
    backgroundColor: TERM.bg,
    paddingInline: 6,
    fontSize: 11.5,
    whiteSpace: 'nowrap',
  },
  laneBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  laneEmpty: {
    color: TERM.dim,
    fontStyle: 'italic',
    textAlign: 'center',
    paddingBlock: 24,
    opacity: 0.7,
  },
  // Session card: a reset <button> so click + touch selection are native.
  card: {
    display: 'block',
    width: '100%',
    textAlign: 'left',
    font: 'inherit',
    color: 'inherit',
    backgroundColor: TERM.panel,
    border: \`1px solid \${TERM.border}\`,
    borderRadius: 6,
    padding: '6px 8px',
    cursor: 'pointer',
    minHeight: 44,
  },
  cardSelected: {
    backgroundColor: 'rgba(56, 139, 253, 0.15)',
    borderColor: TERM.blue,
  },
  cardLine1: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 6,
    minWidth: 0,
  },
  cardTitle: {
    flex: 1,
    minWidth: 0,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  cardLine2: {
    display: 'flex',
    alignItems: 'baseline',
    gap: 8,
    paddingLeft: 16,
    color: TERM.dim,
    fontSize: 11.5,
  },
  // Detail panel (~30% on wide layouts).
  detail: {
    position: 'relative',
    border: \`1px solid \${TERM.border}\`,
    borderRadius: 8,
    padding: '16px 12px 10px',
    marginTop: 8,
    minHeight: 220,
    display: 'flex',
    flexDirection: 'column',
    gap: 10,
  },
  detailTitle: {
    fontWeight: 700,
    color: TERM.text,
  },
  metaRow: {
    display: 'flex',
    gap: 8,
    alignItems: 'baseline',
  },
  metaLabel: {
    width: 88,
    flexShrink: 0,
    color: TERM.dim,
  },
  sectionLabel: {
    color: TERM.dim,
    fontSize: 11.5,
    letterSpacing: '0.04em',
  },
  subAgentRow: {
    display: 'flex',
    gap: 6,
    alignItems: 'baseline',
    paddingLeft: 4,
  },
  lastResponse: {
    color: TERM.dim,
    whiteSpace: 'pre-wrap',
    overflowWrap: 'anywhere',
    fontSize: 12,
    borderLeft: \`2px solid \${TERM.border}\`,
    paddingLeft: 8,
  },
  detailFooter: {
    marginTop: 'auto',
    paddingTop: 10,
    borderTop: \`1px solid \${TERM.border}\`,
    display: 'flex',
    gap: 14,
    flexWrap: 'wrap',
  },
  detailEmpty: {
    color: TERM.dim,
    fontStyle: 'italic',
    marginBlock: 'auto',
    textAlign: 'center',
  },
};

// ============= DATA =============
// Deterministic fixtures only: fixed relative times, invented session
// titles and model names, no clocks, no randomness.

type CardStatus = 'idle' | 'processing' | 'waiting';

interface SubAgent {
  name: string;
  task: string;
  isActive: boolean;
}

interface SessionCard {
  id: string;
  title: string;
  updated: string;
  status: CardStatus;
  model: string;
  subAgents: SubAgent[];
  lastResponse: string[];
}

interface Lane {
  id: string;
  title: string;
  color: string;
  cards: SessionCard[];
}

const STATUS_GLYPH: Record<
  CardStatus,
  {glyph: string; color: string; label: string}
> = {
  idle: {glyph: '○', color: TERM.dim, label: 'Idle'},
  processing: {glyph: '●', color: TERM.green, label: 'Active'},
  waiting: {glyph: '●', color: TERM.yellow, label: 'Your turn'},
};

const KEY_HINTS: ReadonlyArray<[string, string]> = [
  ['wasd', 'move'],
  ['1-4', 'lanes'],
  ['/', 'search'],
  ['n', 'new'],
  ['enter', 'open'],
  ['q', 'quit'],
];

const LANES: Lane[] = [
  {
    id: 'backlog',
    title: 'Backlog',
    color: TERM.dim,
    cards: [
      {
        id: 'bk-1',
        title: 'Refactor session store',
        updated: '1d ago',
        status: 'idle',
        model: 'relay-core',
        subAgents: [],
        lastResponse: [
          'Sketched the plan but have not started:',
          '- split store.ts into reader/writer',
          '- move dedupe into the writer path',
          '- keep the public API unchanged',
          'Estimated ~40 files touched.',
          'Say "go" and I will begin with tests.',
        ],
      },
      {
        id: 'bk-2',
        title: 'Add retry to webhook sender',
        updated: '2d ago',
        status: 'idle',
        model: 'relay-mini',
        subAgents: [],
        lastResponse: [
          'Queued. Current sender drops on 5xx.',
          'Proposal: exponential backoff, 3 tries,',
          'jitter capped at 30s, then dead-letter.',
          'Needs a decision on the DLQ topic name',
          'before I write code.',
          'No files changed yet.',
        ],
      },
      {
        id: 'bk-3',
        title: 'Investigate flaky e2e: checkout',
        updated: '3d ago',
        status: 'idle',
        model: 'relay-core',
        subAgents: [],
        lastResponse: [
          'Repro rate is ~1 in 14 runs locally.',
          'Suspect the cart total races the price',
          'refetch — the wait is on the wrong node.',
          'Next step: add a deterministic clock to',
          'the fixture and re-run 50x in CI.',
          'Parked until Active slots free up.',
        ],
      },
      {
        id: 'bk-4',
        title: 'Write RFC: multi-node routing',
        updated: '5d ago',
        status: 'idle',
        model: 'relay-ultra',
        subAgents: [],
        lastResponse: [
          'Outline drafted (6 sections).',
          'Open questions:',
          '- sticky sessions vs stateless relay',
          '- how failover interacts with queues',
          'Want me to circulate the outline first',
          'or write the full draft?',
        ],
      },
    ],
  },
  {
    id: 'active',
    title: 'Active',
    color: TERM.green,
    cards: [
      {
        id: 'ac-1',
        title: 'Ship context meter',
        updated: '3h ago',
        status: 'processing',
        model: 'relay-ultra',
        subAgents: [
          {
            name: 'tokenizer-probe',
            task: 'counting prompt tokens',
            isActive: true,
          },
          {name: 'meter-ui', task: 'writing the header meter', isActive: true},
        ],
        lastResponse: [
          'Meter renders in the session header.',
          '- fill turns amber past 70% usage',
          '- popover breaks usage down by source',
          'tokenizer-probe is validating counts',
          'against 12 recorded transcripts.',
          'Next: wire compaction warning at 85%.',
        ],
      },
      {
        id: 'ac-2',
        title: 'Fix flaky deploy checks',
        updated: '12m ago',
        status: 'processing',
        model: 'relay-ultra',
        subAgents: [
          {name: 'ci-watcher', task: 'tailing run #4128', isActive: true},
        ],
        lastResponse: [
          'Root cause: the runner image moved to',
          'Node 20.19 and corepack now resolves a',
          'newer pnpm that rejects the lockfile.',
          'Pinned both jobs to .nvmrc and kicked a',
          'rerun of the failed build job.',
          'ci-watcher will report the verdict.',
        ],
      },
      {
        id: 'ac-3',
        title: 'Migrate lockfile to pnpm 9',
        updated: '41m ago',
        status: 'processing',
        model: 'relay-core',
        subAgents: [],
        lastResponse: [
          'Regenerated pnpm-lock.yaml under 9.1.',
          '3 peer warnings remain (eslint plugins).',
          'Running the full test suite now —',
          '412 of 638 specs green so far.',
          'Will open the PR when the suite passes',
          'and CI agrees with the local run.',
        ],
      },
      {
        id: 'ac-4',
        title: 'Bump sandbox base image',
        updated: '2h ago',
        status: 'processing',
        model: 'relay-mini',
        subAgents: [],
        lastResponse: [
          'Built sandbox-base:2026.07 with the new',
          'glibc and re-ran the smoke matrix.',
          'One regression: headless chrome needs',
          'libnss3 pinned — added to the image.',
          'Rebuilding now; ETA a few minutes.',
          'No action needed from you yet.',
        ],
      },
    ],
  },
  {
    id: 'your-turn',
    title: 'Your Turn',
    color: TERM.yellow,
    cards: [
      {
        id: 'yt-1',
        title: 'Review: pin workflow to .nvmrc',
        updated: '2h ago',
        status: 'waiting',
        model: 'relay-ultra',
        subAgents: [],
        lastResponse: [
          'PR #482 is ready for your review.',
          '- 2 files changed, +4 -4',
          '- both jobs now read node-version-file',
          '- actionlint passes, rerun went green',
          'Merge it and I will watch the next',
          'three deploys for regressions.',
        ],
      },
      {
        id: 'yt-2',
        title: 'Approve prod migration plan',
        updated: '5h ago',
        status: 'waiting',
        model: 'relay-ultra',
        subAgents: [
          {name: 'schema-diff', task: 'verified 0 destructive ops', isActive: false},
        ],
        lastResponse: [
          'Plan: 3 online migrations, no locks.',
          'schema-diff confirms zero destructive',
          'operations and a clean rollback path.',
          'Window suggestion: Tue 06:00 UTC.',
          'I need an explicit yes before touching',
          'the production database.',
        ],
      },
      {
        id: 'yt-3',
        title: 'Answer: which regions first?',
        updated: '1d ago',
        status: 'waiting',
        model: 'relay-core',
        subAgents: [],
        lastResponse: [
          'Rollout is staged and paused on you.',
          'Option A: eu-west first (lowest QPS).',
          'Option B: us-east first (best canary',
          'coverage, higher blast radius).',
          'I lean A, then B after 24h of clean',
          'metrics. Reply "A" or "B" to proceed.',
        ],
      },
      {
        id: 'yt-4',
        title: 'Choose eval label taxonomy',
        updated: '2d ago',
        status: 'waiting',
        model: 'relay-mini',
        subAgents: [],
        lastResponse: [
          'Two candidate taxonomies drafted:',
          '- 16-label failure-mode set (fine)',
          '- 6-label coarse set (fast to tag)',
          'The 16-label set doubles tagging time',
          'but makes the failure dashboard useful.',
          'Pick one and I will backfill 214 tags.',
        ],
      },
    ],
  },
  {
    id: 'archived',
    title: 'Archived',
    color: TERM.blue,
    cards: [],
  },
];

// Default selection: the flagship Active card with two live sub-agents.
const DEFAULT_FOCUS = {lane: 1, card: 0};

// ============= HOOKS =============

// Local ResizeObserver width hook: the demo renders pages in an inline
// stage narrower than the window, so viewport media queries never fire.
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

// ============= PIECES =============

function KeyHint({keys, label}: {keys: string; label: string}) {
  return (
    <span>
      <span style={styles.hintKey}>{keys}</span>
      <span style={styles.hintLabel}>: {label}</span>
    </span>
  );
}

function CardRow({
  card,
  isSelected,
  onSelect,
}: {
  card: SessionCard;
  isSelected: boolean;
  onSelect: () => void;
}) {
  const dot = STATUS_GLYPH[card.status];
  const activeSubAgents = card.subAgents.filter(agent => agent.isActive).length;
  return (
    <button
      type="button"
      aria-pressed={isSelected}
      style={isSelected ? {...styles.card, ...styles.cardSelected} : styles.card}
      onClick={onSelect}>
      <span style={styles.cardLine1}>
        <span style={{color: isSelected ? TERM.cyan : TERM.dim}}>
          {isSelected ? '❯' : '▸'}
        </span>
        <span style={{color: dot.color}}>{dot.glyph}</span>
        <span style={styles.cardTitle}>{card.title}</span>
      </span>
      <span style={styles.cardLine2}>
        <span>{card.updated}</span>
        {activeSubAgents > 0 && (
          <span>
            <span style={{color: TERM.green}}>● </span>
            <span>↳{activeSubAgents}</span>
          </span>
        )}
      </span>
    </button>
  );
}

function DetailPanel({card}: {card: SessionCard | null}) {
  return (
    <div style={styles.detail}>
      <span style={{...styles.laneTitle, color: TERM.dim}}>Detail</span>
      {card == null ? (
        <div style={styles.detailEmpty}>no session in this lane</div>
      ) : (
        <>
          <div style={styles.detailTitle}>{card.title}</div>
          <div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Status</span>
              <span style={{color: STATUS_GLYPH[card.status].color}}>
                {STATUS_GLYPH[card.status].glyph}{' '}
                {STATUS_GLYPH[card.status].label}
              </span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Updated</span>
              <span>{card.updated}</span>
            </div>
            <div style={styles.metaRow}>
              <span style={styles.metaLabel}>Model</span>
              <span style={{color: TERM.magenta}}>{card.model}</span>
            </div>
          </div>
          <div>
            <div style={styles.sectionLabel}>
              Sub-agents ({card.subAgents.length})
            </div>
            {card.subAgents.length === 0 ? (
              <div style={styles.subAgentRow}>
                <span style={{color: TERM.dim}}>◦</span>
                <span style={{color: TERM.dim}}>none</span>
              </div>
            ) : (
              card.subAgents.map(agent => (
                <div key={agent.name} style={styles.subAgentRow}>
                  <span style={{color: agent.isActive ? TERM.green : TERM.dim}}>
                    {agent.isActive ? '●' : '◦'}
                  </span>
                  <span>{agent.name}</span>
                  <span style={{color: TERM.dim}}>— {agent.task}</span>
                </div>
              ))
            )}
          </div>
          <div>
            <div style={styles.sectionLabel}>Last response</div>
            <div style={styles.lastResponse}>{card.lastResponse.join('\\n')}</div>
          </div>
        </>
      )}
      <div style={styles.detailFooter}>
        <KeyHint keys="enter" label="open chat" />
        <KeyHint keys="esc" label="back to kanban" />
      </div>
    </div>
  );
}

// ============= PAGE =============

export default function TuiKanbanBoardTemplate() {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const wrapWidth = useElementWidth(wrapRef);
  const isCompact = wrapWidth > 0 && wrapWidth <= 900;

  const [focus, setFocus] = useState(DEFAULT_FOCUS);
  const [isStageFocused, setIsStageFocused] = useState(false);

  const selectedCard: SessionCard | null =
    LANES[focus.lane]?.cards[focus.card] ?? null;

  // Move to another lane, clamping the card index into the target lane
  // (an empty lane focuses the lane itself with no card).
  const focusLane = (laneIndex: number) => {
    const lane = LANES[laneIndex];
    if (lane == null) {
      return;
    }
    setFocus(prev => ({
      lane: laneIndex,
      card:
        lane.cards.length === 0
          ? -1
          : Math.min(Math.max(prev.card, 0), lane.cards.length - 1),
    }));
  };

  const moveLane = (delta: number) => {
    focusLane(Math.min(Math.max(focus.lane + delta, 0), LANES.length - 1));
  };

  const moveCard = (delta: number) => {
    const lane = LANES[focus.lane];
    if (lane == null || lane.cards.length === 0) {
      return;
    }
    setFocus(prev => ({
      lane: prev.lane,
      card: Math.min(Math.max(prev.card + delta, 0), lane.cards.length - 1),
    }));
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.metaKey || event.ctrlKey || event.altKey) {
      return;
    }
    const key = event.key.toLowerCase();
    if (key === 'arrowleft' || key === 'a') {
      moveLane(-1);
    } else if (key === 'arrowright' || key === 'd') {
      moveLane(1);
    } else if (key === 'arrowup' || key === 'w') {
      moveCard(-1);
    } else if (key === 'arrowdown' || key === 's') {
      moveCard(1);
    } else if (key >= '1' && key <= '4') {
      focusLane(Number(key) - 1);
    } else {
      return;
    }
    event.preventDefault();
  };

  return (
    <div ref={wrapRef} style={styles.backdrop}>
      <div style={styles.stageColumn}>
        <div
          role="group"
          aria-label="Terminal kanban board — arrow keys or wasd move focus, 1-4 jump lanes"
          tabIndex={0}
          style={
            isStageFocused
              ? {...styles.stage, ...styles.stageFocused}
              : styles.stage
          }
          onKeyDown={handleKeyDown}
          onFocus={() => setIsStageFocused(true)}
          onBlur={() => setIsStageFocused(false)}>
          {/* Header: brand + yellow-key/gray-label hint strip. */}
          <div style={styles.headerRow}>
            <span style={styles.brand}>⌘ Kanban</span>
            <span style={styles.hintStrip}>
              {KEY_HINTS.map(([keys, label]) => (
                <KeyHint key={keys} keys={keys} label={label} />
              ))}
            </span>
          </div>

          <div style={isCompact ? styles.mainCompact : styles.mainWide}>
            {/* Four bordered lanes; the focused lane gets a thick colored
                border and a colored legend title. */}
            <div style={isCompact ? styles.lanesCompact : styles.lanesWide}>
              {LANES.map((lane, laneIndex) => {
                const isLaneFocused = laneIndex === focus.lane;
                return (
                  <div
                    key={lane.id}
                    style={{
                      ...styles.lane,
                      ...(isLaneFocused
                        ? {
                            borderColor: lane.color,
                            boxShadow: \`0 0 0 1px \${lane.color}\`,
                          }
                        : null),
                    }}>
                    <span
                      style={{
                        ...styles.laneTitle,
                        color: isLaneFocused ? lane.color : TERM.dim,
                        fontWeight: isLaneFocused ? 700 : 400,
                      }}>
                      {lane.title} ({lane.cards.length})
                    </span>
                    <div style={styles.laneBody}>
                      {lane.cards.length === 0 ? (
                        <div style={styles.laneEmpty}>empty</div>
                      ) : (
                        lane.cards.map((card, cardIndex) => (
                          <CardRow
                            key={card.id}
                            card={card}
                            isSelected={
                              isLaneFocused && cardIndex === focus.card
                            }
                            onSelect={() =>
                              setFocus({lane: laneIndex, card: cardIndex})
                            }
                          />
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <DetailPanel card={selectedCard} />
          </div>
        </div>

        {/* Token-styled caption row: names the surface in demo chrome. */}
        <HStack gap={2} vAlign="center" hAlign="center">
          <Text type="supporting" color="secondary">
            Terminal Kanban — agent session board. Click the board, then use
          </Text>
          <Kbd keys="w+a+s+d" />
          <Text type="supporting" color="secondary">
            or arrow keys to move; 1-4 jump lanes.
          </Text>
        </HStack>
      </div>
    </div>
  );
}
`;export{e as default};