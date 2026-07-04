// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Mobile P2P Payment Flow',
  description:
    "Thumb-first Zinnia Pay send flow built on the MOBILE KIT shell contract (390px stage is the phone viewport; no simulated OS chrome; sticky 52px navBar, push-stack navigation via one `screen` string, no tab bar): a contacts screen with a balance card whose $1,362.60 figure and 'Sent $168.40 · Received $1,320.15 · Net +$1,151.75' caption are reduce()-derived from 8 activity rows over a $210.85 opening, a 44px contact search, a scroll-snap recents rail (72px chips), an inset-grouped 72px-row contact list (7 contacts including long-name stress 'Alexandrina Konstantinopoulou-Vanterpool' and zero-history 'Noor El-Amin'), and a 60px-row activity ledger whose every row is a REPLAY button prefilling the amount screen; an amount screen where ONE amountCents integer drives four mirrors at once — a rolling 44px/700 tabular display (per-character 160ms roll, $9,999.99 cap as silent no-op), a 3×4 keypad of 64px keys with cents-shift ops (digit → a×10+d, C, backspace), a fee pill flipping between 'Instant · $0.75' (1.5%) and the 25¢ floor (quick chip $12.00 → $0.25), a 2-segment radiogroup speed control, a three-way SplitLedgerStack with remainder-cent math ($50.00 → $16.67/$16.67/$16.66; $28.50 → 950×3) and radio-like share locking with auto-release ('Lock released' announced when C undercuts the lock), and a sticky payFooter whose 48px brand button label is a projection ('Pay $16.92' when split); and a large-detent confirm sheet (grabber button toggles 55% medium, X/Cancel/scrim/Escape all restore focus to the Pay button) holding a torn-edge SVG-clipPath receipt that assembles line-by-line with 90ms stagger and reads every value from the same deriveAll() the keypad drove — 'Send now' unshifts the activity feed and the contacts screen visibly recomputes (balance $1,362.60 → $1,311.85 after a $50.00 instant send). Choose over boarding-pass-wallet when the surface is a money-movement flow with keypad entry, split math, and a confirm sheet, not a ticket/pass display; choose over booking-availability-picker when the mobile flow's core is a derived-money ledger rather than slot selection; choose over matter-workspace or other desktop app-shells when the container is a phone-width push-stack with 44×44 touch targets, sheets, and a thumb-zone primary button instead of multi-pane desktop chrome.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
