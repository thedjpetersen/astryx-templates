import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Bento Grid Showcase',
  description:
    'Marketing bento-grid showcase for the Relay brand in three labeled variants stacked down one 1040px column, with a sticky jump rail that scroll-spies the sections via IntersectionObserver. Variant 1 is a light 3-column asymmetric grid — a 2x2 performance hero with p50/p75/p90/p99 latency bars, a tall CSS phone-preview cell, a SOC 2 security callout with capability Tokens, an integrations cell whose CSS monogram logo tiles cycle through three sets on click/Enter/Space, and a full-width testimonial with an Avatar — plus a density ToggleButton flipping the grid between roomy and compact gaps. Variant 2 is a dark 5-cell panel with inset schematic UI mocks: a 12-bar throughput chart, a deploy terminal whose Replay button re-types a fixed transcript, a dark mobile frame, zero-trust copy, and a 4.2M scale stat. Variant 3 is a compact 4-cell grid with big-number stats in two cells behind a This quarter / All time toggle, an edge-network copy cell, and a CTA cell. Hovering or keyboard-focusing a cell lifts it and reveals a Learn more Button (always visible at <=640px, never hover-only) that fires a corner Toast naming its cell, as do the CTA buttons. Below 760px variants 1 and 2 stack to one column; below 640px variant 3 stacks, the jump rail scrolls horizontally, and headlines step down, holding 375px with no overflow-x. Choose over marketing-hero-showcase when the section sells with a mosaic of mixed feature cells, not one hero message; choose over dashboard-widget-grid when cells are marketing copy and schematic art, not live data widgets; choose over marketing-social-proof when logos and testimonials are single cells inside a feature grid, not the whole section.',
  category: 'Marketing - Bento Grid Showcase',
  componentsUsed: [
    'Avatar',
    'Button',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'StackItem',
    'Text',
    'Toast',
    'ToggleButton',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
