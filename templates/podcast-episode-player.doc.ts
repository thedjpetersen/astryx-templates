import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Podcast Episode Player',
  description:
    "Podcast episode listening page: a centered 720px column with an episode hero (square gradient cover with inline-SVG soundwave mark, show eyebrow Link, episode title, 'Episode 87 · 52:14 · Jun 24, 2026' meta row, host/guest Avatars) above a playback-synced transcript where each cue ClickableCard shows a speaker Avatar initial, name, mm:ss cue time, and paragraph text — the cue containing the playhead gets a primary-tinted highlight and a Playing Badge, an auto-scroll Switch keeps it in view, and clicking any cue or chapter row seeks the playhead; a right 320px LayoutPanel carries a Chapters | Show notes TabList (chapter rows with start times and per-chapter ProgressBars, Markdown show notes with links and a sponsor line); and a persistent bottom player bar (cover thumb, title, SkipBack/Play/SkipForward transport, scrub Slider with elapsed/total tabular readouts, 1x/1.25x/1.5x/2x speed SegmentedControl, Volume2/VolumeX mute toggle). Choose over transcript-annotator when the transcript is playback-synced listening, not labeling, and over album-tracklist-player when the surface is one long episode with chapters, not a tracklist.",
  category: 'Media - Podcast Episode Player',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Breadcrumbs',
    'Button',
    'ClickableCard',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Link',
    'List',
    'Markdown',
    'ProgressBar',
    'SegmentedControl',
    'Slider',
    'Switch',
    'TabList',
    'Text',
    'Timestamp',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
