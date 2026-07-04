var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only: three frozen hover moments over the
 *   M-2417 research memo (Kestrel Labs — Series C Financing, Marlow & Voss
 *   LLP, suite "now" Wed Jul 15 2026). Specimen 01 anchors on the canonical
 *   Calder Point Capital, L.P. v. Ostrand Sys., Inc., 214 A.3d 887 (Del. Ch.
 *   2021) cite at a fresh pin (at 896), verified by Priya Khanna Jul 14;
 *   specimen 02 anchors on Renwick Data Grp. v. Talvace, Inc., 388 F. Supp.
 *   3d 512 (S.D.N.Y. 2020) at 519 — the same cite the research memo leaves
 *   unverified — with two fictional later Chancery cases distinguishing it;
 *   specimen 03 anchors on a phantom transcript ruling (Delmore v. Ashwick
 *   Labs, Inc.) that Casewright cited but cannot locate in the matter
 *   corpus. All authorities are FICTIONAL but plausibly formatted. No
 *   clocks, no randomness, no network assets; avatars are initials-only.
 * @output Source Citation Popover — three side-by-side specimens of the
 *   Casewright citation-chip hover popover, each frozen open over a dimmed
 *   serif memo excerpt: 01 verified/good-law (authority + reporter,
 *   green treatment badge, quoted source passage with the relied-upon
 *   sentence highlighted, mono pin-cite chip, "Verified · Priya Khanna ·
 *   Jul 14" provenance row, open-full-source affordance); 02 caution
 *   (amber "distinguished by 2 later cases" treatment with the mini list
 *   of distinguishing decisions, amber-underlined unverified quote, and a
 *   Verify-now action that flips the row to verified provenance); 03
 *   unverifiable (red "Source not found in matter corpus" with the search
 *   scope line, a Report-issue affordance routing to Ruth Vega, and the
 *   AI-disclosure note). Mono caption rows sit ABOVE each specimen.
 * @position Block template; emitted by \`astryx template source-citation-popover\`
 *
 * Frame: no app shell — this is an INDIVIDUAL SMALL EXPERIENCE. A full-bleed
 * stage div (minHeight 100dvh, token muted wash with one soft Casewright-
 * purple radial tint) centers a small header and a wrapping specimen row;
 * each specimen is width:min(420px, 100%) — the popover's natural anchored
 * width — with its caption row (mono state-id Token + one-line note) ABOVE
 * the paper, per the composer-state-gallery idiom. Every specimen renders
 * one shared paper-backdrop component (privilege microline, memo meta line,
 * dimmed lead prose, the bright anchor citation chip on its own citation-
 * sentence line, then a position:relative region where the popover floats
 * absolutely over dimmed continuation prose), so geometry stays registered
 * across specimens.
 *
 * Responsive contract:
 * - >=1360px: the three specimens sit side by side, top-aligned, centered.
 * - <1360px: the specimen row flex-wraps (2+1, then a single stacked
 *   column); each paper keeps width:min(420px, 100%) so nothing clips at
 *   375px. Popovers span the paper width minus fixed insets, so they never
 *   overflow; badge/chip rows and footer rows use flexWrap.
 * - Interactivity is local to each specimen: 02's Verify-now flips its
 *   verification row to verified provenance; 03's Report-issue resolves to
 *   a "Reported to Ruth Vega" confirmation. All controls are real buttons
 *   with aria labels; nothing depends on live hover — the hover moment is
 *   statically pinned open.
 *
 * Container policy (specimen-gallery archetype): no Cards — the memo paper
 * is a hand-rolled light-locked sheet div and the popover is a hand-rolled
 * floating panel (surface background, border, --shadow-high, caret), since
 * neither is a summary widget. Captions and treatment badges use Token;
 * rows are plain flex divs in the repo style-object idiom.
 *
 * Color policy: ONE accent — Casewright purple,
 * var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF)) — for
 * the sparkle marks, the anchor-chip ring/wash, and the stage tint.
 * SCHEME-LOCK EXCEPTION (documented per the paper-canvas rule): the memo
 * sheet is locked light (colorScheme:'light' + explicit literals only —
 * ink #1F2937, dimmed rgba washes, paper #FDFCF8) so the excerpt reads as
 * printed paper in both schemes. The popover itself is Casewright CHROME,
 * not paper: it re-anchors to the page scheme via MediaTheme mode={mode}
 * (the footgun-5 idiom), so it renders token-pure — dark panel over light
 * paper in dark mode, exactly like real overlay chrome. Verification
 * semantics use light-dark() pairs: green light-dark(#0B991F, #34C759),
 * amber light-dark(#B45309, #FBBF24), red light-dark(#DC2626, #F87171).
 * Everything outside the locked sheet stays token-pure so both schemes
 * pass AA.
 */

import {useState, type CSSProperties, type ReactNode} from 'react';

import {
  ArrowUpRightIcon,
  CheckCircle2Icon,
  FlagIcon,
  QuoteIcon,
  ScaleIcon,
  SearchXIcon,
  SparklesIcon,
  TriangleAlertIcon,
} from 'lucide-react';

import {VStack} from '@astryxdesign/core/Layout';
import {Heading, Text} from '@astryxdesign/core/Text';
import {Avatar} from '@astryxdesign/core/Avatar';
import {Button} from '@astryxdesign/core/Button';
import {Divider} from '@astryxdesign/core/Divider';
import {Icon} from '@astryxdesign/core/Icon';
import {Token} from '@astryxdesign/core/Token';
import {MediaTheme, useTheme} from '@astryxdesign/core/theme';

// ============= ACCENT + SEMANTIC CONSTANTS =============
// ONE Casewright-purple accent (categorical token with the repo-standard
// fallback pair); green/amber/red are verification semantics, not accents.

const CASEWRIGHT_ACCENT =
  'var(--color-data-categorical-purple, light-dark(#6B1EFD, #9D6BFF))';
const CASEWRIGHT_SOFT = 'light-dark(rgba(107,30,253,0.08), rgba(157,107,255,0.14))';

const VERIFIED_GREEN = 'var(--color-data-categorical-green, light-dark(#0B991F, #34C759))';
const VERIFIED_WASH = 'light-dark(rgba(11,153,31,0.13), rgba(52,199,89,0.18))';
const CAUTION_AMBER = 'light-dark(#B45309, #FBBF24)';
const FLAG_RED = 'light-dark(#DC2626, #F87171)';
const FLAG_RED_WASH = 'light-dark(rgba(220,38,38,0.07), rgba(248,113,113,0.12))';

// Scheme-locked paper literals (see Color policy): used ONLY on the sheet.
const PAPER_BG = '#FDFCF8';
const PAPER_EDGE = '#E3E0D7';
const PAPER_INK = '#1F2937';
const PAPER_DIM = 'rgba(31,41,55,0.46)';
const PAPER_FAINT = 'rgba(31,41,55,0.58)';
const ANCHOR_INK = '#4B1EAE';
const ANCHOR_WASH = 'rgba(107,30,253,0.08)';
const ANCHOR_RING = 'rgba(107,30,253,0.42)';

const SERIF_STACK = "Georgia, 'Times New Roman', Times, serif";

const DISCLOSURE = 'AI-generated · verify before relying';

// ============= FIXTURES =============
// One shared world (suite "now": Wed Jul 15, 2026). The memo excerpts echo
// the M-2417 research memo's Discussion sections; Renwick at 519 is the
// SAME cite that memo leaves unverified, and Calder Point's treatment note
// reuses its canonical string. All authorities are fictional.

const MATTER_LINE = 'Research memo · M-2417 · Kestrel Labs — Series C Financing';
const PRIVILEGE_LINE =
  'Attorney-Client Privileged · Attorney Work Product — do not forward';

interface ExcerptFixture {
  /** Dimmed lead prose above the anchor citation sentence. */
  lead: string;
  /** The bright anchor chip's short-cite label (a citation sentence). */
  chipLabel: string;
  /** Dimmed continuation prose the popover floats over. */
  tail: string;
  /** Fixed px height of the popover-hosting region (fits the popover). */
  regionMinHeight: number;
}

const VERIFIED_EXCERPT: ExcerptFixture = {
  lead:
    'Article IV.C(6) states the condition without qualification: the junior preferred protective provisions “shall be of no further force or effect” once the holders cease to hold 30% of their originally issued shares. In Calder Point, the Court of Chancery enforced the same mechanic against holders at 27.1%.',
  chipLabel: 'Calder Point, 214 A.3d at 896',
  tail:
    'Measurement timing favors the same result: the record date fixed for the consent controls, and on the June 30 record date the junior preferred stood at 24.6% after the secondary sales to Meridian Growth Partners. The transfer agent’s certified capitalization table (Disclosure Schedules, Ex. B-4) is the operative proof.',
  regionMinHeight: 412,
};

const VERIFIED_POPOVER = {
  caseName: 'Calder Point Capital, L.P. v. Ostrand Sys., Inc.',
  reporter: '214 A.3d 887 (Del. Ch. 2021)',
  treatment: 'Good law · no negative history',
  pin: 'at 896',
  quoteBefore: 'The certificate fixes the moment of lapse; equity does not extend it.',
  quoteRelied:
    'Once the holders’ retained ownership falls below the stated floor, the protective provisions lapse by their own terms, and no further corporate act — no notice, no amendment, no board resolution — is required to give that lapse effect.',
  quoteAfter: 'Sophisticated parties are held to the thresholds they negotiate.',
  quoteNote: 'Relied-upon sentence highlighted · quote matches the reported opinion',
  verifiedBy: 'Priya Khanna',
  verifiedOn: 'Jul 14',
  sourceLabel: 'Open full source · Del. Ch. opinions',
};

const CAUTION_EXCERPT: ExcerptFixture = {
  lead:
    'One reading cuts the other way. A single district court has treated a lapsed protective provision as surviving for consents solicited before the lapse date — which, if followed, would put the June consents back in play.',
  chipLabel: 'Renwick, 388 F. Supp. 3d at 519',
  tail:
    'Later Delaware dicta declined to follow that reading, and the June 30 record date postdates the lapse here in any event, so the exposure is framing risk rather than outcome risk. The draft flags the point for Julian Voss’s read before the markup goes to Meridian’s counsel.',
  regionMinHeight: 478,
};

const CAUTION_POPOVER = {
  caseName: 'Renwick Data Grp. v. Talvace, Inc.',
  reporter: '388 F. Supp. 3d 512 (S.D.N.Y. 2020)',
  treatment: 'Caution · distinguished by 2 later cases',
  pin: 'at 519',
  distinguishedBy: [
    {
      caseName: 'Tallgrass Analytics, Inc. v. Veery Cap. Partners, L.P.',
      cite: '301 A.3d 118, 131 (Del. Ch. 2023)',
      note: 'Declined to follow the survival reading in dicta',
    },
    {
      caseName: 'Averline Sys. Corp. v. Corvid Partners LLC',
      cite: '322 A.3d 209, 217 (Del. Ch. 2024)',
      note: 'Limited Renwick to consents completed before lapse',
    },
  ],
  quoteRelied:
    'A protective provision that has lapsed by its terms may nonetheless govern a consent solicited while it remained in force.',
  quoteNote: 'Quote not yet checked against the slip opinion',
  unverifiedLabel: 'Not yet checked against source',
  /** What the row flips to after Verify now (suite "now": Jul 15). */
  verifiedBy: 'Priya Khanna',
  verifiedOn: 'Jul 15',
  sourceLabel: 'Open full source · S.D.N.Y. opinions',
};

const NOT_FOUND_EXCERPT: ExcerptFixture = {
  lead:
    'No Delaware court has reached the fiduciary question on these facts. The draft nonetheless attributes a materially similar lapse holding to a recent Chancery transcript ruling said to have approved the mechanic outright.',
  chipLabel: 'Delmore, C.A. No. 2024-0512 (Del. Ch.)',
  tail:
    'If the ruling exists, it would be the closest authority on the fiduciary backstop; if it does not, Part III rests on Marden alone and the Brief Answer should hedge accordingly. Ruth Vega’s cite-check pass is scheduled ahead of Friday’s partner read.',
  regionMinHeight: 464,
};

const NOT_FOUND_POPOVER = {
  caseName: 'Delmore v. Ashwick Labs, Inc.',
  reporter: 'C.A. No. 2024-0512-LTZ (Del. Ch. Sept. 9, 2024) (transcript)',
  treatment: 'Source not found',
  headline: 'Source not found in matter corpus',
  body:
    'No transcript or opinion matching this citation exists in the M-2417 corpus or the firm research library. Casewright drafted this sentence — the authority may be misremembered or misattributed.',
  scopeLine: 'Searched Jul 15 · 238 matter documents · 3,120 library authorities · 0 matches',
  reportTarget: 'Ruth Vega',
  disclosureNote:
    'Do not cite until a human locates the source or removes the sentence.',
};

// ============= STYLES =============

const styles: Record<string, CSSProperties> = {
  // Muted token stage with one soft Casewright-purple radial tint.
  stage: {
    minHeight: '100dvh',
    width: '100%',
    boxSizing: 'border-box',
    backgroundColor: 'var(--color-background-muted)',
    backgroundImage: \`radial-gradient(1100px 460px at 50% -80px, \${CASEWRIGHT_SOFT}, transparent 70%)\`,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 'var(--spacing-6)',
    paddingBlock: 'var(--spacing-8)',
    paddingInline: 'var(--spacing-4)',
  },
  stageHeader: {textAlign: 'center', maxWidth: 640},
  specimenRow: {
    display: 'flex',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'flex-start',
    gap: 'var(--spacing-6)',
  },
  specimen: {
    width: 'min(420px, 100%)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  // Caption row: mono state-id Token pinned (footgun 18 — flexShrink 0,
  // nowrap); the one-line note wraps instead.
  captionRow: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 'var(--spacing-2)',
  },
  captionToken: {flexShrink: 0, whiteSpace: 'nowrap'},
  captionNote: {minWidth: 0},
  // ---- Scheme-locked memo sheet (paper literals ONLY; see Color policy).
  paper: {
    colorScheme: 'light',
    backgroundColor: PAPER_BG,
    color: PAPER_INK,
    border: \`var(--border-width) solid \${PAPER_EDGE}\`,
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-low)',
    padding: 'var(--spacing-5)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-3)',
    overflow: 'hidden',
  },
  privilegeLine: {
    fontSize: 10, fontWeight: 700, letterSpacing: '0.08em',
    textTransform: 'uppercase', color: PAPER_FAINT, textAlign: 'center',
  },
  paperMeta: {
    fontSize: 11, color: PAPER_DIM, fontVariantNumeric: 'tabular-nums',
    borderBottom: \`var(--border-width) solid \${PAPER_EDGE}\`,
    paddingBottom: 'var(--spacing-2)',
  },
  // Dimmed serif memo prose — the backdrop the popover hovers over.
  proseDim: {
    fontFamily: SERIF_STACK,
    fontSize: 13.5,
    lineHeight: 1.62,
    color: PAPER_DIM,
    margin: 0,
  },
  // The anchor citation sentence: bright chip + dimmed period.
  anchorLine: {display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap'},
  // Hand-rolled citation chip frozen in its hovered state (accent ring).
  anchorChip: {
    appearance: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'inherit',
    fontSize: 12,
    fontWeight: 600,
    color: ANCHOR_INK,
    backgroundColor: ANCHOR_WASH,
    border: 'none',
    boxShadow: \`0 0 0 2px \${ANCHOR_RING}\`,
    borderRadius: 'var(--radius-full)',
    paddingInline: 10,
    paddingBlock: 3,
    whiteSpace: 'nowrap',
  },
  anchorGlyph: {width: 7, height: 7, borderRadius: '50%', flexShrink: 0},
  anchorPeriod: {fontFamily: SERIF_STACK, fontSize: 13.5, color: PAPER_DIM},
  // Popover-hosting region: relative, fixed min-height per specimen so the
  // absolutely-positioned popover always fits inside the sheet.
  anchorRegion: {position: 'relative'},
  // ---- Casewright chrome popover (token-pure; re-anchored via MediaTheme).
  popover: {
    position: 'absolute',
    top: 10,
    left: 6,
    right: 6,
    backgroundColor: 'var(--color-background-surface)',
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-container)',
    boxShadow: 'var(--shadow-high)',
    padding: 'var(--spacing-3)',
    display: 'flex',
    flexDirection: 'column',
    gap: 'var(--spacing-2)',
  },
  caret: {
    position: 'absolute', top: -7, left: 22, width: 12, height: 12,
    transform: 'rotate(45deg)',
    backgroundColor: 'var(--color-background-surface)',
    borderTop: 'var(--border-width) solid var(--color-border)',
    borderLeft: 'var(--border-width) solid var(--color-border)',
  },
  eyebrowRow: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-1)',
    color: CASEWRIGHT_ACCENT,
  },
  // Treatment badge + pin-cite chips share a wrapping row; each chip is
  // atomic (nowrap) so the ROW wraps, never a chip mid-token (footgun 18).
  chipRow: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  chipNoShrink: {flexShrink: 0},
  pinChip: {
    fontFamily: 'var(--font-family-code, monospace)',
    fontVariantNumeric: 'tabular-nums',
    fontSize: 11.5,
    border: 'var(--border-width) solid var(--color-border)',
    borderRadius: 'var(--radius-full)',
    paddingInline: 8,
    paddingBlock: 1,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  // Quoted source passage: serif document voice inside the chrome panel.
  quoteBlock: {
    borderLeft: \`3px solid var(--color-border)\`,
    paddingInlineStart: 'var(--spacing-2)',
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  quoteText: {
    fontFamily: SERIF_STACK,
    fontSize: 12.5,
    lineHeight: 1.58,
    color: 'var(--color-text-primary)',
    margin: 0,
  },
  reliedVerified: {
    backgroundColor: VERIFIED_WASH,
    borderRadius: 2,
    boxDecorationBreak: 'clone',
    WebkitBoxDecorationBreak: 'clone',
    paddingInline: 2,
  },
  reliedUnverified: {
    textDecorationLine: 'underline',
    textDecorationStyle: 'dotted',
    textDecorationColor: CAUTION_AMBER,
    textDecorationThickness: 1.5,
    textUnderlineOffset: 3,
  },
  // Note rows under quotes: icon pinned to the FIRST text line (flex-start
  // + optical nudge) so it never floats between wrapped lines.
  quoteNoteRow: {display: 'flex', alignItems: 'flex-start', gap: 4},
  quoteNoteIcon: {display: 'inline-flex', flexShrink: 0, marginTop: 2},
  // Mini list of distinguishing decisions (caution state).
  miniList: {
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)',
    borderLeft: \`3px solid \${CAUTION_AMBER}\`,
    paddingInlineStart: 'var(--spacing-2)',
  },
  miniListRow: {display: 'flex', flexDirection: 'column', gap: 0},
  // Verification / status rows: icon pinned, prose wraps.
  verifyRow: {
    display: 'flex', alignItems: 'center', gap: 'var(--spacing-2)',
    flexWrap: 'wrap',
  },
  verifyIcon: {display: 'inline-flex', flexShrink: 0},
  verifyText: {minWidth: 0, flex: '1 1 160px'},
  // Red not-found notice panel.
  notFoundPanel: {
    backgroundColor: FLAG_RED_WASH,
    border: \`var(--border-width) solid \${FLAG_RED}\`,
    borderRadius: 'var(--radius-control, 8px)', padding: 'var(--spacing-2)',
    display: 'flex', flexDirection: 'column', gap: 'var(--spacing-1)',
  },
  scopeLine: {
    fontFamily: 'var(--font-family-code, monospace)', fontSize: 10.5,
    fontVariantNumeric: 'tabular-nums', color: 'var(--color-text-secondary)',
  },
  // Footer: disclosure line ABOVE the open-full-source affordance — always
  // stacked so all three specimens render the identical footer shape.
  footerRow: {
    display: 'flex', flexDirection: 'column', alignItems: 'flex-start',
    gap: 'var(--spacing-1)',
  },
  disclosureText: {
    minWidth: 0, display: 'inline-flex', alignItems: 'center', gap: 5,
  },
  // Hand-rolled link-styled real button (open full source).
  linkButton: {
    appearance: 'none',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    padding: 0,
    font: 'inherit',
    fontSize: 12,
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    color: 'var(--color-accent)',
    textDecoration: 'underline',
    textUnderlineOffset: 2,
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  linkButtonDisabled: {
    color: 'var(--color-text-secondary)', textDecoration: 'none',
    cursor: 'default',
  },
};

// ============= SHARED SPECIMEN BITS =============

/**
 * Specimen wrapper: mono state-id Token + one-line note ABOVE the paper,
 * per the composer-state-gallery caption idiom (footgun 18: token pinned).
 */
function Specimen({
  stateId,
  note,
  children,
}: {
  stateId: string;
  note: string;
  children: ReactNode;
}) {
  return (
    <section style={styles.specimen} aria-label={stateId}>
      <div style={styles.captionRow}>
        <span style={styles.captionToken}>
          <Token label={stateId} size="sm" color="gray" />
        </span>
        <div style={styles.captionNote}>
          <Text type="supporting" size="xsm" color="secondary">
            {note}
          </Text>
        </div>
      </div>
      {children}
    </section>
  );
}

/**
 * Light-locked memo sheet: privilege microline, matter meta line, dimmed
 * lead prose, the bright anchor citation chip on its own citation-sentence
 * line (frozen in its hovered state), then the relative region where the
 * popover floats absolutely over dimmed continuation prose.
 */
function PaperBackdrop({
  excerpt,
  glyphColor,
  popover,
}: {
  excerpt: ExcerptFixture;
  /** Paper-literal treatment glyph color inside the anchor chip. */
  glyphColor: string;
  popover: ReactNode;
}) {
  return (
    <div style={styles.paper}>
      <div style={styles.privilegeLine}>{PRIVILEGE_LINE}</div>
      <div style={styles.paperMeta}>{MATTER_LINE}</div>
      <p style={styles.proseDim}>{excerpt.lead}</p>
      <div style={styles.anchorLine}>
        <button
          type="button"
          style={styles.anchorChip}
          aria-expanded
          aria-label={\`Citation \${excerpt.chipLabel} — source popover open\`}>
          <span
            style={{...styles.anchorGlyph, backgroundColor: glyphColor}}
            aria-hidden
          />
          {excerpt.chipLabel}
        </button>
        <span style={styles.anchorPeriod} aria-hidden>
          .
        </span>
      </div>
      <div style={{...styles.anchorRegion, minHeight: excerpt.regionMinHeight}}>
        <p style={styles.proseDim}>{excerpt.tail}</p>
        {popover}
      </div>
    </div>
  );
}

/**
 * The floating Casewright panel. The sheet is locked light, but the popover
 * is app CHROME — re-anchor it to the page scheme via MediaTheme (footgun 5)
 * so it renders token-pure: a dark panel over light paper in dark mode.
 */
function PopoverShell({
  ariaLabel,
  children,
}: {
  ariaLabel: string;
  children: ReactNode;
}) {
  const {mode: colorMode} = useTheme();
  return (
    <MediaTheme mode={colorMode}>
      <div role="dialog" aria-label={ariaLabel} style={styles.popover}>
        <span style={styles.caret} aria-hidden />
        {children}
      </div>
    </MediaTheme>
  );
}

/** Eyebrow + authority name + reporter — shared popover header. */
function AuthorityHeader({
  caseName,
  reporter,
}: {
  caseName: string;
  reporter: string;
}) {
  return (
    <VStack gap={1}>
      <div style={styles.eyebrowRow}>
        <Icon icon={ScaleIcon} size="xsm" color="inherit" />
        <Text type="supporting" size="xsm" color="secondary">
          Casewright · Source check
        </Text>
      </div>
      <Text type="body" size="sm" weight="bold">
        <em>{caseName}</em>
      </Text>
      <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
        {reporter}
      </Text>
    </VStack>
  );
}

/**
 * Green provenance row — the suite's one verification vocabulary:
 * check glyph + checker Avatar + "Verified · <name> · <date>".
 */
function VerifiedProvenanceRow({name, date}: {name: string; date: string}) {
  return (
    <div style={styles.verifyRow}>
      <span style={{...styles.verifyIcon, color: VERIFIED_GREEN}}>
        <Icon icon={CheckCircle2Icon} size="sm" color="inherit" />
      </span>
      <Avatar name={name} size="tiny" />
      <div style={styles.verifyText}>
        <Text type="supporting" size="xsm" color="secondary" hasTabularNumbers>
          Verified · {name} · {date}
        </Text>
      </div>
    </div>
  );
}

/**
 * Shared footer: the suite disclosure line (sparkle + "AI-generated ·
 * verify before relying") beside the open-full-source affordance. The
 * unverifiable state disables the link — there is no source to open.
 */
function PopoverFooter({
  sourceLabel,
  isSourceMissing,
}: {
  sourceLabel: string;
  isSourceMissing?: boolean;
}) {
  return (
    <VStack gap={2}>
      <Divider />
      <div style={styles.footerRow}>
        <span style={styles.disclosureText}>
          <span style={{color: CASEWRIGHT_ACCENT, display: 'inline-flex'}}>
            <Icon icon={SparklesIcon} size="xsm" color="inherit" />
          </span>
          <Text type="supporting" size="xsm" color="secondary">
            {DISCLOSURE}
          </Text>
        </span>
        <button
          type="button"
          style={
            isSourceMissing
              ? {...styles.linkButton, ...styles.linkButtonDisabled}
              : styles.linkButton
          }
          disabled={isSourceMissing}
          aria-label={sourceLabel}>
          {sourceLabel}
          {isSourceMissing ? null : (
            <Icon icon={ArrowUpRightIcon} size="xsm" color="inherit" />
          )}
        </button>
      </div>
    </VStack>
  );
}

// ============= SPECIMEN 01 — VERIFIED / GOOD LAW =============

function VerifiedPopover() {
  const fx = VERIFIED_POPOVER;
  return (
    <PopoverShell ariaLabel={\`Source check — \${fx.caseName}\`}>
      <AuthorityHeader caseName={fx.caseName} reporter={fx.reporter} />
      <div style={styles.chipRow}>
        <span style={styles.chipNoShrink}>
          <Token
            label={fx.treatment}
            size="sm"
            color="green"
            icon={<Icon icon={CheckCircle2Icon} size="xsm" color="inherit" />}
          />
        </span>
        <span style={styles.pinChip}>pin · {fx.pin}</span>
      </div>
      <div style={styles.quoteBlock}>
        <p style={styles.quoteText}>
          “{fx.quoteBefore}{' '}
          <span style={styles.reliedVerified}>{fx.quoteRelied}</span>{' '}
          {fx.quoteAfter}”
        </p>
        <div style={styles.quoteNoteRow}>
          <span style={{...styles.quoteNoteIcon, color: VERIFIED_GREEN}}>
            <Icon icon={QuoteIcon} size="xsm" color="inherit" />
          </span>
          <Text type="supporting" size="xsm" color="secondary">
            {fx.quoteNote}
          </Text>
        </div>
      </div>
      <VerifiedProvenanceRow name={fx.verifiedBy} date={fx.verifiedOn} />
      <PopoverFooter sourceLabel={fx.sourceLabel} />
    </PopoverShell>
  );
}

function VerifiedSpecimen() {
  return (
    <Specimen
      stateId="01 · verified"
      note="Hover on a good-law cite: quoted passage with the relied-upon sentence highlighted, verified by Priya Khanna Jul 14.">
      <PaperBackdrop
        excerpt={VERIFIED_EXCERPT}
        glyphColor="#0B7A1C"
        popover={<VerifiedPopover />}
      />
    </Specimen>
  );
}

// ============= SPECIMEN 02 — CAUTION / DISTINGUISHED =============

function CautionPopover() {
  const fx = CAUTION_POPOVER;
  const [isVerified, setIsVerified] = useState(false);
  return (
    <PopoverShell ariaLabel={\`Source check — \${fx.caseName}\`}>
      <AuthorityHeader caseName={fx.caseName} reporter={fx.reporter} />
      <div style={styles.chipRow}>
        <span style={styles.chipNoShrink}>
          <Token
            label={fx.treatment}
            size="sm"
            color="orange"
            icon={<Icon icon={TriangleAlertIcon} size="xsm" color="inherit" />}
          />
        </span>
        <span style={styles.pinChip}>pin · {fx.pin}</span>
      </div>
      <div style={styles.miniList}>
        {fx.distinguishedBy.map(d => (
          <div key={d.caseName} style={styles.miniListRow}>
            <Text type="supporting" size="xsm">
              <em>{d.caseName}</em>, {d.cite}
            </Text>
            <Text type="supporting" size="xsm" color="secondary">
              {d.note}
            </Text>
          </div>
        ))}
      </div>
      <div style={styles.quoteBlock}>
        <p style={styles.quoteText}>
          “<span style={isVerified ? styles.reliedVerified : styles.reliedUnverified}>
            {fx.quoteRelied}
          </span>”
        </p>
        {isVerified ? null : (
          <div style={styles.quoteNoteRow}>
            <span style={{...styles.quoteNoteIcon, color: CAUTION_AMBER}}>
              <Icon icon={QuoteIcon} size="xsm" color="inherit" />
            </span>
            <Text type="supporting" size="xsm" color="secondary">
              {fx.quoteNote}
            </Text>
          </div>
        )}
      </div>
      {isVerified ? (
        <VerifiedProvenanceRow name={fx.verifiedBy} date={fx.verifiedOn} />
      ) : (
        <div style={styles.verifyRow}>
          <span style={{...styles.verifyIcon, color: CAUTION_AMBER}}>
            <Icon icon={TriangleAlertIcon} size="sm" color="inherit" />
          </span>
          <div style={styles.verifyText}>
            <Text type="supporting" size="xsm" color="secondary">
              {fx.unverifiedLabel}
            </Text>
          </div>
          <Button
            label="Verify now"
            size="sm"
            variant="secondary"
            icon={<Icon icon={CheckCircle2Icon} size="sm" color="inherit" />}
            onClick={() => setIsVerified(true)}
          />
        </div>
      )}
      <PopoverFooter sourceLabel={fx.sourceLabel} />
    </PopoverShell>
  );
}

function CautionSpecimen() {
  return (
    <Specimen
      stateId="02 · caution"
      note="Amber treatment — distinguished by 2 later Chancery cases; the unverified quote keeps Verify now pinned beside it.">
      <PaperBackdrop
        excerpt={CAUTION_EXCERPT}
        glyphColor="#B45309"
        popover={<CautionPopover />}
      />
    </Specimen>
  );
}

// ============= SPECIMEN 03 — UNVERIFIABLE / NOT FOUND =============

function NotFoundPopover() {
  const fx = NOT_FOUND_POPOVER;
  const [isReported, setIsReported] = useState(false);
  return (
    <PopoverShell ariaLabel={\`Source check — \${fx.caseName}\`}>
      <AuthorityHeader caseName={fx.caseName} reporter={fx.reporter} />
      <div style={styles.chipRow}>
        <span style={styles.chipNoShrink}>
          <Token
            label={fx.treatment}
            size="sm"
            color="red"
            icon={<Icon icon={SearchXIcon} size="xsm" color="inherit" />}
          />
        </span>
        <span style={styles.pinChip}>pin · none</span>
      </div>
      <div style={styles.notFoundPanel}>
        <div style={styles.verifyRow}>
          <span style={{...styles.verifyIcon, color: FLAG_RED}}>
            <Icon icon={SearchXIcon} size="sm" color="inherit" />
          </span>
          <div style={styles.verifyText}>
            <Text type="body" size="sm" weight="bold">
              {fx.headline}
            </Text>
          </div>
        </div>
        <Text type="supporting" size="xsm" color="secondary">
          {fx.body}
        </Text>
        <span style={styles.scopeLine}>{fx.scopeLine}</span>
      </div>
      <div style={styles.verifyRow}>
        <div style={styles.verifyText}>
          <Text type="supporting" size="xsm" color="secondary">
            {isReported
              ? \`Reported to \${fx.reportTarget} · Jul 15\`
              : \`Route to \${fx.reportTarget} for the cite-check pass.\`}
          </Text>
        </div>
        <Button
          label={isReported ? 'Issue reported' : 'Report issue'}
          size="sm"
          variant="secondary"
          isDisabled={isReported}
          icon={
            <Icon
              icon={isReported ? CheckCircle2Icon : FlagIcon}
              size="sm"
              color="inherit"
            />
          }
          onClick={() => setIsReported(true)}
        />
      </div>
      <div style={styles.quoteNoteRow}>
        <span style={{...styles.quoteNoteIcon, color: CASEWRIGHT_ACCENT}}>
          <Icon icon={SparklesIcon} size="xsm" color="inherit" />
        </span>
        <Text type="supporting" size="xsm" color="secondary">
          {fx.disclosureNote}
        </Text>
      </div>
      <PopoverFooter sourceLabel="No source to open" isSourceMissing />
    </PopoverShell>
  );
}

function NotFoundSpecimen() {
  return (
    <Specimen
      stateId="03 · unverifiable"
      note="Red state — the cited transcript ruling does not exist in the matter corpus; report the issue before relying.">
      <PaperBackdrop
        excerpt={NOT_FOUND_EXCERPT}
        glyphColor="#C93030"
        popover={<NotFoundPopover />}
      />
    </Specimen>
  );
}

// ============= PAGE =============

export default function SourceCitationPopoverTemplate() {
  return (
    <div style={styles.stage}>
      <header style={styles.stageHeader}>
        <VStack gap={1}>
          <Heading level={1}>Source citation popover</Heading>
          <Text type="supporting" color="secondary">
            The Casewright hover popover behind every citation chip — good-law
            verified, caution, and source-not-found states, frozen open over
            dimmed excerpts of the M-2417 research memo.
          </Text>
        </VStack>
      </header>
      <div style={styles.specimenRow}>
        <VerifiedSpecimen />
        <CautionSpecimen />
        <NotFoundSpecimen />
      </div>
    </div>
  );
}
`;export{e as default};