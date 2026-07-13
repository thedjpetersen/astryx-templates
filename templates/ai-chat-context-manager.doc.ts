import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Context Window Manager',
  description:
    'Focused ~720px panel for managing an AI session context window: a stacked five-category allocation meter with a movable compaction-boundary tick, collapsible LOADED EVERY TURN / THIS SESSION sections with per-row mini ProgressBars, CONTEXT FILES and SKILLS drill-in rows with "Show more" expanders and estimate footnotes, a compaction-boundary Slider with a set-as-default action, and a session expense card with a five-$ scale plus per-model cost mini-table. Choose over ai-chat-tool-stream when the story is what fills the window and what it costs, not the conversation itself.',
  category: 'AI Chat - Context Window',
  componentsUsed: [
    'Button',
    'Card',
    'Collapsible',
    'Divider',
    'Heading',
    'Icon',
    'Layout',
    'ProgressBar',
    'Slider',
    'Table',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
