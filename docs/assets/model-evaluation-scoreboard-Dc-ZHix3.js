var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic Evalmark fixtures only: five work items, four stage
 *   counters, fixed due labels, and six-point trend arrays. No Date.now(),
 *   no Math.random(), no timers, and no network assets.
 * @output Model Evaluation Scoreboard: Model evaluation scoreboard for benchmark runs, judge disagreement, regression slices, and release gates.
 * @position Page template; emitted by \`astryx template model-evaluation-scoreboard\`
 *
 * Frame: Layout height="fill" with a fixed 264px command rail, a minmax(0,1fr)
 *   queue column, and a 320px detail inspector. The rail owns filters and
 *   derived counters; the queue owns 56px dense rows; the inspector owns the
 *   selected item timeline and actions.
 * Responsive contract: below 980px the inspector drops under the queue while
 *   the command rail stays first; below 700px the frame becomes a single
 *   column, filters wrap, all buttons stay at least 40px tall, and row
 *   metadata truncates instead of widening the page.
 * Container policy: rows, rails, and panels only; repeated cards are reserved
 *   for metrics and stage counters. The page body is a full-width work surface,
 *   not a marketing layout.
 * Fixture policy: selecting filters and rows is local state. Advancing a row
 *   mutates the single item store and re-derives risk counts, readiness, the
 *   stage strip, and detail copy in the same render.
 */

import {useState, type CSSProperties} from 'react';

import {Layout, LayoutContent, LayoutHeader} from '@astryxdesign/core/Layout';
import {
  ActivityIcon, AlertTriangleIcon, ArrowRightIcon, CheckCircle2Icon, Clock3Icon, FilterIcon, ListChecksIcon, RotateCcwIcon,
} from 'lucide-react';

type WorkState = 'risk' | 'review' | 'ready';

type WorkItem = {
  id: string;
  title: string;
  owner: string;
  state: WorkState;
  progress: number;
  metric: string;
  due: string;
  detail: string;
  points: number[];
};

type Stage = {
  label: string;
  count: number;
  tone: 'neutral' | WorkState;
};

const SCOPE = "tpl-model-evaluation-scoreboard";
const BRAND = "Evalmark";

const INITIAL_ITEMS: WorkItem[] = [
  {
    "id": "item-01",
    "title": "Model priority packet",
    "owner": "Owen Ellis",
    "state": "risk",
    "progress": 48,
    "metric": "6 blockers",
    "due": "Today 2:00 PM",
    "detail": "Needs owner confirmation, evidence refresh, and a final evaluation check before the handoff can leave review.",
    "points": [
      22,
      39,
      31,
      48,
      51,
      63
    ]
  },
  {
    "id": "item-02",
    "title": "Evalmark exception sweep",
    "owner": "Leah Chen",
    "state": "review",
    "progress": 59,
    "metric": "11 queued",
    "due": "Tomorrow 10:30 AM",
    "detail": "Combines fresh queue movement with stale exceptions so the detail pane exposes drift instead of hiding it in aggregate totals.",
    "points": [
      18,
      28,
      44,
      40,
      58,
      70
    ]
  },
  {
    "id": "item-03",
    "title": "Evaluation readiness lane",
    "owner": "Iris Cole",
    "state": "ready",
    "progress": 75,
    "metric": "87% ready",
    "due": "Fri 4:00 PM",
    "detail": "All required fields reconcile; remaining work is sequencing, stakeholder acknowledgement, and export packaging.",
    "points": [
      40,
      52,
      58,
      67,
      73,
      86
    ]
  },
  {
    "id": "item-04",
    "title": "Evalmark owner follow-up",
    "owner": "Drew Patel",
    "state": "risk",
    "progress": 52,
    "metric": "3 handoffs",
    "due": "Mon 9:15 AM",
    "detail": "Long-label stress case: cross-functional ownership remains visible while the row keeps actions and metrics inside fixed hit zones.",
    "points": [
      16,
      21,
      32,
      49,
      51,
      60
    ]
  },
  {
    "id": "item-05",
    "title": "Model signed-off path",
    "owner": "Marcus Lee",
    "state": "ready",
    "progress": 83,
    "metric": "18 artifacts",
    "due": "Next Tue",
    "detail": "Serves as the stable control row: derived counts, timeline marks, and the detail chart should not move when filters change.",
    "points": [
      44,
      49,
      61,
      68,
      78,
      91
    ]
  }
];

const STAGES: Stage[] = [
  {
    "label": "Intake",
    "count": 15,
    "tone": "neutral"
  },
  {
    "label": "Review",
    "count": 10,
    "tone": "review"
  },
  {
    "label": "Blocked",
    "count": 3,
    "tone": "risk"
  },
  {
    "label": "Ready",
    "count": 10,
    "tone": "ready"
  }
];

const FILTERS: Array<{id: WorkState | 'all'; label: string}> = [
  {id: 'all', label: 'All'},
  {id: 'risk', label: 'At risk'},
  {id: 'review', label: 'Review'},
  {id: 'ready', label: 'Ready'},
];

const STATE_LABELS: Record<WorkState, string> = {
  "risk": "At risk",
  "review": "In review",
  "ready": "Ready"
};

const NEXT_STATE: Record<WorkState, WorkState> = {
  risk: 'review',
  review: 'ready',
  ready: 'ready',
};

const TEMPLATE_CSS = \`
.tpl-model-evaluation-scoreboard {
  --template-accent: light-dark(#7C3AED, #C4B5FD);
  --template-accent-muted: light-dark(color-mix(in srgb, #7C3AED 12%, white), color-mix(in srgb, #C4B5FD 18%, #111));
  color: var(--color-text-primary);
  font-family: var(--font-family-sans, system-ui, sans-serif);
}
.tpl-model-evaluation-scoreboard.topbar {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  gap: var(--spacing-3);
  justify-content: space-between;
  min-height: 56px;
  padding: var(--spacing-2) var(--spacing-4);
}
.tpl-model-evaluation-scoreboard .titleCluster {
  align-items: center;
  display: flex;
  gap: var(--spacing-3);
  min-width: 0;
}
.tpl-model-evaluation-scoreboard .mark {
  align-items: center;
  background: var(--template-accent);
  border-radius: 8px;
  color: var(--color-on-accent, #fff);
  display: inline-flex;
  flex: none;
  height: 36px;
  justify-content: center;
  width: 36px;
}
.tpl-model-evaluation-scoreboard h1,
.tpl-model-evaluation-scoreboard h2,
.tpl-model-evaluation-scoreboard h3,
.tpl-model-evaluation-scoreboard p {
  margin: 0;
}
.tpl-model-evaluation-scoreboard h1 {
  font-size: 17px;
  font-weight: 700;
  letter-spacing: 0;
  line-height: 1.2;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-model-evaluation-scoreboard .eyebrow {
  color: var(--color-text-secondary);
  font-size: 12px;
  line-height: 1.3;
}
.tpl-model-evaluation-scoreboard.workspace {
  background: var(--color-background-body);
  display: grid;
  gap: var(--spacing-3);
  grid-template-columns: 264px minmax(0, 1fr) 320px;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  padding: var(--spacing-3);
}
.tpl-model-evaluation-scoreboard .panel,
.tpl-model-evaluation-scoreboard .metricCard,
.tpl-model-evaluation-scoreboard .rowButton,
.tpl-model-evaluation-scoreboard .detailBlock {
  background: var(--color-background-card);
  border: var(--border-width) solid var(--color-border);
  border-radius: 8px;
}
.tpl-model-evaluation-scoreboard .panel {
  display: flex;
  flex-direction: column;
  min-height: 0;
  overflow: hidden;
}
.tpl-model-evaluation-scoreboard .panelHeader {
  align-items: center;
  border-bottom: var(--border-width) solid var(--color-border);
  display: flex;
  gap: var(--spacing-2);
  justify-content: space-between;
  min-height: 44px;
  padding: var(--spacing-3);
}
.tpl-model-evaluation-scoreboard .panelTitle {
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0;
}
.tpl-model-evaluation-scoreboard .railBody,
.tpl-model-evaluation-scoreboard .queueBody,
.tpl-model-evaluation-scoreboard .detailBody {
  display: grid;
  gap: var(--spacing-3);
  min-height: 0;
  overflow: auto;
  padding: var(--spacing-3);
}
.tpl-model-evaluation-scoreboard .metricGrid {
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: repeat(2, minmax(0, 1fr));
}
.tpl-model-evaluation-scoreboard .metricCard {
  display: grid;
  gap: 2px;
  padding: var(--spacing-3);
}
.tpl-model-evaluation-scoreboard .metricValue {
  font-size: 22px;
  font-variant-numeric: tabular-nums;
  font-weight: 750;
  line-height: 1;
}
.tpl-model-evaluation-scoreboard .metricLabel {
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1.3;
}
.tpl-model-evaluation-scoreboard .filterGrid {
  display: grid;
  gap: var(--spacing-2);
}
.tpl-model-evaluation-scoreboard button {
  font: inherit;
}
.tpl-model-evaluation-scoreboard .filterButton,
.tpl-model-evaluation-scoreboard .actionButton,
.tpl-model-evaluation-scoreboard .ghostButton {
  align-items: center;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  gap: var(--spacing-2);
  min-height: 40px;
}
.tpl-model-evaluation-scoreboard .filterButton {
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-primary);
  justify-content: space-between;
  padding: 0 var(--spacing-3);
  text-align: left;
}
.tpl-model-evaluation-scoreboard .filterButton[aria-pressed="true"] {
  background: var(--template-accent-muted);
  border-color: var(--template-accent);
}
.tpl-model-evaluation-scoreboard .actionButton {
  background: var(--template-accent);
  border: 0;
  color: var(--color-on-accent, #fff);
  justify-content: center;
  padding: 0 var(--spacing-3);
}
.tpl-model-evaluation-scoreboard .ghostButton {
  background: transparent;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-primary);
  justify-content: center;
  padding: 0 var(--spacing-3);
}
.tpl-model-evaluation-scoreboard .stageList,
.tpl-model-evaluation-scoreboard .rowList,
.tpl-model-evaluation-scoreboard .timeline {
  display: grid;
  gap: var(--spacing-2);
  list-style: none;
  margin: 0;
  padding: 0;
}
.tpl-model-evaluation-scoreboard .stageItem {
  align-items: center;
  display: grid;
  gap: var(--spacing-2);
  grid-template-columns: minmax(0, 1fr) auto;
}
.tpl-model-evaluation-scoreboard .stageTrack {
  background: var(--color-background-muted);
  border-radius: 999px;
  height: 7px;
  overflow: hidden;
}
.tpl-model-evaluation-scoreboard .stageFill {
  background: var(--template-accent);
  height: 100%;
}
.tpl-model-evaluation-scoreboard .rowButton {
  align-items: center;
  color: inherit;
  cursor: pointer;
  display: grid;
  gap: var(--spacing-3);
  grid-template-columns: 40px minmax(0, 1fr) auto;
  min-height: 64px;
  padding: var(--spacing-2) var(--spacing-3);
  text-align: left;
  width: 100%;
}
.tpl-model-evaluation-scoreboard .rowButton[aria-pressed="true"] {
  border-color: var(--template-accent);
  box-shadow: inset 3px 0 0 var(--template-accent);
}
.tpl-model-evaluation-scoreboard .rowGlyph {
  align-items: center;
  background: var(--color-background-muted);
  border-radius: 8px;
  display: inline-flex;
  height: 40px;
  justify-content: center;
  width: 40px;
}
.tpl-model-evaluation-scoreboard .rowMain,
.tpl-model-evaluation-scoreboard .detailCopy {
  display: grid;
  gap: 3px;
  min-width: 0;
}
.tpl-model-evaluation-scoreboard .rowTitle {
  font-size: 14px;
  font-weight: 650;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-model-evaluation-scoreboard .rowMeta {
  color: var(--color-text-secondary);
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.tpl-model-evaluation-scoreboard .statePill {
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-secondary);
  font-size: 11px;
  line-height: 1;
  padding: 5px 8px;
  white-space: nowrap;
}
.tpl-model-evaluation-scoreboard .progressTrack {
  background: var(--color-background-muted);
  border-radius: 999px;
  height: 8px;
  overflow: hidden;
}
.tpl-model-evaluation-scoreboard .progressFill {
  background: var(--template-accent);
  height: 100%;
}
.tpl-model-evaluation-scoreboard .detailBlock {
  display: grid;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
}
.tpl-model-evaluation-scoreboard .detailTitle {
  font-size: 18px;
  font-weight: 750;
  letter-spacing: 0;
}
.tpl-model-evaluation-scoreboard .chart {
  background: var(--color-background-muted);
  border-radius: 8px;
  height: 118px;
  overflow: hidden;
  width: 100%;
}
.tpl-model-evaluation-scoreboard .timeline li {
  border-left: 2px solid var(--color-border);
  display: grid;
  gap: 2px;
  padding: 0 0 var(--spacing-2) var(--spacing-3);
}
.tpl-model-evaluation-scoreboard .timeline strong {
  font-size: 12px;
}
.tpl-model-evaluation-scoreboard .timeline span {
  color: var(--color-text-secondary);
  font-size: 12px;
}
.tpl-model-evaluation-scoreboard .topActions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: var(--spacing-2);
}
@media (max-width: 980px) {
  .tpl-model-evaluation-scoreboard.workspace {
    grid-template-columns: 240px minmax(0, 1fr);
    overflow: auto;
  }
  .tpl-model-evaluation-scoreboard .detailPanel {
    grid-column: 1 / -1;
    min-height: 420px;
  }
}
@media (max-width: 700px) {
  .tpl-model-evaluation-scoreboard.topbar {
    align-items: flex-start;
    flex-direction: column;
  }
  .tpl-model-evaluation-scoreboard.workspace {
    grid-template-columns: minmax(0, 1fr);
  }
  .tpl-model-evaluation-scoreboard .rowButton {
    grid-template-columns: 36px minmax(0, 1fr);
  }
  .tpl-model-evaluation-scoreboard .statePill {
    grid-column: 2;
    justify-self: start;
  }
}
\`;

function countState(items: WorkItem[], state: WorkState): number {
  return items.filter(item => item.state === state).length;
}

function stateIcon(state: WorkState) {
  if (state === 'risk') return <AlertTriangleIcon size={18} />;
  if (state === 'ready') return <CheckCircle2Icon size={18} />;
  return <Clock3Icon size={18} />;
}

function stageWidth(stage: Stage): string {
  return String(Math.min(100, stage.count * 7)) + '%';
}

export default function ModelEvaluationScoreboardTemplate() {
  const [items, setItems] = useState<WorkItem[]>(INITIAL_ITEMS);
  const [filter, setFilter] = useState<WorkState | 'all'>('all');
  const [selectedId, setSelectedId] = useState(INITIAL_ITEMS[0]!.id);

  const selectedItem = items.find(item => item.id === selectedId) ?? items[0]!;
  const visibleItems =
    filter === 'all' ? items : items.filter(item => item.state === filter);
  const averageProgress = Math.round(
    items.reduce((sum, item) => sum + item.progress, 0) / items.length,
  );
  const riskCount = countState(items, 'risk');
  const readyCount = countState(items, 'ready');

  function advanceSelected() {
    setItems(current =>
      current.map(item =>
        item.id === selectedItem.id
          ? {
              ...item,
              progress: Math.min(100, item.progress + 14),
              state: NEXT_STATE[item.state],
              metric:
                item.state === 'ready'
                  ? item.metric
                  : 'advanced ' + String(item.progress + 14) + '%',
            }
          : item,
      ),
    );
  }

  return (
    <Layout height="fill">
      <style>{TEMPLATE_CSS}</style>
      <LayoutHeader>
        <div className={SCOPE + ' topbar'}>
          <div className="titleCluster">
            <span className="mark" aria-hidden="true">
              <ActivityIcon size={20} />
            </span>
            <div style={{minWidth: 0} as CSSProperties}>
              <p className="eyebrow">{BRAND} / AI</p>
              <h1>Model Evaluation Scoreboard</h1>
            </div>
          </div>
          <div className="topActions">
            <button className="ghostButton" type="button" onClick={() => setItems(INITIAL_ITEMS)}>
              <RotateCcwIcon size={16} /> Reset
            </button>
            <button className="actionButton" type="button" onClick={advanceSelected}>
              Advance selected <ArrowRightIcon size={16} />
            </button>
          </div>
        </div>
      </LayoutHeader>
      <LayoutContent>
        <div className={SCOPE + ' workspace'}>
          <section className="panel" aria-label="Model Evaluation Scoreboard command rail">
            <div className="panelHeader">
              <p className="panelTitle">Command rail</p>
              <FilterIcon size={16} />
            </div>
            <div className="railBody">
              <div className="metricGrid">
                <div className="metricCard">
                  <span className="metricValue">{averageProgress}%</span>
                  <span className="metricLabel">Avg readiness</span>
                </div>
                <div className="metricCard">
                  <span className="metricValue">{riskCount}</span>
                  <span className="metricLabel">At risk</span>
                </div>
                <div className="metricCard">
                  <span className="metricValue">{readyCount}</span>
                  <span className="metricLabel">Ready</span>
                </div>
                <div className="metricCard">
                  <span className="metricValue">{visibleItems.length}</span>
                  <span className="metricLabel">In view</span>
                </div>
              </div>
              <div className="filterGrid" aria-label="Queue filters">
                {FILTERS.map(option => (
                  <button
                    key={option.id}
                    aria-pressed={filter === option.id}
                    className="filterButton"
                    type="button"
                    onClick={() => setFilter(option.id)}>
                    <span>{option.label}</span>
                    <span>{option.id === 'all' ? items.length : countState(items, option.id)}</span>
                  </button>
                ))}
              </div>
              <ul className="stageList" aria-label="Stage counters">
                {STAGES.map(stage => (
                  <li className="stageItem" key={stage.label}>
                    <div>
                      <p className="rowTitle">{stage.label}</p>
                      <div className="stageTrack" aria-hidden="true">
                        <div className="stageFill" style={{width: stageWidth(stage)}} />
                      </div>
                    </div>
                    <span className="statePill">{stage.count}</span>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <section className="panel" aria-label="Model Evaluation Scoreboard queue">
            <div className="panelHeader">
              <p className="panelTitle">Work queue</p>
              <p className="eyebrow">{visibleItems.length} rows</p>
            </div>
            <div className="queueBody">
              <ul className="rowList">
                {visibleItems.map(item => (
                  <li key={item.id}>
                    <button
                      aria-pressed={selectedItem.id === item.id}
                      className="rowButton"
                      type="button"
                      onClick={() => setSelectedId(item.id)}>
                      <span className="rowGlyph" aria-hidden="true">
                        {stateIcon(item.state)}
                      </span>
                      <span className="rowMain">
                        <span className="rowTitle">{item.title}</span>
                        <span className="rowMeta">
                          {item.owner} / {item.metric} / {item.due}
                        </span>
                        <span className="progressTrack" aria-hidden="true">
                          <span className="progressFill" style={{width: String(item.progress) + '%'}} />
                        </span>
                      </span>
                      <span className="statePill">{STATE_LABELS[item.state]}</span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <aside className="panel detailPanel" aria-label="Model Evaluation Scoreboard detail inspector">
            <div className="panelHeader">
              <p className="panelTitle">Inspector</p>
              <ListChecksIcon size={16} />
            </div>
            <div className="detailBody">
              <div className="detailBlock">
                <div className="detailCopy">
                  <p className="eyebrow">{STATE_LABELS[selectedItem.state]} / {selectedItem.owner}</p>
                  <h2 className="detailTitle">{selectedItem.title}</h2>
                  <p className="rowMeta">{selectedItem.detail}</p>
                </div>
                <div className="progressTrack" aria-label="Selected progress">
                  <div className="progressFill" style={{width: String(selectedItem.progress) + '%'}} />
                </div>
              </div>
              <div className="detailBlock">
                <p className="panelTitle">Signal trend</p>
                <svg className="chart" viewBox="0 0 260 118" role="img" aria-label="Six point trend">
                  <polyline
                    fill="none"
                    points={selectedItem.points
                      .map((value, pointIndex) => String(pointIndex * 52) + ',' + String(100 - value * 0.72))
                      .join(' ')}
                    stroke="var(--template-accent)"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="4"
                  />
                  {selectedItem.points.map((value, pointIndex) => (
                    <circle
                      cx={pointIndex * 52}
                      cy={100 - value * 0.72}
                      fill="var(--color-background-card)"
                      key={String(pointIndex)}
                      r="4"
                      stroke="var(--template-accent)"
                      strokeWidth="2"
                    />
                  ))}
                </svg>
              </div>
              <div className="detailBlock">
                <p className="panelTitle">Next actions</p>
                <ul className="timeline">
                  <li>
                    <strong>Confirm owner</strong>
                    <span>{selectedItem.owner} owns the next visible handoff.</span>
                  </li>
                  <li>
                    <strong>Package evidence</strong>
                    <span>{selectedItem.metric} stays attached to the selected row.</span>
                  </li>
                  <li>
                    <strong>Advance status</strong>
                    <span>One update re-derives the rail, row, and inspector.</span>
                  </li>
                </ul>
              </div>
            </div>
          </aside>
        </div>
      </LayoutContent>
    </Layout>
  );
}
`;export{e as default};