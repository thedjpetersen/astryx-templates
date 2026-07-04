import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'OTP Verification Screen',
  description:
    "Phone-width OTP verification state sheet for the fictional fintech 'Northbeam' (steel-blue accent): three captioned specimens on one muted stage, each a 390px phone frame with a 9:41 status bar. The entering state shows the 'Check your email' header over the masked address d•••a@brightfield.co, six 46px code boxes with four digits entered and the steel-blue focus ring + static caret parked on the fifth, a resend row gated by a frozen 0:24 countdown chip, a full-width 'Open mail app' secondary Button, and a change-address / contact-support help footer; the expired state stacks a 'This code expired' error Banner above six red boxes frozen mid-shake with an ACTIVE resend link that swaps in a 'New code sent' info Banner and clears the boxes; the compact verified state morphs the box row into an accent checkmark disc above a '724 913 · verified' chip and a signing-you-in progress-dots line. Choose over auth-sign-in-showcase when the deliverable is the OTP screen itself as a frozen entering/expired/verified state matrix — a component reference sheet, not a variant-switched interactive auth flow inside a framed browser viewport; choose over composer-state-gallery when the anatomy under study is a verification code screen, not a chat composer.",
  category: 'Startup Showcase',
  componentsUsed: [
    'Badge',
    'Banner',
    'Button',
    'Divider',
    'Heading',
    'Icon',
    'Layout',
    'Link',
    'Text',
    'Token',
  ],
} satisfies AstryxBlockTemplate;

export default template;
