import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Recipe Cook Mode',
  description:
    "Recipe cook-mode surface for cooking along step by step: a left 300px ingredients rail with a 2/4/6/8 servings SegmentedControl that live-rescales every quantity with fraction-aware formatting ('1 1/2 cups', never 1.5), grouped section rows whose CheckboxInputs check off as prepped under a running 'N/14 prepped' Badge; a large center step card showing one active step — 'Step N of 9' eyebrow, clickable progress dots with completed dots dimmed, the step sentence with ingredient amounts inlined as tinted highlights that rescale with the rail, and embedded timer chips ('Simmer 20 min') that read live countdowns once tapped — advanced/rewound by Back/Next buttons, the dots, or an 'All 9 steps' Collapsible where completed rows dim; and a right 300px timer rail stacking concurrent countdown Cards (m:ss readout, elapsed ProgressBar, pause/resume, +1:00, dismiss) where finished timers flash green until dismissed. A Present toggle hides both rails and enlarges the step text with compact timer pills kept in view. Choose over form-wizard when the steps are a linear performance (cooking along, spawning timers) rather than data entry, and over onboarding-guided-install when quantities must rescale live instead of commands being copied.",
  category: 'Lifestyle - Recipe Cook Mode',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CheckboxInput',
    'Collapsible',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'List',
    'ProgressBar',
    'SegmentedControl',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
