import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Terminal Workspace',
  description:
    "Multi-tab terminal workspace: a 250px session sidebar (running/idle StatusDots, 'zsh · pid 48213', amber new-output activity dots, a New session button that really appends a fixture zsh), a scrollable tab strip of sessions (zsh, dev server, tests), and dark monospace scrollback rendered from typed line records by one switch — green 'mira@orbit-dev' + blue '~/code/orbit-console' prompt lines, plain stdout, red stderr ('cat: .env.production: No such file or directory'), green ✓/red ✗ exit-code markers, and a frozen npm-install progress block ('⠧ reify' with a 67% bar) beside a vite dev-server log ('VITE v6.3.1 ready in 412 ms', HMR timestamps) and a failing vitest run (exit 1). A search-in-scrollback bar (seeded on 'git') highlights every match, keeps a '2 of 4' counter, and cycles with prev/next; a header ToggleButton opens split-pane view with a chip row to re-target the right pane; mod+K raises a command palette whose filtered entries actually run (switch session, toggle split, open search, new session, mark all seen); each pane ends in a prompt-caret input row and a status-bar footer shows pid/geometry/encoding. <=640px the sidebar collapses behind a header toggle and split mode is unavailable. Choose over codeblock-terminal when the surface is a live multi-session terminal app rather than a code snippet, over cli-pairing-console when the terminal is the product (not a pairing step), and over editor-file-tabs-shell when the panes hold scrollback instead of source files.",
  category: 'Coding - Terminal Workspace',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'CommandPalette',
    'Divider',
    'IconButton',
    'Kbd',
    'Layout',
    'LayoutPanel',
    'Overlay',
    'StatusDot',
    'TextInput',
    'ToggleButton',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
