import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Email Campaign Builder',
  description:
    "Mailchimp-style campaign-orchestration console for Petrel Mail, a fictional email-marketing platform (goldenrod accent): a 288px step rail (Setup done, Audience active, Content, Schedule) whose per-step summary lines update live; an audience segment builder with three condition rows (field/operator/value Selectors joined by AND/OR SegmentedControls) driving a live '4,218 of 12,400 contacts match' chip; a content step with subject and preheader TextInputs, an inbox-preview line, and a scheme-locked-light styled newsletter mock (hero, articles, CTA, unsubscribe footer, missing-alt-text warning chips); a send-time optimizer Card recommending Tue 10:14 AM over an hourly open-rate histogram; an A/B subject test Card whose 20/80 split Slider reconciles recipient counts against the segment (844 + 3,374 = 4,218); and a pinned pre-send checklist strip (2 pass, 1 warning: missing alt text). Choose over newsletter-composer when the job is orchestrating a whole campaign send — segmenting the audience, split-testing subjects, and picking a send time around a fixed email — rather than assembling the email body itself from a block palette with an inspector.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'RadioList',
    'SegmentedControl',
    'Selector',
    'Slider',
    'StackItem',
    'Switch',
    'Text',
    'TextInput',
    'Toast',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
