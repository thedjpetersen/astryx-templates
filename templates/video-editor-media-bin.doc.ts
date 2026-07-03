import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Video Editor Media Bin',
  description:
    "Project media browser for an NLE: a 248px left bin rail (TreeList of Footage/Audio/Graphics leaf bins with per-bin counts, two smart bins — Used in timeline, Needs proxy — and a scratch-drive ProgressBar footer), a header with project name, Synced Badge, search TextInput, Grid/List SegmentedControl, and a primary Import Button; and the defining region — a media grid whose top carries a dashed import dropzone strip (queued-import ProgressBar, '2 queued' Badge) and a filter toolbar of clickable tag Tokens, a sort Selector, and a thumbnail-size Slider. Grid tiles are scheme-locked dark 16:9 thumbnail stages ('Harbor Light' documentary fixtures: interview masters, harbor B-roll, dialog/ambience/score WAVs with CSS waveforms, alpha graphics) carrying duration badges, codec/resolution/fps metadata pills, timeline-usage ×N badges, and proxy StatusDots; every tile and list row opens a HoverCard preview with filmstrip, SMPTE duration, full metadata, and timeline placements, while list mode swaps tiles for fixed-column rows with right-aligned numerics. Choose over video-clip-timeline when the user organizes and inspects source media in bins rather than arranges clips on lanes, and over media-asset-pipeline when assets are browsed and filtered rather than tracked through encode jobs.",
  category: 'Media - Asset Browser',
  componentsUsed: [
    'Badge',
    'Button',
    'Divider',
    'EmptyState',
    'HStack',
    'Heading',
    'HoverCard',
    'Icon',
    'Layout',
    'ProgressBar',
    'SegmentedControl',
    'Selector',
    'Slider',
    'StatusDot',
    'Text',
    'TextInput',
    'Token',
    'Tooltip',
    'TreeList',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
