import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Newsletter Landing',
  description:
    'Complete long-scroll landing page for a creator-run weekly newsletter (the fictional "Overshoot" design-engineering letter). Sticky navbar with smooth-scrolling scroll-spy anchors that collapse behind a menu button at compact widths; split hero pairing a validating subscribe capture (success flips to a Check-your-inbox card with a working resend link and count-up reader/open-rate proof) with a signature self-drawing spring-curve masthead card; a framed scrollable sample-issue reader with an issue #142/#141 swap toggle and CodeBlock code tips; a topic-filterable archive grid; a CSS-columns testimonial wall; a sponsor slot card with availability Badges and an inline request confirmation; an author row; and a minimal footer. Choose it over saas-landing-page when the product is a publication — the pitch is the content itself, not a feature tour.',
  category: 'Marketing - Newsletter Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CodeBlock',
    'Divider',
    'Heading',
    'Icon',
    'Layout',
    'Text',
    'TextInput',
    'ToggleButton',
  ],
} satisfies AstryxPageTemplate;

export default template;
