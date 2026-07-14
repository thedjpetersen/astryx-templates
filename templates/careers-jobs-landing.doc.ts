import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Careers Page',
  description:
    'Art-directed careers landing page for a fictional 60-person startup: a transparent-to-glass sticky navbar with scroll-spy anchors (hamburger at compact widths), an aurora-lit hero with 76px gradient-ink display type, count-up stats, and a perspective-staged photo-collage theater with bobbing satellite cards that parallax toward the pointer, an asymmetric offset values split, a dot-grid benefits band, a roles list live-filtered by department chips and a location Selector with inline expansion into a validating application mini-form and success state, a pinned scroll-story hiring process with a clickable step rail, a scheme-locked dark quote band with pointer spotlight and glass carousel, and an overlapping open-application card above the dark sitemap footer. Choose it over saas-landing-page when the page sells a team and open roles rather than a product.',
  category: 'Marketing - Careers Page',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'Selector',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
