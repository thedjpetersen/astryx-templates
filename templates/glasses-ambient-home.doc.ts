import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Glasses Ambient Home',
  description:
    "Smart-glasses HUD surface: a fixed 600×600 scheme-locked black stage centered on a token backdrop, with a page-chrome SegmentedControl switching two screens. PAIR shows the brand orb + 'Relay' wordmark, a 'Visit on your phone or laptop:' chip (relaybot.dev/pair), the giant spaced 48px mono code 'A 7 K 2 9 X' on cyan underline cells, a pulsing 'Waiting for authorization…' line, a clickable pairing-state chip row (Waiting / Connecting… / Paired! green / Pairing failed red with a 'Tap to retry' pill), and a corner 'Demo' pill. HOME shows a breathing glowing brand orb, four 88px glasses-scale icon cards (New Conversation, ✨ Attention needed with '2 need attention · updated 3m ago', Sessions, ⌁ Unpair) where the focused card gets a cyan border + inset left bar + slight scale, plus a 'relay-webapp-v97' footer version chip; arrow keys move card focus. Choose over cli-pairing-console when the surface is the wearable's own ambient display rather than a browser/CLI pairing flow.",
  category: 'AI Chat - Glasses Ambient Home',
  componentsUsed: ['Heading', 'Layout', 'SegmentedControl', 'Text'],
} satisfies AstryxPageTemplate;

export default template;
