import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: '404 & Error Page Collection',
  description:
    'Variant-switched collection of four error screens shown one at a time in a framed browser viewport: a minimal centered 404 with oversized gradient type and a back-home CTA, a playful screen with a CSS-drawn lost-robot mascot and a live site search that filters 12 fixture routes and toasts on navigate, a helpful-links screen listing popular destinations with icons, and a 500/maintenance screen with an incident-status chip, retry-with-spinner ending in an inline "still down" Banner, and a validated status-updates subscribe form — all driven by a SegmentedControl variant switcher plus a 404/500 code toggle.',
  category: 'Marketing - 404 & Error Page Collection',
  componentsUsed: [
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'FieldStatus',
    'Layout',
    'Link',
    'SegmentedControl',
    'Spinner',
    'StatusDot',
    'TextInput',
    'Toast',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
