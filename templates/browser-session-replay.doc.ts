import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Browser Session Replay',
  description:
    "Timeline playback surface for an agent's remote-browser session: a centered column of Collapsible dock Cards, each with a compact trigger header (chevron, browser icon, bold 'Browser' label, truncated last-action status text, a '7/12' counter Badge, and a trailing state icon — Spinner pending, error StatusDot, success check), and an expanded body with a media-transport Toolbar (skip-back / play / skip-forward IconButtons with disabled end states, a 'Live' ToggleButton) above a 16:9 AspectRatio screenshot frame; the page shows collapsed, live-pending (frame ringed as in-flight), and history-scrub (frame 7 of 12) variants, plus a step list of all 12 frames with per-action StatusDots and one error step. The only template with transport/scrubber controls — choose over timeline for frame-by-frame playback of captured steps, and over ai-chat-tool-stream when the story is what the browser saw, not tool call cards.",
  category: 'AI Chat - Browser Session Replay',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Card',
    'Collapsible',
    'Divider',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'List',
    'Spinner',
    'StatusDot',
    'Text',
    'Timestamp',
    'ToggleButton',
    'Toolbar',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
