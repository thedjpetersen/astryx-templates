import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Release Train',
  description:
    'Release-management overview for a weekly ship train: a horizontal rail of SelectableCard train stops (version, codename, branch Code, and Cut/Freeze/Ship milestone rows that check off as each train advances), a selected-release fact sheet (MetadataList of branch/captain/schedule plus a No-Go freeze Banner), a feature Table pairing mono flag Codes with On/Ramping/Dark/Unflagged Badges and thin rollout bars, a blocking-issue List with severity StatusDots and Open/Verifying/Mitigated Tokens, and a resizable readiness panel holding the derived Go/No-Go verdict Badge, a sign-off ProgressBar over an owner CheckboxInput checklist, and a cherry-pick queue with Approve/Deny/Undo Buttons. Choose over feature-gate-console when the surface is release scheduling and ship gating across versions, not flag toggling with telemetry; choose over kanban-board when work is grouped by release vehicle and dates, not by workflow stage.',
  category: 'Planning - Release Train',
  componentsUsed: [
    'Badge',
    'Banner',
    'Button',
    'ButtonGroup',
    'Card',
    'CheckboxInput',
    'Code',
    'Divider',
    'Icon',
    'Layout',
    'List',
    'MetadataList',
    'ProgressBar',
    'Resizable',
    'SelectableCard',
    'StatusDot',
    'Table',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
