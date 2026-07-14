import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Agency Portfolio Landing',
  description:
    'Awwwards-bar studio site for a fictional product design agency ("Fathom & Co"): a navbar that condenses onto a tinted hairline surface on scroll, an 80px gradient-ink statement hero over an aurora-and-grain field with bobbing parallax satellite cards and the looping client-monogram marquee (pauses on hover, static under reduced motion), an asymmetric offset case-study grid whose cards raise/glow on hover and expand an inline challenge/approach/results panel with a count-up metric trio, a proof strip straddling into a dot-grid capabilities band with a sticky oversized-numeral rail, a pinned scroll-story process section with a clickable step rail, a scheme-locked dark press band with glass quote cards and a pointer-tracked spotlight, a team strip, and an availability card with a validating budget/timeline/email inquiry form. Choose it over saas-landing-page when the surface is a services/portfolio studio rather than a product with pricing tiers.',
  category: 'Marketing - Agency Portfolio Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'Icon',
    'Layout',
    'Selector',
    'Text',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
