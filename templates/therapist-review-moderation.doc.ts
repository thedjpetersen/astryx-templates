import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: "Review Moderation",
  description: "Therapy website experience for a therapist testimonial moderation queue, including discovery, trust cues, care logistics, privacy guidance, and clear next-step actions for practice teams reviewing client-facing testimonials and safety constraints.",
  category: "Therapy - Trust",
  componentsUsed: ['Icon', 'Button', 'Card', 'SegmentedControl'],
} satisfies AstryxPageTemplate;

export default template;
