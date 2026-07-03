import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Headings & List Patterns Gallery',
  description:
    'Five-panel gallery of content-structure patterns staged on one project-management domain: page headings (title+meta+actions, avatar+status Badge, breadcrumb eyebrow with a sprint pager, banner with gradient cover strip), card headings (inline action link, description with icon MoreMenu, attached TabList), section headings (rule, action buttons, inline filter tabs, role Selector), description lists (striped two-column, narrow stacked, dark card, inline-edit rows), and stacked lists (avatar+chevron rows, status rows with action menus, checkbox rows with a bulk bar, alphabet-grouped directory) — indexed by a scroll-spying rail.',
  category: 'UI Kit - Headings & List Patterns Gallery',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Breadcrumbs',
    'Button',
    'Card',
    'CheckboxInput',
    'Divider',
    'Icon',
    'IconButton',
    'Layout',
    'List',
    'MoreMenu',
    'Selector',
    'TabList',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
