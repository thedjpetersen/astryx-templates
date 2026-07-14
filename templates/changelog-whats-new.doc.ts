import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Public Changelog',
  description:
    "Art-directed public changelog for a fictional accounting platform ('Ledgerline'): a condensing scroll-spy navbar over a product-theater hero — gradient-ink display headline under a drifting aurora field and grain, count-up stats, a validating subscribe capture, an RSS-copy chip, and a perspective-staged release-console mock orbited by parallaxing satellite cards. A floating New/Improved/Fixed/Security filter toolbar bleeds across the hero boundary and live-filters twelve month-grouped releases (sticky month labels, version chips, tag Badges, a schematic reconciliation screenshot, a draggable before/after slider with keyboard fallbacks, a Breaking callout with a CodeBlock migration diff, and a staggered Load-more). A pinned scroll story advances a three-state release-pipeline mock from a clickable numeral rail, and a scheme-locked dark subscribe band adds glass cards with a pointer-tracked spotlight. Choose over saas-landing-page when the surface is a release-notes archive rather than a product pitch; element-width breakpoints and reduced-motion gating keep it working in the inline demo stage and at 390px.",
  category: 'Marketing - Public Changelog',
  componentsUsed: [
    'Badge',
    'Button',
    'CodeBlock',
    'EmptyState',
    'Icon',
    'Layout',
    'StatusDot',
    'Text',
    'TextInput',
    'Toast',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
