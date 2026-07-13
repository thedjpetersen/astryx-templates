import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'CLI Node Doctor',
  description:
    "A centered scheme-locked dark terminal stage stacking three CLI specimens: the relay-node startup hero (two-tone cyan/magenta ASCII fairy mark, 'relay-node v1.2.3', dim 'mac-studio · ~/dev/atlas' and proxy lines, italic tagline), a six-line live log ('#3 bash ls -la' blue, '#3 ✓ (exit 0)' green, '#4 ✗ patch failed' red, '↑ update available' yellow) above an in-place status line whose Connected/Connecting.../Disconnected state is switched by a header Selector, and a 'relay-node doctor' checklist with ✓/✗/!/- rows, bold labels, dim fix-command panes with working copy buttons, and a colored summary line. Choose over cli-pairing-console when the story is CLI health diagnostics and setup fixes, not pairing a device.",
  category: 'AI Chat - CLI Diagnostics',
  componentsUsed: ['Layout', 'Selector', 'StatusDot', 'Text', 'Tooltip'],
} satisfies AstryxPageTemplate;

export default template;
