import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Conference Landing',
  description:
    'Full landing page for a fictional two-day dev conference ("Interface 2026 · Oct 8–9 · Lisbon"): sticky anchor navbar that collapses to a menu button at compact widths, a gradient-composition hero with a live ticking countdown and a Get-tickets CTA that scrolls to the tiers, a gradient-monogram speaker grid with hover lift, a Day 1 / Day 2 TabList agenda whose three track columns collapse to per-track accordions when narrow, ticket tiers with seats-left ProgressBar meters (sold-out Early bird, featured Regular, Team pack) and an inline validating reserve-by-email flow, a schematic SVG venue map with travel notes, a tiered sponsor wall, a past-edition stats band with count-ups plus a photo-tile collage, a newsletter capture, and a sitemap footer. Choose it over saas-landing-page when the surface is an event with dates, agenda, tickets, and venue rather than a product pitch.',
  category: 'Marketing - Conference Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'ProgressBar',
    'TabList',
    'TextInput',
    'Toast',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
