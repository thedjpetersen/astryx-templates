import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Partner Onboarding Portal',
  description:
    'Partnerly integration portal for a partner engineer: a six-step milestone stepper rail with a live progress-arc glyph, an eight-test sandbox conformance console whose runs append scripted transcripts to a role="log" pane, and a credential vault whose production-key section is gated on all tests going green — running tests, applying documented remediations, and issuing credentials tick milestones, re-derive pass/fail chips and the readiness stat, and unlock the vault gate from one state owner.',
  category: 'SaaS - Partner Onboarding Portal',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'HStack',
    'VStack',
    'StackItem',
    'Heading',
    'Text',
    'Avatar',
    'Button',
    'Divider',
    'Icon',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
