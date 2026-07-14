// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Slide to Confirm',
  description:
    "MOBILE (390px shell) checkout for Alder Lane Goods whose centerpiece is commit-gesture physics, frozen on Fri, Jul 4: a 52px navBar (Shop back, 'Checkout', a Reset link that restores the whole screen and re-keys the entry stagger) over an inset-grouped order card (3 line items in integer cents — 3400 + 2850 + 2×750 = 7750 subtotal + 495 shipping + 395 tax = the ONE $86.40 that labels the track, the totals row, the AlertDialog copy, and the success pill). Specimen 1 is a 56px slide-to-pay track: a shimmering hint label (background-position sweep, removed under reduced motion), a 48px thumb on setPointerCapture drag with 0.45× resistance past 78% travel, an overshoot-bezier spring-back on early release, and a ≥92% lock that morphs the thumb into a spinner, then contracts the whole track into a 190px success pill (the batch's single sanctioned width transition, px→px) with an SVG check draw-on while the order card stamps PAID with a rotate-in badge. Specimen 2 is HOLD-to-confirm: a destructive 'Cancel order' row whose 44px SVG dashoffset ring fills over 900ms while held (steps(4) under reduced motion), rewinds in 180ms on early release, and on completion stamps CANCELLED and posts an Undo toast to the single sticky-bottom aria-live dock. Both gestures have explicit button paths through the SAME state updates — 'Pay with button instead' and a confirm AlertDialog — and keyboard commits (Enter on the thumb pays; Enter on the hold row opens the dialog). At desktop container widths (>560px via useElementWidth) it renders the standard centered 430px phone column on the muted backdrop. Choose over mobile-p2p-payment-flow when the surface is a single-order checkout demonstrating slide/hold COMMIT controls rather than a contacts-keypad-split send flow; choose over the frozen specimen galleries when the gesture physics must be live and consequence-bearing (stamps, toasts, resets), not a static catalog.",
  category: 'Mobile',
  componentsUsed: ['AlertDialog', 'Icon'],
} satisfies AstryxPageTemplate;

export default template;
