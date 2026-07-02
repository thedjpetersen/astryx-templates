import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Incident Console',
  description:
    'On-call incident response console with grouped incident rows, PowerSearch filtering, status controls, and a resizable inspector panel. Frame-first tracker archetype: rows, not cards.',
  category: 'Tools - Incident Console',
  componentsUsed: [
    'Button',
    'EmptyState',
    'Layout',
    'List',
    'MetadataList',
    'PowerSearch',
    'Resizable',
    'SegmentedControl',
    'StatusDot',
    'Timestamp',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;

