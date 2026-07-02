import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Search Results Page',
  description:
    'Developer-docs search surface with a prominent header search bar, a CheckboxList facet rail with counts (content type, product area, last updated), a ranked result list of Link titles, highlighted snippets, and metadata rows, plus a sort Selector and Pagination footer.',
  category: 'Tools - Search Results Page',
  componentsUsed: [
    'Badge',
    'Button',
    'CheckboxList',
    'Divider',
    'EmptyState',
    'Layout',
    'Link',
    'Pagination',
    'Selector',
    'TextInput',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
