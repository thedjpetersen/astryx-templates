import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Feature Gate Console',
  description:
    'Runtime kill-switch ops console for gated fixes: a header with explainer and Refresh/Sentry Buttons, a 3-card KPI row (Gate State 11/14 enabled, Last Changed with admin email, Telemetry Window Last 24h · 1h buckets), rollout batch Cards with Enable/Disable-this-batch actions and 3/5-enabled counts, a dependency-free telemetry section (24 vertical div bars in an emerald chart beside three ranked count lists — By gate / By event / Suppressed — each row a mono label, tabular count, and thin proportional bar), and a master gate Table combining a 5-state dot health vocabulary (Healthy emerald, Warning amber, Suppressing amber, Off muted, No signal muted), Enabled/Disabled Badges, batch Tokens, prose risk column, mono Sentry-query Links, and right-aligned Switches. Choose over settings-secrets-env or automation-rule-builder when the surface is operational flag toggling with health telemetry, not credential management or rule authoring.',
  category: 'Tools - Feature Flags',
  componentsUsed: [
    'Badge',
    'Banner',
    'Button',
    'ButtonGroup',
    'Card',
    'Code',
    'Divider',
    'Grid',
    'Icon',
    'IconButton',
    'Layout',
    'Link',
    'MetadataList',
    'ProgressBar',
    'StatusDot',
    'Switch',
    'Table',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
