// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Pharmacy Verification Queue',
  description:
    "Pharmacist verification workbench for Pestle (a pharmacy OS) mid-shift at 14:32 — the pharmacist-side release gate, not a consumer refill tracker: a 48px header with the teal PestleMark, four queue tabs (Ready to Verify 5 / Blocked 3 / Counsel 2 / Verified 2 — every badge computed live from the twelve RX-7741…RX-7752 fills), and the signed-in 'JT · J. Tan, PharmD' identity chip; a 36px filter row (priority chips, Longest-wait sort, search) over a 40px-row Rx queue grouped under sticky 28px section labels split at the 20-minute amber wait threshold (waits span 3m–41m); and a 384px working aside (420px above 1200px container, 340px at 900–1023) where each fill is checked against a 64px two-lane SigTranslationRow (raw prescriber tokens like '1-2 gtt OU q4-6h prn pain' with confidence underlines — RX-7746 carries three sub-0.80 tokens whose '?' chips must be confirmed before release), an upper-triangle drug-interaction severity matrix (24px cells, 20px in narrow band; RX-7744 packs a 7x7, 21-cell matrix with two severity-3 pairs into the 340px aside; hover/focus popovers carry Mechanism / Onset / Documentation), a 44px counseling flag stack (REGULATORY flags ack-only via the 'A' key, stamped '✓ JT · #seq'; INFO flags dismissible; RX-7743 shows the quiet zero-flag row), and a Verify gate. Clicking a severity-3 cell opens the OverrideReasonPanel (4 reason codes, destructive confirm labeled 'Override severity-3 · stamps audit'); one confirm re-renders the cell with hatching + JT initials, appends an immutable OVERRIDE entry to the 56px/28px audit ticker footer (role=log, aria-live), moves Blocked 3→2 / Ready 5→6, drops a severity dot off the queue row, and stamps the row's initials chip — verified seeds are stamped by the OTHER pharmacist AO so chips are non-uniform. Bottom corners: audit collapse toggle + entry count left, computed 'Verified this shift: 2 of 12' + 'A ack · O override · V verify' keycap legend right. Container-width bands (ResizeObserver on the view root): wait chips fold into title attrs below 1200px, dot clusters become 'x3' count chips below 1024px, and below 900px the aside becomes an Esc-dismissable slide-over while the ticker auto-collapses. Choose over trial-site-monitor when the gated workflow is per-item release verification (sig parse, DUR matrix, reg flags) rather than longitudinal site/visit monitoring with date-window matrices; choose over discovery-review-queue when the review artifact is a structured clinical fill with NxN severity semantics and regulatory acknowledgment stamps, not document coding with privilege calls; choose over kds-expo-line when items demand a working detail pane with override audit trails instead of fire/plate ticket flow; choose over code-review-diff-queue when the queue clears through domain safety gates (interaction overrides, counseling acks) rather than diff threads and approvals.",
  category: 'Clinical - Pharmacy Operations',
  componentsUsed: [
    'Badge',
    'Button',
    'DropdownMenu',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'Popover',
    'RadioList',
    'StackItem',
    'Text',
    'TextInput',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
