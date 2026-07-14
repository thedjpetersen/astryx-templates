import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Conference Landing',
  description:
    'Art-directed landing page for a fictional two-day dev conference ("Interface 2026 · Oct 8–9 · Lisbon"): a scroll-aware navbar (transparent → tinted blur), a product-theater hero with aurora field, 76px gradient-ink headline, live ticking countdown, and a perspective-staged attendee-pass mock orbited by bobbing satellite cards that parallax toward the pointer, a stagger-revealed speaker grid with hover raise, a Day 1 / Day 2 TabList agenda over a dot-grid band (track columns collapse to accordions when narrow), ticket tiers with seats-left ProgressBar meters and an inline validating reserve-by-email flow, a pinned scroll-story venue scene whose schematic map draws the tram line with scroll progress across four clickable travel steps, a tiered sponsor wall with a marquee community row, a scheme-locked dark past-edition band with pointer spotlight, glass stat count-ups and a photo collage, and a floating newsletter card that overlaps the sitemap footer. Choose it over saas-landing-page when the surface is an event with dates, agenda, tickets, and venue rather than a product pitch.',
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
