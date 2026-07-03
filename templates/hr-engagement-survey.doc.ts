import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Engagement Survey Results',
  description:
    'Workforce-platform engagement-survey results readout (Kestrel Labs Q2 ’26 pulse, 140-person company): a response-rate header (118 of 140, 84%) with per-department progress rows, an eNPS arc gauge (+31, last-quarter tick at +24, benchmark +18) beside promoter/passive/detractor split bars (55/45/18), a 7-category score board on a labeled 1–5 scale with delta-vs-Q1 chips and tech-benchmark diamond markers, a by-team heat strip grouped by department with an anonymity threshold (teams under 5 respondents render locked "n<5 hidden" cells) and a Score / vs-benchmark view toggle, a driver-analysis callout linking the lowest category (Compensation confidence, 3.1) to a 2.4× regretted-attrition risk cohort, and a 340px top-themes panel (theme, sentiment token, excerpt count, anonymized quote) that scopes to the selected category row. Choose over poll-survey-builder when the job is reading a closed engagement program’s aggregated results — eNPS, benchmarks, anonymity thresholds, driver analysis — not authoring questions or previewing a respondent run; choose over review-cycle-calibration when the signal is company-wide sentiment and attrition risk, not per-employee performance calibration.',
  category: 'Workforce HR',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'SegmentedControl',
    'StackItem',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
