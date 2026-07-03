import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Candidate Profile & Scorecards',
  description:
    'Single-candidate detail surface of an ATS for an onsite-stage candidate (Kestrel Labs REQ-1042, Senior Platform Engineer): a breadcrumbed action header with Advance-to-Offer and MoreMenu; an identity band with source token, recruiter and hiring-manager chips, scorecard star average, and an Applied → Hired stage stepper with per-stage entry dates; a static styled resume-excerpt Card with skills chips; an interview-loop panel of four rows (interviewer avatar, focus, scheduled time, submitted/pending scorecard token) with a scorecards-in progress header and debrief footer; a submitted-scorecard detail with a SegmentedControl across the three submitted cards, per-competency rating dots on the 1–4 rubric, an overall recommend pill, and a written excerpt; and an end rail with the offer-prep Card (proposed base vs the L5 Remote-US band on a marker bar, cash rows, three-step approval chain) above an entity-anchored activity timeline. Choose over hr-recruiting-pipeline when the job is reviewing one candidate’s interview evidence and preparing the offer rather than moving cards across stages, and over hr-employee-profile when the person is still a candidate, not an employee of record.',
  category: 'Workforce HR',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Breadcrumbs',
    'Button',
    'Card',
    'Divider',
    'Icon',
    'Layout',
    'MoreMenu',
    'ProgressBar',
    'SegmentedControl',
    'StatusDot',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
