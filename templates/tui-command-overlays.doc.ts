import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Terminal Overlay Dialogs',
  description:
    'Terminal overlay-dialog specimen page: a scheme-locked dark monospace TUI stage shows a dimmed agent chat behind one of three centered rounded dialogs — a 54ch Help keymap with yellow section headers and a cyan key column, a 40ch Actions palette with white-on-blue letter-key selection, and a 52ch Settings dialog whose Reset Sandbox row asks a red y/n wipe confirm. A SegmentedControl in normal page chrome switches the visible specimen and every dialog is fully keyboard-driven (arrows, Enter, Escape, letter keys) once the stage is focused. Choose over ai-chat-quick-settings or ai-workspace-settings-modal when the surface being designed is a terminal (TUI) product, not a token-themed web app.',
  category: 'AI Chat - Terminal Overlays',
  componentsUsed: ['Kbd', 'Layout', 'SegmentedControl', 'Text'],
} satisfies AstryxPageTemplate;

export default template;
