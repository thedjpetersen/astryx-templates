import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Waitlist Coming Soon',
  description:
    'Single-purpose pre-launch waitlist page for a fictional spatial-notes product: a sticky anchor navbar over a hero with an oversized drifting gradient wordmark and a validating email capture that flips to a count-up "You\'re #1,247 in line" position card with a copyable referral link and a working skip-ahead demo stepper (each referral animates the position down 50 spots and refills a next-100-bracket ProgressBar). Below the fold: three teaser cards (two frosted "Revealing soon"), a dated three-stage launch progress meter, a follow/social row, and a minimal footer. Choose it over saas-landing-page when the product has not shipped yet and the entire page exists to collect one email.',
  category: 'Marketing - Waitlist Coming Soon',
  componentsUsed: [
    'Button',
    'Heading',
    'Icon',
    'Layout',
    'ProgressBar',
    'Text',
    'TextInput',
    'Token',
  ],
} satisfies AstryxPageTemplate;

export default template;
