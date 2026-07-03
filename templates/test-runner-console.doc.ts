import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Test Runner',
  description:
    'Test console for a vitest-style run: a header with colored passed/failed/skipped count clusters, mono wall-time readout, watch-mode Switch with pulsing StatusDot, and a "Re-run failed (N)" Button that replays failures through a fixed-outcome scripted resolver; a suite-tree rail whose file and describe rows carry status icons and mono pass/fail/skip counts and filter the stream; All / Failed / Slowest filter tabs over a run-stream panel of per-test rows with a Spinner row on the mid-run suite, dimmed queued rows, and duration bars on the Slowest tab; and a failure-detail panel (fullscreen Dialog on narrow screens) with the assertion message, a − expected / + received diff block, and a monospace stack trace with accent-tinted app paths and dimmed vendor frames. Choose over code-review-diff-queue when the subject is a TEST RUN — suites, assertions, stack traces — not reviewing file diffs; over logs-explorer when rows are per-test verdicts with failure drill-in, not a flat log tail.',
  category: 'Coding - Test Runner',
  componentsUsed: [
    'Badge',
    'Button',
    'Code',
    'Dialog',
    'EmptyState',
    'Icon',
    'Layout',
    'Selector',
    'Spinner',
    'StatusDot',
    'Switch',
    'TabList',
    'Text',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
