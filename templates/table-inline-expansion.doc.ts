import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Table with Inline Expansion',
  description:
    'API endpoint registry as a full-width table where a per-row toggle IconButton expands the row in place, revealing a colSpan detail region with description, MetadataList runtime facts, related endpoints, and quick actions.',
  category: 'Table - Inline Expansion',
  componentsUsed: [
    'Badge',
    'Button',
    'Code',
    'IconButton',
    'Layout',
    'MetadataList',
    'Table',
  ],
} satisfies AstryxPageTemplate;

export default template;
