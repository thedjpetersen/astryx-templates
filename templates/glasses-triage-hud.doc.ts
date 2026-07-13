import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Glasses Triage Card',
  description:
    'Fixed 600×600 smart-glasses HUD for triaging agent questions one card at a time: a pulsing attention header with a ‹ › "Needs you 1/3" stepper pill, per-item effort pill (QUICK YES/NO / NEEDS REVIEW), 24px question, cyan-bordered Recommended panel, "You last said" anchor, AGENT FOUND bullets, and glowing decision chips with working selection. A 5-icon glass toolbar (56px round buttons) snoozes/archives with a toast and advances, ending on a "✓ All clear" empty step. Choose over token-based dashboards when the surface must read as wearable hardware — the stage is a scheme-locked black HUD centered on a token backdrop.',
  category: 'AI Chat - Wearable HUD',
  componentsUsed: ['Icon', 'Layout', 'Text', 'Tooltip'],
} satisfies AstryxPageTemplate;

export default template;
