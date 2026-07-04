import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Negotiation Diff & Turn History',
  description:
    'Contract negotiation diff surface for a document under active markup (the Skylark Cloud MSA on Marlow & Voss matter M-2431 for Kestrel Labs): a privilege-striped header with base/compare version Selectors (v4 counterparty turn vs v5 firm working draft), a changed-clause meter, and a confirm-gated Send-markup action; a 5-turn history band alternating firm and counterparty avatars with dates and turn-summary chips; a 280px changed-clause navigator rail whose 8 entries are color-coded by who changed (theirs / ours / both) with materiality and privileged-note markers; clause-aligned side-by-side light-locked serif paper panes rendering tracked changes in the legal redline idiom — insertions underlined, deletions struck, counterparty edits orange, firm edits blue; a Casewright AI turn-summary Card ("accepted 3 of 5 positions; new carve-out added in § 9.2") with citation chips that jump into the diff, an honest confidence band, human verification provenance, and the AI-disclosure line; 2 per-change firm-internal annotations marked privileged; and a position-tracker footer of 5 negotiation points with ours / theirs / agreed states. Choose over diff-viewer when the comparison is negotiated PROSE on clause-aligned serif paper with author attribution, materiality, and AI summaries rather than a code diff with line numbers and monospace gutters; choose over doc-version-history when the story is a counterparty negotiation arc (turns, whose-court positions, privileged annotations) rather than browsing and restoring saved snapshots of one document; choose over contract-redline-compare when the negotiation HISTORY itself — turn strip, per-side attribution, and the open-position tracker — is the hero rather than a single turn’s grouped change list.',
  category: 'Legal AI',
  componentsUsed: [
    'AlertDialog',
    'Avatar',
    'Badge',
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'IconButton',
    'Layout',
    'Selector',
    'StackItem',
    'Text',
    'Token',
    'Tooltip',
    'VStack',
  ],
} satisfies AstryxPageTemplate;

export default template;
