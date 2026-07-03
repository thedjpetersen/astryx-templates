import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Status & Feedback Gallery',
  description:
    "Four-panel UI-kit gallery of live page-state patterns: Alerts (info/success/warning/error Banners with dismiss, an update alert with working actions, a slim inline field alert that validates an email TextInput, and a full-width system outage bar — dismissals collect in a restore tray with per-item and 'Restore all' recovery), Empty states (first-run with a CSS-shape illustration and a CTA that resolves into a list, empty-search with clear-filters, error-with-retry that simulates a 1 s reload, and a dashed create-new drop target), Progress (one demo Slider drives a determinate ProgressBar, a 6-segment steps strip, and a conic-gradient percent ring, plus a 4-step checkout stepper with clickable completed steps), and Pagination (numbered-with-ellipsis over 24 fixture pages windowing a live invoice list, simple prev/next, load-more with a running count, and a compact table-footer Pagination with page-size selector). A header SegmentedControl (Selector on narrow screens) filters the panel stack. Choose this over a single-purpose page when the deliverable is a labeled catalog of alert/empty/progress/pagination specimens, and over notification-center when the subject is page-state patterns rather than an app-chrome tray.",
  category: 'UI Kit - Status & Feedback Gallery',
  componentsUsed: [
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'FieldStatus',
    'Grid',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'Link',
    'List',
    'Pagination',
    'ProgressBar',
    'SegmentedControl',
    'Selector',
    'Slider',
    'Spinner',
    'Text',
    'TextInput',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
