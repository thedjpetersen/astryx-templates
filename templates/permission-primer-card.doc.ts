import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Notification Permission Primer',
  description:
    'Small centered pre-permission primer for the fictional social app Chirp (sunny yellow accent): a phone-width card on a subtle stage with a gradient-blob bell illustration, a "Never miss a reply" headline, three benefit bullets with tinted mini icons (replies, mentions, a likes digest), a brand-yellow "Turn on notifications" primary CTA over a ghost "Maybe later", and a "change anytime in Settings" fine-print footer — with a dimmed, non-interactive faux iOS system-dialog specimen stacked beneath ("System prompt follows", Don’t Allow / Allow) that un-dims with an accent ring when the primer is accepted; "Maybe later" collapses into a snoozed note with Undo. Choose over notification-center when the deliverable is the pre-permission ask itself (primer + OS-prompt specimen), not an in-app feed of received notifications; choose over onboarding-guided-install when you need one focused permission moment rather than a multi-step setup wizard.',
  category: 'Startup Showcase',
  componentsUsed: ['Badge', 'Heading', 'Icon', 'Text'],
} satisfies AstryxBlockTemplate;

export default template;
