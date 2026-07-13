import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'PR Verification Dashboard',
  description:
    'CI verification dashboard for agent-authored pull requests: a header with repo Selector and per-status summary chips (pulsing dot on Pending), and a SelectableCard PR list where each card carries an author Avatar, number + title, mono SHA, a verification Badge (Verified / Pending / Failed / No tests), a passed/failed caption, and a thin pass-rate ProgressBar tinted by threshold. Selecting a PR fills a 420px detail panel with per-test rows (mono names, tabular durations, ✓ ✗ ⚠ ⊘ glyphs) where failing rows expand via Collapsible into an error CodeBlock, plus a 30-day stacked SVG trend chart with hover readout; a dashed empty-state specimen closes the list. Choose over agent-events-dashboard when the story is per-PR test verification and merge gating, not event delivery.',
  category: 'AI Chat - CI Verification',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'CodeBlock',
    'Collapsible',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'Layout',
    'ProgressBar',
    'SelectableCard',
    'Selector',
    'Spinner',
    'StatusDot',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
