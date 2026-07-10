// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Erratum ticket ERR-2214 at The Calder
 *   Ledger: one Metro-desk article ("Transit board approved Fairview Line
 *   overruns months before public disclosure, records show", published Sun
 *   Jul 6, 2026, by Cole Meredith) with EIGHT flagged claims C1–C8 woven
 *   into its paragraphs. Kind census, hand-checked: 4 figures (C1 C3 C4 C8)
 *   + 2 dates (C2 C7) + 1 quote (C5) + 1 attribution (C6) = 8. Initial
 *   statuses: C3 verified (2023 bond prospectus p.11), C4 verified
 *   (arithmetic cross-check $412M + $86.4M = $498.4M, matching minutes
 *   p.5), C6 already corrected (title fix) ⇒ 3 resolved / 5 pending ⇒
 *   research meter 3/8 = 37.5%, rendered 38%. Timeline cross-check: service
 *   originally promised September 2026 — November 2027 is the printed
 *   14-month delay (C8) and the suggested corrections C7 "January 2028" and
 *   C8 "16 months" stay mutually consistent (Sep 2026 → Jan 2028 = 16 mo).
 *   The publish timestamp is the fixed string "Fri Jul 10, 2026 · 6:40 PM".
 *   No clock reads, no randomness, no timers, no network assets.
 * @output Erratum — Newsroom Correction Desk: a corrections-and-standards
 *   workbench for one published story. A 56px brand header (proofreader's
 *   dele mark, ticket id, live gate Badge) over a 44px derived strip
 *   (research meter + status filter chips that filter the checklist), then
 *   the working band: the article pane — a centered 640px reading column in
 *   serif with every flagged claim rendered as an inline annotation button
 *   (crimson dotted = open, green = verified, amber shows old text struck
 *   through beside its correction, slate strikethrough = struck) — beside a
 *   360px review rail holding the claim checklist (min-88px rows with
 *   Verify / Apply correction / Strike / Reopen actions, source-note
 *   evidence lines, and the pre-drafted correction text) and the legal
 *   sign-off lane (four 48px+ gates: claims resolved n/8, auto-composed
 *   correction notice, standards editor sign-off, legal sign-off, then the
 *   Publish button). Signature move: resolving a claim from either surface
 *   restyles its inline annotation, ticks the checklist, advances the
 *   research meter and filter counts, recomposes the correction notice
 *   sentence-by-sentence, and flips the publish-readiness gate — while
 *   reopening any claim after sign-off revokes both signatures, because
 *   the signatures attest to a claim set that no longer exists. Publishing
 *   locks every control and stamps the notice into the article head.
 * @position Page template; emitted by `astryx template newsroom-correction-desk`
 *
 * Frame: root 100dvh div > Layout height="fill". LayoutHeader (brand +
 *   ticket + gate badge) | LayoutContent padding 0 → content column: strip
 *   44 → body row (article scroller flex 1 · review rail 360, border-left).
 *   The checklist and the sign-off lane share the rail — corrections and
 *   the gates that consume them scroll together. No detail panel: the
 *   article itself is the detail surface.
 * Responsive contract:
 * - Default desktop (~1045px demo stage, no media query needed): article
 *   pane ≈ 683px (reading column 640 + gutters) + rail 360 ≈ 1045 — fits
 *   without horizontal scroll; the reading column centers with room.
 * - <= 900px: rail narrows to 320; the reading column keeps 640 max and
 *   cedes gutter first (subtraction: margins, then column).
 * - <= 640px (390px embed): body stacks — article first (natural height
 *   inside the page scroller), rail below full-width; filter chips scroll
 *   horizontally in their 44px strip; gate rows and claim actions wrap.
 * Container policy: reading-surface + rail archetype — one serif article
 *   column (product semantics: news body type is serif by design, see
 *   Color/type note), frame rows and rail sections elsewhere; no Cards.
 *   Inline annotations, checklist actions, filter chips, and gate toggles
 *   are real <button>s (aria-pressed on selection/filter/sign-off states).
 *   All numerals tabular.
 * Color policy: token-pure chrome. ONE quarantined brand accent (Erratum
 *   crimson): light-dark(#A81E39, #F2718D) — #A81E39 on #FFFFFF ≈ 7.3:1,
 *   #F2718D on ~#1C1C1E ≈ 7.5:1 — used for the mark, open-claim
 *   annotations, the research meter, and focus rings. Text/glyph on a
 *   solid crimson fill: #FFFFFF on #A81E39 ≈ 7.3:1; #2E060E on #F2718D ≈
 *   8.9:1 (white on #F2718D fails at ~1.8:1). State pairs with math at the
 *   declaration: verified green light-dark(#15803D, #4ADE80) (≈5.0:1 /
 *   ≈9.6:1), corrected amber light-dark(#B45309, #F5A623) (≈4.7:1 /
 *   ≈8.8:1), struck slate light-dark(#475569, #94A3B8) (≈7.6:1 / ≈6.6:1).
 *   Tints are ≤16%-alpha washes under text that keeps its own ≥4.5:1 pair.
 *   The article body uses a serif stack (Georgia et al.) as deliberate
 *   product semantics — newspaper body type — while every UI surface stays
 *   on var(--font-family-sans).
 * Density grid (repeated verbatim in the CSS): header 56 · strip 44 ·
 *   reading column 640 · article body 16.5px/1.7 serif · annotation sup
 *   chips 10px · claim rows min 88 · claim action buttons 40 · gate rows
 *   min 48 · rail 360 · notice preview 12.5px/1.55. Inline annotation
 *   buttons are text-height by nature (they live inside running prose);
 *   compensation: every annotation has a 40px checklist twin, full
 *   keyboard access, and a visible focus ring.
 * Fixture policy: state is ONE claim-status map `Record<ClaimId,
 *   ClaimStatus>` plus three booleans (editor signed, legal signed,
 *   published). The research meter, filter counts, annotation styles,
 *   notice text, gate states, and the header badge ALL re-derive from
 *   fixtures + that map every render. Mutating any claim while signatures
 *   exist clears them in the same update — sign-offs can never attest to
 *   a claim set they did not see. Selecting a claim and choosing a filter
 *   are local UI state and mutate nothing.
 */

import {useMemo, useState, type ReactNode} from 'react';

import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  FileTextIcon,
  PenLineIcon,
  RotateCcwIcon,
  ScaleIcon,
  ScissorsIcon,
  SendIcon,
  StampIcon,
} from 'lucide-react';

import {HStack, Layout, LayoutContent, LayoutHeader, StackItem} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Badge} from '@astryxdesign/core/Badge';
import {Button} from '@astryxdesign/core/Button';
import {Icon} from '@astryxdesign/core/Icon';
import {Tooltip} from '@astryxdesign/core/Tooltip';

// ---------------------------------------------------------------------------
// SCOPE + COLOR LITERALS — every non-token color is a light-dark() pair with
// its contrast math. Chrome is token-pure; these are product semantics only.
// ---------------------------------------------------------------------------

const SCOPE = 'tpl-newsroom-correction-desk';

// THE quarantined Erratum brand crimson. #A81E39 on #FFFFFF ≈ 7.3:1 (clears
// 4.5:1 down to the 10px annotation sup chips); #F2718D on ~#1C1C1E ≈ 7.5:1.
const BRAND = 'light-dark(#A81E39, #F2718D)';
// Text/glyph ON a solid crimson fill (meter, publish stamp): #FFFFFF on
// #A81E39 ≈ 7.3:1; #2E060E on #F2718D ≈ 8.9:1 (white on #F2718D ≈ 1.8:1
// fails, hence the dark pair).
const BRAND_ON = 'light-dark(#FFFFFF, #2E060E)';
// Crimson wash for open annotations / selected rows (10% / 16% alpha).
const BRAND_TINT = 'light-dark(rgba(168, 30, 57, 0.10), rgba(242, 113, 141, 0.16))';
// Verified green: #15803D on #FFFFFF ≈ 5.0:1; #4ADE80 on #1C1C1E ≈ 9.6:1.
const OK = 'light-dark(#15803D, #4ADE80)';
const OK_TINT = 'light-dark(rgba(21, 128, 61, 0.10), rgba(74, 222, 128, 0.14))';
// Corrected amber: #B45309 on #FFFFFF ≈ 4.7:1; #F5A623 on #1C1C1E ≈ 8.8:1.
const WARN = 'light-dark(#B45309, #F5A623)';
const WARN_TINT = 'light-dark(rgba(180, 83, 9, 0.10), rgba(245, 166, 35, 0.14))';
// Struck slate: #475569 on #FFFFFF ≈ 7.6:1; #94A3B8 on #1C1C1E ≈ 6.6:1.
const MUTE = 'light-dark(#475569, #94A3B8)';
const MUTE_TINT = 'light-dark(rgba(71, 85, 105, 0.10), rgba(148, 163, 184, 0.14))';

// Article body type: deliberate product semantics — newspaper body copy is
// serif; every UI surface on the page stays on var(--font-family-sans).
const SERIF = "Georgia, 'Iowan Old Style', 'Times New Roman', serif";

// ---------------------------------------------------------------------------
// CLAIMS — eight flagged spans by identity. `text` is the exact span as
// printed; `label` feeds the auto-composed correction notice; suggested
// corrections are pre-drafted by the research desk so applying one is a
// single deterministic action.
// ---------------------------------------------------------------------------

type ClaimId = 'C1' | 'C2' | 'C3' | 'C4' | 'C5' | 'C6' | 'C7' | 'C8';
type ClaimKind = 'figure' | 'date' | 'quote' | 'attribution';
type ClaimStatus = 'pending' | 'verified' | 'corrected' | 'struck';

interface Claim {
  id: ClaimId;
  kind: ClaimKind;
  /** The exact span as it appeared in print. */
  text: string;
  /** What the span asserts — feeds notice sentences ("misstated {label}"). */
  label: string;
  /** Who flagged it and why. */
  flagNote: string;
  /** The research desk's source note. */
  evidence: string;
  /** Pre-drafted fix; absent for verify-or-strike claims. */
  suggestedCorrection?: {
    newText: string;
    statement: string; // "the session took place on March 19, not March 12"
  };
}

const CLAIMS: Claim[] = [
  {
    id: 'C1',
    kind: 'figure',
    text: '$86.4 million',
    label: 'the size of the approved overrun',
    flagNote: 'Reader letter (K. Osei, CPA) says the overrun was $84.6M — possible transposition.',
    evidence:
      "Board minutes, March session, p.4: 'authorize additional expenditure of $86,400,000.' The letter transposed the digits.",
  },
  {
    id: 'C2',
    kind: 'date',
    text: 'a closed session on March 12',
    label: 'the date of the closed session',
    flagNote: 'Legal review — the minutes cover sheet reads March 19.',
    evidence:
      'Minutes cover sheet and the posted notice of meeting are both dated March 19, 2026. No session occurred March 12.',
    suggestedCorrection: {
      newText: 'a closed session on March 19',
      statement: 'the closed session took place on March 19, not March 12',
    },
  },
  {
    id: 'C3',
    kind: 'figure',
    text: '$412 million',
    label: 'the original project budget',
    flagNote: 'Routine figure check on all money amounts.',
    evidence: '2023 bond prospectus, p.11: total project budget $412,000,000.',
  },
  {
    id: 'C4',
    kind: 'figure',
    text: '$498.4 million',
    label: 'the revised cost projection',
    flagNote: 'Routine figure check on all money amounts.',
    evidence:
      'Arithmetic cross-check: $412M original + $86.4M overrun = $498.4M. Matches minutes p.5 projection table.',
  },
  {
    id: 'C5',
    kind: 'quote',
    text: '"We were told the contingency fund would cover the tunneling claims," board member Alicia Fontaine said',
    label: "board member Fontaine's quoted remark",
    flagNote:
      "Fontaine's office disputes the wording; the desk recording covers only part of the session.",
    evidence:
      "Partial desk recording (04:12–04:31): the phrase 'contingency fund' is audible; the full sentence was not captured. No second source.",
  },
  {
    id: 'C6',
    kind: 'attribution',
    text: "Daniel Reyes, the authority's chief spokesman",
    label: "Daniel Reyes's title",
    flagNote: 'Authority HR directory lists a different title.',
    evidence:
      "HR directory and the authority's own press releases style Reyes 'communications director'; the authority has no 'chief spokesman' role.",
    suggestedCorrection: {
      newText: "Daniel Reyes, the authority's communications director",
      statement:
        "Daniel Reyes is the authority's communications director, not its chief spokesman",
    },
  },
  {
    id: 'C7',
    kind: 'date',
    text: 'in November 2027',
    label: 'the revised service date',
    flagNote: 'Revised service plan (June 2026) shows a later date.',
    evidence:
      'Revised service plan, June 2026 board packet, p.2: revenue service target January 2028.',
    suggestedCorrection: {
      newText: 'in January 2028',
      statement:
        'service is now scheduled to begin in January 2028, not November 2027',
    },
  },
  {
    id: 'C8',
    kind: 'figure',
    text: 'a delay of 14 months',
    label: 'the length of the delay',
    flagNote:
      'Depends on C7 — measured from September 2026, January 2028 is a 16-month delay.',
    evidence:
      'Original promise September 2026 (2023 prospectus). Sep 2026 → Jan 2028 = 16 months; the printed 14 assumed the November 2027 date.',
    suggestedCorrection: {
      newText: 'a delay of 16 months',
      statement: 'the delay is 16 months, not 14',
    },
  },
];

const CLAIM_BY_ID: Record<ClaimId, Claim> = Object.fromEntries(
  CLAIMS.map(c => [c.id, c]),
) as Record<ClaimId, Claim>;

/** Seed statuses: C3 + C4 verified, C6 already corrected ⇒ 3 resolved / 5
 * pending ⇒ research meter 3/8 = 38%. */
const INITIAL_STATUSES: Record<ClaimId, ClaimStatus> = {
  C1: 'pending',
  C2: 'pending',
  C3: 'verified',
  C4: 'verified',
  C5: 'pending',
  C6: 'corrected',
  C7: 'pending',
  C8: 'pending',
};

// ---------------------------------------------------------------------------
// ARTICLE — the published story as paragraph segments. A segment is plain
// prose or a claim reference; the renderer swaps claim segments for live
// annotation buttons. The claim `text` fixtures above are the SAME strings
// referenced here by id, so span and checklist can never drift.
// ---------------------------------------------------------------------------

const ARTICLE = {
  hed: 'Transit board approved Fairview Line overruns months before public disclosure, records show',
  dek: 'Board minutes obtained by The Ledger show the vote came in a closed session, with one dissent.',
  byline: 'By Cole Meredith · Metro',
  published: 'Published Sun Jul 6, 2026 · 5:02 AM',
  ticket: 'ERR-2214',
};

type Segment = {t: string} | {claim: ClaimId};

const PARAGRAPHS: Segment[][] = [
  [
    {t: "The Calder Transit Authority's board voted to approve "},
    {claim: 'C1'},
    {t: ' in cost overruns on the Fairview Line extension during '},
    {claim: 'C2'},
    {
      t: ' — more than three months before riders and council members were told the project had left its budget.',
    },
  ],
  [
    {
      t: 'The figures appear in board minutes obtained by The Ledger through a public-records request. The 9.7-mile extension, originally budgeted at ',
    },
    {claim: 'C3'},
    {t: " in the authority's 2023 bond prospectus, is now projected to cost "},
    {claim: 'C4'},
    {t: ', the minutes show.'},
  ],
  [
    {claim: 'C5'},
    {
      t: ' during the March session, according to the minutes. Fontaine cast the lone dissenting vote.',
    },
  ],
  [
    {claim: 'C6'},
    {
      t: ', said in a statement that the board "followed standard procurement practice at every stage" and that overrun disclosures were "handled on the timeline the bond covenants require."',
    },
  ],
  [
    {
      t: 'Service on the extension, originally promised for September 2026, is now scheduled to begin ',
    },
    {claim: 'C7'},
    {t: ' — '},
    {claim: 'C8'},
    {t: ' from the original timeline.'},
  ],
  [
    {
      t: 'The overruns stem largely from tunneling claims filed by the joint venture building the harbor crossing, where crews encountered unstable fill that required redesigned support structures, according to three people familiar with the project who requested anonymity to discuss contract negotiations.',
    },
  ],
  [
    {
      t: "Council member Devon Marsh, who chairs the transportation committee, said the committee will call authority executives to testify at its July 21 hearing. \"If the board knew in March, the public should have known in March,\" Marsh said.",
    },
  ],
  [
    {t: "The authority's next quarterly financial disclosure is due August 14."},
  ],
];

// ---------------------------------------------------------------------------
// META TABLES — one place for per-status and per-kind vocabulary so every
// surface (annotation, chip, checklist, notice) speaks identically.
// ---------------------------------------------------------------------------

const STATUS_META: Record<
  ClaimStatus,
  {label: string; verb: string}
> = {
  pending: {label: 'Open', verb: 'reopened'},
  verified: {label: 'Verified', verb: 'verified'},
  corrected: {label: 'Corrected', verb: 'corrected'},
  struck: {label: 'Struck', verb: 'struck'},
};

const KIND_META: Record<ClaimKind, {label: string}> = {
  figure: {label: 'Figure'},
  date: {label: 'Date'},
  quote: {label: 'Quote'},
  attribution: {label: 'Attribution'},
};

const STATUS_ORDER: ClaimStatus[] = ['pending', 'verified', 'corrected', 'struck'];

type Filter = 'all' | ClaimStatus;

// ---------------------------------------------------------------------------
// DERIVATIONS — everything re-derives from (fixtures, statuses, signatures)
// every render.
// ---------------------------------------------------------------------------

type StatusMap = Record<ClaimId, ClaimStatus>;

interface DerivedDesk {
  counts: Record<ClaimStatus, number>;
  resolved: number; // verified + corrected + struck
  total: number;
  meterPct: number;
  allResolved: boolean;
  noticeSentences: string[];
}

/** Compose the correction notice, sentence by sentence, from the current
 * statuses. Corrected claims contribute their pre-drafted statement; struck
 * claims contribute a removal sentence; an all-verified set composes the
 * no-correction-required notice. */
function composeNotice(statuses: StatusMap): string[] {
  const sentences: string[] = [];
  for (const claim of CLAIMS) {
    const status = statuses[claim.id];
    if (status === 'corrected' && claim.suggestedCorrection != null) {
      sentences.push(
        `An earlier version of this article misstated ${claim.label}; ${claim.suggestedCorrection.statement}.`,
      );
    } else if (status === 'struck') {
      sentences.push(
        `An earlier version of this article included ${claim.label}, which could not be verified and has been removed.`,
      );
    }
  }
  if (sentences.length === 0) {
    const allResolved = CLAIMS.every(c => statuses[c.id] !== 'pending');
    if (allResolved) {
      sentences.push(
        'All flagged claims were verified against source records; no correction is required.',
      );
    }
  }
  return sentences;
}

function deriveDesk(statuses: StatusMap): DerivedDesk {
  const counts: Record<ClaimStatus, number> = {
    pending: 0,
    verified: 0,
    corrected: 0,
    struck: 0,
  };
  for (const claim of CLAIMS) {
    counts[statuses[claim.id]] += 1;
  }
  const total = CLAIMS.length;
  const resolved = total - counts.pending;
  return {
    counts,
    resolved,
    total,
    meterPct: Math.round((resolved / total) * 100),
    allResolved: counts.pending === 0,
    noticeSentences: composeNotice(statuses),
  };
}

/** The header badge / gate verdict state machine — pure derivation. */
function deriveVerdict(
  desk: DerivedDesk,
  editorSigned: boolean,
  legalSigned: boolean,
  isPublished: boolean,
): {label: string; variant: 'neutral' | 'warning' | 'info' | 'success'} {
  if (isPublished) {
    return {label: 'Correction published', variant: 'success'};
  }
  if (!desk.allResolved) {
    return {
      label: `${desk.counts.pending} open claim${desk.counts.pending === 1 ? '' : 's'}`,
      variant: 'warning',
    };
  }
  if (!editorSigned) {
    return {label: 'Awaiting standards sign-off', variant: 'info'};
  }
  if (!legalSigned) {
    return {label: 'Awaiting legal sign-off', variant: 'info'};
  }
  return {label: 'Ready to publish', variant: 'success'};
}

// ---------------------------------------------------------------------------
// TEMPLATE_CSS — all selectors scoped under .tpl-newsroom-correction-desk.
// Density grid repeated verbatim: header 56 · strip 44 · reading column 640
// · article body 16.5px/1.7 serif · annotation sup chips 10px · claim rows
// min 88 · claim action buttons 40 · gate rows min 48 · rail 360 · notice
// preview 12.5px/1.55.
// ---------------------------------------------------------------------------

const TEMPLATE_CSS = `
.${SCOPE} {
  font-family: var(--font-family-sans);
}
.${SCOPE} button {
  font: inherit;
  color: inherit;
}
.${SCOPE} .ncd-focusable:focus-visible {
  outline: 2px solid ${BRAND};
  outline-offset: 2px;
}
.${SCOPE} .ncd-vh {
  position: absolute;
  width: 1px;
  height: 1px;
  margin: -1px;
  padding: 0;
  overflow: hidden;
  clip-path: inset(50%);
  white-space: nowrap;
}
/* --- header (56px) ------------------------------------------------------- */
.${SCOPE} .ncd-header-row {
  padding: var(--spacing-2) var(--spacing-4);
  min-height: 56px;
  box-sizing: border-box;
}
.${SCOPE} .ncd-mark {
  display: inline-flex;
  flex-shrink: 0;
  color: ${BRAND};
}
.${SCOPE} .ncd-overline {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${BRAND};
  white-space: nowrap;
}
/* --- content column + body row ------------------------------------------- */
.${SCOPE} .ncd-content {
  height: 100%;
  min-height: 0;
  display: flex;
  flex-direction: column;
}
.${SCOPE} .ncd-body {
  flex: 1;
  min-height: 0;
  display: flex;
}
/* --- derived strip (44px): research meter + status filter chips ---------- */
.${SCOPE} .ncd-strip {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  min-height: 44px;
  box-sizing: border-box;
  padding: var(--spacing-1) var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
  overflow-x: auto;
}
.${SCOPE} .ncd-meter {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
  font-size: 12px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-primary);
  white-space: nowrap;
}
.${SCOPE} .ncd-meter-track {
  width: 120px;
  height: 6px;
  border-radius: 999px;
  background: var(--color-background-muted);
  border: var(--border-width) solid var(--color-border);
  overflow: hidden;
}
.${SCOPE} .ncd-meter-fill {
  height: 100%;
  border-radius: 999px;
  background: ${BRAND};
}
.${SCOPE} .ncd-chip {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  flex-shrink: 0;
  min-height: 28px;
  padding: 2px 10px;
  border-radius: 999px;
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
  white-space: nowrap;
  cursor: pointer;
}
.${SCOPE} .ncd-chip strong { color: var(--color-text-primary); font-weight: 700; }
.${SCOPE} .ncd-chip[aria-pressed='true'] {
  border-color: ${BRAND};
  color: ${BRAND};
  background: ${BRAND_TINT};
}
.${SCOPE} .ncd-chip[aria-pressed='true'] strong { color: ${BRAND}; }
.${SCOPE} .ncd-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.${SCOPE} .ncd-dot--pending { background: ${BRAND}; }
.${SCOPE} .ncd-dot--verified { background: ${OK}; }
.${SCOPE} .ncd-dot--corrected { background: ${WARN}; }
.${SCOPE} .ncd-dot--struck { background: ${MUTE}; }
/* --- article pane ---------------------------------------------------------- */
.${SCOPE} .ncd-article-scroll {
  flex: 1;
  min-width: 0;
  overflow-y: auto;
  background: var(--color-background-muted);
}
.${SCOPE} .ncd-article {
  max-width: 640px;
  margin-inline: auto;
  padding: var(--spacing-6) var(--spacing-5) var(--spacing-8);
  box-sizing: content-box;
}
.${SCOPE} .ncd-sheet {
  background: var(--color-background-surface);
  border: var(--border-width) solid var(--color-border);
  border-radius: var(--radius-container, 10px);
  padding: var(--spacing-6) var(--spacing-6) var(--spacing-7);
}
.${SCOPE} .ncd-hed {
  font-family: ${SERIF};
  font-size: 26px;
  line-height: 1.25;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-2);
}
.${SCOPE} .ncd-dek {
  font-family: ${SERIF};
  font-size: 16px;
  line-height: 1.5;
  color: var(--color-text-secondary);
  margin: 0 0 var(--spacing-3);
}
.${SCOPE} .ncd-byline {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
  font-size: 12px;
  color: var(--color-text-secondary);
  padding-bottom: var(--spacing-3);
  margin-bottom: var(--spacing-4);
  border-bottom: var(--border-width) solid var(--color-border);
}
/* Published-correction stamp box at the article head. */
.${SCOPE} .ncd-stamp {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  margin: 0 0 var(--spacing-4);
  padding: var(--spacing-3);
  border: var(--border-width) solid ${WARN};
  border-left: 3px solid ${WARN};
  border-radius: var(--radius-container, 8px);
  background: ${WARN_TINT};
  font-size: 13px;
  line-height: 1.55;
  color: var(--color-text-primary);
}
.${SCOPE} .ncd-stamp-title {
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: ${WARN};
  margin: 0 0 2px;
}
/* Article body: 16.5px/1.7 serif. */
.${SCOPE} .ncd-graf {
  font-family: ${SERIF};
  font-size: 16.5px;
  line-height: 1.7;
  color: var(--color-text-primary);
  margin: 0 0 var(--spacing-4);
}
/* Inline claim annotations: real buttons inside running prose. */
.${SCOPE} .ncd-ann {
  display: inline;
  padding: 1px 2px;
  margin: 0;
  border: none;
  border-radius: 3px;
  background: transparent;
  font-family: ${SERIF};
  font-size: inherit;
  line-height: inherit;
  text-align: inherit;
  cursor: pointer;
}
.${SCOPE} .ncd-ann sup {
  font-family: var(--font-family-sans);
  font-size: 10px;
  font-weight: 700;
  font-variant-numeric: tabular-nums;
  letter-spacing: 0.02em;
  margin-left: 2px;
  white-space: nowrap;
}
.${SCOPE} .ncd-ann--pending {
  background: ${BRAND_TINT};
  box-shadow: inset 0 -2px 0 0 ${BRAND};
}
.${SCOPE} .ncd-ann--pending sup { color: ${BRAND}; }
.${SCOPE} .ncd-ann--verified {
  background: ${OK_TINT};
  box-shadow: inset 0 -2px 0 0 ${OK};
}
.${SCOPE} .ncd-ann--verified sup { color: ${OK}; }
.${SCOPE} .ncd-ann--corrected {
  background: ${WARN_TINT};
  box-shadow: inset 0 -2px 0 0 ${WARN};
}
.${SCOPE} .ncd-ann--corrected sup { color: ${WARN}; }
.${SCOPE} .ncd-ann--struck {
  background: ${MUTE_TINT};
  box-shadow: inset 0 -2px 0 0 ${MUTE};
}
.${SCOPE} .ncd-ann--struck sup { color: ${MUTE}; }
.${SCOPE} .ncd-ann--selected {
  outline: 2px solid ${BRAND};
  outline-offset: 1px;
}
.${SCOPE} .ncd-oldtext {
  text-decoration: line-through;
  text-decoration-thickness: 1.5px;
  color: var(--color-text-secondary);
}
.${SCOPE} .ncd-ann--struck .ncd-oldtext { color: ${MUTE}; }
.${SCOPE} .ncd-newtext {
  color: var(--color-text-primary);
  font-style: italic;
}
/* --- review rail (360px) --------------------------------------------------- */
.${SCOPE} .ncd-rail {
  width: 360px;
  flex-shrink: 0;
  box-sizing: border-box;
  border-left: var(--border-width) solid var(--color-border);
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}
.${SCOPE} .ncd-rail-head {
  position: sticky;
  top: 0;
  z-index: 2;
  display: flex;
  align-items: center;
  gap: 6px;
  padding: var(--spacing-2) var(--spacing-3);
  background: var(--color-background-surface);
  border-bottom: var(--border-width) solid var(--color-border);
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
}
.${SCOPE} .ncd-rail-head .ncd-count {
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}
/* Claim rows: min 88px. */
.${SCOPE} .ncd-claimrow {
  min-height: 88px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 6px;
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .ncd-claimrow--selected {
  background: ${BRAND_TINT};
  box-shadow: inset 3px 0 0 0 ${BRAND};
}
.${SCOPE} .ncd-claimtop {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 0;
}
.${SCOPE} .ncd-claimid {
  border: none;
  padding: 0 6px;
  min-height: 22px;
  border-radius: 5px;
  font-size: 11px;
  font-weight: 800;
  font-variant-numeric: tabular-nums;
  cursor: pointer;
  flex-shrink: 0;
}
.${SCOPE} .ncd-claimid--pending { background: ${BRAND_TINT}; color: ${BRAND}; }
.${SCOPE} .ncd-claimid--verified { background: ${OK_TINT}; color: ${OK}; }
.${SCOPE} .ncd-claimid--corrected { background: ${WARN_TINT}; color: ${WARN}; }
.${SCOPE} .ncd-claimid--struck { background: ${MUTE_TINT}; color: ${MUTE}; }
.${SCOPE} .ncd-kind {
  font-size: 10px;
  font-weight: 700;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: var(--color-text-secondary);
  border: var(--border-width) solid var(--color-border);
  border-radius: 999px;
  padding: 1px 7px;
  flex-shrink: 0;
}
.${SCOPE} .ncd-claimstatus {
  margin-left: auto;
  font-size: 11px;
  font-weight: 700;
  flex-shrink: 0;
}
.${SCOPE} .ncd-claimstatus--pending { color: ${BRAND}; }
.${SCOPE} .ncd-claimstatus--verified { color: ${OK}; }
.${SCOPE} .ncd-claimstatus--corrected { color: ${WARN}; }
.${SCOPE} .ncd-claimstatus--struck { color: ${MUTE}; }
.${SCOPE} .ncd-span {
  font-family: ${SERIF};
  font-size: 13px;
  line-height: 1.5;
  color: var(--color-text-primary);
  overflow: hidden;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.${SCOPE} .ncd-note {
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}
.${SCOPE} .ncd-note strong {
  color: var(--color-text-primary);
  font-weight: 600;
}
.${SCOPE} .ncd-suggestion {
  font-size: 11.5px;
  line-height: 1.5;
  color: ${WARN};
  border-left: 2px solid ${WARN};
  padding-left: 8px;
}
/* Claim action buttons: 40px. */
.${SCOPE} .ncd-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
}
.${SCOPE} .ncd-act {
  min-height: 40px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 5px;
  padding: 4px 10px;
  border-radius: var(--radius-container, 8px);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.${SCOPE} .ncd-act:disabled {
  opacity: 0.45;
  cursor: default;
}
.${SCOPE} .ncd-act--verify { color: ${OK}; border-color: ${OK}; }
.${SCOPE} .ncd-act--verify[aria-pressed='true'] { background: ${OK_TINT}; }
.${SCOPE} .ncd-act--correct { color: ${WARN}; border-color: ${WARN}; }
.${SCOPE} .ncd-act--correct[aria-pressed='true'] { background: ${WARN_TINT}; }
.${SCOPE} .ncd-act--strike { color: ${MUTE}; border-color: ${MUTE}; }
.${SCOPE} .ncd-act--strike[aria-pressed='true'] { background: ${MUTE_TINT}; }
/* --- sign-off lane ----------------------------------------------------------- */
.${SCOPE} .ncd-gate {
  min-height: 48px;
  box-sizing: border-box;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  padding: var(--spacing-2) var(--spacing-3);
  border-bottom: var(--border-width) solid var(--color-border);
}
.${SCOPE} .ncd-gate-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  flex-shrink: 0;
  margin-top: 2px;
  border: var(--border-width) solid var(--color-border);
  color: var(--color-text-secondary);
  background: var(--color-background-surface);
}
.${SCOPE} .ncd-gate--done .ncd-gate-icon {
  border-color: ${OK};
  color: ${OK};
  background: ${OK_TINT};
}
.${SCOPE} .ncd-gate-body { min-width: 0; flex: 1; }
.${SCOPE} .ncd-gate-title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12.5px;
  font-weight: 700;
  color: var(--color-text-primary);
}
.${SCOPE} .ncd-gate-title .ncd-gate-count {
  margin-left: auto;
  font-size: 11px;
  font-weight: 600;
  font-variant-numeric: tabular-nums;
  color: var(--color-text-secondary);
}
.${SCOPE} .ncd-gate-sub {
  margin-top: 2px;
  font-size: 11.5px;
  line-height: 1.5;
  color: var(--color-text-secondary);
}
/* Notice preview: 12.5px/1.55, one border-left rule per sentence. */
.${SCOPE} .ncd-notice {
  margin-top: 6px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.${SCOPE} .ncd-notice-line {
  font-family: ${SERIF};
  font-size: 12.5px;
  line-height: 1.55;
  color: var(--color-text-primary);
  border-left: 2px solid ${WARN};
  padding-left: 8px;
}
.${SCOPE} .ncd-notice-empty {
  font-size: 11.5px;
  color: var(--color-text-secondary);
  font-style: italic;
}
/* Sign-off toggle buttons: 40px. */
.${SCOPE} .ncd-sign {
  min-height: 40px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  margin-top: 6px;
  padding: 4px 12px;
  border-radius: var(--radius-container, 8px);
  border: var(--border-width) solid var(--color-border);
  background: var(--color-background-surface);
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
}
.${SCOPE} .ncd-sign:disabled { opacity: 0.45; cursor: default; }
.${SCOPE} .ncd-sign[aria-pressed='true'] {
  border-color: ${OK};
  color: ${OK};
  background: ${OK_TINT};
}
.${SCOPE} .ncd-publishrow {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: var(--spacing-3);
}
.${SCOPE} .ncd-published-note {
  font-size: 11.5px;
  font-variant-numeric: tabular-nums;
  color: ${OK};
  font-weight: 600;
}
/* --- responsive subtraction -------------------------------------------------- */
@media (max-width: 900px) {
  .${SCOPE} .ncd-rail { width: 320px; }
  .${SCOPE} .ncd-article { padding: var(--spacing-4) var(--spacing-3) var(--spacing-6); }
}
@media (max-width: 640px) {
  .${SCOPE} .ncd-body { flex-direction: column; overflow-y: auto; }
  .${SCOPE} .ncd-article-scroll { flex: none; overflow-y: visible; }
  .${SCOPE} .ncd-rail {
    width: 100%;
    border-left: none;
    border-top: var(--border-width) solid var(--color-border);
    overflow-y: visible;
  }
  .${SCOPE} .ncd-hed { font-size: 22px; }
  .${SCOPE} .ncd-sheet { padding: var(--spacing-4); }
}
@media (prefers-reduced-motion: no-preference) {
  .${SCOPE} .ncd-ann,
  .${SCOPE} .ncd-chip,
  .${SCOPE} .ncd-act,
  .${SCOPE} .ncd-sign,
  .${SCOPE} .ncd-meter-fill {
    transition: background-color 120ms ease, border-color 120ms ease,
      color 120ms ease, width 200ms ease;
  }
}
`;

// ---------------------------------------------------------------------------
// BRAND MARK — Erratum: a proofreader's dele loop over a baseline rule.
// Tiny inline SVG, currentColor only.
// ---------------------------------------------------------------------------

function ErratumMark() {
  return (
    <span className="ncd-mark" aria-hidden>
      <svg width="22" height="22" viewBox="0 0 22 22" fill="none">
        {/* dele loop */}
        <path
          d="M6.5 14.5 C 4 12, 6 7.5, 9.5 7.5 C 13 7.5, 14.5 10.5, 12.5 12.5 C 10.5 14.5, 8 13.5, 8.5 11"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* descender tail */}
        <path
          d="M6.5 14.5 C 8.5 16.5, 12.5 17, 15.5 15"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
        />
        {/* baseline rule */}
        <rect x="2" y="19" width="18" height="1.6" rx="0.8" fill="currentColor" />
      </svg>
    </span>
  );
}

// ---------------------------------------------------------------------------
// INLINE ANNOTATION — a claim span inside running prose, rendered as a real
// button. Pending/verified show the span as printed; corrected shows the
// printed span struck through beside its replacement; struck shows the span
// struck through alone (removed on publish of the correction).
// ---------------------------------------------------------------------------

function Annotation({
  claim,
  status,
  isSelected,
  isLocked,
  onSelect,
}: {
  claim: Claim;
  status: ClaimStatus;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: (id: ClaimId) => void;
}) {
  const statusLabel = STATUS_META[status].label;
  return (
    <button
      type="button"
      className={`ncd-ann ncd-focusable ncd-ann--${status}${isSelected ? ' ncd-ann--selected' : ''}`}
      aria-pressed={isSelected}
      aria-label={`Claim ${claim.id}, ${KIND_META[claim.kind].label}, ${statusLabel}: ${claim.text}`}
      title={`${claim.id} · ${KIND_META[claim.kind].label} · ${statusLabel}${isLocked ? ' · locked (published)' : ''}`}
      onClick={() => onSelect(claim.id)}>
      {status === 'corrected' && claim.suggestedCorrection != null ? (
        <>
          <span className="ncd-oldtext">{claim.text}</span>{' '}
          <span className="ncd-newtext">{claim.suggestedCorrection.newText}</span>
        </>
      ) : status === 'struck' ? (
        <span className="ncd-oldtext">{claim.text}</span>
      ) : (
        claim.text
      )}
      <sup>{claim.id}</sup>
    </button>
  );
}

// ---------------------------------------------------------------------------
// CLAIM CHECKLIST ROW — min 88px; owns the resolve actions for one claim.
// ---------------------------------------------------------------------------

function ClaimRow({
  claim,
  status,
  isSelected,
  isLocked,
  onSelect,
  onResolve,
}: {
  claim: Claim;
  status: ClaimStatus;
  isSelected: boolean;
  isLocked: boolean;
  onSelect: (id: ClaimId) => void;
  onResolve: (id: ClaimId, status: ClaimStatus) => void;
}) {
  const canCorrect = claim.suggestedCorrection != null;
  return (
    <div
      className={`ncd-claimrow${isSelected ? ' ncd-claimrow--selected' : ''}`}>
      <div className="ncd-claimtop">
        <button
          type="button"
          className={`ncd-claimid ncd-claimid--${status} ncd-focusable`}
          aria-pressed={isSelected}
          aria-label={`Select claim ${claim.id} and highlight it in the article`}
          onClick={() => onSelect(claim.id)}>
          {claim.id}
        </button>
        <span className="ncd-kind">{KIND_META[claim.kind].label}</span>
        <span className={`ncd-claimstatus ncd-claimstatus--${status}`}>
          {STATUS_META[status].label}
        </span>
      </div>
      <span className="ncd-span">“{claim.text}”</span>
      <span className="ncd-note">
        <strong>Flag:</strong> {claim.flagNote}
      </span>
      <span className="ncd-note">
        <strong>Source note:</strong> {claim.evidence}
      </span>
      {canCorrect && status !== 'corrected' && (
        <span className="ncd-suggestion">
          Drafted fix: “{claim.suggestedCorrection?.newText}”
        </span>
      )}
      <div className="ncd-actions">
        <button
          type="button"
          className="ncd-act ncd-act--verify ncd-focusable"
          aria-pressed={status === 'verified'}
          disabled={isLocked || status === 'verified'}
          onClick={() => onResolve(claim.id, 'verified')}>
          <Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />
          Verify
        </button>
        <Tooltip
          content={
            canCorrect
              ? `Apply: “${claim.suggestedCorrection?.newText}”`
              : 'No drafted correction — verify or strike this claim'
          }>
          <button
            type="button"
            className="ncd-act ncd-act--correct ncd-focusable"
            aria-pressed={status === 'corrected'}
            disabled={isLocked || !canCorrect || status === 'corrected'}
            onClick={() => onResolve(claim.id, 'corrected')}>
            <Icon icon={PenLineIcon} size="xsm" color="inherit" />
            Apply correction
          </button>
        </Tooltip>
        <button
          type="button"
          className="ncd-act ncd-act--strike ncd-focusable"
          aria-pressed={status === 'struck'}
          disabled={isLocked || status === 'struck'}
          onClick={() => onResolve(claim.id, 'struck')}>
          <Icon icon={ScissorsIcon} size="xsm" color="inherit" />
          Strike
        </button>
        {status !== 'pending' && (
          <button
            type="button"
            className="ncd-act ncd-focusable"
            disabled={isLocked}
            aria-label={`Reopen claim ${claim.id}`}
            onClick={() => onResolve(claim.id, 'pending')}>
            <Icon icon={RotateCcwIcon} size="xsm" color="inherit" />
            Reopen
          </button>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// SIGN-OFF GATE ROW — min 48px; icon flips green when the gate is satisfied.
// ---------------------------------------------------------------------------

function GateRow({
  isDone,
  icon,
  title,
  count,
  children,
}: {
  isDone: boolean;
  icon: typeof StampIcon;
  title: string;
  count?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`ncd-gate${isDone ? ' ncd-gate--done' : ''}`}>
      <span className="ncd-gate-icon" aria-hidden>
        <Icon icon={isDone ? CheckCircle2Icon : icon} size="xsm" color="inherit" />
      </span>
      <div className="ncd-gate-body">
        <div className="ncd-gate-title">
          {title}
          {count != null && <span className="ncd-gate-count">{count}</span>}
        </div>
        {children}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// PAGE — one status map + two signature booleans + published flag own every
// mutation; selection and the checklist filter are pure UI state.
// ---------------------------------------------------------------------------

export default function NewsroomCorrectionDeskTemplate() {
  const [statuses, setStatuses] = useState<StatusMap>(INITIAL_STATUSES);
  const [editorSigned, setEditorSigned] = useState(false);
  const [legalSigned, setLegalSigned] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<ClaimId | null>('C2');
  const [filter, setFilter] = useState<Filter>('all');
  const [announcement, setAnnouncement] = useState('');

  const desk = useMemo(() => deriveDesk(statuses), [statuses]);
  const verdict = deriveVerdict(desk, editorSigned, legalSigned, isPublished);
  const canPublish = desk.allResolved && editorSigned && legalSigned && !isPublished;

  // --- mutations -----------------------------------------------------------

  /** THE claim mutation. Any status change while signatures exist revokes
   * them — a signature attests to a specific claim set. */
  const resolveClaim = (id: ClaimId, next: ClaimStatus) => {
    if (isPublished) {
      return;
    }
    const hadSignatures = editorSigned || legalSigned;
    setStatuses(prev => ({...prev, [id]: next}));
    if (hadSignatures) {
      setEditorSigned(false);
      setLegalSigned(false);
    }
    setSelectedClaimId(id);
    const claim = CLAIM_BY_ID[id];
    setAnnouncement(
      `Claim ${id} ${STATUS_META[next].verb} (${claim.label}).` +
        (hadSignatures
          ? ' Standards and legal sign-offs were revoked — the claim set changed.'
          : ''),
    );
  };

  const publish = () => {
    if (!canPublish) {
      return;
    }
    setIsPublished(true);
    setAnnouncement(
      'Correction published Fri Jul 10, 2026 · 6:40 PM. All claim controls are now locked.',
    );
  };

  const selectClaim = (id: ClaimId) => {
    setSelectedClaimId(prev => (prev === id ? null : id));
  };

  const visibleClaims = CLAIMS.filter(
    c => filter === 'all' || statuses[c.id] === filter,
  );

  // --- header ----------------------------------------------------------------

  const header = (
    <LayoutHeader hasDivider>
      <div className="ncd-header-row">
        <HStack gap={3} vAlign="center" wrap="wrap">
          <ErratumMark />
          <StackItem size="fill" style={{minWidth: 0}}>
            <HStack gap={3} vAlign="center" wrap="wrap">
              <span className="ncd-overline">Erratum</span>
              <Heading level={2}>Correction desk · {ARTICLE.ticket}</Heading>
              <Badge label="The Calder Ledger" variant="neutral" />
            </HStack>
          </StackItem>
          <Text type="supporting" color="secondary" hasTabularNumbers>
            Opened Wed Jul 8 · standards R. Ellery · counsel S. Adeyemi
          </Text>
          <Badge label={verdict.label} variant={verdict.variant} />
        </HStack>
      </div>
    </LayoutHeader>
  );

  // --- derived strip: research meter + status filter chips --------------------

  const strip = (
    <div className="ncd-strip">
      <span className="ncd-meter" role="status" aria-label="Research progress">
        <span className="ncd-meter-track" aria-hidden>
          <span
            className="ncd-meter-fill"
            style={{width: `${desk.meterPct}%`}}
          />
        </span>
        {desk.resolved}/{desk.total} resolved · {desk.meterPct}%
      </span>
      <button
        type="button"
        className="ncd-chip ncd-focusable"
        aria-pressed={filter === 'all'}
        onClick={() => setFilter('all')}>
        All <strong>{desk.total}</strong>
      </button>
      {STATUS_ORDER.map(status => (
        <button
          key={status}
          type="button"
          className="ncd-chip ncd-focusable"
          aria-pressed={filter === status}
          aria-label={`Filter checklist: ${STATUS_META[status].label}, ${desk.counts[status]} claims`}
          onClick={() =>
            setFilter(prev => (prev === status ? 'all' : status))
          }>
          <span className={`ncd-dot ncd-dot--${status}`} aria-hidden />
          {STATUS_META[status].label} <strong>{desk.counts[status]}</strong>
        </button>
      ))}
    </div>
  );

  // --- article pane ------------------------------------------------------------

  const article = (
    <div className="ncd-article-scroll">
      <div className="ncd-article">
        <article className="ncd-sheet" aria-label="Article under review">
          {isPublished && (
            <div className="ncd-stamp">
              <Icon icon={StampIcon} size="sm" color="inherit" />
              <div>
                <p className="ncd-stamp-title">
                  Correction · Fri Jul 10, 2026 · 6:40 PM
                </p>
                {desk.noticeSentences.map(sentence => (
                  <span key={sentence}>{sentence} </span>
                ))}
              </div>
            </div>
          )}
          <h2 className="ncd-hed">{ARTICLE.hed}</h2>
          <p className="ncd-dek">{ARTICLE.dek}</p>
          <div className="ncd-byline">
            <Icon icon={FileTextIcon} size="xsm" color="secondary" />
            <span>{ARTICLE.byline}</span>
            <span>·</span>
            <span>{ARTICLE.published}</span>
          </div>
          {PARAGRAPHS.map((segments, grafIndex) => (
            <p
              className="ncd-graf"
              // Paragraph order is fixed fixture data — index keys are stable.
              // eslint-disable-next-line react/no-array-index-key
              key={grafIndex}>
              {segments.map((segment, segIndex) =>
                't' in segment ? (
                  // eslint-disable-next-line react/no-array-index-key
                  <span key={segIndex}>{segment.t}</span>
                ) : (
                  <Annotation
                    key={segment.claim}
                    claim={CLAIM_BY_ID[segment.claim]}
                    status={statuses[segment.claim]}
                    isSelected={selectedClaimId === segment.claim}
                    isLocked={isPublished}
                    onSelect={selectClaim}
                  />
                ),
              )}
            </p>
          ))}
        </article>
      </div>
    </div>
  );

  // --- review rail: checklist + sign-off lane ------------------------------------

  const rail = (
    <aside className="ncd-rail" aria-label="Claim review and sign-off">
      <div className="ncd-rail-head">
        <Icon icon={PenLineIcon} size="xsm" color="inherit" />
        Claim checklist
        <span className="ncd-count">
          {visibleClaims.length}/{desk.total}
          {filter !== 'all' && ` · ${STATUS_META[filter].label.toLowerCase()}`}
        </span>
      </div>
      {visibleClaims.length === 0 ? (
        <div className="ncd-claimrow">
          <span className="ncd-note">
            No {filter !== 'all' ? STATUS_META[filter].label.toLowerCase() : ''}{' '}
            claims right now — clear the filter chip above to see all{' '}
            {desk.total}.
          </span>
        </div>
      ) : (
        visibleClaims.map(claim => (
          <ClaimRow
            key={claim.id}
            claim={claim}
            status={statuses[claim.id]}
            isSelected={selectedClaimId === claim.id}
            isLocked={isPublished}
            onSelect={selectClaim}
            onResolve={resolveClaim}
          />
        ))
      )}
      <div className="ncd-rail-head">
        <Icon icon={ScaleIcon} size="xsm" color="inherit" />
        Sign-off lane
      </div>
      <GateRow
        isDone={desk.allResolved}
        icon={PenLineIcon}
        title="All claims resolved"
        count={`${desk.resolved}/${desk.total}`}>
        <p className="ncd-gate-sub">
          Every flagged claim verified, corrected, or struck.
          {!desk.allResolved &&
            ` ${desk.counts.pending} still open.`}
        </p>
      </GateRow>
      <GateRow
        isDone={desk.noticeSentences.length > 0}
        icon={FileTextIcon}
        title="Correction notice"
        count={`${desk.noticeSentences.length} sentence${desk.noticeSentences.length === 1 ? '' : 's'}`}>
        <div className="ncd-notice">
          {desk.noticeSentences.length === 0 ? (
            <span className="ncd-notice-empty">
              Composes automatically from corrected and struck claims once
              the set resolves.
            </span>
          ) : (
            desk.noticeSentences.map(sentence => (
              <span key={sentence} className="ncd-notice-line">
                {sentence}
              </span>
            ))
          )}
        </div>
      </GateRow>
      <GateRow
        isDone={editorSigned}
        icon={PenLineIcon}
        title="Standards editor"
        count="R. Ellery">
        <p className="ncd-gate-sub">
          Attests the checklist and notice reflect the source record.
        </p>
        <button
          type="button"
          className="ncd-sign ncd-focusable"
          aria-pressed={editorSigned}
          disabled={!desk.allResolved || isPublished}
          onClick={() => {
            setEditorSigned(prev => !prev);
            setAnnouncement(
              editorSigned
                ? 'Standards sign-off withdrawn.'
                : 'Standards editor signed off.',
            );
          }}>
          <Icon icon={PenLineIcon} size="xsm" color="inherit" />
          {editorSigned ? 'Signed — R. Ellery' : 'Sign off (standards)'}
        </button>
      </GateRow>
      <GateRow
        isDone={legalSigned}
        icon={ScaleIcon}
        title="Legal review"
        count="S. Adeyemi">
        <p className="ncd-gate-sub">
          Required because a quoted board member disputes her quote (C5).
        </p>
        <button
          type="button"
          className="ncd-sign ncd-focusable"
          aria-pressed={legalSigned}
          disabled={!editorSigned || isPublished}
          onClick={() => {
            setLegalSigned(prev => !prev);
            setAnnouncement(
              legalSigned ? 'Legal sign-off withdrawn.' : 'Legal signed off.',
            );
          }}>
          <Icon icon={ScaleIcon} size="xsm" color="inherit" />
          {legalSigned ? 'Signed — S. Adeyemi' : 'Sign off (legal)'}
        </button>
      </GateRow>
      <div className="ncd-publishrow">
        <Button
          label={isPublished ? 'Correction published' : 'Publish correction'}
          variant="primary"
          size="md"
          isDisabled={!canPublish}
          icon={
            <Icon
              icon={isPublished ? CheckCircle2Icon : SendIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={publish}
        />
        {isPublished ? (
          <span className="ncd-published-note">
            Live since Fri Jul 10, 2026 · 6:40 PM
          </span>
        ) : (
          !canPublish && (
            <Text type="supporting" color="secondary">
              {verdict.label}
            </Text>
          )
        )}
      </div>
      {!isPublished && (editorSigned || legalSigned) && (
        <div className="ncd-publishrow" style={{paddingTop: 0}}>
          <HStack gap={2} vAlign="center">
            <Icon icon={AlertTriangleIcon} size="xsm" color="secondary" />
            <Text type="supporting" color="secondary">
              Changing any claim now revokes existing sign-offs.
            </Text>
          </HStack>
        </div>
      )}
    </aside>
  );

  return (
    <div className={SCOPE} style={{height: '100dvh', width: '100%'}}>
      <style>{TEMPLATE_CSS}</style>
      <Layout
        height="fill"
        header={header}
        content={
          <LayoutContent padding={0}>
            <div className="ncd-content">
              <div aria-live="polite" className="ncd-vh">
                {announcement}
              </div>
              {strip}
              <div className="ncd-body">
                {article}
                {rail}
              </div>
            </div>
          </LayoutContent>
        }
      />
    </div>
  );
}
