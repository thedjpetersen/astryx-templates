import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Glasses Voice Chat',
  description:
    'A fixed 600×600 smart-glasses HUD voice-chat artboard centered on a token backdrop: 52px session header with a mic-state chip, a fade-edged scrolling log of You/Relay message cards (latest highlighted) with a green-inset bash tool chip row, and a 96px glass record bar whose glowing orb cycles idle → listening (pulse rings + live transcript) → sending, with photo attach and HUD toasts. A page-chrome button toggles the full-screen capture overlay (blurred scrim, 154px orb, LISTENING caption box). Choose over token-based chat templates when the surface is a wearable heads-up display rather than an app window.',
  category: 'AI Chat - Wearable HUD',
  componentsUsed: ['Button', 'Icon', 'Layout', 'Text'],
} satisfies AstryxPageTemplate;

export default template;
