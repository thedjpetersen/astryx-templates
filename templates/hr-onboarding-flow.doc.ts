import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'New-Hire Onboarding Flow',
  description:
    'Per-hire onboarding command center for a workforce platform (Kestrel Labs, 140 people): a 280px in-flight-hire rail with per-hire progress bars, at-risk dots, and a pinned open-task summary; a content column with an at-risk banner for the overdue IT task (with a remind-owner action), a five-phase chip timeline (Offer signed / Accounts / Equipment / Day 1 / Week 1) whose counts derive live from the checklist, a horizontal day-1 agenda strip of time-slot cards, and a cross-team task checklist grouped by owner team (People, IT, Manager, Payroll) with checkbox check-off, due badges, and status tokens; plus a 340px side panel with e-sign document rows (offer / W-4 / handbook, signed vs awaiting-signature) and an equipment shipment card with asset tag, carrier tracking number, and a stepped tracking timeline. Choose over esignature-envelope-flow when the job is running a hire’s cross-team onboarding — document rows here report signature status only, never a signing ceremony.',
  category: 'Workforce HR',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'CheckboxInput',
    'Collapsible',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'MetadataList',
    'ProgressBar',
    'Selector',
    'StackItem',
    'StatusDot',
    'Text',
    'Timestamp',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
