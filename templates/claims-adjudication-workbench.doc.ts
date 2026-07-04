// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Claims Adjudication Workbench',
  description:
    "Payer-side health-plan claims examiner cockpit for Veristra — the pended queue as examiner Dana Whitfield opens it: a 280px claim-inbox rail (7 pended claims on 36px listbox rows, a 32px footer whose '7 claims · $9,384.50 pended' aggregate derives from the rows), a central CPT claim-lines surface for focus claim CLM-2481-0093 (Rosalind Okafor, Lakeview Orthopedic Group, DOS 2026-06-11) with a 32px ICD-10 diagnosis strip, role=table column headers, and 44px line rows that expand to 108px — every line carrying CPT + modifier, diagnosis-pointer superscripts, CARC chips, and a signed billed-to-paid EOB money waterfall (contractual CO-45 → deductible PR-1 → coinsurance PR-2 → copay PR-3 → plan paid) — plus a 52px sticky claim-total footer; and a 400px adjudication aside with the member-responsibility card and a five-rung rule-trace ladder (ELIG-001 → PA-014 → FEE-208 → COB-031 → SHARE-050) showing each rule mutating the running allowed amount. The signature what-if: the expanded waterfall's handle is a real role=slider — dragging (or ArrowLeft/Right ±$1, Shift ±$10) re-runs the pure adjudicateClaim pipeline so segments re-proportion, the shared deductible pool cascades into sibling rows, the sticky footer re-sums, the member card moves, exactly the re-fired ladder rungs pulse, and the rail row + rail aggregate update — visible causality end to end. A header fee-schedule Selector re-adjudicates every line at once. Choose over transactions-ledger when each row's money must DECOMPOSE into a signed waterfall with reason codes, not sit as one settled amount in a flat ledger; choose over expense-approval-queue when adjudication is rule-driven with a visible trace ladder and what-if scrubbing, not human approve/reject of receipts; choose over fin-invoices-billpay when the domain is payer-side medical claims (CPT/modifier/CARC/ICD-10 vocabularies, deductible pools), not AP invoices; choose over apm-trace-waterfall when the waterfall encodes money splits an examiner can scrub, not request-latency spans.",
  category: 'Insurance - Claims Adjudication',
  componentsUsed: [
    'Avatar',
    'Button',
    'HStack',
    'Icon',
    'Layout',
    'LayoutContent',
    'LayoutHeader',
    'SegmentedControl',
    'SegmentedControlItem',
    'Selector',
    'StackItem',
    'StatusDot',
    'Text',
    'Token',
    'Tooltip',
  ],
} satisfies AstryxPageTemplate;

export default template;
