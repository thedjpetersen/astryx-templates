import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'SaaS App Catalog & Provisioning',
  description:
    'IT-admin SaaS seat-management console for a workforce platform (Kestrel Labs, 140 people): a KPI strip (6 managed apps, 519/563 seats, $13,668/mo spend, $1,980/mo reclaimable, 6 queued grants) above a filterable, sortable grid of app ClickableCards (Slack, GitHub, Figma, Notion, Salesforce, Zoom) — each with a brand monogram tile, SSO-posture badge (enforced / configured / optional), seat usage with utilization bar, monthly cost, and a provisioning-rule chip (auto by department vs manual request); plus a 380px selected-app panel with seat usage and the two in-flight hires’ queued onboarding grants, a license-renewal countdown with contract metadata, a group-based assignment-rules table whose seats sum to the assigned count, a seat-reclaim suggestion (12 idle Salesforce seats, $1,980/mo savings, with a working Reclaim action that re-computes every total), and a deprovisioning-policy note. Choose over settings-extension-catalog when the job is administering paid SaaS seats, SSO posture, and license spend for an org rather than browsing and installing marketplace extensions; choose over automation-rule-builder when assignment rules are a read-only group-grant policy table, not a condition-action editor; choose over hr-onboarding-flow when the focus is per-app seat and license administration, not a single hire’s cross-team checklist.',
  category: 'Workforce IT',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'ClickableCard',
    'Divider',
    'EmptyState',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'MetadataList',
    'ProgressBar',
    'SegmentedControl',
    'Selector',
    'StackItem',
    'Table',
    'Text',
    'TextInput',
    'Timestamp',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
