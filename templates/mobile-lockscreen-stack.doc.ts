// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Moonrise — Notification Stack',
  description:
    "MOBILE (390px shell) lock-screen notification choreography demo for Moonrise, frozen at 9:41 on Friday, July 10: a 52px navBar (moon mark · 'Moonrise' · 44×44 Reset) over a dusk wallpaper gradient with the clock fixture (date line, 64px tabular '9:41', Sleep-focus chip) and a bottom-anchored notification surface. The collapsed STACK shows the front card full with two peek layers at scale .96/.92 and translateY 10/20 under a '6 notifications' count chip; tapping it fans the full grouped list out (2 app sections — Relay 4 + Doorstep 2 = 6, 3 unread dots) with a 45ms-staggered overshoot spring (fill-mode backwards so staggered starts stay hidden without a forwards fill fighting inline drag transforms). Swiping a card left tracks the finger via pointer capture (translateX only, right-drag rubber-bands at 0.18×); past 96px a clear affordance arms (rest chip → #FF6B6B fill + pop) and release slides the card out −110% while survivors close the gap with a FLIP transform pass — the 44×44 '×' per card is the mandatory button path and commits through the same state update, with a one-deep Undo toast that FLIPs survivors back down. 'Clear All' measures each card's --lsk-dy back to the stack anchor and collapses with reverse 45ms stagger into a 'No notifications' settle card; 'Show less' re-stacks without clearing; every outcome announces through the single polite toast dock at bottom:16. Reduced motion (matchMedia + change listener) swaps fan/dismiss/collapse for instant state changes with 160ms opacity fades and drops all FLIP passes. At container widths >560px it renders as a centered 430px phone column on a muted backdrop. Choose over swipe-triage-stack when the gesture story is dismissal choreography across a grouped lock-screen inbox (fan-out, gap-close FLIP, reverse-stagger clear) rather than binary keep/discard triage of one card at a time; choose over mobile-chrome-gallery / mobile-overlay-gallery when the motion itself is the centerpiece rather than frozen chrome or overlay specimens; choose over bottom-sheet-snap-explorer when the surface is a wallpaper lock screen with a card stack, not sheet detent mechanics.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
