import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Dunning Workbench',
  description:
    'Billing recovery desk for failed subscription payments: a five-stage recovery funnel strip that doubles as queue filters, a shared 21-day retry-schedule board plotting declines, failed attempts, and path-scheduled retries per account, and a playbook pane where applying a retry path + A/B outreach template redraws the schedule and re-derives the funnel counts and recovery forecast live.',
  category: 'Commerce - Dunning Workbench',
  componentsUsed: [
    'Layout',
    'LayoutHeader',
    'LayoutContent',
    'Heading',
    'Text',
    'Avatar',
    'Button',
    'Divider',
    'Icon',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
