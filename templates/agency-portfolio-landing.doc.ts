import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Agency Portfolio Landing',
  description:
    'Studio site for a fictional product design agency ("Fathom & Co"): sticky navbar with smooth-scrolling scroll-spy anchors that collapse to a menu button at compact widths, an oversized statement hero over a looping client-monogram marquee (pauses on hover, static under reduced motion), a 4-card case-study grid whose cards reveal a "View case" overlay and expand an inline challenge/approach/results panel with a count-up metric trio, capabilities and process bands, a press-quote row, a team strip, and an availability card with a validating budget/timeline/email inquiry form. Choose it over saas-landing-page when the surface is a services/portfolio studio rather than a product with pricing tiers.',
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
