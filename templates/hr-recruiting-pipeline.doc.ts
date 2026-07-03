import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Recruiting Pipeline (ATS)',
  description:
    'Applicant-tracking board for a single requisition (Kestrel Labs REQ-1042, Senior Platform Engineer): a req header with recruiter/hiring-manager avatar chips, interview-panel facepile, seats-filled badge, and target-close countdown with progress bar; a pipeline-health strip showing per-stage reached counts as a labeled funnel with pass-through rates vs target between stages; and five fixed-width stage columns (Applied, Screen, Onsite, Offer, Hired) of ClickableCard candidate tiles carrying source tokens, scorecard star averages, next-step chips, and days-in-stage with an amber stalled ring at 14+ days, plus per-column conversion footers, MoreMenu advance/reject, and fine-pointer drag-and-drop. Choose over kanban-board when the columns are hiring stages with conversion analytics and req governance rather than generic work-item lanes, and over onboarding surfaces when the person is still a candidate — this board ends where a signed hire starts onboarding.',
  category: 'Workforce HR',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'ClickableCard',
    'EmptyState',
    'Icon',
    'Layout',
    'MoreMenu',
    'ProgressBar',
    'SegmentedControl',
    'Selector',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
