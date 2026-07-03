import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Hero Section Showcase',
  description:
    "Marketing hero-section showcase for an invented dev-tools SaaS brand (Astryx Relay): a sticky variant-jump rail on the left (List on wide viewports, a sticky chip row under 900px) that smooth-scrolls to and scroll-spies four labeled hero variants stacked on the right — a centered headline with dual CTAs over a scheme-keyed gradient mesh, a split hero with copy beside an app-screenshot mock built entirely from CSS panels (window chrome, sidebar nav, metric tiles, delivery-log rows) plus a copy-install-command chip that flips to Copied, a locked-dark full-bleed hero whose email capture validates format inline and swaps to a success chip on submit, and an angled clip-path gradient panel hero with AvatarGroup social proof and a filled star row. Every CTA fires a keyed corner Toast naming its variant, and a Light/Dark SegmentedControl in the page header flips colorScheme on the scroll container so all token-driven surfaces restyle live. Below 640px the split and angled heroes stack, the console mock drops its sidebar, and the email row stacks. Choose over marketing-cta-banners when the specimens are full HERO sections (headline-led, above-the-fold) rather than mid-page CTA/banner strips; choose over marketing-social-proof when avatars and stars decorate one hero variant, not the whole page; choose over pricing-plans when the goal is top-of-funnel messaging, not tier selection.",
  category: 'Marketing - Hero Section Showcase',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'LayoutPanel',
    'List',
    'SegmentedControl',
    'StackItem',
    'Text',
    'TextInput',
    'Toast',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
