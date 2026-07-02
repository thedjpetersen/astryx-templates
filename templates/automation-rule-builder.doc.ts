import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Automation Rule Builder',
  description:
    'Lifecycle-hook rules console with a color-coded trigger condition builder: left rail lists hook rows (name, muted "blocks" Badge, clamped description, emerald mini Switch); the detail pane shows a metadata grid (Event in mono Code, Action, Timeout, version Badge), an italic auto-generated trigger summary, then the marquee TRIGGERS editor — one collapsed row per condition type in its exact color (tool_call blue, tool_pattern purple, keyword pink, channel green, node orange, event amber), each with a colored dot, an activates/invokes mode Badge, and a mono value preview; the keyword row is expanded with a three-pill activates/invokes/both scope selector and hint copy, and the add-condition form is open with all six type pill chips. A two-tab script viewer (check.sh / config.json) with CodeBlock closes the pane. The only condition/rule-builder archetype in the catalog — choose it for policy, alerting-rule, or filter-builder UIs over generic form templates.',
  category: 'Settings - Automation Rules',
  componentsUsed: [
    'Badge',
    'Button',
    'Code',
    'CodeBlock',
    'Collapsible',
    'Divider',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'Selector',
    'Switch',
    'TabList',
    'TextInput',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
