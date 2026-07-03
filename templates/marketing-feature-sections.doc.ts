import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Feature Section Showcase',
  description:
    "Stacked showcase of four labeled feature-section variants, all describing the same fictional Relay sync platform (realtime sync, audit log, roles, API) so the treatments read as one brand. A SegmentedControl in the LayoutHeader stacks all four in page order or isolates any single variant for copy-ready viewing (a dashed note marks the isolated state). Variant 1 is a 3-column icon grid of six features whose cards are real buttons — click, Enter, or Space expands each to reveal a longer description with aria-expanded and a rotating chevron, and Expand all / Collapse all act on the whole grid. Variant 2 alternates image-left/image-right rows pairing kicker/heading/bullets/CTA copy with CSS-drawn schematic mocks (sync nodes, audit ledger rows, a role permission matrix); rows fade and rise on an IntersectionObserver reveal that Replay reveal reruns and prefers-reduced-motion skips. Variant 3 is a centered 2x2 capability grid inside a Card above a browser-chrome screenshot panel whose Overview / Audit trail SegmentedControl swaps the mock body. Variant 4 is a dark gradient feature spotlight with an offset codeblock-style card — TypeScript/cURL tabs swap fixed syntax-tinted snippets, and Copy snippet flips to a Copied check. Every CTA fires a corner Toast naming its variant so the wiring is provable. Below 900px the grid drops to 2 columns and rows/spotlight stack; below 640px both grids go single column and headlines step down, holding 375px with no page overflow-x. Choose over marketing-hero-showcase when the page sells with feature grids and alternating rows, not above-the-fold heroes; choose over marketing-cta-banners when sections explain capabilities rather than drive a single conversion; choose over pricing-plans when the comparison is feature storytelling, not tiers.",
  category: 'Marketing - Feature Section Showcase',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'SegmentedControl',
    'StackItem',
    'Text',
    'Toast',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
