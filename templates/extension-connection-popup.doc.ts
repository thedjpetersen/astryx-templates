import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Browser Node Popup',
  description:
    'A 360px browser-extension popup card centered on a token backdrop, recreating dark extension chrome with a fixed palette: gradient logo mark whose status dot glows, pulses, or gains a "controlling" ring as a page-chrome Selector cycles six connection states; body stacks an update banner, a pending page-access panel with Approve/Block and a suggested regex pattern, a node-id copy row, a Relay URL connect form, Stop/Disconnect/Annotate actions, an agent-cursor Switch card, and a permissions row. Choose over browser-permissions-manager when the story is the extension popup itself rather than a full permissions settings page.',
  category: 'AI Chat - Browser Extension',
  componentsUsed: ['Selector', 'Switch', 'Text'],
} satisfies AstryxPageTemplate;

export default template;
