import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Sign-in & Registration Showcase',
  description:
    "Variant-switched auth showcase presenting four full screens inside a framed browser viewport (traffic-light dots + a fake per-variant URL like 'app.lumenroute.com/sign-in'): a centered sign-in card with email/password, a password-reveal eye toggle, remember-me CheckboxInput, 'Continue with Google/GitHub' SSO Buttons, and a forgot-password Link; a split-brand variant pairing the same form with a gradient testimonial panel ('Routes just stopped colliding.' — Maya Okafor, with 3,200+ routes/day stats) that collapses to a strip on small screens; a registration form with full name/work email/password, a live password-strength ProgressBar (Weak/Fair/Good/Strong) over a four-rule checklist, and a required terms Checkbox; and a passwordless flow that advances from email entry to a six-box verification-code input with auto-advance, backspace, paste support, and a 24-second resend countdown. Validation is real — malformed emails and weak passwords show inline errors, the fixture password 'Solar-Batteries-42' shows a loading Button then a success screen while any other password shakes the card behind a wrong-password Banner, and the wrong code shakes and clears the boxes. A demo toolbar pre-fills fixtures or triggers each error path. Choose over form-page when the surface is authentication screens (sign-in, registration, one-time code) rather than a settings form, and over cli-pairing-console when the code entry is a user-typed six-box input, not a displayed pairing code.",
  category: 'Form - Sign-in & Registration Showcase',
  componentsUsed: [
    'Banner',
    'Button',
    'Card',
    'CheckboxInput',
    'Divider',
    'FieldStatus',
    'Icon',
    'IconButton',
    'Layout',
    'Link',
    'ProgressBar',
    'SegmentedControl',
    'Selector',
    'TextInput',
    'Toast',
  ],
} satisfies AstryxPageTemplate;

export default template;
