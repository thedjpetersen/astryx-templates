import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Deployment Detail',
  description:
    'Deployment status page with build status header, metadata grid, and terminal LogStream replay for build output.',
  category: 'Tools - Deployment Detail',
  componentsUsed: [
    'Button',
    'Card',
    'EmptyState',
    'Layout',
    'LogStream',
    'MetadataList',
    'StatusDot',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;

