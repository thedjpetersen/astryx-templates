import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Performance Review Calibration',
  description:
    'Performance-review calibration surface with a docked reviewee roster (completion-status badges and a status filter), a 9-box performance-by-potential grid of draggable employee tiles under a live rating-distribution histogram with over-target cells flagged red, a finalize banner tracking changed placements with reset-to-original and finalize/reopen locking, and a review-packet panel with self and inline-editable manager ratings plus an appendable calibration-notes log.',
  category: 'Business - Performance Review Calibration',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'MoreMenu',
    'ProgressBar',
    'Selector',
    'TextArea',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
