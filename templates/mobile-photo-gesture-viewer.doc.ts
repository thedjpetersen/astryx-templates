// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Photo Gesture Viewer',
  description:
    "MOBILE (390px shell) photo album for Saltline — a 3×4 grid of 12 hue-gradient compositions (monogram overlays, toggleable caption chips, favorite badges) frozen at the 'Sea Ranch Weekend' Jul 3–5, 2026 fixtures, whose centerpiece is a FLIP shared-element viewer: tapping a tile measures its rect and animates a clone from tile → letterboxed full-stage rect (transform/opacity only, decelerate bezier), then reveals immersive dark-room chrome — 52px top bar (44×44 close, 'n of 12' tabular counter, favorite + zoom buttons), 48px caption bar flanked by 44×44 prev/next chevrons, and a 64px filmstrip whose active-thumb underline slides with an overshoot spring. Gestures are pointer-capture physics with button-path twins committing through the same state updates: horizontal drag pages with snap, 12px neighbor peek, edge resistance, and flick velocity (chevrons/filmstrip/arrow keys mirror it); double-tap toggles 2× zoom centered on the tap point via origin-0 translate/scale math (zoom button mirrors it); when zoomed, drag pans with clamped bounds and a 0.3-damped rubber-band that springs back on release (arrow keys pan); swipe DOWN when unzoomed drags the photo with scale falloff and backdrop/chrome opacity falloff — past 120px it dismisses via the reverse FLIP into its CURRENT grid tile, below threshold it springs back (close button mirrors it). While open the shell scroll-locks per the mobile contract, FLIP rects are measured post-lock in a layout effect, a polite live region announces photo/zoom changes, and the single toast dock (sticky bottom:16; shell-absolute above the filmstrip while locked) announces favorite toggles with a 2.6s replace-on-new timer. Reduced motion: the FLIP becomes a 160ms opacity crossfade, zoom/paging snap instantly, and the rubber-band hard-clamps. Below the grid: an inset-grouped album-details listCard (dates/location/camera/size). At container widths ≥720px it renders the standard centered 430px phone column. Choose over mobile-camera-roll-organizer when the brief wants an immersive open-photo VIEWER with shared-element, zoom, pan, and swipe-to-dismiss physics rather than triage/organization of a roll; choose over mobile-chrome-gallery or mobile-overlay-gallery when the gesture viewer is the product surface itself, not a frozen specimen catalog; choose over swipe-triage-stack when horizontal swipes mean paging through an album, not accept/reject triage.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
