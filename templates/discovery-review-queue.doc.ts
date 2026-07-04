import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Discovery Review Queue',
  description:
    "Doc-by-doc discovery coding console for a WIDE-scale email review on the Casewright legal-AI platform (Marlow & Voss LLP, matter M-2389 · Kestrel Labs v. Corvid Metrics): a batch progress header (doc 147 of 2,410 with a compact ProgressBar, session pace stat, j/k/r/p keyboard hints that actually work, prev/next) over a persistent attorney-client-privilege strip; a centered light-locked paper canvas rendering the produced email thread as a STATIC document (Bates stamp, protective-order legend, message header blocks, serif body) whose AI-hot passages carry amber relevance / purple privilege washes with R1/P1 markers that sync with the coding rail; a right 380px coding panel holding the confidence-scored AI suggestions banner ('AI suggests: Relevant · 0.87 · High, Privileged · 0.62 · Medium — review carefully') with per-passage citation chips, rationale on select, Accept/Override actions, and the suite disclosure line, a Relevant/Not relevant/Uncertain SegmentedControl, a privilege RadioList whose AC/work-product choices reveal the auto-drafted privilege-log note, an issue-tag CheckboxList with batch-wide counts, and a pinned Save & next bar; and a footer pairing the seed-set prediction-quality strip (precision/recall with honest ± error bars and a small-sample caveat) with a privilege-log preview drawer chip whose entries show verification provenance and whose export demands an AlertDialog confirm. Choose over expense-approval-queue when the queue holds discovery documents coded on multiple evidentiary axes — relevance, privilege, issue tags — with AI suggestions and a privilege log, not expense reports receiving a single approve/reject verdict with line items and receipts; choose over it-access-requests when the judgment is document coding against a litigation record rather than identity-policy access grants with SoD banners and approval chains; choose over doc-comments-review when the paper's highlights are classifier hot passages feeding a coding panel, not threaded human margin comments with reactions and @mentions.",
  category: 'Legal AI',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Button',
    'CheckboxList',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Kbd',
    'Layout',
    'ProgressBar',
    'RadioList',
    'SegmentedControl',
    'StackItem',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
