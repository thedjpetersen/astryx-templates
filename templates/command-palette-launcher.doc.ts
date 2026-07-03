import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Command Palette Launcher',
  description:
    'Keyboard-driven command palette open at ~18vh over a dimmed AI-workspace page: CommandPalette input with typed query, fuzzy-match highlighting, grouped session/command/help results with Kbd shortcuts, an async remote-search Spinner row, and a footer of navigation hints and prefix cheatsheet.',
  category: 'Navigation - Command Palette',
  componentsUsed: [
    'Avatar',
    'Button',
    'Card',
    'CommandPalette',
    'Divider',
    'Grid',
    'IconButton',
    'Kbd',
    'Layout',
    'Overlay',
    'Selector',
    'Spinner',
    'StatusDot',
    'Timestamp',
    'TopNav',
  ],
} satisfies AstryxPageTemplate;

export default template;
