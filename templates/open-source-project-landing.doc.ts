import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Open Source Project Page',
  description:
    'Art-directed project landing page for a fictional open-source state library ("tessera"): an aurora-lit hero staging a gradient-ink display headline over an install-terminal theater in perspective (npm/pnpm/yarn/bun tabs swapping a copyable CodeBlock, bobbing satellite mini-cards with pointer parallax) that bleeds into a dot-grid before/after example band; a pinned scroll-story release timeline with a clickable numbered step rail (static stacked under reduced motion or compact widths); an asymmetric contributors split with count-up totals and a staggered 24-tile monogram wall; a three-tier sponsors band; a scheme-locked dark star-history band with glass cards, a pointer-tracked spotlight, a draw-on SVG sparkline, and a used-by marquee; hover-raising Docs/Discord/GitHub cards; and an MIT-note footer. The sticky navbar gains a tinted surface after scroll, scroll-spies four anchors, collapses to a menu button at compact widths, and carries a working star toggle. Choose it over saas-landing-page when the product is a library or CLI marketed to developers rather than a hosted SaaS.',
  category: 'Marketing - Open Source Project Page',
  componentsUsed: [
    'Badge',
    'Button',
    'ClickableCard',
    'CodeBlock',
    'Grid',
    'Icon',
    'Layout',
    'TabList',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
