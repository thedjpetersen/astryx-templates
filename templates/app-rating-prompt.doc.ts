import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'In-App Rating Flow',
  description:
    "Rate-us interception flow for the fictional journaling app Fable Ink (plum accent), shown as three live specimens of one prompt card side by side on a soft plum-tinted stage, mono caption labels under each: specimen 01 is the initial ask — 'Enjoying Fable Ink?' with five 44px tappable stars frozen in a 4-star hover-preview state ('4 — Really good' hint line) and a Not-now link; specimen 02 is the low-rating branch — 3 stars selected reveals a feedback textarea with placeholder, toggleable category chips (Bugs / Missing feature / Confusing), and a plum Send-feedback button that resolves into a thanks strip; specimen 03 is the high-rating branch — 5 stars reveals the 'mind leaving a quick review?' ask with a plum store CTA and a Maybe-later link. Every card is interactive: tapping stars re-branches it live (1–3 feedback, 4–5 review ask). Choose over product-features-reviews when the surface is the app's own rate-us interception moment (ask → branch → store handoff), not a PDP reviews region with histograms and a write-a-review form; choose over status-feedback-gallery when the deliverable is one branded rating flow's states, not a generic alert/empty/progress/pagination pattern catalog; choose over hr-engagement-survey when the respondent is a consumer rating an app in the moment, not an employee completing a workplace survey form.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Heading',
    'HStack',
    'Icon',
    'StackItem',
    'Text',
    'TextArea',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
