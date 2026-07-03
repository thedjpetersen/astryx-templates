import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Album Tracklist Player',
  description:
    "Music album page with a persistent now-playing dock: a scrolling content region opens with a gradient hero band (176px square cover-art placeholder with inline-SVG monogram, 'Album' eyebrow, large title, artist Link, '2025 · 11 songs · 42 min'), an action row (large circular PlayIcon Button, ShuffleIcon and HeartIcon ToggleButtons, MoreMenu), then a track Table (# / title+artist / plays / heart / duration) where the playing row swaps its number for an AudioLinesIcon and gets a soft rounded cover-tinted highlight; below, an 'About the artist' Card with a monthly-listener stat. A persistent bottom bar (single 80px row on desktop, stacked with 40px transport tap targets on phones) shows the current track thumb+title, a ShuffleIcon/SkipBackIcon/play-pause/SkipForwardIcon/Repeat2Icon transport, a scrub Slider with 1:47/4:23 timecodes, and a volume Slider with VolumeXIcon mute toggle. Choose over podcast-episode-player when the unit is a tracklist you click through, and over playlist queue surfaces when the catalog page itself is the hero.",
  category: 'Media - Album Tracklist',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Link',
    'MoreMenu',
    'Slider',
    'Table',
    'Text',
    'ToggleButton',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
