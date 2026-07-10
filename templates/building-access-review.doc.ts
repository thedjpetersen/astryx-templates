import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Building Access Review',
  description:
    'Doorward quarterly badge-review console: a manager attestation queue with per-person badge-group chips that flip keep/revoke, an orphaned-access detector with severity spines and dormancy meters, and a 304px revocation batch tray. Queuing findings from either surface re-derives the coverage ring, orphan count, and batch rollup; executing the batch stamps a new entry into the audit log and strikes revoked chips back in the queue.',
  category: 'Security - Building Access Review',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'LayoutPanel'],
} satisfies AstryxPageTemplate;

export default template;
