import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Assistant Landing',
  description:
    'Signed-in assistant landing rendered before the first message: a centered column with a workspace context pill whose Popover lists Personal, starred-default team workspaces with mono hashtags, an Archived section, and a create-workspace footer; a boot-checklist strip caught mid-boot with a Spinner and mono status line; a dismissible workspace-routing Banner; the composer card with attach, model pill, and send; dismissable suggested-action pills (one with a confidence percent); and a recent-sessions grid of ClickableCards with status dots. Choose over ai-chat-tool-stream when the surface is the empty-state launchpad, not an active transcript.',
  category: 'AI Chat - Landing',
  componentsUsed: [
    'Avatar',
    'Banner',
    'Button',
    'ClickableCard',
    'Divider',
    'Heading',
    'Icon',
    'IconButton',
    'Item',
    'Layout',
    'Popover',
    'Selector',
    'Spinner',
    'StatusDot',
    'Text',
    'TextArea',
  ],
} satisfies AstryxPageTemplate;

export default template;
