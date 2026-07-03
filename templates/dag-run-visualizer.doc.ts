import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Pipeline DAG Run Visualizer',
  description:
    'Airflow-style orchestration console for a 9-task pipeline: the left rail lists recent runs with derived StatusDots, total task time, and an All/Failed SegmentedControl; the center paints the selected run as a task DAG of state-bordered node buttons over one SVG of cubic edges colored by downstream task state, and a bottom strip renders the run-history grid (tasks × runs) of tiny status cells with the selected run column tinted. Clicking a task opens the 340px panel (Dialog below 1024px) with a MetadataList, clickable attempt-history rows, and a canned mono log box; Retry and Mark success cascade queued → running → success down the DAG on a short interval and live re-derive the run dot; a Backfill Dialog picks a DateInput range and appends synthetic queued runs; a header Paused Switch gates backfills. Choose over scheduled-jobs-manager when the object is one DAG’s task graph and run matrix rather than a flat job list, and over git-branch-graph when nodes carry live per-run state and retry actions instead of immutable history.',
  category: 'Data - Pipeline DAG Run Visualizer',
  componentsUsed: [
    'Badge',
    'Button',
    'Code',
    'DateInput',
    'Dialog',
    'Divider',
    'EmptyState',
    'FieldStatus',
    'Heading',
    'Icon',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'StatusDot',
    'Switch',
    'Text',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
