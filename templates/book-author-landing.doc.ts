import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Book Launch Landing',
  description:
    'Launch page for a technical book ("The Interface Layer" by an invented author): sticky anchor navbar, a split hero whose signature moment is a 3D CSS book cover with spine and page edges that sways idly and straightens on hover, invented pseudo-retailer buttons, a count-up stats band, a sample-chapter reader with three fixture pages, page-turn slides and a progress bar, a six-card learn grid expanding into a 12-chapter Collapsible outline, a five-quote praise wall, an author bio split with speaking/press chips, a three-format pricing row with a highlighted bundle and launch-week bonus list, a validating free-chapter email capture, and a footer with an ISBN mono row. Choose it over saas-landing-page when the surface is a single product launch (book, course, or artifact) rather than a multi-feature SaaS pitch.',
  category: 'Marketing - Book Launch Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'TextInput',
    'Toast',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
