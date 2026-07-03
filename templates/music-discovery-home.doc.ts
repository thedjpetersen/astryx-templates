import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Music Discovery Home',
  description:
    "Music-streaming discovery home for the fictional service 'Wavelength' on a scheme-locked near-black stage with a single green brand accent: a sticky 64px nav (AudioWaveformIcon brand mark, All/Music/Podcasts filter chips that filter the feed in place, search + notifications IconButtons, Avatar), a 'Good evening' greeting header over a 3x2 grid of time-aware mix tiles (64px deterministic gradient covers, hover-revealed green play fabs that load the mix into the transport), a 'Made for you' Carousel shelf of daily-mix cards (gradient collage art with numbered 'Mix 01' corner plates, two-line artist lists), a 'New releases' shelf with Album/Single/EP kind captions, a 'Jump back in' compact grid of 48px-art rows (round art for artists, AudioLinesIcon on the playing row), a 280px friend-activity LayoutPanel rail whose '3 live' Badge equals its green-dot 'now' rows, and a pinned 88px now-playing LayoutFooter bar: track identity with HeartIcon like ToggleButton, shuffle/back/play-pause/forward/repeat transport, a scrub Slider between 1:23 / 3:47 tabular timecodes with reserved thumb padding, a green 'Loft speaker' device chip, and a volume Slider with mute toggle. Every cover is a two-color gradient keyed by a deterministic title hash — zero assets, zero clocks. Choose over streaming-browse-home when the surface is a music service with a persistent bottom transport and friend-activity rail rather than a video poster-rail browse, and over album-tracklist-player when the user is discovering across mix/release shelves on the home feed, not clicking through one album's track Table.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Carousel',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Slider',
    'StackItem',
    'Text',
    'ToggleButton',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
