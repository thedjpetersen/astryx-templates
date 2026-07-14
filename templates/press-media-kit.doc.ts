import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Press & Media Kit',
  description:
    'Complete press page for a fictional robotics scale-up: sticky anchor navbar (collapsing to a menu at compact widths), a hero band with copyable boilerplate, a staged Download-kit progress button, and a press-contact card, then copy-on-click fast-fact tiles with count-ups, logo assets on checkered previews with usage dos/don’ts and misuse mini-previews, schematic product screenshots and leadership monogram tiles with download chips, brand color swatches with copy-hex feedback, a coverage list, and a founding-story timeline. Choose it over saas-landing-page when the surface is a media/brand-asset kit rather than a conversion-oriented product pitch.',
  category: 'Marketing - Press & Media Kit',
  componentsUsed: ['Badge', 'Button', 'Icon', 'Layout', 'Toast'],
} satisfies AstryxPageTemplate;

export default template;
