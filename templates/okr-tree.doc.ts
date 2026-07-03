import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'OKR Tree',
  description:
    'Company OKR console with a quarter Selector and an expandable two-level tree of objectives and key results — owner Avatars, confidence-colored ProgressBars, On track / At risk / Off track Badges, and tabular scores per row — plus company roll-up summary Cards, an at-risk-only Switch that prunes and force-expands the tree, and a docked check-in history panel (single-pane on phones) opened by clicking any key result.',
  category: 'Planning - OKR Tree',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'Grid',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'ProgressBar',
    'Selector',
    'StatusDot',
    'Switch',
  ],
} satisfies AstryxPageTemplate;

export default template;
