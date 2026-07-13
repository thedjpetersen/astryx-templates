import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Agent Hooks Console',
  description:
    'Master-detail automation console for agent lifecycle hooks: a searchable left rail lists 7 hooks with event Badges (PreToolUse / PostToolUse / SessionStart), an error-count Badge, and mini enable Switches; the detail pane shows a metadata grid (Event, Matcher mono chip, On failure block/warn, Timeout, Version), an editable TRIGGERS section whose rows pair a colored type dot with a type Selector, an activates/invokes mode chip toggle, and a per-type CSV value TextInput with add/remove controls, then a copyable bash hook-script CodeBlock and a last-5-runs history strip (status dot, duration, relative time). Choose over automation-rule-builder when the story is operating hooks — enable state, failure policy, run outcomes — rather than composing color-coded conditions.',
  category: 'AI Chat - Automation Hooks',
  componentsUsed: [
    'Badge',
    'Button',
    'Code',
    'CodeBlock',
    'Divider',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'Selector',
    'StatusDot',
    'Switch',
    'TextInput',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
