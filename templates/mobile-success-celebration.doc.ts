// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Success Celebration Flow',
  description:
    "MOBILE (390px shell) transfer-confirmation CELEBRATION for Larkpay, frozen at Fri, Jul 10 · 9:41 AM: a 52px navBar (spark mark · 'Confirm transfer' → 'Transfer sent' · Activity) over a Confirm card — 48px recipient monogram row (Maya Trent · Beacon ··4821), 40/700 tabular $248.00, Pay-from and memo utility rows with a to-the-cent balance cross-check ($1,362.60 − $248.00 = $1,114.60 on the receipt) — whose primary is a 56px HOLD-TO-SEND button: pressing fills an inset scaleX progress sweep over 600ms (releasing early rewinds in 150ms and flashes an inline hint), while a 44px `Send now` text button and keyboard activation commit through the SAME state update (the mandatory button path). Commit runs a staged, fully deterministic choreography from ONE cleaned-up timer effect: rotateX card flip-out (320ms) → 96px SVG ring draw (stroke-dashoffset, 480ms) → check stroke-in (260ms) under an overshoot scale pop → an 18-particle confetti burst from a LITERAL const array (4 token colors, gravity-ish keyframes over 900ms, unmounted from the DOM after) → a 0→$248.00 tabular count-up (20 fixed eased steps × 35ms) → a receipt card sliding up with 4 staggered rows (To / Sent / Fee / New balance) plus a 'Just now' row surfacing atop the 6-row Recent activity list → Done + `Send again`, which resets every flag and replays the whole sequence. The single polite toast dock (sticky bottom:16 — no tabBar) announces 'Transfer sent — $248.00 to Maya Trent'. All motion is transform/opacity (+ SVG dashoffset) under a unique scx- class prefix; prefers-reduced-motion skips flip/confetti/count-up entirely and crossfades straight to the completed state. At desktop container widths (>560px) it renders the standard centered 430px phone column on a muted backdrop. Choose over mobile-p2p-payment-flow when the brief wants the post-commit SUCCESS choreography (hold-to-send, ring/check draw-on, confetti, count-up, replayable receipt) rather than the pre-commit keypad/split/fee math of a full send flow; choose over mobile-parking-session when the centerpiece is a one-shot celebratory confirmation, not a live metered session; choose over any desktop template when the brief calls for a phone-first 390px shell with 44×44 touch targets and motion as the point.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
