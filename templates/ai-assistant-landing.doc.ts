import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'AI Assistant Landing',
  description:
    'Art-directed marketing landing page for a fictional AI work assistant ("Murmur"): a transparent-to-condensed sticky navbar, an aurora-and-grain hero with 78px gradient-ink display type whose framed chat demo autoplays a scripted conversation (typing dots, tool-call chips, an artifact card) staged as product theater — perspective tilt, pointer parallax, and three bobbing satellite cards — plus a hover-lift capability grid, a dot-grid integration band with a pausable marquee loop and count-up stats, a pinned security scroll story (sticky stage, four clickable numbered practices with CSS console panels), a prompt-examples carousel whose demo card overlaps into the dark CTA band, and a scheme-locked dark CTA band with aurora glows, a pointer-tracked spotlight, and glass tier cards with validating email captures. Choose it over saas-landing-page when the product story is an AI assistant and the hero should demonstrate a live conversation rather than a product mock.',
  category: 'Marketing - AI Assistant Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'StatusDot',
    'Text',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
