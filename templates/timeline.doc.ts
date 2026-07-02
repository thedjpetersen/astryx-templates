import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Timeline',
  description:
    'Service activity feed: chronological vertical timeline grouped under sticky date headers, icon markers on a connector rail, actor Avatars with Timestamps, detail Cards for deploys/alerts/comments, and a working event-type SegmentedControl filter.',
  category: 'Content - Timeline',
  componentsUsed: [
    'Avatar',
    'Card',
    'EmptyState',
    'Icon',
    'Layout',
    'SegmentedControl',
    'StatusDot',
    'Timestamp',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
