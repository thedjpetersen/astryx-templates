import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Cohort Course Landing',
  description:
    'Art-directed long-scroll landing page for a live cohort course (the fictional "Load-Bearing" 6-week systems-design course): aurora-and-grain hero with a 76px gradient-ink headline and a staged next-cohort card (seats meter + count-up) orbited by bobbing, pointer-parallax satellite mini-cards, a count-up stats strip crossing into a pausable alumni-employer marquee, and a scheme-locked dark scroll story whose sticky stage advances a cohort-workspace mock through live-session / ship / review states via a clickable, filling step rail. Also: scroll-spy navbar that condenses after scroll (hamburger at compact widths), outcome cards with oversized numerals and check draw-ons, a 5/7 curriculum split with sticky rail and week accordion, count-up instructor stats, offset hover-lift project gallery, testimonial trio, honest self-paced vs cohort comparison, an honest 1x/3x payment-plan toggle, FAQ accordion, and a validating apply email capture — all reduced-motion safe. Choose it over saas-landing-page when the page sells a dated, seat-limited cohort rather than a product.',
  category: 'Marketing - Cohort Course Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'Icon',
    'Layout',
    'SegmentedControl',
    'TextInput',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
