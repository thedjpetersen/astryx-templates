import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'API Platform Landing',
  description:
    'Full marketing landing page for a fictional shipping-rates API ("Parcelrate"): sticky navbar with smooth-scrolling anchors that collapse to a menu button at compact widths, a split hero pairing a validating get-API-key email capture with a live-looking request/response pane — a curl/Node/Python TabList swaps the request CodeBlock and a Send-request button stages a 600ms spinner before the JSON response rises in with a 200 OK badge and latency chip. Sections: endpoint showcase Table with method Badges, a requests/month Slider pricing calculator with per-tier best-value highlighting, an SDK grid revealing install commands on hover/tap, a count-up reliability stats band with a p99 chip, a three-pane schematic docs teaser, developer testimonials, and a footer with an operational StatusDot row. Choose it over saas-landing-page when the product is a developer API and the hero should demo a request instead of a product mock.',
  category: 'Marketing - API Platform Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CodeBlock',
    'Icon',
    'Layout',
    'Slider',
    'Spinner',
    'StatusDot',
    'TabList',
    'Table',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
