import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Video Editor Project Browser',
  description:
    "Front-door project & sequence browser for an NLE suite: a 52px header (ClapperboardIcon + 'Astryx Studio' brand, project/sequence count readout, project search TextInput, primary New Project Button), a 300px left Open-recent rail whose sequence rows carry mono names with duration · tracks · last-edit metadata, and the defining region — a poster grid of project cards (16:9 inline-SVG gradient posters with per-project motifs for the 'Harbor Light' documentary and its sibling projects, kind Badges, sequence/media readouts, collaborator AvatarGroups, inset accent ring on the open project) above a sequences Table for the open project (mono sequence names with StatusDots, resolution, right-aligned fps/duration/track columns, modified stamps, row-click selection) — plus a 48px storage/backup status strip (scratch-drive ProgressBar, last-backup StatusDot, auto-backup Switch) and a scrim New-Project Overlay whose modal-style card offers a name TextInput and format-preset SelectableCards (4K UHD 24, HD 25, HD 29.97, Vertical 9:16 30) that append a real draft project card. The entry point of the Video Studio suite — choose over video-editor-media-bin when the user picks which project/sequence to open rather than browses source assets inside one project, and over video-editor-workspace when nothing is on a timeline yet.",
  category: 'Media - Project Browser',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Badge',
    'Button',
    'Divider',
    'HStack',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'Overlay',
    'ProgressBar',
    'SelectableCard',
    'Selector',
    'Slider',
    'StatusDot',
    'Switch',
    'Table',
    'Text',
    'TextInput',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
