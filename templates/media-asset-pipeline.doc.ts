import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Media Asset Pipeline',
  description:
    "Media asset and transcode operations manager: a left 240px rail with a folder TreeList (All assets, Raw uploads, Renditions, Archive) above a storage Card ('1.4 TB of 2 TB' ProgressBar); a main asset Table with Thumbnail placeholder, filename, type Badge (video/audio/image), duration, size, and a pipeline-state column mixing an in-flight upload ProgressBar (42%), a 'Queued' Badge, a Spinner 'Transcoding 68%', a green 'Ready' check, and a red 'Failed' state with the error in a Tooltip; selecting a row opens a right 360px detail LayoutPanel (overlaying under 1280px) with a 16:9 preview placeholder, a renditions mini-Table (1080p / 720p / 480p / HLS ladder with codec, bitrate, size, per-rendition status), a MetadataList (codec, fps, uploaded-by, clearly fake ast_/sum_ short ids), and Retry/Download/Delete actions; a bulk-select checkbox column summons a count Toolbar. The Media batch's ops surface — choose over table-bulk-actions when rows carry live pipeline states and renditions, and over file-browser-preview when the story is transcoding, not browsing.",
  category: 'Media - Asset & Transcode Manager',
  componentsUsed: [
    'AspectRatio',
    'Badge',
    'Breadcrumbs',
    'Button',
    'Card',
    'CheckboxInput',
    'Divider',
    'EmptyState',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'ProgressBar',
    'SegmentedControl',
    'Spinner',
    'StatusDot',
    'Table',
    'Text',
    'TextInput',
    'Thumbnail',
    'Toolbar',
    'Tooltip',
    'TreeList',
  ],
} satisfies AstryxPageTemplate;

export default template;
