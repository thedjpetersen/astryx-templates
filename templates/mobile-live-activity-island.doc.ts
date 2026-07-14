// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Live Activity Island',
  description:
    "MOBILE (390px shell) motion demo of a morphing live-activity capsule on a lock-ish home surface: a dimmed dusk-wallpaper hero with the 9:41 clock fixture and two glass widgets sits under a near-black capsule pinned below the 52px navBar on a sticky islandZone. One `mode` string drives four states — COMPACT (120×36 pill: Fernway courier monogram, ETA `12 min` ticking down 1 min every 3 s of compressed demo time, pulsing live dot) morphs on tap into EXPANDED (358×132 card with overshoot-bezier width/height/radius transitions — the spec's single sanctioned exception, everything else is transform/opacity: a scaleX route-progress fill with a translateX-eased moving dot, driver row Marta Villanueva ★4.9, and 44px Track/Message actions), an ALERT state auto-fires when the ETA hits 2 min (opacity-keyframed warning-tint flash, `Driver arriving` copy, one-shot shake), and ENDED collapses to a 64px checkmark pill that fades out. A SegmentedControl in the Demo controls card forces all four states through the SAME setMode update (the mandatory button path), a Replay row/navBar button restarts the staged timeline, and every outcome lands in the single polite toast dock at bottom:16. Reduced motion (matchMedia with change listener) swaps morphs for opacity crossfades and removes the pulse/shake/flash loops entirely. Delivery details card (order #48213, pickup, drop-off, driver) gives the surface real content; at container widths >560px it renders as a centered 430px phone column on the muted backdrop. Choose over live-activity-widget when the brief wants the PHONE-SHELL morphing capsule choreography (compact ⇄ expanded ⇄ alert ⇄ ended) rather than a desktop dashboard widget; choose over bottom-sheet-snap-explorer or swipe-triage-stack when the centerpiece is a state-machine morph of one tiny pinned element, not sheet detents or card gestures; choose over mobile-tonight-picker and other mobile utility surfaces when the point is motion demonstration, not a decision workflow.",
  category: 'Mobile',
  componentsUsed: ['Icon', 'SegmentedControl', 'SegmentedControlItem'],
} satisfies AstryxPageTemplate;

export default template;
