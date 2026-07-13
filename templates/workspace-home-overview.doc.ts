import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Workspace Home',
  description:
    'Workspace home hub behind the assistant landing: a header with workspace icon, mono hashtag, member ' +
    'AvatarGroup, and a SegmentedControl that switches between Overview and Recent-sessions layouts. Overview ' +
    'stacks a 4-up widgets Grid (open sessions, next scheduled run, nodes online, weekly-token SVG sparkline) ' +
    'over a dated briefing digest, a newsfeed activity column with a show-more expander, and a pinned-resources ' +
    'rail of ClickableCards; the sessions mode is a launchpad list of six status-dotted session rows. Choose it ' +
    'over ai-chat-workspace-landing when the surface is the workspace digest, not the composer.',
  category: 'AI Chat - Workspace Home',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Card',
    'ClickableCard',
    'Divider',
    'Grid',
    'Heading',
    'Icon',
    'Layout',
    'SegmentedControl',
    'StatusDot',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
