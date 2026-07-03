import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Returns & Exchange',
  description:
    'Guided five-step return flow for a fixture order: per-item checkboxes with qty steppers, reason codes per item (fee-waiving reasons), refund / store-credit-with-bonus / exchange-with-variant-picker resolution, drop-off methods with fees, and a confirmation with a MetadataList summary plus a printable label or QR placeholder — all beside a live refund-summary panel.',
  category: 'Commerce - Returns & Exchange',
  componentsUsed: [
    'Badge',
    'Banner',
    'Button',
    'Card',
    'CheckboxInput',
    'Collapsible',
    'Divider',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'MetadataList',
    'RadioList',
    'Selector',
    'TextArea',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
