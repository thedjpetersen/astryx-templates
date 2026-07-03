import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Company About Page Example',
  description:
    'Marketing about page with a scroll-spying section subnav: narrative header, mission prose, a count-up stats band (Grid of animated figures with Replay), an alternating 2019–2026 milestone timeline with an Expanded/Condensed SegmentedControl, a 3x2 values Card grid, a leadership grid with gradient-initial avatars and keyboard-accessible bio Popovers, an investors/press wordmark row, and a careers CTA panel whose role Cards fire application Toasts.',
  category: 'Marketing - Company About Page Example',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Grid',
    'Icon',
    'Layout',
    'Popover',
    'SegmentedControl',
    'Toast',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
