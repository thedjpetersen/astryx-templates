import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Index/Detail Table',
  description:
    'Field-service job dispatch surface with a master Table whose selected row (first row selected by default, keyboard accessible) populates an end-panel detail pane: heading, StatusDot state, action buttons, MetadataList, and a related-jobs site-history List that jumps selection.',
  category: 'Table - Index/Detail',
  componentsUsed: [
    'Button',
    'Divider',
    'Layout',
    'List',
    'MetadataList',
    'StatusDot',
    'Table',
    'Timestamp',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
