import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Signup with Password Strength',
  description:
    "Phone-to-narrow signup state sheet for the fictional dev tool 'Basecoat' (copper accent): two captioned 430px signup-card specimens on one muted copper-tinted stage. The Good state shows a work-email field with a clickable 'Did you mean maya@gmail.com?' typo-suggestion chip that applies the correction on click, a password field with a live reveal toggle, a 4-segment strength meter filled 3/4 in lime under the 'Good' label (red/orange/lime/green progression), a four-rule requirement checklist (length / number / symbol / doesn't-contain-your-email) with two just-satisfied rows frozen mid-pop into green checks, a confirm field with a 'Passwords match' success indicator, a checked terms checkbox, the ENABLED copper Create-account CTA, and an 'or sign up with' divider over Google/GitHub provider buttons; the Weak state freezes the first attempt — revealed password 'maya2026' scoring 1/4 red 'Weak', three unmet checklist rows, empty confirm field, unchecked terms, and the CTA disabled behind a 'meet all four rules' helper line. Choose over auth-sign-in-showcase when the deliverable is the signup card's strength/validation anatomy as a frozen good-vs-weak state matrix — a component reference sheet, not a variant-switched interactive auth flow inside a framed browser viewport; choose over otp-verification-screen when the screen under study is password creation with strength feedback, not one-time-code entry; choose over composer-state-gallery when the anatomy under study is a signup form, not a chat composer.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Badge',
    'Button',
    'CheckboxInput',
    'Divider',
    'FieldStatus',
    'Heading',
    'Icon',
    'IconButton',
    'Layout',
    'Link',
    'Text',
    'TextInput',
    'Token',
  ],
} satisfies AstryxBlockTemplate;

export default template;
