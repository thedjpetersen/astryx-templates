import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Org Chart Explorer',
  description:
    'Pannable org-tree canvas for a 40-person company — employee node cards with Avatars, titles, span-of-control and team-headcount badges, department color rails, and open-req placeholder tiles, connected by simple SVG elbow edges — with per-node collapse toggles showing hidden-descendant Badges, a header search that highlights and centers matches with previous/next cycling, a docked detail rail (single-pane on phones) of inline-editable title / manager / location / cost-center fields, and drag / MoreMenu / Selector re-parenting behind a confirm Dialog with an undo Toast.',
  category: 'Business - Org Chart Explorer',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Dialog',
    'Divider',
    'EmptyState',
    'Icon',
    'IconButton',
    'Layout',
    'LayoutPanel',
    'MoreMenu',
    'Selector',
    'TextInput',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
