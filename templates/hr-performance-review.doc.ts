import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Performance Review Authoring',
  description:
    'Manager-side review-writing surface for a workforce platform (Kestrel Labs H1 2026 cycle): a cycle header with due-date chip and 3-of-6-submitted progress bar; a reports rail with per-review status badges and a pinned cycle checklist; a review document for the active report with five competency rows rated on 1–5 segmented scales carrying a dashed ghost ring for the last-cycle rating and a delta readout, Strengths/Growth TextAreas with live word-count hints gating a confirm-to-submit flow, and an OKR-derived goal-outcomes list with attainment pills and a weighted-attainment summary; plus an end rail of peer-feedback quotes (received vs still-requested with reminder actions) above a pinned calibration-status note. Choose over review-cycle-calibration when the job is one manager authoring a single report’s review — ratings, narrative, and peer evidence — not placing an org on a 9-box calibration grid.',
  category: 'Workforce HR',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Breadcrumbs',
    'Button',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'List',
    'MetadataList',
    'ProgressBar',
    'Selector',
    'StackItem',
    'Text',
    'TextArea',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
