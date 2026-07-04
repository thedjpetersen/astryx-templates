import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Conflicts Check Card',
  description:
    "Casewright new-matter conflicts-check card for the Marlow & Voss intake of 'Kestrel Labs — Series C Financing' (M-2417, run Tue Jul 14, 2026), shown as three frozen specimens side by side on a soft AI-purple-tinted stage, each under a mono caption row: specimen 01 is the running state — sparkle-marked Casewright header with matter meta and an Attorney-Work-Product privilege line, the three matter parties (Kestrel Labs, Meridian Growth Partners, Skylark Cloud), and per-database progress rows (clients & former clients and adverse parties complete, related entities still scanning behind a determinate ProgressBar at 8,014 of 12,467) with every action disabled; specimen 02 is the potential-conflict state — an amber result row 'Meridian Growth Partners — adverse party in closed matter M-2019-0331 (Voss, 2019)' with match-basis citation chips, a 'No waiver on file' chip, an honest confidence band ('High confidence — exact entity-name match'), a three-node SVG relationship diagram mini (new matter, shared party, closed adverse matter), and Escalate-to-ethics + Propose-screen-team affordances that resolve to confirmation chips; specimen 03 is the cleared state — green all-clear ('No open conflicts — clear to engage') with the checked-databases summary reconciling to 17,847 records, completion timestamp, Ruth Vega's 'Cleared · Jul 14' provenance with waiver memo, and a Log-to-matter-file action resolving to a confirmation chip; every specimen carries the suite's 'AI-generated · verify before relying' disclosure footer. Choose over matter-intake-conflicts when the deliverable is the embeddable conflicts-check UNIT and its three generation states (the card a detail pane or matter hub would host), not the full new-business intake queue with engagement-letter checklist and Accept/Decline verdicts; choose over citation-check-card when the AI assertion under review is a database conflicts hit with waiver and clearance workflow, not a cited authority's quoted passage; choose over meeting-notes-ai-card when the artifact is a privileged legal conflicts run, not a post-meeting recap with action items; choose over it-access-requests when the judgment is adverse-party analysis with human ethics clearance, not role/policy-gated access approval.",
  category: 'Legal AI',
  componentsUsed: [
    'Button',
    'Card',
    'Divider',
    'Heading',
    'HStack',
    'Icon',
    'ProgressBar',
    'Spinner',
    'StackItem',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
