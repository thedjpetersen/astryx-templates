import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Join & Consent Cards',
  description:
    'Centered auth-flow page with three sequential consent cards switched by a numbered stepper in page chrome: a workspace invite Card (workspace tile with mono hashtag, description, MEMBERS AvatarGroup with a crown-marked admin, Decline/Join — joining animates through staged Spinner text to a success check), an OAuth consent card (requesting-app tile, PERMISSIONS REQUESTED rows with check icons, Deny/Authorize with denied and granted end states), and a device-authorization card (giant tracked mono pairing code, requesting-CLI metadata, Cancel/Authorize with success and canceled states). Choose over auth-sign-in-showcase when the surface is post-sign-in consent — joining, granting, and pairing — not credential entry.',
  category: 'AI Chat - Join & Consent',
  componentsUsed: [
    'Avatar',
    'AvatarGroup',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'Icon',
    'Layout',
    'Spinner',
    'Text',
  ],
} satisfies AstryxPageTemplate;

export default template;
