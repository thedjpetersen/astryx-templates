import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Careers Page',
  description:
    'Complete careers landing page for a fictional 60-person startup: sticky navbar with smooth-scrolling scroll-spy anchors that collapse behind a hamburger at compact widths, a hero with count-up stats and a rotating-spotlight gradient photo collage, a values grid, a full-bleed benefits band, a roles list live-filtered by department chips and a location Selector with inline row expansion into a validating name/email/link application mini-form and success state, a four-step hiring-process timeline, an auto-advancing employee quote carousel, and a dark sitemap footer. Choose it over saas-landing-page when the page sells a team and open roles rather than a product.',
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
