// Copyright (c) Meta Platforms, Inc. and affiliates.

import type {AstryxPageTemplate} from '@astryxdesign/cli/template';

const template = {
  type: 'page',
  name: 'Flip Countdown Timer',
  description:
    "MOBILE (390px shell) motion-first focus timer for Flipfocus, frozen at Thu, Jul 9: a 52px navBar (flap mark · 'Flipfocus' · 44×44 Reset) over a 300px dial where an SVG session-progress arc (stroke-dashoffset synced to remaining/total, 1s linear sweep while ticking, discrete steps under reduced motion) wraps four SPLIT-FLAP digits (MM:SS, 25:00 Pomodoro fixture). Each 42×62 digit is a two-half card under perspective: on change the top flap rotates rotateX 0→−90 (150ms ease-in) revealing the next value, then the bottom flap lands −90→0 (170ms decelerate) across a 1px crease, chaining on animationend with mid-flight catch-up; a 1s interval ticks while running (no wall-clock reads). Controls: a 64px play/pause morph button (icon crossfade + scale swap, brand ring pulses while running), −5:00/+5:00 chips whose multi-digit changes cascade-flip left→right at 60ms per affected digit, a Pomodoro 25 / Break 5 / Deep 50 aria-pressed preset row, and a dashed 'Skip to last 5s' demo chip that fast-forwards to the 00:00 choreography: the arc completes, a three-pulse halo plays (removed on animationend), and a 'Session complete · 25 min' card rises with a 5-dot M–F streak row — today's dot fills with an overshoot pop — plus a 'Start another' replay. The Today stat strip derives 2→3 sessions · 50→75 min · 3→4 day streak from the SAME store transaction. Every control is a plain ≥44×44 button (no gestures to pair), outcomes land in the single polite toast dock (sticky bottom:16, one toast replaces the last), and prefers-reduced-motion (matchMedia + change listener, CSS backstop) swaps flips for instant digit swaps and strips the pulse/halo/pop loops entirely. At container widths >560px it renders the centered 430px phone column on a muted backdrop. Choose over mobile-focus-blocklist-timer when the brief wants a showpiece countdown surface whose centerpiece is split-flap/arc motion choreography rather than blocklist management; choose over mobile-meditation-breath-player when the loop is a finite MM:SS session with presets and completion celebration, not a breathing-orb player; choose over bezier-easing-studio when the easing work should be worn by a product surface instead of inspected in a tool.",
  category: 'Mobile',
  componentsUsed: ['Icon'],
} satisfies AstryxPageTemplate;

export default template;
