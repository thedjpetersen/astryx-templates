import type {AstryxIntegrationTemplate} from '../types/astryx-cli.js';

const template = {
  type: 'page',
  name: 'Profile Page',
  description:
    'People-directory profile with a centered document column: identity header (large Avatar, name/role, Follow and Message Buttons), a 4-up Stat card row, and an Activity/Details TabList switching between a divided activity List and MetadataList facts with skill Tokens.',
  category: 'Content - Profile Page',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Breadcrumbs',
    'Button',
    'Card',
    'Grid',
    'Layout',
    'List',
    'MetadataList',
    'MoreMenu',
    'Stat',
    'TabList',
    'Token',
  ],
} satisfies AstryxIntegrationTemplate;

export default template;
