import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Product Features & Reviews',
  description:
    'Below-the-fold PDP surface for one fixture product (a mechanical keyboard) with a SegmentedControl swapping three feature variants — alternating gradient-art image/spec rows, a two-column tech-spec MetadataList table under a highlights callout, and a Collapsible feature accordion with inline CSS diagrams — plus a full working reviews region: summary panel whose star-histogram bar buttons filter the list (clear-filter chip, EmptyState for empty bands), a recent/highest/lowest/most-helpful sort Selector, 12 reviews with verified-purchase Badges, photo-placeholder chips, and once-per-review helpful votes, a write-a-review form with star picker and validation that prepends the new review, and a sticky mini product header keeping price and add-to-cart in view.',
  category: 'Commerce - Product Features & Reviews',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Breadcrumbs',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'EmptyState',
    'FormLayout',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'Selector',
    'TextArea',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
