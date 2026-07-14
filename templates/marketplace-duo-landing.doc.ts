import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Two-Sided Marketplace Landing',
  description:
    'Complete landing page for a fictional two-sided gear-rental marketplace ("Kitloop"). Its signature hero audience toggle — "I want to rent" vs "I want to earn" — swaps the headline, CTA, and hero vignette, exchanges the renter sections (selectable category grid, how-it-works steps, KitCover trust band, review wall) for the owner sections (Selector + Slider earnings calculator with a count-up estimate and honest range, payout/protection cards, top-earner stories with a median disclosure), and retints every accent surface between renter teal and owner amber; the toggle re-docks into the sticky navbar after scroll. Shared count-up stats band, selectable city chips, per-audience FAQ tabs, and a validating email-capture CTA band round it out. Choose it over saas-landing-page when the story is a marketplace with two audiences rather than a single product pitch.',
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
