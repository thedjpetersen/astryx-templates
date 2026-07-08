import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Client Risk Escalation Panel",
  description: "Therapy website experience for a client risk escalation panel, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for clinical teams responding to elevated-risk client signals.",
  category: "Therapy - Safety",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
