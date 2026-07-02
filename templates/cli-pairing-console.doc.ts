import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'CLI Pairing Console',
  description:
    "End-to-end device-pairing surface in two halves: left, a dark monospace daemon console Card reproducing a CLI's stdout — cyan ASCII mascot header ('navi v0.1.0', 'MacBook-Pro.local · ~/code/acme', tagline 'Hey! Listen!'), a scrolling command log ('#48 shell git status --short', '#48 ✓ (exit 0)', '#49 ✗ Command timed out', 'Loaded 12 skills', '↑ Update available: v0.2.0'), and a pinned status line rendered in all three connection variants (green '● Connected · 12 skills · 47 cmds · heartbeat 3:42:07 PM', amber '● Connecting...', red '● Disconnected'); right, the browser-side authorization card in four states — idle with the pairing code 'KXTR-92FD' as large tracked mono text in a muted box above a full-width 'Authorize' Button, authorizing with Spinner, success with a green check circle and 'You can close this tab.', and error with 'Code expired. Restart the CLI to get a new code.' plus a 'Try again' Link. Choose over onboarding-guided-install when the flow is pairing an already-installed device via a short code, and over codeblock-terminal when the terminal pane is a live daemon status surface, not a code snippet.",
  category: 'Onboarding - Device Pairing',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Center',
    'Code',
    'Divider',
    'Grid',
    'Layout',
    'Link',
    'Spinner',
    'StatusDot',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
