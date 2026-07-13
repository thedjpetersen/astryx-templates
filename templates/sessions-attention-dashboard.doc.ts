import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Sessions Attention Split',
  description:
    'Two-bucket live sessions dashboard that splits running agent sessions into "Inference Bound" (agent working, Spinner state lines) and "You\'re in the Way" (amber waiting age, Nudge / Open / Mark handled actions). Session Cards carry workspace Tokens, mono node labels, and sub-agent count Badges; a workspace Selector filters both buckets and a Collapsible legend explains the split rules. Choose over mission-control-kanban when the question is "what is blocked on me right now", not full pipeline stage tracking.',
  category: 'AI Chat - Session Triage',
  componentsUsed: [
    'Badge',
    'Button',
    'Card',
    'Collapsible',
    'Heading',
    'Icon',
    'Layout',
    'Selector',
    'Spinner',
    'StatusDot',
    'Text',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
