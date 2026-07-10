import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Security Incident War Room',
  description:
    'Sitrep incident-command surface for INC-2417: a derived posture band with auto-composed executive summary, a horizontal T+ timeline spine with phase bands, lane-coded event pips, and a fixed now-line, three parallel workstream lanes (containment, forensics, comms) with done/active/blocked/pending task cards, and a 304px blast-radius asset panel. Completing a containment task appends a spine pip, advances the lane phase, unblocks cross-lane dependents, flips linked assets to contained, and can de-escalate the SEV posture.',
  category: 'Security - Security Incident War Room',
  componentsUsed: ['Layout', 'LayoutHeader', 'LayoutContent', 'LayoutPanel'],
} satisfies AstryxPageTemplate;

export default template;
