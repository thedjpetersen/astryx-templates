import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'API Platform Landing',
  description:
    'Art-directed marketing landing page for a fictional shipping-rates API ("Parcelrate"): a transparent-at-top sticky navbar that gains a tinted surface after 24px of scroll (menu-button dropdown at compact widths), and an aurora-field hero with a 76px gradient-ink display headline, a validating get-API-key email capture, and a staged product theater — the runnable request/response pane (curl/Node/Python TabList swaps the request CodeBlock; Send request stages a 600ms spinner before the JSON response rises in with a 200 OK badge and latency chip) sits scheme-locked dark under a perspective tilt with bobbing satellite cards and pointer parallax. Sections: a pause-on-hover customer wordmark marquee, an asymmetric 5/7 endpoint Table on a dot-grid band that straddles into the pricing band, a requests/month Slider pricing calculator with per-tier best-value highlighting, a hover-raise SDK grid with pinned install commands, a dark reliability band with glass count-up stat cards and a pointer-tracked spotlight, a pinned scroll-story docs section with a clickable filling step rail, offset developer testimonial cards, an aurora final CTA, and a footer with an operational StatusDot row. Choose it over saas-landing-page when the product is a developer API and the hero should demo a request instead of a product mock.',
  category: 'Marketing - API Platform Landing',
  componentsUsed: [
    'Badge',
    'Button',
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
