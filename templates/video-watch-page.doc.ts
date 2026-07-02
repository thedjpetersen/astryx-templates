import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Video Watch Page',
  description:
    "Lean-back video watch page for on-demand playback: a flexible left column with a 16:9 AspectRatio stage (layered CSS gradients standing in for the frame, centered play overlay while paused, caption strip when CC is on, and a bottom chrome bar over a scrim — scrub Slider with fixed chapter tick marks, '4:07 / 18:42' tabular timecode, mute, CaptionsIcon ToggleButton, settings, picture-in-picture, theater ToggleButton that reflows the page, full screen), then title Heading, channel row (Avatar, '284K subscribers', Subscribe Button that toggles to Subscribed, like/dislike ButtonGroup with an adjusting like count, Share), a Collapsible description Card with view count, upload-date Timestamp, clickable chapter list that moves the playhead, and a gear Thumbnail strip, and a comments list with a Top/Newest sort SegmentedControl and one creator-heart Badge; the right 384px rail stacks 12 up-next rows (gradient thumbs, duration chips, red watched-progress bars on three) under an Autoplay Switch, and drops below the player under 1152px. Choose over live-stream-viewer for on-demand video with comments instead of a live chat rail, and over browser-session-replay when the stage is entertainment playback chrome, not captured agent frames.",
  category: 'Media - Video Watch Page',
  componentsUsed: [
    'AspectRatio',
    'Avatar',
    'Badge',
    'Button',
    'ButtonGroup',
    'Card',
    'Collapsible',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'SegmentedControl',
    'Slider',
    'Switch',
    'Text',
    'Thumbnail',
    'Timestamp',
    'ToggleButton',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
