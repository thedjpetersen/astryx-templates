import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Chat Navigator Furniture',
  description:
    'Long chat transcript (14 turns) demonstrating navigation furniture: a right-edge minimap of per-message bars that expands on hover into a 64-char preview navigator and scrolls to the clicked message; an aria-live RECAP card pinned above the composer with a Clock icon, uppercase eyebrow, and X dismiss; and a floating bottom-right session-changes pill that reveals "4 files changed" on hover and opens a Dialog of changed files with per-file status dots and a left-placed close X. Choose over ai-chat-tool-stream when the story is orienting inside a long conversation, not tool execution.',
  category: 'AI Chat - Navigation',
  componentsUsed: [
    'Avatar',
    'Card',
    'Chat',
    'Dialog',
    'Divider',
    'IconButton',
    'Layout',
    'StatusDot',
    'TextArea',
    'Timestamp',
  ],
} satisfies AstryxPageTemplate;

export default template;
