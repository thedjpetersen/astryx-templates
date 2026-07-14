import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Public Changelog',
  description:
    "Public changelog page for a fictional accounting platform ('Ledgerline'): a sticky navbar with smooth-scrolling scroll-spy anchors, an accent-tinted header band with count-up stats, a validating subscribe-by-email capture, an RSS-copy chip, and New/Improved/Fixed/Security ToggleButtons that live-filter the entries. Twelve releases are grouped by month under sticky month labels, each with a version chip, tag Badges, and bullet lists; media blocks include a schematic reconciliation screenshot and a draggable before/after slider with button and keyboard fallbacks, one Breaking release ships a warning callout with a CodeBlock migration diff, and a Load-more reveals four older releases with a staggered rise. Choose over saas-landing-page when the surface is a release-notes archive rather than a product pitch; element-width breakpoints keep it working in the inline demo stage and at 390px.",
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
