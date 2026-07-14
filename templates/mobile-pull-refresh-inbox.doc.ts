// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Parcelo — Pull to Refresh Inbox',
  description:
    "MOBILE (390px shell) parcel-updates inbox for Parcelo whose centerpiece is pull-to-refresh physics: pointer-drag down from scrollTop 0 (8px slop keeps row taps intact) translates the content column with rubber-band damping (drag × 0.5, capped 110px) while a 28px indicator arrow rotates with progress; at 72px it ARMS — the arrow flips to 180°, tints brand, and a hairline halo pops once. Release below threshold springs back (decelerate bezier); release past it snaps to a 64px holding seat where the arrow morphs into a rotation-keyframe spinner and a 1.4s staged timer completes the refresh: the first pass prepends 3 fixture rows (each slides down + fades from −8px on a 60ms stagger) with a '3 new updates' toast in the single polite dock, and every later pass posts 'You're all caught up' with an overshoot-bezier settle bounce. A 44×44 RefreshCw navBar button is the mandatory button path through the same choreography, and reduced motion (matchMedia + change listener) removes the rubber-band entirely — instant refresh, instant rows, no spinner/halo/stagger. The feed is 9 seed rows (48px hue-gradient carrier monogram tiles, event title with token status dots, item · tracking · carrier status line, fixed relative times, unread dots that clear on tap) growing to 12, and a THIS WEEK summary card (In motion / Delivered / Needs attention) derives every count from the live rows array. At container widths >560px (useElementWidth ResizeObserver) it renders the standard centered 430px phone column on a muted backdrop. Choose over mobile-receipt-inbox when the brief demands gesture physics and refresh choreography rather than document triage; choose over swipe-triage-stack or drag-rank-list when the star gesture is vertical top-overscroll, not card swipes or reordering; choose over any desktop inbox when the surface is a phone-first 390px shell with a 52px navBar, inset-grouped 72px rows, and 44×44 touch targets.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
