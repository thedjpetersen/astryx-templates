import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'FAQ & Contact Sections',
  description:
    'Marketing showcase of three FAQ section variants and three contact section variants over one fixture set (12 questions, 3 offices): a controlled single-column accordion with an expand-all/collapse-all Button, a two-column Q&A Grid live-filtered by a Billing/Product/Security SegmentedControl, an offset layout pairing a support-CTA Card with a one-open-at-a-time accordion, a split contact form beside selectable office Cards synced to a schematic CSS map, a centered simple form with a required topic Selector, and a support-channels Grid (chat, email, docs, status) with response-time Badge chips — both forms validate required fields on submit and swap to inline success panels with reset.',
  category: 'Marketing - FAQ & Contact Sections',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'FormLayout',
    'Grid',
    'Icon',
    'Layout',
    'SegmentedControl',
    'Selector',
    'TextArea',
    'TextInput',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
