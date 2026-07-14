import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Cohort Course Landing',
  description:
    'Complete long-scroll landing page for a live cohort course (the fictional "Load-Bearing" 6-week systems-design course): sticky navbar with smooth-scrolling scroll-spy anchors that collapse to a hamburger at compact widths, a split hero whose next-cohort card animates a seats meter and count-up on load, outcome cards with staggered check draw-ons, a controlled week-by-week curriculum accordion, an instructor split with count-up credibility stats, a student project gallery, a testimonial trio, an honest self-paced vs cohort comparison, a pricing card whose 1x/3x payment-plan SegmentedControl recomputes totals honestly, a FAQ accordion, and a validating apply email capture. Choose it over saas-landing-page when the page sells a dated, seat-limited cohort rather than a product.',
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
