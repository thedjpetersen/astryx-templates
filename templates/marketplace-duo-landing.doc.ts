import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Two-Sided Marketplace Landing',
  description:
    'Art-directed landing page for a fictional two-sided gear-rental marketplace ("Kitloop"). Its signature hero audience toggle — "I want to rent" vs "I want to earn" — swaps the gradient-ink headline, CTA, perspective-staged product vignette with bobbing parallax satellite chips, and the whole path below (renter: staggered category grid, pinned how-it-works scroll story, KitCover trust band, review marquee; owner: Selector + Slider earnings calculator with a count-up estimate and honest range, pinned payout/protection scroll story, top-earner stories with a median disclosure), retinting every accent surface, aurora field, and glow between renter teal and owner amber; the toggle re-docks into the condensing sticky navbar after scroll. A floating count-up stats panel crosses into the tinted cities band, and a scheme-locked dark CTA band with a pointer-tracked spotlight hosts the validating email capture; per-audience FAQ tabs and a sitemap footer round it out. Choose it over saas-landing-page when the story is a marketplace with two audiences rather than a single product pitch.',
  category: 'Marketing - Two-Sided Marketplace Landing',
  componentsUsed: [
    'Badge',
    'Button',
    'Collapsible',
    'Icon',
    'Layout',
    'Selector',
    'Slider',
    'TabList',
    'Text',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
