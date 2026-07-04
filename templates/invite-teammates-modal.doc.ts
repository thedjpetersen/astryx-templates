import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Invite Teammates Modal',
  description:
    "Workspace-invite dialog for the Kestrel Labs 'Atlas Q3 team space' (9 members), shown as three side-by-side specimens of the same 440px modal card on a soft warm-tinted stage, mono caption labels above each: specimen 01 is the open compose state — an email chips input with two valid Tokens and one invalid chip ('ben.okafor@kestrel') carrying a red wavy underline plus a detached FieldStatus hint, per-invite Member/Guest role Selectors (invalid row disabled until fixed), the workspace-preview row (compass icon tile, name, '9 members'), a prefilled personal-message TextArea naming the 'Atlas Q3 Launch Plan' doc and #atlas-q3, and the invite-link section (mono join link, Copy button with Copied state, link-role Selector, 'Expires in 7 days' chip, regenerate affordance that revokes the old link) under a count-bearing primary action ('Send 3 invites' that tracks chip removal live); specimen 02 is the sent confirmation — success Banner plus two rows with Pending badges and Resend affordances and one row converted to an 'Already in workspace — joined Jul 1' note (Ava Lindqvist); specimen 03 is the guest-warning variant — Guest selected on the role Selector for beta-cohort customer lena.fischer@brightloop.io reveals the limited-access note and a warning Banner spelling out what guests cannot see (flips off live when the role returns to Member). Choose over doc-share-publish when the surface is inviting people INTO a workspace (membership, roles, join links), not the per-document access/publish dialog with viewer/commenter/editor rows and a publish tab; choose over mail-compose when the chips address workspace invites with roles and expiring links rather than composing an outgoing email with Cc/Bcc, attachments, and scheduling; choose over referral-rewards-card when the inviter is a teammate growing a team workspace, not a consumer sharing a referral code for rewards.",
  category: 'Team Workspace',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'Divider',
    'FieldStatus',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Selector',
    'StackItem',
    'Text',
    'TextArea',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
