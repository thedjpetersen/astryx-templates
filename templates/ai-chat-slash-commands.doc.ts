import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Slash Command Library',
  description:
    'Manager surface for an AI chat product’s slash commands: a census header, scope SegmentedControl and search over a dense 18-row list with mono /names, alias Tokens, category Badges, emerald Skill Badges, usage strings, per-row enable Switches, and Edit/Duplicate/Delete kebabs; a 380px editor drawer (open by default) edits a custom command with a "/"-prefixed InputGroup name, prompt-template TextArea, scope RadioList, and a built-in collision warning Banner. Choose over ai-chat-tool-stream when the story is configuring the "/" menu, not a live transcript.',
  category: 'AI Chat - Slash Commands',
  componentsUsed: [
    'Badge',
    'Banner',
    'Button',
    'Card',
    'Divider',
    'EmptyState',
    'IconButton',
    'InputGroup',
    'Layout',
    'MoreMenu',
    'RadioList',
    'SegmentedControl',
    'Switch',
    'TextArea',
    'TextInput',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
