import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Terminal Kanban',
  description:
    "Terminal-styled kanban board for agent sessions: a scheme-locked dark monospace stage centered on a token backdrop, with a cyan '⌘ Kanban' header and yellow-key/gray-label hint strip ('wasd: move  1-4: lanes  /: search  n: new  enter: open  q: quit'), four bordered lane columns (Backlog dim / Active green / Your Turn yellow / Archived blue) where the focused lane gets a thick colored border and colored legend title, two-line session cards ('▸ ● Ship context meter' over '3h ago  ● ↳2' with green processing dots, sub-agent counts, a white-on-blue selected highlight, and an italic 'empty' placeholder lane), and a right Detail panel with Status / Updated / Model rows, a 'Sub-agents (2)' ●/◦ roster, a dim six-line 'Last response' preview, and an 'enter: open chat  esc: back to kanban' footer. Arrow keys, wasd, and 1-4 genuinely move focus between lanes and cards (onKeyDown on the stage), and clicking a card selects it and fills the detail panel. Choose over mission-control-kanban when the surface should read as a keyboard-driven TUI rather than a token-based product board, and over cli-pairing-console when the terminal is a full-screen interactive app, not a stdout log.",
  category: 'AI Chat - Terminal Surfaces',
  componentsUsed: ['Kbd', 'Text'],
} satisfies AstryxPageTemplate;

export default template;
