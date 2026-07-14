import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Newsletter Landing',
  description:
    'Art-directed long-scroll landing page for a creator-run weekly newsletter (the fictional "Overshoot" design-engineering letter). Transparent-to-tinted sticky navbar with scroll-spy anchors that collapse behind a menu button at compact widths; an aurora-lit hero theater pairing display-scale gradient-ink type and a validating subscribe capture (success flips to a Check-your-inbox card with a working resend link and count-up reader/open-rate proof) with the signature self-drawing spring-curve masthead card staged under bobbing, pointer-parallax satellite chips; a pinned scroll story that walks the framed #142/#141 sample-issue reader through its four-beat anatomy on a clickable step rail; a topic-filterable archive grid with an oversized featured card; a pause-on-hover testimonial marquee; a scheme-locked dark sponsor band with glass cards and a pointer-tracked spotlight; an author card overlapping the dark band; and a minimal footer. Choose it over saas-landing-page when the product is a publication — the pitch is the content itself, not a feature tour.',
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
