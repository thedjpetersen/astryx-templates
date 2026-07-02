import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Skill Package Detail',
  description:
    'Registry-style detail page for one installable agent skill: identity header with back arrow, badge cluster (default blue, private amber lock, mono version), owner/installs/node meta line, and a right-aligned Enabled Switch; a collapsible triggers summary row; and a Content|History TabList. Content is a mini read-only code browser — mono file tab strip with extension-tinted file icons and an "exec" Badge over a line-numbered CodeBlock — plus a visibility footer Card with a "Make public" Button. History is a version changelog of expandable edit Cards headed by "v2 → v3" mono Badges that open into per-file diff rows with Added/Removed/Modified Badges, +N/−N counters, dual-gutter diff lines, and "···" hunk separators. Choose over diff-viewer when diffs live inside a package\'s version history, and over settings-extension-catalog when the surface is one package\'s detail, not a catalog grid.',
  category: 'Content - Package Detail',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Code',
    'CodeBlock',
    'Collapsible',
    'Divider',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MetadataList',
    'Switch',
    'TabList',
    'Text',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
