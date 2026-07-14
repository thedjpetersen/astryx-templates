import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Fintech Card Landing',
  description:
    'Art-directed marketing landing page for a fictional team spend card ("Keel"): a navbar that rides transparent then condenses onto a tinted hairline after scroll, an aurora-lit hero with 72px gradient-ink display type whose signature charge card tilts toward the pointer, flips on click to a live controls back face (the Freeze switch stamps a FROZEN overlay), and floats over a glow with bobbing, pointer-parallax satellite mini-cards; a pinned scroll story that advances the three card-control vignettes along a clickable step rail (static stack under reduced motion / compact widths); an asymmetric fee band with an oversized gradient $0 numeral and success-tinted cells; a real-time spend feed whose stat cards straddle into the aurora-lit rewards band with its cashback Slider; an honest FDIC-partner compliance band; and a spotlight-tracked dark CTA panel plus footer with three independent validating email captures. Choose it over saas-landing-page when the vertical is fintech/cards and the hero should be a staged physical-product moment rather than an app screenshot.',
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
  ],
} satisfies AstryxPageTemplate;

export default template;
