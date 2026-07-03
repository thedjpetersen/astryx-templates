import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'I-9 & Work Authorization',
  description:
    'Federal work-authorization compliance tracker for a workforce platform (Kestrel Labs, 140 active records, fixed Jul 29 2026 snapshot): a completion summary strip (segmented 140-record bar + stat tiles for 137 verified, 2 pending Section 2, 1 reverification due, 2 flagged for correction); a pending-verification queue where selecting a hire opens the acceptable-document checklist rendered as two combo columns (List A vs List B + List C) with examine-and-certify interaction and a day-3 deadline countdown chip (Ava Lindqvist, 1 business day left, urgency-styled); a reverification row for an EAD expiring Sep 30 with a 90-day reminder chip, days-remaining countdown, and Supplement B badge; an E-Verify case table with mono case numbers, draft/submitted/employment-authorized badges, and an all/open/closed filter; a remote-verification appointment card for the authorized-representative flow (rep, address, documents, stepped status timeline, liability note); and a 340px audit-readiness panel (retention rule, purge-eligible archive rows, 2 files flagged for correction with start-correction actions). Choose over hr-onboarding-flow when the job is I-9 sections, E-Verify cases, and reverification deadlines rather than running a hire’s cross-team task checklist; choose over hr-compliance-training when compliance means federal employment-eligibility paperwork, not training-course completion; choose over workforce-audit-log when audit readiness is retention and file-correction status, not an admin action trail.',
  category: 'Workforce HR',
  componentsUsed: [
    'Avatar',
    'Badge',
    'Banner',
    'Button',
    'CheckboxInput',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'Layout',
    'MetadataList',
    'SegmentedControl',
    'StackItem',
    'StatusDot',
    'Table',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
