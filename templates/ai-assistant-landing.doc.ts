import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'AI Assistant Landing',
  description:
    'Complete marketing landing page for a fictional AI work assistant ("Murmur"): sticky navbar with smooth-scrolling anchors that collapses to a menu button at compact widths, a split hero whose framed chat demo autoplays a scripted conversation (typing dots, tool-call chips, an artifact card) with hover-pause, loop, and replay, a six-card capability grid with CSS-drawn schematics, a full-bleed integration band with count-up stats, a security strip, a scroll-snap prompt-examples carousel that fills a demo composer, a dark two-tier CTA band with validating email captures, and a sitemap footer. Choose it over saas-landing-page when the product story is an AI assistant and the hero should demonstrate a live conversation rather than a product mock.',
  category: 'Marketing - AI Assistant Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'Grid',
    'Heading',
    'Icon',
    'Layout',
    'StatusDot',
    'Text',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
