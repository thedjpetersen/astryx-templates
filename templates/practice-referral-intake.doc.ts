import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Practice Referral Intake",
  description: "Therapy website experience for a practice referral intake board, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for care coordinators triaging referrals and match readiness.",
  category: "Therapy - Practice Ops",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
