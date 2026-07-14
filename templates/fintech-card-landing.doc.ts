import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Fintech Card Landing',
  description:
    'Full marketing landing page for a fictional team spend card ("Keel"): a sticky anchor navbar, a split hero whose signature gradient card render tilts toward the pointer and flips on click to a live controls back face (the Freeze switch stamps a FROZEN overlay on the front), three card-control feature rows with schematic vignettes, a full-bleed fee comparison band with success-tinted $0 cells, a staggered real-time spend feed with count-up stats, a monthly-spend Slider driving cashback count-ups, an honest FDIC-partner compliance band, and a dark CTA panel plus footer with three independent validating email captures. Choose it over saas-landing-page when the vertical is fintech/cards and the hero should be a physical-product moment rather than an app screenshot.',
  category: 'Marketing - Fintech Card Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'Slider',
    'Switch',
    'TextInput',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
