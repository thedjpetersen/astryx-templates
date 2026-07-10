import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Library Hold Fulfillment',
  description:
    'Stacks pick-run console for library hold fulfillment: a run sheet of 56px item rows grouped under sticky stack-range headers with aisle-locator glyphs and a 14-cell walk-order run spine, beside a shelf-exception lane and a patron notice queue. Marking items pulled or not-on-shelf drives run progress, exception cards with found/transfer/cancel resolutions, and READY/TRANSIT/DELAY/CANCELLED notices sent in deterministic batches.',
  category: 'Tools - Library Pick-Run Console',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'LayoutPanel',
    'Badge',
    'Divider',
    'EmptyState',
    'Icon',
    'SegmentedControl',
    'Text',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
