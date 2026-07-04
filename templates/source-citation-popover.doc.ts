import type {AstryxBlockTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'block',
  name: 'Source Citation Popover',
  description:
    "Casewright's citation-chip hover popover for Marlow & Voss LLP, shown as three frozen specimens side by side on a soft Casewright-purple-tinted stage, each under a mono caption row and each pinned open over a dimmed light-locked serif excerpt of the M-2417 research memo (Kestrel Labs — Series C Financing) with its privilege microline and the bright accent-ringed anchor citation chip: specimen 01 is the verified good-law state — Calder Point Capital, L.P. v. Ostrand Sys., Inc., 214 A.3d 887 (Del. Ch. 2021) with a green 'Good law · no negative history' treatment badge, a mono pin-cite chip (at 896), the quoted source passage in serif with the relied-upon sentence green-highlighted, a 'Verified · Priya Khanna · Jul 14' provenance row, and an open-full-source link; specimen 02 is the caution state — Renwick Data Grp. v. Talvace, Inc., 388 F. Supp. 3d 512 (S.D.N.Y. 2020) with an amber 'distinguished by 2 later cases' badge, the mini list of the two fictional distinguishing Chancery decisions, an amber-dotted unverified quote, and a Verify-now button that flips the row to verified provenance; specimen 03 is the unverifiable state — a phantom transcript cite with a red 'Source not found in matter corpus' notice, mono search-scope line, a Report-issue affordance routing to Ruth Vega, and the 'AI-generated · verify before relying' disclosure note; every popover is token-pure Casewright chrome re-anchored to the page scheme over the locked-light paper. All authorities are fictional. Choose over legal-research-memo when the deliverable is the anatomy of the citation hover POPOVER itself — the trust unit that any cited surface embeds — not the full memo page with margin verification rail, sources panel, and citation meter; choose over legal-ai-assistant-workspace when the surface is the frozen source-check specimen, not the matter-scoped assistant thread whose chips would summon it; choose over meeting-notes-ai-card when the specimens verify legal authorities with treatment badges, pin cites, and quoted passages rather than recapping a meeting's bullets and action items.",
  category: 'Legal AI',
  componentsUsed: [
    'Avatar',
    'Button',
    'Divider',
    'Heading',
    'Icon',
    'Text',
    'Token',
    'VStack',
  ],
} satisfies AstryxBlockTemplate;

export default template;
