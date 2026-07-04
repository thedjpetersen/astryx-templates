var e=`// Copyright (c) Meta Platforms, Inc. and affiliates.

'use client';

/**
 * @file page.tsx
 * @input Deterministic fixtures only — Zinnia Pay, a P2P payments app, on
 *   the suite's anchored "today" of Fri Jul 4: seven contacts (including
 *   the long-name stress contact Alexandrina Konstantinopoulou-Vanterpool
 *   and the zero-history contact Noor El-Amin), eight activity rows with
 *   dual fields (amountCents + amountLabel) whose reduce()-derived
 *   aggregates cross-check to the cent (sent $168.40, received $1,320.15,
 *   net +$1,151.75, balance $1,362.60 from a $210.85 opening), and a
 *   1.5%/25¢-floor instant-fee formula. No clocks, no randomness, no
 *   network media.
 * @output Mobile P2P Payment Flow — a thumb-first send flow (Contacts →
 *   Amount → Confirm sheet) where ONE amountCents integer drives every
 *   surface: a 64px-key screen-scale keypad with a rolling 44px display,
 *   live three-way split math with remainder-cent assignment and
 *   radio-like share locking, a fee pill that flips at the 25¢
 *   floor/1.5% threshold, a Pay button whose label is a projection of
 *   state, and a torn-edge receipt that assembles line-by-line inside a
 *   large-detent sheet. Sending unshifts the activity feed and recomputes
 *   balance and 30-day aggregates on the contacts screen — never
 *   hardcoded.
 * @position Page template; emitted by \`astryx template mobile-p2p-payment-flow\`
 *
 * Frame: MOBILE KIT shell contract — root \`shell\` {position:'relative',
 *   flex column, width:'100%', minHeight:'100dvh', background body,
 *   overflowX:'clip'}; the 390px demo stage IS the phone viewport (no
 *   simulated OS chrome, no notch, no home indicator; the app navBar is
 *   the first pixel at y=0). All overlays (sheetScrim, sheet, toast) are
 *   position:'absolute' inside shell — position:fixed is banned. While
 *   the confirm sheet is open the shell scroll-locks to
 *   {height:'100dvh', overflow:'hidden'}; the sheet body is the one
 *   legal inner overflowY:'auto' scroller.
 * Container policy: inset-grouped listCards (card bg, 12px radius, 1px
 *   border) inset by the 16px safe gutter; whole-row <button>s; sticky
 *   navBar (52px content row) and sticky payFooter share the
 *   blur+hairline surface. No tab bar (push-stack archetype); one
 *   \`screen\` string swaps 'contacts' ⇄ 'amount' in place — no router.
 * Density grid (mobile, verbatim): 16px screen inset · 12px card gaps ·
 *   24px section gaps · 8px chip gaps · 44px utility rows · 60px
 *   two-line rows · 72px media rows (40px avatar) · 52px navBar row ·
 *   64px keypad keys (3×4, 8px gaps) · 48px primary button · 36px
 *   secondary buttons · 44×44 icon buttons. Type: 44/700 amount display,
 *   28/700 balance, 22/700 receipt total, 17/600 nav+sheet titles,
 *   16/400-500 row primary, 13/400 secondary, 11/500 overlines; nothing
 *   under 11px; tabular-nums on every money figure.
 * Color policy: token-pure chrome. ONE quarantined brand literal
 *   BRAND_ACCENT light-dark(#C2255C, #F27DA6) plus its on-fill pair
 *   BRAND_ON_ACCENT (contrast math at the const). Success amounts use
 *   var(--color-success). Focus rings use var(--color-accent) (repo
 *   idiom; no --color-brand token exists in the DS).
 * Responsive contract: authored fluid for the 390px mobile stage, clean
 *   320–430px (no width:390 literals; keypad keys are 1fr; money maxes
 *   at $9,999.99 under the cap). Desktop demo stage (~1045px): a
 *   useElementWidth ResizeObserver on the outer wrapper measures
 *   container width; > 560px the wrapper centers the shell as a framed
 *   430px phone column (16px radius, hairline, shadow) on the muted
 *   canvas — the phone experience is never stretched to 1045px. Because
 *   overlays are absolute inside shell they stay inside the framed
 *   column automatically.
 */

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type RefObject,
} from 'react';

import {
  ArrowDownLeftIcon,
  ArrowUpRightIcon,
  ChevronLeftIcon,
  DeleteIcon,
  LockIcon,
  PencilLineIcon,
  RefreshCwIcon,
  SearchIcon,
  UnlockIcon,
  XIcon,
} from 'lucide-react';

import {Icon} from '@astryxdesign/core/Icon';
import {useMediaQuery} from '@astryxdesign/core/hooks';

// ---------------------------------------------------------------------------
// COLOR LITERALS — the ONE quarantined brand literal and its on-fill pair.
// Everything else on the page is a DS token.
// ---------------------------------------------------------------------------

// Zinnia magenta. As TEXT on body/card surfaces: #C2255C on #FFFFFF ≈ 5.7:1,
// #F27DA6 on #1F1F22 ≈ 6.8:1 — both pass 4.5:1.
const BRAND_ACCENT = 'light-dark(#C2255C, #F27DA6)';
// Text on the brand FILL: #FFFFFF on #C2255C ≈ 6.9:1; #331019 on #F27DA6
// ≈ 8.2:1 — both pass 4.5:1.
const BRAND_ON_ACCENT = 'light-dark(#FFFFFF, #331019)';
// 14% brand wash for avatars and the fee pill — decorative fills only,
// never text.
const BRAND_WASH = \`color-mix(in srgb, \${BRAND_ACCENT} 14%, var(--color-background-muted))\`;

// ---------------------------------------------------------------------------
// IDENTITY CONSTS — the money laws every projection derives from.
// ---------------------------------------------------------------------------

const OPENING_BALANCE_CENTS = 21085; // $210.85 before the 8 fixture rows
const AMOUNT_CAP_CENTS = 999999; // $9,999.99 — digit presses past this no-op
const INSTANT_FEE_RATE = 0.015; // 1.5% of what YOU pay
const INSTANT_FEE_MIN_CENTS = 25; // 25¢ floor — chip $12.00 exercises it

// ---------------------------------------------------------------------------
// INJECTED CSS — the typed style-object idiom covers everything except
// :focus-visible rings and the reduced-motion guard. All transitions in
// this file animate transform/opacity only.
// ---------------------------------------------------------------------------

const FLOW_CSS = \`
.zp-focusable:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 2px;
}
.zp-key {
  transition: transform 90ms ease-out;
}
@media (prefers-reduced-motion: reduce) {
  .zp-key { transition: none; }
}
\`;

// ---------------------------------------------------------------------------
// FIXTURES — one fictional world. All money is integer cents with dual
// fields; every aggregate on screen is a reduce() over these rows.
// ---------------------------------------------------------------------------

type Speed = 'instant' | 'standard';
type Screen = 'contacts' | 'amount';

interface Contact {
  id: string;
  name: string;
  handle: string;
  initials: string;
}

// The signed-in user is a roster entry (cohort member 0 in split math).
const YOU: Contact = {id: 'you', name: 'You', handle: '@jordanr', initials: 'JR'};

// Fixture order is LAW for split cohorts: cohort = You + the first two
// CONTACTS excluding the recipient, in this order.
const CONTACTS: Contact[] = [
  {id: 'priya', name: 'Priya Natarajan', handle: '@priya-nat', initials: 'PN'},
  {id: 'marcus', name: 'Marcus Webb', handle: '@marcus-webb', initials: 'MW'},
  {id: 'elena', name: 'Elena Sokolova', handle: '@elenas', initials: 'ES'},
  {id: 'dario', name: 'Dario Fuentes', handle: '@dariof', initials: 'DF'},
  {id: 'tomas', name: 'Tomas Aldana', handle: '@tomasald', initials: 'TA'},
  {
    // Long-identity stress: exercises 72px-row ellipsis, the recents-chip
    // 11px truncation, the receipt "To" 2-line wrap, and toast truncation.
    id: 'alexkv',
    name: 'Alexandrina Konstantinopoulou-Vanterpool',
    handle: '@alexkv',
    initials: 'AK',
  },
  // Zero-state stress: the only contact with no matching activity row —
  // trailing meta renders 'New · No activity'.
  {id: 'noor', name: 'Noor El-Amin', handle: '@noor', initials: 'NE'},
];

const CONTACT_BY_ID: Record<string, Contact> = Object.fromEntries(
  [YOU, ...CONTACTS].map(c => [c.id, c]),
);

interface ActivityItem {
  id: string;
  direction: 'sent' | 'received';
  contactId: string;
  note: string;
  amountCents: number;
  amountLabel: string; // dual field — always fmt(amountCents)
  date: string;
  speed: Speed;
  feeCents: number;
}

// Newest first. All fixture sends were speed:'standard' (feeCents 0), so
// balance = OPENING + received − sent − Σ fees = 21085 + 132015 − 16840 − 0.
// CROSS-CHECK (embedded arithmetic, verified by the reduce()s below):
//   sentCents     = 2450 + 8500 + 640 + 2000 + 3250        = 16840  → $168.40
//   receivedCents = 6125 + 1890 + 124000                   = 132015 → $1,320.15
//   netCents      = 132015 − 16840                         = 115175 → +$1,151.75
//   balanceCents  = 21085 + 115175                         = 136260 → $1,362.60
const ACTIVITY: ActivityItem[] = [
  {id: 'a1', direction: 'sent', contactId: 'priya', note: 'Ramen night', amountCents: 2450, amountLabel: '$24.50', date: 'Jul 2', speed: 'standard', feeCents: 0},
  {id: 'a2', direction: 'received', contactId: 'marcus', note: 'Utilities split', amountCents: 6125, amountLabel: '$61.25', date: 'Jul 1', speed: 'standard', feeCents: 0},
  {id: 'a3', direction: 'sent', contactId: 'elena', note: 'Concert tix', amountCents: 8500, amountLabel: '$85.00', date: 'Jun 29', speed: 'standard', feeCents: 0},
  {id: 'a4', direction: 'sent', contactId: 'dario', note: 'Coffee', amountCents: 640, amountLabel: '$6.40', date: 'Jun 27', speed: 'standard', feeCents: 0},
  {id: 'a5', direction: 'received', contactId: 'priya', note: 'Groceries', amountCents: 1890, amountLabel: '$18.90', date: 'Jun 24', speed: 'standard', feeCents: 0},
  {id: 'a6', direction: 'sent', contactId: 'tomas', note: 'Fantasy league', amountCents: 2000, amountLabel: '$20.00', date: 'Jun 21', speed: 'standard', feeCents: 0},
  {id: 'a7', direction: 'sent', contactId: 'marcus', note: 'Movie tickets', amountCents: 3250, amountLabel: '$32.50', date: 'Jun 18', speed: 'standard', feeCents: 0},
  {
    // Large-amount + long-note stress: 4-digit tabular alignment in the
    // trailing column and 60px-row secondary-line ellipsis; the replay
    // prefill 'Again: …' is sliced to the note input's maxLength 40.
    id: 'a8',
    direction: 'received',
    contactId: 'alexkv',
    note: 'Sublet deposit — June + utilities true-up',
    amountCents: 124000,
    amountLabel: '$1,240.00',
    date: 'Jun 15',
    speed: 'standard',
    feeCents: 0,
  },
];

// Quick chips: $12.00 exercises the 25¢ fee floor (1.5% = 18¢ < 25¢);
// $28.50 the zero-remainder split (950×3); $50.00 the remainder triad
// (1667 + 1667 + 1666 = 5000 ✓) and the 5000 × 0.015 = 75¢ rate branch.
const QUICK_CHIP_CENTS = [1200, 2850, 5000];

// ---------------------------------------------------------------------------
// PURE HELPERS — every displayed number is a projection of amountCents,
// speed, split state, and the activity rows. Nothing stores a second copy.
// ---------------------------------------------------------------------------

const fmt = (cents: number): string =>
  '$' +
  (cents / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

// '−$24.50' (U+2212) / '+$61.25' for activity trailing values.
const signedFmt = (cents: number, direction: 'sent' | 'received'): string =>
  direction === 'sent' ? \`−\${fmt(cents)}\` : \`+\${fmt(cents)}\`;

/**
 * Three-way split with remainder-cent assignment and radio-like locking.
 * No lock: base = floor(a/3), r = a%3, member i (display order) gets
 * base + (i < r ? 1 : 0) — so 5000 → [1667, 1667, 1666] and 2850 →
 * [950, 950, 950]. With lock L: rem = a − lockedCents; the two unlocked
 * members get floor(rem/2) each, remainder cent to the EARLIER unlocked
 * member — lock Marcus at 1667 with amount 50005 → rem 48338 → You 24169 +
 * Elena 24169 ✓.
 */
function computeShares(
  amountCents: number,
  memberIds: string[],
  lockedId: string | null,
  lockedCents: number,
): number[] {
  const lockedIndex = lockedId == null ? -1 : memberIds.indexOf(lockedId);
  if (lockedIndex === -1) {
    const base = Math.floor(amountCents / memberIds.length);
    const r = amountCents % memberIds.length;
    return memberIds.map((_, i) => base + (i < r ? 1 : 0));
  }
  const rem = Math.max(0, amountCents - lockedCents);
  const unlockedCount = memberIds.length - 1;
  const base = Math.floor(rem / unlockedCount);
  const r = rem % unlockedCount;
  let unlockedSeen = 0;
  return memberIds.map((_, i) => {
    if (i === lockedIndex) return lockedCents;
    const share = base + (unlockedSeen < r ? 1 : 0);
    unlockedSeen += 1;
    return share;
  });
}

// fee = standard → 0; amount 0 → 0; else max(25, round(amount × 0.015)).
// Verified projections: 5000 → 75 '$0.75'; 2850 → round(42.75) = 43
// '$0.43'; 1200 → max(25, 18) = 25 '$0.25'; split share 1667 →
// max(25, round(25.005)) = 25 '$0.25'.
function computeFee(payerCents: number, speed: Speed): number {
  if (speed === 'standard' || payerCents === 0) return 0;
  return Math.max(INSTANT_FEE_MIN_CENTS, Math.round(payerCents * INSTANT_FEE_RATE));
}

interface FlowState {
  screen: Screen;
  recipientId: string;
  amountCents: number;
  note: string;
  speed: Speed;
  splitOn: boolean;
  lockedId: string | null;
  lockedCents: number;
  sheetOpen: boolean;
  sheetDetent: 'medium' | 'large';
  search: string;
  refreshed: boolean;
  toast: string | null;
  justSentId: string | null;
  activity: ActivityItem[];
}

const INITIAL_STATE: FlowState = {
  screen: 'contacts',
  recipientId: 'priya',
  amountCents: 0,
  note: 'Dinner at Kazu',
  speed: 'instant',
  splitOn: false,
  lockedId: null,
  lockedCents: 0,
  sheetOpen: false,
  sheetDetent: 'large',
  search: '',
  refreshed: false,
  toast: null,
  justSentId: null,
  activity: ACTIVITY,
};

interface DerivedFlow {
  cohortIds: string[]; // ['you', c1, c2] — fixture order, recipient excluded
  shares: number[]; // three-way shares in cohort display order
  payerCents: number; // your share when split, else the full amount
  feeCents: number;
  totalCents: number; // payerCents + feeCents — the 'You pay' line
  payLabel: string; // the Pay button label — a projection, never stored
  sentCents: number;
  receivedCents: number;
  netCents: number;
  balanceCents: number;
}

/** Every surface reads from here — display, shares, fee, button label,
 * receipt, aggregates. TOTALS check: non-split 5000 + 75 = 5075 → button
 * 'Pay $50.00', receipt 'You pay $50.75'; split 1667 + 25 = 1692 →
 * 'You pay $16.92'. POST-SEND ($50.00 instant to Priya): sent 16840 +
 * 5000 = 21840 '$218.40'; net +110175; balance 136260 − 5075 = 131185
 * '$1,311.85'. */
function deriveAll(state: FlowState): DerivedFlow {
  const cohortIds = [
    YOU.id,
    ...CONTACTS.filter(c => c.id !== state.recipientId)
      .slice(0, 2)
      .map(c => c.id),
  ];
  const shares = computeShares(
    state.amountCents,
    cohortIds,
    state.lockedId,
    state.lockedCents,
  );
  const payerCents = state.splitOn ? shares[0] : state.amountCents;
  const feeCents = computeFee(payerCents, state.speed);
  const totalCents = payerCents + feeCents;
  const payLabel =
    state.amountCents === 0 ? 'Enter amount' : \`Pay \${fmt(payerCents)}\`;
  const sent = state.activity.filter(a => a.direction === 'sent');
  const received = state.activity.filter(a => a.direction === 'received');
  const sentCents = sent.reduce((sum, a) => sum + a.amountCents, 0);
  const receivedCents = received.reduce((sum, a) => sum + a.amountCents, 0);
  const sentFeeCents = sent.reduce((sum, a) => sum + a.feeCents, 0);
  const netCents = receivedCents - sentCents;
  const balanceCents =
    OPENING_BALANCE_CENTS + receivedCents - sentCents - sentFeeCents;
  return {
    cohortIds,
    shares,
    payerCents,
    feeCents,
    totalCents,
    payLabel,
    sentCents,
    receivedCents,
    netCents,
    balanceCents,
  };
}

/** Per-contact trailing meta mirrors that contact's NEWEST activity row
 * exactly (Priya: 'Sent $24.50 · Jul 2'; Noor: 'New · No activity') and
 * therefore visibly changes after a send. */
function latestMetaFor(contactId: string, activity: ActivityItem[]): string {
  const row = activity.find(a => a.contactId === contactId);
  if (row == null) return 'New · No activity';
  const verb = row.direction === 'sent' ? 'Sent' : 'Received';
  return \`\${verb} \${row.amountLabel} · \${row.date}\`;
}

/** Recents rail membership = contacts in newest-activity order. */
function recentContactIds(activity: ActivityItem[]): string[] {
  const seen: string[] = [];
  for (const row of activity) {
    if (!seen.includes(row.contactId)) seen.push(row.contactId);
  }
  return seen;
}

// Receipt tear: zigzag teeth ≈ 12px wide × 8px tall at the authored
// ~358×260px receipt geometry, expressed in objectBoundingBox units
// (30 teeth across, depth 0.03 of receipt height).
const RECEIPT_TEETH = 30;
const RECEIPT_TOOTH_DEPTH = 0.03;
function buildReceiptTearPath(): string {
  const shoulder = (1 - RECEIPT_TOOTH_DEPTH).toFixed(4);
  const parts = ['M0,0', 'L1,0', \`L1,\${shoulder}\`];
  for (let i = RECEIPT_TEETH; i > 0; i--) {
    const tipX = ((i - 0.5) / RECEIPT_TEETH).toFixed(4);
    const valleyX = ((i - 1) / RECEIPT_TEETH).toFixed(4);
    parts.push(\`L\${tipX},1\`, \`L\${valleyX},\${shoulder}\`);
  }
  parts.push('Z');
  return parts.join(' ');
}
const RECEIPT_TEAR_PATH = buildReceiptTearPath();

// ---------------------------------------------------------------------------
// useElementWidth — container-width breakpoints (the demo stage is ~1045px
// inside a 1440px window, so viewport queries never fire there).
// ---------------------------------------------------------------------------

function useElementWidth(ref: RefObject<HTMLDivElement | null>): number {
  const [width, setWidth] = useState(0);
  useEffect(() => {
    const element = ref.current;
    if (element == null) {
      return undefined;
    }
    const observer = new ResizeObserver(entries => {
      const rect = entries[0]?.contentRect;
      if (rect != null) {
        setWidth(rect.width);
      }
    });
    observer.observe(element);
    return () => observer.disconnect();
  }, [ref]);
  return width;
}

// ---------------------------------------------------------------------------
// STYLES — binding mobile-kit names: shell, navBar, sheetScrim, sheet,
// sheetGrabber, listCard, row, rowDivider, sectionHeader, payFooter,
// keypad, keypadKey, amountDisplay, receiptCard.
// ---------------------------------------------------------------------------

const NAV_SURFACE: CSSProperties = {
  background: 'color-mix(in srgb, var(--color-background-body) 86%, transparent)',
  backdropFilter: 'blur(12px)',
};

const styles: Record<string, CSSProperties> = {
  // Desktop (>560px container): centered framed phone column on the muted
  // canvas. Below: pass-through (the stage clips corners itself).
  desktopWrap: {
    display: 'flex',
    justifyContent: 'center',
    padding: '24px 16px',
    background: 'var(--color-background-muted)',
    minHeight: '100dvh',
  },
  // THE SHELL CONTRACT — full-bleed, stage clips corners; position:relative
  // is load-bearing (all overlays anchor here).
  shell: {
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    minHeight: '100dvh',
    background: 'var(--color-background-body)',
    overflowX: 'clip',
    fontFamily: 'var(--font-family-body)',
    color: 'var(--color-text-primary)',
  },
  shellFramed: {
    maxWidth: 430,
    minHeight: 'calc(100dvh - 48px)',
    borderRadius: 16,
    border: '1px solid var(--color-border)',
    boxShadow: '0 4px 16px var(--color-shadow)',
    overflow: 'clip',
  },
  // NAV BAR — 52px content row, 8px inline padding so 44px icon buttons
  // optically align text to the 16px gutter; always-on hairline variant
  // (no large-title collapse on this template).
  navBar: {
    ...NAV_SURFACE,
    position: 'sticky',
    top: 0,
    zIndex: 20,
    display: 'grid',
    gridTemplateColumns: '1fr auto 1fr',
    alignItems: 'center',
    height: 52,
    paddingInline: 8,
    borderBottom: '1px solid var(--color-border)',
  },
  navTitle: {
    justifySelf: 'center',
    maxWidth: 200,
    fontSize: 17,
    fontWeight: 600,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    margin: 0,
  },
  navLead: {display: 'flex', alignItems: 'center', justifySelf: 'start'},
  navTrail: {display: 'flex', alignItems: 'center', gap: 0, justifySelf: 'end'},
  iconButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    padding: 0,
    background: 'transparent',
    border: 'none',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  backButton: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 2,
    minWidth: 44,
    height: 44,
    padding: '0 8px 0 4px',
    background: 'transparent',
    border: 'none',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  backLabel: {fontSize: 13, fontWeight: 500},
  brandMarkBox: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    color: BRAND_ACCENT,
  },
  srOnly: {
    position: 'absolute',
    width: 1,
    height: 1,
    padding: 0,
    margin: -1,
    overflow: 'hidden',
    clip: 'rect(0 0 0 0)',
    whiteSpace: 'nowrap',
    border: 0,
  },
  // SECTION HEADER — 13/600 uppercase, 32px from the stage edge.
  sectionHeader: {
    margin: '20px 32px 8px',
    fontSize: 13,
    fontWeight: 600,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: 'var(--color-text-secondary)',
  },
  // Inset-grouped list language.
  listCard: {
    marginInline: 16,
    background: 'var(--color-background-card)',
    borderRadius: 'var(--radius-element, 12px)',
    border: '1px solid var(--color-border)',
    overflow: 'hidden',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    width: '100%',
    paddingInline: 16,
    background: 'none',
    border: 'none',
    textAlign: 'left',
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',
  },
  rowDivider: {height: 1, background: 'var(--color-border)', marginLeft: 16},
  // 68px inset when rows lead with a 40px avatar; 52px when they lead
  // with a 24px glyph (divider starts at the text's left edge).
  rowDividerAvatar: {height: 1, background: 'var(--color-border)', marginLeft: 68},
  rowDividerGlyph: {height: 1, background: 'var(--color-border)', marginLeft: 52},
  rowPrimary: {
    fontSize: 16,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  rowSecondary: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    marginTop: 2,
  },
  rowStack: {flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column'},
  rowMeta: {
    flexShrink: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  rowValue: {
    flexShrink: 0,
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
  },
  // Balance card.
  balanceCard: {padding: 16, display: 'flex', flexDirection: 'column', gap: 4},
  balanceOverline: {
    fontSize: 11,
    fontWeight: 500,
    letterSpacing: '0.08em',
    textTransform: 'uppercase',
    color: 'var(--color-text-secondary)',
  },
  balanceFigure: {
    fontSize: 28,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1.2,
  },
  balanceCaption: {
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    fontVariantNumeric: 'tabular-nums',
  },
  // Search — 44px utility input.
  searchWrap: {
    position: 'relative',
    marginInline: 16,
    marginTop: 12,
  },
  searchIcon: {
    position: 'absolute',
    top: '50%',
    left: 12,
    transform: 'translateY(-50%)',
    display: 'inline-flex',
    color: 'var(--color-text-secondary)',
    pointerEvents: 'none',
  },
  searchInput: {
    width: '100%',
    height: 44,
    padding: '0 12px 0 38px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    color: 'inherit',
    font: 'inherit',
    fontSize: 16,
  },
  // Recents rail — snap carousel with ≥24px next-chip peek.
  recentsRail: {
    display: 'flex',
    gap: 8,
    overflowX: 'auto',
    scrollSnapType: 'x mandatory',
    scrollPaddingInline: 16,
    paddingInline: 16,
    paddingBottom: 4,
  },
  recentChip: {
    scrollSnapAlign: 'start',
    flexShrink: 0,
    width: 72,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: 6,
    padding: '8px 2px',
    background: 'none',
    border: 'none',
    borderRadius: 12,
    color: 'inherit',
    font: 'inherit',
    cursor: 'pointer',
  },
  recentChipName: {
    maxWidth: 68,
    fontSize: 11,
    fontWeight: 500,
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  // Amount screen -------------------------------------------------------
  amountDisplay: {
    minHeight: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: 44,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
    lineHeight: 1,
  },
  feePillRow: {display: 'flex', justifyContent: 'center', marginTop: 8},
  feePill: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    background: BRAND_WASH,
    color: BRAND_ACCENT,
  },
  feePillMuted: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '4px 12px',
    borderRadius: 999,
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-secondary)',
  },
  // Segmented speed control — 36px track, 12px radius, inner 8px pill.
  segTrack: {
    display: 'flex',
    height: 36,
    marginInline: 16,
    marginTop: 12,
    padding: 2,
    background: 'var(--color-background-muted)',
    borderRadius: 12,
  },
  segItem: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    border: 'none',
    borderRadius: 8,
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 500,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  segItemActive: {
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    color: 'var(--color-text-primary)',
    fontWeight: 600,
  },
  // Split ledger.
  splitHeaderRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '10px 16px',
  },
  splitAvatars: {display: 'flex', alignItems: 'center'},
  splitCaption: {
    flex: 1,
    minWidth: 0,
    fontSize: 13,
    color: 'var(--color-text-secondary)',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
  splitToggle: {
    flexShrink: 0,
    height: 36,
    padding: '0 12px',
    background: 'var(--color-background-muted)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  lockButton: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 44,
    height: 44,
    flexShrink: 0,
    padding: 0,
    background: 'transparent',
    border: 'none',
    borderRadius: 12,
    color: 'var(--color-text-secondary)',
    cursor: 'pointer',
  },
  // Note + quick chips.
  noteInput: {
    width: '100%',
    height: 44,
    padding: '0 12px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 'var(--radius-element, 12px)',
    color: 'inherit',
    font: 'inherit',
    fontSize: 16,
  },
  chipsRow: {display: 'flex', gap: 8, marginInline: 16, marginTop: 12},
  quickChip: {
    flex: 1,
    height: 36,
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
    fontSize: 13,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  // KEYPAD — 3×4, 64px keys, 8px gaps.
  keypad: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 8,
    marginInline: 16,
    marginTop: 24,
  },
  keypadKey: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    color: 'var(--color-text-primary)',
    fontSize: 28,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  // Sticky footer — thumb-zone primary verb.
  payFooter: {
    ...NAV_SURFACE,
    position: 'sticky',
    bottom: 0,
    zIndex: 20,
    marginTop: 24,
    padding: 16,
    borderTop: '1px solid var(--color-border)',
  },
  payButton: {
    width: '100%',
    height: 48,
    border: 'none',
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    fontSize: 17,
    fontWeight: 600,
    fontVariantNumeric: 'tabular-nums',
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  payButtonDisabled: {
    background: 'var(--color-background-muted)',
    color: 'var(--color-text-disabled)',
    cursor: 'default',
  },
  // Confirm sheet.
  sheetScrim: {
    position: 'absolute',
    inset: 0,
    background: 'light-dark(rgba(21,17,12,0.32), rgba(0,0,0,0.55))',
    zIndex: 40,
    border: 'none',
    padding: 0,
  },
  sheet: {
    position: 'absolute',
    insetInline: 0,
    bottom: 0,
    zIndex: 41,
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-background-card)',
    borderRadius: '16px 16px 0 0',
    boxShadow: '0 -8px 32px var(--color-shadow)',
  },
  // 44px-tall grabber BUTTON (a11y hit area) with the 36×5 pill 8px from
  // the sheet top — the visible, keyboard-reachable detent toggle.
  sheetGrabberZone: {
    width: '100%',
    height: 44,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingTop: 8,
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
  },
  sheetGrabber: {
    width: 36,
    height: 5,
    borderRadius: 999,
    background: 'var(--color-border)',
  },
  sheetHeader: {
    display: 'grid',
    gridTemplateColumns: '44px 1fr 44px',
    alignItems: 'center',
    height: 52,
    paddingInline: 8,
  },
  sheetTitle: {
    gridColumn: 2,
    justifySelf: 'center',
    fontSize: 17,
    fontWeight: 600,
    margin: 0,
  },
  sheetContent: {
    flex: 1,
    minHeight: 0,
    overflowY: 'auto',
    padding: '0 16px 16px',
  },
  // Receipt on a muted well so the torn card-bg paper reads in both
  // schemes (the sheet itself is card bg).
  receiptWell: {
    background: 'var(--color-background-muted)',
    borderRadius: 12,
    padding: '16px 16px 20px',
  },
  receiptCard: {
    background: 'var(--color-background-card)',
    borderRadius: '12px 12px 0 0',
    clipPath: 'url(#zinniaReceiptTear)',
    paddingBottom: 12,
  },
  receiptLine: {
    minHeight: 44,
    display: 'flex',
    alignItems: 'center',
    gap: 12,
    padding: '0 16px',
  },
  receiptLabel: {
    fontSize: 13,
    fontWeight: 400,
    color: 'var(--color-text-secondary)',
    flexShrink: 0,
  },
  receiptValue: {
    flex: 1,
    minWidth: 0,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
  },
  receiptToValue: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
  },
  receiptToName: {
    fontSize: 16,
    fontWeight: 500,
    textAlign: 'right',
    display: '-webkit-box',
    WebkitBoxOrient: 'vertical',
    WebkitLineClamp: 2,
    overflow: 'hidden',
  },
  receiptDivider: {
    borderTop: '1px dashed var(--color-border-emphasized)',
    margin: '4px 16px',
  },
  receiptTotalValue: {
    flex: 1,
    textAlign: 'right',
    fontSize: 22,
    fontWeight: 700,
    fontVariantNumeric: 'tabular-nums',
  },
  sendButton: {
    width: '100%',
    height: 48,
    marginTop: 16,
    border: 'none',
    borderRadius: 12,
    background: BRAND_ACCENT,
    color: BRAND_ON_ACCENT,
    fontSize: 17,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  cancelButton: {
    width: '100%',
    height: 36,
    marginTop: 8,
    border: 'none',
    borderRadius: 12,
    background: 'transparent',
    color: 'var(--color-text-secondary)',
    fontSize: 13,
    fontWeight: 600,
    fontFamily: 'inherit',
    cursor: 'pointer',
  },
  // The ONE polite live region — absolute, bottom-center (no tab bar).
  toastWrap: {
    position: 'absolute',
    insetInline: 16,
    bottom: 16,
    zIndex: 60,
    display: 'flex',
    justifyContent: 'center',
    pointerEvents: 'none',
  },
  toastPill: {
    maxWidth: '100%',
    padding: '10px 16px',
    background: 'var(--color-background-card)',
    border: '1px solid var(--color-border)',
    borderRadius: 12,
    boxShadow: '0 4px 16px var(--color-shadow)',
    fontSize: 13,
    fontWeight: 500,
    fontVariantNumeric: 'tabular-nums',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
  },
};

// ---------------------------------------------------------------------------
// ZinniaMark — inline SVG 28×28, single currentColor fill: eight
// rounded-diamond petals at 45° increments around a 5px-radius center;
// the 0° and 180° petals are chevron-tipped arrowheads pointing
// outward-up (send) and inward-down (receive).
// ---------------------------------------------------------------------------

const PETAL_ANGLES = [45, 90, 135, 225, 270, 315];

function ZinniaMark() {
  return (
    <svg
      width={28}
      height={28}
      viewBox="0 0 32 32"
      fill="currentColor"
      aria-hidden
      focusable="false">
      {PETAL_ANGLES.map(deg => (
        <rect
          key={deg}
          x={13.5}
          y={2.5}
          width={5}
          height={9}
          rx={2.5}
          transform={\`rotate(\${deg} 16 16)\`}
        />
      ))}
      {/* Top petal → arrowhead pointing outward-up = send */}
      <path d="M16 1.5 L20.5 7 L17.8 7 L17.8 11.5 L14.2 11.5 L14.2 7 L11.5 7 Z" />
      {/* Bottom petal → arrowhead pointing inward-down = receive */}
      <path d="M16 21.5 L20.5 27 L17.8 27 L17.8 30.5 L14.2 30.5 L14.2 27 L11.5 27 Z" />
      <circle cx={16} cy={16} r={5} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// ContactAvatar — initials disc derived from the ONE brand literal
// (14% brand wash + brand text); no per-contact hex anywhere.
// ---------------------------------------------------------------------------

function ContactAvatar({
  contact,
  size,
  overlap = false,
}: {
  contact: Contact;
  size: number;
  overlap?: boolean;
}) {
  return (
    <span
      aria-hidden
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: size,
        height: size,
        flexShrink: 0,
        borderRadius: '50%',
        background: BRAND_WASH,
        color: BRAND_ACCENT,
        fontSize: size >= 40 ? 13 : 11,
        fontWeight: 600,
        marginLeft: overlap ? -12 : undefined,
        border: overlap ? '2px solid var(--color-background-body)' : undefined,
      }}>
      {contact.initials}
    </span>
  );
}

// ---------------------------------------------------------------------------
// RollingDisplay — fmt(amountCents) as per-character spans keyed by
// (position, char): unchanged characters keep their node; changed ones
// remount and roll in (translateY 12px→0 + fade, 160ms ease-out; opacity
// only under reduced motion). $0.00 renders in the secondary color.
// ---------------------------------------------------------------------------

function RollingChar({ch, isMotionReduced}: {ch: string; isMotionReduced: boolean}) {
  const [isIn, setIsIn] = useState(false);
  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsIn(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  const motion: CSSProperties = isMotionReduced
    ? {opacity: isIn ? 1 : 0, transition: 'opacity 160ms ease-out'}
    : {
        opacity: isIn ? 1 : 0,
        transform: isIn ? 'translateY(0)' : 'translateY(12px)',
        transition: 'opacity 160ms ease-out, transform 160ms ease-out',
      };
  return <span style={{display: 'inline-block', ...motion}}>{ch}</span>;
}

function RollingDisplay({
  amountCents,
  isMotionReduced,
}: {
  amountCents: number;
  isMotionReduced: boolean;
}) {
  const text = fmt(amountCents);
  return (
    <div
      role="img"
      aria-label={\`Amount \${text}\`}
      style={{
        ...styles.amountDisplay,
        color: amountCents === 0 ? 'var(--color-text-secondary)' : undefined,
      }}>
      <span aria-hidden style={{display: 'inline-flex'}}>
        {text.split('').map((ch, i) => (
          <RollingChar key={\`\${i}:\${ch}\`} ch={ch} isMotionReduced={isMotionReduced} />
        ))}
      </span>
    </div>
  );
}

// ---------------------------------------------------------------------------
// AmountKeypad — 3×4 grid of real 64px-tall <button>s (≥44px targets by
// construction; ≥110px wide at 390). Cents-shift integer ops on the
// single owner: digit → a*10+d, 'C' → 0, backspace → floor(a/10). Press
// feedback scale(0.97) 90ms, removed under reduced motion.
// ---------------------------------------------------------------------------

type KeypadKey =
  | {kind: 'digit'; digit: number}
  | {kind: 'clear'}
  | {kind: 'backspace'};

const KEYPAD_KEYS: KeypadKey[] = [
  {kind: 'digit', digit: 1},
  {kind: 'digit', digit: 2},
  {kind: 'digit', digit: 3},
  {kind: 'digit', digit: 4},
  {kind: 'digit', digit: 5},
  {kind: 'digit', digit: 6},
  {kind: 'digit', digit: 7},
  {kind: 'digit', digit: 8},
  {kind: 'digit', digit: 9},
  {kind: 'clear'},
  {kind: 'digit', digit: 0},
  {kind: 'backspace'},
];

function keypadKeyId(key: KeypadKey): string {
  return key.kind === 'digit' ? \`d\${key.digit}\` : key.kind;
}

function AmountKeypad({
  onDigit,
  onClear,
  onBackspace,
  isMotionReduced,
}: {
  onDigit: (digit: number) => void;
  onClear: () => void;
  onBackspace: () => void;
  isMotionReduced: boolean;
}) {
  const [pressedId, setPressedId] = useState<string | null>(null);
  return (
    <div style={styles.keypad} aria-label="Amount keypad">
      {KEYPAD_KEYS.map(key => {
        const id = keypadKeyId(key);
        const isPressed = pressedId === id && !isMotionReduced;
        const label =
          key.kind === 'digit'
            ? String(key.digit)
            : key.kind === 'clear'
              ? 'Clear amount'
              : 'Backspace';
        return (
          <button
            key={id}
            type="button"
            className="zp-focusable zp-key"
            aria-label={key.kind === 'digit' ? undefined : label}
            style={{
              ...styles.keypadKey,
              transform: isPressed ? 'scale(0.97)' : undefined,
            }}
            onPointerDown={() => setPressedId(id)}
            onPointerUp={() => setPressedId(null)}
            onPointerLeave={() => setPressedId(null)}
            onClick={() =>
              key.kind === 'digit'
                ? onDigit(key.digit)
                : key.kind === 'clear'
                  ? onClear()
                  : onBackspace()
            }>
            {key.kind === 'digit' ? (
              key.digit
            ) : key.kind === 'clear' ? (
              'C'
            ) : (
              <Icon icon={DeleteIcon} size="md" color="inherit" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SplitLedgerStack — collapsed: three overlapping avatars + caption +
// the 36px 'Split 3 ways' toggle. Expanded: three 60px rows with live
// shares from computeShares and 44×44 radio-like lock toggles (at most
// one lockedId; locking captures that member's current share).
// ---------------------------------------------------------------------------

function SplitLedgerStack({
  splitOn,
  cohort,
  shares,
  lockedId,
  onToggleSplit,
  onToggleLock,
}: {
  splitOn: boolean;
  cohort: Contact[];
  shares: number[];
  lockedId: string | null;
  onToggleSplit: () => void;
  onToggleLock: (memberId: string, currentShareCents: number) => void;
}) {
  const caption = cohort.map(m => (m.id === 'you' ? 'You' : m.name.split(' ')[0])).join(', ');
  return (
    <div style={styles.listCard}>
      <div style={styles.splitHeaderRow}>
        <span style={styles.splitAvatars} aria-hidden>
          {cohort.map((member, i) => (
            <ContactAvatar key={member.id} contact={member} size={40} overlap={i > 0} />
          ))}
        </span>
        <span style={styles.splitCaption}>{caption}</span>
        <button
          type="button"
          className="zp-focusable"
          style={styles.splitToggle}
          aria-pressed={splitOn}
          onClick={onToggleSplit}>
          {splitOn ? 'Undo split' : 'Split 3 ways'}
        </button>
      </div>
      {splitOn
        ? cohort.map((member, i) => {
            const isLocked = lockedId === member.id;
            return (
              <div key={member.id}>
                <div style={styles.rowDividerAvatar} />
                <div style={{...styles.row, minHeight: 60, cursor: 'default'}}>
                  <ContactAvatar contact={member} size={40} />
                  <span style={{...styles.rowStack, ...styles.rowPrimary}}>
                    {member.id === 'you' ? 'You' : member.name}
                  </span>
                  <span style={styles.rowValue}>{fmt(shares[i])}</span>
                  <button
                    type="button"
                    className="zp-focusable"
                    style={{
                      ...styles.lockButton,
                      color: isLocked ? BRAND_ACCENT : 'var(--color-text-secondary)',
                    }}
                    aria-pressed={isLocked}
                    aria-label={
                      isLocked
                        ? \`Unlock \${member.id === 'you' ? 'your' : \`\${member.name}'s\`} share\`
                        : \`Lock \${member.id === 'you' ? 'your' : \`\${member.name}'s\`} share at \${fmt(shares[i])}\`
                    }
                    onClick={() => onToggleLock(member.id, shares[i])}>
                    <Icon icon={isLocked ? LockIcon : UnlockIcon} size="sm" color="inherit" />
                  </button>
                </div>
              </div>
            );
          })
        : null}
    </div>
  );
}

// ---------------------------------------------------------------------------
// SendReceipt — torn-edge receipt whose every value reads from the SAME
// deriveAll() projections the keypad drove (zero re-entry). Lines
// assemble top-to-bottom with a 90ms stagger; under reduced motion the
// all-visible state renders instantly.
// ---------------------------------------------------------------------------

interface ReceiptLine {
  id: string;
  label: string;
  value: string;
  kind?: 'to' | 'divider' | 'total';
}

function SendReceipt({
  recipient,
  note,
  splitOn,
  amountCents,
  shares,
  cohort,
  speed,
  feeCents,
  totalCents,
  isMotionReduced,
}: {
  recipient: Contact;
  note: string;
  splitOn: boolean;
  amountCents: number;
  shares: number[];
  cohort: Contact[];
  speed: Speed;
  feeCents: number;
  totalCents: number;
  isMotionReduced: boolean;
}) {
  const [isIn, setIsIn] = useState(isMotionReduced);
  useEffect(() => {
    if (isMotionReduced) return undefined;
    const raf = requestAnimationFrame(() => setIsIn(true));
    return () => cancelAnimationFrame(raf);
  }, [isMotionReduced]);

  const lines: ReceiptLine[] = [
    {id: 'to', label: 'To', value: \`\${recipient.name} · \${recipient.handle}\`, kind: 'to'},
    {id: 'note', label: 'Note', value: note},
    ...(splitOn
      ? [
          {id: 'bill', label: 'Bill total', value: fmt(amountCents)},
          {id: 'share', label: 'Your share', value: fmt(shares[0])},
          {id: 'req1', label: \`Request → \${cohort[1].name}\`, value: fmt(shares[1])},
          {id: 'req2', label: \`Request → \${cohort[2].name}\`, value: fmt(shares[2])},
        ]
      : []),
    speed === 'instant'
      ? {id: 'fee', label: 'Instant fee', value: fmt(feeCents)}
      : {id: 'fee', label: 'Standard · Free', value: '$0.00'},
    {id: 'divider', label: '', value: '', kind: 'divider'},
    {id: 'total', label: 'You pay', value: fmt(totalCents), kind: 'total'},
  ];

  const lineMotion = (index: number): CSSProperties =>
    isMotionReduced
      ? {}
      : {
          opacity: isIn ? 1 : 0,
          transform: isIn ? 'none' : 'translateY(8px)',
          transition: \`opacity 160ms ease-out \${index * 90}ms, transform 160ms ease-out \${index * 90}ms\`,
        };

  return (
    <div style={styles.receiptWell}>
      <div style={styles.receiptCard}>
        {lines.map((line, i) => {
          if (line.kind === 'divider') {
            return <div key={line.id} style={{...styles.receiptDivider, ...lineMotion(i)}} />;
          }
          if (line.kind === 'to') {
            return (
              <div key={line.id} style={{...styles.receiptLine, ...lineMotion(i)}}>
                <span style={styles.receiptLabel}>{line.label}</span>
                <span style={styles.receiptToValue}>
                  <span style={styles.receiptToName}>{line.value}</span>
                  <ContactAvatar contact={recipient} size={24} />
                </span>
              </div>
            );
          }
          if (line.kind === 'total') {
            return (
              <div key={line.id} style={{...styles.receiptLine, ...lineMotion(i)}}>
                <span style={{...styles.receiptLabel, fontSize: 16, fontWeight: 600, color: 'var(--color-text-primary)'}}>
                  {line.label}
                </span>
                <span style={styles.receiptTotalValue}>{line.value}</span>
              </div>
            );
          }
          return (
            <div key={line.id} style={{...styles.receiptLine, ...lineMotion(i)}}>
              <span style={styles.receiptLabel}>{line.label}</span>
              <span style={styles.receiptValue}>{line.value}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// ConfirmSheet — LARGE detent on open ('calc(100% - 56px)'); the 44px
// grabber button toggles MEDIUM ('55%'). Focus moves to the X on open;
// EVERY close path (X, Cancel, scrim, Escape) restores focus to the Pay
// button via onClose. The sheet body is the one legal inner scroller.
// ---------------------------------------------------------------------------

function ConfirmSheet({
  state,
  derived,
  isMotionReduced,
  onToggleDetent,
  onClose,
  onSend,
}: {
  state: FlowState;
  derived: DerivedFlow;
  isMotionReduced: boolean;
  onToggleDetent: () => void;
  onClose: () => void;
  onSend: () => void;
}) {
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);
  const [isIn, setIsIn] = useState(isMotionReduced);

  useEffect(() => {
    closeRef.current?.focus();
    if (isMotionReduced) return undefined;
    const raf = requestAnimationFrame(() => setIsIn(true));
    return () => cancelAnimationFrame(raf);
  }, [isMotionReduced]);

  // Escape closes the (only) overlay; Tab wraps inside the sheet.
  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.stopPropagation();
      onClose();
      return;
    }
    if (event.key !== 'Tab' || sheetRef.current == null) return;
    const focusables = sheetRef.current.querySelectorAll<HTMLElement>(
      'button:not([disabled]), input, [tabindex]:not([tabindex="-1"])',
    );
    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  };

  const recipient = CONTACT_BY_ID[state.recipientId];
  const cohort = derived.cohortIds.map(id => CONTACT_BY_ID[id]);

  // Slide-up 240ms (transform only); plain fade under reduced motion.
  const motion: CSSProperties = isMotionReduced
    ? {}
    : {
        transform: isIn ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 240ms ease-out',
      };

  return (
    <>
      <div style={styles.sheetScrim} aria-hidden onClick={onClose} />
      <div
        ref={sheetRef}
        role="dialog"
        aria-modal="true"
        aria-label="Confirm payment"
        style={{
          ...styles.sheet,
          height: state.sheetDetent === 'large' ? 'calc(100% - 56px)' : '55%',
          ...motion,
        }}
        onKeyDown={onKeyDown}>
        <button
          type="button"
          className="zp-focusable"
          style={styles.sheetGrabberZone}
          aria-label="Resize sheet"
          onClick={onToggleDetent}>
          <span style={styles.sheetGrabber} aria-hidden />
        </button>
        <div style={styles.sheetHeader}>
          <h2 style={styles.sheetTitle}>Confirm payment</h2>
          <button
            ref={closeRef}
            type="button"
            className="zp-focusable"
            style={{...styles.iconButton, gridColumn: 3}}
            aria-label="Close"
            onClick={onClose}>
            <Icon icon={XIcon} size="sm" color="inherit" />
          </button>
        </div>
        <div style={styles.sheetContent}>
          <SendReceipt
            recipient={recipient}
            note={state.note}
            splitOn={state.splitOn}
            amountCents={state.amountCents}
            shares={derived.shares}
            cohort={cohort}
            speed={state.speed}
            feeCents={derived.feeCents}
            totalCents={derived.totalCents}
            isMotionReduced={isMotionReduced}
          />
          <button
            type="button"
            className="zp-focusable"
            style={styles.sendButton}
            onClick={onSend}>
            Send now
          </button>
          <button
            type="button"
            className="zp-focusable"
            style={styles.cancelButton}
            onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// CONTACTS SCREEN — balance card (derived aggregates), search, recents
// snap rail, inset-grouped contact rows (72px), and the activity ledger
// (60px rows) whose rows are REPLAY buttons.
// ---------------------------------------------------------------------------

function ContactsScreen({
  state,
  derived,
  onRefresh,
  onPickContact,
  onReplay,
  justSentRef,
  onSearch,
}: {
  state: FlowState;
  derived: DerivedFlow;
  onRefresh: () => void;
  onPickContact: (contactId: string) => void;
  onReplay: (item: ActivityItem) => void;
  justSentRef: RefObject<HTMLButtonElement | null>;
  onSearch: (value: string) => void;
}) {
  const query = state.search.trim().toLowerCase();
  const filteredContacts = CONTACTS.filter(
    c =>
      query === '' ||
      c.name.toLowerCase().includes(query) ||
      c.handle.toLowerCase().includes(query),
  );
  const recents = recentContactIds(state.activity).map(id => CONTACT_BY_ID[id]);
  const netLabel =
    derived.netCents < 0 ? \`−\${fmt(-derived.netCents)}\` : \`+\${fmt(derived.netCents)}\`;

  return (
    <>
      <header style={styles.navBar}>
        <div style={styles.navLead}>
          <span style={styles.brandMarkBox} aria-hidden>
            <ZinniaMark />
          </span>
        </div>
        <div style={styles.navTitle}>Zinnia Pay</div>
        <div style={styles.navTrail}>
          <button
            type="button"
            className="zp-focusable"
            style={styles.iconButton}
            aria-label="Refresh"
            onClick={onRefresh}>
            <Icon icon={RefreshCwIcon} size="sm" color="inherit" />
          </button>
        </div>
      </header>
      <h1 style={styles.srOnly}>Zinnia Pay — send money</h1>

      <div style={{...styles.listCard, marginTop: 16}}>
        <div style={styles.balanceCard}>
          <span style={styles.balanceOverline}>Zinnia balance</span>
          <span style={styles.balanceFigure}>{fmt(derived.balanceCents)}</span>
          <span style={styles.balanceCaption}>
            Sent {fmt(derived.sentCents)} · Received {fmt(derived.receivedCents)} · Net{' '}
            {netLabel}
          </span>
          {state.refreshed ? (
            // Static caption by law — a fixed string, never a clock.
            <span style={styles.balanceCaption}>Updated just now</span>
          ) : null}
        </div>
      </div>

      <div style={styles.searchWrap}>
        <span style={styles.searchIcon} aria-hidden>
          <Icon icon={SearchIcon} size="sm" color="inherit" />
        </span>
        <input
          type="search"
          className="zp-focusable"
          style={styles.searchInput}
          placeholder="Search name or @handle"
          aria-label="Search contacts"
          value={state.search}
          onChange={event => onSearch(event.target.value)}
        />
      </div>

      <h2 style={styles.sectionHeader}>Recents</h2>
      <div
        style={styles.recentsRail}
        className="zp-focusable"
        tabIndex={0}
        aria-label="Recent recipients — scrolls horizontally">
        {recents.map(contact => (
          <button
            key={contact.id}
            type="button"
            className="zp-focusable"
            style={styles.recentChip}
            aria-label={\`Send to \${contact.name}\`}
            onClick={() => onPickContact(contact.id)}>
            <ContactAvatar contact={contact} size={40} />
            <span style={styles.recentChipName}>{contact.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <h2 style={styles.sectionHeader}>All contacts</h2>
      <div style={styles.listCard}>
        {filteredContacts.length === 0 ? (
          <div style={{...styles.row, minHeight: 44, cursor: 'default'}}>
            <span style={styles.rowSecondary}>No contacts match “{state.search}”</span>
          </div>
        ) : (
          filteredContacts.map((contact, i) => (
            <div key={contact.id}>
              {i > 0 ? <div style={styles.rowDividerAvatar} /> : null}
              <button
                type="button"
                className="zp-focusable"
                style={{...styles.row, minHeight: 72}}
                aria-label={\`Send to \${contact.name}\`}
                onClick={() => onPickContact(contact.id)}>
                <ContactAvatar contact={contact} size={40} />
                <span style={styles.rowStack}>
                  <span style={styles.rowPrimary}>{contact.name}</span>
                  <span style={styles.rowSecondary}>{contact.handle}</span>
                </span>
                <span style={styles.rowMeta}>
                  {latestMetaFor(contact.id, state.activity)}
                </span>
              </button>
            </div>
          ))
        )}
      </div>

      <h2 style={styles.sectionHeader}>Recent activity</h2>
      <div style={{...styles.listCard, marginBottom: 24}}>
        {state.activity.map((item, i) => {
          const contact = CONTACT_BY_ID[item.contactId];
          const isSent = item.direction === 'sent';
          return (
            <div key={item.id}>
              {i > 0 ? <div style={styles.rowDividerGlyph} /> : null}
              <button
                type="button"
                ref={item.id === state.justSentId ? justSentRef : undefined}
                className="zp-focusable"
                style={{...styles.row, minHeight: 60}}
                aria-label={\`Repeat payment: \${item.amountLabel} to \${contact.name} — \${item.note}\`}
                onClick={() => onReplay(item)}>
                <span
                  aria-hidden
                  style={{
                    display: 'inline-flex',
                    width: 24,
                    flexShrink: 0,
                    justifyContent: 'center',
                    color: isSent ? 'var(--color-text-secondary)' : 'var(--color-success)',
                  }}>
                  <Icon
                    icon={isSent ? ArrowUpRightIcon : ArrowDownLeftIcon}
                    size="sm"
                    color="inherit"
                  />
                </span>
                <span style={styles.rowStack}>
                  <span style={styles.rowPrimary}>{contact.name}</span>
                  <span style={styles.rowSecondary}>
                    {item.note} · {item.date}
                  </span>
                </span>
                <span
                  style={{
                    ...styles.rowValue,
                    color: isSent ? undefined : 'var(--color-success)',
                  }}>
                  {signedFmt(item.amountCents, item.direction)}
                </span>
              </button>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// AMOUNT SCREEN — one integer, four mirrors: every keypad tap rolls the
// display, re-solves all three shares, rewrites the footer label, and
// re-evaluates the fee pill.
// ---------------------------------------------------------------------------

function AmountScreen({
  state,
  derived,
  isMotionReduced,
  onBack,
  onDigit,
  onClear,
  onBackspace,
  onQuickChip,
  onSpeed,
  onToggleSplit,
  onToggleLock,
  onNote,
  onOpenSheet,
  payButtonRef,
  noteInputRef,
}: {
  state: FlowState;
  derived: DerivedFlow;
  isMotionReduced: boolean;
  onBack: () => void;
  onDigit: (digit: number) => void;
  onClear: () => void;
  onBackspace: () => void;
  onQuickChip: (cents: number) => void;
  onSpeed: (speed: Speed) => void;
  onToggleSplit: () => void;
  onToggleLock: (memberId: string, currentShareCents: number) => void;
  onNote: (value: string) => void;
  onOpenSheet: () => void;
  payButtonRef: RefObject<HTMLButtonElement | null>;
  noteInputRef: RefObject<HTMLInputElement | null>;
}) {
  const recipient = CONTACT_BY_ID[state.recipientId];
  const cohort = derived.cohortIds.map(id => CONTACT_BY_ID[id]);
  const instantRef = useRef<HTMLButtonElement | null>(null);
  const standardRef = useRef<HTMLButtonElement | null>(null);

  const onSegKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
    event.preventDefault();
    const next: Speed = state.speed === 'instant' ? 'standard' : 'instant';
    onSpeed(next);
    (next === 'instant' ? instantRef : standardRef).current?.focus();
  };

  const feeLabel =
    state.speed === 'standard'
      ? 'Standard · Free'
      : derived.feeCents > 0
        ? \`Instant · \${fmt(derived.feeCents)}\`
        : 'Instant · Free';
  const isFeeBrand = state.speed === 'instant' && derived.feeCents > 0;

  return (
    <>
      <header style={styles.navBar}>
        <div style={styles.navLead}>
          <button
            type="button"
            className="zp-focusable"
            style={styles.backButton}
            aria-label="Back to Send"
            onClick={onBack}>
            <Icon icon={ChevronLeftIcon} size="md" color="inherit" />
            <span style={styles.backLabel}>Send</span>
          </button>
        </div>
        <div style={styles.navTitle}>To {recipient.name.split(' ')[0]}</div>
        <div style={styles.navTrail}>
          <button
            type="button"
            className="zp-focusable"
            style={styles.iconButton}
            aria-label="Edit note"
            onClick={() => noteInputRef.current?.focus()}>
            <Icon icon={PencilLineIcon} size="sm" color="inherit" />
          </button>
        </div>
      </header>
      <h1 style={styles.srOnly}>Enter amount</h1>

      <div style={{...styles.listCard, marginTop: 16}}>
        <button
          type="button"
          className="zp-focusable"
          style={{...styles.row, minHeight: 60}}
          aria-label={\`Change recipient — currently \${recipient.name}\`}
          onClick={onBack}>
          <ContactAvatar contact={recipient} size={40} />
          <span style={styles.rowStack}>
            <span style={styles.rowPrimary}>{recipient.name}</span>
            <span style={styles.rowSecondary}>{recipient.handle}</span>
          </span>
          <span style={styles.rowMeta}>Change</span>
        </button>
      </div>

      <div style={{marginTop: 24, paddingInline: 16}}>
        <RollingDisplay amountCents={state.amountCents} isMotionReduced={isMotionReduced} />
        <div style={styles.feePillRow}>
          <span style={isFeeBrand ? styles.feePill : styles.feePillMuted}>{feeLabel}</span>
        </div>
      </div>

      <div
        role="radiogroup"
        aria-label="Transfer speed"
        style={styles.segTrack}
        onKeyDown={onSegKeyDown}>
        <button
          ref={instantRef}
          type="button"
          role="radio"
          aria-checked={state.speed === 'instant'}
          className="zp-focusable"
          style={{
            ...styles.segItem,
            ...(state.speed === 'instant' ? styles.segItemActive : null),
          }}
          onClick={() => onSpeed('instant')}>
          Instant · 1.5%
        </button>
        <button
          ref={standardRef}
          type="button"
          role="radio"
          aria-checked={state.speed === 'standard'}
          className="zp-focusable"
          style={{
            ...styles.segItem,
            ...(state.speed === 'standard' ? styles.segItemActive : null),
          }}
          onClick={() => onSpeed('standard')}>
          Standard · 1–3 days
        </button>
      </div>

      <div style={{marginTop: 12}}>
        <SplitLedgerStack
          splitOn={state.splitOn}
          cohort={cohort}
          shares={derived.shares}
          lockedId={state.lockedId}
          onToggleSplit={onToggleSplit}
          onToggleLock={onToggleLock}
        />
      </div>

      <div style={{marginInline: 16, marginTop: 12}}>
        <input
          ref={noteInputRef}
          type="text"
          className="zp-focusable"
          style={styles.noteInput}
          maxLength={40}
          aria-label="Payment note"
          placeholder="Add a note"
          value={state.note}
          onChange={event => onNote(event.target.value)}
        />
      </div>

      <div style={styles.chipsRow}>
        {QUICK_CHIP_CENTS.map(cents => (
          <button
            key={cents}
            type="button"
            className="zp-focusable"
            style={styles.quickChip}
            onClick={() => onQuickChip(cents)}>
            {fmt(cents)}
          </button>
        ))}
      </div>

      <AmountKeypad
        onDigit={onDigit}
        onClear={onClear}
        onBackspace={onBackspace}
        isMotionReduced={isMotionReduced}
      />

      <div style={styles.payFooter}>
        <button
          ref={payButtonRef}
          type="button"
          className="zp-focusable"
          style={{
            ...styles.payButton,
            ...(state.amountCents === 0 ? styles.payButtonDisabled : null),
          }}
          disabled={state.amountCents === 0}
          onClick={onOpenSheet}>
          {derived.payLabel}
        </button>
      </div>
    </>
  );
}

// ---------------------------------------------------------------------------
// PAGE — single state owner + update(patch); every displayed number is a
// deriveAll() projection.
// ---------------------------------------------------------------------------

export default function MobileP2pPaymentFlowTemplate() {
  // Container-width breakpoint: > 560px the shell renders as a centered
  // framed 430px phone column (the phone layout is never stretched).
  // Width 0 = first pre-observer frame; viewport query is the fallback.
  const rootRef = useRef<HTMLDivElement | null>(null);
  const rootWidth = useElementWidth(rootRef);
  const isViewportWide = useMediaQuery('(min-width: 561px)');
  const isFramed = rootWidth > 0 ? rootWidth > 560 : isViewportWide;
  const isMotionReduced = useMediaQuery('(prefers-reduced-motion: reduce)');

  const [state, setState] = useState<FlowState>(INITIAL_STATE);
  const update = useCallback(
    (patch: Partial<FlowState>) => setState(s => ({...s, ...patch})),
    [],
  );
  const derived = deriveAll(state);

  const payButtonRef = useRef<HTMLButtonElement | null>(null);
  const noteInputRef = useRef<HTMLInputElement | null>(null);
  const justSentRef = useRef<HTMLButtonElement | null>(null);

  // Toast auto-clears after 4s (UI timing, not fixture data).
  useEffect(() => {
    if (state.toast == null) return undefined;
    const timer = setTimeout(() => update({toast: null}), 4000);
    return () => clearTimeout(timer);
  }, [state.toast, update]);

  // Post-send: focus lands on the new top activity row (one-shot).
  useEffect(() => {
    if (state.justSentId != null && justSentRef.current != null) {
      justSentRef.current.focus();
      update({justSentId: null});
    }
  }, [state.justSentId, update]);

  // Any keypad op that leaves lockedCents > amountCents auto-releases the
  // lock and announces 'Lock released' via the single live region.
  const withLockGuard = (next: FlowState): FlowState =>
    next.lockedId != null && next.lockedCents > next.amountCents
      ? {...next, lockedId: null, lockedCents: 0, toast: 'Lock released'}
      : next;

  const pressDigit = (digit: number) =>
    setState(s => {
      const nextCents = s.amountCents * 10 + digit;
      // Cap law: presses beyond $9,999.99 are silent no-ops.
      if (nextCents > AMOUNT_CAP_CENTS) return s;
      return withLockGuard({...s, amountCents: nextCents});
    });
  const pressClear = () => setState(s => withLockGuard({...s, amountCents: 0}));
  const pressBackspace = () =>
    setState(s => withLockGuard({...s, amountCents: Math.floor(s.amountCents / 10)}));
  const pressQuickChip = (cents: number) =>
    setState(s => withLockGuard({...s, amountCents: cents}));

  const pickContact = (contactId: string) =>
    update({
      recipientId: contactId,
      screen: 'amount',
      amountCents: 0,
      note: 'Dinner at Kazu',
      splitOn: false,
      lockedId: null,
      lockedCents: 0,
    });

  // REPLAY: an activity row is an affordance — prefills contact, amount,
  // and 'Again: <note>' (sliced to the input's maxLength 40).
  const replay = (item: ActivityItem) =>
    update({
      recipientId: item.contactId,
      screen: 'amount',
      amountCents: item.amountCents,
      note: \`Again: \${item.note}\`.slice(0, 40),
      splitOn: false,
      lockedId: null,
      lockedCents: 0,
    });

  const toggleLock = (memberId: string, currentShareCents: number) =>
    setState(s =>
      s.lockedId === memberId
        ? {...s, lockedId: null, lockedCents: 0}
        : {...s, lockedId: memberId, lockedCents: currentShareCents},
    );

  const closeSheet = () => {
    update({sheetOpen: false, sheetDetent: 'large'});
    requestAnimationFrame(() => payButtonRef.current?.focus());
  };

  const sendNow = () =>
    setState(s => {
      const d = deriveAll(s);
      const recipient = CONTACT_BY_ID[s.recipientId];
      const newRow: ActivityItem = {
        id: \`sent-\${s.activity.length + 1}\`,
        direction: 'sent',
        contactId: s.recipientId,
        note: s.note === '' ? 'Payment' : s.note,
        amountCents: d.payerCents,
        amountLabel: fmt(d.payerCents),
        date: 'Jul 4', // the suite's anchored today — never a clock
        speed: s.speed,
        feeCents: d.feeCents,
      };
      // The contacts screen visibly recomputes: sent/net/balance and the
      // recipient's trailing meta all re-derive from the new rows.
      return {
        ...s,
        activity: [newRow, ...s.activity],
        sheetOpen: false,
        sheetDetent: 'large',
        screen: 'contacts',
        amountCents: 0,
        splitOn: false,
        lockedId: null,
        lockedCents: 0,
        note: 'Dinner at Kazu',
        toast: \`Sent \${fmt(d.totalCents)} to \${recipient.name}\`,
        justSentId: newRow.id,
      };
    });

  // Scroll lock while the sheet is open so absolute overlays anchor to
  // the visible screen; the framed desktop column locks to its own height.
  const shellStyle: CSSProperties = {
    ...styles.shell,
    ...(isFramed ? styles.shellFramed : null),
    ...(state.sheetOpen
      ? {height: isFramed ? 'calc(100dvh - 48px)' : '100dvh', overflow: 'hidden'}
      : null),
  };

  return (
    <div ref={rootRef} style={isFramed ? styles.desktopWrap : undefined}>
      <style>{FLOW_CSS}</style>
      {/* Receipt tear clipPath — defined once, objectBoundingBox units. */}
      <svg width={0} height={0} aria-hidden focusable="false" style={{position: 'absolute'}}>
        <defs>
          <clipPath id="zinniaReceiptTear" clipPathUnits="objectBoundingBox">
            <path d={RECEIPT_TEAR_PATH} />
          </clipPath>
        </defs>
      </svg>
      <div style={shellStyle}>
        {state.screen === 'contacts' ? (
          <ContactsScreen
            state={state}
            derived={derived}
            onRefresh={() => update({refreshed: true, toast: 'Updated just now'})}
            onPickContact={pickContact}
            onReplay={replay}
            justSentRef={justSentRef}
            onSearch={value => update({search: value})}
          />
        ) : (
          <AmountScreen
            state={state}
            derived={derived}
            isMotionReduced={isMotionReduced}
            onBack={() => update({screen: 'contacts'})}
            onDigit={pressDigit}
            onClear={pressClear}
            onBackspace={pressBackspace}
            onQuickChip={pressQuickChip}
            onSpeed={speed => update({speed})}
            onToggleSplit={() =>
              update({splitOn: !state.splitOn, lockedId: null, lockedCents: 0})
            }
            onToggleLock={toggleLock}
            onNote={value => update({note: value})}
            onOpenSheet={() => update({sheetOpen: true})}
            payButtonRef={payButtonRef}
            noteInputRef={noteInputRef}
          />
        )}
        {state.sheetOpen ? (
          <ConfirmSheet
            state={state}
            derived={derived}
            isMotionReduced={isMotionReduced}
            onToggleDetent={() =>
              update({sheetDetent: state.sheetDetent === 'large' ? 'medium' : 'large'})
            }
            onClose={closeSheet}
            onSend={sendNow}
          />
        ) : null}
        {/* The ONE polite live region — sends, refresh, lock release. */}
        <div style={styles.toastWrap} role="status" aria-live="polite">
          {state.toast != null ? <div style={styles.toastPill}>{state.toast}</div> : null}
        </div>
      </div>
    </div>
  );
}


`;export{e as default};