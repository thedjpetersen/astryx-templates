import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Streaming Browse Home',
  description:
    "Streaming-service browse home on a dark full-bleed surface: a sticky 64px nav row (brand mark, Home/Shows/Movies/My List TabList, SearchIcon + notifications IconButtons, Avatar), a 420px hero billboard drawn with layered CSS gradients ('Station Zero' display Heading, '97% match · 2026 · TV-14 · 2 Seasons' Badge row, genre Tokens, two-line synopsis, PlayIcon 'Play' Button that flips to a PauseIcon 'Pause' preview state + InfoIcon 'More info' Button + add-to-list ToggleButton whose PlusIcon flips to CheckIcon, hero mute IconButton), then stacked horizontal Carousel rails: 'Continue Watching' 16:9 cards with red ProgressBars, resume labels, and a MoreMenu 'Remove from row' that filters the fixture array; 'Trending Now' with oversized outlined rank numerals beside 2:3 poster placeholders; 'New Releases' with 'New' / 'Recently added' Badges; and 'Because you watched Station Zero' with match percentages. Every poster is a deterministic two-color gradient keyed to the title with an inline-SVG initial, and hovering a card elevates it with a subtle scale and ring. The only Media template that is pure merchandising browse — choose over video-watch-page when nothing is playing yet, and over product-list when the rows are horizontally scrolling poster rails, not a commerce grid.",
  category: 'Media - Streaming Browse Home',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Carousel',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MoreMenu',
    'ProgressBar',
    'TabList',
    'Text',
    'ToggleButton',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
