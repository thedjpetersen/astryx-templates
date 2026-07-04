import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'AI Research Memo',
  description:
    'Generated research memo reading & verification surface for Casewright at Marlow & Voss LLP (M-2417 · Kestrel Labs — Series C Financing): a privilege strip plus toolbar header (memo title, matter Token, "AI-generated · verify before relying" disclosure, a Draft → Cite-checked → Reviewed status stepper pinned at Cite-checked, a live citation meter "9 citations · 7 verified · 2 unverified", and Export/Share actions gated behind an "unreviewed sections remain" Tooltip note), a WIDE light-locked serif memo canvas (MEMORANDUM head — TO Julian Voss, FROM Casewright AI · reviewed by Priya Khanna — then Question Presented, Brief Answer, and Discussion I–III as static editorial prose) where every fictional-authority citation renders as an inline chip with a good-law-green / caution-amber treatment glyph and Discussion III carries a "Low confidence — thin authority" amber wash, a margin verification rail aligned block-by-block to the citations (verify state + checker Avatar + provenance, amber entries expose a Verify action, plus the reviewer note beside the flagged section), and a right 320px Sources panel of 6 authorities with treatment badges, pin-cite chips, and cited-count Tokens; chip, margin entry, and source card select each other, and verifying an entry updates meter, margin, and export gate in lockstep. Choose over legal-research-copilot when the surface is the finished memo artifact under review — no chat panel, no tool-call transcript, the conversation is already over; choose over doc-comments-review when the margin holds AI-citation verification states with checker provenance rather than threaded human comments with reactions and a reply composer; choose over ai-chat-artifact when the artifact is a serif legal memo with citation chips and verification states, not a generated code pane with CodeBlock affordances; choose over contract-ai-review when the paper is a cited research memo with a sources sidebar rather than a contract with severity-tinted issue highlights and a redline-suggestion rail.',
  category: 'Legal AI',
  componentsUsed: [
    'Avatar',
    'Button',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'StackItem',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
