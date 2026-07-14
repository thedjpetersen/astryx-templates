import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Mobile App Landing',
  description:
    'Desktop-first marketing landing page for a fictional habit-tracker app ("Stride"): sticky anchor navbar with scroll-spy and a compact menu fallback, a split hero pairing copy and bordered store pseudo-badges with a CSS phone frame that crossfades through three app screens every 3s (clickable dots; reduced motion pins the first screen), three alternating feature rows with phone-frame vignettes, a ratings wall (average card + histogram + five review cards), a scheme-locked emerald stats band with count-up numbers, a controlled FAQ accordion, and a download band combining a schematic QR grid with a validating email-me-a-link capture. Choose it over saas-landing-page when the product being marketed is a phone app rather than a web SaaS.',
  category: 'Marketing - Mobile App Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'TextInput',
    'Toast',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
