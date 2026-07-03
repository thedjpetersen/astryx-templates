import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Video Editor Effects Panel',
  description:
    "NLE effects-and-transitions browser for the 'Harbor Light' documentary cut: a 340px left browser panel with a SearchIcon TextInput, a category nav (All, starred Favorites, then Color/Blur & Sharpen/Distort/Keying/Transitions rows with data-categorical color dots and live counts) and a grouped 19-effect catalog whose rows carry GripVerticalIcon drag affordances, GPU Badges, favorite StarIcon ToggleButtons and a PlusIcon apply button; and the defining region — the selected clip's applied-effect stack on the right, a clip strip of three gradient-thumb clip buttons above ordered effect rows each with an enable Switch, category dot, mono parameter summary, move up/down reorder IconButtons and an expand chevron, one effect shipped expanded to expose per-parameter rows (custom keyframe toggle diamonds, Slider + NumberInput pairs), deterministic mini keyframe tracks for animated parameters, and a Reset parameters / destructive Remove effect row, all mirrored by a Bypass all Switch and a LayoutFooter status bar whose totals track the stack. Choose over video-clip-timeline when the user shops for, orders, and tunes effects on a single clip rather than arranging clips on timeline lanes.",
  category: 'Media - Effects Browser',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'NumberInput',
    'Slider',
    'Switch',
    'Text',
    'TextInput',
    'ToggleButton',
    'Toolbar',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
