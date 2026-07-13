import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Workspace Icon Studio',
  description:
    'Avatar/icon design studio for a team workspace: a live preview card renders the icon at four sizes (xs/sm/md/lg) with in-context sidebar and switcher specimens, while a TabList switches between four icon types — a glyph-by-tone swatch grid, an emoji preset grid with backdrop tones, eight named gradient presets plus a full generator (style SegmentedControl, Zoom/Angle Sliders, color-stop pickers, template Selector, deterministic Generate cycle), and an upload dropzone with a crop preview. Choose over workspace-switcher-hub when the task is designing workspace identity, not managing workspaces.',
  category: 'AI Chat - Workspace Identity',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Divider',
    'FileInput',
    'Layout',
    'SegmentedControl',
    'Selector',
    'Slider',
    'TabList',
  ],
} satisfies AstryxPageTemplate;

export default template;
