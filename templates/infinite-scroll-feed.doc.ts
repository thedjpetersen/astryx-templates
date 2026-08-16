import type {AstryxIntegrationTemplate} from '../types/astryx-cli.js';

const template = {
  type: 'page',
  name: 'Infinite Scroll Page',
  description:
    'Company updates feed with a sticky filter header (SegmentedControl + team Selector) over a single centered column of post Cards — avatar bylines, clamped excerpts, tag Tokens, save toggles — ending in a static Skeleton loading group that implies more content loads on scroll.',
  category: 'Content - Infinite Scroll Page',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'EmptyState',
    'Layout',
    'MoreMenu',
    'SegmentedControl',
    'Selector',
    'Skeleton',
    'ToggleButton',
    'Token',
  ],
} satisfies AstryxIntegrationTemplate;

export default template;
