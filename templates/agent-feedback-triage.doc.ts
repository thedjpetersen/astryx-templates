import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Feedback Triage Board',
  description:
    'Bug-report/feedback triage page for an AI agent product: a header with report counts and a compact 14-day SVG bar chart, a filter row of category ToggleButton chips with counts plus a status Selector, and ten SelectableCard report rows (category chip, 2-line description, reporter, paperclip screenshot count, status Badge, fix-owner Avatar). Selecting a row opens a detail panel with the full text, mono session-id link, screenshot Thumbnails, a status Selector with an Assign-to-me Button, and a timestamped activity log; filters really filter and status edits update the row Badge. Choose over error-events-monitor when the input is human feedback to triage, not automated error telemetry.',
  category: 'AI Chat - Feedback Triage',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Icon',
    'Layout',
    'Link',
    'SelectableCard',
    'Selector',
    'Text',
    'Thumbnail',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
