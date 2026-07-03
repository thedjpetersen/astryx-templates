import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Page Headers & Newsletter Sections',
  description:
    "Marketing showcase pairing the top and bottom of a marketing page: four header-section variants — simple centered title under a breadcrumb-style eyebrow, dark header with a CSS grid-pattern background and stat chips (12,400 teams / 99.98% uptime / 48 integrations / 4.8 rating), split header with supporting paragraph and Start free / Book a demo CTAs that fire receipt Toasts, and a category-page header whose filter pills genuinely toggle active styling and recompute a 'Showing N articles' line from fixed per-topic counts — over three newsletter-section variants: a slim inline signup bar, a split panel with benefit bullets and a privacy note, and a dark gradient card with a weekly/monthly frequency RadioList. All three newsletter forms share one validated email flow (empty and format errors inline, cleared on typing) but land in distinct success states with their own resets (Undo row, check-your-inbox card, cadence-echoing confirmation), and a header jump rail (labeled chips, Selector on phones) scrolls to any variant while a subscribed-count Badge proves the forms hold independent state. Choose over marketing-cta-banners when the sections open and close a page (headers + email capture), not mid-page conversion banners; choose over marketing-blog-content-sections when the surface is page chrome variants rather than article layouts; choose over form-page when the email forms are compact marketing captures, not a full structured form.",
  category: 'Marketing - Page Headers & Newsletter Sections',
  componentsUsed: [
    'Badge',
    'Breadcrumbs',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'RadioList',
    'Selector',
    'StackItem',
    'Text',
    'TextInput',
    'Toast',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
