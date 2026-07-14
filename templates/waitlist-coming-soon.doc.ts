import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Waitlist Coming Soon',
  description:
    'Atmosphere-first pre-launch waitlist page for a fictional spatial-notes product: a condensing sticky navbar over a hero theater — aurora blobs and grain behind an oversized drifting gradient wordmark, with bobbing satellite mini-cards that parallax toward the pointer — and a validating email capture that flips to a glass count-up "You\'re #1,247 in line" position card with a copyable referral link and a working skip-ahead demo stepper (each referral animates the position down 50 spots and refills a next-100-bracket ProgressBar). Below: an asymmetric teaser split (one revealed feature card with a composed canvas mock, two frosted "Revealing soon"), a pinned scroll-story roadmap whose progress advances three clickable phases and draws an SVG fold path (static meter under reduced motion/compact widths), a scheme-locked dark follow band with glass social cards and a pointer spotlight, and a minimal footer. Choose it over saas-landing-page when the product has not shipped yet and the entire page exists to collect one email.',
  category: 'Marketing - Waitlist Coming Soon',
  componentsUsed: [
    'Button',
    'Icon',
    'Layout',
    'ProgressBar',
    'Text',
    'TextInput',
  ],
} satisfies AstryxPageTemplate;

export default template;
