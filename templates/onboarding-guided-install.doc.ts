import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Guided Install Wizard',
  description:
    'Connect-your-machine onboarding for a CLI agent node: a centered max-w-lg wizard Card with a numbered-circle step header (Choose platform ✓, Install CLI ✓, Start node — active, Connected) joined by hairline connectors that turn green when passed; the active step shows a chosen-platform Token, a copy-command Code block in the copied state (green check feedback), a live status strip that flips from Spinner "Waiting for connection…" to a green "Connected as devvm1234.prn0" row, and two troubleshooting Collapsibles; below, a completion checklist Card mixes done/skipped rows plus the amber skip-warning Banner. Choose over form-wizard when steps gate on external device events (copy command → wait → verify) rather than form input.',
  category: 'Onboarding - Device Connect',
  componentsUsed: [
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Center',
    'Code',
    'Collapsible',
    'Divider',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'SelectableCard',
    'Spinner',
    'StatusDot',
    'Text',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
