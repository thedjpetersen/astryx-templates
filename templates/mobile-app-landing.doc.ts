import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Mobile App Landing',
  description:
    'Art-directed marketing landing page for a fictional habit-tracker app ("Stride"): a transparent-to-blur condensing anchor navbar with scroll-spy, a product-theater hero (76px gradient-ink display type, aurora + grain atmosphere, cycling CSS phone with pointer parallax and bobbing glass satellite cards), a pinned scroll story that advances three feature vignettes along a clickable numbered rail, a ratings wall with a pausing review-card marquee, a scheme-locked emerald stats band with glass count-up cards and a pointer spotlight, a 5/7 FAQ split with a sticky intro rail, and a download card (schematic QR + validating email capture) that overlaps into the dark footer. All motion is reduced-motion gated with static fallbacks. Choose it over saas-landing-page when the product being marketed is a phone app rather than a web SaaS.',
  category: 'Marketing - Mobile App Landing',
  componentsUsed: [
    'Button',
    'Collapsible',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'TextInput',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
